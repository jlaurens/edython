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

goog.require('eYo.Driver')

goog.provide('eYo.Driver.Application')

/**
 * Shared application driver.
 */
eYo.Driver.makeSubclass('Application')

/**
 * Initiate the application UI.
 * @param {!eYo.Application} app  The application we must init the UI of.
 */
eYo.Driver.Application.prototype.initUI = eYo.Do.nothing

/**
 * Dispose of the application UI.
 * @param {!eYo.DnD.Mgr} mgr  The application we must dispose of the UI of.
 */
eYo.Driver.Application.prototype.disposeUI = eYo.Do.nothing

