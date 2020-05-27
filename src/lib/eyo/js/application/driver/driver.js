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

/**
 * @name {eYo.driver.Mngr}
 * Default driver manager, abstract class to be subclassed.
 * Owns instances of `eYo.Driver`'s descendants.
 * @param {Object} owner
 */
eYo.o4t.makeC9r(eYo.driver, 'Mngr', {
  //<<< mochai: Mngr
  //... var mngr = new eYo.driver.Mngr('mngr', onr)
  //<<< mochai: Basics
  //... chai.assert(mngr)
  //... chai.expect(mngr.eyo.ns).instanceOf(eYo.driver.constructor)
  //>>>
  dlgt () {
    //<<< mochai: dlgt
    this.driverC9rMap = new Map()
    //... chai.assert(eYo.driver.Mngr.eyo.driverC9rMap)
    //>>>
  },
  init () {
    this.initDrivers()
  },
  properties: {
    //<<< mochai: properties
    drivers: {
      //<<< mochai: drivers
      value () {
        return new Map()
      },
      didChange (after) {
        after && this.initDrivers()
      },
      //... chai.expect(mngr.drivers_p).instanceof(eYo.P6y)
      //... mngr.initDrivers = function () {
      //...   flag.push(123)  
      //... }
      //... chai.expect(mngr.drivers).instanceof(Map)
      //... flag.expect(0)
      //... mngr.drivers_ = new Map()
      //... flag.expect(123)
      //... delete mngr.initDrivers
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
            if (prop === 'eyo_p6y') {
              return eYo.NA
            }
            eYo.throw(`Missing driver property named ${prop} in object ${target}`)
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
     * Initialize all the drivers.
     */
    initDrivers () {
      //<<< mochai: initDrivers
      for (let [name, Driver] of this.eyo.ns.Mngr.eyo.driverC9rMap) {
        // do not override
        this.drivers.get(name) || this.drivers.set(name, new Driver(name, this))
      }
      //... chai.expect(mngr.initDrivers).eyo_F
      //>>>
    },
    /**
     * @name{getDriver}
     * Returns a driver, based on the given object's constructor name.
     * If the receiver is `eYo.fcfl.Mngr` and the object's constructor name is `Foo.Bar` then the returned driver is an instance of `eYo.fcfl.Foo.Bar`, `eYo.fcfl.Foo` as soon as it is a driver constructor, otherwise it is the all purpose driver.
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
eYo.driver.Mngr.eyo.finalizeC9r()

eYo.mixinR(false, eYo.driver.Mngr.eyo_p, {
  //<<< mochai: Mngr dlgt methods
  //... var mngr = new eYo.driver.Mngr('mngr', onr)
  //... var Driver
  /**
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
    //... NS.makeDriverC9r('Foo')
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
      //... NS.makeDriverC9r('Bar', {
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
      //... NS.a.makeDriverC9r('Bar')
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
    //... var D1 = mngr.eyo.makeDriverC9r(id)
    //... var Drvr = mngr.eyo.driverC9rMap.get(x)
    //... chai.expect(D1).equal(Drvr)
    //... mngr.initDrivers()
    //... var drvr = mngr.getDriver(x)
    //... chai.expect(drvr).instanceOf(Drvr)
    //... var id = eYo.genUID(eYo.IDENT)
    //... var x = `driver.${id}`
    //... var D2 = mngr.eyo.makeDriverC9r(id, D1)
    //... var Drvr = mngr.eyo.driverC9rMap.get(x)
    //... chai.expect(D2).equal(Drvr)
    //... mngr.initDrivers()
    //... var drvr = mngr.getDriver(x)
    //... chai.expect(drvr).instanceOf(D1)
    //... chai.expect(drvr).instanceOf(D2)
    //... var id = eYo.genUID(eYo.IDENT)
    //... var x = `driver.${id}`
    //... mngr.eyo.makeDriverC9r(id, {
    //...   ui: {
    //...     doInit (onr, ...$) {
    //...       onr.flag(2, ...$)
    //...     }
    //...   }
    //... })
    //... mngr.initDrivers()
    //... var drvr = mngr.getDriver(x)
    //... drvr.doInitUI(onr, 3, 4)
    //... flag.expect(1234)
    //... var id = eYo.genUID(eYo.IDENT)
    //... var x = `driver.${id}`
    //... mngr.eyo.makeDriverC9r(id, {
    //...   ui: {
    //...     doDispose (onr, ...$) {
    //...       onr.flag(2, ...$)
    //...     }
    //...   }
    //... })
    //... mngr.initDrivers()
    //... var drvr = mngr.getDriver(x)
    //... drvr.doDisposeUI(onr, 3, 4)
    //... flag.expect(1234)
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
    if (this === eYo.driver) {
      return
    }
    this._p.hasOwnProperty('BaseC9r') || this.hasOwnProperty('BaseC9r') || this.makeBaseC9r()
    let SuperC9r = this.super.Mngr
    var Mngr = this.makeC9r(SuperC9r, mngrModel)
    Mngr.prototype.initDrivers = function () {
      if (!this.drivers) {
        console.error('BREAK HERE!')
      }
      for (let [name, Driver] of Mngr.eyo.driverC9rMap) {
        // do not override
        this.drivers.get(name) || this.drivers.set(name, new Driver(name, this))
      }
      SuperC9r.prototype.initDrivers.call(this)
    }
    return Mngr
    //... let NS = eYo.driver.makeNS()
    //... chai.expect(NS.Mngr.eyo.C9r).equal(NS.Mngr)
    //... chai.expect(NS.BaseC9r).equal(eYo.driver.BaseC9r)
    //... NS.makeMngr()
    //... chai.assert(NS.Mngr)
    //... chai.assert(NS.makeMngr)
    //... chai.expect(()=>NS.makeBaseC9r()).throw()
    //... chai.expect(NS.BaseC9r).eyo_subclass(eYo.driver.BaseC9r)
    //... chai.assert(NS.makeDriverC9r)
    //... NS.makeNS('a')
    //... NS.a.makeMngr()
    //... let id1 = eYo.genUID(eYo.IDENT)
    //... let NS1 = eYo.driver.makeNS()
    //... NS1.makeMngr()
    //... chai.expect(NS1.Mngr).eyo_C9r
    //... chai.expect(NS1.Mngr).eyo_subclass(eYo.driver.Mngr)
    //... let NS2 = NS1.makeNS()
    //... NS2.makeMngr().eyo_C9r
    //... chai.expect(NS2.Mngr).eyo_C9r
    //... chai.expect(NS2.Mngr).eyo_subclass(NS1.Mngr)
    //>>>
  },
  /**
   * Usage: `eYo.driver.makeDriverC9r('Foo', model)`.
   * Actual implementation with fcls, fcfl, dom and svg drivers.
   * {Code: ns.Mngr} is instantiated by the main application object.
   * @param {String} key -  The key of the driver
   * @param {Object} [SuperC9r] -  The ancestor of the driver
   * @param {Object} [mngrModel] -  model used for creation
   * @return {Function} a constructor
   */
  makeDriverC9r (key, SuperC9r, driverModel) {
    //<<< mochai: makeDriverC9r
    return this.Mngr.eyo.makeDriverC9r(key, SuperC9r, driverModel)
    //... let NS = eYo.driver.makeNS()
    //... NS.makeMngr()
    //... NS.makeDriverC9r('Foo')
    //... chai.expect(NS.Mngr.eyo.driverC9rMap.get('Foo')).eyo_C9r
    //>>>
  },
  /**
   * Convenient method to make simple driver forwarders.
   */
  makeForwarder (pttp, key) {
    //<<< mochai: makeForwarder
    pttp[key] = function (...$) {
      return this.driver[key](this, ...$)
    }
    //... var o = eYo.c9r.new({})
    //... o.driver = onr
    //... onr.do_it = function (object, ...$) {
    //...   this.flag(...$)
    //... }
    //... eYo.driver.makeForwarder(o, 'do_it')
    //... o.do_it(2, 3)
    //... flag.expect(123)
    //>>>
  },
  //>>>
})

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
      //<<< mngr
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
