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
eYo.newNS('kv', {
  $target: Symbol('target')
})

eYo.kv.handler = {
  //<<< mochai: eYo.kv.handler
  //... let C3s = class {}
  //... let target = new C3s ()
  //... let p3y = new Proxy(target, eYo.kv.handler)
  getPrototypeOf (target) {
    return target.prototype
    //... chai.expect(Object.getPrototypeOf(p3y)).equal(C3s.prototype)
  },
  setPrototypeOf (target, prototype) { // Reflect.setPrototypeOf
    prototype === target.prototype || eYo.throw('No prototype change pliz')
    return true
    //... chai.expect(() => Object.setPrototypeOf(p3y, C3s.prototype)).throw()
  },
  isExtensible (target) {
    return Reflect.isExtensible(target)
    //... chai.expect(Object.isExtensible(p3y)).equal(Object.isExtensible(target))
  },
  preventExtensions (target) {
    return Reflect.preventExtensions(target)
    //... chai.expect(Object.preventExtensions(p3y)).equal(Object.preventExtensions(target))
  },
  getOwnPropertyDescriptor (target, prop) {
    return Object.getOwnPropertyDescriptor(target, prop)
    //... target.foo = 'bar'
    //... let d8r = Object.getOwnPropertyDescriptor(target, 'foo')
    //... chai.expect(Object.getOwnPropertyDescriptor(p3y, 'foo')).equal(d8r)
    //... delete target.foo
  },
  defineProperty(target, key, descriptor) {
    return Object.defineProperty(target, key, descriptor)
    //... Object.defineProperty(p3y, 'bar', descriptor)
    //... chai.expect(target.bar).equal('bar')
  },
  has(target, key) {
    return key in target
    //... chai.expect(p3y.has('foo')).false
    //... chai.expect(p3y.has('bar')).true
  },
  get (target, prop, receiver) {
    if (prop === eYo.$$.target) {
      return target
    }
    return Reflect.get(target, prop, receiver)
    //... chai.expect(p3y.get('foo')).undefined
    //... chai.expect(p3y.get('bar')).equal('bar')
    //... chai.expect(p3y.get(eYo.$$.target)).equal(target)
  },
  set (target, prop, value) {
    if (prop === eYo.$$.target) {
      eYo.throw(`Forbidden set key: prop`)
      //... chai.expect(() => {p3y[eYo.$$.target] = 421}).throw()
    }
    return Reflect.set(target, prop, value)
    //... p3y.chi = 421
    //... chai.expect(target.chi).equal(421)
    //... var s4l = Symbol()
    //... p3y[s4l] = 421
    //... chai.expect(target[s4l]).equal(421)
  },
  deleteProperty (target, prop) {
    if (prop in target) {
      delete target[prop]
    }
    //... delete p3y.chi
    //... chai.expect(target.chi).undefined
    //... delete p3y[s4l]
    //... chai.expect(target[s4l]).undefined
  },
  ownKeys (target) {
    return Reflect.ownKeys(target) // no symbols listed
    //... p3y.chi = 421
    //... chai.expect(Object.ownKeys(p3y)).members(['chi'])
  },
  apply (target, $this, $) {
    eYo.throw('Not a callable pliz')
    // return target.apply($this, $)
    //... chai.expect(() => p3y(123)).throw()
  },
  construct(target, args) {
    eYo.throw('Not a constructor pliz')
    // return new target(...args);
    //... chai.expect(() => new p3y(123)).throw()
  },
  //>>>
}
/**
 * Named arguments constructor.
 * @param {Object} kvargs - an object with named arguments
 */
eYo.kv.C3s = class {
  constructor (kvargs) {
    //<<< mochai: constructor
    //... chai.expect(eYo.kv.C3s).eyo_F
    kvargs && Object.assign(this, kvargs)
    //... var $ = new eYo.kv.C3s()
    //... chai.expect($.foo).undefined
    //... $ = new eYo.kv.C3s({})
    //... chai.expect($.foo).undefined
    //... $ = new eYo.kv.C3s({foo: 421})
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
  C9r_p: eYo.kv.C3s.prototype,
  //... chai.expect(eYo.kv.C9r_p).equal(eYo.kv.C3s.prototype)
  //>>>
})

eYo.mixinFR(eYo, {
  /**
   * Whether the argument is a named arguments object.
   * @param {*} what 
   */
  isa$ (what) {
    //<<< mochai: eYo.isa$
    return !!what && what instanceof eYo.kv.C3s
    //... chai.expect(eYo.isa$()).false
    //... chai.expect(eYo.isa$({})).false
    //... chai.expect(eYo.isa$(new eYo.kv.C3s())).true
    //... chai.expect(eYo.isa$(eYo.kv.new())).true
    //>>>
  },
  KV: eYo.kv.C3s,
  KV_p: eYo.kv.C9r_p,
  //<<< mochai: KV/KV_p
  //... chai.expect(eYo.KV).equal(eYo.kv.C3s)
  //... chai.expect(eYo.KV_p).equal(eYo.kv.C9r_p)
  //>>>
})

eYo.mixinFR(eYo.kv, {
  new ($) {
    return new eYo.KV($)
  }
})

