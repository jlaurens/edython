/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview heapq module. Automatically generated by `python3 bin/helpers/modulebot.py heapq through npm run eyo:module`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.module.newNS('heapq__module', {
  URL: 'https://docs.python.org/3.6/library/heapq.html'
})

;(() => {
  /* Singleton constructor */
  let newItem = eYo.module.heapq__module.makeNewItem()

  eYo.module.heapq__module.data_ = {
    categories: [
      'module-heapq'
    ],
    types: [
      'function'
    ],
    items: [
      newItem({
        name: 'heapify',
        class: 'heapq',
        category: 0,
        type_: 0,
        href: '#heapq.heapify',
        stmt: true,
        ary: 1,
        arguments: [
          {
            name: 'x'
          }
        ]
      }),
      newItem({
        name: 'heappop',
        class: 'heapq',
        category: 0,
        type_: 0,
        href: '#heapq.heappop',
        ary: 1,
        arguments: [
          {
            name: 'heap'
          }
        ]
      }),
      newItem({
        name: 'heappush',
        class: 'heapq',
        category: 0,
        type_: 0,
        href: '#heapq.heappush',
        stmt: true,
        ary: 2,
        arguments: [
          {
            name: 'heap'
          },
          {
            name: 'item'
          }
        ]
      }),
      newItem({
        name: 'heappushpop',
        class: 'heapq',
        category: 0,
        type_: 0,
        href: '#heapq.heappushpop',
        ary: 2,
        arguments: [
          {
            name: 'heap'
          },
          {
            name: 'item'
          }
        ]
      }),
      newItem({
        name: 'heapreplace',
        class: 'heapq',
        category: 0,
        type_: 0,
        href: '#heapq.heapreplace',
        ary: 2,
        arguments: [
          {
            name: 'heap'
          },
          {
            name: 'item'
          }
        ]
      }),
      newItem({
        name: 'merge',
        class: 'heapq',
        category: 0,
        type_: 0,
        href: '#heapq.merge',
        ary: Infinity,
        mandatory: 0,
        arguments: [
          {
            name: '*iterables',
            optional: true
          },
          {
            name: 'key',
            default: 'None'
          },
          {
            name: 'reverse',
            default: 'False'
          }
        ]
      }),
      newItem({
        name: 'nlargest',
        class: 'heapq',
        category: 0,
        type_: 0,
        href: '#heapq.nlargest',
        ary: 3,
        mandatory: 2,
        arguments: [
          {
            name: 'n'
          },
          {
            name: 'iterable'
          },
          {
            name: 'key',
            default: 'None'
          }
        ]
      }),
      newItem({
        name: 'nsmallest',
        class: 'heapq',
        category: 0,
        type_: 0,
        href: '#heapq.nsmallest',
        ary: 3,
        mandatory: 2,
        arguments: [
          {
            name: 'n'
          },
          {
            name: 'iterable'
          },
          {
            name: 'key',
            default: 'None'
          }
        ]
      })
    ],
    by_name: {
      'heapify': 0,
      'heappop': 1,
      'heappush': 2,
      'heappushpop': 3,
      'heapreplace': 4,
      'merge': 5,
      'nlargest': 6,
      'nsmallest': 7
    },
    by_category: {
      0: [0, 1, 2, 3, 4, 5, 6, 7]
    },
    by_type: {
      0: [0, 1, 2, 3, 4, 5, 6, 7]
    }
  }
  

}) ()


// This file was generated by `python3 ./bin/helpers/modulebot.py heapq` on 2020-03-04 13:02:49.199398


