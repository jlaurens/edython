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

eYo.forwardDeclare('motion')

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param{eYo.Motion} [motion] -  the owning motion
 * @constructor
 * @property {eYo.Motion} motion - the motion used to create this scaler
 * @property {Boolean} active - whether the receiver is active
 */
eYo.C9r.makeClass(eYo, 'Scaler', {
  init (motion) {
    this.motion_ = motion
  },
  value: {
    active: false,
    motion: eYo.isNA,
  },
})

/**
 * @return {Boolean} Whether a scale operation did start.
 */
eYo.Scaler_p.Start = function () {
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
eYo.Scaler_p.Cancel = function () {
}

/**
 * Conclude a scale operation.
 * @return {!Boolean} Whether the scale opertion did conclude.
 */
eYo.Scaler_p.Complete = function () {
}
