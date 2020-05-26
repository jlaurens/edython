/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Various decoration utilities.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('do')

eYo.makeNS('decorate')
//<<< mochai: Basic
//... chai.assert(eYo.decorate)
//>>>

/**
 * Decorate the function to be reentrant.
 * The return function will test if `this.reentrant_[key]` exists.
 * @param {string} key
 * @param {function} f
 * @param {Boolean} [raw]
 * @return {Object | *} An object which `ans` property is the value returned by f when called. When `raw` is true, the value returned by f is returned.
 */
eYo.decorate.reentrant_method = (object, key, f) => {
  if (!eYo.isStr(object)) {
    if (!object || !object.reentrant_ || object.reentrant_[key]) {
      return
    }
  } else {
    eYo.isNA(f) || eYo.throw('Unexpected f')
    f = key
    key = object
  }
  if (!eYo.isF(f)) {
    return
  }
  return function(..._) {
    if (this.reentrant_[key]) {
      return eYo.INVALID
    }
    this.reentrant_[key] = true
    var ans
    try {
      ans = f.call(this, ..._)
    } finally {
      this.reentrant_[key] = false
      return ans
    }
  }
}

/**
 * Decorate the function to be reentrant.
 * Beware, the use of `alt_f` is constrained,
 * some values may be catched unexpectedly.
 * @param {string} key
 * @param {function} f
 * @param {function} [alt_f] - defaults to `eYo.doNothing`.
 * @return {*} Whathever `f` returns.
 */
eYo.decorate.reentrant = (key, f, alt_f = eYo.doNothing) => {
  //<<< mochai: eYo.decorate.reentrant
  return function(...$) {
    try {
      this[key] = alt_f
      return f.call(this, ...$)
    } finally {
      delete this[key]
    }
  }
  //... chai.assert(eYo.decorate.reentrant)
  //... let _p = Object.getPrototypeOf(onr)
  //... _p.bar = eYo.decorate.reentrant('bar', function (what) {
  //...   this.flag(2, what)
  //...   return this.bar()
  //... })
  //... chai.expect(onr.bar(3)).undefined
  //... flag.expect(123)
  //... _p.bar = eYo.decorate.reentrant('bar', function (what) {
  //...   this.flag(2, what)
  //...   return this.bar(what)
  //... }, function (what) {
  //...   this.flag(3, what + 2)
  //...   return what + 1
  //... })
  //... chai.expect(onr.bar(3)).equal(4)
  //... flag.expect(123135)
  //... _p.bar = eYo.decorate.reentrant('bar', function (what) {
  //...   let ans = this.bar(what)
  //...   this.flag(3, what + 2)
  //...   return ans
  //... }, function (what) {
  //...   this.flag(2, what)
  //...   return 3 * what
  //... })
  //... chai.expect(onr.bar(3)).equal(9)
  //... flag.expect(123135)
  //>>>
}

/**
 * Calls `f` and logs the time used when greater than 50ms.
 * @param {String} key
 * @param {Function} f
 * @param {Number} limit
 * @return {*} Whatever `f` returns.
 */
eYo.decorate.benchmark = function (key, f, limit = 50) {
  return function (...$) {
    let startTime = performance.now()
    try {
      return f.call(this, ...$)
    } finally {
      let duration = performance.now() - startTime
      if (duration > limit) {
        console.log(`BENCHMARK: ${key} took ${duration}ms`)
      }
    }
  }
}

/**
 * Ensure an array function.
 * @param {Object} [object]
 * @return object when a function else a function with signature f() -> []
 */
eYo.decorate.ArrayFunction = object => {
  var did = eYo.isF(object)
    ? object
    : eYo.isRA(object)
      ? () => object
      : object
        ? () => [object]
        : () => object
  return did
}