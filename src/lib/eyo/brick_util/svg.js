/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg')

goog.require('eYo.Driver')
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
 * @namespace eYo.UI.prototype.svg
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
 * @memberof eYo.Brick.prototype.svg
 */

eYo.Svg = function () {
  eYo.Svg.superClass_.constructor.call(this)
}
goog.inherits(eYo.Svg, eYo.Driver)

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
      (document.createElementNS(eYo.Svg.NS, name))
  for (var key in attrs) {
    e.setAttribute(key, attrs[key])
  }
  // IE defines a unique attribute "runtimeStyle", it is NOT applied to
  // elements created with createElementNS. However, Closure checks for IE
  // and assumes the presence of the attribute and crashes.
  if (document.body.runtimeStyle) {  // Indicates presence of IE-only attr.
    e.runtimeStyle = e.currentStyle = e.style
  }
  parent && parent.appendChild(e)
  return e
}


// Magnet management

/**
 * Dispose of the magnet SVG ressources.
 * @param {!eYo.Magnet} magnet
 */
eYo.Svg.prototype.magnetDispose = eYo.Do.nothing

/**
 * Hilight the given connection.
 * @param {!eYo.Magnet} m4t
 */
eYo.Svg.prototype.magnetHilight = function (m4t) {
  if (!m4t.workspace) {
    return
  }
  var node = m4t.brick
  var g = node.ui.svg.group_
  var steps
  if (m4t.isInput) {
    if (m4t.target) {
      steps = eYo.Shape.definitionWithBrick(m4t.targetBrick)
    } else {
      steps = eYo.Shape.definitionWithMagnet(m4t)
      eYo.Svg.magnetHighlightedPath_ =
      eYo.Svg.newElement('path',
        {
          class: 'blocklyHighlightedConnectionPath',
          d: steps
        },
        g
      )
      return
    }
  } else if (m4t.isOutput) {
    steps = eYo.Shape.definitionWithBrick(node)
  } else {
    steps = eYo.Shape.definitionWithMagnet(m4t)
  }
  eYo.Svg.magnetHighlightedPath_ =
  eYo.Svg.newElement('path',
    {class: 'blocklyHighlightedConnectionPath',
      'd': steps,
      transform: `translate(${m4t.x || 0},${m4t.y || 0})`},
      g)
}

/**
 * Regular expressions.
 */
