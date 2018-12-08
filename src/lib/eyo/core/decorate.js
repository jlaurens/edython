/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Various decoration utilities.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Decorate')

/**
 * Decorate the function to be reentrant.
 * The return function will test if `this.reentrant[key]` exists.
 * @param {!string} key
 * @param {!function} f
 * @return An object which `ans` property is the value returned by f when called.
 */
eYo.Decorate.reentrant_method = function(key, f) {
  return (!this || !this.reentrant || !this.reentrant[key])
    && goog.isFunction(f)
      && function() {
        if (this.reentrant[key]) {
          return {}
        }
        this.reentrant[key] = true
        try {
          return {ans: f.apply(this, arguments)}
        } catch (err) {
          console.error(err)
          throw err
        } finally {
          this.reentrant[key] = false
        }
      }
}

/**
 * Calls `helper` if the `call_result` has an `ans` property.
 * `call_result` is the output of a reentrant method
 * @param {!string} key
 * @param {?function} f
 * @return The result of the call to `f`, when `f` is defined,
 * the `ans` property of `call_result` otherwise.
 */
eYo.Decorate.whenAns = function(call_result, f) {
  if (goog.isDef(call_result.ans)) {
    return (f && f(call_result.ans)) || call_result.ans
  }
}