/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Block for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.Block')
goog.require('Blockly.Block')
goog.forwardDeclare('edY.Delegate')
goog.forwardDeclare('edY.T3.All')

/**
 * Class for a block.
 * Not normally called directly, workspace.newBlock() is preferred.
 * For edython.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @extends {Blockly.Block}
 * @constructor
 */
edY.Block = function (workspace, prototypeName, optId) {
  this.type = prototypeName
  this.edy = edY.Delegate.Manager.create(this)
  edY.Block.superClass_.constructor.call(this, workspace, prototypeName, optId)
}
goog.inherits(edY.Block, Blockly.Block)

/**
 * Dispose the delegate too.
 * @param {number|string} colour HSV hue value, or #RRGGBB string.
 */
edY.Block.prototype.dispose = function(healStack) {
  if (this === Blockly.selected) {
    // this block was selected, select the block below or above before deletion
    //this does not work most probably because it is the wrong place
    var c8n, target
    if (((c8n = this.nextConnection) && (target = c8n.targetBlock())) ||
    ((c8n = this.previousConnection) && (target = c8n.targetBlock())) ||
    ((c8n = this.outputConnection) && (target = c8n.targetBlock()))) {
      setTimeout(function() {target.select()}, 100)// broken for outputConnection ?
    }
  }
  if (this.edy) {
    this.edy.deinitBlock(this)
  }
  edY.Block.superClass_.dispose.call(this, healStack)
}

/**
 * Add a value input, statement input or local variable to this block.
 * @param {number} type Either Blockly.INPUT_VALUE or Blockly.NEXT_STATEMENT or
 *     Blockly.DUMMY_INPUT.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 * @private
 * @override
 */
edY.Block.prototype.appendInput_ = function (type, name) {
  var input = edY.Block.superClass_.appendInput_.call(this, type, name)
  edY.Input.setupEdY(input)
  return input
}

/**
 * The default implementation forwards to super then
 * lets the delegate handle special cases.
 * @param {boolean} hidden True if connections are hidden.
 * @override
 */
edY.Block.prototype.setConnectionsHidden = function (hidden) {
  edY.Block.superClass_.setConnectionsHidden.call(this, hidden)
  this.edy.setConnectionsHidden(this, hidden)
}

/**
 * Return all variables referenced by this block.
 * This is not exactly Blockly's implementation,
 * only FieldInput's are considered.
 * @return {!Array.<string>} List of variable names.
 */
edY.Block.prototype.getVars = function () {
  var vars = []
  var i = 0, input
  for (; (input = this.inputList[i]); i++) {
    var j = 0, field
    for (; (field = input.fieldRow[j]); j++) {
      if (field instanceof edY.FieldInput) {
        vars.push(field.getText())
      }
    }
  }
  return vars
}

/**
 * Notification that a variable is renaming.
 * If the name matches one of this block's variables, rename it.
 * @param {string} oldName Previous name of variable.
 * @param {string} newName Renamed variable.
 */
edY.Block.prototype.renameVar = function (oldName, newName) {
  var i = 0, input
  for (; (input = this.inputList[i]); i++) {
    var j = 0, field
    for (; (field = input.fieldRow[j]); j++) {
      if (field instanceof edY.FieldInput &&
          Blockly.Names.equals(oldName, field.getText())) {
        field.setText(newName)
      }
    }
  }
}

/**
 * Notification of a variable replacement.
 * If the id matches one of this block's variables, replace it.
 * @param {string} oldVarId Previous variable.
 * @param {string} newVarId Replacement variable.
 */
edY.Block.prototype.replaceVarId = function (oldVarId, newVarId) {
  var i = 0, input
  for (; (input = this.inputList[i]); i++) {
    var j = 0, field
    for (; (field = input.fieldRow[j]); j++) {
      if (field instanceof edY.FieldInput &&
          Blockly.Names.equals(oldVarId, field.getValue())) {
        field.setValue(newVarId)
      }
    }
  }
}

/**
 * Shortcut for appending a sealed value input row.
 * Add a 'true' edy.wrapped_ attribute to the connection and register the newly created input to be filled later.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
edY.Block.prototype.appendWrapValueInput = function(name, prototypeName, optional, hidden) {
  goog.asserts.assert(prototypeName, 'Missing prototypeName, no block to seal')
  goog.asserts.assert(edY.T3.All.containsExpression(prototypeName), 'Unnown prototypeName, no block to seal '+prototypeName)
  var input = this.appendValueInput(name)
  input.connection.edy.wrapped_ = true
  input.connection.edy.optional_ = optional
  if (!this.edy.wrappedInputs_) {
    this.edy.wrappedInputs_ = []
  }
  if (!optional) {
    this.edy.wrappedInputs_.push([input, prototypeName])
  }
  return input
}

/**
 * Set whether this block returns a value.
 * No null opt_check for expression blocks
 * @param {boolean} newBoolean True if there is an output.
 * @param {string|Array.<string>|null|undefined} opt_check Returned type or list
 *     of returned types.  Null or undefined if any type could be returned
 *     (e.g. variable get).
 */
edY.Block.prototype.setOutput = function(newBoolean, opt_check) {
  if (newBoolean) {
    goog.asserts.assert(!!opt_check || !this.type.startsWith('edy:expr_') || this.type.startsWith('edy:expr_fake'),
      'edY output connection must be types for '+this.type)
  }
  edY.Block.superClass_.setOutput.call(this, newBoolean, opt_check)
}
