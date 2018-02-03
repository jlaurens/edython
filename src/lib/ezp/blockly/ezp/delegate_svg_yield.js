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

goog.provide('ezP.DelegateSvg.Yield')

goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Stmt')

/////////////////     yield_expression_list      ///////////////////

/**
 * Class for a DelegateSvg, 'yield ...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_expression_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_expression_list.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    first: {
      label: 'yield',
      check: ezP.T3.Expr.expression_list,
      wrap: ezP.Const.Expr.expression_list
    }
  }
  this.outputCheck = ezP.T3.Expr.yield_expression_list
}
goog.inherits(ezP.DelegateSvg.Expr.yield_expression_list, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.yield_expression_list, ezP.DelegateSvg.Expr.yield_expression_list)

/**
 * Class for a DelegateSvg, 'yield from ...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_from_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_from_expression.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    first: {
      label: 'yield from',
      check: ezP.T3.Expr.Check.expression
    }
  }
  this.outputCheck = ezP.T3.Expr.yield_from_expression
}
goog.inherits(ezP.DelegateSvg.Expr.yield_from_expression, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.yield_from_expression, ezP.DelegateSvg.Expr.yield_from_expression)

/**
 * Class for a DelegateSvg, '(yield ..., ..., ...)'.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_atom = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_atom.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    first: {
      check: ezP.T3.Expr.yield_expression,
      label: '(',
      wrap: ezP.Const.Expr.yield_expression
    }
  }
  this.labelEnd = ')'
  this.outputCheck = ezP.T3.Expr.yield_atom
}
goog.inherits(ezP.DelegateSvg.Expr.yield_atom, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.yield_atom, ezP.DelegateSvg.Expr.yield_atom)

/**
 * Class for a DelegateSvg, yield_expression.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_expression.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    last: {
      check: ezP.T3.Expr.Check.yield_expression,
      wrap: ezP.Const.Expr.yield_expression_list
    }
  }
  this.outputCheck = ezP.T3.Expr.yield_expression
  this.contextMenuData = [
    {label: 'yield ...', type: ezP.Const.Expr.yield_expression_list},
    {label: 'yield from ...', type: ezP.Const.Expr.yield_from_expression},
  ]

}
goog.inherits(ezP.DelegateSvg.Expr.yield_expression, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.yield_expression, ezP.DelegateSvg.Expr.yield_expression)

ezP.USE_YIELD_WRAP_TYPE_ID = 'USE_YIELD_WRAP_TYPE'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.populateContextMenuMiddle_ = function (block, menu) {
  var target = this.getWrappedTargetBlock(block)
  var type = target? target.type: undefined
  var ezp = this
  var renderer = ezP.MenuItemCodeRenderer.getInstance()
  var F = function(data) {
    var menuItem = new ezP.MenuItem(
      data.label
      ,[ezP.USE_YIELD_WRAP_TYPE_ID, data.type],
      null,
      renderer
    )
    menuItem.setEnabled(data.type != type)
    menu.addChild(menuItem, true)
  }
  for (var i = 0; i<this.contextMenuData.length; i++) {
    F(this.contextMenuData[i])
  }
  ezP.DelegateSvg.Expr.yield_expression.superClass_.populateContextMenuMiddle_.call(this,block, menu)
  return true
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Undo compliant.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!String} newType
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.changeYieldWrapType = function (block, newValue) {
  var last = this.inputs.last.input
  var target = last.connection.targetBlock()
  var oldValue = target? target.type: undefined
  if (newValue != oldValue) {
    Blockly.Events.setGroup(true)
    // if (Blockly.Events.isEnabled()) {
    //   Blockly.Events.fire(new Blockly.Events.BlockChange(
    //     block, ezP.Const.Event.change_import_model, '', oldValue, newValue));
    // }
    if (target) {
//      target.unplug()
      target.dispose()
    }
    this.completeWrappedInput_(block, last, newValue)
    Blockly.Events.setGroup(false)
  }
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.handleActionMenuEventMiddle = function (block, menu, event) {
  var model = event.target.getModel()
  var action = model[0]
  var new_wrap_type = model[1]
  if (action === ezP.USE_YIELD_WRAP_TYPE_ID) {
    setTimeout(function() {
      block.ezp.changeYieldWrapType(block, new_wrap_type)
      block.render()
    }, 100)
    return true
  }
  return ezP.DelegateSvg.Expr.yield_expression.superClass_.handleActionMenuEventMiddle.call(this, block, menu, event)
}

/**
 * Class for a DelegateSvg, yield_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.yield_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.yield_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    last: {
      check: ezP.T3.Expr.yield_expression,
      wrap: ezP.Const.Expr.yield_expression
    }
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.yield_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register(ezP.Const.Stmt.yield_stmt, ezP.DelegateSvg.Stmt.yield_stmt)

