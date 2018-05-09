/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Renderer with css class in C9r.
 *
 * @author jerome.laurens@u-bourgogne.fr
 */

goog.provide('edY.MenuRenderer')

goog.require('edY')
goog.require('goog.ui.MenuRenderer')

/**
 * Default renderer for {@link edY.Menu}s, based on {@link
 * goog.ui.Menu}.
 * JL: default menu class changed.
 * @param {string=} optAriaRole Optional ARIA role used for the element.
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
edY.MenuRenderer = function (optAriaRole) {
  goog.ui.MenuRenderer.call(this, optAriaRole)
}
goog.inherits(edY.MenuRenderer, goog.ui.MenuRenderer)
goog.addSingletonGetter(edY.MenuRenderer)

edY.MenuRenderer.CSS_CLASS = 'edy-menu'

/** @override */
edY.MenuRenderer.prototype.getCssClass = function () {
  return edY.MenuRenderer.CSS_CLASS
}
