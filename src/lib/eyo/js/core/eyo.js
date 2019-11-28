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

goog.forwardDeclare('eYo.Application')

var eYo = Object.create(null)
eYo.Version = Object.create(null)
eYo.Session = Object.create(null)

Object.defineProperties(eYo.Version, {
  /** @define {number} */
  MAJOR: { value: 0 },

  /** @define {number} */
  MINOR: { value: 1 },

  /** @define {number} */
  PATCH: { value: 0 },

  /** @define {string} */
  PRERELEASE: { value: '' },

  /** @define {string} */
  BUILD_DATE: { value: '' },

  /** @define {string} */
  GIT_HEAD: { value: '' },
})

/**
 * Setup.
 */
eYo.setup = (() => {
  var i11rsHead = []
  var i11rsTail = []
  var me = () => {
    i11rsHead.forEach(i11r => i11r())
    i11rsHead = eYo.NA
    i11rsTail.reverse().forEach(i11r => i11r())
    i11rsTail = eYo.NA
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

Object.defineProperties(eYo, {
  Temp: {
    value: Object.create(null)
  }
})

/**
 * One shot object standing for NA, aka Not Available (trusty undefined value).
 */
;(function () {
  var x
  Object.defineProperty(eYo, 'NA', {
    value: x
  })
})()

/**
 * Whether the argument is `eYo.NA`.
 * @param {*} what
 */
eYo.isNA = (what) => {
  return what === eYo.NA
}

/**
 * Whether the argument is not `undefined`.
 * @param {*} what
 */
eYo.isDef = (what) => {
  return what !== undefined
}

/**
 * Whether the argument is not `undefined`.
 * @param {*} what
 */
eYo.isF = (what) => {
  return typeof what === 'function' && !!what.call
}

/**
 * Function to throw. Trick to throw in an expression.
 * @param {?String} what
 */
eYo.throw = (what) => {
  throw what
}

/**
 * Cover to raise when necessary.
 * @param {Boolean} what
 * @param {?String} reason
 */
eYo.assert = (what, reason) => {
  goog.asserts.assert(what, reason)
}

/**
 * Cover to raise when necessary.
 * @param {Boolean} what
 */
eYo.parameterAssert = (what) => {
  goog.asserts.assert(what, "Bad parameter")
}

/**
 * Whether sub_ is a subclass of super_, or equals to super_...
 * @param {!Function} sub_
 * @param {!Function} super_
 * @return {Boolean}
 */
eYo.isSubclass = (sub_, super_) => {
  return !!super_ && !!sub_ && (sub_ === super_ || sub_.prototype instanceof super_)
}