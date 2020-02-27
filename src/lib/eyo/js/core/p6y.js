/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.p6y is a class for a property controller.
 * It extends the JS property design by providing some hooks before, during and after changes, allowing observers to specify actions.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('do')

eYo.forwardDeclare('xre')

// ANCHOR eYo.p6y
/**
 * @name{eYo.p6y}
 * @namespace
 */
eYo.c9r.makeNS(eYo, 'p6y')

Object.defineProperties(eYo.p6y._p, {
  BEFORE: {value: 'willChange'},
  DURING: {value: 'atChange'},
  AFTER: {value: 'didChange'},
})

Object.defineProperties(eYo.p6y._p, {
  HOOKS: {
    value: [
      eYo.p6y.BEFORE,
      eYo.p6y.DURING,
      eYo.p6y.AFTER
    ]
  },
})

eYo.model.allowModelPaths('properties', {
  'properties\\.\\w+': [
    'after', 'source',
    'value', 'lazy', 'reset',
    'validate', 'get', 'set', 'get_', 'set_',
    eYo.p6y.BEFORE, eYo.p6y.DURING, eYo.p6y.AFTER,
    'dispose',
  ],
})

eYo.model.allowModelShortcuts({
  'properties\\.\\w+': (before, p) => {
    if (!eYo.isD(before)) {
      return {
        value: before
      }
    }
  },
})


// ANCHOR eYo.p6y.new
/**
 * Create a new property based on the model
 * 
 */
eYo.p6y._p.new = function (owner, key, model) {
  if (!model.C9r) {
    model.C9r = this.makeC9r('')
    model._starters = []
    let _p = model.C9r.prototype
    this.handle_value(owner, _p, key, model)
    this.handle_dispose(owner, _p, key, model)
    this.handle_validate(owner, _p, key, model)
    this.handle_get_set(owner, _p, key, model)
    this.handle_change(owner, _p, key, model)
    this.handle_stored(owner, _p, key, model)
    this.handle_reset(owner, _p, key, model) // must be last
  }
  let ans = new model.C9r(owner, key, model)
  model._starters.forEach(f => f(ans))
  return ans
}

