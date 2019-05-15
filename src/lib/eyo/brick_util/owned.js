/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Basic object owned by either a brick, a slot or an input.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Owned')

goog.forwardDeclare('eYo.Brick')
goog.forwardDeclare('eYo.Slot')
goog.forwardDeclare('eYo.Input')

goog.require('eYo')


/**
 * Class for a basic object.
 * 
 * @param {!eYo.Brick|eYo.Input|eYo.Slot} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @constructor
 */
eYo.Owned = function (bsi) {
  this.owner_ = bsi
  if (bsi instanceof eYo.Input) {
    this.input_ = bsi
    this.brick_ = bsi.brick
  } else if (bsi instanceof eYo.Slot) {
    this.slot_ = bsi
    this.brick_ = bsi.brick
  } else {
    this.brick_ = bsi
  }
}

/**
 * Dispose of the ressources.
 */
eYo.Magnet.prototype.dispose = function () {
  this.owner_ = this.brick_ = this.slot_ = this.input_ = null
}

// private properties with default values
Object.defineProperties(eYo.Owned.prototype, {
  slot_: { value: undefined },
  input_: { value: undefined },
})

// public computed properties

Object.defineProperties(eYo.Magnet.prototype, {
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
   * @type {eYo.Input}  The eventual input containing the object
   */
  input: {
    get () {
      return this.input_
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
   * @type {eYo.Workspace}  The workspace...
   */
  workspace: {
    get () {
      return this.brick.workspace
    }
  },
  /**
   * @readonly
   * @type {eYo.UI}  The ui object used for rendering.
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
      var ui = this.ui
      return ui && ui.driver
    }
  },
})
