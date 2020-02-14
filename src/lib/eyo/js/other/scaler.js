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

eYo.forwardDeclare('event.Motion')

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param{eYo.event.Motion} [motion] -  the owning motion
 * @constructor
 * @property {eYo.event.Motion} motion - the motion used to create this scaler
 * @property {Boolean} active - whether the receiver is active
 */
eYo.c9r.makeC9r(eYo, 'Scaler', {
  init (motion) {
    this.motion_ = motion
  },
  value: {
    active: false,
    motion: eYo.NA,
  },
})

/**
 * @return {Boolean} Whether a scale operation did start.
 */
eYo.Scaler_p.start = function () {
  this.cancel()
}

/**
 * Update a scale operation.
 * @return {Boolean} Whether a drag operation did update.
 */
eYo.Scaler_p.update = function () {
}

/**
 * Cancel a scaling operation.
 * @return {Boolean} Whether a scale operation did cancel.
 */
eYo.Scaler_p.cancel = function () {
}

/**
 * Conclude a scale operation.
 * @return {!Boolean} Whether the scale opertion did conclude.
 */
eYo.Scaler_p.complete = function () {
}
