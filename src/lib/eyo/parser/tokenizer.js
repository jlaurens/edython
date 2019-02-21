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

goog.provide('eYo.Scan')
goog.provide('eYo.Token')

/* Scan implementation */

eYo.Scan = function () {
}

eYo.Token = function (scan, type, subtype) {
  this.type = type
  this.subtype = subtype
  this.str = scan.str
  this.start = scan.start
  this.end = scan.start = scan.end
  this.first_line_no = scan.first_line_no
  this.line_no = scan.line_no
  this.col_no = scan.col_no
}

/**
 * Create a scan object, then send this message.
 * When verbose is true, all the white spaces and eol's, comments are reported
 * @param {String}
 * @param {Boolean} verbose 
 */
eYo.Scan.prototype.tokenize = function (str, verbose = false) {
  this.init(str, verbose)
  var t
  while ((t = this.nextToken())) {
    // console.log(t.string, t.type, t.subtype)
  }
  return this.first
}

/**
 * Init the scan with the given string.
 * When verbose is true, also returns spaces, eols and comment tokens.
 * @param {String} str
 * @param {Boolean} verbose
 */
eYo.Scan.prototype.init = function (str, verbose = false) {
  this.str = str
  this.verbose = verbose
  this.atbol = true
  this.end = 0
  this.c = this.str[this.end] || null
  this.errorCount = 0
  this.tokens = []
  this.list = []
  this.paren_stack = []
  this.indent_stack = []
  this.first = this.last = null
  this.line_no = this.col_no = 0
  return this
}

eYo.Do.readOnlyMixin(eYo.Scan, {
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
  OP: 54,
  TYPE_IGNORE: 'TYPE_IGNORE',
  TYPE_COMMENT: 'TYPE_COMMENT',
  ERRORTOKEN: '<ERRORTOKEN>',
  COMMENT: '<COMMENT>',
  NL: '<NL>',
  ENCODING: '<ENCODING>',
  N_TOKENS: '<N_TOKENS>',
  NT_OFFSET: 256,
  _WHITE_SPACE: '<WHITE_SPACE>',
  _CONTINUED: '<CONTINUED>',
  _KEYWORD: '<KEYWORD>',
  _E: {},
  _XRE: {},
  _KW: {}
})

/**
 * Langage keywords
 */
eYo.Do.readOnlyMixin(eYo.Scan._KW, {
  FALSE: 'False',
  NONE: 'None',
  TRUE: 'True',
  AWAIT: 'await',
  AND: 'and',
  AS: 'as',
  ASSERT: 'assert',
  ASYNC: 'async',
  BREAK: 'break',
  CLASS: 'class',
  CONTINUE: 'continue',
  DEF: 'def',
  DEL: 'del',
  ELIF: 'elif',
  ELSE: 'else',
  EXCEPT: 'except',
  FINALLY: 'finally',
  FOR: 'for',
  FROM: 'from',
  GLOBAL: 'global',
  IF: 'if',
  IMPORT: 'import',
  IN: 'in',
  IS: 'is',
  LAMBDA: 'lambda',
  NONLOCAL: 'nonlocal',
  NOT: 'not',
  OR: 'or',
  PASS: 'pass',
  RAISE: 'raise',
  RETURN: 'return',
  TRY: 'try',
  WHILE: 'while',
  WITH: 'with',
  YIELD: 'yield',
})

eYo.Do.readOnlyMixin(eYo.Scan._E, {
  DEDENT_AUGMENTED: 'DEDENT_AUGMENTED',
  INCONSISTENT_INDENTATION: 'INCONSISTENT_INDENTATION',
  EOLS: 'EOLS',
  EOFS: 'EOFS',
  UNEXPECTED_ESCAPE: 'UNEXPECTED_ESCAPE',
  INVALID_EXPONENT: 'INVALID_EXPONENT',
  UNEXPECTED_CHARACTER: 'UNEXPECTED_CHARACTER',
  NO_TRAILING_UNDERSCORE: 'NO_TRAILING_UNDERSCORE',
  NO_LEADING_ZERO: 'NO_LEADING_ZERO',
  UNEXPECTED_RBRACE: 'UNEXPECTED_RBRACE',
  UNEXPECTED_RSQB: 'UNEXPECTED_RSQB',
  UNEXPECTED_RPAR: 'UNEXPECTED_RPAR',
  UNMATCHED_PAREN: 'UNMATCHED_PAREN',
  INVALID_HEXADECIMAL: 'INVALID_HEXADECIMAL',
  INVALID_OCTAL_INTEGER: 'INVALID_OCTAL_INTEGER',
  INVALID_BINARY_INTEGER: 'INVALID_BINARY_INTEGER'
})

