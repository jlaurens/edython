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

eYo.require('Do')
eYo.provide('Where')
eYo.provide('Size')
eYo.provide('Rect')

eYo.provide('Unit')

eYo.provide('Geometry')

eYo.forwardDeclare('Font')

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
    this.c_ = Math.round(2 * newValue) / 2
  }
}
eYo.Where.property_l_ = {
  get () {
    return this.l_
  },
  set (newValue) {
    this.l_ = Math.round(4 * newValue) / 4
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
  // c_: {
  //   get () {
  //     return this.c__ / 10000
  //   },
  //   set (newValue) {
  //     this.c__ = Math.round(10000 * newValue)
  //   }
  // },
  // l_: {
  //   get () {
  //     return this.l__ / 10000
  //   },
  //   set (newValue) {
  //     this.l__ = Math.round(10000 * newValue)
  //   }
  // },
  c: eYo.Where.property_c_,
  l: eYo.Where.property_l_,
  dc: eYo.Where.property_c_,
  dl: eYo.Where.property_l_,
  w: eYo.Where.property_c_,
  h: eYo.Where.property_l_,
  x: eYo.Where.property_x_,
  y: eYo.Where.property_y_,
  w: eYo.Where.property_c_,
  h: eYo.Where.property_l_,
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
  },
  /**
   * clone the receiver.
   * @type {eYo.Where}
   */
  clone: {
    get () {
      return new eYo.Where(this)
    }
  },
  /**
   * Euclidian distance between points.
   * @param {eYo.Where} other
   * @return {number} non negative number
   */
  toString: {
    get () {
      return `eYo.Where(c: ${this.c}, l: ${this.l}, x: ${this.x}, y: ${this.y})`
    }
  }

})

/**
 * Like `advance` but sets the coordinates, instead of advancing them.
 * @param {Number | eYo.Where | Event | Object} c
 * @param {Number} [l]
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
  } else if (goog.isDef(c.width) && goog.isDef(c.height)) {
    this.x = c.width
    this.y = c.height
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
 * Setter.
 * @param {Number} x  x coordinate
 * @param {Number} y  y coordinate
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
 * Convenient creator.
 * @param {Number} x  x coordinate
 * @param {Number} y  y coordinate
 * @return {eYo.Where} The receiver
 */
eYo.Where.xy = function (x = 0, y = 0) {
  return new eYo.Where().xySet(x, y)
}

/**
 * Convenient creator in text units.
 * @param {Number} c  c coordinate
 * @param {Number} l  l coordinate
 * @return {eYo.Where} The receiver
 */
