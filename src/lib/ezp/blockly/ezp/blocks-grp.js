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
    this.appendStatementInput(ezP.Const.Input.DO).setCheck(ezP.Type.Stmt.Check.after_any)
    this.setInputsInline(true)
    this.setPreviousStatement(true, ezP.Type.Stmt.Check.before_any)
    this.setNextStatement(true, ezP.Type.Stmt.Check.after_any)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
