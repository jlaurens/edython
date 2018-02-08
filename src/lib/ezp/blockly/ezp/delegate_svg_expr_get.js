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

goog.provide('ezP.DelegateSvg.Expr.Get')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, get block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.Get = function (prototypeName) {
  ezP.DelegateSvg.Expr.Get.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Expr.Get, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.registerDelegate(ezP.Const.Expr.GET, ezP.DelegateSvg.Expr.Get)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.Get.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.Get.superClass_.initBlock.call(this, block)
  this.fieldStars = new ezP.FieldLabel('*')
  this.inputStars = block.appendDummyInput()
    .appendField(this.fieldStars, ezP.Const.Field.STARS)
  this.fieldIdentifier = new ezP.FieldVariable.Identifier('item')
  this.inputIdentifier = block.appendDummyInput()
    .appendField(this.fieldIdentifier, ezP.Const.Field.ID)
  this.fieldAnnotation = new ezP.FieldVariable.Annotation('expression')
  this.inputAnnotation = block.appendDummyInput()  
    .appendField(new ezP.FieldLabel(': '))
    .appendField(this.fieldAnnotation, ezP.Const.Field.ANN)
  this.fieldDefault = new ezP.FieldVariable.Default('expression')
  this.inputDefault = block.appendDummyInput()  
    .appendField(new ezP.FieldLabel(' = '))
    .appendField(this.fieldDefault, ezP.Const.Field.DFT)
}

/**
 * Whether the block is potentially an argument.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.Get.prototype.hasStar = function(block) {
  return this.hasStar_ !== true
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.Get.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Expr.Get.superClass_.willRender_.call(this, block)
  var parent = block.getParent()
  if (parent && parent.ezp.getParameterMenu) {
    this.inputStars.setVisible(this.hasStar_ === true)
    this.inputAnnotation.setVisible(this.hasAnnotation_ === true)
    this.inputDefault.setVisible(this.hasDefault_ === true)
  } else {
    this.inputStars.setVisible(false)
    this.inputAnnotation.setVisible(false)
    this.inputDefault.setVisible(false)
  }
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.Get.prototype.customContextMenu = function(block, menuOptions) {
  console.log('Customized')
  if (menuOptions.length<2) {
    console.log('SMALL');
  }
  menuOptions.unshift(new ezP.Separator());
  var menuItem = new ezP.MenuItem(
    ezP.Msg.RENAME_VARIABLE,
    [ezP.RENAME_VARIABLE_ID]);
  goog.events.listen(menuItem, goog.ui.Component.EventType.ACTION,
    function() {
      block.ezp.fieldIdentifier.showVarNameEditor();
    });
  menuOptions.unshift(menuItem);
  return menuOptions;
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
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.Get.prototype.populateContextMenuFirst_ = function (block, menu) {
  var listener = block.ezp.fieldIdentifier
  goog.asserts.assert(listener && listener.getText, 'Bad listener in ...Get...populateContextMenuFirst_.')
  var name = listener.getText()
  var allVs = [].concat(block.workspace.getAllVariables())
  allVs.sort(Blockly.VariableModel.compareByName)
  var visible = allVs.length > 1
  var j = 0
  var v
  var menuItem
  var subMenu = new ezP.SubMenu(ezP.Msg.REPLACE_VARIABLE)
  for (var i = 0; v = allVs[i++];) {
    menuItem = new ezP.MenuItemVar(v.name, [ezP.CHANGE_VARIABLE_ID, v])
    menu.addChild(menuItem, true)
    menuItem.enableClassName('ezp-hidden', !visible || v.name === name)
    menuItem = new ezP.MenuItemVar(v.name, [ezP.REPLACE_VARIABLE_ID, v])
    subMenu.addItem(menuItem)
    menuItem.enableClassName('ezp-hidden', !visible || v.name === name)
  }
  if (visible) {
    menu.addChild(new ezP.Separator(), true)
  }
  subMenu.setEnabled(visible)  
  menuItem = new ezP.MenuItem(
    ezP.Msg.RENAME_VARIABLE,
    [ezP.RENAME_VARIABLE_ID])
    menu.addChild(menuItem, true)
  menu.addChild(subMenu, true)
  menuItem = new ezP.MenuItem(
    ezP.Msg.NEW_VARIABLE,
    [ezP.NEW_VARIABLE_ID])
    menu.addChild(menuItem, true)
  menuItem = new ezP.MenuItem(
    ezP.Msg.DELETE_UNUSED_VARIABLES,
    [ezP.DELETE_UNUSED_VARIABLES_ID])
  menuItem.setEnabled(ezP.Variables.isThereAnUnusedVariable(block.workspace))
  menu.addChild(menuItem, true)
  Blockly.utils.addClass(subMenu.getMenu().getElement(), 'ezp-nosubmenu')

  ezP.DelegateSvg.Expr.Get.superClass_.populateContextMenuFirst_.call(this,block, menu)
  return true
}

/**
 * Handle the selection of an item in the variables dropdown menu.
 * Special case the 'Rename variable...' and 'Delete variable...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.Get.prototype.onActionReplaceVariable = function (block, VM) {
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
ezP.DelegateSvg.Expr.Get.prototype.handleActionMenuEventFirst = function (block, menu, event) {
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
        return ezP.DelegateSvg.Expr.Get.superClass_.handleActionMenuEventFirst.call(this, block, menu, event)
  }
}
