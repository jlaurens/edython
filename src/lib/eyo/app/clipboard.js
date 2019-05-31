/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Workspace override.
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

object.defineProperties(eYo.Clipboard, {
  dom: {
    get () {
      return this.dom_
    },
    set (newValue) {
      this.dom_ = newValue
    }
  },
  sourceWorkspace: {
    get () {
      return this.sourceWorkspace_
    },
    set (newValue) {
      this.sourceWorkspace_ = newValue
    }
  },
  factory: {
    get () {
      return this.sourceWorkspace_.factory
    }
  },
  mainWorkspace: {
    get () {
      return this.sourceWorkspace_.factory.mainWorkspace
    }
  }
})
