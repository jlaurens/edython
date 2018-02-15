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

goog.provide('ezP.DelegateSvg.Operator')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, [...] op ... block.
 * Multiple ops.
 * Abstract class.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Operator = function (prototypeName) {
  ezP.DelegateSvg.Operator.superClass_.constructor.call(this, prototypeName)
  this.inputData_ = {
    last: {
      css_class: 'ezp-code',
      key: ezP.Const.Input.RHS,
    },
  }
}
goog.inherits(ezP.DelegateSvg.Operator, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Operator.prototype.operators = undefined

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Operator.prototype.toDom = function (block, element) {
  element.setAttribute('operator', this.inputs.last.fieldLabel.getText())
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Operator.prototype.fromDom = function (block, element) {
  var op = element.getAttribute('operator')
  if (this.operators.indexOf(op) >= 0) {
    this.inputs.last.fieldLabel.setValue(op)
  }
}

ezP.USE_OPERATOR_ID  = 'USE_OPERATOR'

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Operator.prototype.getContent = /* function (block, op) {
} */ undefined

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Operator.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var value = this.inputs.last.fieldLabel.getValue()
  var ezp = this
  var F = function(op) {
    var menuItem = new ezP.MenuItem(
      ezp.getContent(block, op)
      ,{action: ezP.USE_OPERATOR_ID, operator: op}
    )
    menuItem.setEnabled(value != op)
    mgr.addChild(menuItem, true)
  }
  for (var i = 0; i<this.operators.length; i++) {
    F(this.operators[i])
  }
  ezP.DelegateSvg.Operator.superClass_.populateContextMenuFirst_.call(this, block, mgr)
  return true
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!ezP.MenuManager} mgr mgr.menu is the Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Operator.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  var model = event.target.getModel()
  var action = model.action
  var op = model.operator
  if (action == ezP.USE_OPERATOR_ID) {
    if (this.operators.indexOf(op) < 0) {
      return true
    }
    var field = this.inputs.last.fieldLabel
    var old = field.getValue()
    if (old == op) {
      return true
    }
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
        block, 'field', field.ezpData.key, old, op));
    }
    field.setValue(op)
    return true
  }
  return ezP.DelegateSvg.Operator.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
}

//////////////////////  u_expr_concrete  /////////////////////////

