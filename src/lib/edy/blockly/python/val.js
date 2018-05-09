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

goog.provide('edY.Python.edy:expr')

goog.require('Blockly.Python')
goog.require('edY.Const')

Blockly.Python.INDENT = '    '
Blockly.Python.finish = function (code) {
  return code
}

edY.Python.valueToCode = function (block, name, outerOrder) {
  var code = Blockly.Python.valueToCode(block, name, outerOrder)
  if (code.slice(0, 1) === '(' && code.slice(-1) === ')') {
    var sub = code.slice(1, code.length - 1)
    if (!sub.match(/[+\-*/%@<>&|^~=!()[]{},:;@ ]/g)) {
      return sub
    }
  }
  return code
}

Blockly.Python[edY.Const.Expr.GET] = function (block) {
  var code = block.getField(edY.Const.Field.VAR).getText()
  return [code, Blockly.Python.ORDER_ATOMIC]
}

Blockly.Python[edY.Const.Expr.ANY] = function (block) {
  var code = block.getFieldValue(edY.Const.Field.ANY)
  return [code, Blockly.Python.ORDER_NONE]
}

Blockly.Python[edY.Const.Expr.TEXT] = function (block) {
  var code = Blockly.Python.quote_(block.getFieldValue(edY.Const.Field.TEXT))
  return [code, Blockly.Python.ORDER_ATOMIC]
}

Blockly.Python[edY.Const.Expr.TFN] = function (block) {
  var code = block.getFieldValue(edY.Const.Field.TFN)
  return [code, Blockly.Python.ORDER_ATOMIC]
}

Blockly.Python[edY.Const.Expr.OP] = function (block) {
  var op = block.getFieldValue(edY.Const.Field.OP)
  var order = edY.Op.Binary.getOrder(op)
  var lhs = edY.Python.valueToCode(block, edY.Key.LHS,
    order || Blockly.Python.ORDER_ATOMIC) || 'MISSING_LHS'
  var rhs = edY.Python.valueToCode(block, edY.Key.RHS,
    order || Blockly.Python.ORDER_ATOMIC) || 'MISSING_RHS'
  return [lhs + edY.Op.Binary.displayOp(op) + rhs, order || Blockly.Python.ORDER_NONE]
}

Blockly.Python[edY.Const.Expr.UNRY] = function (block) {
  var op = block.getFieldValue(edY.Const.Field.OP)
  var order = edY.Op.Unary.getOrder(op)
  var any = edY.Python.valueToCode(block, edY.Key.ANY,
    order || Blockly.Python.ORDER_NONE) || 'MISSING_ANY'
  return [edY.Op.Unary.displayOp(op) + any, order]
}

Blockly.Python[edY.Const.Expr.BOOL] = Blockly.Python[edY.Const.Expr.OP]

Blockly.Python[edY.Const.Expr.RANGE] = function (block) {
  var code = Blockly.Python[edY.Const.Expr.TUPLE](block)
  return ['range(' + code[0] + ')', Blockly.Python.ORDER_FUNCTION_CALL]
}
