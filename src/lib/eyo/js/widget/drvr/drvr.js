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
//...   let C3s = NS.newC3s(id, drvrModel)
//...   C3s[eYo.$].finalizeC3s()
//...   NS.setDrvrC3s(id, C3s)
//...   return NS.getDrvr(id)
//... }
//>>>

// make a new symbol to let a driver point to its parent.
eYo.make$$('parent')

{
  // private symbol
  let $C3sMap = Symbol('C3sMap')
  let $map = Symbol('map')
  eYo.mixinFR(eYo.drvr, {
    [$C3sMap]: new Map(),
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
      //... chai.expect(eYo.drvr.newNS).not.equal(eYo.drvr.$super.newNS)
      //... var mngr1 = eYo.drvr.newNS()
      //... chai.expect(mngr1.newNS).not.equal(eYo.drvr.$super.newNS)
      //... var mngr2 = mngr1.newNS()
      //... chai.expect(mngr2.newNS).not.equal(eYo.drvr.$super.newNS)
      let NS = eYo.drvr.$super.newNS.call(this, ...$)
      eYo.mixinFR(NS, {
        [$C3sMap]: new Map(),
        [$map]: new Map(),
      })
      // add a reference to the parent namespace
      // NS[eYo.$$.parent] = ...
      var $super = this
      while ($super !== eYo.drvr) {
        $super = $super.$super
        var parent = $super[NS.key]
        if (parent) {
          NS[eYo.$$.parent] = parent
          //... mngr1.newNS('foo')
          //... mngr2.newNS('foo')
          //... chai.expect(mngr2.foo[eYo.$$.parent]).equal(mngr1.foo)
          //... var mngr3 = mngr2.newNS()
          //... mngr3.newNS('foo')
          //... chai.expect(mngr3.foo[eYo.$$.parent]).equal(mngr2.foo)
          //... mngr1.newNS('bar')
          //... mngr3.newNS('bar')
          //... chai.expect(mngr3.bar[eYo.$$.parent]).equal(mngr1.bar)
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
    getDrvrC3s (drvrId) {
      return this[$C3sMap].get(this.getDrvrId(drvrId))
    },
    /**
     * Set the driver constructor for the given id.
     * @param {String} drvrId
     * @param {C3s} C3s
     */
    setDrvrC3s (drvrId, C3s) {
      //<<< mochai: (set|get)DrvrC3s
      drvrId = this.getDrvrId(drvrId)
      this[$C3sMap].set(drvrId, C3s)
      C3s[eYo.$].drvrId = drvrId
      return C3s
      //... var NS0 = eYo.drvr.newNS()
      //... var C3s0 = NS0.newDrvrC3s()
      //... NAMES.forEach(ra => {
      //...   NS0.setDrvrC3s(ra[0], C3s0)
      //...   var Drvr = NS0.getDrvrC3s(ra[0])
      //...   chai.expect(Drvr).equal(C3s0)
      //...   chai.expect(NS0.getDrvrC3s(ra[1])).equal(Drvr)
      //... })
      //... ;[eYo.drvr, NS0].forEach(NS => {
      //...   var NS1 = NS.newNS()
      //...   var C3s1 = NS1.newDrvrC3s()
      //...   NAMES.forEach(ra => {
      //...     NS1.setDrvrC3s(ra[0], C3s1)
      //...     var Drvr = NS1.getDrvrC3s(ra[0])
      //...     chai.expect(Drvr).equal(C3s1)
      //...     chai.expect(Drvr).not.equal(C3s0)
      //...     chai.expect(NS1.getDrvrC3s(ra[1])).equal(Drvr)
      //...     NS1.setDrvrC3s(ra[1], C3s1)
      //...     var Drvr = NS1.getDrvrC3s(ra[0])
      //...     chai.expect(Drvr).equal(C3s1)
      //...     chai.expect(Drvr).not.equal(C3s0)
      //...     chai.expect(NS1.getDrvrC3s(ra[1])).equal(Drvr)
      //...   })
      //... })
      //>>>
    },
    /**
     * Usage: `eYo.drvr.newDrvrC3s('Foo', model)`.
     * This is the recommanded way to create a driver constructor.
     * Actual implementation with fcls, fcfl, dom and svg drivers.
     * Convenient driver constructor maker.
     * The prototype will have eventually an `do_initUI` or `do_disposeUI`
     * wrapping the model's eponym methods, if any.
     * The owner will have a default driver named `BaseC3s`,
     * which is expected to be the ancestor of all drivers.
     * @param {String} id - a (titlecased) word, the name of the subclass (last component)
     * @param {Function} [SuperC3s] - the super class of the driver constructor,
     * defaults to the owner's super_'s key property or the owner's `BaseC3s`.
     * @param {Object} [drvrModel]
     * An object with various keys:
     * - owner: An object owning the class, basically a namespace object.
     * If the owner is `Foo` and the key is 'Bar', the created constructor
     * is `Foo.Bar`. Actually used with `eYo` as owner, 'dom' or 'svg' as key.
     * - do_initUI: an optional function with signature (object, ...)->eYo.NA
     * - do_disposeUI: an optional function with signature (object)->eYo.NA
     */
    newDrvrC3s (id, SuperC3s, drvrModel) {
      //<<< mochai: newDrvrC3s
      //... chai.expect(eYo.drvr.newDrvrC3s).eyo_F
      //... var NS = eYo.drvr.newNS()
      //... chai.expect(NS.newDrvrC3s('Foo')).equal(NS.Foo)
      //... chai.expect(NS.Foo).eyo_C3s
      if (!eYo.isSubclass(SuperC3s, eYo.Drvr)) {
        eYo.isNA(drvrModel) || eYo.throw(`${this.name}/newDrvrC3s: Unexpected model.`)
        ;[SuperC3s, drvrModel] = [this.$super.getDrvrC3s && this.$super.getDrvrC3s(id) || this.BaseC3s, eYo.called(SuperC3s) || {}]
      }
      let Drvr = eYo.c3s.newC3s(this, id, SuperC3s, drvrModel || {})
      Drvr[eYo.$].finalizeC3s()
      return this.setDrvrC3s(id, Drvr)
      //... NAMES.forEach(ra => {
      //...   var mngr = eYo.drvr.newNS()
      //...   var Drvr = mngr.newDrvrC3s(ra[0])
      //...   chai.expect(Drvr).equal(mngr[ra[0]])
      //...   var mngr = eYo.drvr.newNS()
      //...   var Drvr = mngr.newDrvrC3s(ra[1])
      //...   chai.expect(Drvr).equal(mngr[ra[1]])
      //... })
      //... var mngr = eYo.drvr.newNS()
      //... var id = `X${eYo.genUID(eYo.IDENT)}`
      //... var D1 = mngr.newDrvrC3s(id)
      //... chai.expect(D1).equal(mngr[id])
      //... var Drvr = mngr.getDrvrC3s(id)
      //... chai.expect(D1).equal(Drvr)
      //... var drvr = mngr.getDrvr(id)
      //... chai.expect(drvr).instanceOf(Drvr)
      //... var id = `X${eYo.genUID(eYo.IDENT)}`
      //... var D2 = mngr.newDrvrC3s(id, D1)
      //... var Drvr = mngr.getDrvrC3s(id)
      //... chai.expect(D2).equal(Drvr)
      //... var drvr = mngr.getDrvr(id)
      //... chai.expect(drvr).instanceOf(D1)
      //... chai.expect(drvr).instanceOf(D2)
      //... var id = eYo.genUID(eYo.IDENT)
      //... mngr.newDrvrC3s(id, {
      //...   do_initUI (onr, ...$) {
      //...     onr.flag(2, ...$)
      //...   },
      //... })
      //... var drvr = mngr.getDrvr(id)
      //... drvr.do_initUI(onr, 3, 4)
      //... eYo.flag.expect(1234)
      //... var id = eYo.genUID(eYo.IDENT)
      //... mngr.newDrvrC3s(id, {
      //...   do_disposeUI (onr, ...$) {
      //...     onr.flag(2, ...$)
      //...   },
      //... })
      //... var drvr = mngr.getDrvr(id)
      //... drvr.do_disposeUI(onr, 3, 4)
      //... eYo.flag.expect(1234)
      //>>>
    },
    /**
     * @name{newDrvrProxy_}
     * Returns a driver proxy.
     * @param {*} target - the target.
     * @return {eYo.drvr.BaseC3s}
     */
    newDrvrProxy_ (target) {
      let handler = new eYo.drvr[eYo.$$.Handler]('', this)
      let ans = new Proxy(target, handler)
      if (ans.mngr !== this) {
        console.error('ERROR: BREAK HERE !!!')
        new eYo.drvr[eYo.$$.Handler]('', this)
      }
      return ans
    },
    /**
     * @name{getDrvr}
     * Returns a driver, based on the given object's constructor name.
     * If the receiver is `eYo.fcfl.mngr` and the object's constructor name is `Foo.Bar` then the returned driver is an instance of `eYo.fcfl.Foo.Bar`, `eYo.fcfl.Foo` as soon as it is a driver constructor, otherwise it is the all purpose driver.
     * @param {*} object - the object for which a driver is required.
     * @return {eYo.drvr.BaseC3s}
     */
    getDrvr (object, ...$) {
      //<<< mochai: (get|set)Drvr
      //... // The base driver is directly accessible.
      //... chai.expect(eYo.drvr.getDrvr('')[eYo.$$.target]).not.undefined
      object.eyo$ && (object = object.eyo$.name)
      var drvrId = this.getDrvrId(object)
      //... var mngr, mngr1, drvr, drvr1, target
      //... mngr = eYo.drvr.newNS()
      //... NAMES.forEach(ra => {
      //...   var mngr = eYo.drvr.newNS()
      //...   let drvr = newDrvr(mngr, eYo.genUID())
      //...   mngr.setDrvr(ra[0], drvr)
      //...   chai.expect(mngr.getDrvr(ra[0])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(mngr.getDrvr(ra[1])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(mngr.getDrvr(ra[0])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(mngr.getDrvr(ra[1])[eYo.$$.target]).equal(drvr)
      //...   var mngr = eYo.drvr.newNS()
      //...   mngr.setDrvr(ra[1], drvr)
      //...   chai.expect(mngr.getDrvr(ra[0])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(mngr.getDrvr(ra[1])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(mngr.getDrvr(ra[0])[eYo.$$.target]).equal(drvr)
      //...   chai.expect(mngr.getDrvr(ra[1])[eYo.$$.target]).equal(drvr)
      //... })
      //... var C3sA = eYo.drvr.newC3s()
      //... C3sA[eYo.$].finalizeC3s()
      //... var C3sAB = eYo.drvr.newC3s()
      //... C3sAB[eYo.$].finalizeC3s()
      //... var C3sABC = eYo.drvr.newC3s()
      //... C3sABC[eYo.$].finalizeC3s()
      var drvr = this[$map].get(drvrId)
      if (drvr) {
        //... mngr = eYo.drvr.newNS()
        //... mngr.setDrvrC3s('A', C3sA)
        //... drvr = mngr.getDrvr('A')
        //... chai.expect(drvr).equal(mngr.getDrvr('A'))
        return drvr
      }
      var saveId = drvrId
      // eslint-disable-next-line no-constant-condition
      while(true) {
        var C3s = this.getDrvrC3s(drvrId)
        if (C3s) {
          //... mngr = eYo.drvr.newNS()
          //... mngr.setDrvrC3s('A', C3sA)
          //... chai.expect(mngr.getDrvrC3s('A')).equal(C3sA)
          //... drvr = mngr.getDrvr('A')
          //... chai.expect(drvr.eyo$.C3s).equal(C3sA)
          //... chai.expect(drvr[eYo.$$.target]).instanceOf(eYo.Drvr)
          //... chai.expect(drvr[eYo.$$.target][eYo.$$.target]).undefined
          var drvr_t = new C3s(drvrId, this, ...$)
        } else {
          var super$ = this
          while ((super$ = super$.$super) && super$.getDrvr) {
            if ((drvr = super$[$map].get(drvrId))) {
              drvr_t = drvr[eYo.$$.target]
              break
            }
            //... mngr = eYo.drvr.newNS()
            //... mngr.setDrvrC3s('A', C3sA)
            //... chai.expect(mngr.getDrvrC3s('A')).equal(C3sA)
            //... drvr = mngr.getDrvr('A')
            //... chai.expect(drvr.eyo$.C3s).equal(C3sA)
            //... mngr1 = mngr.newNS()
            //... chai.expect(mngr1.getDrvrC3s('A')).undefined
            //... drvr1 = mngr1.getDrvr('A')
            //... chai.expect(drvr1).not.equal(drvr)
            //... chai.expect(drvr1).instanceOf(C3sA)
            //... chai.expect(drvr1).eqlDrvr(drvr)
          }
        }
        if (drvr_t) {
          //... mngr = eYo.drvr.newNS()
          //... mngr.setDrvrC3s('A', C3sA)
          //... drvr = mngr.getDrvr('A')
          //... var drvr_t = drvr[eYo.$$.target]
          //... chai.expect(drvr.eyo$).equal(drvr_t.eyo$)
          //... chai.expect(drvr.ns).equal(drvr_t.ns)
          return this.setDrvr(saveId, drvr_t)
        }
        var m = XRegExp.exec(drvrId, eYo.xre.drvrParentId)
        if (m) {
          drvrId = m['parentId']
          drvr = this[$map].get(drvrId)
          if (drvr) {
            //... mngr = eYo.drvr.newNS()
            //... mngr.setDrvrC3s('A', C3sA)
            //... drvr = mngr.getDrvr('A')
            //... chai.expect(mngr.getDrvr('A')).eqlDrvr(drvr)
            //... chai.expect(mngr.getDrvr('A.B')).eqlDrvr(drvr)
            //... chai.expect(mngr.getDrvr('A.B.C')).eqlDrvr(drvr)
            //... mngr = eYo.drvr.newNS()
            //... mngr.setDrvrC3s('A', C3sA)
            //... mngr.setDrvrC3s('A.B', C3sAB)
            //... chai.expect(mngr.getDrvr('A.B')).not.eqlDrvr(mngr.getDrvr('A'))
            //... chai.expect(mngr.getDrvr('A.B.C')).eqlDrvr(mngr.getDrvr('A.B'))
            //... mngr = eYo.drvr.newNS()
            //... mngr.setDrvrC3s('A', C3sA)
            //... mngr.setDrvrC3s('A.B', C3sAB)
            //... mngr.setDrvrC3s('A.B.C', C3sABC)
            //... chai.expect(mngr.getDrvr('A.B')).not.eqlDrvr(mngr.getDrvr('A'))
            //... chai.expect(mngr.getDrvr('A.B.C')).not.eqlDrvr(mngr.getDrvr('A.B'))
            return this.setDrvr(saveId, drvr[eYo.$$.target])
          }
        } else {
          //... mngr = eYo.drvr.newNS()
          //... drvr = mngr.getDrvr('')
          //... chai.expect(drvr).equal(mngr.getDrvr(''))
          //... target = drvr[eYo.$$.target]
          //... chai.expect(mngr.getDrvr('A')[eYo.$$.target]).equal(target)
          //... chai.expect(mngr.getDrvr('A.B')[eYo.$$.target]).equal(target)
          //... chai.expect(mngr.getDrvr('A.B.C')[eYo.$$.target]).equal(target)
          if ((drvr = this[$map].get(''))) {
            drvr_t = drvr[eYo.$$.target]
          } else {
            drvr_t = this.new('')
            this.setDrvr('', drvr_t)
          }
          return this.setDrvr(saveId, drvr_t)
        }
        //... mngr = eYo.drvr.newNS()
        //... mngr.setDrvrC3s('A', C3sA)
        //... var drvr = mngr.getDrvr({
        //...   eyo: {
        //...     name: `${eYo.genUID(eYo.IDENT)}.${eYo.genUID(eYo.IDENT)}`,
        //...   },
        //... })
        //... chai.expect(drvr).eqlDrvr(mngr.getDrvr(''))
        //... var drvr = mngr.getDrvr(`${eYo.genUID(eYo.IDENT)}.${eYo.genUID(eYo.IDENT)}`)
        //... chai.expect(drvr).eqlDrvr(mngr.getDrvr(''))
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
      object.eyo$ && (object = object.eyo$.name)
      var id = this.getDrvrId(object)
      this[$map].set(id, drvr)
      return drvr
    },
    //>>>
  })
}

eYo.make$$('parentId', 'Handler')

eYo.o3d.newC3s(eYo.drvr, eYo.$$.Handler, {
  //<<< mochai: eYo.drvr[eYo.$$.Handler]
  //<<< mochai: Basics
  //... chai.expect(eYo.drvr).property(eYo.$$.Handler)
  //>>>
  /**
   * Handler for real driver proxy.
   */
  // eslint-disable-next-line no-unused-vars
  init (key, owner) {
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
      eYo.throw(`${target.eyo$.name} instances are not callable.`)
    },
    construct(target, args) { // eslint-disable-line
      eYo.throw(`${target.eyo$.name} instances are not constructors.`)
    },
    defineProperty(target, key, descriptor) {
      if (key === eYo.$p6y) {
        Object.defineProperty(target, key, descriptor)
        return
      }
      eYo.throw(`${target.eyo$.name} instances are frozen (no defineProperty).`)
    },
    deleteProperty(target, prop) { // eslint-disable-line
      eYo.throw(`${target.eyo$.name} instances are frozen (no deleteProperty).`)
    },
    //<<< mochai: frozen or forbidden
    //... let mngr = eYo.drvr.newNS()
    //... let d = newDrvr(mngr, 'drvr')
    //... chai.expect(() => d()).xthrow()
    //... chai.expect(() => new d()).xthrow()
    //... chai.expect(() => d.defineProperty()).xthrow()
    //... chai.expect(() => d.deleteProperty()).xthrow()
    //>>>
    get (target, prop, receiver) { // eslint-disable-line
      //<<< mochai: get
      if (prop === eYo.$$.target && !eYo.objectHasOwnProperty(target, prop)) {
        return target
        //... var mngr = eYo.drvr.newNS()
        //... var seed = eYo.genUID(eYo.IDENT)
        //... var d = newDrvr(mngr, 'X' + seed)
        //... chai.expect(d[eYo.$$.target]).instanceOf(eYo.Drvr)
        //... chai.expect(d.eyo$).not.undefined
        //... chai.expect(d.eyo$).equal(d[eYo.$$.target].eyo$)
      }
      var ans = this.cache.get(prop)
      if (ans) {
        return ans
      }
      if (prop === eYo.$p6y) {
        return this[prop]
      }
      if (prop === 'mngr') {
        return this.owner
        //... chai.expect(eYo.drvr.getDrvr('').mngr).equal(eYo.drvr)
        //... var mngr = eYo.drvr.newNS()
        //... chai.expect(mngr.getDrvr('').mngr).equal(mngr)
        //... var mngr_mngr = mngr.newNS()
        //... chai.expect(mngr_mngr.getDrvr('').mngr).equal(mngr_mngr)
        //... mngr.newDrvrC3s('Foo')
        //... chai.expect(mngr.getDrvr('Foo').mngr).equal(mngr)
        //... mngr_mngr.newDrvrC3s('Foo')
        //... chai.expect(mngr_mngr.getDrvr('Foo').mngr).equal(mngr_mngr)
      }
      ans = Reflect.get(target, prop)
      if (eYo.isDef(ans) && !eYo.isF(ans)) {
        return ans
      }
      var ans_f = (() => {
        // list all the model methods
        // make the table entries of all the drivers
        var ra = target.eyo$.drvrId.split('.')
        var x = ra.shift()
        var ids = x
          ? ['', eYo.do.toTitleCase(x)]
          : ['']
        var component
        while ((component = ra.shift())) {
          ids.push(`${x}.${eYo.do.toTitleCase(component)}`)
          x = `${x}.${component}`
        }
        var nss = [x = target.eyo$.ns]
        if (!x) {
          console.error('NOT x')
        }
        while ((x = x.$super) && x.getDrvrC3s) {
          nss.unshift(x)
        }
        ra = [] // enclosed
        nss.forEach(ns => {
          ids.forEach(id => {
            var C3s = ns.getDrvrC3s(id)
            if (C3s) {
              if (eYo.objectHasOwnProperty(C3s.prototype, prop)) {
                ra.push(C3s.prototype[prop])
              }
              //... var mngr = eYo.drvr.newNS()
              //... var seed = eYo.genUID(eYo.IDENT)
              //... var drvrId = 'X' + seed
              //... var d = newDrvr(mngr, drvrId, {
              //...   methods: {
              //...     foo (...$) {
              //...       eYo.flag.push(1, ...$)
              //...     },
              //...   },
              //... })
              //... eYo.objectHasOwnProperty(chai.expect(d.eyo$.C3s_p, 'foo')).true
              //... d.foo(2, 3)
              //... eYo.flag.expect(123)
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
      //... var mngr = eYo.drvr.newNS()
      //... var seed = eYo.genUID(eYo.IDENT)
      //... var d = newDrvr(mngr, 'X' + seed, {
      //...   methods: {
      //...     do_it_1 (...$) {
      //...       eYo.flag.push(1, ...$)  
      //...     },
      //...     do_it_2 (...$) {
      //...       eYo.flag.push(2, ...$)  
      //...     },
      //...   },
      //... })
      //... d.do_it_1(2, 3)
      //... eYo.flag.expect(123)
      //... d.do_it_2(3, 4)
      //... eYo.flag.expect(234)
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
      //... let handler = new eYo.drvr[eYo.$$.Handler]('', onr)
      //... let p = new Proxy(drvr, handler)
      if (prop === eYo.$p6y) {
        this[prop] = value
        return true
        //... chai.expect(p[eYo.$p6y] = 421).equal(p[eYo.$p6y])
      }
      //... chai.expect(() => p.foo = 'bar').xthrow()
      eYo.throw(`Frozen proxy to driver ${target.driverId}: forbidden key is ${prop}`)
      //>>>
    },
    setPrototypeOf(target, proto) { // eslint-disable-line
      return false
    },
    //>>>
  },
  //>>>
})[eYo.$].finalizeC3s()

eYo.mixinFR(eYo.drvr._p, {
  //<<< mochai: eYo driver methods
  // Registers the constructor
  makeBaseC3s (...$) {
    //<<< mochai: makeBaseC3s
    var C3s = eYo.drvr.$super._p.makeBaseC3s.call(this, ...$)
    this.setDrvrC3s('', C3s)
    return C3s
    //... let mngr = eYo.drvr.newNS()
    //... let C3s = mngr.makeBaseC3s()
    //... chai.expect(C3s).equal(mngr.getDrvrC3s(''))
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
    //... var o = eYo.c3s.new({})
    //... o.tag = 1
    //... o.drvr = new eYo.Drvr('foo', onr)
    //... o.drvr.do_bar = function (object, ...$) {
    //...   eYo.flag.push(object.tag, 2, ...$, 5)
    //... }
    //... eYo.drvr.makeForwarder(o, 'bar')
    //... o.bar(3, 4)
    //... eYo.flag.expect(12345)
    //>>>
  },
  //>>>
})  

/**
 * @name {eYo.drvr.BaseC3s}
 * Default convenient driver, to be subclassed.
 */
eYo.drvr.makeBaseC3s(true, {
  //<<< mochai: eYo.Drvr
  properties: {
    //<<< mochai: properties
    mngr: {
      //<<< mochai: mngr
      //... var drvr = new eYo.Drvr('foo', onr)
      //... chai.expect(drvr.owner).equal(onr)
      //... chai.expect(drvr.mngr).equal(onr)
      //... chai.expect(() => drvr.mngr_ = 'bar').xthrow()
      //... chai.expect(() => drvr.mngr = 'bar').xthrow()
      //... let mngr = eYo.drvr.newNS()
      //... mngr.makeBaseC3s()
      //... driver = mngr.new({}, 'foo', onr)
      //... chai.expect(drvr.owner).equal(onr)
      //... chai.expect(drvr.mngr).equal(onr)
      //... chai.expect(() => drvr.mngr_ = 'bar').xthrow()
      //... chai.expect(() => drvr.mngr = 'bar').xthrow()
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
    //... var mngr = eYo.drvr.newNS()
    //... mngr.newDrvrC3s('Foo', {
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
    //... var foo = new mngr.Foo('foo', onr, 2, 3)
    //... eYo.flag.expect(1234)
    //... chai.expect(foo.do_initUI(onr, 3, 4)).true
    //... eYo.flag.expect(1234)
    //... foo.do_disposeUI(onr, 2, 3)
    //... eYo.flag.expect(1234)
    //... var mngr = eYo.drvr.newNS()
    //... var d = newDrvr(mngr, 'X', {
    //...   do_initUI(onr, ...$) {
    //...     onr.flag(2, ...$)
    //...   },
    //...   do_disposeUI(onr, ...$) {
    //...     onr.flag(...$, 4)
    //...   },
    //... })
    //... d.do_initUI(onr, 3, 4)
    //... eYo.flag.expect(1234)
    //... d.do_disposeUI(onr, 2, 3)
    //... eYo.flag.expect(1234)
    model || (model = this.model)
    let C3s_p = this.C3s_p
    ;['do_initUI', 'do_disposeUI'].forEach(doK => {
      let f_m = model[doK]
      if (f_m) {
        C3s_p[doK] = f_m
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
   * @param {Object} model - Object, like for |newC3s|.
   */
  modelMerge (model) {
    model.methods && this.methodsMerge(model.methods)
    this.uiMerge(model)
    model.CONSTs && this.CONSTsMerge(model.CONSTs)
  },
  //>>>
})

eYo.Drvr$.finalizeC3s()

eYo.mixinFR(eYo.o4t.Dlgt_p, {
  //<<< mochai: eYo.o4t.Dlgt
  /**
   * Add the driven feature to the receiver's constructor.
   */
  drvrEnhanced () {
    //<<< mochai: drvrEnhanced
    //<<< mochai: Basics
    //... let mngr = eYo.drvr.newNS()
    //... mngr.makeBaseC3s({
    //...   methods: {
    //...     do_push1 (instance, ...$) {
    //...       eYo.flag.push(1, ...$)
    //...     },
    //...   },
    //... })
    //... let drvr = mngr.getDrvr('')
    //... chai.expect(drvr).instanceOf(mngr.BaseC3s)
    //... setup({
    //...   properties: {
    //...     drvr
    //...   }
    //... })
    //... chai.expect(onr.drvr).equal(drvr)
    //... let ns = eYo.o4t.newNS()
    //... ns.makeBaseC3s()
    //... mngr.newDrvrC3s('Foo', {
    //...   methods: {
    //...     do_push2 (instance, ...$) {
    //...       eYo.flag.push(2, ...$)
    //...     },
    //...   },
    //... })
    //... ns.newC3s('Foo')
    //... ns.Foo$.drvrEnhanced()
    //... ns.Foo$.finalizeC3s()    
    //... mngr.makeForwarder(ns.Foo_p, 'push1')
    //... mngr.makeForwarder(ns.Foo_p, 'push2')
    //... let driven = new ns.Foo('foo', onr)
    //... driven.push1(2, 3)
    //... eYo.flag.expect(123)
    //... driven.push2(4, 6)
    //... eYo.flag.expect(246)
    //>>>
    this.p6yMerge({
      /**
       * The driver of the receiver
       */
      drvr: {
        lazy () {
          let onr = this.owner
          let mngr = onr ? onr.drvr.mngr: eYo.drvr
          return mngr.getDrvr(this)
        },
      },
    })
    let _p = this.C3s_p
    let f_p = _p.ownerDidChange
    /**
     * Hook for owner change
     * @name {ownerDidChange}
     * @param {Object} before 
     * @param {Object} after 
     */
    //<<< mochai: ownerDidChange
    var model
    if (f_p) {
      model = {
        $ (before, after) {
          f_p.call(this, before, after)
          this.drvr_p.reset()
        }
      }  
    } else {
      model = {
        // eslint-disable-next-line no-unused-vars
        $ (before, after) {
          this.drvr_p.reset()
        }
      }  
    }
    _p.ownerDidChange = model.$
    //... let mngr1 = eYo.drvr.newNS()
    //... mngr1.makeBaseC3s({
    //...   methods: {
    //...     do_push (instance, ...$) {
    //...       eYo.flag.push(1, ...$)
    //...     },
    //...   },
    //... })
    //... setup({
    //...   properties: {
    //...     drvr: mngr1.getDrvr(''),
    //...   },
    //... })
    //... let ns = eYo.o4t.newNS()
    //... ns.makeBaseC3s(true)
    //... mngr1.makeForwarder(ns.BaseC3s_p, 'push')
    //... ns.BaseC3s$.drvrEnhanced()
    //... ns.BaseC3s$.finalizeC3s()    
    //... let foo = ns.new({}, 'foo', onr)
    //... chai.expect(foo.drvr.do_push).eyo_F
    //... foo.push(2, 3)
    //... eYo.flag.expect(123)
    //... let mngr2 = eYo.drvr.newNS()
    //... mngr2.makeBaseC3s({
    //...   methods: {
    //...     do_push (instance, ...$) {
    //...       eYo.flag.push(2, ...$)
    //...     },
    //...   },
    //... })
    //... setup({
    //...   properties: {
    //...     drvr: mngr2.getDrvr(''),
    //...   },
    //... })
    //... foo.owner_ = onr
    //... chai.expect(foo.drvr.do_push).eyo_F
    //... foo.push(3, 4)
    //... eYo.flag.expect(234)
    //>>>

    //>>>
  },
  //>>>
})