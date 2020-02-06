/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Std types extension for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('brick')

eYo.require('msg')

eYo.require('stmt')
eYo.require('expr.List')

eYo.require('expr.primary')
eYo.require('tooltip')

eYo.require('Library')
eYo.require('module.stdtypes')

eYo.provide('brick.stdtypes')

/**
 * Add the conjugate, imag and real names
 * that are not catched in the documentation
 * by `modulebot.py`.
 */

;(function () {
  var M = eYo.module.stdtypes
  var d = M.data
  var n = d.items.length
  var t = d.types.indexOf('method')
  var c = d.categories.indexOf('lists')

  ;[
    'append',
    'clear',
    'copy',
    'extend',
    'insert',
    'pop',
    'remove',
    'reverse'
  ].forEach((name) => {
    d.by_name[name] = n
    d.by_type[t].push(n)
    ++n
  })

  d.items.push(new M.Item({
    name: 'append',
    class: 'List',
    category: c,
    type_: t,
    ary: 1
  }))
  d.items.push(new M.Item({
    name: 'clear',
    class: 'List',
    category: c,
    type_: t,
    ary: 0
  }))
  d.items.push(new M.Item({
    name: 'copy',
    class: 'List',
    category: c,
    type_: t,
    ary: 0
  }))
  d.items.push(new M.Item({
    name: 'extend',
    class: 'List',
    category: c,
    type_: t,
    ary: 1
  }))
  d.items.push(new M.Item({
    name: 'insert',
    class: 'List',
    category: c,
    type_: t,
    ary: 2
  }))
  d.items.push(new M.Item({
    name: 'pop',
    class: 'List',
    category: c,
    type_: t,
    ary: 1,
    mandatory: 0
  }))

  d.items.push(new M.Item({
    name: 'remove',
    class: 'List',
    category: c,
    type_: t,
    ary: 1
  }))

  d.items.push(new M.Item({
    name: 'reverse',
    class: 'List',
    category: c,
    type_: t,
    ary: 0
  }))

}) ()
