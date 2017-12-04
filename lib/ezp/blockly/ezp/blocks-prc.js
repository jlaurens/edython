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
 * @fileoverview Blocks for ezPython. Procedures (main and def).
 * Those blocks have no connection.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.Blocks.prc');

goog.require('Blockly.Block');
goog.require('ezP.Const');
goog.require('ezP.FieldLabel');
goog.require('ezP.FieldTextInput');
goog.require('ezP.FieldDropdown');
goog.require('ezP.FieldOptionsCode');
goog.require('ezP.FieldPrintOptions');
goog.require('ezP.FieldVariable');

Blockly.Blocks[ezP.Const.prc.ANY] = {
  init: function() {
    this.appendDummyInput().appendField(new ezP.FieldTextInput(''), 'STT');
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setInputsInline(true);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.Blocks[ezP.Const.prc.MAIN] = Blockly.Blocks[ezP.Const.prc.ANY];

Blockly.Blocks[ezP.Const.prc.DEF] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel('def '))
        .appendField(new ezP.FieldTextInput(''), 'DEF');
    this.appendDummyInput()
        .appendField(new ezP.FieldLabel(':'));
    this.appendStatementInput('DO').setCheck(ezP.Check.stt.after_any);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
