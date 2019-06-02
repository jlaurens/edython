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

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.math');
goog.require('goog.math.Rect');


/**
 * Class for a trash can.
 * @param {!eYo.Desk} desk The desk to sit in.
 * @constructor
 */
eYo.Trashcan = function(desk, bottom) {
  this.desk_ = desk
  this.disposeUI = eYo.Do.nothing
  if (desk.hasUI) {
    this.makeUI(bottom)
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
      return this.desk_.ui_driver
    }
  },
  isOpen: {
    get () {
      return this.dom && !!this.dom.isOpen
    }
  },
  top: {
    get () {
      return this.bottom_ + this.BODY_HEIGHT_ + this.LID_HEIGHT_
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
 * Distance between trashcan and bottom edge of desk.
 * @type {number}
 * @private
 */
eYo.Trashcan.prototype.MARGIN_BOTTOM_ = 20

/**
 * Distance between trashcan and right edge of desk.
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
 * @param {Number} bottom
 */
eYo.Trashcan.prototype.makeUI = function(bottom) {
  this.makeUI = eYo.Do.nothing
  delete this.disposeUI
  this.bottom_ = this.MARGIN_BOTTOM_ + bottom
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
  this.desk_ = null
}

/**
 * Move the trash can to the bottom-right corner.
 */
eYo.Trashcan.prototype.place = function() {
  var metrics = this.desk_.getMetrics()
  if (!metrics) {
    // There are no metrics available (desk is probably not visible).
    return;
  }
  this.left_ = metrics.view.width + metrics.absolute.left -
      this.WIDTH_ - this.MARGIN_SIDE_ - eYo.Scrollbar.thickness

  if (metrics.flyout && metrics.flyout.anchor === eYo.Flyout.AT_RIGHT) {
    var flyoutPosition = this.desk_.flyout_.positionInPixels
    if (flyoutPosition) {
      this.left_ = flyoutPosition.x -
      this.WIDTH_ - this.MARGIN_SIDE_ - eYo.Scrollbar.thickness
    } else {
      this.left_ -= metrics.flyout.width
    }
  }
  this.top_ = metrics.view.height + metrics.absolute.top -
      (this.BODY_HEIGHT_ + this.LID_HEIGHT_) - this.bottom_;

  this.ui_driver.trashcanPlace(this)
}

/**
 * Return the deletion rectangle for this trash can.
 * @return {goog.math.Rect} Rectangle in which to delete.
 */
eYo.Trashcan.prototype.getClientRect = function() {
  if (!this.dom) {
    return null
  }
  return this.ui_driver.trashcanClientRect(trashcan)
}

/**
 * Flip the lid shut.
 * Called externally after a drag.
 */
eYo.Trashcan.prototype.close = function() {
  this.ui_driver.trashcanSetOpen(this, false)
}
