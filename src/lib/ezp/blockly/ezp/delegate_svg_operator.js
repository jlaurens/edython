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

goog.provide('ezP.DelegateSvg.Expr.Operator')

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
ezP.DelegateSvg.Expr.Operator = function (prototypeName) {
  ezP.DelegateSvg.Expr.Operator.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Expr.Operator, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Expr.Operator.prototype.operator = undefined
ezP.DelegateSvg.Expr.Operator.prototype.operators = undefined
ezP.DelegateSvg.Expr.Operator.prototype.operatorData = undefined
ezP.DelegateSvg.Expr.Operator.prototype.operatorDidChange = undefined
ezP.DelegateSvg.Expr.Operator.prototype.canChangeOperator = undefined

/**
 * Change the operator of the block. Undo friendly.
 * Called by the receiver's initBlock method and elsewhere.
 * For ezPython.
 * @param {!Block} block.
 * @param {!String} op is the new operator.
 */
ezP.DelegateSvg.Expr.Operator.prototype.changeOperator = function(block, newValue) {
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
ezP.DelegateSvg.Expr.Operator.checkInput = function(input, required) {
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
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.Operator.prototype.populateContextMenu_ = function (block, menu) {
  var value = this.fieldOperator.getValue()
  var ezp = this
  var F = function(op) {
    var menuItem = new ezP.MenuItem(
      ezp.operatorData[op]['LABEL']
      ,[ezP.USE_OPERATOR_ID, op]
    )
    menuItem.setEnabled(value != op && ezp.canChangeOperator(block, op))
    menu.addChild(menuItem, true)
  }
  for (var i = 0; i<this.operators.length; i++) {
    F(this.operators[i])
  }
  menu.addChild(new ezP.Separator(), true)
  ezP.DelegateSvg.Expr.Operator.superClass_.populateContextMenu_.call(this,block, menu)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.Operator.prototype.handleActionMenuEvent = function (block, menu, event) {
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
  return false
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Expr.Operator.prototype.toDom = function (block, element) {
  element.setAttribute('operator', this.fieldOperator.getText())
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Expr.Operator.prototype.fromDom = function (block, element) {
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
goog.inherits(ezP.DelegateSvg.Expr.Unary, ezP.DelegateSvg.Expr.Operator)

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
  this.inputXPR = block.appendValueInput(ezP.Const.Input.EXPR)
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
  this.inputXPR.setCheck(data['XPR'])
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
  return ezP.DelegateSvg.Expr.Operator.checkInput(this.inputXPR, data['XPR']) 
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
    '+': {'LABEL':'+...', 'OUT': ezP.T3.u_expr_concrete, 'XPR': ezP.T3.Require.u_expr},
    '-': {'LABEL':'-...', 'OUT': ezP.T3.u_expr_concrete, 'XPR': ezP.T3.Require.u_expr},
    '~': {'LABEL':'~...', 'OUT': ezP.T3.u_expr_concrete, 'XPR': ezP.T3.Require.u_expr},
    'not': {'LABEL':'not ...', 'OUT': ezP.T3.not_test_concrete, 'XPR': ezP.T3.Require.not_test},
  }
}
goog.inherits(ezP.DelegateSvg.Expr.unary_concrete, ezP.DelegateSvg.Expr.Unary)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.unary_concrete, ezP.DelegateSvg.Expr.unary_concrete)


/**
 * Class for a DelegateSvg, ... op ... block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.Binary = function (prototypeName) {
  ezP.DelegateSvg.Expr.Binary.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Expr.Binary, ezP.DelegateSvg.Expr.Operator)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.Binary.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.Binary.superClass_.initBlock.call(this, block)
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
ezP.DelegateSvg.Expr.Binary.prototype.operatorDidChange = function(block) {
  var value = this.fieldOperator.getValue()
  var data = this.operatorData[value]
  block.setOutput(true, data['OUT'])  
  this.inputRHS.setCheck(data['RHS'])
  this.inputLHS.setCheck(data['LHS'])
}

/**
 * Whether the block can change operator.
 * For ezPython.
 * @param {!Block} block.
 * @param {!String} op is the new operator.
 */
ezP.DelegateSvg.Expr.Binary.prototype.canChangeOperator = function(block, op) {
  if (this.operators.indexOf(op)<0) {
    // this op is not known
    return false
  }
  var data = this.operatorData[op]
  return ezP.DelegateSvg.Expr.Operator.checkInput(this.inputLHS, data['LHS'])
  || ezP.DelegateSvg.Expr.Operator.checkInput(this.inputRHS, data['RHS'])
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
    '*': {'LABEL':'... * ...', 'OUT': ezP.T3.m_expr_concrete, 'RHS': ezP.T3.Require.u_expr, 'LHS': ezP.T3.Require.m_expr},
    '@': {'LABEL':'... @ ...', 'OUT': ezP.T3.m_expr_concrete, 'RHS': ezP.T3.Require.m_expr, 'LHS': ezP.T3.Require.m_expr},
    '//': {'LABEL':'... // ...', 'OUT': ezP.T3.m_expr_concrete, 'RHS': ezP.T3.Require.u_expr, 'LHS': ezP.T3.Require.m_expr},
    '/': {'LABEL':'... / ...', 'OUT': ezP.T3.m_expr_concrete, 'RHS': ezP.T3.Require.u_expr, 'LHS': ezP.T3.Require.m_expr},
    '%': {'LABEL':'... % ...', 'OUT': ezP.T3.m_expr_concrete, 'RHS': ezP.T3.Require.u_expr, 'LHS': ezP.T3.Require.m_expr},
    '+': {'LABEL':'... + ...', 'OUT': ezP.T3.a_expr_concrete, 'RHS': ezP.T3.Require.m_expr, 'LHS': ezP.T3.Require.a_expr},
    '-': {'LABEL':'... - ...', 'OUT': ezP.T3.a_expr_concrete, 'RHS': ezP.T3.Require.m_expr, 'LHS': ezP.T3.Require.a_expr},
  }
}
goog.inherits(ezP.DelegateSvg.Expr.algebra_concrete, ezP.DelegateSvg.Expr.Binary)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.algebra_concrete, ezP.DelegateSvg.Expr.algebra_concrete)

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
    '<<': {'LABEL':'... << ...', 'OUT': ezP.T3.shift_expr_concrete, 'RHS': ezP.T3.Require.a_expr, 'LHS': ezP.T3.Require.shift_expr},
    '>>': {'LABEL':'... >> ...', 'OUT': ezP.T3.shift_expr_concrete, 'RHS': ezP.T3.Require.a_expr, 'LHS': ezP.T3.Require.shift_expr},
    '&': {'LABEL':'... & ...', 'OUT': ezP.T3.and_expr_concrete, 'RHS': ezP.T3.Require.shift_expr, 'LHS': ezP.T3.Require.and_expr},
    '^': {'LABEL':'... ^ ...', 'OUT': ezP.T3.xor_expr_concrete, 'RHS': ezP.T3.Require.and_expr, 'LHS': ezP.T3.Require.xor_expr},
    '|': {'LABEL':'... | ...', 'OUT': ezP.T3.or_expr_concrete, 'RHS': ezP.T3.Require.xor_expr, 'LHS': ezP.T3.Require.or_expr},
  }
}
goog.inherits(ezP.DelegateSvg.Expr.bitwise_concrete, ezP.DelegateSvg.Expr.Binary)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.bitwise_concrete, ezP.DelegateSvg.Expr.bitwise_concrete)

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
    '<': {'LABEL':'... < ...', 'OUT': ezP.T3.comparison_concrete, 'RHS': ezP.T3.Require.comparison, 'LHS': ezP.T3.Require.comparison},
    '>': {'LABEL':'... > ...', 'OUT': ezP.T3.comparison_concrete, 'RHS': ezP.T3.Require.comparison, 'LHS': ezP.T3.Require.comparison},
    '==': {'LABEL':'... == ...', 'OUT': ezP.T3.comparison_concrete, 'RHS': ezP.T3.Require.comparison, 'LHS': ezP.T3.Require.comparison},
    '<=': {'LABEL':'... <= ...', 'OUT': ezP.T3.comparison_concrete, 'RHS': ezP.T3.Require.comparison, 'LHS': ezP.T3.Require.comparison},
    '>=': {'LABEL':'... >= ...', 'OUT': ezP.T3.comparison_concrete, 'RHS': ezP.T3.Require.comparison, 'LHS': ezP.T3.Require.comparison},
    '!=': {'LABEL':'... != ...', 'OUT': ezP.T3.comparison_concrete, 'RHS': ezP.T3.Require.comparison, 'LHS': ezP.T3.Require.comparison},
    'is': {'LABEL':'... is ...', 'OUT': ezP.T3.comparison_concrete, 'RHS': ezP.T3.Require.comparison, 'LHS': ezP.T3.Require.comparison},
    'is not': {'LABEL':'... is not ...', 'OUT': ezP.T3.comparison_concrete, 'RHS': ezP.T3.Require.comparison, 'LHS': ezP.T3.Require.comparison},
    'in': {'LABEL':'... in ...', 'OUT': ezP.T3.comparison_concrete, 'RHS': ezP.T3.Require.comparison, 'LHS': ezP.T3.Require.comparison},
    'not in': {'LABEL':'... not in ...', 'OUT': ezP.T3.comparison_concrete, 'RHS': ezP.T3.Require.comparison, 'LHS': ezP.T3.Require.comparison},
  }
}
goog.inherits(ezP.DelegateSvg.Expr.comparison_concrete, ezP.DelegateSvg.Expr.Binary)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.comparison_concrete, ezP.DelegateSvg.Expr.comparison_concrete)

/**
 * Class for a DelegateSvg, boolean_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.boolean_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.comparison_concrete.superClass_.constructor.call(this, prototypeName)
  this.operator = 'or'
  this.operators = ['or', 'and']
  this.operatorData = {
    'or': {'LABEL':'... or ...', 'OUT': ezP.T3.or_test_concrete, 'RHS': ezP.T3.Require.and_test, 'LHS': ezP.T3.Require.or_test},
    'and': {'LABEL':'... and ...', 'OUT': ezP.T3.and_test_concrete, 'RHS': ezP.T3.Require.not_test, 'LHS': ezP.T3.Require.and_test},
  }
}
goog.inherits(ezP.DelegateSvg.Expr.boolean_concrete, ezP.DelegateSvg.Expr.Binary)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.boolean_concrete, ezP.DelegateSvg.Expr.boolean_concrete)
