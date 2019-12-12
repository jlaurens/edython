/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Graphic environment.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('Pane')

eYo.require('Decorate')
eYo.provide('Graphic')

/**
 * Class for a graphic environment.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.UI.makeClass('Graphic', eYo.Pane)
