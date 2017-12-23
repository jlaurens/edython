/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Generating Python for statement blocs.
 * @author jerome.laurensu-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Python.ezp_stt')

goog.require('ezP.Python.ezp_val')

Blockly.Python[ezP.Const.Stt.SET] = function (block) {
  var RHS = ezP.Python.valueToCode(block, ezP.Const.Input.RHS,
    Blockly.Python.ORDER_NONE) || 'None'
  var varName = block.getField(ezP.Const.Field.VAR).getText()
  return varName + ' = ' + RHS + '\n'
}

Blockly.Python[ezP.Const.Stt.ANY] = function (block) {
  var STT = block.getField(ezP.Const.Field.STT).getText()
  return STT.length ? STT : 'MISSING_STATEMENT' + '\n'
}

Blockly.Python[ezP.Const.Stt.PRINT] = function (block) {
  var code = Blockly.Python[ezP.Const.Val.TUPLE](block)[0]
  var ezp = block.ezp
  if (ezp) {
    var state = ezp.getPrintState_(block)
    var l = [code]
    for (var x in state) {
      if (state[x]) {
        var option = ezP.Python.valueToCode(block, x, Blockly.Python.ORDER_COLLECTION)
        l.push(x.toLowerCase() + ' = ' + (option.length ? option : 'MISSING_OPTION'))
      }
    }
    code = l.join(', ')
  }
  return 'print(' + code + ')' + '\n'
}

Blockly.Python[ezP.Const.Stt.BCP] = function (block) {
  var BCP = block.getField(ezP.Const.Field.BCP).getText()
  return BCP.length ? BCP : 'MISSING_STATEMENT' + '\n'
}
