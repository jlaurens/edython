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
eYo.Svg.prototype.boardInit = eYo.Dom.decorateInit(function(board) {
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
  board.moveTo(new eYo.Where())

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
    {class: 'eyo-brick-canvas'},
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
        var metrics = board.metrics
        var edgeLeft = metrics.view.x + metrics.absolute.x;
        var edgeTop = metrics.view.y + metrics.absolute.y;
        if (metrics.content.y_min < edgeTop ||
            metrics.content.y_min + metrics.content.height >
            metrics.view.height + edgeTop ||
            metrics.content.x_min <
                (options.RTL ? metrics.view.x : edgeLeft) ||
            metrics.content.x_min + metrics.content.width > (options.RTL ?
                metrics.view.width : metrics.view.width + edgeLeft)) {
          // One or more blocks may be out of bounds.  Bump them back in.
          var MARGIN = 25;
          board.topBricks.forEach(brick => {
            var xy = brick.whereInBoard
            var size = brick.size
            // Bump any brick that's above the top back inside.
            var overflow = new eYo.Where()
            overflow.y = edgeTop + MARGIN - size.height - xy.y
            if (overflow.y <= 0) {
              // Bump any brick that's below the bottom back inside.
              overflow.y = Math.min(edgeTop + metrics.view.height - MARGIN - xy.y, 0)
            }
            overflow.y = 0
            // Bump any brick that's off the left back inside.
            overflow.x = MARGIN + edgeLeft - xy.x - size.width
            if (overflow.x <= 0) {
              // Bump any brick that's off the right back inside ???
              overflow.x = Math.min(edgeLeft + metrics.view.width - MARGIN - xy.x, 0)
            }
            brick.moveBy(overflow)
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
})

/**
 * Dispose of the board SVG ressources.
 * @param {!eYo.Board} board
 */
eYo.Svg.prototype.boardDispose = eYo.Dom.decorateDispose(function(board) {
  var dom = board.dom
  var svg = dom.svg
  goog.dom.removeNode(svg.root_)
  svg.matrixFromScreen_ = svg.group_ = svg.canvas_ = null
  dom.svg = null
})

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
    var coord = eYo.Svg.getRelativeWhere(svg.canvas_)
    surface.translateSurface(coord.x, coord.y)
  }
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
 * Clean the cached inverted screen CTM.
 */
eYo.Svg.prototype.boardSizeDidChange = function(board) {
  var svg = board.dom.svg
  svg.matrixFromScreen_ = null
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
  return point.matrixTransform(matrix)
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
    board.scroll_.x = matrix.e - absolute.x
    board.scroll_.y = matrix.f - absolute.y
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
