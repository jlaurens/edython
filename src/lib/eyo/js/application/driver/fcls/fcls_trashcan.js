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

eYo.require('Fcls')

eYo.provide('Fcls.TrashCan')

eYo.forwardDeclare('TrashCan')

/**
 * Faceless driver for the trash can.
 */
eYo.Fcls.makeDriverClass('TrashCan')

/**
 * Initiate the trash can UI.
 * @param {eYo.TrashCan} trashCan  The trash can we must initialize the UI.
 */
// eYo.Fcls.TrashCan.prototype.doInitUI = eYo.Do.nothing

/**
 * Dispose of the trash can UI.
 * @param {eYo.TrashCan} trashCan  The trash can we must dispose the UI of.
 */
// eYo.Fcls.TrashCan.prototype.doDisposeUI = eYo.Do.nothing

/**
 * Is the given trash can open.
 * @param {eYo.TrashCan} trashCan  The trash can we must query.
 */
eYo.Fcls.TrashCan.prototype.openGet = eYo.Do.nothing

/**
 * Set the given trash can open status.
 * @param {eYo.TrashCan} trashCan  The trash can we must set.
 * @param {Boolean} torf  The expected value.
 */
eYo.Fcls.TrashCan.prototype.openSet = eYo.Do.nothing

/**
 * Place the given trash can.
 * @param {eYo.TrashCan} trashCan  The trash can we must place.
 */
eYo.Fcls.TrashCan.prototype.place = eYo.Do.nothing

/**
 * Get the given trash can's client rect.
 * @param {eYo.TrashCan} trashCan  The trash can we must query.
 */
eYo.Fcls.TrashCan.prototype.clientRect = eYo.Do.nothing
