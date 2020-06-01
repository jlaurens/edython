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

//<<< mochai: eYo

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

// Comment next line in production mode
eYo.TESTING = true

//<<< mochai: Basics
//... chai.assert(eYo)
//... chai.assert(eYo._p)
//>>>

/**
 * Convenient shortcut
 * For edython.
 * @param {Object} object
 * @param {String} key
 * @return {Boolean}
 */
eYo.hasOwnProperty = function (object, key) {
  return !!object && !!key && (Object.prototype.hasOwnProperty.call(object, key))
  //<<< mochai: eYo.hasOwnProperty'
  //... chai.assert(eYo.hasOwnProperty)
  //... chai.expect(eYo.hasOwnProperty({foo: true}, 'foo')).true
  //... chai.expect(eYo.hasOwnProperty({}, 'foo')).false
  //... chai.expect(eYo.hasOwnProperty({}, '')).false
  //... chai.expect(eYo.hasOwnProperty(eYo.NA, 'foo')).false
  //... chai.expect(eYo.hasOwnProperty(eYo.NA, [eYo.$])).false
  //>>>
}

/**
 * Whether the argument is a function or an arrow.
 * @param {*} what
 * @return {!Boolean}
 */
eYo.isF = (what) => {
  return typeof what === 'function' && !!what.call
  //<<< mochai: eYo.isF
  //... chai.assert(eYo.isF)
  //... chai.assert(eYo.isF(eYo.doNothing))
  //... chai.assert(eYo.isF(() => {}))
  //... let f = function () {return 421}
  //... chai.assert(eYo.isF(f))
  //... chai.assert(!eYo.isF())
  //... chai.assert(!eYo.isF({}))
  //... chai.expect(eYo.asF(eYo.doNothing)).equal(eYo.doNothing)
  //... chai.expect(eYo.asF(f)).equal(f)
  //... chai.assert(eYo.isNA(eYo.asF()))
  //... chai.assert(eYo.isNA(eYo.asF(421)))
  //... chai.expect(eYo.toF(eYo.doNothing)).equal(eYo.doNothing)
  //... chai.expect(eYo.toF(f)).equal(f)
  //... chai.assert(eYo.isF(eYo.toF()))
  //... chai.assert(eYo.isF(eYo.toF(421)))
  //... chai.expect(eYo.toF(421)()).equal(421)
  //... let C9r = function () {}
  //... chai.assert(!eYo.isC9r(C9r))
  //... C9r[eYo.$] = true
  //... chai.assert(eYo.isC9r(C9r))
  //... chai.assert(!eYo.isC9r())
  //... chai.assert(!eYo.isC9r(''))
  //>>>
}

/**
 * Whether the argument is a function or an arrow.
 * @param {*} what
 * @return {!Boolean}
 */
eYo.isDoIt = (what) => {
  return what !== eYo.doNothing && typeof what === 'function' && !!what.call
  //<<< mochai: eYo.isDoIt
  //... chai.assert(eYo.isDoIt)
  //... chai.expect(eYo.isDoIt()).false
  //... chai.expect(eYo.isDoIt(421)).false
  //... chai.expect(eYo.isDoIt(eYo.doNothing)).false
  //... chai.expect(eYo.isDoIt(() => 421)).true
  //... chai.expect(eYo.isDoIt(function () {})).true
  //... chai.expect(eYo.isDoIt({foo(){}}.foo)).true
  //>>>
}

/**
 * Whether the argument is a string.
 * @param {*} what
 */
eYo.isStr = (what) => {
  return typeof what === 'string'
  //<<< mochai: eYo.isStr
  //... chai.assert(eYo.isStr)
  //... chai.expect(eYo.isStr('')).true
  //... chai.expect(eYo.isStr()).false
  //... chai.expect(eYo.isStr({})).false
  //>>>
}
/**
 * Whether the argument is a symbol.
 * @param {*} what
 */
eYo.isSym = (what) => {
  return typeof what === 'symbol'
  //<<< mochai: eYo.isSym
  //... chai.expect(eYo).property('isSym')
  //... chai.expect(eYo.isSym(Symbol())).true
  //... chai.expect(eYo.isSym('')).false
  //... chai.expect(eYo.isSym()).false
  //... chai.expect(eYo.isSym({})).false
  //>>>
}
/**
 * Whether the argument is a either a symbol or a string.
 * @param {*} what
 */
eYo.isId = (what) => {
  return typeof what === 'symbol' || typeof what === 'string'
  //<<< mochai: eYo.isId
  //... chai.expect(eYo).property('isId')
  //... chai.expect(eYo.isId(Symbol())).true
  //... chai.expect(eYo.isId('')).true
  //... chai.expect(eYo.isId()).false
  //... chai.expect(eYo.isId({})).false
  //>>>
}
/**
 * Whether the argument is `eYo.NA`.
 * @param {*} what
 */
eYo.isNA = (what) => {
  return what === eYo.NA
  //<<< mochai: eYo.isNA
  //... let x
  //... chai.expect(eYo.NA).equal(x)
  //... chai.assert(eYo.isNA(x))
  //... chai.expect(() => {
  //...   eYo.NA = 1
  //... }).throw()
  //>>>
}
/**
 * Whether the argument is a boolean.
 * @param {*} what
 */
eYo.isBool = (what) => {
  return what === true || what === false
  //<<< mochai: eYo.isBool
  //... chai.expect(eYo.isBool(true)).true
  //... chai.expect(eYo.isBool(false)).true
  //... chai.expect(eYo.isBool()).false
  //... chai.expect(eYo.isBool(eYo.NA)).false
  //... chai.expect(eYo.isBool(421)).false
  //>>>
}
/**
 * Whether the argument is a number.
 * @param {*} what
 */
eYo.isNum = (what) => {
  return typeof what === 'number' && !isNaN(what)
  //<<< mochai: eYo.isNum
  //... chai.assert(eYo.isNum)
  //... chai.expect(eYo.isNum()).false
  //... chai.expect(eYo.isNum(421)).true
  //... chai.expect(eYo.isNum(421e20)).true
  //... chai.expect(eYo.isNum(eYo.doNothing)).false
  //... chai.expect(eYo.isNum({})).false
  //... chai.expect(eYo.isNum([])).false
  //... chai.expect(eYo.isNum('')).false
  //... chai.expect(eYo.isNum(NaN)).false
  //>>>
}
/**
 * Whether the argument is an object created with `{...}` syntax.
 * @param {*} what
 */
