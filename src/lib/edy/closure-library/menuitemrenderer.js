/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Renderer for {@link goog.ui.MenuItem}s.
 * Twisted to fit print options and alike.
 * A menu separator is
 * <div class="ezp-menuseparator"></div>
 * and a menu item is
 * <div class="ezp-menuitem"></div>
 * <div class="ezp-menuitem">
 *   <div class="ezp-menuitem-content">
 *     <div class="ezp-menuitem-checkbox">...</div>
 *       content
 *     </div>
 *   </div>
 * </div>
 * Known classes for menu items are
 * ezp-code, for code snippets
 * ezp-with-accel, to reserve room for a key shortcut (accelerator)
 * ezp-with-checkbox, to reserve room for a checkbox
 * See the subemnu renderer for submenus.
 * @author jerome.laurens@u-bourgogne.fr
 */

goog.provide('ezP.MenuItemRenderer')
goog.provide('ezP.KeyValueMenuItemRenderer')
goog.provide('ezP.NoOptionMenuItemRenderer')
goog.provide('ezP.MenuItemCodeRenderer')
goog.provide('ezP.MenuItemVarRenderer')
goog.provide('ezP.SeparatorRenderer')

goog.require('goog.ui.MenuItemRenderer')
goog.require('ezP.Style')

/**
 * Sets the css class of the control renderer.
 * Ensures that the style is setup accordingly.
 * @param {goog.ui.ControlRenderer} renderer
 * @param {String} cssClass, class name
 * If the next argument is a dictionary,
 * a new css rule is created with the cssClass name
 * and style attributes given in the dictionary.
 * Other arguments are an alternation of names and dictionaries.
 * For each such pair, a new css rule is created with the given name
 * prepended with '{cssClass}-' and style attributes given in the following dictionary.
 * Calling syntax
 * setControlRendererCssClass(renderer, cssClass[, style](, name, style)*)
 * 
 */
ezP.Style.setControlRendererCssClass = (function () {
  var helper = function (name, dict) {
    var RA = []
    for (var k in dict) {
      if (k === '') {
        RA.push(dict[k], ';')
      } else {
        RA.push(k, ':', dict[k], ';')
      }
    }
    var rule = '.' + name + '{\n' + RA.join('') + '\n}'
    ezP.Style.insertCssRuleAt(rule)
  }
  return function (renderer, cssClass) {
    goog.addSingletonGetter(renderer)
    renderer.CSS_CLASS = cssClass
    renderer.prototype.getCssClass = function () { return cssClass }
    var args = [].slice.call(arguments)
    var i = 2
    var dict = args[i++]
    if (dict) {
      if (typeof dict === 'object') {
        helper(cssClass, dict)
        var name = args[i++]
      } else {
        name = dict
      }
      while (name && typeof name === 'string') {
        dict = args[i++]
        if (dict && typeof dict === 'object') {
          helper(cssClass + name, dict)
          name = args[i++]
          continue
        }
        break
      }
    }
  }
}())

/**
 * Renderer for menu items separators.
 * Create the dom element:
 * <div class="ezp-menuseparator"></div>
 * @constructor
 * @extends {goog.ui.MenuSeparatorRenderer}
 */
ezP.MenuSeparatorRenderer = function () {
  goog.ui.MenuSeparatorRenderer.call(this)
}
goog.inherits(ezP.MenuSeparatorRenderer, goog.ui.MenuSeparatorRenderer)
goog.addSingletonGetter(ezP.MenuSeparatorRenderer)

ezP.Style.setControlRendererCssClass(
  ezP.MenuSeparatorRenderer,
  'ezp-menuseparator',
  { 'border-top': '1px solid #ccc',
    'margin': 0,
    'padding': 0}
)

/**
 * Renderer for menu items.
 * @constructor
 * @extends {goog.ui.MenuSeparatorRenderer}
 */

// NB: take a look at goog.ui.ControlRenderer.getCustomRenderer

ezP.MenuItemRenderer = function () {
  goog.ui.MenuItemRenderer.call(this)
}

goog.inherits(ezP.MenuItemRenderer, goog.ui.MenuItemRenderer)
goog.addSingletonGetter(ezP.MenuItemRenderer)

/**
 * Overrides {@link goog.ui.MenuItemRenderer#createDom} by adding extra markup
 * and stying to the menu item's element if it is selectable or checkable.
 * @param {goog.ui.Control} item Menu item to render.
 * @return {Element} Root element for the item.
 * @override
 */
ezP.MenuItemRenderer.prototype.createDom = function (item) {
  var element = ezP.MenuItemRenderer.superClass_.createDom.call(this, item)
  return element
}

ezP.Style.setControlRendererCssClass(
  ezP.MenuItemRenderer,
  'ezp-menuitem',
  'content',
  {'padding': '4px 6px'},
  'hover', // hover or highlight?
  {'background-color': '#d6e9f8'}
)

