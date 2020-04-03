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

eYo.forward('xre')

// ANCHOR eYo.p6y
/**
 * @name{eYo.p6y}
 * @namespace
 */
eYo.attr.makeNS(eYo, 'p6y')

eYo.model.allowModelPaths({
  [eYo.model.ROOT]: 'properties',
  'properties': '\\w+',
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
 * The model path.
 * @see The `new` method.
 * @param {String} key
 */
eYo.p6y._p.modelPath = function (key) {
  return eYo.isStr(key) ? `properties.${key}` : 'properties'
}

/**
 * For subclassers.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.modelHandle = function (_p, key, model) {
  this.modelHandleValue(_p, key, model)
  this.modelHandleDispose(_p, key, model)
  this.modelHandleValidate(_p, key, model)
  this.modelHandleGetSet(_p, key, model)
  this.modelHandleChange(_p, key, model)
  this.modelHandleStored(_p, key, model)
  this.modelHandleReset(_p, key, model) // must be last
}

/**
 * Make a starter to set the start value, based on the model's object for value key value, either a function or an object.
 * If model's value object is a function, it is executed to return an object which will be the initial value.
 * If we want to initialize with a function, the model's value object must be a function that returns the expected function.
 * No change hook is reached.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.modelHandleValue = function (prototype, key, model) {
  let value_m = model.value
  if (!eYo.isNA(value_m)) {
    eYo.isNA(model.lazy) || eYo.throw(`Bad model (${prototype.eyo.name}/${key}): unexpected lazy`)
    prototype.start = eYo.isF(value_m) ? function() {
      return value_m.call(this.owner_)
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
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.modelHandleReset = function (prototype, key, model) {
  let reset_m = model.reset
  if (eYo.isNA(reset_m)) {
    return
  } else if (eYo.isF(reset_m)) {
    if (reset_m.length) {
      prototype.reset = function () {
        try {
          this.reset = eYo.doNothing
          reset_m.call(this.owner_, () => {
            prototype.eyo.C9r_s.reset.call(this)
          })
        } finally {
          delete this.reset
        }
      }
    } else {
      if (!model.value) {
        model.value = model.lazy || model.reset
        this.modelHandleValue(prototype, key, model)
      }
      prototype.reset = function () {
        try {
          this.reset = eYo.doNothing
          this.resetValue(reset_m.call(this.owner_))
        } finally {
          delete this.reset
        }
      }
    }
  } else {
    if (!model.value && !model.lazy) {
      model.value = model.reset
      this.modelHandleValue(prototype, key, model)
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
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.modelHandleDispose = function (prototype, key, model) {
  if (model.dispose === false) {
    prototype.disposeStored_ = eYo.doNothing
  }
}

/**
 * make the prototype's getValue method based on the model.
 * make the prototype' setValue method based on the model.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.modelHandleGetSet = function (prototype, key, model) {
  var can_lazy = true
  var computed = false // true iff get and set are given with no builtin dependency
  let get_m = model.get // from model => suffix = '_m' and `@this` == property owner
  if (model.copy) {
    model.get && eYo.throw(`Bad model (${prototype.eyo.name}/${key}): Unexpected get`)
    prototype.getValue = eYo.p6y.Base_p.__getCopyValue
  } else {
    if (get_m === eYo.doNothing || get_m === false) {
      can_lazy = false
      prototype.getValue = eYo.noGetter(function () {
        return `Write only (${this.owner_.eyo.name}/${key})`
      })
    } else if (eYo.isF(get_m)) {
      if (get_m.length) {
        prototype.getValue = function () {
          try {
            this.getValue = eYo.doNothing
            return get_m.call(this.owner_, () => {
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
            return get_m.call(this.owner_)
          } finally {
            delete this.getValue
          }
        }
        // p6y with pure computed getter cannot be lazy
        computed = true
        can_lazy = false
      }
    } else {
      eYo.isNA(get_m) || eYo.throw(`Bad model (${prototype.eyo.name}/${key}): unexpected get -> ${get_m}`)
    }
  }
  let set_m = model.set // from model => suffix = '_m' and `@this` == property owner
  if (set_m === eYo.doNothing || set_m === false) {
    prototype.setValue = eYo.noSetter(function () {
      return `Read only ${this.owner_.eyo.name}/${key}`
    })
  } else if (eYo.isF(set_m)) {
    if (set_m.length > 1) {
      computed && eYo.throw(`Bad model (${prototype.eyo.name}/${key}): Unexpected 'builtin|property' in set`)
      prototype.setValue = prototype.resetValue = XRegExp.exec(set_m.toString(), eYo.xre.function_stored_after)
      ? function (after) {
        try {
          this.setValue = eYo.doNothing
          return set_m.call(this.owner_, this.stored__, after)
        } finally {
          delete this.setValue
        }
      } : function (after) {
        try {
          this.setValue = eYo.doNothing
          return set_m.call(this.owner_, after => {
            prototype.eyo.C9r_s.setValue.call(this, after)
          }, after)
        } finally {
          delete this.setValue
        }
      }
    } else {
      if (!computed) {
        get_m && eYo.throw(`Bad model (${prototype.eyo.name}/${key}): Missing 'builtin|property' in set (2)`)
        prototype.getStored = prototype.getValue = eYo.noGetter(function () {
          return `Write only ${this.owner_.eyo.name}/${key}`
        })
      }
      computed || !get_m 
      prototype.setStored = prototype.setValue = prototype.resetValue = function (after) {
        try {
          this.setValue = eYo.doNothing
          return set_m.call(this.owner_, after)
        } finally {
          delete this.setValue
        }
      }
    }
  } else {
    set_m && eYo.throw(`Bad model (${prototype.eyo.name}/${key}): unexpected set -> ${set_m}`)
    if (computed) {
      eYo.isNA(model.reset) || eYo.throw(`Bad model (${prototype.eyo.name}/${key}): unexpected reset`)
      prototype.setStored = prototype.setValue = eYo.noSetter(function () {
        return `Read only ${this.owner_.eyo.name}/${key}`
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
        object.getStored = Object.getPrototypeOf(object).__getLazyStored
      })
      prototype.start = eYo.isF(lazy_m) ? function () {
        return lazy_m.call(this.owner_)
      } : function () {
        return lazy_m
      }
    }
  } else {
    eYo.isNA(model.lazy) && eYo.isNA(model.value) || eYo.throw(`Bad model (${prototype.eyo.name}/${key}): unexpected value or lazy`)
  }
}

/**
 * make the prototype's change methods based on the model.
 * If a method is inherited, then the super method is called.
 * It may not be a good idea to change the inherited method afterwards.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.modelHandleChange = function (prototype, key, model) {
  eYo.p6y.HOOKS.forEach(when => {
    let when_m = model[when]
    let when_s = prototype.eyo.C9r_s[when]
    if (eYo.isF(when_m)) {
      prototype[when] = when_m.length > 1
      ? when_s
        ? function (before, after) {
          try {
            this[when] = eYo.doNothing
            when_m.call(this.owner_, before, after)
            when_s.call(this, before, after)
          } finally {
            delete this[when]
          }
        } : function (before, after) {
          try {
            this[when] = eYo.doNothing
            when_m.call(this.owner_, before, after)
          } finally {
            delete this[when]
          }
        }
      : when_s
        ? function (before, after) {
          try {
            this[when] = eYo.doNothing
            when_m.call(this.owner_, after)  
            when_s.call(this, before, after)
          } finally {
            delete this[when]
          }
        } : function (before, after) {
          try {
            this[when] = eYo.doNothing
            when_m.call(this.owner_, after)
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
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.modelHandleStored = function (prototype, key, model) {
  let get__m = model.get_
  if (get__m === eYo.doNothing || get__m === false) {
    prototype.getStored = eYo.noGetter(function () {
      return `Write only ${this.owner_.eyo.name}/${key}`
    })
  } else if (eYo.isF(get__m)) {
    prototype.getStored = get__m.length > 0 ? function () {
      try {
        this.getStored = eYo.doNothing
        return get__m.call(this.owner_, () => { return this.__getStored()})
      } finally {
        delete this.getStored
      }
    } : function () {
      try {
        this.getStored = eYo.doNothing
        return get__m.call(this.owner_)
      } finally {
        delete this.getStored
      }
    }
  } else {
    eYo.isNA(get__m) || eYo.throw(`Bad model (${prototype.eyo.name}/${key}): unexpected get_ object`)
  }
  let set__m = model.set_
  if (set__m === eYo.doNothing || set__m === false) {
    prototype.setStored = eYo.noSetter(function () {
      return `Read only ${this.owner_.eyo.name}/${key}`
    })
  } else if (eYo.isF(set__m)) {
    prototype.setStored = set__m.length > 1 ? function (after) {
      try {
        this.setStored = eYo.doNothing
        return set__m.call(this.owner_, after => {this.__setStored(after)}, after)
      } finally {
        delete this.setStored
      }
    } : function (after) {
      try {
        this.setStored = eYo.doNothing
        return set__m.call(this.owner_, after)
      } finally {
        delete this.setStored
      }
    }
    prototype.resetValue || (prototype.resetValue = prototype.setStored)
  } else {
    eYo.isNA(set__m) || eYo.throw(`Bad model (${prototype.eyo.name}/${key}): unexpected set_ object.`)
    prototype.resetValue || (prototype.resetValue = prototype.setStored)
  }
}


// ANCHOR eYo.p6y.Base_p
/**
 * @name{eYo.p6y.Base_p}
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
  init (owner, key) {
    this.stored__ = eYo.NA // this may be useless in some situations
    Object.defineProperties(this, {
      value: eYo.descriptorR({
          lazy () {
            return `Unexpected setter ${key} in ${owner.eyo.key}'s instance property`
          },
        },
        eYo.p6y.Base_p.valueGetter
      ),
    })
  },
  dispose (...args) {
    this.disposeStored_(...args)
  },
  methods: {
    /**
     * Fallback to validate the value of the property;
     * Default implementation forwards to an eventual `fooValidate` method
     * of the owner, where `foo` should be replaced by the key of the receiver.
     * @param {Object} before
     * @param {Object} after
     */
    validate (before, after) {
      let f_o = this.key && this.owner_ && this.owner_[this.key + 'Validate']
      return eYo.isF(f_o) ? f_o.call(this.owner_, before, after) : after
    },
    /**
     * Object disposer.
     * Manage collections, takes care of ownership.
     * @param {Object} what
     */
    disposeStored__ (what, ...args) {
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
    },
    /**
     * Dispose of the stored object, if any.
     * Private method, overriden to `eYo.doNothing`
     * for objects that should not be disposed of.
     * 
     */
    disposeStored_ (...args) {
      let v = this.stored__
      if (eYo.isDef(v) && v.eyo && v.eyo_p6y === this) {
        try {
          this.disposeStored__(v, ...args)
        } finally {
          this.stored__ = eYo.NA
        }
      }
    },
    /**
     * recycle of the value.
     * @private
     */
    recycle (...args) {
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
    },
    /**
     * Set the value of the receiver.
     * This can be overriden by the model's `set` key.
     * @param {*} after - the new value after the change.
     */
    reset () {
      this.setValue(this.start())
    },
  },
})

