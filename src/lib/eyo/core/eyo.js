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
 * @name eYo
 * @namespace
 */

goog.provide('eYo')

goog.provide('eYo.Version')
goog.provide('eYo.Session')

var eYo = Object.create(null)
eYo.Version = Object.create(null)
eYo.Session = Object.create(null)


/** @define {number} */
eYo.Version.MAJOR = 0

/** @define {number} */
eYo.Version.MINOR = 1

/** @define {number} */
eYo.Version.PATCH = 0

/** @define {string} */
eYo.Version.PRERELEASE = ''

/** @define {string} */
eYo.Version.BUILD_DATE = ''

/** @define {string} */
eYo.Version.GIT_HEAD = ''

/**
 * Setup.
 */
eYo.setup = (() => {
  var i11rsHead = []
  var i11rsTail = []
  var me = (workspace) => {
    i11rsHead.forEach(i11r => i11r())
    i11rsHead = undefined
    i11rsTail.reverse().forEach(i11r => i11r())
    i11rsTail = undefined
  }
  me.register = (when, i11r, key) => {
    if (goog.isFunction(when)) {
      key = i11r
      i11r = when
      when = i11rsHead.length
    } else {
      goog.asserts.assert(goog.isFunction(i11r))
      goog.asserts.assert(goog.isNumber(when))
    }
    if (when < 0) {
      when = i11rsTail.length + 1 + when
      if (when < 0) {
        when = 0
      }
      i11rsTail.splice(when, 0, i11r) // error if i11rsTail is undefined
    } else {
      if (when > i11rsHead.length) {
        when = i11rsHead.length
      }
      i11rsHead.splice(when, 0, i11r) // error if i11rsHead is undefined
    }
    i11r.eyo_register_key = key
  }
  return me
})()

/**
 * Removed character ` for convenience.
 */
eYo.Do.genUid.soup_ = '!#$%()*+,-./:;=?@[]^_{|}~' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
