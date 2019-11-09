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

goog.provide('eYo.Driver.Zoomer')

/**
 * Faceless driver for the zoomer.
 */
eYo.Driver.makeSubclass('Zoomer')


/**
 * Initiate the zoomer UI.
 * @param {!eYo.Zoomer} trashCan  The zoomer we must initialize the UI.
 */
eYo.Driver.Zoomer.prototype.initUI = eYo.Do.nothing

/**
 * Dispose of the zoomer UI.
 * @param {!eYo.Zoomer} zoomer  The zoomer we must dispose the UI of.
 */
eYo.Driver.Zoomer.prototype.disposeUI = eYo.Do.nothing
