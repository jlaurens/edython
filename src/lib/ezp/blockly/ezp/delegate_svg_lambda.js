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

goog.provide('ezP.DelegateSvg.Lambda')

goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, lambda_expr block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Lambda = function (prototypeName) {
  ezP.DelegateSvg.Lambda.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Lambda, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.List.prototype.expressionType = undefined
ezP.DelegateSvg.List.prototype.outputType = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Lambda.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Lambda.superClass_.initBlock.call(this, block)
  this.inputLIST = block.appendSealedValueInput(ezP.Const.Input.LIST)
    .setCheck(ezP.T3.parameter_list)
    .appendField(new ezP.FieldLabel('lambda'))
  block.appendValueInput(ezP.Const.Input.XPR)
    .setCheck(this.expressionType)
    .appendField(new ezP.FieldLabel(':'))
  block.setOutput(true, this.outputType)
}

/**
 * Create a sealed node for the comprehension if necessary.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Lambda.prototype.completeSealed = function (block) {
  this.completeSealedInput(block,
    this.inputLIST,
    ezP.Const.Expr.parameter_list)
}

/**
 * Class for a DelegateSvg, lambda_expr block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.lambda_expr = function (prototypeName) {
  ezP.DelegateSvg.Expr.lambda_expr.superClass_.constructor.call(this, prototypeName)
  this.expressionType = ezP.T3.Require.expression
  this.outputType = ezP.T3.lambda_expr
}
goog.inherits(ezP.DelegateSvg.Expr.lambda_expr, ezP.DelegateSvg.Lambda)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.lambda_expr, ezP.DelegateSvg.Expr.lambda_expr)

/**
 * Class for a DelegateSvg, lambda_expr_nocond block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.lambda_expr_nocond = function (prototypeName) {
  ezP.DelegateSvg.Expr.lambda_expr_nocond.superClass_.constructor.call(this, prototypeName)
  this.expressionType = ezP.T3.Require.expression_nocond
  this.outputType = ezP.T3.lambda_expr_nocond
}
goog.inherits(ezP.DelegateSvg.Expr.lambda_expr_nocond, ezP.DelegateSvg.Lambda)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.lambda_expr_nocond, ezP.DelegateSvg.Expr.lambda_expr_nocond)

