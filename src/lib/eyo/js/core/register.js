/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Add methods to register bricks, only when not in flyout.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.provide('Do.Register')

/**
 * Adds a `fooRegister` and a `fooUnregister` method to the given object, as soon as `foo` is the given key. `fooForEach` and `fooSome` iterators are provided too.
 * Only new methods are allowed.
 * @param {Object} object - the object to extend, either a constructor (a function) or an instance.
 * @param {String} key - The unique key prefixing the added methods
 * @param {Function} filter - The function to filter out objects before registering.
 */
eYo.Do.Register.add = function (object, key, filter) {
  if (eYo.isF(object)) {
    object.eyo.modelDeclare({
      valued: {
        [key + 'Registered'] () {
          return []
        }
      }
    })
    object = object.prototype
  } else {
    Object.defineProperty(object, key + 'Registered', {value: []})
  }
  let model = {
    [key + 'Register']: function (object) {
      let registered = this[key + 'Registered']
      if (filter(object)) {
        let i = registered.indexOf(object)
        if (i < 0) {
          registered.push(object)
        }
      }
    },
    [key + 'Unregister']: function (object) {
      let registered = this[key + 'Registered']
      var i = registered.indexOf(object)
      if (i>=0) {
        registered.splice(i)
      }
    },
    [key + 'ForEach']: function (handler) {
      this[key + 'Registered'].forEach(handler, this)
    },
    [key + 'Some']: function (handler) {
      this[key + 'Registered'].some(handler, this)
    },
  }
  Object.keys(model).forEach(k => {
    eYo.assert(!eYo.Do.hasOwnProperty(object, k))
    let f = model[k]
    object[k] = f // maybe some post processing here
  })
}
