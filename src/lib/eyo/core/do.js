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
goog.require('eYo.Model')
goog.require('eYo.Model')

goog.require('goog.dom')

goog.asserts.assert(Object.setPrototypeOf, 'No setPrototypeOf, buy a new computer')

// Object.keys polyfill
// http://tokenposts.blogspot.com/2012/04/javascript-objectkeys-browser.html
if (!Object.keys) Object.keys = function(o) {
  if (o !== Object(o))
    throw new TypeError('Object.keys called on a non-object');
  var k=[],p;
  for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
  return k;
}

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

eYo.Do.ensureArray = eYo.Do.ensureFunctionOrArray = function (object) {
  return goog.isArray(object) || goog.isFunction(object) ? object : (object ? [object] : object)
}

eYo.Do.ensureFunction = function (object) {
  return goog.isFunction(object)
    ? object
    : function () {
        return object
      }
}

/**
 * Used only by the model's checking.
 * @param {!Object} object
 * @return A function with signature f() -> []
 */
eYo.Do.ensureArrayFunction = function (object) {
  var did = goog.isFunction(object)
    ? object
    : goog.isArray(object)
      ? function () {
        return object
      }
      : object
        ? function () {
          return [object]
        }
        : function () {
        }
  return did
}

eYo.Do.Exec = function (f) {
  return goog.isFunction(f)
  ? f(Array.prototype.slice.call(arguments, 1))
  : f
}

eYo.Do.createSPAN = function (text, css) {
  return goog.dom.createDom(goog.dom.TagName.SPAN, css || null,
    goog.dom.createTextNode(text)
  )
}

goog.require('eYo.T3')

eYo.T3.Expr.reserved_identifier = '.reserved identifier'
eYo.T3.Expr.reserved_keyword = '.reserved keyword'
eYo.T3.Expr.builtin__name = '.builtin name'
eYo.T3.Expr.custom_literal = '.custom literal'
eYo.T3.Expr.known_identifier = '.known identifier'
eYo.T3.Expr.custom_identifier = '.custom identifier'
eYo.T3.Expr.custom_dotted_name = '.custom dotted name'
eYo.T3.Expr.custom_parent_module = '.custom parent module'
eYo.T3.Expr.unset = '.unset'
eYo.T3.Expr.error = '.error'
eYo.T3.Expr.bininteger = '.bininteger'
eYo.T3.Expr.octinteger = '.octinteger'
eYo.T3.Expr.decinteger = '.decinteger'
eYo.T3.Expr.hexinteger = '.hexinteger'

eYo.T3.Stmt.control = '.control statement'

/**
 * What is the type of this string? an identifier, a number, a reserved word ?
 * For edython.
 * @param {!String} candidate
 * @param {?String} module
 * @return {!Object} the type of this candidate, possible keys are `name`, `expr`, `stmt`.
 */
