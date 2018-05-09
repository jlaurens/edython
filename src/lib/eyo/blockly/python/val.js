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

goog.provide('eYo.Python.eyo:expr')

goog.require('Blockly.Python')
goog.require('eYo.Const')

Blockly.Python.INDENT = '    '
Blockly.Python.finish = function (code) {
  return code
}

eYo.Python.valueToCode = function (block, name, outerOrder) {
  var code = Blockly.Python.valueToCode(block, name, outerOrder)
  if (code.slice(0, 1) === '(' && code.slice(-1) === ')') {
    var sub = code.slice(1, code.length - 1)
    if (!sub.match(/[+\-*/%@<>&|^~=!()[]{},:;@ ]/g)) {
      return sub
    }
  }
  return code
}

Blockly.Python[eYo.Const.Expr.GET] = function (block) {
  var code = block.getField(eYo.Const.Field.VAR).getText()
  return [code, Blockly.Python.ORDER_ATOMIC]
}

Blockly.Python[eYo.Const.Expr.ANY] = function (block) {
  var code = block.getFieldValue(eYo.Const.Field.ANY)
  return [code, Blockly.Python.ORDER_NONE]
}

Blockly.Python[eYo.Const.Expr.TEXT] = function (block) {
  var code = Blockly.Python.quote_(block.getFieldValue(eYo.Const.Field.TEXT))
  return [code, Blockly.Python.ORDER_ATOMIC]
}

Blockly.Python[eYo.Const.Expr.TFN] = function (block) {
  var code = block.getFieldValue(eYo.Const.Field.TFN)
  return [code, Blockly.Python.ORDER_ATOMIC]
}

Blockly.Python[eYo.Const.Expr.OP] = function (block) {
  var op = block.getFieldValue(eYo.Const.Field.OP)
  var order = eYo.Op.Binary.getOrder(op)
  var lhs = eYo.Python.valueToCode(block, eYo.Key.LHS,
    order || Blockly.Python.ORDER_ATOMIC) || 'MISSING_LHS'
  var rhs = eYo.Python.valueToCode(block, eYo.Key.RHS,
    order || Blockly.Python.ORDER_ATOMIC) || 'MISSING_RHS'
  return [lhs + eYo.Op.Binary.displayOp(op) + rhs, order || Blockly.Python.ORDER_NONE]
}

Blockly.Python[eYo.Const.Expr.UNRY] = function (block) {
  var op = block.getFieldValue(eYo.Const.Field.OP)
  var order = eYo.Op.Unary.getOrder(op)
  var any = eYo.Python.valueToCode(block, eYo.Key.ANY,
    order || Blockly.Python.ORDER_NONE) || 'MISSING_ANY'
  return [eYo.Op.Unary.displayOp(op) + any, order]
}

Blockly.Python[eYo.Const.Expr.BOOL] = Blockly.Python[eYo.Const.Expr.OP]

Blockly.Python[eYo.Const.Expr.RANGE] = function (block) {
  var code = Blockly.Python[eYo.Const.Expr.TUPLE](block)
  return ['range(' + code[0] + ')', Blockly.Python.ORDER_FUNCTION_CALL]
}
