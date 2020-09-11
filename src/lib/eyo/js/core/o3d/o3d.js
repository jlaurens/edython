/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview An object that is owned by someone else.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.mixinFR(eYo._p, {
  /**
   * Whether the argument is a property instance.
   * @param {*} what 
   */
  isOwner (what) {
    return eYo.isaC3s(what) || eYo.isNS(what)
    //<<< mochai: isOwner (what)
    //... chai.expect(eYo.isOwner(true)).false
    //... chai.expect(eYo.isOwner(new eYo.c3s.BaseC3s())).true
    //... chai.expect(eYo.isOwner(eYo.newNS())).true
    //>>>
  }
})

/**
 * Namespace for owned objects.
 * Quite all the objects are owned.
 * Only a very few of them are top level object.
 * @name {eYo.o3d}
 * @namespace
 */
eYo.c3s.newNS(eYo, 'o3d', {
  //<<< mochai: CONST
  OWNER: new eYo.C3s('OWNER')
  //... chai.expect(eYo.isaC3s(eYo.o3d.OWNER)).true
  //>>>
})

eYo.mixinFR(eYo.o3d, {
  /**
   * Prepares the given instance as owned.
   * For subclassers.
   * @param{eYo.O3d} $this - the instance to initialize
   * @param{String | Symbol} key - The key in the owner
   * @param{eYo.C3s | namespace} [owner] - Defaults to the name space
   * @param{Boolean} [configurable] - Whether descriptors should be configurable, necessary for proxy.
   */
  c3sPrepare ($this, key, owner, configurable) {
    eYo.isId(key) || eYo.throw('eYo.o3d.c3sPrepare: Bad key')
    if (!eYo.isOwner(owner)) {
      eYo.isNA(configurable) || eYo.throw(`eYo.o3d.c3sPrepare: Unexpected argument (${configurable})`)
      ;[owner, configurable] = [$this.eyo.ns, owner]
    }
    $this.owner__ = owner
    $this.key_ = key
    Object.defineProperties($this, {
      owner: eYo.descriptorR({$ () {
        return this.owner__
      }}.$, !!configurable),
      key: eYo.descriptorR({$ () {
        return this.key_
      }}.$, !!configurable),
    })
    $this.disposeUI = eYo.doNothing
  },
  /**
   * The default implementation does nothing.
   * For subclassers.
   * @param{eYo.O3d} _$this - the instance to initialize
   * @param{String | Symbol} key - The key in the owner
   * @param{eYo.C3s | namespace} [owner] - Defaults to the name space
   * @param{Boolean} [configurable] - Whether descriptors should be configurable, necessary for proxy.
   */
  c3sInit (_$this, key, owner, configurable) {
  },
  /**
   * The default implementation does nothing.
   * For subclassers.
   * @param{eYo.O3d} $this - the instance to initialize
   * @param{String | Symbol} key - The key in the owner
   * @param{eYo.C3s | namespace} [owner] - Defaults to the name space
   * @param{Boolean} [configurable] - Whether descriptors should be configurable, necessary for proxy.
   */
  c3sDispose ($this) {
    $this.disposeUI()
    $this.owner__ = $this.key_ = eYo.NA
  },
})

/**
 * @name{eYo.o3d.BaseC3s}
 * @constructor
 * @property {eYo.c3s.BaseC3s} owner - the owning object
 * @readonly
 * @property {String} key - the identifier within the owning object
 * @readonly
 */
