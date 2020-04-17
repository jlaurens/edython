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
   * @param {eYo.c9r.BaseC9r} owner - the immediate owner of this object.
   * @param {String} [key] - an identifier for the owner.
   */
  init (owner, key = '') {
    owner instanceof eYo.c9r.BaseC9r || eYo.throw(`${this.eyo.name}: Bad owner in init`)
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
eYo.o3d._p.singleton = function (owner, model) {
  return this.makeNS().new(owner, 'foo', model)
}

eYo.forward('shared')

/**
 * Create a new singleton instance based on the given model.
 * @param {Object} [NS] - Optional namespace, defaults to the receiver.
 * @param {String} key - the result will be `NS[key]`
 * @param {Object} model
 * @return {Object}
 */
eYo.o3d._p.makeSingleton = function(NS, key, model) {
  if (!eYo.isNS(NS)) {
    !model || eYo.throw(`Unexpected last parameter: ${model}`)
    ;[NS, key, model] = [this, NS, key]
  }
  eYo.isStr(key) || eYo.throw(`Unexpected parameter ${key}`)
  let ans = this.new(eYo.shared.OWNER, key, model)
  Object.defineProperty(eYo.shared, key, eYo.descriptorR(function() {
    return ans
  }))
  Object.defineProperty(NS, key, eYo.descriptorR(function() {
    return ans
  }))
  return ans
}

/**
 * Create a new constructor based on the model.
 * No need to subclass.
 * Instead, override `Base` and `modelHandle`.
 * @param {String} key
 * @param {Boolean} register
 * @param {Object} model
 */
eYo.o3d._p.modelMakeC9r = function (key, register, model) {
  if (!eYo.isBool(register)) {
    [register, model] = [false, register]
  }
  let C9r = this.makeC9r('', this.modelBaseC9r(model), model)
  C9r.eyo.shouldFinalizeC9r && C9r.eyo.finalizeC9r()
  model = C9r.eyo.model
  model._C9r = C9r
  model._starters = []
  C9r.eyo.modelHandle(key)
  Object.defineProperty(C9r.eyo, 'name', eYo.descriptorR(function () {
    return `${C9r.eyo.super.name}(${key})`
  }))
  register && this.register(C9r)
  return C9r
}

/**
 * Create a new Base instance based on the model
 * No need to subclass. Override `Base`, `modelPath` and `modelHandle`.
 * @param {Object} owner
 * @param {String} key
 * @param {Object} model
 */
eYo.o3d._p.new = function (owner, key, model) {
  owner instanceof eYo.c9r.BaseC9r || eYo.throw(`Bad parameter: owner is not an instance of eYo.c9r.BaseC9r`)
  eYo.isStr(key) || eYo.throw(`Bad parameter: key is not a string`)
  if (!model) {
    var C9r = this.BaseC9r
    if (C9r.eyo.shouldFinalizeC9r) {
      C9r.eyo.finalizeC9r()
    }
    return new C9r(owner, key)
  }
  var C9r = model._C9r
  if (!C9r) {
    C9r = this.modelMakeC9r(key, model)
  }
  let ans = new C9r(owner, key, model)
  model._starters.forEach(f => f(ans))
  return ans
}
