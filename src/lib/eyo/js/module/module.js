/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.module is a collection of models for modules.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name {eYo.module}
 * @namespace
 */
eYo.o3d.newNS(eYo, 'module')

/**
 * @name {eYo.module.C3sBase}
 * @param {String} name - the name of this constructor
 * @param {String} url - the url of the module (in the python documentation)
 * @constructor
 */
eYo.module.makeC3sBase({
  init(name, url) {
    this.name_ = name
    this.url_ = url
  },
  properties: {
    value: eYo.NA,
    url: eYo.NA,
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
       * @param {Object} after - The data object after the change
       */
      didChange (after) /** @suppress {globalThis} */ {
        after.forEach(x => eYo.module.item_types.add(x))
      }
    },
  }
})

/**
 * Item constuctor.
 * This must not inherit from `eYo.module.C3sBase` but from `eYo.o4t.C3sBase`. 
 * @name{eYo.module.Item}
 * @param {Object} item_model
 */
eYo.o4t.newC3s(eYo.module, 'Item', {
  init (owner, item_model) {
    Object.keys(item_model).forEach(key => {
      Object.defineProperty(
        this,
        key,
        {
          value: item_model[key]
        }
      )
    })
  },
  properties: {
    isMethod: {
      get () {
        return this.type === eYo.key.METHOD
      },
    },
    isFunction: {
      get () {
        return this.type === eYo.key.FUNCTION
      },
    },
    isClass: {
      get () {
        return this.type === eYo.key.CLASS
      },
    },
    model: {
      get () {
        throw 'RENAMED property: model -> module'
      },
    },
    ary_max: {
      get () {
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
    },
    mandatory_min: {
      get () {
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
      },
    },
    /**
     * Each item has a type_ and a type property.
     * The former is overriden by the model given at creation time.
     */
    type: {
      get () {
        return this.module.data.types[this.type_]
      },
    },
    kwargs: {
      lazy () {
        // only those arguments with a `default` key
        this.kwargs_ = []
        this.arguments && (this.arguments.forEach((arg) => {
          if (eYo.isDef(arg.default)) {
            this.kwargs_.push(arg)
          }
        }))
      },
    },
  },
})

eYo.module.Item || eYo.throw('MISSING eYo.module.Item')

eYo.module._p.makeNewItem = function () {
  this === eYo.module && eYo.throw('Only derived modules can make Items')
  var Item = this.newC3s('Item', this.Item, {
    properties: {
      url: eYo.descriptorR({$ () {
        return this.href
          ? this.owner_.URL + this.href
          : this.owner_.URL
      }}.$),
    },
  })
  this.makeNewItem = function () {
    return this.newItem
  }
  return this.newItem = (self => function (model) {
    return new Item(self, model)
  })(this)
}

/**
 * Get the item with the given key
 * @param {String|Number} key  The key or index of the item
 * @return {?Object} return the model object for that item, if any.
 */
eYo.module.C3sBase_p.getItem = function (key) {
  if (!eYo.isNum(key)) {
    key = this.data.by_name[key]
  }
  if (eYo.isNum(key)) {
    return this.data.items[key]
  }
}

/**
 * Get the indices of the items for the given category
 * @param {String} key  The name of the category
 * @return {!Array} the list of item indices with the given category (possibly void).
 */
eYo.module.C3sBase_p.getItemsInCategory = function (category, type) {
  var ra = this.data.by_category[category] || []
  if (eYo.isStr(type)) {
    type = this.data.type.indexOf(type)
  }
  if (eYo.isNum(type) && type >= 0) {
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
 * Sends a message for each ordered item with the given type
 * @param {String} key  The name of the category
 */
eYo.module.C3sBase_p.forEachItemWithType = function (type, handler) {
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
eYo.register.add(eYo.module, 'module')

/**
 * Each item has a link to the module it belongs to.
 */
eYo.module.Item_p.module = eYo.module.new(eYo.module)

/**
 * Collect here all the types
 * @type {Array<String>}
 */
eYo.module._p.item_types = new Set()
