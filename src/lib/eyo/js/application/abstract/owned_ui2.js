/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Basic object owned by either a brick or a slot.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.UI.Constructor')
goog.require('eYo.UI.Owned')

goog.provide('eYo.Owned.UI2')

goog.forwardDeclare('eYo.Brick')
goog.forwardDeclare('eYo.Brick.UI')
goog.forwardDeclare('eYo.Slot')
goog.forwardDeclare('eYo.Magnet')

/**
 * Class for a basic object indirectly owned by a brick.
 * 
 * @param {!eYo.Brick|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is indirectly owned by a brick.
 * @constructor
 * @readonly
 * @property {eYo.Brick.UI} ui  The ui object used for rendering.
 * @readonly
 * @property {eYo.Brick} slot  The brick.
 * @readonly
 * @property {eYo.Slot} slot  The slot.
 * @readonly
 * @property {eYo.Magnet} slot  The magnet.
 */

eYo.UI.Constructor.make({
  key: 'UI2',
  owner: eYo.Owned,
  super: eYo.UI.Owned,
  props: {
    link: ['slot', 'brick', 'magnet'],
    computed: {
      ui () {
        return this.brick.ui
      }
    }
  }
})

eYo.UI.Owned.prototype.ownerDidChange = function (before, after) {
  var super_ = eYo.UI.Owned.superClass_.ownerDidChange
  super_ && super_call(this, before, after)
  this.slot_ = this.brick_ = this.magnet_ = eYo.NA
  if (after instanceof eYo.Slot) {
    this.slot_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.Magnet) {
    this.magnet_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.Brick) {
    this.brick_ = after
  }
}
