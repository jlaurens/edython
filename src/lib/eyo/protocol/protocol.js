/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Protocol utilities.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Protocol')

goog.require('eYo.Do')

/**
 * Enhance the prototype with the given methods and properties.
 * Only new method are allowed.
 */
eYo.Do.enhance_prototype = function (proto, base) {
  if (goog.isString(base)) {
    base = eYo.Protocol[base]
  }
  if (base.methods) {
    var key
    for(key in base.methods) {
      if (eYo.Do.hasOwnProperty(base.methods, key)) {
        var method = base.methods[key]
        if (goog.isFunction(method)) {
          goog.asserts.assert(!proto[key], key + 'already exists')
          proto[key] = method
        }
      }
    }
  }
  base.properties && Object.defineProperties(
    proto,
    base.properties
  )
}
