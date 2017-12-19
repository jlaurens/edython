/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Dropdown print field for options.
 * Implements menu UI for sep=, end=, file=...
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.FieldOptionsCode')

/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} optValidator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 * @extends {Blockly.Field}
 * @constructor
 */

ezP.FieldOptionsCode = function (menuGenerator, optValidator) {
  ezP.FieldOptionsCode.superClass_.constructor.call(this, menuGenerator, optValidator)
  this.imageJson_ = null
}
goog.inherits(ezP.FieldOptionsCode, Blockly.FieldDropdown)

ezP.FieldOptionsCode.CSS_CLASS = 'ezp_options_code'

/**
 * Install this dropdown on a block.
 * @override
 */
ezP.FieldOptionsCode.prototype.init = function () {
  ezP.FieldOptionsCode.superClass_.init.call(this)
  this.arrow_ = ezP.Style.MenuIcon.path(this.fieldGroup_)
}

ezP.FieldOptionsCode.CSS_MENU_CLASS = 'ezp_options_code-menu'
ezP.Style.insertCssRuleAt('.' + ezP.FieldOptionsCode.CSS_MENU_CLASS + '{\n' + ezP.Font.style + ';\n}\n')

/**
* Create and populate the menu and menu items for this dropdown, based on
* the options list.
* @return {!goog.ui.Menu} The populated dropdown menu.
* @private
*/
ezP.FieldOptionsCode.prototype.createMenu_ = function () {
  var renderer = goog.ui.ContainerRenderer.getCustomRenderer(
    goog.ui.MenuRenderer, ezP.FieldOptionsCode.CSS_MENU_CLASS)
  var menu = new goog.ui.Menu(null, renderer)
  menu.setRightToLeft(this.sourceBlock_.RTL)
  var options = this.getOptions()
  for (var i = 0; i < options.length; i++) {
    var content = options[i][0] // Human-readable text or image.
    var value = options[i][1] // Language-neutral value.
    if (content === '') {
      content = value
    }
    var menuItem = new ezP.MenuItemCode(content)
    menuItem.setRightToLeft(this.sourceBlock_.RTL)
    menuItem.setValue(value)
    menuItem.setCheckable(false)
    menu.addChild(menuItem, true)
  }
  Blockly.utils.addClass(menu.getElement(), 'ezp-nosubmenu')
  return menu
}

/**
* Create and render the menu widget inside Blockly's widget div.
* @param {!goog.ui.Menu} menu The menu to add to the widget div.
* @private
*/
ezP.FieldOptionsCode.prototype.createWidget_ = function (menu) {
  ezP.FieldOptionsCode.superClass_.createWidget_.call(this, menu)
  var element = menu.getElement()
  Blockly.utils.addClass(element, ezP.FieldOptionsCode.CSS_CLASS)
}

/**
* Handle the selection of an item in the dropdown menu.
* @param {!goog.ui.Menu} menu The Menu component clicked.
* @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
*/
ezP.FieldOptionsCode.prototype.onItemSelected = function (menu, menuItem) {
  var value = menuItem.getValue()
  if (this.sourceBlock_) {
    // Call any validation function, and allow it to override.
    value = this.callValidator(value)
  }
  if (value !== null) {
    this.setValue(value)
  }
}

/**
* No common factor.
* @private
* @override
*/
ezP.FieldOptionsCode.prototype.trimOptions_ = function () {
  this.prefixField = null
  this.suffixField = null
}

/**
* Set the language-neutral value for this dropdown menu.
* @param {string} newValue New value to set.
*/
ezP.FieldOptionsCode.prototype.setValue = function (newValue) {
  if (newValue === null || newValue === this.value_) {
    return // No change if null.
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
      this.sourceBlock_, 'field', this.name, this.value_, newValue))
  }
  this.value_ = newValue
  // Look up and display the human-readable text.
  var options = this.getOptions()
  for (var i = 0; i < options.length; i++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (options[i][1] === newValue) {
      var content = options[i][0]
      this.text_ = content
      // Always rerender if either the value or the text has changed.
      this.forceRerender()
      return
    }
  }
  // Value not found.  Add it, maybe it will become valid once set
  // (like variable names).
  this.text_ = newValue
  this.forceRerender()
}

/**
 * The enclosing block has been selected.
 */
ezP.FieldOptionsCode.prototype.addSelect = function () {
  if (this.imageElement_) {
    Blockly.utils.addClass(this.imageElement_, 'ezp-selected')
  }
}

/**
 * The enclosing block has been deselected.
 */
ezP.FieldOptionsCode.prototype.removeSelect = function () {
  if (this.imageElement_) {
    Blockly.utils.removeClass(this.imageElement_, 'ezp-selected')
  }
}