eYo.isD = (() => {
  let _p = Object.getPrototypeOf({})
  return (what) => {
    if (what) {
      let p = Object.getPrototypeOf(what)
      return !p || p === _p
    }
    return false
  }
  //<<< mochai: eYo.isD
  //... chai.assert(eYo.isD)
  //... chai.expect(eYo.isD({})).true
  //... chai.expect(eYo.isD(Object.create(null))).true
  //... chai.expect(eYo.isD()).false
  //... chai.expect(eYo.isD('')).false
  //>>>
}) ()
/**
 * Whether the argument is not `undefined` nor `null`.
 * @param {*} what
 */
eYo.isDef = what => {
  return what !== eYo.NA && what !== null
  //<<< mochai: eYo.isDef
  //... chai.expect(eYo.isDef({})).true
  //... chai.expect(eYo.isDef()).false
  //... chai.expect(eYo.isDef(null)).false
  //>>>
}
/**
 * Function used to disallow sending twice the same message.
 */
eYo.neverShot = function (msg) {
  return eYo.isStr(msg)
  ? function () {
    throw new Error(`Forbidden call: ${msg}`)
  } : eYo.isF(msg)
    ? function () {
      throw new Error(`Forbidden call ${msg.call(this)}`)
    } : eYo.isDef(msg)
      ? eYo.throw(`eYo.neverShot: Bad argument ${msg}`)
      : function () {
        throw new Error('Forbidden shot')
      }
  //<<< mochai: eYo.neverShot
  //... chai.assert(eYo.neverShot)
  //... chai.expect(() => eYo.neverShot(421)).throw()
  //... chai.expect(() => eYo.neverShot()()).throw()
  //... chai.expect(() => eYo.neverShot('abc')()).throw()
  //... chai.expect(() => eYo.neverShot(() => flag.push(421))()).throw()
  //... flag.expect(421)
  //>>>
}
/**
 * Function used to disallow sending twice the same message.
 */
eYo.oneShot = function (msg) {
  return eYo.isStr(msg)
  ? function () {
    throw new Error(`Forbidden call: ${msg}`)
  } : eYo.isF(msg)
    ? function () {
      throw new Error(`Forbidden call ${msg.call(this)}`)
    } : eYo.isDef(msg)
      ? eYo.throw(`eYo.oneShot: Bad argument ${msg}`)
      : function () {
        throw new Error('Forbidden second shot')
      }
  //<<< mochai: eYo.oneShot
  //... chai.assert(eYo.oneShot)
  //... chai.expect(() => eYo.oneShot(421)).throw()
  //... chai.expect(() => eYo.oneShot()()).throw()
  //... chai.expect(() => eYo.oneShot('abc')()).throw()
  //... chai.expect(() => eYo.oneShot(() => flag.push(421))()).throw()
  //... flag.expect(421)
  //>>>
}
/**
 * Function used when defining a JS property.
 */
eYo.noGetter = function (msg) {
  return eYo.isStr(msg)
  ? function () {
    throw new Error(`Forbidden getter: ${msg}`)
  } : eYo.isF(msg)
    ? function () {
      throw new Error(`Forbidden getter ${msg.call(this)}`)
    } : eYo.isDef(msg)
      ? eYo.throw(`eYo.noGetter: Bad argument {msg}`)
      : function () {
        throw new Error('Forbidden getter')
      }
  //<<< mochai: eYo.noGetter
  //... chai.assert(eYo.noGetter)
  //... chai.expect(() => eYo.noGetter(421)).throw()
  //... chai.expect(() => eYo.noGetter()()).throw()
  //... chai.expect(() => eYo.noGetter('abc')()).throw()
  //... chai.expect(() => eYo.noGetter(() => flag.push(421))()).throw()
  //... flag.expect(421)
  //>>>
}
/**
 * Function used when defining a JS property.
 * @param {String|Function} [msg] - Either a string of a function.
 */
eYo.noSetter = function (msg) {
  return eYo.isStr(msg)
  ? function () {
    throw new Error(`Forbidden setter: ${msg}`)
  } : eYo.isF(msg)
    ? function () {
      throw new Error(`Forbidden setter ${msg.call(this)}`)
    } : eYo.isDef(msg)
      ? eYo.throw(`eYo.noSetter: Bad argument {msg}`)
      : function () {
        throw new Error('Forbidden setter')
      }
  //<<< mochai: eYo.noSetter
  //... chai.assert(eYo.noSetter)
  //... chai.expect(() => eYo.noSetter(421)).throw()
  //... chai.expect(() => eYo.noSetter()()).throw()
  //... chai.expect(() => eYo.noSetter('abc')()).throw()
  //... chai.expect(() => eYo.noSetter(() => flag.push(421))()).throw()
  //... flag.expect(421)
  //>>>
}
/**
 * Function used when defining a JS property.
 * Parameters: one string, one function,
 * something truthy than is neither a string nor a function.
 * @param {String} [msg] - Diagnostic message,or object
 * with a `lazy` attribute for a function returning the diagnostic message.
 * @param {String|Object} [msg] - Diagnostic message, or object
 * with a `lazy` attribute for a function returning the dignostic message.
 * @param {Function|Boolean} getter
 * @param {Boolean|Function} configurable
 * @private
 */
