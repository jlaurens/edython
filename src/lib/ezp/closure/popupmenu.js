/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview The goog.ui.PopupMenu with custom class, at least.
 */

goog.provide('ezP.PopupMenu')

goog.require('goog.ui.PopupMenu')

/**
 * A basic menu class.
 * @param {?goog.dom.DomHelper=} optDomHelper Optional DOM helper.
 * @param {?goog.ui.MenuRenderer=} optRenderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.MenuRenderer}.
 * @extends {goog.ui.Menu}
 * @constructor
 */
ezP.PopupMenu = function (optDomHelper, optRenderer) {
  goog.ui.PopupMenu.call(this, optDomHelper,
    optRenderer || ezP.MenuRenderer.getInstance())
}
goog.inherits(ezP.PopupMenu, goog.ui.PopupMenu)
goog.tagUnsealableClass(ezP.PopupMenu)
