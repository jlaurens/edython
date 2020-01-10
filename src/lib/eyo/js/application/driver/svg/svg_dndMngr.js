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

eYo.require('svg')

eYo.forwardDeclare('dnd.Mngr')

/**
 * @name {eYo.svg.Dnd}
 * @constructor
 * Faceless driver for the zoomer.
 */
eYo.svg.makeDriverC9r('DnD')
