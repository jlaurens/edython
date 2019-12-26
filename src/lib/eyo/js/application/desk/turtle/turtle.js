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

eYo.require('Pane')

eYo.require('Decorate')
eYo.provide('Turtle')

/**
 * Class for a turtle graphic environment.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.C9r.makeClass('Turtle', eYo.Pane)
