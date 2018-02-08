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

goog.provide('ezP.Blocks.stmt')

goog.require('ezP.T3')
goog.require('ezP.T3.All')
goog.require('ezP.Const')
goog.require('Blockly.Blocks')

for (var i = 0; i < ezP.T3.All.part_statements.length; ++i) {
  var t = ezP.T3.All.part_statements[i]
  Blockly.Blocks[t] = {}
}

for (var i = 0; i < ezP.T3.All.simple_statements.length; ++i) {
  var t = ezP.T3.All.simple_statements[i]
  Blockly.Blocks[t] = {}
}

for (var i = 0; i < ezP.T3.All.compound_statements.length; ++i) {
  var t = ezP.T3.All.compound_statements[i]
  Blockly.Blocks[t] = {}
}



goog.require('Blockly.Block')
goog.require('ezP.Const')
goog.require('ezP.Type')
goog.require('ezP.FieldLabel')
goog.require('ezP.FieldTextInput')
goog.require('ezP.FieldDropdown')
goog.require('ezP.FieldOptionsCode')
goog.require('ezP.FieldVariable')

Blockly.Blocks[ezP.Const.Stmt.SET] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldVariable(), ezP.Const.Field.VAR)
      .appendField(new ezP.FieldLabel('='))
    this.appendValueInput('RHS')
      .setCheck(null)
    this.setInputsInline(true)
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.Blocks[ezP.Const.Stmt.ANY] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldCodeInput(''), 'STT')
    this.setInputsInline(true)
    this.setOutput(false, null)
    this.setPreviousStatement(true, ezP.Type.Stmt.Check.before_any)
    this.setNextStatement(true, ezP.Type.Stmt.Check.after_any)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.Blocks[ezP.Const.Stmt.PRINT] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel('print'))
      .appendField(new ezP.FieldLabel('('))
    this.appendValueInput('TUPLE_0_0')
    this.appendValueInput(ezP.Const.Input.END).appendField(new ezP.FieldLabel(', end ='))
    this.appendValueInput(ezP.Const.Input.SEP).appendField(new ezP.FieldLabel(', sep ='))
    this.appendValueInput(ezP.Const.Input.FILE).appendField(new ezP.FieldLabel(', file ='))
    this.appendValueInput(ezP.Const.Input.FLUSH).appendField(new ezP.FieldLabel(', flush ='))
    this.appendDummyInput().appendField(new ezP.FieldLabel(')'))
    this.setInputsInline(true)
    this.setPreviousStatement(true, ezP.Type.Stmt.Check.before_any)
    this.setNextStatement(true, ezP.Type.Stmt.Check.after_any)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Stmt.BCP] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldOptions(
        [['break', 'break'], ['continue', 'continue'], ['pass', 'pass']]), ezP.Const.Field.BCP)
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Stmt.GNL] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldOptions(
        [['global', 'global'], ['nonlocal', 'nonlocal']]), ezP.Const.Field.GNL)
    this.appendValueInput('TUPLE_0_0')
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.Const.Stmt.DEL] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel('del'))
    this.appendValueInput('TUPLE_0_0')
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
