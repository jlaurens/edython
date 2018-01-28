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

goog.provide('ezP.DelegateSvg.Expr.Comprehension')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, comprehension value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.Comprehension = function (prototypeName) {
  ezP.DelegateSvg.Expr.Comprehension.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.comprehension
}
goog.inherits(ezP.DelegateSvg.Expr.Comprehension, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.comprehension, ezP.DelegateSvg.Expr.Comprehension)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * The FOR value is a connection to a sealed block
 * This connection will be sent far away to prevent block (dis)connection.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.Comprehension.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.Comprehension.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.EXPR)
    .setCheck(ezP.T3.Require.expression)
  this.inputFORIN = block.appendSealedValueInput(ezP.Const.Input.FORIN, ezP.Const.Expr.comp_for)
    .setCheck(ezP.T3.comp_for)
  this.inputITER = block.appendSealedValueInput(ezP.Const.Input.ITER, ezP.Const.Expr.comp_iter_list)
    .setCheck(ezP.T3.comp_iter_list)
}

/**
 * Class for a DelegateSvg, comp_for block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.comp_for = function (prototypeName) {
  ezP.DelegateSvg.Expr.comp_for.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.comp_for
}
goog.inherits(ezP.DelegateSvg.Expr.comp_for, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.comp_for, ezP.DelegateSvg.Expr.comp_for)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.comp_for.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.comp_for.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.FOR)
    .setCheck(ezP.T3.Require.target_list)
    .appendField(new ezP.FieldLabel('for'))
  block.appendValueInput(ezP.Const.Input.IN)
    .setCheck(ezP.T3.Require.or_test)
    .appendField(new ezP.FieldLabel('in'))
}

/**
 * Class for a DelegateSvg, comp_if block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.comp_if = function (prototypeName) {
  ezP.DelegateSvg.Expr.comp_if.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.comp_if
}
goog.inherits(ezP.DelegateSvg.Expr.comp_if, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.comp_if, ezP.DelegateSvg.Expr.comp_if)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.comp_if.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.comp_if.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.IF)
    .setCheck(ezP.T3.Require.expression_nocond)
    .appendField(new ezP.FieldLabel('if'))
}
