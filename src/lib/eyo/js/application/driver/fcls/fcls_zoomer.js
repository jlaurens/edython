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

eYo.forward('control.Zoomer')

/**
 * Faceless driver for the zoomer.
 */
eYo.fcls.makeDriverC9r('Zoomer')

/**
 * Initiate the zoomer UI.
 * @param {eYo.control.Zoomer} trashCan  The zoomer we must initialize the UI.
 */
eYo.fcls.Zoomer_p.doInitUI = eYo.doNothing

/**
 * Dispose of the zoomer UI.
 * @param {eYo.control.Zoomer} zoomer  The zoomer we must dispose the UI of.
 */
eYo.fcls.Zoomer_p.doDisposeUI = eYo.doNothing
