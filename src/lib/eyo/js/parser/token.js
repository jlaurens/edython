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

goog.require('eYo')

goog.provide('eYo.TKN')

eYo.TKN.ISTERMINAL = x => x < eYo.TKN.NT_OFFSET
eYo.TKN.ISNONTERMINAL = x => x >= eYo.TKN.NT_OFFSET
eYo.TKN.ISEOF = x => x === eYo.TKN.ENDMARKER

Object.defineProperties(eYo.TKN, {
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

Object.defineProperties(eYo.TKN, {
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

eYo.TKN.PyToken_OneChar = (c1) =>
{
    switch (c1) {
    case '%': return eYo.TKN.PERCENT
    case '&': return eYo.TKN.AMPER
    case '(': return eYo.TKN.LPAR
    case ')': return eYo.TKN.RPAR
    case '*': return eYo.TKN.STAR
    case '+': return eYo.TKN.PLUS
    case ',': return eYo.TKN.COMMA
    case '-': return eYo.TKN.MINUS
    case '.': return eYo.TKN.DOT
    case '/': return eYo.TKN.SLASH
    case ':': return eYo.TKN.COLON
    case '': return eYo.TKN.SEMI
    case '<': return eYo.TKN.LESS
    case '=': return eYo.TKN.EQUAL
    case '>': return eYo.TKN.GREATER
    case '@': return eYo.TKN.AT
    case '[': return eYo.TKN.LSQB
    case ']': return eYo.TKN.RSQB
    case '^': return eYo.TKN.CIRCUMFLEX
    case '{': return eYo.TKN.LBRACE
    case '|': return eYo.TKN.VBAR
    case '}': return eYo.TKN.RBRACE
    case '~': return eYo.TKN.TILDE
    }
    return eYo.TKN.OP
}

eYo.TKN.PyToken_TwoChars = (c1, c2) =>
{
    switch (c1) {
    case '!':
        switch (c2) {
        case '=': return eYo.TKN.NOTEQUAL
        }
        break
    case '%':
        switch (c2) {
        case '=': return eYo.TKN.PERCENTEQUAL
        }
        break
    case '&':
        switch (c2) {
        case '=': return eYo.TKN.AMPEREQUAL
        }
        break
    case '*':
        switch (c2) {
        case '*': return eYo.TKN.DOUBLESTAR
        case '=': return eYo.TKN.STAREQUAL
        }
        break
    case '+':
        switch (c2) {
        case '=': return eYo.TKN.PLUSEQUAL
        }
        break
    case '-':
        switch (c2) {
        case '=': return eYo.TKN.MINEQUAL
        case '>': return eYo.TKN.RARROW
        }
        break
    case '/':
        switch (c2) {
        case '/': return eYo.TKN.DOUBLESLASH
        case '=': return eYo.TKN.SLASHEQUAL
        }
        break
    case ':':
        switch (c2) {
        case '=': return eYo.TKN.COLONEQUAL
        }
        break
    case '<':
        switch (c2) {
        case '<': return eYo.TKN.LEFTSHIFT
        case '=': return eYo.TKN.LESSEQUAL
        case '>': return eYo.TKN.NOTEQUAL
        }
        break
    case '=':
        switch (c2) {
        case '=': return eYo.TKN.EQEQUAL
        }
        break
    case '>':
        switch (c2) {
        case '=': return eYo.TKN.GREATEREQUAL
        case '>': return eYo.TKN.RIGHTSHIFT
        }
        break
    case '@':
        switch (c2) {
        case '=': return eYo.TKN.ATEQUAL
        }
        break
    case '^':
        switch (c2) {
        case '=': return eYo.TKN.CIRCUMFLEXEQUAL
        }
        break
    case '|':
        switch (c2) {
        case '=': return eYo.TKN.VBAREQUAL
        }
        break
    }
    return eYo.TKN.OP
}

eYo.TKN.PyToken_ThreeChars = (c1, c2, c3) =>
{
    switch (c1) {
    case '*':
        switch (c2) {
        case '*':
            switch (c3) {
            case '=': return eYo.TKN.DOUBLESTAREQUAL
            }
            break
        }
        break
    case '.':
        switch (c2) {
        case '.':
            switch (c3) {
            case '.': return eYo.TKN.ELLIPSIS
            }
            break
        }
        break
    case '/':
        switch (c2) {
        case '/':
            switch (c3) {
            case '=': return eYo.TKN.DOUBLESLASHEQUAL
            }
            break
        }
        break
    case '<':
        switch (c2) {
        case '<':
            switch (c3) {
            case '=': return eYo.TKN.LEFTSHIFTEQUAL
            }
            break
        }
        break
    case '>':
        switch (c2) {
        case '>':
            switch (c3) {
            case '=': return eYo.TKN.RIGHTSHIFTEQUAL
            }
            break
        }
        break
    }
    return eYo.TKN.OP
}

eYo.Debug.test() // remove this line when finished
