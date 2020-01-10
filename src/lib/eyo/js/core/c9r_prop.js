/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.c9r.Property is a class for a property controller.
 * It extends the JS property design by providing some hooks before and after changes.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.forwardDeclare('do')
eYo.forwardDeclare('xre')
eYo.forwardDeclare('decorate')

Object.defineProperties(eYo.c9r, {
  BEFORE: {value: 'willChange'},
  DURING: {value: 'atChange'},
  AFTER: {value: 'didChange'},
})

Object.defineProperties(eYo.c9r, {
  CHANGE_HOOKS: {value: [eYo.c9r.BEFORE, eYo.c9r.DURING, eYo.c9r.AFTER]},
})

/**
 * Expands a property model.
 * @param {Object} model
 * @return {Object}
 */
eYo.c9r.PropModelHandler = (model) => {
  if (model['.initers']) {
    return
  }
  let initers = model['.initers'] = []
  eYo.c9r.CHANGE_HOOKS.forEach(when => {
    var f = model[when]
    if (eYo.isF(f)) {
      initers.push(XRegExp.match(f.toString(), eYo.xre.function_before)
      ? object => {
        object[when] = function (before, after) {
          let old = this[when]
          try {
            this[when] = eYo.do.nothing
            f.call(this, before, after)
            this.fireObservers(when, before, after)
          } finally {
            this[when] = old
          }
        }
      } : object => {
        object[when] = function (before, after) {
          let old = this[when]
          try {
            this[when] = eYo.do.nothing
            f.call(this, after)  
            this.fireObservers(when, before, after)
          } finally {
            this[when] = old
          }
        }
      })
    } else if (f) {
      throw new Error(`Unexpected model value ${when} -> ${f}`)
    } else {
      initers.push(object => {
        object[when] = function (before, after) {
          let old = this[when]
          try {
            this[when] = eYo.do.nothing
            this.fireObservers(when, before, after)
          } finally {
            this[when] = old
          }
        }
      })
    }
  })
  var f = model.validate
  if (eYo.isF(f)) {
    initers.push(XRegExp.match(f.toString(), eYo.xre.function_before)
    ? object => {
      object.validate = function (before, after) {
        let old = this.validate
        try {
          this.validate = eYo.do.nothing
          f.call(this, before, after)  
        } finally {
          this.validate = old
        }
      }
    } : object => {
      object.validate = function (before, after) {
        let old = this.validate
        try {
          this.validate = eYo.do.nothing
          f.call(this, after)  
        } finally {
          this.validate = old
        }
      }
    })
  } else if (f) {
    throw new Error(`Unexpected model value ${k} -> ${f}`)
  }
  var f = model.init
  if (eYo.isF(f)) {
    initers.push(object => {
      object.init = function () {
        try {
          this.init = eYo.do.nothing
          this.setStored(f.call(this)) // first time
        } finally {
          this.init = function () {
            let old = this.init
            try {
              this.init = eYo.do.nothing
              this.setValue(f.call(this)) // further times
            } finally {
              this.init = old
            }    
          }
        }
      }
    })
  } else if (eYo.isDef(f)) {
    initers.push(object => {
      object.init = function () {
        this.setStored(f)
        this.init = function () {
          let old = this.init
          try {
            this.init = eYo.do.nothing
            this.setValue(f) // further times
          } finally {
            this.init = old
          }    
        }
      }
    })
  }
  f = model.get
  if (eYo.isF(f)) {
    if (XRegExp.match(f.toString(), eYo.xre.function_builtin)) {
      initers.push((object) => {
        let builtin = object.getValue.bind(object)
        object.getValue = function () {
          try {
            this.getValue = eYo.do.nothing
            return f.call(this, builtin)
          } finally {
            delete this.getValue
          }
        }
      })
    } else {
      initers.push((object) => {
        object.getValue = function () {
          try {
            this.getValue = eYo.do.nothing
            return f.call(this)
          } finally {
            delete this.getValue
          }
        }
      })
    }
  } else {
    eYo.ParameterAssert(!f)
    if (model.lazy) {
      initers.push((object) => {
        object.getValue = function () {
          try {
            this.getValue = eYo.do.nothing
            var ans = this.getStored()
            if (!eYo.isDef(ans)) {
              this.init() // possibly a second call
              ans = this.getStored()
            }
            return ans
          } finally {
            delete this.getValue
          }
        }
      })
    }
  }
  f = model.set
  if (eYo.isF(f)) {
    if (XRegExp.match(f.toString(), eYo.xre.function_builtin_after)) {
      initers.push((object) => {
        let builtin = object.setValue.bind(object)
        object.setValue = function (after) {
          try {
            this.setValue = eYo.do.nothing
            return f.call(this, builtin, after)
          } finally {
            delete this.setValue
          }
        }
      })
    } else {
      initers.push((object) => {
        object.setValue = function (after) {
          try {
            this.setValue = eYo.do.nothing
            return f.call(this, after)
          } finally {
            delete this.setValue
          }
        }
      })
    }
  } else {
    eYo.ParameterAssert(!f)
  }
  f = model.get_
  if (eYo.isF(f)) {
    if (XRegExp.match(f.toString(), eYo.xre.function_builtin)) {
      initers.push((object) => {
        let builtin = object.getStored.bind(object)
        object.getStored = function () {
          try {
            this.getStored = eYo.do.nothing
            return f.call(this, builtin)
          } finally {
            delete this.getStored
          }
        }
      })
    } else {
      initers.push((object) => {
        object.getStored = function () {
          try {
            this.getStored = eYo.do.nothing
            return f.call(this)
          } finally {
            delete this.getStored
          }
        }
      })
    }
  } else {
    eYo.ParameterAssert(!f)
  }
  f = model.set_
  if (eYo.isF(f)) {
    if (XRegExp.match(f.toString(), eYo.xre.function_builtin_after)) {
      initers.push((object) => {
        let builtin = object.setStored.bind(object)
        object.setStored = function (after) {
          try {
            this.setStored = eYo.do.nothing
            return f.call(this, builtin, after)
          } finally {
            delete this.setStored
          }
        }
      })
    } else {
      initers.push((object) => {
        object.setStored = function (after) {
          try {
            this.setStored = eYo.do.nothing
            return f.call(this, after)
          } finally {
            delete this.setStored
          }
        }
      })
    }
  } else {
    eYo.ParameterAssert(!f)
  }
  f = model.dispose
  if (model.dispose === false) {
    initers.push((object) => {
      object.disposeStored = eYo.do.nothing
    })
  }
}

