/*
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview View base class.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name{eYo.view}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'view')

/**
 * @name{eYo.view.Dflt}
 * The basic view class.
 * @param {*} owner -  the owner.
 * @constructor
 */
eYo.view.makeDflt({
  properties: {
    /**
     * Each view has a view rect.
     * @type {eYo.Desk}
     * @readonly
     */
    viewRect () {
      return new eYo.Rect()
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
