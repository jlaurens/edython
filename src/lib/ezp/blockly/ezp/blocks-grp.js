/**
 * @license
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blocks for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.Blocks.grp');

goog.require('Blockly.Block');
goog.require('ezP.Const');
goog.require('ezP.FieldLabel');
goog.require('ezP.FieldTextInput');
goog.require('ezP.FieldDropdown');
goog.require('ezP.FieldOptionsCode');
goog.require('ezP.FieldPrintOptions');
goog.require('ezP.FieldVariable');

Blockly.Blocks[ezP.Const.Grp.ANY] = {
  init: function() {
    this.appendDummyInput()
      .appendField(new ezP.FieldCodeInput(''), 'STT')
      .appendField(new ezP.FieldLabel(':'), 'STT');
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_any);
    this.setNextStatement(true, ezP.Check.stt.after_any);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.Grp.IF] = {
  init: function() {
    this.appendValueInput('COND').appendField(new ezP.FieldLabel('if'));
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_if);
    this.setNextStatement(true, ezP.Check.stt.after_if);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.Grp.ELIF] = {
  init: function() {
    this.appendValueInput('COND').appendField(new ezP.FieldLabel('elif'));
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_elif);
    this.setNextStatement(true, ezP.Check.stt.after_elif);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.Grp.ELSE] = {
  init: function() {
    this.appendDummyInput().appendField(new ezP.FieldLabel('else:'));
    this.appendStatementInput("DO").setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_else);
    this.setNextStatement(true, ezP.Check.stt.after_else);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.Blocks[ezP.Const.Grp.WHILE] = {
  init: function() {
    this.appendValueInput('COND').setCheck(ezP.Check.val.require_any).appendField(new ezP.FieldLabel('while'));
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_loop);
    this.setNextStatement(true, ezP.Check.stt.after_loop);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.Grp.FOR] = {
  init: function() {
    this.appendValueInput(ezP.Const.Input.TGT).setCheck(ezP.Check.val.require_any).appendField(new ezP.FieldLabel('for'));
    this.appendValueInput(ezP.Const.Input.LST).setCheck(ezP.Check.val.require_any).appendField(new ezP.FieldLabel('in'));
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput(ezP.Const.Input.DO).setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_loop);
    this.setNextStatement(true, ezP.Check.stt.after_loop);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
