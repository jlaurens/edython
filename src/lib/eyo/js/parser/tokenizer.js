/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Scan helper.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Do')

eYo.require('E')
eYo.require('TKN')
eYo.require('Node')
eYo.provide('Scan')

/* Scan implementation */

eYo.Scan = function () {
}

/**
 * Create a scan object, then send this message.
 * @param {String}
 */
eYo.Scan.prototype.tokenize = function (str, start) {
  this.init(str, start)
  var t
  while ((t = this.nextToken())) {
    // console.log(t.string, t.type, t.subtype)
  }
  return this.last
}

/**
 * Init the scan with the given string.
 * @param {String} str
 */
eYo.Scan.prototype.init = function (str, start) {
  this.str = str
  this.start_type = start
  this.done = eYo.E.OK
  this.at_bol = true
  this.end = 0
  this.c = this.str[this.end] || null
  this.errorCount = 0
  this.tokens = []
  this.list = [] // list of tokens
  this.paren_stack = [] // parenthesis stack
  this.indent_stack = []
  this.first_ = this.last = null
  this.lineno = 0
  return this
}

eYo.Do.readOnlyMixin(eYo.Scan, {
  E: {},
  XRE: {},
  KW: {}
})

/**
 * Langage keywords
 */
eYo.Do.readOnlyMixin(eYo.Scan.KW, {
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

eYo.Do.readOnlyMixin(eYo.Scan.E, {
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
eYo.Do.readOnlyMixin(eYo.Scan.XRE, {
  prefix: XRegExp(
    'u|r(?:f|b)?|(?:f|b)r?', 'i'),
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
  },// Ll | Lm | Lo | Lt | Lu
  id_start: XRegExp('_|\\p{L}|\\p{Nl}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C', 'A'),
  id_continue: XRegExp('(?:_|\\p{L}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C|\\u00B7|\\u0387|\\u1369|\\u136A|\\u136B|\\u136C|\\u136D|\\u136E|\\u136F|\\u1370|\\u1371|\\u19DA)+', 'A'),
  type_comment: XRegExp('\\s*type:\\s*(?<ignore>ignore)?.*'),
  letter: XRegExp('\\p{L}', 'A')
})

Object.defineProperties(eYo.Scan.prototype, {
  string: {
    get () {
      return this.tokens.map(x => x.string).join('')
    }
  },
/**
 * @readonly
 * @property {Number} level  level is the depth of the parenthesis stack.
 * This is nonnegative only if we are in a parenthesis, bracket,... group.
 */
  level: {
    get () {
      return this.paren_stack.length
    }
  },
  first: {
    get () {
      return this.first_ || this.nextToken()
    }
  }
})

/**
 *  Extra tokens used by python modules.
 * We only need the first one here.
 */
Object.defineProperties(eYo.TKN, {
  COMMENT: {get () {return 58}},
  NL: {get () {return 59}},
  ENCODING: {get () {return 60}}
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
      } else {
        this.first_ = token
      }
      this.last = token
    } else if (!this.c) {
      this.done = eYo.E.EOF
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
   * Create a regular token and push it.
   * @param {*} type
   * @param {*} subtype
   */
  var new_Token = (type, subtype = null) => {
    var token = new eYo.Node(this, type, subtype)
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
   * @param {String} type
   * @param {Character} [c1]
   * @param {Character} [c2]
   */
  var new_TokenIf = (type, c1, c2) => {
    if (c1) {
      if (this.c === c1) {
        if (c2) {
          if (c2 === this.str[this.end + 1]) {
            forward(2)
            return new_Token(type)
          }
        } else {
          forward(1)
          return new_Token(type)
        }
      }
    } else {
      return new_Token(type)
    }
  }

  /**
   * Creates an error token.
   * Subsequent error tokens will be part of this token.
   * A subsequent regular token will be a recovery
   * token attached to this error token.
   * @param {*} subtype
   */
  var new_Error = (subtype) => {
    var token = new_Token(eYo.TKN.ERRORTOKEN, subtype)
    this.error = token
    ++ this.errorCount
    return token
  }

  /**
   * Create an indentation token and push it.
   * @param {*} col
   * @param {*} altcol
   */
  var new_Indent = (col, altcol) => {
    var token = new_Token(eYo.TKN.INDENT)
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
  var new_Dedent = (indent) => {
    var tkn = new_Token(eYo.TKN.DEDENT)
    if (indent) {
      tkn.indent = indent
      indent.dedent = tkn
    }
  }

 /**
   * Create an NAME token and push it.
   * Scans the id_continue characters first.
   */
  var new_NAME_ = () => {
    var t = new_Token(eYo.TKN.NAME)
    if (this.c >= 128) {
      forward()
      new_Error(eYo.Scan.E.UNEXPECTED_CHARACTER)
    }
    read_space()
    return t
  }

  /**
   * Create an NAME token and push it.
   * Scans the id_continue characters first.
   */
  var new_NAME = () => {
    var m = exec(eYo.Scan.XRE.id_continue)
    if (m) {
      forward(m[0].length)
    }
    return new_NAME_()
  }

  /**
   * A NEWLINE Token with EOL (problem with continuations).
   */
  var new_NEWLINE = (no_EOL) => {
    this.at_bol = true
    ++this.lineno
    if (!no_EOL) {
      if (this.end > this.start) {
        if (this.start_string === eYo.NA) {
          this.start_string = this.start
        }
      }
      this.start = this.end
    }
    return new_Token(eYo.TKN.NEWLINE)
  }

 /**
   * An EOL without a NEWLINE Token, for line continuation (not only?).
   */
  var do_EOL = () => {
    this.at_bol = true
    ++this.lineno
    if (this.end > this.start) {
      if (this.start_string === eYo.NA) {
        this.start_string = this.start
      }
    }
    this.start = this.end
  }

  /**
   * Updates the `start_continue` property.
   */
  var do_continue = () => {
    this.at_bol = true
    ++this.lineno
    if (this.start_string === eYo.NA) {
      this.start_string = this.start
    }
    this.start = this.end
  }

  /**
   * Create an ENDMARKER token and push it.
   * First, push a dedent token for each stacked indent.
   * Only one end marker.
   * If the start is a single input, no
   */
  var new_EOF = () => {
    var indent
    if ((indent = this.indent_stack.pop())) {
      // ensure there is a newline
      if (this.last.type != eYo.TKN.NEWLINE) {
        new_Token(eYo.TKN.NEWLINE)
      }
      do {
        new_Dedent(indent)
      } while ((indent = this.indent_stack.pop()))
      this.at_eof = true
      return new_Token(this.start_type === eYo.TKN.single_input ? eYo.TKN.NEWLINE : eYo.TKN.ENDMARKER)
    }
    if (!this.at_eof) {
      // ensure there is a newline
      if (!this.last || this.last.type != eYo.TKN.NEWLINE) {
        new_Token(eYo.TKN.NEWLINE)
      }
      this.at_eof = true
      return new_Token(this.start_type === eYo.TKN.single_input ? eYo.TKN.NEWLINE : eYo.TKN.ENDMARKER)
    }
  }

  var new_COMMENT = () => {
    if (this.end > this.start) {
      if (this.start_string === eYo.NA) {
        this.start_string = this.start
      }
      return new_Token(eYo.TKN.COMMENT)
    }
  }

  /**
   * Records space trailers.
   * Extra white spaces that are not indents always occur after a
   * non indent|dedent token has been created,
   * on a non blank line.
   */
  var do_space = () => {
    if (this.end > this.start && this.start_string === eYo.NA) {
      this.start_string = this.start
    }
    this.start = this.end
  }

  var read_space = () => {
    if (scan_s(' ') || scan_s('\t') || scan_s(0o14)) {
      while (scan_s(' ') || scan_s('\t') || scan_s(0o14)) {}
      do_space()
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
          new_Error(MSG)
        }
        return new_Token(eYo.TKN.NUMBER, subtype)
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
          new_Error(eYo.Scan.E.INVALID_EXPONENT)
        }
      } else if ((d = scan_digitpart())) {
        if (d < this.end) {
          new_Error(eYo.Scan.E.INVALID_EXPONENT)
        }
      } else {
        backward()
      }
      return new_Token(eYo.TKN.NUMBER,
        scan('j') || scan('J')
        ? 'imagnumber'
        : 'floatnumber')
    }
    else if (scan('j') || scan('J')) {
      return new_Token(eYo.TKN.NUMBER, 'imagnumber')
    }
  }

  /**
   * Push a keyword token when scan is possible.
   * @param {String} kw  kw is the keyword to scan.
   * @param {Integer} start  the start index.
   * @return {String} subtype on success.
   */
  var new_KeyWord = (kw, start = 0) => {
    if (scan_w(kw, start)) {
      var m = exec(eYo.Scan.XRE.id_continue)
      if (m) {
        forward(m[0].length)
        new_NAME_()
      } else {
        new_Token(eYo.TKN.NAME, kw).be_keyword()
        read_space()
      }
      return true
    }
  }

/**
 * Scan a comment.
 * 2 situations, reading the comment from indentation lookup
 * or reading comment after something else.
 * @param {*} col  eYo.NA when the comment follows something,
 * otherwise col is the number of spaces before.
 */
  var scan_Comment = col => {
    this.start_comment = this.end
    if (scan('#')) {
      this.start_comment++
      if (scan(' ')) {
        this.start_comment++
      }
      // this is not an indentation
      col && (do_space())
      var m = exec(eYo.Scan.XRE.type_comment)
      if (m) {
        forward(m[0].length)
        var tkn = new_Token(m.ignore
            ? eYo.TKN.TYPE_IGNORE
            : eYo.TKN.TYPE_COMMENT)
        tkn.continuation = !this.level
        tkn.blank = col !== eYo.NA
        if (scan('\r')) {
          scan('\n')
          do_EOL() // no NEWLINE after a comment
        } else if (scan('\n')) {
          do_EOL() // no NEWLINE after a comment
        } else {
          new_EOF()
        }
      } else {
        // advance to the EOL
        while (true) {
          if (scan('\r')) {
            scan('\n')
            var after = do_EOL
          } else if (scan('\n')) {
            after = do_EOL
          } else if (forward()) {
            continue
          } else {
            after = new_EOF
          }
          tkn = new_COMMENT()
          tkn.continuation = !this.level
          tkn.blank = col !== eYo.NA
          after()
          return true
        }
      }
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
      this.line_start = this.lineno
      this.first_lineno = null
      /* Find the quote size and start of string */
      if (scan(quote)) {
        if (scan(quote)) {
          quote_size = 3
          this.first_lineno = this.lineno
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
            new_Error(eYo.Scan.E.EOLS)
            this.done = eYo.E.EOLS
            break
          } else if (scan('\n')) {
            new_Error(eYo.Scan.E.EOLS)
            this.done = eYo.E.EOLS
            break
          }
        } else if (scan('\r')) {
          scan('\n')
          ++this.lineno
          continue
        } else if (scan('\n')) {
          ++this.lineno
          continue
        }
        if (scan('\\')) {
          if (!forward()) {
            new_Error(eYo.Scan.E.EOFS)
            this.done = eYo.E.EOFS
            break
          }
        } else if (!forward()) {
          if (quote_size === 1) {
            new_Error(eYo.Scan.E.EOLS)
            this.done = eYo.E.EOLS
          } else {
            new_Error(eYo.Scan.E.EOFS)
            this.done = eYo.E.EOFS
          }
          var end = true
          break
        }
      }
      new_Token(eYo.TKN.STRING).first_lineno = this.first_lineno
      if (end) {
        new_EOF()
      }
      return true
    }
  }

  /* Begin(ning of line) */
  bol: while(true) {

    if (this.list.length > 0) {
      return shift()
    }

    this.start = this.end

    /* Get indentation level */
    if (this.at_bol) {
      var col = 0
      var altcol = 0
      this.at_bol = false
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
      if (scan_Comment(col)) {
        if (this.list.length) {
          return shift()
        }
        continue bol
      } else if (scan('\r')) {
        // this is not an indentation either
        scan('\n')
        col && (do_space())
        new_NEWLINE()
        continue bol
      } else if (scan('\n')) {
        // this is not an indentation either
        col && (do_space())
        new_NEWLINE()
        continue bol
      }
      if (this.level) {
        col && (do_space())
      } else {
        if (this.indent_stack.length) {
          var indent = this.indent_stack[this.indent_stack.length - 1]
          if (col === indent.col) {
            /* No change */
            if (altcol != indent.altcol) {
              new_Error(eYo.Scan.E.INCONSISTENT_INDENTATION)
              this.done = eYo.E.TABSPACE
            }
            do_space()
          } else if (col > indent.col) {
            /* Indent -- always one */
            if (altcol <= indent.altcol) {
              new_Error(eYo.Scan.E.INCONSISTENT_INDENTATION)
              scathisn.done = eYo.E.TABSPACE
            }
            new_Indent(col, altcol)
            // continue
          } else {
            /* Dedent -- any number, must be consistent */
            var indent2 = indent
            while (true) {
              if (this.indent_stack.length > 1) {
                indent = this.indent_stack[this.indent_stack.length - 2]
                if (col === indent.col) {
                  // we found it
                  new_Dedent(indent2)
                  this.indent_stack.pop()
                } else if (col < indent.col) {
                  new_Dedent(indent2)
                  this.indent_stack.pop()
                  indent2 = indent
                  continue
                } else {
                  // for the sake of recovery,
                  // this is not considered as a dedent ()
                  new_Error(eYo.Scan.E.DEDENT_AUGMENTED)
                  this.done = eYo.E.DEDENT
                }
                break
              } else {
                /* this.indent_stack.length === 1 */
                if (col) {
                  new_Error(eYo.Scan.E.DEDENT_AUGMENTED)
                  this.done = eYo.E.DEDENT
                } else if (altcol) {
                  new_Error(eYo.Scan.E.INCONSISTENT_INDENTATION)
                  this.done = eYo.E.TABSPACE
                }
                new_Dedent(indent2)
                this.indent_stack.pop()
              }
              break
            }
          }
        } else if (col) {
          /* First indentation */
          new_Indent(col, altcol)
        }
      }
    }

    again:  do {

      /* Check for EOF and errors now */
  //   /* Check for EOF and errors now */
  //   if (c == EOF) {
  //     return tok->done == E_EOF ? ENDMARKER : ERRORTOKEN;
  // }
      if (!this.c) {
        new_EOF()
        return shift()
      }
    /* Set start of current token */
      this.start = this.end // usefull ?

      /* Keywords */
      if (new_KeyWord('False')
        || new_KeyWord('None')
        || new_KeyWord('True')
        || new_KeyWord('break')
        || new_KeyWord('global')
        || new_KeyWord('lambda')
        || new_KeyWord('or')
        || new_KeyWord('pass')
        || new_KeyWord('try')
        || new_KeyWord('yield')) {
        return shift()
      } else if (scan('a')) {
        if (new_KeyWord('await', 1) ||
          new_KeyWord('and', 1)) {
          return shift()
        } else if (scan('s')) {
          if (new_KeyWord('assert', 2) ||
            new_KeyWord('async', 2)) {
          } else {
            var m = exec(eYo.Scan.XRE.id_continue)
            if (m) {
              forward(m[0].length)
              new_NAME_()
            } else {
              new_NAME_().be_keyword()
            }
          }
          return shift()
        }
        new_NAME()
        return shift()
      } else if (scan('c')) {
        if (new_KeyWord('class', 1) ||
          new_KeyWord('continue', 1)) {
          return shift()
        }
        new_NAME()
        return shift()
      } else if (scan_w('de')) {
        if (new_KeyWord('def', 2) ||
          new_KeyWord('del', 2)) {
          return shift()
        }
        new_NAME()
        return shift()
      } else if (scan('e')) {
        if (scan('l')) {
          if (new_KeyWord('else', 2) ||
            new_KeyWord('elif', 2)) {
            return shift()
          }
        } else if (new_KeyWord('except', 1)) {
          return shift()
        }
        new_NAME()
        return shift()
      } else if (scan('i')) {
        if (new_KeyWord('if', 1)
          || new_KeyWord('import', 1)
          || new_KeyWord('in', 1)
          || new_KeyWord('is', 1)) {
          return shift()
        }
        new_NAME()
        return shift()
      } else if (scan_w('no')) {
        if (new_KeyWord('nonlocal', 2)
          || new_KeyWord('not', 2)) {
          return shift()
        }
        new_NAME()
        return shift()
      } else if (scan('w')) {
        if (new_KeyWord('while', 1)
          || new_KeyWord('with', 1)) {
          return shift()
        }
        new_NAME()
        return shift()
      }
      /*
          RAISE: 'raise',
          RETURN: 'return',
      */

      /* Check for a string or bytes literal */
      if ((m = exec(eYo.Scan.XRE.prefix))) {
        forward(m[0].length)
        if (m[0] === 'r') {
          if (new_KeyWord('raise', 1)
            || new_KeyWord('return', 1)) {
            return shift()
          }
        } else if (m[0] === 'f') {
          if (new_KeyWord('for', 1)
            || new_KeyWord('from', 1)
            || new_KeyWord('finally', 1)) {
            return shift()
          }
        }
        // this is a possible string | bytes literal
        if (!anchor_letter_quote()) {
          new_NAME()
        }
        return shift()
      } else if ((m = exec(eYo.Scan.XRE.id_start))) {
        // this is an identifier
        forward(m[0].length)
        new_NAME()
        return shift()
      }
      /* new_line */
      if (scan('\r')) {
        scan('\n')
        var tkn = new_NEWLINE()
        tkn.continuation = !this.level
        continue bol
      } else if (scan('\n')) {
        tkn = new_NEWLINE()
        tkn.continuation = !this.level
        continue bol
      }
      /* Period or number starting with period? */
      if (scan('.')) {
        if ((d = scan_digitpart())) {
          if (d < this.end) {
            new_Error(eYo.Scan.E.NO_TRAILING_UNDERSCORE)
          }
          new_exponent_j() || new_Token(eYo.TKN.NUMBER, 'floatnumber')
        } else {
          if (scan('.')) {
            if (scan('.')) {
              new_Token(eYo.TKN.ELLIPSIS)
              return shift()
            }
            backward()
          }
          new_Token(eYo.TKN.DOT)
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
        }, 'hexinteger', eYo.Scan.E.INVALID_HEXADECIMAL)
          || new_box_literal('o', 'O', () => {
            if ((this.c && this.c >= '0' && this.c <= '7')) {
              forward()
              return true
            }
          }, 'octalinteger', eYo.Scan.E.INVALID_OCTAL_INTEGER)
          || new_box_literal('b', 'B', () => {
            if(this.c === '0' || this.c === '1') {
              forward()
              return true
            }
          }, 'bininteger', eYo.Scan.E.INVALID_BINARY_INTEGER)) {
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
                new_Error(eYo.Scan.E.NO_TRAILING_UNDERSCORE)
              }
              nonzero = true
            }
          }
          break
        }
        if (scan('.')) {
          if (( d = scan_digitpart()) && d < this.end) {
            new_Error(eYo.Scan.E.NO_TRAILING_UNDERSCORE)
          }
          new_exponent_j() || new_Token(eYo.TKN.NUMBER, 'floatnumber')
        } else if (!new_exponent_j()) {
          if (nonzero) {
            /* Old-style octal: now disallowed. */
            new_Error(eYo.Scan.E.NO_LEADING_ZERO)
            // return syntaxerror(tok,
            //   "leading zeros in decimal integer " +
            //   "literals are not permitted " +
            //   "use an 0o prefix for octal integers")
          }
          new_Token(eYo.TKN.NUMBER, 'integer')
        }
        return shift()
      }
      else if ((d = scan_digitpart())) {
        /* Decimal ? */
        if (d < this.end) {
          new_Error(eYo.Scan.E.NO_TRAILING_UNDERSCORE)
        }
        this.subtype = 'integer'
        /* Accept floating point numbers. */
        if (scan('.')) {
          /* Fraction, possibly reduced to a dot */
          if ((d = scan_digitpart()) && d < this.end) {
            new_Error(eYo.Scan.E.NO_TRAILING_UNDERSCORE)
          }
          this.subtype = 'floatnumber'
        }
        new_exponent_j() || new_Token(eYo.TKN.NUMBER, this.subtype)
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
          do_continue()
          read_space()
          continue again
        } else if (scan('\n')) {
          do_continue()
          read_space()
          continue again
        } else if (this.c) {
          this.forward
          new_Error(eYo.Scan.E.UNEXPECTED_ESCAPE)
          this.done = eYo.E.LINECONT
        } else {
          new_EOF()
          return shift()
        }
      }
    } while (read_space())

    /* Comments */
    if (scan_Comment()) {
      if (this.list.length) {
        return shift()
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
      ++i
      case '[':
      ++i
      case '{':
        this.paren_stack.push(new_Token([
          eYo.TKN.LBRACE,
          eYo.TKN.LSQB,
          eYo.TKN.LPAR
        ][i]))
        break
      case ')':
        ++i
      case ']':
        ++i
      case '}':
        var opening = this.paren_stack.pop()
        if (!opening) {
          new_Error([
            eYo.Scan.E.UNEXPECTED_RBRACE,
            eYo.Scan.E.UNEXPECTED_RSQB,
            eYo.Scan.E.UNEXPECTED_RPAR
          ][i])
        } else if (opening.type !== [
          eYo.TKN.LBRACE,
          eYo.TKN.LSQB,
          eYo.TKN.LPAR
        ][i]) {
          new_Error(eYo.Scan.E.UNMATCHED_PAREN)
        }
        new_Token([
          eYo.TKN.RBRACE,
          eYo.TKN.RSQB,
          eYo.TKN.RPAR
        ][i]).be_close(opening)
        break
      // case '%':
      // case '&':
      // case '(':
      // case ')':
      // case '*':
      // case '+':
      case ',':
        new_Token(eYo.TKN.COMMA)
        break
      // case '-':
      // case '.':
      // case '/':
      // case ':':
      case ';':
        new_Token(eYo.TKN.SEMI)
        break
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
        new_Token(eYo.TKN.TILDE)
        break
      case '!':
        new_TokenIf(eYo.TKN.NOTEQUAL, '=')
          || new_Error(eYo.Scan.E.UNEXPECTED_CHARACTER)
        break;
      case '%':
        new_TokenIf(eYo.TKN.PERCENTEQUAL, '=')
          || new_Token(eYo.TKN.PERCENT)
        break;
      case '&':
        new_TokenIf(eYo.TKN.AMPEREQUAL, '=')
          || new_Token(eYo.TKN.AMPER)
        break;
      case '*':
        new_TokenIf(eYo.TKN.STAREQUAL, '=')
          || new_TokenIf(eYo.TKN.DOUBLESTAREQUAL, '*', '=')
          || new_TokenIf(eYo.TKN.DOUBLESTAR, '*')
          || new_Token(eYo.TKN.STAR)
        break;
      case '+':
        new_TokenIf(eYo.TKN.PLUSEQUAL, '=')
          || new_Token(eYo.TKN.PLUS)
        break;
      case '-':
        new_TokenIf(eYo.TKN.MINEQUAL, '=')
          || new_TokenIf(eYo.TKN.RARROW, '>')
          || new_Token(eYo.TKN.MINUS)
        break;
      case '/':
        new_TokenIf(eYo.TKN.SLASHEQUAL, '=')
          || new_TokenIf(eYo.TKN.DOUBLESLASHEQUAL, '/', '=')
          || new_TokenIf(eYo.TKN.DOUBLESLASH, '/')
          || new_Token(eYo.TKN.SLASH)
        break;
      case ':':
        new_TokenIf(eYo.TKN.COLONEQUAL, '=')
          || new_Token(eYo.TKN.COLON)
        break;
      case '<':
        new_TokenIf(eYo.TKN.LESSEQUAL, '=')
          || new_TokenIf(eYo.TKN.LEFTSHIFTEQUAL, '<', '=')
          || new_TokenIf(eYo.TKN.LEFTSHIFT, '<')
          || new_TokenIf(eYo.TKN.NOTEQUAL, '>')
          || new_Token(eYo.TKN.LESS)
        break;
      case '=':
        new_TokenIf(eYo.TKN.EQEQUAL, '=')
          || new_Token(eYo.TKN.EQUAL)
        break;
      case '>':
        new_TokenIf(eYo.TKN.GREATEREQUAL, '=')
          || new_TokenIf(eYo.TKN.RIGHTSHIFTEQUAL, '>', '=')
          || new_TokenIf(eYo.TKN.RIGHTSHIFT, '>')
          || new_Token(eYo.TKN.GREATER)
        break;
      case '@':
        new_TokenIf(eYo.TKN.ATEQUAL, '=')
          || new_Token(eYo.TKN.AT)
        break;
      case '^':
        new_TokenIf(eYo.TKN.CIRCUMFLEXEQUAL, '=')
          || new_Token(eYo.TKN.CIRCUMFLEX)
        break;
      case '|':
        new_TokenIf(eYo.TKN.VBAREQUAL, '=')
          || new_Token(eYo.TKN.VBAR)
        break;
      case '.':
        new_TokenIf(eYo.TKN.ELLIPSIS, '.', '.')
          || new_Token(eYo.TKN.DOT)
        break;
      // case '#':
      // case '\\':
      // case '\r':
      // case '\n':
      case eYo.NA:
        new_EOF()
        break
      default:
        new_Error(eYo.Scan.E.UNEXPECTED_CHARACTER)
    }
    break
  }
  return shift()
}
