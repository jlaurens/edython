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
let eYo = (() => {
  let EYO = function() {}
  Object.defineProperty(EYO.prototype, '_p', {
    get () {
      return this.constructor.prototype
    }
  })
  return new EYO()
}) ()

/**
 * Convenient shortcut
 * For edython.
 * @param {Object} object
 * @param {string} key
 * @return {boolean}
 */
eYo.hasOwnProperty = function (object, key) {
  return object && key && (Object.prototype.hasOwnProperty.call(object, key))
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
 * Whether the argument is a string.
 * @param {*} what
 */
eYo.isStr = (what) => {
  return typeof what === 'string'
}

/**
 * Function used when defining a JS property.
 */
eYo.noGetter = function (msg) {
  return msg 
    ? function () {
      throw new Error(`Forbidden getter: ${msg}`)
    } : function () {
      throw new Error('Forbidden getter...')
    }
}
/**
 * Function used when defining a JS property.
 */
eYo.noSetter = function (msg) {
  return msg
  ? function () {
    throw new Error(`Forbidden setter: ${msg}`)
  } : function () {
    throw new Error('Forbidden setter')
  }
}
/**
 * Function used when defining a JS property.
 */
eYo.descriptorR = (msg, getter) => {
  if (!eYo.isStr(msg)) {
    getter && eYo.throw(`Unexpected getter: ${getter}`)
    getter = msg
    msg = eYo.NA
  }
  return {
    get: getter,
    set: eYo.noSetter(msg),
  }
}

/**
 * Function used when defining a JS property.
 */
eYo.descriptorW = (msg, setter) => {
  if (!eYo.isStr(msg)) {
    setter && eYo.throw(`Unexpected setter: ${setter}`)
    setter = msg
    msg = eYo.NA
  }
  return {
    get: eYo.noGetter(msg),
    set: setter,
  }
}

/**
 * Function used when defining a JS property.
 */
eYo.descriptorNORW = (msg) => {
  return {
    get: eYo.noGetter(msg),
    set: eYo.noSetter(msg),
  }
}

/**
 * The props dictionary is a `key=>value` mapping where values
 * are getters, not a dictionary containing a getter.
 * @param {*} object - The destination
 * @param {*} props - the source
 * @param {Boolean} getters - True if functions are considered as getter.
 */
eYo.mixinRO = (object, props, getters = true) => {
  Object.keys(props).forEach(key => {
    eYo.hasOwnProperty(object, key) && eYo.throw(`Duplicate keys are forbidden: ${object}, ${key}`)
    let value = props[key]
    Object.defineProperty(
      object,
      key,
      eYo.descriptorR(getters && eYo.isF(value) ? value : function () {
        return value
      })
    )
  })
}

eYo.mixinRO(eYo, {
  /**
   * @const
   */
  name: 'eYo',
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
  GLOBAL:
  // Check `this` first for backwards compatibility.
  // Valid unless running as an ES module or in a function wrapper called
  //   without setting `this` properly.
  // Note that base.js can't usefully be imported as an ES module, but it may
  // be compiled into bundles that are loadable as ES modules.
  this ||
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/self
  // For in-page browser environments and workers.
  self,
  /**
   * Function to throw. Trick to throw in an expression.
   * @param {String} [what]
   */
  throw (what) {
    throw what
  }
}, false)

// ANCHOR Utilities
eYo.mixinRO(eYo, {
  /**
   * Whether the argument is an object created with `{...}` syntax.
   * @param {*} what
   */
  isD: (() => {
    let _p = Object.getPrototypeOf({})
    return (what) => {
      return what && Object.getPrototypeOf(what) === _p
    }
  }) (),
  /**
   * Whether the argument is `eYo.NA`.
   * @param {*} what
   */
  isNA (what) {
    return what === eYo.NA
  },
  /**
   * Whether the argument is not `undefined` nor `null`.
   * @param {*} what
   */
  isDef (what) {
    return what !== eYo.NA && what !== null
  },
  /**
   * Returns the receiver if it is defined, the fallout otherwise.
   * Defined means not |eYo.NA|.
   * @param {*} object - Whathever may be defined
   * @param {*} [fallout] - Optional fallout when |object| is not defined.
   * @return {*}
   */
  asDef (object, fallout) {
    return eYo.isDef(object) ? object : fallout
  },
  INVALID: (() => {
    return new function () {}
  })(),
  /**
   * Whether the argument is not `eYo.INVALID`.
   * @param {*} what
   */
  isVALID (what) {
    return what !== eYo.INVALID
  },
  /**
   * Calls `helper` if the `ans` is valid.
   * `ans` may be the output of a reentrant method.
   * @param {*} ans
   * @param {function} [f]
   * @return The result of the call to `f`, when `f` is defined,
   * `ans` if it is valid, `eYo.NA` otherwise.
   */
  whenVALID  (ans, f) {
    if (eYo.isVALID(ans)) {
      return (f && f(ans)) || ans
    }
  },
  /**
   * Whether the argument is na array.
   * @param {*} what
   */
  isRA (what) {
    return Array.isArray(what)
  },
  /**
   * Whether the argument is na array.
   * @param {*} what
   */
  isBool (what) {
    return what === true || what === false
  },
  /**
   * Whether the argument is a function.
   * @param {*} what
   * @return {!Boolean}
   */
  isNS (what) {
    return what && eYo.isSubclass(what.constructor, eYo.constructor)
  },
  /**
   * Returns the argument if its a function, `eYo.NA` otherwise.
   * @param {*} what
   * @return {Function|eYo.NA}
   */
  asF (what) {
    return typeof what === 'function' && !!what.call ? what : eYo.NA
  },
  /**
   * Void function frequently used.
   */
  doNothing: () => {},
  /**
   * Turns the argument into a function.
   * Returns the argument when a function and `eYo.doNothing` otherwise.
   * @param {*} what
   * @return {Function|eYo.NA}
   */
  toF (what) {
    return typeof what === 'function' && !!what.call
    ? what
    : () => {
      return what
    }
  },
  /**
   * Whether the argument is a constructor, in edython paradigm.
   * Such a constructor is a function with an `eyo` property pointing to
   * a delegate. It is not advisable to change this property on the fly.
   * @param {*} what
   * @return {!Boolean}
   */
  isC9r (what) {
    return !!what && !!what.eyo__ && eYo.isF(what)
  },
  /**
   * Returns the evaluated argument if its a function,
   * the argument itself otherwise.
   * @param {*} what
   * @return {Function|eYo.NA}
   */
  called (what) {
    return eYo.isF(what) ? what() : what
  },
  /**
   * Whether sub_ is a subclass of Super, or equals to Super...
   * @param {Function} Sub
   * @param {Function} Super
   * @return {Boolean}
   */
  isSubclass (Sub, Super) {
    return !!Super && !!Sub && eYo.isF(Super) && (Sub === Super || Sub.prototype instanceof Super)
  },
  /**
   * Contrary to goog.inherits, does not erase the childC9r.prototype.
   * IE<11
   * At the end, 
   * @param {Function} ChildC9r
   * @param {Function} SuperC9r
   */
  inherits (ChildC9r, SuperC9r) {
    ChildC9r.SuperC9r = SuperC9r
    let Super_p = SuperC9r.prototype
    let Child_p = ChildC9r.prototype
    ChildC9r.SuperC9r_p = Super_p
    Object.setPrototypeOf(Child_p, Super_p)
    Child_p.constructor = ChildC9r
    Child_p.SuperC9r_p = Super_p
  },
}, false)

// ANCHOR makeNS, provide
eYo.mixinRO(eYo._p, {
  /**
   * @name {eYo.makeNS}
   * Make a namespace by subclassing the caller's constructor.
   * Will create 'foo' namespace together with an 'foo_p' property to access the prototype.
   * @param {!Object} ns - a namespace, created object will be `ns[key]`. Defaults to the receiver.
   * @param {String} key - sentencecase name, created object will be `ns[key]`.
   * @return {Object}
   */
  makeNS (ns, key, model) {
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
      writable: false,
    })
    ns && Object.defineProperty(NS.prototype, 'parent', {
      value: ns,
      writable: false,
    })
    model && Object.keys(model).forEach(k => {
      Object.defineProperty(NS.prototype, k, {
        value: model[k]
      })
    })
    var ans = new NS()
    ns && Object.defineProperties(ns, {
      [key]: { value: ans, writable: false, },
      [key + '_p']: { value: NS.prototype, writable: false, },
      [key + '_s']: { value: Super.prototype, writable: false, },
    })
    Object.defineProperties(NS.prototype, {
      key: {value: key, writable: false,},
      name: {
        value: ns ? `${ns.name}.${key}` : key || "No man's land",
        writable: false,
      },
    })
    return ans
  },
}, false)

