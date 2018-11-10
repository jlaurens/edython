/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Add methods to manage `item` objects. Used in models.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Protocol.Item')

goog.require('eYo.Protocol')

eYo.Protocol.Item = function (model) {
  var ans = {
    methods: {},
    properties: {}
  }
  /**
   * Get the item with the given key
   * @param {!String|Number} key  The key or index of the item
   * @return {?Object} return the model object for that item, if any.
   */
  ans.methods.getItem = function (key) {
    if (!goog.isNumber(key)) {
      key = model.data.by_name[key]
    }
    if (goog.isNumber(key)) {
      return model.data.items[key]
    }
  }
  /**
   * Get the type of the given item.
   * @param {!Object} item.
   * @return {?String} return the type.
   */
  ans.methods.getType = function (item) {
    return item && item.type && model.data.types[item.type]
  }
  /**
   * Get the indices of the items for the given category
   * @param {!String} key  The name of the category
   * @return {!Array} the list of item indices with the given category (possibly void).
   */
  ans.methods.getItemsInCategory = function (category, type) {
    var ra = model.data.by_category[category] || []
    if (goog.isString(type)) {
      type = model.data.type.indexOf(type)
    }
    if (goog.isNumber(type) && type >= 0) {
      var ra2 = []
      for (var i = 0; i < ra.length ; i++ ) {
        var item = model.getItem(i)
        if (item && item.type === type) {
          ra2.append(i)
        }
      }
      return ra2
    } else {
      return ra
    }
  }
  return ans
}
