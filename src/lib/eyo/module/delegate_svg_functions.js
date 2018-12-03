/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Math module blocks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Functions')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Stmt')

goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Primary')

goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

goog.require('eYo.Model.functions')



/**
 * Add the conjugate, imag and real names
 * that are not catched in the documentation
 * by `modulebot.py`.
 */

var M = eYo.Model.functions
var d = M.data
var n = d.items.length
var t = d.types.length
var c = d.categories.length

d.by_name['conjugate'] = n
d.by_name['real'] = n + 1
d.by_name['imag'] = n + 2

d.types.push('method')
d.types.push('attribute')

d.by_type[t] = [n]
d.by_type[t + 1] = [n + 1, n + 2]

d.categories.push('edython')

d.items.push(new M.Item({
  name: 'conjugate',
  class: 'complex',
  category: c,
  type_: t,
  ary: 0
}))
d.items.push(new M.Item({
  name: 'real',
  class: 'complex',
  category: c,
  type_: t + 1
}))
d.items.push(new M.Item({
  name: 'imag',
  class: 'complex',
  category: c,
  type_: t + 1
}))
