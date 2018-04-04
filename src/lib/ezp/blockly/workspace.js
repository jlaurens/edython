/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Workspace override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Workspace')

goog.require('Blockly.Workspace')
goog.require('ezP.Helper')
goog.require('ezP.Block')

/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 * @param {Blockly.Options} optOptions Dictionary of options.
 * @constructor
 */
ezP.Workspace = function (optOptions) {
  ezP.Workspace.superClass_.constructor.call(this, optOptions)
  this.ezp = new ezP.Helper()
}
goog.inherits(ezP.Workspace, Blockly.Workspace)

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Workspace.prototype.dispose = function () {
  this.listeners_.length = 0
  this.clear()
  this.ezp.dispose()
  this.ezp = null
  // Remove from workspace database.
  delete Blockly.Workspace.WorkspaceDB_[this.id]
}

/**
 * Obtain a newly created block.
 * Returns a block subclass for EZP blocks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!Blockly.Block} The created block.
 */
ezP.Workspace.prototype.newBlock = function (prototypeName, optId) {
  if (prototypeName.startsWith('ezp:')) {
    return new ezP.Block(this, prototypeName, optId)
  } else {
    return new Blockly.Block(this, prototypeName, optId)
  }
}

ezP.Workspace.prototype.logAllConnections = function (comment) {
  comment = comment || ''
  var dbList = this.connectionDBList
  console.log(comment + '> Blockly.INPUT_VALUE connections')
  var db = dbList[Blockly.INPUT_VALUE]
  for (var i = 0, c8n; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.OUTPUT_VALUE connections')
  db = dbList[Blockly.OUTPUT_VALUE]
  for (i = 0; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.NEXT_STATEMENT connections')
  db = dbList[Blockly.NEXT_STATEMENT]
  for (i = 0; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.PREVIOUS_STATEMENT connections')
  db = dbList[Blockly.PREVIOUS_STATEMENT]
  for (i = 0; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.sourceBlock_.type])
  }
}

/**
 * Find all the uses of a named variable.
 * @param {string} name Name of variable.
 * @return {!Array.<!Blockly.Block>} Array of block usages.
 */
ezP.Workspace.prototype.getVariableUses = function (name, all) {
  var uses = all ? ezP.Workspace.superClass_.getVariableUses.call(name) : []
  var blocks = this.getAllBlocks()
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    var ezp = blocks[i].ezp
    if (ezp) {
      var blockVariables = ezp.getVars(blocks[i])
      if (blockVariables) {
        for (var j = 0; j < blockVariables.length; j++) {
          var varName = blockVariables[j]
          // Variable name may be null if the block is only half-built.
          if (varName && name && Blockly.Names.equals(varName, name)) {
            uses.push(blocks[i])
          }
        }
      }
    }
  }
  return uses
}

/**
 * Find the block on this workspace with the specified ID.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The sought after block or null if not found.
 */
ezP.Workspace.savedGetBlockById = Blockly.Workspace.prototype.getBlockById
Blockly.Workspace.prototype.getBlockById = function(id) {
  var block = ezP.Workspace.savedGetBlockById.call(this, id)
  if (block) {
    return block
  }
  var m = XRegExp.exec(id, ezP.XRE.id_wrapped)
  if (m && (block = ezP.Workspace.savedGetBlockById.call(this, m.id))) {
    var e8r = block.ezp.inputEnumerator(block)
    while (e8r.next()) {
      var c8n = e8r.here.connection
      if (c8n) {
        var target = c8n.targetBlock()
        if (target.id === id) {
          return target
        }
      }
    }
  }
  return undefined
}
