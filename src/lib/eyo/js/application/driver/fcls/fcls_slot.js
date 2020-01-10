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

eYo.require('fcls')

eYo.provide('fcls.slot')

eYo.forwardDeclare('slot')

/**
 * Faceless driver for slots.
 */
eYo.fcls.makeDriverClass('Slot')

/**
 * Whether the slot is displayed.
 * @param {eYo.slot.Dflt} slot  the slot to query about
 */
eYo.fcls.Slot.prototype.displayedGet = eYo.do.nothing

/**
 * Display/hide the given slot.
 * @param {eYo.slot.Dflt} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.fcls.Slot.prototype.displayedSet = eYo.do.nothing

