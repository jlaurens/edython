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

eYo.require('Fcls')

/**
 * @name {eYo.Fcls.Dnd}
 * Faceless driver for the zoomer.
 */
eYo.provide('Fcls.Dnd')

eYo.forwardDeclare('DnD.Mngr')

/**
 * Faceless driver for the zoomer.
 */
eYo.Fcls.makeDriverClass('Dnd')
