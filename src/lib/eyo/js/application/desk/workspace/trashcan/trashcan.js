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

eYo.require('WorkspaceControl')

/**
 * Class for a trash can.
 * @param {eYo.Workspace} workspace The workspace to sit in.
 * @constructor
 */
eYo.WorkspaceControl.makeInheritedC9r('TrashCan')

Object.defineProperties(eYo.TrashCan_p, {
  isOpen: {
    get () {
      return this.ui_driver.openGet(this)
    }
  },
})

Object.defineProperties(eYo.TrashCan_p, {
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

Object.defineProperties(eYo.TrashCan_p, {
    /**
   * Height of the trash can image.
   * @type {number}
   * @private
   */
  HEIGHT_: {value: eYo.TrashCan_p.BODY_HEIGHT_ + eYo.TrashCan_p.LID_HEIGHT_},
})

/**
 * Move the trash can to the bottom-right corner.
 */
eYo.TrashCan_p.place = function(bottom) {
  eYo.TrashCan.SuperProto_.place.Call(this, bottom)
  this.ui_driver.place(this)
}
console.error('NYI: what does the inherited place do?')
/**
 * Return the deletion rectangle for this trash can.
 * @return {eYo.c9r.Rect} Rectangle in which to delete.
 */
eYo.TrashCan_p.getClientRect = function() {
  return this.ui_driver.clientRect(this)
}

/**
 * Flip the lid shut.
 * Called externally after a drag.
 */
eYo.TrashCan_p.Close = function() {
  this.ui_driver.openSet(this, false)
}
