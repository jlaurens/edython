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

eYo.forwardDeclare('view.TrashCan')

/**
 * @name {eYo.fcls.TrashCan}
 * @constructor
 * Faceless driver for the trash can.
 */
eYo.fcls.makeDriverC9r('TrashCan')

/**
 * Initiate the trash can UI.
 * @param {eYo.view.TrashCan} trashCan  The trash can we must initialize the UI.
 */
// eYo.fcls.TrashCan.prototype.doInitUI = eYo.do.nothing

/**
 * Dispose of the trash can UI.
 * @param {eYo.view.TrashCan} trashCan  The trash can we must dispose the UI of.
 */
// eYo.fcls.TrashCan.prototype.doDisposeUI = eYo.do.nothing

/**
 * Is the given trash can open.
 * @param {eYo.view.TrashCan} trashCan  The trash can we must query.
 */
eYo.fcls.TrashCan.prototype.openGet = eYo.do.nothing

/**
 * Set the given trash can open status.
 * @param {eYo.view.TrashCan} trashCan  The trash can we must set.
 * @param {Boolean} torf  The expected value.
 */
eYo.fcls.TrashCan.prototype.openSet = eYo.do.nothing

/**
 * Place the given trash can.
 * @param {eYo.view.TrashCan} trashCan  The trash can we must place.
 */
eYo.fcls.TrashCan.prototype.place = eYo.do.nothing

/**
 * Get the given trash can's client rect.
 * @param {eYo.view.TrashCan} trashCan  The trash can we must query.
 */
eYo.fcls.TrashCan.prototype.clientRect = eYo.do.nothing
