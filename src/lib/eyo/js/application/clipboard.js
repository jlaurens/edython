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

eYo.require('C9r.Owned')

eYo.provide('Clipboard')

/**
 * 
 */
eYo.Clipboard = function (owner) {
  eYo.Clipboard.superProto_.constructor.call(this, owner)
}

Object.defineProperties(eYo.Clipboard, {
  dom: {
    get () {
      return this.dom_
    },
    set (after) {
      this.dom_ = after
    }
  },
  sourceBoard: {
    get () {
      return this.sourceBoard_
    },
    set (after) {
      this.sourceBoard_ = after
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
  eYo.Clipboard.superProto_.dispose.call(this)
}
