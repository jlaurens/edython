/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate. Do nothing driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name {eYo.driver}
 * @namespace
 */
eYo.o4t.makeNS(eYo, 'driver')
//<<< mochai: Basics
//... chai.assert(eYo.driver)
//>>>

eYo.c9r.makeC9r(eYo.driver, 'Handler', {
  //<<< mochai: eYo.driver.Handler
  /**
   * @param {String} key - the name of the driver, eg 'Audio'
   * @param {eYo.Driver} driver - the main driver
   * @param {eYo.Driver} alt - the alternate driver
   */
  init (key, driver, alt) {
    //<<< mochai: init
    key === driver.key || eYo.throw(`${this.eyo.name}/init: Missing ${key} === ${driver.key}`)
    this.__key = key
    this.__driver = driver
    this.__alt = alt
    this.cache = new Map()
    //>>>
  },
  dispose () {
    this.cache.clear()
    this.cache = eYo.NA
  },
  methods: {
    //<<< mochai: methods
    apply (target, thisArg, argumentsList) {
      eYo.throw(`${target.eyo.name} instances are not callable.`)
    },
    construct(target, args) {
      eYo.throw(`${target.eyo.name} instances are not constructors.`)
    },
    defineProperty(target, key, descriptor) {
      eYo.throw(`${target.eyo.name} instances are frozen (no defineProperty).`)
    },
    deleteProperty(target, prop) {
      eYo.throw(`${target.eyo.name} instances are frozen (no deleteProperty).`)
    },
    //<<< mochai: frozen or forbidden
    //... let driver = new eYo.O4t('driver', onr)
    //... let alt = new eYo.O4t('alt', onr)
    //... let handler = new eYo.driver.Handler(driver.key, driver, alt)
    //... let p = new Proxy(driver, handler)
    //... chai.expect(() => p()).throw()
    //... chai.expect(() => new p()).throw()
    //... chai.expect(() => p.defineProperty()).throw()
    //... chai.expect(() => p.deleteProperty()).throw()
    //>>>
    get (target, prop, receiver) {
      //<<< mochai: get
      //... let driver = eYo.o4t.new({
      //...   methods: {
      //...     do_it_1 (...$) {
      //...       flag.push(1, ...$)  
      //...     },
      //...     do_it_2 (...$) {
      //...       flag.push(2, ...$)  
      //...     },
      //...   },
      //... }, 'driver', onr)
      //... let alt = eYo.o4t.new({
      //...   methods: {
      //...     do_it_2 (...$) {
      //...       flag.push(...$, 5)  
      //...     },
      //...   },
      //... }, 'alt', onr)
      //... let handler = new eYo.driver.Handler(driver.key, driver, alt)
      //... let p = new Proxy(driver, handler)
      if (prop === '__driver') {
        return this.__driver
      }
      //... chai.expect(p.__driver).equal(driver)
      if (prop === '__alt') {
        return this.__alt
      }
      //... chai.expect(p.__alt).equal(alt)
      var ans = this.cache.get(prop)
      if (ans) {
        return ans
      }
      ans = Reflect.get(...arguments)
      if (eYo.isF(ans)) { // cache functions
        var alt = Reflect.get(this.__alt, prop)
        var ans_f = eYo.isF(alt)
        ? function (...$) {
          alt.call(target, ...$)
          return ans.call(target, ...$)
        } : ans
        this.cache.set(prop, ans_f)
        return ans_f
      }
      return ans
      //... driver.do_it_1(2, 3)
      //... flag.expect(123)
      //... chai.expect(handler.cache.get('do_it_1')).undefined
      //... var ans = p.do_it_1
      //... chai.expect(ans).equal(driver.do_it_1)
      //... chai.expect(ans).equal(handler.cache.get('do_it_1'))
      //... ans.call(this, 2, 3)
      //... flag.expect(123)
      //... p.do_it_1(2, 3)
      //... flag.expect(123)
      //... p.do_it_2(3, 4)
      //... flag.expect(345234)
      //>>>
    },
    getOwnPropertyDescriptor(target, prop) {
      return Object.getOwnPropertyDescriptor(target, prop) || Object.getOwnPropertyDescriptor(this.__alt, prop)
    },
    getPrototypeOf(target) {
      return Object.getPrototypeOf(target)
    },
    has(target, key) {
      return key in target
    },  
    isExtensible(target) {
      return Reflect.isExtensible(target)
    },
    ownKeys(target) {
      return Reflect.ownKeys(target)
    },
    preventExtensions(target) {
      return Reflect.preventExtensions(target)
    },
    set(target, prop, value) {
      //<<< mochai: set
      return Reflect.set(...arguments)
      //... let driver = new eYo.O4t('driver', onr)
      //... let alt = new eYo.O4t('alt', onr)
      //... let handler = new eYo.driver.Handler(driver.key, driver, alt)
      //... let p = new Proxy(driver, handler)
      //... chai.expect(() => p.foo = 'bar').throw()
      //>>>
    },
    setPrototypeOf(target, proto) {
      return false
    },
    //>>>
  },
  //>>>
})
eYo.driver.Handler.eyo.finalizeC9r()