/**
 * Takes a single {@link goog.ui.Component.State}, and returns the
 * corresponding CSS class name (null if none).
 * No overriding by goog.ui.MenuItemRenderer.
 * It exists to be used below.
 * @param {goog.ui.Component.State} state Component state.
 * @return {string|undefined} CSS class representing the given state
 *     (undefined if none).
 * @override
 */
ezP.MenuItemRenderer.prototype.getClassForState = function (state) {
  return ezP.MenuItemRenderer.superClass_.getClassForState.call(
    this, state)
}

ezP.KeyValueMenuItemRenderer = function () {
  goog.ui.MenuItemRenderer.call(this)
}

goog.inherits(ezP.KeyValueMenuItemRenderer, goog.ui.MenuItemRenderer)
goog.addSingletonGetter(ezP.KeyValueMenuItemRenderer)

ezP.Style.setControlRendererCssClass(
  ezP.KeyValueMenuItemRenderer,
  'ezp-menuitem-code',
  'content',
  {'padding': '4px 6px 4px ' + (ezP.Font.space + 12) + 'px;'},
  'hover',
  {'background-color': '#d6e9f8'}
)

/** @override */
ezP.KeyValueMenuItemRenderer.prototype.makeTitleElement = function (element) {
  return /** @type {Element} */ (element && element.firstChild)
}

/**
 * Overrides {@link goog.ui.ControlRenderer#decorate} by initializing the
 * menu item to checkable based on whether the element to be decorated has
 * extra stying indicating that it should be.
 * @param {goog.ui.Control} item Menu item instance to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
ezP.KeyValueMenuItemRenderer.prototype.decorate = function (item, element) {
  goog.asserts.assert(element)
  if (!this.hasContentStructure(element)) {
    element.appendChild(
      this.createContent(element.childNodes, item.getDomHelper()))
  }
  (/** @type {goog.ui.MenuItem} */ (item)).setCheckable(true)
  this.setCheckable(item, element, true)
  return ezP.KeyValueMenuItemRenderer.superClass_.decorate.call(
    this, item, element)
}

// /**
//  * Takes a menu item's root element, and sets its content to the given text
//  * caption or DOM structure.  Overrides the superclass immplementation by
//  * making sure that the checkbox structure (for selectable/checkable menu
//  * items) is preserved.
//  * @param {Element} element The item's root element.
//  * @param {goog.ui.ControlContent} content Text caption or DOM structure to be
//  *     set as the item's content.
//  * @override
//  */
// ezP.KeyValueMenuItemRenderer.prototype.setContent = function(element, content) {
//   // Save the checkbox element, if present.
//   var contentElement = this.getContentElement(element)
//   var checkBoxElement =
//       this.hasCheckBoxStructure(element) ? contentElement.firstChild : null
//   goog.ui.MenuItemRenderer.superClass_.setContent.call(this, element, content)
//   if (checkBoxElement && !this.hasCheckBoxStructure(element)) {
//     // The call to setContent() blew away the checkbox element; reattach it.
//     contentElement.insertBefore(
//         checkBoxElement, contentElement.firstChild || null)
//   }
// }

/**
 * Returns true if the element appears to have a proper menu item structure by
 * checking whether its first child has the appropriate structural class name.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element appears to have a proper menu item DOM.
 * @protected
 */
ezP.KeyValueMenuItemRenderer.prototype.hasContentStructure = function (element) {
  var child = goog.dom.getFirstElementChild(element)
  var contentClassName = this.getCompositeCssClass_(
    goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT)
  return !!child && goog.dom.classlist.contains(child, contentClassName)
}

/**
 * Adds or removes extra markup and CSS styling to the menu item to make it
 * selectable or non-selectable, depending on the value of the
 * {@code selectable} argument.
 * @param {!goog.ui.Control} item Menu item to update.
 * @param {!Element} element Menu item element to update.
 * @param {boolean} enable Whether to add or remove the checkbox structure.
 * @protected
 */
ezP.KeyValueMenuItemRenderer.prototype.setEnableCheckBoxStructure = function (
  item, element, enable) {
  this.setAriaRole(element, item.getPreferredAriaRole())
  this.setAriaStates(item, element)
  var contentElement = this.getContentElement(element)
  if (!item.ezpDomMark) {
    goog.dom.classlist.add(element, 'ezp-with-checkbox')
    var checkboxClassName = this.getCompositeCssClass_(
      goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX)
    var x = 2
    var d = ezP.Font.space + 2 * x
    var el = item.getDomHelper().createDom(
      goog.dom.TagName.DIV, checkboxClassName)
    el.style.display = 'inline'
    el.style.position = 'relative'
    el.style.width = d + 'px'
    el.style.height = ezP.Font.lineHeight + 'px'
    el.style.left = (-ezP.Font.space/2) + 'px'
    el.style.top = x + 'px'
    contentElement.insertBefore(el, contentElement.firstChild || null)
    var svg = Blockly.utils.createSvgElement('svg',
      {'class': 'ezp-checkbox-icon', 'height': d, 'width': d}, el)
    Blockly.utils.createSvgElement('rect',
      {'class': 'ezp-checkbox-icon-rect',
        'x': '0',
        'y': '0',
        'rx': x * 1.25,
        'ry': x * 1.25,
        'height': d,
        'width': d},
      svg)
    d = d - 2 * x
    item.ezpMark = Blockly.utils.createSvgElement('rect',
      {'class': 'ezp-checkbox-icon-mark',
        'x': x,
        'y': x,
        'rx': x,
        'ry': x,
        'height': d,
        'width': d},
      svg)
    item.ezpMark.style.opacity = 0.5
  }
  if (item.isChecked()) {
    Blockly.utils.addClass(item.ezpMark, 'ezp-checked')
  } else {
    Blockly.utils.removeClass(item.ezpMark, 'ezp-checked')
  }
}

