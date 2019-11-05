/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview brickDragger rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.brickDragger')

goog.require('eYo.Svg')

/**
 * Initializes the brickDragger SVG ressources.
 * @param {!eYo.brickDragger} brickDragger
 */
eYo.Svg.prototype.brickDraggerInit = eYo.Dom.decorateInit(function(dragger) {
  var dom = dragger.dom
  var svg = dom.svg = Object.create(null)
  svg.dragSurface = dragger.board.dom.svg.brickDragSurface
})

/**
 * Dispose of the given slot's rendering resources.
 * @param {!eYo.brickDragger} brickDragger
 */
eYo.Svg.prototype.brickDraggerDispose = eYo.Dom.decorateDispose(function (brickDragger) {
  var svg = brickDragger.dom.svg
  if (svg) {
    svg.dragSurface = null
    dom.svg = null
  }
})

/**
 * Start dragging.
 * @param {!eYo.brickDragger} brickDragger
 */
eYo.Svg.prototype.brickDraggerStart = function (brickDragger) {
  // Move the brick dragged to the drag surface
  // The translation for drag surface bricks,
  // is equal to the current relative-to-surface position,
  // to keep the position in sync as it moves on/off the surface.
  var brick = brickDragger.brick_
  var board = brick.board
  var main = brickDragger.destination
  var stl = main.board_.dom.div_.style
  stl.display = 'block'
  var bds = brickDragger.dragSurface
  // Execute the move on the top-level SVG component
  if (bds) {
    bds.start(brickDragger)
  } else {
    
  }
  // at start the board is centered in the visible area,
  // the whole size is at least 3x3 times the visible area.
  // Prepare the dragging boundaries
  return
  var svg = board.dom.svg
  var canvas = svg.canvas_
  var matrix = canvas.getScreenCTM().inverse()
  var rect = brickDragger.desk
  var point = svg.root_.createSVGPoint()
  point.x = rect.top
  point.y = rect.left
  bds.topLeft_ = eYo.Where.xy(point.matrixTransform(matrix))
  point.x = rect.bottom
  point.y = rect.right
  bds.bottomRight_ = eYo.Where.xy(point.matrixTransform(matrix))
  // While dragging, the visible area must be contained within these limits.
  var limits = bds.limits_ = new eYo.Rect()
  var topBricks = board.topBricks.filter(b3k => b3k.ui && b3k.ui.rendered)
  topBricks.forEach(b3k => limits.union(b3k.ui.boundingRect))
  var brickBoundary = brick.ui.boundingRect
  var a = brickBoundary.w + 2
  limits.c -= a
  limits.c_max += a
  a = brickBoundary.h + 1
  limits.l -= a
  limits.l_max += a
}

/**
 * End dragging.
 * @param {!eYoBrickDragger} dragger
 */
eYo.Svg.prototype.brickDraggerEnd = function (dragger) {
  this.disconnectStop()
  dragger.dragSurface.end(!dragger.wouldDelete_)
}
