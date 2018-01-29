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

goog.provide('ezP.DelegateSvg.Expr.lefted')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, '**...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.lefted = function (prototypeName) {
  ezP.DelegateSvg.Expr.lefted.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Expr.lefted, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Expr.lefted.prototype.operator = undefined
ezP.DelegateSvg.Expr.lefted.prototype.checkTypes = undefined
ezP.DelegateSvg.Expr.lefted.prototype.outputCheck = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * No direct call.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.lefted.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.lefted.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.EXPR)
    .setCheck(this.checkTypes)
}

/**
 * Class for a DelegateSvg, '*...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.or_expr_starred = function (prototypeName) {
  ezP.DelegateSvg.Expr.or_expr_starred.superClass_.constructor.call(this, prototypeName)
  this.labelLeft = '*'
  this.checkTypes = ezP.T3.Require.expression
  this.outputCheck = ezP.T3.or_expr_starred
}
goog.inherits(ezP.DelegateSvg.Expr.or_expr_starred, ezP.DelegateSvg.Expr.lefted)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.or_expr_starred, ezP.DelegateSvg.Expr.or_expr_starred)

/**
 * Class for a DelegateSvg, '**...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.or_expr_double_starred = function (prototypeName) {
  ezP.DelegateSvg.Expr.or_expr_double_starred.superClass_.constructor.call(this, prototypeName)
  this.label = '**'
  this.checkTypes = ezP.T3.Require.expression
  this.outputCheck = ezP.T3.or_expr_double_starred
}
goog.inherits(ezP.DelegateSvg.Expr.or_expr_double_starred, ezP.DelegateSvg.Expr.lefted)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.or_expr_double_starred, ezP.DelegateSvg.Expr.or_expr_double_starred)

/**
 * Class for a DelegateSvg, yield_from.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_from = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_from.superClass_.constructor.call(this, prototypeName)
  this.label = 'from'
  this.checkTypes = ezP.T3.Require.expression
  this.outputCheck = ezP.T3.yield_from
}
goog.inherits(ezP.DelegateSvg.Expr.yield_from, ezP.DelegateSvg.Expr.lefted)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.yield_from, ezP.DelegateSvg.Expr.yield_from)

/**
* Class for a DelegateSvg, identifier_dotted.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.identifier_dotted = function (prototypeName) {
  ezP.DelegateSvg.Expr.identifier_dotted.superClass_.constructor.call(this, prototypeName)
  this.label = '.'
  this.checkTypes = ezP.T3.identifier
  this.outputCheck = ezP.T3.identifier_dotted
}
goog.inherits(ezP.DelegateSvg.Expr.identifier_dotted, ezP.DelegateSvg.Expr.lefted)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.identifier_dotted, ezP.DelegateSvg.Expr.identifier_dotted)

/**
* Class for a DelegateSvg, await_expr.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.await_expr = function (prototypeName) {
  ezP.DelegateSvg.Expr.await_expr.superClass_.constructor.call(this, prototypeName)
  this.label = 'await'
  this.checkTypes = ezP.T3.Require.primary
  this.outputCheck = ezP.T3.await_expr
}
goog.inherits(ezP.DelegateSvg.Expr.await_expr, ezP.DelegateSvg.Expr.lefted)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.await_expr, ezP.DelegateSvg.Expr.await_expr)
