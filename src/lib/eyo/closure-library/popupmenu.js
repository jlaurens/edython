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

eYo.require('eYo')

goog.require('goog.ui.PopupMenu')

eYo.provide('eYo.PopupMenu')

/**
 * A basic menu class.
 * @param {!goog.dom.DomHelper=} optDomHelper Optional DOM helper.
 * @param {!goog.ui.MenuRenderer=} optRenderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.MenuRenderer}.
 * @extends {goog.ui.Menu}
 * @constructor
 */
eYo.PopupMenu = function (optDomHelper, optRenderer) {
  goog.ui.PopupMenu.call(this, optDomHelper,
    optRenderer || /** goog.ui.MenuRenderer */ eYo.MenuRenderer.getInstance())
}
goog.inherits(eYo.PopupMenu, goog.ui.PopupMenu)
goog.tagUnsealableClass(eYo.PopupMenu)
