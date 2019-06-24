/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Board')

goog.require('eYo.Svg')

goog.forwardDeclare('eYo.Board')


/**
 * Initialize the board dom ressources.
 * @param {!eYo.Board} board
 * @param {?Element} container
 * @return {!Element} The board's dom repository.
 */
eYo.Dom.prototype.boardInit = eYo.Dom.decorateInit(function(board) {
  var container = (board.isFlyout
  ? board.desk.flyout
  : board.desk).dom.board_
  var dom = board.dom
  Object.defineProperty(dom, 'div_', {
    value: container,
    writable: true
  })
  return dom
})

/**
 * Dispose of the desk dom resources.
 * @param {!eYo.Board} board
 */
eYo.Dom.prototype.boardDispose = eYo.Dom.decorateDispose(function(board) {
  board.dom.div_ = null
})

/**
 * Initialize the board SVG ressources.
 * @param {!eYo.Board} board
 * @return {!Element} The board's SVG group.
 */
eYo.Svg.prototype.boardInit = function(board) {
  var dom = board.dom
  if (dom) {
    return
  }
  dom = eYo.Svg.superClass_.boardInit.call(this, board)
  var svg = dom.svg = Object.create(null)
  svg.size = {}
  var options = board.options
  const root = svg.root_ = eYo.Svg.newElementSvg(dom.div_, 'eyo-svg')
  root.style.overflow = 'visible'
  root.setAttribute('preserveAspectRatio', 'xMinYMin slice')
  root.style.position = 'absolute'
  /**
  * <g class="eyo-board-surface">
  *   <rect class="eyo-board-background" height="100%" width="100%"></rect>
  *   [Trashcan and/or flyout may go here]
  *   <g class="eyo-brick-canvas"></g>
  * </g>
  * @type {SVGElement}
  */
  var g = svg.group_ = eYo.Svg.newElement(
    'g',
    {class: 'eyo-board-surface'},
    root
  )
  // Note that a <g> alone does not receive mouse events--it must have a
  // valid target inside it.  If no background class is specified, as in the
  // flyout, the board will not receive mouse events.
  /** @type {SVGElement} */
  svg.background_ = eYo.Svg.newElement(
    'rect',
    {
      height: '100%',
      width: '100%',
      class: options.backgroundClass
    },
    g
  )
  /** @type {SVGElement} */
  svg.canvas_ = eYo.Svg.newElement(
    'g',
    {
      class: 'eyo-brick-canvas',
    },
    g
  )
  if (!board.isFlyout) {
    this.boardBind_mousedown(board)
    if (options.zoom && options.zoom.wheel) {
      this.boardBind_wheel(board)
    }
  }
  eYo.Dom.bindDocumentEvents()
  return g
}

/**
 * Dispose of the board SVG ressources.
 * @param {!eYo.Board} board
 */
eYo.Svg.prototype.boardDispose = eYo.Dom.decorateDispose(function(board) {
  var dom = board.dom
  var svg = dom.svg
  goog.dom.removeNode(svg.group_)
  svg.matrixFromScreen_ = svg.group_ = svg.canvas_ = null
  dom.svg = null
})

/**
 * Place the board according to its metrics.
 * @param {!eYo.Board} board
 */
eYo.Svg.prototype.boardPlace = function(board) {
  var metrics = board.metrics
  var content = metrics.content_
  var root = board.dom.svg.root_
  
  root.setAttribute('viewBox', `${content.x} ${content.y} ${content.width} ${content.height}`)
  content = metrics.contentInView
  root.setAttribute('width', `${content.width}px`)
  root.setAttribute('height', `${content.height}px`)
  root.style.transform = `translate(${content.x}px,${content.y}px)`

}

/**
 * Clean the cached inverted screen CTM.
 */
eYo.Svg.prototype.boardResizeContents = function(board) {
  var svg = board.dom.svg
  svg.matrixFromScreen_ = null
}

/**
 * Show or hide the svg.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Board} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.boardVisibleGet = function (board) {
  return board.dom.svg.root_.style.display !== 'none'
}

/**
 * Show or hide the svg.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Board} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.boardVisibleSet = function (board, isVisible) {
  board.dom.svg.root_.style.display = isVisible ? 'block' : 'none'
}

/**
 * Add a `mousedown` listener.
 * @param {!eYo.Board} board
 */
eYo.Svg.prototype.boardBind_mousedown = function(board) {
  var dom = board.dom
  var bound = dom.bound
  if (bound.mousedown) {
    return
  }
  bound.mousedown = eYo.Dom.bindEvent(
    dom.svg.group_,
    'mousedown',
    null,
    this.boardOn_mousedown.bind(board),
    {noPreventDefault: true}
  )
}

/**
 * Handle a mouse-down on SVG drawing surface, bound to a board.
 * NB: this is intentionnaly not a member of `eYo.Board.prototype`
 * @param {!Event} e Mouse down event.
 * @this {eYo.Board}
 * @private
 */
eYo.Svg.prototype.boardOn_mousedown = function(e) {
  var gesture = this.getGesture(e)
  if (gesture) {
    gesture.handleWsStart(e, this)
  }
}

