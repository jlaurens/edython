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

goog.require('eYo')

goog.require('eYo.Do')

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
 * `where` is modelling a plane point that stores its data in text units.
 */
eYo.Where = function(c, l) {
  this.set(c, l)
}

/**
 * Dispose of the receive resources.
 */
eYo.Where.prototype.dispose = eYo.Do.nothing

eYo.Where.property_c_ = {
  get () {
    return this.c_
  },
  set (newValue) {
    this.c_ = Math.round(newValue)
  }
}
eYo.Where.property_l_ = {
  get () {
    return this.l_
  },
  set (newValue) {
    this.l_ = Math.round(newValue)
  }
}
eYo.Where.property_x_ = {
  get () {
    return this.c_ * eYo.Unit.x
  },
  set (newValue) {
    this.c_ = newValue / eYo.Unit.x
  }
}
eYo.Where.property_y_ = {
  get () {
    return this.l_ * eYo.Unit.y
  },
  set (newValue) {
    this.l_ = newValue / eYo.Unit.y
  }
}

// Overdefined, for better understanding
Object.defineProperties(eYo.Where.prototype, {
  c: eYo.Where.property_c_,
  l: eYo.Where.property_l_,
  dc: eYo.Where.property_c_,
  dl: eYo.Where.property_l_,
  w: eYo.Where.property_c_,
  h: eYo.Where.property_l_,
  x: eYo.Where.property_x_,
  y: eYo.Where.property_y_,
  w: eYo.Where.property_x_,
  h: eYo.Where.property_y_,
  width: eYo.Where.property_x_,
  height: eYo.Where.property_y_,
  dx: eYo.Where.property_x_,
  dy: eYo.Where.property_y_,
  /**
   * Euclidian magnitude between points.
   * @return {number} non negative number
   */
  magnitude: {
    get () {
      var dx = this.x
      var dy = this.y
      return Math.sqrt(dx * dx + dy * dy)
    }
  }
})

/**
 * Like `advance` but sets the coordinates, instead of advancing them.
 * @param {Number | eYo.Where | Event | Object} c
 * @param {?Number} l
 * @return {eYo.Where} The receiver
 */
eYo.Where.prototype.set = function (c = 0, l = 0) {
  if (goog.isDef(c.x) && goog.isDef(c.y)) {
    this.x = c.x
    this.y = c.y
    return this
  } else if (goog.isDef(c.clientX) && goog.isDef(c.clientY)) {
    this.x = c.clientX
    this.y = c.clientY
    return this
  }
  this.c = c
  this.l = l
  return this
}

/**
 * Test equality between the receiver and the rhs.
 */
eYo.Where.prototype.equals = function (rhs) {
  return rhs instanceof eYo.Where && this.c_ == rhs.c_ && this.l_ == rhs.l_
}

/**
 * Like `forward` but sets the coordinates, instead of advancing them.
 * @return {eYo.Where} The receiver
 */
eYo.Where.prototype.xySet = function (x = 0, y = 0) {
  if (goog.isDef(x.x) && goog.isDef(x.y)) {
    y = x.y
    x = x.x
  }
  this.x = x
  this.y = y
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.Where | eYo.Size} c
 * @param {number} l
 * @return {eYo.Where} c
 */
eYo.Where.prototype.forward = function (c = 0, l = 0) {
  if (goog.isDef(c.x) && goog.isDef(c.y)) {
    this.x += c.x
    this.y += c.y
    return this
  }
  this.c += c
  this.l += l
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.Where | eYo.Size} c
 * @param {number} l
 * @return {eYo.Where} c
 */
