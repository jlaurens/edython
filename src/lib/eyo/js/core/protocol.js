/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Protocol utilities.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo.ns')

eYo.ns.make('Protocol')

/**
 * Enhance the prototype with the given methods and properties.
 * Only new methods are allowed.
 */
eYo.ns.Protocol.add = function (proto, base, ...args) {
  if (eYo.isStr(base)) {
    base = eYo.ns.Protocol[base]
  }
  if (goog.isFunction(base)) {
    base = base.call(proto, ...args)
  }
  if (base.methods) {
    var key
    for(key in base.methods) {
      if (eYo.Do.hasOwnProperty(base.methods, key)) {
        var method = base.methods[key]
        if (goog.isFunction(method)) {
          eYo.assert(!proto[key], key + 'already exists')
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
