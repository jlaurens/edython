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

eYo.require('Svg')

/**
 * @name {eYo.Svg.Dnd}
 * Faceless driver for the zoomer.
 */
eYo.provide('Svg.Dnd')

eYo.forwardDeclare('DnD.Mngr')

/**
 * Faceless driver for the zoomer.
 */
eYo.Svg.makeDriverClass('Dnd')
