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

eYo.require('p6y')

/**
 * @name {eYo.register}
 * @namespace
 */
eYo.do.makeNS(eYo, 'register')

/**
 * Adds `fooRegister` and `fooUnregister` methods, and
 * `fooRegistered` array to the given object,
 * as soon as `foo` is the given key.
 * `fooForEach` and `fooSome` iterators are provided too.
 * Only new methods are allowed.
 * @param {Object} object - the object to extend, or the constructor whose prototype will be extended.
 * @param {String} key - The unique key prefixing the added methods
 * @param {Function} filter - The function to filter out objects before registering.
 */
eYo.register.add = function (object, key, filter) {
  let k = key + 'Registered'
  if (eYo.isC9r(object)) {
    eYo.isF(object.eyo.p6yMerge) || eYo.throw(`Not a proper subclass.`)
    object.eyo.p6yMerge({
      [k] () {
        return new Set()
      }
    })
    object = object.prototype
  } else {
    Object.defineProperty(object, k, {value: new Set()})
  }
  let model = {
    [key + 'Register']: function (object) {
      let registered = this[k]
      if (!filter || filter(object)) {
        registered.add(object)
      }
    },
    [key + 'Unregister']: function (object) {
      let registered = this[k]
      return registered.delete(object)
    },
    [key + 'ForEach']: function (handler) {
      this[k].forEach(handler, this)
    },
    [key + 'Some']: function (handler) {
      var ans = false
      this[k].forEach((currentValue, currentKey, set) => {
        if (!ans && handler(currentValue, currentKey, set)) {
          ans = true
        }
      }, this)
      return ans
    },
  }
  Object.keys(model).forEach(k => {
    eYo.hasOwnProperty(object, k) && eYo.throw(`Unexpected property ${k}`)
    let f = model[k]
    object[k] = f // maybe some post processing here...
  })
}
