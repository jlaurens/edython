/**
 * @license
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview utilities for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

/**
 * @name EZP
 * @namespace
 **/
goog.provide('EZP');


/**
 * Setup.
 */
EZP.setup = function() {
  var i11rs = [];
  var me = function() {
    for (var i11r, _ = 0; i11r = i11rs[_];++_) {
      i11r();
    }
    i11rs = undefined;
  };
  me.register = function(i11r) {
    goog.asserts.assert(i11rs);
    i11rs.push(i11r);
  };
  return me;
}();

/* Replace the cssText for rule matching selectorText with value
 ** Changes all matching rules in all style sheets
 ** https://stackoverflow.com/questions/7657363/changing-global-css-styles-from-javascript
 */
EZP.replaceRuleProperty = function(selectorText, propertyName, value, priority) {
  var sheets = document.styleSheets;
  var rule;
  var k, l;
  for (var i=0, iLen=sheets.length; i<iLen; i++) {
    var sheet = sheets[i];
    if (sheet.cssRules) {
      var rules = sheet.cssRules;
      for (var j=0, jLen=rules.length; j<jLen; j++) {
        var rule = rules[j];
        if (rule.selectorText == selectorText) {
          if (value) {
            rule.style.setProperty(propertyName, value, priority);
          } else {
            rule.style.removeProperty(propertyName);
          }
        }
      }
    }
  }
}

if (Object.setPrototypeOf) {
  goog.provide('EZP.setPrototypeOf');
}
goog.require('EZP.setPrototypeOf');

/**
 * Contrary to goog.inherits, does not erase the childCtor.prototype.
 * IE<11
 */
EZP.inherits = function(childCtor, parentCtor) {
  childCtor.superClass_ = parentCtor.prototype;
  Object.setPrototypeOf(childCtor.prototype,parentCtor.prototype);
  childCtor.prototype.constructor = childCtor;
};
