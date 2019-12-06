/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
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
 * See the submenu renderer for submenus.
 * @author jerome.laurens@u-bourgogne.fr
 */

goog.require('goog.ui.MenuItemRenderer')
goog.require('goog.ui.MenuSeparatorRenderer')

eYo.require('eYo.Style')

eYo.provide('eYo.MenuItemRenderer')

/**
 * Sets the css class of the control renderer.
 * Ensures that the style is setup accordingly.
 * @param {goog.ui.ControlRenderer} renderer
 * @param {String} cssClass - class name
 * If the next argument is a dictionary,
 * a new css rule is created with the cssClass name
 * and style attributes given in the dictionary.
 * Other arguments are an alternation of names and dictionaries.
 * For each such pair, a new css rule is created with the given name
 * prepended with '{cssClass}-' and style attributes given in the following dictionary.
 * Calling syntax
 * setControlRendererCssClass(renderer, cssClass[, style](, name, style)*)
 *
 * @param {...Object} [rest]
 */
eYo.Style.setControlRendererCssClass = (() => {
  var helper = (name, dict) => {
    var RA = []
    for (var k in dict) {
      if (k === '') {
        RA.push(dict[k], ';')
      } else {
        RA.push(k, ':', dict[k], ';')
      }
    }
    var rule = '.' + name + '{\n' + RA.join('') + '\n}'
    eYo.Css.insertRuleAt(rule)
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
})()

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
    margin: 0,
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
  {padding: '4px 6px'},
  'hover', // hover or highlight?
  {'background-color': '#d6e9f8',
  'color': '#16181b'}
)

/**
 * Takes a single {@link goog.ui.Component.State}, and returns the
 * corresponding CSS class name (null if none).
 * No overriding by goog.ui.MenuItemRenderer.
 * It exists to be used below.
 * @param {goog.ui.Component.State} state Component state.
 * @return {string|eYo.NA} CSS class representing the given state
 *     (eYo.NA if none).
 * @override
 */
eYo.MenuItemRenderer.prototype.getClassForState = function (state) {
  return eYo.MenuItemRenderer.superClass_.getClassForState.call(
    this, state)
}


eYo.setup.register(() => {
  eYo.Css.insertRuleAt('.eyo-menuitem-content {',
      eYo.Font.menuStyle,
  '}')
})
