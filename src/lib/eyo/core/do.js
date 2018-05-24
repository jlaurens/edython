/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Various utilities.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Do')

goog.require('eYo.Const')
goog.require('goog.dom');

goog.asserts.assert(Object.setPrototypeOf, 'No setPrototypeOf, buy a new computer')

/**
 * Contrary to goog.inherits, does not erase the childC9r.prototype.
 * IE<11
 */
eYo.Do.inherits = function (childC9r, parentC9r) {
  childC9r.superClass_ = parentC9r.prototype
  Object.setPrototypeOf(childC9r.prototype, parentC9r.prototype)
  childC9r.prototype.constructor = childC9r
}

//
// /* Replace the cssText for rule matching selectorText with value
//  ** Changes all matching rules in all style sheets
//  ** https://stackoverflow.com/questions/7657363/changing-global-css-styles-from-javascript
//  */
// eYo.Do.replaceRuleProperty = function (selectorText, propertyName, value, priority) {
//   var sheets = document.styleSheets
//   for (var i = 0, iLen = sheets.length; i < iLen; i++) {
//     var sheet = sheets[i]
//     if (sheet.cssRules) {
//       var rules = sheet.cssRules
//       for (var j = 0, jLen = rules.length; j < jLen; j++) {
//         var rule = rules[j]
//         if (rule.selectorText === selectorText) {
//           if (value) {
//             rule.style.setProperty(propertyName, value, priority)
//           } else {
//             rule.style.removeProperty(propertyName)
//           }
//         }
//       }
//     }
//   }
// }

