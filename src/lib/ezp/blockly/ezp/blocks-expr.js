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

goog.require('Blockly.Blocks')
goog.require('ezP.T3.All')

for (var i = 0; i < ezP.T3.All.core_expressions.length; ++i) {
  var t = ezP.T3.All.core_expressions[i]
  Blockly.Blocks[t] = {}
}

for (var i = 0; i < ezP.T3.All.lists.length; ++i) {
  var t = ezP.T3.All.lists[i]
  Blockly.Blocks[t] = {}
}

for (var i = 0; i < ezP.T3.All.wrappers.length; ++i) {
  var t = ezP.T3.All.wrappers[i]
  Blockly.Blocks[t] = {}
}

// What is below will be removed quite soon

Blockly.Blocks[ezP.T3.Expr.ANY] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldTextInput('1+1'), ezP.Const.Field.ANY)
    this.setInputsInline(true)
    this.setOutput(true, ezP.Type.Expr.Provide.any)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}

Blockly.Blocks[ezP.T3.Expr.TFN] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new ezP.FieldOptions(
        [['True', 'True'], ['False', 'False'], ['None', 'None']]), ezP.Const.Field.TFN)
    this.setOutput(true)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
