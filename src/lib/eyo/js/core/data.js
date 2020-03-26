/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.data.Base is a class for a data controller.
 * It merely provides the API.
 * There is a design problem concerning the binding between the model
 * and the ui.
 * The data definitely belongs to the model layer.
 * When the data corresponds to some ui object, they must be synchronized,
 * at least when no change is actually pending (see the change level).
 * The typical synchronization problem concerns the text fields.
 * We say that an object is in a consistant state when all the synchronizations
 * have been performed.
 * A change in the ui must reflect any change to the data and conversely.
 * Care must be taken to be sure that there is indeed a change,
 * to avoid infinite loops.
 * For that purpose, reentrancy is managed with a lock.
 * There is a very interesting improvement concerning data.
 * It consists in separating the values from the methods.
 * The owner will just propose a value storage and the data
 * object is just a set of methods that apply to this value storage.
 * That way, we can change the data object at runtime,
 * for example, we can have different data objects before and
 * after initialization time. There would be no didChange nor consolidate
 * before initialization time, only at the end.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.model.allowModelPaths({
  [eYo.model.ROOT]: 'data',
  'data': '\\w+',
  'data\\.\\w+': [
    'after', // key || [keys]
    'order', // INTEGER
    'all', // TYPE || [TYPE], // last is expected
    'main', // BOOLEAN
    'placeholder', // STRING
    'noUndo', // true
    'xml', // {}
    'init', // WHATEVER
    'validate', // (...) => {} || false || true,
    'validateIncog', // (...) => {}
    'willChange', // (...) => {}
    'isChanging', // (...) => {}
    'didChange', // (...) => {}
    'willUnchange', // (...) => {}
    'isUnchanging', // (...) => {}
    'didUnchange', // (...) => {}
    'willLoad', // () => {}
    'didLoad', // () => {}
    'consolidate', // (...) => {}
    'fromType', // () => {}
    'fromField', // () => {}
    'toField', // () => {}
  ],
  'data\\.\\w+\.xml': [
    'save', 'load',
  ],
})

eYo.model.allowModelShortcuts({
  'data\\.\\w+\\.init': (before, p) => {
    if (!eYo.isF(before)) {
      return function () {
        return before
      }
    }
  },
  'data\\.\\w+\\.(?:all|after)': (before, p) => {
    if (!eYo.isRA(before)) {
      return [before]
    }
  },
  'data\\.\\w+\\.(?:didLoad|after)': (before, p) => {
    if (!eYo.isF(before)) {
      return eYo.INVALID
    }
  },
  'data\\.\\w+\\.xml\\.(?:toText|fromText|toField|fromField|save|load)': (before, p) => {
    if (!eYo.isF(before)) {
      return eYo.INVALID
    }
  },
})

eYo.require('do')
eYo.require('xre')

eYo.require('decorate')
//g@@g.require('g@@g.dom')

/**
 * @name {eYo.data}
 * @namespace
 */
eYo.attr.makeNS(eYo, 'data')

/**
 * The model path.
 * @see The `new` method.
 * @param {String} key
 */
eYo.data._p.modelPath = function (key) {
  return eYo.isStr(key) ? `data.${key}` : 'data'
}

/**
 * For subclassers.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.data._p.modelHandle = function (_p, key, model) {
  if (key === 'variant' || key === 'option' || key === 'subtype') {
    model.xml = false
  }
  /**
    * Get the value of the data.
    * One shot.
    */
  let getLazyValue = eYo.decorate.reentrant('get', function () {
    if (!eYo.isDef(this.stored__)) {
      this.setFiltered_(this.model.init.call(this.owner))
    }
    return this.stored__
  })
  model._starters.push(ans => (ans.get = getLazyValue))
  this.handle_toField(_p, key, model)
  this.handle_toText(_p, key, model)
  this.handle_fromField(_p, key, model)
  this.handle_fromText(_p, key, model)
  this.handle_filter(_p, key, model)
  this.handle_validate(_p, key, model)
  this.handle_synchronize(_p, key, model)
  this.handle_change(_p, key, model)
  this.handle_load(_p, key, model)
}

