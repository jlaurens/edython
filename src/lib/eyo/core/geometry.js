/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
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
goog.provide('eYo.Rect')
goog.provide('eYo.TRect')

goog.require('eYo')

goog.require('eYo.Do')

goog.require('goog.math')

goog.forwardDeclare('eYo.Font')

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
    },
    rem: {
      get () {
        return parseFloat(getComputedStyle(document.documentElement).fontSize)
      }
    }
  }
)
// x, y, with, height are in pixels
// c, l, w, h are in text units

/**
 * `Where` is a descendant of `goog.math.Coordinate` that stores its data in text units.
 */
eYo.Where = function(c, l) {
  this.set(c, l)
}

/**
 * Dispose of the receive resources.
 */
eYo.Where.prototype.dispose = eYo.Do.nothing

goog.inherits(eYo.Where, goog.math.Coordinate)

eYo.Where.get_c = function () {
  return this.c_
}
eYo.Where.set_c = function (newValue) {
  this.c_ = newValue
}
eYo.Where.get_l = function () {
  return this.l_
}
eYo.Where.set_l = function (newValue) {
  this.l_ = newValue
}
eYo.Where.get_x = function () {
  return this.c * eYo.Unit.x
}
eYo.Where.set_x = function (newValue) {
  this.c = Math.round(newValue / eYo.Unit.x)
}
eYo.Where.get_y = function () {
  return this.l * eYo.Unit.y
}
eYo.Where.set_y = function (newValue) {
  this.l = Math.round(newValue / eYo.Unit.y)
}
eYo.Where.get_width = function () {
  return this.w * eYo.Unit.x
}
eYo.Where.set_width = function (newValue) {
  this.w = Math.round(newValue / eYo.Unit.x)
}
eYo.Where.get_height = function () {
  return this.dl * eYo.Unit.y
}
eYo.Where.set_height = function (newValue) {
  this.h = Math.round(newValue / eYo.Unit.y)
}
eYo.Where.get_w = function () {
  return this.w_
}
eYo.Where.set_w = function (newValue) {
  this.w_ = newValue
}
eYo.Where.get_h = function () {
  return this.h_
}
eYo.Where.set_h = function (newValue) {
  this.h_ = newValue
}

Object.defineProperties(eYo.Where.prototype, {
  c: {
    get: eYo.Where.get_c,
    set: eYo.Where.set_c
  },
  l: {
    get: eYo.Where.get_l,
    set: eYo.Where.set_l
  },
  w: {
    get: eYo.Where.get_c,
    set: eYo.Where.set_c
  },
  h: {
    get: eYo.Where.get_l,
    set: eYo.Where.set_l
  },
  x: {
    get: eYo.Where.get_x,
    set: eYo.Where.set_x
  },
  y: {
    get: eYo.Where.get_y,
    set: eYo.Where.set_y
  }
})

/**
 * Like `advance` but sets the coordinates, instead of advancing them.
 */
