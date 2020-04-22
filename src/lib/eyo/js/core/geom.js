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
eYo.require('font')
eYo.require('p6y')
eYo.require('o4t')

/**
 * unit
 */

// x, y, with, height are in pixels
// c, l, w, h are in text units

/**
 * @name{eYo.geom}
 * @namespace
 */
eYo.c9r.makeNS(eYo, 'geom', {})

Object.defineProperties(eYo.geom, {
  X: eYo.descriptorR(function () {
    return eYo.font.space
  }),
  Y: eYo.descriptorR(function  () {
    return eYo.font.lineHeight
  }),
  REM: eYo.descriptorR(function  () {
    return parseFloat(getComputedStyle(document.documentElement).fontSize)
  }),
  C: eYo.descriptorR(function  () {
    return 2
  }),
  L: eYo.descriptorR(function  () {
    return 4
  }),
})

eYo.geom.makeBaseC9r(true)

eYo.geom.BaseC9r.eyo.finalizeC9r(['aliases'], {
  properties: {
    [eYo.model.ANY]: eYo.p6y.BaseC9r
  },
})
eYo.geom.BaseC9r.eyo.p6yEnhanced()

eYo.geom.enhancedO4t()

/**
 * Declare the given model for the associate constructor.
 * The default implementation calls `methodsMerge`.
 * @param {Object} model - Object, like for |makeC9r|.
 */
eYo.geom.Dlgt_p.modelMerge = function (model) {
  model.aliases && this.p6yAliasesMerge(model.aliases)
  model.properties && this.p6yMerge(model.properties)
  model.methods && this.methodsMerge(model.methods)
}

/**
 * `AbstractPoint` is modelling a planar point that stores its coordinates in text units.
 * Only computed properties are declared.
 * Orientation is from top to bottom and from left to right.
 * @name {eYo.geom.AbstractPoint}
 * @constructor
 * @param {Number} c - Horizontal coordinates, or another planar object.
 */
eYo.geom.makeC9r('AbstractPoint', {
  properties: {
    /**
     * Horizontal position in pixels
     * @type {Number}
     */
    x: {
      get () {
        return this.c_ * eYo.geom.X
      },
      set (after) {
        this.c_ = after / eYo.geom.X
      }
    },
    /**
     * Vertical position in pixels
     * @type {Number}
     */
    y: {
      get () {
        return this.l_ * eYo.geom.Y
      },
      set (after) {
        this.l_ = after / eYo.geom.Y
      }
    },
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
     * @type {eYo.geom.Point}
     */
    copy: {
      get () {
        return new eYo.geom.Point(this)
      }
    },
    /**
     * Human readable description.
     * @return {String}
     */
    description: {
      get () {
        return `eYo.geom.Point(c: ${this.c}, l: ${this.l}, x: ${this.x}, y: ${this.y})`
      },
    }
  },
  aliases: {
    c: ['dc', 'w'],
    l: ['dl', 'h'],
    x: ['dx', 'width'],
    y: ['dy', 'height'],
  }
})

eYo.geom.AbstractPoint.eyo.finalizeC9r()

/**
 * Test equality between the receiver and the rhs.
 */
eYo.geom.AbstractPoint_p.equals = function (rhs) {
  return rhs instanceof eYo.geom.Point && this.c_ == rhs.c_ && this.l_ == rhs.l_
}

/**
 * Like `advance` but sets the coordinates, instead of advancing them.
 * @param {Number | eYo.geom.Point | Event | Object} c
 * @param {Number} [l]
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.AbstractPoint_p.set = function (c = 0, l = 0) {
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
 * Setter.
 * @param {Number} x  x coordinate
 * @param {Number} y  y coordinate
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.AbstractPoint_p.xySet = function (x = 0, y = 0) {
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
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.geom.Point | eYo.geom.Size} c
 * @param {number} l
 * @return {eYo.geom.Point}
 */
