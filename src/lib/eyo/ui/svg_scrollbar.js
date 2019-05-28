/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Scrollbar rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Scrollbar')

goog.require('eYo.Svg')

/**
 * Initializes the scrollbar SVG ressources.
 * @param {!eYo.Scrollbar} scrollbar
 */
eYo.Svg.prototype.scrollbarInit = function(scrollbar) {
  var dom = this.basicInit(scrollbar)
  var svg = dom.svg
  if (svg) {
    return
  }
  svg = dom.svg = Object.create(null)
  /* Create the following DOM:
  <svg class="blocklyScrollbarHorizontal  optionalClass">
    <g>
      <rect class="blocklyScrollbarBackground" />
      <rect class="blocklyScrollbarHandle" rx="8" ry="8" />
    </g>
  </svg>
  */
  var className = 'blocklyScrollbar' + (scrollbar.horizontal_ ? 'Horizontal' : 'Vertical')
  if (opt_class) {
    className += ' ' + opt_class
  }
  var root = svg.root_ = eYo.Svg.newElement(
    'svg',
    { class: className}
  )
  var g = svg.group_ = eYo.Svg.newElement(
    'g',
    {},
    root
  )
  var background = svg.background_ = eYo.Svg.newElement(
    'rect',
    { class: 'blocklyScrollbarBackground'},
    g
  )
  var radius = Math.floor((eYo.Scrollbar.thickness - 5) / 2)
  var handle = svg.handle_ = eYo.Svg.newElement(
    'rect',
    {
      class: 'blocklyScrollbarHandle',
      rx: radius,
      ry: radius
    },
    g
  )
  eYo.Dom.insertAfter(
    root,
    scrollbar.workspace_.dom.svg.root_
  )
  var thickness = eYo.Scrollbar.thickness;
  if (scrollbar.horizontal_) {
    background.setAttribute('height', thickness)
    root.setAttribute('height', thickness)
    handle.setAttribute('height', thickness - 5)
    handle.setAttribute('y', 2.5);
    scrollbar.lengthAttribute_ = 'width';
    scrollbar.positionAttribute_ = 'x';
  } else {
    background.setAttribute('width', thickness)
    root.setAttribute('width', thickness)
    handle.setAttribute('width', thickness - 5)
    handle.setAttribute('x', 2.5);
    scrollbar.lengthAttribute_ = 'height';
    scrollbar.positionAttribute_ = 'y';
  }
  var bound = dom.bound
  bound.bar_mousedown = eYo.Dom.bindEvent(
    background,
    'mousedown',
    null,
    this.scrollbarOnBar_mousedown.bind(scrollbar)
  )
  bound.handle_mousedown = eYo.Dom.bindEvent(
    handle,
    'mousedown',
    null,
    this.scrollbarOnHandle_mousedown.bind(scrollbar)
  )
  return g
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {!eYo.Scrollbar} scrollbar
 */
eYo.Svg.prototype.scrollbarDispose = eYo.Dom.decorateDispose(function (scrollbar) {
  var dom = scrollbar.dom
  goog.dom.removeNode(dom.svg.root_)
  dom.svg = dom.svg.root_ = null
  throw 'WHAT ABOUT THE OTHER EVENTS'
})

/**
 * Update visibility of scrollbar based on whether it thinks it should
 * be visible and whether its containing workspace is visible.
 * We cannot rely on the containing workspace being hidden to hide us
 * because it is not necessarily our parent in the DOM.
 * @param {eYo.Scrollbar} scrollbar
 * @param {Boolean} show
 */
eYo.Sgv.prototype.scrollbarUpdateDisplay = function(scrollbar, show) {
  scrollbar.dom.svg.root_.setAttribute('display', show ? 'block' : 'none')
}

/**
 * Update the handle of the scroll bar, position and dimensions at the same time.
 * @param {eYo.Scrollbar} scrollbar
 */
eYo.Svg.prototype.scrollbarUpdateHandle = function(scrollbar) {
  var handle = scrollbar.dom.svg.handle_
  handle.setAttribute(
    scrollbar.lengthAttribute_,
    scrollbar.handleLength_
  )
  handle.setAttribute(
    scrollbar.positionAttribute_,
    scrollbar.handlePosition_
  )
}

/**
 * Update the view of the scroll bar, position and dimensions at the same time.
 * @param {eYo.Scrollbar} scrollbar
 */
eYo.Svg.prototype.scrollbarUpdateView = function(scrollbar) {
  var svg = scrollbar.dom.svg
  svg.root_.setAttribute(
    scrollbar.lengthAttribute_,
    scrollbar.scrollViewSize_
  )
  svg.background_.setAttribute(
    scrollbar.lengthAttribute_,
    scrollbar.scrollViewSize_
  )
}

/**
 * Place the scroll bar.
 * @param {eYo.Scrollbar} scrollbar
 */
eYo.Svg.prototype.scrollbarPlace = function(scrollbar) {
  var temp = goog.math.Coordinate.sum(
    scrollbar.position_,
    scrollbar.origin_
  )
  var transform = `translate(${temp.x}px,${temp.y}px)`
  eYo.Dom.setCssTransform(scrollbar.dom.svg.root_, transform)
}

/**
 * Inits the scroll bar.
 * @param {eYo.ScrollbarPair} scrollbarPair
 */
eYo.Svg.prototype.scrollbarPairInit = function(scrollbarPair) {
  var dom = this.basicInit(scrollbarPair)
  var svg = dom.svg
  if (svg) {
    return
  }
  var corner = svg.corner_ = eYo.Svg.newElement(
    'rect',
    {
      height: eYo.Scrollbar.thickness,
      width: eYo.Scrollbar.thickness,
      class: 'blocklyScrollbarBackground'
    }
  )
  eYo.Dom.insertAfter(
    corner,
    scrollbarPair.workspace_.dom.svg.canvas_
  )
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {!eYo.ScrollbarPair} scrollbarPair
 */
eYo.Svg.prototype.scrollbarPairDispose = eYo.Dom.decorateDispose(function (scrollbarPair) {
  var dom = scrollbarPair.dom
  goog.dom.removeNode(dom.svg.corner_)
  dom.svg = dom.svg.corner_ = null
})

/**
 * Start a dragging operation.
 * Called when scrollbar handle is clicked.
 * @param {!Event} e Mouse down event.
 * @private
 */
eYo.Svg.prototype.scrollbarOn_mousedown = function(e) {
  this.workspace_.markFocused()
  this.cleanUp_()
  if (eYo.Dom.isRightButton(e)) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation()
    return
  }
  // Look up the current translation and record it.
  this.startDragHandle = this.handlePosition_

  // Tell the workspace to setup its drag surface since it is about to move.
  // onMouseMoveHandle will call onScroll which actually tells the workspace
  // to move.
  this.workspace_.setupDragSurface()

  // Record the current mouse position.
  this.startDragMouse_ = this.horizontal_ ? e.clientX : e.clientY
  var bound = this.dom.bound
  bound.mouseup = eYo.Dom.bindEvent(
    document,
    'mouseup',
    this,
    this.onMouseUpHandle_
  )
  bound.mousemove = eYo.Dom.bindEvent(
    document,
    'mousemove',
    this,
    this.onMouseMoveHandle_
  )
  eYo.Dom.gobbleEvent(e)
}

/**
 * Drag the scrollbar's handle.
 * @param {!Event} e Mouse up event.
 * @private
 */
eYo.Svg.prototype.scrollbarOn_mousemove = function(e) {
  var currentMouse = this.horizontal_ ? e.clientX : e.clientY
  var mouseDelta = currentMouse - this.startDragMouse_
  var handlePosition = this.startDragHandle + mouseDelta
  // Position the bar.
  this.setHandlePosition(this.constrainHandle_(handlePosition))
  this.didScroll_()
}

/**
 * Release the scrollbar handle and reset state accordingly.
 * @private
 */
eYo.Scrollbar.prototype.onMouseUpHandle_ = function() {
  // Tell the workspace to clean up now that the workspace is done moving.
  this.workspace_.resetDragSurface();
  this.workspace_.ui_driver.clearTouchIdentifier();
  this.cleanUp_();
};

/**
 * Hide chaff and stop binding to mouseup and mousemove events.  Call this to
 * wrap up lose ends associated with the scrollbar.
 * @private
 */
eYo.Svg.prototype.scrollbarCleanUp_ = function(scrollbar) {
  eYo.hideChaff(true)
  var bound = scrollbar.dom.bound
  if (bound.mouseup) {
    eYo.Dom.unbindEvent(bound.mouseup)
    bound.mouseup = null
  }
  if (bound.mousemove) {
    eYo.Dom.unbindEvent(bound.mousemove)
    bound.mousemove = null
  }
}
