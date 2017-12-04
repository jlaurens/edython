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

goog.provide('ezP.Blocks.val');

goog.require('Blockly.Block');
goog.require('ezP.Const');
goog.require('ezP.FieldLabel');
goog.require('ezP.FieldTextInput');
goog.require('ezP.FieldDropdown');
goog.require('ezP.FieldOptionsCode');
goog.require('ezP.FieldPrintOptions');
goog.require('ezP.FieldVariable');

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
Blockly.Blocks[ezP.Const.val.ANY] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldTextInput('1+1'), 'VAL');
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
      [['True','True'], ['False','False'], ['None','None']]), 'TFN');
    this.setOutput(true);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.val.OP] = {
  init: function() {
    this.appendValueInput('LHS');
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel(' '))
        .appendField(new ezP.FieldDropdownCode(
      [['+','+'], ['-','-'], ['*','*'], ['**','**'],
      ['/','/'], ['//','//'], ['%','%'], ['&','&'],
      ['|','|'], ['^','^'],
      ['<<','<<'], ['>>','>>']]), 'OP');
    this.appendValueInput('RHS');
    this.setOutput(true);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.val.UNRY] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel(' '))
        .appendField(new ezP.FieldDropdownCode(
      [['not','not'], ['~','~']]), 'OP');
    this.appendValueInput('VAL');
    this.setOutput(true);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.val.BOOL] = {
  init: function() {
    this.appendValueInput('LHS');
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel(' '))
        .appendField(new ezP.FieldDropdownCode(
      [['<','<'], ['>','>'], ['<=','<='], ['>=','>='],
      ['==','=='], ['==','!='], ['===','==='], ['!==','!=='],
      ['and','and'], ['or','or'],
      ['is','is'], ['is not','is not'],
      ['in','in'], ['not in','not in']]), 'BOOL');
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
