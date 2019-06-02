/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Desk rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Desk')

goog.require('eYo.Svg')

goog.forwardDeclare('eYo.Desk')

/**
 * Initialize the desk SVG ressources.
 * @param {!eYo.Desk} desk
 * @return {!Element} The desk's SVG group.
 */
eYo.Svg.prototype.deskInit = function(desk) {
  if (desk.dom) {
    return
  }
  var dom = eYo.Svg.superClass_.deskInit.call(this, desk)
  var svg = dom.svg = Object.create(null)
  // Create surfaces for dragging things. These are optimizations
  // so that the browser does not repaint during the drag.
    // Figure out where we want to put the canvas back.  The order
  // in the dom is important because things are layered.
  if (eYo.Dom.is3dSupported) {
    svg.brickDragSurface = new eYo.Svg.BrickDragSurface(dom.div_)
    svg.boardDragSurface = new eYo.Svg.BoardDragSurface(dom.div_)
  }
}

/**
 * Dispose of the desk resources.
 * @param {!eYo.Desk} desk
 */
eYo.Svg.prototype.deskDispose = eYo.Dom.decorateDispose(function(desk) {
  var dom = desk.dom
  goog.dom.removeNode(dom.svg.group_)
  dom.svg = null
  eYo.Svg.superClass_.deskDispose.call(this, desk)
})

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Desk} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.deskSetBrickDisplayMode = function (desk, mode) {
  var canvas = desk.dom.svg.canvas_
  desk.currentBrickDisplayMode && (goog.dom.classlist.remove(canvas, `eyo-${desk.currentBrickDisplayMode}`))
  if ((desk.currentBrickDisplayMode = mode)) {
    goog.dom.classlist.add(canvas, `eyo-${desk.currentBrickDisplayMode}`)
  }
}

/**
 * Size the main board to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
 * See eYo.Svg.boardResizeContents to resize the board when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 * @param {!eYo.Desk} desk A desk.
 */
eYo.Svg.deskResize = eYo.Svg.prototype.deskResize = function(desk) {
  var mainBoard = desk.mainBoard
  var svg = mainBoard.dom.svg
  var size = svg.size
  var root = svg.root_
  var div = desk.dom.div_
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
  mainBoard.resize()
}

/**
 * Return the coordinates of the top-left corner of this element relative to
 * the div blockly was injected into.
 * @param {!eYo.Desk}
 * @param {!Element} element SVG element to find the coordinates of. If this is
 *     not a child of the div blockly was injected into, the behaviour is
 *     eYo.VOID.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 */
eYo.Svg.prototype.deskXYElement = function(desk, element) {
  var x = 0
  var y = 0
  while (element && element !== desk.dom.div_) {
    var xy = eYo.Svg.getRelativeXY(element)
    var scale = eYo.Svg.getScale_(element)
    x = (x * scale) + xy.x
    y = (y * scale) + xy.y
    element = element.parentNode
  }
  return new goog.math.Coordinate(x, y)
}
