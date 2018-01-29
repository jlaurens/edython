/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Replacement for Dropdown field.
 * Used for print options.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.FieldOptions')

goog.require('Blockly.FieldDropdown')

/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} optValidator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 * @extends {Blockly.Field}
 * @constructor
 */

ezP.FieldOptions = function (menuGenerator, optValidator) {
  ezP.FieldOptions.superClass_.constructor.call(this, menuGenerator, optValidator)
}
goog.inherits(ezP.FieldOptions, Blockly.FieldDropdown)

ezP.FieldOptions.CSS_CLASS = 'ezp_options'

/**
 * Install this dropdown on a block.
 * @override
 */
ezP.FieldOptions.prototype.init = function () {
  ezP.FieldOptions.superClass_.init.call(this)
  goog.dom.removeNode(this.borderRect_)
  this.borderRect_ = this.textElement_
  this.arrow_ = ezP.Style.MenuIcon.path(this.fieldGroup_)
}

ezP.FieldOptions.CSS_MENU_CLASS = 'ezp-options-menu'
ezP.Style.insertCssRuleAt('.' + ezP.FieldOptions.CSS_MENU_CLASS + '{\n' + ezP.Font.style + ';\n}\n')

/**
* Create and populate the menu and menu items for this dropdown, based on
* the options list.
* @return {!goog.ui.Menu} The populated dropdown menu.
* @private
*/
ezP.FieldOptions.prototype.createMenu_ = function () {
  var renderer = goog.ui.ContainerRenderer.getCustomRenderer(
    goog.ui.MenuRenderer, ezP.FieldOptions.CSS_MENU_CLASS)
  var menu = new goog.ui.Menu(null, renderer)
  menu.setRightToLeft(this.sourceBlock_.RTL)
  var options = this.getOptions()
  for (var i = 0; i < options.length; i++) {
    var content = options[i][0] // Human-readable text or image.
    var value = options[i][1] // Language-neutral value.
    if (content === '') {
      content = value
    }
    if (typeof content === 'object') {
      // An image, not text.
      var image = new Image(content['width'], content['height'])
      image.src = content['src']
      image.alt = content['alt'] || ''
      content = image
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
ezP.FieldOptions.prototype.createWidget_ = function (menu) {
  ezP.FieldOptions.superClass_.createWidget_.call(this, menu)
  var element = menu.getElement()
  Blockly.utils.addClass(element, ezP.FieldOptions.CSS_CLASS)
}

/**
* Place the menu correctly on the screen, taking into account the dimensions
* of the menu and the dimensions of the screen so that it doesn't run off any
* edges.
* @param {!goog.ui.Menu} menu The menu to position.
* @private
*/
ezP.FieldOptions.prototype.positionMenu_ = function (menu) {
  // Record viewport dimensions before adding the dropdown.
  var viewportBBox = Blockly.utils.getViewportBBox()
  var anchorBBox = this.getAnchorDimensions_()

  this.createWidget_(menu)
  var menuSize = Blockly.utils.uiMenu.getSize(menu)

  // Position the menu.
  Blockly.WidgetDiv.positionWithAnchor(viewportBBox, anchorBBox, menuSize,
    this.sourceBlock_.RTL)
  // Calling menuDom.focus() has to wait until after the menu has been placed
  // correctly.  Otherwise it will cause a page scroll to get the misplaced menu
  // in view.  See issue #1329.
  menu.getElement().focus()
}

/**
* JL: No check mark.
* @returns {!Object} The bounding rectangle of the anchor, in window
*     coordinates.
* @private
*/
ezP.FieldOptions.prototype.getAnchorDimensions_ = function () {
  var boundingBox = this.getScaledBBox_()
  boundingBox.left -= 8 + 1// JL: this is menu left padding + frame width
  boundingBox.bottom += 4// JL: this is block bottom padding
  // if (this.sourceBlock_.RTL) {
  //   boundingBox.right += Blockly.FieldDropdown.CHECKMARK_OVERHANG
  // } else {
  //   boundingBox.left -= Blockly.FieldDropdown.CHECKMARK_OVERHANG
  // }

  return boundingBox
}

/**
* Handle the selection of an item in the dropdown menu.
* @param {!goog.ui.Menu} menu The Menu component clicked.
* @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
*/
ezP.FieldOptions.prototype.onItemSelected = function (menu, menuItem) {
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
ezP.FieldOptions.prototype.trimOptions_ = function () {
  this.leftField = null
  this.rightField = null
}

/**
 * Draws the border with the correct width.
 * @private
 */
Blockly.FieldDropdown.prototype.render_ = function () {
  if (!this.visible_) {
    this.size_.width = 0
    return
  }
  goog.dom.removeChildren(/** @type {!Element} */ (this.textElement_))
  var textNode = document.createTextNode(this.getDisplayText_())
  this.textElement_.appendChild(textNode)
  this.textElement_.setAttribute('text-anchor', 'start')
  this.textElement_.setAttribute('x', 0)

  this.size_.height = Blockly.BlockSvg.MIN_BLOCK_Y
  this.size_.width = Blockly.Field.getCachedWidth(this.textElement_)
  this.arrow_.setAttribute('transform', 'translate(' + this.size_.width + ',0)')
  this.size_.width += ezP.Font.space
}

/// **
// * Close the dropdown menu if this input is being deleted.
// */
// ezP.FieldOptions.prototype.dispose = function() {
//  Blockly.WidgetDiv.hideIfOwner(this)
//  ezP.FieldOptions.superClass_.dispose.call(this)
// }

/**
 * The enclosing block has been selected.
 */
ezP.FieldOptions.prototype.addSelect = function () {
  if (this.imageElement_) {
    Blockly.utils.addClass(this.imageElement_, 'ezp-selected')
  }
}

/**
 * The enclosing block has been deselected.
 */
ezP.FieldOptions.prototype.removeSelect = function () {
  if (this.imageElement_) {
    Blockly.utils.removeClass(this.imageElement_, 'ezp-selected')
  }
}

ezP.FieldOptions.prototype.getSerializedXml = function () {
  var container = ezP.FieldOptions.superClass_.getSerializedXml.call(this)
  container.setAttribute('value', this.getValue())
  return container
}

ezP.FieldOptions.prototype.deserializeXml = function (xml) {
  this.setValue(xml.getAttribute('value') || '')
}