eYo.Where.cl = function (c = 0, l = 0) {
  return new eYo.Where().set(c, l)
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
 * @param {Number | Object} scaleX
 * @param {Number} [scaleY] or scaleX
 * @return {!eYo.Where} the receiver
 */
eYo.Where.prototype.scale = function (scaleX, scaleY) {
  if (scaleX.x) {
    this.c_ *= scaleX.x
    this.l_ *= scaleX.y || scaleX.x
  } else if (scaleX.y) {
    this.c_ *= scaleX.y
    this.l_ *= scaleX.y
  } else {
    this.c_ *= scaleX
    this.l_ *= scaleY || scaleX
  }
  return this
}

/**
 * Unscale the receiver.
 * @param {Number} scale  Must not be 0.
 * @return {!eYo.Where} the receiver
 */
eYo.Where.prototype.unscale = function (scaleX, scaleY) {
  if (scaleX.x) {
    this.c_ /= scaleX.x
    this.l_ /= scaleX.y || scaleX.x
  } else if (scaleX.y) {
    this.c_ /= scaleX.y
    this.l_ /= scaleX.y
  } else {
    this.c_ /= scaleX
    this.l_ /= scaleY || scaleX
  }
  return this
}

/**
 * Euclidian distance between points.
 * @param {eYo.Where} other
 * @return {number} non negative number
 */
eYo.Where.prototype.distance = function (other) {
  var dx = this.x - other.x
  var dy = this.y - other.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Test container.
 * @param {eYo.Rect} rect
 * @return {number} non negative number
 */
eYo.Where.prototype.in = function (rect) {
  return this.c_ >= rect.c_min
    && this.c_ <= rect.c_max
    && this.l_ >= rect.l_min
    && this.l_ <= rect.l_max
}

/**
 * Test container.
 * @param {eYo.Rect} rect
 * @return {number} non negative number
 */
eYo.Where.prototype.out = function (rect) {
  return this.c_ <= rect.c_min
    || this.c_ >= rect.c_max
    || this.l_ <= rect.l_min
    || this.l_ >= rect.l_max
}

/**
 * `Size` is also a Point and a Where.
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
  // Basic properties in text dimensions.
  // When in text dimensions,
  // setters round their arguments to half width and quarter height.
  // Except for left, right, top and bottom,
  // the position setters won't change the size.
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
  // basic properties in board dimensions
  x: {
    get () {
      return this.origin_.x
    },
    set (newValue) {
      this.origin_.x = newValue
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
  // convenient setters and getters
  c_min: {
    get () {
      return this.origin_.c_
    },
    /**
     * @param {Number} newValue 
     */
    set (newValue) {
      this.c = newValue
    }
  },
  c_mid: {
    get () {
      return this.c + this.w / 2
    },
    /**
     * @param {Number} newValue 
     */
    set (newValue) {
      this.c = newValue - this.w / 2
    }
  },
  c_max: {
    get () {
      return this.c + this.w
    },
    set (newValue) {
      this.c = newValue - this.w
    }
  },
  l_min: {
    get () {
      return this.l
    },
    /**
     * The height does not change, `l_max` changes accordingly.
     * @param {Number} newValue 
     */
    set (newValue) {
      this.l = newValue
    }
  },
  l_mid: {
    get () {
      return this.l + this.h / 2
    },
    set (newValue) {
      this.l = newValue - this.h / 2
    }
  },
  l_max: {
    get () {
      return this.l + this.h
    },
    set (newValue) {
      this.l = newValue - this.h
    }
  },
  // Convenient setters in board coordinates
  x_min: {
    get () {
      return this.x
    },
    set (newValue) {
      this.x = newValue
    }
  },
  x_mid: {
    get () {
      return this.x + this.width / 2
    },
    set (newValue) {
      this.x = newValue - this.width / 2
    }
  },
  x_max: {
    get () {
      return this.x + this.width
    },
    set (newValue) {
      this.x = newValue - this.width
    }
  },
  y_min: {
    get () {
      return this.y
    },
    set (newValue) {
      this.y = newValue
    }
  },
  y_mid: {
    get () {
      return this.y + this.height / 2
    },
    set (newValue) {
      this.y = newValue - this.height / 2
    }
  },
  y_max: {
    get () {
      return this.y + this.height
    },
    set (newValue) {
      this.y = newValue - this.height
    }
  },
  //// The setters change the width, but does not change the `right`
  left: {
    get () {
      return this.origin_.x
    },
    set (newValue) {
      this.width = this.x_max - newValue
      this.x_min = newValue
    }
  },
  top: {
    get () {
      return this.y
    },
    /**
     * The height does not change.
     * @param {Number} newValue 
     */
    set (newValue) {
      this.height = this.y_max - newValue
      this.y_min = newValue
    }
  },
  right: {
    get () {
      return this.x_max
    },
    /**
     * Change the width, not the `left`.
     * No negative width.
     */
    set (newValue) {
      this.width = Math.max(0, newValue - this.left)
    }
  },
  bottom: {
    get () {
      return this.y_max
    },
    /**
     * Change the height, not the `top`.
     * No negative height.
     */
    set (newValue) {
      this.height = Math.max(0, newValue - this.top)
    }
  },
  // Composed
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
    /**
     * Change the origin but keeps the size.
     */
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
  },
  /**
   * clone the receiver.
   * @type {eYo.Rect}
   */
  clone: {
    get () {
      return new eYo.Rect(this)
    }
  },
  /**
   * String representation of the receiver.
   * @return {String} a string
   */
  toString: {
      get () {
      return `eYo.Rect(origin: ${this.origin_.toString}, size: ${this.size_.toString})`
    }
  },
  /**
   * Width of the draft part of the board.
   * @return {number} non negative number
   */
  draft: {
    get () {
      return Math.max(0, -this.x)
    }
  },
  /**
   * Width of the main part of the board.
   * `0` when in flyout.
   * @return {number} non negative number
   */
  main: {
    get () {
      return Math.min(this.width, this.width + this.x)
    }
  }
})

/**
 * Dispose of the receiver's resources.
 */
eYo.Rect.prototype.dispose = eYo.Do.nothing

