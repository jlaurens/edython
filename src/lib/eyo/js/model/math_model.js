/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview math model. Automatically generated by `python3 bin/helpers/modulebot.py math`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Model')
goog.require('eYo.Model.Module')

goog.require('eYo.Model.Item')
goog.provide('eYo.Model.math__module.Item')
goog.provide('eYo.Model.math__module')

eYo.Model.math__module = new eYo.Model.Module('math__module', 'https://docs.python.org/3.6/library/math.html')

/**
 * @constructor
 * @param {*} model
 */
eYo.Model.math__module.Item = function (model) {
  eYo.Model.math__module.Item.superClass_.constructor.call(this, model)
}

;(function () {

var Item = eYo.Model.math__module.Item

goog.inherits(Item, eYo.Model.Item)

/**
 * module
 */
Item.prototype.module = eYo.Model.math__module

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

eYo.Model.math__module.setData({
  categories: [
    'number-theoretic-and-representation-functions',
    'power-and-logarithmic-functions',
    'trigonometric-functions',
    'angular-conversion',
    'hyperbolic-functions',
    'special-functions',
    'constants'
  ],
  types: [
    'function',
    'data'
  ],
  items: [
    new Item({
      name: 'acos',
      class: 'math',
      category: 2,
      type_: 0,
      href: '#math.acos',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'acosh',
      class: 'math',
      category: 4,
      type_: 0,
      href: '#math.acosh',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'asin',
      class: 'math',
      category: 2,
      type_: 0,
      href: '#math.asin',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'asinh',
      class: 'math',
      category: 4,
      type_: 0,
      href: '#math.asinh',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'atan',
      class: 'math',
      category: 2,
      type_: 0,
      href: '#math.atan',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'atan2',
      class: 'math',
      category: 2,
      type_: 0,
      href: '#math.atan2',
      ary: 2,
      arguments: [
        {
          name: 'y'
        },
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'atanh',
      class: 'math',
      category: 4,
      type_: 0,
      href: '#math.atanh',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'ceil',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.ceil',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'copysign',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.copysign',
      ary: 2,
      arguments: [
        {
          name: 'x'
        },
        {
          name: 'y'
        }
      ]
    }),
    new Item({
      name: 'cos',
      class: 'math',
      category: 2,
      type_: 0,
      href: '#math.cos',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'cosh',
      class: 'math',
      category: 4,
      type_: 0,
      href: '#math.cosh',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'degrees',
      class: 'math',
      category: 3,
      type_: 0,
      href: '#math.degrees',
      stmt: true,
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'e',
      class: 'math',
      category: 6,
      type_: 1,
      href: '#math.e',
      stmt: true,
      ary: 0
    }),
    new Item({
      name: 'erf',
      class: 'math',
      category: 5,
      type_: 0,
      href: '#math.erf',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'erfc',
      class: 'math',
      category: 5,
      type_: 0,
      href: '#math.erfc',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'exp',
      class: 'math',
      category: 1,
      type_: 0,
      href: '#math.exp',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'expm1',
      class: 'math',
      category: 1,
      type_: 0,
      href: '#math.expm1',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'fabs',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.fabs',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'factorial',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.factorial',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'floor',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.floor',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'fmod',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.fmod',
      ary: 2,
      arguments: [
        {
          name: 'x'
        },
        {
          name: 'y'
        }
      ]
    }),
    new Item({
      name: 'frexp',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.frexp',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'fsum',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.fsum',
      ary: 1,
      arguments: [
        {
          name: 'iterable'
        }
      ]
    }),
    new Item({
      name: 'gamma',
      class: 'math',
      category: 5,
      type_: 0,
      href: '#math.gamma',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'gcd',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.gcd',
      ary: 2,
      arguments: [
        {
          name: 'a'
        },
        {
          name: 'b'
        }
      ]
    }),
    new Item({
      name: 'hypot',
      class: 'math',
      category: 2,
      type_: 0,
      href: '#math.hypot',
      ary: 2,
      arguments: [
        {
          name: 'x'
        },
        {
          name: 'y'
        }
      ]
    }),
    new Item({
      name: 'inf',
      class: 'math',
      category: 6,
      type_: 1,
      href: '#math.inf',
      stmt: true,
      ary: 0
    }),
    new Item({
      name: 'isclose',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.isclose',
      ary: Infinity,
      mandatory: 2,
      arguments: [
        {
          name: 'a'
        },
        {
          name: 'b'
        },
        {
          name: '*',
          optional: true
        },
        {
          name: 'rel_tol',
          default: 1e-09
        },
        {
          name: 'abs_tol',
          default: 0.0
        }
      ]
    }),
    new Item({
      name: 'isfinite',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.isfinite',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'isinf',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.isinf',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'isnan',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.isnan',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'ldexp',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.ldexp',
      ary: 2,
      arguments: [
        {
          name: 'x'
        },
        {
          name: 'i'
        }
      ]
    }),
    new Item({
      name: 'lgamma',
      class: 'math',
      category: 5,
      type_: 0,
      href: '#math.lgamma',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'log',
      class: 'math',
      category: 1,
      type_: 0,
      href: '#math.log',
      ary: 2,
      mandatory: 1,
      arguments: [
        {
          name: 'x'
        },
        {
          name: 'base',
          optional: true
        }
      ]
    }),
    new Item({
      name: 'log10',
      class: 'math',
      category: 1,
      type_: 0,
      href: '#math.log10',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'log1p',
      class: 'math',
      category: 1,
      type_: 0,
      href: '#math.log1p',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'log2',
      class: 'math',
      category: 1,
      type_: 0,
      href: '#math.log2',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'modf',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.modf',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'nan',
      class: 'math',
      category: 6,
      type_: 1,
      href: '#math.nan',
      stmt: true,
      ary: 0
    }),
    new Item({
      name: 'pi',
      class: 'math',
      category: 6,
      type_: 1,
      href: '#math.pi',
      stmt: true,
      ary: 0
    }),
    new Item({
      name: 'pow',
      class: 'math',
      category: 1,
      type_: 0,
      href: '#math.pow',
      ary: 2,
      arguments: [
        {
          name: 'x'
        },
        {
          name: 'y'
        }
      ]
    }),
    new Item({
      name: 'radians',
      class: 'math',
      category: 3,
      type_: 0,
      href: '#math.radians',
      stmt: true,
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'sin',
      class: 'math',
      category: 2,
      type_: 0,
      href: '#math.sin',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'sinh',
      class: 'math',
      category: 4,
      type_: 0,
      href: '#math.sinh',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'sqrt',
      class: 'math',
      category: 1,
      type_: 0,
      href: '#math.sqrt',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'tan',
      class: 'math',
      category: 2,
      type_: 0,
      href: '#math.tan',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'tanh',
      class: 'math',
      category: 4,
      type_: 0,
      href: '#math.tanh',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    }),
    new Item({
      name: 'tau',
      class: 'math',
      category: 6,
      type_: 1,
      href: '#math.tau',
      stmt: true,
      ary: 0
    }),
    new Item({
      name: 'trunc',
      class: 'math',
      category: 0,
      type_: 0,
      href: '#math.trunc',
      ary: 1,
      arguments: [
        {
          name: 'x'
        }
      ]
    })
  ],
  by_name: {
    'acos': 0,
    'acosh': 1,
    'asin': 2,
    'asinh': 3,
    'atan': 4,
    'atan2': 5,
    'atanh': 6,
    'ceil': 7,
    'copysign': 8,
    'cos': 9,
    'cosh': 10,
    'degrees': 11,
    'e': 12,
    'erf': 13,
    'erfc': 14,
    'exp': 15,
    'expm1': 16,
    'fabs': 17,
    'factorial': 18,
    'floor': 19,
    'fmod': 20,
    'frexp': 21,
    'fsum': 22,
    'gamma': 23,
    'gcd': 24,
    'hypot': 25,
    'inf': 26,
    'isclose': 27,
    'isfinite': 28,
    'isinf': 29,
    'isnan': 30,
    'ldexp': 31,
    'lgamma': 32,
    'log': 33,
    'log10': 34,
    'log1p': 35,
    'log2': 36,
    'modf': 37,
    'nan': 38,
    'pi': 39,
    'pow': 40,
    'radians': 41,
    'sin': 42,
    'sinh': 43,
    'sqrt': 44,
    'tan': 45,
    'tanh': 46,
    'tau': 47,
    'trunc': 48
  },
  by_category: {
    0: [7, 8, 17, 18, 19, 20, 21, 22, 24, 27, 28, 29, 30, 31, 37, 48],
    1: [15, 16, 33, 34, 35, 36, 40, 44],
    2: [0, 2, 4, 5, 9, 25, 42, 45],
    3: [11, 41],
    4: [1, 3, 6, 10, 43, 46],
    5: [13, 14, 23, 32],
    6: [12, 26, 38, 39, 47]
  },
  by_type: {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 45, 46, 48],
    1: [12, 26, 38, 39, 47]
  }
})


})()


// This file was generated by `python3 ./bin/helpers/modulebot.py math` on 2019-05-07 08:48:05.542002



eYo.Debug.test() // remove this line when finished
