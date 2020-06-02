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

eYo.require('svg')

eYo.forward('view.Scrollbar')

/**
 * Svg driver for a scrollbar.
 */
eYo.svg.newDriverC9r('Scrollbar', {
    /**
   * Initializes the scrollbar SVG ressources.
   * @param {eYo.view.Scrollbar} scrollbar
   * @param {String} [opt_css_class]
   */
  initUI (scrollbar, opt_css_class) {
    var dom = scrollbar.dom
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
    if (opt_css_class) {
      className += ' ' + opt_css_class
    }
    var root = svg.root_ = eYo.svg.newElement(
      'svg',
      {
        class: className,
        preserveAspectRatio: 'xMinYMin slice'
      }
    )
    var g = svg.group_ = eYo.svg.newElement(
      'g',
      {},
      root
    )
    var background = svg.background_ = eYo.svg.newElement(
      'rect',
      { class: 'eyo-scrollbar-background'},
      g
    )
    var radius = Math.floor((eYo.view.SCROLLBAR_THICKNESS - 5) / 2)
    var handle = svg.handle_ = eYo.svg.newElement(
      'rect',
      {
        class: 'eyo-scrollbar-handle',
        rx: radius,
        ry: radius
      },
      g
    )
    var thickness = eYo.view.SCROLLBAR_THICKNESS;
    if (scrollbar.horizontal_) {
      background.setAttribute('height', thickness)
      handle.setAttribute('height', thickness - 5)
      handle.setAttribute('y', 2.5);
      scrollbar.lengthAttribute_ = 'width'
      scrollbar.positionAttribute_ = 'x'
    } else {
      background.setAttribute('width', thickness)
      handle.setAttribute('width', thickness - 5)
      handle.setAttribute('x', 2.5);
      scrollbar.lengthAttribute_ = 'height'
      scrollbar.positionAttribute_ = 'y'
    }
    eYo.dom.insertAfter(
      root,
      scrollbar.board_.dom.svg.root_
    )
    var bound = dom.bound
    bound.bar_mousedown = eYo.dom.bindEvent(
      background,
      'mousedown',
      this.scrollbarOnBar_mousedown.bind(scrollbar)
    )
    bound.handle_mousedown = eYo.dom.bindEvent(
      handle,
      'mousedown',
      this.scrollbarOnHandle_mousedown.bind(scrollbar)
    )
    return g
  },
  /**
   * Dispose of the given slot's rendering resources.
   * @param {eYo.view.Scrollbar} scrollbar
   */
  disposeUI (scrollbar) {
    var dom = scrollbar.dom
    eYo.dom.removeNode(dom.svg.root_)
    dom.svg = dom.svg.root_ = null
    throw 'WHAT ABOUT THE OTHER EVENTS'
  },
})



/**
 * Update visibility of scrollbar based on whether it thinks it should
 * be visible and whether its containing board is visible.
 * We cannot rely on the containing board being hidden to hide us
 * because it is not necessarily our parent in the DOM.
 * @param {eYo.view.Scrollbar} scrollbar
 * @param {Boolean} show
 */
eYo.svg.Scrollbar_p.updateDisplay = function(scrollbar, show) {
  scrollbar.dom.svg.root_.setAttribute('display', show ? 'block' : 'none')
}

/**
 * Update the handle of the scroll bar, position and dimensions at the same time.
 * @param {eYo.view.Scrollbar} scrollbar
 */
