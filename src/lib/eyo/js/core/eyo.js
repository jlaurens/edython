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

goog.provide('eYo.makeNS')

goog.forwardDeclare('eYo.Application')

/**
 * @name {eYo}
 * @namespace
 */
var eYo = (() => {
  var eYo = function() {}
  var ans = new eYo()
  var NA
  Object.defineProperties(ans, {
    NA: { value: NA },
    name: { value: 'eYo' }, 
  })
  return ans
})()

/**
 * Stands for Not Available, strong `undefined` object that cannot be overwritten.
 * @name {eYo.NA}
 */

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

eYo.Temp = Object.create(null)
eYo.Debug = Object.create(null)

/**
 * Whether the argument is `eYo.NA`.
 * @param {*} what
 */
eYo.isStr = (what) => {
  return goog.isString (what)
}

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
  return what !== eYo.NA
}

/**
 * Whether the argument is a function.
 * @param {*} what
 * @return {!Boolean}
 */
eYo.isF = (what) => {
  return typeof what === 'function' && !!what.call
}

/**
 * Returns the argument if its a function, `eYo.NA` otherwise.
 * @param {*} what
 * @return {Function|eYo.NA}
 */
eYo.asF = (what) => {
  return typeof what === 'function' && !!what.call ? what : eYo.NA
}

/**
 * Returns the evaluated argument if its a function,
 * the argument itself otherwise.
 * @param {*} what
 * @return {Function|eYo.NA}
 */
eYo.called = (what) => {
  return eYo.isF(what) ? what() : what
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
 * @param {?String} str
 */
eYo.parameterAssert = (what, str) => {
  goog.asserts.assert(what, str ? `Bad parameter: ${str}` : "Bad parameter")
}

/**
 * Contrary to goog.inherits, does not erase the childC9r.prototype.
 * IE<11
 * @param {!Function} childC9r
 * @param {!Function} superC9r
 */
eYo.inherits = function (childC9r, superC9r) {
  childC9r.superClass_ = superC9r.prototype
  Object.setPrototypeOf(childC9r.prototype, superC9r.prototype)
  childC9r.prototype.constructor = childC9r
}

/**
 * Whether sub_ is a subclass of Super, or equals to Super...
 * @param {!Function} Sub
 * @param {!Function} Super
 * @return {Boolean}
 */
eYo.isSubclass = (Sub, Super) => {
  return !!Super && !!Sub && eYo.isF(Super) && (Sub === Super || Sub.prototype instanceof Super)
}

/**
 * @name {eYo.makeNS}
 * Make a namespace by subclassing the namespace's or the caller's constructor.
 * @param {?Object} ns,  namespace.
 * @param {!String} key, capitalised name, created object will be `ns[key]`. `key` is required when `ns` is given.
 * @return {Object}
 */
eYo.constructor.prototype.makeNS = function (ns, key) {
  if (eYo.isStr(ns)) {
    eYo.parameterAssert(!key, 'Unexpected key')
    key = ns
    ns = key && this || eYo.NA
  } else {
    !key || eYo.parameterAssert(eYo.isStr(key), 'Unexpected key type')
  }
  var Super = (ns||this).constructor
  var NS = function () {
    Super.call(this)
  }
  eYo.inherits(NS, Super)
  var ans = new NS()
  if (ns) {
    eYo.parameterAssert(!!key, 'Missing key')
    if (ns[key] && !eYo.isSubclass(ans, ns[key])) {
      throw new Error(`ns[${key}] already exists.`)
    }
    Object.defineProperty(ns, key, {
      value: ans,
    })
    Object.defineProperties(ans, {
      name: { value: `${ns.name}.${key}`, },
    })
  } else {
    Object.defineProperties(ans, {
      name: { value: key || "No man's land", },
    })
  }
  return ans
}
