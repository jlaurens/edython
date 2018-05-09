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

goog.provide('edY.Python.edy:stmt')

goog.require('edY.Python.edy:expr')

Blockly.Python[edY.Const.Stmt.SET] = function (block) {
  var RHS = edY.Python.valueToCode(block, edY.Key.RHS,
    Blockly.Python.ORDER_NONE) || 'None'
  var varName = block.getField(edY.Const.Field.VAR).getText()
  return varName + ' = ' + RHS + '\n'
}

Blockly.Python[edY.Const.Stmt.ANY] = function (block) {
  var STT = block.getField(edY.Const.Field.STT).getText()
  return STT.length ? STT : 'MISSING_STATEMENT' + '\n'
}

Blockly.Python[edY.Const.Stmt.PRINT] = function (block) {
  var code = Blockly.Python[edY.T3.Expr.TUPLE](block)[0]
  var edy = block.edy
  if (edy) {
    var state = edy.getPrintState_(block)
    var l = [code]
    for (var x in state) {
      if (state[x]) {
        var option = edY.Python.valueToCode(block, x, Blockly.Python.ORDER_COLLECTION)
        l.push(x.toLowerCase() + ' = ' + (option.length ? option : 'MISSING_OPTION'))
      }
    }
    code = l.join(', ')
  }
  return 'print(' + code + ')' + '\n'
}

Blockly.Python[edY.Const.Stmt.BCP] = function (block) {
  var BCP = block.getField(edY.Const.Field.BCP).getText()
  return BCP.length ? BCP : 'MISSING_STATEMENT' + '\n'
}

Blockly.Python[edY.Const.Stmt.GNL] = function (block) {
  var code = Blockly.Python[edY.T3.Expr.TUPLE](block)[0]
  var GNL = block.getField(edY.Const.Field.GNL).getText()
  return GNL.length ? GNL + ' ' + code : 'MISSING_STATEMENT' + '\n'
}

Blockly.Python[edY.Const.Stmt.DEL] = function (block) {
  var code = Blockly.Python[edY.T3.Expr.TUPLE](block)[0]
  return 'del ' + code
}

