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

goog.provide('EZP.PrintFieldDropdown');

goog.require('EZP.FieldDropdown');
goog.require('EZP.OptionMenuItemRenderer');


/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 * @extends {Blockly.Field}
 * @constructor
 */

EZP.PrintFieldDropdown = function(menuGenerator, opt_validator) {
  this.ezpState = {};
  EZP.PrintFieldDropdown.superClass_.constructor.call(this, menuGenerator, opt_validator);
  this.ezpState = {};// this is not a joke
};
goog.inherits(EZP.PrintFieldDropdown, Blockly.FieldDropdown);

EZP.PrintFieldDropdown.END = 'END';
EZP.PrintFieldDropdown.SEP = 'SEP';
EZP.PrintFieldDropdown.FILE = 'FILE';

EZP.PrintFieldDropdown.CSS_CLASS = 'ezp_options';

/**
 * Install this dropdown on a block.
 * @override
 */
EZP.PrintFieldDropdown.prototype.init = function() {
  this.text_ = null;
  EZP.PrintFieldDropdown.superClass_.init.call(this);
  this.imageElement_ = EZP.Style.menuIcon(this.fieldGroup_, this.size_.width);
};

///**
// * Create a dropdown menu under the text.
// * @private
// */
//EZP.PrintFieldDropdown.prototype.showEditor_ = function() {
//  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, null);
//  var menu = this.createMenu_();
//  this.addEventListeners_(menu);
//  this.positionMenu_(menu);
//};

///**
// * Add event listeners for actions on the items in the dropdown menu.
// * @param {!goog.ui.Menu} menu The menu to add listeners to.
// * @private
// */
//EZP.PrintFieldDropdown.prototype.addEventListeners_ = function(menu) {
//  this.addActionListener_(menu);
//  this.addTouchStartListener_(menu);
//  this.addTouchEndListener_(menu);
//};

///**
// * Add a listener for mouse and keyboard events in the menu and its items.
// * @param {!goog.ui.Menu} menu The menu to add listeners to.
// * @private
// */
//EZP.PrintFieldDropdown.prototype.addActionListener_ = function(menu) {
//  var thisField = this;
//
//  function callback(e) {
//    var menu = this;
//    var menuItem = e.target;
//    if (menuItem) {
//      thisField.onItemSelected(menu, menuItem);
//    }
//    Blockly.WidgetDiv.hideIfOwner(thisField);
//    Blockly.Events.setGroup(false);
//  }
//  // Listen for mouse/keyboard events.
//  goog.events.listen(menu, goog.ui.Component.EventType.ACTION, callback);
//};

///**
// * Add a listener for touch start events on menu items.
// * @param {!goog.ui.Menu} menu The menu to add the listener to.
// * @private
// */
//EZP.PrintFieldDropdown.prototype.addTouchStartListener_ = function(menu) {
//  // Listen for touch events (why doesn't Closure handle this already?).
//  function callback(e) {
//    var control = this.getOwnerControl(/** @type {Node} */ (e.target));
//    // Highlight the menu item.
//    control.handleMouseDown(e);
//  }
//  menu.getHandler().listen(menu.getElement(), goog.events.EventType.TOUCHSTART,
//                           callback);
//};

///**
// * Add a listener for touch end events on menu items.
// * @param {!goog.ui.Menu} menu The menu to add the listener to.
// * @private
// */
//EZP.PrintFieldDropdown.prototype.addTouchEndListener_ = function(menu) {
//  // Listen for touch events (why doesn't Closure handle this already?).
//  function callbackTouchEnd(e) {
//    var control = this.getOwnerControl(/** @type {Node} */ (e.target));
//    // Activate the menu item.
//    control.performActionInternal(e);
//  }
//  menu.getHandler().listen(menu.getElement(), goog.events.EventType.TOUCHEND,
//                           callbackTouchEnd);
//};

/**
* Create and populate the menu and menu items for this dropdown, based on
* the options list.
* @return {!goog.ui.Menu} The populated dropdown menu.
* @private
*/
EZP.PrintFieldDropdown.prototype.createMenu_ = function() {
  //var renderer = EZP.MenuRenderer.getInstance(undefined, EZP.PrintFieldDropdown.CSS_CLASS);
  var menu = new goog.ui.Menu();//(undefined, renderer);
  menu.setRightToLeft(this.sourceBlock_.RTL);
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
    var renderer = EZP.OptionMenuItemRenderer.getInstance();
    var menuItem = new goog.ui.MenuItem(content, undefined, undefined, renderer);
    menuItem.setRightToLeft(this.sourceBlock_.RTL);
    menuItem.setValue(value);
    menuItem.setCheckable(true);
    menuItem.setChecked(this.ezpState[value]);
    menu.addChild(menuItem, true);
  }
  return menu;
};

