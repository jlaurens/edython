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
 * @fileoverview Variable input field for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.FieldVariable');

goog.require('Blockly.Field');
goog.require('Blockly.VariableModel');
goog.require('ezP.FieldTextInput');

goog.require('ezP.Style');
goog.require('ezP.Variables');
goog.require('ezP.Variables.Menu');
goog.require('ezP.Msg');

goog.require('goog.asserts');
goog.require('goog.string');

/**
 * Class for a variable's dropdown field.
 * @param {?string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @param {Array.<string>} opt_variableTypes A list of the types of variables to
 *     include in the dropdown.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
ezP.FieldVariable = function(varname, opt_validator, opt_variableTypes) {
  ezP.FieldVariable.superClass_.constructor.call(this, varname, opt_validator, opt_variableTypes);
};
goog.inherits(ezP.FieldVariable, Blockly.FieldVariable);

ezP.FieldVariable.CSS_CLASS = 'ezp_no_options';

/**
 * Install this dropdown on a block.
 */
ezP.FieldVariable.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  // Build the DOM.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none';
  }
  /** @type {!Element} */
  this.textElement_ = Blockly.utils.createSvgElement('text',
      {'class': 'ezp-code', 'y': ezP.Font.totalAscent},
      this.fieldGroup_);

  this.menuIcon_ = ezP.Style.MenuIcon(this.fieldGroup_);

  this.mouseDownWrapper_ =
      Blockly.bindEventWithChecks_(this.menuIcon_, 'mousedown', this,
      this.onMouseDown_);

  this.borderRect_ = this.textElement_;

  this.updateEditable();

  // TODO (1010): Change from init/initModel to initView/initModel
  this.initModel();
  // Force a render.
  //this.render_();
};

ezP.FieldVariable.prototype.initModel = function() {
  if (!this.getText()) {
    // Variables without names get uniquely named for this workspace.
    var workspace =
        this.sourceBlock_.isInFlyout ?
            this.sourceBlock_.workspace.targetWorkspace :
            this.sourceBlock_.workspace;
    this.setValue(Blockly.Variables.generateUniqueName(workspace));
  } else if (!this.getValue() && !this.sourceBlock_.isInFlyout) {
    var value = this.getText();
    var VM = this.sourceBlock_.workspace.getVariableById(value) ||
      this.sourceBlock_.workspace.getVariable(value) ||
        this.sourceBlock_.workspace.createVariable(value);
    this.ezp_varId_ = VM.getId();
  }
};

/**
 * Draws the border with the correct width.
 * @private
 */
ezP.FieldVariable.prototype.render_ = function() {
  if (!this.visible_) {
    this.size_.width = 0;
    return;
  }
  goog.dom.removeChildren(/** @type {!Element} */ (this.textElement_));
  var textNode = document.createTextNode(this.getDisplayText_());
  this.textElement_.appendChild(textNode);
  this.textElement_.setAttribute('text-anchor', 'start');
  this.textElement_.setAttribute('x', 0);
  this.size_.width = Blockly.Field.getCachedWidth(this.textElement_);
  this.menuIcon_.setAttribute('transform','translate('+this.size_.width+',0)');
  this.size_.width += ezP.Font.space;
};

/**
 * The value is a variable id, the text is its name.
 * @return {string} Current value.
 */
ezP.FieldVariable.prototype.getValue = function() {
  return this.ezp_varId_;
};

/**
 * Set the variable model.
 * The variable Id is used as the neutral value, the variable name.
 * @param {string} value New variable id.
 */
ezP.FieldVariable.prototype.setValue = function(value) {
  if (!value) {
    return;
  }
  if (this.isEditingVariableName_) {
    this.setText(value);
    return;
  }
  var newText = value;
  if (this.sourceBlock_) {
    var VM = this.sourceBlock_.workspace.getVariableById(value) ||
        this.sourceBlock_.workspace.getVariable(value) ||
          this.sourceBlock_.workspace.createVariable(value);
    if (VM) {
      if (Blockly.Events.isEnabled()) {
        Blockly.Events.fire(new Blockly.Events.BlockChange(
            this.sourceBlock_, 'field', this.name, this.ezp_varId_, VM.getId()));
      }
      this.ezp_varId_ = VM.getId();
      newText = VM.name;
    }
  }
  this.setText(newText);
};

