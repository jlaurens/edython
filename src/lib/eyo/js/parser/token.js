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

eYo.provide('tkn')

eYo.tkn.ISTERMINAL = x => x < eYo.tkn.NT_OFFSET
eYo.tkn.ISNONTERMINAL = x => x >= eYo.tkn.NT_OFFSET
eYo.tkn.ISEOF = x => x === eYo.tkn.ENDMARKER

Object.defineProperties(eYo.tkn, {
  ENDMARKER: { value: 0} ,
  NAME: { value: 1} ,
  NUMBER: { value: 2} ,
  STRING: { value: 3} ,
  NEWLINE: { value: 4} ,
  INDENT: { value: 5} ,
  DEDENT: { value: 6} ,
  LPAR: { value: 7} ,
  RPAR: { value: 8} ,
  LSQB: { value: 9} ,
  RSQB: { value: 10} ,
  COLON: { value: 11} ,
  COMMA: { value: 12} ,
  SEMI: { value: 13} ,
  PLUS: { value: 14} ,
  MINUS: { value: 15} ,
  STAR: { value: 16} ,
  SLASH: { value: 17} ,
  VBAR: { value: 18} ,
  AMPER: { value: 19} ,
  LESS: { value: 20} ,
  GREATER: { value: 21} ,
  EQUAL: { value: 22} ,
  DOT: { value: 23} ,
  PERCENT: { value: 24} ,
  LBRACE: { value: 25} ,
  RBRACE: { value: 26} ,
  EQEQUAL: { value: 27} ,
  NOTEQUAL: { value: 28} ,
  LESSEQUAL: { value: 29} ,
  GREATEREQUAL: { value: 30} ,
  TILDE: { value: 31} ,
  CIRCUMFLEX: { value: 32} ,
  LEFTSHIFT: { value: 33} ,
  RIGHTSHIFT: { value: 34} ,
  DOUBLESTAR: { value: 35} ,
  PLUSEQUAL: { value: 36} ,
  MINEQUAL: { value: 37} ,
  STAREQUAL: { value: 38} ,
  SLASHEQUAL: { value: 39} ,
  PERCENTEQUAL: { value: 40} ,
  AMPEREQUAL: { value: 41} ,
  VBAREQUAL: { value: 42} ,
  CIRCUMFLEXEQUAL: { value: 43} ,
  LEFTSHIFTEQUAL: { value: 44} ,
  RIGHTSHIFTEQUAL: { value: 45} ,
  DOUBLESTAREQUAL: { value: 46} ,
  DOUBLESLASH: { value: 47} ,
  DOUBLESLASHEQUAL: { value: 48} ,
  AT: { value: 49} ,
  ATEQUAL: { value: 50} ,
  RARROW: { value: 51} ,
  ELLIPSIS: { value: 52} ,
  COLONEQUAL: { value: 53} ,
  OP: { value: 54} ,
  TYPE_IGNORE: { value: 55} ,
  TYPE_COMMENT: { value: 56} ,
  ERRORTOKEN: { value: 57} ,
  N_TOKENS: { value: 61} ,
  NT_OFFSET: { value: 256} 
})

Object.defineProperties(eYo.tkn, {
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
    ]
  }
})

eYo.tkn.PyToken_OneChar = (c1) => {
    switch (c1) {
    case '%': return eYo.tkn.PERCENT
    case '&': return eYo.tkn.AMPER
    case '(': return eYo.tkn.LPAR
    case ')': return eYo.tkn.RPAR
    case '*': return eYo.tkn.STAR
    case '+': return eYo.tkn.PLUS
    case ',': return eYo.tkn.COMMA
    case '-': return eYo.tkn.MINUS
    case '.': return eYo.tkn.DOT
    case '/': return eYo.tkn.SLASH
    case ':': return eYo.tkn.COLON
    case '': return eYo.tkn.SEMI
    case '<': return eYo.tkn.LESS
    case '=': return eYo.tkn.EQUAL
    case '>': return eYo.tkn.GREATER
    case '@': return eYo.tkn.AT
    case '[': return eYo.tkn.LSQB
    case ']': return eYo.tkn.RSQB
    case '^': return eYo.tkn.CIRCUMFLEX
    case '{': return eYo.tkn.LBRACE
    case '|': return eYo.tkn.VBAR
    case '}': return eYo.tkn.RBRACE
    case '~': return eYo.tkn.TILDE
    }
    return eYo.tkn.OP
}

eYo.tkn.PyToken_TwoChars = (c1, c2) => {
    switch (c1) {
    case '!':
        switch (c2) {
        case '=': return eYo.tkn.NOTEQUAL
        }
        break
    case '%':
        switch (c2) {
        case '=': return eYo.tkn.PERCENTEQUAL
        }
        break
    case '&':
        switch (c2) {
        case '=': return eYo.tkn.AMPEREQUAL
        }
        break
    case '*':
        switch (c2) {
        case '*': return eYo.tkn.DOUBLESTAR
        case '=': return eYo.tkn.STAREQUAL
        }
        break
    case '+':
        switch (c2) {
        case '=': return eYo.tkn.PLUSEQUAL
        }
        break
    case '-':
        switch (c2) {
        case '=': return eYo.tkn.MINEQUAL
        case '>': return eYo.tkn.RARROW
        }
        break
    case '/':
        switch (c2) {
        case '/': return eYo.tkn.DOUBLESLASH
        case '=': return eYo.tkn.SLASHEQUAL
        }
        break
    case ':':
        switch (c2) {
        case '=': return eYo.tkn.COLONEQUAL
        }
        break
    case '<':
        switch (c2) {
        case '<': return eYo.tkn.LEFTSHIFT
        case '=': return eYo.tkn.LESSEQUAL
        case '>': return eYo.tkn.NOTEQUAL
        }
        break
    case '=':
        switch (c2) {
        case '=': return eYo.tkn.EQEQUAL
        }
        break
    case '>':
        switch (c2) {
        case '=': return eYo.tkn.GREATEREQUAL
        case '>': return eYo.tkn.RIGHTSHIFT
        }
        break
    case '@':
        switch (c2) {
        case '=': return eYo.tkn.ATEQUAL
        }
        break
    case '^':
        switch (c2) {
        case '=': return eYo.tkn.CIRCUMFLEXEQUAL
        }
        break
    case '|':
        switch (c2) {
        case '=': return eYo.tkn.VBAREQUAL
        }
        break
    }
    return eYo.tkn.OP
}

eYo.tkn.PyToken_ThreeChars = (c1, c2, c3) => {
    switch (c1) {
    case '*':
        switch (c2) {
        case '*':
            switch (c3) {
            case '=': return eYo.tkn.DOUBLESTAREQUAL
            }
            break
        }
        break
    case '.':
        switch (c2) {
        case '.':
            switch (c3) {
            case '.': return eYo.tkn.ELLIPSIS
            }
            break
        }
        break
    case '/':
        switch (c2) {
        case '/':
            switch (c3) {
            case '=': return eYo.tkn.DOUBLESLASHEQUAL
            }
            break
        }
        break
    case '<':
        switch (c2) {
        case '<':
            switch (c3) {
            case '=': return eYo.tkn.LEFTSHIFTEQUAL
            }
            break
        }
        break
    case '>':
        switch (c2) {
        case '>':
            switch (c3) {
            case '=': return eYo.tkn.RIGHTSHIFTEQUAL
            }
            break
        }
        break
    }
    return eYo.tkn.OP
}
