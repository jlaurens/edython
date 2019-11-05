/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Model of a trash can.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Trashcan')

goog.require('eYo.Owned')

goog.require('goog.Timer')
goog.require('goog.math')


/**
 * Class for a trash can.
 * @param {!eYo.Board} board The board to sit in.
 * @constructor
 */
eYo.Trashcan = function(board, bottom) {
  eYo.Trashcan.superClass_.constructor.call(this, board)
  var r = this.viewRect_ = new eYo.Rect()
  r.width = this.WIDTH_
  r.height = this.BODY_HEIGHT_ + this.LID_HEIGHT_
  r.y_max = bottom - this.MARGIN_BOTTOM_
  this.disposeUI = eYo.Do.nothing
  if (board.hasUI) {
    this.makeUI()
    this.ui_driver.trashcanSetOpen(this, false)
  }
}

Object.defineProperties(eYo.Trashcan.prototype, {
  board: {
    get () {
      return this.owner
    }
  },
  isOpen: {
    get () {
      return this.dom && !!this.dom.isOpen
    }
  },
  viewRect: {
    get () {
      return this.viewRect_
    }
  },
  top: {
    get () {
      return this.viewRect_.y
    }
  }
})

Object.defineProperties(eYo.Trashcan.prototype, {
  /**
   * Width of both the trash can and lid images.
   * @type {number}
   * @private
   */
  WIDTH_: {value: 47},
  /**
   * Height of the trashcan image (minus lid).
   * @type {number}
   * @private
   */
    BODY_HEIGHT_: {value: 44},
  /**
   * Height of the lid image.
   * @type {number}
   * @private
   */
    LID_HEIGHT_: {value: 16},
  /**
   * Distance between trashcan and bottom edge of board.
   * @type {number}
   * @private
   */
  MARGIN_BOTTOM_: {value: 20},
  /**
   * Distance between trashcan and right edge of board.
   * @type {number}
   * @private
   */
  MARGIN_SIDE_: {value: 20},
  /**
   * Extent of hotspot on all sides beyond the size of the image.
   * @type {number}
   * @private
   */
  MARGIN_HOTSPOT_: {value: 10},
  /**
   * Location of trashcan in sprite image.
   * @type {number}
   * @private
   */
  SPRITE_LEFT_: {value: 0},
  /**
   * Location of trashcan in sprite image.
   * @type {number}
   * @private
   */
  SPRITE_TOP_: {value: 32},
})

/**
 * Create the trash can elements.
 */
eYo.Trashcan.prototype.makeUI = function() {
  this.ui_driver.trashcanInit(this)
  this.makeUI = eYo.Do.nothing
  delete this.disposeUI
}

/**
 * Dispose of this trash's UI.
 */
eYo.Trashcan.prototype.disposeUI = function() {
  this.ui_driver.trashcanDispose(this)
  this.disposeUI = eYo.Do.nothing
  delete this.makeUI
}

/**
 * Dispose of this trash can and its UI.
 */
eYo.Trashcan.prototype.dispose = function() {
  this.disposeUI()
  this.viewRect_.dispose()
  this.viewRect_ = null
  eYo.Trashcan.superClass_.dispose.call(this)
}

/**
 * Move the trash can to the bottom-right corner.
 */
eYo.Trashcan.prototype.place = function() {
  var board = this.board
  var view = board.metrics.view
  var r = this.viewRect_
  var flyout = board.flyout_
  r.right = (flyout && flyout.atRight
    ? flyout.viewRect.left
    : view.left) - this.MARGIN_SIDE_
  r.y_max = view.bottom - this.MARGIN_SIDE_
  this.ui_driver.trashcanPlace(this)
}

/**
 * Return the deletion rectangle for this trash can.
 * @return {eYo.Rect} Rectangle in which to delete.
 */
eYo.Trashcan.prototype.getClientRect = function() {
  if (!this.dom) {
    return null
  }
  return this.ui_driver.trashcanClientRect(this)
}

/**
 * Flip the lid shut.
 * Called externally after a drag.
 */
eYo.Trashcan.prototype.close = function() {
  this.ui_driver.trashcanSetOpen(this, false)
}
