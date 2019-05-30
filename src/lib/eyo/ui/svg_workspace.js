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
  if (workspace.dom) {
    return
  }
  var dom = eYo.Svg.superClass_.workspaceInit.call(this, workspace)
  if (!dom) {
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
    class="blocklySvg">
    ...
  </svg>
  */
  
  var div = workspace.factory.dom.div_
  var root = svg.root_ = eYo.Svg.createElement('svg', {
    xmlns: eYo.Dom.SVG_NS,
    'xmlns:html': eYo.Dom.HTML_NS,
    'xmlns:xlink': eYo.Dom.XLINK_NS,
    version: '1.1',
    'class': 'eyo-svg'
  }, div)

  options.zoomOptions && (workspace.scale = options.zoomOptions.startScale)
  // A null translation will also apply the correct initial scale.
  workspace.xyMoveTo(0, 0)

  if (!options.readOnly && !options.hasScrollbars) {
    var workspaceChanged = function() {
      if (!workspace.isDragging()) {
        var metrics = workspace.getMetrics()
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
            // Bump any brick that's off the right back inside ???
            var overflowRight = edgeLeft + metrics.viewWidth - MARGIN -
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
  workspace.ui_driver.factoryResize(factory)

  workspace.ui_driver.workspaceBind_resize(workspace)
  eYo.Dom.bindDocumentEvents_()

  if (options.hasScrollbars) {
    workspace.scrollbar = new Blockly.ScrollbarPair(workspace);
    workspace.scrollbar.resize();
  }

  // Load the sounds.
  if (options.hasSounds) {
    eYo.Dom.loadSounds_(options.pathToMedia, workspace)
  }

  /**
  * <g class="eyo-workspace-surface">
  *   <rect class="eyo-main-background" height="100%" width="100%"></rect>
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
  if (!workspace.isFlyout) {
    this.workspaceBind_mousedown(workspace)
    if (workspace.options.zoomOptions && workspace.options.zoomOptions.wheel) {
      this.workspaceBind_wheel(workspace)
    }
  }

  return g
}

/**
 * Initializes the workspace SVG ressources.
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
eYo.Workspace.prototype.workspaceOn_wheel = function(e) {
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
      Blockly.hideChaff(true)
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
    var coord = Blockly.utils.getRelativeXY(svg.canvas_)
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
  
  var mainWorkspace = workspace;
  while (mainWorkspace.options.parentWorkspace) {
    mainWorkspace = mainWorkspace.options.parentWorkspace;
  }
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
