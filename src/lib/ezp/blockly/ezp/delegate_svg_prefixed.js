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
 * Class for a DelegateSvg, '*...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.or_expr_starred = function (prototypeName) {
  ezP.DelegateSvg.Expr.or_expr_starred.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    first: {
      label: '*',
      check: ezP.T3.Require.or_expr
    }
  }
  this.outputCheck = ezP.T3.or_expr_starred
}
goog.inherits(ezP.DelegateSvg.Expr.or_expr_starred, ezP.DelegateSvg.Expr)

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
  this.inputData = {
    first: {
      label: '**',
      check: ezP.T3.Require.or_expr
    }
  }
  this.outputCheck = ezP.T3.or_expr_double_starred
}
goog.inherits(ezP.DelegateSvg.Expr.or_expr_double_starred, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.or_expr_double_starred, ezP.DelegateSvg.Expr.or_expr_double_starred)

/**
* Class for a DelegateSvg, identifier_dotted.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.identifier_dotted = function (prototypeName) {
  ezP.DelegateSvg.Expr.identifier_dotted.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    first: {
      label: '.',
      check: ezP.T3.identifier
    }
  }
  this.outputCheck = ezP.T3.identifier_dotted
}
goog.inherits(ezP.DelegateSvg.Expr.identifier_dotted, ezP.DelegateSvg.Expr)

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
  this.inputData = {
    first: {
      label: 'await',
      check: ezP.T3.Require.primary
    }
  }
  this.outputCheck = ezP.T3.await_expr
}
goog.inherits(ezP.DelegateSvg.Expr.await_expr, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.await_expr, ezP.DelegateSvg.Expr.await_expr)
