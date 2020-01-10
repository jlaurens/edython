/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Turtle graphic environment.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('c9r.Pane')

eYo.require('decorate')

/**
 * @name {eYo.Turtle}
 * Class for a turtle graphic environment.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.makeC9r('Turtle', eYo.c9r.Pane)
