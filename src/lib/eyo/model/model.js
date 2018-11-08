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

goog.require('eYo')

eYo.Model.Item = function (model) {
  goog.object.extend(this, model)
}

/**
 * Each item has a link to the model it belongs to.
 */
eYo.Model.Item.prototype.model = eYo.Model

/**
 * Other model data are more complex...
 */
eYo.Model.data = {
  types: [
    '.'
  ]
}

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
        return this.model.data.types[this.type_]
      }
    },
    ary: {
      get () {
        return this.arguments ? this.arguments.length : 0
      }
    }
  }
)

