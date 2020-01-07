/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.Propertyerty is a class for a property controller.
 * It extends the JS property design by providing some hooks before and after changes.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.forwardDeclare('Do')
eYo.forwardDeclare('XRE')
eYo.forwardDeclare('Decorate')

{
  /**
   * Expands a property model.
   * @param {Object} model
   * @return {Object}
   */
  let modelHandler = (model) => {
    if (model['.initers']) {
      return
    }
    let initers = model['.initers'] = []
    ;['validate', 'willChange', 'atChange', 'didChange'].forEach(k => {
      var f = model[k]
      if (eYo.isF(f)) {
        if (!XRegExp.match(f.toString(), eYo.XRE.function_before)) {
          f = function (before, after) {
            f.call(this, after)
          }
        }
        f = eYo.Decorate.reentrant_method(k, f)
        initers.push(object => {
          object[k] = function (before, after) {
            try {
              this[k] = eYo.Do.nothing
              f.call(this, before, after)  
            } finally {
              delete this[k]
            }
          }
        })
      } else if (f) {
        throw new Error(`Unexpected model value ${k} -> ${f}`)
      }
    })
    var f = model.init
    if (eYo.isF(f)) {
      initers.push(object => {
        object.init = function () {
          try {
            this.init = eYo.Do.nothing
            this.setStored(f.call(this)) // first time
          } finally {
            this.init = function () {
              let old = this.init
              try {
                this.init = eYo.Do.nothing
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
              this.init = eYo.Do.nothing
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
      if (XRegExp.match(f.toString(), eYo.XRE.function_builtin)) {
        initers.push((object) => {
          let builtin = object.getValue.bind(object)
          object.getValue = function () {
            try {
              this.getValue = eYo.Do.nothing
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
              this.getValue = eYo.Do.nothing
              return f.call(this)
            } finally {
              delete this.getValue
            }
          }
        })
      }
    } else {
      eYo.parameterAssert(!f)
      if (model.lazy) {
        initers.push((object) => {
          object.getValue = function () {
            try {
              this.getValue = eYo.Do.nothing
              var ans = this.getStore()
              if (!eYo.isDef(ans)) {
                this.init() // possibly a second call
                ans = this.getStore()
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
      if (XRegExp.match(f.toString(), eYo.XRE.function_builtin_after)) {
        initers.push((object) => {
          let builtin = object.setValue.bind(object)
          object.setValue = function (after) {
            try {
              this.setValue = eYo.Do.nothing
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
              this.setValue = eYo.Do.nothing
              return f.call(this, after)
            } finally {
              delete this.setValue
            }
          }
        })
      }
    } else {
      eYo.parameterAssert(!f)
    }
    f = model.get_
    if (eYo.isF(f)) {
      if (XRegExp.match(f.toString(), eYo.XRE.function_builtin)) {
        initers.push((object) => {
          let builtin = object.getStored.bind(object)
          object.getStored = function () {
            try {
              this.getStored = eYo.Do.nothing
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
              this.getStored = eYo.Do.nothing
              return f.call(this)
            } finally {
              delete this.getStored
            }
          }
        })
      }
    } else {
      eYo.parameterAssert(!f)
    }
    f = model.set_
    if (eYo.isF(f)) {
      if (XRegExp.match(f.toString(), eYo.XRE.function_builtin_after)) {
        initers.push((object) => {
          let builtin = object.setStored.bind(object)
          object.setStored = function (after) {
            try {
              this.setStored = eYo.Do.nothing
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
              this.setStored = eYo.Do.nothing
              return f.call(this, after)
            } finally {
              delete this.setStored
            }
          }
        })
      }
    } else {
      eYo.parameterAssert(!f)
    }
    f = model.dispose
    if (model.dispose === false) {
      initers.push((object) => {
        object.disposeStored = eYo.Do.nothing
      })
    }
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
  eYo.C9r.makeClass('Prop', {
    init (owner, key, model) {
      eYo.parameterAssert(owner, 'Missing owner')
      eYo.parameterAssert(key, 'Missing key')
      eYo.parameterAssert(model, 'Missing model')
      this.owner_ = owner
      this.key_ = key
      this.model_ = model
      this.reentrant_ = Object.create(null)
      this.stored__ = eYo.NA
      Object.defineProperties(this, {
        value: eYo.descriptorR(
          `Unexpected setter ${key} in ${owner}'s property`,
          eYo.Property.prototype._getValue
        ),
        owner: eYo.descriptorR(
          `Unexpected ….owner = …, ${owner}'s property`,
          function () { return this.owner_ }
        ),
        owner: eYo.descriptorR(
          `Unexpected ….key = …, ${owner}'s property`,
          function () { return this.key_ }
        ),
        owner: eYo.descriptorR(
          `Unexpected ….model = …, ${owner}'s property`,
          function () { return this.model_ }
        ),
      })
      modelHandler(model)
      model['.initers'].forEach(f => f(this))
    },
    dispose () {
      this.disposeStored()
      this.removeObservers()
      this.reentrant_ = this.key_ = this.owner_ = this.model_ = eYo.NA
    },
  })
eYo.assert(eYo.C9r.Prop)
  let _p = eYo.C9r.Prop.prototype

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
   * Initialize the value of the property.
   */
  _p.init = function () {
    let f = this.model_.init
    if (f) {
      try {
        this.init = eYo.Do.nothing
        this.value__ = eYo.whenVALID(f.call(this))
      } finally {
        delete this.init
        if (!eYo.isDef(this.value__)) {
          console.error('THIS SHOULD BE DEFINED', this.key_)
        }
      }
    }
  }

  /**
   * Validates the value of the property
   * Forwards to the model.
   * @param {Object} after
   */
  _p.validate = function (before, after) {
    var f = this.model_.validate
    if (f) {
      try {
        this.validate = eYo.nothing
        return f.call(this, before, after)
      } finally {
        delete this.validate
      }
    }
    return after
  }
  
  let change = (k) => {
    return function (before, after) {
      var f = this.model_[k]
      if (f) {
        try {
          this[k] = eYo.nothing
          f.call(this, before, after)
          return true
        } finally {
          delete this[k]
        }
      }
    }
  }
  /**
   * Before changing the value of the property.
   * The signature is `willChange([before], after) → Boolean`
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return {Boolean} true when performed
   */
  _p.beforeChange = change('willChange')

  /**
   * When changing the value of the property.
   * The signature is `atChange( [before], after ) → Boolean`
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return {Boolean} true when performed
   */
  _p.duringChange = change('atChange')

  /**
   * Did change the value of the property.
   * The signature is `didChange( [before], after ) → Boolean`
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return {Boolean} true when performed
   */
  _p.afterChange = change('didChange')

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
    return this.getStore()
  }

  /**
   * Get the stored value. May be overriden by the model.
   * @private
   */
  _p.getStored = function () {
    return stored__
  }

  /**
   * Set the value of the receiver.
   * This can be overriden by the model.
   * @param {*} after - the new value after the change.
   */
  _p.setValue = function (after) {
    var f = this.model.set
    if (f) {
      try {
        this.setValue = eYo.Do.nothing
        f.call(after)
      } finally {
        delete this.setValue
      }
    } else {
      after = this.validate(after)
      if (eYo.isVALID(after)) {
        var before = this.value__
        if (before !== after) {
          this.beforeChange(before, after)
          try {
            this.setStored(after)
            this.duringChange(before, after)
          } finally {
            this.afterChange(before, after)
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
    var f = this.model.set_
    if (f) {
      try {
        this.setStored = eYo.Do.nothing
        f.call(after)
      } finally {
        delete this.setValue
      }
    } else {
      this.stored__ = after
    }
  }

  Object.defineProperties(eYo.Property, {
    BEFORE: {value: '.before'},
    DURING: {value: '.during'},
    AFTER: {value: '.after'},
  })

  /**
   * Add the observer
   * @param {Function} f - function ([before], after) => void. arguments must ont have another name. No `this` for the callback.
   * @param {String} when - One of 'before', 'during', 'after'
   * @return {*} The callback, to be used for removing the observer.
   */
  _p.addObserver = function (callback, when = eYo.Property.AFTER) {
    eYo.parameterAssert(eYo.isF(callback))
    eYo.parameterAssert([eYo.Property.BEFORE, eYo.Property.DURING, eYo.Property.AFTER].includes(when))
    let byWhen = this.observersByWhen__ || (this.observersByWhen__ = {})
    let observers = byWhen[when] || (byWhen[when] = [])
    if (!XRegExp.match(callback.toString(), eYo.XRE.function_before)) {
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
    eYo.parameterAssert(!callback || eYo.isF(callback))
    eYo.parameterAssert(!when || [eYo.Property.BEFORE, eYo.Property.DURING, eYo.Property.AFTER].includes(when))
    let byWhen = this.observersByWhen__
    if (byWhen) {
      if (when) {
        let observers = byWhen[when]
        if (observers) {
          byWhen[when] = observers.filter(x => x !== callback && x.eyo !== callback)
        }
      } else {
        [eYo.Property.BEFORE, eYo.Property.DURING, eYo.Property.AFTER].forEach(when => {
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
      [eYo.Property.BEFORE, eYo.Property.DURING, eYo.Property.AFTER].forEach(when => {
        let observers = byWhen[when]
        if (observers) {
          observers.length = 0
        }  
      })
    }
  }
}
