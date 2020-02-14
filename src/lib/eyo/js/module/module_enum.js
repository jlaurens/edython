/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview enum module. Automatically generated by `python3 bin/helpers/modulebot.py enum through npm run eyo:module`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.module.makeNS('enum__module')

eYo.module.enum__module.url = 'https://docs.python.org/3.6/library/enum.html'

;(() => {
  /* Singleton constructor */
  var Item = eYo.module.enum__module.makeItem()


  eYo.module.enum__module.data_ = {
    categories: [
      'module-contents',
      'ensuring-unique-enumeration-values'
    ],
    types: [
      'class',
      'function'
    ],
    items: [
      new Item({
        name: 'Enum',
        class: 'enum',
        category: 0,
        type_: 0,
        href: '#enum.Enum',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'Flag',
        class: 'enum',
        category: 0,
        type_: 0,
        href: '#enum.Flag',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'IntEnum',
        class: 'enum',
        category: 0,
        type_: 0,
        href: '#enum.IntEnum',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'IntFlag',
        class: 'enum',
        category: 0,
        type_: 0,
        href: '#enum.IntFlag',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'auto',
        class: 'enum',
        category: 0,
        type_: 0,
        href: '#enum.auto',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'unique',
        class: 'enum',
        category: 0,
        type_: 1,
        href: '#enum.unique',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'unique',
        class: 'enum',
        category: 1,
        stmt: true,
        ary: 0
      })
    ],
    by_name: {
      'Enum': 0,
      'Flag': 1,
      'IntEnum': 2,
      'IntFlag': 3,
      'auto': 4,
      'unique': 6
    },
    by_category: {
      0: [0, 1, 2, 3, 4, 5],
      1: [6]
    },
    by_type: {
      0: [0, 1, 2, 3, 4],
      1: [5]
    }
  }
  

}) ()


  // This file was generated by `python3 ./bin/helpers/modulebot.py enum` on 2020-02-12 15:52:53.428623