/**
 * @name {eYo.driver.BaseC9r}
 * Default convenient driver, to be subclassed.
 * @param {Object} owner
 * @property {eYo.driver.Mgt} mngr,  the owning driver manager
 */
eYo.driver.makeBaseC9r({
  //<<< mochai: eYo.Driver
  //<<< mochai: Basics
  //... var drvr = new eYo.Driver('foo', onr)
  //... chai.assert(drvr)
  //... chai.expect(drvr.initUI).eyo_F
  //... chai.expect(drvr.disposeUI).eyo_F
  //>>>
  properties: {
    //<<< mochai: properties
    mngr: {
      //<<< mochai: mngr
      /**
       * @property{Object} mngr - the manager of a driver is the owner
       */
      get () {
        return this.owner
      },
      //... let drvr = new eYo.Driver('foo', onr)
      //... chai.expect(drvr.mngr).equal(onr)
      //>>>
    },
    //>>>
  },
  methods: {
    //<<< mochai: methods
    /**
     * Dispose the UI.
     * Default implementation does nothing.
     * @param {*} object
     * @return {Boolean}
     */
    doInitUI (unused) {
      //<<< mochai: doInitUI
      return true
      //... let drvr = new eYo.Driver('foo', onr)
      //... chai.expect(drvr.doInitUI(1, 2, 3)).true
      //>>>
    },
    /**
     * Dispose of the UI.
     * Default implementation does nothing.
     * @param {*} object
     * @return {Boolean}
     */
    doDisposeUI (unused) {
      //<<< mochai: doDisposeUI
      return true
      //... let drvr = new eYo.Driver('foo', onr)
      //... chai.expect(drvr.doDisposeUI(1, 2, 3)).true
      //>>>
    },
    //>>>
  },
  //>>>
})

/**
 * @name {eYo.driver.mngr}
 * Default driver manager.
 * Owns instances of `eYo.Driver`'s descendants.
 * @param {Object} owner
 */
