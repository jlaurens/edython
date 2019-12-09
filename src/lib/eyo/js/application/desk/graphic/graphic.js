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

eYo.require('eYo.Pane')

eYo.require('eYo.Decorate')
eYo.provide('eYo.Graphic')

/**
 * Class for a graphic environment.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.NS_UI.makeClass('Graphic', eYo.Pane)