eYo.Do.Name = (function () {
  // characters are in ]MIN, MAX[
  var MIN = 32
  var MAX = 127
  var BASE = MAX - MIN
  var me = {
    min_name: String.fromCharCode(MIN + 1),
    max_name: String.fromCharCode(MAX - 1)
  }
  /**
   * Get an index name between two strings.
   * We assume that there exists infinitely many
   * words between lhs and rhs.
   * This is ensured by assuming that
   * 1) any finite string represents in reality
   * an infinite string ending with '!' characters
   * 2) no finite string last character is '!',
   * except for the one length string '!' itself.
   * @param {!string} lhs
   * @param {!string} rhs
   * @return an object {sign: ±1, value: rhs - lhs as array} or undefined on entry error
   */
  me.getDelta = function (lhs, rhs) {
    // turn rhs and lhs into an array
    // of char codes relative to min
    var L = []
    var R = []
    var l, r
    var i = 0
    while (true) {
      l = lhs.charCodeAt(i)
      r = rhs.charCodeAt(i)
      ++i
      if (isNaN(l)) {
        if (isNaN(r)) {
          break
        }
        l = MIN + 1
      } else if (isNaN(r)) {
        r = MIN + 1
      }
      L.push(Math.max(Math.min(l, MAX - 1), MIN + 1) - MIN)
      R.push(Math.max(Math.min(r, MAX - 1), MIN + 1) - MIN)
    }
    // console.log('L', L)
    // console.log('R', R)
    if (L[L.length - 1] === 1 && R[R.length - 1] === 1) {
      // bad string format
      return undefined
    }
    // both arrays represent a number:
    // L[0]+ L[1]/base + L[2]/base**2 ...
    // where BASE ::= MAX - MIN
    // find the difference R - L
    var delta = []
    i = L.length // === R.length
    var carry = 0
    var different = false
    while (i--) {
      l = L[i] + carry
      r = R[i]
      carry = 0
      if (l >= BASE) {
        carry = 1
        l = 0
        delta.unshift(l)
      } else if (r > l) {
        different = true
        delta.unshift(r - l)
      } else if (r === l) {
        delta.unshift(r - l)
      } else /* if (r < l) */{
        different = true
        delta.unshift(r + (BASE - l))
        carry = 1
      }
    }
    // console.log('delta', delta)
    return {
      sign: carry ? 1 : (different ? -1 : 0),
      lhs: L,
      rhs: R,
      delta: delta
    }
  }
  /**
   * Get the normalized name.
   * 1) characters are in ]MIN, MAX[
   * 2) no '!' at the end
   * @param {!string} name
   * @return a name in the proper format
   */
  me.getNormalized = function (name) {
    // in general name is already in the proper format
    // so just check
    var i = 0
    var seen = -1 // last index where there is MIN+1
    while (true) {
      var code = name.charCodeAt(i)
      if (isNaN(code)) {
        if (seen < 0) {
          return name
        }
        if (seen > 0) {
          return name.substring(0, seen)
        }
        return '!'
      }
      if (code <= MIN || code >= MAX) {
        // Ok there is a problem,
        // restart and fix it
        var RA = []
        i = 0
        seen = -1
        while (true) {
          code = name.charCodeAt(i)
          if (isNaN(code)) {
            if (seen < 0) {
              return RA.join('')
            }
            if (seen > 0) {
              return RA.slice(0, seen).join('')
            }
            return '!'
          }
          if (code <= MIN) {
            RA.push(String.fromCharCode(MIN + 1))
          }
          if (code >= MAX) {
            RA.push(String.fromCharCode(MAX - 1))
          }
          if (code === MIN + 1 && seen < 0) {
            seen = i
          }
          ++i
        }
      }
      if (code === MIN + 1 && seen < 0) {
        seen = i
      }
      ++i
    }
  }
  /**
   * Get the order of the two given strings.
   * @param {!string} lhs
   * @param {!string} rhs
   * @return -1 if lhs < rhs,
   * 0 if lhs === rhs,
   * 1 if lhs > rhs,
   * undefined if one of lhs or rhs does not have the proper format
   */
  me.getOrder = function (lhs, rhs) {
    var l, r
    var i = 0
    while (true) {
      l = lhs.charCodeAt(i)
      r = rhs.charCodeAt(i)
      ++i
      if (isNaN(l)) {
        if (isNaN(r)) {
          return 0
        } else if (MIN + 1 < r) {
          return -1
        } else if (l > MIN + 1) {
          return 1
        } else {
          return 0
        }
      } else if (isNaN(r)) {
        if (l < MIN + 1) {
          return -1
        } else if (l > MIN + 1) {
          return 1
        } else {
          return 0
        }
      } else if (l < r) {
        return -1
      } else if (l > r) {
        return 1
      }
    }
    // var D = me.getDelta(lhs, rhs)
    // return (D && D.sign) || D
  }
  /**
   * Get an index name between two strings.
   * We assume that there exists infinitely many
   * words between lhs and rhs.
   * This is ensured by assuming that
   * 1) any finite string represents in reality
   * an infinite string ending with '!' characters
   * 2) no finite string last character is '!'
   * @param {!string} lhs
   * @param {!string} rhs
   * @return a string between lhs and rhs
   */
  me.getBetween = function (lhs, rhs, weight = 0.5) {
    // turn rhs and lhs into an array
    // of char codes relative to min
    var D = me.getDelta(lhs, rhs)
    if (!D || D.sign >= 0) {
      return undefined
    }
    if (weight <= 0) {
      return lhs
    }
    if (weight >= 1) {
      return rhs
    }
    // multiplay delta by weight
    var carry = 0
    var half = []
    for (var i = 0; i < D.delta.length; i++) {
      var r = (D.delta[i] + carry * BASE) * weight
      var h = Math.floor(r)
      half.push(h)
      if (h > 1) {
        carry = 0
        break
      }
      carry = r - h
    }
    if (carry) {
      half.push(Math.floor(BASE * weight))
      carry = 0
    }
    // console.log('half', half)
    // the last element of half is >1, assuming that BASE>3
    // Somehow ans = L + half
    var ans = []
    i = half.length
    carry = 0
    while (i--) {
      var l = D.lhs[i]
      if (isNaN(l)) {
        l = 0
      }
      r = half[i]
      var d = l + r + carry
      if (d > BASE) {
        d -= BASE
        carry = 1
      } else if (d === BASE) {
        // no 0, restart here
        ans = []
        carry = 1
        continue
        // can we reach that group?
        // yes, L === [1, BASE - n], R === [2, n]
      } else {
        carry = 0
      }
      if (d || ans.length) {
        ans.unshift(String.fromCharCode(MIN + d))
      }
    }
    return ans.join('')
  }
  me.middle_name = me.getBetween(me.min_name, me.max_name, 0.5)
  return me
}())

eYo.Do.ensureArray = function (object) {
  return goog.isArray(object) ? object : (object ? [object] : object)
}

eYo.Do.createSPAN = function (text, css) {
  return goog.dom.createDom(goog.dom.TagName.SPAN, css || null,
    goog.dom.createTextNode(text)
  )
}

goog.require('eYo.T3')

eYo.T3.Expr.reserved_identifier = 'reserved identifier'
eYo.T3.Expr.reserved_keyword = 'reserved keyword'
eYo.T3.Expr.builtin_name = 'builtin name'

/**
 * What is the type of this string? an identifier, a number, a reserved word ?
 * For edython.
 * @return the type of this candidate
 */
