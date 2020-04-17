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
eYo.fcls.makeDriverC9r('Slot')

/**
 * Whether the slot is displayed.
 * @param {eYo.slot.BaseC9r} slot  the slot to query about
 */
eYo.fcls.Slot.prototype.displayedGet = eYo.doNothing

/**
 * Display/hide the given slot.
 * @param {eYo.slot.BaseC9r} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.fcls.Slot.prototype.displayedSet = eYo.doNothing

