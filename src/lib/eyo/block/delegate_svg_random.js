/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Random')

goog.require('eYo.DelegateSvg.Stmt')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Range')

/**
 * Class for a DelegateSvg, import random block.
 * A unique block for each module to ease forthcoming management.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('random_import_stmt', {
  xml: {
    tag: 'random+import',
  },
  fields: {
    label: {
      value: 'import',
      css: 'builtin'
    },
    random: {
      value: 'random'
    }
  }
})

eYo.DelegateSvg.Random.T3s = [
  eYo.T3.Stmt.random_import_stmt
]
