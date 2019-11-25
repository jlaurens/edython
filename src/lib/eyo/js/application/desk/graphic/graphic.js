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

goog.require('eYo.Pane')

goog.require('eYo.Decorate')
goog.provide('eYo.Graphic')

/**
 * Class for a graphic environment.
 * @param {!eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.UI.Constructor.make('Graphic', eYo.Pane)
