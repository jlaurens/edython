/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview copy module. Automatically generated by `python3 bin/helpers/modulebot.py copy`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Module')

eYo.provide('Module.copy__module', new eYo.Module.Dflt('copy__module', 'https://docs.python.org/3.6/library/copy.html'))

;(function () {

  /* Singleton constructor */
  var Item = function (model) {
    eYo.Module.Item.call(this, model)
  }
  goog.inherits(Item, eYo.Module.Item)

  /**
  * module
  */
  Item.prototype.module = eYo.Module.copy__module

  Object.defineProperties(Item.prototype, {
    url: {
      get() {
        return this.href
          ? this.module.url + this.href
          : this.module.url
      }
    }
  })

eYo.Module.copy__module.data_ = {
  categories: [
    'module-copy'
  ],
  types: [
    'function',
    'exception'
  ],
  items: [
    new Item({
      name: 'copy',
      class: 'copy',
      category: 0,
      type_: 0,
      href: '#copy.copy',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'deepcopy',
      class: 'copy',
      category: 0,
      type_: 0,
      href: '#copy.deepcopy',
      ary: 2,
      mandatory: 1,
      arguments: [
        {
          name: 'x'
        },
        {
          name: 'memo',
          optional: true
        }
      ]
    }),
    new Item({
      name: 'error',
      class: 'copy',
      category: 0,
      type_: 1,
      href: '#copy.error',
      ary: 0
    })
  ],
  by_name: {
    'copy': 0,
    'deepcopy': 1,
    'error': 2
  },
  by_category: {
    0: [0, 1, 2]
  },
  by_type: {
    0: [0, 1],
    1: [2]
  }
}


})()


// This file was generated by `python3 ./bin/helpers/modulebot.py copy` on 2019-12-12 18:44:20.271810

