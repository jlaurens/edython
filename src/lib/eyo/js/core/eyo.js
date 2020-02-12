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
 * @name {eYo}
 * @namespace
 */
var eYo
;(() => {
  var EYO = function() {}
  eYo = new EYO()
  Object.defineProperty(EYO.prototype, '_p', {
    get () {
      return this.constructor.prototype
    }
  })
  var NA
  Object.defineProperties(eYo, {
    NA: { value: NA },
    name: { value: 'eYo' },
    INVALID: {value: new function () {}},
    MYSTIQUE: {
      value: new Proxy(function foo () {}, {
        get (target, prop) {
          return !prop.startsWith('is') && !prop.startsWith('has') && eYo.MYSTIQUE
        },
        set (target, prop, value) {},
        apply (target, thisArg, argumentsList) {
          return eYo.MYSTIQUE
        },
        construct(target, args) {
          return eYo.MYSTIQUE
        },
      })
    }
  })

  /**
   * Unique object, to avoid collisions in constants.
   */
  let F = function () {}
  eYo.getUNIK = () => {
    return new F()
  }

  let NULL_NS = eYo.getUNIK()

  Object.defineProperties(eYo, {
    NULL_NS: {
      get () {
        return NULL_NS
      },
      set (after) {
        throw 'Unexpected NULL_NS setter'
      }
    }
  })
    
})()

/**
 * Reference to the global object.
 * https://www.ecma-international.org/ecma-262/9.0/index.html#sec-global-object
 *
 * More info on this implementation here:
 * https://docs.google.com/document/d/1NAeW4Wk7I7FV0Y2tcUFvQdGMc89k2vdgSXInw8_nvCI/edit
 *
 * @const
 * @suppress {undefinedVars} self won't be referenced unless `this` is falsy.
 * @type {!Global}
 */
eYo.global =
    // Check `this` first for backwards compatibility.
    // Valid unless running as an ES module or in a function wrapper called
    //   without setting `this` properly.
    // Note that base.js can't usefully be imported as an ES module, but it may
    // be compiled into bundles that are loadable as ES modules.
    this ||
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/self
    // For in-page browser environments and workers.
    self

/**
 * Whether the argument is a string.
 * @param {*} what
 */
eYo.isStr = (what) => {
  return typeof what === 'string'
}

/**
 * Whether the argument is a dictionary.
 * @param {*} what
 */
eYo.isD = (what) => {
  return !(goog.isNull(what) || goog.isBoolean(what) || goog.isNumber(what) || eYo.isStr(what) || eYo.isF(what) || eYo.isRA(what))
}

/**
 * Whether the argument is an object created with `{...}` syntax.
 * @param {*} what
 */
;(() => {
  let _p = Object.getPrototypeOf({})
  eYo.isO = (what) => {
    return what && Object.getPrototypeOf(what) === _p
  }
}) ()

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
 * Returns the receiver if it is defined, the fallout otherwise.
 * Defined means not |eYo.NA|.
 * @param {*} object - Whathever may be defined
 * @param {*} [fallout] - Optional fallout when |object| is not defined.
 * @return {*}
 */
eYo.AsDef = function (object, fallout) {
  return eYo.isNA(object) ? fallout : object
}

/**
 * Whether the argument is not `eYo.INVALID`.
 * @param {*} what
 */
eYo.isVALID = (what) => {
  return what !== eYo.INVALID
}


/**
 * Calls `helper` if the `ans` is valid.
 * `ans` may be the output of a reentrant method.
 * @param {*} ans
 * @param {function} [f]
 * @return The result of the call to `f`, when `f` is defined,
 * `ans` if it is valid, `eYo.NA` otherwise.
 */
eYo.whenVALID = function(ans, f) {
  if (eYo.isVALID(ans)) {
    return (f && f(ans)) || ans
  }
}

/**
 * Whether the argument is na array.
 * @param {*} what
 */