eYo.Do.typeOfString = function (candidate, module) {
  if (!candidate) {
    return {
      raw: eYo.T3.Expr.unset,
      expr: eYo.T3.Expr.identifier
    }
  }
  if (!goog.isString(candidate)) {
    return {}
  }
  if (!candidate.length) {
    return {
      raw: eYo.T3.Expr.unset,
      expr: eYo.T3.Expr.identifier
    }
  }
  var f = function (module) {
    var M = eYo.Model[module]
    if (M) {
      var item = M.getItem && M.getItem(candidate)
      if (item) {
        return {
          raw: eYo.T3.Expr.known_identifier,
          expr: eYo.T3.Expr.identifier,
          name: candidate,
          module: module,
          model: item
        }
      }
    }
  }
  if (module) {
    var ans = f(module + '__module')
    if (ans) {
      return ans
    }
  } else {
    ans = f('functions') || f('stdtypes') || f('datastructures')
    if (ans) {
      return ans
    }
  }
  if (['True', 'False', 'None', 'Ellipsis', '...', 'NotImplemented'].indexOf(candidate) >= 0) {
    return {
      raw: eYo.T3.Expr.reserved_identifier,
      expr: eYo.T3.Expr.builtin__object
    }
  }
  var out
  if ((out = {
    class: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.class_part
    },
    finally: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.finally_part
    },
    is: {
      raw: eYo.T3.Expr.reserved_keyword,
      expr: eYo.T3.Expr.object_comparison
    },
    ans: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.return_stmt
    },
    continue: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.continue_stmt
    },
    for: {
      raw: eYo.T3.Expr.reserved_keyword,
      expr: eYo.T3.Expr.comp_for,
      stmt: eYo.T3.Stmt.for_part
    },
    lambda: {
      raw: eYo.T3.Expr.reserved_keyword,
      expr: eYo.T3.Expr.lambda
    },
    try: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.try_part
    },
    def: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.def_part
    },
    from: {
      raw: eYo.T3.Expr.reserved_keyword,
      expr: eYo.T3.Expr.yield_expression,
      stmt: eYo.T3.Stmt.import_stmt
    },
    nonlocal: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.global_nonlocal_stmt,
      model: 'nonlocal'
    },
    while: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.while_part
    },
    and: {
      raw: eYo.T3.Expr.reserved_keyword,
      expr: eYo.T3.Expr.and_expr
    },
    del: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.del_stmt
    },
    global: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.global_nonlocal_stmt,
      model: 'global'
    },
    not: {
      raw: eYo.T3.Expr.reserved_keyword,
      expr: eYo.T3.Expr.not_test
    },
    with: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.with_part
    },
    as: {
      raw: eYo.T3.Expr.reserved_keyword,
      expr: eYo.T3.Expr.identifier,
      stmt: eYo.T3.Stmt.except_part
    },
    elif: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.elif_part
    },
    if: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.if_part
    },
    or: {
      raw: eYo.T3.Expr.reserved_keyword,
      expr: eYo.T3.Expr.or_expr
    },
    yield: {
      raw: eYo.T3.Expr.reserved_keyword,
      expr: eYo.T3.Expr.yield_expr,
      stmt: eYo.T3.Stmt.yield_stmt
    },
    assert: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.assert_stmt
    },
    else: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.else_part
    },
    import: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.import_stmt
    },
    pass: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.pass_stmt
    },
    break: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.break_stmt
    },
    except: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.except_part
    },
    in: {
      raw: eYo.T3.Expr.reserved_keyword,
      expr: eYo.T3.Expr.object_comparison
    },
    raise: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.raise_stmt
    },
    return: {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: eYo.T3.Stmt.return_stmt
    },
    print: {
      raw: eYo.T3.Expr.builtin__name,
      expr: eYo.T3.Expr.call_expr,
      stmt: eYo.T3.Expr.call_stmt
    }
  } [candidate])) {
    return out
  }
  if (['int', 'float', 'complex', 'input', 'list', 'set', 'len', 'min', 'max', 'sum', 'abs', 'trunc', 'pow', 'conjugate'].indexOf(candidate) >= 0) {
    return {
      raw: eYo.T3.Expr.builtin__name,
      expr: eYo.T3.Expr.call_expr
    }
  }
  // is it a number ?
  var match = XRegExp.exec(candidate, eYo.XRE.integer)
  if (match) {
    return {
      raw: eYo.T3.custom_literal,
      expr: eYo.T3.Expr.integer,
      type: match.bininteger
        ? eYo.T3.Expr.bininteger
        : match.octinteger
          ? eYo.T3.Expr.octinteger
          : match.hexinteger
            ? eYo.T3.Expr.octinteger
            : eYo.T3.Expr.decinteger
    }
  }
  if (eYo.XRE.floatnumber.exec(candidate)) {
    return {
      raw: eYo.T3.custom_literal,
      expr: eYo.T3.Expr.floatnumber
    }
  }
  if (eYo.XRE.imagnumber.exec(candidate)) {
    return {
      raw: eYo.T3.custom_literal,
      expr: eYo.T3.Expr.imagnumber
    }
  }
  if (candidate === 'start') {
    return {
      raw: eYo.T3.Stmt.control,
      stmt: eYo.T3.Stmt.start_stmt
    }
  }
  var m = XRegExp.exec(candidate, eYo.XRE.dotted_name)
  if (m) {
    var first = m.dots ? m.dots.length : 0
    var base
    if (m.holder) {
      base = eYo.T3.Expr.dotted_name
    } else if (m.name) {
      base = eYo.T3.Expr.identifier
    } else {
      base = eYo.T3.Expr.unset
    }
    candidate = m.name
    var holder = module
      ? m.holder
        ? module + '.' + m.holder
        : module
      : null
    if (holder) {
      var ans = f(holder)
    } else {
      ans = f('functions') || f('stdtypes')
    }
    return {
      raw: m.dots || m.holder
        ? eYo.T3.Expr.custom_parent_module
        : eYo.T3.Expr.custom_identifier,
      expr: m.dots || m.holder
        ? eYo.T3.Expr.parent_module
        : eYo.T3.Expr.identifier,
      prefixDots: first,
      base: base,
      name: candidate,
      holder: holder,
      model: ans && ans.model
    }
  }
  if (eYo.XRE.identifier.exec(candidate)) {
    return {
      raw: eYo.T3.Expr.custom_identifier,
      expr: eYo.T3.Expr.identifier,
      name: candidate,
      holder: module
    }
  }
  if (eYo.XRE.shortstringliteralSingle.exec(candidate) || eYo.XRE.shortstringliteralDouble.exec(candidate)) {
    return {
      raw: 'short string literal',
      expr: eYo.T3.Expr.shortstringliteral
    }
  }
  if (eYo.XRE.shortbytesliteralSingle.exec(candidate) || eYo.XRE.shortbytesliteralDouble.exec(candidate)) {
    return {
      raw: eYo.T3.Expr.shortbytesliteral,
      expr: eYo.T3.Expr.shortliteral
    }
  }
  if (eYo.XRE.longstringliteralSingle.exec(candidate) || eYo.XRE.longstringliteralDouble.exec(candidate)) {
    return {
      raw: eYo.T3.Expr.longstringliteral,
      expr: eYo.T3.Expr.longliteral
    }
  }
  if (eYo.XRE.longbytesliteralSingle.exec(candidate) || eYo.XRE.longbytesliteralDouble.exec(candidate)) {
    return {
      raw: eYo.T3.Expr.longbytesliteral,
      expr: eYo.T3.Expr.longliteral
    }
  }
  return {}
}

