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

eYo.require('do')
eYo.provide('size')

eYo.provide('unit')

eYo.provide('geometry')

eYo.forwardDeclare('font')

/**
 * unit
 */

Object.defineProperties( eYo.unit, {
  x () {
    return eYo.font.Space
  },
  y () {
    return eYo.font.lineHeight
  },
  rem () {
    return parseFloat(getComputedStyle(document.documentElement).fontSize)
  },
})
// x, y, with, height are in pixels
// c, l, w, h are in text units

/**
 * `where` is modelling a planar point that stores its coordinates in text units. When `snap` is true, the coordinates are snapped to half integers horizontally and quarter integers vertically.
 * @name {eYo.Where}
 * @constructor
 * @param {Number} c - Horizontal coordinates, or another planar object.
 */
eYo.makeClass('Where', {
  init (c, l, snap) {
    if (c === true || c === false) {
      this.snap_ = c
      c = l
      l = snap
    } else if (l === true || l === false) {
      this.snap_ = l
      l = snap
    } else {
      this.snap_ = c && !!c.snap || !!snap
    }
    this.set(c, l)
  },
  valued: {
    /**
     * Horizontal position in text unit
     * @type {Number}
     */
    c: {
      init: 0,
      validate (after) {
        return this.snap_ ? Math.round(2 * after) / 2 : after
      },
      configurable: true,
    },
    /**
     * Vertical position in text unit
     * @type {Number}
     */
    l: {
      init: 0,
      validate (after) {
        return this.snap_ ? Math.round(4 * after) / 4 : after
      },
      configurable: true,
    },
  },
  computed: {
    /**
     * Horizontal position in pixels
     * @type {Number}
     */
    x: {
      get () {
        return this.c_ * eYo.unit.x
      },
      set_ (after) {
        this.c_ = after / eYo.unit.x
      }
    },
    /**
     * Vertical position in pixels
     * @type {Number}
     */
    y: {
      get () {
        return this.l_ * eYo.unit.x
      },
      set_ (after) {
        this.l_ = after / eYo.unit.x
      }
    },
    /**
     * Euclidian magnitude between points.
     * @return {number} non negative number
     */
    magnitude () {
      var dx = this.x
      var dy = this.y
      return Math.sqrt(dx * dx + dy * dy)
    },
    /**
     * clone the receiver.
     * @type {eYo.Where}
     */
    clone () {
      return new eYo.Where(this)
    },
    /**
     * Euclidian distance between points.
     * @param {eYo.Where} other
     * @return {number} non negative number
     */
    toString () {
      return `eYo.Where(c: ${this.c}, l: ${this.l}, x: ${this.x}, y: ${this.y})`
    },
  },
})

// Overdefined, for better understanding
;(() => {
  var c = Object.getOwnPropertyDescriptor(eYo.Where_p, 'c_')
  var l = Object.getOwnPropertyDescriptor(eYo.Where_p, 'l_')
  var x = Object.getOwnPropertyDescriptor(eYo.Where_p, 'x_')
  var y = Object.getOwnPropertyDescriptor(eYo.Where_p, 'y_')
  Object.defineProperties(eYo.Where_p, {
    /**
     * Horizontal offset in text unit
     * @type {Number}
     */
    dc_: c,
    /**
     * Vertical offset in text unit
     * @type {Number}
     */
    dl_: l,
    /**
     * Horizontal dimension in text unit
     * @type {Number}
     */
    w_: c,
    /**
     * Vertical dimension in text unit
     * @type {Number}
     */
    h_: l,
    /**
     * Horizontal offset in pixels
     * @type {Number}
     */
    dx_: x,
    /**
     * Vertical offset in pixels
     * @type {Number}
     */
    dy_: y,
    /**
     * Horizontal dimension in pixels
     * @type {Number}
     */
    width_: x,
    /**
     * Vertical dimension in pixels
     * @type {Number}
     */
    height_: y,
  })
  let d = eYo.Where.eyo.descriptors__
  d['dc'] = d['w'] = eYo.c9r.descriptorR(function () { return this.c})
  d['dl'] = d['h'] = eYo.c9r.descriptorR(function () { return this.l})
  d['dx'] = d['width'] = eYo.c9r.descriptorR(function () { return this.x})
  d['dy'] = d['height'] = eYo.c9r.descriptorR(function () { return this.y})
}) ()

/**
 * Like `advance` but sets the coordinates, instead of advancing them.
 * @param {Number | eYo.Where | Event | Object} c
 * @param {Number} [l]
 * @return {eYo.Where} The receiver
 */