ezP.Style.insertCssRuleAt('.ezp-menuitem.ezp-with-checkbox, .ezp-menuitem-code.ezp-with-checkbox{padding-left: '+(8+ezP.Font.space/2)+'px;}')

/**
 * Takes a single CSS class name which may represent a component state, and
 * returns the corresponding component state (0x00 if none).  Overrides the
 * superclass implementation by treating 'goog-option-selected' as special,
 * for backwards compatibility.
 * @param {string} className CSS class name, possibly representing a component
 *     state.
 * @return {goog.ui.Component.State} state Component state corresponding
 *     to the given CSS class (0x00 if none).
 * @override
 */
ezP.KeyValueMenuItemRenderer.prototype.getStateFromClass = function (className) {
  return goog.ui.MenuItemRenderer.superClass_.getStateFromClass.call(
    this, className)
}

/**
 * Default renderer for {@link goog.ui.MenuItem}s.  Each item has the following
 * structure:
 *
 *    <div class="ezp-menuitem">
 *      <div class="ezp-menuitem-content">
 *        ...(menu item contents)...
 *      </div>
 *    </div>
 *
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */

ezP.NoOptionMenuItemRenderer = function () {
  goog.ui.MenuItemRenderer.call(this)
}

goog.inherits(ezP.NoOptionMenuItemRenderer, goog.ui.MenuItemRenderer)
goog.addSingletonGetter(ezP.NoOptionMenuItemRenderer)

ezP.Style.setControlRendererCssClass(
  ezP.NoOptionMenuItemRenderer,
  'ezp-menuitem'
)
ezP.NoOptionMenuItemRenderer.prototype.getClassForState =
  ezP.MenuItemRenderer.prototype.getClassForState

/**
 * Overrides {@link goog.ui.ControlRenderer#decorate} by initializing the
 * menu item to checkable based on whether the element to be decorated has
 * extra stying indicating that it should be.
 * @param {goog.ui.Control} item Menu item instance to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
ezP.NoOptionMenuItemRenderer.prototype.decorate = function (item, element) {
  goog.asserts.assert(element)
  if (!this.hasContentStructure(element)) {
    element.appendChild(
      this.createContent(element.childNodes, item.getDomHelper()))
  }
  return ezP.NoOptionMenuItemRenderer.superClass_.decorate.call(
    this, item, element)
}

/**
 * Renderer of a menu item for a variable.
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */

ezP.MenuItemCodeRenderer = function () {
  ezP.MenuItemCodeRenderer.superClass_.constructor.call(this)
}

goog.inherits(ezP.MenuItemCodeRenderer, ezP.MenuItemRenderer)
goog.addSingletonGetter(ezP.MenuItemCodeRenderer)

ezP.Style.setControlRendererCssClass(
  ezP.MenuItemCodeRenderer,
  'ezp-menuitem-code',
  '-content',
  {'': ezP.Font.style},
  ':hover',
  {'background-color': '#d6e9f8'}
)

/**
 * Adds or removes extra markup and CSS styling to the menu item to make it
 * selectable or non-selectable, depending on the value of the
 * {@code selectable} argument.
 * @param {!goog.ui.Control} item Menu item to update.
 * @param {!Element} element Menu item element to update.
 * @param {boolean} enable Whether to add or remove the checkbox structure.
 * @protected
 */
ezP.MenuItemCodeRenderer.prototype.setEnableCheckBoxStructure = function (
  item, element, enable) {
  ezP.MenuItemCodeRenderer.superClass_.setEnableCheckBoxStructure.call(this,
    item, element, enable)
  if (item.isSupportedState(goog.ui.Component.State.CHECKED)) {
    goog.dom.classlist.add(element, 'ezp-with-checkbox')
  }
}

/**
 * Renderer of a menu item for a variable.
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */

ezP.MenuItemVarRenderer = function () {
  ezP.MenuItemRenderer.call(this)
}

goog.inherits(ezP.MenuItemVarRenderer, ezP.MenuItemRenderer)
goog.addSingletonGetter(ezP.MenuItemVarRenderer)

ezP.Style.setControlRendererCssClass(
  ezP.MenuItemVarRenderer,
  'ezp-menuitem-var',
  '-content',
  {'': ezP.Font.style},
  ':hover',
  {'background-color': '#d6e9f8'}
)
