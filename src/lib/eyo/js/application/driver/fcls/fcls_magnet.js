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

eYo.forward('magnet')

/**
 * Faceless driver for magnets.
 */
eYo.fcls.newDriverC9r('Magnet')

/**
 * Hilight the given connection.
 * The default implementation does nothing.
 * @param {eYo.magnet.BaseC9r} magnet
 */
eYo.fcls.Magnet.prototype.hilight = eYo.doNothing

console.error('hilight -> focusOn?')
