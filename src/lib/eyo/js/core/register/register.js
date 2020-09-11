/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Add methods to register bricks, only when not in flyout.
 * Not really strong because of the storage management.
 * Is it defined shared or not ?
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('o4t')

/**
 * @name {eYo.register}
 * @namespace
 */
eYo.do.newNS(eYo, 'register')
//<<< mochai: Basics
//...  chai.assert(eYo.register)
//>>>

/**
 * Adds `fooRegister` and `fooUnregister` methods, and
 * `fooRegistered` array to the given object,
 * as soon as `foo` is the given key.
 * `fooForEach` and `fooSome` iterators are provided too.
 * Only new methods are allowed.
 * @param {Object} object - the object to extend, or the constructor whose prototype will be extended.
 * @param {String} key - The unique key prefixing the added methods
 * @param {Function} [filter] - A function to filter out objects before registering.
 * @return {Symbol} the symbol used to store the registered objects. Mainly for debugging purposes.
 */
eYo.register.add = function (object, key, filter) {
  //<<< mochai: add
  let $k = Symbol(key + ' registered map')
  if (eYo.isC9r(object)) {
    //<<< mochai: C3s
    //... let ns = eYo.c3s.newNS()
    //... let C3s = ns.makeC9rBase(true)
    //... let eyo = C3s[eYo.$]
    //... let p6y$ = eyo.p6yEnhanced()
    //... let $k = eYo.register.add(C3s, 'foo')
    //... eyo.finalizeC9r()
    //... let o = ns.new('foo')
    //... chai.expect(o.fooRegister).eyo_F
    //... chai.expect(o.fooUnregister).eyo_F
    //... eyo[p6y$.prepare](o)
    //... chai.expect(o[eyo.p6y$.map].get($k)).not.undefined
    //... eyo[p6y$.init](o)
    //... chai.expect(o[eyo.p6y$.map].get($k).value).not.undefined
    //... eyo[p6y$.shortcuts]()
    //... chai.expect(o[eyo.p6y$.map].get($k).value).equal(o[$k])
    let eyo = object[eYo.$]
    var p6y$ = eyo.p6y$
    p6y$ || eYo.throw(`Not a proper subclass (unknown p6y$/1).`)
    //... chai.expect(() => eYo.register.add(ns.C9rBase, 'foo')).xthrow()
    eyo[p6y$.merge]({
      [$k]: {
        value () {
          return new Map()
        },
      },
    })
    object = object.prototype
    //>>>
  } else if (eYo.isaDlgt(object)) {
    //<<< mochai: Dlgt
    //... let ns = eYo.c3s.newNS()
    //... let C3s = ns.makeC9rBase(true)
    //... let eyo = C3s[eYo.$]
    //... let p6y$ = eyo.p6yEnhanced()
    //... let $k = eYo.register.add(eyo, 'foo')
    //... eyo.finalizeC9r()
    //... let o = ns.new('foo')
    //... chai.expect(o.fooRegister).eyo_F
    //... chai.expect(o.fooUnregister).eyo_F
    //... eyo[p6y$.prepare](o)
    //... chai.expect(o[eyo.p6y$.map].get($k)).not.undefined
    //... eyo[p6y$.init](o)
    //... chai.expect(o[eyo.p6y$.map].get($k).value).not.undefined
    //... eyo[p6y$.shortcuts]()
    //... chai.expect(o[eyo.p6y$.map].get($k).value).equal(o[$k])
    (p6y$ = object.p6y$) || eYo.throw(`Not a proper subclass (unknown p6y$/2).`)
    object[p6y$.merge]({
      [$k]: {
        value () {
          return new Map()
        },
      },
    })
    object = object.C9r_p
    //>>>
  } else {
    //<<< mochai: else
    //... let o = {}
    //... let $k = eYo.register.add(o, 'foo')
    //... chai.expect(o[$k]).not.undefined
    //... chai.expect(o.fooRegister).eyo_F
    //... chai.expect(o.fooUnregister).eyo_F
    Reflect.defineProperty(object, $k, {value: new Map()}) || eYo.throw(`eYo.register.add: ${object}, ${key}`)
    //>>>
  }
  eYo.mixinFR(object, {
    //<<< mochai: methods
    //... let ns = eYo.c3s.newNS()
    //... let C3s = ns.makeC9rBase(true)
    //... let eyo = C3s[eYo.$]
    //... let p6y$ = eyo.p6yEnhanced()
    //... let $k = eYo.register.add(eyo, 'foo')
    //... eyo.finalizeC9r()
    //... var o
    //... let prepare = () => {
    //...   o = new C3s('o')
    //...   eyo[p6y$.prepare](o)
    //...   eyo[p6y$.shortcuts](o)
    //...   eyo[p6y$.init](o)
    //... }
    //... // Objects to register:
    //... let a = {
    //...   flag (...$) {
    //...     eYo.flag.push(1, ...$)
    //...   }
    //... }
    //... let b = {
    //...   flag (...$) {
    //...     eYo.flag.push(2, ...$)
    //...   }
    //... }
    //... let $this = {
    //...   flag (...$) {
    //...     eYo.flag.push(9, ...$)
    //...   },
    //... }
    /**
     * Register the given object
     * @param {*} object 
     */
    [key + 'Register']: function (object) {
      //<<< mochai: fooRegister/fooForEach
      if (!filter || filter(object)) {
        this[$k].set(object, eYo.NA)
      }
      //... let test = (o) => {
      //...   o.fooRegister(a)
      //...   o.fooForEach(x => x.flag(2, 3))
      //...   eYo.flag.expect(123)
      //...   o.fooRegister(b)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   eYo.flag.expect(134234)
      //...   // registering twice has no effect
      //...   o.fooRegister(a)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   eYo.flag.expect(134234)
      //...   o.fooRegister(b)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   eYo.flag.expect(134234)
      //... }
      //... o = {}
      //... let $k = eYo.register.add(o, 'foo')
      //... test(o)
      //... prepare()
      //... test(o)
      //>>>
    },
    /**
     * Unregister the given object
     * @param {*} object 
     * @return {Boolean} whether the deletion did occur.
     */
    [key + 'Unregister']: function (object) {
      //<<< mochai: fooUnregister
      return this[$k].delete(object)
      //... o = {}
      //... let $k = eYo.register.add(o, 'foo')
      //... let test = (o) => {
      //...   o.fooRegister(a)
      //...   o.fooRegister(b)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   eYo.flag.expect(134234)
      //...   o.fooUnregister(a)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   eYo.flag.expect(234)
      //...   o.fooRegister(a)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   eYo.flag.expect(234134)
      //...   o.fooUnregister(a)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   eYo.flag.expect(234)
      //...   o.fooUnregister(b)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   eYo.flag.expect()
      //... }
      //... prepare()
      //... test(o)
      //>>>
    },
    /**
     * @param {*} [$this] - Optional `this` parameter of the handler, anything but a callable.  
     * @param {*} handler - Handler with one argument: the currently enumerated registered value.
     */
    [key + 'ForEach']: function ($this, handler) {
      //<<< mochai: fooForEach
      if (eYo.isF($this)) {
        [$this, handler] = [handler || this, $this]
      }
      for (let r of this[$k].keys()) {
        handler.call($this, r)
      }
      //<<< mochai: no $this
      //... o = {}
      //... let $k = eYo.register.add(o, 'foo')
      //... o.fooRegister(a)
      //... o.fooRegister(b)
      //... o.fooForEach(x => x.flag(3, 4))
      //... eYo.flag.expect(134234)
      //>>>
      //<<< mochai: $this
      //... o = {}
      //... let $k = eYo.register.add(o, 'foo')
      //... o.fooRegister(a)
      //... o.fooRegister(b)
      //... o.fooForEach($this, function(x) {
      //...    this.flag(3, 4)
      //...    x.flag(3, 4)
      //... })
      //... eYo.flag.expect(934134934234)
      //>>>
      //>>>
    },
    /**
     * @param {*} [$this] - Optional `this` parameter of the handler, anything but a callable.  
     * @param {*} handler - Handler with one argument: the currently enumerated registered value.
     */
    [key + 'Some']: function ($this, handler) {
      //<<< mochai: fooSome
      if (eYo.isF($this)) {
        [$this, handler] = [handler || this, $this]
      }
      for (let r of this[$k].keys()) {
        if (handler.call($this, r)) {
          return true
        }
      }
      return false
      //<<< mochai: no $this
      //... o = {}
      //... let $k = eYo.register.add(o, 'foo')
      //... o.fooRegister(a)
      //... o.fooRegister(b)
      //... chai.expect(o.fooSome(x => {
      //...   x.flag()
      //...   return x === a
      //... })).true
      //... eYo.flag.expect(1)
      //... chai.expect(o.fooSome(x => {
      //...   x.flag()
      //...   return x === b
      //... })).true
      //... eYo.flag.expect(12)
      //... chai.expect(o.fooSome(x => {
      //...   x.flag()
      //...   return x === 0
      //... })).false
      //... eYo.flag.expect(12)
      //>>>
      //<<< mochai: $this
      //... o = {}
      //... let $k = eYo.register.add(o, 'foo')
      //... o.fooRegister(a)
      //... o.fooRegister(b)
      //... chai.expect(o.fooSome($this, function(x) {
      //...   this.flag()
      //...   x.flag()
      //...   return x === a
      //... })).true
      //... eYo.flag.expect(91)
      //... chai.expect(o.fooSome($this, function(x) {
      //...   this.flag()
      //...   x.flag()
      //...   return x === b
      //... })).true
      //... eYo.flag.expect(9192)
      //... chai.expect(o.fooSome($this, function(x) {
      //...   this.flag()
      //...   x.flag()
      //...   return x === 0
      //... })).false
      //... eYo.flag.expect(9192)
      //>>>
      //>>>
    },
    //>>>
  })
  return $k
  //>>>
}