eYo.p6y.enhanceO3dValidate('property', true)

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
      return this.owner_
    })
  })  
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
        let f_o = this.key && this.owner_ && this.owner_[this.key + When]
        eYo.isF(f_o) && f_o.call(this.owner_, before, after)
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
   * Get the stored value, lazily.
   * @private
   */
  _p.__getLazyStored = function () {
    delete this.getStored
    var ans = this.getStored()
    if (eYo.isNA(ans)) {
      this.setStored(ans = this.start())
    }
    return ans
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
    var before = this.getStored()
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
   * Iterator.
   */
  _p.ownedForEach = eYo.doNothing

}) ()

// ANCHOR eYo.p6y.List

/**
 * Maintains a list of properties.
 * `eYo.o4t.Base` instances maintains properties by keys.
 * Here properties are maintained by index.
 * @name{eYo.p6y.List}
 * @constructor
 */
eYo.c9r.makeC9r(eYo.p6y, 'List', {
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
    this.p6yByKey = new Proxy(this.list__, {
      get(target, prop) {
        if (eYo.isStr(prop)) {
          return target[prop]
        }
        throw new Error('`properties` attribute only accepts indexed accessors')
      }
    })
    this.propertyByIndex = new Proxy(this.list__, {
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
    items = items.map(item => eYo.p6y.new(this, '', {
      value: item
    }))
    this.list__.splice(start, 0, ...items)
    return ans
  }

}) ()

/**
 * The @@iterator method
 */
eYo.p6y.List.eyo_p.initInstance = function (object) {
  eYo.p6y.List.eyo.super.initInstance(object)
  object[Symbol.iterator] = function* () {
    for (var p of this.list__) {
      yield p.value
    }
  }
}

eYo.c9r._p.p6yEnhanced = function (model = {}) {
  eYo.isF(model.maker) || (model.maker = function (object, k, model) {
    return model.source
    ? object.eyo.aliasNew(object, k, ...model.source)
    : eYo.p6y.new(object, k, model)
  })
  eYo.isF(model.makeShortcuts) || (model.makeShortcuts = function (object, k, p) {
    let k_p = k + '_p'
    if (object.hasOwnProperty(k_p)) {
      console.error(`BREAK HERE!!! ALREADY object ${object.eyo.name}/${k_p}`)
    }
    Object.defineProperties(object, {
      [k_p]: eYo.descriptorR(function () {
        return p
      }),
    })
    object[k_p] || eYo.throw('Missing property')
    let _p = object.eyo.C9r_p
    _p.hasOwnProperty(k) || Object.defineProperties(_p, {
      [k]: eYo.descriptorR(function () {
        if (!this[k_p]) {
          console.error('TOO EARLY OR INAPPROPRIATE! BREAK HERE!')
        }
        return this[k_p].getValue()
      }),
      [k + '_']: {
        get: function () {
          return this[k_p].getStored()
        },
        set (after) {
          this[k_p].setValue(after)
        },
      },
    })
    return p
  })
  this.enhancedMany ('p6y', 'properties', model)
} 
