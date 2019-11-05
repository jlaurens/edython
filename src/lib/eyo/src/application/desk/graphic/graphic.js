/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Graphic model.
 * The desk is the top object containing bricks.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Graphic')

goog.require('eYo.Owned')
goog.require('eYo.Pane')

/**
 * Class for a graphic.
 * @param {!eYo.Desk} owner Owner application.
 * @constructor
 */
eYo.Graphic = function(owner) {
  eYo.Graphic.superClass_.constructor.call(this, owner)
}
goog.inherits(eYo.Graphic, eYo.Pane)

Object.defineProperties(eYo.Graphic.prototype, {
  /**
   * The desk's trashcan (if any).
   * @type {eYo.Desk}
   */
  desk: {
    get () {
      return this.owner__
    }
  },
})

/**
 * Sever the links.
 */
eYo.Graphic.prototype.dispose = function() {
  eYo.Graphic.superClass_.dispose.call(this, owner)
}
