/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board override.
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
  sourceBoard: {
    get () {
      return this.sourceBoard_
    },
    set (newValue) {
      this.sourceBoard_ = newValue
    }
  },
  desk: {
    get () {
      return this.sourceBoard_.desk
    }
  },
  mainBoard: {
    get () {
      return this.sourceBoard_.desk.mainBoard
    }
  }
})
