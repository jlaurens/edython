/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate. Do nothing driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.forward('control.TrashCan')

/**
 * @name {eYo.fcls.TrashCan}
 * @constructor
 * Faceless driver for the trash can.
 */
eYo.fcls.newDriverC9r('TrashCan', {
  methods: {
    /**
     * Is the given trash can open.
     * @param {eYo.control.TrashCan} trashCan  The trash can we must query.
     */
    do_openGet: eYo.doNothing,
    /**
     * Set the given trash can open status.
     * @param {eYo.control.TrashCan} trashCan  The trash can we must set.
     * @param {Boolean} torf  The expected value.
     */
    do_openSet: eYo.doNothing,
    /**
     * Place the given trash can.
     * @param {eYo.control.TrashCan} trashCan  The trash can we must place.
     */
    do_place: eYo.doNothing,
    /**
     * Get the given trash can's client rect.
     * @param {eYo.control.TrashCan} trashCan  The trash can we must query.
     */
    do_clientRect: eYo.doNothing,
  },
})
