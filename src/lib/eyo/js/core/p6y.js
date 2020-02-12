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

/**
 * Object disposer.
 * @param {Object} what
 */
eYo.p6y._p.disposeObject = function (what) {
  if (what) {
    if (what.eyo) {
      eYo.isF(what.dispose) && what.dispose()
    } else if (eYo.isRA(what)) {
      try {
        what.forEach(this.disposeObject)
      } finally {
        what.length = 0
      }
    } else {
      Object.keys(what).forEach(k => {
        if (what.hasOwnProperty(k)) {
          this.disposeObject(what[k])
        }
      })
    }
  }
}

// ANCHOR eYo.p6y.new
/**
 * Create a new property based on the model
 * 
 */
eYo.p6y._p.new = function (owner, key, model) {
  if (!model.C9r) {
    model.C9r = this.makeC9r(eYo.NULL_NS)
    model._starters = []
    let _p = model.C9r.prototype
    this.handle_value(_p, key, model)
    this.handle_dispose(_p, key, model)
    this.handle_validate(_p, key, model)
    this.handle_get_set(_p, key, model)
    this.handle_change(_p, key, model)
    this.handle_stored(_p, key, model)
    this.handle_reset(_p, key, model) // must be last
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
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.handle_value = function (prototype, key, model) {
  let f = model.value
  if (!eYo.isNA(f)) {
    eYo.isNA(model.lazy) || eYo.throw(`Bad model (${key}): unexpected lazy`)
    prototype.start = eYo.isF(f) ? f : function () {
      return f
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
eYo.p6y._p.handle_reset = function (prototype, key, model) {
  let reset_m = model.reset
  if (!eYo.isNA(reset_m)) {
    if (!model.value && !model.lazy) {
      model.value = model.reset
      this.handle_value(prototype, key, model)
    }
    if (eYo.isF(reset_m)) {
      prototype.reset = function () {
        try {
          this.reset = eYo.do.nothing
          this.resetValue(reset_m.call(this.owner))
        } finally {
          delete this.reset
        }    
      }
    } else {
      prototype.reset = function () {
        try {
          this.reset = eYo.do.nothing
          this.resetValue(reset_m)
        } finally {
          delete this.reset
        }    
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
eYo.p6y._p.handle_dispose = function (prototype, key, model) {
  if (model.dispose === false) {
    prototype.disposeStored_ = eYo.do.nothing
  }
}

/**
 * make the prototype's validate method based on the model's object for key validate.
 * The prototype may inherit a validate method.
 * Changing the ancestor prototype afterwards is not a good idea.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.handle_validate = function (prototype, key, model) {
  let validate_m = model.validate
  let validate_s = prototype.eyo.C9r_s.validate
  if (eYo.isF(validate_m)) {
    prototype.validate = validate_m.length > 1
    ? validate_s
      ? function (before, after) {
        try {
          this.validate = eYo.do.nothing
          if (eYo.isVALID((after = validate_m.call(this.owner, before, after)))) {
            after = validate_s.call(this, before, after)
          } 
          return after
        } finally {
          delete this.validate
        }
      } : function (before, after) {
        try {
          this.validate = eYo.do.nothing
          return validate_m.call(this.owner, before, after)
        } finally {
          delete this.validate
        }
      }
    : validate_s
      ? function (before, after) {
        try {
          this.validate = eYo.do.nothing
          if (eYo.isVALID((after = validate_m.call(this.owner, after)))) {
            after = validate_s.call(this, before, after)
          }
          return after
        } finally {
          delete this.validate
        }
      } : function (before, after) {
        try {
          this.validate = eYo.do.nothing
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
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.handle_get_set = function (prototype, key, model) {
  var can_lazy = true
  var computed = false // true iff get and set are given with no builtin dependency
  let get_m = model.get // from model => suffix = '_m' and `@this` == property owner
  if (model.copy) {
    model.get && eYo.throw(`Unexpected get`)
    prototype.getValue = eYo.p6y.Dflt_p.__getCopyValue
  } else {
    if (get_m === eYo.do.nothing || get_m === false) {
      can_lazy = false
      prototype.getValue = eYo.c9r.noGetter('Write only')
    } else if (eYo.isF(get_m)) {
      if (get_m.length > 0) {
        prototype.getValue = function () {
          try {
            this.getValue = eYo.do.nothing
            return get_m.call(this.owner, () => {
              return prototype.getValue.call(this)
            })
          } finally {
            delete this.getValue
          }
        }
      } else {
        // p6y with pure computed getter cannot be lazy
        prototype.getStored = prototype.getValue = function () {
          try {
            this.getValue = eYo.do.nothing
            return get_m.call(this.owner)
          } finally {
            delete this.getValue
          }
        }
        computed = true
        can_lazy = false
      }
    } else {
      eYo.isNA(get_m) || eYo.throw(`Bad model (${key}): unexpected get -> ${get_m}`)
    }
  }
  let set_m = model.set // from model => suffix = '_m' and `@this` == property owner
  if (set_m === eYo.do.nothing || set_m === false) {
    prototype.setValue = eYo.c9r.noSetter(`Read only key ${key}`)
  } else if (eYo.isF(set_m)) {
    if (set_m.length > 1) {
      !computed || eYo.throw(`Bad model (${key}): Unexpected 'builtin' in set`)
      prototype.setValue = prototype.resetValue = function (after) {
        try {
          this.setValue = eYo.do.nothing
          return set_m.call(this.owner, after => {
            prototype.setValue.call(this, after)
          }, after)
        } finally {
          delete this.setValue
        }
      }
    } else {
      computed || eYo.throw(`Bad model (${key}): Missing 'builtin' in set`)
      prototype.setStored = prototype.setValue = prototype.resetValue = function (after) {
        try {
          this.setValue = eYo.do.nothing
          return set_m.call(this.owner, after)
        } finally {
          delete this.setValue
        }
      }
    }
  } else {
    set_m && eYo.throw(`Bad model (${key}): unexpected set -> ${set_m}`)
    if (computed) {
      eYo.isNA(model.reset) || eYo.throw(`Bad model (${key}): unexpected reset`)
      prototype.setStored = prototype.setValue = eYo.c9r.noSetter(`Read only key ${key}`)
    }
  }
  if (computed) {
    prototype.dispose = eYo.do.nothing
  }
  if (can_lazy) {
    let f = model.lazy
    if (!eYo.isNA(f)) {
      model._starters.push(object => {
        object.getValue = Object.getPrototypeOf(object).__getLazyValue
      })
      prototype.start = eYo.isF(f) ? f : function () {
        return f
      }
    }
  } else {
    eYo.isNA(model.lazy) && eYo.isNA(model.value) || eYo.throw(`Bad model (${key}): unexpected value or lazy`)
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
eYo.p6y._p.handle_change = function (prototype, key, model) {
  eYo.p6y.HOOKS.forEach(when => {
    let when_m = model[when]
    let when_s = prototype.eyo.C9r_s[when]
    if (eYo.isF(when_m)) {
      prototype[when] = when_m.length > 1
      ? when_s
        ? function (before, after) {
          try {
            this[when] = eYo.do.nothing
            when_m.call(this.owner, before, after)
            when_s.call(this, when, before, after)
          } finally {
            delete this[when]
          }
        } : function (before, after) {
          try {
            this[when] = eYo.do.nothing
            when_m.call(this.owner, before, after)
          } finally {
            delete this[when]
          }
        }
      : when_s
        ? function (before, after) {
          try {
            this[when] = eYo.do.nothing
            when_m.call(this.owner, after)  
            when_s.call(this, when, before, after)
          } finally {
            delete this[when]
          }
        } : function (before, after) {
          try {
            this[when] = eYo.do.nothing
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
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y._p.handle_stored = function (prototype, key, model) {
  let get__m = model.get_
  if (get__m === eYo.do.nothing || get__m === false) {
    prototype.getStored = eYo.c9r.noGetter('Read only')
  } else if (eYo.isF(get__m)) {
    prototype.getStored = get__m.length > 0 ? function () {
      try {
        this.getStored = eYo.do.nothing
        return get__m.call(this.owner, () => { return this.__getStored()})
      } finally {
        delete this.getStored
      }
    } : function () {
      try {
        this.getStored = eYo.do.nothing
        return get__m.call(this.owner)
      } finally {
        delete this.getStored
      }
    }
  } else {
    eYo.isNA(get__m) || eYo.throw(`Bad model (${key}): unexpected get_ object`)
  }
  let set__m = model.set_
  if (set__m === eYo.do.nothing || set__m === false) {
    prototype.setStored = eYo.c9r.noSetter('Read only')
  } else if (eYo.isF(set__m)) {
    prototype.setStored = set__m.length > 1 ? function (after) {
      try {
        this.setStored = eYo.do.nothing
        return set__m.call(this.owner, after => {this.__setStored(after)}, after)
      } finally {
        delete this.setStored
      }
    } : function (after) {
      try {
        this.setStored = eYo.do.nothing
        return set__m.call(this.owner, after)
      } finally {
        delete this.setStored
      }
    }
    prototype.resetValue || (prototype.resetValue = prototype.setStored)
  } else {
    eYo.isNA(set__m) || eYo.throw(`Bad model (${key}): unexpected set_ object.`)
    prototype.resetValue || (prototype.resetValue = prototype.setStored)
  }
}

// ANCHOR eYo.p6y.Dflt
/**
 * @name{eYo.p6y.Dflt}
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
eYo.p6y.makeDflt({
  init (owner, key, model) {
    owner || eYo.throw('Missing owner')
    eYo.isStr(key) || eYo.throw('Missing key')
    eYo.isNA(model) && eYo.throw('Missing model')
    this.owner_ = owner
    this.key_ = key
    this.model_ = model
    this.stored__ = eYo.NA // this may be useless in some situations
    Object.defineProperties(this, {
      value: eYo.c9r.descriptorR(
        `Unexpected setter ${key} in ${owner}'s instance property`,
        eYo.p6y.Dflt_p.valueGetter
      ),
      owner: eYo.c9r.descriptorR(
        `Unexpected ….owner = …, ${owner}'s instance property`,
        function () { return this.owner_ }
      ),
      key: eYo.c9r.descriptorR(
        `Unexpected ….key = …, ${owner}'s instance property`,
        function () { return this.key_ }
      ),
      model: eYo.c9r.descriptorR(
        `Unexpected ….model = …, ${owner}'s property`,
        function () { return this.model_ }
      ),
    })
  },
  dispose () {
    this.disposeStored_()
    this.removeObservers()
    this.key_ = this.owner_ = this.model_ = eYo.NA
  },
})

;(() => {
  let _p = eYo.p6y.Dflt_p

  /**
   * Dispose of the stored object, if any.
   * Private property overriden to `eYo.do.nothing` for objects that should not override.
   */
  _p.disposeStored_ = function () {
    let v = this.stored__
    if (v) {
      try {
        (this.eyo.ns || eYo.p6y).disposeObject(v)
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
        this[when] = eYo.do.nothing
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
  _p.start = eYo.do.nothing

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
   * @param {*} after - the new value after the change.
   */
  _p.setStored = _p.__setStored = function (after) {
    this.stored__ = after
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
      this.getValue = eYo.do.nothing
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
      this.getValue = eYo.do.nothing
      var ans = eYo.p6y.Dflt_p.getValue.call(this)
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
      wrapper.eyo = callback
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
    eYo.parameterAssert(!callback || eYo.isF(callback))
    eYo.parameterAssert(!when || eYo.p6y.HOOKS.includes(when))
    let byWhen = this.observersByWhen__
    if (byWhen) {
      if (when) {
        let observers = byWhen[when]
        if (observers) {
          byWhen[when] = observers.filter(x => x !== callback && x.eyo !== callback)
        }
      } else {
        eYo.p6y.HOOKS.forEach(when => {
          let observers = byWhen[when]
          if (observers) {
            byWhen[when] = observers.filter(x => x !== callback && x.eyo !== callback)
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

}) ()

