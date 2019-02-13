/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Scan helper.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Scan')
goog.provide('eYo.Token')

goog.require('eYo.Const')
goog.require('eYo.XRE')


/* Scan implementation */

eYo.Scan = function (str) {
  this.str = str
  this.cur = this.line_start = this.start = 0; // inp : valid index
  this.tokens = []
  this.ind_stack = []
  this.paren_stack = []
  this.at_bol = true
  this.lineno = 0
  
  /* XXX: constify members. */
}

/* NO sign */
eYo.Scan.XRE = {
  integer: XRegExp(
    `^(?:
    ((?<decinteger>  (?<nonzero>[1-9][0-9]*) | (?<zero>0+) ) |
    (?<octinteger>  0(?:o|O)[0-7]+) |
    (?<hexinteger>  0(?:x|X)[0-9a-fA-F]+) |
    (?<bininteger>  0(?:b|B)[01]+)))`, 'x'),
  floatnumber: XRegExp(
    `^(?:
      (?<pointfloat> (?:[0-9]*\\.[0-9]+) | (?:[0-9]+\\.) ) |
      (?<exponentfloat>
        (?<mantissa> [0-9]+\\.?|[0-9]*\\.[0-9]+) # === [0-9]+|[0-9]*\\.[0-9]+|[0-9]+\\.
        [eE](?<exponent> [+-]?[0-9]+)
      )
    )`, 'x'),
  imagnumber: XRegExp(
    `^(?:
      (?<number>
        [0-9]*\\.[0-9]+|
        [0-9]+\\.?|
        (?:
          (?:
            [0-9]+|
            [0-9]*\\.[0-9]+|
            [0-9]+\\.
          )[eE]([+-]?[0-9]+)
        )
      )
    [jJ])`, 'x')
}

eYo.Do.readOnlyMixin(eYo.Scan.XRE, {
  prefix: XRegExp(
    '^(?<string>r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?(?<bytes>b|B|br|Br|bR|BR|rb|rB|Rb|RB)?(?<delimiter>\'|"|\'\'\'|""")'),
  delimiter: XRegExp('^(?<delimiter>\'|"|\'\'\'|""")'),
  string: {
    "'": XRegExp(
      '^(?:[\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF]|\\\\[\\x20-\\uFFFF])*'),
    '"': XRegExp(
      '^(?:[\\x20-\\x21\\x23-\\x5B\\x5D-\\uFFFF]|\\\\[\\x20-\\uFFFF])*')
  },
  bytes: {
    "'": XRegExp(
      '^(?:[\\x00-\\x26\\x28-\\x5B\\x5D-\\x7F]|\\\\[\\x00-\\x09\\x0B\\x0C\\x0E-\\xFF])*'),
    '"': XRegExp(
     '^(?:[\\x00-\\x21\\x23-\\x5B\\x5D-\\x7F]|\\\\[\\x00-\\x09\\x0B\\x0C\\x0E-\\xFF])*')
  },
  eol: XRegExp('^(?<continued>\\\\)?(?<eol>\r\n?|\n)')
})

eYo.Token = function () {}

eYo.Do.readOnlyMixin(eYo.Token, {
  ENDMARKER: 'ENDMARKER',
  NAME: 'NAME',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  NEWLINE: 'NEWLINE',
  INDENT: 'INDENT',
  DEDENT: 'DEDENT',
  LPAR: '(',
  RPAR: ')',
  LSQB: '[',
  RSQB: ']',
  COLON: ':',
  COMMA: ',',
  SEMI: ';',
  PLUS: '+',
  MINUS: '-',
  STAR: '*',
  SLASH: '/',
  VBAR: '|',
  AMPER: '&',
  LESS: '<',
  GREATER: '>',
  EQUAL: '=',
  DOT: '.',
  PERCENT: '%',
  LBRACE: '{',
  RBRACE: '}',
  EQEQUAL: '==',
  NOTEQUAL: '!=',
  LESSEQUAL: '<=',
  GREATEREQUAL: '>=',
  TILDE: '~',
  CIRCUMFLEX: '^',
  LEFTSHIFT: '<<',
  RIGHTSHIFT: '>>',
  DOUBLESTAR: '**',
  PLUSEQUAL: '+=',
  MINEQUAL: '-=',
  STAREQUAL: '*=',
  SLASHEQUAL: '/=',
  PERCENTEQUAL: '%=',
  AMPEREQUAL: '&=',
  VBAREQUAL: '|=',
  CIRCUMFLEXEQUAL: '^=',
  LEFTSHIFTEQUAL: '<<=',
  RIGHTSHIFTEQUAL: '>>=',
  DOUBLESTAREQUAL: '**=',
  DOUBLESLASH: '//',
  DOUBLESLASHEQUAL: '//=',
  AT: '@',
  ATEQUAL: '@=',
  RARROW: '->',
  ELLIPSIS: '...',
  COLONEQUAL: ':=',
  OP: 'OP',
  TYPE_IGNORE: 'TYPE_IGNORE',
  TYPE_COMMENT: 'TYPE_COMMENT',
  _ERRORTOKEN: '<_ERRORTOKEN>',
  _COMMENT: '<COMMENT>',
  _CONTINUED: '<CONTINUED>',
  _NL: '<NL>',
  _ENCODING: '<ENCODING>',
  _N_TOKENS: '<N_TOKENS>',
  _WHITE: '<WHITE>'
})

