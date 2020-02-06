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

eYo.forwardDeclare('Desk')

/**
 * @name{eYo.pane}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'pane')

/**
 * The main focus manager.
 * @param {eYo.Desk} desk -  the owning desk.
 * @constructor
 */
eYo.pane.makeDflt({
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
eYo.pane.Dflt_p.layout = eYo.do.nothing

/**
 * Update the metrics of the receiver.
 */
eYo.pane.Dflt_p.updateMetrics = eYo.do.nothing

/**
 * Place the receiver.
 */
eYo.pane.Dflt_p.place = eYo.do.nothing