/**
 * make the prototype's filter method based on the model's object for key filter.
 * The prototype does inherit a filter method.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.data._p.handle_filter = function (prototype, key, model) {
  let filter_m = model.filter
  if (eYo.isF(filter_m)) {
    let filter_s = prototype.eyo.C9r_s.filter
    prototype.filter = function (after) {
      try {
        this.filter = filter_s
        return filter_m.call(this, after)
      } finally {
        delete this.fister_s
      }
    }
  } else if (!filter_m) {
    prototype.filter = eYo.doReturn
  }
}

/**
 * make the prototype's fromField method based on the model's object for key fromField.
 * The prototype may inherit a fromField method.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.data._p.handle_fromField = function (prototype, key, model) {
  /**
   * Set the value from the given text representation
   * as text field content.
   * In general, the given text either was entered by a user in a text field ot read from a persistent text formatted storage.
   * Calls the javascript model, reentrant.
   * Does nothing when the actual value and
   * the actual argument are the same.
   * @param {Object} txt
   * @param {boolean=} dontValidate
   */
  let f_m = model.fromField
  if (eYo.isF(f_m)) {
    let f_s = prototype.eyo.C9r_s.fromField
    if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
      prototype.fromField = eYo.decorate.reentrant('fromField', function (...$) {
        f_m.call(this, (...$) => {
          f_s.call(this, ...$)
        }, ...$)
      })
    } else {
      prototype.fromField = function (...$) {
        try {
          this.fromField = f_s
          f_m.call(this, ...$)
        } finally {
          delete this.fromField
        }
      }
    }
  } else {
    f_m && eYo.throw(`Unexpected model (${prototype.eyo.name}/${key}): ${f_m}`)
  }
}

/**
 * make the prototype's toField method based on the model's object for key toField.
 * The prototype may inherit a toField method.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.data._p.handle_toField = function (prototype, key, model) {
  /**
   * Returns the text representation of the data.
   * Called during synchronization.
   */
  let f_m = model.toField
  if (eYo.isF(f_m)) {
    let f_s = prototype.eyo.C9r_s.toField
    if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
      prototype.toField = eYo.decorate.reentrant('toField', function (...$) {
        return f_m.call(this, (...$) => {
          return f_s.call(this, ...$)
        }, ...$)
      })
    } else {
      prototype.toField = function (...$) {
        try {
          this.toField = f_s
          return f_m.call(this, ...$)
        } finally {
          delete this.toField
        }
      }
    }
  } else {
    f_m && eYo.throw(`Unexpected model (${prototype.eyo.name}/${key}): ${f_m}`)
  }
}

/**
 * make the prototype's fromText method based on the model's object for key fromText.
 * The prototype may inherit a fromText method.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.data._p.handle_fromText = function (prototype, key, model) {
  /**
   * Set the value from the given text representation
   * as text field content.
   * In general, the given text either was entered by a user in a text field ot read from a persistent text formatted storage.
   * Calls the javascript model, reentrant.
   * Does nothing when the actual value and
   * the actual argument are the same.
   * @param {Object} txt
   * @param {boolean=} dontValidate
   */
  let f_m = model.fromText
  if (eYo.isF(f_m)) {
    let f_s = prototype.eyo.C9r_s.fromText
    if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
      prototype.fromText = eYo.decorate.reentrant('fromText', function (...$) {
        f_m.call(this, (...$) => {
          f_s.call(this, ...$)
        }, ...$)
      })
    } else {
      prototype.fromText = function (...$) {
        try {
          this.fromText = f_s
          f_m.call(this, ...$)
        } finally {
          delete this.fromText
        }
      }
    }
  } else {
    f_m && eYo.throw(`Unexpected model (${prototype.eyo.name}/${key}): ${f_m}`)
  }
}

/**
 * make the prototype's toText method based on the model's object for key toText.
 * The prototype may inherit a toText method.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.data._p.handle_toText = function (prototype, key, model) {
  /**
   * Returns the text representation of the data.
   * Called during synchronization.
   */
  let f_m = model.toText
  if (eYo.isF(f_m)) {
    let f_s = prototype.eyo.C9r_s.toText
    if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
      prototype.toText = eYo.decorate.reentrant('toText', function (...$) {
        return f_m.call(this, (...$) => {
          return f_s.call(this, ...$)
        }, ...$)
      })
    } else {
      prototype.toText = function (...$) {
        try {
          this.toText = f_s
          return f_m.call(this, ...$)
        } finally {
          delete this.toText
        }
      }
    }
  } else {
    f_m && eYo.throw(`Unexpected model (${prototype.eyo.name}/${key}): ${f_m}`)
  }
}

