/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Section of the flyout. Actually we have a search section, a library section and a draft (bag) section.
 * Each section has a toolbar and a board or a board list.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('c9r.owned')

/**
 * @name {eYo.Section}
 * @namespace
 */
eYo.provide('section')

/**
 * Class for a flyout's section.
 * @param {eYo.Flyout} owner  The owning flyout.
 * @constructor
 */
eYo.Section.makeClass('Dflt', eYo.c9r.Owned, {
  computed: {
    /**
     * The owning flyout
     * @type {eYo.Flyout}
     * @readonly
     */
    flyout: { 
      get () {
        return this.owner_
      }
    },
  },
  owned: {
    /**
     * The toolbar
     * @readonly
     */
    toolbar: eYo.NA,
    board () {
      return new eYo.Board.Dflt(this)
    },
  },
})
