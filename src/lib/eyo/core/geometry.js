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
  return this.l * eYo.Font.lineHeight
}
var set_y = function (newValue) {
  this.l = Math.round(newValue / eYo.Font.lineHeight)
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
  this.set(w, h)
}

goog.inherits(eYo.Size, goog.math.Size)

eYo.Size.prototype.set = function (c, l) {
  if (goog.isDef(c)) {
    if (goog.isDef(c.c) && goog.isDef(c.l)) {
      c = c.c || 0
      l = c.l || 0
    } else if (goog.isDef(c.x) && goog.isDef(c.y)) {
      this.x = c.x
      this.y = c.y
      return
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
