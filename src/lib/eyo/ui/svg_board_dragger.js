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
eYo.Svg.prototype.boardDraggerInit = function(dragger) {
  if (dragger.dom) {
    return
  }
  var dom = this.basicInit(dragger)
  var svg = dom.svg
  svg.dragSurface = dragger.desk.dom.svg.boardDragSurface
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {!eYo.BoardDragger} boardDragger
 */
eYo.Svg.prototype.boardDraggerDispose = eYo.Dom.decorateDispose(function (boardDragger) {
  var svg = boardDragger.dom.svg
  if (svg) {
    svg.dragSurface = null
    dom.svg = null
  }
})
