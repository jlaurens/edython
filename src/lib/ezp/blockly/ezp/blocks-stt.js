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

goog.provide('ezP.Blocks.stt');

goog.require('Blockly.Block');
goog.require('ezP.Const');
goog.require('ezP.FieldLabel');
goog.require('ezP.FieldTextInput');
goog.require('ezP.FieldDropdown');
goog.require('ezP.FieldOptionsCode');
goog.require('ezP.FieldPrintOptions');
goog.require('ezP.FieldVariable');

Blockly.Blocks[ezP.Const.Stt.SET] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldVariable(), ezP.Const.Field.VAR)
        .appendField(new ezP.FieldLabel('='));
    this.appendValueInput('RHS')
        .setCheck(null)
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.Blocks[ezP.Const.Stt.ANY] = {
  init: function() {
    this.appendDummyInput().appendField(new ezP.FieldCodeInput(''), 'STT');
    this.setInputsInline(true);
    this.setOutput(false, null);
    this.setPreviousStatement(true, ezP.Check.stt.before_any);
    this.setNextStatement(true, ezP.Check.stt.after_any);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.Stt.PRINT] = {
  init: function() {
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel('print'))
      .appendField(new ezP.FieldLabel('('));
    this.appendValueInput('TUPLE_0_0');
    this.appendValueInput(ezP.Const.Input.END).appendField(new ezP.FieldLabel(', end ='));
    this.appendValueInput(ezP.Const.Input.SEP).appendField(new ezP.FieldLabel(', sep ='));
    this.appendValueInput(ezP.Const.Input.FILE).appendField(new ezP.FieldLabel(', file ='));
    this.appendValueInput(ezP.Const.Input.FLUSH).appendField(new ezP.FieldLabel(', flush ='));
    this.appendDummyInput().appendField(new ezP.FieldLabel(')'));
    this.appendDummyInput(ezP.Const.Input.OPTIONS).appendField(new ezP.FieldPrintOptions([
        ['end = …', ezP.Const.Input.END],
        ['sep = …', ezP.Const.Input.SEP],
        ['file = …', ezP.Const.Input.FILE],
        ['flush = …', ezP.Const.Input.FLUSH]]));
    this.setInputsInline(true);
    this.setPreviousStatement(true, ezP.Check.stt.before_any);
    this.setNextStatement(true, ezP.Check.stt.after_any);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};

Blockly.Blocks[ezP.Const.Stt.BCP] = {
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