eYo.Scan.prototype.forward = function (amount) {
  this.cur += amount || 1
  return (this.c = this.cur < this.str.length
    ? this.str[this.cur] : null)
}

eYo.Scan.prototype.backward = function (amount) {
  this.cur -= amount || 1
  return (this.c = this.cur>=0 && (this.cur < this.str.length) ? this.str[this.cur] : null)
}

// static void
eYo.Scan.prototype.newToken = function () {
  var token = new eYo.Token(this, type, subtype)
  this.tokens.push(token)
  if (this.last) {
    last.next = token
    token.previous = last
    this.last = token
  }
  this.start = this.cur
  while (this.c == ' ' || this.c == '\t' || this.c == '\014') {
    this.forward()
  } 
  if (this.cur > this.start + 1) {
    this.tokens.push(new eYo.Token(eYo.Scan._WHITE))
  }
  this.start = this.cur
  return token
}

// static void
eYo.Scan.prototype.newTokenIf = function(type, c1, c2)
{
  if (c1) {
    if (c1 === this.str[this.cur + 1]) {
      if (c2) {
        if (c2 === this.str[this.cur + 2]) {
          this.forward(2)
          return this.newToken(type)
        }
      } else {
        this.forward()
        return this.newToken(type)
      }
    } 
  } else {
    return this.newToken(type)
  }
}

eYo.Scan.prototype.exec = function (re) {
  return XRegExp.exec(this.str, re, this.cur, true)
}