/**
 * make the prototype's validate method based on the model's object for key validate.
 * The prototype may inherit a validate method.
 * The only difference with the property's eponym method is that in the model, `this` is the data object, not its owner.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.data._p.handle_load = function (prototype, key, model) {
  ;['willLoad', 'didLoad'].forEach(k => {
    let load_m = model[k]
    if (eYo.isF(load_m)) {
      prototype[k] = load_m
    } else {
      load_m && eYo.throw(`Unexpected model (${prototype.eyo.name}/${key}) ...Load -> ${load_m}`)
    }
  })
}

/**
 * make the prototype's validate method based on the model's object for key validate.
 * The prototype may inherit a validate method.
 * The only difference with the property's eponym method is that in the model, `this` is the data object, not its owner.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.data._p.handle_consolidate = function (prototype, key, model) {
  let consolidate_m = model.consolidate
  if (eYo.isF(consolidate_m)) {
    prototype.consolidate = eYo.decorate.reentrant('consolidate', function (...args) {
      if (this.changer.level) {
        return
      }
      consolidate_m.call(this, ...args)
    })
  } else {
    consolidate_m && eYo.throw(`Unexpected model (${prototype.eyo.name}/${key}) consolidate -> ${consolidate_m}`)
  }
}

/**
 * make the prototype's validate method based on the model's object for key validate.
 * The prototype may inherit a validate method.
 * The only difference with the property's eponym method is that in the model, `this` is the data object, not its owner.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.data._p.handle_validate = function (_p, key, model) {
  let validate_m = model.validate
  let validate_s = _p.eyo.C9r_s.validate
  if (eYo.isF(validate_m)) {
    _p.validate = eYo.decorate.reentrant('validate', validate_m.length > 2 // builtin, before, after
    ? eYo.isDoIt(validate_s)
      ? function (before, after) {
        return validate_m.call(this, (_after = after) => {
          return validate_s.call(this, before, _after)
        }, before, after)
      } : function (before, after) {
        return validate_m.call(this, () => {
          return after
        }, before, after)
      }
    : validate_m.length > 1 // before, after
      ? eYo.isDoIt(validate_s)
        ? function (before, after) {
          if (eYo.isVALID((after = validate_m.call(this, before, after)))) {
            after = validate_s.call(this, before, after)
          }
          return after
        } : validate_m
      : eYo.isDoIt(validate_s)
        ? function (before, after) {
          if (eYo.isVALID((after = validate_m.call(this, after)))) {
            after = validate_s.call(this, before, after)
          }
          return after
        } : function (before, after) {
          return validate_m.call(this, after)
        }
    )
  } else {
    validate_m && eYo.throw(`Unexpected model (${_p.eyo.name}/${key}) value validate -> ${validate_m}`)
  }
}

/**
 * make the prototype's validateIncog method based on the model's object for key validateIncog.
 * The prototype may inherit a validateIncog method.
 * The only difference with the property's eponym method is that in the model, `this` is the data object, not its owner.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.data._p.handle_validateIncog = function (prototype, key, model) {
  let validate_m = model.validateIncog
  let validate_s = prototype.eyo.C9r_s.validateIncog
  if (eYo.isF(validate_m)) {
    prototype.validateIncog = eYo.decorate.reentrant('validateIncog', validate_m.length > 2 // builtin, before, after
    ? eYo.isDoIt(validate_s)
      ? function (before, after) {
        return validate_m.call(this, (_after = after) => {
          return validate_s.call(this, before, _after)
        }, before, after)
      } : function (before, after) {
        return validate_m.call(this, () => {
          return after
        }, before, after)
      }
    : validate_m.length > 1 // before, after
      ? eYo.isDoIt(validate_s)
        ? function (before, after) {
          if (eYo.isVALID((after = validate_m.call(this, before, after)))) {
            after = validate_s.call(this, before, after)
          }
          return after
        } : validate_m
      : eYo.isDoIt(validate_s)
        ? function (before, after) {
          if (eYo.isVALID((after = validate_m.call(this, after)))) {
            after = validate_s.call(this, before, after)
          }
          return after
        } : function (before, after) {
          return validate_m.call(this, after)
        }
    )
  } else {
    validate_m && eYo.throw(`Unexpected model (${prototype.eyo.name}/${key}) value validateIncog -> ${validate_m}`)
  }
}

/**
 * make the prototype's synchronize method based on the model's object for key synchronize.
 * The prototype may inherit a synchronize method.
 * Changing the ancestor prototype afterwards is not a good idea.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.data._p.handle_synchronize = function (prototype, key, model) {
  let synchronize_m = model.synchronize
  let synchronize_s = prototype.eyo.C9r_s.synchronize
  if (eYo.isF(synchronize_m)) {
    prototype.synchronize = eYo.decorate.reentrant('synchronize', synchronize_m.length > 1
    ? synchronize_s
      ? function (after) {
        return synchronize_m.call(this, synchronize_s, after)
      } : function (after) {
        return synchronize_m.call(this, eYo.doNothing, after)
      }
    : synchronize_m
    )
  } else {
    synchronize_m && eYo.throw(`Unexpected model (${prototype.eyo.name}/${key}) value synchronize -> ${synchronize_m}`)
  }
}

/**
 * Expands a data model.
 * @param {Object} model - a data model object
 * @param {String} key - the data key
 * @return {Object}
 */
