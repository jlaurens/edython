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

goog.require('eYo.Pane')

goog.require('eYo.Decorate')
goog.provide('eYo.Turtle')

/**
 * Class for a turtle graphic environment.
 * @param {!eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.UI.Constructor.makeClass('Turtle', eYo.Pane)