eYo.o3d.makeBaseC3s({
  /** 
   * @param {String} key - an identifier for the owner.
   * @param {eYo.c3s.BaseC3s} owner - the immediate owner of this object.
   */
  prepare (key, owner) {
    eYo.c3s.c3sPrepare(this)
    eYo.o3d.c3sPrepare(this, key, owner)
  },
  /** 
   * @param {String} key - an identifier for the owner.
   * @param {eYo.c3s.BaseC3s} owner - the immediate owner of this object.
   */
  init (key, owner) {
    eYo.o3d.c3sInit(this, key, owner)
    eYo.c3s.c3sInit(this)
  },
  dispose () {
    eYo.o3d.c3sDispose(this)
    eYo.c3s.c3sDispose(this)
  },  
})
//<<< mochai: BaseC3s
//... chai.assert(eYo.o3d)
//... eYo.objectHasOwnProperty(chai.assert(eYo.o3d._p, 'BaseC3s'))
//... chai.expect(eYo.o3d.BaseC3s).equal(eYo.O3d)
//>>>

eYo.mixinFR(eYo._p, {
  isaO3d (what) {
    return !!what && what instanceof eYo.O3d
    //<<< mochai: eYo.isaO3d
    //... chai.expect(eYo.isaO3d()).false
    //... chai.expect(eYo.isaO3d(eYo.NA)).false
    //... chai.expect(eYo.isaO3d(421)).false
    //... chai.expect(eYo.isaO3d(eYo.o3d.new('foo', eYo.test.onr))).true
    //>>>
  }
})

Object.assign(eYo.O3d_p, {
  /**
   * The default implementation does nothing.
   * For subclassers.
   * @param{*} before - the owner before the change
   * @param{*} after - the owner after the change
   */
  ownerWillChange: eYo.doNothing,
  /**
   * The default implementation does nothing.
   * For subclassers.
   * @param{*} before - the owner before the change
   * @param{*} after - the owner after the change
   */
  ownerDidChange (before, after) {
    if (after) {
      after.hasUI ? this.initUI() : this.disposeUI()
    }
  },
  /**
   * The default implementation does nothing.
   * For subclassers.
   */
  initUI: eYo.doNothing,
  /**
   * The default implementation does nothing.
   * For subclassers.
   */
  disposeUI: eYo.doNothing,
})


Object.defineProperties(eYo.O3d_p, {
  owner_: {
    get () {
      return this.owner__
    },
    set (after) {
      let before = this.owner__
      if (after !== before) {
        this.ownerWillChange(before, after)
        this.owner__ =  after
        this.ownerDidChange(before, after)
      }
    }
  },
})


eYo.forward('shared')

eYo.make$$('singleton')
//<<< mochai: eYo.$$.singleton
//... chai.expect(eYo.$$).property('singleton')
//>>>