///**
// * Place the menu correctly on the screen, taking into account the dimensions
// * of the menu and the dimensions of the screen so that it doesn't run off any
// * edges.
// * @param {!goog.ui.Menu} menu The menu to position.
// * @private
// */
//EZP.PrintFieldDropdown.prototype.positionMenu_ = function(menu) {
//  // Record viewport dimensions before adding the dropdown.
//  var viewportBBox = Blockly.utils.getViewportBBox();
//  var anchorBBox = this.getAnchorDimensions_();
//
//  this.createWidget_(menu);
//  var menuSize = Blockly.utils.uiMenu.getSize(menu);
//
//  if (this.sourceBlock_.RTL) {
//    Blockly.utils.uiMenu.adjustBBoxesForRTL(viewportBBox, anchorBBox, menuSize);
//  }
//  // Position the menu.
//  Blockly.WidgetDiv.positionWithAnchor(viewportBBox, anchorBBox, menuSize,
//      this.sourceBlock_.RTL);
//  // Calling menuDom.focus() has to wait until after the menu has been placed
//  // correctly.  Otherwise it will cause a page scroll to get the misplaced menu
//  // in view.  See issue #1329.
//  menu.getElement().focus();
//};

/**
* Create and render the menu widget inside Blockly's widget div.
* @param {!goog.ui.Menu} menu The menu to add to the widget div.
* @private
*/
EZP.PrintFieldDropdown.prototype.createWidget_ = function(menu) {
  EZP.PrintFieldDropdown.superClass_.createWidget_.call(this, menu);
  var element = menu.getElement();
  Blockly.utils.addClass(element, EZP.PrintFieldDropdown.CSS_CLASS);
};

// /**
// * JL: No check mark.
// * @returns {!Object} The bounding rectangle of the anchor, in window
// *     coordinates.
// * @private
// */
// EZP.PrintFieldDropdown.prototype.getAnchorDimensions_ = function() {
//   var boundingBox = this.getScaledBBox_();
//  if (this.sourceBlock_.RTL) {
//    boundingBox.right += Blockly.FieldDropdown.CHECKMARK_OVERHANG;
//  } else {
//    boundingBox.left -= Blockly.FieldDropdown.CHECKMARK_OVERHANG;
//  }
//
//  return boundingBox;
// };

/**
* Handle the selection of an item in the dropdown menu.
* @param {!goog.ui.Menu} menu The Menu component clicked.
* @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
*/
EZP.PrintFieldDropdown.prototype.onItemSelected = function(menu, menuItem) {
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
EZP.PrintFieldDropdown.prototype.trimOptions_ = function() {
 this.prefixField = null;
 this.suffixField = null;
};

///**
// * Use the calculated prefix and suffix lengths to trim all of the options in
// * the given array.
// * @param {!Array.<!Array>} options Array of option tuples:
// *     (human-readable text or image, language-neutral name).
// * @param {number} prefixLength The length of the common prefix.
// * @param {number} suffixLength The length of the common suffix
// * @return {!Array.<!Array>} A new array with all of the option text trimmed.
// */
//Blockly.FieldDropdown.applyTrim_ = function(options, prefixLength, suffixLength) {
//  var newOptions = [];
//  // Remove the prefix and suffix from the options.
//  for (var i = 0; i < options.length; i++) {
//    var text = options[i][0];
//    var value = options[i][1];
//    text = text.substring(prefixLength, text.length - suffixLength);
//    newOptions[i] = [text, value];
//  }
//  return newOptions;
//};

///**
// * @return {boolean} True if the option list is generated by a function.
// *     Otherwise false.
// */
//EZP.PrintFieldDropdown.prototype.isOptionListDynamic = function() {
//  return goog.isFunction(this.menuGenerator_);
//};

///**
// * Return a list of the options for this dropdown.
// * @return {!Array.<!Array>} Array of option tuples:
// *     (human-readable text or image, language-neutral name).
// */
//EZP.PrintFieldDropdown.prototype.getOptions = function() {
//  if (goog.isFunction(this.menuGenerator_)) {
//    return this.menuGenerator_.call(this);
//  }
//  return /** @type {!Array.<!Array.<string>>} */ (this.menuGenerator_);
//};

///**
// * Get the language-neutral value from this dropdown menu.
// * @return {string} Current text.
// */
//EZP.PrintFieldDropdown.prototype.getValue = function() {
//  return this.value_;
//};

/**
* Set the language-neutral value for this dropdown menu.
* @param {string} newValue New value to set.
*/
EZP.PrintFieldDropdown.prototype.setValue = function(newValue) {
 if (newValue === null) {
   return;  // No change if null.
 }
 if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
   Blockly.Events.fire(new Blockly.Events.BlockChange(
       this.sourceBlock_, 'field', this.name, this.value_, newValue));
 }
 var options = this.getOptions();
 for (var i = 0; i < options.length; i++) {
   if (options[i][1] == newValue) {
     this.ezpState[newValue] = !this.ezpState[newValue];
     this.forceRerender();
     return;
   }
 }
};

/**
 * Draws the border with the correct width.
 * JL: quite nothing to do
 * @private
 */
EZP.PrintFieldDropdown.prototype.render_ = function() {
  if (!this.visible_) {
    this.size_.width = 0;
    return;
  }
  this.size_.height = EZP.Font.lineHeight();
  this.updateWidth();
};

/**
* Nothing to do , the width never changes except when invisible.
# @override
*/
EZP.PrintFieldDropdown.prototype.updateWidth = function() {
  this.size_.width = EZP.Font.space;
};

///**
// * Close the dropdown menu if this input is being deleted.
// */
//EZP.PrintFieldDropdown.prototype.dispose = function() {
//  Blockly.WidgetDiv.hideIfOwner(this);
//  EZP.PrintFieldDropdown.superClass_.dispose.call(this);
//};
