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
}
goog.inherits(ezP.DelegateSvg.Operator, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Operator.prototype.operator = undefined
ezP.DelegateSvg.Operator.prototype.operators = undefined
ezP.DelegateSvg.Operator.prototype.operatorData = undefined
ezP.DelegateSvg.Operator.prototype.operatorDidChange = undefined
ezP.DelegateSvg.Operator.prototype.canChangeOperator = undefined

/**
 * Change the operator of the block. Undo friendly.
 * Called by the receiver's initBlock method and elsewhere.
 * For ezPython.
 * @param {!Block} block.
 * @param {!String} op is the new operator.
 */
ezP.DelegateSvg.Operator.prototype.changeOperator = function(block, newValue) {
  if (this.operators.indexOf(newValue)<0) {
    // do nothing, this op is not known
    return
  }
  var oldValue = this.fieldOperator.getValue()
  if (oldValue == newValue) {
    // nothing to change
    return
  }
  Blockly.Events.setGroup(true)
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
      block, ezP.Const.Event.change_operator, '', oldValue, newValue));
  }
  this.fieldOperator.setValue(newValue)
  this.operatorDidChange(block)
  Blockly.Events.setGroup(false)
}

/**
 * Whether the block can change operator.
 * For ezPython.
 * @param {!Input} input.
 * @param {!Array} required, an array of required types.
 */
ezP.DelegateSvg.Operator.checkInput = function(input, required) {
  var target = input.connection.targetBlock()
  if (target) {
    var check = target.outputConnection.check_
    for (var i = 0; i < required.length; i++) {
      if (check.indexOf(required[i]) >= 0) {
      return true
      }
    }
    return false
  }
  return true
}

