/**
 * @license
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Workspace override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.Workspace');

goog.require('Blockly.Workspace');
goog.require('ezP.Helper');
goog.require('ezP.Block');
goog.require('ezP.Variables.Menu');

/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 * @param {Blockly.Options} opt_options Dictionary of options.
 * @constructor
 */
ezP.Workspace = function(opt_options) {
  ezP.Workspace.superClass_.constructor.call(this,opt_options);
  this.ezp = new ezP.Helper();
  this.ezp.menuVariable = new ezP.Variables.Menu(this);
};
goog.inherits(ezP.Workspace, Blockly.Workspace);

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Workspace.prototype.dispose = function() {
  this.listeners_.length = 0;
  this.clear();
  this.ezp.dispose();
  this.ezp = null;
  // Remove from workspace database.
  delete Blockly.Workspace.WorkspaceDB_[this.id];
};

/**
 * Obtain a newly created block.
 * Returns a block subclass for EZP blocks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!Blockly.Block} The created block.
 */
ezP.Workspace.prototype.newBlock = function(prototypeName, opt_id) {
  if(prototypeName.startsWith('ezp_')) {
    return new ezP.Block(this, prototypeName, opt_id);
  } else {
    return new Blockly.Block(this, prototypeName, opt_id);
  };
};

ezP.Workspace.prototype.logAllConnections = function(comment) {
  comment = comment || '';
  var dbList = this.connectionDBList;
  console.log(comment+'> Blockly.INPUT_VALUE connections');
  var db = dbList[Blockly.INPUT_VALUE];
  for (var _ = 0, c10n; c10n = db[_];++_) {
    console.log(_+':'+[c10n.x_,c10n.y_,c10n.sourceBlock_.type]);
  }
  console.log(comment+'> Blockly.OUTPUT_VALUE connections');
  var db = dbList[Blockly.OUTPUT_VALUE];
  for (var _ = 0, c10n; c10n = db[_];++_) {
    console.log(_+':'+[c10n.x_,c10n.y_,c10n.sourceBlock_.type]);
  }
  console.log(comment+'> Blockly.NEXT_STATEMENT connections');
  var db = dbList[Blockly.NEXT_STATEMENT];
  for (var _ = 0, c10n; c10n = db[_];++_) {
    console.log(_+':'+[c10n.x_,c10n.y_,c10n.sourceBlock_.type]);
  }
  console.log(comment+'> Blockly.PREVIOUS_STATEMENT connections');
  var db = dbList[Blockly.PREVIOUS_STATEMENT];
  for (var _ = 0, c10n; c10n = db[_];++_) {
    console.log(_+':'+[c10n.x_,c10n.y_,c10n.sourceBlock_.type]);
  }
};

/**
 * Find all the uses of a named variable.
 * @param {string} name Name of variable.
 * @return {!Array.<!Blockly.Block>} Array of block usages.
 */
ezP.Workspace.prototype.getVariableUses = function(name, all) {
  var uses = all? ezP.Workspace.superClass_.getVariableUses.call(name): [];
  var blocks = this.getAllBlocks();
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    var ezp = blocks[i].ezp;
    if (ezp) {
      var blockVariables = ezp.getVars(blocks[i]);
      if (blockVariables) {
        for (var j = 0; j < blockVariables.length; j++) {
          var varName = blockVariables[j];
          // Variable name may be null if the block is only half-built.
          if (varName && name && Blockly.Names.equals(varName, name)) {
            uses.push(blocks[i]);
          }
        }
      }
    }
  }
  return uses;
};
