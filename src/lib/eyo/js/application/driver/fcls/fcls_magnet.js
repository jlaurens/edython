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

eYo.provide('fcls.magnet')

eYo.forwardDeclare('magnet')

/**
 * Faceless driver for magnets.
 */
eYo.fcls.makeDriverClass('Magnet')

/**
 * Hilight the given connection.
 * The default implementation does nothing.
 * @param {eYo.Magnet.Dflt} magnet
 */
eYo.fcls.Magnet.prototype.hilight = eYo.do.nothing

console.error('hilight -> focusOn?')
