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
 * @return {!Element} The board's dom repository.
 */
eYo.Dom.prototype.boardInit = eYo.Dom.decorateInit(function(board) {
  /*
  For the main board, the dom looks like
  <div class="eyo-main-board">
    <div class="eyo-board-drag">
      ...
    </div>
    <div class="eyo-flyout">
      <div class="eyo-flyout-toolbar">
        ...
      </div>
      <div class="eyo-flyout-board">
        <div class="eyo-board-drag">
          ...
        </div>
      </div>
    </div>
    <div class="eyo-board-dragger">
      <div class="eyo-board-drag">
        ...
      </div>
    </div>
    With the next board drag content expanded.
    <div class="eyo-board-drag">
      <div class="eyo-board-scale">
        <div class="eyo-board-content">
          <svg>
          ...
          </svg/>
        </div>
      </div>
    </div>
  </div>
  */
  const dom = board.dom
  Object.defineProperty(dom, 'div_', {
    get () {
      return board.owner.dom.board_
    }
  })
  var d1 = dom.drag_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    'eyo-board-drag'
  )
  var style = d1.style
  style.left = style.top = style.width = style.height = '0px'
  style.overflow = 'visible'
  style.position = 'absolute'
  dom.div_.appendChild(d1)
  var d2 = dom.scale_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    'eyo-board-scale'
  )
  var stl = d2.style
  stl.width = stl.height = '0px'
  stl.overflow = 'visible'
  stl.position = 'absolute'
  d1.appendChild(d2)
  var d3 = dom.content_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    'eyo-board-content'
  )
  stl = d3.style
  stl.overflow = 'visible'
  stl.position = 'absolute'
  d2.appendChild(d3)
  if (board.isMain) {
    const flyout = dom.flyout_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      'eyo-flyout'
    )
    stl = flyout.style
    stl.position = 'absolute'
    stl.display = 'none'
    dom.div_.appendChild(flyout)
    d1 = dom.board_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      'eyo-board-dragger'
    )
    dom.div_.appendChild(d1)
    stl = d1.style
    stl.display = 'none'
    stl.background = 'transparent'
  }
  return dom
})

/**
 * Dispose of the desk dom resources.
 * @param {!eYo.Board} board
 */
eYo.Dom.prototype.boardDispose = eYo.Dom.decorateDispose(function(board) {
  board.dom.div_ = null // do not remove this div from the dom
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
  const root = svg.root_ = eYo.Svg.newElementSvg(null, 'eyo-svg')
  goog.dom.insertChildAt(dom.content_, root, 0)
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
  svg.draftBackground_ = eYo.Svg.newElement(
    'rect',
    {
      height: '100%',
      class: `${options.backgroundClass} eyo-draft`,
      rx: `${eYo.Unit.x}`,
      ry: `${eYo.Unit.y}`,
    },
    g
  )
   /** @type {SVGElement} */
  svg.background_ = eYo.Svg.newElement(
    'svg',
    {},
    g
  )
  eYo.Svg.newElement(
    'rect',
    {
      rx: `${eYo.Unit.x}`,
      ry: `${eYo.Unit.y / 2}`,
      width: '100%',
      height: '100%',
      class: options.backgroundClass
    },
    svg.background_
  )
  eYo.Svg.newElement(
    'line',
    {
      x1: `0`,
      y1: `0`,
      x2: `100%`,
      y2: `100%`,
      stroke: 'red'
    },
    svg.background_
  )
  eYo.Svg.newElement(
    'line',
    {
      x1: `0`,
      y1: `100%`,
      x2: `100%`,
      y2: `0`,
      stroke: 'red'
    },
    svg.background_
  )
  /** @type {SVGElement} */
  svg.canvas_ = eYo.Svg.newElement(
    'g',
    {
      class: 'eyo-brick-canvas',
    },
    g
  )
  // var el = eYo.Svg.newElement(
  //   'rect',
  //   {
  //     width: '100%',
  //     height: '100%',
  //   },
  //   svg.canvas_
  // )
  // el.style.fill = 'blue'
  if (!board.inFlyout) {
    this.boardBind_mousedown(board)
    if (options.zoom && options.zoom.wheel) {
      this.boardBind_wheel(board)
    }
  }
  if (eYo.Dom.is3dSupported) {
    svg.brickDragSurface = new eYo.Svg.BrickDragSurface(dom.div_)
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
 * The default position is near the top left corner.
 * @param {!eYo.Board} board
 */
eYo.Svg.prototype.boardPlace = function(board) {
  var dom = board.dom
  var metrics = board.metrics
  var drag = metrics.drag
  dom.drag_.style.transform = `translate(${drag.x}px,${drag.y}px)`
  var port = metrics.port
  dom.content_.style.transform = `translate(${port.x}px,${port.y}px)`
  var svg = dom.svg
  var r = svg.draftBackground_
  r.setAttribute('x', `${port.x}px`)
  r.setAttribute('y', `${port.y}px`)
  r.setAttribute('width', `${-port.x - eYo.Unit.x / 2}px`)
  r.setAttribute('height', `${port.height}px`)
  r = svg.background_
  r.setAttribute('x', `2px`)
  r.setAttribute('y', `${port.y}px`)
  r.setAttribute('width', `${port.right - 4}px`)
  r.setAttribute('height', `${port.height}px`)
  var root = svg.root_
  root.setAttribute('viewBox', `${port.x} ${port.y} ${port.width} ${port.height}`)
  root.setAttribute('width', `${port.width}px`)
  root.setAttribute('height', `${port.height}px`)
}

/**
 * Dispose of the desk dom resources.
 * @param {!eYo.Board} board
 */
eYo.Svg.prototype.boardDidScale = function(board) {
  board.dom.scale_.style.transform = `scale(${board.metrics.scale})`
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
    gesture.handleBoardStart(e, this)
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
    var center = svg.root_.createSVGPoint()
    center.x = xy.x
    center.y = xy.y
    var CTM = svg.canvas_.getCTM()
    center = center.matrixTransform(CTM.inverse())
    var drag = board.metrics.drag
    var matrix = CTM
        .translate(center.x * (1 - scaleChange), center.y * (1 - scaleChange))
        .scale(scaleChange)
    board.metrics.drag = eYo.Where.xy(matrix.e - drag.x, matrix.f - drag.y)
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
