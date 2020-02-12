/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

console.warn('THIS MUST BE AN EXPRESSION')
/**
 * Class for a Delegate, docstring_stmt.
 * For edython.
 */
eYo.stmt.makeC9r(eYo.t3.stmt.docstring_stmt, {
  link: eYo.t3.expr.longliteral,
  properties: {
    /**
     * @readonly
     * @property {Boolean}  always true
     */
    isWhite: {
      get () {
        return true
      },
    },
  }
})