/**
 * Add a `wheel` listener.
 * @param {!eYo.Board} board
 */
eYo.Svg.prototype.boardBind_wheel = function(board) {
  var bound = board.dom.bound
  if (bound.wheel) {
    return
  }
  bound.wheel = eYo.Dom.bindEvent(
    board.dom.svg.group_,
    'wheel',
    null,
    this.boardOn_wheel.bind(board)
  )
}

/**
 * Handle a mouse-wheel on SVG drawing surface.
 * Bound to a board.
 * @param {!Event} e Mouse wheel event.
 * @this {eYo.Board}
 * @private
 */
eYo.Svg.prototype.boardOn_wheel = function(e) {
  // TODO: Remove gesture cancellation and compensate for coordinate skew during
  // zoom.
  if (this.gesture_) {
    this.gesture_.cancel()
  }
  var PIXELS_PER_ZOOM_STEP = 50
  var delta = -e.deltaY / PIXELS_PER_ZOOM_STEP
  this.zoom(e, delta)
  e.preventDefault()
}

/**
 * Translate this board to new coordinates.
 * @param {!eYo.Board} board  The bord owning the canvas.
 * @param {number} xy Translation.
 */
eYo.Svg.prototype.boardCanvasMoveTo = function (board, xy) {
  var transform = `translate(${xy.x},${xy.y}) scale(${board.scale})`
  if (transform.indexOf('NaN')>=0) {
    throw 'MISSED'
  }
  board.dom.svg.canvas_.setAttribute('transform', transform)
}

/**
 * The gesture delta.
 * @param {!eYo.Board} mode  The display mode for bricks.
 */
eYo.Svg.prototype.boardDragDeltaWhere = function (board) {
  var deltaWhere = board.gesture_.deltaWhere_
  var correction = board.dragger_.correction_
  return correction ? correction(deltaWhere) : deltaWhere
}

/**
 * Set the board to have focus in the browser.
 * @private
 */
eYo.Svg.prototype.boardSetBrowserFocus = function(board) {
  // Blur whatever was focused since explicitly grabbing focus below does not
  // work in Edge.
  if (document.activeElement) {
    document.activeElement.blur()
  }
  var root = board.dom.svg.root_
  try {
    // Focus the board SVG - this is for Chrome and Firefox.
    root.focus()
  } catch (e) {
    // IE and Edge do not support focus on SVG elements. When that fails
    // above, get the desk div (the board's parent) and focus that
    // instead.  This doesn't work in Chrome.
    var parent = root.parentNode
    try {
      // In IE11, use setActive (which is IE only) so the page doesn't scroll
      // to the board gaining focus.
      parent.setActive()
    } catch (e) {
      // setActive support was discontinued in Edge so when that fails, call
      // focus instead.
      parent.focus()
    }
  }
}

/**
 * Get the mouse location in board coordinates.
 */
eYo.Svg.prototype.boardEventWhere = function(board, e) {
  var svg = board.dom.svg
  var matrix = svg.matrixFromScreen_
  if (!matrix) {
    matrix = svg.matrixFromScreen_ = svg.root_.getScreenCTM().inverse()
  }
  var point = svg.root_.createSVGPoint()
  point.x = e.clientX
  point.y = e.clientY
  return eYo.Where.xy(point.matrixTransform(matrix))
}

/**
 * Zooming the blocks centered in (x, y) coordinate with zooming in or out.
 * @param {eYo.Board} board
 * @param {eYo.Where} center Coordinates of the center.
 * @param {number} scale  The new scale.
 */
eYo.Svg.prototype.boardZoom = function(board, xy, scaleChange) {
  if (board.scrollbar) {
    var svg = board.dom.svg
    var center = svg.root_.createSVG()
    center.x = xy.x
    center.y = xy.y
    var CTM = svg.canvas_.getCTM()
    center = center.matrixTransform(CTM.inverse())
    x = center.x * (1 - scaleChange)
    y = center.y * (1 - scaleChange)
    var absolute = board.metrics.absolute
    var matrix = CTM
        .translate(x, y)
        .scale(scaleChange)
    board.metrics.scroll = eYo.Where.xy(matrix.e - absolute.x, matrix.f - absolute.y)
  }
}

/**
 * Return the absolute coordinates of the top-left corner of this element,
 * scales that after canvas SVG element, if it's a descendant.
 * The origin (0,0) is the top-left corner of the SVG.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!eYo.Where} Object with .x and .y properties.
 * @private
 */
eYo.Svg.prototype.boardElementWhere = function(board, element) {
  var ans = new eYo.Where()
  var scale = 1
  var canvas = board.dom.svg.canvas_
  if (goog.dom.contains(canvas, element)) {
    // Before the SVG canvas, scale the coordinates
    scale = board.scale
  }
  do {
    // Loop through this brick and every parent.
    var xy = eYo.Svg.getRelativeWhere(element)
    if (element !== canvas) {
      // Before the SVG canvas, scale the coordinates.
      xy.scale(scale)
    }
    ans.forward(xy)
  } while ((element = element.parentNode) && element != board.dom.svg.root_)
  return ans
}