eYo.descriptorR = (msg, getter, configurable) => {
  // Expected ordered parameter types : s, f, b
  // f, b, NA -> b, f, NA -> NA, f, b
  // b, f, NA -> NA, f, b
  // s, b, f 
  if (eYo.isF(msg)) {
    eYo.isDef(configurable) && eYo.throw(`eYo.descriptorR: Unexpected last argument ${configurable}`)
    ;[msg, getter, configurable] = [eYo.NA, msg, getter]
  } else if (!eYo.isF(getter)) {
    ;[getter, configurable] = [configurable, getter]
    if (!eYo.isF(getter)) {
      console.error('BREAK HERE!')
    }
    eYo.isF(getter) || eYo.throw('descriptorR: Missing getter')
  }
  msg && msg.lazy && (msg = msg.lazy)
  return {
    get: getter,
    set: eYo.noSetter(msg),
    configurable: !!configurable,
  }
  //<<< mochai: eYo.descriptorR
  //... chai.assert(eYo.descriptorR)
  //... let msg_1 = 'foo'
  //... let msg_2 = () => flag.push(421)
  //... let getter = () => flag.push(666)
  //... var o, d
  //... o = {}
  //... d = eYo.descriptorR(getter)
  //... Object.defineProperty(o, 'bar', d)
  //... o.bar
  //... flag.expect(666)
  //... chai.expect(() => o.bar = 123).throw()
  //... d = eYo.descriptorR(getter)
  //... chai.expect(() => Object.defineProperty(o, 'bar', d)).throw()
  //... o = {}
  //... d = eYo.descriptorR(getter, true)
  //... Object.defineProperty(o, 'bar', d)
  //... o.bar
  //... flag.expect(666)
  //... chai.expect(() => o.bar = 123).throw()
  //... d = eYo.descriptorR(getter)
  //... Object.defineProperty(o, 'bar', d) // now it is configurable
  //... o = {}
  //... d = eYo.descriptorR(msg_1, getter)
  //... Object.defineProperty(o, 'bar', d)
  //... o.bar
  //... flag.expect(666)
  //... chai.expect(() => o.bar = 123).throw()
  //... d = eYo.descriptorR(getter)
  //... chai.expect(() => Object.defineProperty(o, 'bar', d)).throw()
  //... o = {}
  //... d = eYo.descriptorR(msg_1, getter, true)
  //... Object.defineProperty(o, 'bar', d)
  //... o.bar
  //... flag.expect(666)
  //... chai.expect(() => o.bar = 123).throw()
  //... flag.expect()
  //... d = eYo.descriptorR(getter)
  //... Object.defineProperty(o, 'bar', d) // now it is configurable
  //... o = {}
  //... d = eYo.descriptorR({lazy: msg_2}, getter)
  //... Object.defineProperty(o, 'bar', d)
  //... o.bar
  //... flag.expect(666)
  //... chai.expect(() => o.bar = 123).throw()
  //... flag.expect(421)
  //... d = eYo.descriptorR(getter)
  //... chai.expect(() => Object.defineProperty(o, 'bar', d)).throw()
  //... o = {}
  //... d = eYo.descriptorR({lazy: msg_2}, getter, true)
  //... Object.defineProperty(o, 'bar', d)
  //... o.bar
  //... flag.expect(666)
  //... chai.expect(() => o.bar = 123).throw()
  //... flag.expect(421)
  //... d = eYo.descriptorR(getter)
  //... Object.defineProperty(o, 'bar', d) // now it is configurable
  //>>>
}

/**
 * Function used when defining a JS property.
 * @param {String|Object} [msg] - Diagnostic message, or object
 * with a `lazy` attribute for a function returning the dignostic message.
 * @param {Function} setter
 * @param {Boolean} [configurable]
 * @private
 */
eYo.descriptorW = (msg, setter, configurable) => {
  if (eYo.isF(msg)) {
    eYo.isNA(configurable) || eYo.throw(`eYo.descriptorW: Unexpected last argument ${configurable}`)
    ;[msg, setter, configurable] = [eYo.NA, msg, setter]
  } else if (!eYo.isF(setter)) {
    ;[setter, configurable] = [configurable, setter]
    if (!eYo.isF(setter)) {
      console.error('BREAK HERE!')
    }
    eYo.isF(setter) || eYo.throw('descriptorR: Missing setter')
  }
  msg && msg.lazy && (msg = msg.lazy)
  return {
    get: eYo.noGetter(msg),
    set: setter,
    configurable: !!configurable
  }
  //<<< mochai: eYo.descriptorW
  //... chai.assert(eYo.descriptorW)
  //... let msg_1 = 'foo'
  //... let msg_2 = () => flag.push(421)
  //... let setter = () => flag.push(666)
  //... var o, d
  //... o = {}
  //... d = eYo.descriptorW(setter)
  //... Object.defineProperty(o, 'bar', d)
  //... o.bar = 123
  //... flag.expect(666)
  //... chai.expect(() => o.bar).throw()
  //... d = eYo.descriptorW(setter)
  //... chai.expect(() => Object.defineProperty(o, 'bar', d)).throw()
  //... o = {}
  //... d = eYo.descriptorW(setter, true)
  //... Object.defineProperty(o, 'bar', d)
  //... o.bar = 123
  //... flag.expect(666)
  //... chai.expect(() => o.bar).throw()
  //... d = eYo.descriptorW(setter)
  //... Object.defineProperty(o, 'bar', d) // now it is configurable
  //... o = {}
  //... d = eYo.descriptorW(msg_1, setter, true)
  //... Object.defineProperty(o, 'bar', d)
  //... o.bar = 123
  //... flag.expect(666)
  //... chai.expect(() => o.bar).throw()
  //... flag.expect()
  //... d = eYo.descriptorW(setter)
  //... Object.defineProperty(o, 'bar', d) // now it is configurable
  //... o = {}
  //... d = eYo.descriptorW({lazy: msg_2}, setter)
  //... Object.defineProperty(o, 'bar', d)
  //... o.bar = 123
  //... flag.expect(666)
  //... chai.expect(() => o.bar).throw()
  //... flag.expect(421)
  //... d = eYo.descriptorW(setter)
  //... chai.expect(() => Object.defineProperty(o, 'bar', d)).throw()
  //... o = {}
  //... d = eYo.descriptorW({lazy: msg_2}, setter, true)
  //... Object.defineProperty(o, 'bar', d)
  //... o.bar = 123
  //... flag.expect(666)
  //... chai.expect(() => o.bar).throw()
  //... flag.expect(421)
  //... d = eYo.descriptorW(setter)
  //... Object.defineProperty(o, 'bar', d) // now it is configurable
  //>>>
}

/**
 * Function used when defining a JS property.
 * @param {String|Object} [msg] - Diagnostic message, or object
 * with a `lazy` attribute for a function returning the dignostic message.
 * @param {Boolean|Function} configurable
 * @private
 */
