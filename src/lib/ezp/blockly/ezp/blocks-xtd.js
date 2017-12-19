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

goog.provide('ezP.Blocks.xtd')

goog.require('Blockly.Block')
goog.require('ezP.Const')
goog.require('ezP.FieldLabel')
goog.require('ezP.FieldTextInput')
goog.require('ezP.FieldDropdown')
goog.require('ezP.FieldOptionsCode')
goog.require('ezP.FieldVariable')

Blockly.Blocks[ezP.Const.Grp.WITH] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel('with'))
    this.appendValueInput('STT')
      .setCheck(ezP.Check.val.require_any)
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel('as'))
    this.appendValueInput('VAR')
      .setCheck(ezP.Check.val.require_any)
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'))
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any)
    this.setInputsInline(true)
    this.setPreviousStatement(true)
    this.setNextStatement(true)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
