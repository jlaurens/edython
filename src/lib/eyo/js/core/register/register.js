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
eYo.do.makeNS(eYo, 'register')
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
 * @param {Function} filter - The function to filter out objects before registering.
 */
eYo.register.add = function (object, key, filter) {
  //<<< mochai: add
  let k = key + '__Registered'
  if (eYo.isC9r(object)) {
    //<<< mochai: C9r
    //... let ns = eYo.c9r.makeNS()
    //... let C9r = ns.makeBaseC9r(true)
    //... C9r.eyo.p6yEnhanced()
    //... eYo.register.add(C9r, 'foo')
    //... C9r.eyo.finalizeC9r()
    //... let o = new C9r('foo')
    //... chai.expect(o.fooRegister).eyo_F
    eYo.isF(object.eyo.p6yMerge) || eYo.throw(`Not a proper subclass (unknown p6yMerge/1).`)
    //... chai.expect(() => eYo.register.add(ns.BaseC9r, 'foo')).throw()
    object.eyo.p6yMerge({
      [k] () {
        return new Map()
      }
    })
    object = object.prototype
    //>>>
  } else if (eYo.isaDlgt(object)) {
    //<<< mochai: Dlgt
    //... let ns = eYo.c9r.makeNS()
    //... let C9r = ns.makeBaseC9r(true)
    //... C9r.eyo.p6yEnhanced()
    //... eYo.register.add(C9r.eyo, 'foo')
    //... C9r.eyo.finalizeC9r()
    //... let o = new C9r('foo')
    //... chai.expect(o.fooRegister).eyo_F
    eYo.isF(object.p6yMerge) || eYo.throw(`Not a proper subclass (unknown p6yMerge/2).`)
    object.p6yMerge({
      [k] () {
        return new Map() // use map keys as ordered set.
      }
    })
    object = object.C9r_p
    //>>>
  } else {
    //<<< mochai: else
    //... let o = {}
    //... eYo.register.add(o, 'foo')
    //... chai.expect(o.fooRegister).eyo_F
    Object.defineProperty(object, k, {value: new Map()})
    //>>>
  }
  eYo.mixinR(false, object, {
    //<<< mochai: methods
    //... let ns = eYo.c9r.makeNS()
    //... let C9r = ns.makeBaseC9r(true)
    //... C9r.eyo.p6yEnhanced()
    //... eYo.register.add(C9r.eyo, 'foo')
    //... C9r.eyo.finalizeC9r()
    //... var o
    //... let prepare = () => {
    //...   o = new C9r('o')
    //...   o.eyo.p6yPrepare(o)
    //...   o.eyo.p6yInit(o)
    //... }
    //... // Objects to register:
    //... let a = {
    //...   flag (...$) {
    //...     flag.push(1, ...$)
    //...   }
    //... }
    //... let b = {
    //...   flag (...$) {
    //...     flag.push(2, ...$)
    //...   }
    //... }
    //... let $this = {
    //...   flag (...$) {
    //...     flag.push(9, ...$)
    //...   },
    //... }
    /**
     * Register the given object
     * @param {*} object 
     */
    [key + 'Register']: function (object) {
      //<<< mochai: fooRegister/fooForEach
      if (!filter || filter(object)) {
        this[k].set(object, eYo.NA)
      }
      //... let test = (o) => {
      //...   o.fooRegister(a)
      //...   o.fooForEach(x => x.flag(2, 3))
      //...   flag.expect(123)
      //...   o.fooRegister(b)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   flag.expect(134234)
      //...   // registering twice has no effect
      //...   o.fooRegister(a)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   flag.expect(134234)
      //...   o.fooRegister(b)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   flag.expect(134234)
      //... }
      //... o = {}
      //... eYo.register.add(o, 'foo')
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
      return this[k].delete(object)
      //... o = {}
      //... eYo.register.add(o, 'foo')
      //... let test = (o) => {
      //...   o.fooRegister(a)
      //...   o.fooRegister(b)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   flag.expect(134234)
      //...   o.fooUnregister(a)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   flag.expect(234)
      //...   o.fooRegister(a)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   flag.expect(234134)
      //...   o.fooUnregister(a)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   flag.expect(234)
      //...   o.fooUnregister(b)
      //...   o.fooForEach(x => x.flag(3, 4))
      //...   flag.expect()
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
      for (let r of this[k].keys()) {
        handler.call($this, r)
      }
        //<<< mochai: no $this
          //... o = {}
          //... eYo.register.add(o, 'foo')
          //... o.fooRegister(a)
          //... o.fooRegister(b)
          //... o.fooForEach(x => x.flag(3, 4))
          //... flag.expect(134234)
        //>>>
        //<<< mochai: $this
          //... o = {}
          //... eYo.register.add(o, 'foo')
          //... o.fooRegister(a)
          //... o.fooRegister(b)
          //... o.fooForEach($this, function(x) {
          //...    this.flag(3, 4)
          //...    x.flag(3, 4)
          //... })
          //... flag.expect(934134934234)
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
      for (let r of this[k].keys()) {
        if (handler.call($this, r)) {
          return true
        }
      }
      return false
        //<<< mochai: no $this
          //... o = {}
          //... eYo.register.add(o, 'foo')
          //... o.fooRegister(a)
          //... o.fooRegister(b)
          //... chai.expect(o.fooSome(x => {
          //...   x.flag()
          //...   return x === a
          //... })).true
          //... flag.expect(1)
          //... chai.expect(o.fooSome(x => {
          //...   x.flag()
          //...   return x === b
          //... })).true
          //... flag.expect(12)
          //... chai.expect(o.fooSome(x => {
          //...   x.flag()
          //...   return x === 0
          //... })).false
          //... flag.expect(12)
        //>>>
        //<<< mochai: $this
          //... o = {}
          //... eYo.register.add(o, 'foo')
          //... o.fooRegister(a)
          //... o.fooRegister(b)
          //... chai.expect(o.fooSome($this, function(x) {
          //...   this.flag()
          //...   x.flag()
          //...   return x === a
          //... })).true
          //... flag.expect(91)
          //... chai.expect(o.fooSome($this, function(x) {
          //...   this.flag()
          //...   x.flag()
          //...   return x === b
          //... })).true
          //... flag.expect(9192)
          //... chai.expect(o.fooSome($this, function(x) {
          //...   this.flag()
          //...   x.flag()
          //...   return x === 0
          //... })).false
          //... flag.expect(9192)
        //>>>
      //>>>
    },
    //>>>
  })
  //>>>
}
