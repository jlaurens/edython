/**
 * edython
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

goog.provide('eYo.Python.eyo:prc')

goog.require('eYo.Python.eyo:grp')

Blockly.Python[eYo.Const.Prc.DEF] = function (block) {
  var DEF = eYo.Python.valueToCode(block, eYo.Const.Field.DEF,
    Blockly.Python.ORDER_NONE)
  var branch = Blockly.Python.statementToCode(block, 'SUITE')
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return 'def ' + (DEF.length ? DEF : 'MISSING_DEF') + ':\n' + branch
}

Blockly.Python[eYo.Const.Prc.CLASS] = function (block) {
  var CLASS = eYo.Python.valueToCode(block, eYo.Const.Field.CLASS,
    Blockly.Python.ORDER_NONE)
  var NCSTR = eYo.Python.valueToCode(block, eYo.Const.Field.NCSTR,
    Blockly.Python.ORDER_NONE)
  var branch = Blockly.Python.statementToCode(block, 'SUITE')
  if (!branch.length) {
    branch = Blockly.Python.leftLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT)
  }
  return 'class ' + (CLASS.length ? CLASS : 'MISSING_CLASS') + '(' + (NCSTR.length ? NCSTR : 'MISSING_NCSTR') + '):\n' + branch
}