eYo.Where_p.set = function (c = 0, l = 0) {
  if (eYo.isDef(c.x) && eYo.isDef(c.y)) {
    this.x_ = c.x
    this.y_ = c.y
    return this
  } else if (eYo.isDef(c.clientX) && eYo.isDef(c.clientY)) {
    this.x_ = c.clientX
    this.y_ = c.clientY
    return this
  } else if (eYo.isDef(c.width) && eYo.isDef(c.height)) {
    this.x_ = c.width
    this.y_ = c.height
    return this
  }
  this.c_ = c
  this.l_ = l
  return this
}

/**
 * Test equality between the receiver and the rhs.
 */
eYo.Where_p.equals = function (rhs) {
  return rhs instanceof eYo.Where && this.c_ == rhs.c_ && this.l_ == rhs.l_
}

/**
 * Setter.
 * @param {Number} x  x coordinate
 * @param {Number} y  y coordinate
 * @return {eYo.Where} The receiver
 */
eYo.Where_p.xySet = function (x = 0, y = 0) {
  if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
    this.x_ = x.x
    this.y_ = x.y
    return this
  } else if (eYo.isDef(x.clientX) && eYo.isDef(x.clientY)) {
    this.x_ = x.clientX
    this.y_ = x.clientY
    return this
  } else if (eYo.isDef(x.width) && eYo.isDef(x.height)) {
    this.x_ = x.width
    this.y_ = x.height
    return this
  }
  this.x_ = x
  this.y_ = y
  return this
}

/**
 * Convenient creator.
 * @param {Number} x  x coordinate
 * @param {Number} y  y coordinate
 * @return {eYo.Where} The receiver
 */
eYo.Where.xy = function (x, y, snap) {
  var y
  if (x === true || x === false) {
    var _ = x
    x = y
    y = snap
    snap = _
  } else if (y === true || y === false) {
    var _ = y
    y = snap
    snap = _
  } else {
    snap = !!x.snap || !!snap
  }
return new eYo.Where(snap).xySet(x, y)
}

/**
 * Convenient creator in text units.
 * @param {Number} [c] - c coordinate. Defaults to 0.
 * @param {Number} [l] - l coordinate. Defaults to 0.
 * @param {Boolean} [snap] - snap flag. Defaults to false.
 * @return {eYo.Where} The receiver
 */
eYo.Where.Cl = function (c, l, snap) {
  return new eYo.Where(c, l, snap)
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.Where | eYo.Size} c
 * @param {number} l
 * @return {eYo.Where} c
 */
eYo.Where_p.forward = function (c = 0, l = 0) {
  if (eYo.isDef(c.x) && eYo.isDef(c.y)) {
    this.x_ += c.x
    this.y_ += c.y
    return this
  }
  this.c_ += c
  this.l_ += l
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.Where | eYo.Size} c
 * @param {number} l
 * @return {eYo.Where} c
 */
eYo.Where_p.backward = function (c = 0, l = 0) {
  if (eYo.isDef(c.x) && eYo.isDef(c.y)) {
    this.x_ -= c.x
    this.y_ -= c.y
    return this
  }
  this.c_ -= c
  this.l_ -= l
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * Board coodinates
 * @param {number} c
 * @param {number} l
 * @return {eYo.Where} c
 */
eYo.Where_p.xyAdvance = function (x = 0, y = 0) {
  if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
    y = x.y
    x = x.x
  }
  this.x_ += x
  this.y_ += y
  return this
}

/**
 * Scale the receiver.
 * @param {Number | Object} scaleX
 * @param {Number} [scaleY] - Defaults to
 * @return {eYo.Where} the receiver
 */
eYo.Where_p.scale = function (scaleX, scaleY) {
  if (scaleX.x) {
    this.c_ *= scaleX.x
    this.l_ *= (scaleX.y || scaleX.x)
  } else if (scaleX.y) {
    this.c_ *= scaleX.y
    this.l_ *= scaleX.y
  } else {
    this.c_ *= scaleX
    this.l_ *= (scaleY || scaleX)
  }
  return this
}

/**
 * Unscale the receiver.
 * @param {Number | Object} scaleX
 * @param {Number} [scaleY] - Defaults to scaleX
 * @return {eYo.Where} the receiver
 */
eYo.Where_p.unscale = function (scaleX, scaleY) {
  if (scaleX.x) {
    this.c_ /= scaleX.x
    this.l_ /= (scaleX.y || scaleX.x)
  } else if (scaleX.y) {
    this.c_ /= scaleX.y
    this.l_ /= scaleX.y
  } else {
    this.c_ /= scaleX
    this.l_ /= (scaleY || scaleX)
  }
  return this
}

