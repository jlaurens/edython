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
 * @param {!eYo.Workspace} workspace The workspace to sit in.
 * @constructor
 */
eYo.Trashcan = function(workspace, bottom) {
  this.workspace_ = workspace
  this.bottom_ = this.MARGIN_BOTTOM_ + bottom
  if (workspace.hasUI) {
    this.makeUI()
    this.ui_driver.trashcanSetOpen(this, false)
  }
}

Object.defineProperties(eYo.Trashcan.prototype, {
  ui_driver: {
    get () {
      return this.workspace_.ui_driver
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
 * Distance between trashcan and bottom edge of workspace.
 * @type {number}
 * @private
 */
eYo.Trashcan.prototype.MARGIN_BOTTOM_ = 20

/**
 * Distance between trashcan and right edge of workspace.
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
 * @return {!Element} The trash can's SVG group.
 */
eYo.Trashcan.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  this.ui_driver.trashcanInit(this)
}

/**
 * Create the trash can elements.
 * @return {!Element} The trash can's SVG group.
 */
eYo.Trashcan.prototype.createDom = function() {
  throw "USE makeUI instead"
}

/**
 * Dispose of this trash can and its UI.
 */
eYo.Trashcan.prototype.dispose = function() {
  this.ui_driver.trashcanDispose(this)
  this.workspace_ = null
}

/**
 * Move the trash can to the bottom-right corner.
 */
eYo.Trashcan.prototype.position = function() {
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
