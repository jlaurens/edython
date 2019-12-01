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

goog.provide('eYo.Fcls.Search')

goog.forwardDeclare('eYo.Search')

/**
 * Faceless driver for the search pane.
 */
eYo.Fcls.makeDriverClass('Search')

/**
 * Initiate the search UI.
 * @param {!eYo.Search} search  The search controller we must init the UI of.
 */
eYo.Fcls.Search.prototype.initUI = eYo.Do.nothing

/**
 * Dispose of the search UI.
 * @param {!eYo.Search} search  The search controller we must dispose of the UI of.
 */
eYo.Fcls.Search.prototype.disposeUI = eYo.Do.nothing

/**
 * Initiate the search UI.
 * @param {!eYo.Search} search  The search controller we must init the toolbar of.
 */
eYo.Fcls.Search.prototype.toolbarInitUI = eYo.Do.nothing

/**
 * Dispose of the search UI.
 * @param {!eYo.Search} search  The search controller we must dispose of the toolbar of.
 */
eYo.Fcls.Search.prototype.toolbarDisposeUI = eYo.Do.nothing

eYo.Debug.test() // remove this line when finished
