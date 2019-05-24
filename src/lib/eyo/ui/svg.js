/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg')

goog.require('eYo.Dom')
goog.require('eYo.T3.Profile')
goog.require('eYo.Field')

goog.forwardDeclare('eYo.Svg.Brick')
goog.forwardDeclare('eYo.Svg.Slot')
goog.forwardDeclare('eYo.Svg.Field')
goog.forwardDeclare('eYo.Slot')
goog.forwardDeclare('eYo.Brick')
goog.forwardDeclare('eYo.Style')
goog.forwardDeclare('goog.userAgent')

eYo.setup.register(() => {
  eYo.Style.SEP_SPACE_X = 0
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout {
        position: absolute;
        z-index: 20;
      }`)
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-background {
      fill: #ddd;
      fill-opacity: .8;
      pointer-events: all;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-scrollbar {
      z-index: 30;
    }`
  )
})

eYo.setup.register(() => {
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar {
      position: absolute;
      pointer-events: all;
      height: 3.5rem;
      padding: 0;
      padding-left: 0.25rem;
      margin: 0;
      background: rgba(221,221,221,0.8);
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar-general {
      position: absolute;
      pointer-events: all;
      height: 2rem;
      padding: 0.125rem;
      width: 100%;
      margin: 0;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar-module {
      position: absolute;
      pointer-events: all;
      height: 1.75rem;
      padding: 0.125rem;
      margin: 0;
      margin-top: 2.25rem;
      width: 100%;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-select-general,
    .eyo-flyout-select-module {
      height: 100%;
      width: 100%;
      padding-left: 0.25rem;
      padding-right:0.25rem;
      margin: 0
    }`
  )
  var radius = '1.125rem;'
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control {
      background: #ddd;
      opacity: 0.79;
      height: 50%;
      width: 1.25rem;
      position: absolute;
      top: 0px;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control left {
      border-top-right-radius:${radius};
      border-bottom-right-radius:${radius};
      -webkit-border-top-right-radius:${radius};
      -webkit-border-bottom-right-radius:${radius};
      -moz-border-radius-topright:${radius};
      -moz-border-radius-bottomright:${radius};
      border-top-right-radius:${radius};
      border-bottom-right-radius:${radius};
      right: -1.25rem;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control {
      border-top-left-radius:${radius};
      border-bottom-left-radius:${radius};
      -webkit-border-top-left-radius:${radius};
      -webkit-border-bottom-left-radius:${radius};
      -moz-border-radius-topleft:${radius};
      -moz-border-radius-bottomleft:${radius};
      border-top-left-radius:${radius};
      border-bottom-left-radius:${radius};
      left: -1.25rem;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control-image {
      width: 1.125rem;
      height: 2.25rem;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control-image path {
      fill: white;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control-image path:hover {
      fill:black;
      fill-opacity: 0.075;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flash .eyo-flyout-control-image path,
    .eyo-flash .eyo-flyout-control-image path:hover {
      fill:black;
      fill-opacity:0.2;
    }`
  )
})

eYo.setup.register(() => {
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar .eyo-menu-button {
      background: #952276;
      box-shadow: 0px 3px 8px #888;
      border:0;
    }`
  )
    eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar .eyo-menu-button:hover {
      box-shadow: 0px 2px 6px #444;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-outer-box {
      padding-left: 10px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-inner-box {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
      padding-right: 30px;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar .eyo-menu-button-caption {
      color: white;
      vertical-align: middle;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-dropdown svg {
      position: absolute;
      top: 0px;
      width: 12px;
      height: 6px;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-dropdown-image {
      fill: white;
    }`
  )
})

/**
 * A namespace.
 * @namespace eYo.Brick.UI.prototype.dom
 */

/**
 * Svg driver to help rendering bricks in a svg context.
 * @readonly
 * @property {SvgGroupElement} group_  The svg group.
 * @property {SvgGroupElement} groupContour_  The svg group for the contour.
 * @property {SvgGroupElement} groupShape_  The svg group for the shape.
 * @property {SvgPathElement} pathInner_  A path.
 * @property {SvgPathElement} pathShape_  A path.
 * @property {SvgPathElement} pathContour_  A path.
 * @property {SvgPathElement} pathCollapsed_  A path.
 * @property {SvgPathElement} pathSelect_  A path.
 * @property {SvgPathElement} pathHilight_  A path.
 * @memberof eYo.Brick.prototype.dom
 */

eYo.Svg = function () {
  eYo.Svg.superClass_.constructor.call(this)
}
goog.inherits(eYo.Svg, eYo.Dom)

eYo.Svg.prototype.withBBox = true

eYo.Svg.NS = 'http://www.w3.org/2000/svg'

/**
 * Helper method for creating SVG elements.
 * @param {string} name Element's tag name.
 * @param {!Object} attrs Dictionary of attribute names and values.
 * @param {Element} parent Optional parent on which to append the element.
 * @return {!SVGElement} Newly created SVG element.
 */
eYo.Svg.newElement = function(name, attrs, parent) {
  var e = /** @type {!SVGElement} */
      document.createElementNS(eYo.Svg.NS, name)
  for (var key in attrs) {
    e.setAttribute(key, attrs[key])
  }
  // IE defines a unique attribute "runtimeStyle", it is NOT applied to
  // elements created with createElementNS. However, Closure checks for IE
  // and assumes the presence of the attribute and crashes.
  if (document.body.runtimeStyle) {  // Indicates presence of IE-only attr.
    e.runtimeStyle = e.currentStyle = e.style
  }
  parent && (parent.appendChild(e))
  return e
}

/**
 * Regular expressions.
 */
Object.defineProperties(eYo.Svg, {
  TRANSLATE_REGEX_: { value: /translate\s*\(\s*([-+\d.,e]+)([ ,]\s*([-+\d.,e]+)\s*\))/ },
  TRANSLATE_2D_REGEX_: { value: /transform\s*:\s*translate\s*\(\s*([-+\d.,e]+)px([ ,]\s*([-+\d.,e]+)\s*)px\)?/ },
  TRANSLATE_3D_REGEX_: { value: /transform\s*:\s*translate3d\(\s*([-+\d.,e]+)px([ ,]\s*([-+\d.,e]+)\s*)px([ ,]\s*([-+\d.,e]+)\s*)px\)?/ }
})

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.  Only for SVG elements and children (e.g. rect, g, path).
 * Fixed bug in original code.
 * @param {!Element} element SVG element to find the coordinates of.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 */
eYo.Svg.prototype.xyInParent = function(element) {
  var xy = new goog.math.Coordinate(0, 0)
  // First, check for x and y attributes.
  var x = element.getAttribute('x')
  if (x) {
    xy.x = parseInt(x, 10)
  }
  var y = element.getAttribute('y')
  if (y) {
    xy.y = parseInt(y, 10)
  }
  // Second, check for transform="translate(...)" attribute.
  var transform = element.getAttribute('transform')
  var r = transform && (transform.match(eYo.Svg.TRANSLATE_REGEX_))
  if (r) {
    xy.x += parseFloat(r[1])
    if (r[3]) {
      xy.y += parseFloat(r[3])
    }
  }
  // Then check for style = transform: translate(...) or translate3d(...)
  var style = element.getAttribute('style');
  if (style && style.indexOf('translate') > -1) {
    var styleComponents = style.match(eYo.Svg.TRANSLATE_2D_REGEX_)
    // Try transform3d if 2d transform wasn't there.
    if (!styleComponents) {
      styleComponents = style.match(eYo.Svg.TRANSLATE_3D_REGEX_)
    }
    if (styleComponents) {
      xy.x += parseFloat(styleComponents[1])
      if (styleComponents[3]) {
        xy.y += parseFloat(styleComponents[3])
      }
    }
  }
  return xy
}

/**
 * Add tooltip to an element
 * @param {!String} key
 */
eYo.Svg.prototype.addTooltip = function (el, title, options) {
  if (goog.isString(title)) {
    el.setAttribute('title', title)
    tippy(el, options)
  } else if (goog.isDef(title)) {
    tippy(el, title)
  }
}

// Private holder of svg ressources
Object.defineProperties(eYo.Field, {
  svg: { value: undefined, writable: true }
})

/**
 * The css class for the given text
 * For edython.
 * @param {!string} txt The text to yield_expr
 * @return {string}
 */
eYo.Svg.getCssClassForText = function (txt) {
  switch (eYo.T3.Profile.get(txt, null).raw) {
  case eYo.T3.Expr.reserved_identifier:
  case eYo.T3.Expr.reserved_keyword:
    return 'eyo-code-reserved'
  case eYo.T3.Expr.builtin__name:
    return 'eyo-code-builtin'
  default:
    return 'eyo-code'
  }
}

/**
 * Remove an attribute from a element even if it's in IE 10.
 * Similar to Element.removeAttribute() but it works on SVG elements in IE 10.
 * Sets the attribute to null in IE 10, which treats removeAttribute as a no-op
 * if it's called on an SVG element.
 * @param {!Element} element DOM element to remove attribute from.
 * @param {string} attributeName Name of attribute to remove.
 */
eYo.Svg.prototype.removeAttribute = function(element, attributeName) {
  // goog.userAgent.isVersion is deprecated, but the replacement is
  // goog.userAgent.isVersionOrHigher.
  if (goog.userAgent.IE && goog.userAgent.isVersion('10.0')) {
    element.setAttribute(attributeName, null)
  } else {
    element.removeAttribute(attributeName)
  }
}
