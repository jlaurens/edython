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

goog.require('eYo.Driver')

goog.provide('eYo.Fcls')

/**
 * @name {eYo.Fcls}
 * @namespace
 */
eYo.Fcls = Object.create(null)

goog.provide('eYo.Fcls.Mgr')

goog.forwardDeclare('goog.dom')

/**
 * The manager of all the faceless drivers.
 * @type {eYo.Fcls.Mgr}
 */
eYo.Driver.makeMgrClass(eYo.Fcls)
