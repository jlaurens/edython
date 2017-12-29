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

goog.provide('ezP.Blocks.grp')

goog.require('Blockly.Block')
goog.require('ezP.Const')
goog.require('ezP.Type')
goog.require('ezP.FieldLabel')
goog.require('ezP.FieldTextInput')
goog.require('ezP.FieldDropdown')
goog.require('ezP.FieldOptionsCode')

Blockly.Blocks[ezP.Const.Grp.ANY] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldCodeInput(''), ezP.Const.Field.STT)
      .appendField(new ezP.FieldLabel(':'), ezP.Const.Field.STT)
    this.appendStatementInput(ezP.Const.Input.DO).setCheck(ezP.Type.Stt.Check.after_any)
    this.setInputsInline(true)
    this.setPreviousStatement(true, ezP.Type.Stt.Check.before_any)
    this.setNextStatement(true, ezP.Type.Stt.Check.after_any)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.Blocks[ezP.Const.Grp.IF] = {
  init: function () {
    this.appendValueInput(ezP.Const.Input.COND).appendField(new ezP.FieldLabel('if'))
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'))
    this.appendStatementInput(ezP.Const.Input.DO).setCheck(ezP.Type.Stt.Check.after_any)
    this.setInputsInline(true)
    this.setPreviousStatement(true, ezP.Type.Stt.Check.before_if)
    this.setNextStatement(true, ezP.Type.Stt.Check.after_if)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.Blocks[ezP.Const.Grp.ELIF] = {
  init: function () {
    this.appendValueInput(ezP.Const.Input.COND).appendField(new ezP.FieldLabel('elif'))
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'))
    this.appendStatementInput(ezP.Const.Input.DO).setCheck(ezP.Type.Stt.Check.after_any)
    this.setInputsInline(true)
    this.setPreviousStatement(true, ezP.Type.Stt.Check.before_elif)
    this.setNextStatement(true, ezP.Type.Stt.Check.after_elif)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.Blocks[ezP.Const.Grp.ELSE] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('else:'))
    this.appendStatementInput(ezP.Const.Input.DO).setCheck(ezP.Type.Stt.Check.after_any)
    this.setInputsInline(true)
    this.setPreviousStatement(true, ezP.Type.Stt.Check.before_else)
    this.setNextStatement(true, ezP.Type.Stt.Check.after_else)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.Blocks[ezP.Const.Grp.WHILE] = {
  init: function () {
    this.appendValueInput(ezP.Const.Input.COND).setCheck(ezP.Type.Xpr.Require.any).appendField(new ezP.FieldLabel('while'))
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'))
    this.appendStatementInput(ezP.Const.Input.DO).setCheck(ezP.Type.Stt.Check.after_any)
    this.setInputsInline(true)
    this.setPreviousStatement(true, ezP.Type.Stt.Check.before_loop)
    this.setNextStatement(true, ezP.Type.Stt.Check.after_loop)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.Blocks[ezP.Const.Grp.FOR] = {
  init: function () {
    this.appendValueInput(ezP.Const.Input.TGT).setCheck(ezP.Type.Xpr.Require.any).appendField(new ezP.FieldLabel('for'))
    this.appendValueInput(ezP.Const.Input.LST).setCheck(ezP.Type.Xpr.Require.any).appendField(new ezP.FieldLabel('in'))
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'))
    this.appendStatementInput(ezP.Const.Input.DO).setCheck(ezP.Type.Stt.Check.after_any)
    this.setInputsInline(true)
    this.setPreviousStatement(true, ezP.Type.Stt.Check.before_loop)
    this.setNextStatement(true, ezP.Type.Stt.Check.after_loop)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
