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

Blockly.Blocks[ezP.T3.Stmt.main] = {
  init: function () {
    this.setInputsInline(true)
    this.setPreviousStatement(false)
    this.setNextStatement(true)
    this.setTooltip(ezP.Msg.CONNECT_MAIN_BLOCK_DLG_TOOLTIP)
    this.setHelpUrl('')
  }
}
