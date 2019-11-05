/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Search section of the flyout.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Search')

goog.require('eYo.Section')

/**
 * Class for a flyout.
 * @param {!eYo.Board} owner  The owning board, which must be a main board.
 * @param {!Object} options Dictionary of options for the board.
 * @constructor
 */
eYo.Search = function(owner) {
  eYo.Search.superClass_.constructor.call(this.owner)
  this.board_ = new eYo.Board(this, {})
  this.makeUI()
}
goog.inherits(eYo.Search, eYo.Section)

Object.defineProperties(eYo.Search.prototype, {
  /**
   * @type {eYo.Board} The board inside the flyout.
   */
  board: {
    get () {
      return this.board_
    }
  },
})

/**
 * Make the UI
 */
eYo.Search.prototype.makeUI = function () {
  delete this.disposeUI
  this.makeUI = eYo.Do.nothing
  this.board_.makeUI()
}

/**
 * Dispose of this flyout UI resources.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Search.prototype.disposeUI = function() {
  delete this.makeUI
  this.disposeUI = eYo.Do.nothing
  this.board_.disposeUI()
  var d = this.ui_driver
  this.toolbar_ && d.searchToolbarDispose(this.toolbar_)
  d.searchDispose(this)
  eYo.Property.dispose(this, "scrollbar_")
}

/**
 * Dispose of this flyout.
 * Sever all links.
 */
eYo.Search.prototype.dispose = function() {
  this.disposeUI()
  eYo.Property.dispose(this, "viewRect_")
  if (!this.filterWrapper_) {
    this.owner_.removeChangeListener(this.filterWrapper_)
  }
  this.board_.dispose()
  this.owner_ = this.board_ = null
  this.dispose = eYo.Do.nothing
}
