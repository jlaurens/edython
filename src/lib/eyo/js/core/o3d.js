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
    if (!(owner instanceof eYo.c9r.BaseC9r)) {
      console.error('BREAK HERE!')
    }
    owner instanceof eYo.c9r.BaseC9r || eYo.throw(`${this.eyo.name}: Very bad owner in init`)
    eYo.isStr(key) || eYo.throw(`${this.eyo.name}: Bad s key in init`)
    this.owner__ = owner
    this.key_ = key
    Object.defineProperties(this, {
      owner: eYo.descriptorR(function () {
        return this.owner__
      }),
      key: eYo.descriptorR(function () {
        return this.key_
      }),
    })
    this.disposeUI = eYo.doNothing
  },
  dispose () {
    this.disposeUI()
    this.owner__ = this.key_ = eYo.NA
  },  
})

/**
 * The default implementation does nothing.
 * For subclassers.
 * @param{*} before - the owner before the change
 * @param{*} after - the owner after the change
 */
eYo.o3d.BaseC9r.prototype.ownerWillChange = eYo.doNothing
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

/**
 * Create a new instance based on the model.
 * @param {Object} model
 */
eYo.o3d._p.singleton = function (model, owner) {
  return this.makeNS().new(model, 'foo', owner)
}

eYo.forward('shared')

/**
 * Create a new singleton instance based on the given model.
 * @param {Object} [NS] - Optional namespace, defaults to the receiver.
 * @param {Object} model
 * @param {String} key - the result will be `NS[key]`
 * @return {Object}
 */
eYo.o3d._p.makeSingleton = function(NS, model, key) {
  if (!eYo.isNS(NS)) {
    !key || eYo.throw(`Unexpected last parameter: ${key}`)
    ;[NS, model, key] = [this, NS, model]
  }
  eYo.isStr(key) || eYo.throw(`Unexpected parameter ${key}`)
  let ans = this.new(model, key, eYo.shared.OWNER)
  Object.defineProperty(eYo.shared, key, eYo.descriptorR(function() {
    return ans
  }))
  Object.defineProperty(NS, key, eYo.descriptorR(function() {
    return ans
  }))
  return ans
}

/**
 * Create a new Base instance based on the model
 * No need to subclass. Override `Base`, `modelPath` and `modelHandle`.
 * @param {Object} owner
 * @param {String} key
 * @param {Object} model
 */
eYo.o3d._p.new = function (model, key, owner, ...$) {
  if (!eYo.isD(model)) {
    let arg = owner
    ;[model, key, owner] = [eYo.NA, model, key]
    eYo.isStr(key) || eYo.throw(`eYo.o3d._p.new: bad parameter, key is not a string`)
    owner instanceof eYo.c9r.BaseC9r || eYo.throw(`eYo.o3d._p.new: bad parameter, owner is not an instance of eYo.c9r.BaseC9r`)
    var C9r = this.BaseC9r
    if (C9r.eyo.shouldFinalizeC9r) {
      C9r.eyo.finalizeC9r()
    }
    return new C9r(key, owner, arg, ...$)
  }
  eYo.isStr(key) || eYo.throw(`eYo.o3d._p.new(2): bad parameter, key is not a string`)
  owner instanceof eYo.c9r.BaseC9r || eYo.throw(`eYo.o3d._p.new(2): bad parameter, owner is not an instance of eYo.c9r.BaseC9r`)
  var C9r = model._C9r
  if (!C9r) {
    C9r = this.modelMakeC9r(model, key)
  }
  let ans = new C9r(key, owner, ...$)
  model._starters.forEach(f => f(ans))
  return ans
}
