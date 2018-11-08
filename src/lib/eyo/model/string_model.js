/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview string model. Automatically generated by `python3 bin/helpers/modulebot.py string`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Model.string__module')
goog.provide('eYo.Model.string__module.Item')

goog.require('eYo.Model')
goog.require('eYo.Model.Item')

/**
 * @constructor
 * @param {*} model 
 */
eYo.Model.string__module.Item = function (model) {
  eYo.Model.string__module.Item.superClass_.constructor.call(this, model)
}

var Item = eYo.Model.string__module.Item

goog.inherits(Item, eYo.Model.Item)

/**
 * model
 */
Item.prototype.model = eYo.Model.string__module


eYo.Model.string__module.data = {
  categories: [
    'string-constants',
    'custom-string-formatting',
    'template-strings',
    'helper-functions'
  ],
  types: [
    'data',
    'class',
    'method',
    'attribute',
    'function'
  ],
  items: [
    new Item({
      name: 'ascii_letters',
      class: 'string',
      category: 0,
      type_: 0
    }),
    new Item({
      name: 'ascii_lowercase',
      class: 'string',
      category: 0,
      type_: 0
    }),
    new Item({
      name: 'ascii_uppercase',
      class: 'string',
      category: 0,
      type_: 0
    }),
    new Item({
      name: 'digits',
      class: 'string',
      category: 0,
      type_: 0
    }),
    new Item({
      name: 'hexdigits',
      class: 'string',
      category: 0,
      type_: 0
    }),
    new Item({
      name: 'octdigits',
      class: 'string',
      category: 0,
      type_: 0
    }),
    new Item({
      name: 'punctuation',
      class: 'string',
      category: 0,
      type_: 0
    }),
    new Item({
      name: 'printable',
      class: 'string',
      category: 0,
      type_: 0
    }),
    new Item({
      name: 'whitespace',
      class: 'string',
      category: 0,
      type_: 0
    }),
    new Item({
      name: 'Formatter',
      class: 'string',
      category: 1,
      type_: 1
    }),
    new Item({
      name: 'format',
      class: 'string.Formatter',
      category: 1,
      type_: 2,
      stmt: true,
      mandatory: 3,
      arguments: [
        {
          name: 'format_string'
        },
        {
          name: '*args'
        },
        {
          name: '**kwargs'
        }
      ]
    }),
    new Item({
      name: 'vformat',
      class: 'string.Formatter',
      category: 1,
      type_: 2,
      stmt: true,
      arguments: [
        {
          name: 'format_string'
        },
        {
          name: 'args'
        },
        {
          name: 'kwargs'
        }
      ]
    }),
    new Item({
      name: 'parse',
      class: 'string.Formatter',
      category: 1,
      type_: 2,
      arguments: [
        {
          name: 'format_string'
        }
      ]
    }),
    new Item({
      name: 'get_field',
      class: 'string.Formatter',
      category: 1,
      type_: 2,
      arguments: [
        {
          name: 'field_name'
        },
        {
          name: 'args'
        },
        {
          name: 'kwargs'
        }
      ]
    }),
    new Item({
      name: 'get_value',
      class: 'string.Formatter',
      category: 1,
      type_: 2,
      arguments: [
        {
          name: 'key'
        },
        {
          name: 'args'
        },
        {
          name: 'kwargs'
        }
      ]
    }),
    new Item({
      name: 'check_unused_args',
      class: 'string.Formatter',
      category: 1,
      type_: 2,
      stmt: true,
      arguments: [
        {
          name: 'used_args'
        },
        {
          name: 'args'
        },
        {
          name: 'kwargs'
        }
      ]
    }),
    new Item({
      name: 'format_field',
      class: 'string.Formatter',
      category: 1,
      type_: 2,
      stmt: true,
      arguments: [
        {
          name: 'value'
        },
        {
          name: 'format_spec'
        }
      ]
    }),
    new Item({
      name: 'convert_field',
      class: 'string.Formatter',
      category: 1,
      type_: 2,
      arguments: [
        {
          name: 'value'
        },
        {
          name: 'conversion'
        }
      ]
    }),
    new Item({
      name: 'Template',
      class: 'string',
      category: 2,
      type_: 1,
      arguments: [
        {
          name: 'template'
        }
      ]
    }),
    new Item({
      name: 'substitute',
      class: 'string.Template',
      category: 2,
      type_: 2,
      mandatory: 2,
      arguments: [
        {
          name: 'mapping'
        },
        {
          name: '**kwds'
        }
      ]
    }),
    new Item({
      name: 'safe_substitute',
      class: 'string.Template',
      category: 2,
      type_: 2,
      stmt: true,
      mandatory: 2,
      arguments: [
        {
          name: 'mapping'
        },
        {
          name: '**kwds'
        }
      ]
    }),
    new Item({
      name: 'template',
      class: 'string.Template',
      category: 2,
      type_: 3
    }),
    new Item({
      name: 'capwords',
      class: 'string',
      category: 3,
      type_: 4,
      stmt: true,
      mandatory: 1,
      arguments: [
        {
          name: 's'
        },
        {
          name: 'sep',
          default: 'None'
        }
      ]
    })
  ],
  by_name: {
    'ascii_letters': 0,
    'ascii_lowercase': 1,
    'ascii_uppercase': 2,
    'digits': 3,
    'hexdigits': 4,
    'octdigits': 5,
    'punctuation': 6,
    'printable': 7,
    'whitespace': 8,
    'Formatter': 9,
    'format': 10,
    'vformat': 11,
    'parse': 12,
    'get_field': 13,
    'get_value': 14,
    'check_unused_args': 15,
    'format_field': 16,
    'convert_field': 17,
    'Template': 18,
    'substitute': 19,
    'safe_substitute': 20,
    'template': 21,
    'capwords': 22
  },
  by_category: {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    1: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    2: [18, 19, 20, 21],
    3: [22]
  },
  by_type: {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    1: [9, 18],
    2: [10, 11, 12, 13, 14, 15, 16, 17, 19, 20],
    3: [21],
    4: [22]
  }
}
/**
 * Get the item with the given key
 * @param {!String|Number} key  The key or index of the item
 * @return {?Object} return the model object for that item, if any.
 */
eYo.Model.string__module.getItem = function (key) {
  if (!goog.isNumber(key)) {
    key = eYo.Model.string__module.data.by_name[key]
  }
  if (goog.isNumber(key)) {
    return eYo.Model.string__module.data.items[key]
  }
}

/**
 * Get the type of the given item.
 * @param {!Object} item.
 * @return {?String} return the type.
 */
eYo.Model.string__module.getType = function (item) {
  return item && item.type && eYo.Model.string__module.data.types[item.type]
}

/**
 * Get the indices of the items for the given category
 * @param {!String} key  The name of the category
 * @return {!Array} the list of item indices with the given category (possibly void).
 */
eYo.Model.string__module.getItemsInCategory = function (category, type) {
  var ra = eYo.Model.string__module.data.by_category[category] || []
  if (goog.isString(type)) {
    type = eYo.Model.string__module.data.type.indexOf(type)
  }
  if (goog.isNumber(type) && type >= 0) {
    var ra2 = []
    for (var i = 0; i < ra.length ; i++ ) {
      var item = eYo.Model.string__module.getItem(i)
      if (item && item.type === type) {
        ra2.append(i)
      }
    }
    return ra2
  } else {
    return ra
  }
}

// This file was generated by `python3 ./bin/helpers/modulebot.py string` on 2018-11-08 21:44:04.163296