/**
 * Make a starter to set the start value, based on the model's object for value key value, either a function or an object.
 * If model's value object is a function, it is executed to return an object which will be the initial value.
 * If we want to initialize with a function, the model's value object must be a function that returns the expected function.
 * No change hook is reached.
 * @param {Object} owner
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.handle_value = function (owner, prototype, key, model) {
  let value_m = model.value
  if (!eYo.isNA(value_m)) {
    eYo.isNA(model.lazy) || eYo.throw(`Bad model (${key}): unexpected lazy`)
    prototype.start = eYo.isF(value_m) ? function() {
      return value_m.call(this.owner)
    } : function () {
      return value_m
    }
    model._starters.push(object => {
      object.setStored(object.start())
    })
  }
}

/**
 * Make the prototype's `reset` method, based on the model's object for value key reset, either a function or an object.
 * If model's object is a function, it is executed to return an object which will be the new value.
 * If we want to reset with a function, the model's object must be a function that in turn returns the expected function.
 * @param {Object} owner
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.handle_reset = function (owner, prototype, key, model) {
  let reset_m = model.reset
  if (eYo.isNA(reset_m)) {
    return
  } else if (eYo.isF(reset_m)) {
    if (reset_m.length) {
      prototype.reset = function () {
        try {
          this.reset = eYo.doNothing
          reset_m.call(this.owner, () => {
            prototype.eyo.C9r_s.reset.call(this)
          })
        } finally {
          delete this.reset
        }
      }
    } else {
      if (!model.value) {
        model.value = model.lazy || model.reset
        this.handle_value(owner, prototype, key, model)
      }
      prototype.reset = function () {
        try {
          this.reset = eYo.doNothing
          this.resetValue(reset_m.call(this.owner))
        } finally {
          delete this.reset
        }
      }
    }
  } else {
    if (!model.value && !model.lazy) {
      model.value = model.reset
      this.handle_value(owner, prototype, key, model)
    }
    prototype.reset = function () {
      try {
        this.reset = eYo.doNothing
        this.resetValue(reset_m)
      } finally {
        delete this.reset
      }    
    }
  }
}

/**
 * Make the prototype's dispose method according to the model's object for key dispose.
 * @param {Object} owner
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.handle_dispose = function (owner, prototype, key, model) {
  if (model.dispose === false) {
    prototype.disposeStored_ = eYo.doNothing
  }
}

/**
 * make the prototype's validate method based on the model's object for key validate.
 * The prototype may inherit a validate method.
 * Changing the ancestor prototype afterwards is not a good idea.
 * @param {Object} owner
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.handle_validate = function (owner, prototype, key, model) {
  let validate_m = model.validate
  if (!prototype.eyo.C9r_s) {
    console.error('BREAK HERE!!!')
  }
  let validate_s = prototype.eyo.C9r_s.validate
  if (eYo.isF(validate_m)) {
    prototype.validate = validate_m.length > 1
    ? validate_s
      ? function (before, after) {
        try {
          this.validate = eYo.doNothing
          if (eYo.isVALID((after = validate_m.call(this.owner, before, after)))) {
            after = validate_s.call(this, before, after)
          } 
          return after
        } finally {
          delete this.validate
        }
      } : function (before, after) {
        try {
          this.validate = eYo.doNothing
          return validate_m.call(this.owner, before, after)
        } finally {
          delete this.validate
        }
      }
    : validate_s
      ? function (before, after) {
        try {
          this.validate = eYo.doNothing
          if (eYo.isVALID((after = validate_m.call(this.owner, after)))) {
            after = validate_s.call(this, before, after)
          }
          return after
        } finally {
          delete this.validate
        }
      } : function (before, after) {
        try {
          this.validate = eYo.doNothing
          return validate_m.call(this.owner, after)
        } finally {
          delete this.validate
        }
      }
  } else {
    validate_m && eYo.throw(`Unexpected model value validate -> ${validate_m}`)
  }
}

/**
 * make the prototype's getValue method based on the model.
 * make the prototype' setValue method based on the model.
 * @param {Object} owner
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.handle_get_set = function (owner, prototype, key, model) {
  var can_lazy = true
  var computed = false // true iff get and set are given with no builtin dependency
  let get_m = model.get // from model => suffix = '_m' and `@this` == property owner
  if (model.copy) {
    model.get && eYo.throw(`Bad model (${owner.eyo.name}/${key}): Unexpected get`)
    prototype.getValue = eYo.p6y.Base_p.__getCopyValue
  } else {
    if (get_m === eYo.doNothing || get_m === false) {
      can_lazy = false
      prototype.getValue = eYo.noGetter(function () {
        return `Write only (${this.owner.eyo.name}/${key})`
      })
    } else if (eYo.isF(get_m)) {
      if (get_m.length) {
        prototype.getValue = function () {
          try {
            this.getValue = eYo.doNothing
            return get_m.call(this.owner, () => {
              return prototype.eyo.C9r_s.getValue.call(this)
            })
          } finally {
            delete this.getValue
          }
        }
      } else {
        prototype.getStored = prototype.getValue = function () {
          try {
            this.getValue = eYo.doNothing
            return get_m.call(this.owner)
          } finally {
            delete this.getValue
          }
        }
        // p6y with pure computed getter cannot be lazy
        computed = true
        can_lazy = false
      }
    } else {
      eYo.isNA(get_m) || eYo.throw(`Bad model (${owner.eyo.name}/${key}): unexpected get -> ${get_m}`)
    }
  }
  let set_m = model.set // from model => suffix = '_m' and `@this` == property owner
  if (set_m === eYo.doNothing || set_m === false) {
    prototype.setValue = eYo.noSetter(function () {
      return `Read only ${this.owner.eyo.name}/${key}`
    })
  } else if (eYo.isF(set_m)) {
    if (set_m.length > 1) {
      computed && eYo.throw(`Bad model (${owner.eyo.name}/${key}): Unexpected 'builtin|property' in set`)
      if (XRegExp.exec(set_m.toString(), eYo.xre.function_stored_after)) {
        prototype.setValue = prototype.resetValue = function (after) {
          try {
            this.setValue = eYo.doNothing
            return set_m.call(this.owner, this.stored__, after)
          } finally {
            delete this.setValue
          }
        }
      } else {
        computed || eYo.throw(`Bad model (${owner.eyo.name}/${key}): Missing 'builtin|property' in set`)
        prototype.setValue = prototype.resetValue = function (after) {
          try {
            this.setValue = eYo.doNothing
            return set_m.call(this.owner, after => {
              prototype.eyo.C9r_s.setValue.call(this, after)
            }, after)
          } finally {
            delete this.setValue
          }
        }
      }
    } else {
      computed || eYo.throw(`Bad model (${owner.eyo.name}/${key}): Missing 'builtin|property' in set (2)`)
      prototype.setStored = prototype.setValue = prototype.resetValue = function (after) {
        try {
          this.setValue = eYo.doNothing
          return set_m.call(this.owner, after)
        } finally {
          delete this.setValue
        }
      }
    }
  } else {
    set_m && eYo.throw(`Bad model (${owner.eyo.name}/${key}): unexpected set -> ${set_m}`)
    if (computed) {
      eYo.isNA(model.reset) || eYo.throw(`Bad model (${owner.eyo.name}/${key}): unexpected reset`)
      prototype.setStored = prototype.setValue = eYo.noSetter(function () {
        return `Read only ${this.owner.eyo.name}/${key}`
      })
      prototype.reset = eYo.doNothing
    }
  }
  if (computed) {
    prototype.dispose = eYo.doNothing
  }
  if (can_lazy) {
    let lazy_m = model.lazy
    if (!eYo.isNA(lazy_m)) {
      model._starters.push(object => {
        object.getValue = Object.getPrototypeOf(object).__getLazyValue
      })
      prototype.start = eYo.isF(lazy_m) ? function () {
        return lazy_m.call(this.owner)
      } : function () {
        return lazy_m
      }
    }
  } else {
    eYo.isNA(model.lazy) && eYo.isNA(model.value) || eYo.throw(`Bad model (${owner.eyo.name}/${key}): unexpected value or lazy`)
  }
}

/**
 * make the prototype's change methods based on the model.
 * If a method is inherited, then the super method is called.
 * It may not be a good idea to change the inherited method afterwards.
 * @param {Object} owner
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.handle_change = function (owner, prototype, key, model) {
  eYo.p6y.HOOKS.forEach(when => {
    let when_m = model[when]
    let when_s = prototype.eyo.C9r_s[when]
    if (eYo.isF(when_m)) {
      prototype[when] = when_m.length > 1
      ? when_s
        ? function (before, after) {
          try {
            this[when] = eYo.doNothing
            when_m.call(this.owner, before, after)
            when_s.call(this, before, after)
          } finally {
            delete this[when]
          }
        } : function (before, after) {
          try {
            this[when] = eYo.doNothing
            when_m.call(this.owner, before, after)
          } finally {
            delete this[when]
          }
        }
      : when_s
        ? function (before, after) {
          try {
            this[when] = eYo.doNothing
            when_m.call(this.owner, after)  
            when_s.call(this, before, after)
          } finally {
            delete this[when]
          }
        } : function (before, after) {
          try {
            this[when] = eYo.doNothing
            when_m.call(this.owner, after)
          } finally {
            delete this[when]
          }
        }
    } else {
      when_m && eYo.throw(`Unexpected model value ${when} -> ${when_m}`)
    }
  })
}

/**
 * make the prototype's getStored method based on the model `get_` function.
 * make the prototype's setStored method based on the model's `set_` function.
 * @param {Object} owner
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.handle_stored = function (owner, prototype, key, model) {
  let get__m = model.get_
  if (get__m === eYo.doNothing || get__m === false) {
    prototype.getStored = eYo.noGetter(function () {
      return `Read only ${this.owner.eyo.name}/${key}`
    })
  } else if (eYo.isF(get__m)) {
    prototype.getStored = get__m.length > 0 ? function () {
      try {
        this.getStored = eYo.doNothing
        return get__m.call(this.owner, () => { return this.__getStored()})
      } finally {
        delete this.getStored
      }
    } : function () {
      try {
        this.getStored = eYo.doNothing
        return get__m.call(this.owner)
      } finally {
        delete this.getStored
      }
    }
  } else {
    eYo.isNA(get__m) || eYo.throw(`Bad model (${owner.eyo.key}/${key}): unexpected get_ object`)
  }
  let set__m = model.set_
  if (set__m === eYo.doNothing || set__m === false) {
    prototype.setStored = eYo.noSetter(function () {
      return `Read only ${this.owner.eyo.name}/${key}`
    })
  } else if (eYo.isF(set__m)) {
    prototype.setStored = set__m.length > 1 ? function (after) {
      try {
        this.setStored = eYo.doNothing
        return set__m.call(this.owner, after => {this.__setStored(after)}, after)
      } finally {
        delete this.setStored
      }
    } : function (after) {
      try {
        this.setStored = eYo.doNothing
        return set__m.call(this.owner, after)
      } finally {
        delete this.setStored
      }
    }
    prototype.resetValue || (prototype.resetValue = prototype.setStored)
  } else {
    eYo.isNA(set__m) || eYo.throw(`Bad model (${owner.eyo.name}/${key}): unexpected set_ object.`)
    prototype.resetValue || (prototype.resetValue = prototype.setStored)
  }
}

// ANCHOR eYo.p6y.Base
/**
 * @name{eYo.p6y.Base}
 * Base property constructor.
 * The bounds between the property and the arguments are immutable.
 * For edython.
 * @param {*} owner - The object owning the property.
 * @param {string} key - name of the property.
 * @param {Object} model - contains methods and properties.
 * It is shared by all property controllers belonging to the same kind
 * of owner. Great care should be taken when editing this model.
 * @constructor
 */
