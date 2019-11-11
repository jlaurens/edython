/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Fsls utils. Some code specific to flyout and desk.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.require('eYo.Driver')

goog.provide('eYo.Fsls')

goog.require('goog.events')
goog.forwardDeclare('goog.dom')

/**
 * @name {eYo.Fsls}
 * @namespace
 */
eYo.Fsls = Object.create(null)

/**
 * The manager of all the faceless drivers.
 * @type {eYo.Fsls.Mgr}
 */
eYo.Driver.makeManagerClass(eYo.Fsls)