/**
 * Euclidian distance between points.
 * @param {eYo.Where} other
 * @return {number} non negative number
 */
eYo.Where_p.distance = function (other) {
  var dx = this.x - other.x
  var dy = this.y - other.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Test container.
 * @param {eYo.Rect} rect
 * @return {Boolean}
 */
eYo.Where_p.in = function (rect) {
  return this.c_ >= rect.c_min
    && this.c_ <= rect.c_max
    && this.l_ >= rect.l_min
    && this.l_ <= rect.l_max
}

/**
 * Test container.
 * Opposite of `in`, except for the rect boundary. A point of the rect boundary is in and out the rect.
 * @param {eYo.Rect} rect
 * @return {number} non negative number
 */
eYo.Where_p.out = function (rect) {
  return this.c_ <= rect.c_min
    || this.c_ >= rect.c_max
    || this.l_ <= rect.l_min
    || this.l_ >= rect.l_max
}

/**
 * `Size` is a synonym of Where.
 */
eYo.Size = eYo.Where

/**
 * Sets from the given text.
 * @param {String!} s
 * @return {eYo.Size} the receiver.
 */
eYo.Where_p.setFromText = function (txt) {
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
eYo.do.SizeOfText = function (txt) {
  return new eYo.Size().setFromText(txt)
}

/**
 * `Rect` stores its coordinates in text units.
 * Class for representing rectangular regions.
 * @param {number} c Left, in text units.
 * @param {number} l Top, in text units.
 * @param {number} w Width, in text units.
 * @param {number} h Height, in text units.
 * @struct
 * @constructor
 */
eYo.makeClass('Rect', {
  init (c, l, w, h, snap) {
    this.origin_ = new eYo.Where()
    this.size_ = new eYo.Size()
    this.set(c, l, w, h, snap)
  }
})

Object.defineProperties(eYo.Rect_p, {
  // Basic properties in text dimensions.
  // When in text dimensions,
  // setters round their arguments to half width and quarter height.
  // Except for left, right, top and bottom,
  // the position setters won't change the size.
  c: {
    get () {
      return this.origin_.c
    },
    set (after) {
      this.origin_.c_ = after
    }
  },
  l: {
    get () {
      return this.origin_.l
    },
    set (after) {
      this.origin_.l_ = after
    }
  },
  w: {
    get () {
      return this.size_.w
    },
    set (after) {
      this.size_.w_ = after
    }
  },
  h: {
    get () {
      return this.size_.h
    },
    set (after) {
      this.size_.h_ = after
    }
  },
  // basic properties in board dimensions
  x: {
    get () {
      return this.origin_.x
    },
    set (after) {
      this.origin_.x_ = after
    }
  },
  y: {
    get () {
      return this.origin_.y
    },
    set (after) {
      this.origin_.y_ = after
    }
  },
  width: {
    get () {
      return this.size_.width
    },
    set (after) {
      this.size_.width_ = after
    }
  },
  height: {
    get () {
      return this.size_.height
    },
    set (after) {
      this.size_.height_ = after
    }
  },
  // convenient setters and getters
  c_min: {
    get () {
      return this.c
    },
    /**
     * @param {Number} after 
     */
    set (after) {
      this.c_ = after
    }
  },
  c_mid: {
    get () {
      return this.c + this.w / 2
    },
    /**
     * @param {Number} after 
     */
    set (after) {
      this.c_ = after - this.w / 2
    }
  },
  c_max: {
    get () {
      return this.c + this.w
    },
    set (after) {
      this.c_ = after - this.w
    }
  },
  l_min: {
    get () {
      return this.l
    },
    /**
     * The height does not change, `l_max` changes accordingly.
     * @param {Number} after 
     */
    set (after) {
      this.l_ = after
    }
  },
  l_mid: {
    get () {
      return this.l + this.h / 2
    },
    set (after) {
      this.l_ = after - this.h / 2
    }
  },
  l_max: {
    get () {
      return this.l + this.h
    },
    set (after) {
      this.l_ = after - this.h
    }
  },
  // Convenient setters in board coordinates
  x_min: {
    get () {
      return this.x
    },
    set (after) {
      this.x_ = after
    }
  },
  x_mid: {
    get () {
      return this.x + this.width / 2
    },
    set (after) {
      this.x_ = after - this.width / 2
    }
  },
  x_max: {
    get () {
      return this.x + this.width
    },
    set (after) {
      this.x_ = after - this.width
    }
  },
  y_min: {
    get () {
      return this.y
    },
    set (after) {
      this.y_ = after
    }
  },
  y_mid: {
    get () {
      return this.y + this.height / 2
    },
    set (after) {
      this.y_ = after - this.height / 2
    }
  },
  y_max: {
    get () {
      return this.y + this.height
    },
    set (after) {
      this.y_ = after - this.height
    }
  },
  //// The setters change the width, but does not change the `right`
  left: {
    get () {
      return this.origin_.x
    },
    set (after) {
      this.width = this.x_max - after
      this.x_min_ = after
    }
  },
  top: {
    get () {
      return this.y
    },
    /**
     * The height does not change.
     * @param {Number} after 
     */
    set (after) {
      this.height = this.y_max - after
      this.y_min_ = after
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
    set (after) {
      this.width_ = Math.max(0, after - this.left)
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
    set (after) {
      this.height_ = Math.max(0, after - this.top)
    }
  },
  // Composed
  origin: {
    get () {
      return new eYo.Where(this.origin_)
    },
    set (after) {
      this.origin_.x_ = after.x
      this.origin_.y_ = after.y
    }
  },
  topLeft: {
    get () {
      return new eYo.Where(this.origin_)
    },
    set (after) {
      this.origin_.x_ = after.x
      this.origin_.y_ = after.y
    }
  },
  bottomRight: {
    get () {
      return new eYo.Where(this.origin_).forward(this.size_)
    },
    set (after) {
      this.x_max_ = after.x
      this.y_max_ = after.y
    }
  },
  center: {
    get () {
      return new eYo.Where(this.origin_).forward(this.size_.unscale(2))
    },
    /**
     * Change the origin but keeps the size.
     */
    set (after) {
      this.origin_ = after.addvance(this.size_.unscale(-2))
    }
  },
  size: {
    get () {
      return new eYo.Size(this.size_)
    },
    set (after) {
      this.size_.width_ = after.width
      this.size_.height_ = after.height
    }
  },
  /**
   * clone the receiver.
   * @type {eYo.Rect}
   */
  clone () {
    return new eYo.Rect(this)
  },
  /**
   * String representation of the receiver.
   * @return {String} a string
   */
  toString () {
    return `eYo.Rect(origin: ${this.origin_.toString}, size: ${this.size_.toString})`
  },
  /**
   * Width of the draft part of the board.
   * @return {number} non negative number
   */
  draft () {
    return Math.max(0, -this.x)
  },
  /**
   * Width of the main part of the board.
   * `0` when in flyout.
   * @return {number} non negative number
   */
  main () {
    return Math.min(this.width, this.width + this.x)
  },
})

/**
 * Dispose of the receiver's resources.
 */
eYo.Rect_p.dispose = eYo.do.nothing

/**
 * set the `Rect`.
 * This is a very very permissive setter.
 * @param{?Number|eYo.Where|Element} c
 * @param{?Number|eYo.Size} l
 * @param{?Number|eYo.Size} w
 * @param{?Number} h
 * @return {eYo.Rect} The receiver
 */
eYo.Rect_p.set = function (c = 0, l = 0, w = 0, h = 0, snap) {
  if (eYo.isDef(c.left) && eYo.isDef(c.right) && eYo.isDef(c.top) && eYo.isDef(c.bottom)) {
    // properties are evaluated twice
    this.left_ = c.left
    this.right_ = c.right
    this.top_ = c.top
    this.bottom_ = c.bottom
  } else if (eYo.isDef(c.x) && eYo.isDef(c.y)) {
    this.origin_ = c
    if (eYo.isDef(c.size)) {
      this.size_ = c.size
    } else if (eYo.isDef(l.x) && eYo.isDef(l.y)) {
      this.size_ = l
    } else if (eYo.isDef(l.width) && eYo.isDef(l.height)) {
      this.size_ = l
    } else {
      this.size_.x = l
      this.size_.y = w
    }
  } else {
    this.origin_.c_ = c
    this.origin_.l_ = l
    if (eYo.isDef(w.x) && eYo.isDef(w.y)) {
      this.size_ = w
    } else if (eYo.isDef(w.width) && eYo.isDef(w.height)) {
      this.size_ = w
    } else {
      this.size_.x_ = w
      this.size_.y_ = h
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
eYo.Rect_p.xySet = function (x = 0, y = 0, width = 0, height = 0) {
  if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
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
eYo.Rect_p.forward = function (c = 0, l = 0) {
  this.origin_.forward(c, l)
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.Where | eYo.Size} c
 * @param {number} l
 * @return {eYo.Rect}
 */
eYo.Rect_p.backward = function (c = 0, l = 0) {
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
eYo.Rect_p.equals = function (rhs) {
  return rhs instanceof eYo.Rect && this.origin_.equals(rhs.origin_) && this.size_.equals(rhs.size_)
}

/**
 * Scale the receiver.
 * @param {Number | Object} scaleX  Must be positive.
 * @param {Number} [scaleY]  Must be positive when defines, defaults to scaleX.
 * @return {!eYo.Rect} the receiver
 */
eYo.Rect_p.scale = function (scaleX, scaleY) {
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
eYo.Rect_p.unscale = function (scaleX, scaleY) {
  this.origin_.unscale(scaleX, scaleY)
  this.size_.unscale(scaleX, scaleY)
  return this
}

/**
 * Mirror the receiver vertically and horizontally.
 * @return {!eYo.Rect} the receiver
 */
eYo.Rect_p.mirror = function () {
  // size does not change, only max <-> -min
  this.x_max_ = -this.x
  this.y_max_ = -this.y
  return this
}

/**
 * Inset the receiver.
 * Default values are `eYo.unit.x / 2` and `eYo.unit.y / 4`
 * @param {Number|eYo.Where} [dx_min]
 * @param {Number} [dy_min]
 * @param {Number} [dx_max]
 * @param {Number} [dy_max]
 * @return {!eYo.Rect} the receiver
 */
eYo.Rect_p.xyInset = function (dx_min, dy_min, dx_max, dy_max) {
  if (!eYo.isDef(dx_min)) {
    dx_min = dx_max = eYo.unit.x / 2
    dy_min = dy_max = eYo.unit.y / 4
  } else if (eYo.isDef(dx_min.x)) {
    dy_min = dy_max = dx_min.y
    dx_min = dx_max = dx_min.x
  } else {
    if (!eYo.isDef(dy_min)) {
      dy_min = dx_min
    }
    if (!eYo.isDef(dx_max)) {
      dx_max = dx_min
    }
    if (!eYo.isDef(dy_max)) {
      dy_max = dy_min
    }
  }
  this.x_min_ += dx_min
  this.x_max_ -= dx_min + dx_max
  this.y_min_ += dy_min
  this.y_max_ -= dy_min + dy_max
  return this
}

/**
 * outset the receiver.
 * Default values are `eYo.unit.x / 2` and `eYo.unit.y / 4`
 * @param {Number|eYo.Where} [dx_min]
 * @param {Number} [dy_min]
 * @param {Number} [dx_max]
 * @param {Number} [dy_max]
 * @return {!eYo.Rect} the receiver
 */
eYo.Rect_p.xyOutset = function (dx_min, dy_min, dx_max, dy_max) {
  if (!eYo.isDef(dx_min)) {
    dx_min = dx_max = eYo.unit.x / 2
    dy_min = dy_max = eYo.unit.y / 4
  } else if (eYo.isDef(dx_min.x)) {
    dy_min = dy_max = dx_min.y
    dx_min = dx_max = dx_min.x
  } else {
    if (!eYo.isDef(dy_min)) {
      dy_min = dx_min
    }
    if (!eYo.isDef(dx_max)) {
      dx_max = dx_min
    }
    if (!eYo.isDef(dy_max)) {
      dy_max = dy_min
    }
  }
  this.x_min_ -= dx_min
  this.x_max_ += dx_min + dx_max
  this.y_min_ -= dy_min
  this.y_max_ += dy_min + dy_max
  return this
}

/**
 * Whether the receiver contains the given point.
 * @param {Number | eYo.Where} x
 * @param {Number} [y]
 * @return {Boolean}
 */
eYo.Rect_p.xyContains = function (x, y) {
  if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
    var c = x.x / eYo.unit.x
    var l = y.x / eYo.unit.y
  } else {
    c = x.c
    l = x.l
    if (!eYo.isDef(x.c) || !eYo.isDef(x.l)) {
      c = x / eYo.unit.x
      l = y / eYo.unit.y
    }
  }
  return c >= this.c_min && c <= this.c_max
    && l >= this.l_min && l <= this.l_max
}

/**
 * Union with the `Rect`.
 * @param {eYo.Rect} rect
 * @return {eYo.Rect} the receiver
 */
eYo.Rect_p.union = function (rect) {
  var a = rect.x
  if (a < this.x) {
    this.x_ = a
  }
  a = rect.right
  if (this.right < a) {
    this.right_ = a
  }
  a = rect.y
  if (a < this.y) {
    this.y_ = a
  }
  a = rect.bottom
  if (this.bottom < a) {
    this.bottom_ = a
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
    r.height_ = b.top - a.top
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
    r.y_ = b_bottom
    r.height_ = a_bottom - b_bottom
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
    r.width_ = b.left - a.left
    r.height_ = height
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
  return eYo.NA
}
