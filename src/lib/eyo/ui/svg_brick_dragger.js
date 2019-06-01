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
eYo.Svg.prototype.brickDraggerInit = function(dragger) {
  if (dragger.dom) {
    return
  }
  var dom = this.basicInit(dragger)
  var svg = dom.svg
  svg.dragSurface = dragger.factory.dom.svg.brickDragSurface
}

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
  var div = brickDragger.factory.dom.div_
  brickDragger.dom.transformCorrection_ = eYo.Do.getTransformCorrection(div)
  // Move the brick dragged to the drag surface
    // The translation for drag surface bricks,
  // is equal to the current relative-to-surface position,
  // to keep the position in sync as it moves on/off the surface.
  var brick = brickDragger.brick_
  var xy = this.brickXYInWorkspace(brick)
  this.removeAttribute(brick.dom.svg.group_, 'transform')
  var dragSurface = brickDragger.factory.dom.svg.brickDragSurface_
  dragSurface.xyMoveTo(xy.x, xy.y)
  // Execute the move on the top-level SVG component
  dragSurface.setBricksAndShow(brick.dom.svg.group_)
}

/**
 * End dragging.
 * @param {!eYoBrickDragger} dragger
 */
eYo.Svg.prototype.brickDraggerEnd = function (dragger) {
  dragger.dom.transformCorrection_ = null
  this.disconnectStop()
  var dXY = dragger.delta_
  var newLoc = goog.math.Coordinate.sum(dragger.xyStart_, dXY)
  var b3k = dragger.brick_
  // Translate to current position, turning off 3d.
  var dXY = dragger.destination.fromPixelUnit(delta)
  var newLoc = goog.math.Coordinate.sum(dragger.xyStart_, dXY)
  b3k.ui.xyMoveTo(newLoc)
  b3k.factory.dom.svg.brickDragSurface.clearAndHide(b3k.workspace.dom.svg.canvas_)
}
