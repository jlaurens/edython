/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview eYo.Model is a collection of models for modules.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Model')
goog.provide('eYo.Model.Item')
goog.provide('eYo.Model.Module')

goog.require('eYo.Protocol.Register')

/**
 * @constructor
 */
eYo.Model.Module = function (name, url) {
  Object.defineProperties(this,{
    name: {
      value: name
    },
    url: {
      value: url
    }
  })
  this.profiles = {}
  this.items_by_type = {}
}

/**
 * Set the data object and registers the given type.
 * @param {!String|Number} key  The key or index of the item
 * @return {?Object} return the model object for that item, if any.
 */
eYo.Model.Module.prototype.setData = function (data) {
  this.data = data
  var a = eYo.Model.Item.types = eYo.Model.Item.types.concat(data.types)
  for(var i=0; i<a.length; ++i) {
    for(var j=i+1; j<a.length; ++j) {
      if(a[i] === a[j]) {
        a.splice(j--, 1)
      }
    }
  }
}

/**
 * Get the item with the given key
 * @param {!String|Number} key  The key or index of the item
 * @return {?Object} return the model object for that item, if any.
 */
eYo.Model.Module.prototype.getItem = function (key) {
  if (!goog.isNumber(key)) {
    key = this.data.by_name[key]
  }
  if (goog.isNumber(key)) {
    return this.data.items[key]
  }
}

/**
 * Get the indices of the items for the given category
 * @param {!String} key  The name of the category
 * @return {!Array} the list of item indices with the given category (possibly void).
 */
eYo.Model.Module.prototype.getItemsInCategory = function (category, type) {
  var ra = this.data.by_category[category] || []
  if (goog.isString(type)) {
    type = this.data.type.indexOf(type)
  }
  if (goog.isNumber(type) && type >= 0) {
    var ra2 = []
    for (var i = 0; i < ra.length ; i++) {
      var item = this.getItem(i)
      if (item && item.type === type) {
        ra2.append(i)
      }
    }
    return ra2
  } else {
    return ra
  }
}

/**
 * Sends a message for each ordered item with the give type
 * @param {!String} key  The name of the category
 */
eYo.Model.Module.prototype.forEachItemWithType = function (type, handler) {
  if (goog.isString(type)) {
    var ra = this.items_by_type[type]
    if (!ra) {
      ra = this.items_by_type[type] = []
      for (var i = 0; i < this.data.items.length; i++) {
        var item = this.data.items[i]
        if (item.type === type) {
          ra.push(item)
        }
      }
    }
    ra.forEach(handler)
  }
}

/**
 * Item constuctor
 * @param {*} model 
 */
eYo.Model.Item = function (model) {
  var key
  for (key in model) {
    Object.defineProperty(
      this,
      key,
      {
        value: model[key]
      }
    )
  }
  // goog.object.extend(this, model)
}

// Each model loaded comes hear
eYo.Do.addProtocol(eYo.Model.Item, 'Register', 'module')

/**
 * Each item has a link to the model it belongs to.
 */
eYo.Model.Item.prototype.module = new eYo.Model.Module()

Object.defineProperties(eYo.Model.Item.prototype, {
  isMethod: {
    get () {
      return this.type === eYo.Key.METHOD
    }
  },
  isFunction: {
    get () {
      return this.type === eYo.Key.FUNCTION
    }
  },
  model: {
    get() {
      throw 'RENAMED property: model -> module'
    }
  }
})
/**
 * Other model data are more complex...
 * Is it used ?
 */
eYo.Model.Item.data = {
  types: [
    '.'
  ]
}

/**
 * Collect here all the types
 */
eYo.Model.Item.types = []

/**
 * Each item has a type_ and a type property.
 * The former is overriden by the model given at creation time.
 */
eYo.Model.Item.prototype.type_ = 0

Object.defineProperties(
  eYo.Model.Item.prototype,
  {
    type: {
      get () {
        return this.module.data.types[this.type_]
      }
    },
    kwargs: { // only those arguments with a `default` key
      get () {
        if (!this.kwargs_) {
          this.kwargs_ = []
          this.arguments && this.arguments.forEach((arg) => {
            if (goog.isDef(arg.default)) {
              this.kwargs_.push(arg)
            }
          })
        }
        return this.kwargs_
      }
    }
  }
)
