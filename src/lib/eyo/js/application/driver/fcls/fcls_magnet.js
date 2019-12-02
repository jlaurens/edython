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

eYo.require('eYo.Fcls')

eYo.provide('eYo.Fcls.Magnet')

eYo.forwardDeclare('eYo.Magnet')

/**
 * Faceless driver for magnets.
 */
eYo.Fcls.makeDriverClass('Magnet')

/**
 * Hilight the given connection.
 * The default implementation does nothing.
 * @param {eYo.Magnet} magnet
 */
eYo.Fcls.Magnet.prototype.hilight = eYo.Do.nothing

console.error('hilight -> focusOn?')
