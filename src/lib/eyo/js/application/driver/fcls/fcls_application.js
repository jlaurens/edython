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

eYo.require('eYo.ns.Fcls')

eYo.provide('eYo.ns.Fcls.Application')

eYo.forwardDeclare('eYo.Application')

/**
 * Shared application driver.
 */
eYo.ns.Fcls.makeDriverClass('Application')
