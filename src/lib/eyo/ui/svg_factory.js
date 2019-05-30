/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Factory rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Factory')

goog.require('eYo.Svg')

goog.forwardDeclare('eYo.Factory')

/**
 * Initialize the factory SVG ressources.
 * @param {!eYo.Factory} factory
 * @return {!Element} The factory's SVG group.
 */
eYo.Svg.prototype.factoryInit = function(factory) {
  var dom = eYo.Svg.superClass_.factoryInit.call(this, factory)
  if (dom.svg) {
    return
  }
  var svg = dom.svg = Object.create(null)
  // Create surfaces for dragging things. These are optimizations
  // so that the browser does not repaint during the drag.
    // Figure out where we want to put the canvas back.  The order
  // in the dom is important because things are layered.
  if (eYo.Dom.is3dSupported) {
    svg.brickDragSurface = new eYo.Svg.BrickDragSurface(dom.div_)
    svg.workspaceDragSurface = new eYo.Svg.WorkspaceDragSurface(dom.div_)
  }
}

/**
 * Dispose of the factory resources.
 * @param {!eYo.Factory} factory
 */
eYo.Svg.prototype.factoryDispose = eYo.Dom.decorateDispose(function(factory) {
  var dom = factory.dom
  goog.dom.removeNode(dom.svg.group_)
  dom.svg = null
  eYo.Svg.superClass_.factoryDispose.call(this, factory)
})

/**
 * Add a `mousedown` listener.
 * @param {!eYo.Factory} factory
 */
eYo.Svg.prototype.factoryBind_mousedown = function(factory) {
  var dom = factory.dom
  var bound = dom.bound
  if (bound.mousedown) {
    return
  }
  bound.mousedown = this.bindEvent(
    dom.svg.group_,
    'mousedown',
    null,
    this.factoryOn_mousedown.bind(factory),
    {noPreventDefault: true}
  )
}

/**
 * Handle a mouse-down on SVG drawing surface, bound to a factory.
 * NB: this is intentionnaly not a member of `eYo.Factory.prototype`
 * @param {!Event} e Mouse down event.
 * @this {eYo.Factory}
 * @private
 */
eYo.Svg.prototype.factoryOn_mousedown = function(e) {
  var gesture = this.getGesture(e)
  if (gesture) {
    gesture.handleWsStart(e, this)
  }
}

/**
 * Add a `wheel` listener.
 * @param {!eYo.Factory} factory
 */
eYo.Svg.prototype.factoryBind_wheel = function(factory) {
  var bound = factory.dom.bound
  if (bound.wheel) {
    return
  }
  bound.wheel = this.bindEvent(
    factory.dom.svg.group_,
    'wheel',
    null,
    this.factoryOn_wheel.bind(factory)
  )
}

/**
 * Handle a mouse-wheel on SVG drawing surface.
 * Bound to a factory.
 * @param {!Event} e Mouse wheel event.
 * @this {eYo.Factory}
 * @private
 */
eYo.Factory.prototype.factoryOn_wheel = function(e) {
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
 * @param {!eYo.Factory} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.factorySetBrickDisplayMode = function (factory, mode) {
  var canvas = factory.dom.svg.canvas_
  factory.currentBrickDisplayMode && (goog.dom.classlist.remove(canvas, `eyo-${factory.currentBrickDisplayMode}`))
  if ((factory.currentBrickDisplayMode = mode)) {
    goog.dom.classlist.add(canvas, `eyo-${factory.currentBrickDisplayMode}`)
  }
}

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Factory} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.factoryBind_resize = function (factory) {
  var bound = factory.dom.bound
  if (bound.resize) {
    return
  }
  bound.resize = this.bindEvent(
    window,
    'resize',
    null,
    () => {
      eYo.App.hideChaff(true)
      this.factoryResize(factory)
    }
  )
}

/**
 * Translate this factory to new coordinates.
 * @param {!eYo.Factory} mode  The display mode for bricks.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
eYo.Svg.prototype.factoryCanvasMoveTo = function (factory, x, y) {
  var translation = `translate(${x},${y}) scale(${factory.scale})`
  factory.dom.svg.canvas_.setAttribute('transform', translation)
}

/**
 * Prepares the UI for dragging.
 * @param {!eYo.Factory} mode  The display mode for bricks.
 */
eYo.Svg.prototype.factoryStartDrag = function (factory) {
  var element = factory.dom.svg.group_.parentNode.parentNode // div above the `svg` element
  var dragger = factory.dragger_
  dragger.correction_ = this.getTransformCorrection(element)
  var surface = dragger.dragSurface_
  if (surface) {
    var svg = factory.dom.svg
    var previousElement = svg.canvas_.previousSibling
    var width = parseInt(svg.group_.getAttribute('width'), 10)
    var height = parseInt(svg.group_.getAttribute('height'), 10)
    surface.setContentsAndShow(svg.canvas_, previousElement, width, height, this.factory_.scale)
    var coord = eYo.Svg.getRelativeXY(svg.canvas_)
    surface.translateSurface(coord.x, coord.y)
  }
}

/**
 * Prepares the UI for dragging.
 * @param {!eYo.Factory} mode  The display mode for bricks.
 */
eYo.Svg.prototype.factoryDragDeltaXY = function (factory) {
  var deltaXY = factory.gesture_.deltaXY_
  var correction = factory.dragger_.correction_
  return correction ? correction(deltaXY) : deltaXY
}

/**
 * Size the main workspace to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
 * See eYo.Svg.workspaceResizeContents to resize the workspace when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 * @param {!eYo.Factory} factory A factory.
 */
eYo.Svg.factoryResize = eYo.Svg.prototype.factoryResize = function(factory) {
  var div = factory.dom.div_
  var mainWorkspace = factory.mainWorkspace
  var svg = mainWorkspace.dom.svg
  var root = svg.root_
  var width = div.offsetWidth
  var height = div.offsetHeight
  if (svg.cachedWidth_ != width) {
    root.setAttribute('width', width + 'px')
    svg.cachedWidth_ = width
  }
  if (svg.cachedHeight_ != height) {
    root.setAttribute('height', height + 'px')
    svg.cachedHeight_ = height
  }
  mainWorkspace.resize()
}
