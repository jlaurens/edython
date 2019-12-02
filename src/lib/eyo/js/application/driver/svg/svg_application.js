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

eYo.require('eYo.Svg')

eYo.provide('eYo.Svg.Application')

eYo.forwardDeclare('eYo.Application')

/**
 * Svg driver for application.
 */
eYo.Svg.makeDriverClass('Application')
