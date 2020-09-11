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

eYo.forward('slot')

/**
 * Faceless driver for slots.
 */
eYo.fcls.newDrvrC3s('Slot', {
  methods: {
    /**
     * Whether the slot is displayed.
     * @param {eYo.slot.BaseC3s} slot  the slot to query about
     */
    do_displayedGet: eYo.doNothing,
    /**
     * Display/hide the given slot.
     * @param {eYo.slot.BaseC3s} slot  the slot the driver acts on
     * @param {boolean} yorn
     */
    do_displayedSet: eYo.doNothing,
  },
})

