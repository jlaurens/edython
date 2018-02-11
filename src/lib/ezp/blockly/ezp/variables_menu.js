/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Menu for variables of ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Variables.Menu')

goog.require('ezP.Variables')
goog.require('ezP.PopupMenu')
goog.require('ezP.MenuItem')

/**
 * A basic popup menu class for ezPython variables.
 * @param {?goog.dom.DomHelper=} optDomHelper Optional DOM helper.
 * @param {?goog.ui.MenuRenderer=} optRenderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.MenuRenderer}.
 * @extends {goog.ui.Menu}
 * @constructor
 */
ezP.Variables.Menu = function (workspace, optDomHelper, optRenderer) {
  ezP.PopupMenu.call(this, optDomHelper, optRenderer)
  this.ezp = new ezP.Helper()
  this.registerDisposable(this.ezp)
  this.ezp.workspace = workspace
  this.init()
}
goog.inherits(ezP.Variables.Menu, ezP.PopupMenu)
goog.tagUnsealableClass(ezP.Variables.Menu)

ezP.CHANGE_VARIABLE_ID = 'CHANGE_VARIABLE_ID'
ezP.RENAME_VARIABLE_ID = 'RENAME_VARIABLE_ID'
ezP.REPLACE_VARIABLE_ID = 'REPLACE_VARIABLE_ID'
ezP.NEW_VARIABLE_ID = 'NEW_VARIABLE_ID'
ezP.DELETE_UNUSED_VARIABLES_ID = 'DELETE_UNUSED_VARIABLES_ID'

if (Blockly.Msg.NEW_VARIABLE.startsWith('Créer')) {
  Blockly.Msg.NEW_VARIABLE = ezP.Msg.NEW_VARIABLE
}

/**
 * Init the menu.
 */
ezP.Variables.Menu.prototype.init = function () {
  var ezp = this.ezp
  ezp.separator = new ezP.Separator()
  this.addChild(ezp.separator, true)
  var menuItem = new ezP.MenuItem(
    ezP.Msg.RENAME_VARIABLE,
    [ezP.RENAME_VARIABLE_ID])
  this.addChild(menuItem, true)
  var subMenu = ezp.subMenu = new ezP.SubMenu(ezP.Msg.REPLACE_VARIABLE)
  this.addChild(subMenu, true)
  this.addChild(new ezP.Separator(), true)
  menuItem = new ezP.MenuItem(
    ezP.Msg.NEW_VARIABLE,
    [ezP.NEW_VARIABLE_ID])
  this.addChild(menuItem, true)
  menuItem = ezp.deleteItem = new ezP.MenuItem(
    ezP.Msg.DELETE_UNUSED_VARIABLES,
    [ezP.DELETE_UNUSED_VARIABLES_ID])
  this.addChild(menuItem, true)
  this.render()
  this.getElement().id = 'ezp-variables-menu'
  Blockly.utils.addClass(subMenu.getMenu().getElement(), 'ezp-nosubmenu')
  var menu = this
  goog.events.listen(this, 'action', function (event) {
    setTimeout(function () {
      ezP.Variables.onMenuItemAction(menu, event)
    }, 100)// TODO be sure that this 100 is suffisant
  })
}

/**
 * Init update menu.
 */
ezP.Variables.Menu.prototype.updateWithListeningBlock = function (block) {
  var listener = block.ezp.fieldIdentifier
  goog.asserts.assert(listener && listener.getText, 'Bad ezP.Variables.Menu listener.')
  var ezp = this.ezp
  ezp.listeningBlock = block
  var name = listener.getText()
  var allVs = [].concat(ezp.workspace.getAllVariables())
  allVs.sort(Blockly.VariableModel.compareByName)
  var visible = allVs.length > 1
  var i = 0
  var j = 0
  var v
  var mi
  var subMenu = ezp.subMenu
  while (true) {
    mi = this.getChildAt(j)
    if ((v = allVs[i++])) {
      if (mi === ezp.separator) {
        do {
          mi = new ezP.MenuItemVar(v.name, [ezP.CHANGE_VARIABLE_ID, v])
          this.addChildAt(mi, j, true)
          mi.enableClassName('ezp-hidden', !visible || v.name === name)
          mi = new ezP.MenuItemVar(v.name, [ezP.REPLACE_VARIABLE_ID, v])
          subMenu.addItemAt(mi, j)
          mi.enableClassName('ezp-hidden', !visible || v.name === name)
          j++
        } while ((v = allVs[i++]))
        break
      }
      mi.setCaption(v.name)
      mi.setModel([ezP.CHANGE_VARIABLE_ID, v])
      mi.enableClassName('ezp-hidden', !visible || v.name === name)
      mi = subMenu.getItemAt(j)
      mi.setCaption(v.name)
      mi.setModel([ezP.REPLACE_VARIABLE_ID, v])
      mi.enableClassName('ezp-hidden', !visible || v.name === name)
      ++j
      continue
    }
    while (mi !== ezp.separator) {
      this.removeChildAt(j, true)
      mi = this.getChildAt(j)
    }
    while (subMenu.length > j) {
      subMenu.removeItemAt(j, true)
    }
    break
  }
  ezp.listeningBlock = block
  ezp.deleteItem.setEnabled(ezP.Variables.isThereAnUnusedVariable(ezp.workspace))
  ezp.subMenu.setEnabled(visible)
  ezp.separator.enableClassName('ezp-hidden', !visible)
  return this
}

/**
 * Replace the variable of the listener with the given one.
 * @param {!Blockly.Worspace} varModel The variable model.
 * @param {!string} oldVarId The previous variable Id.
 * @param {!string} newVarId The replacement variable Id.
 */
ezP.Variables.replaceVarId = function (workspace, oldVarId, newVarId) {
  var VM = workspace.getVariableById(oldVarId)
  if (VM) {
    Blockly.Events.setGroup(true)
    var blocks = workspace.getAllBlocks()
    // Iterate through every block and update name.
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].replaceVarId(oldVarId, newVarId)
    }
    workspace.deleteVariableInternal_(VM)
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
ezP.Variables.onMenuItemAction = function (menu, event) {
  var block = menu.ezp.listeningBlock
  var listener = block.ezp.fieldIdentifier
  var workspace = block.workspace
  var model = event.target.getModel()
  var action = model[0]
  var VM = model[1]
  if (action === ezP.CHANGE_VARIABLE_ID) {
    listener.setValue(VM.name)
  } else if (action === ezP.RENAME_VARIABLE_ID) {
    // Rename variable.
    listener.showVarNameEditor()
  } else if (action === ezP.REPLACE_VARIABLE_ID) {
    // Replace variable.
    var oldVarId = workspace.getVariable(listener.getValue()).getId()
    var newVarId = VM.getId()
    ezP.Variables.replaceVarId(workspace, oldVarId, newVarId)
    listener.setValue(VM.name)
  } else if (action === ezP.DELETE_UNUSED_VARIABLES_ID) {
    ezP.Variables.deleteUnusedVariables(workspace)
  } else if (action === ezP.NEW_VARIABLE_ID) {
    // Create new variable.
    VM = ezP.Variables.createDummyVariable(workspace)
    listener.setValue(VM.name)
    setTimeout(function () {
      listener.showVarNameEditor()
    }, 10)
  } else {
    throw Error('Unsupported variables menu action: ' + action)
  }
}
