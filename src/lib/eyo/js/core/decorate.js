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

eYo.require('eYo')

eYo.provide('eYo.Decorate')

eYo.forwardDeclare('eYo.Do')

/**
 * Decorate the function to be reentrant.
 * The return function will test if `this.reentrant_[key]` exists.
 * @param {string} key
 * @param {function} f
 * @param {Boolean} [raw]
 * @return {Object | *} An object which `ans` property is the value returned by f when called. When `raw` is true, the value returned by f is returned.
 */
eYo.Decorate.reentrant_method = function(key, f, raw) {
  return (!this || !this.reentrant_ || !this.reentrant_[key])
    && (goog.isFunction(f))
      && function() {
        if (this.reentrant_[key]) {
          return {}
        }
        this.reentrant_[key] = true
        var ans
        try {
          ans = f.apply(this, arguments)
        } catch (err) {
          console.error(err)
          throw err
        } finally {
          this.reentrant_[key] = false
          return raw ? ans : {ans: ans}
        }
      }
}

/**
 * Calls `helper` if the `call_result` has an `ans` property.
 * `call_result` is the output of a reentrant method
 * @param {string} key
 * @param {function} [f]
 * @return The result of the call to `f`, when `f` is defined,
 * the `ans` property of `call_result` otherwise.
 */
eYo.Decorate.whenAns = function(call_result, f) {
  if (goog.isDef(call_result.ans)) {
    return (f && f(call_result.ans)) || call_result.ans
  }
}

/**
 * Calls `f` and logs the time used when gerater than 50ms.
 * @param {string} key
 * @param {function} f
 * @return The result of the call to `f`.
 */
eYo.Decorate.benchmark = function (key, f) {
  return function () {
    const startTime = performance.now()
    try {
      return f.apply(this, arguments)
    } finally {
      const duration = performance.now() - startTime
      if (duration > 50) {
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
eYo.Decorate.arrayFunction = object => {
  var did = goog.isFunction(object)
    ? object
    : goog.isArray(object)
      ? () => object
      : object
        ? () => [object]
        : () => object
  return did
}
