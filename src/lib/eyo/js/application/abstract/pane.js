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

eYo.require('C9r.Owned')

eYo.forwardDeclare('Desk')

/**
 * The main focus manager.
 * @param {eYo.Desk} desk -  the owning desk.
 * @constructor
 */
eYo.C9r.Owned.makeSubclass('Pane', {
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
eYo.C9r.Pane_p.layout = eYo.Do.nothing

/**
 * Update the metrics of the receiver.
 */
eYo.C9r.Pane_p.updateMetrics = eYo.Do.nothing

/**
 * Place the receiver.
 */
eYo.C9r.Pane_p.place = eYo.Do.nothing
