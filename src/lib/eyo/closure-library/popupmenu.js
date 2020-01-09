/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview The goog.ui.PopupMenu with custom class, at least.
 */

goog.require('goog.ui.PopupMenu')

eYo.provide('popupMenu')

/**
 * A basic menu class.
 * @param {goog.dom.DomHelper=} [optDomHelper] Optional DOM helper.
 * @param {goog.ui.MenuRenderer=} [optRenderer] Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.MenuRenderer}.
 * @extends {goog.ui.Menu}
 * @constructor
 */
eYo.popupMenu = function (optDomHelper, optRenderer) {
  goog.ui.PopupMenu.call(this, optDomHelper,
    optRenderer || /** goog.ui.MenuRenderer */ eYo.MenuRenderer.getInstance())
}
goog.inherits(eYo.popupMenu, goog.ui.PopupMenu)
goog.tagUnsealableClass(eYo.popupMenu)
