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
 * @fileoverview Non-editable text field for hard coded python code.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('EZP.FieldLabel');

goog.require('Blockly.FieldLabel');
goog.require('EZP.Block');


/**
 * Class for a non-editable field.
 * The only purpose is to start with a different height.
 * @param {string} text The initial content of the field.
 * @param {string=} opt_class Optional CSS class for the field's text.
 * @extends {Blockly.Field}
 * @constructor
 */
EZP.FieldLabel = function(text, opt_class) {
  EZP.FieldLabel.superClass_.constructor.call(this, text, opt_class);
  this.size_ = new goog.math.Size(0, EZP.Font.height);
};
goog.inherits(EZP.FieldLabel, Blockly.FieldLabel);

/**
 * Install this text on a block.
 */
EZP.FieldLabel.prototype.init = function() {
  if (this.textElement_) {
    // Text has already been initialized once.
    return;
  }
  // Build the DOM.
  this.textElement_ = Blockly.utils.createSvgElement('text',
                                                     {'class': 'blocklyText', 'y': EZP.Font.totalAscent}, null);
  if (this.class_) {
    Blockly.utils.addClass(this.textElement_, this.class_);
  }
  if (!this.visible_) {
    this.textElement_.style.display = 'none';
  }
  this.sourceBlock_.getSvgRoot().appendChild(this.textElement_);

  // Configure the field to be transparent with respect to tooltips.
  this.textElement_.tooltip = this.sourceBlock_;
  Blockly.Tooltip.bindMouseEvents(this.textElement_);
  // Force a render.
  this.render_();
};

/**
 * Shortcut for appending a dummy input with one label field.
 * @param {string=} opt_name Language-neutral identifier which may used to find
 *     this input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
EZP.Block.prototype.appendLabeledInput = function(label) {
  return this.appendInput_(Blockly.DUMMY_INPUT,'_').appendField(new EZP.FieldLabel(label));
};

/**
 * Updates the width of the field. This calls getCachedWidth which won't cache
 * the approximated width on IE/Edge when `getComputedTextLength` fails. Once
 * it eventually does succeed, the result will be cached.
 **/
Blockly.Field.prototype.updateWidth = function() {
  var width = Blockly.Field.getCachedWidth(this.textElement_);
  if (this.borderRect_) {
    this.borderRect_.setAttribute('width',width);
  }
  this.size_.width = width;
};
