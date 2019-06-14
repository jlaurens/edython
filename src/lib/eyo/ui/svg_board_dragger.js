/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview BoardDragger rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.BoardDragger')

goog.require('eYo.Svg')

/**
 * Initializes the boardDragger SVG ressources.
 * @param {!eYo.BoardDragger} boardDragger
 */
eYo.Svg.prototype.boardDraggerInit = eYo.Dom.decorateInit(function(dragger) {
  var dom = dragger.dom
  var svg = dom.svg = Object.create(null)
  svg.dragSurface = null // dragger.desk.dom.svg.boardDragSurface
})

/**
 * Dispose of the given dragger's rendering resources.
 * @param {!eYo.BoardDragger} dragger
 */
eYo.Svg.prototype.boardDraggerDispose = eYo.Dom.decorateDispose(function (dragger) {
  var svg = dragger.dom.svg
  if (svg) {
    svg.dragSurface = null
    dragger.dom.svg = null
  }
})

/**
 * Prepares the UI for dragging.
 * @param {!eYo.BoardDragger} dragger
 */
eYo.Svg.prototype.boardDraggerStart = function (dragger) {
  var element = dragger.board.dom.div_
  dragger.correction_ = eYo.Svg.getTransformCorrection(element)
  var surface = dragger.dragSurface
  if (surface) {
    surface.start(dragger)
  }
}
