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

eYo.require('c9r.owned')

eYo.forwardDeclare('desk')

/**
 * The main focus manager.
 * @param {eYo.Desk} desk -  the owning desk.
 * @constructor
 */
eYo.c9r.Owned.makeSubclass('Pane', {
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
eYo.c9r.Pane_p.layout = eYo.do.nothing

/**
 * Update the metrics of the receiver.
 */
eYo.c9r.Pane_p.updateMetrics = eYo.do.nothing

/**
 * Place the receiver.
 */
eYo.c9r.Pane_p.place = eYo.do.nothing
