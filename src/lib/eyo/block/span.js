/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Block delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Span')
goog.require('eYo.Unit')
goog.forwardDeclare('eYo.Delegate')

/**
 * Class for a Span object.
 * A span object stores various dimensions of a block, in text units.
 * Each node has a span object.
 * For edython.
 * @param {!Object} owner The node owning the span.
 * @constructor
 * @property {object} owner - The owner
 * @readonly
 * @property {number} width - The width, in workspace coordinates.
 * @readonly
 * @property {number} height - The height, in workspace coordinates.
 * @property {number} c - The number of columns, all other properties are numbers of lines
 * @property {number} l - The full number of lines
 * @property {number} main - The number of main lines
 * @property {number} black - The number of black lines
 * @property {number} suite - The number of suite lines
 * @property {number} next - The number of next lines
 * @property {number} head - The number of head lines
 * @property {number} foot - The number of black lines
 */
eYo.Span = function (owner) {
  this.owner = owner
  this.c_ = this.l_ = this.main_ = this.black_ = this.suite_ = this.next_ = this.head_ = this.foot_ = 0
}

Object.defineProperties(eYo.Span.prototype, {
  parentSpan: {
    get () {
      return this.owner.parent && this.owner.parent.span 
    }
  },
  width: {
    get () {
      return this.c * eYo.Unit.x
    }
  },
  l: {
    get () {
      return this.l_
    },
    set (newValue) {
      this.l_ = newValue
    }
  },
  height: {
    get () {
      return this.l_ * eYo.Unit.y
    }
  },
  /**
   * This is not yet used.
   * When we have support for doc strings,
   * we may have the following situation:
   * ```
   * print('''foo
   *         |bar'''); print('''foo
   *                         |bar'''); print('''foo
   *                                           |bar''')
   * ```
   * Both print statements have 2 main lines.
   * The first print has 0 head line, 2 foot lines.
   * The second print has 1 head line, 1 foot line.
   * The third print has 2 head lines, 0 foot line.
   */
  head: {
    get () {
      return this.head_
    },
    set (newValue) {
      var d = newValue - this.head_
      if (d) {
        this.owner.incrementChangeCount()
        this.head_ = newValue
        this.l_ += d
        var right = this.rightSpan
        if (right) {
          // cascade to the right most statement
          right.head += d
        }
      }
    }
  },
  rightSpan: {
    get () {
      return this.owner.right &&  this.owner.right.span
    }
  },
  foot: {
    get () {
      return this.foot_
    },
    set (newValue) {
      var d = newValue - this.foot_
      if (d) {
        this.owner.incrementChangeCount()
        this.foot_ = newValue
        this.l_ += d
        var left = this.leftSpan
        if (left) {
          // cascade to the left most statement
          left.foot += d
        }
      }
    }
  },
  leftSpan: {
    get () {
      return this.owner.left &&  this.owner.left.span
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
   * the horizontal siblings may have head and foot counts.
   */
  main: {
    get () {
      return this.main_ // 1 or more
    },
    set (newValue) {
      var d = newValue - this.main_
      if (d) {
        this.owner.incrementChangeCount()
        var old = this.main_
        this.main_ = newValue
        this.l_ += d
        var right = this.rightSpan
        if (right) {
          // if this is the first time, initialize this part with d - 1
          right.head += old ? d : d - 1
        }
        var parent = this.parentSpan
        if (parent) {
          if (parent.next === this) {
            parent.next += d
          } else if (parent.right === this) {
            // parent is a left node
            parent.foot += old ? d : d - 1
          } else {
            parent.suite += d
          }
        }
      }
    }
  },
  /**
   * Groups need a suite, but may not be provided with one.
   * The black count is used to display a hole,
   * where blocks should be connected.
   */
  black: {
    get () {
      return this.black_ // 0 or 1
    },
    set (newValue) {
      var d = newValue - this.black_
      if (d) {
        this.owner.incrementChangeCount()
        this.black_ = newValue
        this.l_ += d
        var parent = this.parentSpan
        if (parent) {
          // next is not a good design
          // because black_ has not a straightforward definition
          if (parent.next === this) {
            parent.next += d
          } else {
            parent.suite += d
          }
        }
      }
    }
  },
  suite: {
    get () {
      return this.suite_
    },
    set (newValue) {
      var d = newValue - this.suite_
      if (d) {
        this.owner.incrementChangeCount()
        this.suite_ = newValue
        this.l_ += d
        var parent = this.parentSpan
        if (parent) {
          // next is not a good design
          // because suite_ has not a straightforward definition
          if (parent.next === this) {
            parent.next += d
          } else {
            parent.suite += d
          }
        }
      }
    }
  },
  next: {
    get () {
      return this.next_
    },
    set (newValue) {
      var d = newValue - this.next_
      if (d) {
        this.next_ = newValue
        this.l_ += d
        this.owner.incrementChangeCount()
        var parent = this.parentSpan
        if (parent) {
          if (parent.next === this) {
            parent.next += d
          } else {
            parent.suite += d
          }
        }
      }
    }
  }
})

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

