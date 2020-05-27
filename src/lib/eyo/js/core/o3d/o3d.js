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
eYo.c9r.makeNS(eYo, 'o3d')
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
    this.eyo.o3dInitInstance(this, key, owner)
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

eYo.mixinR(false, eYo._p, {
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
 * @param{Object} instance - the owner before the change
 * @param{String} key - the owner before the change
 * @param{Object} owner - the owner after the change
 * @param{Boolean} [configurable] - Whether descriptors should be configurable, necessary for proxy.
 */
eYo.o3d.Dlgt_p.o3dInitInstance = function (instance, key, owner, configurable) {
  if (!eYo.isaC9r(owner)) {
    console.error('BREAK HERE!')
  }
  eYo.isaC9r(owner) || eYo.throw(`${this.name}.o3dInitInstance: Very bad owner (${owner})`)
  eYo.isStr(key) || eYo.throw(`${this.eyo.name}: Bad key in init`)
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

eYo.mixinR(false, eYo.o3d._p, {
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
   * @param {String} id - the result will be `NS[key]`
   * @param {Object} [model]
   * @return {Object}
   */
  makeSingleton (NS, id, model) {
    //<<< mochai: eYo.o3d.makeSingleton
    if (!eYo.isNS(NS)) {
      !model || eYo.throw(`Unexpected last parameter: ${model}`)
      ;[NS, id, model] = [this, NS, id]
    }
    eYo.isStr(id) || eYo.throw(`Unexpected parameter ${id}`)
    let ans = this.new(model || {}, id, eYo.shared.OWNER)
    let d = eYo.descriptorR(function() {
      return ans
    })
    Object.defineProperty(eYo.shared, id, d)
    Object.defineProperty(NS, id, d)
    ans.__singleton = true
    return ans
    //... var id = eYo.genUID(eYo.IDENT)
    //... eYo.o3d.makeSingleton(id)
    //... eYo.require(`o3d.${id}`)
    //>>>
    },
  /**
   * Create a new Base instance based on the model
   * No need to subclass. Override `Base`, `modelPath` and `modelHandle`.
   * @param {Object} owner
   * @param {String} key
   * @param {Object} model
   */
  prepare (model, key, owner, ...$) {
    if (!eYo.isD(model)) {
      let arg = owner
      ;[model, key, owner] = [eYo.NA, model, key]
      if (!eYo.isStr(key)) {
        console.error('BREAK HERE!!!')
      }
      eYo.isStr(key) || eYo.throw(`eYo.o3d._p.prepare: bad parameter, key is not a string (${key})`)
      owner instanceof eYo.c9r.BaseC9r || eYo.throw(`eYo.o3d._p.prepare: bad parameter, owner is not an instance of eYo.c9r.BaseC9r`)
      var C9r = this.BaseC9r
      C9r.eyo.hasFinalizedC9r || C9r.eyo.finalizeC9r()
      return new C9r(key, owner, arg, ...$)
    }
    eYo.isStr(key) || eYo.throw(`eYo.o3d._p.prepare(2): bad parameter, key is not a string (${key})`)
    owner instanceof eYo.c9r.BaseC9r || eYo.throw(`eYo.o3d._p.new(2): bad parameter, owner is not an instance of eYo.c9r.BaseC9r`)
    var C9r = model._C9r
    if (!C9r) {
      C9r = this.modelMakeC9r(model, key)
    }
    let ans = new C9r(key, owner, ...$)
    ans.preInit = function () {
      delete this.preInit
      model._starters.forEach(f => f(ans))
    }
    return ans
  },
})
