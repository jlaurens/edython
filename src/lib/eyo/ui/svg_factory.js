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
  if (factory.dom) {
    return
  }
  var dom = eYo.Svg.superClass_.factoryInit.call(this, factory)
  var svg = dom.svg = Object.create(null)
  // Create surfaces for dragging things. These are optimizations
  // so that the browser does not repaint during the drag.
    // Figure out where we want to put the canvas back.  The order
  // in the dom is important because things are layered.
  if (eYo.Dom.is3dSupported) {
    svg.brickDragSurface = new eYo.Svg.BrickDragSurface(dom.div_)
    svg.deskDragSurface = new eYo.Svg.DeskDragSurface(dom.div_)
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
 * Size the main desk to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
 * See eYo.Svg.deskResizeContents to resize the desk when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 * @param {!eYo.Factory} factory A factory.
 */
eYo.Svg.factoryResize = eYo.Svg.prototype.factoryResize = function(factory) {
  var mainDesk = factory.mainDesk
  var svg = mainDesk.dom.svg
  var size = svg.size
  var root = svg.root_
  var div = factory.dom.div_
  var width = div.offsetWidth
  var height = div.offsetHeight
  if (size.width != width) {
    root.setAttribute('width', width + 'px')
    size.width = width
  }
  if (size.height != height) {
    root.setAttribute('height', height + 'px')
    size.height = height
  }
  mainDesk.resize()
}

/**
 * Return the coordinates of the top-left corner of this element relative to
 * the div blockly was injected into.
 * @param {!eYo.Factory}
 * @param {!Element} element SVG element to find the coordinates of. If this is
 *     not a child of the div blockly was injected into, the behaviour is
 *     undefined.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 */
eYo.Svg.prototype.factoryXYElement = function(factory, element) {
  var x = 0
  var y = 0
  while (element && element !== factory.dom.div_) {
    var xy = eYo.Svg.getRelativeXY(element)
    var scale = eYo.Svg.getScale_(element)
    x = (x * scale) + xy.x
    y = (y * scale) + xy.y
    element = element.parentNode
  }
  return new goog.math.Coordinate(x, y)
}
