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
eYo.c3s.newNS(eYo, 'observe', {
  BEFORE: 'willChange',
  DURING: 'atChange',
  AFTER: 'didChange',
  ANY: 'anyChange',
})

eYo.mixinRO(eYo.observe._p, {
  HOOKS: [
    eYo.observe.BEFORE,
    eYo.observe.DURING,
    eYo.observe.AFTER,
    eYo.observe.ANY,
  ],
})
eYo.mixinFR(eYo.observe._p, {
  newKV (when, $this, callback) {
    if (when instanceof eYo.KV) {
      return when
    }
    if (!eYo.observe.HOOKS.includes(when)) {
      eYo.isDef(callback) && eYo.throw(`${this.name}/newKV: Too many arguments ${callback} (1)`)
      ;[when, $this, callback] = [eYo.NA, when, $this]
    }
    if ($this instanceof eYo.KV) {
      eYo.isDef(callback) && eYo.throw(`${this.name}/newKV: Too many arguments ${callback} (2)`)
      if (!eYo.isDef(when) || when === $this.when) {
        return $this
      }
      [$this, callback] = [$this.$this, $this.callback_]
    } else if (eYo.isF($this)) {
      eYo.isDef(callback) && eYo.throw(`${this.name}/newKV: Too many arguments ${callback} (3)`)
      ;[$this, callback] = [eYo.NA, $this]
    }
    return new eYo.KV({when, $this, callback})
  },
  newKVObserver (when, $this, callback) {
    if (when instanceof eYo.KV) {
      return when
    }
    var observer
    if (when instanceof eYo.Observe) {
      observer = when
    } else if ($this instanceof eYo.Observe) {
      if (!when || when === $this.when) {
        observer = $this
      } else {
        observer = eYo.observe.new(when, $this.$this, $this.callback)
      }
    } else {
      observer = eYo.observe.new(when, $this, callback)
    }
    return eYo.kv.new({observer})
  },
})
//<<< mochai: Basics
//... chai.assert(eYo.observe)
//... eYo.observe.HOOKS.forEach(s => chai.expect(s).eyo_Str)
//>>>
eYo.observe.makeBaseC3s({
  /**
   * Object containing information for observation.
   * @param {String} [when] - One of the observe HOOKS
   * @param {Object} [$this | eYo.Observe] - Self explanatory
   * @param {Function} [f] - function ([before], after) => void. arguments must ont have another name.
   */
  prepare (kv) {
    this.when = kv.when || eYo.observe.AFTER
    this.$this = kv.$this
    this.callback = kv.callback.bind(kv.$this)
  },
  dispose () {
    this.when = this.$this = this.callback_ = eYo.NA
  },
})

eYo.mixinFR(eYo.observe, {
  /**
   * @param {eYo.KV || eYo.Observe} kv
   * @param [kv.when] - One of the observe HOOKS
   * @param {eYo.Observe} [kv.observe] - Self explanatory
   * @param {Object} [kv.$this] - Self explanatory
   * @param {Function} kv.callback - function (kv) => void.
   */
  new (kv, ...$) {
    if (!(kv instanceof eYo.KV)) {
      kv = eYo.observe.newKV(kv, ...$)
    }
    return new eYo.Observe(kv)
  },
})