/* NO sign, all are called in sticky mode so no ^ at start */
eYo.Do.readOnlyMixin(eYo.Scan._XRE, {
  prefix: XRegExp(
    '(?<string>r|u|f|fr|rf)|(?<bytes>b|br|rb)', 'i'),
  string: {
    "'": XRegExp(
      '(?:[\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF]|\\\\[\\x20-\\uFFFF])+', 'A'),
    '"': XRegExp(
      '(?:[\\x20-\\x21\\x23-\\x5B\\x5D-\\uFFFF]|\\\\[\\x20-\\uFFFF])+', 'A')
  },
  bytes: {
    "'": XRegExp(
      '(?:[\\x00-\\x26\\x28-\\x5B\\x5D-\\x7F]|\\\\[\\x00-\\x09\\x0B\\x0C\\x0E-\\xFF])+'),
    '"': XRegExp(
     '(?:[\\x00-\\x21\\x23-\\x5B\\x5D-\\x7F]|\\\\[\\x00-\\x09\\x0B\\x0C\\x0E-\\xFF])+')
  },
  id_start: XRegExp('_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo}|\\p{Nl}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C', 'A'),
  id_continue: XRegExp('(?:_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C|\\u00B7|\\u0387|\\u1369|\\u136A|\\u136B|\\u136C|\\u136D|\\u136E|\\u136F|\\u1370|\\u1371|\\u19DA)+', 'A')
})

Object.defineProperties(eYo.Scan.prototype, {
  string: {
    get () {
      return this.tokens.map(x => x.string).join('')
    }
  },
  level: {
    get () {
      return this.paren_stack.length
    }
  },
  first: {
    get () {
      return this.tokens[0]
    }
  },
  last: {
    get () {
      return this.tokens[this.tokens.length - 1]
    }
  }
})

Object.defineProperties(eYo.Token, {
  NAMES: {
    get () {
      return [
        "ENDMARKER",
        "NAME",
        "NUMBER",
        "STRING",
        "NEWLINE",
        "INDENT",
        "DEDENT",
        "LPAR",
        "RPAR",
        "LSQB",
        "RSQB",
        "COLON",
        "COMMA",
        "SEMI",
        "PLUS",
        "MINUS",
        "STAR",
        "SLASH",
        "VBAR",
        "AMPER",
        "LESS",
        "GREATER",
        "EQUAL",
        "DOT",
        "PERCENT",
        "LBRACE",
        "RBRACE",
        "EQEQUAL",
        "NOTEQUAL",
        "LESSEQUAL",
        "GREATEREQUAL",
        "TILDE",
        "CIRCUMFLEX",
        "LEFTSHIFT",
        "RIGHTSHIFT",
        "DOUBLESTAR",
        "PLUSEQUAL",
        "MINEQUAL",
        "STAREQUAL",
        "SLASHEQUAL",
        "PERCENTEQUAL",
        "AMPEREQUAL",
        "VBAREQUAL",
        "CIRCUMFLEXEQUAL",
        "LEFTSHIFTEQUAL",
        "RIGHTSHIFTEQUAL",
        "DOUBLESTAREQUAL",
        "DOUBLESLASH",
        "DOUBLESLASHEQUAL",
        "AT",
        "ATEQUAL",
        "RARROW",
        "ELLIPSIS",
        "COLONEQUAL",
        "OP",
        "TYPE_IGNORE",
        "TYPE_COMMENT",
        "<ERRORTOKEN>",
        "<COMMENT>",
        "<NL>",
        "<ENCODING>",
        "<N_TOKENS>",
      ]
    }
  }
})

Object.defineProperties(eYo.Token.prototype, {
  string: {
    get () {
      return this.str.substring(this.start, this.end)
    }
  }
})

/**
 */
