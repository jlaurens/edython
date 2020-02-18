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

eYo.forwardDeclare('magnet')

/**
 * Faceless driver for magnets.
 */
eYo.fcls.makeDriverC9r('Magnet')

/**
 * Hilight the given connection.
 * The default implementation does nothing.
 * @param {eYo.magnet.Dflt} magnet
 */
eYo.fcls.Magnet.prototype.hilight = eYo.do.nothing

console.error('hilight -> focusOn?')