/**
 * set the `Rect`.
 * This is a very very permissive setter.
 * @param{?Number|eYo.Where|Element} c
 * @param{?Number|eYo.Size} l
 * @param{?Number|eYo.Size} w
 * @param{?Number} h
 * @return {eYo.Rect} The receiver
 */
eYo.Rect.prototype.set = function (c = 0, l = 0, w = 0, h = 0) {
  if (goog.isDef(c.left) && goog.isDef(c.right) && goog.isDef(c.top) && goog.isDef(c.bottom)) {
    // properties are evaluated twice
    this.left = c.left
    this.right = c.right
    this.top = c.top
    this.bottom = c.bottom
  } else if (goog.isDef(c.x) && goog.isDef(c.y)) {
    this.origin = c
    if (goog.isDef(c.size)) {
      this.size = c.size
    } else if (goog.isDef(l.x) && goog.isDef(l.y)) {
      this.size = l
    } else if (goog.isDef(l.width) && goog.isDef(l.height)) {
      this.size = l
    } else {
      this.size_.x = l
      this.size_.y = w
    }
  } else {
    this.origin_.c_ = c
    this.origin_.l_ = l
    if (goog.isDef(w.x) && goog.isDef(w.y)) {
      this.size = w
    } else if (goog.isDef(w.width) && goog.isDef(w.height)) {
      this.size = w
    } else {
      this.size_.x = w
      this.size_.y = h
    }
  }
  return this
}

/**
 * Setter.
 * @param {Number} x  x coordinate
 * @param {Number} y  y coordinate
 * @param {Number} width  x coordinate
 * @param {Number} height  y coordinate
 * @return {eYo.Rect} The receiver
 */
eYo.Rect.prototype.xySet = function (x = 0, y = 0, width = 0, height = 0) {
  if (goog.isDef(x.x) && goog.isDef(x.y)) {
    this.origin_.set(x)
    this.size_.xySet(y, width)
  } else {
    this.origin_.xySet(x, y)
    this.size_.xySet(width, height)
    }
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.Where | eYo.Size} c
 * @param {number} l
 * @return {eYo.Rect}
 */
eYo.Rect.prototype.forward = function (c = 0, l = 0) {
  this.origin_.forward(c, l)
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.Where | eYo.Size} c
 * @param {number} l
 * @return {eYo.Rect}
 */
eYo.Rect.prototype.backward = function (c = 0, l = 0) {
  this.origin_.backward(c, l)
  return this
}

/**
 * Convenient creator.
 * @param {Number} x  x coordinate
 * @param {Number} y  y coordinate
 * @param {Number} width  x coordinate
 * @param {Number} height  y coordinate
 * @return {eYo.Rect} The newly created rect instance.
 */
eYo.Rect.xy = function (x = 0, y = 0, width = 0, height = 0) {
  return new eYo.Rect().xySet(x, y, width, height)
}

/**
 * Test equality between the receiver and the rhs.
 * @param {eYo.Rect} rhs
 */
eYo.Rect.prototype.equals = function (rhs) {
  return rhs instanceof eYo.Rect && this.origin_.equals(rhs.origin_) && this.size_.equals(rhs.size_)
}

/**
 * Scale the receiver.
 * @param {Number | Object} scaleX  Must be positive.
 * @param {Number} [scaleY]  Must be positive when defines, defaults to scaleX.
 * @return {!eYo.Rect} the receiver
 */
eYo.Rect.prototype.scale = function (scaleX, scaleY) {
  this.origin_.scale(scaleX, scaleY)
  this.size_.scale(scaleX, scaleY)
  return this
}

/**
 * Unscale the receiver.
 * @param {Number} scaleX  Must be positive.
 * @param {Number} [scaleY]  Must be positive when defines, defaults to scaleX.
 * @return {!eYo.Rect} the receiver
 */
eYo.Rect.prototype.unscale = function (scaleX, scaleY) {
  this.origin_.unscale(scaleX, scaleY)
  this.size_.unscale(scaleX, scaleY)
  return this
}

/**
 * Mirror the receiver vertically and horizontally.
 * @return {!eYo.Rect} the receiver
 */
eYo.Rect.prototype.mirror = function () {
  // size does not change, only max <-> -min
  this.x_max = -this.x
  this.y_max = -this.y
  return this
}

