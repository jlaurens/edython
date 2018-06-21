/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Workspace override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Workspace')

goog.require('Blockly.Workspace')
goog.require('eYo.Helper')
goog.require('eYo.Block')
goog.require('eYo.App')
goog.require('eYo.Xml')

/**
 * Class for a workspace delegate.
 * Extends the workspace with minimum interference.
 * @param {Blockly.Workspace} workspace
 * @constructor
 */
eYo.WorkspaceDelegate = function (workspace) {
  eYo.WorkspaceDelegate.superClass_.constructor.call(this)
  this.workspace_ = workspace
}
goog.inherits(eYo.WorkspaceDelegate, eYo.Helper)

// Dependency ordering?
/**
 * Add the nodes from string to the workspace.
 * @param {!String} str
 * @return {Array.<string>} An array containing new block IDs.
*/
eYo.WorkspaceDelegate.prototype.fromString = function (str) {
  var parser = new DOMParser()
  var dom = parser.parseFromString(str, 'application/xml')
  return eYo.Xml.domToWorkspace(dom.documentElement, this.workspace_)
}

/**
 * Convert the workspace to string.
 * @param {?Boolean} opt_noId
 */
eYo.WorkspaceDelegate.prototype.toString = function (opt_noId) {
  let dom = eYo.Xml.workspaceToDom(this.workspace_, opt_noId)
  let oSerializer = new XMLSerializer()
  return oSerializer.serializeToString(dom)
}

/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 * @param {Blockly.Options} optOptions Dictionary of options.
 * @constructor
 */
eYo.Workspace = function (optOptions) {
  eYo.Workspace.superClass_.constructor.call(this, optOptions)
  this.eyo = new eYo.WorkspaceDelegate(this)
}
goog.inherits(eYo.Workspace, Blockly.Workspace)

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 * @suppress{accessControls}
 */
Blockly.Workspace.prototype.dispose = function () {
  this.listeners_.length = 0
  this.clear()
  this.eyo.dispose()
  this.eyo = null
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
eYo.Workspace.prototype.newBlock = function (prototypeName, optId) {
  if (prototypeName.startsWith('eyo:')) {
    return new eYo.Block(/** Blockly.Workspace */ this, prototypeName, optId)
  } else {
    return new Blockly.Block(/** Blockly.Workspace */ this, prototypeName, optId)
  }
}

eYo.Workspace.prototype.logAllConnections = function (comment) {
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
eYo.Workspace.prototype.getVariableUses = function (name, all) {
  var uses = all ? eYo.Workspace.superClass_.getVariableUses.call(name) : []
  var blocks = this.getAllBlocks()
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    var eyo = blocks[i].eyo
    if (eyo) {
      var blockVariables = eyo.getVars(blocks[i])
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
 * @return {?Blockly.Block} The sought after block or null if not found.
 */
eYo.Workspace.savedGetBlockById = Blockly.Workspace.prototype.getBlockById
Blockly.Workspace.prototype.getBlockById = function (id) {
  var block = eYo.Workspace.savedGetBlockById.call(this, id)
  if (block) {
    return block
  }
  var m = XRegExp.exec(id, eYo.XRE.id_wrapped)
  if (m && (block = eYo.Workspace.savedGetBlockById.call(this, m.id))) {
    var e8r = block.eyo.inputEnumerator(block)
    while (e8r.next()) {
      var c8n = e8r.here.connection
      if (c8n) {
        var target = c8n.targetBlock()
        if (target && target.id === id) {
          return target
        }
      }
    }
  }
}

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.Workspace.prototype.undo = function(redo) {
  var inputStack = redo ? this.redoStack_ : this.undoStack_
  var outputStack = redo ? this.undoStack_ : this.redoStack_
  while (true) {
    var inputEvent = inputStack.pop()
    if (!inputEvent) {
      return
    }
    var events = [inputEvent]
    // Do another undo/redo if the next one is of the same group.
    while (inputStack.length && inputEvent.group &&
        inputEvent.group == inputStack[inputStack.length - 1].group) {
      events.push(inputStack.pop())
    }
    events = Blockly.Events.filter(events, redo)
    if (events.length) {
      // Push these popped events on the opposite stack.
      for (var i = 0, event; event = events[i]; i++) {
        outputStack.push(event)
      }
      Blockly.Events.recordUndo = false
      try {
        var Bs = []
        if (this.rendered) {
          for (var i = 0, event; event = events[i]; i++) {
            var B = this.getBlockById(event.blockId)
            if (B) {
              B.eyo.skipRendering()
              Bs.push(B)
            }
          }  
        }
        for (var i = 0, event; event = events[i]; i++) {
          event.run(redo)
        }
      } catch (err) {
        console.error(err)
      } finally {
        Blockly.Events.recordUndo = true
        for (var i = 0; B = Bs[i]; i++) {
          B.eyo.unskipRendering()
          B.eyo.render(B)
        }  
      }
      return  
    }
  }
}
