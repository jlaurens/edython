/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.ZoomControls')

goog.require('eYo')

goog.require('goog.dom')


/**
 * Zoom controls model
 * @param {!eYo.Board} board Board to zoom.
 * @constructor
 */
eYo.ZoomControls = function(board, bottom) {
  this.board_ = board
  this.disposeUI = eYo.Do.nothing
  if (board.hasUI) {
    this.makeUI(bottom)
  }
}

Object.defineProperties(eYo.ZoomControls.prototype, {
  /**
   * Width of the zoom controls.
   * @type {number}
   * @private
   */
  WIDTH_: { value: 32 },

  /**
   * Height of the zoom controls.
   * @type {number}
   * @private
   */
  HEIGHT_: { value: 110 },

  /**
   * Distance between zoom controls and bottom edge of board.
   * @type {number}
   * @private
   */
  MARGIN_BOTTOM_: { value: 20 },

  /**
   * Distance between zoom controls and right edge of board.
   * @type {number}
   * @private
   */
  MARGIN_SIDE_: { value: 20 },

  /**
   * Left coordinate of the zoom controls.
   * @type {number}
   * @private
   */
  left_: { value: 20, writable: true },

  /**
   * Top coordinate of the zoom controls.
   * @type {number}
   * @private
   */
  top_: { value: 20, writable: true },

  ui_driver: {
    get () {
      return this.board_.ui_driver
    }
  },
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
  /**
   * Global top coordinate of the zoom controls.
   * @type {number}
   * @private
   */
  top: {
    get () {
      return this.bottom_ + this.HEIGHT_
    }
  },
})

/**
 * Create the zoom controls UI at above the given bottom.
 * @param {Number} bottom
 */
eYo.ZoomControls.prototype.makeUI = function(bottom) {
  this.makeUI = eYo.Do.nothing
  delete this.disposeUI
  this.bottom_ = this.MARGIN_BOTTOM_ + bottom
  this.ui_driver.zoomControlsInit(this)
}

/**
 * Create the zoom controls.
 * @return {!Element} The zoom controls SVG group.
 */
eYo.ZoomControls.prototype.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  delete this.makeUI
  this.ui_driver.zoomControlsDispose(this)
}

/**
 * Dispose of this zoom controls.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.ZoomControls.prototype.dispose = function() {
  this.disposeUI()
  this.board_ = null
};

/**
 * Move the zoom controls to the bottom-right corner.
 */
eYo.ZoomControls.prototype.place = function() {
  var ws = this.board_
  var metrics = ws.metrics
  if (!metrics) {
    // There are no metrics available (board is probably not visible).
    return
  }
  this.left_ = metrics.clip.width + metrics.absolute.x -
      this.WIDTH_ - this.MARGIN_SIDE_ - eYo.Scrollbar.thickness

  if (metrics.flyout && metrics.flyout.anchor === eYo.Flyout.AT_RIGHT) {
    this.left_ -= metrics.flyout.width
  }
  this.top_ = metrics.clip.height + metrics.absolute.y -
      this.HEIGHT_ - this.bottom_
  ws.ui_driver.zoomControlsPlace(this)
}