eYo.mixinFR(eYo.o3d._p, {
  /**
   * Create a new instance based on the model.
   * @param {Object} model
   */
  singleton (model, owner) {
    return this.newNS().new(model, 'foo', owner)
  },
  /**
   * Create a new singleton instance based on the given model.
   * @param {Object} [NS] - Optional namespace, defaults to the receiver.
   * @param {String|Symbol} id - the result will be `NS[id]`
   * @param {Object} [model]
   * @return {Object}
   */
  newSingleton (NS, id, model) {
    //<<< mochai: newSingleton
    //... var id = eYo.genUID(eYo.IDENT)
    //... var sym = Symbol(id)
    //<<< mochai: basics
    //... var ans = eYo.o3d.newSingleton(id)
    //... chai.expect(eYo.o3d).property(id)
    //... chai.expect(eYo.o3d[id]).equal(ans)
    //... eYo.require(`o3d.${id}`)
    //... var ans = eYo.o3d.newSingleton(sym)
    //... chai.expect(eYo.o3d).property(sym)
    //... chai.expect(eYo.o3d[sym]).equal(ans)
    //... chai.expect(eYo.o3d.newSingleton(sym)).equal(ans)
    //>>>
    if (!eYo.isNS(NS)) {
      !model || eYo.throw(`${this.name}/newSingleton: Unexpected last parameter (${model})`)
      //<<< mochai: NS
      //... chai.expect(() => eYo.o3d.newSingleton(id, {}, 1)).xthrow()
      //>>>
      ;[NS, id, model] = [this, NS, id]
    }
    if (eYo.isId(id)) {
      if (eYo.objectHasOwnProperty(NS, id)) {
        return NS[id]
        //<<< mochai: unique
        //... chai.expect(eYo.o3d.newSingleton(id)).equal(eYo.o3d.newSingleton(id))
        //... chai.expect(eYo.o3d.newSingleton(sym)).equal(eYo.o3d.newSingleton(sym))
        //>>>
      }
    } else {
      //<<< mochai: id
      eYo.throw(`${this.name}/newSingleton: Unexpected parameter ${id}`)
      //... chai.expect(() => eYo.o3d.newSingleton(1)).xthrow()
      //>>>
    }
    //<<< mochai: SuperC3s
    //... var NS = eYo.o3d.newNS()
    //... NS.makeBaseC3s()
    if (model) {
      if (!model[eYo.$SuperC3s]) {
        model[eYo.$SuperC3s] = this.BaseC3s
        //... chai.expect(NS.newSingleton(Symbol(), {})).instanceOf(NS.BaseC3s)
      }
      //... var SuperC3s = NS.newC3s()
      //... SuperC3s[eYo.$].finalizeC3s()
      //... chai.expect(NS.newSingleton(Symbol(), {
      //...   [eYo.$SuperC3s]: SuperC3s,
      //... })).instanceOf(NS.BaseC3s)
      //... chai.expect(NS.newSingleton(Symbol(), {
      //...   [eYo.$SuperC3s]: eYo.NA,
      //... }).eyo$.SuperC3s).undefined
    } else {
      model = {
        [eYo.$SuperC3s]: this.BaseC3s,
      }
      //... chai.expect(NS.newSingleton(Symbol())).instanceOf(NS.BaseC3s)
    }
    //>>>
    //<<< mochai: owner
    let owner =  NS.OWNER || this.OWNER
    //... var NS0 = eYo.newNS()
    //... var NS1 = eYo.o3d.newNS()
    //... var NS2 = eYo.o3d.newNS({
    //...   OWNER: new eYo.C3s(),  
    //... })
    //... chai.expect(NS0.OWNER).undefined
    //... chai.expect(NS1.OWNER).equal(eYo.o3d.OWNER)
    //... chai.expect(NS2.OWNER).not.equal(NS1.OWNER)
    //... var ans = eYo.o3d.newSingleton(id)
    //... chai.expect(ans.owner).equal(eYo.o3d.OWNER)
    //... var ans = eYo.o3d.newSingleton(NS0, id)
    //... chai.expect(ans.owner).equal(eYo.o3d.OWNER)
    //... var ans = eYo.o3d.newSingleton(NS1, id)
    //... chai.expect(ans.owner).equal(NS1.OWNER)
    //... var ans = eYo.o3d.newSingleton(NS2, id)
    //... chai.expect(ans.owner).equal(NS2.OWNER)
    //... var ans = NS1.newSingleton(eYo.o3d, id)
    //... chai.expect(ans.owner).equal(eYo.o3d.OWNER)
    //... var ans = NS2.newSingleton(eYo.o3d, id)
    //... chai.expect(ans.owner).equal(eYo.o3d.OWNER)
    //>>>
    var ans = this.new(model || {}, id, owner)
    Object.defineProperty(NS, id, eYo.descriptorR({$ () {
      return ans
    }}.$))
    //<<< mochai: namespace
    //... chai.expect(eYo.o3d.newNS().newSingleton(id)).not.equal(eYo.o3d.newSingleton(id))
    //... chai.expect(eYo.o3d.newNS().newSingleton(sym)).not.equal(eYo.o3d.newSingleton(sym))
    //>>>
    ans[eYo.$$.singleton] = true
    //<<< mochai: private
    //... chai.expect(eYo.o3d.newSingleton(id)[eYo.$$.singleton]).true
    //>>>
    return ans
    //>>>
  },
})
