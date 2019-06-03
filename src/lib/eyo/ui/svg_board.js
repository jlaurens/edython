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
 * Initialize the board SVG ressources.
 * @param {!eYo.Board} board
 * @return {!Element} The board's SVG group.
 */
eYo.Svg.prototype.boardInit = function(board) {
  if (board.dom) {
    return
  }
  var dom = eYo.Svg.superClass_.boardInit.call(this, board)
  var svg = dom.svg = Object.create(null)
  svg.size = {}
  // Build the SVG DOM.
  /*
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns: html="http://www.w3.org/1999/xhtml"
    xmlns: xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    class="eyo-svg">
    ...
  </svg>
  */
  
  var div = board.desk.dom.div_
  var root = svg.root_ = eYo.Svg.newElement('svg', {
    xmlns: eYo.Dom.SVG_NS,
    'xmlns:html': eYo.Dom.HTML_NS,
    'xmlns:xlink': eYo.Dom.XLINK_NS,
    version: '1.1',
    'class': 'eyo-svg'
  }, div)
  var options = board.options
  options.zoom && (board.scale = options.zoom.startScale)
  // A null translation will also apply the correct initial scale.
  board.xyMoveTo(0, 0)

  /**
  * <g class="eyo-board-surface">
  *   <rect class="eyo-main-board-background" height="100%" width="100%"></rect>
  *   [Trashcan and/or flyout may go here]
  *   <g class="eyo-brick-canvas"></g>
  * </g>
  * @type {SVGElement}
  */
  var g = svg.group_ = eYo.Svg.newElement(
    'g',
    {'class': 'eyo-board-surface'},
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
    {'class': 'eyo-brick-canvas'},
    g
  )
  if (!board.isFlyout) {
    this.boardBind_mousedown(board)
    if (board.options.zoom && board.options.zoom.wheel) {
      this.boardBind_wheel(board)
    }
  }
  if (!options.readOnly && !options.hasScrollbars) {
    var boardChanged = function() {
      if (!board.isDragging) {
        var metrics = board.getMetrics()
        var edgeLeft = metrics.view.left + metrics.absolute.left;
        var edgeTop = metrics.view.top + metrics.absolute.top;
        if (metrics.content.top < edgeTop ||
            metrics.content.top + metrics.content.height >
            metrics.view.height + edgeTop ||
            metrics.content.left <
                (options.RTL ? metrics.view.left : edgeLeft) ||
            metrics.content.left + metrics.content.width > (options.RTL ?
                metrics.view.width : metrics.view.width + edgeLeft)) {
          // One or more blocks may be out of bounds.  Bump them back in.
          var MARGIN = 25;
          board.getTopBricks(false).forEach(brick => {
            var xy = brick.xyInBoard
            var size = brick.size
            // Bump any brick that's above the top back inside.
            var overflowTop = edgeTop + MARGIN - size.height - xy.y;
            if (overflowTop > 0) {
              brick.xyMoveBy(0, overflowTop)
            }
            // Bump any brick that's below the bottom back inside.
            var overflowBottom =
                edgeTop + metrics.view.height - MARGIN - xy.y;
            if (overflowBottom < 0) {
              brick.xyMoveBy(0, overflowBottom)
            }
            // Bump any brick that's off the left back inside.
            var overflowLeft = MARGIN + edgeLeft -
                xy.x - size.width;
            if (overflowLeft > 0) {
              brick.xyMoveBy(overflowLeft, 0);
            }
            // Bump any brick that's off the right back inside ???
            var overflowRight = edgeLeft + metrics.view.width - MARGIN -
                xy.x;
            if (overflowRight < 0) {
              brick.xyMoveBy(overflowRight, 0);
            }
          })
        }
      }
    }
    board.addChangeListener(boardChanged)
  }
  // The SVG is now fully assembled.
  this.deskResize(board.desk)

  this.boardBind_resize(board)
  eYo.Dom.bindDocumentEvents()

  if (options.hasScrollbars) {
    board.scrollbar = new eYo.ScrollbarPair(board)
    board.scrollbar.resize()
  }

  return g
}

/**
 * Dispose of the board SVG ressources.
 * @param {!eYo.Board} board
 */
eYo.Svg.prototype.boardDispose = function(board) {
  var dom = board.dom
  if (dom) {
    eYo.Dom.clearBoundEvents(board)
    goog.dom.removeNode(dom.svg.group_)
    svg.group_ = svg.canvas_ = null
    dom.svg = null
  }
  eYo.Svg.superClass_.boardDispose.call(this, board)
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
    this.gesture_.cancel();
  }
  var PIXELS_PER_ZOOM_STEP = 50
  var delta = -e.deltaY / PIXELS_PER_ZOOM_STEP
  var position = this.xyEventInBoard(e)
  this.zoom(position.x, position.y, delta)
  e.preventDefault()
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
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Board} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.boardSetBrickDisplayMode = function (board, mode) {
  var canvas = board.dom.svg.canvas_
  board.currentBrickDisplayMode && (goog.dom.classlist.remove(canvas, `eyo-${board.currentBrickDisplayMode}`))
  if ((board.currentBrickDisplayMode = mode)) {
    goog.dom.classlist.add(canvas, `eyo-${board.currentBrickDisplayMode}`)
  }
}

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Board} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.boardBind_resize = function (board) {
  var bound = board.dom.bound || Object.create(null)
  if (bound.resize) {
    return
  }
  bound.resize = eYo.Dom.bindEvent(
    window,
    'resize',
    null,
    () => {
      eYo.App.hideChaff()
      board.desk.resize()
    }
  )
}