eYo.Where.prototype.set = function (c = 0, l = 0) {
  if (goog.isDef(c.c) && goog.isDef(c.l)) {
    l = c.l || 0
    c = c.c || 0
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
 * @param {number} c
 * @param {number} l
 * @return {eYo.Where} c
 */
eYo.Where.prototype.advance = function (c = 0, l = 0) {
  if (goog.isDef(c.c) && goog.isDef(c.l)) {
    l = c.l || 0
    c = c.c || 0
  } else if (goog.isDef(c.w) && goog.isDef(c.h)) {
    c = c.w || 0
    l = c.h || 0
  } else if (goog.isDef(c.x) && goog.isDef(c.y)) {
    this.x += c.x
    this.y += c.y
    return this
  }
  this.c_ += c
  this.l_ += l
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number} c
 * @param {number} l
 * @return {eYo.Where} c
 */
eYo.Where.prototype.xyAdvance = function (x = 0, y = 0) {
  if (goog.isDef(x.x) && goog.isDef(x.y)) {
    y = x.x || 0
    x = x.y || 0
  } else if (goog.isDef(x.width) && goog.isDef(x.height)) {
    x = x.width || 0
    y = x.height || 0
  } else if (goog.isDef(x.c) && goog.isDef(x.l)) {
    this.c_ += x.c
    this.l_ += x.l
    return this
  }
  this.x += x
  this.y += y
  return this
}

/**
 * Euclidian distance between points.
 * @param {!eYo.Where} other
 * @return {number} non negative number
 */
eYo.Where.prototype.distanceFrom = function (other) {
  var dx = this.x_ - other.x_
  var dy = this.y_ - other.y_
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * `Size` is a descendant of `goog.math.Size` that stores its data in text units instead of workspace units.
 */
eYo.Size = function (w, h) {
  this.set(w, h)
}

goog.inherits(eYo.Size, goog.math.Size)

Object.defineProperties(eYo.Size.prototype, {
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
    get: eYo.Where.get_c,
    set: eYo.Where.set_c
  },
  l: {
    get: eYo.Where.get_l,
    set: eYo.Where.set_l
  },
  w: {
    get: eYo.Where.get_c,
    set: eYo.Where.set_c
  },
  h: {
    get: eYo.Where.get_l,
    set: eYo.Where.set_l
  },
  x: {
    get: eYo.Where.get_x,
    set: eYo.Where.set_x
  },
  y: {
    get: eYo.Where.get_y,
    set: eYo.Where.set_y
  },
  dx: {
    get: eYo.Where.get_x,
    set: eYo.Where.set_x
  },
  dy: {
    get: eYo.Where.get_y,
    set: eYo.Where.set_y
  }
})
/**
 * Dispose of the receiver's resources.
 */
eYo.Size.prototype.dispose = eYo.Do.nothing

/**
 * set the `Size`.
 */
eYo.Size.prototype.set = function (c = 0, l = 0) {
  if (goog.isDef(c.width) && goog.isDef(c.height)) {
    this.width = c.width
    this.height = c.height
    return
  } else if (goog.isDef(c.c) && goog.isDef(c.l)) {
    l = c.l || 0
    c = c.c || 0
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

/**
 * Sets from the given text.
 * @param {String!} s
 * @return {eYo.Size} the receiver.
 */
eYo.Size.prototype.setFromText = function (txt) {
  var lines = txt.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/)
  var c = 0
  lines.forEach(l => (c < l.length) && (c = l.length) )
  this.set(c, lines.length)
  return this
}

/**
 * Sets from the given text.
 * @param {String!} s
 */
eYo.Size.sizeOfText = function (txt) {
  return new eYo.Size().setFromText(txt)
}

/**
 * `Rect` is a descendant of `goog.math.Rect` that stores its data in text units.
 * Class for representing rectangular regions.
 * @param {number} c Left, in text units.
 * @param {number} l Top, in text units.
 * @param {number} w Width, in text units.
 * @param {number} h Height, in text units.
 * @struct
 * @constructor
 * @implements {goog.math.IRect}
 */
eYo.TRect = function(c, l, w, h) {
  this.set(c, l, w, h)
}

goog.inherits(eYo.TRect, goog.math.Rect)

Object.defineProperties(
  eYo.TRect.prototype,
  {
    c: {
      get: eYo.Where.get_c,
      set: eYo.Where.set_c
    },
    l: {
      get: eYo.Where.get_l,
      set: eYo.Where.set_l
    },
    w: {
      get: eYo.Where.get_w,
      set: eYo.Where.set_w
    },
    h: {
      get: eYo.Where.get_h,
      set: eYo.Where.set_h
    },
    left: {
      get: eYo.Where.get_x,
      set: eYo.Where.set_x
    },
    top: {
      get: eYo.Where.get_y,
      set: eYo.Where.set_y
    },
    width: {
      get: eYo.Where.get_width,
      set: eYo.Where.set_width
    },
    height: {
      get: eYo.Where.get_height,
      set: eYo.Where.set_height
    }
  }
)

/**
 * set the `Rect`.
 */
eYo.TRect.prototype.set = function (c = 0, l = 0, w = 0, h = 0) {
  if (goog.isDef(c.left) && goog.isDef(c.top)) {
    this.left = c.left
    this.top = c.top
    if (goog.isDef(c.width) && goog.isDef(c.height)) {
      this.width = c.width
      this.height = c.height
    } else if (goog.isDef(l.width) && goog.isDef(l.height)) {
      this.width = l.width
      this.height = l.height
    } else if (goog.isDef(l.w) && goog.isDef(l.h)) {
      this.w = l.w
      this.h = l.h
    } else {
      this.w = l
      this.h = w
    }
    return
  } else if (goog.isDef(c.x) && goog.isDef(c.y)) {
    this.left = c.x
    this.top = c.y
    if (goog.isDef(c.width) && goog.isDef(c.height)) {
      this.width = c.width
      this.height = c.height
    } else if (goog.isDef(l.width) && goog.isDef(l.height)) {
      this.width = l.width
      this.height = l.height
    } else if (goog.isDef(l.w) && goog.isDef(l.h)) {
      this.w = l.w
      this.h = l.h
    } else {
      this.w = l
      this.h = w
    }
    return
  } else if (goog.isDef(c.c) && goog.isDef(c.l)) {
    if (goog.isDef(c.w) && goog.isDef(c.h)) {
      h = c.h || 0
      w = c.w || 0
    } else if (goog.isDef(l.w) && goog.isDef(l.h)) {
      h = l.h || 0
      w = l.w || 0
    } else if (goog.isDef(l.width) && goog.isDef(l.height)) {
      h = Math.round((l.height || 0) / eYo.Unit.y)
      w = Math.round((l.width || 0) / eYo.Unit.x)
    }
    l = c.l || 0
    c = c.c || 0
  }
  this.c_ = c
  this.l_ = l
  this.w_ = w
  this.h_ = h
}

/**
 * clone the `Rect`.
 */
eYo.TRect.prototype.clone = function () {
  return eYo.TRect(this)
}

/**
 * Computes the difference regions between two rectangles. The return value is
 * an array of 0 to 4 rectangles defining the remaining regions of the first
 * rectangle after the second has been subtracted.
 * The only difference with closure implementation is that we keep track
 * of the rectangles order: 0 -> above, 1 -> below, 2 -> left, 3 -> right
 * SEE: https://github.com/google/closure-library/blob/master/closure/goog/math/rect.js#L272
 * The constructor of `a` is used to build the return rectangles.
 * @param {goog.math.Rect} a A Rectangle.
 * @param {goog.math.Rect} b A Rectangle.
 * @return {!Array<?goog.math.Rect>} An array with 4 rectangles which
 *     together define the difference area of rectangle a minus rectangle b.
 */
eYo.Rect.difference = function(a, b) {
  var makeRect = (l, t, w, h) => {
      return goog.isDef(l.left)
        ? new a.constructor(l.left, l.top, l.width, l.height)
        : new a.constructor(l, t, w, h)
    }
  var result = [null, null, null, null]

  var top = a.top
  var height = a.height

  var a_right = a.left + a.width
  var a_bottom = a.top + a.height

  var b_right = b.left + b.width
  var b_bottom = b.top + b.height

  if (a_bottom <= b.top) { // b is entirely below a
    result[0] = makeRect(a)
    return
  }
  // b.top < a_bottom
  if (b_bottom <= a.top) {
    result[1] = makeRect(a)
    return
  }
  // a.top < b_bottom
  // Subtract off any area on top where A extends past B
  if (b.top > a.top) {
    result[0] = makeRect(a.left, a.top, a.width, b.top - a.top)
    top = b.top
    // If we're moving the top down, we also need to subtract the height diff.
    height -= b.top - a.top
  }
  // Subtract off any area on bottom where A extends past B
  // We have b.top < a_bottom and only one of
  // b.top < b_bottom < a_bottom
  // b.top < a_bottom <= b_bottom
  if (b_bottom < a_bottom) {
    result[1] = makeRect(a.left, b_bottom, a.width, a_bottom - b_bottom)
    height = b_bottom - top
  }
  if (b.right <= a.left) {
    // no intersection
    result[2] = makeRect(a)
    return
  }
  // a.left < b.right
  if (a.right <= b.left) {
    // no intersection
    result[3] = makeRect(a)
    return
  }
  // b.left < a.right
  // Subtract any area on left where A extends past B
  // We have a.left < b.right and only one of
  // a.left < b.left < b.right
  // b.left <= a.left < b.right
  if (a.left < b.left) {
    result[2] = makeRect(a.left, top, b.left - a.left, height)
  }
  // Subtract any area on right where A extends past B
  // We have b.left < a.right and only one of
  // b.left < b.right < a.right
  // b.left < a.right <= b.right
  if (b_right < a_right) {
    result[3] = makeRect(b_right, top, a_right - b_right, height)
  }
  return result
}

/**
 * Computes the intersection of the rectangle a and the rectangle b.
 * When the intersection is void, the return value is null.
 * When the rectangles are side by side, the return rectangle has
 * either 0 width or 0 height,
 * thus representing either a segment or a point.
 * Both rectangles are expected to have the same constructor.
 * The constructor of `a` is used to build the return rectangle.
 * @param {goog.math.Rect|eYo.TRect} a A Rectangle.
 * @param {goog.math.Rect|eYo.TRect} b A Rectangle.
 * @return {?goog.math.Rect|eYo.TRect}
 */
eYo.Rect.intersection = function(a, b) {
  var left = Math.max(a.left, b.left)
  var right = Math.min(a.left + a.width, b.left + b.width)
  if (left <= right) {
    var top = Math.max(a.top, b.top)
    var bottom = Math.min(a.top + a.height, b.top + b.height)
    if (top <= bottom) {
      return new a.constructor(left, top, right - left, bottom - top)
    }
  }
  return null
}
