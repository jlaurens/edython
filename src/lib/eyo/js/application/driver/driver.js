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

//<<< mochai: ../
//... let NAMES = [
//...   ['Bar', 'Bar'],
//...   ['mee.Bar', 'mee.Bar'],
//...   ['eYo.mee.Bar', 'Bar'],
//...   ['eYo.foo.mee.Bar', 'mee.Bar'],
//...   ['(foo).mee.Bar', 'Bar'],
//...   ['(chi).foo.mee.Bar', 'mee.Bar'],
//... ]
//>>>

eYo.mixinRO(eYo.xre, {
  //<<< mochai: xre
  driverId: XRegExp(`^(?:(?:\\(.*?\\)|eYo)\\..*?\\.)?(?<path>.*\\.)?(?<Id>.*?)$`),
  //<<< mochai: driverId
  //... ;[
  //...   ['Bar', eYo.NA, 'Bar'],
  //...   ['mee.Bar', 'mee.', 'Bar'],
  //...   ['eYo.mee.Bar', eYo.NA, 'Bar'],
  //...   ['eYo.foo.mee.Bar', 'mee.', 'Bar'],
  //...   ['(foo).mee.Bar', eYo.NA, 'Bar'],
  //...   ['(chi).foo.mee.Bar', 'mee.', 'Bar'],
  //... ].forEach(ra => {
  //...   let m = XRegExp.exec(ra[0], eYo.xre.driverId)
  //...   chai.expect(m).not.undefined
  //...   chai.expect(m['path']).equal(ra[1])
  //...   chai.expect(m['Id']).equal(ra[2])
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

//<<< mochai: ../
//... let newDriver = (NS, id, driverModel = {}) => {
//...   let C9r = NS.newC9r(id, driverModel)
//...   C9r[eYo.$].finalizeC9r()
//...   NS.setDriverC9r(id, C9r)
//...   return NS.getDriver(id)
//... }
//>>>

eYo.make$$('parent')

;(() => {
  let $C9rMap = Symbol('C9rMap')
  let $map = Symbol('map')
  eYo.mixinFR(eYo.driver, {
    [$C9rMap]: new Map(),
    [$map]: new Map(),
  })
  eYo.mixinFR(eYo.driver._p, {
    //<<< mochai: eYo.driver extensions
    /**
     * Turns the given string into a formatted driver Id.
     * @param {String} id 
     */
    getDriverId (id) {
      //<<< mochai: getDriverId
      let m = XRegExp.exec(id, eYo.xre.driverId)
      let Id = eYo.do.toTitleCase(m['Id'])
      return m['path'] ? m['path'] + Id : Id
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
     * Adds storage for drivers.
     * @param  {...any} $ 
     */
    newNS (...$) {
      //<<< mochai: newNS
      //... chai.expect(eYo.driver.newNS).not.equal(eYo.driver.super.newNS)
      //... var NS1 = eYo.driver.newNS()
      //... chai.expect(NS1.newNS).not.equal(eYo.driver.super.newNS)
      //... var NS2 = NS1.newNS()
      //... chai.expect(NS2.newNS).not.equal(eYo.driver.super.newNS)
      let NS = eYo.driver.super.newNS.call(this, ...$)
      eYo.mixinFR(NS, {
        [$C9rMap]: new Map(),
        [$map]: new Map(),
      })
      // add a reference to the parent namespace
      // NS[eYo.$$.parent] = ...
      var super$ = this
      while (super$ !== eYo.driver) {
        super$ = super$.super
        var parent = super$[NS.key]
        if (parent) {
          NS[eYo.$$.parent] = parent
          //... NS1.newNS('foo')
          //... NS2.newNS('foo')
          //... chai.expect(NS2.foo[eYo.$$.parent]).equal(NS1.foo)
          //... var NS3 = NS2.newNS()
          //... NS3.newNS('foo')
          //... chai.expect(NS3.foo[eYo.$$.parent]).equal(NS2.foo)
          //... NS1.newNS('bar')
          //... NS3.newNS('bar')
          //... chai.expect(NS3.bar[eYo.$$.parent]).equal(NS1.bar)
          break
        }
      }
      return NS
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
     * Usage: `eYo.driver.newDriverC9r('Foo', model)`.
     * This is the recommanded way to create a driver constructor.
     * Actual implementation with fcls, fcfl, dom and svg drivers.
     * Convenient driver constructor maker.
     * The prototype will have eventually an `doInitUI` or `doDisposeUI`
     * wrapping the model's eponym methods, if any.
     * The owner will have a default driver named `BaseC9r`,
     * which is expected to be the ancestor of all drivers.
     * @param {String} id - a (titlecased) word, the name of the subclass (last component)
     * @param {Function} [SuperC9r] - the super class of the driver constructor,
     * defaults to the owner's super_'s key property or the owner's `BaseC9r`.
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
      //... chai.expect(eYo.driver.newDriverC9r).eyo_F
      //... var NS = eYo.driver.newNS()
      //... chai.expect(NS.newDriverC9r('Foo')).equal(NS.Foo)
      //... chai.expect(NS.Foo).eyo_C9r
      if (!eYo.isSubclass(SuperC9r, eYo.Driver)) {
        eYo.isNA(driverModel) || eYo.throw(`${this.name}/newDriverC9r: Unexpected model.`)
        ;[SuperC9r, driverModel] = [this.super.getDriverC9r && this.super.getDriverC9r(id) || this.BaseC9r, eYo.called(SuperC9r) || {}]
      }
      let Driver = eYo.c9r.doNewC9r(this, id, SuperC9r, driverModel || {})
      Driver[eYo.$].finalizeC9r()
      return this.setDriverC9r(id, Driver)
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
      //...   doInitUI (onr, ...$) {
      //...     onr.flag(2, ...$)
      //...   },
      //... })
      //... var drvr = NS.getDriver(id)
      //... drvr.doInitUI(onr, 3, 4)
      //... flag.expect(1234)
      //... var id = eYo.genUID(eYo.IDENT)
      //... NS.newDriverC9r(id, {
      //...   doDisposeUI (onr, ...$) {
      //...     onr.flag(2, ...$)
      //...   },
      //... })
      //... var drvr = NS.getDriver(id)
      //... drvr.doDisposeUI(onr, 3, 4)
      //... flag.expect(1234)
      //>>>
    },
    /**
     * @name{newDriveProxy_}
     * Returns a driver proxy.
     * @param {*} target - the target.
     * @return {eYo.driver.BaseC9r}
     */
    newDriverProxy_ (target) {
      return new Proxy(target, new eYo.driver[eYo.$$.Handler]())
    },
    /**
     * @name{getDriver}
     * Returns a driver, based on the given object's constructor name.
     * If the receiver is `eYo.fcfl.mngr` and the object's constructor name is `Foo.Bar` then the returned driver is an instance of `eYo.fcfl.Foo.Bar`, `eYo.fcfl.Foo` as soon as it is a driver constructor, otherwise it is the all purpose driver.
     * @param {*} object - the object for which a driver is required.
     * @return {eYo.driver.BaseC9r}
     */
    getDriver (object, ...$) {
      //<<< mochai: (get|set)Driver
      object.eyo && (object = object.eyo.name)
      var driverId = this.getDriverId(object)
      //... var NS, NS1, drvr, drvr1, target
      //... NS = eYo.driver.newNS()
      //... NAMES.forEach(ra => {
      //...   var NS = eYo.driver.newNS()
      //...   let drvr = newDriver(NS, eYo.genUID())
      //...   NS.setDriver(ra[0], drvr)
      //...   chai.expect(NS.getDriver(ra[0])).equal(drvr)
      //...   chai.expect(NS.getDriver(ra[1])).equal(drvr)
      //...   chai.expect(NS.getDriver(ra[0])).equal(drvr)
      //...   chai.expect(NS.getDriver(ra[1])).equal(drvr)
      //...   var NS = eYo.driver.newNS()
      //...   NS.setDriver(ra[1], drvr)
      //...   chai.expect(NS.getDriver(ra[0])).equal(drvr)
      //...   chai.expect(NS.getDriver(ra[1])).equal(drvr)
      //...   chai.expect(NS.getDriver(ra[0])).equal(drvr)
      //...   chai.expect(NS.getDriver(ra[1])).equal(drvr)
      //... })
      //... var C9rA = eYo.driver.newC9r()
      //... C9rA[eYo.$].finalizeC9r()
      //... var C9rAB = eYo.driver.newC9r()
      //... C9rAB[eYo.$].finalizeC9r()
      //... var C9rABC = eYo.driver.newC9r()
      //... C9rABC[eYo.$].finalizeC9r()
      var driver = this[$map].get(driverId)
      if (driver) {
        //... NS = eYo.driver.newNS()
        //... NS.setDriverC9r('A', C9rA)
        //... drvr = NS.getDriver('A')
        //... chai.expect(drvr).equal(NS.getDriver('A'))
        return driver
      }
      var saveId = driverId
      while(true) { // eslint-disable-line
        var C9r = this.getDriverC9r(driverId)
        if (C9r) {
          //... NS = eYo.driver.newNS()
          //... NS.setDriverC9r('A', C9rA)
          //... chai.expect(NS.getDriverC9r('A')).equal(C9rA)
          //... drvr = NS.getDriver('A')
          //... chai.expect(drvr.eyo.C9r).equal(C9rA)
          //... chai.expect(drvr[eYo.$$.target]).instanceOf(eYo.Driver)
          //... chai.expect(drvr[eYo.$$.target][eYo.$$.target]).undefined
          var driver_t = new C9r(driverId, this, ...$)
        } else if (this.super && this.super.getDriver) {
          driver_t = this.super.getDriver(driverId)[eYo.$$.target]
          //... NS = eYo.driver.newNS()
          //... NS.setDriverC9r('A', C9rA)
          //... NS1 = NS.newNS()
          //... chai.expect(NS.getDriverC9r('A')).equal(C9rA)
          //... chai.expect(NS1.getDriverC9r('A')).undefined
          //... drvr1 = NS1.getDriver('A')
          //... chai.expect(drvr1.eyo.C9r).equal(C9rA)
          //... drvr = NS.getDriver('A')
          //... chai.expect(drvr1).not.equal(drvr)
          //... chai.expect(drvr1[eYo.$$.target]).equal(drvr[eYo.$$.target])
        }
        if (driver_t) {
          //... NS = eYo.driver.newNS()
          //... NS.setDriverC9r('A', C9rA)
          //... drvr = NS.getDriver('A')
          //... var drvr_t = drvr[eYo.$$.target]
          //... chai.expect(drvr.eyo).equal(drvr_t.eyo)
          //... chai.expect(drvr.ns).equal(drvr_t.ns)
          return this.setDriver(saveId, this.newDriverProxy_(driver_t))
        }
        var m = XRegExp.exec(driverId, eYo.xre.driverParentId)
        if (m) {
          driverId = m['parentId']
          driver = this[$map].get(driverId)
          if (driver) {
            //... NS = eYo.driver.newNS()
            //... NS.setDriverC9r('A', C9rA)
            //... target = NS.getDriver('A')[eYo.$$.target]
            //... chai.expect(NS.getDriver('A')[eYo.$$.target]).equal(target)
            //... chai.expect(NS.getDriver('A.B')[eYo.$$.target]).not.equal(target)
            //... chai.expect(NS.getDriver('A.B.C')[eYo.$$.target]).not.equal(target)
            //... target = eYo.driver.getDriver('A')[eYo.$$.target]
            //... chai.expect(NS.getDriver('A.B')[eYo.$$.target]).equal(target)
            //... chai.expect(NS.getDriver('A.B.C')[eYo.$$.target]).equal(target)
            return this.setDriver(saveId, this.newDriverProxy_(driver[eYo.$$.target]))
          }
        } else {
          //... NS = eYo.driver.newNS()
          //... drvr = NS.getDriver('')
          //... chai.expect(drvr).equal(NS.getDriver(''))
          //... target = drvr[eYo.$$.target]
          //... chai.expect(NS.getDriver('A')[eYo.$$.target]).equal(target)
          //... chai.expect(NS.getDriver('A.B')[eYo.$$.target]).equal(target)
          //... chai.expect(NS.getDriver('A.B.C')[eYo.$$.target]).equal(target)
          if ((driver = this[$map].get(''))) {
            return this.setDriver(saveId, this.newDriverProxy_(driver[eYo.$$.target]))
          }
          driver_t = this.new('')
          this.setDriver('', this.newDriverProxy_(driver_t))
          return this.setDriver(saveId, this.newDriverProxy_(driver_t))
        }
        //... NS = eYo.driver.newNS()
        //... NS.setDriverC9r('A', C9rA)
        //... var driver = NS.getDriver({
        //...   eyo: {
        //...     name: `${eYo.genUID(eYo.IDENT)}.${eYo.genUID(eYo.IDENT)}`,
        //...   },
        //... })
        //... chai.expect(driver[eYo.$$.target]).equal(eYo.driver.getDriver('')[eYo.$$.target])
        //... var driver = NS.getDriver(`${eYo.genUID(eYo.IDENT)}.${eYo.genUID(eYo.IDENT)}`)
        //... chai.expect(driver[eYo.$$.target]).equal(NS.getDriver('')[eYo.$$.target])
      }
      //>>>
    },
    /**
     * Set the driver constructor for the given id.
     * @param {String} id
     */
    setDriver (object, driver) {
      object.eyo && (object = object.eyo.name)
      var id = this.getDriverId(object)
      this[$map].set(id, driver)
      return driver
    },
    //>>>
  })
})()

eYo.make$$('parentId', 'Handler')

eYo.c9r.newC9r(eYo.driver, eYo.$$.Handler, {
  //<<< mochai: eYo.driver[eYo.$$.Handler]
  //<<< mochai: Basics
  //... chai.expect(eYo.driver).property(eYo.$$.Handler)
  //>>>
  /**
   * Handler for real driver proxy.
   */
  init () {
    //<<< mochai: init
    this.cache = new Map()
    //>>>
  },
  dispose () {
    this.cache.clear()
    this.cache = eYo.NA
  },
  methods: {
    //<<< mochai: methods
    apply (target, thisArg, argumentsList) { // eslint-disable-line
      eYo.throw(`${target.eyo.name} instances are not callable.`)
    },
    construct(target, args) { // eslint-disable-line
      eYo.throw(`${target.eyo.name} instances are not constructors.`)
    },
    defineProperty(target, key, descriptor) { // eslint-disable-line
      eYo.throw(`${target.eyo.name} instances are frozen (no defineProperty).`)
    },
    deleteProperty(target, prop) { // eslint-disable-line
      eYo.throw(`${target.eyo.name} instances are frozen (no deleteProperty).`)
    },
    //<<< mochai: frozen or forbidden
    //... let NS = eYo.driver.newNS()
    //... let d = newDriver(NS, 'driver')
    //... chai.expect(() => d()).throw()
    //... chai.expect(() => new d()).throw()
    //... chai.expect(() => d.defineProperty()).throw()
    //... chai.expect(() => d.deleteProperty()).throw()
    //>>>
    get (target, prop, receiver) { // eslint-disable-line
      //<<< mochai: get
      if (prop === eYo.$$.target && !eYo.objectHasOwnProperty(target, prop)) {
        return target
        //... var NS = eYo.driver.newNS()
        //... var seed = eYo.genUID(eYo.IDENT)
        //... var d = newDriver(NS, 'X' + seed)
        //... chai.expect(d[eYo.$$.target]).instanceOf(eYo.Driver)
        //... chai.expect(d.eyo).not.undefined
        //... chai.expect(d.eyo).equal(d[eYo.$$.target].eyo)
      }
      var ans = this.cache.get(prop)
      if (ans) {
        return ans
      }
      ans = Reflect.get(target, prop)
      if (eYo.isDef(ans) && !eYo.isF(ans)) {
        return ans
      }
      var ans_f = (() => {
        // list all the model methods
        // make the table entries of all the drivers
        var ra = target.eyo.driverId.split('.')
        var x = ra.shift()
        var ids = x
          ? ['', eYo.do.toTitleCase(x)]
          : ['']
        var component
        while ((component = ra.shift())) {
          ids.push(`${x}.${eYo.do.toTitleCase(component)}`)
          x = `${x}.${component}`
        }
        var nss = [x = target.eyo.ns]
        if (!x) {
          console.error('NOT x')
        }
        while ((x = x.super) && x.getDriverC9r) {
          nss.unshift(x)
        }
        ra = [] // enclosed
        nss.forEach(ns => {
          ids.forEach(id => {
            var C9r = ns.getDriverC9r(id)
            if (C9r) {
              if (eYo.objectHasOwnProperty(C9r.prototype, prop)) {
                ra.push(C9r.prototype[prop])
              }
              //... var NS = eYo.driver.newNS()
              //... var seed = eYo.genUID(eYo.IDENT)
              //... var driverId = 'X' + seed
              //... var d = newDriver(NS, driverId, {
              //...   methods: {
              //...     foo (...$) {
              //...       flag.push(1, ...$)
              //...     },
              //...   },
              //... })
              //... eYo.objectHasOwnProperty(chai.expect(d.eyo.C9r_p, 'foo')).true
              //... d.foo(2, 3)
              //... flag.expect(123)
            }
          })
        })
        if (ra.length === 1) return ra[0]
        if (ra.length) return {
          f (...$) {
            var ans = true
            ra.forEach(f => ans = f.call(this, ...$) && ans)
          }
        }.f // not a constructor
        return ans
      })()
      ans_f && this.cache.set(prop, ans_f)
      return ans_f
      //... var NS = eYo.driver.newNS()
      //... var seed = eYo.genUID(eYo.IDENT)
      //... var d = newDriver(NS, 'X' + seed, {
      //...   methods: {
      //...     do_it_1 (...$) {
      //...       flag.push(1, ...$)  
      //...     },
      //...     do_it_2 (...$) {
      //...       flag.push(2, ...$)  
      //...     },
      //...   },
      //... })
      //... d.do_it_1(2, 3)
      //... flag.expect(123)
      //... d.do_it_2(3, 4)
      //... flag.expect(234)
      //>>>
    },
    getOwnPropertyDescriptor(target, prop) {
      return Object.getOwnPropertyDescriptor(target, prop)
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
    set(target, prop, value) { // eslint-disable-line
      //<<< mochai: set
      return Reflect.set(...arguments)
      //... let driver = new eYo.O4t('driver', onr)
      //... let handler = new eYo.driver[eYo.$$.Handler]()
      //... let p = new Proxy(driver, handler)
      //... chai.expect(() => p.foo = 'bar').throw()
      //>>>
    },
    setPrototypeOf(target, proto) { // eslint-disable-line
      return false
    },
    //>>>
  },
  //>>>
})[eYo.$].finalizeC9r()

eYo.mixinFR(eYo.driver._p, {
  //<<< mochai: eYo driver methods
  makeBaseC9r (...$) {
    var C9r = eYo.driver.super._p.makeBaseC9r.call(this, ...$)
    this.setDriverC9r('', C9r)
    return C9r
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
eYo.driver.makeBaseC9r(true, {
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
    doInitUI (unused) { // eslint-disable-line
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
    doDisposeUI (unused) { // eslint-disable-line
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

eYo.mixinFR(eYo.Driver[eYo.$]._p, {
  //<<< mochai: model
  /**
   * Make the init method of the associate contructor.
   * Any constructor must have an init method.
   * @this {eYo.Driver[eYo.$]}
   * @param {Object} [model]
   */
  uiMerge (model) {
    //<<< mochai: eYo.Driver[eYo.$]._p.uiMerge
    //... var NS = eYo.driver.newNS()
    //... NS.newDriverC9r('Foo', {
    //...   init (key, owner, ...$) {
    //...     owner.flag(...$, 4)
    //...   },
    //...   doInitUI (what, ...$) {
    //...     what.flag(2, ...$)
    //...     return true
    //...   },
    //...   doDisposeUI (what, ...$) {
    //...     what.flag(...$, 4)
    //...   },
    //... })
    //... var foo = new NS.Foo('foo', onr, 2, 3)
    //... flag.expect(1234)
    //... chai.expect(foo.doInitUI(onr, 3, 4)).true
    //... flag.expect(1234)
    //... foo.doDisposeUI(onr, 2, 3)
    //... flag.expect(1234)
    //... var NS = eYo.driver.newNS()
    //... var d = newDriver(NS, 'X', {
    //...   doInitUI(onr, ...$) {
    //...     onr.flag(2, ...$)
    //...   },
    //...   doDisposeUI(onr, ...$) {
    //...     onr.flag(...$, 4)
    //...   },
    //... })
    //... d.doInitUI(onr, 3, 4)
    //... flag.expect(1234)
    //... d.doDisposeUI(onr, 2, 3)
    //... flag.expect(1234)
    model || (model = this.model)
    let C9r_p = this.C9r_p
    ;['doInitUI', 'doDisposeUI'].forEach(doK => {
      let f_m = model[doK]
      if (f_m) {
        C9r_p[doK] = f_m
      }
    })
    //>>>
  },
  /**
   * For subclassers.
   * @param {Object} model - model object
   */
  /**
   * Declare the given model for the associate constructor.
   * The default implementation just calls `methodsMerge` and `CONSTsMerge`.
   * 
   * @param {Object} model - Object, like for |newC9r|.
   */
  modelMerge (model) {
    model.methods && this.methodsMerge(model.methods)
    this.uiMerge(model)
    model.CONSTs && this.CONSTsMerge(model.CONSTs)
  },
  //>>>
})

eYo.Driver[eYo.$].finalizeC9r()