eYo.Where.prototype.backward = function (c = 0, l = 0) {
  if (goog.isDef(c.x) && goog.isDef(c.y)) {
    this.x -= c.x
    this.y -= c.y
    return this
  }
  this.c -= c
  this.l -= l
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * Board coodinates
 * @param {number} c
 * @param {number} l
 * @return {eYo.Where} c
 */
eYo.Where.prototype.xyAdvance = function (x = 0, y = 0) {
  if (goog.isDef(x.x) && goog.isDef(x.y)) {
    y = x.y
    x = x.x
  }
  this.x += x
  this.y += y
  return this
}

/**
 * Scale the receiver.
 * @param {!Number} scale
 * @return {!eYo.Where} the receiver
 */
eYo.Where.prototype.scale = function (scale) {
  this.c_ *= scale
  this.l_ *= scale
  return this
}

/**
 * Unscale the receiver.
 * @param {!eYo.Where} other
 * @return {!eYo.Where} the receiver
 */
eYo.Where.prototype.unscale = function (scale) {
  this.c_ /= scale
  this.l_ /= scale
  return this
}

/**
 * Euclidian distance between points.
 * @param {!eYo.Where} other
 * @return {number} non negative number
 */
eYo.Where.prototype.distance = function (other) {
  var dx = this.x - other.x
  var dy = this.y - other.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Test container.
 * @param {!eYo.Rect} rect
 * @return {number} non negative number
 */
eYo.Where.prototype.in = function (rect) {
  return this.c_ >= rect.c_min
    && this.c_ <= rect.c_max
    && this.l_ >= rect.l_min
    && this.l_ <= rect.l_max
}

/**
 * Euclidian distance between points.
 * @param {!eYo.Where} other
 * @return {number} non negative number
 */
eYo.Where.prototype.toString = function () {
  return `eYo.Where(c: ${this.c}, l: ${this.l}, x: ${this.x}, y: ${this.y})`
}

/**
 * `Size` is a Point.
 */
eYo.Size = eYo.Where

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
 * `Rect` stores its data in text units.
 * Class for representing rectangular regions.
 * @param {number} c Left, in text units.
 * @param {number} l Top, in text units.
 * @param {number} w Width, in text units.
 * @param {number} h Height, in text units.
 * @struct
 * @constructor
 * @implements {goog.math.IRect}
 */
eYo.Rect = function(c, l, w, h) {
  this.origin_ = new eYo.Where()
  this.size_ = new eYo.Size()
  this.set(c, l, w, h)
}

Object.defineProperties(eYo.Rect.prototype, {
  c: {
    get () {
      return this.origin_.c
    },
    set (newValue) {
      this.origin_.c = newValue
    }
  },
  l: {
    get () {
      return this.origin_.l
    },
    set (newValue) {
      this.origin_.l = newValue
    }
  },
  w: {
    get () {
      return this.size_.w
    },
    set (newValue) {
      this.size_.w = newValue
    }
  },
  h: {
    get () {
      return this.size_.h
    },
    set (newValue) {
      this.size_.h = newValue
    }
  },
  left: {
    get () {
      return this.origin_.x
    },
    set (newValue) {
      this.origin_.x = newValue
    }
  },
  x: {
    get () {
      return this.origin_.x
    },
    set (newValue) {
      this.origin_.x = newValue
    }
  },
  x_min: {
    get () {
      return this.origin_.x
    },
    set (newValue) {
      this.origin_.x = newValue
    }
  },
  x_max: {
    get () {
      return this.x + this.width
    },
    set (newValue) {
      this.width = Math.max(0, newValue - this.x)
    }
  },
  c_min: {
    get () {
      return this.origin_.c_
    },
    set (newValue) {
      this.c = newValue
    }
  },
  c_max: {
    get () {
      return this.c + this.w
    },
    set (newValue) {
      this.w = Math.max(0, newValue - this.c)
    }
  },
  l_min: {
    get () {
      return this.l
    },
    set (newValue) {
      this.l = newValue
    }
  },
  l_max: {
    get () {
      return this.l + this.h
    },
    set (newValue) {
      this.h = Math.max(0, newValue - this.l)
    }
  },
  top: {
    get () {
      return this.origin_.y
    },
    set (newValue) {
      this.origin_.y = newValue
    }
  },
  y: {
    get () {
      return this.origin_.y
    },
    set (newValue) {
      this.origin_.y = newValue
    }
  },
  y_min: {
    get () {
      return this.origin_.y
    },
    set (newValue) {
      this.origin_.y = newValue
    }
  },
  y_max: {
    get () {
      return this.y + this.height
    },
    set (newValue) {
      this.height = Math.max(0, newValue - this.y)
    }
  },
  bottom: {
    get () {
      return this.y + this.height
    },
    set (newValue) {
      this.height = Math.max(0, newValue - this.y)
    }
  },
  width: {
    get () {
      return this.size_.width
    },
    set (newValue) {
      this.size_.width = newValue
    }
  },
  height: {
    get () {
      return this.size_.height
    },
    set (newValue) {
      this.size_.height = newValue
    }
  },
  origin: {
    get () {
      return new eYo.Where(this.origin_)
    },
    set (newValue) {
      this.origin_.x = newValue.x
      this.origin_.y = newValue.y
    }
  },
  topLeft: {
    get () {
      return new eYo.Where(this.origin_)
    },
    set (newValue) {
      this.origin_.x = newValue.x
      this.origin_.y = newValue.y
    }
  },
  bottomRight: {
    get () {
      return new eYo.Where(this.origin_).forward(this.size_)
    },
    set (newValue) {
      this.x_max = newValue.x
      this.y_max = newValue.y
    }
  },
  center: {
    get () {
      return new eYo.Where(this.origin_).forward(this.size_.unscale(2))
    },
    set (newValue) {
      this.origin_ = newValue.addvance(this.size_.unscale(-2))
    }
  },
  size: {
    get () {
      return new eYo.Size(this.size_)
    },
    set (newValue) {
      this.size_.width = newValue.width
      this.size_.height = newValue.height
    }
  }
})

/**
 * set the `Rect`.
 * @param{?Number|eYo.Where} c
 * @param{?Number|eYo.Size} l
 * @param{?Number} w
 * @param{?Number} h
 * @return {eYo.Rect} The receiver
 */
eYo.Rect.prototype.set = function (c = 0, l = 0, w = 0, h = 0) {
  if (goog.isDef(c.x) && goog.isDef(c.y)) {
    this.origin = c
    if (goog.isDef(c.size)) {
      this.size = c.size
    } else if (goog.isDef(l.x) && goog.isDef(l.y)) {
      this.size = l
    } else {
      this.size_.x = l
      this.size_.y = w
    }
  } else {
    this.x = c.x
    this.y = c.y
    if (goog.isDef(w.x) && goog.isDef(w.y)) {
      this.size = w
    } else {
      this.size_.x = w
      this.size_.y = h
    }
  }
  return this
}

/**
 * Test equality between the receiver and the rhs.
 */
eYo.Rect.prototype.equals = function (rhs) {
  return rhs instanceof eYo.Rect && this.origin_ == rhs.origin_ && this.size_ == rhs.size_
}

/**
 * Union with the `Rect`.
 * @param {eYo.Rect} rect
 * @return {eYo.Rect} the receiver
 */
eYo.Rect.prototype.union = function (rect) {
  var a = rect.x
  if (a < this.x) {
    this.x = a
  }
  a = rect.x_max
  if (this.x_max < a) {
    this.x_max = a
  }
  a = rect.y
  if (a < this.y) {
    this.y = a
  }
  a = rect.y_max
  if (this.y_max < a) {
    this.y_max = a
  }
  return this
}

/**
 * clone the `Rect`.
 */
eYo.Rect.prototype.clone = function () {
  return new eYo.Rect(this)
}

/**
 * Computes the difference regions between two rectangles. The return value is
 * an array of 0 to 4 rectangles defining the remaining regions of the first
 * rectangle after the second has been subtracted.
 * The only difference with closure implementation is that we keep track
 * of the rectangles order: 0 -> above, 1 -> below, 2 -> left, 3 -> right
 * SEE: https://github.com/google/closure-library/blob/master/closure/goog/math/rect.js#L272
 * @param {eYo.Rect} a A Rectangle.
 * @param {eYo.Rect} b A Rectangle.
 * @return {!Array<?eYo.Rect>} An array with 4 rectangles which
 *     together define the difference area of rectangle a minus rectangle b.
 */
eYo.Rect.difference = function(a, b) {
  var ans = [null, null, null, null]

  var top = a.top
  var height = a.height

  var a_right = a.left + a.width
  var a_bottom = a.top + a.height

  var b_right = b.left + b.width
  var b_bottom = b.top + b.height

  if (a_bottom <= b.top) { // b is entirely below a
    ans[0] = new eYo.Rect(a)
    return
  }
  // b.top < a_bottom
  if (b_bottom <= a.top) {
    ans[1] = new eYo.Rect(a)
    return
  }
  // a.top < b_bottom
  // Subtract off any area on top where A extends past B
  if (b.top > a.top) {
    var r = ans[0] = new eYo.Rect(a)
    r.height = b.top - a.top
    top = b.top
    // If we're moving the top down, we also need to subtract the height diff.
    height -= b.top - a.top
  }
  // Subtract off any area on bottom where A extends past B
  // We have b.top < a_bottom and only one of
  // b.top < b_bottom < a_bottom
  // b.top < a_bottom <= b_bottom
  if (b_bottom < a_bottom) {
    r = ans[1] = new eYo.Rect(a)
    r.y = b_bottom
    r.height = a_bottom - b_bottom
    height = b_bottom - top
  }
  if (b.right <= a.left) {
    // no intersection
    ans[2] = new eYo.Rect(a)
    return
  }
  // a.left < b.right
  if (a.right <= b.left) {
    // no intersection
    ans[3] = new eYo.Rect(a)
    return
  }
  // b.left < a.right
  // Subtract any area on left where A extends past B
  // We have a.left < b.right and only one of
  // a.left < b.left < b.right
  // b.left <= a.left < b.right
  if (a.left < b.left) {
    r = ans[2] = new eYo.Rect(a)
    r.width = b.left - a.left
    r.height = height
  }
  // Subtract any area on right where A extends past B
  // We have b.left < a.right and only one of
  // b.left < b.right < a.right
  // b.left < a.right <= b.right
  if (b_right < a_right) {
    ans[3] = new eYo.Rect().xySet(_right, top, a_right - b_right, height)
  }
  return ans
}

/**
 * Computes the intersection of the rectangle a and the rectangle b.
 * When the intersection is void, the return value is null.
 * When the rectangles are side by side, the return rectangle has
 * either 0 width or 0 height,
 * thus representing either a segment or a point.
 * Both rectangles are expected to have the same constructor.
 * @param {eYo.Rect} a A Rectangle.
 * @param {eYo.Rect} b A Rectangle.
 * @return {eYo.Rect}
 */
eYo.Rect.intersection = function(a, b) {
  var ans = new eYo.Rect()
  ans.left = Math.max(a.left, b.left)
  ans.right = Math.min(a.right, b.right)
  if (ans.width >= 0) {
    ans.top = Math.max(a.top, b.top)
    ans.bottom = Math.min(a.bottom, b.bottom)
    if (ans.height >= 0) {
      return ans
    }
  }
  return null
}