eYo.p6y.makeBase({
  init (owner, key, model) {
    owner || eYo.throw(`${this.eyo.name}: Missing owner in makeBase`)
    eYo.isStr(key) || eYo.throw(`${this.eyo.name}: Missing key in makeBase`)
    eYo.isNA(model) && eYo.throw(`${this.eyo.name}: Missing model in makeBase`)
    this.owner_ = owner
    this.key_ = key
    this.model_ = model
    this.stored__ = eYo.NA // this may be useless in some situations
    Object.defineProperties(this, {
      value: eYo.descriptorR({
          lazy () {
            return `Unexpected setter ${key} in ${owner.eyo.key}'s instance property`
          },
        },
        eYo.p6y.Base_p.valueGetter
      ),
      owner: eYo.descriptorR({
          lazy () {
            return `Unexpected ….owner_ = …, ${owner.eyo.key}'s instance property`
          }
        },
        function () { return this.owner_ }
      ),
      key: eYo.descriptorR({
          lazy () {
            return `Unexpected ….key_ = …, ${owner.eyo.key}'s instance property`
          },
        },
        function () { return this.key_ }
      ),
      model: eYo.descriptorR({
          lazy () {
            return `Unexpected ….model_ = …, ${owner.eyo.key}'s property`
          },
        },
        function () { return this.model_ }
      ),
    })
  },
  dispose (...args) {
    this.removeObservers()
    this.disposeStored_(...args)
    this.key_ = this.owner_ = this.model_ = eYo.NA
  },
})


