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
 * @return a name in the proper format
 */
eYo.Decorate.reentrant_method = function(key, f) {
  return goog.isFunction(f) && function() {
    var k = key + '_locked'
    if (this[k]) {
      return
    }
    this[k] = true
    try {
      return f.apply(this, arguments)
    } finally {
      delete this[k]
    }
  }
}