/**
 * Return a list of variable types to include in the dropdown.
 * @return {!Array.<string>} Array of variable types.
 * @throws {Error} if variableTypes is an empty array.
 * @private
 */
ezP.FieldVariable.prototype.getVariableTypes_ = function() {
  var variableTypes = this.variableTypes;
  if (variableTypes === null) {
    // If variableTypes is null, return all variable types.
    if (this.sourceBlock_) {
      var workspace = this.sourceBlock_.workspace;
      return workspace.getVariableTypes();
    }
  }
  variableTypes = variableTypes || [''];
  if (variableTypes.length == 0) {
    // Throw an error if variableTypes is an empty list.
    var name = this.getText();
    throw new Error('\'variableTypes\' of field variable ' +
      name + ' was an empty list');
  }
  return variableTypes;
};

ezP.setup.register(function() {
  ezP.Style.insertCssRuleAt('.ezp-variable-name{'+ezP.Font.style+'}');
});

/**
 * Create a dropdown menu under the text.
 * @private
 */
ezP.FieldVariable.prototype.showEditor_ = function() {
  var menu = this.sourceBlock_.workspace.ezp.menuVariable.updateWithListener(this);
  var bbox = this.getScaledBBox_();
  // TODO: change that dimensions
  menu.showMenu(this.menuIcon_,bbox.left-12+1+4,bbox.bottom+4);
};

/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} opt_quietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @private
 */
ezP.FieldVariable.prototype.showVarNameEditor = function(opt_quietInput) {
  this.workspace_ = this.sourceBlock_.workspace;
  var quietInput = opt_quietInput || false;
  if (!quietInput && (goog.userAgent.MOBILE || goog.userAgent.ANDROID ||
                      goog.userAgent.IPAD)) {
    this.showVarNamePromptEditor_();
  } else {
    this.isEditingVariableName_ = true;
    this.showVarNameInlineEditor_(quietInput);
  }
};

/**
 * Create and show a text input editor that is a prompt (usually a popup).
 * Mobile browsers have issues with in-line textareas (focus and keyboards).
 * @private
 */
ezP.FieldVariable.prototype.showVarNamePromptEditor_ = function() {
  var fieldText = this;
  var prompt = ezP.Msg.RENAME_VARIABLE_TITLE.replace('%1', this.text_);
  Blockly.prompt(prompt, this.text_,
    function(newValue) {
      if (fieldText.sourceBlock_) {
        newValue = fieldText.callValidator(newValue);
      }
      fieldText.setValue(newValue);
    });
};

/**
 * Called when focusing away from the text field.
 * @param {string} newText The new variable name.
 * @private
 * @this ezP.FieldVariable
 */
ezP.FieldVariable.prototype.onFinishEditing_ = function(newText) {
  this.isEditingVariableName_ = false;
  var workspace = this.sourceBlock_.workspace;
  var VM = workspace.getVariable(newText);
  if (VM) {
    this.setText(VM.name);
  } else {
    workspace.renameVariableById(this.getValue(),newText);
  }
}

/**
 * Create and show a text input editor that sits directly over the text input.
 * @param {boolean} quietInput True if editor should be created without
 *     focus.
 * @private
 */
ezP.FieldVariable.prototype.showVarNameInlineEditor_ =
  ezP.FieldTextInput.prototype.showInlineEditor_;

/**
 * Validates a change.  Does nothing.  Subclasses may override this.
 * @param {string} text The user's text.
 * @return {string} No change needed.
 */
ezP.FieldVariable.prototype.classValidator = function(text) {
  return text;
};

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @private
 */
ezP.FieldVariable.prototype.validate_ = function() {
  var valid = true;
  goog.asserts.assertObject(Blockly.FieldTextInput.htmlInput_);
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  if (this.sourceBlock_) {
    valid = this.callValidator(htmlInput.value);
  }
  if (valid === null) {
    Blockly.utils.addClass(htmlInput, 'blocklyInvalidInput');
  } else {
    Blockly.utils.removeClass(htmlInput, 'blocklyInvalidInput');
  }
};