eYo.descriptorNORW = (msg, configurable) => {
  if (eYo.isBool(msg)) {
    eYo.isDef(configurable) && eYo.throw(`eYo.descriptorNORW: Unexpected last argument ${configurable}`)
    ;[msg, configurable] = [eYo.NA, msg]
  }
  msg && msg.lazy && (msg = msg.lazy)
  return {
    get: eYo.noGetter(msg),
    set: eYo.noSetter(msg),
    configurable: !!configurable,
  }
  //<<< mochai: eYo.descriptorNORW
  //... chai.assert(eYo.descriptorNORW)
  //... let msg_1 = 'foo'
  //... let msg_2 = () => flag.push(421)
  //... var o, d
  //... o = {}
  //... d = eYo.descriptorNORW()
  //... Object.defineProperty(o, 'bar', d)
  //... chai.expect(() => o.bar).throw()
  //... flag.expect()
  //... chai.expect(() => o.bar = 123).throw()
  //... flag.expect()
  //... d = eYo.descriptorNORW()
  //... chai.expect(() => Object.defineProperty(o, 'bar', d)).throw()
  //... o = {}
  //... d = eYo.descriptorNORW(true)
  //... Object.defineProperty(o, 'bar', d)
  //... chai.expect(() => o.bar).throw()
  //... flag.expect()
  //... chai.expect(() => o.bar = 123).throw()
  //... flag.expect()
  //... d = eYo.descriptorNORW()
  //... Object.defineProperty(o, 'bar', d) // now it is configurable
  //... o = {}
  //... d = eYo.descriptorNORW(msg_1)
  //... Object.defineProperty(o, 'bar', d)
  //... chai.expect(() => o.bar).throw()
  //... flag.expect()
  //... chai.expect(() => o.bar = 123).throw()
  //... flag.expect()
  //... d = eYo.descriptorNORW()
  //... chai.expect(() => Object.defineProperty(o, 'bar', d)).throw()
  //... o = {}
  //... d = eYo.descriptorNORW(msg_1, true)
  //... Object.defineProperty(o, 'bar', d)
  //... chai.expect(() => o.bar).throw()
  //... flag.expect()
  //... chai.expect(() => o.bar = 123).throw()
  //... flag.expect()
  //... d = eYo.descriptorNORW()
  //... Object.defineProperty(o, 'bar', d) // now it is configurable
  //... o = {}
  //... d = eYo.descriptorNORW({lazy: msg_2})
  //... Object.defineProperty(o, 'bar', d)
  //... chai.expect(() => o.bar).throw()
  //... flag.expect(421)
  //... chai.expect(() => o.bar = 123).throw()
  //... flag.expect(421)
  //... d = eYo.descriptorNORW()
  //... chai.expect(() => Object.defineProperty(o, 'bar', d)).throw()
  //... o = {}
  //... d = eYo.descriptorNORW({lazy: msg_2}, true)
  //... Object.defineProperty(o, 'bar', d)
  //... chai.expect(() => o.bar).throw()
  //... flag.expect(421)
  //... chai.expect(() => o.bar = 123).throw()
  //... flag.expect(421)
  //... d = eYo.descriptorNORW()
  //... Object.defineProperty(o, 'bar', d) // now it is configurable
  //>>>
}

Object.defineProperty(eYo._p, 'Sym', {
  //<<< mochai: eYo.Sym
  //... chai.expect(eYo).property('Sym')
  value: {}
  //>>>
})

/**
 * Creates a symbol uniquely attached to the given key
 * @param {String} key - The result is `eYo.Sym[key]
 */
eYo._p.newSym = function (...$) {
  //<<< mochai: newSym
  for(let key of $) {
    if (this.Sym.hasOwnProperty(key)) {
      throw `Do not declare a symbol twice`
    }
    return this.Sym[key] = Symbol(key)
  }
  //... var id = eYo.genUID(eYo.IDENT)
  //... chai.expect(eYo.newSym(id)).equal(eYo.Sym[id])
  //... chai.expect(() => {
  //...   eYo.newSym(id)
  //... }).throw()
  //>>>
}

eYo.newSym('target') // used by proxies

/**
 * The props dictionary is a `key=>value` mapping where values
 * are getters, not a dictionary containing a getter.
 * @param {*} object - The destination
 * @param {*} props - the source
 * @return {*} the destination
 */
eYo.mixinRO = (object, props) => {
  Object.keys(props).forEach(key => {
    eYo.hasOwnProperty(object, key) && eYo.throw(`Duplicate keys are forbidden: ${object}, ${key}`)
    var value = props[key]
    Object.defineProperty(
      object,
      key,
      eYo.descriptorR(eYo.isF(value) ? value : function () {
        return value
      })
    )
  })
  Object.getOwnPropertySymbols(props).forEach(key => {
    eYo.hasOwnProperty(object, key) && eYo.throw(`Duplicate symbols are forbidden: ${object}, ${key}`)
    var value = props[key]
    Object.defineProperty(
      object,
      key,
      eYo.descriptorR(eYo.isF(value) ? value : function () {
        return value
      })
    )
  })
  return object
  //<<< mochai: mixinR
  //... let o = {}
  //... eYo.mixinRO(o, {
  //...   foo: 421
  //... })
  //... chai.expect(o.foo).equal(421)
  //... chai.expect(() => {
  //...   o.foo = 421
  //... }).throw()
  //... chai.expect(() => {
  //...   eYo.mixinRO(o, {
  //...     foo: 123
  //...   })
  //... }).throw()
  //... eYo.mixinRO(o, {
  //...   bar: 123
  //... })
  //... chai.expect(o.foo).equal(421)
  //... chai.expect(o.bar).equal(123)
  //... let a = {}
  //... let b = {}
  //... chai.expect(() => eYo.mixinRO(eYo.NS, eYo.NA)).throw()
  //... chai.expect(() => eYo.mixinRO(a, eYo.NA)).throw()
  //... eYo.mixinRO(a, b)
  //... chai.expect(a).deep.equal(b)
  //... b.foo = 421
  //... chai.expect(() => eYo.mixinRO(eYo.NS, b)).throw()
  //... chai.expect(a).not.deep.equal(b)
  //... eYo.mixinRO(a, b)
  //... chai.expect(a.foo).equal(b.foo).equal(421)
  //... chai.expect(() => eYo.mixinRO(a, b)).throw()
  //... let c = {}
  //... eYo.mixinRO(c, {
  //...   foo () {
  //...     flag.push(1)
  //...   }
  //... })
  //... flag.expect()
  //>>>
}

/**
 * The props dictionary is a `key=>value` mapping where values
 * are methods when a function.
 * @param {*} object - The destination
 * @param {*} props - the source
 * @return {*} the destination
 */
eYo.mixinFR = (object, props) => {
  Object.keys(props).forEach(key => {
    eYo.hasOwnProperty(object, key) && eYo.throw(`Duplicate keys are forbidden: ${object}, ${key}`)
    let value = props[key]
    Object.defineProperty(
      object,
      key,
      eYo.descriptorR(function () {
        return value
      })
    )
  })
  return object
  //<<< mochai: mixinMethodsR
  //... let o = {}
  //... eYo.mixinFR(o, {
  //...   foo: 421
  //... })
  //... chai.expect(o.foo).equal(421)
  //... chai.expect(() => {
  //...   o.foo = 421
  //... }).throw()
  //... chai.expect(() => {
  //...   eYo.mixinFR(o, {
  //...     foo: 123
  //...   })
  //... }).throw()
  //... eYo.mixinFR(o, {
  //...   bar: 123
  //... })
  //... chai.expect(o.foo).equal(421)
  //... chai.expect(o.bar).equal(123)
  //... let a = {}
  //... let b = {}
  //... chai.expect(() => eYo.mixinFR(eYo.NS, eYo.NA)).throw()
  //... chai.expect(() => eYo.mixinFR(a, eYo.NA)).throw()
  //... eYo.mixinFR(a, b)
  //... chai.expect(a).deep.equal(b)
  //... b.foo = 421
  //... chai.expect(() => eYo.mixinFR(eYo.NS, b)).throw()
  //... chai.expect(a).not.deep.equal(b)
  //... eYo.mixinFR(a, b)
  //... chai.expect(a.foo).equal(b.foo).equal(421)
  //... chai.expect(() => eYo.mixinFR(a, b)).throw()
  //... let c = {}
  //... eYo.mixinFR(c, {
  //...   foo () {
  //...     flag.push(1)
  //...   }
  //... })
  //... flag.expect()
  //... eYo.mixinFR(c, {
  //...   bar () {
  //...     flag.push(1)
  //...   }
  //... })
  //... flag.expect()
  //... c.bar()
  //... flag.expect(1)
  //>>>
}

