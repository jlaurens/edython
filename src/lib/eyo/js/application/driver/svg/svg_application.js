/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Application rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Svg')

goog.provide('eYo.Svg.Application')

goog.forwardDeclare('eYo.Application')

/**
 * Svg driver for application.
 */
eYo.Svg.makeDriverClass('Application')

eYo.Debug.test() // remove this line when finished
