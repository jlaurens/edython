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

eYo.require('eYo.ns.UI')

eYo.forwardDeclare('eYo.Desk')

/**
 * The main focus manager.
 * @param {eYo.Desk} desk -  the owning desk.
 * @constructor
 */
eYo.ns.UI.makeClass(eYo, 'Pane', {
  computed: {
    /**
     * The desk of the receiver.
     * @type {eYo.Desk}
     * @readonly
     */
    desk () {
      return this.owner_
    }
  }
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
