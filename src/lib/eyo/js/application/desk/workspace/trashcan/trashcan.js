/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Model of a trash can.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

/**
 * Class for a trash can.
 * @param {eYo.Workspace} workspace The workspace to sit in.
 * @constructor
 */
eYo.control.newC9r('TrashCan', {
  properties: {
    isOpen: {
      get () {
        return this.driver.openGet(this)
      }
    },
    /**
     * Height of the trash can image.
     * @type {number}
     * @private
     */
    HEIGHT_: {
      get () {
        return this.BODY_HEIGHT_ + this.LID_HEIGHT_
      },
    },
    /**
     * Height of the trash can image (minus lid).
     * @type {number}
     * @private
     */
    BODY_HEIGHT_: 44,
    /**
     * Height of the lid image.
     * @type {number}
     * @private
     */
    LID_HEIGHT_: 16,
    /**
     * Extent of hotspot on all sides beyond the size of the image.
     * @type {number}
     * @private
     */
    MARGIN_HOTSPOT_: 10,
    /**
     * Location of trash can in sprite image.
     * @type {number}
     * @private
     */
    SPRITE_LEFT_: 0,
    /**
     * Location of trash can in sprite image.
     * @type {number}
     * @private
     */
    SPRITE_TOP_: 32,
  },
  methods: {
    /**
     * Move the trash can to the bottom-right corner.
     */
    place (bottom) {
      eYo.control.TrashCan[eYo.$].C9r_s.place.call(this, bottom)
      this.driver.place(this)
    },
    /**
     * Return the deletion rectangle for this trash can.
     * @return {eYo.geom.Rect} Rectangle in which to delete.
     */
    getClientRect () {
      return this.driver.clientRect(this)
    },
    /**
     * Flip the lid shut.
     * Called externally after a drag.
     */
    close () {
      this.driver.openSet(this, false)
    },
  },
})
