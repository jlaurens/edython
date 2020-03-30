/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Various utilities.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.makeNS('do')

//g@@g.forwardDeclare('g@@g.dom')

eYo.assert(Object.setPrototypeOf, 'No setPrototypeOf, buy a new computer')

// Object.keys polyfill
// http://tokenposts.blogspot.com/2012/04/javascript-objectkeys-browser.html
if (!Object.keys) Object.keys = function(o) {
  if (o !== Object(o))
    throw new TypeError('Object.keys called on a non-object');
  var k=[],p;
  for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
  return k;
}

//
// /* Replace the cssText for rule matching selectorText with value
//  ** Changes all matching rules in all style sheets
//  ** https://stackoverflow.com/questions/7657363/changing-global-css-styles-from-javascript
//  */
// eYo.do.replaceRuleProperty = function (selectorText, propertyName, value, priority) {
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

eYo.do.Name = (() => {
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
   * @param {string} lhs
   * @param {string} rhs
   * @return an object {sign: ±1, value: rhs - lhs as array} or eYo.NA on entry error
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
      return eYo.NA
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
   * @param {string} name
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
   * @param {string} lhs
   * @param {string} rhs
   * @return -1 if lhs < rhs,
   * 0 if lhs === rhs,
   * 1 if lhs > rhs,
   * eYo.NA if one of lhs or rhs does not have the proper format
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
   * @param {string} lhs
   * @param {string} rhs
   * @return a string between lhs and rhs
   */
  me.getBetween = function (lhs, rhs, weight = 0.5) {
    // turn rhs and lhs into an array
    // of char codes relative to min
    var D = me.getDelta(lhs, rhs)
    if (!D || D.sign >= 0) {
      return eYo.NA
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
      var x = (D.delta[i] + carry * BASE) * weight
      var h = Math.floor(x)
      half.push(h)
      if (h > 1) {
        carry = 0
        break
      }
      carry = x - h
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
      x = half[i]
      var d = l + x + carry
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
})()

eYo.do.ensureArray = eYo.do.ensureFunctionOrArray = function (object) {
  return eYo.isRA(object) || eYo.isF(object) ? object : (object ? [object] : object)
}

eYo.do.ensureFunction = function (object) {
  return eYo.isF(object)
    ? object
    : function () {
        return object
      }
}

eYo.do.CreateSPAN = function (text, css) {
  return eYo.dom.createDom(eYo.dom.TagName.SPAN, css || null,
    eYo.dom.createTextNode(text)
  )
}

/**
 * List enumerator
 * For edython.
 * @param {Array} list indexed object.
 * @param {function(Object): boolean} filter an optional filter.
 * @return {Object} an enumerator
 */
eYo.do.Enumerator = (list, filter) => {
  if (!list) {
    return
  }
  var i = 0
  var me = {here_: eYo.NA}
  me.start = () => {
    i = 0
    me.here_ = eYo.NA
  }
  me.end = () => {
    i = list.length
    me.here_ = eYo.NA
  }
  Object.defineProperties(me, {
    isAtStart: {
      get () {
        return i === 0
      }
    },
    isAtEnd: {
      get () {
        return i < list.length
      }
    },
    next: {
      get () {
        while ((me.here_ = next_())) {
          if (!eYo.isF(filter) || filter(me.here_)) {
            break
          }
        }
        return me.here_
      }
    },
    previous: {
      get () {
        while ((me.here_ = previous_())) {
          if (!filter || filter(me.here_)) {
            break
          }
        }
        return me.here_
      }
    },
    here: {
      get () {
        return this.here_
      }
    }
  })
  var next_ = () => {
    return i < list.length ? list[i++] : eYo.NA
  }
  var previous_ = () => {
    return i > 0 ? list[--i] : eYo.NA
  }
  me.start()
  return me
}

/**
 * Convenient converter.
 * Throws an error for bad input.
 * See https://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
 * For edython.
 * @param {string} string
 * @return {'Element'}
 */
eYo.do.StringToDom = function (string) {
  var parser = new DOMParser();
  var parsererrorNS = parser.parseFromString('>', 'application/xml').getElementsByTagName("parsererror")[0].namespaceURI
  var stringToDom = function (string) {
    var parser = new DOMParser();
    var dom = parser.parseFromString(string, 'application/xml');
    var ror = dom.getElementsByTagNameNS(parsererrorNS, 'parsererror')
    if(ror.length > 0) {
      console.error(ror)
      throw new Error('Error parsing XML');
    }
    return dom;
  }
  eYo.do.StringToDom = stringToDom
  return stringToDom(string)
}

/**
 * .
 * @param {*} element
 * @param {*} handler
 * @param {*} thisArg
 */
eYo.do.ChildForEach = function (element, handler, thisArg) {
  var children = Array.prototype.slice.call(element.childNodes)
  children.forEach(handler, thisArg)
}

/**
 * .
 * @param {*} element
 * @param {*} handler
 * @param {*} thisArg
 */
eYo.do.someChild = function (element, handler, thisArg) {
  var children = Array.prototype.slice.call(element.childNodes)
  return children.some(handler, thisArg)
}

/**
 * Forwards `thisArg` to the handler.
 * @param {*} element
 * @param {*} handler
 * @param {*} thisArg
 */
eYo.do.forEachElementChild = function (element, handler, thisArg) {
  var children = Array.prototype.slice.call(element.childNodes)
  children.forEach((child, index, item) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      handler.call(thisArg, child, index, item)
    }
  }, thisArg)
}

