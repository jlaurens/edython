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
 * @fileoverview utilities for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.FieldTextInput');
goog.provide('ezP.FieldCodeInput');

goog.require('Blockly.FieldTextInput');

/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
ezP.FieldTextInput = function(text, opt_validator) {
  ezP.FieldTextInput.superClass_.constructor.call(this, text,
      opt_validator);
};
goog.inherits(ezP.FieldTextInput, Blockly.FieldTextInput);


/**
 * Install this field on a block.
 */
ezP.FieldTextInput.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  // Build the DOM.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none';
  }

  this.borderRect_ = Blockly.utils.createSvgElement('rect',
  { 'rx': 0,
    'ry': 0,
    'x': 0,
    'y': 0,
    'height':ezP.Font.height},
  this.fieldGroup_, this.sourceBlock_.workspace);

  /** @type {!Element} */
  this.textElement_ = Blockly.utils.createSvgElement('text',
      {'class': 'blocklyText', 'y': ezP.Font.totalAscent},
      this.fieldGroup_);
  this.updateEditable();
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
  this.mouseDownWrapper_ =
  Blockly.bindEventWithChecks_(this.fieldGroup_, 'mousedown', this,
                               this.onMouseDown_);
  // Force a render.
  this.render_();
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
ezP.FieldTextInput.prototype.CURSOR = 'text';

/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} opt_quietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @private
 */
ezP.FieldTextInput.prototype.showEditor_ = function(opt_quietInput) {
  this.workspace_ = this.sourceBlock_.workspace;
  var quietInput = opt_quietInput || false;
  if (!quietInput && (goog.userAgent.MOBILE || goog.userAgent.ANDROID ||
                      goog.userAgent.IPAD)) {
    this.showPromptEditor_();
  } else {
    this.showInlineEditor_(quietInput);
  }
};

/**
 * Create and show a text input editor that is a prompt (usually a popup).
 * Mobile browsers have issues with in-line textareas (focus and keyboards).
 * @private
 */
ezP.FieldTextInput.prototype.showPromptEditor_ = function() {
  var fieldText = this;
  Blockly.prompt(Blockly.Msg.CHANGE_VALUE_TITLE, this.text_,
    function(newValue) {
      if (fieldText.sourceBlock_) {
        newValue = fieldText.callValidator(newValue);
      }
      fieldText.setValue(newValue);
    });
};

/**
 * Create and show a text input editor that sits directly over the text input.
 * @param {boolean} quietInput True if editor should be created without
 *     focus.
 * @private
 */
ezP.FieldTextInput.prototype.showInlineEditor_ = function(quietInput) {
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_());
  var div = Blockly.WidgetDiv.DIV;
  // Create the input.
  var htmlInput =
      goog.dom.createDom(goog.dom.TagName.INPUT, 'blocklyHtmlInput');
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  var fontSize = (ezP.Font.size * this.workspace_.scale) + 'pt';

  div.style.fontSize = fontSize;
  htmlInput.style.fontSize = fontSize;

  div.style.fontFamily = 'DejaVuSansMono';
  htmlInput.style.fontFamily = 'DejaVuSansMono';

  Blockly.FieldTextInput.htmlInput_ = htmlInput;
  div.appendChild(htmlInput);

  htmlInput.value = htmlInput.defaultValue = this.text_;
  htmlInput.oldValue_ = null;
  this.validate_();
  this.resizeEditor_();
  if (!quietInput) {
    htmlInput.focus();
    htmlInput.select();
  }

  this.bindEvents_(htmlInput);
};

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
ezP.FieldTextInput.prototype.widgetDispose_ = function() {
  var thisField = this;
  var superDispose = ezP.FieldTextInput.superClass_.widgetDispose_.call(this);
  return function() {
    superDispose();
    Blockly.WidgetDiv.DIV.style.fontFamily = '';
  };
};

/**
 * Resize the editor and the underlying block to fit the text.
 * @private
 */
Blockly.FieldTextInput.prototype.resizeEditor_ = function() {
  var div = Blockly.WidgetDiv.DIV;
  var bBox = this.fieldGroup_.getBBox();
  div.style.width = bBox.width * this.workspace_.scale + 'px';
  div.style.height = bBox.height * this.workspace_.scale + 'px';
  var xy = this.getAbsoluteXY_();
  div.style.left = (xy.x - ezP.EditorOffset.x) + 'px';
  div.style.top = (xy.y - ezP.EditorOffset.y) + 'px';
};

ezP.FieldCodeInput = function(text, opt_validator) {
  ezP.FieldCodeInput.superClass_.constructor.call(this, text,
      opt_validator);
};
goog.inherits(ezP.FieldCodeInput, ezP.FieldTextInput);

ezP.FieldTextInput.prototype.getSerializedXml = function() {
  var container = ezP.FieldTextInput.superClass_.getSerializedXml.call(this);
  container.setAttribute('value', this.getValue());
  return container;
}

ezP.FieldTextInput.prototype.deserializeXml = function(xml) {
  this.setValue(xml.getAttribute('value') || '');
}
