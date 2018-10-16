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

goog.provide('eYo.Where')
goog.provide('eYo.Size')

goog.require('eYo.Font')

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
  return this.c * eYo.Font.space
}
var set_x = function (newValue) {
  this.c = Math.round(newValue / eYo.Font.space)
}
var get_y = function () {
  return this.c * eYo.Font.lineHeight
}
var set_y = function (newValue) {
  this.c = Math.round(newValue / eYo.Font.lineHeight)
}
var get_c = function () {
  return this.c_
}
var set_dc = function (newValue) {
  this.dc_ = newValue
}
var get_dl = function () {
  return this.dl_
}
var set_dl = function (newValue) {
  this.dl_ = newValue
}
var get_dx = function () {
  return this.dc * eYo.Font.space
}
var set_dx = function (newValue) {
  this.dc = Math.round(newValue / eYo.Font.space)
}
var get_dy = function () {
  return this.dc * eYo.Font.lineHeight
}
var set_dy = function (newValue) {
  this.dc = Math.round(newValue / eYo.Font.lineHeight)
}

/**
 * An object to manage location both in `(c, l)` and `(x, y)` coordinates.
 * `x` and `y` are in workspace unit whereas `c` and `l` are in text unit,
 * which means the font space character width for the horizontal unit
 * and the line height for the verticale unit.
 * `w` is a synonym of `c`, `h` is a synonym of `l`,
 * `dx` is a synonym of `x` and `dy` is a synonym of `y`.
 * Both are mean to model a size.
 * @param c  The column index, or an object with both a column and line index, in which case `l` parameter below is ignore.
 * @param l  The line index, when `c` parameter does not already contain a line index as an `l` property.
 */
eYo.CLXY = function (c, l) {
  this.set(c, l)
  Object.defineProperties(
    this,
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
}

/**
 * reset the coordinates to the origin
 */
eYo.CLXY.prototype.set_cl = eYo.CLXY.prototype.set_wh = function (c, l) {
  this.c_ = goog.isDef(c) ? goog.isDef(c.c) ? c.c : c || 0 : 0
  this.l_ = goog.isDef(c) ? goog.isDef(c.l) ? c.l : l || 0 : 0
}

/**
 * `Where` is a descendant of `goog.math.Coordinate` that stores its data in text units.
 */
eYo.Where = function(c, l) {
  Object.defineProperties(
    this,
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
  this.set_cl(c, l)
}

goog.inherits(eYo.Where, goog.math.Coordinate)

/**
 * Like `advance_cl` but sets the coordinates, instead of advancing them.
 */
eYo.Where.prototype.set_cl = eYo.Where.prototype.set_wh = function (c, l) {
  if (goog.isDef(c)) {
    if (goog.isDef(c.c) && goog.isDef(c.l)) {
      c = c.c || 0
      l = c.l || 0
    } else {
      l || (l = 0)
    }
  } else {
    c = 0
    l || (l = 0)
  }
  this.c_ = c
  this.l_ = l
}

/**
 * Like `set_cl` but advance the coordinates, instead of setting them.
 */
eYo.Where.prototype.advance_cl = function (c, l) {
  if (goog.isDef(c)) {
    if (goog.isDef(c.c) && goog.isDef(c.l)) {
      c = c.c || 0
      l = c.l || 0
    } else {
      l || (l = 0)
    }
  } else {
    c = 0
    l || (l = 0)
  }
  this.c_ += c
  this.l_ += l
}

/**
 * `Size` is a descendant of `goog.math.Size` that stores its data in text units.
 */
eYo.Size = function (w, h) {
  Object.defineProperties(
    this,
    {
      width: {
        get () {
          return this.c_ * eYo.Font.space
        },
        set (newValue) {
          this.c_ = Math.round(newValue / eYo.Font.space)
        }
      },
      height: {
        get () {
          return this.l_ * eYo.Font.lineHeight
        },
        set (newValue) {
          this.l_ = Math.round(newValue / eYo.Font.lineHeight)
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
  this.set_wh(w, h)
}

goog.inherits(eYo.Size, goog.math.size)

eYo.Size.prototype.set_cl = eYo.Size.prototype.set_wh = eYo.Where.prototype.set_cl