/**
 * Class for a DelegateSvg, unary op ... block.
 * u_expr_concrete.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.u_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.u_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.Expr.u_expr_concrete
  this.operators = ['-', '+', '~']
  this.inputData_.last.label = '-'
  this.inputData_.last.check = ezP.T3.Expr.Check.u_expr
}
goog.inherits(ezP.DelegateSvg.Expr.u_expr_concrete, ezP.DelegateSvg.Operator)
ezP.DelegateSvg.Manager.register('u_expr_concrete')

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.u_expr_concrete.prototype.getContent = function (block, op) {
  return op+' ...'
}


/**
 * Class for a DelegateSvg, ... op ... block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary = function (prototypeName) {
  ezP.DelegateSvg.Binary.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first = {
    key: ezP.Const.Input.LHS,
  }
}
goog.inherits(ezP.DelegateSvg.Binary, ezP.DelegateSvg.Operator)

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Binary.prototype.getContent = function (block, op) {
  return '... '+ op +' ...'
}

/**
 * Class for a DelegateSvg, m_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.m_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.m_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.operators = ['*', '//', '/', '%', '@']
  this.inputData_.first.check = ezP.T3.Expr.Check.m_expr
  this.inputData_.last.label = '*'
  this.inputData_.last.check = ezP.T3.Expr.Check.u_expr
  this.outputCheck = ezP.T3.Expr.m_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.m_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('m_expr_concrete')

/**
 * Class for a DelegateSvg, a_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.a_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.a_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.operators = ['+', '-']
  this.inputData_.first.check = ezP.T3.Expr.Check.a_expr
  this.inputData_.last.label = '+'
  this.inputData_.last.check = ezP.T3.Expr.Check.m_expr
  this.outputCheck = ezP.T3.Expr.a_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.a_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('a_expr_concrete')

/**
 * Class for a DelegateSvg, bitwise binary operation block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.bitwise_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.bitwise_concrete.superClass_.constructor.call(this, prototypeName)
  this.operator = '&'
  this.operators = ['<<', '>>', '&', '^', '|']
  this.operatorData = {
    '<<': {
      label:'... << ...',
      output: ezP.T3.Expr.shift_expr_concrete,
      rhs: ezP.T3.Expr.Check.a_expr,
      lhs: ezP.T3.Expr.Check.shift_expr
    },
    '>>': {
      label:'... >> ...',
      output: ezP.T3.Expr.shift_expr_concrete,
      rhs: ezP.T3.Expr.Check.a_expr,
      lhs: ezP.T3.Expr.Check.shift_expr
    },
    '&': {
      label:'... & ...',
      output: ezP.T3.Expr.and_expr_concrete,
      rhs: ezP.T3.Expr.Check.shift_expr,
      lhs: ezP.T3.Expr.Check.and_expr
    },
    '^': {
      label:'... ^ ...',
      output: ezP.T3.Expr.xor_expr_concrete,
      rhs: ezP.T3.Expr.Check.and_expr,
      lhs: ezP.T3.Expr.Check.xor_expr
    },
    '|': {
      label:'... | ...',
      output: ezP.T3.Expr.or_expr_concrete,
      rhs: ezP.T3.Expr.Check.xor_expr,
      lhs: ezP.T3.Expr.Check.or_expr
    },
  }
}
goog.inherits(ezP.DelegateSvg.Expr.bitwise_concrete, ezP.DelegateSvg.Binary)

ezP.DelegateSvg.Manager.register('bitwise_concrete')

/**
 * Class for a DelegateSvg, comparison_concrete block.
 * Multiple ops. This is not a list of comparisons, more like a tree.
 * Maybe we should make a flat version in order to compare the blocks
 * if necessary ever.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.comparison_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.comparison_concrete.superClass_.constructor.call(this, prototypeName)
  this.operator = '<'
  this.operators = ['<', '>', '==', '>=', '<=', '!=', 'is', 'is not', 'in', 'not in']
  this.operatorData = {
    '<': {
      label:'... < ...',
      output: ezP.T3.Expr.comparison_concrete,
      rhs: ezP.T3.Expr.Check.comparison,
      lhs: ezP.T3.Expr.Check.comparison
    },
    '>': {
      label:'... > ...',
      output: ezP.T3.Expr.comparison_concrete,
      rhs: ezP.T3.Expr.Check.comparison,
      lhs: ezP.T3.Expr.Check.comparison
    },
    '==': {
      label:'... == ...',
      output: ezP.T3.Expr.comparison_concrete,
      rhs: ezP.T3.Expr.Check.comparison,
      lhs: ezP.T3.Expr.Check.comparison
    },
    '<=': {
      label:'... <= ...',
      output: ezP.T3.Expr.comparison_concrete,
      rhs: ezP.T3.Expr.Check.comparison,
      lhs: ezP.T3.Expr.Check.comparison
    },
    '>=': {
      label:'... >= ...',
      output: ezP.T3.Expr.comparison_concrete,
      rhs: ezP.T3.Expr.Check.comparison,
      lhs: ezP.T3.Expr.Check.comparison
    },
    '!=': {
      label:'... != ...',
      output: ezP.T3.Expr.comparison_concrete,
      rhs: ezP.T3.Expr.Check.comparison,
      lhs: ezP.T3.Expr.Check.comparison
    },
    'is': {
      label:'... is ...',
      output: ezP.T3.Expr.comparison_concrete,
      rhs: ezP.T3.Expr.Check.comparison,
      lhs: ezP.T3.Expr.Check.comparison
    },
    'is not': {
      label:'... is not ...',
      output: ezP.T3.Expr.comparison_concrete,
      rhs: ezP.T3.Expr.Check.comparison,
      lhs: ezP.T3.Expr.Check.comparison
    },
    'in': {
      label:'... in ...',
      output: ezP.T3.Expr.comparison_concrete,
      rhs: ezP.T3.Expr.Check.comparison,
      lhs: ezP.T3.Expr.Check.comparison
    },
    'not in': {
      label:'... not in ...',
      output: ezP.T3.Expr.comparison_concrete,
      rhs: ezP.T3.Expr.Check.comparison,
      lhs: ezP.T3.Expr.Check.comparison
    },
  }
}
goog.inherits(ezP.DelegateSvg.Expr.comparison_concrete, ezP.DelegateSvg.Binary)

ezP.DelegateSvg.Manager.register('comparison_concrete')

/**
 * Class for a DelegateSvg, boolean_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.boolean_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.boolean_concrete.superClass_.constructor.call(this, prototypeName)
  this.operator = 'or'
  this.operators = ['or', 'and']
  this.operatorData = {
    'or': {
      label:'... or ...',
      output: ezP.T3.Expr.or_test_concrete,
      rhs: ezP.T3.Expr.Check.and_test,
      lhs: ezP.T3.Expr.Check.or_test
    },
    'and': {
      label:'... and ...',
      output: ezP.T3.Expr.and_test_concrete,
      rhs: ezP.T3.Expr.Check.not_test,
      lhs: ezP.T3.Expr.Check.and_test
    },
  }
}
goog.inherits(ezP.DelegateSvg.Expr.boolean_concrete, ezP.DelegateSvg.Binary)

ezP.DelegateSvg.Manager.register('boolean_concrete')


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
    '+=': {
      label:'... += ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '-=': {
      label:'... -= ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '*=': {
      label:'... *= ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '@=': {
      label:'...   = ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '/=': {
      label:'... /= ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '//=': {
      label:'... //= ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '%=': {
      label:'... %= ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '**=': {
      label:'... **= ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '>>=': {
      label:'... >>= ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '<<=': {
      label:'... <<= ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '&=': {
      label:'... &= ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '^=': {
      label:'... ^= ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
    '|=': {
      label:'... |= ...',
      output: ezP.T3.Expr.augmented_assignment_expression,
      rhs: ezP.T3.Expr.Check.aug_assigned,
      lhs: ezP.T3.Expr.Check.augtarget
    },
  }
  this.outputCheck = ezP.T3.Expr.augmented_assignment_expression
}

goog.inherits(ezP.DelegateSvg.Expr.augmented_assignment_expression, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('augmented_assignment_expression')

/**
 * Class for a DelegateSvg, power_concrete block.
 * power_concrete ::= await_or_primary "**" u_expr 
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.power_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.power_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.power_concrete
  this.inputData_ = {
    first: {
      check: ezP.T3.Expr.Check.await_or_primary,
      hole_value: 'name',
    },
    last: {
      label: '**',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.u_expr,
      hole_value: 'power',
    },
  }
}

goog.inherits(ezP.DelegateSvg.Expr.power_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('power_concrete')
