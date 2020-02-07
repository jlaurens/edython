/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.p6y is a class for a property controller.
 * It extends the JS property design by providing some hooks before, during and after changes, allowing observers to specific actions.
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

Object.defineProperties(eYo.p6y, {
  BEFORE: {value: 'willChange'},
  DURING: {value: 'atChange'},
  AFTER: {value: 'didChange'},
})

Object.defineProperties(eYo.p6y, {
  HOOKS: {
    value: [
      eYo.p6y.BEFORE,
      eYo.p6y.DURING,
      eYo.p6y.AFTER
    ]
  },
})

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
    this.handle_value(_p, model)
    this.handle_reset(_p, model)
    this.handle_dispose(_p, model)
    this.handle_validate(_p, model)
    this.handle_get_set(_p, model)
    this.handle_change(_p, model)
    this.handle_stored(_p, model)
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
 * @param {Object} model
 */
eYo.p6y._p.handle_value = function (prototype, model) {
  let f = model.value
  if (!eYo.isNA(f)) {
    eYo.isNA(model.lazy) || eYo.throw(`Bad model (${this.key}): unexpected lazy`)
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
 * @param {Object} model
 */
eYo.p6y._p.handle_reset = function (prototype, model) {
  let f = model.reset
  if (!eYo.isNA(f)) {
    if (!model.value && !model.lazy) {
      model.value = model.reset
      this.handle_value(prototype, model)
    }
    if (eYo.isF(f)) {
      prototype.reset = function () {
        try {
          this.reset = eYo.do.nothing
          this.setValue(f.call(this))
        } finally {
          this.reset = reset
        }    
      }
    } else {
      prototype.reset = function () {
        try {
          this.reset = eYo.do.nothing
          this.setValue(f) // further times
        } finally {
          this.reset = reset
        }    
      }
    }
  }
}

/**
 * Make the prototype's dispose method according to the model's object for key dispose.
 * @param {Object} prototype
 * @param {Object} model
 */
eYo.p6y._p.handle_dispose = function (prototype, model) {
  if (model.dispose === false) {
    prototype.disposeStored = eYo.do.nothing
  }
}

/**
 * make the prototype's validate method based on the model's object for key validate.
 * @param {Object} prototype
 * @param {Object} model
 */
eYo.p6y._p.handle_validate = function (prototype, model) {
  var f = model.validate
  if (eYo.isF(f)) {
    prototype.validate = f.length > 1
    ? function (before, after) {
      try {
        this.validate = eYo.do.nothing
        if (eYo.isVALID((after = f.call(this, before, after)))) {
          after = this.eyo.C9r_s.validate.call(this, before, after)
        } 
        return after
      } finally {
        delete this.validate
      }
    } : function (before, after) {
      try {
        this.validate = eYo.do.nothing
        if (eYo.isVALID((after = f.call(this, after)))) {
          after = this.eyo.C9r_s.validate.call(this, before, after)
        } 
        return after
      } finally {
        delete this.validate
      }
    }
  } else {
    f && eYo.throw(`Unexpected model value validate -> ${f}`)
  }
}

/**
 * make the prototype's getValue method based on the model.
 * make the prototype' setValue method based on the model.
 * @param {Object} prototype
 * @param {Object} model
 */
eYo.p6y._p.handle_get_set = function (prototype, model) {
  var can_lazy = true
  var computed = false
  if (model.copy) {
    model.get && eYo.throw(`Unexpected get`)
    prototype.getValue = eYo.p6y.Dflt_p.__getCopyValue
  } else {
    let get = model.get
    if (get === eYo.do.nothing) {
      can_lazy = false
      prototype.getValue = eYo.c9r.noGetter('Write only')
    } else if (eYo.isF(get)) {
      if (get.length > 0) {
        prototype.getValue = function () {
          try {
            this.getValue = eYo.do.nothing
            return get.call(this, () => {
              return eYo.p6y.Dflt_p.getValue.call(this)
            })
          } finally {
            delete this.getValue
          }
        }
      } else {
        // p6y with pure computed getter cannot be lazy nor started
        prototype.getValue = function () {
          try {
            this.getValue = eYo.do.nothing
            return get.call(this)
          } finally {
            delete this.getValue
          }
        }
        computed = true
        can_lazy = false
      }
    } else {
      get && eYo.throw(`Bad model (${this.key}): unexpected get -> ${get}`)
    }
  }
  let set = model.set
  if (set === eYo.do.nothing) {
    prototype.setValue = eYo.c9r.noSetter(`Read only key ${this.key}`)
  } else if (eYo.isF(set)) {
    prototype.setValue = set.length > 1 ? function (after) {
      try {
        this.setValue = eYo.do.nothing
        return set.call(this, after => {
          eYo.p6y.Dflt_p.setValue.call(this, after)
        }, after)
      } finally {
        delete this.setValue
      }
    } : function (after) {
      try {
        this.setValue = eYo.do.nothing
        return set.call(this, after)
      } finally {
        delete this.setValue
      }
    }
  } else {
    set && eYo.throw(`Bad model (${this.key}): unexpected set -> ${set}`)
    if (computed) {
      eYo.isNA(model.reset) || eYo.throw(`Bad model (${this.key}): unexpected reset`)
      prototype.setValue = eYo.c9r.noSetter(`Read only key ${this.key}`)
    }
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
    eYo.isNA(model.lazy) && eYo.isNA(model.value) || eYo.throw(`Bad model (${this.key}): unexpected value or lazy`)
  }
}

/**
 * make the prototype's change methods based on the model.
 * @param {Object} prototype
 * @param {Object} model
 */
eYo.p6y._p.handle_change = function (prototype, model) {
  eYo.p6y.HOOKS.forEach(when => {
    let f = model[when]
    if (eYo.isF(f)) {
      prototype[when] = f.length > 1
      ? function (before, after) {
        try {
          this[when] = eYo.do.nothing
          f.call(this, before, after)
          this.eyo.C9r_s[when].call(this, when, before, after)
        } finally {
          delete this[when]
        }
      } : function (before, after) {
        try {
          this[when] = eYo.do.nothing
          f.call(this, after)  
          this.eyo.C9r_s[when].call(this, when, before, after)
        } finally {
          delete this[when]
        }
      }
    } else {
      f && eYo.throw(`Unexpected model value ${when} -> ${f}`)
    }
  })
}

/**
 * make the prototype's getStored method based on the model `get_` function.
 * make the prototype's setStored method based on the model's `set_` function.
 * @param {Object} prototype
 * @param {Object} model
 */
eYo.p6y._p.handle_stored = function (prototype, model) {
  let get_ = model.get_
  if (get_ === eYo.do.nothing) {
    prototype.getStored = eYo.c9r.noGetter('Read only')
  } else if (eYo.isF(get_)) {
    prototype.getStored = get_.length > 0 ? function () {
      try {
        this.getStored = eYo.do.nothing
        return get_.call(this, () => { return this.__getStored()})
      } finally {
        delete this.getStored
      }
    } : function () {
      try {
        this.getStored = eYo.do.nothing
        return get_.call(this)
      } finally {
        delete this.getStored
      }
    }
  } else {
    eYo.isNA(get_) || eYo.throw(`Bad model (${this.key}): unexpected get_ object`)
  }
  let set_ = model.set_
  if (set_ === eYo.do.nothing) {
    prototype.setStored = eYo.c9r.noSetter('Read only')
  } else if (eYo.isF(set_)) {
    prototype.setStored = set_.length > 1 ? function (after) {
      try {
        this.setStored = eYo.do.nothing
        return set_.call(this, after => {this.__setStored(after)}, after)
      } finally {
        delete this.setStored
      }
    } : function (after) {
      try {
        this.setStored = eYo.do.nothing
        return set_.call(this, after)
      } finally {
        delete this.setStored
      }
    }
  } else {
    eYo.isNA(set_) || eYo.throw(`Bad model (${this.key}): unexpected set_ object.`)
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
    this.disposeStored()
    this.removeObservers()
    this.key_ = this.owner_ = this.model_ = eYo.NA
  },
})

;(() => {
  let _p = eYo.p6y.Dflt_p

  /**
   * Dispose of the stored object, if any.
   */
  _p.disposeStored = function () {
    let v = this.stored__
    if (v) {
      try {
        eYo.disposeObject(v)
      } catch (e) {
        console.error(`Failed to dispose of property ${this.key} of ${this.owner}`)
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
    let validator = this.owner && this.owner[this.key + 'Validate']
    if (eYo.isF(validator)) {
      after = validator.call(this, before, after)
    }
    return after
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
        let f = this.owner[this.key + When]
        eYo.isF(f) && f.call(this, before, after)
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
   * Add the observer
   * @param {Function} f - function ([before], after) => void. arguments must ont have another name. No `this` for the callback.
   * @param {String} when - One of 'before', 'during', 'after'
   * @return {*} The callback, to be used for removing the observer.
   */
  _p.addObserver = function (callback, when = eYo.p6y.AFTER) {
    eYo.parameterAssert(eYo.isF(callback))
    eYo.parameterAssert(eYo.p6y.HOOKS.includes(when))
    let byWhen = this.observersByWhen__ || (this.observersByWhen__ = {})
    let observers = byWhen[when] || (byWhen[when] = [])
    if (callback.length > 1) {
      observers.push(callback)
    } else {
      let wrapper = (before, after) => {
        callback.call(this, after)
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

