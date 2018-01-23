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

goog.provide('ezP.DelegateSvg.Xpr.Operator')

goog.require('ezP.DelegateSvg.Xpr')

/**
 * Class for a DelegateSvg, [...] op ... block.
 * Multiple ops.
 * Abstract class.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Operator = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Operator.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Operator, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Xpr.Operator.prototype.operator = undefined
ezP.DelegateSvg.Xpr.Operator.prototype.operators = undefined
ezP.DelegateSvg.Xpr.Operator.prototype.operatorData = undefined
ezP.DelegateSvg.Xpr.Operator.prototype.operatorDidChange = undefined
ezP.DelegateSvg.Xpr.Operator.prototype.canChangeOperator = undefined

/**
 * Change the operator of the block. Undo friendly.
 * Called by the receiver's initBlock method and elsewhere.
 * For ezPython.
 * @param {!Block} block.
 * @param {!String} op is the new operator.
 */
ezP.DelegateSvg.Xpr.Operator.prototype.changeOperator = function(block, newValue) {
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
ezP.DelegateSvg.Xpr.Operator.checkInput = function(input, required) {
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
ezP.DelegateSvg.Xpr.Operator.prototype.populateContextMenu_ = function (block, menu) {
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
  ezP.DelegateSvg.Xpr.Operator.superClass_.populateContextMenu_.call(this,block, menu)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Xpr.Operator.prototype.handleActionMenuEvent = function (block, menu, event) {
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
ezP.DelegateSvg.Xpr.Operator.prototype.toDom = function (block, element) {
  element.setAttribute('operator', this.fieldOperator.getText())
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Xpr.Operator.prototype.fromDom = function (block, element) {
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
ezP.DelegateSvg.Xpr.Unary = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Unary.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Unary, ezP.DelegateSvg.Xpr.Operator)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Unary.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.Unary.superClass_.initBlock.call(this, block)
  this.fieldOperator = new ezP.FieldLabel('')
  this.inputXPR = block.appendValueInput(ezP.Const.Input.XPR)
    .appendField(this.fieldOperator)
  this.changeOperator(block, this.operator)
}

/**
 * Update the block according to the new operator.
 * For ezPython.
 * @param {!Block} block.
 * @param {!String} op is the new operator.
 */
ezP.DelegateSvg.Xpr.Unary.prototype.operatorDidChange = function(block) {
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
ezP.DelegateSvg.Xpr.Unary.prototype.canChangeOperator = function(block, op) {
  if (this.operators.indexOf(op)<0) {
    // this op is not known
    return false
  }
  var data = this.operatorData[op]
  return ezP.DelegateSvg.Xpr.Operator.checkInput(this.inputXPR, data['XPR']) 
}




/**
* Class for a DelegateSvg, unary_concrete.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Xpr.unary_concrete = function (prototypeName) {
  ezP.DelegateSvg.Xpr.unary_concrete.superClass_.constructor.call(this, prototypeName)
  this.operator = '-'
  this.operators = ['+', '-', '~', 'not']
  this.operatorData = {
    '+': {'LABEL':'+...', 'OUT': ezP.T3.u_expr_concrete, 'XPR': ezP.T3.Require.u_expr},
    '-': {'LABEL':'-...', 'OUT': ezP.T3.u_expr_concrete, 'XPR': ezP.T3.Require.u_expr},
    '~': {'LABEL':'~...', 'OUT': ezP.T3.u_expr_concrete, 'XPR': ezP.T3.Require.u_expr},
    'not': {'LABEL':'not ...', 'OUT': ezP.T3.not_test_concrete, 'XPR': ezP.T3.Require.not_test},
  }
}
goog.inherits(ezP.DelegateSvg.Xpr.unary_concrete, ezP.DelegateSvg.Xpr.Unary)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.unary_concrete, ezP.DelegateSvg.Xpr.unary_concrete)


/**
 * Class for a DelegateSvg, ... op ... block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Binary = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Binary.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Binary, ezP.DelegateSvg.Xpr.Operator)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Binary.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.Binary.superClass_.initBlock.call(this, block)
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
ezP.DelegateSvg.Xpr.Binary.prototype.operatorDidChange = function(block) {
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
ezP.DelegateSvg.Xpr.Binary.prototype.canChangeOperator = function(block, op) {
  if (this.operators.indexOf(op)<0) {
    // this op is not known
    return false
  }
  var data = this.operatorData[op]
  return ezP.DelegateSvg.Xpr.Operator.checkInput(this.inputLHS, data['LHS'])
  || ezP.DelegateSvg.Xpr.Operator.checkInput(this.inputRHS, data['RHS'])
}

/**
 * Class for a DelegateSvg, algebra binary operation block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.algebra_concrete = function (prototypeName) {
  ezP.DelegateSvg.Xpr.algebra_concrete.superClass_.constructor.call(this, prototypeName)
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
goog.inherits(ezP.DelegateSvg.Xpr.algebra_concrete, ezP.DelegateSvg.Xpr.Binary)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.algebra_concrete, ezP.DelegateSvg.Xpr.algebra_concrete)

/**
 * Class for a DelegateSvg, bitwise binary operation block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.bitwise_concrete = function (prototypeName) {
  ezP.DelegateSvg.Xpr.bitwise_concrete.superClass_.constructor.call(this, prototypeName)
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
goog.inherits(ezP.DelegateSvg.Xpr.bitwise_concrete, ezP.DelegateSvg.Xpr.Binary)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.bitwise_concrete, ezP.DelegateSvg.Xpr.bitwise_concrete)

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
ezP.DelegateSvg.Xpr.comparison_concrete = function (prototypeName) {
  ezP.DelegateSvg.Xpr.comparison_concrete.superClass_.constructor.call(this, prototypeName)
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
goog.inherits(ezP.DelegateSvg.Xpr.comparison_concrete, ezP.DelegateSvg.Xpr.Binary)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.comparison_concrete, ezP.DelegateSvg.Xpr.comparison_concrete)

/**
 * Class for a DelegateSvg, boolean_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.boolean_concrete = function (prototypeName) {
  ezP.DelegateSvg.Xpr.comparison_concrete.superClass_.constructor.call(this, prototypeName)
  this.operator = 'or'
  this.operators = ['or', 'and']
  this.operatorData = {
    'or': {'LABEL':'... or ...', 'OUT': ezP.T3.boolean_concrete, 'RHS': ezP.T3.Require.and_test, 'LHS': ezP.T3.Require.or_test},
    'and': {'LABEL':'... and ...', 'OUT': ezP.T3.boolean_concrete, 'RHS': ezP.T3.Require.not_test, 'LHS': ezP.T3.Require.and_test},
  }
}
goog.inherits(ezP.DelegateSvg.Xpr.boolean_concrete, ezP.DelegateSvg.Xpr.Binary)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.boolean_concrete, ezP.DelegateSvg.Xpr.boolean_concrete)
