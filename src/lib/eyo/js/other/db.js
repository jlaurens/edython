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

/**
 * Database of all identified object.
 * @name {eYo.c9r.DB}
 * @constructor
 */
eYo.c9r.makeC9r('DB', {
  init () {
    this.byID_ = Object.create(null)
  }
})

/**
 * Database of all identified boards.
 * @constructor
 */
eYo.c9r.DB_p.add = function(object) {
  this.byID_[object.id] = object
}

/**
 * Database of all identified boards.
 * @constructor
 */
eYo.c9r.DB_p.remove = function(object) {
  delete this.byID_[object.id]
}

/**
 * Find the object with the specified ID.
 * @param {string} id ID of object to find.
 * @return {eYo.board} The sought after board or null if not found.
 */
eYo.c9r.DB_p.byId = function(id) {
  return this.byID_[id]
}