eYo.svg.Scrollbar_p.updateHandle = function(scrollbar) {
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
 * @param {eYo.view.Scrollbar} scrollbar
 */
eYo.svg.Scrollbar_p.updateView = function(scrollbar) {
  var svg = scrollbar.dom.svg
}

/**
 * Place the scroll bar.
 * @param {eYo.view.Scrollbar} scrollbar
 */
eYo.svg.Scrollbar_p.place = function(scrollbar) {
  var r = scrollbar.viewRect
  scrollbar.dom.svg.root_.setAttribute('viewBox', `${r.x_min} ${r.y_min} ${r.width} ${r.height}`)
}

/**
 * Start a dragging operation.
 * Called when scrollbar handle is clicked.
 * @param {Event} e Mouse down event.
 * @this {eYo.view.Scrollbar}
 * @private
 */
eYo.svg.Scrollbar_p.onHandle_mousedown = function(e) {
  this.board_.markFocused()
  this.cleanUp_()
  if (eYo.dom.isRightButton(e)) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation()
    return
  }
  // Record the current mouse position.
  var rect = this.viewRect
  if (this.horizontal_) {
    this.dragStart_ = e.clientX
    // what is the mouse range ?
    this.dragMin_ = this.dragStart_ - this.handlePosition_ + rect.x_min
    this.dragLength_ = rect.width - this.handleLength_
  } else {
    this.dragStart_ = e.clientY
    // what is the mouse range ?
    this.dragMin_ = this.dragStart_ - this.handlePosition_ + rect.y_min
    this.dragLength_ = rect.height - this.handleLength_
  }
  var bound = this.dom.bound
  bound.mouseup = eYo.dom.bindEvent(
    document,
    'mouseup',
    this,
    this.ui_driver_mngr.scrollbarOn_mouseup
  )
  bound.mousemove = eYo.dom.bindEvent(
    document,
    'mousemove',
    this,
    this.ui_driver_mngr.scrollbarOn_mousemove
  )
  eYo.dom.gobbleEvent(e)
}

/**
 * Drag the scrollbar's handle.
 * @param {Event} e Mouse up event.
 * @this {eYo.view.Scrollbar}
 */
eYo.svg.Scrollbar_p.on_mousemove = function(e) {
  var currentMouse = this.horizontal_ ? e.clientX : e.clientY
  var ratio = this.dragLength_ ? (currentMouse - this.dragMin_) / this.dragLength_ : 0
  if (ratio < 0) {
    ration = 0
  } else if (ratio > 1) {
    ratio = 1
  }
  this.board_.doRelativeScroll({[this.horizontal_ ? 'x' : 'y']: ratio})
  eYo.dom.gobbleEvent(e)
}

/**
 * End of scrolling.
 * @param {Event} e Mouse up event.
 * @this {eYo.view.Scrollbar}
 */
eYo.svg.Scrollbar_p.on_mouseup = function() {
  // Tell the board to clean up now that the board is done moving.
  eYo.dom.clearTouchIdentifier()
  this.cleanUp_()
}

/**
 * Stop binding to mouseup and mousemove events.  Call this to
 * wrap up lose ends associated with the scrollbar.
 * @param {eYo.view.Scrollbar}
 * @private
 */
eYo.svg.Scrollbar_p.cleanUp = function(scrollbar) {
  scrollbar.app.hideChaff()
  var bound = scrollbar.dom.bound
  if (bound.mouseup) {
    eYo.dom.unbindEvent(bound.mouseup)
    bound.mouseup = null
  }
  if (bound.mousemove) {
    eYo.dom.unbindEvent(bound.mousemove)
    bound.mousemove = null
  }
}

/**
 * Scroll by one pageful.
 * Called when scrollbar background is clicked.
 * @param {Event} e Mouse down event.
 * @this {eYo.view.Scrollbar}
 * @private
 */
eYo.svg.Scrollbar_p.onBar_mousedown = function(e) {
  var board = this.board_
  board.markFocused()
  eYo.dom.clearTouchIdentifier()  // This is really a click.
  this.cleanUp_()
  if (eYo.dom.isRightButton(e)) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation()
    return
  }
  var mouseWhere = board.eventWhere(e)
  var mouseLocation = this.horizontal_ ? mouseWhere.x : mouseWhere.y

  var rect = this.viewRect
  var handleStart = this.horizontal_ ? rect.origin.x : rect.origin.y
  
  if (mouseLocation <= handleStart) {
    // Decrease the scrollbar's value by a page minus one line.
    board.scrollPage(true)
  } else if (mouseLocation >= handleStart + this.handleLength_) {
    // Increase the scrollbar's value by a page.
    board.scrollPage(false)
  }
  eYo.dom.gobbleEvent(e)
}