;(() => {
  let _p = eYo.p6y.Base_p

  /**
   * The parent of the property is the object who declares the property,
   * as part of its `properties:` section of its model.
   * The owner is the object who creates the property with `new`.
   * In general both are equal.
   * @type {Object} parent
   */
  Object.defineProperties(_p, {
    parent: eYo.descriptorR(function () {
      return this.owner
    })
  })

  /**
   * Object disposer.
   * Manage collections, takes care of ownership.
   * @param {Object} what
   */
  _p.disposeStored__ = function (what, ...args) {
    if (what) {
      if (what.eyo) {
        what.eyo_p6y === this && eYo.isF(what.dispose) && what.dispose(...args)
      } else if (eYo.isRA(what)) {
        try {
          what.forEach(x => this.disposeStored__(x, ...args))
        } finally {
          what.length = 0
        }
      } else {
        Object.keys(what).forEach(k => {
          if (what.hasOwnProperty(k)) {
            this.disposeStored__(what[k], ...args)
          }
        })
      }
    }
  }


  /**
   * Dispose of the stored object, if any.
   * Private method, overriden to `eYo.doNothing`
   * for objects that should not be disposed of.
   * 
   */
  _p.disposeStored_ = function (...args) {
    let v = this.stored__
    if (v) {
      try {
        if (v.eyo && v.eyo_p6y === this) {
          this.disposeStored__(v, ...args)
        }
      } catch (e) {
        console.error(`Failed to dispose of property ${this.key} of ${this.owner} due to ${e}`)
      } finally {
        this.stored__ = eYo.NA
      }
    }
  }

  /**
   * Fallback to validate the value of the property;
   * Default implementation forwards to an eventual `fooValidate` method
   * of the owner, where `foo` should be replaced by the key of the receiver.
   * @param {Object} before
   * @param {Object} after
   */
  _p.validate = function (before, after) {
    let f_o = this.owner && this.owner[this.key + 'Validate']
    return eYo.isF(f_o) ? f_o.call(this.owner, before, after) : after
  }
  
  /**
   * @name{willChange}
   * Before changing the value of the property.
   * The signature is `willChange([before], after) → Boolean`
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return {Boolean} true when performed
   */
  /**
   * @name{atChange}
   * When changing the value of the property.
   * The signature is `atChange( [before], after ) → Boolean`
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return {Boolean} true when performed
   */
  /**
   * @name{didChange}
   * Did change the value of the property.
   * The signature is `didChange( [before], after ) → Boolean`
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return {Boolean} true when performed
   */
  eYo.p6y.HOOKS.forEach(when => {
    let When = eYo.do.toTitleCase(when)
    _p[when] = function (before, after) {
      try {
        this[when] = eYo.doNothing
        let f_o = this.owner[this.key + When]
        eYo.isF(f_o) && f_o.call(this.owner, before, after)
        this.fireObservers(when, before, after)
      } finally {
        delete this[when]
      }
    }
  })

  /**
   * Returns the starting value.
   */
  _p.start = eYo.doNothing

  /**
   * Get the stored value. May be overriden by the model's `get_` key.
   * @private
   */
  _p.getStored = _p.__getStored = function () {
    return this.stored__
  }

  /**
   * Set the value of the receiver.
   * This can be overriden by the model's `set_` key.
   * The computed properties do not store values on their own.
   * @param {*} after - the new value after the change.
   * @return {*} the previously stored value
   */
  _p.setStored = _p.__setStored = function (after) {
    let before = this.stored__
    if (before && before.eyo_p6y === this) {
      // resign ownership
      before.eyo_p6y = eYo.NA
    }
    this.stored__ = after
    if (after && after.eyo && !after.eyo_p6y) {
      // gain ownership
      after.eyo_p6y = this
    }
  }

  /**
   * recycle of the value.
   * @private
   */
  _p.recycle = function (...args) {
    let before = this.stored__
    if (!eYo.isNA(before)) {
      try {
        this.validate = eYo.doNothing
        let dispose = before.eyo_p6y === this
        this.setValue(eYo.NA)
        if (dispose) {
          before.eyo_p6y = eYo.NA
          before.dispose(...args)
        }
      } finally {
        delete this.validate
      }
    }
  }

  /**
   * Used multiple times.
   * @private
   */
  _p.valueGetter = function () {
    return this.getValue()
  }

  /**
   * @property {*} value - computed
   */
  Object.defineProperties(_p, {
    value_: {
      get: _p.valueGetter,
      set (after) {
        this.setValue(after)
      }
    },
    value__: {
      get () {
        return this.getStored()
      },
      set (after) {
        this.setStored(after)
      }
    },
  })

  /**
   * Get the value, may be overriden by the model's `get` key.
   * @private
   */
  _p.getValue = function () {
    return this.getStored()
  }

  /**
   * Get the value, lazily.
   * @private
   */
  _p.__getLazyValue = function () {
    try {
      this.getValue = eYo.doNothing
      var ans = this.getStored()
      if (eYo.isNA(ans)) {
        this.setStored(ans = this.start())
      }
      return ans
    } finally {
      delete this.getValue
    }
  }

  /**
   * Get the value, as copy.
   * Do not overwrite.
   * @private
   */
  _p.__getCopyValue = function () {
    try {
      this.getValue = eYo.doNothing
      var ans = eYo.p6y.Base_p.getValue.call(this)
      return ans && ans.copy
    } finally {
      delete this.getValue
    }
  }

  /**
   * Set the value of the receiver.
   * This can be overriden by the model's `set` key.
   * @param {*} after - the new value after the change.
   */
  _p.setValue = function (after) {
    var before = this.value__
    after = this.validate(before, after)
    if (eYo.isVALID(after)) {
      if (before !== after) {
        this.willChange(before, after)
        try {
          this.setStored(after)
          this.atChange(before, after)
        } finally {
          this.didChange(before, after)
        }
      }    
    }
  }

  /**
   * Set the value of the receiver.
   * This can be overriden by the model's `set` key.
   * @param {*} after - the new value after the change.
   */
  _p.reset = function () {
    this.setValue(this.start())
  }

  /**
   * Add the observer
   * @param {Function} f - function ([before], after) => void. arguments must ont have another name. No `this` for the callback.
   * @param {String} when - One of 'before', 'during', 'after'
   * @return {*} The callback, to be used for removing the observer.
   */
  _p.addObserver = function (callback, when = eYo.p6y.AFTER) {
    eYo.isF(callback) || eYo.throw(`Callback must be a function, got ${callback}`)
    eYo.p6y.HOOKS.includes(when) || eYo.throw(`Unexpected when, got ${when}`)
    let byWhen = this.observersByWhen__ || (this.observersByWhen__ = {})
    let observers = byWhen[when] || (byWhen[when] = [])
    if (callback.length > 1) {
      observers.push(callback)
    } else {
      let wrapper = (before, after) => {
        callback(after)
      }
      wrapper.eyo_observer = callback
      observers.push(wrapper)
    }
    return callback
  }

  /**
   * Remove the given observer.
   * @param {Function} callback - function ([before], after) => void. arguments must ont have another name. No `this` for the callback.
   * @param {String} [when] - One of 'before', 'during', 'after'
   * @return {*} The callback, to be used for adding the observer again.
   */
  _p.removeObserver = function (callback, when) {
    !callback || eYo.isF(callback) || eYo.throw(`removeObserver: bad call back ${callback}`)
    !when || eYo.p6y.HOOKS.includes(when) || eYo.throw(`removeObserver: bad when ${when}`)
    let byWhen = this.observersByWhen__
    if (byWhen) {
      if (when) {
        let observers = byWhen[when]
        if (observers) {
          byWhen[when] = observers.filter(x => x !== callback && x.eyo_observer !== callback)
        }
      } else {
        eYo.p6y.HOOKS.forEach(when => {
          let observers = byWhen[when]
          if (observers) {
            byWhen[when] = observers.filter(x => x !== callback && x.eyo_observer !== callback)
          }  
        })
      }
    }
    return callback
  }

  /**
   * Remove all the observers.
   */
  _p.removeObservers = function () {
    let byWhen = this.observersByWhen__
    if (byWhen) {
      eYo.p6y.HOOKS.forEach(when => {
        let observers = byWhen[when]
        if (observers) {
          observers.length = 0
        }  
      })
    }
  }

  /**
   * Fire the observers.
   * @param {*} when - One of `eYo.p6y.BEFORE`, `eYo.p6y.DURING`, `eYo.p6y.AFTER`, specifies when the observers are fired.
   * @param {*} before - the value before
   * @param {*} after - the value after
   */
  _p.fireObservers = function (when, before, after) {
    let byWhen = this.observersByWhen__
    if (byWhen) {
      let observers = byWhen[when]
      observers && observers.forEach(f => f(before, after))
    }
  }

  /**
   * Iterator.
   */
  _p.ownedForEach = eYo.doNothing

}) ()

