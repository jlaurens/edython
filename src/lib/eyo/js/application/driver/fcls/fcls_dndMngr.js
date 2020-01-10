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

eYo.require('dom')

eYo.forwardDeclare('dnd.Mngr')

/**
 * @name {eYo.dom.Dnd}
 * @constructor
 * Faceless driver for the zoomer.
 */
eYo.dom.makeDriverClass('DnD')
