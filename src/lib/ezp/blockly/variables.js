/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Variables extsnions.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name ezP.Variables
 * @namespace
 **/
goog.provide('ezP.Variables')

goog.require('Blockly.Variables')

if (Blockly.Msg.NEW_VARIABLE_TITLE.startsWith('Nouveau')) {
  Blockly.Msg.NEW_VARIABLE_TITLE = 'Nom de la nouvelle variable :'// Blockly issue 1482
}

/**
 * Creates a dummy variable : var_0, var_1, var_2, var_3...
 * @param {!Blockly.Wokspace} workspace where the variable is created.
 */
ezP.Variables.createDummyVariable = function (workspace, type, id) {
  var i = 0
  while (true) {
    var n = 'var_' + i++
    if (!workspace.getVariable(n)) {
      return workspace.createVariable(n, type, id)
    }
  }
}

/**
 * Delete unused variables.
 * @param {!Blockly.Workspace} newVarId Replacement variable.
 */
ezP.Variables.deleteUnusedVariables = function (workspace) {
  var VMs = workspace.getAllVariables()
  var L = []
  for (var _ = 0, VM; (VM = VMs[_++]);) {
    if (!workspace.getVariableUses(VM.name).length) { // disable-eslint no-cond-assign
      L.push(VM)
    }
  }
  if (L.length) {
    Blockly.Events.setGroup(true)
    while ((VM = L.pop())) {
      workspace.deleteVariableInternal_(VM)
    }
    Blockly.Events.setGroup(false)
  }
}

/**
 * Whether there are unused variables.
 * @param {!Blockly.Workspace} workspace.
 */
ezP.Variables.isThereAnUnusedVariable = function (workspace) {
  var VMs = workspace.getAllVariables()
  for (var _ = 0, VM; (VM = VMs[_++]);) {
    if (!workspace.getVariableUses(VM.name).length) {
      return true
    }
  }
  return false
}
