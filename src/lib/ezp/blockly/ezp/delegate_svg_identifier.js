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

goog.provide('ezP.DelegateSvg.Identifier')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, identifier block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.identifier = function (prototypeName) {
  ezP.DelegateSvg.Expr.identifier.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.identifier
  this.inputModel_.first = {
    awaitable: true,
    key: ezP.Key.NAME,
    identifier: 'item',
  }
}
goog.inherits(ezP.DelegateSvg.Expr.identifier, ezP.DelegateSvg.Expr)
ezP.Delegate.Manager.register('identifier')

/**
 * Some block should not be wrapped.
 * Default implementation returns false
 * @param {!Block} block.
 * @return whether the block should be wrapped
 */
ezP.DelegateSvg.Expr.identifier.prototype.noBlockWrapped = function (block) {
  return true
}


ezP.ID.CHANGE_VARIABLE = 'CHANGE_VARIABLE'
ezP.ID.RENAME_VARIABLE = 'RENAME_VARIABLE'
ezP.ID.REPLACE_VARIABLE = 'REPLACE_VARIABLE'
ezP.ID.NEW_VARIABLE = 'NEW_VARIABLE'
ezP.ID.DELETE_UNUSED_VARIABLES = 'DELETE_UNUSED_VARIABLES'

if (Blockly.Msg.NEW_VARIABLE.startsWith('Créer')) {
  Blockly.Msg.NEW_VARIABLE = ezP.Msg.NEW_VARIABLE
}

/**
 * Get the value.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.identifier.prototype.getValue = function (block) {
  var field = block.ezp.inputs.first.fieldIdentifier
  return field.getValue()
}

/**
 * Set the value.
 * @param {!Blockly.Block} block The block.
 * @param {!string} value the new value.
 * @private
 */
ezP.DelegateSvg.Expr.identifier.prototype.setValue = function (block, value) {
  var field = block.ezp.inputs.first.fieldIdentifier
  if (field && field.getValue() !== value) {
    field.setValue(value)
  }
}

/**
 * Show the editor for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.DelegateSvg.Expr.identifier.prototype.showEditor = function (block) {
  block.ezp.inputs.first.fieldIdentifier.showEditor_()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.identifier.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.menu
  var menuItem = new ezP.MenuItem(ezP.Msg.RENAME, function() {
      block.ezp.inputs.first.fieldIdentifier.showEditor_()
    })
  mgr.addChild(menuItem, true)
  mgr.shouldSeparate()
  ezP.DelegateSvg.Expr.identifier.superClass_.populateContextMenuFirst_.call(this, block, mgr)
  return true
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.identifier.prototype.populateContextMenuMiddle_ = function (block, mgr) {
  var answer = mgr.populateVariable_(block)
  return ezP.DelegateSvg.Expr.identifier.superClass_.populateContextMenuMiddle_.call(this,block, mgr) || answer
}

/**
 * Handle the selection of an item in the variables dropdown menu.
 * Special case the 'Rename variable...' and 'Delete variable...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!Blockly.Block} block
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.identifier.prototype.onActionReplaceVariable = function (block, VM) {
  var listener = block.ezp.inputs.first.fieldIdentifier
  var oldName = listener.getValue()
  var workspace = block.workspace
  var oldVarId = workspace.getVariable(oldName).getId()
  var vm = workspace.getVariableById(oldVarId)
  if (vm) {
    Blockly.Events.setGroup(true)
    var blocks = workspace.getAllBlocks()
    var newVarId = VM.getId()
    // Iterate through every block and update name.
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].replaceVarId(oldVarId, newVarId)
    }
    workspace.deleteVariableInternal_(vm)
    var allBlocks = workspace.getAllBlocks()
    for (var _ = 0, B; B = allBlocks[_++];) {
      var field = block.ezp.inputs.first.fieldIdentifier
      if (field && field.getValue() === oldName) {
        field.setValue(VM.name)
      }
    }    
    Blockly.Events.setGroup(false)
  }
}

/**
 * Handle the selection of an item in the variables dropdown menu.
 * Special case the 'Rename variable...' and 'Delete variable...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.identifier.prototype.handleMenuItemActionMiddle = function (block, mgr, event) {
  var listener = block.ezp.inputs.first.fieldIdentifier
  var workspace = block.workspace
  var model = event.target.getModel()
  var action = model[0]
  var VM = model[1]
  switch(action) {
    case ezP.ID.CHANGE_VARIABLE:
      listener.setValue(VM.name)
      return true
    case ezP.ID.RENAME_VARIABLE:
      // Rename variable.
      listener.showEditor_()
      return true
    case ezP.ID.REPLACE_VARIABLE:
      // Replace variable.
      this.onActionReplaceVariable(block, VM)
      return true
    case ezP.ID.DELETE_UNUSED_VARIABLES:
      ezP.Variables.deleteUnusedVariables(workspace)
      return true
    case ezP.ID.NEW_VARIABLE:
      // Create new variable.
      VM = ezP.Variables.createDummyVariable(workspace)
      listener.setValue(VM.name)
      setTimeout(function () {
        listener.showIdentifierEditor()
      }, 10)
      return true
      default:
        return ezP.DelegateSvg.Expr.identifier.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
  }
}
