/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Blocks for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Blocks.val')

goog.require('Blockly.Block')
goog.require('ezP.Const')
goog.require('ezP.Type')
goog.require('ezP.FieldLabel')
goog.require('ezP.FieldTextInput')
goog.require('ezP.FieldDropdown')
goog.require('ezP.FieldOptionsCode')
goog.require('ezP.FieldVariable')

goog.require('ezP.FieldVariable.Identifier')
goog.require('ezP.FieldVariable.Annotation')
goog.require('ezP.FieldVariable.Default')

var Ks = [
  ezP.Const.Expr.parenth_form,
  ezP.Const.Expr.starred_expression_list,
  ezP.Const.Expr.starred_or_expr,
  ezP.Const.Expr.list_display,
  ezP.Const.Expr.expression_list,
  ezP.Const.Expr.set_display,
  ezP.Const.Expr.dict_display,
  ezP.Const.Expr.comprehension,
  ezP.Const.Expr.generator_expression,
  ezP.Const.Expr.target_list,
  ezP.Const.Expr.yield_atom,
  ezP.Const.Expr.yield_expression,
  ezP.Const.Expr.yield_from,
  ezP.Const.Expr.expression_list,
  ezP.Const.Expr.expression_or_from_list,
  ezP.Const.Expr.starred_list_comprehensive,
  ezP.Const.Expr.non_void_starred_list_comprehensive,
  ezP.Const.Expr.key_datum_concrete,
  ezP.Const.Expr.double_starred_or_expr,
  ezP.Const.Expr.key_datum_list_comprehensive,
  ezP.Const.Expr.comp_for,
  ezP.Const.Expr.comp_if,
  ezP.Const.Expr.comp_iter_list,
  ezP.Const.Expr.generator_expression,
  ezP.Const.Expr.attributeref,
  ezP.Const.Expr.dot_identifier,
  ezP.Const.Expr.slicing,
  ezP.Const.Expr.display_slice_list,
  ezP.Const.Expr.slice_list,
  ezP.Const.Expr.proper_slice,
  ezP.Const.Expr.call,
  ezP.Const.Expr.argument_list,
  ezP.Const.Expr.parameter_list,
  ezP.Const.Expr.await_expr,
  // ezP.Const.Expr.u_expr_concrete,
  // ezP.Const.Expr.m_expr_concrete,
  // ezP.Const.Expr.a_expr_concrete,
  // ezP.Const.Expr.shift_expr_concrete,
  // ezP.Const.Expr.and_expr_concrete,
  ezP.Const.Expr.unary_concrete,
  ezP.Const.Expr.algebra_concrete,
  ezP.Const.Expr.bitwise_concrete,
  ezP.Const.Expr.boolean_concrete,
  ezP.Const.Expr.comparison_concrete,
  ezP.Const.Expr.conditional_expression_concrete,
  ezP.Const.Expr.lambda_expr,
  ezP.Const.Expr.lambda_expr_nocond,
  // IN PROGRESS

]
var O = {
  init: function () {
    this.ezp.initBlock(this)
  }
}
for (var i = 0; i<Ks.length; ++i) {
  var K = Ks[i]
  goog.asserts.assert(K, 'Undefined K: '+i)
  Blockly.Blocks[Ks[i]] = O
}

Blockly.Blocks[ezP.Const.Expr.GET] = {
  init: function () {
    this.ezp.initBlock(this)
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Expr.Provide.get)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Expr.ANY] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldTextInput('1+1'), ezP.Const.Field.ANY)
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Expr.Provide.any)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Expr.TEXT] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel('"'))
      .appendField(new ezP.FieldTextInput(''), ezP.Const.Field.TEXT)
      .appendField(new ezP.FieldLabel('"'))
    this.setInputsInline(true)
    this.setOutput(true, null)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Expr.TFN] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldOptions(
        [['True', 'True'], ['False', 'False'], ['None', 'None']]), ezP.Const.Field.TFN)
    this.setOutput(true)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Expr.OP] = {
  init: function () {
    this.appendValueInput(ezP.Const.Input.LHS)
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel(' '))
      .appendField(new ezP.FieldDropdownCode(
        [['+', '+'], ['-', '-'], ['*', '*'], ['**', '**'],
          ['/', '/'], ['//', '//'], ['%', '%'], ['&', '&'],
          ['|', '|'], ['^', '^'],
          ['<<', '<<'], ['>>', '>>']]), ezP.Const.Field.OP)
    this.appendValueInput(ezP.Const.Input.RHS)
    this.setOutput(true)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Expr.UNRY] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldDropdownCode(
        [['+', '+'], ['-', '-'], ['not', 'not '], ['~', '~']]), 'OP')
    this.appendValueInput(ezP.Const.Input.ANY)
    this.setOutput(true)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Expr.BOOL] = {
  init: function () {
    this.appendValueInput(ezP.Const.Input.LHS)
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel(' '))
      .appendField(new ezP.FieldDropdownCode(
        [['<', '<'], ['>', '>'], ['<=', '<='], ['>=', '>='],
          ['==', '=='], ['!=', '!='], ['===', '==='], ['!==', '!=='],
          ['and', 'and'], ['or', 'or'],
          ['is', 'is'], ['is not', 'is not'],
          ['in', 'in'], ['not in', 'not in']]), ezP.Const.Field.OP)
    this.appendValueInput(ezP.Const.Input.RHS)
    this.setOutput(true)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Expr.TUPLE] = {
  init: function () {
    this.appendValueInput('TUPLE_0_0').setCheck(null)
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Expr.TUPLE)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Expr.star_or_expr] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel('*'))
    this.appendValueInput(ezP.Const.Input.XPR).setCheck(ezP.Type.Expr.Require.or_expr)
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Expr.Provide.star_or_expr)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Expr.RANGE] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel('range'))
      .appendField(new ezP.FieldLabel('('))
    this.appendValueInput('TUPLE_0_0').setCheck(null)
    this.appendDummyInput().appendField(new ezP.FieldLabel(')'))
    this.setInputsInline(true)
    this.setOutput(true, null)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
   