/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Utility to add methors or attributes to objects.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.forward('do')

/**
 * @name{eYo.observe}
 * @namespace
 */
eYo.c9r.makeNS(eYo, 'observe', {
  BEFORE: 'willChange',
  DURING: 'atChange',
  AFTER: 'didChange',
  ANY: 'anyChange',
})

Object.defineProperties(eYo.observe._p, {
  HOOKS: {
    value: [
      eYo.observe.BEFORE,
      eYo.observe.DURING,
      eYo.observe.AFTER,
      eYo.observe.ANY,
    ]
  },
})

eYo.observe.makeBaseC9r({
  /**
   * @param {String} [when] - One of the observe HOOKS
   * @param {Object} [$this | eYo.observe.BaseC9r] - Self explanatory
   * @param {Function} [f] - function ([before], after) => void. arguments must ont have another name.
   */
  init (when, $this, callback) {
    this.when = when
    this.$this = $this
    this.callback_ = callback
  },
  dispose () {
    this.$this = this.callback = this.when = eYo.NA
  }
})

/**
 * @param {String} [when] - One of the observe HOOKS
 * @param {Object} [$this | eYo.observe.BaseC9r] - Self explanatory
 * @param {Function} [f] - function ([before], after) => void. arguments must ont have another name.
 */
eYo.observe.new = function (when, $this, callback) {
  if (!eYo.observe.HOOKS.includes(when)) {
    eYo.isDef(callback) && eYo.throw(`${this.eyo.name}/addObserver: Too many arguments ${callback}`)
    ;[when, $this, callback] = [eYo.NA, when, $this]
  }
  if ($this instanceof eYo.observe.BaseC9r) {
    eYo.isDef(callback) && eYo.throw(`${this.eyo.name}/addObserver: Too many arguments ${callback}`)
    if (!eYo.isDef(when) || when === $this.when) {
      return $this
    }
    return new eYo.observe.BaseC9r(when, $this.$this, $this.callback_)
  }
  if (eYo.isF($this)) {
    eYo.isDef(callback) && eYo.throw(`${this.eyo.name}: unexpected (last?) parameter, got ${callback}`)
    ;[$this, callback] = [eYo.NA, $this]
  } else {
    eYo.isF(callback) || eYo.throw(`Callback must be a function, got ${callback}`)
  }
  (!when && (when = eYo.observe.AFTER)) || eYo.observe.HOOKS.includes(when) || eYo.throw(`Unexpected when, got ${when}`)
  return new eYo.observe.BaseC9r(when, $this, callback)
}
/**
 * 
 * @param {Object} before
 * @param {Object} after
 */
eYo.observe.BaseC9r_p.callback = function (before, after) {
  let f = this.callback_.length > 1
  ? function (before, after) {
    this.callback_.call(this.$this, before, after)
  } : function (before, after) {
    this.callback_.call(this.$this, after)
  }
  this.callback = f
  f.call(this, before, after)
}

eYo.observe.enhance = function (eyo) {
  eyo instanceof eYo.dlgt.BaseC9r || eYo.throw(`Bad parameter: and eYo.dlgt.BaseC9r instance was expected, got ${eyo}`)
  let _p = eyo.C9r_p
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
  ;[
    eYo.observe.BEFORE,
    eYo.observe.DURING,
    eYo.observe.AFTER,
  ].forEach(when => {
    let When = eYo.do.toTitleCase(when)
    _p[when] = function (before, after) {
      try {
        this[when] = eYo.doNothing
        let o = this.owner
        if (o) {
          var f_o = o[this.key + When]
          eYo.isF(f_o) && f_o.call(o, before, after)
          f_o = this.Id && o[this.key + this.Id + When]
          eYo.isF(f_o) && f_o.call(o, before, after)
        }
        this.fireObservers(eYo.observe.ANY, before, after)
        this.fireObservers(when, before, after)
      } finally {
        delete this[when]
      }
    }
  })

  /**
   * Add the observer.
   * The observer is a bound method.
   * @param {String} [when] - One of the observe HOOKS
   * @param {Object || eYo.observe.BaseC9r} [$this] - Self explanatory
   * @param {Function} [f] - function ([before], after) => void. arguments must ont have another name. Must not be provided, when the first argument is an observer.
   * @return {*} Private structure, to be used for removing the observer.
   */
  _p.addObserver = function (when, $this, callback) {
    let observer = eYo.observe.new(when, $this, callback)
    when = observer.when
    let byWhen = this.observersByWhen__ || (this.observersByWhen__ = {})
    let observers = byWhen[when] || (byWhen[when] = [])
    observers.push(observer)
    return observer
  }

  /**
   * Remove the given observer.
   * @param {*} observer - Private object obtained from a previous call to `addObserver`.
   * @return {*} The observer, to be used for adding the observer again.
   */
  _p.removeObserver = function (observer) {
    let byWhen = this.observersByWhen__
    if (byWhen) {
      let observers = byWhen[observer.when]
      if (observers) {
        byWhen[observer.when] = observers.filter(x => x !== observer)
      }
    }
    return observer
  }

  /**
   * Remove all the observers.
   */
  _p.removeObservers = function () {
    let byWhen = this.observersByWhen__
    if (byWhen) {
      eYo.observe.HOOKS.forEach(when => {
        let observers = byWhen[when]
        if (observers) {
          observers.length = 0
        }  
      })
    }
  }
  /**
   * Fire the observers.
   * @param {*} when - One of `eyo.observe.BEFORE`, `eyo.observe.DURING`, `eyo.observe.AFTER`, specifies when the observers are fired.
   * @param {*} before - the value before
   * @param {*} after - the value after
   */
  _p.fireObservers = function (when, before, after) {
    try {
      this.fireObservers = eYo.doNothing // do not reenter
      this.eyo.C9r_p_down.forEach(_p => {
        let byWhen = _p.observersByWhen__
        if (byWhen) {
          let observers = byWhen[when]
          observers && observers.forEach(observer => observer.callback(before, after))
        }
      })
      let byWhen = this.hasOwnProperty('observersByWhen__') && this.observersByWhen__
      if (byWhen) {
        let observers = byWhen[when]
        observers && observers.forEach(observer => observer.callback(before, after))
      }
    } finally {
      delete this.fireObservers
    }
  }
}
