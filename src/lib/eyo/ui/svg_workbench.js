/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Workbench rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Workbench')

goog.require('eYo.Svg')
goog.forwardDeclare('eYo.Workspace')

/**
 * Initialize the workbench SVG ressources.
 * @param {!eYo.Workbench} workbench
 * @return {!Element} The workbench's SVG group.
 */
eYo.Svg.prototype.workbenchInit = function(workbench) {
  if (workbench.dom) {
    return
  }
  var dom = eYo.Svg.superClass_.workbenchInit.call(this, workbench)
  if (!dom) {
    return
  }
  var svg = dom.svg = Object.create(null)
  // Build the SVG DOM.
  /*
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    class="blocklySvg">
    ...
  </svg>
  */

  var root = svg.root_ = eYo.Svg.createElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'eyo-svg'
  }, dom.div_)


  // Create surfaces for dragging things. These are optimizations
  // so that the browser does not repaint during the drag.
  options.brickDragSurface = new eYo.Svg.BrickDragSurface(dom.div_)
  options.workbenchDragSurface = new eYo.WorkbenchDragSurfaceSvg(dom.div_)

  options.zoomOptions && (workbench.scale = options.zoomOptions.startScale)
  // A null translation will also apply the correct initial scale.
  workbench.translate(0, 0)

  if (!options.readOnly && !options.hasScrollbars) {
    var workbenchChanged = function() {
      if (!workbench.isDragging()) {
        var metrics = workbench.getMetrics()
        var edgeLeft = metrics.viewLeft + metrics.absoluteLeft;
        var edgeTop = metrics.viewTop + metrics.absoluteTop;
        if (metrics.contentTop < edgeTop ||
            metrics.contentTop + metrics.contentHeight >
            metrics.viewHeight + edgeTop ||
            metrics.contentLeft <
                (options.RTL ? metrics.viewLeft : edgeLeft) ||
            metrics.contentLeft + metrics.contentWidth > (options.RTL ?
                metrics.viewWidth : metrics.viewWidth + edgeLeft)) {
          // One or more blocks may be out of bounds.  Bump them back in.
          var MARGIN = 25;
          workbench.getTopBricks(false).forEach(brick => {
            var xy = brick.xyInWorkbench
            var size = brick.size
            // Bump any brick that's above the top back inside.
            var overflowTop = edgeTop + MARGIN - size.height - xy.y;
            if (overflowTop > 0) {
              brick.xyMoveBy(0, overflowTop)
            }
            // Bump any brick that's below the bottom back inside.
            var overflowBottom =
                edgeTop + metrics.viewHeight - MARGIN - xy.y;
            if (overflowBottom < 0) {
              brick.xyMoveBy(0, overflowBottom)
            }
            // Bump any brick that's off the left back inside.
            var overflowLeft = MARGIN + edgeLeft -
                xy.x - size.width;
            if (overflowLeft > 0) {
              brick.xyMoveBy(overflowLeft, 0);
            }
            // Bump any brick that's off the right back inside.
            var overflowRight = edgeLeft + metrics.viewWidth - MARGIN -
                xy.x;
            if (overflowRight < 0) {
              brick.xyMoveBy(overflowRight, 0);
            }
          })
        }
      }
    }
    workbench.addChangeListener(workbenchChanged)
  }
  // The SVG is now fully assembled.
  Blockly.svgResize(workbench)

  workbench.ui_driver.workbenchBind_resize(workbench)
  eYo.Dom.bindDocumentEvents_()

  if (options.hasScrollbars) {
    workbench.scrollbar = new Blockly.ScrollbarPair(workbench);
    workbench.scrollbar.resize();
  }

  // Load the sounds.
  if (options.hasSounds) {
    eYo.Dom.loadSounds_(options.pathToMedia, workbench)
  }

  /**
  * <g class="eyo-workbench-surface">
  *   <rect class="eyo-main-background" height="100%" width="100%"></rect>
  *   [Trashcan and/or flyout may go here]
  *   <g class="eyo-brick-canvas"></g>
  * </g>
  * @type {SVGElement}
  */
  var g = svg.group_ = eYo.Svg.newElement(
    'g',
    {'class': 'eyo-workbench-surface'},
    root
  )

  // Note that a <g> alone does not receive mouse events--it must have a
  // valid target inside it.  If no background class is specified, as in the
  // flyout, the workbench will not receive mouse events.
  if (options && options.backgroundClass) {
    /** @type {SVGElement} */
    svg.background_ = eYo.Svg.newElement(
      'rect',
      {'height': '100%', 'width': '100%', 'class': options.backgroundClass},
      g
    )
  }
  /** @type {SVGElement} */
  svg.canvas_ = eYo.Svg.newElement(
    'g',
    {'class': 'eyo-brick-canvas'},
    g
  )
  if (!workbench.isFlyout) {
    this.workbenchBind_mousedown(workbench)
    if (workbench.options.zoomOptions && workbench.options.zoomOptions.wheel) {
      this.workbenchBind_wheel(workbench)
    }
  }

  return g
}

