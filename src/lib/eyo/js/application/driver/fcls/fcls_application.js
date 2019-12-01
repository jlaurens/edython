/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate. Do nothing driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Fcls')

goog.provide('eYo.Fcls.Application')

goog.forwardDeclare('eYo.Application')

/**
 * Shared application driver.
 */
eYo.Fcls.makeDriverClass('Application')

eYo.Debug.test() // remove this line when finished
