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
 * Decorate the function to be reentrant
 * @param {!string} key
 * @param {!function} f
 * @return An object which `return` property is the value returned by f when called.
 */
eYo.Decorate.reentrant_method = function(key, f) {
  var k = key + '_lock'
  return (!this || !this[k]) && goog.isFunction(f) && function() {
    if (this[k]) {
      return {}
    }
    this[k] = true
    try {
      return {return: f.apply(this, arguments)}
    } finally {
      delete this[k]
    }
  }
}
