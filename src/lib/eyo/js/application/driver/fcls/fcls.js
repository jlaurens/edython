/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Fcls utils. Some code specific to flyout and desk.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('eYo.Driver')

/**
 * @name {eYo.Fcls}
 * @namespace
 */
eYo.makeNS('Fcls')

eYo.provide('eYo.Fcls.Mngr')

goog.forwardDeclare('goog.dom')

/**
 * @name {eYo.Fcls.Mngr}
 * The manager of all the faceless drivers.
 */
eYo.Driver.makeMngrClass(eYo.Fcls)

