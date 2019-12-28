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

eYo.require('C9r.Pane')

eYo.require('Decorate')

/**
 * @name {eYo.Turtle}
 * Class for a turtle graphic environment.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.makeClass('Turtle', eYo.C9r.Pane)
