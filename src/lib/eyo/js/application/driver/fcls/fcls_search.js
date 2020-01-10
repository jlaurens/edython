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

eYo.require('fcls')

eYo.provide('fcls.search')

eYo.forwardDeclare('Search')

/**
 * Faceless driver for the search pane.
 */
eYo.fcls.makeDriverClass('Search')

/**
 * Initiate the search UI.
 * @param {eYo.Search} search  The search controller we must init the UI of.
 */
eYo.fcls.Search.prototype.doInitUI = eYo.do.nothing

/**
 * Dispose of the search UI.
 * @param {eYo.Search} search  The search controller we must dispose of the UI of.
 */
eYo.fcls.Search.prototype.doDisposeUI = eYo.do.nothing

/**
 * Initiate the search UI.
 * @param {eYo.Search} search  The search controller we must init the toolbar of.
 */
eYo.fcls.Search.prototype.toolbarInitUI = eYo.do.nothing

/**
 * Dispose of the search UI.
 * @param {eYo.Search} search  The search controller we must dispose of the toolbar of.
 */
eYo.fcls.Search.prototype.toolbarDisposeUI = eYo.do.nothing
