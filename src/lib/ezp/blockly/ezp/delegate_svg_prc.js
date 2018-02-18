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

goog.provide('ezP.DelegateSvg.Proc')

goog.require('ezP.DelegateSvg.Group')
goog.require('ezP.MenuItemCode')


/**
 * Class for a DelegateSvg, parenth_argument_list.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
//  decorator_part            /*   ::= "@" dotted_name ["(" [argument_list [","]] ")"]    */ : "ezp_decorator_part",

ezP.DelegateSvg.Expr.parenth_argument_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.parenth_argument_list.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first = {
    label: '(',
    wrap: ezP.T3.Expr.argument_list,
  }
  this.inputData_.last = {
    label: ')',
  }
  this.outputData_.check = ezP.T3.Expr.parenth_argument_list
}
goog.inherits(ezP.DelegateSvg.Expr.parenth_argument_list, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('parenth_argument_list')

/**
 * Class for a DelegateSvg, decorator_part.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
//  decorator_part            /*   ::= "@" dotted_name ["(" [argument_list [","]] ")"]    */ : "ezp_decorator_part",

ezP.DelegateSvg.Stmt.decorator_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.decorator_part.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first = {
    label: '@',
    key: ezP.Const.Input.NAME,
    wrap: ezP.T3.Expr.dotted_name,
  }
  this.inputData_.last = {
    key: ezP.Const.Input.LIST,
    wrap: ezP.T3.Expr.parenth_argument_list,
    optional: true,
  }
  this.statementData_.previous.check = ezP.T3.Stmt.Previous.decorator_part
  this.statementData_.next.check = ezP.T3.Stmt.Next.decorator_part
}
goog.inherits(ezP.DelegateSvg.Stmt.decorator_part, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('decorator_part')

ezP.ID.USE_DECORATOR = 'USE_DECORATOR'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
ezP.DelegateSvg.Stmt.decorator_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.Menu
  var dotted_name = this.inputs.first.input.connection.targetBlock()
  goog.asserts.assert(dotted_name, 'The first wrapper input has not been resolved')
  var old = undefined

  if (dotted_name.ezp.getItemCount(dotted_name) === 1) {
    var input = dotted_name.ezp.getItemAtIndex(dotted_name, 0)
    var target = input.connection.targetBlock()
    if (target && target.ezp.getIdentifier) {
      old = target.ezp.getIdentifier(target)
    }
  }
  var F = function(candidate) {
    var menuItem = new ezP.SimpleMenuItemCode('@'+candidate, ezP.ID.USE_DECORATOR, candidate)
    menuItem.setCheckable(true)
    menuItem.setEnabled(old != candidate)
    menu.addChild(menuItem, true)
  }
  F('staticmethod')
  F('classmethod')
  ezP.DelegateSvg.Stmt.decorator_part.superClass_.populateContextMenuFirst_.call(this, block, mgr)
  return true
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Stmt.decorator_part.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  var model = event.target.getModel()
  var action = model[0]
  var value = model[1]
  if (action == ezP.ID.USE_DECORATOR) {
    var dotted_name = this.inputs.first.input.connection.targetBlock()
    dotted_name.ezp.removeItems(dotted_name)
    var input = dotted_name.ezp.getItemAtIndex(dotted_name, 0)
    var target = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.identifier)
    goog.asserts.assert(input.connection.isConnectionAllowed(target.outputConnection), 'Problem')
    input.connection.connect(target.outputConnection)
    goog.asserts.assert(input.connection.isConnected(), 'Problem')
    dotted_name.ezp.consolidate(dotted_name)
    if (target.ezp.setIdentifier) {
      target.ezp.setIdentifier(target, value)
    } else {
      console.log('Identifier block is read only')
    }
    block.render()
    return true
  }
  return ezP.DelegateSvg.Stmt.decorator_part.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
}


/**
 * Class for a DelegateSvg, proc block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Proc = function (prototypeName) {
  ezP.DelegateSvg.Proc.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Proc, ezP.DelegateSvg.Group)
//ezP.DelegateSvg.Manager.register('DEFAULT')
//ezP.DelegateSvg.Manager.register('DEF')
//ezP.DelegateSvg.Manager.register('CLASS')
