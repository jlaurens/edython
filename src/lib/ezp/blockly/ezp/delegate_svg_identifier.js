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
goog.require('ezP.FieldVariable')

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
    key: ezP.Const.Input.NAME,
    identifier: 'item',
  }
}
goog.inherits(ezP.DelegateSvg.Expr.identifier, ezP.DelegateSvg.Expr)
ezP.Delegate.Manager.register('identifier')

ezP.ID.RENAME_IDENTIFIER = 'RENAME_IDENTIFIER'

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
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.identifier.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.menu
  var menuItem = new ezP.MenuItem(
    ezP.Msg.RENAME,
    [ezP.ID.RENAME_IDENTIFIER]);
  mgr.addChild(menuItem, true);
  mgr.shouldSeparate()
  ezP.DelegateSvg.Expr.identifier.superClass_.populateContextMenuFirst_.call(this, block, mgr)
  return true
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.identifier.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  var model = event.target.getModel()
  var action = model[0]
  if (action == ezP.ID.RENAME_IDENTIFIER) {
    block.ezp.inputs.first.fieldIdentifier.showIdentifierEditor()
    return true
  }
  return ezP.DelegateSvg.Expr.identifier.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)

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

ezP.FieldIdentifier.prototype.showIdentifierEditor=function(a){this.workspace_=this.sourceBlock_.workspace;
  a=a||!1;
  !a&&(goog.userAgent.MOBILE||goog.userAgent.ANDROID||goog.userAgent.IPAD)?this.showIdentifierPromptEditor_():(this.isEditingIdentifier_=!0,this.showIdentifierInlineEditor_(a))};
  
  ezP.FieldIdentifier.prototype.showIdentifierPromptEditor_=function(){var a=this,b=ezP.Msg.RENAME_IDENTIFIER_TITLE.replace("%1",this.text_);
  Blockly.prompt(b,this.text_,function(b){a.sourceBlock_&&(b=a.callValidator(b));
  a.setValue(b)})};

  ezP.FieldVariable.prototype.onFinishEditing_=function(a){this.isEditingIdentifier_=!1;
  var b=this.sourceBlock_.workspace,c=b.getVariable(a);
  c?this.setText(c.name):b.renameVariableById(this.getValue(),a)};
  ezP.FieldIdentifier.prototype.showIdentifierInlineEditor_=ezP.FieldTextInput.prototype.showInlineEditor_;
  