/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name{eYo.setup}
 * @namespace
 */
eYo.makeNS('setup', {
  i9rsHead: [],
  i9rsTail: [],
})

/**
 * finalize.
 */
eYo.setup.finalize = function () {
  this.i9rsHead.forEach(i9r => i9r())
  this.i9rsHead = eYo.NA
  this.i9rsTail.reverse().forEach(i9r => i9r())
  this.i9rsTail = eYo.NA
  this.finalize = this.register = function () {
    eYo.throw('eYo.setup: Too late to register or finalize')
  }
}

/**
 * @param {Integer} [when] - Where to place the installer
 * @param {Function} i9r - The installer
 * @param {String} key - An identifying key
 */
eYo.setup.register = function (when, i9r, key) {
  if (eYo.isF(when)) {
    key = i9r
    i9r = when
    when = this.i9rsHead.length
  } else {
    eYo.assert(eYo.isF(i9r))
    eYo.assert(eYo.isNum(when))
  }
  if (when < 0) {
    when = this.i9rsTail.length + 1 + when
    if (when < 0) {
      when = 0
    }
    this.i9rsTail.splice(when, 0, i9r) // error if i9rsTail is undefined
  } else {
    if (when > this.i9rsHead.length) {
      when = this.i9rsHead.length
    }
    this.i9rsHead.splice(when, 0, i9r) // error if i9rsHead is undefined
  }
  i9r.eyo_register_key = key
}
