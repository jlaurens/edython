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

eYo.require('Brick')

eYo.require('Msg')

eYo.require('Stmt')
eYo.require('Brick.List')

eYo.require('Brick.Primary')
eYo.require('Tooltip')

eYo.require('Library')
eYo.require('Module.stdtypes__module')

eYo.provide('Brick.Stdtypes')

/**
 * Add the conjugate, imag and real names
 * that are not catched in the documentation
 * by `modulebot.py`.
 */

;(function () {
  var M = eYo.Module.stdtypes__module
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
    class: 'list',
    category: c,
    type_: t,
    ary: 1
  }))
  d.items.push(new M.Item({
    name: 'clear',
    class: 'list',
    category: c,
    type_: t,
    ary: 0
  }))
  d.items.push(new M.Item({
    name: 'copy',
    class: 'list',
    category: c,
    type_: t,
    ary: 0
  }))
  d.items.push(new M.Item({
    name: 'extend',
    class: 'list',
    category: c,
    type_: t,
    ary: 1
  }))
  d.items.push(new M.Item({
    name: 'insert',
    class: 'list',
    category: c,
    type_: t,
    ary: 2
  }))
  d.items.push(new M.Item({
    name: 'pop',
    class: 'list',
    category: c,
    type_: t,
    ary: 1,
    mandatory: 0
  }))

  d.items.push(new M.Item({
    name: 'remove',
    class: 'list',
    category: c,
    type_: t,
    ary: 1
  }))

  d.items.push(new M.Item({
    name: 'reverse',
    class: 'list',
    category: c,
    type_: t,
    ary: 0
  }))
  
}) ()