Object.defineProperties(eYo.Scan.prototype, {
  top_indent: {
    get () {
      return this.ind_stack[this.ind_stack.length - 1]
    }
  },
  colno: {
    get () {
      return this.cur - this.line_start
    }
  }
})
// static int
eYo.Scan.prototype.scan = function () {
  var m, token, buddy, indent
  var /*int*/ col = 0
  var /*int*/ altcol = 0

  while (true) {
    if (!this.c) { // nothing more
      while ((buddy = this.ind_stack.pop())) {
        token = this.newToken(eYo.Scan.DEDENT)
        token.indent = buddy
        buddy.dedent = token
      }
      this.newToken(eYo.Scan.ENDMARKER)
      return
    }
    this.start = this.cur
    /* indentation */
    if (this.at_bol && !this.paren_stack.length) {
      this.at_bol = false
      while (this.forward()) {
        if (this.c === ' ') {
          col++, altcol++
        } else if (this.c === '\t') {
          col = (1 + col / 8) * 8
          altcol = altcol + 1
        } else if (this.c == '\014')  {/* Control-L (formfeed) */
          col = altcol = 0; /* For Emacs users */
        } else {
          break
        }
      }
      if (this.c === '#' || this.c === '\n' || this.c === '\r') {
        if (this.cur > this.start + 1) {
          this.newToken(eYo.Scan._WHITE)
        }
      } else if ((indent = this.top_indent)) {
        if (col === indent.col) {
          /* No change */
          if (altcol !== indent.altcol) {
            return this.newToken(eYo.Scan._ERRORTOKEN,
              `Inconsistant use of tab in indentation at line ${this.lineno}`)
          }
        } else if (col > indent.col) {
          /* Indent -- always one */
          if (altcol <= indent.altcol) {
            return this.newToken(eYo.Scan._ERRORTOKEN,
              `Inconsistant use of tab in indentation at line ${this.lineno}`)
          }
          this.ind_stack.push(this.newToken(eYo.Scan.INDENT))
          this.last.col = col
          this.last.altcol = altcol
        } else /* col < indent.col */ {
          /* Dedent -- any number, must be consistent */
          buddy = indent // also connect indent and corresponing dedent
          while (--this.ind_stack.length > 0) { // remove the last indent tkn
            indent = this.top_indent
            if (col > indent.col) {
              return this.newToken(eYo.Scan._ERRORTOKEN,
                `Inconsistant indentation at line ${this.lineno}`)
            } else if (col === indent.col) {
              if (altcol != indent.altcol) {
                return this.newToken(eYo.Scan._ERRORTOKEN,
                  `Inconsistant indentation at line ${this.lineno}`)
              }
              token = this.newToken(eYo.Scan.DEDENT)
              token.indent = buddy
              buddy.dedent = token
              break
            }
            token = this.newToken(eYo.Scan.DEDENT)
            token.indent = buddy
            buddy.dedent = token
            buddy = indent
          }
        }
      } else {
        indent = 
        this.ind_stack.push(this.newToken(eYo.Scan.INDENT))
        this.last.col = col
        this.last.altcol = altcol
      }
      continue
    }
    while (this.c === ' ' || this.c === '\t' || this.c === '\014') {
      this.forward()
    }
    if (this.cur > this.start + 1) {
      this.newToken(eYo.Scan._WHITE)
    }
    this.start = this.cur
    /* strings */
    if ((m = this.exec(eYo.Scan.XRE.prefix))) {
      var delimiter = m.delimiter
      var short = delimiter.length === 1
      this.forward(m[0].length)
      var re = eYo.Scan.XRE[m.bytes ? 'bytes' : 'string'][delimiter[0]]
      while (true) {
        if ((m = this.exec(re))) {
          this.forward(m[0].length)
        }
        if ((m = this.exec(eYo.Scan.XRE.delimiter))) {
          if (delimiter === m[0]) { // x = '...''' is ok.
            this.forward(m[0].length)
          } else if ((short && delimiter[0] === m[0][0])) { // x = '...''' is ok.
            this.forward(1)
          } else {
            return this.newToken(eYo.Scan._ERRORTOKEN,
              `Unexpected delimiter at line ${this.lineno} column ${this.colno}`)
          }
          this.newToken(eYo.Scan.STRING)
          break
        } else if ((m = this.exec(eYo.Scan.XRE.eol)) && m.continued) {
          this.forward(m[0].length)
          ++this.lineno
          this.line_start = this.cur
          this.at_bol = true
          this.newToken(eYo.Scan._CONTINUED)
        } else if (short) {
          return this.newToken(eYo.Scan._ERRORTOKEN,
            `Missing delimiter at line ${this.lineno} column ${this.colno}`) 
        }
      }
      this.forward()
      continue
    }
    if ((m = this.exec(eYo.XRE.identifier))) {
      this.forward(m[0].length)
      if (this.c >= 128) {
        return this.newToken(eYo.Scan._ERRORTOKEN,
          `Unexpected character '${this.c}' at line ${this.lineno} column ${this.colno}`)
      }
      this.newToken(eYo.Scan.NAME)
      this.forward()
      continue
    }
    // numbers
    if ((m = this.exec(eYo.Scan.XRE.imagnumber)
    || this.exec(eYo.Scan.XRE.floatnumber)
    || this.exec(eYo.Scan.XRE.integer))) {
      this.cur += m[0].length
      this.newToken(eYo.Scan.NUMBER)
      this.forward()
      continue
    }
    var i = 0
    this.start = this.cur
    switch (this.c) {
      case '(':
      case '[':
      case '{':
        this.newToken(this.c)
        break
      case ')':
        ++i
      case ']':
        ++i
      case '}':
        if (!this.paren_stack.length) {
          return this.newToken(eYo.Scan.SYNTAX_ERROR,
            `unmatched '${this.c}' at line ${this.lineno} column ${this.colno}`)
        }
        var /*int*/ opening = this.paren_stack.pop()
        if (opening.type !== '{[('[i]) {
          return this.newToken(eYo.Scan.SYNTAX_ERROR,
            `'${this.c}' does not match '${opening.type}' at line ${opening.lineno}  at column ${this.colno}`)
        }
        this.newToken(this.c)
        break
      // case '%':
      // case '&':
      // case '(':
      // case ')':
      // case '*':
      // case '+':
      case ',':
      // case '-':
      // case '.':
      // case '/':
      // case ':':
      case ';':
      // case '<':
      // case '=':
      // case '>':
      // case '@':
      // case '[':
      // case ']':
      // case '^':
      // case '{':
      // case '|':
      // case '}':
      case '~':
        this.newToken(this.c)
        break    
      case '!':
        if (!this.newTokenIf(eYo.Scan.NOTEQUAL, '=')) {
          return this.newToken(eYo.Scan._ERRORTOKEN)
        }
        break;
      case '%':
        this.newTokenIf(eYo.Scan.PERCENTEQUAL, '=')
          || this.newToken(this.c)
        break;
      case '&':
        this.newTokenIf(eYo.Scan.AMPEQUAL, '=')
          || this.newToken(this.c)
        break;
      case '*':
        this.newTokenIf(eYo.Scan.STAREQUAL, '=')
          || this.newTokenIf(eYo.Scan.DOUBLESTAREQUAL, '*', '=')
          || this.newTokenIf(eYo.Scan.DOUBLESTAR, '*')
          || this.newToken(this.c)
        break;
      case '+':
        this.newTokenIf(eYo.Scan.PLUSEQUAL, '=')
          || this.newToken(this.c)
        break;
      case '-':
        this.newTokenIf(eYo.Scan.MINEQUAL, '=')
          || this.newTokenIf(eYo.Scan.RARROW, '>')
          || this.newToken(this.c)
        break;
      case '/':
        this.newTokenIf(eYo.Scan.SLASHEQUAL, '=')
          || this.newTokenIf(eYo.Scan.DOUBLESLASHEQUAL, '/', '=')
          || this.newTokenIf(eYo.Scan.DOUBLESLASH, '/')
          || this.newToken(this.c)
        break;
      case ':':
        this.newTokenIf(eYo.Scan.COLONEQUAL, '=')
          || this.newToken(this.c)
        break;
      case '<':
        this.newTokenIf(eYo.Scan.LESSEQUAL, '=')
          || this.newTokenIf(eYo.Scan.LEFTSHIFTEQUAL, '<', '=')
          || this.newTokenIf(eYo.Scan.LEFTSHIFT, '<')
          || this.newTokenIf(eYo.Scan.NOTEQUAL, '>')
          || this.newToken(this.c)
        break;
      case '=':
        this.newTokenIf(eYo.Scan.EQEQUAL, '=')
          || this.newToken(this.c)
        break;
      case '>':
        this.newTokenIf(eYo.Scan.GREATEREQUAL, '=')
        || this.newTokenIf(eYo.Scan.RIGHTSHIFTEQUAL, '>', '=')
        || this.newTokenIf(eYo.Scan.RIGHTSHIFT, '>')
        || this.newToken(this.c)
        break;
      case '@':
        this.newTokenIf(eYo.Scan.ATEQUAL, '=')
          || this.newToken(this.c)
        break;
      case '^':
        this.newTokenIf(eYo.Scan.CIRCUMFLEXEQUAL, '=')
          || this.newToken(this.c)
        break;
      case '|':
        this.newTokenIf(eYo.Scan.VBAREQUAL, '=')
          || this.newToken(this.c)
        break;
      case '.':
        this.newTokenIf(eYo.Scan.ELLIPSIS, '.', '.')
          || this.newToken(this.c)
        break;
      case '#':
        while (this.forward()) {
          if (this.c === '\r' || this.c === '\n') {
            break
          }
        }
        this.newToken(eYo.Scan.COMMENT)
        break
      case '\\':
        if (!this.newTokenIf(eYo.Scan._CONTINUED, '\n')
        && !this.newTokenIf(eYo.Scan._CONTINUED, '\r', '\n')
        &&!this.newTokenIf(eYo.Scan._CONTINUED, '\r')) {
          return this.newToken(eYo.Scan._ERRORTOKEN,
            `Unexpected '${this.c}' at line ${this.lineno} column ${this.colno}`)
        }
        break
      case '\r':
        this.newTokenIf(eYo.Scan._NL, '\n') || this.newToken(eYo.Scan._NL)
        break
      case '\n':
        this.newToken(eYo.Scan._NL)
        break
    }
    this.forward()
  }
}
