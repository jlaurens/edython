/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Scan helper.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Token')

eYo.Token = function (scan, type, subtype) {
  if (type === undefined || type === eYo.Token.ERRORTOKEN) {
    console.error('WTF')
  }
  this.scan = scan
  this.type = type
  this.subtype = subtype
  this.start = scan.start
  this.start_string = scan.start_string
  scan.start_string = undefined
  this.end = scan.start = scan.end
  this.first_line_no = scan.first_line_no
  this.line_no = scan.line_no
  this.col_no = scan.col_no
}

eYo.Token.prototype.be_keyword = function () {
  this.is_keyword = true
  return this
}

eYo.Token.prototype.be_close = function (open) {
  if (open) {
    this.open = open
    open.close = this
  }
  return this
}

eYo.Token.prototype.parent = null
eYo.Token.prototype.children = null

Object.defineProperties(eYo.Token.prototype, {
  str: {
    get () {
      return this.scan.str
    }
  },
  string: {
    get () {
      if (this.start_string !== undefined) {
        return this.str.substring(this.start_string, this.end)
      }
      return this.str.substring(this.start, this.end)
    }
  },
  content: {
    get () {
      return this.str.substring(this.start, this.end)
    }
  }
})

Object.defineProperties(eYo.Token, {
  ENDMARKER: {get () {return 0}},
  NAME: {get () {return 1}},
  NUMBER: {get () {return 2}},
  STRING: {get () {return 3}},
  NEWLINE: {get () {return 4}},
  INDENT: {get () {return 5}},
  DEDENT: {get () {return 6}},
  LPAR: {get () {return 7}},
  RPAR: {get () {return 8}},
  LSQB: {get () {return 9}},
  RSQB: {get () {return 10}},
  COLON: {get () {return 11}},
  COMMA: {get () {return 12}},
  SEMI: {get () {return 13}},
  PLUS: {get () {return 14}},
  MINUS: {get () {return 15}},
  STAR: {get () {return 16}},
  SLASH: {get () {return 17}},
  VBAR: {get () {return 18}},
  AMPER: {get () {return 19}},
  LESS: {get () {return 20}},
  GREATER: {get () {return 21}},
  EQUAL: {get () {return 22}},
  DOT: {get () {return 23}},
  PERCENT: {get () {return 24}},
  LBRACE: {get () {return 25}},
  RBRACE: {get () {return 26}},
  EQEQUAL: {get () {return 27}},
  NOTEQUAL: {get () {return 28}},
  LESSEQUAL: {get () {return 29}},
  GREATEREQUAL: {get () {return 30}},
  TILDE: {get () {return 31}},
  CIRCUMFLEX: {get () {return 32}},
  LEFTSHIFT: {get () {return 33}},
  RIGHTSHIFT: {get () {return 34}},
  DOUBLESTAR: {get () {return 35}},
  PLUSEQUAL: {get () {return 36}},
  MINEQUAL: {get () {return 37}},
  STAREQUAL: {get () {return 38}},
  SLASHEQUAL: {get () {return 39}},
  PERCENTEQUAL: {get () {return 40}},
  AMPEREQUAL: {get () {return 41}},
  VBAREQUAL: {get () {return 42}},
  CIRCUMFLEXEQUAL: {get () {return 43}},
  LEFTSHIFTEQUAL: {get () {return 44}},
  RIGHTSHIFTEQUAL: {get () {return 45}},
  DOUBLESTAREQUAL: {get () {return 46}},
  DOUBLESLASH: {get () {return 47}},
  DOUBLESLASHEQUAL: {get () {return 48}},
  AT: {get () {return 49}},
  ATEQUAL: {get () {return 50}},
  RARROW: {get () {return 51}},
  ELLIPSIS: {get () {return 52}},
  COLONEQUAL: {get () {return 53}},
  OP: {get () {return 54}},
  TYPE_IGNORE: {get () {return 55}},
  TYPE_COMMENT: {get () {return 56}},
  ERRORTOKEN: {get () {return 57}},
  N_TOKENS: {get () {return 61}},
  NT_OFFSET: {get () {return 256}}
})
