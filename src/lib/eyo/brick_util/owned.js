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

goog.provide('eYo.Owned')

goog.require('eYo')

goog.forwardDeclare('eYo.Brick')
goog.forwardDeclare('eYo.Slot')
goog.forwardDeclare('eYo.Input')
goog.forwardDeclare('eYo.Magnet')

/**
 * Class for a basic object.
 * 
 * @param {!eYo.Brick|eYo.Input|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @constructor
 */
eYo.Owned = function (bsim) {
  this.owner_ = bsim
  if (bsim instanceof eYo.Input) {
    this.input_ = bsim
    this.brick_ = bsim.brick
  } else if (bsim instanceof eYo.Slot) {
    this.slot_ = bsim
    this.brick_ = bsim.brick
  } else if (bsim instanceof eYo.Magnet) {
    this.magnet_ = bsim
    this.brick_ = bsim.brick
  } else {
    this.brick_ = bsim
  }
}

/**
 * Dispose of the ressources.
 */
eYo.Owned.prototype.dispose = function () {
  this.owner_ = this.brick_ = this.slot_ = this.input_ = this.magnet_ = null
}

// private properties with default values
Object.defineProperties(eYo.Owned.prototype, {
  magnet_: { value: undefined, writable: true },
  slot_: { value: undefined, writable: true },
  input_: { value: undefined, writable: true },
  brick_: { value: undefined, writable: true },
})

// public computed properties

Object.defineProperties(eYo.Owned.prototype, {
  /**
   * @readonly
   * @type {eYo.Brick|eYo.Slot|eYo.Input} each owned object belongs to a brick
   */
  owner: {
    get () {
      return this.owner_
    }
  },
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
   * @type {eYo.Input}  The eventual input containing the object
   */
  input: {
    get () {
      return this.input_
    }
  },
  /**
   * @readonly
   * @type {eYo.Input}  The eventual input containing the object
   */
  magnet: {
    get () {
      return this.magnet_
    }
  },
  /**
   * @readonly
   * @type {eYo.Desk}  The desk...
   */
  factory: {
    get () {
      return this.brick.desk.factory
    }
  },
  /**
   * @readonly
   * @type {eYo.Desk}  The desk...
   */
  desk: {
    get () {
      return this.brick.desk
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
  /**
   * @readonly
   * @type {eYo.Driver}  The ui driver used for rendering.
   */
  ui_driver: {
    get () {
      return this.hasUI && this.factory.ui_driver
    }
  },
})
