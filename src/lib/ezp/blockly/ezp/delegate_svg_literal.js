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

goog.provide('ezP.DelegateSvg.Literal')

goog.require('ezP.DelegateSvg.Expr')
goog.require('ezP.T3.All')

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Literal = function (prototypeName) {
  ezP.DelegateSvg.Literal.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Literal, ezP.DelegateSvg.Expr)

/**
 * Create and initialize the various paths,
 * the first, middle and last inputs if required.
 * Called once at block creation time.
 * @param {!Blockly.Block} block to be initialized..
 * @private
 */
ezP.DelegateSvg.Literal.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Literal.superClass_.initBlock.call(this, block)
  block.appendDummyInput()
      .appendField(new ezP.FieldCodeInput(), ezP.Const.Field.VALUE)
}