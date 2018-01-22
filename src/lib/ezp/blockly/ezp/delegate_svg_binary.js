/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for binary blocks of ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Xpr.Binary')

goog.require('ezP.DelegateSvg.Xpr')

/**
 * Class for a DelegateSvg, '... ? ...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Binary = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Binary.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Binary, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Xpr.Binary.prototype.operator = undefined
ezP.DelegateSvg.Xpr.Binary.prototype.operators = undefined
ezP.DelegateSvg.Xpr.Binary.prototype.checkTypesLHS = undefined
ezP.DelegateSvg.Xpr.Binary.prototype.checkTypesRHS = undefined
ezP.DelegateSvg.Xpr.Binary.prototype.outputType = undefined

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
    .setCheck(this.checkTypesLHS)
  this.fieldOperator = new ezP.FieldLabel(this.operator)
  this.inputRHS = block.appendValueInput(ezP.Const.Input.RHS)
    .setCheck(this.checkTypesRHS)
    .appendField(this.fieldOperator)
  block.setOutput(true, this.outputType)
}

/**
 * Class for a DelegateSvg, m_expr_concrete block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.m_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Xpr.m_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.operator = '*'
  this.operators = ['*', '@', '//', '/', '%']
  this.checkTypesLHS = ezP.T3.Require.m_expr
  this.checkTypesRHS = ezP.T3.Require.u_expr // except for the '@' operator
  this.outputType = ezP.T3.m_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Xpr.m_expr_concrete, ezP.DelegateSvg.Xpr.Binary)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.m_expr_concrete, ezP.DelegateSvg.Xpr.m_expr_concrete)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.m_expr_concrete.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.m_expr_concrete.superClass_.initBlock.call(this, block)
  var op = this.fieldOperator.getText()
  this.inputRHS.setCheck(op == '@'? this.checkTypesLHS: this.checkTypesRHS)
}

ezP.USE_BINARY_OPERATOR_ID  = 'USE_BINARY_OPERATOR'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Xpr.m_expr_concrete.prototype.populateContextMenu_ = function (block, menu) {
  // there is a problem concerning validation
  // Il we change the operator from '@' to something else,
  // the RHS operand might no longer be acceptable.
  // The RHS is expected to be a u_expr for algebraic operations
  // but an m_expr for the '@' operation, which is more permissive
  var yorn = true
  var target = this.inputRHS.connection.targetBlock()
  if (target) {
    yorn = false
    for (var i = 0; i < this.checkTypesRHS.length; i++) {
      if (target.outputConnection.check_.indexOf(this.checkTypesRHS[i]) != -1) {
        yorn = true
        break
      }
    }
  }
  var old = this.fieldOperator.getText()
  var F = function(op) {
    var menuItem = new ezP.MenuItem('... '+op+' ...',[ezP.USE_BINARY_OPERATOR_ID, op])
    menuItem.setEnabled(old != op && yorn)
    menu.addChild(menuItem, true)
  }
  F('*')
  F('@', true)
  F('//')
  F('//')
  F('%')
  menu.addChild(new ezP.Separator(), true)
  ezP.DelegateSvg.Xpr.m_expr_concrete.superClass_.populateContextMenu_.call(this,block, menu)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Xpr.m_expr_concrete.prototype.onActionMenuEvent = function (block, menu, event) {
  var model = event.target.getModel()
  var action = model[0]
  var op = model[1]
  if (action == ezP.USE_BINARY_OPERATOR_ID) {
    if (goog.array.indexOf(this.operators, op)<0) {
      return
    }
    this.fieldOperator.setValue(op)
    this.inputRHS.setCheck(op == '@'? this.checkTypesLHS: this.checkTypesRHS)
    return
  }
  ezP.DelegateSvg.Xpr.m_expr_concrete.superClass_.onActionMenuEvent.call(this, block, menu, event)
  return
}
/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Xpr.m_expr_concrete.prototype.toDom = function (block, element) {
  element.setAttribute('operator', this.fieldOperator.getText())
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Xpr.m_expr_concrete.prototype.fromDom = function (block, element) {
  this.prefix = element.getAttribute('operator')
  if (goog.array.indexOf(this.operators, this.prefix)<0) {
    this.prefix = this.operators[0]
  }
  if (this.fieldOperator) {
    this.fieldOperator.setValue(this.prefix)
  }
}
