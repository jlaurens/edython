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

/**
 * Namespace for owned objects.
 * Quite all the objects are owned.
 * Only a very few of them are top level object.
 * @name {eYo.o3d}
 * @namespace
 */
eYo.c9r.makeNS(eYo, 'o3d', {
  //<<< mochai: CONST
  OWNER: new eYo.C9r('OWNER')
  //... chai.expect(eYo.isaC9r(eYo.o3d.OWNER)).true
  //>>>
})
/**
 * @name{eYo.o3d.BaseC9r}
 * @constructor
 * @property {eYo.c9r.BaseC9r} owner - the owning object
 * @readonly
 * @property {String} key - the identifier within the owning object
 * @readonly
 */
eYo.o3d.makeBaseC9r({
  /** 
   * @param {String} key - an identifier for the owner.
   * @param {eYo.c9r.BaseC9r} owner - the immediate owner of this object.
   */
  init (key, owner) {
    this[eYo.$].o3dInitInstance(this, key, owner)
    this.disposeUI = eYo.doNothing
  },
  dispose () {
    this.disposeUI()
    this.owner__ = this.key_ = eYo.NA
  },  
})
//<<< mochai: BaseC9r
//... chai.assert(eYo.o3d)
//... chai.assert(eYo.o3d._p.hasOwnProperty('BaseC9r'))
//... chai.expect(eYo.o3d.BaseC9r).equal(eYo.O3d)
//>>>

eYo.mixinFR(eYo._p, {
  isaO3d (what) {
    return !!what && what instanceof eYo.o3d.BaseC9r
    //<<< mochai: eYo.isaO3d
    //... chai.expect(eYo.isaO3d()).false
    //... chai.expect(eYo.isaO3d(eYo.NA)).false
    //... chai.expect(eYo.isaO3d(421)).false
    //... chai.expect(eYo.isaO3d(eYo.o3d.new('foo', onr))).true
    //>>>
  }
})
/**
 * The default implementation does nothing.
 * For subclassers.
 * @param{Object} instance - the instance to initialize
 * @param{String | Symbol} key - The key in the owner
 * @param{Object} owner - the owner
 * @param{Boolean} [configurable] - Whether descriptors should be configurable, necessary for proxy.
 */
eYo.o3d.Dlgt_p.o3dInitInstance = function (instance, key, owner, configurable) {
  if (!eYo.isaC9r(owner)) {
    console.error('BREAK HERE!')
  }
  eYo.isaC9r(owner) || eYo.throw(`${this.name}.o3dInitInstance: Very bad owner (${owner})`)
  eYo.isId(key) || eYo.throw(`${this[eYo.$].name}: Bad key in init`)
  instance.owner__ = owner
  instance.key_ = key
  Object.defineProperties(instance, {
    owner: eYo.descriptorR(function () {
      return this.owner__
    }, !!configurable),
    key: eYo.descriptorR(function () {
      return this.key_
    }, !!configurable),
  })
}

/**
 * The default implementation does nothing.
 * For subclassers.
 * @param{*} before - the owner before the change
 * @param{*} after - the owner after the change
 */
eYo.o3d.BaseC9r_p.ownerWillChange = eYo.doNothing
/**
 * The default implementation does nothing.
 * For subclassers.
 * @param{*} before - the owner before the change
 * @param{*} after - the owner after the change
 */
eYo.o3d.BaseC9r.prototype.ownerDidChange = function (before, after) {
  if (after) {
    after.hasUI ? this.initUI() : this.disposeUI()
  }
}
/**
 * The default implementation does nothing.
 * For subclassers.
 */
eYo.o3d.BaseC9r.prototype.initUI = eYo.doNothing

/**
 * The default implementation does nothing.
 * For subclassers.
 */
eYo.o3d.BaseC9r.prototype.disposeUI = eYo.doNothing

