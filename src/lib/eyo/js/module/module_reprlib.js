/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview reprlib module. Automatically generated by `python3 bin/helpers/modulebot.py reprlib through npm run eyo:module`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.module.makeNS('reprlib__module')

eYo.module.reprlib__module.url = 'https://docs.python.org/3.6/library/reprlib.html'

;(() => {
  /* Singleton constructor */
  var Item = eYo.module.reprlib__module.makeItem()


  eYo.module.reprlib__module.data_ = {
    categories: [
      'module-reprlib',
      'repr-objects'
    ],
    types: [
      'class',
      'data',
      'function',
      'attribute',
      'method'
    ],
    items: [
      new Item({
        name: 'Repr',
        class: 'reprlib',
        category: 0,
        type_: 0,
        href: '#reprlib.Repr',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'aRepr',
        class: 'reprlib',
        category: 0,
        type_: 1,
        href: '#reprlib.aRepr',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'maxdict',
        synonyms: [
          'maxlist',
          'maxtuple',
          'maxset',
          'maxfrozenset',
          'maxdeque',
          'maxarray'
        ],
        class: 'Repr',
        holder: 'reprlib.Repr',
        category: 1,
        type_: 3,
        href: '#reprlib.Repr.maxarray',
        ary: 0
      }),
      new Item({
        name: 'maxlevel',
        class: 'Repr',
        holder: 'reprlib.Repr',
        category: 1,
        type_: 3,
        href: '#reprlib.Repr.maxlevel',
        ary: 0
      }),
      new Item({
        name: 'maxlong',
        class: 'Repr',
        holder: 'reprlib.Repr',
        category: 1,
        type_: 3,
        href: '#reprlib.Repr.maxlong',
        ary: 0
      }),
      new Item({
        name: 'maxother',
        class: 'Repr',
        holder: 'reprlib.Repr',
        category: 1,
        type_: 3,
        href: '#reprlib.Repr.maxother',
        ary: 0
      }),
      new Item({
        name: 'maxstring',
        class: 'Repr',
        holder: 'reprlib.Repr',
        category: 1,
        type_: 3,
        href: '#reprlib.Repr.maxstring',
        ary: 0
      }),
      new Item({
        name: 'recursive_repr',
        class: 'reprlib',
        category: 0,
        type_: 2,
        href: '#reprlib.recursive_repr',
        stmt: true,
        ary: 1,
        mandatory: 0,
        arguments: [
          {
            name: 'fillvalue',
            default: '"..."'
          }
        ]
      }),
      new Item({
        name: 'repr',
        class: 'reprlib',
        category: 0,
        type_: 2,
        href: '#reprlib.repr',
        stmt: true,
        ary: 1,
        arguments: [
          {
            name: 'obj'
          }
        ]
      }),
      new Item({
        name: 'repr',
        class: 'Repr',
        holder: 'reprlib.Repr',
        category: 1,
        type_: 4,
        href: '#reprlib.Repr.repr',
        stmt: true,
        ary: 1,
        arguments: [
          {
            name: 'obj'
          }
        ]
      }),
      new Item({
        name: 'repr1',
        class: 'Repr',
        holder: 'reprlib.Repr',
        category: 1,
        type_: 4,
        href: '#reprlib.Repr.repr1',
        stmt: true,
        ary: 2,
        arguments: [
          {
            name: 'obj'
          },
          {
            name: 'level'
          }
        ]
      }),
      new Item({
        name: 'repr_TYPE',
        class: 'Repr',
        category: 1,
        stmt: true,
        ary: 2,
        arguments: [
          {
            name: 'obj'
          },
          {
            name: 'level'
          }
        ]
      })
    ],
    by_name: {
      'Repr': 0,
      'aRepr': 1,
      'maxdict': 2,
      'maxlist': 2,
      'maxtuple': 2,
      'maxset': 2,
      'maxfrozenset': 2,
      'maxdeque': 2,
      'maxarray': 2,
      'maxlevel': 3,
      'maxlong': 4,
      'maxother': 5,
      'maxstring': 6,
      'recursive_repr': 7,
      'repr': 9,
      'repr1': 10,
      'repr_TYPE': 11
    },
    by_category: {
      0: [0, 1, 7, 8],
      1: [2, 3, 4, 5, 6, 9, 10, 11]
    },
    by_type: {
      0: [0],
      1: [1],
      2: [7, 8],
      3: [2, 3, 4, 5, 6],
      4: [9, 10]
    }
  }
  

}) ()


  // This file was generated by `python3 ./bin/helpers/modulebot.py reprlib` on 2020-02-12 15:52:53.410425


