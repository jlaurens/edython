/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview The goog.ui.PopupMenu with custom class, at least.
 */

goog.provide('edY.PopupMenu')

goog.require('goog.ui.PopupMenu')

/**
 * A basic menu class.
 * @param {?goog.dom.DomHelper=} optDomHelper Optional DOM helper.
 * @param {?goog.ui.MenuRenderer=} optRenderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.MenuRenderer}.
 * @extends {goog.ui.Menu}
 * @constructor
 */
edY.PopupMenu = function (optDomHelper, optRenderer) {
  goog.ui.PopupMenu.call(this, optDomHelper,
    optRenderer || edY.MenuRenderer.getInstance())
}
goog.inherits(edY.PopupMenu, goog.ui.PopupMenu)
goog.tagUnsealableClass(edY.PopupMenu)
