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

goog.provide('ezP.DelegateSvg.Wrap')

goog.require('ezP.ContextMenu')
goog.require('ezP.DelegateSvg.Stmt')

/**
 * Class for a DelegateSvg, assignment_expression block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.assignment_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.assignment_expression.superClass_.constructor.call(this, prototypeName)
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.LHS,
      wrap: ezP.T3.Expr.target_list,
    },
    last: {
      key: ezP.Const.Input.RHS,
      label: '=',
      check: ezP.T3.Expr.Check.assigned_expression,
    },
  }
  this.outputData_.check = ezP.T3.Expr.assignment_expression
}
goog.inherits(ezP.DelegateSvg.Expr.assignment_expression, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('assignment_expression')

/**
 * Class for a DelegateSvg, expression_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.expression_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.expression_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData_.last = {
    key: ezP.Const.Input.LIST,
    wrap: ezP.T3.Expr.non_void_starred_item_list,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.expression_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('expression_stmt')

/**
 * Class for a DelegateSvg, assignment_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.assignment_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.assignment_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData_.last = {
    key: ezP.Const.Input.EXPR,
    wrap: ezP.T3.Expr.assignment_expression,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.assignment_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('assignment_stmt')

/**
 * Class for a DelegateSvg, del_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.del_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.del_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData_.last = {
    key: ezP.Const.Input.LIST,
    label: 'del',
    css_class: 'ezp-code-reserved',
    wrap: ezP.T3.Expr.target_list,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.del_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('del_stmt')

/**
 * Class for a DelegateSvg, return_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.return_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.return_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData_.last = {
    key: ezP.Const.Input.LIST,
    label: 'return',
    css_class: 'ezp-code-reserved',
    wrap: ezP.T3.Expr.expression_list,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.return_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('return_stmt')
