/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Span object to store the dimensions
 * in order to support doc strings and continuation lines.
 * we may have the following situation:
 * ```
 * print('''foo
 *         |bar'''); print('''foo
 *                         |bar'''); print('''foo
 *                                           |bar''')
 * ```
 * Both print statements have 2 main lines.
 * The first print has 0 header line, 2 footer lines.
 * The second print has 1 header line, 1 footer line.
 * The third print has 2 header lines, 0 footer line.
 * An expression brick has no header lines nor footer lines.
 * The initial values are set to 0, except the column and main lines
 * which are respectively 2, one for each end, and 1.
 * During runtime, all the number of lines are modified relatively.
 * 
 * We do not make difference between expressions,
 * group bricks and simple statement bricks
 * despite that groups cannot have headers, only footers,
 * statements cannot have black line and expression have no right padding.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Span')

goog.require('eYo.Unit')
goog.forwardDeclare('eYo.Brick')

/**
 * Class for a Span object.
 * A span object stores various dimensions of a brick, in text units.
 * Each node has a span object.
 * Any public action is expected to behave atomically.
 * The state is always in a consistent state.
 * However, the span state may not be consistent with the brick state.
 * For edython.
 * @param {!eYo.Brick} brick The brick owning the span.
 * @constructor
 * @property {eYo.Brick} brick - The owner brick
 * @readonly
 * @property {number} width - The width, in workspace coordinates.
 * @readonly
 * @property {number} height - The height, in workspace coordinates.
 * @property {number} c_min - The minimum number of columns
 * @property {number} c_padding - The extra padding at the right
 * @property {number} c - The full number of columns
 * @property {number} l - The full number of lines
 * @property {number} main - The number of main lines
 * @property {number} black - The number of black lines
 * @property {number} suite - The number of suite lines
 * @property {number} foot - The number of foot lines
 * @property {number} header - The number of header lines
 * @property {number} footer - The number of footer lines
 */
eYo.Span = function (brick) {
  this.brick_ = brick
}

// default property values
Object.defineProperties(eYo.Span.prototype, {
  brick_: { value: undefined, writable: true },
  c_min_: { value: 2, writable: true },
  l_: { value: 1, writable: true },
  header_: { value: 0, writable: true },
  main_: { value: 1, writable: true },
  black_: { value: 0, writable: true },
  footer_: { value: 0, writable: true },
  suite_: { value: 0, writable: true },
  foot_: { value: 0, writable: true }
})


/**
 * @type {Number} positive number of indentation spaces.
 */
eYo.Span.INDENT = 4

// Public readonly properties
Object.defineProperties(eYo.Span.prototype, {
  brick: {
    get () {
      return this.brick_
    }
  },
  width: {
    get () {
      return this.c_min_ * eYo.Unit.x
    }
  },
  x: {
    get () {
      return this.width
    }
  },
  /**
   * This is the total number of columns in that block.
   * At least two.
   */
  c: {
    get () {
      return this.c_min_
    }
  },
  /**
   * This is the total number of lines in that block.
   * At least one.
   */
  l: {
    get () {
      return this.l_
    }
  },
  height: {
    get () {
      return this.l_ * eYo.Unit.y
    }
  },
  y: {
    get () {
      return this.height
    }
  },
  /**
   * The main count is the number of main lines in statements.
   * A statement has one main line in general.
   * When there is a doc string inside the statement,
   * the main line might be bigger:
   * ```
   * print('abc')
   * ```
   * has exactly one main line whereas
   * ```
   * print('''foo
   * bar''')
   * ```
   * has exactly two main lines.
   * When there is more than one main line,
   * the horizontal siblings may have header and footer counts.
   */
  main: {
    get () {
      return this.main_ // 1 or more
    }
  },
  footer: {
    get () {
      return this.footer_
    }
  }
})
// Public computed properties:
Object.defineProperties(eYo.Span.prototype, {
  /**
   * Groups need a suite, but may not be provided with one.
   * The black count is used to display a hole,
   * where bricks should be connected.
   */
  black: {
    get () {
      return this.black_ // 0 or 1
    },
    set (newValue) {
      if (this.black_ === newValue) {
        return
      }
      this.addBlack(newValue ? 1 : -1)
    }
  },
  foot: {
    get () {
      return this.foot_
    },
    set (newValue) {
      this.addFoot(newValue - this.foot_)
    }
  },
  suite: {
    get () {
      return this.suite_
    },
    set (newValue) {
      this.addFoot(newValue - this.suite_)
    }
  },
  header: {
    get () {
      return this.header_
    },
    set (newValue) {
      this.addHeader(newValue - this.header_)
    }
  },
})

