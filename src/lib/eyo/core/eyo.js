/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */

/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo
 * @namespace
 **/
goog.provide('eYo')

/**
 * Setup.
 */
eYo.setup = (function () {
  var i11rs = []
  var me = function () {
    for (var i11r, i = 0; (i11r = i11rs[i]); ++i) {
      i11r()
    }
    i11rs = undefined
  }
  me.register = function (i11r) {
    goog.asserts.assert(i11rs)
    i11rs.push(i11r)
  }
  return me
}())

/* Replace the cssText for rule matching selectorText with value
 ** Changes all matching rules in all style sheets
 ** https://stackoverflow.com/questions/7657363/changing-global-css-styles-from-javascript
 */
eYo.replaceRuleProperty = function (selectorText, propertyName, value, priority) {
  var sheets = document.styleSheets
  for (var i = 0, iLen = sheets.length; i < iLen; i++) {
    var sheet = sheets[i]
    if (sheet.cssRules) {
      var rules = sheet.cssRules
      for (var j = 0, jLen = rules.length; j < jLen; j++) {
        var rule = rules[j]
        if (rule.selectorText === selectorText) {
          if (value) {
            rule.style.setProperty(propertyName, value, priority)
          } else {
            rule.style.removeProperty(propertyName)
          }
        }
      }
    }
  }
}

goog.asserts.assert(Object.setPrototypeOf, 'No setPrototypeOf, buy a new computer')

/**
 * Contrary to goog.inherits, does not erase the childC9r.prototype.
 * IE<11
 */
eYo.inherits = function (childC9r, parentC9r) {
  childC9r.superClass_ = parentC9r.prototype
  Object.setPrototypeOf(childC9r.prototype, parentC9r.prototype)
  childC9r.prototype.constructor = childC9r
}
