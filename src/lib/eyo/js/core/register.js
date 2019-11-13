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

goog.provide('eYo.Protocol.Register')

goog.require('eYo.Protocol')

eYo.Protocol.Register = function (key, filter) {
  var ans = {
    methods: {},
    properties: {}
  }
  var registered = []
  ans.methods['register' + key.charAt(0).toUpperCase() + key.slice(1)] = function (object) {
    if (filter(object)) {
      var i = registered.indexOf(object)
      if (i < 0) {
        registered.push(object)
      }
    }
  }
  ans.methods['unregister' + key.charAt(0).toUpperCase() + key.slice(1)] = function (object) {
    var i = registered.indexOf(object)
    if (i>=0) {
      registered.splice(i)
    }
  }
  ans.methods['forEach' + key.charAt(0).toUpperCase() + key.slice(1)] = function (handler) {
    registered.forEach(handler, this)
  }
  ans.methods['some' + key.charAt(0).toUpperCase() + key.slice(1)] = function (handler) {
    registered.some(handler, this)
  }
  return ans
}
