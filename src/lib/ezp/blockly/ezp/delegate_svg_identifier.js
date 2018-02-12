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
  this.outputCheck = ezP.T3.Expr.identifier
}
goog.inherits(ezP.DelegateSvg.Expr.identifier, ezP.DelegateSvg.Expr)
ezP.Delegate.Manager.register('identifier')

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.identifier.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.identifier.superClass_.initBlock.call(this, block)
  this.fieldIdentifier = new ezP.FieldVariable.Identifier('item')
  this.inputIdentifier = block.appendDummyInput()
    .appendField(this.fieldIdentifier, ezP.Const.Field.ID)
}

ezP.CHANGE_VARIABLE_ID = 'CHANGE_VARIABLE'
ezP.RENAME_VARIABLE_ID = 'RENAME_VARIABLE'
ezP.REPLACE_VARIABLE_ID = 'REPLACE_VARIABLE'
ezP.NEW_VARIABLE_ID = 'NEW_VARIABLE'
ezP.DELETE_UNUSED_VARIABLES_ID = 'DELETE_UNUSED_VARIABLES'

if (Blockly.Msg.NEW_VARIABLE.startsWith('Créer')) {
  Blockly.Msg.NEW_VARIABLE = ezP.Msg.NEW_VARIABLE
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.ContextMenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.identifier.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.menu
  var answer = false
  block.ezp.isNotAVariable(block)
  if (ezP.T3.Expr.Check.not_a_variable.indexOf(block.ezp.plugged_)<0) {
    var menuItem = new ezP.MenuItem(
      ezP.Msg.RENAME_VARIABLE,
      [ezP.RENAME_VARIABLE_ID]);
    menu.addChild(menuItem, true);
    ezP.DelegateSvg.Expr.identifier.superClass_.populateContextMenuFirst_.call(this, block, menu)
    answer = true
  }
  return ezP.DelegateSvg.Expr.identifier.superClass_.populateContextMenuFirst_.call(this, block, menu) || answer
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.identifier.prototype.handleMenuItemActionFirst = function (block, menu, event) {
  var model = event.target.getModel()
  var action = model[0]
  if (action == ezP.RENAME_VARIABLE_ID) {
    block.ezp.fieldIdentifier.showVarNameEditor()
    return true
  }
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.ContextMenuManager} mgr mgr.menu is the menu to populate.
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
  var listener = block.ezp.fieldIdentifier
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
      var field = B.ezp.fieldIdentifier
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
ezP.DelegateSvg.Expr.identifier.prototype.handleMenuItemActionMiddle = function (block, menu, event) {
  var listener = block.ezp.fieldIdentifier
  var workspace = block.workspace
  var model = event.target.getModel()
  var action = model[0]
  var VM = model[1]
  switch(action) {
    case ezP.CHANGE_VARIABLE_ID:
      listener.setValue(VM.name)
      return true
    case ezP.RENAME_VARIABLE_ID:
      // Rename variable.
      listener.showEditor_()
      return true
    case ezP.REPLACE_VARIABLE_ID:
      // Replace variable.
      this.onActionReplaceVariable(block, VM)
      return true
    case ezP.DELETE_UNUSED_VARIABLES_ID:
      ezP.Variables.deleteUnusedVariables(workspace)
      return true
    case ezP.NEW_VARIABLE_ID:
      // Create new variable.
      VM = ezP.Variables.createDummyVariable(workspace)
      listener.setValue(VM.name)
      setTimeout(function () {
        listener.showVarNameEditor()
      }, 10)
      return true
      default:
        return ezP.DelegateSvg.Expr.identifier.superClass_.handleMenuItemActionFirst.call(this, block, menu, event)
  }
}

ezP.FieldVariable.Identifier.prototype.showVarNameEditor=function(a){this.workspace_=this.sourceBlock_.workspace;
  a=a||!1;
  !a&&(goog.userAgent.MOBILE||goog.userAgent.ANDROID||goog.userAgent.IPAD)?this.showVarNamePromptEditor_():(this.isEditingVariableName_=!0,this.showVarNameInlineEditor_(a))};
  
  ezP.FieldVariable.Identifier.prototype.showVarNamePromptEditor_=function(){var a=this,b=ezP.Msg.RENAME_VARIABLE_TITLE.replace("%1",this.text_);
  Blockly.prompt(b,this.text_,function(b){a.sourceBlock_&&(b=a.callValidator(b));
  a.setValue(b)})};
  ezP.FieldVariable.prototype.onFinishEditing_=function(a){this.isEditingVariableName_=!1;
  var b=this.sourceBlock_.workspace,c=b.getVariable(a);
  c?this.setText(c.name):b.renameVariableById(this.getValue(),a)};
  ezP.FieldVariable.Identifier.prototype.showVarNameInlineEditor_=ezP.FieldTextInput.prototype.showInlineEditor_;
  