/**
 * Initializes the workbench SVG ressources.
 * @param {!eYo.Workbench} workbench
 */
eYo.Svg.prototype.workbenchDispose = function(workbench) {
  var dom = workbench.dom
  if (dom) {
    eYo.Dom.clearBoundEvents(workbench)
    goog.dom.removeNode(dom.svg.group_)
    svg.group_ = svg.canvas_ = null
    dom.svg = null
  }
  eYo.Svg.superClass_.workbenchDispose.call(this, workbench)
}

/**
 * Add a `mousedown` listener.
 * @param {!eYo.Workbench} workbench
 */
eYo.Svg.prototype.workbenchBind_mousedown = function(workbench) {
  var dom = workbench.dom
  var bound = dom.bound
  if (bound.mousedown) {
    return
  }
  bound.mousedown = this.bindEvent(
    dom.svg.group_,
    'mousedown',
    null,
    this.workbenchOn_mousedown.bind(workbench),
    {noPreventDefault: true}
  )
}

/**
 * Handle a mouse-down on SVG drawing surface, bound to a workbench.
 * NB: this is intentionnaly not a member of `eYo.Workbench.prototype`
 * @param {!Event} e Mouse down event.
 * @this {eYo.Workbench}
 * @private
 */
eYo.Svg.prototype.workbenchOn_mousedown = function(e) {
  var gesture = this.getGesture(e)
  if (gesture) {
    gesture.handleWsStart(e, this)
  }
}

/**
 * Add a `wheel` listener.
 * @param {!eYo.Workbench} workbench
 */
eYo.Svg.prototype.workbenchBind_wheel = function(workbench) {
  var bound = workbench.dom.bound
  if (bound.wheel) {
    return
  }
  bound.wheel = this.bindEvent(
    workbench.dom.svg.group_,
    'wheel',
    null,
    this.workbenchOn_wheel.bind(workbench)
  )
}

/**
 * Handle a mouse-wheel on SVG drawing surface.
 * Bound to a workbench.
 * @param {!Event} e Mouse wheel event.
 * @this {eYo.Workbench}
 * @private
 */
eYo.Workbench.prototype.workbenchOn_wheel = function(e) {
  // TODO: Remove gesture cancellation and compensate for coordinate skew during
  // zoom.
  if (this.currentGesture_) {
    this.currentGesture_.cancel();
  }
  // The vertical scroll distance that corresponds to a click of a zoom button.
  var PIXELS_PER_ZOOM_STEP = 50;
  var delta = -e.deltaY / PIXELS_PER_ZOOM_STEP;
  var position = Blockly.utils.mouseToSvg(e, this.dom.svg.group_,
      this.getInverseScreenCTM())
  this.zoom(position.x, position.y, delta)
  e.preventDefault()
}

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Workbench} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workbenchSetBrickDisplayMode = function (workbench, mode) {
  var canvas = workbench.dom.svg.canvas_
  workbench.currentBrickDisplayMode && (goog.dom.classlist.remove(canvas, `eyo-${workbench.currentBrickDisplayMode}`))
  if ((workbench.currentBrickDisplayMode = mode)) {
    goog.dom.classlist.add(canvas, `eyo-${workbench.currentBrickDisplayMode}`)
  }
}

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Workbench} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workbenchBind_resize = function (workbench) {
  var bound = workbench.dom.bound || Object.create(null)
  if (bound.resize) {
    return
  }
  bound.resize = this.bindEvent(
    window,
    'resize',
    null,
    function() {
      Blockly.hideChaff(true)
      Blockly.svgResize(workbench)
    }
  )
}

/**
 * Translate this workbench to new coordinates.
 * @param {!eYo.Workbench} mode  The display mode for bricks.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
eYo.Svg.prototype.workbenchCanvasMoveTo = function (workbench, x, y) {
  var translation = `translate(${x},${y}) scale(${workbench.scale})`
  workbench.dom.svg.canvas_.setAttribute('transform', translation)
}

/**
 * Prepares the UI for dragging.
 * @param {!eYo.Workbench} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workbenchStartDrag = function (workbench) {
  var element = workbench.dom.svg.group_.parentNode.parentNode // div above the `svg` element
  var dragger = workbench.dragger_
  dragger.correction_ = this.getTransformCorrection(element)
  var surface = dragger.dragSurface_
  if (surface) {
    var svg = workbench.dom.svg
    var previousElement = svg.canvas_.previousSibling
    var width = parseInt(svg.group_.getAttribute('width'), 10)
    var height = parseInt(svg.group_.getAttribute('height'), 10)
    surface.setContentsAndShow(svg.canvas_, previousElement, width, height, this.workbench_.scale)
    var coord = Blockly.utils.getRelativeXY(svg.canvas_)
    surface.translateSurface(coord.x, coord.y)
  }
}

/**
 * Prepares the UI for dragging.
 * @param {!eYo.Workbench} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workbenchDragDeltaXY = function (workbench) {
  var deltaXY = workbench.gesture_.deltaXY_
  var correction = workbench.dragger_.correction_
  return correction ? correction(deltaXY) : deltaXY
}