eYo.Scan.prototype.nextToken = function () {
  var d

  /**
   * Execute the regular expression.
   * @param {*} re
   */
  var exec = re => {
    return XRegExp.exec(this.str, re, this.end, true)
  }

  /**
   * Advance the cursor of the given amount updating the `c` value.
   * 
   * @param {*} amount 
   */
  var forward = (amount = 1) => {
    this.end += amount
    return (this.c = this.str[this.end] || null)
  }
  
  /**
   * Back the cursor of the given amount.
   * @param {*} amount 
   */
  var backward = (amount = 1) => {
    this.end -= amount
    if (this.end < 0) {
      this.end = 0
    }
    return (this.c = this.str[this.end] || null)
  }

  /**
   * Returns the first available token if any.
   * In some cases more than one token must be created,
   * for dedentation and error recovery mainly.
   */
  var shift = () => {
    var token = this.list.shift()
    if (token) {
      this.tokens.push(token)
      if (this.last) {
        this.last.next = token
        token.previous = this.last
      } else {
        this.first = token
      }
      this.last = token
    }
    return token
  }

  /**
   * Scans a digit part and possible erroneous trailing underscores.
   * Returns `null` if no digit nor underscore has been scanned.
   * Return the index of the first character after the digit part.
   * This is less than the value of `this.end` on return
   * in case of unexpected trailing underscores.
   */
  var scan_digitpart = () => {
    var scan_digits = () => {
      if(this.c && this.c >= '0' && this.c <= '9') {
        forward()
        while (this.c && this.c >= '0' && this.c <= '9') {
          forward()
        }
        return true
      }
    }
    var ans = this.end
    if (scan_digits()) {
      while (true) {
        ans = this.end
        if (scan_s('_')) {
          if(scan_digits()) {
            continue
          }
        }
        return ans
      }
    }
  }

  /**
   * Try to scan a given word.
   * Sends `forward` on success.
   * @param {String} w  w is a keyword.
   * @param {Integer} start  The first index to test.
   * @return {Boolean} true on success.
   */
  var scan_w = (w, start = 0) => {
    var i = start
    if(i < w.length) {
      if (this.end - start + w.length <= this.str.length) {
        do {
          if (this.str[this.end + i - start] !== w[i]) {
            return
          }
        } while (++i < w.length)
        forward(i - start)
        return true
      }
    }
  }

  /**
   * Try to read one given character.
   * Sends `forward` on success.
   * Return true on success.
   * @param {*} c  c is in the range 1 - 127, no surrogate pairs.
   */
  var scan = c => {
    if (this.c === c) {
      forward()
      return c || true
    }
  }

  /**
   * Try to scan one given character, as many times as possible.
   * Send `forward` on success.
   * Return true on success.
   * @param {*} c 
   */
  var scan_s = (c) => {
    if (this.c === c) {
      do {
        forward()
      } while (this.c === c)
      return true
    }
  }

  /**
   * Whether the next character will be the given one.
   * Do not send `forward` on success.
   * Return true on success.
   * @param {*} c 
   */
  var future = c => {
    if (this.str[this.end + 1] === c) {
      return true
    }
  }

  /**
   * Create a regular token and push it.
   * @param {*} type 
   * @param {*} subtype 
   */
  var newToken = (type, subtype) => {
    var token = new eYo.Token(this, type, subtype)
    this.list.push(token)
    if (this.error) {
      this.error.recovery = token
      token.error = this.error
      this.error = null
    }
    return token
  }

  /**
   * Push the token if the character(s) can be scanned.
   * @param {!String} type 
   * @param {?Character} c1 
   * @param {?Character} c2 
   */
  var newTokenIf = (type, c1, c2) => {
    if (c1) {
      if (this.c === c1) {
        if (c2) {
          if (c2 === this.str[this.end + 1]) {
            forward(2)
            return newToken(type)
          }
        } else {
          forward(1)
          return newToken(type)
        }
      }
    } else {
      return newToken(type)
    }
  }

  /**
   * Create a paren(thesis) token and push it.
   * @param {*} type type is one of the closing paren. characters.
   * @param {*} open
   */
  var newClose = (type, open) => {
    var tkn = newToken(type)
    if (open) {
      tkn.open = open
      open.close = tkn
    }
  }

  /**
   * Creates an error token.
   * Subsequent error tokens will be part of this token.
   * A subsequent regular token will be a recovery
   * token attached to this error token.
   * @param {*} subtype 
   */
  var newError = (subtype) => {
    var token = newToken(eYo.Scan.ERRORTOKEN, subtype)
    this.error = token
    ++ this.errorCount
    return token
  }

  /**
   * Create an indentation token and push it.
   * @param {*} col 
   * @param {*} altcol 
   */
  var newIndent = (col, altcol) => {
    var token = newToken(eYo.Scan.INDENT)
    token.col = col
    token.altcol = altcol
    this.indent_stack.push(token)
    return token
  }

   /**
   * Creates a dedent token and push it.
   * There is a one tot one correspondance between
   * dedent and indent tokens.
   * @param {*} indent Corresponding indent token
   */
  var newDedent = (indent) => {
    var tkn = newToken(eYo.Scan.DEDENT)
    if (indent) {
      tkn.indent = indent
      indent.dedent = tkn
    }
  }

 /**
   * Create an NAME token and push it.
   * Scans the id_continue characters first.
   */
  var newNAME_ = () => {
    var t = newToken(eYo.Scan.NAME)
    if (this.c >= 128) {
      forward()
      newError(eYo.Scan._E.UNEXPECTED_CHARACTER)
    }
    read_space()
    return t
  }

  /**
   * Create an NAME token and push it.
   * Scans the id_continue characters first.
   */
  var newNAME = () => {
    var m = exec(eYo.Scan._XRE.id_continue)
    if (m) {
      forward(m[0].length)
    }
    return newNAME_()
  }

  /**
   * Create an NEWLINE token and push it.
   * Updates line and column numbers
   */
  var newNEWLINE = () => {
    this.atbol = true
    this.col_no = 0
    ++this.line_no
    return newToken(eYo.Scan.NEWLINE)
  }

  /**
   * Create an EOL token and push it.
   */
  var newEOL = () => {
    this.atbol = true
    this.col_no = 0
    ++this.line_no
    if (this.verbose) {
      return newToken(eYo.Scan.NL)
    }
    this.start = this.end
  }

  /**
   * Create an ENDMARKER token and push it.
   * First, push a dedent token for each stacked indent.
   */
  var newEOF = () => {
    var indent
    if ((indent = this.indent_stack.pop())) {
      do {
        newDedent(indent)
      } while ((indent = this.indent_stack.pop()))
      this.at_eof = true
      return newToken(eYo.Scan.ENDMARKER)
    }
    if (!this.at_eof) {
      this.at_eof = true
      return newToken(eYo.Scan.ENDMARKER)
    }
  }
  
  var newCOMMENT = () => {
    if (this.verbose) {
      return newToken(eYo.Scan.COMMENT)
    }
    this.start = this.end
  }

  var newSpace = () => {
    if (this.verbose) {
      return newToken(eYo.Scan._WHITE_SPACE)
    }
    this.start = this.end
  }

  var read_space = () => {
    if (scan_s(' ') || scan_s('\t') || scan_s(0o14)) {
      while (scan_s(' ') || scan_s('\t') || scan_s(0o14)) {}
      newSpace()
      return true
    }
  }

  /**
   * `0` has been read, try to read
   * either a binary, an octal or an hexadecimal.
   * Returns a token, possibly a recovery one.
   * @param {*} x 
   * @param {*} X 
   * @param {*} read 
   * @param {*} subtype 
   * @param {*} MSG 
   */
  var new_box_literal = (x, X, reader, subtype, MSG) => {
    if (scan(x) || scan(X)) {
      scan_s('_')
      while (true) {
        if (reader()) {
          while (reader()) {}
          if (scan_s('_')) {
            continue
          }
        } else {
          newError(MSG)
        }
        return newToken(eYo.Scan.NUMBER, subtype)
      }
    }
  }

  /**
   * Read the exponent and the possible j.
   * Create a number token and possibly an error token.
   */
  var new_exponent_j = () => {
    var d = this.end
    if (scan('e') || scan('E')) {
      /* Exponent part */
      if (scan('+') || scan('-')) {
        if ((d = scan_digitpart()) && d < this.end) {
          newError(eYo.Scan._E.INVALID_EXPONENT)
        }
      } else if ((d = scan_digitpart())) {
        if (d < this.end) {
          newError(eYo.Scan._E.INVALID_EXPONENT)
        }
      } else {
        backward()
      }
      return newToken(eYo.Scan.NUMBER,
        scan('j') || scan('J')
        ? 'imagnumber'
        : 'floatnumber')
    }
    else if (scan('j') || scan('J')) {
      return newToken(eYo.Scan.NUMBER, 'imagnumber')
    }
  }

  /**
   * Push a keyword token when scan is possible.
   * @param {String} kw  kw is the keyword to scan.
   * @param {Integer} start  the start index.
   * @return {String} subtype on success.
   */
  var newKeyWord = (kw, start = 0) => {
    if (scan_w(kw, start)) {
      var m = exec(eYo.Scan._XRE.id_continue)
      if (m) {
        forward(m[0].length)
        newNAME_()
      } else {
        newToken(eYo.Scan._KEYWORD, kw)
        read_space()
      }
      return true
    }
  }
  
 /**
   * Reads a literal string, since the quote.
   */
  var anchor_letter_quote = () => {
    var quote = scan('\'') || scan('"')
    if (quote) {
      var quote_size = 1             /* 1 or 3 */
      var end_quote_size = 0         /* no end quote yet */
      /* Nodes of type STRING, especially multi line strings
         must be handled differently in order to get both
         the starting line number and the column offset right.
         (cf. issue 16806) */
      this.line_start = this.line_no
      this.first_line_no = null
      /* Find the quote size and start of string */
      if (scan(quote)) {
        if (scan(quote)) {
          quote_size = 3
          this.first_line_no = this.line_no
        } else {
          end_quote_size = 1     /* empty string found */
        }
      }
      /* Get rest of string */
      while (end_quote_size !== quote_size) {
        if (scan(quote)) {
          end_quote_size += 1
          continue
        }
        end_quote_size = 0
        if (quote_size === 1) {
          if (scan('\r')) {
            scan('\n')
            newError(eYo.Scan._E.EOLS)
            break
          } else if (scan('\n')) {
            newError(eYo.Scan._E.EOLS)
            break
          }
        }
        if (scan('\\')) {
          if (!forward()) {
            newError(eYo.Scan._E.EOFS)
            break
          }
        } else if (!forward()) {
          if (quote_size === 1) {
            newError(eYo.Scan._E.EOLS)
          } else {
            newError(eYo.Scan._E.EOFS)
          }
          var end = true
          break
        }
      }
      newToken(eYo.Scan.STRING)
      if (end) {
        newEOF()
      }
      return true
    }
  }

  /* Begin */
  bol: while(true) {

    if (this.list.length > 0) {
      return shift()
    }

    this.start = this.end

    /* Get indentation level */
    if (this.atbol) {
      var col = 0
      var altcol = 0
      this.atbol = false
      while (true) {
        if (scan(' ')) {
          col++ , altcol++
        }
        else if (scan('\t')) {
          col = (col / 8) * 8 + 8
          altcol = altcol + 1
        }
        else if (scan(0o14)) {/* Control-L (formfeed) */
          col = altcol = 0 /* For Emacs users */
        }
        else {
          break
        }
      }
      if (this.c === '#') {
        // this is not an indentation
        col && newSpace()
        forward()
        while (true) {
          if (this.c === '\r') {
            newCOMMENT()
            forward()
            scan('\n')
            newEOL()
            continue bol
          } else if (this.c === '\n') {
            newCOMMENT()
            forward()
            newEOL()
            continue bol
          } else if (forward()) {
            continue
          } else {
            newCOMMENT()
            newEOF()
            continue bol
          }
        }
      } else if (this.c === '\r') {
        // this is not an indentation either
        col && newSpace()
        forward()
        scan('\n')
        newEOL()
        continue bol
      } else if (this.c === '\n') {
        // this is not an indentation either
        col && newSpace()
        forward()
        newEOL()
        continue bol
      }
      if (this.level) {
        col && newSpace()
      } else {
        if (this.indent_stack.length) {
          var indent = this.indent_stack[this.indent_stack.length - 1]
          if (col === indent.col) {
            /* No change */
            if (altcol != indent.altcol) {
              newError(eYo.Scan._E.INCONSISTENT_INDENTATION)
            }
            newSpace()
          } else if (col > indent.col) {
            /* Indent -- always one */
            if (altcol <= indent.altcol) {
              newError(eYo.Scan._E.INCONSISTENT_INDENTATION)
            }
            newIndent(col, altcol)
            // continue
          } else {
            /* Dedent -- any number, must be consistent */
            var indent2 = indent
            while (true) {
              if (this.indent_stack.length > 1) {
                indent = this.indent_stack[this.indent_stack.length - 2]
                if (col === indent.col) {
                  // we found it
                  newDedent(indent2)
                  this.indent_stack.pop()
                } else if (col < indent.col) {
                  newDedent(indent2)
                  this.indent_stack.pop()
                  indent2 = indent
                  continue
                } else {
                  // for the sake of recovery,
                  // this is not considered as a dedent ()
                  newError(eYo.Scan._E.DEDENT_AUGMENTED)
                }
                break
              } else {
                /* this.indent_stack.length === 1 */
                if (col) {
                  newError(eYo.Scan._E.DEDENT_AUGMENTED)
                } else if (altcol) {
                  newError(eYo.Scan._E.INCONSISTENT_INDENTATION)
                }
                newDedent(indent2)
                this.indent_stack.pop()
              }
              break
            }
          }
        } else if (col) {
          /* First indentation */
          newIndent(col, altcol)   
        }
      }
    }
    
    again:  do {
      
      /* Check for EOF and errors now */
      if (!this.c) {
        newEOF()
        return shift()
      }
      /* Set start of current token */
      this.start = this.end // usefull ?

      /* Keywords */
      if (newKeyWord('False')
        || newKeyWord('None')
        || newKeyWord('True')
        || newKeyWord('break')
        || newKeyWord('global')
        || newKeyWord('lambda')
        || newKeyWord('or')
        || newKeyWord('pass')
        || newKeyWord('try')
        || newKeyWord('yield')) {
        return shift()
      } else if (scan('a')) {
        if (newKeyWord('await', 1) ||
          newKeyWord('and', 1)) {
          return shift()
        } else if (scan('s')) {
          if (newKeyWord('assert', 2) ||
            newKeyWord('async', 2)) {
          } else {
            var m = exec(eYo.Scan._XRE.id_continue)
            if (m) {
              forward(m[0].length)
              newNAME_()
            } else {
              newToken(eYo.Scan._KEYWORD, 'as')
            }
          }
          return shift()
        }
        newNAME()
        return shift()
      } else if (scan('c')) {
        if (newKeyWord('class', 1) ||
          newKeyWord('continue', 1)) {
          return shift()
        }
        newNAME()
        return shift()
      } else if (scan_w('de')) {
        if (newKeyWord('def', 2) ||
          newKeyWord('del', 2)) {
          return shift()
        }
        newNAME()
        return shift()
      } else if (scan('e')) {
        if (scan('l')) {
          if (newKeyWord('else', 2) ||
            newKeyWord('elif', 2)) {
            return shift()
          }
        } else if (newKeyWord('except', 1)) {
          return shift()
        }
        newNAME()
        return shift()
      } else if (scan('i')) {
        if (newKeyWord('if', 1)
          || newKeyWord('import', 1)
          || newKeyWord('in', 1)
          || newKeyWord('is', 1)) {
          return shift()
        }
        newNAME()
        return shift()
      } else if (scan_w('no')) {
        if (newKeyWord('nonlocal', 2)
          || newKeyWord('not', 2)) {
          return shift()
        }
        newNAME()
        return shift()
      } else if (scan('w')) {
        if (newKeyWord('while', 1)
          || newKeyWord('with', 1)) {
          return shift()
        }
        newNAME()
        return shift()
      }
      /*
          RAISE: 'raise',
          RETURN: 'return',
      */

      /* Check for a string or bytes literal */
      if ((m = exec(eYo.Scan._XRE.prefix))) {
        forward(m[0].length)
        if (m[0] === 'r') {
          if (newKeyWord('raise', 1)
            || newKeyWord('return', 1)) {
            return shift()
          }
        } else if (m[0] === 'f') {
          if (newKeyWord('for', 1)
            || newKeyWord('from', 1)
            || newKeyWord('finally', 1)) {
            return shift()
          }
        }
        // this is a possible string | bytes literal
        if (!anchor_letter_quote()) {
          newNAME()
        }
        return shift()
      } else if ((m = exec(eYo.Scan._XRE.id_start))) {
        // this is an identifier
        forward(m[0].length)
        newNAME()
        return shift()
      }
      /* Newline */
      if (scan('\r')) {
        scan('\n')
        if (this.level > 0) {
          newEOL()
        } else {
          newNEWLINE()
        }
        continue bol
      }
      if (scan('\n')) {
        if (this.level > 0) {
          newEOL()
        } else {
          newNEWLINE()
        }
        continue bol
      }
      /* Period or number starting with period? */
      if (scan('.')) {
        if ((d = scan_digitpart())) {
          if (d < this.end) {
            newError(eYo.Scan._E.NO_TRAILING_UNDERSCORE)
          }
          new_exponent_j() || newToken(eYo.Scan.NUMBER, 'floatnumber')
        } else {
          if (scan('.')) {
            if (scan('.')) {
              newToken(eYo.Scan.ELLIPSIS)
              return shift()
            } else {
              backward()
            }
            backward()
          }
          newToken(eYo.Scan.DOT)
        }
        return shift()
      }

      /* Number */
      if (scan('0')) {
        /* Hex, octal or binary -- maybe. */
        if (new_box_literal('x', 'X', () => {
          if (this.c && (this.c >= '0' && this.c <= '9' || (this.c >= 'a' && this.c <= 'f') || (this.c >= 'A' && this.c <= 'F'))) {
            forward()
            return true
          }
        }, 'hexinteger', eYo.Scan._E.INVALID_HEXADECIMAL)
          || new_box_literal('o', 'O', () => {
            if ((this.c && this.c >= '0' && this.c <= '7')) {
              forward()
              return true
            }
          }, 'octalinteger', eYo.Scan._E.INVALID_OCTAL_INTEGER)
          || new_box_literal('b', 'B', () => {
            if(this.c === '0' || this.c === '1') {
              forward()
              return true
            }
          }, 'bininteger', eYo.Scan._E.INVALID_BINARY_INTEGER)) {
          return shift()
        }
        this.subtype = 'integer'
        /* maybe old-style octal */
        /* in any case, allow '0' and variants as a literal */
        var nonzero = false
        scan_s('0')
        while (true) {
          d = this.end
          if (scan_s('_')) {
            if (scan_s('0')) {
              continue
            }
            if ((d = scan_digitpart())) {
              if (d < this.end) {
                newError(eYo.Scan._E.NO_TRAILING_UNDERSCORE)
              }
              nonzero = true
            }
          }
          break
        }
        if (scan('.')) {
          if (( d = scan_digitpart()) && d < this.end) {
            newError(eYo.Scan._E.NO_TRAILING_UNDERSCORE)
          }
          new_exponent_j() || newToken(eYo.Scan.NUMBER, 'floatnumber')
        } else if (!new_exponent_j()) {
          if (nonzero) {
            /* Old-style octal: now disallowed. */
            newError(eYo.Scan._E.NO_LEADING_ZERO)
            // return syntaxerror(tok,
            //   "leading zeros in decimal integer " +
            //   "literals are not permitted " +
            //   "use an 0o prefix for octal integers")
          }
          newToken(eYo.Scan.NUMBER, 'integer')
        }
        return shift()
      }
      else if ((d = scan_digitpart())) {
        /* Decimal ? */
        if (d < this.end) {
          newError(eYo.Scan._E.NO_TRAILING_UNDERSCORE)
        }
        this.subtype = 'integer'
        /* Accept floating point numbers. */
        if (scan('.')) {
          /* Fraction, possibly reduced to a dot */
          if ((d = scan_digitpart()) && d < this.end) {
            newError(eYo.Scan._E.NO_TRAILING_UNDERSCORE)
          }
          this.subtype = 'floatnumber'
        }
        new_exponent_j() || newToken(eYo.Scan.NUMBER, this.subtype)
        return shift()
      }
      /* String with no prefix */
      if (anchor_letter_quote()) {
        return shift()
      }
      /* Line continuation */
      if (scan('\\')) {
        if (scan('\r')) {
          scan('\n')
          newToken(eYo.Scan._CONTINUED)
          read_space()
          continue again
        } else if (scan('\n')) {
          newToken(eYo.Scan._CONTINUED)
          read_space()
          continue again
        } else if (this.c) {
          this.forward
          newError(eYo.Scan._E.UNEXPECTED_ESCAPE)
        } else {
          newEOF()
          return shift()
        }
      }    
    } while (read_space())
    
    /* Comments */
    if (this.c === '#') {
      while (true) {
        if (future('\r')) {
          newCOMMENT()
          forward()
          scan('\n')
          newEOL()
        } else if (future('\n')) {
          newCOMMENT()
          forward()
          newEOL()
        } else if (forward()) {
          continue
        } else /* if (!forward()) */ {
          newCOMMENT()
          newEOF()
          return shift()
        }
        break
      }
      continue bol
    }

    /* Check for two-character token */
    /* Keep track of parentheses nesting level */
    /* Punctuation character */

    var i = 0
    var c = this.c
    forward()
    switch (c) {
      case '(':
      case '[':
      case '{':
        this.paren_stack.push(newToken(c))
        break
      case ')':
        ++i
      case ']':
        ++i
      case '}':
        var opening = this.paren_stack.pop()
        if (!opening) {
          newError([
            eYo.Scan._E.UNEXPECTED_RBRACE,
            eYo.Scan._E.UNEXPECTED_RSQB,
            eYo.Scan._E.UNEXPECTED_RPAR
          ][i])
        } else if (opening.type !== '{[('[i]) {
          newError(eYo.Scan._E.UNMATCHED_PAREN)
        }
        newClose(c, opening)
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
        newToken(c)
        break    
      case '!':
        newTokenIf(eYo.Scan.NOTEQUAL, '=')
          || newError(eYo.Scan._E.UNEXPECTED_CHARACTER)
        break;
      case '%':
        newTokenIf(eYo.Scan.PERCENTEQUAL, '=')
          || newToken(c)
        break;
      case '&':
        newTokenIf(eYo.Scan.AMPEREQUAL, '=')
          || newToken(c)
        break;
      case '*':
        newTokenIf(eYo.Scan.STAREQUAL, '=')
          || newTokenIf(eYo.Scan.DOUBLESTAREQUAL, '*', '=')
          || newTokenIf(eYo.Scan.DOUBLESTAR, '*')
          || newToken(c)
        break;
      case '+':
        newTokenIf(eYo.Scan.PLUSEQUAL, '=')
          || newToken(c)
        break;
      case '-':
        newTokenIf(eYo.Scan.MINEQUAL, '=')
          || newTokenIf(eYo.Scan.RARROW, '>')
          || newToken(c)
        break;
      case '/':
        newTokenIf(eYo.Scan.SLASHEQUAL, '=')
          || newTokenIf(eYo.Scan.DOUBLESLASHEQUAL, '/', '=')
          || newTokenIf(eYo.Scan.DOUBLESLASH, '/')
          || newToken(c)
        break;
      case ':':
        newTokenIf(eYo.Scan.COLONEQUAL, '=')
          || newToken(c)
        break;
      case '<':
        newTokenIf(eYo.Scan.LESSEQUAL, '=')
          || newTokenIf(eYo.Scan.LEFTSHIFTEQUAL, '<', '=')
          || newTokenIf(eYo.Scan.LEFTSHIFT, '<')
          || newTokenIf(eYo.Scan.NOTEQUAL, '>')
          || newToken(c)
        break;
      case '=':
        newTokenIf(eYo.Scan.EQEQUAL, '=')
          || newToken(c)
        break;
      case '>':
        newTokenIf(eYo.Scan.GREATEREQUAL, '=')
          || newTokenIf(eYo.Scan.RIGHTSHIFTEQUAL, '>', '=')
          || newTokenIf(eYo.Scan.RIGHTSHIFT, '>')
          || newToken(c)
        break;
      case '@':
        newTokenIf(eYo.Scan.ATEQUAL, '=')
          || newToken(c)
        break;
      case '^':
        newTokenIf(eYo.Scan.CIRCUMFLEXEQUAL, '=')
          || newToken(c)
        break;
      case '|':
        newTokenIf(eYo.Scan.VBAREQUAL, '=')
          || newToken(c)
        break;
      case '.':
        newTokenIf(eYo.Scan.ELLIPSIS, '.', '.')
          || newToken(c)
        break;
      // case '#':
      case '\\':
        newTokenIf(eYo.Scan._CONTINUED, '\n')
          || newTokenIf(eYo.Scan._CONTINUED, '\r', '\n')
          || newTokenIf(eYo.Scan._CONTINUED, '\r')
          || newError(eYo.Scan._E.UNEXPECTED_ESCAPE)
        break
      // case '\r':
      // case '\n':
      case undefined:
        newEOF()
        break
      default:
        newError(eYo.Scan._E.UNEXPECTED_CHARACTER)
    }
    break
  }
  return shift()
}
