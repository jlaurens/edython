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

goog.provide('eYo.Driver.TrashCan')

/**
 * Faceless driver for the trash can.
 */
eYo.Driver.makeSubclass('TrashCan')

/**
 * Initiate the trash can UI.
 * @param {!eYo.TrashCan} trashCan  The trash can we must initialize the UI.
 */
// eYo.Driver.TrashCan.prototype.initUI = eYo.Do.nothing

/**
 * Dispose of the trash can UI.
 * @param {!eYo.TrashCan} trashCan  The trash can we must dispose the UI of.
 */
// eYo.Driver.TrashCan.prototype.disposeUI = eYo.Do.nothing

/**
 * Is the given trash can open.
 * @param {!eYo.TrashCan} trashCan  The trash can we must query.
 */
eYo.Driver.TrashCan.prototype.openGet = eYo.Do.nothing

/**
 * Set the given trash can open status.
 * @param {!eYo.TrashCan} trashCan  The trash can we must set.
 * @param {Boolean} torf  The expected value.
 */
eYo.Driver.TrashCan.prototype.openSet = eYo.Do.nothing

/**
 * Place the given trash can.
 * @param {!eYo.TrashCan} trashCan  The trash can we must place.
 */
eYo.Driver.TrashCan.prototype.place = eYo.Do.nothing

/**
 * Get the given trash can's client rect.
 * @param {!eYo.TrashCan} trashCan  The trash can we must query.
 */
eYo.Driver.TrashCan.prototype.clientRect = eYo.Do.nothing
