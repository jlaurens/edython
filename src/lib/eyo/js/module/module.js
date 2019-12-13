/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.Module is a collection of models for modules.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name {eYo.Module}
 * @namespace
 */
eYo.makeNS('Module')

/**
 * @name {eYo.Module.Dflt}
 * @param {String} name - the name of this constructor
 * @param {String} url - the url of the module (in the python documentation)
 * @constructor
 */
eYo.Dflt.makeSubclass(eYo.Module, {
  init(name, url) {
    this.name_ = name
    this.url_ = url
  },
  linked: {
    value: {},
    url: {},
    profiles () {
      return Object.create(null)
    },
    items_by_type () {
      return Object.create(null)
    },
    data: {
      value: ['.'],
      /**
       * Registers the types in the given object.
       * @param {Object} before - The data object before the change
       * @param {Object} after - The data object after the change
       */
      didChange (before, after) {
        var a = eYo.Module.item_types = eYo.Module.item_types.concat(after.types)
        // remove duplicates
        for(var i=0; i<a.length; ++i) {
          for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j]) {
              a.splice(j--, 1)
            }
          }
        }      
      }
    },
  }
})

/**
 * Item constuctor
 * @name{eYo.Module.Item}
 * @param {*} instance_model
 */
eYo.Module.makeClass('Item', {
  init (model) {
    for (var key in model) {
      Object.defineProperty(
        this,
        key,
        {
          value: model[key]
        }
      )
    }
  },
  computed: {
    isMethod () {
      return this.type === eYo.Key.METHOD
    },
    isFunction () {
      return this.type === eYo.Key.FUNCTION
    },
    isClass () {
      return this.type === eYo.Key.CLASS
    },
    model () {
      throw 'RENAMED property: model -> module'
    },
    ary_max () {
      var ary = eYo.isNA(this.ary)
        ? Infinity
        : this.ary
      this.signatures && (this.signatures.forEach((signature) => {
        if (ary < signature.ary) {
          ary = signature.ary
        }
      }))
      return ary
    },
    mandatory_min () {
      var mandatory = eYo.isNA(this.mandatory)
        ? this.ary || 0
        : this.mandatory
      this.signatures && (this.signatures.forEach((signature) => {
        var candidate = eYo.isNA(signature.mandatory)
          ? signature.ary
          : signature.mandatory
        if (mandatory > candidate) {
          mandatory = candidate
        }
      }))
      return mandatory
    }
  }
})

eYo.assert(eYo.Module.Item, 'FAILED')

/**
 * Get the item with the given key
 * @param {String|Number} key  The key or index of the item
 * @return {?Object} return the model object for that item, if any.
 */
eYo.Module.Dflt.prototype.getItem = function (key) {
  if (!goog.isNumber(key)) {
    key = this.data.by_name[key]
  }
  if (goog.isNumber(key)) {
    return this.data.items[key]
  }
}

/**
 * Get the indices of the items for the given category
 * @param {String} key  The name of the category
 * @return {!Array} the list of item indices with the given category (possibly void).
 */
eYo.Module.Dflt.prototype.getItemsInCategory = function (category, type) {
  var ra = this.data.by_category[category] || []
  if (eYo.isStr(type)) {
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
 * @param {String} key  The name of the category
 */
eYo.Module.Dflt.prototype.forEachItemWithType = function (type, handler) {
  if (eYo.isStr(type)) {
    var ra = this.items_by_type[type]
    if (!ra) {
      ra = this.items_by_type[type] = []
      this.data.items.forEach(item => {
        if (item.type === type) { ra.push(item) }
      })
    }
    ra.forEach(handler)
  }
}

// Each model loaded comes here
eYo.Protocol.add(eYo.Module.Item, 'Register', 'module')

/**
 * Each item has a link to the module it belongs to.
 */
eYo.Module.Item.prototype.module = new eYo.Module.Dflt()

/**
 * Collect here all the types
 * @type {Array<String>}
 */
eYo.Module.item_types = []

/**
 * Each item has a type_ and a type property.
 * The former is overriden by the model given at creation time.
 */
eYo.Module.Item.prototype.type_ = 0

Object.defineProperties(
  eYo.Module.Item.prototype,
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
          this.arguments && (this.arguments.forEach((arg) => {
            if (goog.isDef(arg.default)) {
              this.kwargs_.push(arg)
            }
          }))
        }
        return this.kwargs_
      }
    }
  }
)