/**
 * The props dictionary is a `key=>value` mapping where values
 * are getters, not a dictionary containing a getter.
 * The difference with the `mixinR` is that an existing key is not overriden.
 * @param {Boolean} [getters] - True if functions are considered as getter, false otherwise. Truthy values are not allowed.
 * @param {*} dest - The destination
 * @param {*} props - the source
 * @return {*} the destination
 */
eYo.provideR = (getters, dest, props) => {
  if (!eYo.isBool(getters)) {
    eYo.isDef(props) && eYo.throw(`Unepected last argument ${props}`)
    ;[getters, dest, props] = [true, getters, dest]
  }
  Object.keys(props).forEach(key => {
    if (!eYo.hasOwnProperty(dest, key)) {
      let value = props[key]
      let d = eYo.descriptorR(getters && eYo.isF(value) ? value : function () {
        return value
      })
      let dd = Object.getOwnPropertyDescriptor(props, key)
      d.enumerable = dd.enumerable
      d.configurable = dd.configurable
      Object.defineProperty(dest, key, d)
    }
  })
  return dest
  //<<< mochai: eYo: provideR'
  //... let a = {}
  //... let b = {}
  //... chai.expect(() => eYo.provideR(eYo.NS, eYo.NA)).to.throw()
  //... chai.expect(() => eYo.provideR(a, eYo.NA)).to.throw()
  //... eYo.provideR(a, b)
  //... chai.expect(a).to.deep.equal(b)
  //... b.foo = 421
  //... chai.expect(() => eYo.provideR(eYo.NS, b)).to.throw()
  //... chai.expect(a).not.to.deep.equal(b)
  //... eYo.provideR(a, b)
  //... chai.expect(a.foo).equal(b.foo).equal(421)
  //... b.foo = 123
  //... chai.expect(() => eYo.provideR(a, b)).not.to.throw()
  //... chai.expect(a.foo).not.equal(b.foo)
  //>>>
}

eYo.mixinFR(eYo, {
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
  },
  /**
   * Void function frequently used.
   */
  doNothing: function () {}, // NO SHORTHAND
  /**
   * Identity function frequently used.
   */
  doReturn (what) {
    return what
  },
  /**
   * Projection function frequently used.
   */
  doReturn2nd (what, $else) {
    return $else
  },
})

