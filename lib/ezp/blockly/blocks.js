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
goog.require('ezP.Const');
goog.require('ezP.FieldLabel');
goog.require('ezP.FieldTextInput');
goog.require('ezP.FieldDropdown');
goog.require('ezP.FieldOptionsCode');
goog.require('ezP.FieldPrintOptions');
goog.require('ezP.FieldVariable');

Blockly.Blocks[ezP.Const.val.ANY] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldTextInput('1+1'), 'ARG');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.val.TEXT] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel('"'))
        .appendField(new ezP.FieldTextInput(''), 'TEXT')
        .appendField(new ezP.FieldLabel('"'));
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.val.TFN] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldOptions(
      [['True','True'], ['False','False'], ['Node','None']]), 'TFN');
    this.setOutput(true);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.val.CMPR] = {
  init: function() {
    this.appendValueInput('LHS');
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel(' '))
        .appendField(new ezP.FieldDropdownCode(
      [['<','<'], ['>','>'], ['<=','<='], ['>=',' >='],
      ['==','=='], ['==','!='], ['===','==='], ['!==','!==']]), 'CMPR');
    this.appendValueInput('RHS');
    this.setOutput(true);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.val.TUPLE] = {
  init: function() {
    this.appendValueInput('TUPLE_0_0').setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.val.RANGE] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel('range'))
        .appendField(new ezP.FieldLabel('('));
    this.appendValueInput('TUPLE_0_0').setCheck(null);
    this.appendDummyInput().appendField(new ezP.FieldLabel(')'));
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};

Blockly.Blocks[ezP.Const.stt.ANY] = {
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
Blockly.Blocks[ezP.Const.stt.PRINT] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel('print'))
        .appendField(new ezP.FieldLabel('('));
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
Blockly.Blocks[ezP.Const.grp.ANY] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldTextInput(''), 'STT');
    this.appendStatementInput('DO')
        .setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_any);
    this.setNextStatement(true, ezP.Check.stt.after_any);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.grp.IF] = {
  init: function() {
    this.appendDummyInput().appendField(new ezP.FieldLabel('if'));
    this.appendValueInput('TEST');
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_if);
    this.setNextStatement(true, ezP.Check.stt.after_if);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.grp.ELIF] = {
  init: function() {
    this.appendDummyInput().appendField(new ezP.FieldLabel('elif'));
    this.appendValueInput('TEST');
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_elif);
    this.setNextStatement(true, ezP.Check.stt.after_elif);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.grp.ELSE] = {
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
Blockly.Blocks[ezP.Const.grp.WHILE] = {
  init: function() {
    this.appendDummyInput().appendField(new ezP.FieldLabel('while'));
    this.appendValueInput('TEST').setCheck(ezP.Check.val.require_any);
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_loop);
    this.setNextStatement(true, ezP.Check.stt.after_loop);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.grp.FOR] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel('for'));
    this.appendValueInput('VAR')
        .setCheck(ezP.Check.val.require_any);
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel('in'));
    this.appendValueInput('SET')
        .setCheck(ezP.Check.val.require_any);
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_loop);
    this.setNextStatement(true, ezP.Check.stt.after_loop);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.val.GET] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldVariable('item'), 'VAR');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.Blocks[ezP.Const.stt.SET] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldVariable(), 'VAR')
        .appendField(new ezP.FieldLabel('='));
    this.appendValueInput('VAR')
        .setCheck(null)
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.Blocks[ezP.Const.stt.BCP] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldOptions(
      [['break','break'], ['continue','continue'], ['pass','pass']]), 'BCP');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