eYo.c9r.makeSingleton(eYo.driver, 'mngr', {
  //<<< mochai: eYo.driver.mngr
  //<<< mochai: Basics
  //... chai.expect(eYo.driver).property('mngr')
  //>>>
  //... var mngr = eYo.driver.mngr
  properties: {
    //<<< mochai: properties
    driverC9rs: {
      //<<< mochai: driverC9rs
      value () {
        return new Map()
      }
      //... chai.expect(mngr.driverC9rs_p).instanceof(eYo.P6y)
      ///... chai.expect(mngr.driverC9rs).instanceof(Map)
      //>>>
    },
    drivers: {
      //<<< mochai: drivers
      value () {
        return new Map()
      },
      //... chai.expect(mngr.drivers_p).instanceof(eYo.P6y)
      //... chai.expect(mngr.drivers).instanceof(Map)
      //>>>
    },
    allPurposeDriver: {
      //<<< mochai: allPurposeDriver
      value () {
        let target = new this.eyo.ns.BaseC9r ('allPurposeDriver', this)
        let handler = {
          get (target, prop) {
            if (prop === '__target') {
              return target
            }
            if (prop in target) {
              return target[prop]
            }
            var ans = target[prop]
            if (ans) {
              return ans
            }
            if (prop === 'eyo_p6y') {
              return eYo.NA
            }
            if (prop === 'inspect') {
              return eYo.NA
            }
            if (prop === Symbol.toStringTag) {
              return eYo.NA
            }
            eYo.throw(`Missing driver property named ${prop.toString()} in object ${target}`)
          },
          set (target, prop, value) {
            if (prop in target) {
              target[prop] = value
              return true
            }
            if (prop === 'eyo_p6y') {
              target[prop] = value
              return true
            }
            eYo.throw(`Missing driver property named ${prop} in object ${target}`)
          }
        }
        return new Proxy(target, handler)
      },
      //... let driver = mngr.allPurposeDriver
      //... chai.expect(driver.__target).instanceof(eYo.Driver)
      //... chai.expect(() => driver[eYo.genUID(eYo.IDENT)]).throw()
      //>>>
    },
    //>>>
  },
  methods: {
    //<<< mochai: methods
    /**
     * Usage: `eYo.driver.mngr.makeDriverC9r('Foo', model)`.
     * Actual implementation with fcls, fcfl, dom and svg drivers.
     * {Code: ns.mngr} is used by the main application object.
     * Convenient driver constructor maker.
     * The prototype will have eventually an `doInitUI` or `doDisposeUI`
     * wrapping the model's eponym methods, if any.
     * The owner will have a dafault driver named `Base`,
     * which is expected to be the ancestor of all drivers.
     * @param {String} key - a (titlecased) word, the name of the subclass (last component)
     * @param {Function} [SuperC9r] - the super class of the driver constructor,
     * defaults to the owner's super_'s key property or the owner's `Base`.
     * @param {Object} driverModel
     * An object with various keys:
     * - owner: An object owning the class, basically a namespace object.
     * If the owner is `Foo` and the key is 'Bar', the created constructor
     * is `Foo.Bar`. Actually used with `eYo` as owner, 'dom' or 'svg' as key.
     * - doInitUI: an optional function with signature (object, ...)->eYo.NA
     * - doDisposeUI: an optional function with signature (object)->eYo.NA
     */
    makeDriverC9r (key, SuperC9r, driverModel) {
      //<<< mochai: makeDriverC9r
      //... var NS = eYo.driver.makeNS()
      //... NS.makeMngr()
      //... NS.mngr.makeDriverC9r('Foo')
      //... chai.expect(NS.Foo).eyo_C9r
      //... var foo = new NS.Foo('foo', onr)
      //... chai.assert(foo.doInitUI)
      //... chai.expect(foo.doInitUI()).true
      //... foo.disposeUI()
      var NS = this.ns
      if (!eYo.isSubclass(SuperC9r, eYo.Driver)) {
        driverModel && eYo.throw(`${this.eyo.name}/makeDriverC9r: Unexpected model (${driverModel})`)
        ;[SuperC9r, driverModel] = [NS.super[key] || NS.BaseC9r, eYo.called(SuperC9r) || {}]
      }
      if (!eYo.isSubclass(SuperC9r, NS.BaseC9r)) {
        //... var NS = eYo.driver.makeNS()
        //... NS.makeBaseC9r({
        //...   methods: {
        //...     chi (...$) {
        //...       flag.push(1, ...$)
        //...     }
        //...   }
        //... })
        //... NS.makeMngr()
        //... NS.mngr.makeDriverC9r('Bar', {
        //...   methods: {
        //...     foo (...$) {
        //...       flag.push(4, ...$)
        //...     }
        //...   }
        //... })
        //... NS.makeNS('a')
        //... NS.a.makeBaseC9r({
        //...   methods: {
        //...     mee (...$) {
        //...       flag.push(7, ...$)
        //...     }
        //...   }
        //... })
        //... NS.a.makeMngr()
        //... NS.a.mngr.makeDriverC9r('Bar')
        //... var bar = new NS.a.Bar('bar', onr)
        //... bar.chi(2, 3)
        //... bar.foo(5, 6)
        //... bar.mee(8, 9)
        //... flag.expect(123456789)
        if (driverModel) {
          eYo.provideR(driverModel, NS.BaseC9r.eyo.model)
        } else {
          driverModel = NS.BaseC9r.eyo.model
        }
      }
      let Driver = eYo.c9r.makeC9r(NS, key, SuperC9r, driverModel)
      let ui_m = this.model.ui
      let ui_d = Driver.eyo.model.ui
      eYo.mixinR(false, Driver.prototype, {
        doInitUI (...$) {
          let ans = SuperC9r.prototype.doInitUI.call(this, ...$)
          var f = ui_m && ui_m.initMake
          var ff = ui_d && ui_d.doInit
          f = (f && f(ff)) || ff
          return f ? f.call(this, ...$) && ans: ans
        },
        doDisposeUI (...$) {
          var f = ui_m && ui_m.disposeMake
          var ff = ui_d && ui_d.doDispose
          f = (f && f(ff)) || ff
          var ans = !!f && f.call(this, ...$)
          return SuperC9r.prototype.doDisposeUI.call(this, ...$) && ans
        },
      })
      Driver.eyo.finalizeC9r()
      var x = Driver.eyo.name.split('.')
      x.shift()
      x = x.join('.') // 'eYo.foo.bar' -> 'foo.bar'
      this.driverC9rMap.set(x, Driver)
      return Driver
      //... var id = eYo.genUID(eYo.IDENT)
      //... var x = `driver.${id}`
      //... var D1 = mngr.makeDriverC9r(id)
      //... var Drvr = mngr.getDriverC9r(x)
      //... chai.expect(D1).equal(Drvr)
      //... var drvr = mngr.getDriver(x)
      //... chai.expect(drvr).instanceOf(Drvr)
      //... var id = eYo.genUID(eYo.IDENT)
      //... var x = `driver.${id}`
      //... var D2 = mngr.makeDriverC9r(id, D1)
      //... var Drvr = mngr.getDriverC9r(x)
      //... chai.expect(D2).equal(Drvr)
      //... var drvr = mngr.getDriver(x)
      //... chai.expect(drvr).instanceOf(D1)
      //... chai.expect(drvr).instanceOf(D2)
      //... var id = eYo.genUID(eYo.IDENT)
      //... var x = `driver.${id}`
      //... mngr.makeDriverC9r(id, {
      //...   ui: {
      //...     doInit (onr, ...$) {
      //...       onr.flag(2, ...$)
      //...     }
      //...   }
      //... })
      //... var drvr = mngr.getDriver(x)
      //... drvr.doInitUI(onr, 3, 4)
      //... flag.expect(1234)
      //... var id = eYo.genUID(eYo.IDENT)
      //... var x = `driver.${id}`
      //... mngr.makeDriverC9r(id, {
      //...   ui: {
      //...     doDispose (onr, ...$) {
      //...       onr.flag(2, ...$)
      //...     }
      //...   }
      //... })
      //... var drvr = mngr.getDriver(x)
      //... drvr.doDisposeUI(onr, 3, 4)
      //... flag.expect(1234)
      //>>>
    },
    /**
     * Get the driver constructor for the given name.
     * @param {String} name
     */
    getDriverC9r (name) {
      return this.driverC9rs.get(name)
    },
    /**
     * @name{getDriver}
     * Returns a driver, based on the given object's constructor name.
     * If the receiver is `eYo.fcfl.mngr` and the object's constructor name is `Foo.Bar` then the returned driver is an instance of `eYo.fcfl.Foo.Bar`, `eYo.fcfl.Foo` as soon as it is a driver constructor, otherwise it is the all purpose driver.
     * @param {*} object - the object for which a driver is required.
     * @return {eYo.driver.BaseC9r}
     */
    getDriver (object) {
      //<<< mochai: getDriver
      var components
      try {
        components = object.eyo.name.split('.')
        components.shift()
      } catch(e) {
        components = object.split('.')
      }
      while (components.length) {
        name = components.join('.')
        var driver = this.drivers.get(name)
        if (driver) {
          return driver
        }
        var C9r = this.getDriverC9r(name)
        if (C9r) {
          driver = new C9r(name, this)
          this.drivers.set(name, driver)
          return driver
        }
        components.pop()
      }
      return this.allPurposeDriver
      //... var driver = mngr.getDriver({
      //...   eyo: {
      //...     name: `${eYo.genUID(eYo.IDENT)}.${eYo.genUID(eYo.IDENT)}`,
      //...   },
      //... })
      //... chai.expect(driver).equal(mngr.allPurposeDriver)
      //... var driver = mngr.getDriver(`${eYo.genUID(eYo.IDENT)}.${eYo.genUID(eYo.IDENT)}`)
      //... chai.expect(driver).equal(mngr.allPurposeDriver)
      //>>>
    },
    //>>>
  },
  //>>>
})

