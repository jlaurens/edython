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
 * @fileoverview Variables extsnions.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

/**
 * @name ezP.Variables
 * @namespace
 **/
goog.provide('ezP.Variables');

goog.require('Blockly.Variables');

if (Blockly.Msg.NEW_VARIABLE_TITLE.startsWith("Nouveau")) {
  Blockly.Msg.NEW_VARIABLE_TITLE = "Nom de la nouvelle variable :";//Blockly issue 1482
};

/**
 * Creates a dummy variable : var_0, var_1, var_2, var_3...
 * @param {!Blockly.Wokspace} workspace where the valriable is created.
 */
ezP.Variables.createDummyVariable = function(workspace, type, id) {
  var i = 0;
  while(true) {
    var n = 'var_'+i++;
    if (!workspace.getVariable(n)) {
      return workspace.createVariable(n, type, id);
    }
  }
}

/**
 * Delete unused variables.
 * @param {!Blockly.Workspace} newVarId Replacement variable.
 */
ezP.Variables.deleteUnusedVariables = function(workspace) {
  var VMs = workspace.getAllVariables();
  var L = [];
  for (var _ = 0, VM; VM = VMs[_++];) {
    if(!workspace.getVariableUses(VM.name).length) {
      L.push(VM);
    }
  }
  if (L.length) {
    Blockly.Events.setGroup(true);
    while((VM = L.pop())) {
      workspace.deleteVariableInternal_(VM);
    }
    Blockly.Events.setGroup(false);
  }
};

/**
 * Whether there are unused variables.
 * @param {!Blockly.Workspace} workspace.
 */
ezP.Variables.isThereAnUnusedVariable = function(workspace) {
  var VMs = workspace.getAllVariables();
  for (var _ = 0, VM; VM = VMs[_++];) {
    if(!workspace.getVariableUses(VM.name).length) {
      return true;
    }
  }
  return false;
};
