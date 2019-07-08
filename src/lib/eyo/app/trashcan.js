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

goog.require('eYo')

goog.require('goog.Timer')
goog.require('goog.math')


/**
 * Class for a trash can.
 * @param {!eYo.Board} board The board to sit in.
 * @constructor
 */
eYo.Trashcan = function(board, bottom) {
  this.board_ = board
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
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
  ui_driver: {
    get () {
      return this.board_.ui_driver
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

/**
 * Width of both the trash can and lid images.
 * @type {number}
 * @private
 */
eYo.Trashcan.prototype.WIDTH_ = 47

/**
 * Height of the trashcan image (minus lid).
 * @type {number}
 * @private
 */
eYo.Trashcan.prototype.BODY_HEIGHT_ = 44

/**
 * Height of the lid image.
 * @type {number}
 * @private
 */
eYo.Trashcan.prototype.LID_HEIGHT_ = 16

/**
 * Distance between trashcan and bottom edge of board.
 * @type {number}
 * @private
 */
eYo.Trashcan.prototype.MARGIN_BOTTOM_ = 20

/**
 * Distance between trashcan and right edge of board.
 * @type {number}
 * @private
 */
eYo.Trashcan.prototype.MARGIN_SIDE_ = 20

/**
 * Extent of hotspot on all sides beyond the size of the image.
 * @type {number}
 * @private
 */
eYo.Trashcan.prototype.MARGIN_HOTSPOT_ = 10

/**
 * Location of trashcan in sprite image.
 * @type {number}
 * @private
 */
eYo.Trashcan.prototype.SPRITE_LEFT_ = 0

/**
 * Location of trashcan in sprite image.
 * @type {number}
 * @private
 */
eYo.Trashcan.prototype.SPRITE_TOP_ = 32

/**
 * Create the trash can elements.
 */
eYo.Trashcan.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  delete this.disposeUI
  this.ui_driver.trashcanInit(this)
}

/**
 * Dispose of this trash's UI.
 */
eYo.Trashcan.prototype.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  this.ui_driver.trashcanDispose(this)
  delete this.makeUI
}

/**
 * Dispose of this trash can and its UI.
 */
eYo.Trashcan.prototype.dispose = function() {
  this.disposeUI()
  this.board_ = null
  this.viewRect_.dispose()
  this.viewRect_ = null
}

/**
 * Move the trash can to the bottom-right corner.
 */
eYo.Trashcan.prototype.place = function() {
  var board = this.board_
  var view = this.board_.metrics.view
  var r = this.viewRect_
  var flyout = board.flyout_
  r.right = (flyout && flyout.atRight
    ? flyout.viewRect.left
    : view.left) - this.MARGIN_SIDE_
  r.y_max = view.bottom - this.MARGIN_SIDE_
  this.ui_driver && this.ui_driver.trashcanPlace(this)
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
