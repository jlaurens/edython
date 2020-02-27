/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Token utilities.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.py.makeNS('tkn', {
  ENDMARKER: 0,
  NAME: 1,
  NUMBER: 2,
  STRING: 3,
  NEWLINE: 4,
  INDENT: 5,
  DEDENT: 6,
  LPAR: 7,
  RPAR: 8,
  LSQB: 9,
  RSQB: 10,
  COLON: 11,
  COMMA: 12,
  SEMI: 13,
  PLUS: 14,
  MINUS: 15,
  STAR: 16,
  SLASH: 17,
  VBAR: 18,
  AMPER: 19,
  LESS: 20,
  GREATER: 21,
  EQUAL: 22,
  DOT: 23,
  PERCENT: 24,
  LBRACE: 25,
  RBRACE: 26,
  EQEQUAL: 27,
  NOTEQUAL: 28,
  LESSEQUAL: 29,
  GREATEREQUAL: 30,
  TILDE: 31,
  CIRCUMFLEX: 32,
  LEFTSHIFT: 33,
  RIGHTSHIFT: 34,
  DOUBLESTAR: 35,
  PLUSEQUAL: 36,
  MINEQUAL: 37,
  STAREQUAL: 38,
  SLASHEQUAL: 39,
  PERCENTEQUAL: 40,
  AMPEREQUAL: 41,
  VBAREQUAL: 42,
  CIRCUMFLEXEQUAL: 43,
  LEFTSHIFTEQUAL: 44,
  RIGHTSHIFTEQUAL: 45,
  DOUBLESTAREQUAL: 46,
  DOUBLESLASH: 47,
  DOUBLESLASHEQUAL: 48,
  AT: 49,
  ATEQUAL: 50,
  RARROW: 51,
  ELLIPSIS: 52,
  COLONEQUAL: 53,
  OP: 54,
  TYPE_IGNORE: 55,
  TYPE_COMMENT: 56,
  ERRORTOKEN: 57,
  N_TOKENS: 61,
  NT_OFFSET: 256,
  _NAMES: {
    value: [
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
    ],
  }

})

eYo.py.tkn.ISTERMINAL = x => x < eYo.py.tkn.NT_OFFSET
eYo.py.tkn.ISNONTERMINAL = x => x >= eYo.py.tkn.NT_OFFSET
eYo.py.tkn.ISEOF = x => x === eYo.py.tkn.ENDMARKER

eYo.py.tkn.oneChar = (c1) => {
    switch (c1) {
    case '%': return eYo.py.tkn.PERCENT
    case '&': return eYo.py.tkn.AMPER
    case '(': return eYo.py.tkn.LPAR
    case ')': return eYo.py.tkn.RPAR
    case '*': return eYo.py.tkn.STAR
    case '+': return eYo.py.tkn.PLUS
    case ',': return eYo.py.tkn.COMMA
    case '-': return eYo.py.tkn.MINUS
    case '.': return eYo.py.tkn.DOT
    case '/': return eYo.py.tkn.SLASH
    case ':': return eYo.py.tkn.COLON
    case '': return eYo.py.tkn.SEMI
    case '<': return eYo.py.tkn.LESS
    case '=': return eYo.py.tkn.EQUAL
    case '>': return eYo.py.tkn.GREATER
    case '@': return eYo.py.tkn.AT
    case '[': return eYo.py.tkn.LSQB
    case ']': return eYo.py.tkn.RSQB
    case '^': return eYo.py.tkn.CIRCUMFLEX
    case '{': return eYo.py.tkn.LBRACE
    case '|': return eYo.py.tkn.VBAR
    case '}': return eYo.py.tkn.RBRACE
    case '~': return eYo.py.tkn.TILDE
    }
    return eYo.py.tkn.OP
}

eYo.py.tkn.twoChars = (c1, c2) => {
    switch (c1) {
    case '!':
        switch (c2) {
        case '=': return eYo.py.tkn.NOTEQUAL
        }
        break
    case '%':
        switch (c2) {
        case '=': return eYo.py.tkn.PERCENTEQUAL
        }
        break
    case '&':
        switch (c2) {
        case '=': return eYo.py.tkn.AMPEREQUAL
        }
        break
    case '*':
        switch (c2) {
        case '*': return eYo.py.tkn.DOUBLESTAR
        case '=': return eYo.py.tkn.STAREQUAL
        }
        break
    case '+':
        switch (c2) {
        case '=': return eYo.py.tkn.PLUSEQUAL
        }
        break
    case '-':
        switch (c2) {
        case '=': return eYo.py.tkn.MINEQUAL
        case '>': return eYo.py.tkn.RARROW
        }
        break
    case '/':
        switch (c2) {
        case '/': return eYo.py.tkn.DOUBLESLASH
        case '=': return eYo.py.tkn.SLASHEQUAL
        }
        break
    case ':':
        switch (c2) {
        case '=': return eYo.py.tkn.COLONEQUAL
        }
        break
    case '<':
        switch (c2) {
        case '<': return eYo.py.tkn.LEFTSHIFT
        case '=': return eYo.py.tkn.LESSEQUAL
        case '>': return eYo.py.tkn.NOTEQUAL
        }
        break
    case '=':
        switch (c2) {
        case '=': return eYo.py.tkn.EQEQUAL
        }
        break
    case '>':
        switch (c2) {
        case '=': return eYo.py.tkn.GREATEREQUAL
        case '>': return eYo.py.tkn.RIGHTSHIFT
        }
        break
    case '@':
        switch (c2) {
        case '=': return eYo.py.tkn.ATEQUAL
        }
        break
    case '^':
        switch (c2) {
        case '=': return eYo.py.tkn.CIRCUMFLEXEQUAL
        }
        break
    case '|':
        switch (c2) {
        case '=': return eYo.py.tkn.VBAREQUAL
        }
        break
    }
    return eYo.py.tkn.OP
}

eYo.py.threeChars = (c1, c2, c3) => {
    switch (c1) {
    case '*':
        switch (c2) {
        case '*':
            switch (c3) {
            case '=': return eYo.py.tkn.DOUBLESTAREQUAL
            }
            break
        }
        break
    case '.':
        switch (c2) {
        case '.':
            switch (c3) {
            case '.': return eYo.py.tkn.ELLIPSIS
            }
            break
        }
        break
    case '/':
        switch (c2) {
        case '/':
            switch (c3) {
            case '=': return eYo.py.tkn.DOUBLESLASHEQUAL
            }
            break
        }
        break
    case '<':
        switch (c2) {
        case '<':
            switch (c3) {
            case '=': return eYo.py.tkn.LEFTSHIFTEQUAL
            }
            break
        }
        break
    case '>':
        switch (c2) {
        case '>':
            switch (c3) {
            case '=': return eYo.py.tkn.RIGHTSHIFTEQUAL
            }
            break
        }
        break
    }
    return eYo.py.tkn.OP
}