ezP.FieldVariable.prototype.maybeSaveEdit_ = function() {
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  // Save the edit (if it validates).
  var text = htmlInput.value;
  if (this.sourceBlock_) {
    var text1 = this.callValidator(text);
    if (text1 === null) {
      // Invalid edit.
      text = htmlInput.defaultValue;
    } else {
      // Validation function has changed the text.
      text = text1;
      if (this.onFinishEditing_) {
        this.onFinishEditing_(text);
      }
    }
  }
  this.setText(text);
  this.sourceBlock_.rendered && this.sourceBlock_.render();
};

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
 ezP.FieldVariable.prototype.widgetDispose_ =
   Blockly.FieldTextInput.prototype.widgetDispose_;

/**
 * Resize the editor and the underlying block to fit the text.
 * @private
 */
ezP.FieldVariable.prototype.resizeEditor_ =
  ezP.FieldTextInput.prototype.resizeEditor_

/**
 * Bind handlers for user input on this field and size changes on the workspace.
 * @param {!HTMLInputElement} htmlInput The htmlInput created in showEditor, to
 *     which event handlers will be bound.
 * @private
 */
ezP.FieldVariable.prototype.bindEvents_ =
  Blockly.FieldTextInput.prototype.bindEvents_;

/**
 * Unbind handlers for user input and workspace size changes.
 * @param {!HTMLInputElement} htmlInput The html for this text input.
 * @private
 */
ezP.FieldVariable.prototype.unbindEvents_ =
  Blockly.FieldTextInput.prototype.unbindEvents_;

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
 ezP.FieldVariable.prototype.onHtmlInputKeyDown_ =
   Blockly.FieldTextInput.prototype.onHtmlInputKeyDown_;

/**
 * Handle a change to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
 ezP.FieldVariable.prototype.onHtmlInputChange_ =
   Blockly.FieldTextInput.prototype.onHtmlInputChange_;

/**
 * The enclosing block has been selected.
 */
ezP.FieldVariable.prototype.addSelect = function() {
  if (this.menuIcon_) {
    Blockly.utils.addClass(this.menuIcon_,'ezp-selected');
  }
};

/**
 * The enclosing block has been deselected.
 */
ezP.FieldVariable.prototype.removeSelect = function() {
  if (this.menuIcon_) {
    Blockly.utils.removeClass(this.menuIcon_,'ezp-selected');
  }
};

ezP.FieldVariable.prototype.getSerializedXml = function() {
  var container = goog.dom.createDom('field', null, this.getText());
  container.setAttribute('name', this.name);
  return container;
  var variable = this.sourceBlock_.workspace.getVariableById(this.getValue());
  if (variable) {
    container.setAttribute('id', variable.getId());
    container.setAttribute('variableType', variable.type);
  }
  return container;
}

ezP.FieldVariable.prototype.deserializeXml = function(xml) {
  // TODO (marisaleung): When we change setValue and getValue to
  // interact with id's instead of names, update this so that we get
  // the variable based on id instead of textContent.
  if (this.sourceBlock_.isInFlyout) {
    this.setValue(xml.textContent);
    return;
  }
  var type = xml.getAttribute('variableType') || '';
  var workspace = this.sourceBlock_.workspace;
  var id = xml.getAttribute('id');
  var variable = workspace.getVariableById(id);
  if (!variable) {
    var name = xml.textContent;
    variable = workspace.getVariable(name);
    if (!variable) {
      variable = name.length?
        workspace.createVariable(name, type, id):
        ezP.Variables.createDummyVariable(workspace, type,id);
      this.setValue(variable.getId());
      return;
    }
  }
  if (typeof(type) !== undefined && type !== null) {
    if (type !== variable.type) {
      throw Error('Serialized variable type with id \'' +
        variable.getId() + '\' had type ' + variable.type + ', and ' +
        'does not match variable field that references it: ' +
        Blockly.Xml.domToText(xml) + '.');
    }
  }
  this.setValue(variable.getId());
}