// ANCHOR Utilities
eYo.mixinFR(eYo, {
  /**
   * Readonly undefined
   */
  NA: (() => {
    var x
    return x
  })(),
  /**
   * Whether the argument is an object.
   * @param {*} what 
   */
  isObject (what) { // see g@@g.isObject
    var type = typeof val
    return type == 'object' && val != null || type == 'function'
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
    //<<< mochai: eYo.asDef
    //... var what = {}
    //... chai.expect(eYo.asDef(what)).equal(what)
    //... chai.expect(eYo.isDef(eYo.asDef())).false
    //... chai.expect(eYo.asDef(eYo.NA, what)).equal(what)
    //... chai.expect(eYo.asDef(null, what)).equal(what)
    //>>>
  },
  INVALID: (() => {
    return new eYo.doNothing()
    //<<< mochai: eYo.INVALID
    //... chai.expect(eYo.isDef(eYo.INVALID)).true
    //>>>
  })(),
  /**
   * Whether the argument is not `eYo.INVALID`.
   * @param {*} what
   */
  isVALID (what) {
    return what !== eYo.INVALID
    //<<< mochai: eYo.isVALID
    //... chai.assert(eYo.isVALID)
    //... chai.expect(eYo.isVALID(eYo.INVALID)).false
    //... chai.expect(eYo.isVALID()).true
    //... chai.expect(eYo.isVALID({})).true
    //>>>
  },
  /**
   * Whether the argument is `eYo.INVALID`.
   * @param {*} what
   */
  isINVALID (what) {
    return what === eYo.INVALID
    //<<< mochai: eYo.isINVALID
    //... chai.assert(eYo.isVALID)
    //... chai.expect(eYo.isINVALID(eYo.INVALID)).true
    //... chai.expect(eYo.isINVALID()).false
    //... chai.expect(eYo.isINVALID({})).false
    //>>>
  },
  /**
   * Calls `helper` if the `ans` is valid.
   * `ans` may be the output of a reentrant method.
   * @param {*} ans
   * @param {function|*} [f] – function or default value
   * @return The result of the call to `f`, when `f` is defined,
   * `ans` if it is valid, `f` if not a function else `eYo.NA` otherwise.
   */
  whenVALID  (ans, f) {
    if (eYo.isVALID(ans)) {
      return (eYo.isF(f) && f(ans)) || ans
    }
    return eYo.isF(f) ? eYo.NA : f
    //<<< mochai: eYo.INVALID
    //... eYo.whenVALID({}, () => {
    //...   flag.push(421)
    //... })
    //... flag.expect(421)
    //... eYo.whenVALID(eYo.INVALID, () => {
    //...   flag.push(421)
    //... })
    //... flag.expect()
    //>>>
  },
  /**
   * Whether the argument is na array.
   * @param {*} what
   */
  isRA (what) {
    return Array.isArray(what)
    //<<< mochai: eYo.isRA
    //... chai.assert(eYo.isRA)
    //... chai.expect(eYo.isRA([])).true
    //... chai.expect(eYo.isRA()).false
    //... chai.expect(eYo.isRA('')).false
    //>>>
  },
  /**
   * Convenient method to return  the copy of an array.
   * @param {*} what
   */
  copyRA (what) {
    return Array.prototype.slice.call(what, 0)
    //<<< mochai: eYo.copyRA
    //... let original = []
    //... var copy = eYo.copyRA(original)
    //... chai.expect(copy).to.deep.equal(original)
    //... original.push(1)
    //... chai.expect(copy).not.to.deep.equal(original)
    //... copy = eYo.copyRA(original)
    //... chai.expect(copy).to.deep.equal(original)
    //... copy.push(2)
    //... chai.expect(copy).not.to.deep.equal(original)
    //... original.push(2)
    //... chai.expect(copy).to.deep.equal(original)
    //>>>
  },
  /**
   * Whether the argument is a function.
   * @param {*} what
   * @return {!Boolean}
   */
  isNS (what) {
    return !!what && eYo.isSubclass(what.constructor, eYo.constructor)
  },
  /**
   * Returns the argument if its a function, `eYo.NA` otherwise.
   * @param {*} what
   * @param {*} defaults - a default function
   * @return {Function|eYo.NA}
   */
  asF (what, defaults = eYo.NA) {
    return eYo.isF(what) ? what : defaults
    //<<< mochai: eYo.asF
    //... chai.assert(eYo.asF)
    //... chai.expect(eYo.asF()).equals(eYo.NA)
    //... chai.expect(eYo.asF(1)).equals(eYo.NA)
    //... chai.expect(eYo.asF([])).equals(eYo.NA)
    //... chai.expect(eYo.asF(1, 2)).equals(2)
    //... chai.expect(eYo.asF([], 2)).equals(2)
    //... let f = function () {}
    //... chai.expect(eYo.asF(f)).equals(f)
    //... chai.expect(eYo.asF(f, 2)).equals(f)
    //>>>
  },
  /**
   * Turns the argument into a function.
   * Returns the argument when a function that returns the argument otherwise.
   * @param {*} what
   * @return {Function}
   */
  toF (what) {
    return eYo.isF(what) ? what : () => {
      return what
    }
    //<<< mochai: eYo.toF
    //... chai.assert(eYo.toF)
    //... let f = function () {}
    //... chai.expect(eYo.toF(f)).equal(f)
    //... chai.expect(eYo.toF()()).equal(eYo.NA)
    //... chai.expect(eYo.toF(eYo.NA)()).equal(eYo.NA)
    //... chai.expect(eYo.toF(421)()).equal(421)
    //>>>
  },
  /**
   * When not a function, returns the argument into
   * a function that returns an array.
   */
  toRAF: (x) => {
    //<<< mochai: eYo.toRAF
    //... chai.assert(eYo.toRAF)
    //... var what
    if (eYo.isRA(x)) {
      return function () {
        return x
      }
      //... what = []
      //... chai.expect(eYo.toRAF(what)()).equal(what)
  } else if (eYo.isF(x)) {
      return x
      //... what = function () {}
      //... chai.expect(eYo.toRAF(what)).equal(what)
    } else {
      return function () {
        return [x]
      }
      //... what = 421
      //... chai.expect(eYo.toRAF(what)()).eql([what])
    }
    //>>>
  },
  /**
   * Whether the argument is a constructor, in edython paradigm.
   * Such a constructor is a function with an `[eYo.$]` property pointing to
   * a delegate. It is not advisable to change this property on the fly.
   * @param {*} what
   * @return {!Boolean}
   */
  isC9r (what) {
    return !!what && !!what[eYo.$] && eYo.isF(what)
  },
  /**
   * Returns the evaluated argument if its a function,
   * the argument itself otherwise.
   * @param {*} what
   * @return {Function|eYo.NA}
   */
  called (what) {
    return eYo.isF(what) ? what() : what
    //<<< mochai: eYo.called
    //... chai.assert(eYo.called)
    //... chai.expect(eYo.called()).undefined
    //... chai.expect(eYo.called(421)).equal(421)
    //... chai.expect(eYo.called(() => 421)).equal(421)
    //>>>
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
})

eYo.mixinFR(eYo._p, {
  $SuperC9r: Symbol('SuperC9r'),
  $SuperC9r_p: Symbol('SuperC9r_p'),
  /**
   * Contrary to goog.inherits, does not erase the childC9r.prototype.
   * IE<11
   * No delegation managed yet.
   * @param {Function} ChildC9r
   * @param {Function} SuperC9r
   */
  inherits (ChildC9r, SuperC9r) {
    ChildC9r[eYo.$SuperC9r] = SuperC9r
    let Super_p = SuperC9r.prototype
    let Child_p = ChildC9r.prototype
    ChildC9r[eYo.$SuperC9r_p] = Child_p[eYo.$SuperC9r_p] = Super_p
    Object.setPrototypeOf(Child_p, Super_p)
    Object.defineProperty(Child_p, 'constructor', {
      value: ChildC9r
    })
  },
  //<<< mochai: eYo.isSubclass | eYo.inherits
  //... chai.assert(eYo.isSubclass)
  //... chai.expect(eYo.isSubclass()).false
  //... chai.expect(eYo.isSubclass(123)).false
  //... chai.expect(eYo.isSubclass(123, 421)).false
  //... let SuperC9r = function () {}
  //... chai.expect(eYo.isSubclass(SuperC9r, SuperC9r)).true
  //... let ChildC9r = function () {}
  //... chai.expect(eYo).property('inherits')
  //... eYo.inherits(ChildC9r, SuperC9r)
  //... chai.expect(eYo.isSubclass(ChildC9r, SuperC9r)).true
  //... chai.expect(ChildC9r[eYo.$SuperC9r_p]).equal(ChildC9r.prototype[eYo.$SuperC9r_p]).equal(SuperC9r.prototype)
  //>>>
})

// ANCHOR makeNS, provide
eYo.mixinFR(eYo._p, {
  /**
   * 
   * @param {String} p 
   */
  valueForKeyPath: function (p) {
    let components = p.split('.')
    var ans = this
    if (this === eYo && components[0] === 'eYo') {
      components.shift()
    }
    for (let component of components) {
      if (component.length && eYo.isNA(ans = ans[component])) {
        return
      }
    }
    return ans
    //<<< mochai: eYo.valueForKeyPath
    //... chai.expect(eYo.valueForKeyPath('eYo.test')).equal(eYo.test)
    //... chai.expect(eYo.valueForKeyPath('test')).equal(eYo.test)
    //... var key = eYo.genUID(eYo.IDENT)
    //... eYo.test[key] = {
    //...   foo: {bar: 421}
    //... }
    //... chai.expect(eYo.valueForKeyPath(`eYo.test.${key}.foo.bar`)).equal(421)
    //... delete eYo.test[key]
    //>>>
  },
  /**
   * @name {eYo.makeNS}
   * Make a namespace by subclassing the caller's constructor.
   * Will create 'foo' namespace together with an 'foo_p' property to access the prototype.
   * @param {!Object} ns - a namespace, created object will be `ns[key]`. Defaults to the receiver.
   * @param {String|Symbol} id - When a string, sentencecase name. Created object will be `ns[id]`.
   * @param {Object} [model] - Key/value pairs
   * @param {Boolean} [getters] - Whether in the model, function values are getters
   * @return {Object}
   */
  makeNS (ns, id, model, getters) {
    //<<< mochai: eYo.makeNS'
    //... chai.assert(eYo.isNS)
    //... chai.expect(eYo).eyo_NS
    //... chai.assert(eYo.makeNS)
    if (eYo.isDef(ns) && !eYo.isNS(ns)) {
      eYo.isDef(getters) && eYo.throw(`${this.name}/makeNS: Unexpected last argument: ${getters}`)
      ;[ns, id, model, getters] = [this, ns, id, model]
    }
    if (!eYo.isStr(id)) {
      eYo.isDef(getters) && eYo.throw(`${this.name}/makeNS: Unexpected last argument (2): ${getters}`)
      ;[id, model, getters] = [eYo.NA, id, model]
    }
    ns && id && ns[id] !== eYo.NA && eYo.throw(`${ns.name}[${id}] already exists.`)
    if (eYo.isBool(model)) {
      ;[model, getters] = [getters, model]
    }
    //... var ns = eYo.makeNS()
    //... chai.expect(ns).eyo_NS
    //... chai.expect(ns).not.equal(eYo)
    var Super = this.constructor
    var NS = function () {
      Super.call(this)
    }
    eYo.inherits(NS, Super)
    //... var ns_super = eYo.makeNS()
    //... chai.expect(ns_super).eyo_NS
    //... var ns = ns_super.makeNS()
    //... chai.expect(ns).eyo_NS
    //... chai.expect(() => ns.foo()).throw()
    //... ns_super._p.foo = eYo.doNothing
    //... ns.foo()

    //... var ns_super = eYo.makeNS()
    //... var ns = ns_super.makeNS()
    //... var key = eYo.genUID(eYo.IDENT)
    //... var ns = ns_super.makeNS(eYo.NULL_NS, key)
    //... chai.assert(ns)
    //... chai.expect(ns_super[key]).undefined

    Object.defineProperty(NS.prototype, 'super', {
      value: this,
      writable: false,
    })
    //... var ns_super = eYo.makeNS()
    //... var ns = ns_super.makeNS()
    //... chai.expect(ns).not.equal(ns_super)
    //... chai.expect(ns.super).equal(ns_super)
    ns && Object.defineProperty(NS.prototype, 'parent', {
      get () {
        console.error('BREAK HERE!!! parent')
        return ns
      },
      // value: ns, // used in makeBaseC9r
      // writable: false,
    })
    ns && Object.defineProperty(NS.prototype, 'parentNS', {
      value: ns, // used in makeBaseC9r
      writable: false,
    })
    model && Object.keys(model).forEach(k => {
      let value = model[k]
      Object.defineProperty(
        NS.prototype,
        k,
        eYo.descriptorR(getters && eYo.isF(value) ? value : function () {
          return value
        }, true)
      )
      //... var ns = eYo.makeNS(eYo.NULL_NS, 'fu', {
      //...   shi: 421
      //... })
      //... chai.expect(ns.shi).equal(421)
      //... var ns = eYo.makeNS(eYo.NULL_NS, 'fu', true, {
      //...   shi () { return 421 }
      //... })
      //... chai.expect(ns.shi).equal(421)
    })
    var ans = new NS()
    if (id) {
      ns && Object.defineProperties(ns, {
        [id]: { value: ans, writable: false, },
        [id + '_p']: { value: NS.prototype, writable: false, },
        [id + '_s']: { value: Super.prototype, writable: false, },
      })
      Object.defineProperties(NS.prototype, {
        key: {value: id, writable: false,},
        name: {
          value: ns ? `${ns.name}.${id}` : id,
          writable: false,
        },
      })
      //... var ns_super = eYo.makeNS()
      //... var ns = ns_super.makeNS('foo')
      //... chai.expect(ns).eyo_NS
      //... chai.expect(ns).equal(ns_super.foo)
      //... ns.makeNS('chi')
      //... chai.expect(ns_super.foo.chi).eyo_NS
    } else {
      Object.defineProperties(NS.prototype, {
        name: {
          value: ns ? `${ns.name}.?` : "No man's land",
          writable: false,
        },
      })
    }
    return ans
    //>>>
  },
  /**
   * @param {String} name - dotted components, some kind of path.
   * @param {Object} value - When false, nothing is performed. Thit is the value used to create some object at the given path, instead of the default namespace.
   */
  provide (name, value) {
    //<<< mochai: eYo.provide
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
    //... var key = eYo.genUID(eYo.IDENT)
    //... eYo.provide(`${key}.bar`)
    //... chai.expect(eYo[key]).eyo_NS
    //... chai.expect(eYo[key].bar).eyo_NS
    //>>>
  },
  /**
   * @param {String} path - dotted separated components.
   */
  require (name) {
    //<<< mochai: eYo.require
    var ns = eYo
    name.split('.').forEach(k => {
      if (eYo.isDef(ns)) {
        ns = ns[k]
        if (eYo.isNS(ns)) {
          return
        }
        if (ns) {
          ns = eYo.NA // no more component allowed
          return
        }
      }
      eYo.throw(`Missing required ${name}`)
    })
    //... var key = eYo.genUID(eYo.IDENT)
    //... eYo.provide(`${key}.foo`)
    //... eYo.require(`${key}`)
    //... eYo.require(`${key}.foo`)
    //... chai.expect(() => eYo.require(`${key}.foo.bar`)).throw()
    //... chai.expect(() => eYo.require(`${key}.bor`)).throw()
    //... chai.expect(() => eYo.require(`${key}1.foo`)).throw()
    //>>>
  },
  forward: eYo.doNothing,
})

// ANCHOR Assert
eYo.mixinFR(eYo, {
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
})

/**
 * The handler responsible for throwing or logging assertion errors.
 * @private {function(!eYo.AssertionError)}
 */
eYo.errorHandler_ = eYo.DEFAULT_ERROR_HANDLER
eYo.ENABLE_ASSERTS = true

eYo.provide('eYo')

//<<< mochai: version
eYo.makeNS('version', {
  //<<< mochai: CONST
  /** @define {number} */
  MAJOR: 0,
  //... chai.expect(eYo.version.MAJOR).eyo_Num
  /** @define {number} */
  MINOR: 1,

  /** @define {number} */
  PATCH: 0,

  /** @define {string} */
  PRERELEASE: '',

  /** @define {string} */
  BUILD_DATE: '',

  /** @define {string} */
  GIT_HEAD: '',
  //>>>
})
//>>>

eYo.makeNS('session')

eYo.makeNS('temp')
eYo.makeNS('debug')

goog.require('goog.userAgent')

// ANCHOR Assert
eYo.mixinRO(eYo, {
  userAgent: goog.userAgent,
  LETTER: 'letter',
  ALNUM: 'alnum',
  IDENT: 'ident',
  EPSILON: 1e-10,
})

eYo.mixinFR(eYo._p, {
  greater (left, right, tol = eYo.EPSILON) {
    return left - right >= -tol * (Math.abs(left) + Math.abs(right) + 2)
  },
  equals (left, right, tol = eYo.EPSILON) {
    return Math.abs(left - right) <= tol * (Math.abs(left) + Math.abs(right) + 2)
    /*
    assume left < right with no restriction, let
    0 < ∆ = (right - left) / 2
    µ = (left+right) / 2
    such that
    left = µ - ∆
    right = µ + ∆
    Math.abs(left - right) <= tol * (Math.abs(left) + Math.abs(right) + 2)
    becomes
    (*) 2 ∆ ≤ ε * (|µ - ∆| + |µ + ∆| + 2)
    * when 0 ≤ |µ| ≤ ∆, (*) becomes
    2 ∆ ≤ ε * (∆ - |µ| + |µ| + ∆ + 2)
    ∆ ≤ ε * (∆ + 1)
    It is true when either
    i) ∆ / (∆ + 1) ≤ ε
    ii) ∆ ≤ ε / (1 - ε)
    * when 0 ≤ ∆ ≤ |µ|, (*) becomes
    2 ∆ ≤ ε * (|µ| - ∆ + |µ| + ∆ + 2)
    ∆ ≤ ε * (|µ| + 1)
    It is true when either
    i) ∆ / (|µ| + 1) ≤ ε
    ii) ∆ ≤ ε * (|µ| + 1)
    */
  },
  //<<< mochai: eYo.greater|equals
  // left = 0.9, right = 1.1, µ = 1, ∆ = 0.1
  // 0 ≤ ∆ ≤ |µ|:
  // ε_critical = ∆ / (|µ| + 1) = 0.05
  // Math.abs(left - right) <= tol * (Math.abs(left) + Math.abs(right) + 2)
  // 0.2 <= tol * 4 = 0.05 * 4 * 1.01 = 0.202
  //... chai.expect(eYo.equals(0.9, 1.1, 1.01 * 0.05)).true
  //... chai.expect(eYo.greater(0.9, 1.1, 1.01 * 0.05)).true
  //... chai.expect(eYo.equals(0.9, 1.1, 0.99 * 0.05)).false
  //... chai.expect(eYo.greater(0.9, 1.1, 0.99 * 0.05)).false
  // left = -1, right = 3, µ = 1, ∆ = 2
  // 0 ≤ |µ| ≤ ∆:
  // ε_critical = ∆ / (∆ + 1) = 2/3
  // Math.abs(left - right) <= tol * (Math.abs(left) + Math.abs(right) + 2)
  // 4 <= tol * (6)
  //... chai.expect(eYo.equals(-1, 3, 1.01 * 2/3)).true
  //... chai.expect(eYo.greater(-1, 3, 1.01 * 2/3)).true
  //... chai.expect(eYo.equals(-1, 3, 0.99 * 2/3)).false
  //... chai.expect(eYo.greater(-1, 3, 0.99 * 2/3)).false
  //... var mean = eYo.test.randN()
  //... var delta = mean + eYo.test.randN()
  //... var epsilon = delta / (delta + 1)
  //... chai.expect(eYo.equals(mean - delta, mean + delta, 1.01 * epsilon)).true
  //... chai.expect(eYo.equals(mean - delta, mean + delta, 0.99 * epsilon)).false
  //... var delta = eYo.test.randN()
  //... var mean = delta + eYo.test.randN()
  //... var epsilon = delta / (mean + 1)
  //... chai.expect(eYo.equals(mean - delta, mean + delta, 1.01 * epsilon)).true
  //... chai.expect(eYo.equals(mean - delta, mean + delta, 0.99 * epsilon)).false
  //... var c = 1.23
  //... var epsilon = 0.01
  /*
  left = c
  right = c + 2 ∆
  Math.abs(left - right) <= tol * (Math.abs(left) + Math.abs(right) + 2)
  2 ∆ ≤ ε * (c + c + 2 ∆ + 2)
  ∆ ≤ ε * (c + ∆ + 1)
  ∆ ≤ ε * (c + 1) / (1 - ε)
  */
  // 
  //... var delta = epsilon * (c + 1) / (1 - epsilon)
  /*
  Math.abs(left - right) <= tol * (Math.abs(left) + Math.abs(right) + 2)
  2 ∆ ≤ 0.99 * ε * (c + c + 2 ∆ + 2)
  ∆ ≤ 0.99 * ε * (c + ∆ + 1)
  ε * (c + 1) / (1 - ε) ≤ 0.99 * ε * (c + ε * (c + 1) / (1 - ε) + 1)
  c + 1 ≤ 0.99 * (c + ε * (c + 1) / (1 - ε) + 1) * (1 - ε)
  c + 1 ≤ 0.99 * (c * (1 - ε) + ε * (c + 1) + 1 - ε)
  c + 1 ≤ 0.99 * (c - c * ε + ε * c + ε + 1 - ε)
  c + 1 ≤ 0.99 * (c + 1)
  */
  //... chai.expect(eYo.equals(c, c + 2 * delta, 1.01 * epsilon)).true
  //... chai.expect(eYo.equals(c, c + 2 * delta, 0.99 * epsilon)).false
  //>>>
})

;(() => {
  // remove characters '`:()[]{}' for convenience
  var letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_'
  var alnum = letter + '0123456789'
  var all = alnum + '!#$%*+,-./;=?@^|'
  /**
   * Generate a unique ID.  This should be globally unique.
   * 79 characters ^ 20, length > 128 bits (better than a UUID).
   * @param {type} String - One of `eYo.IDENT`, `eYo.LETTER`, `eYo.ALNUM`.
   * @return {string} A globally unique ID string.
   */
  eYo._p.genUID = (type, length) => {
    if (!eYo.isStr(type)) {
      ;[length, type] = [type, length]
    }
    length || (length = 20)
    if (type === eYo.IDENT) {
      return eYo.genUID(eYo.LETTER, 1) + eYo.genUID(eYo.ALNUM, length - 1)
    }
    let soup = type === eYo.LETTER ? letter :
    type === eYo.ALNUM ? alnum : all
    let soupLength = soup.length
    let id = []
    var i = length || 20
    while (i) {
      id[--i] = soup.charAt(Math.random() * soupLength)
    }
    return id.join('')
  }
})()

//>>>