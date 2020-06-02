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

eYo.forward('section.Search')

/**
 * Faceless driver for the search view.
 */
eYo.fcls.newDriverC9r('Search')

/**
 * Initiate the search UI.
 * @param {eYo.dom.Search} search  The search controller we must init the UI of.
 */
eYo.fcls.Search.prototype.doInitUI = eYo.doNothing

/**
 * Dispose of the search UI.
 * @param {eYo.dom.Search} search  The search controller we must dispose of the UI of.
 */
eYo.fcls.Search.prototype.doDisposeUI = eYo.doNothing

/**
 * Initiate the search UI.
 * @param {eYo.dom.Search} search  The search controller we must init the toolbar of.
 */
eYo.fcls.Search.prototype.toolbarInitUI = eYo.doNothing

/**
 * Dispose of the search UI.
 * @param {eYo.dom.Search} search  The search controller we must dispose of the toolbar of.
 */
eYo.fcls.Search.prototype.toolbarDisposeUI = eYo.doNothing
