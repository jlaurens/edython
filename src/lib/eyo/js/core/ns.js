/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview namespace utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo')

eYo.provide('eYo.ns')

/**
 * @name {eYo.ns}
 * @namespace
 */
eYo.ns = (() => {
  var NS = function() {}
  var ans = new NS()
  Object.defineProperties(ans, {
    name: { value: 'eYo.ns' }, 
  })
  return ans
})()

/**
 * @name {eYo.ns.make}
 * Make a namespace by subclassing the caller's constructor.
 * @param {String} key - capitalised name, created object will be `eYo.ns[key]`.
 * @return {Object}
 */
eYo.ns.constructor.prototype.make = function (key) {
  eYo.parameterAssert(eYo.isStr(key), 'Unexpected key type')
  var Super = this.constructor
  var NS = function () {
    Super.call(this)
  }
  eYo.inherits(NS, Super)
  Object.defineProperty(NS.prototype, 'super', {
    value: this,
  })
  var ans = new NS()
  if (eYo.ns[key]) {
    throw new Error(`eYo.ns[${key}] already exists.`)
  }
  Object.defineProperty(eYo.ns, key, {
    value: ans,
  })
  Object.defineProperties(ans, {
    name: { value: `${this.name}.${key}`, },
  })
  return ans
}
