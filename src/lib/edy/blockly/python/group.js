/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Generating Python for group blocs.
 * @author jerome.laurensu-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.Python.edy:grp')

goog.require('edY.Python.edy:stmt')

Blockly.Python[edY.Const.Grp.ANY] = function (block) {
  var STT = block.getField(edY.Const.Field.STT).getText()
  var branch = Blockly.Python.statementToCode(block, 'SUITE')
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return STT.length ? STT : 'MISSING_STATEMENT' + ':\n' + branch
}

Blockly.Python[edY.Const.Grp.IF] = function (block) {
  var COND = edY.Python.valueToCode(block, edY.Key.COND,
    Blockly.Python.ORDER_NONE)
  var branch = Blockly.Python.statementToCode(block, 'SUITE')
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return 'if ' + (COND.length ? COND : 'MISSING_CONDITION') + ':\n' + branch
}

Blockly.Python[edY.Const.Grp.ELIF] = function (block) {
  var COND = edY.Python.valueToCode(block, edY.Key.COND,
    Blockly.Python.ORDER_NONE)
  var branch = Blockly.Python.statementToCode(block, 'SUITE')
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return 'elif ' + (COND.length ? COND : 'MISSING_CONDITION') + ':\n' + branch
}

Blockly.Python[edY.Const.Grp.ELSE] = function (block) {
  var branch = Blockly.Python.statementToCode(block, 'SUITE')
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return 'else:\n' + branch
}

Blockly.Python[edY.Const.Grp.WHILE] = function (block) {
  var COND = edY.Python.valueToCode(block, edY.Key.COND,
    Blockly.Python.ORDER_NONE)
  var branch = Blockly.Python.statementToCode(block, 'SUITE')
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return 'while' + (COND.length ? COND : 'MISSING_CONDITION') + ':\n' + branch
}

Blockly.Python[edY.Const.Grp.FOR] = function (block) {
  var target = edY.Python.valueToCode(block, edY.Key.FOR,
    Blockly.Python.ORDER_NONE)
  var list = edY.Python.valueToCode(block, edY.Key.LIST,
    Blockly.Python.ORDER_NONE)
  var branch = Blockly.Python.statementToCode(block, edY.Key.SUITE)
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return 'for ' + (target.length ? target : 'MISSING_TARGET') + ' in ' + (list.length ? list : 'MISSING_LIST') + ':\n' + branch
}
