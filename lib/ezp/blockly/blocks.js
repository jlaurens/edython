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

goog.provide('EZP.Blocks');

goog.require('Blockly.Block');
goog.require('EZP.Constants');
goog.require('EZP.FieldLabel');
goog.require('EZP.FieldTextInput');
goog.require('EZP.FieldDropdown');
goog.require('EZP.PrintFieldDropdown');
goog.require('EZP.FieldVariable');

Blockly.Blocks[EZP.Constants.val.ANY] = {
  init: function() {
    this.appendDummyInput()
    .appendField(new EZP.FieldTextInput('1+1'), 'ARG');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[EZP.Constants.val.TEXT] = {
  init: function() {
    this.appendDummyInput().appendField(new EZP.FieldLabel('"'));
    this.appendDummyInput().appendField(new EZP.FieldTextInput(''), 'TEXT');
    this.appendDummyInput().appendField(new EZP.FieldLabel('"'));
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[EZP.Constants.val.BOOL] = {
  init: function() {
    this.appendDummyInput()
    .appendField(new EZP.FieldDropdown([['True','TRUE'], ['False','FALSE']]), 'YORN');
    this.setOutput(true, EZP.Constants.bool.type);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[EZP.Constants.val.TUPLE] = {
  init: function() {
    this.appendValueInput('TUPLE_0_0').setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[EZP.Constants.val.RANGE] = {
  init: function() {
    this.appendDummyInput().appendField('range(');
    this.appendValueInput('TUPLE_0_0').setCheck(null);
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};

Blockly.Blocks[EZP.Constants.stt.ANY] = {
  init: function() {
    this.appendDummyInput().appendField(new EZP.FieldTextInput(''), 'STT');
    this.setInputsInline(true);
    this.setOutput(false, null);
    this.setPreviousStatement(true, EZP.Check.stt.before_any);
    this.setNextStatement(true, EZP.Check.stt.after_any);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[EZP.Constants.stt.PRINT] = {
  init: function() {
    this.appendDummyInput().appendField(new EZP.FieldLabel('print'));
    this.appendDummyInput().appendField(new EZP.FieldLabel('('));
    this.appendValueInput('TUPLE_0_0');
    this.appendValueInput('END').appendField(new EZP.FieldLabel(',end = '));
    this.appendValueInput('SEP').appendField(new EZP.FieldLabel(',sep = '));
    this.appendValueInput('FILE').appendField(new EZP.FieldLabel(',file = '));
    this.appendDummyInput().appendField(new EZP.FieldLabel(')'));
    this.appendDummyInput('OPTIONS').appendField(new EZP.PrintFieldDropdown([
        ['end = ...', EZP.PrintFieldDropdown.END],
        ['sep = ...', EZP.PrintFieldDropdown.SEP],
        ['file = ...', EZP.PrintFieldDropdown.FILE]]));
    this.setInputsInline(true);
    this.setPreviousStatement(true, EZP.Check.stt.before_any);
    this.setNextStatement(true, EZP.Check.stt.after_any);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[EZP.Constants.grp.ANY] = {
  init: function() {
    this.appendDummyInput().appendField(new EZP.FieldTextInput(''), 'STT');
    this.appendStatementInput('DO').setCheck(EZP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, EZP.Check.stt.before_any);
    this.setNextStatement(true, EZP.Check.stt.after_any);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[EZP.Constants.grp.IF] = {
  init: function() {
    this.appendValueInput('TEST').appendField(new EZP.FieldLabel('if'));
    this.appendDummyInput().appendField(new EZP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(EZP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, EZP.Check.stt.before_if);
    this.setNextStatement(true, EZP.Check.stt.after_if);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[EZP.Constants.grp.ELIF] = {
  init: function() {
    this.appendValueInput('TEST').appendField(new EZP.FieldLabel('elif'));
    this.appendDummyInput().appendField(new EZP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(EZP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, EZP.Check.stt.before_elif);
    this.setNextStatement(true, EZP.Check.stt.after_elif);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[EZP.Constants.grp.ELSE] = {
  init: function() {
    this.appendDummyInput().appendField(new EZP.FieldLabel('else:'));
    this.appendStatementInput("DO").setCheck(EZP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, EZP.Check.stt.before_else);
    this.setNextStatement(true, EZP.Check.stt.after_else);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.Blocks[EZP.Constants.grp.WHILE] = {
  init: function() {
    this.appendValueInput('TEST').setCheck(EZP.Check.val.require_any).appendField(new EZP.FieldLabel('while'));
    this.appendDummyInput().appendField(new EZP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(EZP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, EZP.Check.stt.before_loop);
    this.setNextStatement(true, EZP.Check.stt.after_loop);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[EZP.Constants.grp.FOR] = {
  init: function() {
    this.appendValueInput('VAR').setCheck(EZP.Check.val.require_any).appendField(new EZP.FieldLabel('for'));
    this.appendValueInput('SET').setCheck(EZP.Check.val.require_any).appendField(new EZP.FieldLabel('in'));
    this.appendDummyInput().appendField(new EZP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(EZP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, EZP.Check.stt.before_loop);
    this.setNextStatement(true, EZP.Check.stt.after_loop);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[EZP.Constants.val.GET] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new EZP.FieldVariable('item'), 'VAR');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.Blocks[EZP.Constants.stt.SET] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new EZP.FieldVariable(), 'VAR');
    this.appendValueInput('VAR')
        .setCheck(null)
        .appendField(new EZP.FieldLabel('='));
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
