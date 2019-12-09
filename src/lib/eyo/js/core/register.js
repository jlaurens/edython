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

eYo.require('eYo.ns.Protocol')

eYo.provide('eYo.ns.Protocol.Register')

eYo.ns.Protocol.Register = function (key, filter) {
  var ans = {
    methods: {},
    properties: {}
  }
  var registered = []
  ans.methods[key + 'Register'] = function (object) {
    if (filter(object)) {
      var i = registered.indexOf(object)
      if (i < 0) {
        registered.push(object)
      }
    }
  }
  ans.methods[key + 'Unregister'] = function (object) {
    var i = registered.indexOf(object)
    if (i>=0) {
      registered.splice(i)
    }
  }
  ans.methods[key + 'ForEach'] = function (handler) {
    registered.forEach(handler, this)
  }
  ans.methods[key + 'Some'] = function (handler) {
    registered.some(handler, this)
  }
  return ans
}
