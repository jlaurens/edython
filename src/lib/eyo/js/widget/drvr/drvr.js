/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
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
//...   ['(eYo.o4t).Foo', 'Foo'],
//... ]
//>>>

eYo.mixinRO(eYo.xre, {
  //<<< mochai: xre
  /**
   * Regular expression to get the driver ID form an identifier.
   * @name{eYo.xre.drvrId}
   * @private
   */
  drvrId: XRegExp(`^
  (?:(?:
    \\(.*?\\)(?:\\..*?)?|
    eYo\\..*?
  )\\.)?
  (?<path>.*\\.)?
  (?<Id>.*?)$`, 'x'),
  //<<< mochai: drvrId
  //... ;[
  //...   ['Bar', eYo.NA, 'Bar'],
  //...   ['mee.Bar', 'mee.', 'Bar'],
  //...   ['eYo.mee.Bar', eYo.NA, 'Bar'],
  //...   ['eYo.foo.mee.Bar', 'mee.', 'Bar'],
  //...   ['(foo).mee.Bar', eYo.NA, 'Bar'],
  //...   ['(chi).foo.mee.Bar', 'mee.', 'Bar'],
  //...   ['(eYo.o4t).Foo', eYo.NA, 'Foo'],
  //... ].forEach(ra => {
  //...   let m = XRegExp.exec(ra[0], eYo.xre.drvrId)
  //...   chai.expect(m).not.undefined
  //...   chai.expect(m['path']).equal(ra[1])
  //...   chai.expect(m['Id']).equal(ra[2])
  //... })
  //>>>
  /**
   * Regular expression to extract the parent driver ID form an identifier.
   * @name{eYo.xre.drvrParentId}
   * @private
   */
  drvrParentId: XRegExp(`^(?<parentId>.*)\\..*?$`),//
  //<<< mochai: drvrParentId
  //... var m = XRegExp.exec('foo', eYo.xre.drvrParentId)
  //... chai.expect(!!m).false
  //... ;[
  //...   ['foo.bar.mee', 'foo.bar'],
  //...   ['foo.bar', 'foo'],
  //... ].forEach(ra => {
  //...   var m = XRegExp.exec(ra[0], eYo.xre.drvrParentId)
  //...   chai.expect(m).not.undefined
  //...   chai.expect(m['parentId']).equal(ra[1])
  //... })
  //>>>
  //>>>
})

/**
 * This namespace declares important methods.
 * @name {eYo.drvr}
 * @namespace
 */
eYo.o4t.newNS(eYo, 'drvr')
//<<< mochai: Basics
//... chai.assert(eYo.drvr)
//>>>

//<<< mochai: ../
//... let newDrvr = (NS, id, drvrModel = {}) => {
//...   let C9r = NS.newC9r(id, drvrModel)
//...   C9r[eYo.$].finalizeC9r()
//...   NS.setDrvrC9r(id, C9r)
//...   return NS.getDrvr(id)
//... }
//>>>

// make a new symbol to let a driver point to its parent.
eYo.make$$('parent')