eYo.attr._p.handle_change = function (prototype, key, model) {
  ;['willChange', 'isChanging', 'didChange',
  'willUnchange', 'isUnchanging', 'didUnchange'].forEach(k => {
    let f_m = model[k] // use a closure to catch f
    if (eYo.isF(f_m)) {
      let f_s = prototype.eyo.C9r_s[k]
      let m = XRegExp.exec(f_m.toString(), eYo.xre.function_builtin_before)
      if (m) {
        let before = m.before
        if (m.builtin) {
          var ff = before
            ? eYo.isDoIt(f_s) ? function (before, after) {
                f_m.call(this, () => {
                  f_s.call(this, before, after)
                }, before, after)
              } : function (before, after) {
                f_m.call(this, eYo.doNothing, before, after)
              }
            : eYo.isDoIt(f_s) ? function (before, after) {
                f_m.call(this, () => {
                  f_s.call(this, before, after)
                }, after)
              } : function (before, after) {
                f_m.call(this, eYo.doNothing, after)
              }
        } else {
          ff = before ? f_m : function (before, after) {
            f_m.call(this, after)
          }
        }
      } else {
        ff = f_m
      }
      prototype[k] = eYo.decorate.reentrant(k, ff)
    } else {
      f_m && eYo.throw(`Unexpected model (${prototype.eyo.name}/${key}) value synchronize -> ${f_m}`)
    }
  })
}

/**
 * Base property constructor.
 * The bounds between the data and the arguments are immutable.
 * For edython.
 * @param {eYo.brick.Base} brick The object owning the data.
 * @param {string} key name of the data.
 * @param {Object} model contains methods and properties.
 * It is shared by all data controllers belonging to the same kind
 * of owner. Great care should be taken when editing this model.
 * @constructor
 */
eYo.data.makeBase({
  init (brick, key) {
    brick || eYo.throw(`${this.eyo.name}: Missing brick`)
    key || eYo.throw(`${this.eyo.name}: Missing key in makeBase`)
    this.reentrant_ = {}
    this.key_ = key
    let model = this.model
    this.name = 'eyo:' + (model.name || key).toLowerCase()
    this.noUndo = !!model.noUndo
    var xml = model.xml
    if (eYo.isDef(xml) || xml !== false) {
      this.attributeName = (xml && xml.attribute) || key
    }
  },
})

eYo.data.enhancedO4t()

eYo.data.Base.eyo.modelMerge({
  aliases: {
    'brick.changer': 'changer',
    'brick.type': 'brickType',
    'brick.data': 'data',
    'brick.ui': 'ui',
    'brick.ui_driver': 'ui_driver',
  },
  properties: {
    brick: {
      get () {
        return this.owner
      },
    },
    key: eYo.NA,
    value: eYo.NA,
    required_from_model: false,
    /**
     * Disabled data correspond to disabled input.
     * Changing this value will cause an UI synchronization and a change count.
     */
    incog: {
      after: ['required_from_model', 'changer'],
      lazy: false,
      set (after) {
        if (!eYo.isDef(after)) {
          after = !this.required_from_model_
        } else {
          after = !!after
        }
        eYo.whenVALID(this.validateIncog(after), after => {
          if (this.incog_ !== after) {
            this.changer.wrap(() => {
              this.incog_ = after
              this.slot && (this.slot.incog = after)
              this.field && (this.field.visible = !after)
            })
          }
        })
      }
    },
    requiredIncog: {
      after: ['required_from_model'],
      set (after) {
        this.incog_ = !(this.required_from_model_ = after)
      }
    },
    required_from_type: false,
    /**
     * Get the concrete required status.
     * For edython.
     */
    required_from_saved: {
      after: ['required_from_model', 'required_from_type'],
      get () {
        return this.required_from_model || this.get().length || this.required_from_type
      },
    },
  },
})

