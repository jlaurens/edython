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
 * @fileoverview Block for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.Block');
goog.require('Blockly.Block');
goog.require('ezP');
goog.forwardDeclare('ezP.Delegate');

goog.provide('ezP.Delegate');

/**
 * Class for a block.
 * Not normally called directly, workspace.newBlock() is preferred.
 * For ezPython.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.Block = function(workspace, prototypeName, opt_id)  {
  if (!this.ezp) {
    this.ezp = ezP.Delegate.Manager.create(prototypeName);
    this.registerDisposable(this.ezp);
  }
  ezP.Block.superClass_.constructor.call(this, workspace, prototypeName, opt_id);
  if (this.ezp) {
    this.ezp.init(this);
  }
};
goog.inherits(ezP.Block, Blockly.Block);

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value, or #RRGGBB string.
 */
ezP.Block.prototype.setColour = function(colour) {
  var hue = Number(colour);
  if (!isNaN(hue) && 0 <= hue && hue <= 360) {
    this.hue_ = hue;
    if (this.ezp) {
      this.colour_ = ezP.hueToRgb(hue);
    } else {
      this.colour_ = Blockly.hueToRgb(hue);
    }
  } else if (goog.isString(colour) && colour.match(/^#[0-9a-fA-F]{6}$/)) {
    this.colour_ = colour;
    // Only store hue if colour is set as a hue
    this.hue_ = null;
  } else {
    throw 'Invalid colour: ' + colour;
  }
};

/**
 * Interpolate a message description onto the block.
 * @param {string} message Text contains interpolation tokens (%1, %2, ...)
 *     that match with fields or inputs defined in the args array.
 * @param {!Array} args Array of arguments to be interpolated.
 * @param {string=} lastDummyAlign If a dummy input is added at the end,
 *     how should it be aligned?
 * @private
 */
ezP.Block.prototype.interpolate_ = function(message, args, lastDummyAlign) {
  var tokens = Blockly.utils.tokenizeInterpolation(message);
  // Interpolate the arguments.  Build a list of elements.
  var indexDup = [];
  var indexCount = 0;
  var elements = [];
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (typeof token == 'number') {
      if (token <= 0 || token > args.length) {
        throw new Error('Block \"' + this.type + '\": ' +
                        'Message index %' + token + ' out of range.');
      }
      if (indexDup[token]) {
        throw new Error('Block \"' + this.type + '\": ' +
                        'Message index %' + token + ' duplicated.');
      }
      indexDup[token] = true;
      indexCount++;
      elements.push(args[token - 1]);
    } else {
      token = token.trim();
      if (token) {
        elements.push(token);
      }
    }
  }
  if(indexCount != args.length) {
    throw new Error('Block \"' + this.type + '\": ' +
                    'Message does not reference all ' + args.length + ' arg(s).');
  }
  // Add last dummy input if needed.
  if (elements.length && (typeof elements[elements.length - 1] == 'string' ||
                          goog.string.startsWith(elements[elements.length - 1]['type'],
                                                 'field_'))) {
                            var dummyInput = {type: 'input_dummy'};
                            if (lastDummyAlign) {
                              dummyInput['align'] = lastDummyAlign;
                            }
                            elements.push(dummyInput);
                          }
  // Lookup of alignment constants.
  var alignmentLookup = {
    'LEFT': Blockly.ALIGN_LEFT,
    'RIGHT': Blockly.ALIGN_RIGHT,
    'CENTRE': Blockly.ALIGN_CENTRE
  };
  // Populate block with inputs and fields.
  var fieldStack = [];
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (typeof element == 'string') {
      fieldStack.push([element, undefined]);
    } else {
      var field = null;
      var input = null;
      do {
        var altRepeat = false;
        if (typeof element == 'string') {
          field = new ezP.FieldLabel(element);
        } else {
          switch (element['type']) {
            case 'input_value':
              input = this.appendValueInput(element['name']);
              break;
            case 'input_statement':
              input = this.appendStatementInput(element['name']);
              break;
            case 'input_dummy':
              input = this.appendDummyInput(element['name']);
              break;
            case 'field_label':
              field = Blockly.Block.newFieldLabelFromJson_(element);
              break;
            case 'field_input':
              field = ezP.Block.newFieldTextInputFromJson_(element);
              break;
            case 'field_angle':
              field = new Blockly.FieldAngle(element['angle']);
              break;
            case 'field_checkbox':
              field = new Blockly.FieldCheckbox(
                                                element['checked'] ? 'TRUE' : 'FALSE');
              break;
            case 'field_colour':
              field = new Blockly.FieldColour(element['colour']);
              break;
            case 'field_variable':
              field = Blockly.Block.newFieldVariableFromJson_(element);
              break;
            case 'field_dropdown':
              field = new Blockly.FieldDropdown(element['options']);
              break;
            case 'field_image':
              field = Blockly.Block.newFieldImageFromJson_(element);
              break;
            case 'field_number':
              field = new Blockly.FieldNumber(element['value'],
                                              element['min'], element['max'], element['precision']);
              break;
            case 'field_date':
              if (Blockly.FieldDate) {
                field = new Blockly.FieldDate(element['date']);
                break;
              }
              // Fall through if FieldDate is not compiled in.
            default:
              // Unknown field.
              if (element['alt']) {
                element = element['alt'];
                altRepeat = true;
              }
          }
        }
      } while (altRepeat);
      if (field) {
        fieldStack.push([field, element['name']]);
      } else if (input) {
        if (element['check']) {
          input.setCheck(element['check']);
        }
        if (element['align']) {
          input.setAlign(alignmentLookup[element['align']]);
        }
        for (var j = 0; j < fieldStack.length; j++) {
          input.appendField(fieldStack[j][0], fieldStack[j][1]);
        }
        fieldStack.length = 0;
      }
    }
  }
};

