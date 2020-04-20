/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Database of all identified object.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

/**
 * Database of all identified object.
 * @name {eYo.o3d.DB}
 * @constructor
 */
eYo.o3d.makeC9r('DB', {
  init () {
    this.byID_ = new Map()
  }
})

eYo.o3d.DB.eyo.finalizeC9r()

/**
 * Add objects to the database.
 * @param {eYo.c9r.BaseC9r} ...$
 */
eYo.o3d.DB_p.add = function(...$) {
  $.forEach(object => {
    this.byID_.set(object.id, object)
  })
}

/**
 * Remove objects from the database.
 * @param {String} ...$
 */
eYo.o3d.DB_p.remove = function(...$) {
  $.forEach(object => {
    this.byID_.delete(object.id)
  })
}

/**
 * Find the object with the specified ID.
 * @param {string} id ID of object to find.
 * @return {eYo.c9r.BaseC9r} The sought after board or null if not found.
 */
eYo.o3d.DB_p.byId = function(id) {
  return this.byID_[id]
}

/**
 * Find the object with the specified ID.
 * @param {string} id ID of object to find.
 * @return {eYo.c9r.BaseC9r} The sought after board or null if not found.
 */
eYo.o3d.DB_p.forEach = function(f) {
  for (let value of this.byID_.values()) {
    f(value)
  }
}