/**
 * Inset the receiver.
 * Default values are `eYo.Unit.x / 2` and `eYo.Unit.y / 4`
 * @param {Number|eYo.Where} [dx_min]
 * @param {Number} [dy_min]
 * @param {Number} [dx_max]
 * @param {Number} [dy_max]
 * @return {!eYo.Rect} the receiver
 */
eYo.Rect.prototype.xyInset = function (dx_min, dy_min, dx_max, dy_max) {
  if (!goog.isDef(dx_min)) {
    dx_min = dx_max = eYo.Unit.x / 2
    dy_min = dy_max = eYo.Unit.y / 4
  } else if (goog.isDef(dx_min.x)) {
    dy_min = dy_max = dx_min.y
    dx_min = dx_max = dx_min.x
  } else {
    if (!goog.isDef(dy_min)) {
      dy_min = dx_min
    }
    if (!goog.isDef(dx_max)) {
      dx_max = dx_min
    }
    if (!goog.isDef(dy_max)) {
      dy_max = dy_min
    }
  }
  this.x_min += dx_min
  this.x_max -= dx_min + dx_max
  this.y_min += dy_min
  this.y_max -= dy_min + dy_max
  return this
}

/**
 * outset the receiver.
 * Default values are `eYo.Unit.x / 2` and `eYo.Unit.y / 4`
 * @param {Number|eYo.Where} [dx_min]
 * @param {Number} [dy_min]
 * @param {Number} [dx_max]
 * @param {Number} [dy_max]
 * @return {!eYo.Rect} the receiver
 */
eYo.Rect.prototype.xyOutset = function (dx_min, dy_min, dx_max, dy_max) {
  if (!goog.isDef(dx_min)) {
    dx_min = dx_max = eYo.Unit.x / 2
    dy_min = dy_max = eYo.Unit.y / 4
  } else if (goog.isDef(dx_min.x)) {
    dy_min = dy_max = dx_min.y
    dx_min = dx_max = dx_min.x
  } else {
    if (!goog.isDef(dy_min)) {
      dy_min = dx_min
    }
    if (!goog.isDef(dx_max)) {
      dx_max = dx_min
    }
    if (!goog.isDef(dy_max)) {
      dy_max = dy_min
    }
  }
  this.x_min -= dx_min
  this.x_max += dx_min + dx_max
  this.y_min -= dy_min
  this.y_max += dy_min + dy_max
  return this
}

/**
 * Tie the two rectangles such that modifying one of them
 * automatically changes the other one accordingly.
 * @param {eYo.Rect} tied  A tied rect.
 * @param {Object} to
 * @param {Object} from
 * @return {!eYo.Rect} the receiver
 */
eYo.Rect.prototype.tie = function (tied, to, from) {
  Object.defineProperties(this, {
    c_: {
      get () {
        var c = tied.origin_.c_
        return (from.c && from.c(c)) || c
      },
      set (newValue) {
        tied.origin_.c_ = (to.c && to.c(newValue)) || newValue
      }
    },
    l_: {
      get () {
        var l = tied.origin_.l_
        return (from.l && from.l(l)) || l
      },
      set (newValue) {
        tied.origin_.l_ = (to.l && to.l(newValue)) || newValue
      }
    },
    h_: {
      get () {
        var c = tied.size_.c_
        return (from.c && from.c(c)) || c
      },
      set (newValue) {
        tied.size_.c_ = (to.c && to.c(newValue)) || newValue
      }
    },
    w_: {
      get () {
        var l = tied.size_.l_
        return (from.l && from.l(l)) || l
      },
      set (newValue) {
        tied.size_.l_ = (to.l && to.l(newValue)) || newValue
      }
    }
  })
  return this
}

/**
 * Whether the receiver contains the given point.
 * @param {Number | eYo.Where} x
 * @param {Number} [y]
 * @return {Boolean}
 */
eYo.Rect.prototype.xyContains = function (x, y) {
  var c = x.c
  var l = x.l
  if (!goog.isDef(c) || !goog.isDef(l)) {
    c = x / eYo.Unit.x
    l = y / eYo.Unit.y
  }
  return c >= this.c_min && c <= this.c_max
    && l >= this.l_min && l <= this.l_max
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
  a = rect.right
  if (this.right < a) {
    this.right = a
  }
  a = rect.y
  if (a < this.y) {
    this.y = a
  }
  a = rect.bottom
  if (this.bottom < a) {
    this.bottom = a
  }
  return this
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
    ans[3] = eYo.Rect.xy(_right, top, a_right - b_right, height)
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