eYo.mixinR(false, eYo.driver._p, {
  //<<< mochai: eYo.driver methods
  /**
   * Usage: `eYo.driver.makeMngr(model)`.
   * Actual implementation with Fcls, Fcfl, Dom and Svg drivers.
   * {Code: ns.Mngr} is instantiated by the main application object.
   * The `Base` class is also created.
   ** @param {Object} [mngrModel] -  model used for creation, see `makeC9r`.
  * @return {Function} a constructor equals to ns.Mngr
  */
  makeMngr (mngrModel) {
    //<<< mochai: makeMngr
    if (this.hasOwnProperty('mngr')) {
      return this.mngr
    }
    this._p.hasOwnProperty('BaseC9r') || this.hasOwnProperty('BaseC9r') || this.makeBaseC9r()
    var $super = this.super
    while (!$super.mngr) {
      $super = $super.super // loop ends when at least $super === eYo.driver
    }
    return eYo.c9r.makeSingleton(this, 'mngr', $super.mngr.constructor, mngrModel)
    //... let NS = eYo.driver.makeNS()
    //... chai.expect(NS).not.property('mngr')
    //... chai.expect(NS.BaseC9r).equal(eYo.driver.BaseC9r)
    //... NS.makeMngr()
    //... chai.expect(NS).property('mngr')
    //... chai.expect(()=>NS.makeBaseC9r()).throw()
    //... chai.expect(NS.BaseC9r).eyo_subclass(eYo.driver.BaseC9r)
    //... chai.expect(NS.mngr.constructor).eyo_subclass(eYo.driver.mngr.constructor)
    //... chai.expect(NS.mngr).property('makeDriverC9r')
    //... NS.makeNS('a')
    //... NS.a.makeMngr()
    //... let NS1 = eYo.driver.makeNS()
    //... NS1.makeMngr()
    //... chai.expect(NS1.mngr).instanceOf(eYo.driver.mngr.constructor)
    //... let NS2 = NS1.makeNS()
    //... NS2.makeMngr()
    //... chai.expect(NS2.mngr).instanceOf(NS1.mngr.constructor)
    //... let NS3 = NS2.makeNS()
    //... NS3.makeMngr({
    //...   properties: {
    //...     foo: 421,
    //...   },
    //...   methods: {
    //...     flag () {
    //...       flag.push(1, ...$)  
    //...     },
    //...   },
    //... })
    //... chai.expect(NS3.mngr).instanceOf(NS2.mngr.constructor)
    //... chai.expect(NS3.mngr.foo).equal(421)
    //... NS3.mngr.flag(2, 3)
    //... flag.expect(123)
    //>>>
  },
  /**
   * Convenient method to make simple driver forwarders.
   * Usefull when some methods should simply forward the eponym message to the driver.
   * @param {Object} pttp - a prototype
   * @param {String} key - a function name
   */
  makeForwarder (pttp, key) {
    //<<< mochai: makeForwarder
    pttp[key] = function (...$) {
      return this.driver[key](this, ...$)
    }
    //... var o = eYo.c9r.new({})
    //... o.tag = 1
    //... o.driver = new eYo.Driver('foo', onr)
    //... o.driver.do_it = function (object, ...$) {
    //...   flag.push(object.tag, 2, ...$, 5)
    //... }
    //... eYo.driver.makeForwarder(o, 'do_it')
    //... o.do_it(3, 4)
    //... flag.expect(12345)
    //>>>
  },
  //>>>
})
