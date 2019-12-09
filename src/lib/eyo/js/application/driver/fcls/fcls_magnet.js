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

eYo.require('eYo.ns.Fcls')

eYo.provide('eYo.ns.Fcls.Magnet')

eYo.forwardDeclare('eYo.Magnet')

/**
 * Faceless driver for magnets.
 */
eYo.ns.Fcls.makeDriverClass('Magnet')

/**
 * Hilight the given connection.
 * The default implementation does nothing.
 * @param {eYo.Magnet} magnet
 */
eYo.ns.Fcls.Magnet.prototype.hilight = eYo.Do.nothing

console.error('hilight -> focusOn?')
