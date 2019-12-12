/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Variable inspector.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('Pane')

eYo.require('Decorate')
eYo.provide('Variable')

/**
 * Class for a variable inspector.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.UI.makeClass('Variable', eYo.Pane)
