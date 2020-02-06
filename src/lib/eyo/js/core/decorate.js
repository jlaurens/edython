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

eYo.makeNS('decorate')

eYo.forwardDeclare('do')

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
 * Calls `f` and logs the time used when gerater than 50ms.
 * @param {string} key
 * @param {function} f
 * @return The result of the call to `f`.
 */
eYo.decorate.Benchmark = function (key, f) {
  return function (...args) {
    const startTime = performance.now()
    try {
      return f.call(this, ...args)
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
eYo.decorate.ArrayFunction = object => {
  var did = eYo.isF(object)
    ? object
    : goog.isArray(object)
      ? () => object
      : object
        ? () => [object]
        : () => object
  return did
}
