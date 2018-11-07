/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Objet for size and location.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Unit')
goog.provide('eYo.Geometry')
goog.provide('eYo.Where')
goog.provide('eYo.Size')

goog.require('eYo.Font')

/**
 * unit
 */

Object.defineProperties(
  eYo.Unit,
  {
    x: {
      get () {
        return eYo.Font.space
      }
    },
    y: {
      get () {
        return eYo.Font.lineHeight
      }
    }
  }
)

var get_c = function () {
  return this.c_
}
var set_c = function (newValue) {
  this.c_ = newValue
}
var get_l = function () {
  return this.l_
}
var set_l = function (newValue) {
  this.l_ = newValue
}
var get_x = function () {
  return this.c * eYo.Unit.x
}
var set_x = function (newValue) {
  this.c = Math.round(newValue / eYo.Unit.x)
}
var get_y = function () {
  return this.l * eYo.Unit.y
}
var set_y = function (newValue) {
  this.l = Math.round(newValue / eYo.Unit.y)
}

/**
 * `Where` is a descendant of `goog.math.Coordinate` that stores its data in text units.
 */
eYo.Where = function(c, l) {
  this.set(c, l)
}

goog.inherits(eYo.Where, goog.math.Coordinate)

Object.defineProperties(
  eYo.Where.prototype,
  {
    c: {
      get: get_c,
      set: set_c
    },
    l: {
      get: get_l,
      set: set_l
    },
    w: {
      get: get_c,
      set: set_c
    },
    h: {
      get: get_l,
      set: set_l
    },
    x: {
      get: get_x,
      set: set_x
    },
    y: {
      get: get_y,
      set: set_y
    }
  }
)

/**
 * Like `advance` but sets the coordinates, instead of advancing them.
 */
eYo.Where.prototype.set = function (c = 0, l = 0) {
  if (goog.isDef(c.c) && goog.isDef(c.l)) {
    c = c.c || 0
    l = c.l || 0
  } else if (goog.isDef(c.w) && goog.isDef(c.h)) {
    c = c.w || 0
    l = c.h || 0
  } else if (goog.isDef(c.x) && goog.isDef(c.y)) {
    this.x = c.x
    this.y = c.y
    return
  }
  this.c_ = c
  this.l_ = l
}

/**
 * Sets from the given size.
 * @param {Object!} s  Object with `w` and `h` number properties.
 */
eYo.Where.prototype.setFromSize = function (s) {
   this.set(s.w, s.h - 1)
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 */
eYo.Where.prototype.advance = function (c = 0, l = 0) {
  if (goog.isDef(c.c) && goog.isDef(c.l)) {
    c = c.c || 0
    l = c.l || 0
  } else if (goog.isDef(c.w) && goog.isDef(c.h)) {
    c = c.w || 0
    l = c.h || 0
  } else if (goog.isDef(c.x) && goog.isDef(c.y)) {
    this.x += c.x
    this.y += c.y
    return
  }
  this.c_ += c
  this.l_ += l
}

/**
 * `Size` is a descendant of `goog.math.Size` that stores its data in text units.
 */
eYo.Size = function (w, h) {
  this.set(w, h)
}

goog.inherits(eYo.Size, goog.math.Size)

Object.defineProperties(
  eYo.Size.prototype,
  {
    width: {
      get () {
        return this.c_ * eYo.Unit.x
      },
      set (newValue) {
        this.c_ = Math.round(newValue / eYo.Unit.x)
      }
    },
    height: {
      get () {
        return this.l_ * eYo.Unit.y
      },
      set (newValue) {
        this.l_ = Math.round(newValue / eYo.Unit.y)
      }
    },
    c: {
      get: get_c,
      set: set_c
    },
    l: {
      get: get_l,
      set: set_l
    },
    w: {
      get: get_c,
      set: set_c
    },
    h: {
      get: get_l,
      set: set_l
    },
    x: {
      get: get_x,
      set: set_x
    },
    y: {
      get: get_y,
      set: set_y
    },
    dx: {
      get: get_x,
      set: set_x
    },
    dy: {
      get: get_y,
      set: set_y
    }
  }
)

/**
 * set the `Size`.
 */
eYo.Size.prototype.set = function (c = 0, l = 0) {
  if (goog.isDef(c.c) && goog.isDef(c.l)) {
    c = c.c || 0
    l = c.l || 0
  } else if (goog.isDef(c.x) && goog.isDef(c.y)) {
    this.x = c.x
    this.y = c.y
    return
  }
  this.c_ = c
  this.l_ = l
}

/**
 * Sets from the given location (`Where`).
 * @param {Object!} w  Object with `c` and `l` number properties.
 */
eYo.Size.prototype.setFromWhere = function (w) {
  this.set(w.c, w.l + 1)
}
