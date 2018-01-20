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
  ezP.Const.Xpr.parenth_form,
  ezP.Const.Xpr.starred_expression_list,
  ezP.Const.Xpr.starred_or_expr,
  ezP.Const.Xpr.list_display,
  ezP.Const.Xpr.expression_list,
  ezP.Const.Xpr.set_display,
  ezP.Const.Xpr.dict_display,
  ezP.Const.Xpr.comprehension,
  ezP.Const.Xpr.generator_expression,
  ezP.Const.Xpr.target_list,
  ezP.Const.Xpr.yield_atom,
  ezP.Const.Xpr.yield_expression,
  ezP.Const.Xpr.yield_from,
  ezP.Const.Xpr.expression_list,
  ezP.Const.Xpr.expression_or_from_list,
  ezP.Const.Xpr.starred_list_comprehensive,
  ezP.Const.Xpr.non_void_starred_list_comprehensive,
  ezP.Const.Xpr.key_datum_concrete,
  ezP.Const.Xpr.double_starred_or_expr,
  ezP.Const.Xpr.key_datum_list_comprehensive,
  ezP.Const.Xpr.comp_for,
  ezP.Const.Xpr.comp_if,
  ezP.Const.Xpr.comp_iter_list,
  ezP.Const.Xpr.generator_expression,
  ezP.Const.Xpr.attributeref,
  ezP.Const.Xpr.dot_identifier,
  ezP.Const.Xpr.slicing,
  ezP.Const.Xpr.display_slice_list,
  ezP.Const.Xpr.slice_list,
  ezP.Const.Xpr.proper_slice,
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

Blockly.Blocks[ezP.Const.Xpr.GET] = {
  init: function () {
    this.ezp.initBlock(this)
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Xpr.Provide.get)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Xpr.ANY] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldTextInput('1+1'), ezP.Const.Field.ANY)
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Xpr.Provide.any)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Xpr.TEXT] = {
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

Blockly.Blocks[ezP.Const.Xpr.TFN] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldOptions(
        [['True', 'True'], ['False', 'False'], ['None', 'None']]), ezP.Const.Field.TFN)
    this.setOutput(true)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Xpr.OP] = {
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

Blockly.Blocks[ezP.Const.Xpr.UNRY] = {
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

Blockly.Blocks[ezP.Const.Xpr.BOOL] = {
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

Blockly.Blocks[ezP.Const.Xpr.TUPLE] = {
  init: function () {
    this.appendValueInput('TUPLE_0_0').setCheck(null)
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Xpr.TUPLE)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Xpr.star_or_expr] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel('*'))
    this.appendValueInput(ezP.Const.Input.XPR).setCheck(ezP.Type.Xpr.Require.or_expr)
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Xpr.Provide.star_or_expr)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Xpr.RANGE] = {
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
Blockly.Blocks[ezP.Const.Xpr.parameter_list] = {
  init: function () {
    this.ezp.initBlock(this)
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Xpr.Provide.parameter_list)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
   