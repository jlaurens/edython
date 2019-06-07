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
 * @param {?String} opt_class
 */
eYo.Svg.prototype.scrollbarInit = function(scrollbar, opt_class) {
  if (scrollbar.dom) {
    return
  }
  var dom = this.basicInit(scrollbar)
  var svg = dom.svg
  /* Create the following DOM:
  <svg class="eyo-scrollbar-horizontal  optionalClass">
    <g>
      <rect class="eyo-scrollbar-background" />
      <rect class="eyo-scrollbar-handle" rx="8" ry="8" />
    </g>
  </svg>
  */
  var className = 'eyo-scrollbar-' + (scrollbar.horizontal_ ? 'horizontal' : 'vertical')
  if (opt_class) {
    className += ' ' + opt_class
  }
  var root = svg.root_ = eYo.Svg.newElement(
    'svg',
    { class: className }
  )
  var g = svg.group_ = eYo.Svg.newElement(
    'g',
    {},
    root
  )
  var background = svg.background_ = eYo.Svg.newElement(
    'rect',
    { class: 'eyo-scrollbar-background'},
    g
  )
  var radius = Math.floor((eYo.Scrollbar.thickness - 5) / 2)
  var handle = svg.handle_ = eYo.Svg.newElement(
    'rect',
    {
      class: 'eyo-scrollbar-handle',
      rx: radius,
      ry: radius
    },
    g
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
  eYo.Dom.insertAfter(
    root,
    scrollbar.board_.dom.svg.root_
  )
  var bound = dom.bound
  bound.bar_mousedown = eYo.Dom.bindEvent(
    background,
    'mousedown',
    this.scrollbarOnBar_mousedown.bind(scrollbar)
  )
  bound.handle_mousedown = eYo.Dom.bindEvent(
    handle,
    'mousedown',
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
 * be visible and whether its containing board is visible.
 * We cannot rely on the containing board being hidden to hide us
 * because it is not necessarily our parent in the DOM.
 * @param {eYo.Scrollbar} scrollbar
 * @param {Boolean} show
 */
eYo.Svg.prototype.scrollbarUpdateDisplay = function(scrollbar, show) {
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
    scrollbar.handlePosition__
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
    scrollbar.viewLength_
  )
  svg.background_.setAttribute(
    scrollbar.lengthAttribute_,
    scrollbar.viewLength_
  )
}

/**
 * Place the scroll bar.
 * @param {eYo.Scrollbar} scrollbar
 */
eYo.Svg.prototype.scrollbarPlace = function(scrollbar) {
  var where = scrollbar.rect_.origin
  var transform = `translate(${where.x}px,${where.y}px)`
  eYo.Dom.setCssTransform(scrollbar.dom.svg.root_, transform)
}

/**
 * Inits the scroll bar.
 * @param {eYo.ScrollbarPair} scrollbarPair
 */
eYo.Svg.prototype.scrollbarPairInit = function(pair) {
  if (pair.dom) {
    return
  }
  var dom = this.basicInit(pair)
  var svg = dom.svg
  var corner = svg.corner_ = eYo.Svg.newElement(
    'rect',
    {
      height: eYo.Scrollbar.thickness,
      width: eYo.Scrollbar.thickness,
      class: 'eyo-scrollbar-background'
    }
  )
  eYo.Dom.insertAfter(
    corner,
    pair.board_.dom.svg.canvas_
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
 * @this {eYo.Scrollbar}
 * @private
 */
eYo.Svg.prototype.scrollbarOnHandle_mousedown = function(e) {
  this.board_.markFocused()
  this.cleanUp_()
  if (eYo.Dom.isRightButton(e)) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation()
    return
  }
  // Record the current mouse position.
  if (this.horizontal_) {
    this.dragStart_ = e.clientX
    // what is the mouse range ?
    this.dragMin_ = this.dragStart_ - this.handlePosition_ + this.rect.x_min
    this.dragLength_ = this.rect.width - this.handleLength_
  } else {
    this.dragStart_ = e.clientY
    // what is the mouse range ?
    this.dragMin_ = this.dragStart_ - this.handlePosition_ + this.rect.y_min
    this.dragLength_ = this.rect.height - this.handleLength_
  }
  var bound = this.dom.bound
  bound.mouseup = eYo.Dom.bindEvent(
    document,
    'mouseup',
    this,
    this.ui_driver.scrollbarOn_mouseup
  )
  bound.mousemove = eYo.Dom.bindEvent(
    document,
    'mousemove',
    this,
    this.ui_driver.scrollbarOn_mousemove
  )
  eYo.Dom.gobbleEvent(e)
}

/**
 * Drag the scrollbar's handle.
 * @param {!Event} e Mouse up event.
 * @this {eYo.Scrollbar}
 */
eYo.Svg.prototype.scrollbarOn_mousemove = function(e) {
  var currentMouse = this.horizontal_ ? e.clientX : e.clientY
  var ratio = this.dragLength_ ? (currentMouse - this.dragMin_) / this.dragLength_ : 0
  if (ratio < 0) {
    ration = 0
  } else if (ratio > 1) {
    ratio = 1
  }
  this.board_.doRelativeScroll({[this.horizontal_ ? 'x' : 'y']: ratio})
  eYo.Dom.gobbleEvent(e)
}

/**
 * End of scrolling.
 * @param {!Event} e Mouse up event.
 * @this {eYo.Scrollbar}
 */
eYo.Svg.prototype.scrollbarOn_mouseup = function() {
  // Tell the board to clean up now that the board is done moving.
  eYo.Dom.clearTouchIdentifier()
  this.cleanUp_()
}

/**
 * Stop binding to mouseup and mousemove events.  Call this to
 * wrap up lose ends associated with the scrollbar.
 * @param {!eYo.Scrollbar}
 * @private
 */
eYo.Svg.prototype.scrollbarCleanUp = function(scrollbar) {
  eYo.App.hideChaff()
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

/**
 * Scroll by one pageful.
 * Called when scrollbar background is clicked.
 * @param {!Event} e Mouse down event.
 * @this {eYo.Scrollbar}
 * @private
 */
eYo.Svg.prototype.scrollbarOnBar_mousedown = function(e) {
  this.board_.markFocused()
  eYo.Dom.clearTouchIdentifier()  // This is really a click.
  this.cleanUp_()
  if (eYo.Dom.isRightButton(e)) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation()
    return
  }
  var mouseWhere = this.board_.eventWhere(e)
  var mouseLocation = this.horizontal_ ? mouseWhere.x : mouseWhere.y

  var handleWhere = this.board.desk.xyElementInDesk(this.svgHandle_)
  var handleStart = this.horizontal_ ? handleWhere.x : handleWhere.y
  var handlePosition_ = this.handlePosition__

  var pageLength = this.handleLength_ * 0.95;
  if (mouseLocation <= handleStart) {
    // Decrease the scrollbar's value by a page.
    handlePosition_ -= pageLength
  } else if (mouseLocation >= handleStart + this.handleLength_) {
    // Increase the scrollbar's value by a page.
    handlePosition_ += pageLength
  }

  this.handlePosition_ = this.constrainHandle_(handlePosition_)

  this.didScroll_()
  eYo.Dom.gobbleEvent(e)
}

/**
 * Place the corner.
 * @param {!eYo.ScrollbarPair} scrollbarPair
 * @private
 */
eYo.Svg.prototype.scrollbarPairPlaceCorner = function(pair) {
  var r = pair.cornerRect_
  corner.setAttribute('x', r.x)
  corner.setAttribute('y', r.y)
  corner.setAttribute('width', r.width)
  corner.setAttribute('height', r.height)
}
