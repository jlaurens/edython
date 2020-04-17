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

/**
 * Scaler.
 * @param{eYo.event.Motion} [motion] -  the owning motion
 * @constructor
 * @property {eYo.event.Motion} motion - the motion used to create this scaler
 * @property {Boolean} active - whether the receiver is active
 */
eYo.event.makeC9r('Scaler', eYo.o3d.BaseC9r, {
  properties: {
    active: false,
  },
  aliases: {
    owner: 'motion',
  },
  methods: {
    /**
     * Start a transition.
     */
    start: function () {
      this.reset()
    },
    /**
     * Resets a transition.
     */
    reset: function () {
      this.cancel()
    },
    /**
     * Update a transition.
     */
    update: function () {
    },
    /**
     * Cancel a scaling operation.
     */
    cancel: function () {
    },
    /**
     * Conclude a scale operation.
     * @return {!Boolean} Whether the scale opertion did conclude.
     */
    complete: function () {
    },
  }
})
