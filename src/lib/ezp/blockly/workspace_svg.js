/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview WorkspaceSvg override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.WorkspaceSvg')

goog.require('Blockly.WorkspaceSvg')
goog.require('ezP.BlockSvg')
goog.require('ezP.Workspace')

ezP.inherits(Blockly.WorkspaceSvg, ezP.Workspace)

/**
 * Obtain a newly created block.
 * Returns a block subclass for EZP blocks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!Blockly.BlockSvg} The created block.
 */
Blockly.WorkspaceSvg.prototype.newBlock = function (prototypeName, optId) {
  if (prototypeName.startsWith('ezp_')) {
    return new ezP.BlockSvg(this, prototypeName, optId)
  } else {
    return new Blockly.BlockSvg(this, prototypeName, optId)
  }
}

Blockly.Workspace.prototype.logAllConnections = function (comment) {
  comment = comment || ''
  var dbList = this.connectionDBList
  console.log(comment + '> Blockly.INPUT_VALUE connections')
  var db = dbList[Blockly.INPUT_VALUE]
  for (var _ = 0, c8n; (c8n = db[_]); ++_) {
    console.log(_ + ':' + [c8n.x_, c8n.y_, c8n.offsetInBlock_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.OUTPUT_VALUE connections')
  db = dbList[Blockly.OUTPUT_VALUE]
  for (_ = 0; (c8n = db[_]); ++_) {
    console.log(_ + ':' + [c8n.x_, c8n.y_, c8n.offsetInBlock_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.NEXT_STATEMENT connections')
  db = dbList[Blockly.NEXT_STATEMENT]
  for (_ = 0; (c8n = db[_]); ++_) {
    console.log(_ + ':' + [c8n.x_, c8n.y_, c8n.offsetInBlock_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.PREVIOUS_STATEMENT connections')
  db = dbList[Blockly.PREVIOUS_STATEMENT]
  for (_ = 0; (c8n = db[_]); ++_) {
    console.log(_ + ':' + [c8n.x_, c8n.y_, c8n.offsetInBlock_, c8n.sourceBlock_.type])
  }
}