eYo.geom.AbstractPoint_p.forward = function (c = 0, l = 0) {
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
 * @param {number | eYo.geom.Point | eYo.geom.Size} c
 * @param {number} l
 * @return {eYo.geom.Point} c
 */
eYo.geom.AbstractPoint_p.backward = function (c = 0, l = 0) {
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
 * @param {number} x
 * @param {number} y
 * @return {eYo.geom.Point}
 */
eYo.geom.AbstractPoint_p.xyForward = function (x = 0, y = 0) {
  if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
    y = x.y
    x = x.x
  }
  this.x_ += x
  this.y_ += y
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * Board coodinates
 * @param {number} x
 * @param {number} y
 * @return {eYo.geom.Point}
 */
eYo.geom.AbstractPoint_p.xyBackward = function (x = 0, y = 0) {
  if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
    y = x.y
    x = x.x
  }
  this.x_ -= x
  this.y_ -= y
  return this
}

/**
 * Scale the receiver.
 * @param {Number | Object} scaleX
 * @param {Number} [scaleY] - Defaults to
 * @return {eYo.geom.Point} the receiver
 */
eYo.geom.AbstractPoint_p.scale = function (scaleX, scaleY) {
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
 * @return {eYo.geom.Point} the receiver
 */
eYo.geom.AbstractPoint_p.unscale = function (scaleX, scaleY) {
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
 * @param {eYo.geom.Point} other
 * @return {number} non negative number
 */
eYo.geom.AbstractPoint_p.distance = function (other) {
  var dx = this.x - other.x
  var dy = this.y - other.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Test container.
 * Returns true iff the receiver is inside the given rect.
 * Rounding errors are taken into account.
 * @param {eYo.geom.Rect} rect
 * @return {Boolean}
 */
eYo.geom.AbstractPoint_p.in = function (rect) {
  return eYo.greater(this.c, rect.c_min)
    && eYo.greater(rect.c_max, this.c)
    && eYo.greater(this.l, rect.l_min)
    && eYo.greater(rect.l_max, this.l)
}

/**
 * Test container.
 * Opposite of `in`, except for the rect boundary. A point of the rect boundary is in and out the rect.
 * Rounding errors are taken into account.
 * @param {eYo.geom.Rect} rect
 * @return {Boolean} non negative number
 */
eYo.geom.AbstractPoint_p.out = function (rect) {
  return eYo.greater(this.c, rect.c_max)
    || eYo.greater(rect.c_min, this.c)
    || eYo.greater(this.l, rect.l_max)
    || eYo.greater(rect.l_min, this.l)
}

/**
 * `Point` is modelling a planar point that stores its coordinates in text units.
 * When `snap` is true, the coordinates are snapped to half integers horizontally and quarter integers vertically.
 * Orientation is from top to bottom and from left to right.
 * @name {eYo.geom.Point}
 * @constructor
 * @param {*} ... - See the implementation.
 */
eYo.geom.makeC9r('Point', eYo.geom.AbstractPoint, {
  init (c, l, snap) {
    if (eYo.isBool(c)) {
      [snap, c, l] = [c, l, snap]
    } else if (eYo.isBool(l)) {
      [snap, l] = [l, snap]
    } else {
      snap = c && !!c.snap || !!snap
    }
    this.snap_ = snap
    this.set(c, l)
  },
  properties: {
    /**
     * Horizontal position in text unit
     * @type {Number}
     */
    c: {
      value: 0,
      validate (after) {
        if (!eYo.isDef(this)) {
          console.error('BREAK HERE!!!')
        }
        return this.snap_ ? Math.round(after * eYo.geom.C) / eYo.geom.C : after
      },
    },
    /**
     * Vertical position in text unit
     * @type {Number}
     */
    l: {
      value: 0,
      validate (after) {
        return this.snap_ ? Math.round(after * eYo.geom.L) / eYo.geom.L : after
      },
    },
  },
})

eYo.geom.Point.eyo.finalizeC9r()

/**
 * Convenient creator.
 * @param {Number} x - x coordinate
 * @param {Number} y - y coordinate
 * @param {Boolean} snap - Whether the receiver should snap to the grid
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.xyPoint = function (x, y, snap) {
  var y
  if (eYo.isBool(x)) {
    var _ = x
    [x, y, snap] = [y, snap, x]
  } else if (eYo.isBool(y)) {
    [y, snap] = [snap, y]
  } else {
    snap = !!x.snap || !!snap
  }
  return new eYo.geom.Point(snap).xySet(x, y)
}

/**
 * Convenient creator in text units.
 * @param {Number} [c] - c coordinate. Defaults to 0.
 * @param {Number} [l] - l coordinate. Defaults to 0.
 * @param {Boolean} [snap] - snap flag. Defaults to false.
 * @return {eYo.geom.Point} The receiver
 */
eYo.geom.clPoint = function (c, l, snap) {
  return new eYo.geom.Point(c, l, snap)
}

/**
 * `Size` is a synonym of Where.
 */
eYo.geom.Size = eYo.geom.Point

/**
 * Sets from the given text.
 * @param {String!} s
 * @return {eYo.geom.Size} the receiver.
 */
eYo.geom.Point_p.setFromText = function (txt) {
  if (!eYo.isDef(txt)) {
    console.error('BREAK HERE!')
  }
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
  return new eYo.geom.Size().setFromText(txt)
}

/**
 * @name{eYo.geom.Rect}
 * `Rect` stores its coordinates in text units.
 * Class for representing rectangular regions.
 * @param {number} c Left, in text units.
 * @param {number} l Top, in text units.
 * @param {number} w Width, in text units.
 * @param {number} h Height, in text units.
 * @struct
 * @constructor
 */
eYo.geom.makeC9r('AbstractRect', {
  init (c, l, w, h, snap) {
    this.set(c, l, w, h, snap)
  },
  aliases: {
    origin: 'topLeft',
    // Basic properties in text dimensions.
    // When in text dimensions,
    // setters round their arguments to half width and quarter height.
    // Except for left, right, top and bottom,
    // the position setters won't change the size.
    'origin.c': ['c', 'c_min'],
    'origin.l': ['l', 'l_min'],
    'size.w': 'w',
    'size.h': 'h',
    // basic properties in board dimensions
    'origin.x': ['x', 'x_min'],
    'origin.y': ['y', 'y_min'],
    'size.width': 'width',
    'size.height': 'height',
  },
  properties: {
    origin: {
      value () {
        return new eYo.geom.Point()
      },
      copy: true,
      set (stored, after) {
        stored.xySet(after)
      }
    },
    size: {
      value () {
        return new eYo.geom.Size()
      },
      copy: true,
      set (stored, after) {
        stored.xySet(after)
      },
    },
    /**
     * Translation: the size size does not change.
     */
    c_mid: {
      after: ['c', 'w'],
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
      after: ['c', 'w'],
      get () {
        return this.c + this.w
      },
      set (after) {
        this.c_ = after - this.w
      }
    },
    l_mid: {
      after: ['l', 'h'],
      get () {
        return this.l + this.h / 2
      },
      set (after) {
        this.l_ = after - this.h / 2
      }
    },
    l_max: {
      after: ['l', 'h'],
      get () {
        return this.l + this.h
      },
      set (after) {
        this.l_ = after - this.h
      }
    },
    // Convenient setters in board coordinates
    x_mid: {
      after: ['x', 'width'],
      get () {
        return this.x + this.width / 2
      },
      set (after) {
        this.x_ = after - this.width / 2
      }
    },
    x_max: {
      after: ['x', 'width'],
      get () {
        return this.x + this.width
      },
      set (after) {
        this.x_ = after - this.width
      }
    },
    y_mid: {
      after: ['y', 'height'],
      get () {
        return this.y + this.height / 2
      },
      set (after) {
        this.y_ = after - this.height / 2
      }
    },
    y_max: {
      after: ['y', 'height'],
      get () {
        return this.y + this.height
      },
      set (after) {
        this.y_ = after - this.height
      }
    },
    //// The setters change the width, but does not change the `right`
    left: {
      after: ['x', 'width', 'x_min', 'x_max'],
      get () {
        return this.x
      },
      set (after) {
        this.width_ = this.x_max - after
        this.x_min_ = after
      }
    },
    top: {
      after: ['y', 'height', 'y_min', 'y_max'],
      get () {
        return this.y
      },
      /**
       * The height does not change.
       * @param {Number} after 
       */
      set (after) {
        this.height_ = this.y_max - after
        this.y_min_ = after
      }
    },
    right: {
      after: ['left', 'width', 'x_max'],
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
      after: ['top', 'height', 'y_max'],
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
    bottomRight: {
      after: ['x_max', 'y_max'],
      get () {
        return this.origin.forward(this.size_)
      },
      set (after) {
        this.x_max_ = after.x
        this.y_max_ = after.y
      }
    },
    center: {
      after: ['origin', 'size'],
      get () {
        return this.origin.forward(this.size.unscale(2))
      },
      /**
       * Change the origin but keeps the size.
       */
      set (after) {
        this.origin_ = after.addvance(this.size.unscale(-2))
      }
    },
    /**
     * clone the receiver.
     * @type {eYo.geom.Rect}
     */
    copy: {
      get () {
        return new eYo.geom.Rect(this)
      },
    },
    /**
     * String representation of the receiver.
     * @return {String} a string
     */
    description: {
      get () {
        return `${this.eyo.name}(c: ${this.c}, l: ${this.l}, w: ${this.w}, h: ${this.h})`
      },
    },
    /**
     * String representation of the receiver.
     * @return {String} a string
     */
    xyDescription: {
      get () {
        return `${this.eyo.name}(x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height})`
      },
    },
    /**
     * Width of the draft part of the board.
     * @return {number} non negative number
     */
    draft: {
      get () {
        return Math.max(0, -this.x)
      },
    },
    /**
     * Width of the main part of the board.
     * `0` when in flyout.
     * @return {number} non negative number
     */
    main: {
      get () {
        return Math.min(this.width, this.width + this.x)
      },
    },
  },
})

eYo.geom.AbstractRect.eyo.finalizeC9r()


/**
 * Dispose of the receiver's resources.
 */
eYo.geom.AbstractRect_p.dispose = eYo.doNothing

/**
 * set the `Rect`.
 * This is a very very permissive setter.
 * @param{?Number|eYo.geom.Point|Element} c
 * @param{?Number|eYo.geom.Size} l
 * @param{?Number|eYo.geom.Size} w
 * @param{?Number} h
 * @return {eYo.geom.Rect} The receiver
 */
eYo.geom.AbstractRect_p.set = function (c = 0, l = 0, w = 0, h = 0) {
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
      this.c_ = l
      this.l_ = w
    }
  } else {
    this.c_ = c
    this.l_ = l
    if (eYo.isDef(w.x) && eYo.isDef(w.y)) {
      this.size_ = w
    } else if (eYo.isDef(w.width) && eYo.isDef(w.height)) {
      this.size_ = w
    } else {
      this.w_ = w
      this.h_ = h
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
 * @return {eYo.geom.Rect} The receiver
 */
eYo.geom.AbstractRect_p.xySet = function (x = 0, y = 0, width = 0, height = 0) {
  if (eYo.isNA(x.x) || eYo.isNA(x.y)) {
    this.origin_.xySet(x, y)
    this.size_.xySet(width, height)
  } else {
    this.origin_.set(x)
    this.size_.xySet(y, width)
  }
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.geom.Point | eYo.geom.Size} c
 * @param {number} l
 * @return {eYo.geom.Rect}
 */
eYo.geom.AbstractRect_p.forward = function (c = 0, l = 0) {
  this.origin_.forward(c, l)
  return this
}

/**
 * Like `set` but advance the coordinates, instead of setting them.
 * @param {number | eYo.geom.Point | eYo.geom.Size} c
 * @param {number} l
 * @return {eYo.geom.Rect}
 */
eYo.geom.AbstractRect_p.backward = function (c = 0, l = 0) {
  this.origin_.backward(c, l)
  return this
}


/**
 * Test equality between the receiver and the rhs.
 * Takes rounding errors into account.
 * @param {eYo.geom.Rect} rhs
 */
eYo.geom.AbstractRect_p.equals = function (rhs) {
  return rhs instanceof eYo.geom.Rect && this.origin_.equals(rhs.origin_) && this.size_.equals(rhs.size_)
}

/**
 * Scale the receiver.
 * @param {Number | Object} scaleX  Must be positive.
 * @param {Number} [scaleY]  Must be positive when defines, defaults to scaleX.
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.scale = function (scaleX, scaleY) {
  this.origin_.scale(scaleX, scaleY)
  this.size_.scale(scaleX, scaleY)
  return this
}

/**
 * Unscale the receiver.
 * @param {Number} scaleX  Must be positive.
 * @param {Number} [scaleY]  Must be positive when defines, defaults to scaleX.
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.unscale = function (scaleX, scaleY) {
  this.origin_.unscale(scaleX, scaleY)
  this.size_.unscale(scaleX, scaleY)
  return this
}

/**
 * Mirror the receiver vertically and horizontally.
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.mirror = function () {
  // size does not change, only max <-> -min
  this.x_max_ = -this.x
  this.y_max_ = -this.y
  return this
}

/**
 * Inset the receiver.
 * Default values are `eYo.geom.X / eYo.geom.C` and `eYo.geom.Y / eYo.geom.L`
 * @param {Number|eYo.geom.Point} [dx_min]
 * @param {Number} [dy_min]
 * @param {Number} [dx_max]
 * @param {Number} [dy_max]
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.xyInset = function (dx_min, dy_min, dx_max, dy_max) {
  if (!eYo.isDef(dx_min)) {
    dx_min = dx_max = eYo.geom.X / eYo.geom.C
    dy_min = dy_max = eYo.geom.Y / eYo.geom.L
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
  if (this.width > 0) {
    if (eYo.greater(dx_min + dx_max, this.width)) {
      dx_min = this.width * dx_min / (dx_min + dx_max)
      this.left_ += dx_min
      this.w_ = 0
    } else {
      this.left_ += dx_min
      this.right_ -= dx_max  
    }
  }
  if (this.height > 0) {
    if (eYo.greater(dy_min + dy_max, this.height)) {
      dy_min = this.height * dy_min / (dy_min + dy_max)
      this.top_ += dy_min
      this.h_ = 0
    } else {
      this.top_ += dy_min
      this.bottom_ -= dy_max
    }
  }
  return this
}

/**
 * outset the receiver.
 * Default values are `eYo.geom.X / eYo.geom.C` and `eYo.geom.Y / eYo.geom.L`
 * @param {Number|eYo.geom.Point} [dx_min]
 * @param {Number} [dy_min]
 * @param {Number} [dx_max]
 * @param {Number} [dy_max]
 * @return {!eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.xyOutset = function (dx_min, dy_min, dx_max, dy_max) {
  if (!eYo.isDef(dx_min)) {
    dx_min = dx_max = eYo.geom.X / eYo.geom.C
    dy_min = dy_max = eYo.geom.Y / eYo.geom.L
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
  this.left_ -= dx_min
  this.right_ += dx_max
  this.top_ -= dy_min
  this.bottom_ += dy_max
  return this
}

/**
 * Whether the receiver contains the given point.
 * @param {Number | eYo.geom.Point} x
 * @param {Number} [y]
 * @return {Boolean}
 */
eYo.geom.AbstractRect_p.xyContains = function (x, y) {
  if (eYo.isDef(x.x) && eYo.isDef(x.y)) {
    var c = x.x / eYo.geom.X
    var l = x.y / eYo.geom.Y
  } else {
    c = x.c
    l = x.l
    if (eYo.isNA(c) || eYo.isNA(l)) {
      c = x / eYo.geom.X
      l = y / eYo.geom.Y
    }
  }
  return eYo.greater(c, this.c_min)
  && eYo.greater(this.c_max, c)
  && eYo.greater(l, this.l_min)
  && eYo.greater(this.l_max, l)
}

/**
 * Union with the `Rect`.
 * Extendes the receiver to include the given rect.
 * @param {eYo.geom.Rect} rect
 * @return {eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.unionRect = function (rect) {
  let left = Math.min(this.x_min, rect.x_min)
  let right = Math.max(this.x_max, rect.x_max)
  let top = Math.min(this.y_min, rect.y_min)
  let bottom = Math.max(this.y_max, rect.y_max)
  this.left_ = left
  this.right_ = right
  this.top_ = top
  this.bottom_ = bottom
  return this
}

/**
 * Union with the `Rect`.
 * Extendes the receiver to include the given rect.
 * @param {eYo.geom.Rect} rect
 * @return {eYo.geom.Rect} the receiver
 */
eYo.geom.AbstractRect_p.intersectionRect = function (rect) {
  let left = Math.max(this.x_min, rect.x_min)
  let right = Math.min(this.x_max, rect.x_max)
  let top = Math.max(this.y_min, rect.y_min)
  let bottom = Math.min(this.y_max, rect.y_max)
  if (right >= left && bottom >= top) {
    this.left_ = left
    this.right_ = right
    this.top_ = top
    this.bottom_ = bottom
    return this  
  }
}

eYo.geom.makeC9r('Rect', eYo.geom.AbstractRect, {})

eYo.geom.Rect.eyo.finalizeC9r()

/**
 * Convenient creator.
 * @param {Number} x  x coordinate
 * @param {Number} y  y coordinate
 * @param {Number} width  x coordinate
 * @param {Number} height  y coordinate
 * @return {eYo.geom.Rect} The newly created rect instance.
 */
eYo.geom.xyRect = function (x = 0, y = 0, width = 0, height = 0) {
  return new eYo.geom.Rect().xySet(x, y, width, height)
}

/**
 * Computes the difference regions between two rectangles. The return value is
 * an array of 0 to 4 rectangles defining the remaining regions of the first
 * rectangle after the second has been subtracted.
 * The only difference with closure implementation is that we keep track
 * of the rectangles order: 0 -> above, 1 -> below, 2 -> left, 3 -> right
 * SEE: https://github.com/google/closure-library/blob/master/closure/goog/math/rect.js#L272
 * @param {eYo.geom.Rect} a A Rectangle.
 * @param {eYo.geom.Rect} b A Rectangle.
 * @return {!Array<?eYo.geom.Rect>} An array with 4 rectangles which
 *     together define the difference area of rectangle a minus rectangle b.
 */
eYo.geom.deltaRect = function(a, b) {
  var ans = [null, null, null, null]

  var top = a.top
  var height = a.height

  var a_right = a.left + a.width
  var a_bottom = a.top + a.height

  var b_right = b.left + b.width
  var b_bottom = b.top + b.height

  if (a_bottom <= b.top) { // b is entirely below a
    ans[0] = new eYo.geom.Rect(a)
    return
  }
  // b.top < a_bottom
  if (b_bottom <= a.top) {
    ans[1] = new eYo.geom.Rect(a)
    return
  }
  // a.top < b_bottom
  // Subtract off any area on top where A extends past B
  if (b.top > a.top) {
    var r = ans[0] = new eYo.geom.Rect(a)
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
    r = ans[1] = new eYo.geom.Rect(a)
    r.y_ = b_bottom
    r.height_ = a_bottom - b_bottom
    height = b_bottom - top
  }
  if (b.right <= a.left) {
    // no intersection
    ans[2] = new eYo.geom.Rect(a)
    return
  }
  // a.left < b.right
  if (a.right <= b.left) {
    // no intersection
    ans[3] = new eYo.geom.Rect(a)
    return
  }
  // b.left < a.right
  // Subtract any area on left where A extends past B
  // We have a.left < b.right and only one of
  // a.left < b.left < b.right
  // b.left <= a.left < b.right
  if (a.left < b.left) {
    r = ans[2] = new eYo.geom.Rect(a)
    r.width_ = b.left - a.left
    r.height_ = height
  }
  // Subtract any area on right where A extends past B
  // We have b.left < a.right and only one of
  // b.left < b.right < a.right
  // b.left < a.right <= b.right
  if (b_right < a_right) {
    ans[3] = eYo.xyRect(_right, top, a_right - b_right, height)
  }
  return ans
}

/**
 * Computes the intersection of the rectangle a and the rectangle b.
 * When the intersection is void, the return value is `eYo.NA`.
 * When the rectangles are side by side, the return rectangle has
 * either 0 width or 0 height,
 * thus representing either a segment or a point.
 * Both rectangles are expected to have the same constructor.
 * A new rectangle is returned when there is
 * a-n intersection, otherwise `eYo.NA` is returnde.
 * @param {eYo.geom.Rect} a - A Rectangle.
 * @param {eYo.geom.Rect} b - A Rectangle.
 * @return {eYo.geom.Rect}
 */
eYo.geom.intersectionRect = function(a, b) {
  var x_min = Math.max(a.x_min, b.x_min)
  var width = Math.min(a.x_max, b.x_max) - x_min
  if (width >= 0) {
    var y_min = Math.max(a.y_min, b.y_min)
    var height = Math.min(a.y_max, b.y_max) - y_min
    if (height >= 0) {
      return new eYo.geom.Rect().xySet(x_min, y_min, width, height)
    }
  }
  return eYo.NA
}
