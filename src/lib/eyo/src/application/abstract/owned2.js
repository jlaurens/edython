/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Basic object owned by either a brick, a slot or an input.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Owned.UI2')

goog.require('eYo.Owned')

goog.forwardDeclare('eYo.Brick')
goog.forwardDeclare('eYo.Brick.UI')
goog.forwardDeclare('eYo.Slot')
goog.forwardDeclare('eYo.Magnet')

/**
 * Class for a basic object indirectly owned by a brick.
 * 
 * @param {!eYo.Brick|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is indirectly owned by a brick.
 * @constructor
 */
eYo.Owned.UI2 = function (bsm) {
  eYo.Owned.UI2.superClass_.constructor.call(this, bsim)
  if (bsm instanceof eYo.Slot) {
    this.slot_ = bsm
    this.brick_ = bsm.brick
  } else if (bsm instanceof eYo.Magnet) {
    this.magnet_ = bsm
    this.brick_ = bsm.brick
  } else {
    this.brick_ = bsm
  }
}

goog.inherits(eYo.Owned.UI2, eYo.Owned)

/**
 * Dispose of the ressources, sever the links.
 */
eYo.Owned.UI2.prototype.dispose = function () {
  this.brick_ = this.slot_ = this.magnet_ = null
  eYo.Owned.UI2.superClass_.dispose.call(this)
}

// private properties with default values
Object.defineProperties(eYo.Owned.UI2.prototype, {
  magnet__: { value: eYo.VOID, writable: true},
  slot__: { value: eYo.VOID, writable: true},
  brick__: { value: eYo.VOID, writable: true},
})

// public computed properties

Object.defineProperties(eYo.Owned.UI2.prototype, {
  /**
   * @readonly
   * @type {eYo.Brick}  each object belongs to a brick
   */
  brick: {
    get () {
      return this.brick_
    }
  },
  /**
   * @readonly
   * @type {eYo.Slot}  The eventual slot containing the object
   */
  slot: {
    get () {
      return this.slot_
    }
  },
  /**
   * @readonly
   * @type {eYo.Magnet}  The eventual magnet containing the object
   */
  magnet: {
    get () {
      return this.magnet_
    }
  },
  /**
   * @readonly
   * @type {eYo.Brick.UI}  The ui object used for rendering.
   */
  ui: {
    get () {
      return this.brick.ui
    }
  },
})