/**
 * Dispose of the receiver's resources.
 */
eYo.Span.prototype.dispose = function () {
}

// computed private properties
Object.defineProperties(eYo.Span.prototype, {
  parentSpan_: {
    get () {
      var p = this.brick.parent
      return p && p.span
    }
  },
  rightSpan_: {
    get () {
      var b3k = this.brick.right
      return b3k && b3k.span
    }
  },
  leftSpan_: {
    get () {
      var b3k = this.brick.left
      return b3k && b3k.span
    }
  }
})

/**
 * Set the right padding column number.
 * Used to align the right edges of statement blocks.
 * @param {Number} padding  the new value of the padding, a non negative number.
 */
eYo.Span.prototype.setPadding = function (padding) {
  if (padding>=0) {
    var right = this.rightSpan
    if (right) {
      // cascade to all the right statements
      right.setPadding(delta)
      this.c_ = this.c_min_
    } else {
      this.brick.incrementChangeCount()
      if (this.brick.isGroup && !this.brick.right) {
        this.c_min_ + padding >= 2 * eYo.Span.INDENT
        var min = 2 * eYo.Span.INDENT - this.c_min_
        if (padding < min) {
          padding = min
        }
      }
      this.padding_ = padding
      this.c_ = this.c_min_ + padding  
    }
  }
}

/**
 * Change the number of columns.
 * This may occur at initialization time, when fields are edited, when input bricks are added, removed or edited.
 * The suite bricks, if any, influence the padding.
 * @param {Number} delta  the difference from the old value to value and the old one.
 */
eYo.Span.prototype.addC = function (delta) {
  if (delta) {
    this.brick.incrementChangeCount()
    this.c_min_ += delta
    this.c_ += delta
    if (this.brick.isExpr) {
      var parent = this.parentSpan
      if (parent) {
        parent.addC(delta)
      }
    }
  }
}

/**
 * Change the number of columns.
 * This may occur at initialization time, when fields are edited, when input bricks are added, removed or edited.
 * The suite bricks, if any, influence the padding.
 * @param {Number} delta  the difference from the old value to value and the old one.
 */
eYo.Span.prototype.addC = function (delta) {
  if (delta) {
    this.brick.incrementChangeCount()
    this.c_min_ += delta
    this.c_ += delta
    if (this.brick.isExpr) {
      var parent = this.parentSpan
      if (parent) {
        parent.addC(delta)
      }
    }
  }
}

/**
 * Add to the header line number.
 * This may happen only in 3 situation:
 * 1) the left brick changes its header line number
 * 2) The left brick changes its main line number
 * 3) the left connection changes
 * @param {Number} delta  the value to add to the ressource.
 */
eYo.Span.prototype.addHeader = function (delta) {
  if (delta) {
    this.brick.incrementChangeCount()
    this.header_ += delta
    this.l_ += delta
    var right = this.rightSpan
    if (right) {
      // cascade to all the right statements
      right.addHeader(delta)
    }
  }
}

