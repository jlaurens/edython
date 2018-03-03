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

goog.provide('ezP.Python.ezp_expr')

goog.require('Blockly.Python')
goog.require('ezP.Const')

Blockly.Python.INDENT = '    '
Blockly.Python.finish = function (code) {
  return code
}

ezP.Python.valueToCode = function (block, name, outerOrder) {
  var code = Blockly.Python.valueToCode(block, name, outerOrder)
  if (code.slice(0, 1) === '(' && code.slice(-1) === ')') {
    var sub = code.slice(1, code.length - 1)
    if (!sub.match(/[+\-*/%@<>&|^~=!()[]{},:;@ ]/g)) {
      return sub
    }
  }
  return code
}

Blockly.Python[ezP.Const.Expr.GET] = function (block) {
  var code = block.getField(ezP.Const.Field.VAR).getText()
  return [code, Blockly.Python.ORDER_ATOMIC]
}

Blockly.Python[ezP.Const.Expr.ANY] = function (block) {
  var code = block.getFieldValue(ezP.Const.Field.ANY)
  return [code, Blockly.Python.ORDER_NONE]
}

Blockly.Python[ezP.Const.Expr.TEXT] = function (block) {
  var code = Blockly.Python.quote_(block.getFieldValue(ezP.Const.Field.TEXT))
  return [code, Blockly.Python.ORDER_ATOMIC]
}

Blockly.Python[ezP.Const.Expr.TFN] = function (block) {
  var code = block.getFieldValue(ezP.Const.Field.TFN)
  return [code, Blockly.Python.ORDER_ATOMIC]
}

Blockly.Python[ezP.Const.Expr.OP] = function (block) {
  var op = block.getFieldValue(ezP.Const.Field.OP)
  var order = ezP.Op.Binary.getOrder(op)
  var lhs = ezP.Python.valueToCode(block, ezP.Const.Input.LHS,
    order || Blockly.Python.ORDER_ATOMIC) || 'MISSING_LHS'
  var rhs = ezP.Python.valueToCode(block, ezP.Const.Input.RHS,
    order || Blockly.Python.ORDER_ATOMIC) || 'MISSING_RHS'
  return [lhs + ezP.Op.Binary.displayOp(op) + rhs, order || Blockly.Python.ORDER_NONE]
}

Blockly.Python[ezP.Const.Expr.UNRY] = function (block) {
  var op = block.getFieldValue(ezP.Const.Field.OP)
  var order = ezP.Op.Unary.getOrder(op)
  var any = ezP.Python.valueToCode(block, ezP.Const.Input.ANY,
    order || Blockly.Python.ORDER_NONE) || 'MISSING_ANY'
  return [ezP.Op.Unary.displayOp(op) + any, order]
}

Blockly.Python[ezP.Const.Expr.BOOL] = Blockly.Python[ezP.Const.Expr.OP]

Blockly.Python[ezP.Const.Expr.RANGE] = function (block) {
  var code = Blockly.Python[ezP.Const.Expr.TUPLE](block)
  return ['range(' + code[0] + ')', Blockly.Python.ORDER_FUNCTION_CALL]
}