/**
 * Helper function to construct a FieldTextInput from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @returns {!Blockly.FieldTextInput} The new text input.
 * @private
 */
ezP.Block.newFieldTextInputFromJson_ = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  var field = new ezP.FieldTextInput(text, options['class']);
  if (typeof options['spellcheck'] == 'boolean') {
    field.setSpellcheck(options['spellcheck']);
  }
  return field;
};

/**
 * Append a tuple item value input row.
 * @return {!Blockly.Input} The input object created.
 */
ezP.Block.prototype.tupleConsolidateEZP_ = function() {
  if (this.ezp) {
    this.ezp.tupleConsolidate(block);
  }
}

/**
 * Add a value input, statement input or local variable to this block.
 * @param {number} type Either Blockly.INPUT_VALUE or Blockly.NEXT_STATEMENT or
 *     Blockly.DUMMY_INPUT.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 * @private
 * @override
 */
ezP.Block.prototype.appendInput_ = function(type, name) {
  var input = ezP.Block.superClass_.appendInput_.call(this,type,name);
  if (type == Blockly.INPUT_VALUE && name.match(/^(?:TUPLE|S7R)_\d+_\d+$/g)) {
    input.ezpTuple = input.ezpTuple || {};
  }
  return input;
};

/**
 * The default implementation forwards to super then
 * lets the delegate handle special cases.
 * @param {boolean} hidden True if connections are hidden.
 * @override
 */
ezP.Block.prototype.setConnectionsHidden = function(hidden) {
  ezP.Block.superClass_.setConnectionsHidden.call(this,hidden);
  this.ezp.setConnectionsHidden(this,hidden);
};

/**
 * Return all variables referenced by this block.
 * This is not exactly Blockly's implementation,
 * only FieldVariable's are considered.
 * @return {!Array.<string>} List of variable names.
 */
ezP.Block.prototype.getVars = function() {
  var vars = [];
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof ezP.FieldVariable) {
        vars.push(field.getText());
      }
    }
  }
  return vars;
};

/**
 * Notification that a variable is renaming.
 * If the name matches one of this block's variables, rename it.
 * @param {string} oldName Previous name of variable.
 * @param {string} newName Renamed variable.
 */
ezP.Block.prototype.renameVar = function(oldName, newName) {
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof ezP.FieldVariable &&
          Blockly.Names.equals(oldName, field.getText())) {
        field.setText(newName);
      }
    }
  }
};

/**
 * Notification of a variable replacement.
 * If the id matches one of this block's variables, replace it.
 * @param {string} oldVarId Previous variable.
 * @param {string} newVarId Replacement variable.
 */
ezP.Block.prototype.replaceVarId = function(oldVarId, newVarId) {
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof ezP.FieldVariable &&
          Blockly.Names.equals(oldVarId, field.getValue())) {
        field.setValue(newVarId);
      }
    }
  }
};
