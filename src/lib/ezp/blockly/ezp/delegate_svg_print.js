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

goog.provide('ezP.DelegateSvg.Print')

goog.require('ezP.DelegateSvg.Stmt')
goog.require('ezP.DelegateSvg.List')

/**
 * Class for a DelegateSvg, print block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.print = function (prototypeName) {
  ezP.DelegateSvg.Expr.print.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
    first: {
      label: 'print',
      css_class: 'ezp-code-reserved',
    },
    last: {
      start: '(',
      key: ezP.Key.LIST,
      wrap: ezP.T3.Expr.argument_list_comprehensive,
      end: ')',
    }
  }
  this.outputModel_.check = [ezP.T3.Expr.print, ezP.T3.Expr.call_expr]
}
goog.inherits(ezP.DelegateSvg.Expr.print, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('print')


ezP.ID.PRINT_KEYWORD_ITEM_INSERT = 'PRINT_KEYWORD_ITEM_INSERT'
ezP.ID.PRINT_KEYWORD_ITEM_REMOVE = 'PRINT_KEYWORD_ITEM_REMOVE'

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
ezP.DelegateSvg.Expr.print.prototype.getMenuTarget = function(block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
ezP.DelegateSvg.Expr.print.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.Menu
  var list = block.getInput(ezP.Key.LIST).connection.targetBlock()
  var c10r = list.ezp.consolidator
  var yorn = false
  if (!c10r.hasInputForType(list, ezP.T3.Expr.comprehension)) {
    var io = c10r.getIO(list)
    var has = {}
    var input
    while ((input = c10r.nextInputForType(io, ezP.T3.Expr.keyword_item))) {
      var target = input.connection.targetBlock()
      if (target && (target = target.getInput(ezP.Key.KEY).connection.targetBlock())) {
        has[target.ezp.getValue(target)] = target
      }
    }
    var F = function(candidate) {
      var menuItem = new ezP.MenuItem(
        ezP.Do.createSPAN(candidate+' = …', 'ezp-code-disabled'),
        {
          action: has[candidate]? ezP.ID.PRINT_KEYWORD_ITEM_REMOVE: ezP.ID.PRINT_KEYWORD_ITEM_INSERT,
          key: candidate,
          target: has[candidate],
        }
      )
      if (has[candidate]) {
        mgr.addRemoveChild(menuItem)
      } else {
        mgr.addInsertChild(menuItem)
      }
    }
    F('sep')
    F('end')
    F('file')
    yorn = true
  }
  return ezP.DelegateSvg.Expr.print.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.print.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  var model = event.target.getModel()
  var action = model.action
  var value = model.key
  if (model.action === ezP.ID.PRINT_KEYWORD_ITEM_INSERT) {
    Blockly.Events.setGroup(true)
    var BB = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.identifier)
    BB.ezp.setValue(BB, model.key)
    var B = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.keyword_item)
    B.getInput(ezP.Key.KEY).connection.connect(BB.outputConnection)
    var list = block.getInput(ezP.Key.LIST).connection.targetBlock()
    var c8n = list.inputList[list.inputList.length-1].connection
    c8n.connect(B.outputConnection)  
    Blockly.Events.setGroup(false)
    return true
  } else if (model.action === ezP.ID.PRINT_KEYWORD_ITEM_REMOVE) {
    Blockly.Events.setGroup(true)
    var B = model.target.getParent()
    B.unplug()
    B.dispose()
    Blockly.Events.setGroup(false)
    return true
  } else 
  return ezP.DelegateSvg.Expr.print.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
}

/**
 * Class for a DelegateSvg, print_stmt block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.print_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.print_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.EXPRESSION,
    wrap: ezP.T3.Expr.print,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.print_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('print_stmt')

