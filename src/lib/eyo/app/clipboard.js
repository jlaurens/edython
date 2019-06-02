/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Desk override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Clipboard')

goog.require('eYo')

/**
 * 
 */
eYo.Clipboard = function () {

}

Object.defineProperties(eYo.Clipboard, {
  dom: {
    get () {
      return this.dom_
    },
    set (newValue) {
      this.dom_ = newValue
    }
  },
  sourceDesk: {
    get () {
      return this.sourceDesk_
    },
    set (newValue) {
      this.sourceDesk_ = newValue
    }
  },
  factory: {
    get () {
      return this.sourceDesk_.factory
    }
  },
  mainDesk: {
    get () {
      return this.sourceDesk_.factory.mainDesk
    }
  }
})
