/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Managing named function arguments and possibly more.
 * When using inheritance, some functions may have quite the same set of arguments,
 * quite...
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Management of named arguments and possibly more.
 * @name {eYo.kv}
 * @namespace
 */
eYo.newNS('kv')

eYo.kv.handler = {
  //<<< mochai: eYo.kv.handler
  getPrototypeOf (target) {
    return target.prototype
  },
  setPrototypeOf (target, prototype) { // Reflect.setPrototypeOf
    throw new Error('No prototype change pliz')
  },
  isExtensible (target) {
    return Reflect.isExtensible(target)
  },
  preventExtensions (target) {
    return Reflect.preventExtensions(target);    
  },
  getOwnPropertyDescriptor (target, prop) {
    return Object.getOwnPropertyDescriptor(target, prop)
  },
  defineProperty(target, key, descriptor) {
    return Object.defineProperty(target, key, descriptor)
  },
  has(target, key) {
    return key in target
  },
  get (target, prop, receiver) {
    return Reflect.get(target, prop, receiver)
  },
  set (target, prop, value) {
    return Reflect.set(target, prop, value)
  },
  deleteProperty (target, prop) {
    if (prop in target) {
      delete target[prop]
    }
  },
  ownKeys (target) {
    return Reflect.ownKeys(target) // no symbols listed
  },
  apply (target, $this, $) {
    throw new Error('Not a callable pliz')
    // return target.apply($this, $)
  },
  construct(target, args) {
    throw new Error('Not a constructor pliz')
    // return new target(...args);
  },
  //>>>
}
/**
 * Named arguments constructor.
 * @param {Object} kvargs - an object with named arguments
 */
eYo.kv.C9r = class {
  constructor (kvargs) {
    //<<< mochai: constructor
    //... chai.expect(eYo.kv.C9r).eyo_F
    kvargs && Object.assign(this, kvargs)
    //... var $ = new eYo.kv.C9r()
    //... chai.expect($.foo).undefined
    //... $ = new eYo.kv.C9r({})
    //... chai.expect($.foo).undefined
    //... $ = new eYo.kv.C9r({foo: 421})
    //... chai.expect($.foo).equal(421)
    //>>>
  }
  //<<< mochai: mixin
  mixin (kvargs) {
    Object.assign(this, kvargs)
  }
  //... var $ = eYo.kv.new()
  //... chai.expect($.a).undefined
  //... $.mixin({a: 1})
  //... chai.expect($.a).equal(1)
  //... $.mixin({a: 2})
  //... chai.expect($.a).equal(2)
  //... var $$ = eYo.kv.new({b: 2})
  //... chai.expect($$.b).equal(2)
  //... $.mixin($$)
  //... chai.expect($.b).equal(2)
  //>>>
}

eYo.mixinRO(eYo.kv, {
  //<<< mochai: eYo.kv.C9r_p
  C9r_p: eYo.kv.C9r.prototype,
  //... chai.expect(eYo.kv.C9r_p).equal(eYo.kv.C9r.prototype)
  //>>>
})

eYo.mixinFR(eYo, {
  /**
   * Whether the argument is a named arguments object.
   * @param {*} what 
   */
  isa$ (what) {
    //<<< mochai: eYo.isa$
    return !!what && what instanceof eYo.kv.C9r
    //... chai.expect(eYo.isa$()).false
    //... chai.expect(eYo.isa$({})).false
    //... chai.expect(eYo.isa$(new eYo.kv.C9r())).true
    //... chai.expect(eYo.isa$(eYo.kv.new())).true
    //>>>
  },
  KV: eYo.kv.C9r,
  KV_p: eYo.kv.C9r_p,
  //<<< mochai: KV/KV_p
  //... chai.expect(eYo.KV).equal(eYo.kv.C9r)
  //... chai.expect(eYo.KV_p).equal(eYo.kv.C9r_p)
  //>>>
})

eYo.mixinFR(eYo.kv, {
  new ($) {
    return new eYo.KV($)
  }
})

