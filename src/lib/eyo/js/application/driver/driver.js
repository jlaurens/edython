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

//... let NAMES = [
//...   ['Bar', 'Bar'],
//...   ['mee.Bar', 'mee.Bar'],
//...   ['eYo.mee.Bar', 'Bar'],
//...   ['eYo.foo.mee.Bar', 'mee.Bar'],
//...   ['(foo).mee.Bar', 'Bar'],
//...   ['(chi).foo.mee.Bar', 'mee.Bar'],
//... ]

eYo.mixinRO(eYo.xre, {
  //<<< mochai: xre
  driverId: XRegExp(`^(?:(?:\\(.*?\\)|eYo)\\..*?\\.)?(?<path>.*\\.)?(?<Id>.*)$`),
  //<<< mochai: driverId
  //... NAMES.forEach(ra => {
  //...   let m = XRegExp.exec(ra[0], eYo.xre.driverId)
  //...   chai.expect(m).not.undefined
  //...   chai.expect(m['id'] || m[0]).equal(ra[1])
  //... })
  //>>>
  driverParentId: XRegExp(`^(?<parentId>.*)\\..*?$`),//
  //<<< mochai: driverParentId
  //... var m = XRegExp.exec('foo', eYo.xre.driverParentId)
  //... chai.expect(!!m).false
  //... ;[
  //...   ['foo.bar.mee', 'foo.bar'],
  //...   ['foo.bar', 'foo'],
  //... ].forEach(ra => {
  //...   var m = XRegExp.exec(ra[0], eYo.xre.driverParentId)
  //...   chai.expect(m).not.undefined
  //...   chai.expect(m['parentId']).equal(ra[1])
  //... })
  //>>>
  //>>>
})

/**
 * @name {eYo.driver}
 * @namespace
 */
eYo.o4t.newNS(eYo, 'driver')
//<<< mochai: Basics
//... chai.assert(eYo.driver)
//>>>

eYo.make$$('parentId', 'Handler')

