/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Workspace rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Workspace')

goog.require('eYo.Svg')

goog.forwardDeclare('eYo.Workspace')

/**
 * Initialize the workspace SVG ressources.
 * @param {!eYo.Workspace} workspace
 * @return {!Element} The workspace's SVG group.
 */
eYo.Svg.prototype.workspaceInit = function(workspace) {
  var dom = eYo.Svg.superClass_.workspaceInit.call(this, workspace)
  if (dom.svg) {
    return
  }
  var svg = dom.svg = Object.create(null)
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
  
  var div = workspace.factory.dom.div_
  var root = svg.root_ = eYo.Svg.newElement('svg', {
    xmlns: eYo.Dom.SVG_NS,
    'xmlns:html': eYo.Dom.HTML_NS,
    'xmlns:xlink': eYo.Dom.XLINK_NS,
    version: '1.1',
    'class': 'eyo-svg'
  }, div)
  var options = workspace.options
  options.zoom && (workspace.scale = options.zoom.startScale)
  // A null translation will also apply the correct initial scale.
  workspace.xyMoveTo(0, 0)

  /**
  * <g class="eyo-workspace-surface">
  *   <rect class="eyo-main-workspace-background" height="100%" width="100%"></rect>
  *   [Trashcan and/or flyout may go here]
  *   <g class="eyo-brick-canvas"></g>
  * </g>
  * @type {SVGElement}
  */
  var g = svg.group_ = eYo.Svg.newElement(
    'g',
    {'class': 'eyo-workspace-surface'},
    root
  )

  // Note that a <g> alone does not receive mouse events--it must have a
  // valid target inside it.  If no background class is specified, as in the
  // flyout, the workspace will not receive mouse events.
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
  if (!workspace.isFlyout) {
    this.workspaceBind_mousedown(workspace)
    if (workspace.options.zoom && workspace.options.zoom.wheel) {
      this.workspaceBind_wheel(workspace)
    }
  }
  if (!options.readOnly && !options.hasScrollbars) {
    var workspaceChanged = function() {
      if (!workspace.isDragging) {
        var metrics = workspace.getMetrics()
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
          workspace.getTopBricks(false).forEach(brick => {
            var xy = brick.xyInWorkspace
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
    workspace.addChangeListener(workspaceChanged)
  }
  // The SVG is now fully assembled.
  this.factoryResize(workspace.factory)

  this.workspaceBind_resize(workspace)
  eYo.Dom.bindDocumentEvents()

  if (options.hasScrollbars) {
    workspace.scrollbar = new eYo.ScrollbarPair(workspace)
    workspace.scrollbar.resize()
  }

  return g
}

/**
 * Dispose of the workspace SVG ressources.
 * @param {!eYo.Workspace} workspace
 */
eYo.Svg.prototype.workspaceDispose = function(workspace) {
  var dom = workspace.dom
  if (dom) {
    eYo.Dom.clearBoundEvents(workspace)
    goog.dom.removeNode(dom.svg.group_)
    svg.group_ = svg.canvas_ = null
    dom.svg = null
  }
  eYo.Svg.superClass_.workspaceDispose.call(this, workspace)
}

/**
 * Add a `mousedown` listener.
 * @param {!eYo.Workspace} workspace
 */
eYo.Svg.prototype.workspaceBind_mousedown = function(workspace) {
  var dom = workspace.dom
  var bound = dom.bound
  if (bound.mousedown) {
    return
  }
  bound.mousedown = this.bindEvent(
    dom.svg.group_,
    'mousedown',
    null,
    this.workspaceOn_mousedown.bind(workspace),
    {noPreventDefault: true}
  )
}

/**
 * Handle a mouse-down on SVG drawing surface, bound to a workspace.
 * NB: this is intentionnaly not a member of `eYo.Workspace.prototype`
 * @param {!Event} e Mouse down event.
 * @this {eYo.Workspace}
 * @private
 */
eYo.Svg.prototype.workspaceOn_mousedown = function(e) {
  var gesture = this.getGesture(e)
  if (gesture) {
    gesture.handleWsStart(e, this)
  }
}

/**
 * Add a `wheel` listener.
 * @param {!eYo.Workspace} workspace
 */
eYo.Svg.prototype.workspaceBind_wheel = function(workspace) {
  var bound = workspace.dom.bound
  if (bound.wheel) {
    return
  }
  bound.wheel = this.bindEvent(
    workspace.dom.svg.group_,
    'wheel',
    null,
    this.workspaceOn_wheel.bind(workspace)
  )
}

/**
 * Handle a mouse-wheel on SVG drawing surface.
 * Bound to a workspace.
 * @param {!Event} e Mouse wheel event.
 * @this {eYo.Workspace}
 * @private
 */
eYo.Svg.prototype.workspaceOn_wheel = function(e) {
  // TODO: Remove gesture cancellation and compensate for coordinate skew during
  // zoom.
  if (this.currentGesture_) {
    this.currentGesture_.cancel();
  }
  var PIXELS_PER_ZOOM_STEP = 50
  var delta = -e.deltaY / PIXELS_PER_ZOOM_STEP
  var position = this.xyEventInWorkspace(e)
  this.zoom(position.x, position.y, delta)
  e.preventDefault()
}

/**
 * Show or hide the svg.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Workspace} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workspaceVisibleGet = function (workspace) {
  return workspace.dom.svg.root_.style.display !== 'none'
}

/**
 * Show or hide the svg.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Workspace} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workspaceVisibleSet = function (workspace, isVisible) {
  workspace.dom.svg.root_.style.display = isVisible ? 'block' : 'none'
}

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Workspace} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workspaceSetBrickDisplayMode = function (workspace, mode) {
  var canvas = workspace.dom.svg.canvas_
  workspace.currentBrickDisplayMode && (goog.dom.classlist.remove(canvas, `eyo-${workspace.currentBrickDisplayMode}`))
  if ((workspace.currentBrickDisplayMode = mode)) {
    goog.dom.classlist.add(canvas, `eyo-${workspace.currentBrickDisplayMode}`)
  }
}

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Workspace} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workspaceBind_resize = function (workspace) {
  var bound = workspace.dom.bound || Object.create(null)
  if (bound.resize) {
    return
  }
  bound.resize = this.bindEvent(
    window,
    'resize',
    null,
    () => {
      eYo.App.hideChaff()
      workspace.factory.resize()
    }
  )
}

/**
 * Translate this workspace to new coordinates.
 * @param {!eYo.Workspace} mode  The display mode for bricks.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
eYo.Svg.prototype.workspaceCanvasMoveTo = function (workspace, x, y) {
  var translation = `translate(${x},${y}) scale(${workspace.scale})`
  workspace.dom.svg.canvas_.setAttribute('transform', translation)
}

/**
 * Prepares the UI for dragging.
 * @param {!eYo.Workspace} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workspaceStartDrag = function (workspace) {
  var element = workspace.dom.svg.group_.parentNode.parentNode // div above the `svg` element
  var dragger = workspace.dragger_
  dragger.correction_ = this.getTransformCorrection(element)
  var surface = dragger.dragSurface_
  if (surface) {
    var svg = workspace.dom.svg
    var previousElement = svg.canvas_.previousSibling
    var width = parseInt(svg.group_.getAttribute('width'), 10)
    var height = parseInt(svg.group_.getAttribute('height'), 10)
    surface.setContentsAndShow(svg.canvas_, previousElement, width, height, this.workspace_.scale)
    var coord = eYo.Svg.getRelativeXY(svg.canvas_)
    surface.translateSurface(coord.x, coord.y)
  }
}

/**
 * Prepares the UI for dragging.
 * @param {!eYo.Workspace} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workspaceDragDeltaXY = function (workspace) {
  var deltaXY = workspace.gesture_.deltaXY_
  var correction = workspace.dragger_.correction_
  return correction ? correction(deltaXY) : deltaXY
}

/**
 * Size the SVG image to completely fill its container. Call this when the view
 * actually changes sizes (e.g. on a window resize/device orientation change).
 * See Blockly.resizeSvgContents to resize the workspace when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 * @param {!Blockly.WorkspaceSvg} workspace Any workspace in the SVG.
 */
eYo.Svg.prototype.resize = function(workspace) {
  var factory = workspace.factory
  var mainWorkspace = factory.mainWorkspace
  var root = mainWorkspace.dom.svg.root_
  var div = root.parentNode
  if (!div) {
    // Workspace deleted, or something.
    return;
  }
  var width = div.offsetWidth;
  var height = div.offsetHeight;
  if (root.cachedWidth_ != width) {
    root.setAttribute('width', width + 'px');
    root.cachedWidth_ = width;
  }
  if (root.cachedHeight_ != height) {
    root.setAttribute('height', height + 'px');
    root.cachedHeight_ = height;
  }
  mainWorkspace.resize();
}

/**
 * Set the workspace to have focus in the browser.
 * @private
 */
eYo.Svg.prototype.workspaceSetBrowserFocus = function(workspace) {
  // Blur whatever was focused since explicitly grabbing focus below does not
  // work in Edge.
  if (document.activeElement) {
    document.activeElement.blur()
  }
  var root = workspace.dom.svg.root_
  try {
    // Focus the workspace SVG - this is for Chrome and Firefox.
    root.focus()
  } catch (e) {
    // IE and Edge do not support focus on SVG elements. When that fails
    // above, get the factory div (the workspace's parent) and focus that
    // instead.  This doesn't work in Chrome.
    var parent = root.parentNode
    try {
      // In IE11, use setActive (which is IE only) so the page doesn't scroll
      // to the workspace gaining focus.
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
eYo.Svg.prototype.workspaceSizeDidChange = function(workspace) {
  var svg = workspace.dom.svg
  var ctm = svg.root_.getScreenCTM()
  svg.inverseScreenCTM_ = ctm ? ctm.inverse() : null
}

/**
 * Update the inverted screen CTM.
 */
eYo.Svg.prototype.workspaceMouseInRoot = function(workspace, e) {
  var svg = workspace.dom.svg
  return Blockly.utils.mouseToSvg(e, svg.root_,
    svg.inverseScreenCTM_)
}

/**
 * Zooming the blocks centered in (x, y) coordinate with zooming in or out.
 * @param {eYo.Workspace} workspace
 * @param {number} x X coordinate of center.
 * @param {number} y Y coordinate of center.
 * @param {number} amount Amount of zooming
 *                        (negative zooms out and positive zooms in).
 */
eYo.Svg.prototype.workspaceZoom = function(workspace, x, y, amount) {
  var options = workspace.options.zoom
  goog.asserts.assert(options, 'Forbidden zoom with no zoom options')
  var speed = options.scaleSpeed
  var metrics = workspace.getMetrics()
  var svg = workspace.dom.svg
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
  var newScale = workspace.scale * scaleChange;
  if (newScale > options.maxScale) {
    scaleChange = options.maxScale / workspace.scale
  } else if (newScale < options.minScale) {
    scaleChange = options.minScale / workspace.scale
  }
  if (workspace.scale == newScale) {
    return // No change in zoom.
  }
  if (workspace.scrollbar) {
    var matrix = CTM
        .translate(x * (1 - scaleChange), y * (1 - scaleChange))
        .scale(scaleChange)
    // newScale and matrix.a should be identical (within a rounding error).
    // ScrollX and scrollY are in pixels.
    workspace.scrollX = matrix.e - metrics.absolute.left
    workspace.scrollY = matrix.f - metrics.absolute.top
  }
  workspace.scale = newScale
}

/**
 * Return the absolute coordinates of the top-left corner of this element,
 * scales that after canvas SVG element, if it's a descendant.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 * @private
 */
eYo.Svg.prototype.workspaceXYElement = function(workspace, element) {
  var x = 0;
  var y = 0;
  var scale = 1
  var canvas = workspace.dom.svg.canvas_
  if (goog.dom.contains(canvas, element)) {
    // Before the SVG canvas, scale the coordinates
    scale = workspace.scale
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
  } while ((element = element.parentNode) && element != workspace.dom.svg.root_)
  return new goog.math.Coordinate(x, y);
}
