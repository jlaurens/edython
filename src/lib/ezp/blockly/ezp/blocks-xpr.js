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

Blockly.Blocks[ezP.Const.Xpr.parenth_form] = {
  init: function () {
    this.ezp.initBlock(this)
  }
}

Blockly.Blocks[ezP.Const.Xpr.list_display] = {
  init: function () {
    this.ezp.initBlock(this)
  }
}

Blockly.Blocks[ezP.Const.Xpr.set_display] = {
  init: function () {
    this.ezp.initBlock(this)
  }
}

Blockly.Blocks[ezP.Const.Xpr.dict_display] = {
  init: function () {
    this.ezp.initBlock(this)
  }
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

Blockly.Blocks[ezP.Const.Xpr.comprehension] = {
  init: function () {
    this.appendValueInput(ezP.Const.Input.XPR)
      .setCheck(ezP.Type.Xpr.Require.expression)
    this.appendValueInput(ezP.Const.Input.TGT)
      .setCheck(ezP.Type.Xpr.Require.target_list)
      .appendField(new ezP.FieldLabel('for'))
    this.appendValueInput(ezP.Const.Input.LST)
      .setCheck(ezP.Type.Xpr.Require.or_test)
      .appendField(new ezP.FieldLabel('in'))
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Xpr.Provide.comprehension)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Xpr.comp_for] = {
  init: function () {
    this.appendValueInput(ezP.Const.Input.TGT)
      .setCheck(ezP.Type.Xpr.Require.any)
      .appendField(new ezP.FieldLabel('for'))
    this.appendValueInput(ezP.Const.Input.LST)
      .setCheck(ezP.Type.Xpr.Require.any)
      .appendField(new ezP.FieldLabel('in'))
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Xpr.Provide.comp_for)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Xpr.comp_if] = {
  init: function () {
    this.appendValueInput(ezP.Const.Input.COND)
      .setCheck(ezP.Type.Xpr.Require.expression_nocond)
      .appendField(new ezP.FieldLabel('if'))
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Xpr.Provide.comp_if)
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
   