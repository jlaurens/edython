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

goog.provide('eYo.TKN')

eYo.TKN.ISTERMINAL = x => x < eYo.TKN.NT_OFFSET
eYo.TKN.ISNONTERMINAL = x => x >= eYo.TKN.NT_OFFSET
eYo.TKN.ISEOF = x => x === eYo.TKN.ENDMARKER

Object.defineProperties(eYo.TKN, {
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

Object.defineProperties(eYo.TKN, {
  _NAMES: {
    get () {
      return [
        "ENDMARKER",
        "NAME",
        "NUMBER",
        "STRING",
        "new_LINE",
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
