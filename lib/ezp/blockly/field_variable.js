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


goog.provide('EZP.FieldVariable');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.VariableModel');
goog.require('Blockly.Variables');
goog.require('Blockly.VariableModel');
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
EZP.FieldVariable = function(varname, opt_validator, opt_variableTypes) {
  this.menuGenerator_ = EZP.FieldVariable.dropdownCreate;
  var firstTuple = this.getOptions()[0];

// Call grand parent's constructor.
Blockly.FieldDropdown.superClass_.constructor.call(this, firstTuple? firstTuple[1]: null,
    opt_validator);

  this.setValue(varname || '');
  this.variableTypes = opt_variableTypes;
};
goog.inherits(EZP.FieldVariable, Blockly.FieldDropdown);

EZP.FieldVariable.CSS_CLASS = 'ezp_no_options';

/**
 * Install this dropdown on a block.
 */
EZP.FieldVariable.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  goog.dom.removeNode(this.imageElement_);
  this.imageElement_ = EZP.Style.menuIcon(null, EZP.Font.space);

  EZP.FieldVariable.superClass_.init.call(this);

  this.fieldGroup_.appendChild(this.imageElement_);
  this.textElement_.setAttribute('y',EZP.Font.totalAscent);

  goog.dom.removeNode(this.borderRect_);
  this.borderRect_ = this.textElement_;

  this.arrow_ = undefined;

  // TODO (1010): Change from init/initModel to initView/initModel
  this.initModel();
};


EZP.FieldVariable.prototype.initModel = function() {
  if (!this.getValue()) {
    // Variables without names get uniquely named for this workspace.
    var workspace =
        this.sourceBlock_.isInFlyout ?
            this.sourceBlock_.workspace.targetWorkspace :
            this.sourceBlock_.workspace;
    this.setValue(Blockly.Variables.generateUniqueName(workspace));
  }
  // If the selected variable doesn't exist yet, create it.
  // For instance, some blocks in the toolbox have variable dropdowns filled
  // in by default.
  if (!this.sourceBlock_.isInFlyout) {
    this.sourceBlock_.workspace.createVariable(this.getValue());
  }
};

/**
 * Draws the border with the correct width.
 * @private
 */
EZP.FieldVariable.prototype.render_ = function() {
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
  this.imageElement_.setAttribute('transform','translate('+this.size_.width+',0)');
  this.size_.width += EZP.Font.space;
};


/**
 * Attach this field to a block.
 * @param {!EZP.Block} block The block containing this field.
 */
EZP.FieldVariable.prototype.setSourceBlock = function(block) {
  goog.asserts.assert(!block.isShadow(),
      'Variable fields are not allowed to exist on shadow blocks.');
  EZP.FieldVariable.superClass_.setSourceBlock.call(this, block);
};

/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
EZP.FieldVariable.prototype.getValue = function() {
  return this.getText();
};

/**
 * Set the variable name.
 * @param {string} value New text.
 */
EZP.FieldVariable.prototype.setValue = function(value) {
  var newValue = value;
  var newText = value;

  if (this.sourceBlock_) {
    var variable = this.sourceBlock_.workspace.getVariableById(value);
    if (variable) {
      newText = variable.name;
    }
    // TODO(marisaleung): Remove name lookup after converting all Field Variable
    //     instances to use id instead of name.
    else if (variable = this.sourceBlock_.workspace.getVariable(value)) {
      newValue = variable.getId();
    }
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          this.sourceBlock_, 'field', this.name, this.value_, newValue));
    }
  }
  this.value_ = newValue;
  this.setText(newText);
};

/**
 * Return a list of variable types to include in the dropdown.
 * @return {!Array.<string>} Array of variable types.
 * @throws {Error} if variableTypes is an empty array.
 * @private
 */
