/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Renderer for {@link goog.ui.MenuItem}s.
 * Twisted to fit print options and alike.
 * A menu separator is
 * <div class="eyo-menuseparator"></div>
 * and a menu item is
 * <div class="eyo-menuitem"></div>
 * <div class="eyo-menuitem">
 *   <div class="eyo-menuitem-content">
 *     <div class="eyo-menuitem-checkbox">...</div>
 *       content
 *     </div>
 *   </div>
 * </div>
 * Known classes for menu items are
 * eyo-code, for code snippets
 * eyo-with-accel, to reserve room for a key shortcut (accelerator)
 * eyo-with-checkbox, to reserve room for a checkbox
 * See the subemnu renderer for submenus.
 * @author jerome.laurens@u-bourgogne.fr
 */

goog.provide('eYo.MenuItemRenderer')
goog.provide('eYo.KeyValueMenuItemRenderer')
goog.provide('eYo.NoOptionMenuItemRenderer')
goog.provide('eYo.MenuItemCodeRenderer')
goog.provide('eYo.MenuItemVarRenderer')
goog.provide('eYo.SeparatorRenderer')

goog.require('goog.ui.MenuItemRenderer')
goog.require('eYo.Style')

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
eYo.Style.setControlRendererCssClass = (function () {
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
    eYo.Style.insertCssRuleAt(rule)
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
 * <div class="eyo-menuseparator"></div>
 * @constructor
 * @extends {goog.ui.MenuSeparatorRenderer}
 */
eYo.MenuSeparatorRenderer = function () {
  goog.ui.MenuSeparatorRenderer.call(this)
}
goog.inherits(eYo.MenuSeparatorRenderer, goog.ui.MenuSeparatorRenderer)
goog.addSingletonGetter(eYo.MenuSeparatorRenderer)

eYo.Style.setControlRendererCssClass(
  eYo.MenuSeparatorRenderer,
  'eyo-menuseparator',
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

eYo.MenuItemRenderer = function () {
  goog.ui.MenuItemRenderer.call(this)
}

goog.inherits(eYo.MenuItemRenderer, goog.ui.MenuItemRenderer)
goog.addSingletonGetter(eYo.MenuItemRenderer)

/**
 * Overrides {@link goog.ui.MenuItemRenderer#createDom} by adding extra markup
 * and stying to the menu item's element if it is selectable or checkable.
 * @param {goog.ui.Control} item Menu item to render.
 * @return {Element} Root element for the item.
 * @override
 */
eYo.MenuItemRenderer.prototype.createDom = function (item) {
  var element = eYo.MenuItemRenderer.superClass_.createDom.call(this, item)
  return element
}

eYo.Style.setControlRendererCssClass(
  eYo.MenuItemRenderer,
  'eyo-menuitem',
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
eYo.MenuItemRenderer.prototype.getClassForState = function (state) {
  return eYo.MenuItemRenderer.superClass_.getClassForState.call(
    this, state)
}

eYo.KeyValueMenuItemRenderer = function () {
  goog.ui.MenuItemRenderer.call(this)
}

goog.inherits(eYo.KeyValueMenuItemRenderer, goog.ui.MenuItemRenderer)
goog.addSingletonGetter(eYo.KeyValueMenuItemRenderer)

eYo.Style.setControlRendererCssClass(
  eYo.KeyValueMenuItemRenderer,
  'eyo-menuitem-code',
  'content',
  {'padding': '4px 6px 4px ' + (eYo.Font.space + 12) + 'px;'},
  'hover',
  {'background-color': '#d6e9f8'}
)

/** @override */
eYo.KeyValueMenuItemRenderer.prototype.makeTitleElement = function (element) {
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
eYo.KeyValueMenuItemRenderer.prototype.decorate = function (item, element) {
  goog.asserts.assert(element)
  if (!this.hasContentStructure(element)) {
    element.appendChild(
      this.createContent(element.childNodes, item.getDomHelper()))
  }
  (/** @type {goog.ui.MenuItem} */ (item)).setCheckable(true)
  this.setCheckable(item, element, true)
  return eYo.KeyValueMenuItemRenderer.superClass_.decorate.call(
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
// eYo.KeyValueMenuItemRenderer.prototype.setContent = function(element, content) {
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
eYo.KeyValueMenuItemRenderer.prototype.hasContentStructure = function (element) {
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
eYo.KeyValueMenuItemRenderer.prototype.setEnableCheckBoxStructure = function (
  item, element, enable) {
  this.setAriaRole(element, item.getPreferredAriaRole())
  this.setAriaStates(item, element)
  var contentElement = this.getContentElement(element)
  if (!item.edyDomMark) {
    goog.dom.classlist.add(element, 'eyo-with-checkbox')
    var checkboxClassName = this.getCompositeCssClass_(
      goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX)
    var x = 2
    var d = eYo.Font.space + 2 * x
    var el = item.getDomHelper().createDom(
      goog.dom.TagName.DIV, checkboxClassName)
    el.style.display = 'inline'
    el.style.position = 'relative'
    el.style.width = d + 'px'
    el.style.height = eYo.Font.lineHeight + 'px'
    el.style.left = (-eYo.Font.space/2) + 'px'
    el.style.top = x + 'px'
    contentElement.insertBefore(el, contentElement.firstChild || null)
    var svg = Blockly.utils.createSvgElement('svg',
      {'class': 'eyo-checkbox-icon', 'height': d, 'width': d}, el)
    Blockly.utils.createSvgElement('rect',
      {'class': 'eyo-checkbox-icon-rect',
        'x': '0',
        'y': '0',
        'rx': x * 1.25,
        'ry': x * 1.25,
        'height': d,
        'width': d},
      svg)
    d = d - 2 * x
    item.edyMark = Blockly.utils.createSvgElement('rect',
      {'class': 'eyo-checkbox-icon-mark',
        'x': x,
        'y': x,
        'rx': x,
        'ry': x,
        'height': d,
        'width': d},
      svg)
    item.edyMark.style.opacity = 0.5
  }
  if (item.isChecked()) {
    Blockly.utils.addClass(item.edyMark, 'eyo-checked')
  } else {
    Blockly.utils.removeClass(item.edyMark, 'eyo-checked')
  }
}

eYo.Style.insertCssRuleAt('.eyo-menuitem.eyo-with-checkbox, .eyo-menuitem-code.eyo-with-checkbox{padding-left: '+(8+eYo.Font.space/2)+'px;}')

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
eYo.KeyValueMenuItemRenderer.prototype.getStateFromClass = function (className) {
  return goog.ui.MenuItemRenderer.superClass_.getStateFromClass.call(
    this, className)
}

/**
 * Default renderer for {@link goog.ui.MenuItem}s.  Each item has the following
 * structure:
 *
 *    <div class="eyo-menuitem">
 *      <div class="eyo-menuitem-content">
 *        ...(menu item contents)...
 *      </div>
 *    </div>
 *
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */

eYo.NoOptionMenuItemRenderer = function () {
  goog.ui.MenuItemRenderer.call(this)
}

goog.inherits(eYo.NoOptionMenuItemRenderer, goog.ui.MenuItemRenderer)
goog.addSingletonGetter(eYo.NoOptionMenuItemRenderer)

eYo.Style.setControlRendererCssClass(
  eYo.NoOptionMenuItemRenderer,
  'eyo-menuitem'
)
eYo.NoOptionMenuItemRenderer.prototype.getClassForState =
  eYo.MenuItemRenderer.prototype.getClassForState

/**
 * Overrides {@link goog.ui.ControlRenderer#decorate} by initializing the
 * menu item to checkable based on whether the element to be decorated has
 * extra stying indicating that it should be.
 * @param {goog.ui.Control} item Menu item instance to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
eYo.NoOptionMenuItemRenderer.prototype.decorate = function (item, element) {
  goog.asserts.assert(element)
  if (!this.hasContentStructure(element)) {
    element.appendChild(
      this.createContent(element.childNodes, item.getDomHelper()))
  }
  return eYo.NoOptionMenuItemRenderer.superClass_.decorate.call(
    this, item, element)
}

/**
 * Renderer of a menu item for a variable.
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */

eYo.MenuItemCodeRenderer = function () {
  eYo.MenuItemCodeRenderer.superClass_.constructor.call(this)
}

goog.inherits(eYo.MenuItemCodeRenderer, eYo.MenuItemRenderer)
goog.addSingletonGetter(eYo.MenuItemCodeRenderer)

eYo.Style.setControlRendererCssClass(
  eYo.MenuItemCodeRenderer,
  'eyo-menuitem-code',
  '-content',
  {'': eYo.Font.style},
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
eYo.MenuItemCodeRenderer.prototype.setEnableCheckBoxStructure = function (
  item, element, enable) {
  eYo.MenuItemCodeRenderer.superClass_.setEnableCheckBoxStructure.call(this,
    item, element, enable)
  if (item.isSupportedState(goog.ui.Component.State.CHECKED)) {
    goog.dom.classlist.add(element, 'eyo-with-checkbox')
  }
}

/**
 * Renderer of a menu item for a variable.
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */

eYo.MenuItemVarRenderer = function () {
  eYo.MenuItemRenderer.call(this)
}

goog.inherits(eYo.MenuItemVarRenderer, eYo.MenuItemRenderer)
goog.addSingletonGetter(eYo.MenuItemVarRenderer)

eYo.Style.setControlRendererCssClass(
  eYo.MenuItemVarRenderer,
  'eyo-menuitem-var',
  '-content',
  {'': eYo.Font.style},
  ':hover',
  {'background-color': '#d6e9f8'}
)
