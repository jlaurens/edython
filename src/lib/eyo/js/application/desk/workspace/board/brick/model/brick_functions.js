/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Math module bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Brick')

eYo.require('Msg')

eYo.require('Expr.List')

eYo.require('Expr.Primary')
eYo.require('Tooltip')

eYo.require('Library')
eYo.require('Module.functions')

eYo.provide('Brick.Functions')

/**
 * Add the conjugate, imag and real names
 * that are not catched in the documentation
 * by `modulebot.py`.
 */

{
  var M = eYo.Module.functions
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
}