eYo.Do.typeOfString = function (candidate) {
  if (!goog.isString(candidate)) {
    return
  }
  if (['False', 'None', 'True'].indexOf(candidate) >= 0) {
    return eYo.T3.Expr.reserved_identifier
  }
  if (['class', 'finally', 'is', 'return', 'continue', 'for', 'lambda', 'try', 'def', 'from', 'nonlocal', 'while', 'and', 'del', 'global', 'not', 'with', 'as', 'elif', 'if', 'or', 'yield', 'assert', 'else', 'import', 'pass', 'break', 'except', 'in', 'raise'].indexOf(candidate) >= 0) {
    return eYo.T3.Expr.reserved_keyword
  }
  if (['print', 'input', 'range', 'list', 'len', 'sum'].indexOf(candidate) >= 0) {
    return eYo.T3.Expr.builtin_name
  }
  // is it a number ?
  if (eYo.XRE.integer.exec(candidate)) {
    return eYo.T3.Expr.integer
  }
  if (eYo.XRE.floatnumber.exec(candidate)) {
    return eYo.T3.Expr.floatnumber
  }
  if (eYo.XRE.imagnumber.exec(candidate)) {
    return eYo.T3.Expr.imagnumber
  }
  if (candidate === 'start') {
    return eYo.T3.Stmt.start_stmt
  }
  var components = candidate.split('.')
  if (components.length > 1) {
    var dotted_name = true
    var first
    // skip the void components
    for (var i = 0; i < components.length;) {
      var c = components[i]
      if (c.length) {
        first = i
        break
      }
      i++
    }
    for (; i < components.length; i++) {
      c = components[i]
      if (!eYo.XRE.identifier.exec(c)) {
        dotted_name = false
        break
      }
    }
    if (dotted_name) {
      return goog.isDef(first) && first > 0 ? eYo.T3.Expr.parent_module : eYo.T3.Expr.dotted_name
    }
  } else if (eYo.XRE.identifier.exec(candidate)) {
    return eYo.T3.Expr.identifier
  }
  if (eYo.XRE.shortstringliteralSingle.exec(candidate) || eYo.XRE.shortstringliteralDouble.exec(candidate)) {
    return eYo.T3.Expr.shortstringliteral
  }
  if (eYo.XRE.shortbytesliteralSingle.exec(candidate) || eYo.XRE.shortbytesliteralDouble.exec(candidate)) {
    return eYo.T3.Expr.shortbytesliteral
  }
  if (eYo.XRE.longstringliteralSingle.exec(candidate) || eYo.XRE.longstringliteralDouble.exec(candidate)) {
    return eYo.T3.Expr.longstringliteral
  }
  if (eYo.XRE.longbytesliteralSingle.exec(candidate) || eYo.XRE.longbytesliteralDouble.exec(candidate)) {
    return eYo.T3.Expr.longbytesliteral
  }
  return undefined
}

/**
 * The css class for the given text
 * For edython.
 * @param {!string} txt The text to be tested.
 * @return {string}
 */
eYo.Do.cssClassForText = function (txt) {
  switch (eYo.Do.typeOfString(txt)) {
  case eYo.T3.Expr.reserved_identifier:
  case eYo.T3.Expr.reserved_keyword:
    return 'eyo-code-reserved'
  case eYo.T3.Expr.builtin_name:
    return 'eyo-code-builtin'
  default:
    return 'eyo-code'
  }
}

/**
 * List enumerator
 * For edython.
 * @param {!Array} list indexed object.
 * @param {!function(Object): boolean} filter an optional filter.
 * @return {Object} an enumerator
 */
eYo.Do.Enumerator = function (list, filter) {
  if (!list) {
    return
  }
  var i = 0
  var me = {here: undefined}
  me.start = function () {
    i = 0
    me.here = undefined
  }
  me.end = function () {
    i = list.length
    me.here = undefined
  }
  me.isAtStart = function () {
    return i === 0
  }
  me.isAtEnd = function () {
    return i < list.length
  }
  var next_ = function () {
    return i < list.length ? list[i++] : undefined
  }
  var previous_ = function () {
    return i > 0 ? list[--i] : undefined
  }
  me.next = function () {
    while ((me.here = next_())) {
      if (!goog.isFunction(filter) || filter(me.here)) {
        break
      }
    }
    return me.here
  }
  me.previous = function () {
    while ((me.here = previous_())) {
      if (!filter || filter(me.here)) {
        break
      }
    }
    return me.here
  }
  me.start()
  return me
}

/**
 * Convenient shortcut
 * For edython.
 * @param {!Object} object
 * @param {!string} key
 * @return {boolean}
 */
eYo.Do.hasOwnProperty = function (object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

/**
 * Convenient format
 * For edython.
 * @param {!string} format
 * @param {...} args
 * @return {string}
 */
eYo.Do.format = function (format) {
  var args = Array.prototype.slice.call(arguments, 1)
  return format.replace(/{(\d+)}/g, function (match, number) {
    return goog.isDef(args[number]) ? args[number] : match
  })
}

