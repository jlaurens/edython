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

//<<< mochai: Basics
//... var x = {}
//... x.foo = 421
//... chai.expect(x.foo).equal(421)
//... var d8r = Object.getOwnPropertyDescriptor(x, 'foo')
//... chai.expect(d8r).not.undefined
//... let C3s = function () {}
//... var x = new C3s ()
//... x.foo = 123
//... chai.expect(x.foo).equal(123)
//... var d8r = Object.getOwnPropertyDescriptor(x, 'foo')
//... chai.expect(d8r).not.undefined
//>>>

eYo.kv.handler = {
  //<<< mochai: eYo.kv.handler
  //... let C3s = function () {}
  //... let target = new C3s ()
  //... target.foo = 123
  //... chai.expect(target.foo).equal(123)
  //... let p3y = new Proxy(target, eYo.kv.handler)
  getPrototypeOf (target) {
    return Reflect.getPrototypeOf(target)
    //... chai.expect(Object.getPrototypeOf(p3y)).equal(C3s.prototype)
  },
  setPrototypeOf (target, prototype) { // Reflect.setPrototypeOf
    prototype === target.prototype || eYo.throw('No prototype change pliz')
    return true
    //... chai.expect(() => Object.setPrototypeOf(p3y, C3s.prototype)).throw()
  },
   getOwnPropertyDescriptor (target, prop) {
    return Object.getOwnPropertyDescriptor(target, prop)
    //... target.foo = 'bar'
    //... chai.expect(target.foo).equal('bar')
    //... let d8r = Object.getOwnPropertyDescriptor(target, 'foo')
    //... chai.expect(d8r).not.undefined
    //... chai.expect(Object.getOwnPropertyDescriptor(p3y, 'foo')).eql(d8r)
    //... delete target.foo
  },
  defineProperty(target, key, d8r) {
    return Object.defineProperty(target, key, d8r)
    //... Object.defineProperty(p3y, 'bar', d8r)
    //... chai.expect(target.bar).equal('bar')
  },
  has(target, key) {
    return key in target
    //... chai.expect('foo' in p3y).false
    //... chai.expect('bar' in p3y).true
  },
  get (target, prop, receiver) {
    if (prop === eYo.$$.target) {
      return target
      //... chai.expect(p3y[eYo.$$.target]).equal(target)
    }
    return Reflect.get(target, prop, receiver)
    //... chai.expect(p3y.chi).undefined
    //... target.chi = 123
    //... chai.expect(target.chi).equal(123)
    //... chai.expect(p3y.chi).equal(123)
    //... chai.expect(p3y.bar).equal('bar')
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
    return Object.getOwnPropertyNames(target)
    //... p3y.chi = 421
    //... chai.expect(Object.getOwnPropertyNames(p3y)).members(['bar', 'chi'])
    //... delete p3y.chi
    //... chai.expect(Object.getOwnPropertyNames(p3y)).members(['bar'])
    //... delete p3y.bar
    //... chai.expect(Object.getOwnPropertyNames(p3y)).members([])
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
  //<<< mochai: eYo.kv.handler (extensions)
  isExtensible (target) {
    return Reflect.isExtensible(target)
  },
  preventExtensions (target) {
    return Reflect.preventExtensions(target)
  },
  //... let C3s = function () {}
  //... var target = new C3s ()
  //... var p3y = new Proxy(target, eYo.kv.handler)
  //... chai.expect(Object.isExtensible(target)).true
  //... chai.expect(Object.isExtensible(p3y)).true
  //... Object.preventExtensions(p3y)
  //... chai.expect(Object.isExtensible(target)).false
  //... chai.expect(Object.isExtensible(p3y)).false
  //... var target = new C3s ()
  //... var p3y = new Proxy(target, eYo.kv.handler)
  //... chai.expect(Object.isExtensible(target)).true
  //... chai.expect(Object.isExtensible(p3y)).true
  //... Object.preventExtensions(target)
  //... chai.expect(Object.isExtensible(target)).false
  //... chai.expect(Object.isExtensible(p3y)).false
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
  //<<< mochai: eYo.kv.C3s_p
  C3s_p: eYo.kv.C3s.prototype,
  //... chai.expect(eYo.kv.C3s_p).equal(eYo.kv.C3s.prototype)
  //>>>
})

eYo.mixinFR(eYo, {
  /**
   * Whether the argument is a named arguments object.
   * @param {*} what 
   */
  isaKV (what) {
    //<<< mochai: eYo.isaKV
    return !!what && what instanceof eYo.kv.C3s
    //... chai.expect(eYo.isaKV()).false
    //... chai.expect(eYo.isaKV({})).false
    //... chai.expect(eYo.isaKV(new eYo.kv.C3s())).true
    //... chai.expect(eYo.isaKV(eYo.kv.new())).true
    //>>>
  },
  KV: eYo.kv.C3s,
  KV_p: eYo.kv.C3s_p,
  //<<< mochai: KV/KV_p
  //... chai.expect(eYo.KV).equal(eYo.kv.C3s)
  //... chai.expect(eYo.KV_p).equal(eYo.kv.C3s_p)
  //>>>
})

eYo.mixinFR(eYo.kv, {
  new ($) {
    return new eYo.KV($)
  }
})

