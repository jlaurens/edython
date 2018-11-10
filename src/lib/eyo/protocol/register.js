/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Add methods to register block delegates, only when not in flyout.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Protocol.Register')

goog.require('eYo.Protocol')
goog.require('eYo.Events')

eYo.Protocol.Register = function (key) {
  var ans = {
    methods: {},
    properties: {}
  }
  var registered = []
  ans.methods['register' + key.charAt(0).toUpperCase() + key.slice(1)] = function (delegate) {
    if (delegate.block_.isInFlyout) {
      return
    }
    var i = registered.indexOf(delegate)
    if (i < 0) {
      registered.push(delegate)
    }
  }
  ans.methods['unregister' + key.charAt(0).toUpperCase() + key.slice(1)] = function (delegate) {
    var i = registered.indexOf(delegate)
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
