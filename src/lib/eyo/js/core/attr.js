/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.attr is a class for a property controller.
 * It extends the JS property design by providing some hooks before, during and after changes, allowing observers to specify actions.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('do')

eYo.forward('xre')

// ANCHOR eYo.attr
/**
 * @name{eYo.attr}
 * @namespace
 */
eYo.c9r.makeNS(eYo, 'attr', {
  BEFORE: 'willChange',
  DURING: 'atChange',
  AFTER: 'didChange',
})

Object.defineProperties(eYo.attr._p, {
  HOOKS: {
    value: [
      eYo.attr.BEFORE,
      eYo.attr.DURING,
      eYo.attr.AFTER
    ]
  },
})

// ANCHOR eYo.attr.Base_p
/**
 * @name{eYo.attr.Base_p}
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
eYo.attr.makeBase({
  init (owner, key) {
    owner || eYo.throw(`${this.eyo.name}: Missing owner in init`)
    if (!eYo.isStr(key)) {
      console.error('BREAK HERE!!!')
    }
    eYo.isStr(key) || eYo.throw(`${this.eyo.name}: Missing key in init`)
    this.owner_ = owner
    this.key_ = key
    Object.defineProperties(this, {
      owner: eYo.descriptorR(function () {
        return this.owner_
      }),
      key: eYo.descriptorR(function () {
        return this.key_
      }),
    })
  },
  dispose () {
    this.removeObservers()
    this.key_ = this.owner_ = eYo.NA
  },
})

;(() => {
  let _p = eYo.attr._p.Base_p

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
  eYo.attr.HOOKS.forEach(when => {
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
   * Add the observer
   * @param {Function} f - function ([before], after) => void. arguments must ont have another name. No `this` for the callback.
   * @param {String} when - One of 'before', 'during', 'after'
   * @return {*} The callback, to be used for removing the observer.
   */
  _p.addObserver = function (callback, when = eYo.attr.AFTER) {
    eYo.isF(callback) || eYo.throw(`Callback must be a function, got ${callback}`)
    eYo.attr.HOOKS.includes(when) || eYo.throw(`Unexpected when, got ${when}`)
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
    !when || eYo.attr.HOOKS.includes(when) || eYo.throw(`removeObserver: bad when ${when}`)
    let byWhen = this.observersByWhen__
    if (byWhen) {
      if (when) {
        let observers = byWhen[when]
        if (observers) {
          byWhen[when] = observers.filter(x => x !== callback && x.eyo_observer !== callback)
        }
      } else {
        eYo.attr.HOOKS.forEach(when => {
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
      eYo.attr.HOOKS.forEach(when => {
        let observers = byWhen[when]
        if (observers) {
          observers.length = 0
        }  
      })
    }
  }
  /**
   * Fire the observers.
   * @param {*} when - One of `eYo.attr.BEFORE`, `eYo.attr.DURING`, `eYo.attr.AFTER`, specifies when the observers are fired.
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
