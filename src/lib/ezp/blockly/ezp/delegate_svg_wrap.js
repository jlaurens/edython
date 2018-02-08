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
  this.outputCheck = ezP.T3.Expr.assignment_expression
}
goog.inherits(ezP.DelegateSvg.Expr.assignment_expression, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('assignment_expression')

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.assignment_expression.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.assignment_expression.superClass_.initBlock.call(this, block)
  this.inputLIST = block.appendWrapValueInput(ezP.Const.Input.LIST, ezP.T3.Expr.target_list)
  block.appendValueInput(ezP.Const.Input.RHS)
    .setCheck(ezP.T3.Expr.Check.assigned_expression)
    .appendField(new ezP.FieldLabel('='))
}

/**
 * Class for a DelegateSvg, expression_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.expression_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.expression_stmt.superClass_.constructor.call(this, prototypeName)
  this.wrappedCheck = ezP.T3.Expr.starred_item_list
  this.wrappedPrototype = ezP.T3.Expr.starred_item_list
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
  this.wrappedCheck = ezP.T3.Expr.assignment_expression
  this.wrappedPrototype = ezP.T3.Expr.assignment_expression
}
goog.inherits(ezP.DelegateSvg.Stmt.assignment_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('assignment_stmt')

/**
 * Class for a DelegateSvg, augmented_assignment_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.augmented_assignment_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    first: {
      wrap: ezP.T3.Expr.augmented_assignment_expression,
      check: ezP.T3.Expr.augmented_assignment_expression
    }
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.augmented_assignment_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('augmented_assignment_stmt')

/**
 * Class for a DelegateSvg, del_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.del_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.del_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    last: {
      label: 'del',
      check: ezP.T3.Expr.target_list,
      wrap: ezP.T3.Expr.target_list
    }
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
  this.inputData.last = {
    label: 'return',
    check: ezP.T3.Expr.expression_list,
    wrap: ezP.T3.Expr.expression_list
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.return_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('return_stmt')

/**
 * Class for a DelegateSvg, identifier_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.identifier_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.identifier_list.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Expr.Check.identifier_list, false, ',')
  this.outputCheck = ezP.T3.Expr.identifier_list
}
goog.inherits(ezP.DelegateSvg.Expr.identifier_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('identifier_list')

/**
 * Class for a DelegateSvg, global_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.global_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.global_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    last: {
      label: 'global',
      check: ezP.T3.Expr.identifier_list,
      wrap: ezP.T3.Expr.identifier_list
    }
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.global_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('global_stmt')

/**
 * Class for a DelegateSvg, nonlocal_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.nonlocal_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.global_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    last: {
      label: 'nonlocal',
      check: ezP.T3.Expr.identifier_list,
      wrap: ezP.T3.Expr.identifier_list
    }
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.nonlocal_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('nonlocal_stmt')
