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

eYo.require('eYo.Pane')

eYo.require('eYo.Decorate')
eYo.provide('eYo.Turtle')

/**
 * Class for a turtle graphic environment.
 * @param {!eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.UI.makeClass('Turtle', eYo.Pane)