eYo.c9r.newC9r(eYo.driver, eYo.$$.Handler, {
  //<<< mochai: eYo.driver[eYo.$$.Handler]
  //<<< mochai: Basics
  //... chai.expect(eYo.driver).property(eYo.$$.Handler)
  //>>>
  /**
   * @param {String} key - the name of the driver, eg 'Audio'
   * @param {eYo.Driver} driver - the main driver
   * @param {eYo.Driver} base - the baseernate driver
   */
  init (key, driver, base) {
    //<<< mochai: init
    key === driver.key || eYo.throw(`${this.eyo.name}/init: Missing ${key} === ${driver.key}`)
    this.__key = key
    this.__driver = driver
    this.__base = base
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
    //... let base = new eYo.O4t('base', onr)
    //... let handler = new eYo.driver[eYo.$$.Handler](driver.key, driver, base)
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
      //... let base = eYo.o4t.new({
      //...   methods: {
      //...     do_it_2 (...$) {
      //...       flag.push(...$, 5)  
      //...     },
      //...   },
      //... }, 'base', onr)
      //... let handler = new eYo.driver[eYo.$$.Handler](driver.key, driver, base)
      //... let p = new Proxy(driver, handler)
      if (prop === '__driver') {
        return this.__driver
        //... chai.expect(p.__driver).equal(driver)
      }
      if (prop === '__base') {
        return this.__base
        //... chai.expect(p.__base).equal(base)
      }
      var ans = this.cache.get(prop)
      if (ans) {
        return ans
      }
      ans = Reflect.get(...arguments)
      if (eYo.isF(ans)) { // cache functions
        // go for the diamond problem
        var ans_f = (() => {
          // list all the model methods
          // make the table entries of all the drivers
          var ra = target.eyo.driverId.split('.')
          var x = ra.shift()
          var ids = [eYo.Do.toTitleCase(x)]
          var component
          while ((component = ra.shift())) {
            ids.push(`${x}.${eYo.Do.toTitleCase(component)}`)
            x = `${x}.${component}`
          }
          var nss = [x = this]
          while ((x = x.super)) {
            nss.unshift(x)
          }
          ra = [] // enclosed
          nss.forEach(ns => {
            ids.forEach(id => {
              var C9r = ns.getDriverC9r(id)
              if (C9r) {
                var f_m = C9r[eYo.$].getModelMethod(prop)
                eYo.isF(f_m) && ra.push(f_m)
              }
            })
          })
          return {
            f (...$) {
              var ans = true
              ra.forEach(f => ans = f.call(this, ...$) && ans)
            }
          }.f // not a constructor
        })()
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
      return Object.getOwnPropertyDescriptor(target, prop) || this.__base && Object.getOwnPropertyDescriptor(this.__base, prop)
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
      //... let base = new eYo.O4t('base', onr)
      //... let handler = new eYo.driver[eYo.$$.Handler](driver.key, driver, base)
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
})[eYo.$].finalizeC9r()

;(() => {
  let $C9rMap = Symbol('C9rMap')
  let $map = Symbol('map')
  eYo.mixinFR(eYo.driver, {
    [$C9rMap]: new Map(),
    [$map]: new Map(),
  })
  eYo.mixinFR(eYo.driver._p, {
    //<<< mochai: eYo.driver extensions
    newNS (...$) {
      //<<< mochai: newNS
      let NS = eYo.driver.super.newNS.call(this, ...$)
      eYo.mixinFR(NS, {
        [$C9rMap]: new Map(),
        [$map]: new Map(),
      })
      return NS
      //... chai.expect(eYo.driver.newNS).not.equal(eYo.driver.super.newNS)
      //... var NS1 = eYo.driver.newNS()
      //... chai.expect(NS1.newNS).not.equal(eYo.driver.super.newNS)
      //... var NS2 = NS1.newNS()
      //... chai.expect(NS2.newNS).not.equal(eYo.driver.super.newNS)
      //>>>
    },
    /**
     * Turns the given string into a formatted driver Id.
     * @param {String} id 
     */
    getDriverId (id) {
      //<<< mochai: getDriverId
      var m = XRegExp.exec(driverId, eYo.xre.driverId)
      return (m['path'] + eYo.do.toTitleCase(m['id'])) || m[0]
      //... ;[
      //...   ['', ''],
      //...   ['foo', 'Foo'],
      //...   ['Foo', 'Foo'],
      //...   ['foo.bar', 'foo.Bar'],
      //...   ['foo.Bar', 'foo.Bar'],
      //...   ['foo.bar.mee', 'foo.bar.Mee'],
      //...   ['foo.bar.Mee', 'foo.bar.Mee'],
      //... ].forEach(ra => {
      //...   chai.expect(eYo.driver.getDriverId(ra[0])).equal(ra[1])
      //... })
      //>>>
    },
    /**
     * Get the driver constructor for the given id.
     * @param {String} driverId
     */
    getDriverC9r (driverId) {
      return this[$C9rMap].get(this.getDriverId(driverId))
    },
    /**
     * Set the driver constructor for the given id.
     * @param {String} driverId
     * @param {C9r} C9r
     */
    setDriverC9r (driverId, C9r) {
      //<<< mochai: (set|get)DriverC9r
      driverId = this.getDriverId(driverId)
      this[$C9rMap].set(driverId, C9r)
      C9r[eYo.$].driverId = driverId
      return C9r
      //... var NS0 = eYo.driver.newNS()
      //... var C9r0 = NS0.newDriverC9r()
      //... NAMES.forEach(ra => {
      //...   NS0.setDriverC9r(ra[0], C9r0)
      //...   var Drvr = NS0.getDriverC9r(ra[0])
      //...   chai.expect(Drvr).equal(C9r0)
      //...   chai.expect(NS0.getDriverC9r(ra[1])).equal(Drvr)
      //... })
      //... ;[eYo.driver, NS0].forEach(NS => {
      //...   var NS1 = NS.newNS()
      //...   var C9r1 = NS1.newDriverC9r()
      //...   NAMES.forEach(ra => {
      //...     NS1.setDriverC9r(ra[0], C9r1)
      //...     var Drvr = NS1.getDriverC9r(ra[0])
      //...     chai.expect(Drvr).equal(C9r1)
      //...     chai.expect(Drvr).not.equal(C9r0)
      //...     chai.expect(NS1.getDriverC9r(ra[1])).equal(Drvr)
      //...     NS1.setDriverC9r(ra[1], C9r1)
      //...     var Drvr = NS1.getDriverC9r(ra[0])
      //...     chai.expect(Drvr).equal(C9r1)
      //...     chai.expect(Drvr).not.equal(C9r0)
      //...     chai.expect(NS1.getDriverC9r(ra[1])).equal(Drvr)
      //...   })
      //... })
      //>>>
    },
    /**
     * @name{getDriver}
     * Returns a driver, based on the given object's constructor name.
     * If the receiver is `eYo.fcfl.mngr` and the object's constructor name is `Foo.Bar` then the returned driver is an instance of `eYo.fcfl.Foo.Bar`, `eYo.fcfl.Foo` as soon as it is a driver constructor, otherwise it is the all purpose driver.
     * @param {*} object - the object for which a driver is required.
     * @return {eYo.driver.BaseC9r}
     */
    getDriver (object) {
      //<<< mochai: (get|set)Driver
      object.eyo && (object = object.eyo.name)
      var driverId = this.getDriverId(object)
      //... var NS = eYo.driver.newNS()
      //... var drvr
      //... NAMES.forEach(ra => {
      //...   var NS = eYo.driver.newNS()
      //...   let drvr = eYo.genUID()
      //...   NS.setDriver(ra[0], drvr)
      //...   chai.expect(NS.getDriver(ra[0])).equal(drvr)
      //...   chai.expect(NS.getDriver(ra[1])).equal(drvr)
      //...   NS.setDriver(ra[1], drvr)
      //...   chai.expect(NS.getDriver(ra[0])).equal(drvr)
      //...   chai.expect(NS.getDriver(ra[1])).equal(drvr)
      //... })
      while(true) {
        var driver = this[$map].get(driverId)
        if (driver) {
          return driver
        }
        var C9r = this.getDriverC9r(driverId)
        if (C9r) {
          //... var NS1 = eYo.driver.newNS()
          //... NS1.makeBaseC9r({
          //...   methods: {
          //...     base (...$) {
          //...       flag.push(1, ...$)
          //...     },
          //...   },
          //... })
          //... NS1.setDriverC9r('NS1.BaseC9r', NS1.BaseC9r)
          //... drvr = NS1.getDriver('NS1.BaseC9r')
          //... drvr.base(2, 3)
          //... flag.expect(123)
          //... var C9r1 = NS1.newDriverC9r('C9r1', {
          //...   methods: {
          //...     flag1 (...$) {
          //...       this.base(...$, 1)
          //...     },
          //...   },
          //... })
          //... NS1.setDriverC9r('C9r1', C9r1)
          //... drvr = NS1.getDriver('C9r1')
          //... drvr.base(2, 3)
          //... flag.expect(123)
          //... drvr.flag1(2, 3)
          //... flag.expect(1231)
          //... var NS2 = NS1.newNS()
          //... NS2.makeBaseC9r({
          //...   methods: {
          //...     base (...$) {
          //...       flag.push(12, ...$)
          //...     },
          //...     base2 (...$) {
          //...       flag.push(2, ...$)
          //...     },
          //...   },
          //... })
          //... NS2.setDriverC9r('NS2.BaseC9r', NS2.BaseC9r)
          //... drvr = NS2.getDriver('NS2.BaseC9r')
          //... drvr.base(3, 4)
          //... flag.expect(1234)
          //... drvr.base2(3, 4)
          //... flag.expect(234)
          
          driver = new C9r(driverId, this)
        } else if (this.super && this.super.getDriver) {
          driver = this.super.getDriver(driverId)
          //... drvr = NS2.getDriver('NS1.BaseC9r')
          //... drvr.base(2, 3)
          //... flag.expect(123)
          //... chai.expect(() => drvr.flag1(2, 3)).throw()
        }
        if (driver) {
          if (!driver instanceof this.BaseC9r) {
            //... var C9r12 = NS2.newDriverC9r('C9r12', NS1.C9r1, {
            //...   methods: {
            //...     flag12 (...$) {
            //...       this.base(...$, 12)
            //...     },
            //...   },
            //... })
            //... NS2.setDriverC9r('C9r12', C9r12)
            //... drvr = NS2.getDriver('C9r12')
            //... drvr.base(3, 4)
            //... flag.expect(1234)
            //... drvr.base2(3, 4)
            //... flag.expect(234)
            //... drvr.flag1(3, 4)
            //... flag.expect(12341)
            //... drvr.flag12(3, 4)
            //... flag.expect(123412)
            while (true) {
              var m = XRegExp.exec(driverId, eYo.xre.driverParentId)
              if (m) {
                driverId = m['parentId']
                if (this.getDriverC9r(driverId)) {
                  var base = this.getDriver(driverId)
                  break
                }
              } else {
                driverId = ''
                base = this.getDriver(driverId)
                break
              }
            }
            var handler = new eYo.driver[eYo.$$.Handler](driver.key, driver, base)
            driver = new Proxy(driver, handler)
          }
          return this.setDriver(driverId, driver)
        }
        var m = XRegExp.exec(driverId, eYo.xre.driverParentId)
        if (m) {
          driverId = m['parentId']
        } else {
          driverId = ''
          break
        }
        //... var NS = eYo.driver.newNS()
        //... NS.makeBaseC9r({
        //...   methods: {
        //...     base (...$) {
        //...       flag.push(1, ...$)
        //...     },
        //...   },
        //... })
        //... var C9r = NS.newDriverC9r('C9r', {
        //...   methods: {
        //...     flag (...$) {
        //...       this.base(...$, 4)
        //...     },
        //...   },
        //... })
        //... NS.setDriverC9r('C9r', C9r)
        //... chai.expect(NS.getDriver('C9r.foo')).equal(NS.getDriver('C9r'))
      }
      if (!(driver = this[$map].get(driverId))) {
        driver = this.setDriver(driverId, this.new(driverId))
      }
      return driver
      //... var NS = eYo.driver.newNS()
      //... var driver = NS.getDriver({
      //...   eyo: {
      //...     name: `${eYo.genUID(eYo.IDENT)}.${eYo.genUID(eYo.IDENT)}`,
      //...   },
      //... })
      //... chai.expect(driver).equal(NS.getDriver(''))
      //... var driver = NS.getDriver(`${eYo.genUID(eYo.IDENT)}.${eYo.genUID(eYo.IDENT)}`)
      //... chai.expect(driver).equal(NS.getDriver(''))
      //>>>
    },
    /**
     * Set the driver constructor for the given id.
     * @param {String} id
     */
    setDriver (object, driver) {
      object.eyo && (object = object.eyo.name)
      var m = XRegExp.exec(object, eYo.xre.driverId)
      var id = m['id'] || m[0]
      this[$map].set(id, driver)
      return driver
    },
    //>>>
  })
})()

eYo.mixinFR(eYo.driver._p, {
  //<<< mochai: eYo driver methods
  makeBaseC9r (...$) {
    var C9r = eYo.driver.super._p.makeBaseC9r.call(this, ...$)
    this.setDriverC9r('', C9r)
    return C9r
  },
  /**
   * Usage: `eYo.driver.newDriverC9r('Foo', model)`.
   * Actual implementation with fcls, fcfl, dom and svg drivers.
   * {Code: ns.mngr} is used by the main application object.
   * Convenient driver constructor maker.
   * The prototype will have eventually an `doInitUI` or `doDisposeUI`
   * wrapping the model's eponym methods, if any.
   * The owner will have a dafault driver named `Base`,
   * which is expected to be the ancestor of all drivers.
   * @param {String} id - a (titlecased) word, the name of the subclass (last component)
   * @param {Function} [SuperC9r] - the super class of the driver constructor,
   * defaults to the owner's super_'s key property or the owner's `Base`.
   * @param {Object} [driverModel]
   * An object with various keys:
   * - owner: An object owning the class, basically a namespace object.
   * If the owner is `Foo` and the key is 'Bar', the created constructor
   * is `Foo.Bar`. Actually used with `eYo` as owner, 'dom' or 'svg' as key.
   * - doInitUI: an optional function with signature (object, ...)->eYo.NA
   * - doDisposeUI: an optional function with signature (object)->eYo.NA
   */
  newDriverC9r (id, SuperC9r, driverModel) {
    //<<< mochai: newDriverC9r
    //<<<   mochai: Basics
    //...   
    //>>>
    //... var NS = eYo.driver.newNS()
    //... chai.expect(NS.newDriverC9r('Foo')).equal(NS.Foo)
    //... chai.expect(NS.Foo).eyo_C9r
    //... var foo = new NS.Foo('foo', onr)
    //... chai.assert(foo.doInitUI)
    //... chai.expect(foo.doInitUI()).true
    //... foo.doDisposeUI()
    if (!eYo.isSubclass(SuperC9r, eYo.Driver)) {
      ;[SuperC9r, driverModel] = [this.super.getDriverC9r && this.super.getDriverC9r(id) || this.BaseC9r, eYo.called(SuperC9r) || {}]
    }
    if (!eYo.isSubclass(SuperC9r, this.BaseC9r)) {
      //... var NS = eYo.driver.newNS()
      //... NS.makeBaseC9r({
      //...   methods: {
      //...     chi (...$) {
      //...       flag.push(1, ...$)
      //...     }
      //...   }
      //... })
      //... NS.newDriverC9r('Bar', {
      //...   methods: {
      //...     foo (...$) {
      //...       flag.push(4, ...$)
      //...     }
      //...   }
      //... })
      //... NS.newNS('a')
      //... NS.a.makeBaseC9r({
      //...   methods: {
      //...     mee (...$) {
      //...       flag.push(7, ...$)
      //...     }
      //...   }
      //... })
      //... NS.a.newDriverC9r('Bar')
      //... var bar = new NS.a.Bar('bar', onr)
      //... bar.chi(2, 3)
      //... bar.foo(5, 6)
      //... bar.mee(8, 9)
      //... flag.expect(123456789)
      if (driverModel) {
        eYo.provideRO(driverModel, this.BaseC9r[eYo.$].model)
      } else {
        driverModel = this.BaseC9r[eYo.$].model
      }
    } else if (!driverModel) {
      driverModel = {}
    }
    let Driver = eYo.c9r.doNewC9r(this, id, SuperC9r, driverModel)
    let ui_m = this.model && this.model.ui
    let ui_d = Driver[eYo.$].model.ui
    eYo.mixinFR(Driver.prototype, {
      doInitUI (...$) {
        let ans = SuperC9r.prototype.doInitUI.call(this, ...$)
        var f = ui_m && ui_m.initMaker
        var ff = ui_d && ui_d.doInit
        f = (f && f(ff)) || ff
        return f ? f.call(this, ...$) && ans: ans
      },
      doDisposeUI (...$) {
        var f = ui_m && ui_m.disposeMaker
        var ff = ui_d && ui_d.doDispose
        f = (f && f(ff)) || ff
        var ans = !!f && f.call(this, ...$)
        return SuperC9r.prototype.doDisposeUI.call(this, ...$) && ans
      },
    })
    Driver[eYo.$].finalizeC9r()
    this.setDriverC9r(this.getDriverId(id), Driver)
    return Driver
    //... NAMES.forEach(ra => {
    //...   var NS = eYo.driver.newNS()
    //...   var Drvr = NS.newDriverC9r(ra[0])
    //...   chai.expect(Drvr).equal(NS[ra[0]])
    //...   var NS = eYo.driver.newNS()
    //...   var Drvr = NS.newDriverC9r(ra[1])
    //...   chai.expect(Drvr).equal(NS[ra[1]])
    //... })
    //... var NS = eYo.driver.newNS()
    //... var id = `X${eYo.genUID(eYo.IDENT)}`
    //... var D1 = NS.newDriverC9r(id)
    //... chai.expect(D1).equal(NS[id])
    //... var Drvr = NS.getDriverC9r(id)
    //... chai.expect(D1).equal(Drvr)
    //... var drvr = NS.getDriver(id)
    //... chai.expect(drvr).instanceOf(Drvr)
    //... var id = `X${eYo.genUID(eYo.IDENT)}`
    //... var D2 = NS.newDriverC9r(id, D1)
    //... var Drvr = NS.getDriverC9r(id)
    //... chai.expect(D2).equal(Drvr)
    //... var drvr = NS.getDriver(id)
    //... chai.expect(drvr).instanceOf(D1)
    //... chai.expect(drvr).instanceOf(D2)
    //... var id = eYo.genUID(eYo.IDENT)
    //... NS.newDriverC9r(id, {
    //...   ui: {
    //...     doInit (onr, ...$) {
    //...       onr.flag(2, ...$)
    //...     }
    //...   }
    //... })
    //... var drvr = NS.getDriver(id)
    //... drvr.doInitUI(onr, 3, 4)
    //... flag.expect(1234)
    //... var id = eYo.genUID(eYo.IDENT)
    //... NS.newDriverC9r(id, {
    //...   ui: {
    //...     doDispose (onr, ...$) {
    //...       onr.flag(2, ...$)
    //...     }
    //...   }
    //... })
    //... var drvr = NS.getDriver(id)
    //... drvr.doDisposeUI(onr, 3, 4)
    //... flag.expect(1234)
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

/**
 * @name {eYo.driver.BaseC9r}
 * Default convenient driver, to be subclassed.
 */
eYo.driver.makeBaseC9r({
  //<<< mochai: eYo.Driver
  init (id, mngr) {
    //<<< mochai: init
    //... var drvr = new eYo.Driver('foo', onr)
    //... chai.expect(drvr).not.undefined
    //... chai.expect(drvr.key).equal('foo')
    //... chai.expect(drvr.mngr).equal(onr)
    //... chai.expect(drvr.doInitUI).eyo_F
    //... chai.expect(drvr.doDisposeUI).eyo_F
    eYo.mixinRO(this, {mngr})
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