/**
 * Forwards `thisArg` to the handler.
 * @param {*} element
 * @param {*} handler
 * @param {*} thisArg
 */
eYo.do.SomeElementChild = function (element, handler, thisArg) {
  var children = Array.prototype.slice.call(element.childNodes)
  return children.some((child, index, item) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      return handler.call(thisArg, child, index, item)
    }
  }, thisArg)
}

/**
 * Forwards `this` to the handler.
 * @param {*} element
 * @param {*} handler
 * @param {*} thisArg
 */
eYo.do.forEachElementChild = function (element, handler, thisArg) {
  var children = Array.prototype.slice.call(element.childNodes)
  return children.forEach((child, index, array) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      return handler.call(thisArg, child, index, array)
    }
  }, this)
}

eYo.do.valueOf = function (f, thisObject) {
  return eYo.isF(f) ? f.call(thisObject) : f
}

/**
 * Void function frequently used.
 */
eYo.do.NYI = () => {
  throw new Error('This is not yet implemented, possibly a pure abstract method that needs subclassing.')
}

/**
 * A wrapper creator.
 * This is used to populate prototypes and define functions at setup time.
 * @param {Function} [try_f]
 * @param {Function} [finally_f]
 * @return whatever returns try_f
 */
eYo.do.tryFinally = function (try_f, finally_f) {
  try {
    return try_f()
  } finally {
    finally_f && finally_f()
  }
}

/**
 * A wrapper creator.
 * This is used to populate prototypes and define functions at setup time.
 * No `this` in both arguments.
 * @param {Function} [start_f] - Optional arrow function
 * @param {Function} [begin_finally_f] - Optional arrow function
 * @param {Function} [end_finally_f] - Optional arrow function
 * @return {Function} with signature (this?, ()=>*, (ans)=>*) => *
 */
eYo.do._p.makeWrapper = ($this, start_f, begin_finally_f, end_finally_f) => {
  if (eYo.isF($this)) {
    [start_f, begin_finally_f, end_finally_f, $this] = [$this, start_f, begin_finally_f, end_finally_f]
  }
  return function ($$this, try_f, finally_f) {
    if (eYo.isF($$this)) {
      [try_f, finally_f, $$this] = [$$this, try_f, finally_f || this]
    }
    var old = start_f && start_f.call($this)
    var ans
    try {
      ans = try_f.call($$this)
    } finally {
      begin_finally_f && begin_finally_f.call($this, old)
      // enable first to allow finally_f to eventually fire events
      // or eventually modify `ans`
      if (finally_f) {
        var out = finally_f.call($$this, ans)
        if (eYo.isDef(out)) {
          ans = out
        }
      }
      end_finally_f && end_finally_f.call($this, old)
    }
    return ans
  }
}

/**
 * @param {String} str - the base string
 */
eYo.do.toTitleCase = (str) => {
  eYo.isStr(str) || eYo.throw(`eYo.do.toTitleCase: string expected but got ${str}`)
  return str.length ? str[0].toUpperCase()+str.substr(1) : str
}

/**
 * Remove the any instance of the given object from the given array.
 * @param {Array<*>} ra
 * @param {*} obj
 */
eYo.do.arrayRemove = function(ra, obj) {
  while(true) {
    var i = ra.indexOf(obj)
    if (i>=0) {
      ra.splice(i,1)
    } else {
      break
    }
  }
}
/**
 * Whether the given array contains the given object.
 * @param {Array<*>} ra
 * @param {*} obj
 */
eYo.do.arrayContains = function (ra, obj) {
  return ra.indexOf(obj) >= 0
}

/**
 * @param {*} target
 * @param {*} source
 */
eYo.do.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
}