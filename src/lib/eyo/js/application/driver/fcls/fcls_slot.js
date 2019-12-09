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

eYo.require('eYo.NS_Fcls')

eYo.provide('eYo.NS_Fcls.Slot')

eYo.forwardDeclare('eYo.Slot')

/**
 * Faceless driver for slots.
 */
eYo.NS_Fcls.makeDriverClass('Slot')

/**
 * Whether the slot is displayed.
 * @param {eYo.Slot} slot  the slot to query about
 */
eYo.NS_Fcls.Slot.prototype.displayedGet = eYo.Do.nothing

/**
 * Display/hide the given slot.
 * @param {eYo.Slot} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.NS_Fcls.Slot.prototype.displayedSet = eYo.Do.nothing

