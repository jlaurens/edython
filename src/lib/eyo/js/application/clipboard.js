/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Clipboard manager, in progress.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

console.error('In progress')

eYo.require('eYo.Owned')

eYo.provide('eYo.Clipboard')

/**
 * 
 */
eYo.Clipboard = function (owner) {
  eYo.Clipboard.superClass_.constructor.call(this, owner)
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
  board: {
    get () {
      return this.sourceBoard_.desk.board
    }
  }
})

/**
 * Dispose of the resources.
 */
eYo.Clipboard.prototype.dispose = function () {
  eYo.Clipboard.superClass_.dispose.call(this)
}
