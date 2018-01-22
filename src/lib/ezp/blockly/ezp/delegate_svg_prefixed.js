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

goog.provide('ezP.DelegateSvg.Xpr.Prefixed')

goog.require('ezP.DelegateSvg.Xpr')

/**
 * Class for a DelegateSvg, '**...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Prefixed = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Prefixed.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Prefixed, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Xpr.Prefixed.prototype.prefix = undefined
ezP.DelegateSvg.Xpr.Prefixed.prototype.checkTypes = undefined
ezP.DelegateSvg.Xpr.Prefixed.prototype.outputType = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Prefixed.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.Prefixed.superClass_.initBlock.call(this, block)
  this.fieldPrefix = new ezP.FieldLabel(this.prefix)
  block.appendValueInput(ezP.Const.Input.XPR)
    .setCheck(this.checkTypes)
    .appendField(this.fieldPrefix)
  block.setOutput(true, this.outputType)
}

/**
 * Class for a DelegateSvg, '*...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.starred_or_expr = function (prototypeName) {
  ezP.DelegateSvg.Xpr.starred_or_expr.superClass_.constructor.call(this, prototypeName)
  this.prefix = '*'
  this.checkTypes = ezP.T3.Require.expression
  this.outputType = ezP.T3.starred_or_expr
}
goog.inherits(ezP.DelegateSvg.Xpr.starred_or_expr, ezP.DelegateSvg.Xpr.Prefixed)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.starred_or_expr, ezP.DelegateSvg.Xpr.starred_or_expr)

/**
 * Class for a DelegateSvg, '**...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.double_starred_or_expr = function (prototypeName) {
  ezP.DelegateSvg.Xpr.double_starred_or_expr.superClass_.constructor.call(this, prototypeName)
  this.prefix = '**'
  this.checkTypes = ezP.T3.Require.expression
  this.outputType = ezP.T3.double_starred_or_expr
}
goog.inherits(ezP.DelegateSvg.Xpr.double_starred_or_expr, ezP.DelegateSvg.Xpr.Prefixed)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.double_starred_or_expr, ezP.DelegateSvg.Xpr.double_starred_or_expr)

/**
 * Class for a DelegateSvg, yield_from.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.yield_from = function (prototypeName) {
  ezP.DelegateSvg.Xpr.yield_from.superClass_.constructor.call(this, prototypeName)
  this.prefix = 'from'
  this.checkTypes = ezP.T3.Require.expression
  this.outputType = ezP.T3.yield_from
}
goog.inherits(ezP.DelegateSvg.Xpr.yield_from, ezP.DelegateSvg.Xpr.Prefixed)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.yield_from, ezP.DelegateSvg.Xpr.yield_from)

/**
* Class for a DelegateSvg, dot_identifier.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Xpr.dot_identifier = function (prototypeName) {
  ezP.DelegateSvg.Xpr.dot_identifier.superClass_.constructor.call(this, prototypeName)
  this.prefix = '.'
  this.checkTypes = ezP.T3.identifier
  this.outputType = ezP.T3.dot_identifier
}
goog.inherits(ezP.DelegateSvg.Xpr.dot_identifier, ezP.DelegateSvg.Xpr.Prefixed)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.dot_identifier, ezP.DelegateSvg.Xpr.dot_identifier)

/**
* Class for a DelegateSvg, await_expr.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Xpr.await_expr = function (prototypeName) {
  ezP.DelegateSvg.Xpr.await_expr.superClass_.constructor.call(this, prototypeName)
  this.prefix = 'await'
  this.checkTypes = ezP.T3.Require.primary
  this.outputType = ezP.T3.await_expr
}
goog.inherits(ezP.DelegateSvg.Xpr.await_expr, ezP.DelegateSvg.Xpr.Prefixed)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.await_expr, ezP.DelegateSvg.Xpr.await_expr)

/**
* Class for a DelegateSvg, await_expr.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Xpr.u_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Xpr.u_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.prefix = '-'
  this.operators = ['+', '-', '~']
  this.checkTypes = ezP.T3.Require.power
  this.outputType = ezP.T3.u_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Xpr.u_expr_concrete, ezP.DelegateSvg.Xpr.Prefixed)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.u_expr_concrete, ezP.DelegateSvg.Xpr.u_expr_concrete)

ezP.USE_UNARY_OPERATOR_ID  = 'USE_UNARY_OPERATOR'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Xpr.u_expr_concrete.prototype.populateContextMenu_ = function (block, menu) {
  var old = this.fieldPrefix.getText()
  var F = function(op) {
    var menuItem = new ezP.MenuItem(op+'...',[ezP.USE_UNARY_OPERATOR_ID, op])
    menuItem.setEnabled(old != op)
    menu.addChild(menuItem, true)
  }
  F('+')
  F('-')
  F('~')
  menu.addChild(new ezP.Separator(), true)
  ezP.DelegateSvg.Xpr.u_expr_concrete.superClass_.populateContextMenu_.call(this,block, menu)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Xpr.u_expr_concrete.prototype.onActionMenuEvent = function (block, menu, event) {
  var model = event.target.getModel()
  var action = model[0]
  var op = model[1]
  if (action == ezP.USE_UNARY_OPERATOR_ID) {
    if (goog.array.indexOf(this.operators, op)<0) {
      return
    }
    this.fieldPrefix.setValue(op)
    return
  }
  ezP.DelegateSvg.Xpr.u_expr_concrete.superClass_.onActionMenuEvent.call(this, block, menu, event)
  return
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Xpr.u_expr_concrete.prototype.toDom = function (block, element) {
  element.setAttribute('operator', this.fieldPrefix.getText())
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Xpr.u_expr_concrete.prototype.fromDom = function (block, element) {
  this.prefix = element.getAttribute('operator')
  if (goog.array.indexOf(this.operators, this.prefix)<0) {
    this.prefix = this.operators[1]
  }
  if (this.fieldPrefix) {
    this.fieldPrefix.setValue(this.prefix)
  }
}
