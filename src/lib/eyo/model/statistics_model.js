/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview statistics model. Automatically generated by `python3 bin/helpers/modulebot.py statistics`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Model.statistics__module')
goog.provide('eYo.Model.statistics__module.Item')

goog.require('eYo.Model')
goog.require('eYo.Model.Module')
goog.require('eYo.Model.Item')

eYo.Model.statistics__module = new eYo.Model.Module('statistics__module', 'https://docs.python.org/3.6/library/statistics.html')

/**
 * @constructor
 * @param {*} model 
 */
eYo.Model.statistics__module.Item = function (model) {
  eYo.Model.statistics__module.Item.superClass_.constructor.call(this, model)
}

var doit = (() => {

var Item = eYo.Model.statistics__module.Item

goog.inherits(Item, eYo.Model.Item)

/**
 * module
 */
Item.prototype.module = eYo.Model.statistics__module

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

eYo.Model.statistics__module.setData({
  categories: [
    'function-details',
    'exceptions'
  ],
  types: [
    'function',
    'exception'
  ],
  items: [
    new Item({
      name: 'StatisticsError',
      class: 'statistics',
      category: 1,
      type_: 1,
      href: '#statistics.StatisticsError',
      ary: 0
    }),
    new Item({
      name: 'harmonic_mean',
      class: 'statistics',
      category: 0,
      type_: 0,
      href: '#statistics.harmonic_mean',
      ary: 1,
      arguments: [
        {
          name: 'data'
        }
      ]
    }),
    new Item({
      name: 'mean',
      class: 'statistics',
      category: 0,
      type_: 0,
      href: '#statistics.mean',
      ary: 1,
      arguments: [
        {
          name: 'data'
        }
      ]
    }),
    new Item({
      name: 'median',
      class: 'statistics',
      category: 0,
      type_: 0,
      href: '#statistics.median',
      ary: 1,
      arguments: [
        {
          name: 'data'
        }
      ]
    }),
    new Item({
      name: 'median_grouped',
      class: 'statistics',
      category: 0,
      type_: 0,
      href: '#statistics.median_grouped',
      ary: 2,
      mandatory: 1,
      arguments: [
        {
          name: 'data'
        },
        {
          name: 'interval',
          default: 1
        }
      ]
    }),
    new Item({
      name: 'median_high',
      class: 'statistics',
      category: 0,
      type_: 0,
      href: '#statistics.median_high',
      ary: 1,
      arguments: [
        {
          name: 'data'
        }
      ]
    }),
    new Item({
      name: 'median_low',
      class: 'statistics',
      category: 0,
      type_: 0,
      href: '#statistics.median_low',
      ary: 1,
      arguments: [
        {
          name: 'data'
        }
      ]
    }),
    new Item({
      name: 'mode',
      class: 'statistics',
      category: 0,
      type_: 0,
      href: '#statistics.mode',
      ary: 1,
      arguments: [
        {
          name: 'data'
        }
      ]
    }),
    new Item({
      name: 'pstdev',
      class: 'statistics',
      category: 0,
      type_: 0,
      href: '#statistics.pstdev',
      ary: 2,
      mandatory: 1,
      arguments: [
        {
          name: 'data'
        },
        {
          name: 'mu',
          default: 'None'
        }
      ]
    }),
    new Item({
      name: 'pvariance',
      class: 'statistics',
      category: 0,
      type_: 0,
      href: '#statistics.pvariance',
      ary: 2,
      mandatory: 1,
      arguments: [
        {
          name: 'data'
        },
        {
          name: 'mu',
          default: 'None'
        }
      ]
    }),
    new Item({
      name: 'stdev',
      class: 'statistics',
      category: 0,
      type_: 0,
      href: '#statistics.stdev',
      ary: 2,
      mandatory: 1,
      arguments: [
        {
          name: 'data'
        },
        {
          name: 'xbar',
          default: 'None'
        }
      ]
    }),
    new Item({
      name: 'variance',
      class: 'statistics',
      category: 0,
      type_: 0,
      href: '#statistics.variance',
      ary: 2,
      mandatory: 1,
      arguments: [
        {
          name: 'data'
        },
        {
          name: 'xbar',
          default: 'None'
        }
      ]
    })
  ],
  by_name: {
    'StatisticsError': 0,
    'harmonic_mean': 1,
    'mean': 2,
    'median': 3,
    'median_grouped': 4,
    'median_high': 5,
    'median_low': 6,
    'mode': 7,
    'pstdev': 8,
    'pvariance': 9,
    'stdev': 10,
    'variance': 11
  },
  by_category: {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    1: [0]
  },
  by_type: {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    1: [0]
  }
})


})()


// This file was generated by `python3 ./bin/helpers/modulebot.py statistics` on 2019-03-07 12:16:48.226015


