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

eYo.provide('fcls.zoomer')

eYo.forwardDeclare('zoomer')

/**
 * Faceless driver for the zoomer.
 */
eYo.fcls.makeDriverClass('Zoomer')

/**
 * Initiate the zoomer UI.
 * @param {eYo.Zoomer} trashCan  The zoomer we must initialize the UI.
 */
eYo.fcls.Zoomer.prototype.doInitUI = eYo.do.nothing

/**
 * Dispose of the zoomer UI.
 * @param {eYo.Zoomer} zoomer  The zoomer we must dispose the UI of.
 */
eYo.fcls.Zoomer.prototype.doDisposeUI = eYo.do.nothing
