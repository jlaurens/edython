/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Utility to add methods or attributes to objects related to observation.
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

eYo.mixinR(eYo.observe._p, {
  HOOKS: [
    eYo.observe.BEFORE,
    eYo.observe.DURING,
    eYo.observe.AFTER,
    eYo.observe.ANY,
  ],
})
//<<< mochai: Basics
//... chai.assert(eYo.observe)
//... eYo.observe.HOOKS.forEach(s => chai.expect(s).eyo_Str)
//>>>
eYo.observe.makeBaseC9r({
  /**
   * Object containing information for observation.
   * @param {String} [when] - One of the observe HOOKS
   * @param {Object} [$this | eYo.Observe] - Self explanatory
   * @param {Function} [f] - function ([before], after) => void. arguments must ont have another name.
   */
  init (when, $this, callback) {
    this.when = when
    this.$this = $this
    this.callback_ = callback
  },
  dispose () {
    this.$this = this.callback = this.when = eYo.NA
  },
  methods: {
    /**
     * 
     * @param {Object} before
     * @param {Object} after
     */
    callback (before, after) {
      let f = this.callback_.length > 1
      ? function (before, after) {
        this.callback_.call(this.$this, before, after)
      } : function (before, after) {
        this.callback_.call(this.$this, after)
      }
      this.callback = f
      f.call(this, before, after)
    }
  },
})

eYo.mixinR(false, eYo.observe, {
  /**
   * @param {String} [when] - One of the observe HOOKS
   * @param {Object} [$this | eYo.observe.BaseC9r] - Self explanatory
   * @param {Function} [f] - function ([before], after) => void. arguments must ont have another name.
   */
  new (when, $this, callback) {
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
  },
})

eYo.dlgt.BaseC9r_p.observeEnhanced = function () {
  //<<< mochai: ...observeEnhanced
  //<<< mochai: Basics
  //... let ns = eYo.c9r.makeNS()
  //... ns.makeBaseC9r()
  //... ns.BaseC9r.eyo.observeEnhanced()
  //... let o = ns.new()
  //... chai.expect(o.willChange).eyo_F
  //... chai.expect(o.atChange).eyo_F
  //... chai.expect(o.didChange).eyo_F
  //... chai.expect(o.addObserver).eyo_F
  //... chai.expect(o.removeObserver).eyo_F
  //... chai.expect(o.removeObservers).eyo_F
  //... chai.expect(o.fireObservers).eyo_F
  //>>>
  let _p = this.C9r_p
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
    //<<< mochai: (will|at|did)Change
    //... let ns = eYo.c9r.makeNS()
    //... ns.makeBaseC9r()
    //... ns.BaseC9r.eyo.observeEnhanced()
    //... for (let [k, v] of Object.entries({
    //...   [eYo.observe.BEFORE]: [123, 0, 0,],
    //...   [eYo.observe.DURING]: [0, 123, 0,],
    //...   [eYo.observe.AFTER] : [0, 0, 123,],
    //... })) {
    //...   let o = ns.new()
    //...   o.addObserver(k, function (before, after) {
    //...     flag.push(1, before, after)
    //...   })
    //...   o.willChange(2, 3)
    //...   flag.expect(v[0])
    //...   o.atChange(2, 3)
    //...   flag.expect(v[1])
    //...   o.didChange(2, 3)
    //...   flag.expect(v[2])
    //... }
    //... for (let [k, v] of Object.entries({
    //...   [eYo.observe.BEFORE]: [123456, 123, 123],
    //...   [eYo.observe.DURING]: [123, 123456, 123],
    //...   [eYo.observe.AFTER] : [123, 123, 123456,],
    //... })) {
    //...   let o = ns.new()
    //...   o.addObserver(eYo.observe.ANY, function (before, after) {
    //...     flag.push(1, before, after)
    //...   })
    //...   o.addObserver(k, function (before, after) {
    //...     flag.push(4, 3+before, 3+after)
    //...   })
    //...   o.willChange(2, 3)
    //...   flag.expect(v[0])
    //...   o.atChange(2, 3)
    //...   flag.expect(v[1])
    //...   o.didChange(2, 3)
    //...   flag.expect(v[2])
    //... }
    //>>>
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
    //<<< mochai: addObserver
    let observer = eYo.observe.new(when, $this, callback)
    when = observer.when
    let byWhen = this.observersByWhen__ || (this.observersByWhen__ = {})
    let observers = byWhen[when] || (byWhen[when] = [])
    observers.push(observer)
    return observer
    //... let ns = eYo.c9r.makeNS()
    //... ns.makeBaseC9r()
    //... ns.BaseC9r.eyo.observeEnhanced()
    //... let o = ns.new()
    //... let observer1 = o.addObserver(eYo.observe.BEFORE, function (before, after) {
    //...   flag.push(1, before + 1, after + 1)
    //... })
    //... let observer2 = o.addObserver(eYo.observe.BEFORE, function (before, after) {
    //...   flag.push(4, before+4, after+4)
    //... })
    //... o.willChange(1, 2)
    //... flag.expect(123456)
    //... o.removeObserver(observer1)
    //... o.willChange(1, 2)
    //... flag.expect(456)
    //... o.addObserver(observer1)
    //... o.willChange(1, 2)
    //... flag.expect(456123)
    //... o.removeObservers()
    //... o.willChange(1, 2)
    //... flag.expect()
    //>>>
  }
  /**
   * Remove the given observer.
   * @param {*} observer - Private object obtained from a previous call to `addObserver`.
   * @return {*} The observer, to be used for adding the observer again.
   */
  _p.removeObserver = function (observer) {
    //<<< mochai: removeObserver
    let byWhen = this.observersByWhen__
    if (byWhen) {
      let observers = byWhen[observer.when]
      if (observers) {
        byWhen[observer.when] = observers.filter(x => x !== observer)
      }
    }
    return observer
        //... let ns = eYo.c9r.makeNS()
    //... ns.makeBaseC9r()
    //... ns.BaseC9r.eyo.observeEnhanced()
    //... let o = ns.new()
    //... let observer = o.addObserver(eYo.observe.BEFORE, function (before, after) {
    //...   flag.push(1, before, after)
    //... })
    //... o.willChange(2, 3)
    //... flag.expect(123)
    //... o.removeObserver(observer)
    //... o.willChange(2, 3)
    //... flag.expect()
    //... o.addObserver(observer)
    //... o.willChange(2, 3)
    //... flag.expect(123)
    //... let after = o.addObserver(eYo.observe.AFTER, observer)
    //... o.willChange(2, 3)
    //... flag.expect(123)
    //... o.didChange(3, 5)
    //... flag.expect(135)
    //... o.removeObserver(observer)
    //... o.willChange(2, 3)
    //... flag.expect()
    //... o.didChange(3, 5)
    //... flag.expect(135)
    //>>>
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
  //>>>
}
