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

goog.provide('ezP.FieldPrintOptions');

goog.require('Blockly.FieldDropdown');
goog.require('ezP.KeyValueMenuItemRenderer');


/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 * @extends {Blockly.Field}
 * @constructor
 */

ezP.FieldPrintOptions = function(menuGenerator, opt_validator) {
  this.ezpState = {};
  ezP.FieldPrintOptions.superClass_.constructor.call(this, menuGenerator, opt_validator);
  this.ezpState = {};// this is not a joke
};
goog.inherits(ezP.FieldPrintOptions, Blockly.FieldDropdown);

ezP.FieldPrintOptions.END = 'END';
ezP.FieldPrintOptions.SEP = 'SEP';
ezP.FieldPrintOptions.FILE = 'FILE';
ezP.FieldPrintOptions.FLUSH = 'FLUSH';

ezP.FieldPrintOptions.CSS_CLASS = 'ezp_options';

/**
 * Install this dropdown on a block.
 * @override
 */
ezP.FieldPrintOptions.prototype.init = function() {
  this.text_ = null;
  ezP.FieldPrintOptions.superClass_.init.call(this);
  goog.dom.removeNode(this.borderRect_);
  goog.dom.removeNode(this.textElement_);
  this.textElement_ = undefined;
  this.imageElement_ = ezP.Style.MenuIcon(this.fieldGroup_);
  this.borderRect_ = this.imageElement_;
};

ezP.FieldPrintOptions.CSS_MENU_CLASS = 'ezp-print-block-menu';
ezP.Style.insertCssRuleAt('.'+ezP.FieldPrintOptions.CSS_MENU_CLASS+'{\n'+ezP.Font.style+';\n}\n');

/**
* Create and populate the menu and menu items for this dropdown, based on
* the options list.
* @return {!goog.ui.Menu} The populated dropdown menu.
* @private
*/
ezP.FieldPrintOptions.prototype.createMenu_ = function() {
  var renderer = goog.ui.ContainerRenderer.getCustomRenderer(
      goog.ui.MenuRenderer, ezP.FieldPrintOptions.CSS_MENU_CLASS);
  var menu = new goog.ui.Menu(null,renderer);
  menu.setRightToLeft(this.sourceBlock_.RTL);
  var renderer = ezP.KeyValueMenuItemRenderer.getInstance();
  var options = this.getOptions();
  for (var i = 0; i < options.length; i++) {
    var content = options[i][0]; // Human-readable text or image.
    var value = options[i][1];   // Language-neutral value.
    if (typeof content == 'object') {
      // An image, not text.
      var image = new Image(content['width'], content['height']);
      image.src = content['src'];
      image.alt = content['alt'] || '';
      content = image;
    }
    var menuItem = new goog.ui.MenuItem(content, undefined, undefined, renderer);
    menuItem.setRightToLeft(this.sourceBlock_.RTL);
    menuItem.setValue(value);
    menuItem.setCheckable(true);
    menuItem.setChecked(this.getState_()[value]);
    menu.addChild(menuItem, true);
  }
  return menu;
};

/**
* Create and render the menu widget inside Blockly's widget div.
* @param {!goog.ui.Menu} menu The menu to add to the widget div.
* @private
*/
ezP.FieldPrintOptions.prototype.createWidget_ = function(menu) {
  ezP.FieldPrintOptions.superClass_.createWidget_.call(this, menu);
  var element = menu.getElement();
  Blockly.utils.addClass(element, ezP.FieldPrintOptions.CSS_CLASS);
};

/**
* Handle the selection of an item in the dropdown menu.
* @param {!goog.ui.Menu} menu The Menu component clicked.
* @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
*/
ezP.FieldPrintOptions.prototype.onItemSelected = function(menu, menuItem) {
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
ezP.FieldPrintOptions.prototype.trimOptions_ = function() {
 this.prefixField = null;
 this.suffixField = null;
};

/**
* Set the language-neutral value for this dropdown menu.
* @param {string} newValue New value to set.
*/
ezP.FieldPrintOptions.prototype.getState_ = function() {
  if (this.sourceBlock_) {
    var ezp = this.sourceBlock_.ezp;
    if (ezp && ezp.printState) {
      return ezp.printState;
    }
  }
  var ezp = this.sourceBlock_? this.sourceBlock_.ezp: null;
  return ezp? ezp.printState? ezp.printState:(ezp.printState = {})
    : this.state? this.state: (this.state = {});
};

/**
* Set the language-neutral value for this dropdown menu.
* @param {string} newValue New value to set.
*/
ezP.FieldPrintOptions.prototype.setValue = function(newValue) {
 if (newValue === null) {
   return;  // No change if null.
 }
 if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
   Blockly.Events.fire(new Blockly.Events.BlockChange(
       this.sourceBlock_, 'field', this.name, this.value_, newValue));
 }
 var options = this.getOptions();
 var state = this.getState_();
 for (var i = 0; i < options.length; i++) {
   if (options[i][1] == newValue) {
     state[newValue] = !state[newValue];
     this.forceRerender();
     return;
   }
 }
};

/**
 * Whether an input is visible, according to its internal state.
 * @param {!Block.Input} input.
 * @return yorn
 */
ezP.FieldPrintOptions.prototype.isInputVisible = function(input) {
  var state = this.getState_();
  switch(input.name) {
    case ezP.FieldPrintOptions.END:
    case ezP.FieldPrintOptions.SEP:
    case ezP.FieldPrintOptions.FILE:
    case ezP.FieldPrintOptions.FLUSH:
      return state[input.name] == true;
    default:
      return undefined;
  }
};


/**
 * Draws the border with the correct width.
 * JL: quite nothing to do
 * @private
 */
ezP.FieldPrintOptions.prototype.render_ = function() {
  if (!this.visible_) {
    this.size_.width = 0;
    return;
  }
  this.size_.height = ezP.Font.lineHeight();
  this.updateWidth();
};

/**
* Nothing to do , the width never changes except when invisible.
# @override
*/
ezP.FieldPrintOptions.prototype.updateWidth = function() {
  this.size_.width = ezP.Font.space;
};

///**
// * Close the dropdown menu if this input is being deleted.
// */
//ezP.FieldPrintOptions.prototype.dispose = function() {
//  Blockly.WidgetDiv.hideIfOwner(this);
//  ezP.FieldPrintOptions.superClass_.dispose.call(this);
//};

/**
 * The enclosing block has been selected.
 */
ezP.FieldPrintOptions.prototype.addSelect = function() {
  if (this.imageElement_) {
    Blockly.utils.addClass(this.imageElement_,'ezp-selected');
  }
};

/**
 * The enclosing block has been deselected.
 */
ezP.FieldPrintOptions.prototype.removeSelect = function() {
  if (this.imageElement_) {
    Blockly.utils.removeClass(this.imageElement_,'ezp-selected');
  }
};
