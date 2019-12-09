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

eYo.require('eYo.NS_Fcls')

eYo.provide('eYo.NS_Fcls.Board')

eYo.forwardDeclare('eYo.Board')

/**
 * Shared application driver.
 */
eYo.NS_Fcls.makeDriverClass('Board')
