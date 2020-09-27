/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Testing kv...
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

import kv from './kv'

import 'mocha'
import * as chai from 'chai'

import * as test from '../test/mochai'

describe(`Tests`, function () {
  this.timeout(20000)
  beforeEach (function () { eYo.test.setup() })
  eYo.test.onrModel = eYo.NA
  eYo.test.setup()
  it(`...`, function () {
    import kv from './kv'
  })
//  
  it(`Basics`, function () {
    var x = {}
    x.foo = 421
    chai.expect(x.foo).equal(421)
    var d8r = Object.getOwnPropertyDescriptor(x, 'foo')
    chai.expect(d8r).not.undefined
    let C3s = function () {}
    var x = new C3s ()
    x.foo = 123
    chai.expect(x.foo).equal(123)
    var d8r = Object.getOwnPropertyDescriptor(x, 'foo')
    chai.expect(d8r).not.undefined
  })
//  
//  let handler = {
  it(`kv.handler`, function () {
    let C3s = function () {}
    let target = new C3s ()
    target.foo = 123
    chai.expect(target.foo).equal(123)
    let p3y = new Proxy(target, kv.handler)
//    getPrototypeOf (target) {
//      return Reflect.getPrototypeOf(target)
    chai.expect(Object.getPrototypeOf(p3y)).equal(C3s.prototype)
//    },
//    setPrototypeOf (target, prototype) { // Reflect.setPrototypeOf
//      prototype === target.prototype || eYo.throw('No prototype change pliz')
//      return true
    chai.expect(() => Object.setPrototypeOf(p3y, C3s.prototype)).throw()
//    },
//    getOwnPropertyDescriptor (target, prop) {
//      return Object.getOwnPropertyDescriptor(target, prop)
    target.foo = 'bar'
    chai.expect(target.foo).equal('bar')
    let d8r = Object.getOwnPropertyDescriptor(target, 'foo')
    chai.expect(d8r).not.undefined
    chai.expect(Object.getOwnPropertyDescriptor(p3y, 'foo')).eql(d8r)
    delete target.foo
//    },
//    defineProperty(target, key, d8r) {
//      return Object.defineProperty(target, key, d8r)
    Object.defineProperty(p3y, 'bar', d8r)
    chai.expect(target.bar).equal('bar')
//    },
//    has(target, key) {
//      return key in target
    chai.expect('foo' in p3y).false
    chai.expect('bar' in p3y).true
//    },
//    get (target: any, prop: string | number | symbol, receiver: any) {
//      if (prop === eYo.$$.target) {
//        return target
    chai.expect(p3y[eYo.$$.target]).equal(target)
//      }
//      return Reflect.get(target, prop, receiver)
    chai.expect(p3y.chi).undefined
    target.chi = 123
    chai.expect(target.chi).equal(123)
    chai.expect(p3y.chi).equal(123)
    chai.expect(p3y.bar).equal('bar')
//    },
//    set (target: any, prop: string | number | symbol, value: any) {
//      if (prop === eYo.$$.target) {
//        eYo.throw(`Forbidden set key: prop`)
    chai.expect(() => {p3y[eYo.$$.target] = 421}).throw()
//      }
//      return Reflect.set(target, prop, value)
    p3y.chi = 421
    chai.expect(target.chi).equal(421)
    var s4l = Symbol()
    p3y[s4l] = 421
    chai.expect(target[s4l]).equal(421)
//    },
//    deleteProperty (target: any, prop: string | number | symbol) {
//      if (prop in target) {
//        delete target[prop]
//      }
    delete p3y.chi
    chai.expect(target.chi).undefined
    delete p3y[s4l]
    chai.expect(target[s4l]).undefined
//    },
//    ownKeys (target: any) {
//      return Object.getOwnPropertyNames(target)
    p3y.chi = 421
    chai.expect(Object.getOwnPropertyNames(p3y)).members(['bar', 'chi'])
    delete p3y.chi
    chai.expect(Object.getOwnPropertyNames(p3y)).members(['bar'])
    delete p3y.bar
    chai.expect(Object.getOwnPropertyNames(p3y)).members([])
//    },
//    apply (target: any, $this: any, $: any) { // eslint-disable-line no-unused-vars
//      eYo.throw('Not a callable pliz')
//      // return target.apply($this, $)
    chai.expect(() => p3y(123)).throw()
//    },
//    construct(target: any, $: any) { // eslint-disable-line no-unused-vars
//      eYo.throw('Not a constructor pliz')
//      // return new target(...args);
    chai.expect(() => new p3y(123)).throw()
//    },
  })
  it(`kv.handler (extensions)`, function () {
//    isExtensible (target: any) {
//      return Reflect.isExtensible(target)
//    },
//    preventExtensions (target: any) {
//      return Reflect.preventExtensions(target)
//    },
    let C3s = function () {}
    var target = new C3s ()
    var p3y = new Proxy(target, kv.handler)
    chai.expect(Object.isExtensible(target)).true
    chai.expect(Object.isExtensible(p3y)).true
    Object.preventExtensions(p3y)
    chai.expect(Object.isExtensible(target)).false
    chai.expect(Object.isExtensible(p3y)).false
    var target = new C3s ()
    var p3y = new Proxy(target, kv.handler)
    chai.expect(Object.isExtensible(target)).true
    chai.expect(Object.isExtensible(p3y)).true
    Object.preventExtensions(target)
    chai.expect(Object.isExtensible(target)).false
    chai.expect(Object.isExtensible(p3y)).false
  })
//  }
//  /**
//   * Named arguments constructor.
//   * @param {Object} kv - an object with named arguments
//   */
//  let C3s = class {
//    constructor (kv: any) {
  it(`constructor`, function () {
    chai.expect(kv.C3s).eyo_F
//      kv && Object.assign(this, kv)
    var $ = new kv.C3s()
    chai.expect($.foo).undefined
    $ = new kv.C3s({})
    chai.expect($.foo).undefined
    $ = new kv.C3s({foo: 421})
    chai.expect($.foo).equal(421)
  })
//    }
  it(`mixin`, function () {
//    mixin (kv$: any) {
//      Object.assign(this, kv$)
//    }
    var $ = kv.new()
    chai.expect($.a).undefined
    $.mixin({a: 1})
    chai.expect($.a).equal(1)
    $.mixin({a: 2})
    chai.expect($.a).equal(2)
    var $$ = kv.new({b: 2})
    chai.expect($$.b).equal(2)
    $.mixin($$)
    chai.expect($.b).equal(2)
  })
//  }
//  
//  export default {
//    handler,
//    C3s,
  it(`kv.C3s_p`, function () {
//    C3s_p: C3s.prototype,
    chai.expect(kv.C3s_p).equal(kv.C3s.prototype)
  })
//    new ($: any) {
//      return new C3s($)
//    },
//    /**
//     * Whether the argument is a named arguments object.
//     * @param {*} what
//     */
//    isa (what: any) {
  it(`kv.isa`, function () {
//      return !!what && what instanceof C3s
    chai.expect(kv.isa()).false
    chai.expect(kv.isa({})).false
    chai.expect(kv.isa(new kv.C3s())).true
    chai.expect(kv.isa(kv.new())).true
  })
//    },
//  }

})
