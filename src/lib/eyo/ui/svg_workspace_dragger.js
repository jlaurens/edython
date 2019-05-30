/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview WorkspaceDragger rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.WorkspaceDragger')

goog.require('eYo.Svg')

/**
 * Initializes the workspaceDragger SVG ressources.
 * @param {!eYo.WorkspaceDragger} workspaceDragger
 */
eYo.Svg.prototype.workspaceDraggerInit = function(workspaceDragger) {
  var dom = this.basicInit(workspaceDragger)
  var svg = dom.svg
  if (svg) {
    return
  }
  svg = dom.svg = Object.create(null)
  svg.dragSurface = workspaceDragger.factory.dom.svg.workspaceDragSurface
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {!eYo.WorkspaceDragger} workspaceDragger
 */
eYo.Svg.prototype.workspaceDraggerDispose = eYo.Dom.decorateDispose(function (workspaceDragger) {
  var svg = workspaceDragger.dom.svg
  if (svg) {
    svg.dragSurface = null
    dom.svg = null
  }
})