eYo.dlgt.BaseC3s_p.observeEnhanced = {observeEnhanced () {
  //<<< mochai: ../observeEnhanced
  //<<< mochai: Basics
  //... let ns = eYo.c3s.newNS()
  //... ns.makeBaseC3s()
  //... ns.BaseC3s$.observeEnhanced()
  //... let o = ns.new()
  //... chai.expect(o.willChange).eyo_F
  //... chai.expect(o.atChange).eyo_F
  //... chai.expect(o.didChange).eyo_F
  //... chai.expect(o.addObserver).eyo_F
  //... chai.expect(o.removeObserver).eyo_F
  //... chai.expect(o.removeObservers).eyo_F
  //... chai.expect(o.fireObservers).eyo_F
  //>>>
  let _p = this.C3s_p
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
    _p[when] = function (kv) {
      try {
        this[when] = eYo.doNothing
        let o = this.owner
        if (o) {
          var f_o = o[this.key + When]
          eYo.isF(f_o) && f_o.call(o, kv)
          f_o = this.Id && o[this.key + this.Id + When]
          eYo.isF(f_o) && f_o.call(o, kv)
        }
        this.fireObservers(eYo.observe.ANY, kv)
        this.fireObservers(when, kv)
      } finally {
        delete this[when]
      }
    }
    //<<< mochai: (will|at|did)Change
    //... let ns = eYo.c3s.newNS()
    //... ns.makeBaseC3s()
    //... ns.BaseC3s[eYo.$].observeEnhanced()
    //... for (let [k, v] of Object.entries({
    //...   [eYo.observe.BEFORE]: ['1$kv', 0, 0,],
    //...   [eYo.observe.DURING]: [0, '1$kv', 0,],
    //...   [eYo.observe.AFTER] : [0, 0, '1$kv',],
    //... })) {
    //...   let o = ns.new()
    //...   o.addObserver(k, function (kv) {
    //...     eYo.flag.push(1, kv)
    //...   })
    //...   o.willChange(eYo.test.kv)
    //...   eYo.flag.expect(v[0])
    //...   o.atChange(eYo.test.kv)
    //...   eYo.flag.expect(v[1])
    //...   o.didChange(eYo.test.kv)
    //...   eYo.flag.expect(v[2])
    //... }
    //... for (let [k, v] of Object.entries({
    //...   [eYo.observe.BEFORE]: ['1$kv2$kv', '1$kv', '1$kv'],
    //...   [eYo.observe.DURING]: ['1$kv', '1$kv2$kv', '1$kv'],
    //...   [eYo.observe.AFTER] : ['1$kv', '1$kv', '1$kv2$kv',],
    //... })) {
    //...   let o = ns.new()
    //...   o.addObserver(eYo.observe.ANY, function (kv) {
    //...     eYo.flag.push(1, kv)
    //...   })
    //...   o.addObserver(k, function (kv) {
    //...     eYo.flag.push(2, kv)
    //...   })
    //...   o.willChange(eYo.test.kv)
    //...   eYo.flag.expect(v[0])
    //...   o.atChange(eYo.test.kv)
    //...   eYo.flag.expect(v[1])
    //...   o.didChange(eYo.test.kv)
    //...   eYo.flag.expect(v[2])
    //... }
    //>>>
  })
  /**
   * addObserver: Add the given observer.
   * @param {*} observer 
   */
  /**
   * addObserver: Add the given for the `when` hook.
   * @param {*} when 
   * @param {*} observer 
   */
  /**
   * addObserver
   * @param {*} when 
   * @param {*} $this 
   * @param {*} callback 
   */
  /**
   * Add the observer.
   * When the first parameter is not n observer, the arguments are the same as `eYo.observe.new`
   */
  _p.addObserver = function (...$) {
    let observer = eYo.observe.newKVObserver(...$).observer
    //<<< mochai: addObserver
    let when = observer.when
    let byWhen = this.observersByWhen__ || (this.observersByWhen__ = {})
    let observers = byWhen[when] || (byWhen[when] = [])
    observers.push(observer)
    return observer
    //... let ns = eYo.c3s.newNS()
    //... ns.makeBaseC3s()
    //... ns.BaseC3s[eYo.$].observeEnhanced()
    //... let o = ns.new()
    //... let before1 = o.addObserver(eYo.observe.BEFORE, function (kv) {
    //...   eYo.flag.push(1, kv)
    //... })
    //... let before2 = o.addObserver(eYo.observe.BEFORE, function (kv) {
    //...   eYo.flag.push(2, kv)
    //... })
    //... o.willChange(eYo.test.kv)
    //... eYo.flag.expect('1$kv2$kv')
    //... o.removeObserver(before1)
    //... o.willChange(eYo.test.kv)
    //... eYo.flag.expect('2$kv')
    //... o.addObserver(before1)
    //... o.willChange(eYo.test.kv)
    //... eYo.flag.expect('2$kv1$kv')
    //... o.removeObservers()
    //... o.willChange(eYo.test.kv)
    //... eYo.flag.expect()
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
    //... let ns = eYo.c3s.newNS()
    //... ns.makeBaseC3s()
    //... ns.BaseC3s[eYo.$].observeEnhanced()
    //... let o = ns.new()
    //... let before = o.addObserver(eYo.observe.BEFORE, function (kv) {
    //...   eYo.flag.push('o', kv)
    //... })
    //... var will = eYo.kv.new({$: 'will'})
    //... var did = eYo.kv.new({$: 'did'})
    //... o.willChange(will)
    //... eYo.flag.expect('o$will')
    //... o.removeObserver(before)
    //... o.willChange(will)
    //... eYo.flag.expect()
    //... o.addObserver(before)
    //... o.willChange(will)
    //... eYo.flag.expect('o$will')
    //... let after = o.addObserver(eYo.observe.AFTER, before)
    //... o.willChange(will)
    //... eYo.flag.expect('o$will')
    //... o.didChange(did)
    //... eYo.flag.expect('o$did')
    //... o.removeObserver(before)
    //... o.willChange(will)
    //... eYo.flag.expect()
    //... o.didChange(did)
    //... eYo.flag.expect('o$did')
    //>>>
  }
  /**
   * Remove all the observers.
   */
  _p.removeObservers = function () {
    //<<< mochai: removeObservers
    let byWhen = this.observersByWhen__
    if (byWhen) {
      eYo.observe.HOOKS.forEach(when => {
        let observers = byWhen[when]
        if (observers) {
          observers.length = 0
        }  
      })
    }
    //... for (let [k, v] of Object.entries({
    //...   [eYo.observe.BEFORE]: ['1$kv2$kv', 0, 0],
    //...   [eYo.observe.DURING]: [0, '1$kv2$kv', 0],
    //...   [eYo.observe.AFTER] : [0, 0, '1$kv2$kv',],
    //... })) {
    //...   let ns = eYo.c3s.newNS()
    //...   ns.makeBaseC3s()
    //...   ns.BaseC3s[eYo.$].observeEnhanced()
    //...   let o = ns.new()
    //...   let observer1 = o.addObserver(k, function (kv) {
    //...     eYo.flag.push(1, kv)
    //...   })
    //...   let observer2 = o.addObserver(k, function (kv) {
    //...     eYo.flag.push(2, kv)
    //...   })
    //...   o.willChange(eYo.test.kv)
    //...   eYo.flag.expect(v[0])
    //...   o.atChange(eYo.test.kv)
    //...   eYo.flag.expect(v[1])
    //...   o.didChange(eYo.test.kv)
    //...   eYo.flag.expect(v[2])
    //...   o.removeObservers()
    //...   o.willChange(eYo.test.kv)
    //...   eYo.flag.expect()
    //...   o.atChange(eYo.test.kv)
    //...   eYo.flag.expect()
    //...   o.didChange(eYo.test.kv)
    //...   eYo.flag.expect()
    //... }
    //>>>
  }
  /**
   * Fire the observers.
   * @param {*} when - One of `eyo.observe.BEFORE`, `eyo.observe.DURING`, `eyo.observe.AFTER`, specifies when the observers are fired.
   * @param {*} before - the value before
   * @param {*} after - the value after
   */
  _p.fireObservers = function (when, kv) {
    try {
      this.fireObservers = eYo.doNothing // do not reenter
      this.eyo$.C3s_p_down.forEach(_p => {
        let byWhen = _p.observersByWhen__
        if (byWhen) {
          let observers = byWhen[when]
          observers && observers.forEach(observer => observer.callback(kv))
        }
      })
      let byWhen = eYo.objectHasOwnProperty(this, 'observersByWhen__') && this.observersByWhen__
      if (byWhen) {
        let observers = byWhen[when]
        observers && observers.forEach(observer => observer.callback(kv))
      }
    } finally {
      delete this.fireObservers
    }
  }
  //>>>
}}.observeEnhanced
