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

eYo.provide('eYo.ns.Fcls.Search')

eYo.forwardDeclare('eYo.Search')

/**
 * Faceless driver for the search pane.
 */
eYo.ns.Fcls.makeDriverClass('Search')

/**
 * Initiate the search UI.
 * @param {eYo.Search} search  The search controller we must init the UI of.
 */
eYo.ns.Fcls.Search.prototype.initUI = eYo.Do.nothing

/**
 * Dispose of the search UI.
 * @param {eYo.Search} search  The search controller we must dispose of the UI of.
 */
eYo.ns.Fcls.Search.prototype.disposeUI = eYo.Do.nothing

/**
 * Initiate the search UI.
 * @param {eYo.Search} search  The search controller we must init the toolbar of.
 */
eYo.ns.Fcls.Search.prototype.toolbarInitUI = eYo.Do.nothing

/**
 * Dispose of the search UI.
 * @param {eYo.Search} search  The search controller we must dispose of the toolbar of.
 */
eYo.ns.Fcls.Search.prototype.toolbarDisposeUI = eYo.Do.nothing
