/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview DeskDragger rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.DeskDragger')

goog.require('eYo.Svg')

/**
 * Initializes the deskDragger SVG ressources.
 * @param {!eYo.DeskDragger} deskDragger
 */
eYo.Svg.prototype.deskDraggerInit = function(dragger) {
  if (dragger.dom) {
    return
  }
  var dom = this.basicInit(dragger)
  var svg = dom.svg
  svg.dragSurface = dragger.factory.dom.svg.deskDragSurface
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {!eYo.DeskDragger} deskDragger
 */
eYo.Svg.prototype.deskDraggerDispose = eYo.Dom.decorateDispose(function (deskDragger) {
  var svg = deskDragger.dom.svg
  if (svg) {
    svg.dragSurface = null
    dom.svg = null
  }
})
