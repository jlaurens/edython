/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Proc')

goog.require('ezP.DelegateSvg.Group')

/**
 * Class for a DelegateSvg, proc block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Proc = function (prototypeName) {
  ezP.DelegateSvg.Proc.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Proc, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register(ezP.Const.Prc.DEFAULT, ezP.DelegateSvg.Proc)
ezP.DelegateSvg.Manager.register(ezP.Const.Prc.DEF, ezP.DelegateSvg.Proc)
ezP.DelegateSvg.Manager.register(ezP.Const.Prc.CLASS, ezP.DelegateSvg.Proc)