/**
 * Maintains a list of properties.
 * `eYo.o4t.Base` instances maintains properties by keys.
 * Here properties are maintained by index.
 * @name{eYo.p6y.List}
 * @constructor
 */
eYo.p6y.makeC9r('List', {
  init (owner, ...items) {
    this.list__ = []
    this.values = new Proxy(this.list__, {
      get(target, prop) {
        if (!isNaN(prop)) {
          prop = parseInt(prop, 10)
          if (prop < 0) {
            prop += target.length
          }
          let p = target[prop]
          return p && p.value
        }
        throw new Error('`values` attribute only accepts indexed accessors')
      }
    })
    this.properties = new Proxy(this.list__, {
      get(target, prop) {
        if (!isNaN(prop)) {
          prop = parseInt(prop, 10)
          if (prop < 0) {
            prop += target.length
          }
          return target[prop]
        }
        throw new Error('`properties` attribute only accepts indexed accessors')
      }
    })
    this.splice(0, 0, ...items)
  },
  dispose(...args) {
    for (const p of this.list__) {
      p.dispose(...args)
    }
    this.list__.length = 0
  }
})

;(() => {
  let _p = eYo.p6y.List_p

  Object.defineProperties(_p, {
    length: {
      get () {
        return this.list__.length
      },
      set (after) {
        this.list__.length = after
      }
    },
  })
 
  /**
   * Insert something at index i.
   * @param {Integer} start - The index at which to start changing the list.
   * @param {...} item - items to be inserted.
   */
  _p.splice = function (start, deleteCount,  ...items) {
    if (start < 0) {
      start = this.list__.length - start
    }
    let ans = this.list__.splice(start, deleteCount).map(p => p.value)
    this.list__.splice(start, 0, ...(items.map(item => eYo.p6y.new(this, '', {
      value: item
    }))))
    return ans
  }

}) ()

/**
 * The @@iterator method
 */
eYo.p6y.List.eyo_p.initInstance = function (object) {
  eYo.p6y.List.eyo.super.initInstance(object)
  object.Symbol.iterator = function* () {
    for (var p of this.list__) {
      yield p.value
    }
  }
}
