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
 * @fileoverview Dropdown print field for options.
 * Implements menu UI for sep=, end=, file=...
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.FieldCodeOptions');

/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 * @extends {Blockly.Field}
 * @constructor
 */

ezP.FieldCodeOptions = function(menuGenerator, opt_validator) {
  ezP.FieldCodeOptions.superClass_.constructor.call(this, menuGenerator, opt_validator);
  this.imageJson_ = null;
};
goog.inherits(ezP.FieldCodeOptions, Blockly.FieldDropdown);

ezP.FieldCodeOptions.CSS_CLASS = 'ezp_code_options';

/**
 * Install this dropdown on a block.
 * @override
 */
ezP.FieldCodeOptions.prototype.init = function() {
  ezP.FieldCodeOptions.superClass_.init.call(this);
  this.arrow_ = null;
  this.imageElement_ = ezP.Style.menuIcon(this.fieldGroup_, this.size_.width);
};

ezP.FieldCodeOptions.CSS_MENU_CLASS = 'ezp_code_options-menu';
ezP.Style.insertCssRuleAt('.'+ezP.FieldCodeOptions.CSS_MENU_CLASS+'{\n'+ezP.Font.style+';\n}\n');

/**
* Create and populate the menu and menu items for this dropdown, based on
* the options list.
* @return {!goog.ui.Menu} The populated dropdown menu.
* @private
*/
ezP.FieldCodeOptions.prototype.createMenu_ = function() {
  var renderer = goog.ui.ContainerRenderer.getCustomRenderer(
      goog.ui.MenuRenderer, ezP.FieldCodeOptions.CSS_MENU_CLASS);
  var menu = new goog.ui.Menu(null,renderer);
  menu.setRightToLeft(this.sourceBlock_.RTL);
  var options = this.getOptions();
  for (var i = 0; i < options.length; i++) {
    var content = options[i][0]; // Human-readable text or image.
    var value = options[i][1];   // Language-neutral value.
    var menuItem = new ezP.MenuItem(content);
    menuItem.setRightToLeft(this.sourceBlock_.RTL);
    menuItem.setValue(value);
    menuItem.setCheckable(false);
    menu.addChild(menuItem, true);
  }
  return menu;
};

/**
* Create and render the menu widget inside Blockly's widget div.
* @param {!goog.ui.Menu} menu The menu to add to the widget div.
* @private
*/
ezP.FieldCodeOptions.prototype.createWidget_ = function(menu) {
  ezP.FieldCodeOptions.superClass_.createWidget_.call(this, menu);
  var element = menu.getElement();
  Blockly.utils.addClass(element, ezP.FieldCodeOptions.CSS_CLASS);
};

/**
* Handle the selection of an item in the dropdown menu.
* @param {!goog.ui.Menu} menu The Menu component clicked.
* @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
*/
ezP.FieldCodeOptions.prototype.onItemSelected = function(menu, menuItem) {
 var value = menuItem.getValue();
 if (this.sourceBlock_) {
   // Call any validation function, and allow it to override.
   value = this.callValidator(value);
 }
 if (value !== null) {
   this.setValue(value);
 }
};

/**
* No common factor.
* @private
* @override
*/
ezP.FieldCodeOptions.prototype.trimOptions_ = function() {
 this.prefixField = null;
 this.suffixField = null;
};

/**
* Set the language-neutral value for this dropdown menu.
* @param {string} newValue New value to set.
*/
ezP.FieldCodeOptions.prototype.setValue = function(newValue) {
  if (newValue === null || newValue === this.value_) {
    return;  // No change if null.
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.sourceBlock_, 'field', this.name, this.value_, newValue));
  }
  this.value_ = newValue;
  // Look up and display the human-readable text.
  var options = this.getOptions();
  for (var i = 0; i < options.length; i++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (options[i][1] == newValue) {
      var content = options[i][0];
      this.text_ = content;
      // Always rerender if either the value or the text has changed.
      this.forceRerender();
      return;
    }
  }
  // Value not found.  Add it, maybe it will become valid once set
  // (like variable names).
  this.text_ = newValue;
  this.forceRerender();
};

/**
 * The enclosing block has been selected.
 */
ezP.FieldCodeOptions.prototype.addSelect = function() {
  if (this.imageElement_) {
    Blockly.utils.addClass(this.imageElement_,'ezp-selected');
  }
};

/**
 * The enclosing block has been deselected.
 */
ezP.FieldCodeOptions.prototype.removeSelect = function() {
  if (this.imageElement_) {
    Blockly.utils.removeClass(this.imageElement_,'ezp-selected');
  }
};
