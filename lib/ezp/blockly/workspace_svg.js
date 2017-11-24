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
 * @fileoverview WorkspaceSvg override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('EZP.WorkspaceSvg');

goog.require('Blockly.WorkspaceSvg');
goog.require('EZP.BlockSvg');
goog.require('EZP.Workspace');

EZP.inherits(Blockly.WorkspaceSvg, EZP.Workspace);

/**
 * Obtain a newly created block.
 * Returns a block subclass for EZP blocks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!Blockly.BlockSvg} The created block.
 */
Blockly.WorkspaceSvg.prototype.newBlock = function(prototypeName, opt_id) {
  if(prototypeName.startsWith('ezp_')) {
    return new EZP.BlockSvg(this, prototypeName, opt_id);
  } else {
    return new Blockly.BlockSvg(this, prototypeName, opt_id);
  };
};

Blockly.Workspace.prototype.logAllConnections = function(comment) {
  comment = comment || '';
  var dbList = this.connectionDBList;
  console.log(comment+'> Blockly.INPUT_VALUE connections');
  var db = dbList[Blockly.INPUT_VALUE];
  for (var _ = 0, c10n; c10n = db[_];++_) {
    console.log(_+':'+[c10n.x_,c10n.y_,c10n.offsetInBlock_,c10n.sourceBlock_.type]);
  }
  console.log(comment+'> Blockly.OUTPUT_VALUE connections');
  var db = dbList[Blockly.OUTPUT_VALUE];
  for (var _ = 0, c10n; c10n = db[_];++_) {
    console.log(_+':'+[c10n.x_,c10n.y_,c10n.offsetInBlock_,c10n.sourceBlock_.type]);
  }
  console.log(comment+'> Blockly.NEXT_STATEMENT connections');
  var db = dbList[Blockly.NEXT_STATEMENT];
  for (var _ = 0, c10n; c10n = db[_];++_) {
    console.log(_+':'+[c10n.x_,c10n.y_,c10n.offsetInBlock_,c10n.sourceBlock_.type]);
  }
  console.log(comment+'> Blockly.PREVIOUS_STATEMENT connections');
  var db = dbList[Blockly.PREVIOUS_STATEMENT];
  for (var _ = 0, c10n; c10n = db[_];++_) {
    console.log(_+':'+[c10n.x_,c10n.y_,c10n.offsetInBlock_,c10n.sourceBlock_.type]);
  }
};