ezP.USE_OPERATOR_ID  = 'USE_OPERATOR'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.ContextMenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Operator.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.menu
  var value = this.fieldOperator.getValue()
  var ezp = this
  var F = function(op) {
    var menuItem = new ezP.MenuItem(
      ezp.operatorData[op]['label']
      ,[ezP.USE_OPERATOR_ID, op]
    )
    menuItem.setEnabled(value != op && ezp.canChangeOperator(block, op))
    menu.addChild(menuItem, true)
  }
  for (var i = 0; i<this.operators.length; i++) {
    F(this.operators[i])
  }
  ezP.DelegateSvg.Operator.superClass_.populateContextMenuFirst_.call(this,block, menu)
  return true
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Operator.prototype.handleMenuItemActionFirst = function (block, menu, event) {
  var model = event.target.getModel()
  var action = model[0]
  var op = model[1]
  if (action == ezP.USE_OPERATOR_ID) {
    if (this.operators.indexOf(op)<0) {
      return true
    }
    if (this.canChangeOperator(block, op)) {
      this.changeOperator(block, op)
    }
    return true
  }
  return ezP.DelegateSvg.Operator.superClass_.handleMenuItemActionFirst.call(this, block, menu, event)
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Operator.prototype.toDom = function (block, element) {
  element.setAttribute('operator', this.fieldOperator.getText())
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Operator.prototype.fromDom = function (block, element) {
  var operator = element.getAttribute('operator')
  if (this.operators.indexOf(operator)<0) {
    operator = this.operator
  }
  this.operator = operator
  if (this.fieldOperator) {
    this.fieldOperator.setValue(this.operator)
  }
}

/**
 * Class for a DelegateSvg, unary op ... block.
 * Multiple ops.
 * Abstract class.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.Unary = function (prototypeName) {
  ezP.DelegateSvg.Expr.Unary.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Expr.Unary, ezP.DelegateSvg.Operator)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.Unary.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.Unary.superClass_.initBlock.call(this, block)
  this.fieldOperator = new ezP.FieldLabel('')
  this.inputExpr = block.appendValueInput(ezP.Const.Input.EXPR)
    .appendField(this.fieldOperator)
  this.changeOperator(block, this.operator)
}

/**
 * Update the block according to the new operator.
 * For ezPython.
 * @param {!Block} block.
 * @param {!String} op is the new operator.
 */
ezP.DelegateSvg.Expr.Unary.prototype.operatorDidChange = function(block) {
  var value = this.fieldOperator.getValue()
  var data = this.operatorData[value]
  this.inputExpr.setCheck(data['EXPR'])
  block.setOutput(true, data['OUT'])  
}

/**
 * Whether the block can change operator.
 * For ezPython.
 * @param {!Block} block.
 * @param {!String} op is the new operator.
 */
ezP.DelegateSvg.Expr.Unary.prototype.canChangeOperator = function(block, op) {
  if (this.operators.indexOf(op)<0) {
    // this op is not known
    return false
  }
  var data = this.operatorData[op]
  return ezP.DelegateSvg.Operator.checkInput(this.inputExpr, data['EXPR']) 
}

/**
* Class for a DelegateSvg, unary_concrete.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.unary_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.unary_concrete.superClass_.constructor.call(this, prototypeName)
  this.operator = '-'
  this.operators = ['+', '-', '~', 'not']
  this.operatorData = {
    '+': {
      label:'+...',
      output: ezP.T3.Expr.u_expr_concrete,
      EXPR: ezP.T3.Expr.Check.u_expr
    },
    '-': {
      label:'-...',
      output: ezP.T3.Expr.u_expr_concrete,
      EXPR: ezP.T3.Expr.Check.u_expr
    },
    '~': {
      label:'~...',
      output: ezP.T3.Expr.u_expr_concrete,
      EXPR: ezP.T3.Expr.Check.u_expr
    },
    'not': {
      label:'not ...',
      output: ezP.T3.Expr.not_test_concrete,
      EXPR: ezP.T3.Expr.Check.not_test
    },
  }
}
goog.inherits(ezP.DelegateSvg.Expr.unary_concrete, ezP.DelegateSvg.Expr.Unary)

ezP.DelegateSvg.Manager.register('unary_concrete')


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
}
goog.inherits(ezP.DelegateSvg.Binary, ezP.DelegateSvg.Operator)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Binary.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Binary.superClass_.initBlock.call(this, block)
  this.inputLHS = block.appendValueInput(ezP.Const.Input.LHS)
  this.fieldOperator = new ezP.FieldLabel('')
  this.inputRHS = block.appendValueInput(ezP.Const.Input.RHS)
    .appendField(this.fieldOperator)
  this.changeOperator(block, this.operator)
}

/**
 * Update the block according to the new operator.
 * For ezPython.
 * @param {!Block} block.
 * @param {!String} op is the new operator.
 */
ezP.DelegateSvg.Binary.prototype.operatorDidChange = function(block) {
  var value = this.fieldOperator.getValue()
  var data = this.operatorData[value]
  block.setOutput(true, data.output)  
  this.inputRHS.setCheck(data.rhs)
  this.inputLHS.setCheck(data.lhs)
}

/**
 * Whether the block can change operator.
 * For ezPython.
 * @param {!Block} block.
 * @param {!String} op is the new operator.
 */
ezP.DelegateSvg.Binary.prototype.canChangeOperator = function(block, op) {
  if (this.operators.indexOf(op)<0) {
    // this op is not known
    return false
  }
  var data = this.operatorData[op]
  return ezP.DelegateSvg.Operator.checkInput(this.inputLHS, data['LHS'])
  || ezP.DelegateSvg.Operator.checkInput(this.inputRHS, data['RHS'])
}

/**
 * Class for a DelegateSvg, algebra binary operation block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.algebra_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.algebra_concrete.superClass_.constructor.call(this, prototypeName)
  this.operator = '+'
  this.operators = ['+', '-', '*', '//', '/', '%', '@']
  this.operatorData = {
    '*': {
      label:'... * ...',
      output: ezP.T3.Expr.m_expr_concrete,
      rhs: ezP.T3.Expr.Check.u_expr,
      lhs: ezP.T3.Expr.Check.m_expr
    },
    '@': {
      label:'... @ ...',
      output: ezP.T3.Expr.m_expr_concrete,
      rhs: ezP.T3.Expr.Check.m_expr,
      lhs: ezP.T3.Expr.Check.m_expr
    },
    '//': {
      label:'... // ...',
      output: ezP.T3.Expr.m_expr_concrete,
      rhs: ezP.T3.Expr.Check.u_expr,
      lhs: ezP.T3.Expr.Check.m_expr
    },
    '/': {
      label:'... / ...',
      output: ezP.T3.Expr.m_expr_concrete,
      rhs: ezP.T3.Expr.Check.u_expr,
      lhs: ezP.T3.Expr.Check.m_expr
    },
    '%': {
      label:'... % ...',
      output: ezP.T3.Expr.m_expr_concrete,
      rhs: ezP.T3.Expr.Check.u_expr,
      lhs: ezP.T3.Expr.Check.m_expr
    },
    '+': {
      label:'... + ...',
      output: ezP.T3.Expr.a_expr_concrete,
      rhs: ezP.T3.Expr.Check.m_expr,
      lhs: ezP.T3.Expr.Check.a_expr
    },
    '-': {
      label:'... - ...',
      output: ezP.T3.Expr.a_expr_concrete,
      rhs: ezP.T3.Expr.Check.m_expr,
      lhs: ezP.T3.Expr.Check.a_expr
    },
  }
}
goog.inherits(ezP.DelegateSvg.Expr.algebra_concrete, ezP.DelegateSvg.Binary)

ezP.DelegateSvg.Manager.register('algebra_concrete')

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