/**
 * Add to the main line number.
 * This may happen in 3 situations:
 * 1) a target brick with more than one line has been connected to
 * one of the brick input magnets.
 * 2) a line break is added inside a list (continuation lines)
 * 3) an input brick has changed its height.
 * As a consequence, the main line number of the receiver is changed
 * accordingly. This change is cascaded ot the left and the right,
 * and possibly to the head.
 * @param {Number} delta  the value to add to the ressource.
 */
eYo.Span.prototype.addMain = function (delta) {
  if (delta) {
    this.brick.incrementChangeCount()
    this.main_ += delta
    this.l_ += delta
    // propagates to the right
    var right = this.rightSpan
    if (right) {
      right.addHeader(delta)
    }
    // propagates to the left
    this.addLeft_(delta)
  }
}

/**
 * Convenient method
 * @param {Number} delta  the value to add to the ressource.
 */
eYo.Span.prototype.addLeft_ = function (delta) {
  var left = this.leftSpan
  if (left) {
    left.addFooter(delta)
  } else {
    this.addParent_(delta)
  }
}

/**
 * Convenient method
 * @param {Number} delta  the value to add to the ressource.
 */
eYo.Span.prototype.addParent_ = function (delta) {
  var parent = this.parentSpan
  if (parent) {
    this.brick.isTop
      ? parent.addSuite(delta)
      : parent.addFoot(delta)
  }
}

/**
 * Add to the footer line number.
 * This may happen only in 3 situation:
 * 1) the right brick changes its footer line number
 * 2) The right brick changes its main line number
 * 3) The right connection changes
 * @param {Number} delta  the value to add to the ressource.
 */
eYo.Span.prototype.addFooter = function (delta) {
  if (delta) {
    this.foot_ += delta
    this.l_ += delta
    this.brick.incrementChangeCount()
    this.addLeft_(delta)
  }
}

/**
 * Add to the black line number.
 * This may happen only in on of 2 situation:
 * 1) the suite magnet connection status changes
 * 2) the right magnet connection status changes
 * @param {Number} delta  the value to add to the ressource.
 * Actually it can only be 1 or -1.
 */
eYo.Span.prototype.addBlack = function (delta) {
  if (delta && this.brick.isGroup) {
    this.brick.incrementChangeCount()
    this.black_ += delta
    this.l_ += delta
    // change can only propagate to the parent
    // because groups have no left blocks.
    this.addParent_(delta)
  }
}

/**
 * Add to the black line number.
 * This may happen only in on of 2 situation:
 * 1) the suite magnet connection status changes
 * 2) the right magnet connection status changes
 * @param {Number} delta  the value to add to the ressource.
 * Actually it can only be 1 or -1.
 */
eYo.Span.prototype.addFoot = function (delta) {
  if (delta) {
    this.brick.incrementChangeCount()
    this.foot_ += delta
    this.l_ += delta
    this.addParent_(delta)
  }
}

/**
 * Add to the black line number.
 * This may happen only in on of 2 situation:
 * 1) the suite magnet connection status changes
 * 2) the right magnet connection status changes
 * @param {Number} delta  the value to add to the ressource.
 * Actually it can only be 1 or -1.
 */
eYo.Span.prototype.addSuite = function (delta) {
  if (delta) {
    this.brick.incrementChangeCount()
    this.suite_ += delta
    this.l_ += delta
    this.addParent_(delta)
  }
}

/**
 * Sets from the given location (`Where`).
 * @param {Number | Object!} c  Number or object with `c` and `l` number properties.
 * @param {Number} l  Number, when `c` is also a number, defaults to 1.
 */
eYo.Span.prototype.init = function (c = 0, l = 0) {
  if (goog.isDef(c.c)) {
    l = c.l
    c = c.c
  }
  this.c = c
  this.main = l + 1
}

/**
 * Sets from the given location (`Where`).
 * @param {Object!} w  Object with `c` and `l` number properties.
 */
eYo.Size.prototype.setFromWhere = function (w) {
  this.set(w.c, w.l + 1)
}