{
  // private symbol
  let $C9rMap = Symbol('C9rMap')
  let $map = Symbol('map')
  eYo.mixinFR(eYo.drvr, {
    [$C9rMap]: new Map(),
    [$map]: new Map(),
  })
  eYo.mixinFR(eYo.drvr._p, {
    //<<< mochai: eYo.drvr extensions
    /**
     * Turns the given string into a formatted driver Id.
     * @param {String} id 
     */
    getDrvrId (id) {
      //<<< mochai: getDrvrId
      let m = XRegExp.exec(id, eYo.xre.drvrId)
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
      //...   chai.expect(eYo.drvr.getDrvrId(ra[0])).equal(ra[1])
      //... })
      //>>>
    },
    /**
     * Adds storage for drivers.
     * @param  {...any} $ 
     */
    newNS (...$) {
      //<<< mochai: newNS
      //... chai.expect(eYo.drvr.newNS).not.equal(eYo.drvr.super.newNS)
      //... var NS1 = eYo.drvr.newNS()
      //... chai.expect(NS1.newNS).not.equal(eYo.drvr.super.newNS)
      //... var NS2 = NS1.newNS()
      //... chai.expect(NS2.newNS).not.equal(eYo.drvr.super.newNS)
      let NS = eYo.drvr.super.newNS.call(this, ...$)
      eYo.mixinFR(NS, {
        [$C9rMap]: new Map(),
        [$map]: new Map(),
      })
      // add a reference to the parent namespace
      // NS[eYo.$$.parent] = ...
      var super$ = this
      while (super$ !== eYo.drvr) {
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
     * @param {String} drvrId
     */
    getDrvrC9r (drvrId) {
      return this[$C9rMap].get(this.getDrvrId(drvrId))
    },
    /**
     * Set the driver constructor for the given id.
     * @param {String} drvrId
     * @param {C9r} C9r
     */
    setDrvrC9r (drvrId, C9r) {
      //<<< mochai: (set|get)DrvrC9r
      drvrId = this.getDrvrId(drvrId)
      this[$C9rMap].set(drvrId, C9r)
      C9r[eYo.$].drvrId = drvrId
      return C9r
      //... var NS0 = eYo.drvr.newNS()
      //... var C9r0 = NS0.newDrvrC9r()
      //... NAMES.forEach(ra => {
      //...   NS0.setDrvrC9r(ra[0], C9r0)
      //...   var Drvr = NS0.getDrvrC9r(ra[0])
      //...   chai.expect(Drvr).equal(C9r0)
      //...   chai.expect(NS0.getDrvrC9r(ra[1])).equal(Drvr)
      //... })
      //... ;[eYo.drvr, NS0].forEach(NS => {
      //...   var NS1 = NS.newNS()
      //...   var C9r1 = NS1.newDrvrC9r()
      //...   NAMES.forEach(ra => {
      //...     NS1.setDrvrC9r(ra[0], C9r1)
      //...     var Drvr = NS1.getDrvrC9r(ra[0])
      //...     chai.expect(Drvr).equal(C9r1)
      //...     chai.expect(Drvr).not.equal(C9r0)
      //...     chai.expect(NS1.getDrvrC9r(ra[1])).equal(Drvr)
      //...     NS1.setDrvrC9r(ra[1], C9r1)
      //...     var Drvr = NS1.getDrvrC9r(ra[0])
      //...     chai.expect(Drvr).equal(C9r1)
      //...     chai.expect(Drvr).not.equal(C9r0)
      //...     chai.expect(NS1.getDrvrC9r(ra[1])).equal(Drvr)
      //...   })
      //... })
      //>>>
    },
    /**
     * Usage: `eYo.drvr.newDrvrC9r('Foo', model)`.
     * This is the recommanded way to create a driver constructor.
     * Actual implementation with fcls, fcfl, dom and svg drivers.
     * Convenient driver constructor maker.
     * The prototype will have eventually an `do_initUI` or `do_disposeUI`
     * wrapping the model's eponym methods, if any.
     * The owner will have a default driver named `BaseC9r`,
     * which is expected to be the ancestor of all drivers.
     * @param {String} id - a (titlecased) word, the name of the subclass (last component)
     * @param {Function} [SuperC9r] - the super class of the driver constructor,
     * defaults to the owner's super_'s key property or the owner's `BaseC9r`.
     * @param {Object} [drvrModel]
     * An object with various keys:
     * - owner: An object owning the class, basically a namespace object.
     * If the owner is `Foo` and the key is 'Bar', the created constructor
     * is `Foo.Bar`. Actually used with `eYo` as owner, 'dom' or 'svg' as key.
     * - do_initUI: an optional function with signature (object, ...)->eYo.NA
     * - do_disposeUI: an optional function with signature (object)->eYo.NA
     */
    newDrvrC9r (id, SuperC9r, drvrModel) {
      //<<< mochai: newDrvrC9r
      //... chai.expect(eYo.drvr.newDrvrC9r).eyo_F
      //... var NS = eYo.drvr.newNS()
      //... chai.expect(NS.newDrvrC9r('Foo')).equal(NS.Foo)
      //... chai.expect(NS.Foo).eyo_C9r
      if (!eYo.isSubclass(SuperC9r, eYo.Drvr)) {
        eYo.isNA(drvrModel) || eYo.throw(`${this.name}/newDrvrC9r: Unexpected model.`)
        ;[SuperC9r, drvrModel] = [this.super.getDrvrC9r && this.super.getDrvrC9r(id) || this.BaseC9r, eYo.called(SuperC9r) || {}]
      }
      let Drvr = eYo.c9r.doNewC9r(this, id, SuperC9r, drvrModel || {})
      Drvr[eYo.$].finalizeC9r()
      return this.setDrvrC9r(id, Drvr)
      //... NAMES.forEach(ra => {
      //...   var NS = eYo.drvr.newNS()
      //...   var Drvr = NS.newDrvrC9r(ra[0])
      //...   chai.expect(Drvr).equal(NS[ra[0]])
      //...   var NS = eYo.drvr.newNS()
      //...   var Drvr = NS.newDrvrC9r(ra[1])
      //...   chai.expect(Drvr).equal(NS[ra[1]])
      //... })
      //... var NS = eYo.drvr.newNS()
      //... var id = `X${eYo.genUID(eYo.IDENT)}`
      //... var D1 = NS.newDrvrC9r(id)
      //... chai.expect(D1).equal(NS[id])
      //... var Drvr = NS.getDrvrC9r(id)
      //... chai.expect(D1).equal(Drvr)
      //... var drvr = NS.getDrvr(id)
      //... chai.expect(drvr).instanceOf(Drvr)
      //... var id = `X${eYo.genUID(eYo.IDENT)}`
      //... var D2 = NS.newDrvrC9r(id, D1)
      //... var Drvr = NS.getDrvrC9r(id)
      //... chai.expect(D2).equal(Drvr)
      //... var drvr = NS.getDrvr(id)
      //... chai.expect(drvr).instanceOf(D1)
      //... chai.expect(drvr).instanceOf(D2)
      //... var id = eYo.genUID(eYo.IDENT)
      //... NS.newDrvrC9r(id, {
      //...   do_initUI (onr, ...$) {
      //...     onr.flag(2, ...$)
      //...   },
      //... })
      //... var drvr = NS.getDrvr(id)
      //... drvr.do_initUI(onr, 3, 4)
      //... flag.expect(1234)
      //... var id = eYo.genUID(eYo.IDENT)
      //... NS.newDrvrC9r(id, {
      //...   do_disposeUI (onr, ...$) {
      //...     onr.flag(2, ...$)
      //...   },
      //... })
      //... var drvr = NS.getDrvr(id)
      //... drvr.do_disposeUI(onr, 3, 4)
      //... flag.expect(1234)
      //>>>
    },
    /**
     * @name{newDrvrProxy_}
     * Returns a driver proxy.
     * @param {*} target - the target.
     * @return {eYo.drvr.BaseC9r}
     */
    newDrvrProxy_ (target) {
      return new Proxy(target, new eYo.drvr[eYo.$$.Handler]())
    },
    /**
     * @name{getDrvr}
     * Returns a driver, based on the given object's constructor name.
     * If the receiver is `eYo.fcfl.mngr` and the object's constructor name is `Foo.Bar` then the returned driver is an instance of `eYo.fcfl.Foo.Bar`, `eYo.fcfl.Foo` as soon as it is a driver constructor, otherwise it is the all purpose driver.
     * @param {*} object - the object for which a driver is required.
     * @return {eYo.drvr.BaseC9r}
     */
    getDrvr (object, ...$) {
      //<<< mochai: (get|set)Drvr
      //... // The base driver is directly accessible.
      //... chai.expect(eYo.drvr.getDrvr('')[eYo.$$.target]).not.undefined
      object.eyo && (object = object.eyo.name)
      var drvrId = this.getDrvrId(object)
      //... var NS, NS1, drvr, drvr1, target
      //... NS = eYo.drvr.newNS()
      //... NAMES.forEach(ra => {
      //...   var NS = eYo.drvr.newNS()
      //...   let drvr = newDrvr(NS, eYo.genUID())
      //...   NS.setDrvr(ra[0], drvr)
      //...   chai.expect(NS.getDrvr(ra[0])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(NS.getDrvr(ra[1])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(NS.getDrvr(ra[0])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(NS.getDrvr(ra[1])[eYo.$$.target]).equal(drvr)
      //...   var NS = eYo.drvr.newNS()
      //...   NS.setDrvr(ra[1], drvr)
      //...   chai.expect(NS.getDrvr(ra[0])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(NS.getDrvr(ra[1])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(NS.getDrvr(ra[0])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(NS.getDrvr(ra[1])[eYo.$$.target]).equal(drvr)
      //... })
      //... var C9rA = eYo.drvr.newC9r()
      //... C9rA[eYo.$].finalizeC9r()
      //... var C9rAB = eYo.drvr.newC9r()
      //... C9rAB[eYo.$].finalizeC9r()
      //... var C9rABC = eYo.drvr.newC9r()
      //... C9rABC[eYo.$].finalizeC9r()
      var drvr = this[$map].get(drvrId)
      if (drvr) {
        //... NS = eYo.drvr.newNS()
        //... NS.setDrvrC9r('A', C9rA)
        //... drvr = NS.getDrvr('A')
        //... chai.expect(drvr).equal(NS.getDrvr('A'))
        return drvr
      }
      var saveId = drvrId
      while(true) { // eslint-disable-line
        var C9r = this.getDrvrC9r(drvrId)
        if (C9r) {
          //... NS = eYo.drvr.newNS()
          //... NS.setDrvrC9r('A', C9rA)
          //... chai.expect(NS.getDrvrC9r('A')).equal(C9rA)
          //... drvr = NS.getDrvr('A')
          //... chai.expect(drvr.eyo.C9r).equal(C9rA)
          //... chai.expect(drvr[eYo.$$.target]).instanceOf(eYo.Drvr)
          //... chai.expect(drvr[eYo.$$.target][eYo.$$.target]).undefined
          var drvr_t = new C9r(drvrId, this, ...$)
        } else if (this.super && this.super.getDrvr) {
          drvr_t = this.super.getDrvr(drvrId)[eYo.$$.target]
          //... NS = eYo.drvr.newNS()
          //... NS.setDrvrC9r('A', C9rA)
          //... NS1 = NS.newNS()
          //... chai.expect(NS.getDrvrC9r('A')).equal(C9rA)
          //... chai.expect(NS1.getDrvrC9r('A')).undefined
          //... drvr1 = NS1.getDrvr('A')
          //... chai.expect(drvr1.eyo.C9r).equal(C9rA)
          //... drvr = NS.getDrvr('A')
          //... chai.expect(drvr1).not.equal(drvr)
          //... chai.expect(drvr1[eYo.$$.target]).equal(drvr[eYo.$$.target])
        }
        if (drvr_t) {
          //... NS = eYo.drvr.newNS()
          //... NS.setDrvrC9r('A', C9rA)
          //... drvr = NS.getDrvr('A')
          //... var drvr_t = drvr[eYo.$$.target]
          //... chai.expect(drvr.eyo).equal(drvr_t.eyo)
          //... chai.expect(drvr.ns).equal(drvr_t.ns)
          return this.setDrvr(saveId, drvr_t)
        }
        var m = XRegExp.exec(drvrId, eYo.xre.drvrParentId)
        if (m) {
          drvrId = m['parentId']
          drvr = this[$map].get(drvrId)
          if (drvr) {
            //... NS = eYo.drvr.newNS()
            //... NS.setDrvrC9r('A', C9rA)
            //... target = NS.getDrvr('A')[eYo.$$.target]
            //... chai.expect(NS.getDrvr('A')[eYo.$$.target]).equal(target)
            //... chai.expect(NS.getDrvr('A.B')[eYo.$$.target]).not.equal(target)
            //... chai.expect(NS.getDrvr('A.B.C')[eYo.$$.target]).not.equal(target)
            //... target = eYo.drvr.getDrvr('A')[eYo.$$.target]
            //... chai.expect(NS.getDrvr('A.B')[eYo.$$.target]).equal(target)
            //... chai.expect(NS.getDrvr('A.B.C')[eYo.$$.target]).equal(target)
            return this.setDrvr(saveId, drvr[eYo.$$.target])
          }
        } else {
          //... NS = eYo.drvr.newNS()
          //... drvr = NS.getDrvr('')
          //... chai.expect(drvr).equal(NS.getDrvr(''))
          //... target = drvr[eYo.$$.target]
          //... chai.expect(NS.getDrvr('A')[eYo.$$.target]).equal(target)
          //... chai.expect(NS.getDrvr('A.B')[eYo.$$.target]).equal(target)
          //... chai.expect(NS.getDrvr('A.B.C')[eYo.$$.target]).equal(target)
          if ((drvr = this[$map].get(''))) {
            return this.setDrvr(saveId, drvr[eYo.$$.target])
          }
          drvr_t = this.new('')
          this.setDrvr('', drvr_t)
          return this.setDrvr(saveId, drvr_t)
        }
        //... NS = eYo.drvr.newNS()
        //... NS.setDrvrC9r('A', C9rA)
        //... var drvr = NS.getDrvr({
        //...   eyo: {
        //...     name: `${eYo.genUID(eYo.IDENT)}.${eYo.genUID(eYo.IDENT)}`,
        //...   },
        //... })
        //... chai.expect(drvr[eYo.$$.target]).equal(eYo.drvr.getDrvr('')[eYo.$$.target])
        //... var drvr = NS.getDrvr(`${eYo.genUID(eYo.IDENT)}.${eYo.genUID(eYo.IDENT)}`)
        //... chai.expect(drvr[eYo.$$.target]).equal(NS.getDrvr('')[eYo.$$.target])
      }
      //>>>
    },
    /**
     * Set the driver for the given id.
     * @param {String} id
     * @param {*} drvr_t - Driver instance, not a proxy.
     */
    setDrvr (object, drvr_t) {
      let drvr = this.newDrvrProxy_(drvr_t)
      object.eyo && (object = object.eyo.name)
      var id = this.getDrvrId(object)
      this[$map].set(id, drvr)
      return drvr
    },
    //>>>
  })
}

eYo.make$$('parentId', 'Handler')

eYo.c9r.newC9r(eYo.drvr, eYo.$$.Handler, {
  //<<< mochai: eYo.drvr[eYo.$$.Handler]
  //<<< mochai: Basics
  //... chai.expect(eYo.drvr).property(eYo.$$.Handler)
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
    defineProperty(target, key, descriptor) {
      if (key === eYo.$p6y) {
        Object.defineProperty(target, key, descriptor)
        return
      }
      eYo.throw(`${target.eyo.name} instances are frozen (no defineProperty).`)
    },
    deleteProperty(target, prop) { // eslint-disable-line
      eYo.throw(`${target.eyo.name} instances are frozen (no deleteProperty).`)
    },
    //<<< mochai: frozen or forbidden
    //... let NS = eYo.drvr.newNS()
    //... let d = newDrvr(NS, 'drvr')
    //... chai.expect(() => d()).throw()
    //... chai.expect(() => new d()).throw()
    //... chai.expect(() => d.defineProperty()).throw()
    //... chai.expect(() => d.deleteProperty()).throw()
    //>>>
    get (target, prop, receiver) { // eslint-disable-line
      //<<< mochai: get
      if (prop === eYo.$$.target && !eYo.objectHasOwnProperty(target, prop)) {
        return target
        //... var NS = eYo.drvr.newNS()
        //... var seed = eYo.genUID(eYo.IDENT)
        //... var d = newDrvr(NS, 'X' + seed)
        //... chai.expect(d[eYo.$$.target]).instanceOf(eYo.Drvr)
        //... chai.expect(d.eyo).not.undefined
        //... chai.expect(d.eyo).equal(d[eYo.$$.target].eyo)
      }
      var ans = this.cache.get(prop)
      if (ans) {
        return ans
      }
      if (prop === eYo.$p6y) {
        return this[prop]
      }
      ans = Reflect.get(target, prop)
      if (eYo.isDef(ans) && !eYo.isF(ans)) {
        return ans
      }
      var ans_f = (() => {
        // list all the model methods
        // make the table entries of all the drivers
        var ra = target.eyo.drvrId.split('.')
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
        while ((x = x.super) && x.getDrvrC9r) {
          nss.unshift(x)
        }
        ra = [] // enclosed
        nss.forEach(ns => {
          ids.forEach(id => {
            var C9r = ns.getDrvrC9r(id)
            if (C9r) {
              if (eYo.objectHasOwnProperty(C9r.prototype, prop)) {
                ra.push(C9r.prototype[prop])
              }
              //... var NS = eYo.drvr.newNS()
              //... var seed = eYo.genUID(eYo.IDENT)
              //... var drvrId = 'X' + seed
              //... var d = newDrvr(NS, drvrId, {
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
          $ (...$) {
            var ans = true
            ra.forEach(f => ans = f.call(this, ...$) && ans)
          }
        }.$ // not a constructor
        return ans
      })()
      ans_f && this.cache.set(prop, ans_f)
      return ans_f
      //... var NS = eYo.drvr.newNS()
      //... var seed = eYo.genUID(eYo.IDENT)
      //... var d = newDrvr(NS, 'X' + seed, {
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
    set(target, prop, value) {
      //<<< mochai: set
      //... let drvr = new eYo.O4t('drvr', onr)
      //... let handler = new eYo.drvr[eYo.$$.Handler]()
      //... let p = new Proxy(drvr, handler)
      if (prop === eYo.$p6y) {
        this[prop] = value
        return true
        //... chai.expect(p[eYo.$p6y] = 421).equal(p[eYo.$p6y])
      }
      //... chai.expect(() => p.foo = 'bar').throw()
      eYo.throw(`Frozen proxy to driver ${target.driverId}: forbidden key is ${prop}`)
      //>>>
    },
    setPrototypeOf(target, proto) { // eslint-disable-line
      return false
    },
    //>>>
  },
  //>>>
})[eYo.$].finalizeC9r()

eYo.mixinFR(eYo.drvr._p, {
  //<<< mochai: eYo driver methods
  // Registers the constructor
  makeBaseC9r (...$) {
    //<<< mochai: makeBaseC9r
    var C9r = eYo.drvr.super._p.makeBaseC9r.call(this, ...$)
    this.setDrvrC9r('', C9r)
    return C9r
    //... let NS = eYo.drvr.newNS()
    //... let C9r = NS.makeBaseC9r()
    //... chai.expect(C9r).equal(NS.getDrvrC9r(''))
    //>>>
  },
  /**
   * Convenient method to make simple driver forwarders.
   * Usefull when some methods should simply forward the almost eponym message to the driver.
   * On return we simply have
   * ```pttp[key] = (...$) => { return this.drvr['do_' + key](this, ...$)}```
   * @param {Object} _p - a prototype
   * @param {String} key - a function name
   */
  makeForwarder (_p, ...$) {
    //<<< mochai: makeForwarder
    $.forEach(key => _p[key] = { $ (...$) {
      return this.drvr['do_' + key](this, ...$)
    }}.$)
    //... var o = eYo.c9r.new({})
    //... o.tag = 1
    //... o.drvr = new eYo.Drvr('foo', onr)
    //... o.drvr.do_bar = function (object, ...$) {
    //...   flag.push(object.tag, 2, ...$, 5)
    //... }
    //... eYo.drvr.makeForwarder(o, 'bar')
    //... o.bar(3, 4)
    //... flag.expect(12345)
    //>>>
  },
  //>>>
})  

/**
 * @name {eYo.drvr.BaseC9r}
 * Default convenient driver, to be subclassed.
 */
eYo.drvr.makeBaseC9r(true, {
  //<<< mochai: eYo.Drvr
  properties: {
    //<<< mochai: properties
    mngr: {
      //<<< mochai: mngr
      //... var drvr = new eYo.Drvr('foo', onr)
      //... chai.expect(drvr.owner).equal(onr)
      //... chai.expect(drvr.mngr).equal(onr)
      //... chai.expect(() => drvr.mngr_ = 'bar').throw()
      //... chai.expect(() => drvr.mngr = 'bar').throw()
      //... let ns = eYo.drvr.newNS()
      //... ns.makeBaseC9r()
      //... driver = ns.new({}, 'foo', onr)
      //... chai.expect(drvr.owner).equal(onr)
      //... chai.expect(drvr.mngr).equal(onr)
      //... chai.expect(() => drvr.mngr_ = 'bar').throw()
      //... chai.expect(() => drvr.mngr = 'bar').throw()
      get () {
        return this.owner
      },
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
    do_initUI (unused) { // eslint-disable-line
      //<<< mochai: do_initUI
      return true
      //... let drvr = new eYo.Drvr('foo', onr)
      //... chai.expect(drvr.do_initUI).eyo_F
      //... chai.expect(drvr.do_initUI(1, 2, 3)).true
      //>>>
    },
    /**
     * Dispose of the UI.
     * Default implementation does nothing.
     * @param {*} object
     * @return {Boolean}
     */
    do_disposeUI (unused) { // eslint-disable-line
      //<<< mochai: do_disposeUI
      return true
      //... let drvr = new eYo.Drvr('foo', onr)
      //... chai.expect(drvr.do_disposeUI).eyo_F
      //... chai.expect(drvr.do_disposeUI(1, 2, 3)).true
      //>>>
    },
    //>>>
  },
  //>>>
})

eYo.mixinFR(eYo.Drvr$._p, {
  //<<< mochai: model
  /**
   * Make the init method of the associate contructor.
   * Any constructor must have an init method.
   * @this {eYo.Drvr$}
   * @param {Object} [model]
   */
  uiMerge (model) {
    //<<< mochai: eYo.Drvr$._p.uiMerge
    //... var NS = eYo.drvr.newNS()
    //... NS.newDrvrC9r('Foo', {
    //...   init (key, owner, ...$) {
    //...     owner.flag(...$, 4)
    //...   },
    //...   do_initUI (what, ...$) {
    //...     what.flag(2, ...$)
    //...     return true
    //...   },
    //...   do_disposeUI (what, ...$) {
    //...     what.flag(...$, 4)
    //...   },
    //... })
    //... var foo = new NS.Foo('foo', onr, 2, 3)
    //... flag.expect(1234)
    //... chai.expect(foo.do_initUI(onr, 3, 4)).true
    //... flag.expect(1234)
    //... foo.do_disposeUI(onr, 2, 3)
    //... flag.expect(1234)
    //... var NS = eYo.drvr.newNS()
    //... var d = newDrvr(NS, 'X', {
    //...   do_initUI(onr, ...$) {
    //...     onr.flag(2, ...$)
    //...   },
    //...   do_disposeUI(onr, ...$) {
    //...     onr.flag(...$, 4)
    //...   },
    //... })
    //... d.do_initUI(onr, 3, 4)
    //... flag.expect(1234)
    //... d.do_disposeUI(onr, 2, 3)
    //... flag.expect(1234)
    model || (model = this.model)
    let C9r_p = this.C9r_p
    ;['do_initUI', 'do_disposeUI'].forEach(doK => {
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

eYo.Drvr$.finalizeC9r()

eYo.mixinFR(eYo.o4t.Dlgt_p, {
  //<<< mochai: eYo.o4t.Dlgt
  /**
   * Add the driven feature to the receiver's constructor.
   */
  drvrEnhanced () {
    //<<< mochai: drvrEnhanced
    //... let mngr = eYo.drvr.newNS()
    //... mngr.makeBaseC9r({
    //...   methods: {
    //...     do_push1 (instance, ...$) {
    //...       flag.push(1, ...$)
    //...     },
    //...   },
    //... })
    //... let drvr = mngr.getDrvr('')
    //... chai.expect(drvr).instanceOf(mngr.BaseC9r)
    //... setup({
    //...   properties: {
    //...     drvr
    //...   }
    //... })
    //... chai.expect(onr.drvr).equal(drvr)
    //... let ns = eYo.o4t.newNS()
    //... ns.makeBaseC9r()
    //... mngr.newDrvrC9r('Foo', {
    //...   methods: {
    //...     do_push2 (instance, ...$) {
    //...       flag.push(2, ...$)
    //...     },
    //...   },
    //... })
    //... ns.newC9r('Foo')
    //... ns.Foo$.drvrEnhanced()
    //... ns.Foo$.finalizeC9r()    
    //... eYo.drvr.makeForwarder(ns.Foo_p, 'push1')
    //... eYo.drvr.makeForwarder(ns.Foo_p, 'push2')
    //... let driven = new ns.Foo('foo', onr)
    //... driven.push1(2, 3)
    //... flag.expect(123)
    //... driven.push2(4, 6)
    //... flag.expect(246)
    
    this.p6yMerge({
      /**
       * The driver of the receiver
       */
      drvr: {
        lazy () {
          let onr = this.owner
          let mngr = onr ? onr.drvr.mngr: eYo.driver
          return mngr.getDrvr(this)
        },
      },
    })
    //>>>
  },
  //>>>
})