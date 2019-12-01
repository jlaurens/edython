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

goog.provide('eYo.E')

Object.defineProperties(eYo.E, {
  OK: {get () {return 10}}, /* No error */
  EOF: {get () {return 11}}, /* End Of File */
  INTR: {get () {return 12}}, /* Interrupted */
  TOKEN: {get () {return 13}}, /* Bad token */
  SYNTAX: {get () {return 14}}, /* Syntax error */
  NOMEM: {get () {return 15}}, /* Ran out of memory */
  DONE: {get () {return 16}}, /* Parsing complete */
  ERROR: {get () {return 17}}, /* Execution error */
  TABSPACE: {get () {return 18}}, /* Inconsistent mixing of tabs and spaces */
  OVERFLOW: {get () {return 19}}, /* Node had too many children */
  TOODEEP: {get () {return 20}}, /* Too many indentation levels */
  DEDENT: {get () {return 21}}, /* No matching outer brick for dedent */
  DECODE: {get () {return 22}}, /* Error in decoding into Unicode */
  EOFS: {get () {return 23}}, /* EOF in triple-quoted string */
  EOLS: {get () {return 24}}, /* EOL in single-quoted string */
  LINECONT: {get () {return 25}}, /* Unexpected characters after a line continuation */
  IDENTIFIER: {get () {return 26}}, /* Invalid characters in identifier */
  BADSINGLE: {get () {return 27}} /* Ill-formed single statement input */
})

eYo.Debug.test() // remove this line when finished
