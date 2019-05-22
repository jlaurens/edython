/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Renderer with css class in C9r.
 *
 * @author jerome.laurens@u-bourgogne.fr
 */

goog.provide('eYo.MenuRenderer')

goog.require('eYo')
goog.require('goog.ui.MenuRenderer')

/**
 * Default renderer for {@link eYo.Menu}s, based on {@link
 * goog.ui.Menu}.
 * JL: default menu class changed.
 * @param {string=} optAriaRole Optional ARIA role used for the element.
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
eYo.MenuRenderer = function (optAriaRole) {
  goog.ui.MenuRenderer.call(/** goog.ui.MenuRenderer */this, optAriaRole)
}
goog.inherits(eYo.MenuRenderer, goog.ui.MenuRenderer)
goog.addSingletonGetter(eYo.MenuRenderer)

eYo.MenuRenderer.CSS_CLASS = 'eyo-menu'

/** @override */
eYo.MenuRenderer.prototype.getCssClass = function () {
  return eYo.MenuRenderer.CSS_CLASS
}
