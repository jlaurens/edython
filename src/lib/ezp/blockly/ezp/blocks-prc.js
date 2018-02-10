/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Blocks for ezPython. Procedures (main and def).
 * Those blocks have no connection.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Blocks.prc')

goog.require('ezP.DelegateSvg.Group')

// Blockly.Blocks[ezP.Const.Prc.ANY] = {
//   init: function () {
//     this.appendDummyInput().appendField(new ezP.FieldTextInput(''), 'STT')
//     this.appendStatementInput('DO').setCheck(ezP.Type.Stmt.Check.after_any)
//     this.setInputsInline(true)
//     this.setTooltip('')
//     this.setHelpUrl('')
//   }
// }
// Blockly.Blocks[ezP.Const.Prc.MAIN] = Blockly.Blocks[ezP.Const.Prc.ANY]

// Blockly.Blocks[ezP.Const.Prc.DEF] = {
//   init: function () {
//     this.appendDummyInput()
//       .appendField(new ezP.FieldLabel('def '))
//       .appendField(new ezP.FieldTextInput(''), ezP.Const.Field.DEF)
//     this.appendDummyInput()
//       .appendField(new ezP.FieldLabel(':'))
//     this.appendStatementInput('DO').setCheck(ezP.Type.Stmt.Check.after_any)
//     this.setTooltip('')
//     this.setHelpUrl('')
//   }
// }

// Blockly.Blocks[ezP.Const.Prc.CLASS] = {
//   init: function () {
//     this.appendDummyInput()
//       .appendField(new ezP.FieldLabel('def '))
//       .appendField(new ezP.FieldTextInput(''), ezP.Const.Field.CLASS)
//     this.appendDummyInput()
//       .appendField(new ezP.FieldLabel('('))
//       .appendField(new ezP.FieldTextInput(''), ezP.Const.Field.NCSTR)
//       .appendField(new ezP.FieldLabel(')'))
//     this.appendDummyInput()
//       .appendField(new ezP.FieldLabel(':'))
//     this.appendStatementInput('DO').setCheck(ezP.Type.Stmt.Check.after_any)
//     this.setTooltip('')
//     this.setHelpUrl('')
//   }
// }
