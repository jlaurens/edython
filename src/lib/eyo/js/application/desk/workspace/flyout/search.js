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

goog.require('eYo.Section')

goog.provide('eYo.Search')

/**
 * Class for a flyout.
 * @param {!eYo.Board} owner  The owning board, which must be a main board.
 * @param {!Object} options Dictionary of options for the board.
 * @constructor
 */
eYo.Search = function(owner) {
  eYo.Search.superClass_.constructor.call(this.owner)
  this.board_ = new eYo.Board(this, {})
  this.initUI()
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
eYo.Search.prototype.initUI = function () {
  delete this.disposeUI
  this.initUI = eYo.Do.nothing
  this.board_.initUI()
}

/**
 * Dispose of this flyout UI resources.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Search.prototype.disposeUI = function() {
  delete this.initUI
  this.disposeUI = eYo.Do.nothing
  this.board_.disposeUI()
  var d = this.ui_driver_mgr
  this.toolbar_ && d.toolbarDisposeUI(this.toolbar_)
  d.disposeUI(this)
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

eYo.Debug.test() // remove this line when finished
