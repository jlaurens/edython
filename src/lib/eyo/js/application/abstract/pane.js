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

goog.require('eYo.Owned')

goog.provide('eYo.Pane')

goog.forwardDeclare('eYo.Desk')

/**
 * The main focus manager.
 * @param {!eYo.Desk} desk,  the owning desk.
 * @constructor
 */
eYo.Pane = function (desk) {
  eYo.Pane.superClass_.constructor.call(this, desk)
}
goog.inherits(eYo.Pane, eYo.Owned.UI)

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
 * Layout the receiver.
 * The default implementation does nothing.
 */
eYo.Pane.prototype.layout = eYo.Do.nothing

/**
 * Update the metrics of the receiver.
 */
eYo.Pane.prototype.updateMetrics = eYo.Do.nothing

/**
 * Place the receiver.
 */
eYo.Pane.prototype.place = eYo.Do.nothing
