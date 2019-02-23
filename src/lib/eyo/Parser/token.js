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

eYo.Token.ISTERMINAL = x => x < eYo.Token.NT_OFFSET
eYo.Token.ISNONTERMINAL = x => x >= eYo.Token.NT_OFFSET
eYo.Token.ISEOF = x => x === eYo.Token.ENDMARKER

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

Object.defineProperties(eYo.Token, {
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

eYo.Token.PyToken_OneChar = (c1) =>
{
    switch (c1) {
    case '%': return eYo.Token.PERCENT
    case '&': return eYo.Token.AMPER
    case '(': return eYo.Token.LPAR
    case ')': return eYo.Token.RPAR
    case '*': return eYo.Token.STAR
    case '+': return eYo.Token.PLUS
    case ',': return eYo.Token.COMMA
    case '-': return eYo.Token.MINUS
    case '.': return eYo.Token.DOT
    case '/': return eYo.Token.SLASH
    case ':': return eYo.Token.COLON
    case '': return eYo.Token.SEMI
    case '<': return eYo.Token.LESS
    case '=': return eYo.Token.EQUAL
    case '>': return eYo.Token.GREATER
    case '@': return eYo.Token.AT
    case '[': return eYo.Token.LSQB
    case ']': return eYo.Token.RSQB
    case '^': return eYo.Token.CIRCUMFLEX
    case '{': return eYo.Token.LBRACE
    case '|': return eYo.Token.VBAR
    case '}': return eYo.Token.RBRACE
    case '~': return eYo.Token.TILDE
    }
    return eYo.Token.OP
}

eYo.Token.PyToken_TwoChars = (c1, c2) =>
{
    switch (c1) {
    case '!':
        switch (c2) {
        case '=': return eYo.Token.NOTEQUAL
        }
        break
    case '%':
        switch (c2) {
        case '=': return eYo.Token.PERCENTEQUAL
        }
        break
    case '&':
        switch (c2) {
        case '=': return eYo.Token.AMPEREQUAL
        }
        break
    case '*':
        switch (c2) {
        case '*': return eYo.Token.DOUBLESTAR
        case '=': return eYo.Token.STAREQUAL
        }
        break
    case '+':
        switch (c2) {
        case '=': return eYo.Token.PLUSEQUAL
        }
        break
    case '-':
        switch (c2) {
        case '=': return eYo.Token.MINEQUAL
        case '>': return eYo.Token.RARROW
        }
        break
    case '/':
        switch (c2) {
        case '/': return eYo.Token.DOUBLESLASH
        case '=': return eYo.Token.SLASHEQUAL
        }
        break
    case ':':
        switch (c2) {
        case '=': return eYo.Token.COLONEQUAL
        }
        break
    case '<':
        switch (c2) {
        case '<': return eYo.Token.LEFTSHIFT
        case '=': return eYo.Token.LESSEQUAL
        case '>': return eYo.Token.NOTEQUAL
        }
        break
    case '=':
        switch (c2) {
        case '=': return eYo.Token.EQEQUAL
        }
        break
    case '>':
        switch (c2) {
        case '=': return eYo.Token.GREATEREQUAL
        case '>': return eYo.Token.RIGHTSHIFT
        }
        break
    case '@':
        switch (c2) {
        case '=': return eYo.Token.ATEQUAL
        }
        break
    case '^':
        switch (c2) {
        case '=': return eYo.Token.CIRCUMFLEXEQUAL
        }
        break
    case '|':
        switch (c2) {
        case '=': return eYo.Token.VBAREQUAL
        }
        break
    }
    return eYo.Token.OP
}

eYo.Token.PyToken_ThreeChars(c1, c2, c3)
{
    switch (c1) {
    case '*':
        switch (c2) {
        case '*':
            switch (c3) {
            case '=': return eYo.Token.DOUBLESTAREQUAL
            }
            break
        }
        break
    case '.':
        switch (c2) {
        case '.':
            switch (c3) {
            case '.': return eYo.Token.ELLIPSIS
            }
            break
        }
        break
    case '/':
        switch (c2) {
        case '/':
            switch (c3) {
            case '=': return eYo.Token.DOUBLESLASHEQUAL
            }
            break
        }
        break
    case '<':
        switch (c2) {
        case '<':
            switch (c3) {
            case '=': return eYo.Token.LEFTSHIFTEQUAL
            }
            break
        }
        break
    case '>':
        switch (c2) {
        case '>':
            switch (c3) {
            case '=': return eYo.Token.RIGHTSHIFTEQUAL
            }
            break
        }
        break
    }
    return eYo.Token.OP
}
