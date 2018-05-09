/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Generating Python for value blocs.
 * @author jerome.laurensu-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.Python.edy:prc')

goog.require('edY.Python.edy:grp')

Blockly.Python[edY.Const.Prc.DEF] = function (block) {
  var DEF = edY.Python.valueToCode(block, edY.Const.Field.DEF,
    Blockly.Python.ORDER_NONE)
  var branch = Blockly.Python.statementToCode(block, 'SUITE')
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return 'def ' + (DEF.length ? DEF : 'MISSING_DEF') + ':\n' + branch
}

Blockly.Python[edY.Const.Prc.CLASS] = function (block) {
  var CLASS = edY.Python.valueToCode(block, edY.Const.Field.CLASS,
    Blockly.Python.ORDER_NONE)
  var NCSTR = edY.Python.valueToCode(block, edY.Const.Field.NCSTR,
    Blockly.Python.ORDER_NONE)
  var branch = Blockly.Python.statementToCode(block, 'SUITE')
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return 'class ' + (CLASS.length ? CLASS : 'MISSING_CLASS') + '(' + (NCSTR.length ? NCSTR : 'MISSING_NCSTR') + '):\n' + branch
}