/**
 * @name {eYo.c9r.DlgtProp}
 * @constructor
 */
eYo.c9r.Dlgt.makeSubclass('DlgtProp')

eYo.c9r.DlgtProp_p.makeValidate = function () {
}

/**
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
eYo.c9r.makeClass('Prop', eYo.c9r.DlgtProp, {
  init (owner, key, model) {
    eYo.ParameterAssert(owner, 'Missing owner')
    eYo.ParameterAssert(key, 'Missing key')
    eYo.ParameterAssert(model, 'Missing model')
    this.owner_ = owner
    this.key_ = key
    this.model_ = model
    this.reentrant_ = Object.create(null)
    this.stored__ = eYo.NA
    Object.defineProperties(this, {
      value: eYo.c9r.descriptorR(
        `Unexpected setter ${key} in ${owner}'s property`,
        eYo.c9r.Prop.prototype._getValue
      ),
      owner: eYo.c9r.descriptorR(
        `Unexpected ….owner = …, ${owner}'s property`,
        function () { return this.owner_ }
      ),
      owner: eYo.c9r.descriptorR(
        `Unexpected ….key = …, ${owner}'s property`,
        function () { return this.key_ }
      ),
      owner: eYo.c9r.descriptorR(
        `Unexpected ….model = …, ${owner}'s property`,
        function () { return this.model_ }
      ),
    })
    eYo.c9r.PropModelHandler(model)
    model['.initers'].forEach(f => f(this))
  },
  dispose () {
    this.disposeStored()
    this.removeObservers()
    this.reentrant_ = this.key_ = this.owner_ = this.model_ = eYo.NA
  },
})
eYo.Assert(eYo.c9r.Prop)

;(() => {
  let _p = eYo.c9r.Prop.prototype

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
   * @property {*} value - computed
   */
  Object.defineProperties(_p, {
    value_: {
      get: _p._getValue,
      set (after) {
        this.setValue(after)
      }
    },
    value__: {
      get: _p._getValue,
      set (after) {
        this.setStored(after)
      }
    },
  })

  /**
   * Fallback to validate the value of the property;
   * Default implementation just returns `after`.
   * @param {Object} before
   * @param {Object} after
   */
  _p.validate = function (before, after) {
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
  eYo.c9r.CHANGE_HOOKS.forEach(when => {
    _p[when] = function (before, after) {
      try {
        this[when] = eYo.do.nothing
        this.fireObservers(when, before, after)
      } finally {
        delete this[when]
      }
    }
  })

  /**
   * Used multiple times.
   * @private
   */
  _p._getValue = function () {
    return this.getValue()
  }

  /**
   * Get the value, may be overriden by the model.
   * @private
   */
  _p.getValue = function () {
    return this.getStored()
  }

  /**
   * Get the stored value. May be overriden by the model.
   * @private
   */
  _p.getStored = function () {
    return this.stored__
  }

  /**
   * Set the value of the receiver.
   * This can be overriden by the model.
   * @param {*} after - the new value after the change.
   */
  _p.setValue = function (after) {
    var f = this.model_.set
    if (f) {
      try {
        this.setValue = eYo.do.nothing
        f.call(after)
      } finally {
        delete this.setValue
      }
    } else {
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
  }

  /**
   * Set the value of the receiver.
   * This can be overriden by the model.
   * @param {*} after - the new value after the change.
   */
  _p.setStored = function (after) {
    var f = this.model_.set_
    if (f) {
      try {
        this.setStored = eYo.do.nothing
        f.call(after)
      } finally {
        delete this.setValue
      }
    } else {
      this.stored__ = after
    }
  }

  /**
   * Add the observer
   * @param {Function} f - function ([before], after) => void. arguments must ont have another name. No `this` for the callback.
   * @param {String} when - One of 'before', 'during', 'after'
   * @return {*} The callback, to be used for removing the observer.
   */
  _p.addObserver = function (callback, when = eYo.c9r.AFTER) {
    eYo.ParameterAssert(eYo.isF(callback))
    eYo.ParameterAssert(eYo.c9r.CHANGE_HOOKS.includes(when))
    let byWhen = this.observersByWhen__ || (this.observersByWhen__ = {})
    let observers = byWhen[when] || (byWhen[when] = [])
    if (!XRegExp.match(callback.toString(), eYo.xre.function_before)) {
      let wrapper = (before, after) => {
        callback.call(this, after)
      }
      wrapper.eyo = callback
      observers.push(wrapper)
    } else {
      observers.push(callback)
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
    eYo.ParameterAssert(!callback || eYo.isF(callback))
    eYo.ParameterAssert(!when || eYo.c9r.CHANGE_HOOKS.includes(when))
    let byWhen = this.observersByWhen__
    if (byWhen) {
      if (when) {
        let observers = byWhen[when]
        if (observers) {
          byWhen[when] = observers.filter(x => x !== callback && x.eyo !== callback)
        }
      } else {
        eYo.c9r.CHANGE_HOOKS.forEach(when => {
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
      eYo.c9r.CHANGE_HOOKS.forEach(when => {
        let observers = byWhen[when]
        if (observers) {
          observers.length = 0
        }  
      })
    }
  }

  /**
   * Fire the observers.
   * @param {*} when - One of `eYo.c9r.BEFORE`, `eYo.c9r.DURING`, `eYo.c9r.AFTER`
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