/**
 * Translate this board to new coordinates.
 * @param {!eYo.Board} mode  The display mode for bricks.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
eYo.Svg.prototype.boardCanvasMoveTo = function (board, x, y) {
  if (x && gog.isDef(x.x)) {
    y = x.y
    x = x.x
  }
  var translation = `translate(${x},${y}) scale(${board.scale})`
  board.dom.svg.canvas_.setAttribute('transform', translation)
}

/**
 * Prepares the UI for dragging.
 * @param {!eYo.Board} mode  The display mode for bricks.
 */
eYo.Svg.prototype.boardStartDrag = function (board) {
  var element = board.dom.svg.group_.parentNode.parentNode // div above the `svg` element
  var dragger = board.dragger_
  dragger.correction_ = eYo.Svg.getTransformCorrection(element)
  var surface = dragger.dragSurface_
  if (surface) {
    var svg = board.dom.svg
    var previousElement = svg.canvas_.previousSibling
    var width = parseInt(svg.group_.getAttribute('width'), 10)
    var height = parseInt(svg.group_.getAttribute('height'), 10)
    surface.setContentsAndShow(svg.canvas_, previousElement, width, height, this.board_.scale)
    var coord = eYo.Svg.getRelativeXY(svg.canvas_)
    surface.translateSurface(coord.x, coord.y)
  }
}

/**
 * Prepares the UI for dragging.
 * @param {!eYo.Board} mode  The display mode for bricks.
 */
eYo.Svg.prototype.boardDragDeltaXY = function (board) {
  var deltaXY = board.gesture_.deltaXY_
  var correction = board.dragger_.correction_
  return correction ? correction(deltaXY) : deltaXY
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
 * Update the inverted screen CTM.
 */
eYo.Svg.prototype.boardSizeDidChange = function(board) {
  var svg = board.dom.svg
  var ctm = svg.root_.getScreenCTM()
  svg.inverseScreenCTM_ = ctm ? ctm.inverse() : null
}

/**
 * Update the inverted screen CTM.
 */
eYo.Svg.prototype.boardMouseInRoot = function(board, e) {
  var svg = board.dom.svg
  return eYo.Svg.locationOfEvent(svg.root_, e, 
    svg.inverseScreenCTM_)
}

/**
 * Zooming the blocks centered in (x, y) coordinate with zooming in or out.
 * @param {eYo.Board} board
 * @param {number} x X coordinate of center.
 * @param {number} y Y coordinate of center.
 * @param {number} amount Amount of zooming
 *                        (negative zooms out and positive zooms in).
 */
eYo.Svg.prototype.boardZoom = function(board, x, y, amount) {
  var options = board.options.zoom
  goog.asserts.assert(options, 'Forbidden zoom with no zoom options')
  var speed = options.scaleSpeed
  var metrics = board.getMetrics()
  var svg = board.dom.svg
  var center = svg.root_.createSVGPoint();
  center.x = x
  center.y = y
  var CTM = svg.canvas_.getCTM()
  center = center.matrixTransform(CTM.inverse())
  x = center.x
  y = center.y
  // Scale factor.
  var scaleChange = Math.pow(speed, amount)
  // Clamp scale within valid range.
  var newScale = board.scale * scaleChange;
  if (newScale > options.maxScale) {
    scaleChange = options.maxScale / board.scale
  } else if (newScale < options.minScale) {
    scaleChange = options.minScale / board.scale
  }
  if (board.scale == newScale) {
    return // No change in zoom.
  }
  if (board.scrollbar) {
    var matrix = CTM
        .translate(x * (1 - scaleChange), y * (1 - scaleChange))
        .scale(scaleChange)
    // newScale and matrix.a should be identical (within a rounding error).
    // ScrollX and scrollY are in pixels.
    board.scrollX = matrix.e - metrics.absolute.left
    board.scrollY = matrix.f - metrics.absolute.top
  }
  board.scale = newScale
}

/**
 * Return the absolute coordinates of the top-left corner of this element,
 * scales that after canvas SVG element, if it's a descendant.
 * The origin (0,0) is the top-left corner of the SVG.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 * @private
 */
eYo.Svg.prototype.boardXYElement = function(board, element) {
  var x = 0;
  var y = 0;
  var scale = 1
  var canvas = board.dom.svg.canvas_
  if (goog.dom.contains(canvas, element)) {
    // Before the SVG canvas, scale the coordinates
    scale = board.scale
  }
  do {
    // Loop through this brick and every parent.
    var xy = eYo.Svg.getRelativeXY(element)
    if (element === canvas) {
      // After the SVG canvas, don't scale the coordinates.
      scale = 1
    }
    x += xy.x * scale;
    y += xy.y * scale;
  } while ((element = element.parentNode) && element != board.dom.svg.root_)
  return new goog.math.Coordinate(x, y);
}
