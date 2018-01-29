/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Generating Python for value blocs.
 * @author jerome.laurensu-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Python.ezp_prc')

goog.require('ezP.Python.ezp_grp')

Blockly.Python[ezP.Const.Prc.DEF] = function (block) {
  var DEF = ezP.Python.valueToCode(block, ezP.Const.Field.DEF,
    Blockly.Python.ORDER_NONE)
  var branch = Blockly.Python.statementToCode(block, 'DO')
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return 'def ' + (DEF.length ? DEF : 'MISSING_DEF') + ':\n' + branch
}

Blockly.Python[ezP.Const.Prc.CLASS] = function (block) {
  var CLASS = ezP.Python.valueToCode(block, ezP.Const.Field.CLASS,
    Blockly.Python.ORDER_NONE)
  var NCSTR = ezP.Python.valueToCode(block, ezP.Const.Field.NCSTR,
    Blockly.Python.ORDER_NONE)
  var branch = Blockly.Python.statementToCode(block, 'DO')
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return 'class ' + (CLASS.length ? CLASS : 'MISSING_CLASS') + '(' + (NCSTR.length ? NCSTR : 'MISSING_NCSTR') + '):\n' + branch
}
