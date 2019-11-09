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

goog.require('eYo.Driver')

goog.provide('eYo.Driver.Slot')

/**
 * Faceless driver for fields.
 */
eYo.Driver.makeSubclass('Slot')

/**
 * Whether the slot is displayed.
 * @param {!eYo.Slot} slot  the slot to query about
 */
eYo.Driver.Slot.prototype.displayedGet = eYo.Do.nothing

/**
 * Display/hide the given slot.
 * @param {!eYo.Slot} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.Slot.prototype.displayedSet = eYo.Do.nothing