/**
 * The css class for the given text
 * For edython.
 * @param {!string} txt The text to yield_expr
 * @return {string}
 */
eYo.Do.cssClassForText = function (txt) {
  switch (eYo.Do.typeOfString(txt, null).raw) {
  case eYo.T3.Expr.reserved_identifier:
  case eYo.T3.Expr.reserved_keyword:
    return 'eyo-code-reserved'
  case eYo.T3.Expr.builtin__name:
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
  return object && key && Object.prototype.hasOwnProperty.call(object, key)
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

/**
 * Convenient converter.
 * Throws an error for bad input.
 * See https://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
 * For edython.
 * @param {!string} string
 * @return {'Element'}
 */
eYo.Do.stringToDom = function (string) {
  var parser = new DOMParser();
  var parsererrorNS = parser.parseFromString('>', 'application/xml').getElementsByTagName("parsererror")[0].namespaceURI
  var stringToDom = function (string) {
    var parser = new DOMParser();
    var dom = parser.parseFromString(string, 'application/xml');
    if(dom.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0) {
      throw new Error('Error parsing XML');
    }
    return dom;
  }
  eYo.Do.stringToDom = stringToDom
  return stringToDom(string)
}

eYo.Do.logTiles = function (src) {
  var eyo = (src && src.eyo) || src
  var tile
  if (eyo && (tile = eyo.tileHead)) {
    console.log(tile)
    while (tile != eyo.tileTail && (tile = tile.tileNext)) {
      console.log(tile)
    }
    console.log(eyo.tileTail)
  }
}

/**
 * Forwards `this` to the handler.
 * @param {*} element 
 * @param {*} handler 
 */
eYo.Do.forEachChild = function (element, handler) {
  var children = Array.prototype.slice.call(element.childNodes)
  children.forEach(handler, this)
}

/**
 * Forwards `this` to the handler.
 * @param {*} element 
 * @param {*} handler 
 */
eYo.Do.forEachElementChild = function (element, handler) {
  var children = Array.prototype.slice.call(element.childNodes)
  children.forEach(function (child) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      handler.call(this, child)
    }
  }, this)
}

/**
 * Forwards `this` to the handler.
 * @param {*} element 
 * @param {*} handler 
 */
eYo.Do.someChild = function (element, handler) {
  var children = Array.prototype.slice.call(element.childNodes)
  return children.some(handler, this)
}

/**
 * Forwards `this` to the handler.
 * @param {*} element 
 * @param {*} handler 
 */
eYo.Do.someElementChild = function (element, handler) {
  var children = Array.prototype.slice.call(element.childNodes)
  return children.some(function (child) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      return handler.call(this, child)
    }
  }, this)
}

eYo.Do.valueOf = function (f) {
  return goog.isFunction(f) ? f.call() : f
}

eYo.Do.nothing = function () {
}