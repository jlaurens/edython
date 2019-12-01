/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview copy model. Automatically generated by `python3 bin/helpers/modulebot.py copy`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Model')
goog.require('eYo.Model.Module')

goog.require('eYo.Model.Item')
goog.provide('eYo.Model.copy__module.Item')
goog.provide('eYo.Model.copy__module')

eYo.Model.copy__module = new eYo.Model.Module('copy__module', 'https://docs.python.org/3.6/library/copy.html')

/**
 * @constructor
 * @param {*} model
 */
eYo.Model.copy__module.Item = function (model) {
  eYo.Model.copy__module.Item.superClass_.constructor.call(this, model)
}

;(function () {

var Item = eYo.Model.copy__module.Item

goog.inherits(Item, eYo.Model.Item)

/**
 * module
 */
Item.prototype.module = eYo.Model.copy__module

Object.defineProperties(
  Item.prototype,
  {
    url: {
      get() {
        return this.href
          ? this.module.url + this.href
          : this.module.url
      }
    }
  }
)

eYo.Model.copy__module.setData({
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
})


})()


// This file was generated by `python3 ./bin/helpers/modulebot.py copy` on 2019-05-07 08:48:06.149996



eYo.Debug.test() // remove this line when finished
