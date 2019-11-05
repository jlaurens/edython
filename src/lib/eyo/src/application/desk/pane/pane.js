/*
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Panel base class.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Pane')

goog.require('eYo.Owned')

goog.forwardDeclare('eYo.Desk')

/**
 * The main focus manager.
 * @param {!eYo.Desk} desk,  the owning desk.
 * @constructor
 */
eYo.Pane = function (desk) {
  eYo.Pane.superClass_.constructor.call(this, desk)
}
goog.inherits(eYo.Pane, eYo.Owned)

Object.defineProperties(eYo.Pane.prototype, {
  /**
   * The desk of the receiver.
   * @type {eYo.Desk}
   * @readonly
   */
  desk: {
    get () {
      return this.owner_
    },
  },
})

/**
 * Sever all the links including the focus managers.
 */
eYo.Pane.prototype.dispose = function () {
  this.disposeUI()
  eYo.Pane.superClass_.dispose.call(this)
}

