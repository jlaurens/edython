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

goog.require('eYo.WorkspaceControl')

goog.provide('eYo.TrashCan')

/**
 * Class for a trash can.
 * @param {!eYo.Workspace} workspace The workspace to sit in.
 * @constructor
 */
eYo.TrashCan = function(workspace) {
  eYo.TrashCan.superClass_.constructor.call(this, workspace)
}
goog.inherits(eYo.TrashCan, eYo.WorkspaceControl)

Object.defineProperties(eYo.TrashCan.prototype, {
  isOpen: {
    get () {
      return this.ui_driver_mgr.openGet(this)
    }
  },
})

Object.defineProperties(eYo.TrashCan.prototype, {
  /**
   * Height of the trash can image (minus lid).
   * @type {number}
   * @private
   */
  BODY_HEIGHT_: {value: 44, writable: true},
  /**
   * Height of the lid image.
   * @type {number}
   * @private
   */
  LID_HEIGHT_: {value: 16, writable: true},
  /**
   * Extent of hotspot on all sides beyond the size of the image.
   * @type {number}
   * @private
   */
  MARGIN_HOTSPOT_: {value: 10, writable: true},
  /**
   * Location of trash can in sprite image.
   * @type {number}
   * @private
   */
  SPRITE_LEFT_: {value: 0, writable: true},
  /**
   * Location of trash can in sprite image.
   * @type {number}
   * @private
   */
  SPRITE_TOP_: {value: 32, writable: true},
})

Object.defineProperties(eYo.TrashCan.prototype, {
    /**
   * Height of the trash can image.
   * @type {number}
   * @private
   */
  HEIGHT_: {value: eYo.TrashCan.prototype.BODY_HEIGHT_ + eYo.TrashCan.prototype.LID_HEIGHT_},
})

/**
 * Create the trash can elements.
 */
eYo.TrashCan.prototype.initUI = eYo.Decorate.makeInitUI(eYo.TrashCan, function() {
  this.ui_driver_mgr.initUI(this)
})

/**
 * Dispose of this trash's UI.
 */
eYo.TrashCan.prototype.disposeUI = eYo.Decorate.makeInitUI(eYo.TrashCan, function() {
  this.ui_driver_mgr.disposeUI(this)
})

/**
 * Move the trash can to the bottom-right corner.
 */
eYo.TrashCan.prototype.place = function(bottom) {
  eYo.TrashCan.superClass_.place.call(this, bottom)
  this.ui_driver_mgr.place(this)
}

/**
 * Return the deletion rectangle for this trash can.
 * @return {eYo.Rect} Rectangle in which to delete.
 */
eYo.TrashCan.prototype.getClientRect = function() {
  return this.ui_driver_mgr.clientRect(this)
}

/**
 * Flip the lid shut.
 * Called externally after a drag.
 */
eYo.TrashCan.prototype.close = function() {
  this.ui_driver_mgr.openSet(this, false)
}
