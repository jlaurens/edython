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
eYo.fcls.newDrvrC3s('Search', {
  methods: {
    /**
     * Initiate the search UI.
     * @param {eYo.dom.Search} search  The search controller we must init the toolbar of.
     */
    toolbarInitUI: eYo.doNothing,
    /**
     * Dispose of the search UI.
     * @param {eYo.dom.Search} search  The search controller we must dispose of the toolbar of.
     */
    toolbarDisposeUI: eYo.doNothing,
  },
})

