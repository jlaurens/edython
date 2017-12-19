/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */

/**
 * @fileoverview helper for ezPython.
 * In order to avoid name collisions, every subclass of either a
 * closure object or a Blockly object has a minimum of extra properties.
 * All these properties and methods are gathered in the  helper.
 * Block helpers are called delegates.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Helper')

goog.require('goog.Disposable')

/**
 * Class for a an object helper for ezPython related subclasses.
 * @constructor
 */
ezP.Helper = function () {
  ezP.Helper.superClass_.constructor.call(this)
}
goog.inherits(ezP.Helper, goog.Disposable)
