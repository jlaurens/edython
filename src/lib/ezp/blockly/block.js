/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Block for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Block')
goog.require('Blockly.Block')
goog.require('ezP.Input')
goog.forwardDeclare('ezP.Delegate')

/**
 * Class for a block.
 * Not normally called directly, workspace.newBlock() is preferred.
 * For ezPython.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.Block = function (workspace, prototypeName, optId) {
  this.ezp = ezP.Delegate.Manager.create(prototypeName, this.ezp)
  ezP.Block.superClass_.constructor.call(this, workspace, prototypeName, optId)
  this.ezp.initBlock_(this)
}
goog.inherits(ezP.Block, Blockly.Block)

/**
 * Dispose the delegate too.
 * @param {number|string} colour HSV hue value, or #RRGGBB string.
 */
ezP.Block.prototype.dispose = function () {
  if (this.ezp) {
    this.ezp.deinitBlock(this)
  }
  ezP.Block.superClass_.dispose.call(this)
}

/**
 * Append a tuple item value input row.
 * @return {!Blockly.Input} The input object created.
 */
ezP.Block.prototype.tupleConsolidateEZP_ = function () {
  if (this.ezp) {
    this.ezp.tupleConsolidate(this)
  }
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
ezP.Block.prototype.appendInput_ = function (type, name) {
  var input = ezP.Block.superClass_.appendInput_.call(this, type, name)
  ezP.Input.setupEzpData(input)
  if (type === Blockly.INPUT_VALUE) {
    if (name.match(/^(?:TUPLE|S7R)_(?:\d|\*)+_(?:\d|\*)+$/g)) {
      input.ezpTuple = input.ezpTuple || {}
    } else if (name.match(/^(?:ITEM|S7R)_(?:\d|\*)+$/g)) {
      input.ezpData.listed_ = true
    }
  }
  return input
}

/**
 * The default implementation forwards to super then
 * lets the delegate handle special cases.
 * @param {boolean} hidden True if connections are hidden.
 * @override
 */
ezP.Block.prototype.setConnectionsHidden = function (hidden) {
  ezP.Block.superClass_.setConnectionsHidden.call(this, hidden)
  this.ezp.setConnectionsHidden(this, hidden)
}

/**
 * Return all variables referenced by this block.
 * This is not exactly Blockly's implementation,
 * only FieldVariable's are considered.
 * @return {!Array.<string>} List of variable names.
 */
ezP.Block.prototype.getVars = function () {
  var vars = []
  var i = 0, input
  for (; (input = this.inputList[i]); i++) {
    var j = 0, field
    for (; (field = input.fieldRow[j]); j++) {
      if (field instanceof ezP.FieldVariable) {
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
ezP.Block.prototype.renameVar = function (oldName, newName) {
  var i = 0, input
  for (; (input = this.inputList[i]); i++) {
    var j = 0, field
    for (; (field = input.fieldRow[j]); j++) {
      if (field instanceof ezP.FieldVariable &&
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
ezP.Block.prototype.replaceVarId = function (oldVarId, newVarId) {
  var i = 0, input
  for (; (input = this.inputList[i]); i++) {
    var j = 0, field
    for (; (field = input.fieldRow[j]); j++) {
      if (field instanceof ezP.FieldVariable &&
          Blockly.Names.equals(oldVarId, field.getValue())) {
        field.setValue(newVarId)
      }
    }
  }
}

/**
 * Shortcut for appending a sealed value input row.
 * Just add a 'true' ezpData.wrapped_ attribute to the connection.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
ezP.Block.prototype.appendWrapValueInput = function(name, prototypeName) {
  goog.asserts.assert(prototypeName, 'Missing prototypeName, no block to seal')
  var input = this.appendValueInput(name)
  input.connection.ezp.wrapped_ = true
  input.connection.setHidden(true)
  if (!this.ezp.wrappedInputs_) {
    this.ezp.wrappedInputs_ = []
  }
  this.ezp.wrappedInputs_.push([input, prototypeName])
  return input
};

/**
 * Set whether this block returns a value.
 * No null opt_check for expression blocks
 * @param {boolean} newBoolean True if there is an output.
 * @param {string|Array.<string>|null|undefined} opt_check Returned type or list
 *     of returned types.  Null or undefined if any type could be returned
 *     (e.g. variable get).
 */
ezP.Block.prototype.setOutput = function(newBoolean, opt_check) {
  if (newBoolean) {
    goog.asserts.assert(!!opt_check || !this.type.startsWith('ezp_expr_') || this.type.startsWith('ezp_expr_fake'),
      'ezP output connection must be types for '+this.type)
  }
  ezP.Block.superClass_.setOutput.call(this, newBoolean, opt_check)
};
