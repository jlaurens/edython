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
 * Only new methods are allowed.
 */
eYo.Do.addProtocol = function () {
  var args = Array.prototype.slice.call(arguments)
  var proto = args.shift()
  var base = args.shift()
  if (goog.isString(base)) {
    base = eYo.Protocol[base]
  }
  if (goog.isFunction(base)) {
    base = base.apply(proto, args)
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
