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
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.PARS,
      label: 'lambda',
      check: ezP.T3.Expr.parameter_list,
      wrap: ezP.T3.Expr.parameter_list
    },
    last: {
      key: ezP.Const.Input.EXPR,
      label: ':',
      check: this.epressionType
    }
  }
}
goog.inherits(ezP.DelegateSvg.Lambda, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Lambda.prototype.expressionType = undefined

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
  this.expressionType = ezP.T3.Expr.Check.expression
  this.outputCheck = ezP.T3.Expr.lambda_expr
}
goog.inherits(ezP.DelegateSvg.Expr.lambda_expr, ezP.DelegateSvg.Lambda)

ezP.DelegateSvg.Manager.register('lambda_expr')

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
  this.expressionType = ezP.T3.Expr.Check.expression_nocond
  this.outputCheck = ezP.T3.Expr.lambda_expr_nocond
}
goog.inherits(ezP.DelegateSvg.Expr.lambda_expr_nocond, ezP.DelegateSvg.Lambda)

ezP.DelegateSvg.Manager.register('lambda_expr_nocond')

