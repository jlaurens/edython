/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.require('eYo')

goog.provide('eYo.DB')

/**
 * Database of all identified object.
 * @constructor
 */
eYo.DB = function() {
  this.byID_ = Object.create(null)
}

/**
 * Database of all identified boards.
 * @constructor
 */
eYo.DB.prototype.add = function(object) {
  this.byID_[object.id] = object
}


/**
 * Database of all identified boards.
 * @constructor
 */
eYo.DB.prototype.remove = function(object) {
  delete this.byID_[object.id]
}

/**
 * Find the object with the specified ID.
 * @param {string} id ID of object to find.
 * @return {eYo.Board} The sought after board or null if not found.
 */
eYo.DB.prototype.byId = function(id) {
  return this.byID_[id]
}