eYo.Svg.prototype.TRANSLATE_REGEX_ = /translate\s*\(\s*([-+\d.,e]+)([ ,]\s*([-+\d.,e]+)\s*\))/
eYo.Svg.prototype.TRANSLATE_2D_REGEX_ = /transform\s*:\s*translate\s*\(\s*([-+\d.,e]+)px([ ,]\s*([-+\d.,e]+)\s*)px\)?/
eYo.Svg.prototype.TRANSLATE_3D_REGEX_ = /transform\s*:\s*translate3d\(\s*([-+\d.,e]+)px([ ,]\s*([-+\d.,e]+)\s*)px([ ,]\s*([-+\d.,e]+)\s*)px\)?/

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
  var r = transform && transform.match(this.TRANSLATE_REGEX_)
  if (r) {
    xy.x += parseFloat(r[1])
    if (r[3]) {
      xy.y += parseFloat(r[3])
    }
  }
  // Then check for style = transform: translate(...) or translate3d(...)
  var style = element.getAttribute('style');
  if (style && style.indexOf('translate') > -1) {
    var styleComponents = style.match(this.TRANSLATE_2D_REGEX_)
    // Try transform3d if 2d transform wasn't there.
    if (!styleComponents) {
      styleComponents = style.match(this.TRANSLATE_3D_REGEX_)
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
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.setBrickDisplayMode = (mode) => {
  var svg = eYo.App.workspace.svgBlockCanvas_
  this.currentBlockDisplayMode && goog.dom.classlist.remove(svg, `eyo-${this.currentBlockDisplayMode}`)
  if ((this.currentBlockDisplayMode = mode)) {
    goog.dom.classlist.add(svg, `eyo-${this.currentBlockDisplayMode}`)
  }
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

/**
 * Initializes the flyout SVG ressources.
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutInit = function(flyout) {
  var svg = flyout.svg = {}
  /*
  <svg class="eyo-flyout">
    <g class="eyo-flyout-background">
      <path class="blocklyFlyoutBackground"/>
    </g>
    <g class="eyo-workspace">...</g>
  </svg>
  */
  svg.group_ = eYo.Svg.newElement(tagName, {
    class: 'eyo-flyout',
    style: 'display: none'
  }, null)
  svg.background_ = eYo.Svg.newElement('path', {
    class: 'eyo-flyout-background'
  }, svg.group_)
// Bad design: code reuse: options
  this.addTooltip(svg.background_, eYo.Tooltip.getTitle('flyout'), {
    position: 'right',
    theme: 'light bordered',
    flipDuration: 0,
    inertia: true,
    arrow: true,
    animation: 'perspective',
    duration: [600, 300],
    delay: [750, 0],
    popperOptions: {
      modifiers: {
        preventOverflow: {
          enabled: true
        }
      }
    },
    onShow: (instance) => {
      eYo.Tooltip.hideAll(this.svgBackground_)
    }
  })

  var g = flyout.workspace_.createDom()
  goog.dom.classlist.remove(g, 'blocklyWorkspace')
  goog.dom.classlist.add(g, 'eyo-workspace')
  svg.group_.appendChild(g)

  goog.dom.insertSiblingAfter(
    svg.group_,
    targetWorkspace.getParentSvg()
  )
}

/**
 * Initializes the flyout toolbar SVG ressources.
 * @param {!eYo.FlyoutToolbar} flyoutToolbar
 */
eYo.Svg.prototype.flyoutToolbarInit = function(ftb) {
  if (this.div_) {
    return
  }
  /*
  <div class="eyo-flyout-toolbar">
    <div class="eyo-flyout-toolbar-general">
      <div class="eyo-flyout-select-general">
        ...
      </div>
      <div class="eyo-flyout-control">
        ...
      </div>
    </div>
    <div class="eyo-flyout-toolbar-module">
      <div class="eyo-flyout-select-module">
        ...
      </div>
    </div>
  </div>
  */
  var cssClass = this.flyout_.eyo.getCssClass()
  this.control_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'control'))
  var svg = eYo.Svg.newElement('svg', {
    id: 'eyo-flyout-control-image',
    class: goog.getCssName(cssClass, 'control-image')
  }, this.control_)
  this.pathControl_ = eYo.Svg.newElement('path', {
    id: 'p-flyout-control'
  }, svg)
  if (eYo.App && eYo.App.flyoutDropDown) {
    this.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select'),
      eYo.App.flyoutDropDown
    )
  } else if (eYo.App && eYo.App.flyoutDropDownGeneral && eYo.App.flyoutDropDownModule) {
    this.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-general'),
      eYo.App.flyoutDropDownGeneral
    )
    this.select_module_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-module'),
      eYo.App.flyoutDropDownModule
    )
  } else {
    this.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-general')
    )
    select = new goog.ui.Select(null, new eYo.Menu(), eYo.MenuButtonRenderer.getInstance())
    // select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'test'))
    // select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'basic'))
    select.addItem(new eYo.MenuItem(eYo.Msg.INTERMEDIATE, 'intermediate'))
    select.addItem(new eYo.MenuItem(eYo.Msg.ADVANCED, 'advanced'))
    select.addItem(new eYo.MenuItem(eYo.Msg.EXPERT, 'expert'))
    select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BRANCHING, 'branching'))
    select.addItem(new eYo.MenuItem(eYo.Msg.LOOPING, 'looping'))
    select.addItem(new eYo.MenuItem(eYo.Msg.FUNCTION, 'function'))
    select.setSelectedIndex(0)
    select.render(this.select_general_)
    this.listenableKey = select.listen(
      goog.ui.Component.EventType.ACTION,
      this.doSelectGeneral,
      false,
      this
    )
    this.select_module_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-module')
    )
    var select = new goog.ui.Select(null, new eYo.Menu(), eYo.MenuButtonRenderer.getInstance())
    // select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'test'))
    // select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'basic'))
    select.addItem(new eYo.MenuItem(eYo.Msg.INTERMEDIATE, 'intermediate'))
    select.addItem(new eYo.MenuItem(eYo.Msg.ADVANCED, 'advanced'))
    select.addItem(new eYo.MenuItem(eYo.Msg.EXPERT, 'expert'))
    select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BRANCHING, 'branching'))
    select.addItem(new eYo.MenuItem(eYo.Msg.LOOPING, 'looping'))
    select.addItem(new eYo.MenuItem(eYo.Msg.FUNCTION, 'function'))
    select.setSelectedIndex(0)
    select.render(this.select_module_)
    this.listenableKey = select.listen(
      goog.ui.Component.EventType.ACTION,
      this.doSelectGeneral,
      false,
      this
    )
  }
  var div_general = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'toolbar-general'),
    this.select_general_
  )
  var div_module = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'toolbar-module'),
    this.select_module_
  )
  this.div_ = this.switcher_
    ? goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'toolbar'),
      this.switcher_,
      this.control_
    )
    : goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'toolbar'),
      div_general,
      div_module,
      this.control_
    )
  if (this.switcher_) {
    this.switcher_.style.left = '0px'
    this.switcher_.style.top = '0px'
  }
  this.onButtonDownWrapper_ = eYo.Svg.bindEventWithChecks_(this.control_, 'mousedown', this, this.onButtonDown_)
  this.onButtonEnterWrapper_ = eYo.Svg.bindEventWithChecks_(this.control_, 'mouseenter', this, this.onButtonEnter_)
  this.onButtonLeaveWrapper_ = eYo.Svg.bindEventWithChecks_(this.control_, 'mouseleave', this, this.onButtonLeave_)
  this.onButtonUpWrapper_ = eYo.Svg.bindEventWithChecks_(this.control_, 'mouseup', this, this.onButtonUp_)

  goog.dom.insertSiblingBefore(ftb.div_, ftb.flyout_.svg.group_)
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

