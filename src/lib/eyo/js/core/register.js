/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Add methods to register bricks, only when not in flyout.
 * Not really strong because of the storage management.
 * Is it defined shared or not ?
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.provide('do.register')

/**
 * Adds `fooRegister` and `fooUnregister` methods, and
 * `fooRegister` array to the given object,
 * as soon as `foo` is the given key.
 * `fooForEach` and `fooSome` iterators are provided too.
 * Only new methods are allowed.
 * @param {Object} object - the object to extend, or the constructor whose prototype will be extended.
 * @param {String} key - The unique key prefixing the added methods
 * @param {Function} filter - The function to filter out objects before registering.
 */
eYo.do.register.add = function (object, key, filter) {
  let k = key + 'Registered'
  if (eYo.isF(object)) {
    object.eyo.propertiesMerge({
      [k] () {
        return []
      }
    })
    object = object.prototype
  } else {
    Object.defineProperty(object, k, {value: []})
  }
  let model = {
    [key + 'Register']: function (object) {
      let registered = this[k]
      if (filter(object)) {
        let i = registered.indexOf(object)
        if (i < 0) {
          registered.push(object)
        }
      }
    },
    [key + 'Unregister']: function (object) {
      let registered = this[k]
      var i = registered.indexOf(object)
      if (i>=0) {
        registered.splice(i)
      }
    },
    [key + 'ForEach']: function (handler) {
      this[k].forEach(handler, this)
    },
    [key + 'Some']: function (handler) {
      this[k].some(handler, this)
    },
  }
  Object.keys(model).forEach(k => {
    eYo.hasOwnProperty(object, k) && eYo.throw(`Unexpected property ${key}`)
    let f = model[k]
    object[k] = f // maybe some post processing here...
  })
}
