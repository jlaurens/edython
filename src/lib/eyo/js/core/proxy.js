/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Proxy namespace.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name{eYo.Proxy}
 * @namespace
 **/

eYo.provide('Proxy')

/**
 * Returns a Proxy to the tied rectangle.
 * The coordinates are filtered by the to and from maps.
 * @param {Object} tied - A tied object.
 * @param {Map<key, Function>} toTied - 
 * @param {Map<key, Function>} fromTied -
 * @return {Proxy} the receiver
 */
eYo.Proxy.tied = function (tied, toTied, fromTied) {
  let handler = {
    get (object, prop) {
      let f = fromTied[prop]
      var ans = object[prop]
      return eYo.isF(f) ? f(ans, object) : ans
    },
    set (object, prop, after) {
      let f = toTied[prop]
      object[prop] = eYo.isF(f) ? f(after, object) : after
    },
  }
  return new Proxy(tied, handler)
}