;(() => {
  let _p = eYo.data.Base_p

  /**
   * Get the value of the data
   */
  _p.get = function () {
    return this.stored__
  }

  /**
   * Set the value with no extra task except hooks before, during and after the change.
   * @param {Object} after
   */
  _p.setRaw_ = function (after) {
    var before = this.stored__
    if (before !== after) {
      this.changer.begin()
      try {
        this.beforeChange(before, after)
        if (after === eYo.key.Comment) {
          console.error('BACK TO COMMENT')
        }
        this.stored__ = after
        this.duringChange(before, after)
      } finally {
        this.afterChange(before, after)
        this.changer.end() // may render
      }
    }
  }

  /**
   * Set the value with no extra task.
   * The `set` method will use hooks before and after the change.
   * No such thing here.
   * If the given value is an index, use instead the corresponding
   * item in the `getAll()` array.
   * @param {Object} after
   */
  _p.setFiltered_ = function (after) {
    if (eYo.isStr(after)) {
      var x = this.model[after]
      !x || !eYo.isF(after) || (after = x)
    }
    if (eYo.isNum(after)) {
      x = this.getAll()
      if (x && eYo.isDef((x = x[after]))) {
        after = x
      }
    }
    this.setRaw_(after)
  }

  /**
   * Init the value of the property depending on the type.
   * This is usefull for variants and options.
   * The model is asked for a method.
   * @param {Object} type
   */
  _p.setWithType = eYo.decorate.reentrant('setWithType', function (type) {
    this.setFiltered_(this.model.fromType.call(this.owner, type))
  })

  /**
   * When not eYo.NA, this is the array of all possible values.
   * May be overriden by the model.
   * Do not use this directly because this can be a function.
   * Always use `getAll` instead.
   */
  _p.all = eYo.NA

  /**
   * Get all the values.
   */
  _p.getAll = function () {
    var all = this.model.all
    return (eYo.isRA(all) && all) || (eYo.isF(all) && (eYo.isRA(all = all()) && all))
  }

  /**
   * Whether the data value is eYo.key.NONE.
   * @return {Boolean}
   */
  _p.isNone = function () {
    return this.get() === eYo.key.NONE
  }

  /**
   * Validates the value of the data
   * May be overriden by the model.
   * @param {Object} after
   */
  _p.validate = eYo.doReturn
  
  /**
   * Validates the value of the data
   * May be overriden by the model.
   * @param {Object} after
   */
  _p.validateIncog =  eYo.doReturn
  
  /**
   * Returns the text representation of the data.
   * @param {Object} [after]
   */
  _p.toText = function () {
    var ans = this.get()
    if (eYo.isNum(ans)) {
      ans = ans.toString()
    }
    return ans || ''
  }

  /**
   * Returns the text representation of the data.
   * Called during synchronization.
   */
  _p.toField = function () {
    var f = eYo.decorate.reentrant_method(this, 'toField', this.model.toField || this.model.toText)
    var result = this.get()
    if (f) {
      return eYo.whenVALID(f.call(this))
    }
    if (eYo.isNum(result)) {
      result = result.toString()
    }
    return result || ''
  }

  /*
  * Below are collected the various setters.
  * The setters come in different flavours depending on
  * 1) undo management
  * 2) UI synchronization
  * 3) validation (related to point 2)
  * Whether these points are orthogonal is not clear.
  * Discussion about states.
  * a) consistent state: all rules are fullfilled.
  * b) transitional state: some rules are broken.
  * The program runs from consistent state to consistent state
  * through transitional states.
  * Some methods break the consistency, some methods repair things.
  * Is it possible to identify the methods that do not break state?
  * And conversely the methods that break state.
  * One important thing is to clearly list the rules that define a
  * consistent state.
  * Consistency rules may concern the data model, the user interface
  * and their relationship.
  * The rendering process consists in setting the view model according
  * to the data model. Then displaying is processed by some engine
  * (in the navigator for example).
  *
  */

  /**
   * Set the value from the given text representation.
   * In general, the given text either was entered by a user in a text field ot read from a persistent text formatted storage.
   * Calls the javascript model, reentrant.
   * Does nothing when the actual value and
   * the actual argument are the same.
   * @param {Object} txt
   * @param {boolean=} dontValidate
   */
  _p.fromText = function (txt, dontValidate) {
    if (txt.length && !this.model.isText) {
      var n = Number(txt)
      if (!isNaN(n)) {
        txt = n
      }
    }
    this.setUntrusted_(txt, dontValidate)
  }

  /**
   * Set the value from the given text representation
   * as text field content.
   * In general, the given text either was entered by a user in a text field ot read from a persistent text formatted storage.
   * Does nothing when the actual value and
   * the actual argument are the same.
   * @param {Object} txt
   * @param {boolean=} dontValidate
   */
  _p.fromField = function (txt, dontValidate) {
    this.setUntrusted_(txt, dontValidate)
  }

  /**
   * Will change the value of the property.
   * The signature is `willChange(before, after) → void`
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.willChange = eYo.doNothing

  /**
   * When unchange the value of the property.
   * The signature is `didUnchange(after, before) → void`
   * May be overriden by the model.
   * Replaces `willChange` when undoing.
   * @param {Object} after
   * @param {Object} before
   * @return eYo.NA
   */
  _p.didUnchange = function (before, after) {
    this.didChange(before, after)
  }

  /**
   * Did change the value of the property.
   * The signature is `didChange( before, after ) → void`
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.didChange = eYo.doNothing

  /**
   * Will unchange the value of the property.
   * The signature is `willUnchange( before, after ) → void`.
   * Replaces `didChange` while undoing.
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.willUnchange = function (before, after) {
    this.willChange(before, after)
  }

  /**
   * Before the didChange message is sent.
   * The signature is `isChanging( before, after ) → void`
   * May be overriden by the model.
   * No undo message is yet sent but the data has recorded the new value.
   * Other object may change to conform to this new state,
   * before undo events are posted.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.isChanging = eYo.doNothing

  /**
   * Before the didUnchange message is sent.
   * The signature is `isUnchanging( before, after ) → void`
   * May be overriden by the model.
   * No undo message is yet sent but the data has recorded the new value.
   * Other object may change to conform to this new state,
   * before undo events are posted.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.isUnchanging = function (before, after) {
    this.isChanging(before, after)
  }

  /**
   * Before change the value of the property.
   * Branch to `willChange` or `willUnchange`.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.beforeChange = function(before, after) {
    ;(!eYo.event.recordingUndo ? this.willChange : this.willUnchange).call(this, before, after)
  }

  /**
   * During change the value of the property.
   * The new value has just been recorded,
   * but all the consequences are not yet managed.
   * In particular, no undo management has been recorded.
   * Branch to `isChanging` or `isUnchanging`.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.duringChange = function(before, after) {
    ;(!eYo.event.recordingUndo ? this.isChanging : this.isUnchanging).apply(this, arguments)
  }

  /**
   * After change the value of the property.
   * Branch to `didChange` or `didUnchange`.
   * `synchronize` in fine.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.afterChange = function(before, after) {
    ;(eYo.event.recordingUndo ? this.didChange : this.didUnchange).call(before, after)
    this.synchronize(before, after)
  }

  /**
   * Wether a value change fires an undo event.
   * May be overriden by the javascript model.
   */
  _p.noUndo = eYo.NA

  /**
   * Synchronize the value of the property with the UI.
   * Called once when the model has been made,
   * and called each time the value changes,
   * whether doing, undoing or redoing.
   * May be overriden by the model.
   * When not overriden by the model, updates the field and slot state.
   * We can call `this.synchronize()` from the model.
   * `synchronize: true`, and
   * synchronize: function() { this.synchronize()} are equivalent.
   * Raises when not bound to some field or slot, in the non model variant.
   * @param {Object} after
   */
  _p.synchronize = function (before, after) {
    var d = this.ui_driver
    if (!d) {
      return
    }
    if (!eYo.isDef(after)) {
      after = this.get()
    }
    if (this.model.synchronize === true) {
      eYo.assert(this.field || this.slot || this.model.synchronize, `No field nor slot bound. ${this.key}/${this.brickType}`)
      var field = this.field
      if (field) {
        if (this.incog) {
          if (this.slot && this.slot.data === this) {
            this.slot.incog = true
          } else {
            field.visible = false
          }
        } else {
          eYo.event.disableWrap(() => {
            field.text = this.toField()
            if (this.slot && this.slot.data === this) {
              this.slot.incog = false
              field.visible = !this.slot.unwrappedTarget && (!eYo.app.noBoundField || this.model.allwaysBoundField || this.get().length)
            } else {
              field.visible = true
            }
            var d = field.ui_driver
            d && (d.makeError(field))
          })
        }
      }
    }
  }

  /**
   * set the value of the property without any validation.
   * This is overriden by the events module.
   * @param {Object} after
   * @param {Boolean} noRender
   */
  _p.setUntrusted_ = function (after, dontValidate) {
    if (dontValidate) {
      this.doChange(after, false)
    } else if (this.stored__ !== after) {
      var v7d = this.validate(after)
      if (!v7d || !eYo.isVALID(v7d)) {
        this.error = true
        v7d = after
      } else {
        this.error = false
      }
      this.setTrusted_(v7d)
    }
  }

  /**
   * set the value of the property without any validation.
   * This is overriden by the events module.
   * @param {Object} after
   * @param {Boolean} noRender
   */
  _p.setTrusted_ = function (after) {
    this.setFiltered_(after)
  }

  /**
   * set the value of the property without any validation.
   * This is overriden by the events module.
   * @param {Object} after
   * @param {Boolean} noRender
   */
  _p.setTrusted = eYo.decorate.reentrant('setTrusted', function (...args) {
    this.setTrusted_.call(this, ...args)
  })

  /**
   * If the value is an uppercase string,
   * change it to a key.
   * If the value is a number, change to the corresponding item
   * in the `getAll()` array.
   * If there is a model function with that name, use it instead.
   * @param {Object} after
   */
  _p.filter = function (after) {
    if (eYo.isStr(after)) {
      if (after === after.toUpperCase()) {
        var x = eYo.key[after]
        !x || (after = x)
      }
    } else if (eYo.isNum(after)) {
      x = this.getAll()
      if (x && eYo.isDef((x = x[after]))) {
        after = x
      }
    }
    return after
  }

  /**
   * set the value of the property,
   * with validation, undo and synchronization.
   * Undo management and synchronization only occur when
   * the old value and the new value are not the same.
   * @param {Object} after
   * @param {Boolean} noRender
   */
  _p.set = function (after, validate = true) {
    after = this.filter(after)
    if ((this.stored__ === after) || (validate && (!eYo.isVALID(after = this.validate (before, after))))) {
      return false
    }
    this.error = false
    this.setTrusted(after)
    return true
  }

  Object.defineProperty(eYo.data, 'incog', {
    get () {
      return this.incog_
    },
    /**
     * Disabled data correspond to disabled input.
     * Changing this value will cause an UI synchronization but no change count.
     * @param {Boolean} after  When not defined, replaced by `!this.required_from_model_`
     */
    set (after) {
      if (!eYo.isDef(after)) {
        after = !this.required_from_model
      } else {
        after = !!after
      }
      var validator = this.model.validateIncog
      if (validator) {
        after = validator.call(this, after)
      }
      if (this.incog_ !== after) {
        this.incog_ = after
        if (this.slot) {
          this.slot.incog = after
        } else {
          this.field && (this.field.visible = !after)
        }
      }
    }
  })

  /**
   * Consolidate the value.
   * Should be overriden by the model.
   * Reentrant management here of the model action.
   */
  _p.consolidate = eYo.doNothing

  /**
   * An active data is not explicitely disabled, and does contain text.
   * @private
   */
  _p.isActive = function () {
    return !!this.required_from_model || (!this.incog_ && (eYo.isStr(this.stored__) && this.stored__.length))
  }

  /**
   * Set the value of the main field eventually given by its key.
   * @param {Object} after
   * @param {string|null} fieldKey  of the input holder in the ui object
   * @param {boolean} noUndo  true when no undo tracking should be performed.
   * @private
   */
  _p.setMainFieldValue = function (after, fieldKey, noUndo) {
    var field = this.fields[fieldKey || this.key]
    if (field) {
      eYo.event.disableWrap(() => {
        field.text = after
      })
    }
  }

  /**
   * Does nothing if the data is disabled or if the model
   * has a `false` valued xml property.
   * Saves the data to the given element, except when incog
   * or when the model forces.
   * Also, if there is an associate slot with a target,
   * then the data is not saved either.
   * For edython.
   * @param {Element} element the persistent element.
   * @param {Object} [opt]  See eponym parameter in `eYo.xml.brickToDom`.
   */
  _p.save = function (element, opt) {
    var xml = this.model.xml
    if (xml === false) {
      // only few data need not be saved
      return
    }
    // do not save if there is an associate slot with a target brick.
    if (this.slot && this.slot.bindField === this.field && this.slot.unwrappedTarget) {
      return
    }
    if (!this.incog || xml && eYo.do.valueOf(xml.force, this)) {
      // in general, data should be saved
      var required = this.required_from_model || (xml && xml.required)
      var isText = xml && xml.text
      var txt = this.toText()
      // if there is no text available, replace with the placeholder
      if (opt && opt.noEmpty && !txt.length) {
        var field = this.field
        if (field) {
          var p9r = field.placeholder
          if (p9r && p9r.length) {
            txt = p9r
            this.doChange(txt)
          }
        }
      }
      if (isText) {
        if (txt.length) {
          eYo.dom.appendChild(element, eYo.dom.createTextNode(txt))
        } else if (required) {
          eYo.dom.appendChild(element, eYo.dom.createTextNode('?'))
        }
      } else if (txt.length) {
        element.setAttribute(this.attributeName, txt)
      } else if (this.required_from_model) {
        if (this.model.custom_placeholder) {
          element.setAttribute(this.attributeName + '_placeholder', this.model.custom_placeholder.toString())
        } else if (this.slot && this.slot.bindField === this.field) {
          // let the slot do it
          this.slot.saveRequired(element, opt)
        } else {
          element.setAttribute(this.attributeName + '_placeholder', txt)
        }
      }
    }
  }

  /**
   * Customize the placeholder.
   * For edython.
   * @param {String} txt the new placeholder.
   */
  _p.customizePlaceholder = function (txt) {
    if (txt === this.model.placeholder) {
      return
    }
    if (eYo.isDef(this.model.custom_placeholder)) {
      var placeholder = eYo.do.valueOf(txt, this)
      this.model.custom_placeholder = placeholder && (placeholder.toString().trim())
      return
    }
    var m = {}
    eYo.do.mixin(m, this.model)
    this.model = m
    m.placeholder = m.custom_placeholder = eYo.do.valueOf(txt, this)
  }

  /**
   * Convert the brick's data from a dom element.
   * What is the status with respect to the undo management.
   * This function is important.
   * For edython.
   * @param {Element} xml the persistent element.
   */
  _p.load = function (element) {
    this.loaded_ = false
    var xml = this.model.xml
    if (xml === false) {
      return
    }
    if (element) {
      var required = this.required_from_model
      var isText = xml && xml.text
      this.required_from_model_ = false
      var txt
      if (isText) {
        // get the first child which is a text node
        if (!eYo.do.someChild(element, (child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            txt = child.nodeValue
            return true
          }
        })) {
          txt = element.getAttribute(eYo.key.PLACEHOLDER)
          if (eYo.isDef(txt)) {
            this.customizePlaceholder(txt)
            this.required_from_model_ = true
            this.fromText('', false)
            return this.loaded_ = true
          }
        }
      } else {
        txt = (this.model.xml && (eYo.isF(this.model.xml.getAttribute))
          && (this.model.xml.getAttribute.call(this, element)) ||element.getAttribute(this.attributeName))
        if (!eYo.isDef(txt)) {
          txt = element.getAttribute(`${this.attributeName}_${eYo.key.PLACEHOLDER}`)
          if (eYo.isDef(txt)) {
            this.customizePlaceholder(txt)
            this.required_from_model_ = true
            this.fromText('', false)
            return this.loaded_ = true
          }
        }
      }
      if (eYo.isDef(txt)) {
        if (required && txt === '?') {
          txt = ''
          this.required_from_model_ = true
        } else {
          if ((isText && txt === '?') || (!isText && txt === '')) {
            txt = ''
            this.required_from_model_ = true
          } else if (txt) {
            let v7d = this.validate(txt)
            this.required_from_model_ = eYo.whenVALID(v7d, '')
          }
          this.fromText(txt, false) // do not validate, there might be an error while saving, please check
        }
      } else if (required) {
        this.fromText('', false)
      }
      return this.loaded_ = true
    }
  }
  /**
   * Before all the data and slots will load.
   * For edython.
   */
  /**
   * When all the data and slots have been loaded.
   * For edython.
   */
  _p.willLoad = _p.didLoad = eYo.doNothing

  /**
   * Clean the required status, changing the value if necessary.
   * For edython.
   * @param {Function} do_it
   */
  _p.whenRequiredFromModel = function (do_it) {
    if (this.required_from_model) {
      this.required_from_model_ = false
      if (eYo.isF(do_it)) {
        do_it.call(this)
      }
      return true
    }
  }

  /**
   * Clean the required status, changing the value if necessary.
   * For edython.
   * @param {function()} helper
   */
  _p.whenRequiredFromSaved = function (helper) {
    if (this.required_from_saved) {
      this.required_from_model_ = false
      if (eYo.isF(helper)) {
        helper.call(this)
      }
      return true
    }
  }
  /**
   * Set the value wrapping in a `changeBegin`/`changeEnd`
   * group call of the owner.
   * @param {Object} after
   * @param {Boolean} notUndoable
   */
  _p.doChange = function (after, validate) {
    if (after !== this.stored__) {
      this.owner.changer.wrap(() => {
        this.set(after, validate)
      })
    }
  }

}) ()
