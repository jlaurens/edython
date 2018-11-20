/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython, primary blocks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Signature')

goog.provide('eYo.Signature.builtin')

eYo.Signature.builtin.int
= eYo.Signature.builtin.float
= {
  ary: 1,
  mandatory: 1
}

eYo.Signature.builtin.input
= {
  ary: 1,
  mandatory: 0
}
