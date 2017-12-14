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

goog.provide('ezP.Blocks.xtd');

goog.require('Blockly.Block');
goog.require('ezP.Const');
goog.require('ezP.FieldLabel');
goog.require('ezP.FieldTextInput');
goog.require('ezP.FieldDropdown');
goog.require('ezP.FieldOptionsCode');
goog.require('ezP.FieldVariable');

Blockly.Blocks[ezP.Const.Grp.WITH] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel('with'));
    this.appendValueInput('STT')
        .setCheck(ezP.Check.val.require_any);
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel('as'));
    this.appendValueInput('VAR')
        .setCheck(ezP.Check.val.require_any);
    this.appendDummyInput().appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
