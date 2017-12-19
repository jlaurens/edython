/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Renderer with css class in Ctor.
 *
 * @author jerome.laurens@u-bourgogne.fr
 */

goog.provide('ezP.MenuRenderer')

goog.require('ezP')
goog.require('goog.ui.MenuRenderer')

/**
 * Default renderer for {@link ezP.Menu}s, based on {@link
 * goog.ui.Menu}.
 * JL: default menu class changed.
 * @param {string=} optAriaRole Optional ARIA role used for the element.
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
ezP.MenuRenderer = function (optAriaRole) {
  goog.ui.MenuRenderer.call(this, optAriaRole)
}
goog.inherits(ezP.MenuRenderer, goog.ui.MenuRenderer)
goog.addSingletonGetter(ezP.MenuRenderer)

ezP.MenuRenderer.CSS_CLASS = 'ezp-menu'

/** @override */
ezP.MenuRenderer.prototype.getCssClass = function () {
  return ezP.MenuRenderer.CSS_CLASS
}
