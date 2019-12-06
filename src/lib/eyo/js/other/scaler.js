/*
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Board scaler.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo')
eYo.provide('eYo.Scaler')

eYo.forwardDeclare('eYo.Motion')

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param{eYo.Motion} [motion] -  the owning motion
 */
eYo.Scaler = function (motion) {
  this.motion_ = motion
}

Object.defineProperties(eYo.Scaler.prototype, {
  active_: {
    value: false
  }
})

/**
 * Main drag and drop manager.
 * It maintains a list of draggers and droppers
 * * @param{eYo.Application} [desktop] -  the owning desktop
 */
eYo.Scaler.prototype.dispose = function () {
  this.motion_ = null
}

/**
 * @return {Boolean} Whether a scale operation did start.
 */
eYo.Scaler.prototype.start = function () {
  this.cancel()
}

/**
 * Update a scale operation.
 * @return {Boolean} Whether a drag operation did update.
 */
eYo.Scaler.prototype.update = function () {
}

/**
 * Cancel a scaling operation.
 * @return {Boolean} Whether a scale operation did cancel.
 */
eYo.Scaler.prototype.cancel = function () {
}

/**
 * Conclude a scale operation.
 * @return {!Boolean} Whether the scale opertion did conclude.
 */
eYo.Scaler.prototype.complete = function () {
}
