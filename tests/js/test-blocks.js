/**
 * @license
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blocks for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.TestBlocks');

goog.require('Blockly.Block');

Blockly.Blocks['ezp_val_tuple_xtd'] = {
init: function() {
  this.appendDummyInput().appendField("/");
  this.appendDummyInput().appendField("*");
  this.appendDummyInput().appendField("M");
  this.appendValueInput("ITEM0").setCheck(null);
  this.appendDummyInput().appendField("M");
  this.appendDummyInput().appendField("*/");
  this.setInputsInline(true);
  this.setOutput(true, null);
  this.setColour(230);
  this.setTooltip("");
  this.setHelpUrl("");
}
};
Blockly.Blocks['ezp_val_range'] = {
init: function() {
  this.appendDummyInput().appendField("range(");
  this.appendValueInput("ITEM0").setCheck(null);
  this.appendValueInput("ITEM1").setCheck(null);
  this.appendValueInput("ITEM2").setCheck(null);
  this.appendValueInput("ITEM3").setCheck(null);
  this.appendValueInput("ITEM4").setCheck(null);
  this.appendDummyInput().appendField(")");
  this.setInputsInline(true);
  this.setOutput(true, null);
  this.setColour(230);
  this.setTooltip("");
  this.setHelpUrl("");
}
};
Blockly.Blocks['ezp_val_range_tester1'] = {
init: function() {
  this.appendLabeledInput("group 0: (");
  this.appendTupleInput();
  this.appendTupleInput();
  this.appendTupleInput();
  this.appendLabeledInput(")");
  this.setInputsInline(true);
  this.setOutput(true, null);
  this.setColour(230);
  this.setTooltip("");
  this.setHelpUrl("");
}
};
Blockly.Blocks['ezp_val_range_tester2'] = {
init: function() {
  this.appendLabeledInput("group 0: (");
  this.appendTupleInput();
  this.appendLabeledInput(") group 1: (");
  this.appendTupleInput();
  this.appendTupleInput();
  this.appendLabeledInput(") group 2: (");
  this.appendTupleInput();
  this.appendTupleInput();
  this.appendTupleInput();
  this.appendTupleInput();
  this.appendTupleInput();
  this.appendTupleInput();
  this.appendLabeledInput(")");
  this.setInputsInline(true);
  this.setOutput(true, null);
  this.setColour(230);
  this.setTooltip("");
  this.setHelpUrl("");
}
};
