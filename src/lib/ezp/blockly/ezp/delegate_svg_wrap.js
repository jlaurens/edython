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
 * Class for a DelegateSvg, statement wrapping an expression .
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Wrap = function (prototypeName) {
  ezP.DelegateSvg.Wrap.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Wrap, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Wrap.prototype.wrappedType = undefined
ezP.DelegateSvg.Wrap.prototype.wrappedPrototype = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Wrap.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Wrap.superClass_.initBlock.call(this, block)
  this.inputWRAP = block.appendSealedValueInput(ezP.Const.Input.WRAP)
    .setCheck(this.wrappedType)
}

/**
 * Create a sealed node for the expression list.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Wrap.prototype.completeSealed = function (block) {
  this.completeSealedInput(block,
    this.inputWRAP,
    this.wrappedPrototype)
}

/**
 * Populate the context menu for the given block.
 * Forwards management to the sealed block
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Wrap.prototype.populateContextMenu_ = function (block, menu) {
  var target = this.inputWRAP.connection.targetBlock()
  if (target) {
    target.ezp.populateContextMenu_(target, menu)
  } else {
    ezP.DelegateSvg.Wrap.superClass_.populateContextMenu_.call(this,block, menu)
  }
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Forwards management to the sealed block
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Wrap.prototype.handleActionMenuEvent = function (block, menu, event) {
  var target = this.inputWRAP.outConnection.targetBlock()
  return target && target.ezp.handleActionMenuEvent(target, menu, event)
}


/**
 * Class for a DelegateSvg, assignment_expression block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.assignment_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.assignment_expression.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.assignment_expression
}
goog.inherits(ezP.DelegateSvg.Expr.assignment_expression, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.assignment_expression, ezP.DelegateSvg.Expr.assignment_expression)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.assignment_expression.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.assignment_expression.superClass_.initBlock.call(this, block)
  this.inputLIST = block.appendSealedValueInput(ezP.Const.Input.LIST)
  block.appendValueInput(ezP.Const.Input.RHS)
    .setCheck(ezP.T3.Require.assigned_expression)
    .appendField(new ezP.FieldLabel('='))
}

/**
 * Create a sealed node for the comprehension if necessary.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.assignment_expression.prototype.completeSealed = function (block) {
  this.completeSealedInput(block,
    this.inputLIST,
    ezP.Const.Expr.target_list)
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
  this.wrapperType = ezP.T3.starred_item_list
  this.wrappedPrototype =ezP.Const.Expr.starred_item_list
}
goog.inherits(ezP.DelegateSvg.Stmt.expression_stmt, ezP.DelegateSvg.Wrap)

ezP.DelegateSvg.Manager.register(ezP.Const.Stmt.expression_stmt, ezP.DelegateSvg.Stmt.expression_stmt)

/**
 * Class for a DelegateSvg, assignment_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.assignment_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.assignment_stmt.superClass_.constructor.call(this, prototypeName)
  this.wrapperType = ezP.T3.assignment_expression
  this.wrappedPrototype = ezP.Const.Expr.assignment_expression
}
goog.inherits(ezP.DelegateSvg.Stmt.assignment_stmt, ezP.DelegateSvg.Wrap)

ezP.DelegateSvg.Manager.register(ezP.Const.Stmt.assignment_stmt, ezP.DelegateSvg.Stmt.assignment_stmt)


/**
 * Class for a DelegateSvg, augmented_assignment_expression block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.augmented_assignment_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.augmented_assignment_expression.superClass_.constructor.call(this, prototypeName)
  this.operator = '+='
  this.operators = ['+=','-=','*=','@=','/=','//=','%=','**='
 ,'>>=','<<=','&=','^=','|=']
  this.operatorData = {
    '+=': {'LABEL':'... += ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '-=': {'LABEL':'... -= ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '*=': {'LABEL':'... *= ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '@=': {'LABEL':'...   = ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '/=': {'LABEL':'... /= ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '//=': {'LABEL':'... //= ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '%=': {'LABEL':'... %= ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '**=': {'LABEL':'... **= ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '>>=': {'LABEL':'... >>= ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '<<=': {'LABEL':'... <<= ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '&=': {'LABEL':'... &= ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '^=': {'LABEL':'... ^= ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
    '|=': {'LABEL':'... |= ...', 'OUT': ezP.T3.augmented_assignment_expression, 'RHS': ezP.T3.Require.aug_assigned, 'LHS': ezP.T3.Require.augtarget},
  }
}

goog.inherits(ezP.DelegateSvg.Expr.augmented_assignment_expression, ezP.DelegateSvg.Expr.Binary)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.augmented_assignment_expression, ezP.DelegateSvg.Expr.augmented_assignment_expression)

/**
 * Class for a DelegateSvg, augmented_assignment_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.augmented_assignment_stmt.superClass_.constructor.call(this, prototypeName)
  this.wrapperType = ezP.T3.augmented_assignment_expression
  this.wrappedPrototype = ezP.Const.Expr.augmented_assignment_expression
}
goog.inherits(ezP.DelegateSvg.Stmt.augmented_assignment_stmt, ezP.DelegateSvg.Wrap)

ezP.DelegateSvg.Manager.register(ezP.Const.Stmt.augmented_assignment_stmt, ezP.DelegateSvg.Stmt.augmented_assignment_stmt)


/**
 * Class for a DelegateSvg, del_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.del_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.del_stmt.superClass_.constructor.call(this, prototypeName)
  this.wrapperType = ezP.T3.target_list
  this.wrappedPrototype = ezP.Const.Expr.target_list
}
goog.inherits(ezP.DelegateSvg.Stmt.del_stmt, ezP.DelegateSvg.Wrap)

ezP.DelegateSvg.Manager.register(ezP.Const.Stmt.del_stmt, ezP.DelegateSvg.Stmt.del_stmt)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Stmt.del_stmt.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Stmt.del_stmt.superClass_.initBlock.call(this, block)
  this.inputWRAP.appendField(new ezP.FieldLabel('del'))
}
