/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
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
ezP.DelegateSvg.Manager.makeSubclass('identifier', {
  inputs: {
    i_1: {
      key: ezP.Key.NAME,
      identifier: '',
    },
  },
  output: {
    didConnect: function(oldTargetConnection, oldConnectionn) {
      // `this` is a connection's delegate
      var targetC8n = this.connection.targetConnection
      var source = targetC8n.sourceBlock_
      if (source.ezp instanceof ezP.DelegateSvg.List) {

      } else {
        for (var i = 0, input;(input = source.inputList[i++]);) {
          if (input.connection === targetC8n) {
            if (input.ezp.model) {
              var block = this.connection.sourceBlock_
              block.ezp.setPhantomValue(block, input.ezp.model.hole_value)
            }
            return
          }
        }
      }
    },
    didDisconnect: function(oldConnection) {
      // `this` is a connection's delegate
      var block = this.connection.sourceBlock_
      block.ezp.setPhantomValue(block, undefined)
    },
  }
})

/**
 * Returns the text that should appear in grey when some field content is missing.
 * @param {!Block} block.
 * @return whether the block should be wrapped
 */
ezP.FieldIdentifier.prototype.placeholderText = function() {
  return this.placeholderText_ || ezP.Msg.PLACEHOLDER_IDENTIFIER
}



/**
 * Some block should not be wrapped.
 * Default implementation returns false
 * @param {!Block} block.
 * @return whether the block should be wrapped
 */
ezP.DelegateSvg.Expr.identifier.prototype.noBlockWrapped = function (block) {
  return true
}

/**
 * Set the placeholderText.
 * @param {!Block} block.
 * @param {!string} text.
 * @return true
 */
ezP.DelegateSvg.Expr.identifier.prototype.setPhantomValue = function(block, text) {
  var field = this.uiModel.i_1.fields.identifier
  field.placeholderText_ = text
  field.render_()
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
  var input = block.getInput(ezP.Key.NAME)
  var field = input.ezp.fields.identifier
  return field.getValue()
}

/**
 * Set the value.
 * @param {!Blockly.Block} block The block.
 * @param {!string} value the new value.
 * @private
 */
ezP.DelegateSvg.Expr.identifier.prototype.setValue = function (block, value) {
  var input = block.getInput(ezP.Key.NAME)
  var field = input.ezp.fields.identifier
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
  var input = block.getInput(ezP.Key.NAME)
  var field = input.ezp.fields.identifier
  field.showEditor_()
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
      var input = block.getInput(ezP.Key.NAME)
      var field = input.ezp.fields.identifier
      field.showEditor_()
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
  var listener = block.ezp.uiModel.i_1.fields.identifier
  var oldName = listener.getValue()
  var workspace = block.workspace
  var oldVarId = workspace.getVariable(oldName).getId()
  var vm = workspace.getVariableById(oldVarId)
  if (vm) {
    Blockly.Events.setGroup(true)
    try {
      var blocks = workspace.getAllBlocks()
      var newVarId = VM.getId()
      // Iterate through every block and update name.
      for (var i = 0; i < blocks.length; i++) {
        blocks[i].replaceVarId(oldVarId, newVarId)
      }
      workspace.deleteVariableInternal_(vm)
      var allBlocks = workspace.getAllBlocks()
      for (var i = 0, B; B = allBlocks[i++];) {
        var field = block.ezp.uiModel.i_1.fields.identifier
        if (field && field.getValue() === oldName) {
          field.setValue(VM.name)
        }
      }    
    } finally {
      Blockly.Events.setGroup(false)
    }
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
  var listener = block.ezp.uiModel.i_1.fields.identifier
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

/**
 * When the subtype did change.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 */
ezP.DelegateSvg.Expr.identifier.prototype.initSubtype = function (block) {
  ezP.DelegateSvg.Expr.identifier.superClass_.initSubtype.call(this, block)
  var input = block.getInput(ezP.Key.NAME)
  var field = input.ezp.fields.identifier
  this.setSubtype(field.getValue())
  return
}

/**
 * When the subtype did change.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 */
ezP.DelegateSvg.Expr.identifier.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Expr.identifier.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  var input = block.getInput(ezP.Key.NAME)
  var field = input.ezp.fields.identifier
  field.setValue(newSubtype)
  return
}

/**
 * Validates the new subtype.
 * Compares to the data of the model.
 * The default implementation return false.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newSubtype
 * @return true if newSubtype is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.identifier.prototype.validateSubtype = function (block, newSubtype) {
  return ezP.Do.typeOfString(subtype) === ezP.T3.Expr.identifier
}

ezP.DelegateSvg.Identifier.T3s = [
  ezP.T3.Expr.identifier,
]