Object.defineProperties(eYo.o3d.BaseC9r.prototype, {
  owner_: {
    get () {
      return this.owner__
    },
    set (after) {
      if (after !== this.owner__) {
        this.ownerWillChange(before, after)
        this.owner__ =  after
        this.ownerDidChange(before, after)
      }
    }
  },
})


eYo.forward('shared')

eYo.newSym('__singleton')
//<<< mochai: eYo.Sym.__singleton
//... chai.expect(eYo.Sym).property('__singleton')
//>>>

eYo.mixinFR(eYo.o3d._p, {
  /**
   * Create a new instance based on the model.
   * @param {Object} model
   */
  singleton (model, owner) {
    return this.makeNS().new(model, 'foo', owner)
  },
  /**
   * Create a new singleton instance based on the given model.
   * @param {Object} [NS] - Optional namespace, defaults to the receiver.
   * @param {String|Symbol} id - the result will be `NS[id]`
   * @param {Object} [model]
   * @return {Object}
   */
  makeSingleton (NS, id, model) {
    //<<< mochai: eYo.o3d.makeSingleton
    if (!eYo.isNS(NS)) {
      !model || eYo.throw(`Unexpected last parameter: ${model}`)
      ;[NS, id, model] = [this, NS, id]
    }
    if (eYo.isStr(id)) {
      if (NS.hasOwnProperty(id)) {
        return NS[id]
      }
    } else if (eYo.isSym(id)) {
      if (Object.getOwnPropertySymbols(NS).includes(id)) {
        return NS[id]
      }
    } else {
      eYo.throw(`Unexpected parameter ${id.toString()}`)
    }
    let owner =  NS.OWNER || this.OWNER || eYo.shared.OWNER
    var ans = this.new(model || {}, id, owner)
    if (eYo.isStr(id)) {
      Object.defineProperty(NS, id, eYo.descriptorR(function() {
        return ans
      }))
    } else {
      NS[id] = ans
    }
    ans[eYo.Sym.__singleton] = true
    return ans
    //... var id = eYo.genUID(eYo.IDENT)
    //... var singleton = eYo.o3d.makeSingleton(id)
    //... chai.expect(eYo.o3d).property(id)
    //... chai.expect(eYo.o3d[id]).equal(singleton)
    //... eYo.require(`o3d.${id}`)
    //... chai.expect(eYo.o3d.makeSingleton(id)).equal(singleton)
    //... var NS = eYo.o3d.makeNS()
    //... chai.expect(NS.OWNER).equal(eYo.o3d.OWNER)
    //... chai.expect(NS.makeSingleton(id)).not.equal(singleton)
    //... var NS = eYo.o3d.makeNS({
    //...   OWNER: new eYo.C9r(),
    //... })
    //... var ss = NS.makeSingleton(id)
    //... chai.expect(NS).property(id)
    //... chai.expect(NS[id]).equal(ss)
    //... chai.expect(ss).not.equal(singleton)
    //... chai.expect(NS).property(id)
    //... chai.expect(NS.makeSingleton(id)).equal(ss)
    //... var id = Symbol(id)
    //... var singleton = eYo.o3d.makeSingleton(id)
    //... chai.expect(eYo.o3d).property(id)
    //... chai.expect(eYo.o3d[id]).equal(singleton)
    //... chai.expect(eYo.o3d.makeSingleton(id)).equal(singleton)
    //... var NS = eYo.o3d.makeNS()
    //... chai.expect(NS.OWNER).equal(eYo.o3d.OWNER)
    //... chai.expect(NS.makeSingleton(id)).not.equal(singleton)
    //... var NS = eYo.o3d.makeNS({
    //...   OWNER: new eYo.C9r(),
    //... })
    //... var ss = NS.makeSingleton(id)
    //... chai.expect(NS).property(id)
    //... chai.expect(NS[id]).equal(ss)
    //... chai.expect(ss).not.equal(singleton)
    //... chai.expect(NS).property(id)
    //... chai.expect(NS.makeSingleton(id)).equal(ss)
    //>>>
  },
})