eYo.mixinRO(eYo, {
  /**
   * @param {String} name - dotted components, some kind of path.
   * @param {Object} value - When false, nothing is performed. This is the value used to create some object at the given path, instead of the default namespace.
   */
  provide (name, value) {
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
  },
  /**
   * @param {String} name
   */
  require (name) {
    var ns = eYo
    name.split('.').forEach(k => {
      eYo.assert((ns = ns[k]), `Missing required ${name}`)
    })
  },
  forwardDeclare: eYo.doNothing,
}, false)

// ANCHOR Assert
eYo.mixinRO(eYo, {
  /**
   * The default error handler.
   * @param {eYo.AssertionError} e The exception to be handled.
   */
  DEFAULT_ERROR_HANDLER (e) {
    throw e
  },
  /**
   * Error object for failed assertions.
   * https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
   * @param {string} pattern The pattern that was used to form message.
   * @param {...*} messageArgs The items to substitute into the pattern.
   * @constructor
   * @extends {Error}
   * @final
   */
  AssertionError: (() => {
    let AE = function(pattern, ...args) {
      this.message = eYo.subs_(pattern, ...args)
      this.stack = Error().stack
      /**
       * The message pattern used to format the error message. Error handlers can
       * use this to uniquely identify the assertion.
       * @type {string}
       */
      this.messagePattern = pattern
    }
    eYo.inherits(AE, Error)
    AE.prototype.name = "AssertionError"
    return AE
  })(),
  /**
   * Checks if the condition evaluates to true.
   * @template T
   * @param {T} condition The condition to check.
   * @param {string=} opt_message Error message in case of failure.
   * @param {...*} args The items to substitute into the failure message.
   * @return {T} The value of the condition.
   * @throws {eYo.AssertionError} When the condition evaluates to false.
   * @closurePrimitive {asserts.truthy}
   */
  assert (condition, message, ...args) {
    if (eYo.ENABLE_ASSERTS && !condition) {
      var e = new eYo.AssertionError(message, ...args)
      eYo.errorHandler_(e)
    }
    return condition
  },
  /**
   * Does simple python-style string substitution.
   * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
   * @param {string} pattern The string containing the pattern.
   * @param {Array<*>} subs The items to substitute into the pattern.
   * @return {string} A copy of `str` in which each occurrence of
   *     {@code %s} has been replaced by an argument from `subs`.
   * @private
   */
  subs_ (pattern, ...subs) {
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
  },
}, false)

/**
 * The handler responsible for throwing or logging assertion errors.
 * @private {function(!eYo.AssertionError)}
 */
eYo.errorHandler_ = eYo.DEFAULT_ERROR_HANDLER
eYo.ENABLE_ASSERTS = true

eYo.provide('eYo')

eYo.makeNS('version')
eYo.makeNS('session')

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

eYo.makeNS('temp')
eYo.makeNS('debug')
