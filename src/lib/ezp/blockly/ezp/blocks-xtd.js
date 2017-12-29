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
goog.require('ezP.Type')
goog.require('ezP.FieldLabel')
goog.require('ezP.FieldTextInput')
goog.require('ezP.FieldDropdown')
goog.require('ezP.FieldOptionsCode')
goog.require('ezP.FieldVariable')

Blockly.Blocks[ezP.Const.Grp.WITH] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel('with'))
    this.appendValueInput(ezP.Const.Input.XPR)
      .setCheck(ezP.Type.Xpr.Require.any)
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel('as'))
    this.appendValueInput(ezP.Const.Input.VAR)
      .setCheck(ezP.Type.Xpr.Require.any)
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'))
    this.appendStatementInput(ezP.Const.Input.DO).setCheck(ezP.Type.Stt.Check.after_any)
    this.setInputsInline(true)
    this.setPreviousStatement(true)
    this.setNextStatement(true)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
