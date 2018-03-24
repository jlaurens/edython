/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Consolidators for various list blocks and proper_slice, for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Do')

goog.require('ezP')

ezP.Do.Name = function () {
  // characters are in ]MIN, MAX[
  var MIN = 32
  var MAX = 127
  var BASE = MAX - MIN
  var me = {
    min_name: String.fromCharCode(MIN+1),
    max_name: String.fromCharCode(MAX-1),
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
    var L = [], R = [], l, r, i = 0
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
      L.push(Math.max(Math.min(l,MAX-1),MIN+1)-MIN)
      R.push(Math.max(Math.min(r,MAX-1),MIN+1)-MIN)
    }
    // console.log('L', L)
    // console.log('R', R)
    if (L[L.length-1] === 1 && R[R.length-1] === 1) {
      // bad string format
      return undefined
    }
    // both arrays represent a number:
    // L[0]+ L[1]/base + L[2]/base**2 ...
    // where BASE ::= MAX - MIN
    // find the difference R - L
    var delta = []
    i = L.length // == R.length
    var carry = 0
    var different = false
    while(i--) {
      l = L[i] + carry
      r = R[i]
      carry = 0
      if (l >= BASE) {
        carry = 1
        l = 0
        delta.unshift(l)
      } else if (r > l) {
        different = true
        delta.unshift(r-l)
      } else if (r == l) {
        delta.unshift(r-l)
      } else /*if (r < l) */{
        different = true
        delta.unshift(r+(BASE-l))
        carry = 1
      }
    }
    // console.log('delta', delta)
    return {
      sign: carry? 1: (different? -1: 0),
      lhs: L,
      rhs: R,
      delta: delta,
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
      var code = lhs.charCodeAt(i)
      if (isNaN(code)) {
        if (seen<0) {
          return name
        }
        if (seen>0) {
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
          code = lhs.charCodeAt(i)
          if (isNaN(code)) {
            if (seen<0) {
              return RA.join('')
            }
            if (seen>0) {
              return RA.slice(0, seen).join('')
            }
            return '!'
          }
          if (code <= MIN) {
            RA.push(String.fromCharCode(MIN+1))
          }
          if (code >= MAX) {
            RA.push(String.fromCharCode(MAX-1))
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
    var l, r, i = 0
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
      if (h>1) {
        carry = 0
        break
      }
      carry = r - h
    }
    if (carry) {
      half.push(Math.floor(BASE*weight))
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
      var d = l+r+carry
      if (d>BASE) {
        d -= BASE
        carry = 1
      } else if (d===BASE) {
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
        ans.unshift(String.fromCharCode(MIN+d))
      }
    }
    return ans.join('')
  }
  me.middle_name = me.getBetween(me.min_name, me.max_name, 0.5)
  return me
} ()

ezP.Do.ensureArray = function (object) {
  return goog.isArray(object)? object: (object? [object]: object)
}

ezP.Do.createSPAN = function(text,css) {
  return goog.dom.createDom(goog.dom.TagName.SPAN, css || null,
    goog.dom.createTextNode(text),
  )
}

/**
 * Is the given string an acceptable identifier ?
 * For ezPython.
 * @return true if candidate is an acceptable identifier
 */
ezP.Do.typeOfString = function (candidate) {
  if (['False', 'None', 'True'].indexOf(candidate)>=0) {
    return 'reserved identifier'
  }
  if (['class', 'finally', 'is', 'return', 'continue', 'for', 'lambda', 'try', 'def', 'from', 'nonlocal', 'while', 'and', 'del', 'global', 'not', 'with', 'as', 'elif', 'if', 'or', 'yield', 'assert', 'else', 'import', 'pass', 'break', 'except', 'in', 'raise'].indexOf(candidate)>=0) {
    return 'reserved keyword'
  }
}
