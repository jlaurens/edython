/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Std types extension for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Stdtypes')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Stmt')

goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Primary')

goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

goog.require('eYo.Model.stdtypes')

/**
 * Add the conjugate, imag and real names
 * that are not catched in the documentation
 * by `modulebot.py`.
 */

var doit = (() => {
  var M = eYo.Model.stdtypes
  var d = M.data
  var n = d.items.length
  var t = d.types.indexOf('method')
  var c = d.categories.indexOf('lists')
  
  var names = [
    'append',
    'clear',
    'copy',
    'extend',
    'insert',
    'pop',
    'remove',
    'reverse'
  ]
  names.forEach((name) => {
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