eYo.isRA = (what) => {
  return Array.isArray(what)
}

/**
 * Whether the argument is a function.
 * @param {*} what
 * @return {!Boolean}
 */
eYo.isNS = (what) => {
  return what && eYo.isSubclass(what.constructor, eYo.constructor)
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
 * Whether the argument is a constructor, in edython paradigm.
 * Such a constructor is a function with an `eyo` property pointing to
 * a delegate. It is not advisable to change this property on the fly.
 * @param {*} what
 * @return {!Boolean}
 */
eYo.isC9r = (what) => {
  return !!what.eyo__ && eYo.isF(what)
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
 * Whether sub_ is a subclass of Super, or equals to Super...
 * @param {Function} Sub
 * @param {Function} Super
 * @return {Boolean}
 */
eYo.isSubclass = (Sub, Super) => {
  return !!Super && !!Sub && eYo.isF(Super) && (Sub === Super || Sub.prototype instanceof Super)
}

/**
 * @param {String} name - dotted components, some kind of path.
 * @param {Object} value - When false, nothing is performed. This is the value used to create some object at the given path, instead of the default namespace.
 */
eYo._p.provide = (name, value) => {
  if (value === false) {
    return
  }
  var args = name.split('.')
  if (args[0] === 'eYo') {
    return
  }
  var ns = eYo
  var f = (first, second, ...args) => {
    if (first) {
      if (!ns[first]) {
        if (eYo.isStr(second)) {
          ns = ns.makeNS(first)
          f(second, ...args)
        } else {
          (ns[first] = second) || ns.makeNS(first)
        }
      } else if (eYo.isStr(second)) {
        ns = ns[first]
        f(second, ...args)
      } 
    }
  }
  f(...args, value)
}

/**
 * @param {String} name
 */
eYo._p.require = (name) => {
  var ns = eYo
  name.split('.').forEach(k => {
    eYo.assert((ns = ns[k]), `Missing required ${name}`)
  })
}

eYo._p.forwardDeclare = (name) => {}

/**
 * Contrary to goog.inherits, does not erase the childC9r.prototype.
 * IE<11
 * @param {Function} ChildC9r
 * @param {Function} SuperC9r
 */
eYo.inherits = function (ChildC9r, SuperC9r) {
  ChildC9r.SuperC9r = SuperC9r
  let Super_p = SuperC9r.prototype
  let Child_p = ChildC9r.prototype
  ChildC9r.SuperC9r_p = Super_p
  Object.setPrototypeOf(Child_p, Super_p)
  Child_p.constructor = ChildC9r
  Child_p.SuperC9r_p = Super_p
}

/**
 * @name {eYo.makeNS}
 * Make a namespace by subclassing the caller's constructor.
 * Will create 'foo' namespace together with an 'foo_p' property to access the prototype.
 * @param {!Object} ns - a namespace, created object will be `ns[key]`. Defaults to the receiver.
 * @param {String} key - sentencecase name, created object will be `ns[key]`.
 * @return {Object}
 */
eYo._p.makeNS = function (ns, key, model) {
  if (eYo.isStr(ns)) {
    model && eYo.throw('Unexpected model argument')
    model = key
    key = ns
    ns = this
  }
  if (ns && ns[key] !== eYo.NA) {
    throw new Error(`${ns.name}[${key}] already exists.`)
  }
  var Super = this.constructor
  var NS = function () {
    Super.call(this)
  }
  eYo.inherits(NS, Super)
  Object.defineProperty(NS.prototype, 'super', {
    value: this,
  })
  ns && Object.defineProperty(NS.prototype, 'parent', {
    value: ns,
  })
  if (model) {
    for (var k in model) {
      Object.defineProperty(NS.prototype, k, {
        value: model[k]
      })
    }
  }
  var ans = new NS()
  ns && Object.defineProperties(ns, {
    [key]: { value: ans, },
    [key + '_p']: { value: ans.prototype, },
    [key + '_s']: { value: Super.prototype, },
  })
  Object.defineProperties(NS.prototype, {
    key: {value: key},
    name: { value: ns ? `${ns.name}.${key}` : key || "No man's land" },
  })
  return ans
}

/**
 * The default error handler.
 * @param {eYo.assertionError} e The exception to be handled.
 */
eYo.DEFAULT_ERROR_HANDLER = function(e) {
  throw e
}

/**
 * The handler responsible for throwing or logging assertion errors.
 * @private {function(!eYo.assertionError)}
 */
eYo.errorHandler_ = eYo.DEFAULT_ERROR_HANDLER

eYo.eNABLE_ASSERTS = true

/**
 * Checks if the condition evaluates to true.
 * @template T
 * @param {T} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} args The items to substitute into the failure message.
 * @return {T} The value of the condition.
 * @throws {eYo.assertionError} When the condition evaluates to false.
 * @closurePrimitive {asserts.truthy}
 */
eYo.assert = function(condition, message, ...args) {
  if (eYo.eNABLE_ASSERTS && !condition) {
    var e = new eYo.assertionError(message, ...args);
    eYo.errorHandler_(e);
  }
  return condition
}

/**
 * Error object for failed assertions.
 * https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
 * @param {string} pattern The pattern that was used to form message.
 * @param {...*} messageArgs The items to substitute into the pattern.
 * @constructor
 * @extends {Error}
 * @final
 */
eYo.assertionError = function(pattern, ...args) {
  this.message = eYo.Subs_(pattern, ...args)
  this.stack = Error().stack
  /**
   * The message pattern used to format the error message. Error handlers can
   * use this to uniquely identify the assertion.
   * @type {string}
   */
  this.messagePattern = pattern
}
eYo.inherits(eYo.assertionError, Error)

eYo.assertionError.prototype.name = "AssertionError"

/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} pattern The string containing the pattern.
 * @param {Array<*>} subs The items to substitute into the pattern.
 * @return {string} A copy of `str` in which each occurrence of
 *     {@code %s} has been replaced by an argument from `subs`.
 * @private
 */
eYo.Subs_ = function(pattern, ...subs) {
  var splitParts = pattern.split('%s')
  var returnString = ''
  // Replace up to the last split part. We are inserting in the
  // positions between split parts.
  var subLast = splitParts.length - 1
  for (var i = 0; i < subLast; i++) {
    // keep unsupplied as '%s'
    var sub = (i < subs.length) ? subs[i] : '%s'
    returnString += splitParts[i] + sub
  }
  return returnString + splitParts[subLast]
}

/**
 * Cover to raise when necessary.
 * @param {Boolean} what
 * @param {String} [str]
 */
eYo.parameterAssert = (what, str) => {
  eYo.assert(what, str ? `Bad parameter - ${str}` : "Bad parameter")
}

/**
 * Function to throw. Trick to throw in an expression.
 * @param {String} [what]
 */
eYo.throw = (what) => {
  throw what
}

/**
 * Stands for Not Available, strong `undefined` object that cannot be overwritten.
 * @name {eYo.NA}
 */

eYo.provide('eYo')

eYo.provide('version')
eYo.provide('session')

eYo.forwardDeclare('app')

Object.defineProperties(eYo.version, {
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
eYo.Setup = (() => {
  var i11rsHead = []
  var i11rsTail = []
  var me = () => {
    i11rsHead.forEach(i11r => i11r())
    i11rsHead = eYo.NA
    i11rsTail.reverse().forEach(i11r => i11r())
    i11rsTail = eYo.NA
  }
  me.register = (when, i11r, key) => {
    if (eYo.isF(when)) {
      key = i11r
      i11r = when
      when = i11rsHead.length
    } else {
      eYo.assert(eYo.isF(i11r))
      eYo.assert(goog.isNumber(when))
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
