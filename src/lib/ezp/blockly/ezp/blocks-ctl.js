/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Blocks for ezPython.
 * Control and io.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Blocks.ctl')

goog.require('Blockly.Block')
goog.require('ezP.Const')
goog.require('ezP.FieldLabel')
goog.require('ezP.FieldTextInput')
goog.require('ezP.FieldDropdown')
goog.require('ezP.FieldOptionsCode')
goog.require('ezP.FieldVariable')

Blockly.Blocks[ezP.T3.Stmt.main] = {
  init: function () {
    this.setInputsInline(true)
    this.setPreviousStatement(false)
    this.setNextStatement(true)
    this.setTooltip(ezP.Msg.CONNECT_MAIN_BLOCK_DLG_TOOLTIP)
    this.setHelpUrl('')
  }
}
