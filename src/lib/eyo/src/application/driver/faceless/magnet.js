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

goog.provide('eYo.Driver.Magnet')

/**
 * Faceless driver for magnets.
 */
eYo.Driver.makeSubclass('Magnet')

/**
 * Hilight the given connection.
 * The default implementation does nothing.
 * @param {eYo.Magnet} magnet
 */
eYo.Driver.Magnet.prototype.hilight = eYo.Do.nothing

console.error('hilight -> focusOn?')