/**
 * Bind an event to a function call.  When calling the function, verifies that
 * it belongs to the touch stream that is currently being processed, and splits
 * multitouch events into multiple events as needed.
 * @param {!EventTarget} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @param {boolean=} opt_noCaptureIdentifier True if triggering on this event
 *     should not block execution of other event handlers on this touch or other
 *     simultaneous touches.
 * @param {boolean=} opt_noPreventDefault True if triggering on this event
 *     should prevent the default handler.  False by default.  If
 *     opt_noPreventDefault is provided, opt_noCaptureIdentifier must also be
 *     provided.
 * @return {!Array.<!Array>} Opaque data that can be passed to unbindEvent_.
 */
eYo.Svg.bindEventWithChecks_ = function(node, name, thisObject, func,
  opt_noCaptureIdentifier, opt_noPreventDefault) {
  var handled = false
  var wrapFunc = (e) => {
    // Handle each touch point separately.  If the event was a mouse event, this
    // will hand back an array with one element, which we're fine handling.
    var noCaptureIdentifier = opt_noCaptureIdentifier // catch it
    var events = Blockly.Touch.splitEventByTouches(e)
    events.forEach(event => {
      if (noCaptureIdentifier || Blockly.Touch.shouldHandleEvent(event)) {
        Blockly.Touch.setClientFromTouch(event)
        (thisObject && func.call(thisObject, event)) || func(event)
        handled = true
      }
    })
  }
  var bindData = []
  if (window && window.PointerEvent && (name in Blockly.Touch.TOUCH_MAP)) {
    Blockly.Touch.TOUCH_MAP[name].forEach(type => {
      node.addEventListener(type, wrapFunc, false)
      bindData.push([node, type, wrapFunc])
    })
  } else {
    node.addEventListener(name, wrapFunc, false)
    bindData.push([node, name, wrapFunc])

    // Add equivalent touch event.
    if (name in Blockly.Touch.TOUCH_MAP) {
      var touchWrapFunc = (e) => {
        wrapFunc(e)
        // Calling preventDefault stops the browser from scrolling/zooming the
        // page.
        var preventDefault = !opt_noPreventDefault // catch it
        if (handled && preventDefault) {
          e.preventDefault()
        }
      }
      Blockly.Touch.TOUCH_MAP[name].forEach(type => {
        node.addEventListener(type, touchWrapFunc, false)
        bindData.push([node, type, touchWrapFunc])
      })
    }
  }
  return bindData
}

/**
 * Unbind one or more events event from a function call.
 * @param {!Array.<!Array>} bindData Opaque data from bindEvent_.
 *     This list is emptied during the course of calling this function.
 * @return {!Function} The function call.
 */
eYo.Svg.unbindEvent_ = bindData => {
  while (bindData.length) {
    var d = bindData.pop()
    var node = d[0]
    var name = d[1]
    var func = d[2]
    node.removeEventListener(name, func, false)
  }
  return func
}