EZP.FieldVariable.prototype.getVariableTypes_ = function() {
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

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {EZP.FieldVariable}
 */
EZP.FieldVariable.dropdownCreate = function() {
  var variableModelList = [];
  var name = this.getText();
  // Don't create a new variable if there is nothing selected.
  var createSelectedVariable = name ? true : false;
  var workspace = null;
  if (this.sourceBlock_) {
    workspace = this.sourceBlock_.workspace;
  }
  if (workspace) {
    var variableTypes = this.getVariableTypes_();
    var variableModelList = [];
    // Get a copy of the list, so that adding rename and new variable options
    // doesn't modify the workspace's list.
    for (var i = 0; i < variableTypes.length; i++) {
      var variableType = variableTypes[i];
      var variables = workspace.getVariablesOfType(variableType);
      variableModelList = variableModelList.concat(variables);
    }
    for (var i = 0; i < variableModelList.length; i++){
      if (createSelectedVariable &&
          goog.string.caseInsensitiveEquals(variableModelList[i].name, name)) {
        createSelectedVariable = false;
        break;
      }
    }
  }
  // Ensure that the currently selected variable is an option.
  if (createSelectedVariable && workspace) {
    var newVar = workspace.createVariable(name);
    variableModelList.push(newVar);
  }
  variableModelList.sort(Blockly.VariableModel.compareByName);
  var options = [];
  for (var i = 0; i < variableModelList.length; i++) {
    // Set the uuid as the internal representation of the variable.
    options[i] = [variableModelList[i].name, variableModelList[i].getId()];
  }
  return options;
};

/**
 * Handle the selection of an item in the variable dropdown menu.
 * Special case the 'Rename variable...' and 'Delete variable...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
EZP.FieldVariable.prototype.onItemSelected = function(menu, menuItem) {
  var id = menuItem.getValue();
  // TODO(marisaleung): change setValue() to take in an id as the parameter.
  // Then remove itemText.
  var itemText;
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    var workspace = this.sourceBlock_.workspace;
    var variable = workspace.getVariableById(id);
    // If the item selected is a variable, set itemText to the variable name.
    if (variable) {
      itemText = variable.name;
    }
    else if (id == Blockly.RENAME_VARIABLE_ID) {
      // Rename variable.
      var currentName = this.getText();
      variable = workspace.getVariable(currentName);
      Blockly.Variables.renameVariable(workspace, variable);
      return;
    } else if (id == Blockly.DELETE_VARIABLE_ID) {
      // Delete variable.
      workspace.deleteVariable(this.getText());
      return;
    }

    // Call any validation function, and allow it to override.
    itemText = this.callValidator(itemText);
  }
  if (itemText !== null) {
    this.setValue(itemText);
  }
};

/**
* Create and render the menu widget inside Blockly's widget div.
* @param {!goog.ui.Menu} menu The menu to add to the widget div.
* @private
*/
EZP.FieldVariable.prototype.createWidget_ = function(menu) {
 EZP.FieldVariable.superClass_.createWidget_.call(this, menu);
 Blockly.utils.addClass(menu.getElement(), EZP.FieldVariable.CSS_CLASS);
};

/**
* JL: No check mark.
* @returns {!Object} The bounding rectangle of the anchor, in window
*     coordinates.
* @private
*/
EZP.FieldVariable.prototype.getAnchorDimensions_ = function() {
 var boundingBox = this.getScaledBBox_();
 // if (this.sourceBlock_.RTL) {
 //   boundingBox.right += Blockly.FieldDropdown.CHECKMARK_OVERHANG;
 // } else {
 //   boundingBox.left -= Blockly.FieldDropdown.CHECKMARK_OVERHANG;
 // }
 boundingBox.left -= 2*EZP.Padding.l();
 return boundingBox;
};

EZP.setup.register(function() {
  EZP.Style.insertCssRuleAt('.ezp-variable-name{'+EZP.Font.style+'}');
});


/**
 * Create and populate the menu and menu items for this dropdown, based on
 * the options list.
 * @return {!goog.ui.Menu} The populated dropdown menu.
 * @private
 */
EZP.FieldVariable.prototype.createMenu_ = function() {
  var menu = new goog.ui.Menu();
  menu.setRightToLeft(this.sourceBlock_.RTL);
  var options = this.getOptions();
  var renderer = EZP.VariableMenuItemRenderer.getInstance();
  for (var i = 0; i < options.length; i++) {
    var content = options[i][0]; // Human-readable text or image.
    var value = options[i][1];   // Language-neutral value.
    var menuItem = new goog.ui.MenuItem(content, undefined, undefined, renderer);
    menuItem.setRightToLeft(this.sourceBlock_.RTL);
    menuItem.setValue(value);
    menuItem.setCheckable(false);
    menu.addChild(menuItem, true);
  }
  renderer = EZP.MenuSeparatorRenderer.getInstance();
  menuItem = new goog.ui.Separator(renderer);
  menu.addChild(menuItem, true);
  content = Blockly.Msg.RENAME_VARIABLE;
  value = Blockly.RENAME_VARIABLE_ID;
  renderer = EZP.MenuItemRenderer.getInstance();
  menuItem = new goog.ui.MenuItem(content, undefined, undefined, renderer);
  menuItem.setRightToLeft(this.sourceBlock_.RTL);
  menuItem.setValue(value);
  menuItem.setCheckable(false);
  menu.addChild(menuItem, true);
  var name = this.getText();
  if (name.length && Blockly.Msg.DELETE_VARIABLE) {
    content = Blockly.Msg.DELETE_VARIABLE.replace('%1', name);
    value = Blockly.DELETE_VARIABLE_ID;
    menuItem = new goog.ui.MenuItem(content, undefined, undefined, renderer);
    menuItem.setRightToLeft(this.sourceBlock_.RTL);
    menuItem.setValue(value);
    menuItem.setCheckable(false);
    menu.addChild(menuItem, true);
    var el = menuItem.getContentElement();
    if (el) {
      var match = /(('|"|«)\s*)(%\d+)(\s*(?:\1|»).*$)/.exec(Blockly.Msg.DELETE_VARIABLE);
      if (match[3] == '%1') {
        var text = Blockly.Msg.DELETE_VARIABLE.substring(0,match.index+match[1].length);
        var after = match[4];
        goog.dom.removeChildren(/** @type {!Element} */ (el));
        var node = document.createTextNode(text);
        el.appendChild(node);
        node = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-variable-name');
        el.appendChild(node);
        node.appendChild(document.createTextNode(name));
        el.appendChild(document.createTextNode(match[4]));
      }
    }
  }
  return menu;
};
