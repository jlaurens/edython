/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Dropdown input field adapted to ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.FieldDropdown')

goog.require('Blockly.FieldDropdown')

/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} optValidator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 *     If it returns a value, that value (which must be one of the options) will
 *     become selected in place of the newly selected option, unless the return
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
ezP.FieldDropdown = function (menuGenerator, optValidator) {
  ezP.FieldDropdown.superClass_.constructor.call(this, menuGenerator, optValidator)
}
goog.inherits(ezP.FieldDropdown, Blockly.FieldDropdown)
//

ezP.FieldDropdown.CSS_CLASS = 'ezp-menu'
// ezP.Style.insertCssRuleAt('.'+ezP.FieldDropdown.CSS_MENU_CLASS+'{\n'+ezP.Font.style+';\n}\n')

/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} optValidator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 *     If it returns a value, that value (which must be one of the options) will
 *     become selected in place of the newly selected option, unless the return
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
ezP.FieldDropdownCode = function (menuGenerator, optValidator) {
  ezP.FieldDropdown.superClass_.constructor.call(this, menuGenerator, optValidator)
}
goog.inherits(ezP.FieldDropdownCode, ezP.FieldDropdown)
//

ezP.Style.insertCssRuleAt('.ezp-code{\n' + ezP.Font.style + ';\n}\n')

/**
 * Install this dropdown on a block.
 */
ezP.FieldDropdown.prototype.init = function () {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return
  }
  // Build the DOM.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null)
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_)// replace the null above ?
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none'
  }
  /** @type {!Element} */
  this.textElement_ = Blockly.utils.createSvgElement('text',
    {'class': 'ezp-code', 'y': ezP.Font.totalAscent},
    this.fieldGroup_)

  this.menuIcon_ = ezP.Style.MenuIcon.path(this.fieldGroup_)

  this.mouseDownWrapper_ =
      Blockly.bindEventWithChecks_(this.menuIcon_, 'mousedown', this,
        this.onMouseDown_)

  this.borderRect_ = this.textElement_
  this.size_.height = ezP.Font.lineHeight()
  this.updateEditable()

  // TODO (1010): Change from init/initModel to initView/initModel
  this.initModel()
  // Force a render.
  // this.render_(); too early
}

/**
* Create and populate the menu and menu items for this dropdown, based on
* the options list.
* @return {!goog.ui.Menu} The populated dropdown menu.
* @private
*/
ezP.FieldDropdown.prototype.createMenu_ = function () {
  var menu = new ezP.Menu()
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
    menuItem.setChecked(value === this.value_)
  }
  Blockly.utils.addClass(menu.getElement(), 'ezp-nosubmenu')
  return menu
}

/**
 * Create and render the menu widget inside Blockly's widget div.
 * @param {!goog.ui.Menu} menu The menu to add to the widget div.
 * @private
*/
ezP.FieldDropdownCode.prototype.createWidget_ = function (menu) {
  ezP.FieldDropdown.superClass_.createWidget_.call(this, menu)
  Blockly.utils.addClass(menu.getElement(), 'ezp-code')
}

/**
 * JL: No check mark.
 * @returns {!Object} The bounding rectangle of the anchor, in window
 *     coordinates.
 * @private
 */
ezP.FieldDropdown.prototype.getAnchorDimensions_ = function () {
  var bbox = this.getScaledBBox_()
  bbox.labelLeft = bbox.labelLeft - 12 + 1 + 4// JL Change like in field_variable showEditor
  bbox.top = bbox.top - 5
  bbox.bottom = bbox.bottom + 3
  return bbox
}

/**
 * Draws the border with the correct width.
 * @private
 */
ezP.FieldDropdown.prototype.render_ = function () {
  if (!this.visible_) {
    this.size_.width = 0
    return
  }
  goog.dom.removeChildren(/** @type {!Element} */ (this.textElement_))
  var textNode = document.createTextNode(this.getDisplayText_())
  this.textElement_.appendChild(textNode)
  this.textElement_.setAttribute('text-anchor', 'start')
  this.textElement_.setAttribute('x', 0)
  this.size_.width = Blockly.Field.getCachedWidth(this.textElement_)
  this.menuIcon_.setAttribute('transform', 'translate(' + this.size_.width + ',0)')
  this.size_.width += ezP.Style.MenuIcon.width
}

ezP.FieldDropdown.prototype.getSerializedXml = function () {
  var container = ezP.FieldDropdown.superClass_.getSerializedXml.call(this)
  container.setAttribute('value', this.getValue())
  return container
}

ezP.FieldDropdown.prototype.deserializeXml = function (xml) {
  this.setValue(xml.getAttribute('value') || '')
}
