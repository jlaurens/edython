/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Protocol utilities.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo')

goog.provide('eYo.Link')

/**
 * Add a link properties.
 * The receiver is not the owner.
 * @param {Object} constructor,  Its prototype object gains a storage named `foo__` and both getters and setters for `foo_`.
 * The initial value is `eYo.NA`.
 * @param {String} ...names names of the links to add
 */
eYo.Link.declare = (constructor, ...many) => {
  const proto = constructor.prototype
  const eyo = constructor.eyo__ ||(constructor.eyo__ = Object.create(null))
  const links = eyo.links || (eyo.links = new Set())
  many.forEach(k => {
    links.add(k)
    var k_ = k + '_'
    var k__ = k + '__'
    Object.defineProperties(
      proto, 
      {
        [k__]: {value: eYo.NA, writable: true},
        [k_]: {
          get () {
            return this[k__]
          },
          set(after) {
            var before = this[k__]
            if (before !== after) {
              this[k__] = after
            }
          },
        },
      }
    )
  })  
}

/**
 * Used in the constructor of object to declare all its constructor's known links.
 * @param {Object} constructor,  the constructor of the object below
 * @param {Object} object,  an instance of the constructor above
 */
eYo.Link.define = function (constructor, object) {
  constructor.eyo__.links.forEach(k => {
    Object.defineProperty(object, k, {
      get () {
        return this[k + '__']
      },
      set () {
        throw "Forbidden setter"
      }
    })
  })
}

/**
 * Dispose in the given object, the links given by the constructor.
 * @param {Object} constructor,  the constructor of the object below
 * @param {Object} object,  an instance of the constructor above
 */
eYo.Link.clear = function (constructor, object) {
  constructor.eyo__.links.forEach(k => {
    var k_ = k + '_'
    var x = object[k_]
    if (x) {
      object[k_] = eYo.NA
    }
  })
}
