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

goog.provide('eYo.Driver.Search')

/**
 * Faceless driver for the search pane.
 */
eYo.Driver.makeSubclass('Search')

/**
 * Initiate the search UI.
 * @param {!eYo.Search} search  The search controller we must init the UI of.
 */
eYo.Driver.Search.prototype.initUI = eYo.Do.nothing

/**
 * Dispose of the search UI.
 * @param {!eYo.Search} search  The search controller we must dispose of the UI of.
 */
eYo.Driver.Search.prototype.disposeUI = eYo.Do.nothing

/**
 * Initiate the search UI.
 * @param {!eYo.Search} search  The search controller we must init the toolbar of.
 */
eYo.Driver.Search.prototype.toolbarInitUI = eYo.Do.nothing

/**
 * Dispose of the search UI.
 * @param {!eYo.Search} search  The search controller we must dispose of the toolbar of.
 */
eYo.Driver.Search.prototype.toolbarDisposeUI = eYo.Do.nothing
