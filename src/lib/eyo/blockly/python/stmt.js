/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Generating Python for statement blocs.
 * @author jerome.laurensu-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Python.eyo:stmt')

goog.require('eYo.Python.eyo:expr')

Blockly.Python[eYo.Const.Stmt.SET] = function (block) {
  var RHS = eYo.Python.valueToCode(block, eYo.Key.RHS,
    Blockly.Python.ORDER_NONE) || 'None'
  var varName = block.getField(eYo.Const.Field.VAR).getText()
  return varName + ' = ' + RHS + '\n'
}

Blockly.Python[eYo.Const.Stmt.ANY] = function (block) {
  var STT = block.getField(eYo.Const.Field.STT).getText()
  return STT.length ? STT : 'MISSING_STATEMENT' + '\n'
}

Blockly.Python[eYo.Const.Stmt.PRINT] = function (block) {
  var code = Blockly.Python[eYo.T3.Expr.TUPLE](block)[0]
  var eyo = block.eyo
  if (eyo) {
    var state = eyo.getPrintState_(block)
    var l = [code]
    for (var x in state) {
      if (state[x]) {
        var option = eYo.Python.valueToCode(block, x, Blockly.Python.ORDER_COLLECTION)
        l.push(x.toLowerCase() + ' = ' + (option.length ? option : 'MISSING_OPTION'))
      }
    }
    code = l.join(', ')
  }
  return 'print(' + code + ')' + '\n'
}

Blockly.Python[eYo.Const.Stmt.BCP] = function (block) {
  var BCP = block.getField(eYo.Const.Field.BCP).getText()
  return BCP.length ? BCP : 'MISSING_STATEMENT' + '\n'
}

Blockly.Python[eYo.Const.Stmt.GNL] = function (block) {
  var code = Blockly.Python[eYo.T3.Expr.TUPLE](block)[0]
  var GNL = block.getField(eYo.Const.Field.GNL).getText()
  return GNL.length ? GNL + ' ' + code : 'MISSING_STATEMENT' + '\n'
}

Blockly.Python[eYo.Const.Stmt.DEL] = function (block) {
  var code = Blockly.Python[eYo.T3.Expr.TUPLE](block)[0]
  return 'del ' + code
}

