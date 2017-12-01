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

goog.provide('ezP.Blocks');

goog.require('Blockly.Block');
goog.require('ezP.Constants');
goog.require('ezP.FieldLabel');
goog.require('ezP.FieldTextInput');
goog.require('ezP.FieldDropdown');
goog.require('ezP.FieldCodeOptions');
goog.require('ezP.FieldPrintOptions');
goog.require('ezP.FieldVariable');

Blockly.Blocks[ezP.Constants.val.ANY] = {
  init: function() {
    this.appendDummyInput()
    .appendField(new ezP.FieldTextInput('1+1'), 'ARG');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Constants.val.TEXT] = {
  init: function() {
    this.appendDummyInput().appendField(new ezP.FieldLabel('"'));
    this.appendDummyInput().appendField(new ezP.FieldTextInput(''), 'TEXT');
    this.appendDummyInput().appendField(new ezP.FieldLabel('"'));
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Constants.val.BOOL] = {
  init: function() {
    this.appendDummyInput()
    .appendField(new ezP.FieldOptions(
      [['True','True'], ['False','False'], ['None','None']]), 'FORTORN');
    this.setOutput(true);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Constants.val.TUPLE] = {
  init: function() {
    this.appendValueInput('TUPLE_0_0').setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Constants.val.RANGE] = {
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

Blockly.Blocks[ezP.Constants.stt.ANY] = {
  init: function() {
    this.appendDummyInput().appendField(new ezP.FieldTextInput(''), 'STT');
    this.setInputsInline(true);
    this.setOutput(false, null);
    this.setPreviousStatement(true, ezP.Check.stt.before_any);
    this.setNextStatement(true, ezP.Check.stt.after_any);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Constants.stt.PRINT] = {
  init: function() {
    this.appendDummyInput().appendField(new ezP.FieldLabel('print'));
    this.appendDummyInput().appendField(new ezP.FieldLabel('('));
    this.appendValueInput('TUPLE_0_0');
    this.appendValueInput('END').appendField(new ezP.FieldLabel(',end ='));
    this.appendValueInput('SEP').appendField(new ezP.FieldLabel(',sep ='));
    this.appendValueInput('FILE').appendField(new ezP.FieldLabel(',file ='));
    this.appendValueInput('FLUSH').appendField(new ezP.FieldLabel(',flush ='));
    this.appendDummyInput().appendField(new ezP.FieldLabel(')'));
    this.appendDummyInput('OPTIONS').appendField(new ezP.FieldPrintOptions([
        ['end = …', ezP.FieldPrintOptions.END],
        ['sep = …', ezP.FieldPrintOptions.SEP],
        ['file = …', ezP.FieldPrintOptions.FILE],
        ['flush = …', ezP.FieldPrintOptions.FLUSH]]));
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_any);
    this.setNextStatement(true, ezP.Check.stt.after_any);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Constants.grp.ANY] = {
  init: function() {
    this.appendDummyInput().appendField(new ezP.FieldTextInput(''), 'STT');
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_any);
    this.setNextStatement(true, ezP.Check.stt.after_any);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Constants.grp.IF] = {
  init: function() {
    this.appendValueInput('TEST').appendField(new ezP.FieldLabel('if'));
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_if);
    this.setNextStatement(true, ezP.Check.stt.after_if);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Constants.grp.ELIF] = {
  init: function() {
    this.appendValueInput('TEST').appendField(new ezP.FieldLabel('elif'));
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_elif);
    this.setNextStatement(true, ezP.Check.stt.after_elif);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Constants.grp.ELSE] = {
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
Blockly.Blocks[ezP.Constants.grp.WHILE] = {
  init: function() {
    this.appendValueInput('TEST').setCheck(ezP.Check.val.require_any).appendField(new ezP.FieldLabel('while'));
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_loop);
    this.setNextStatement(true, ezP.Check.stt.after_loop);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Constants.grp.FOR] = {
  init: function() {
    this.appendValueInput('VAR').setCheck(ezP.Check.val.require_any).appendField(new ezP.FieldLabel('for'));
    this.appendValueInput('SET').setCheck(ezP.Check.val.require_any).appendField(new ezP.FieldLabel('in'));
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_loop);
    this.setNextStatement(true, ezP.Check.stt.after_loop);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Constants.val.GET] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldVariable('item'), 'VAR');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.Blocks[ezP.Constants.stt.SET] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldVariable(), 'VAR');
    this.appendValueInput('VAR')
        .setCheck(null)
        .appendField(new ezP.FieldLabel('='));
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
