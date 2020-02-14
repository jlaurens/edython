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

/**
 * @name{eYo.pane}
 * @namespace
 */
eYo.view.makeNS(eYo, 'pane')

/**
 * @name{eYo.pane.Dflt}
 * The main focus manager.
 * @param {eYo.widget.Desk} desk -  the owning desk.
 * @constructor
 */
eYo.pane.makeDflt({
  properties: {
    /**
     * The desk of the receiver.
     * @type {eYo.widget.Desk}
     * @readonly
     */
    desk: {
      get () {
        return this.owner_
      },
    },
  },
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
