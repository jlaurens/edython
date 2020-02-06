/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
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
 * statements cannot have hole line and expression have no right padding.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.forwardDeclare('unit')
eYo.forwardDeclare('brick')

/**
 * @name{sYo.span}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'span')

/**
 * @name {eYo.span.Dflt}
 * Class for a Span object.
 * A span object stores various dimensions of a brick, in text units.
 * Each node has a span object.
 * Any public action is expected to behave atomically.
 * The state is always in a consistent state.
 * However, the span state may not be consistent with the brick state.
 * For edython.
 * @param {eYo.brick.Dflt} brick The brick owning the span.
 * @constructor
 */
eYo.span.makeDflt({
  init (brick) {
    this.c_min_init_ = brick.wrapped_
      ? 0
      : brick.isGroup
        ? 2 * eYo.span.INDENT + 1
        : brick.isStmt
          ? eYo.span.INDENT + 1
          : 2
    this.c_min_ = this.c_min_init_
    this.c_ = this.c_min_ + this.c_padding
    this.l_ = this.header_ + this.main_ + this.hole_ + this.suite_ + this.footer_
  },
  computed: {
    /**
     * @readonly
     * @property {eYo.brick.Dflt} brick - The owning brick
     */
    brick () {
      return this.owner_
    },
    /**
      * @readonly
      * @property {number} width  The full width, in board coordinates, computed based on `c`.
      */
    width: {
      get () {
        return this.c * eYo.unit.x
      },
      set (after) {
        this.c_ = after / eYo.unit.x
      }
    },
    /**
      * @property {number} x  Synonym of `width`.
      */
    x: {
      get () {
        return this.width
      },
      set (after) {
        this.width_ = after
      }
    },
    parentSpan () {
      var p = this.brick.parent
      return p && p.span
    },
    rightSpan () {
      var b3k = this.brick.right
      return b3k && b3k.span
    },
    leftSpan () {
      var b3k = this.brick.left
      return b3k && b3k.span
    },
    /**
     * @readonly
     * @property {number} height - The height, in board coordinates.
     */
    height: {
      get () {
        return this.l_ * eYo.unit.y
      },
      set_ (after) {
        this.l_ =  after / eYo.unit.y
      },
    },
    /**
     * @readonly
     * @property {number} y  Synonym of `height`.
     */
    y: {
      get () {
        return this.height
      },
      set_ (after) {
        this.height_ = after
      },
    },
  },
  valued: {
    /**
     * This is the total number of columns in that block.
     * At least two.
     * @readonly
     * @property {number} c - The full number of columns
     */
    c: {
      init: 0,
      set (after) {
        this.setPadding(after - this.c_min_)
      }
    },
    /**
     * The minimum number of columns, at least `this.c_min_init`.
     * @readonly
     * @property {number} c_min - The minimum number of columns
     */
    c_min: {
      init: 0,
      set (after) {
        this.addC(after - this.c_min_)
      }
    },
    /**
     * @property {number} c_padding - The extra padding at the right
     */
    c_padding: {
      init: 0,
      set (after) {
        this.setPadding(after)
      }
    },
    /**
     * @property {number} right  The number of right columns
     */
    right: 0,
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
     * @property {number} main - The number of main lines
     */
    main: {
      init: 1, // 1 or more
      set (after) {
        this.addMain(after - this.main_)
      }
    },
    /** 
     * @property {number} header - The number of header lines
     */
    header: {
      init: 0,
      set (after) {
        this.addHeader(after - this.header_)
      }
    },
    /**
     * @property {number} footer - The number of footer lines
     */
    footer: {
      init: 0,
      set (after) {
        this.addFooter(after - this.footer_)
      }
    },
    /**
     * This is the total number of lines in that block.
     * At least one.
     * @property {number} l - The full number of lines
     * @readonly
     */
    l: 0,
    /**
     * If we have a suite, we do not have a header nor a footer.
     * It is the responsibility of the caller to verify that
     * there is no right block, except a one line comment.
     * @property {number} suite - The number of suite lines
     */
    suite: {
      init: 0,
      set (after) {
        this.addSuite(after - this.suite_)
      },
    },
    /**
     * Groups need a suite, but may not be provided with one.
     * The hole count is used to display a hole,
     * where bricks should be connected.
     * If groups have a right connection, they have no suite
     * hence no suite hole.
     * @readonly
     * @property {number} hole - The number of hole lines
     */
    hole: 0,
    /**
     * @property {number} foot - The number of foot lines
     */
    foot: {
      init: 0,
      set (after) {
        this.addFoot(after - this.foot_)
      },
    },
  },
})

Object.defineProperties(eYo.span, {
  /**
   * @type {Number} positive number of indentation spaces.
   */
  INDENT: {value: 4},
  /**
   * The tab width in board unit.
   */
  TAB_WIDTH: {
    get () {
      return eYo.span.INDENT * eYo.unit.x
    }
  },
})

/**
 * Set the right padding column number.
 * Used to align the right edges of statement blocks.
 * @param {Number} padding  the new value of the padding, a non negative number.
 */
eYo.span.Dflt_p.setPadding = function (padding) {
  if (padding>=0) {
    var right = this.rightSpan
    if (right) {
      // cascade to all the right statements
      right.setPadding(delta)
      this.c_ = this.c_min_
    } else {
      if (this.brick.isGroup && !this.brick.right) {
        this.c_min_ + padding >= 2 * eYo.span.INDENT
        var min = 2 * eYo.span.INDENT - this.c_min_
        if (padding < min) {
          padding = min
        }
      }
      this.c_padding_ = padding
      this.c_ = this.c_min_ + padding  
    }
  }
}

/**
 * Reset the padding to 0.
 * @result {Boolean}  true iff there was a positive padding.
 */
eYo.span.Dflt_p.resetPadding = function () {
  if (this.c_padding_ > 0) {
    this.setPadding(0)
    return true
  }
}

/**
 * Reset the column counts to initial values.
 */
eYo.span.Dflt_p.resetC = function () {
  this.c_min_ = this.c_min_init_
  this.c_padding_ = 0
  var c = this.c_min_ + this.c_padding_
  this.addC(c - this.c_)
}

/**
 * Change the number of columns.
 * This may occur at initialization time, when fields are edited, when input bricks are added, removed or edited.
 * The suite bricks, if any, influence the padding.
 * @param {Number} delta  the difference from the old value to value and the old one.
 */
eYo.span.Dflt_p.addC = function (delta) {
  if (this.c_min_ + delta < this.c_min_init_) {
    delta = this.c_min_init_ - this.c_min_
  }
  if (delta) {
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
 * Change the number of lines.
 * This may occur at initialization time, when fields are edited, when input bricks are added, removed or edited.
 * The suite bricks, if any, influence the padding.
 * @param {Number} delta  the difference from the old value to value and the old one.
 */
eYo.span.Dflt_p.addL = function (delta) {
  if (delta) {
    this.l_ += delta
  }
}

/**
 * Convenient method
 * @param {Object} delta  the value to add to the ressource.
 */
eYo.span.Dflt_p.reset = function (where) {
  console.error('WHAT IS THE PURPOSE ?')
}

/**
 * Convenient method
 * @param {Number} delta  the value to add to the ressource.
 */
eYo.span.Dflt_p.resetL = function () {
  this.main_ = 1
  this.header_ = this.suite_ = this.footer_ = 0
  var b = this.brick_
  this.hole_ = b.isGroup && (!b.right || b.right.isComment) ? 1 : 0
  this.l_ = b.isGroup
  ? this.main_ + this.hole_ + this.suite_
  : b.isStmt
    ? this.header_ + this.main_ + this.footer_
    : this.main_
}

/**
 * Add to the header line number.
 * This may happen only in 3 situation:
 * 1) the left brick changes its header line number
 * 2) The left brick changes its main line number
 * 3) the left connection changes
 * @param {Number} delta  the value to add to the ressource.
 */
eYo.span.Dflt_p.addHeader = function (delta) {
  if (delta) {
    this.header_ += delta
    this.l_ += delta
    // cascade to all the right statements
    var right = this.rightSpan
    right && (right.addHeader(delta))
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
eYo.span.Dflt_p.addMain = function (delta) {
  if (delta) {
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
eYo.span.Dflt_p.addLeft_ = function (delta) {
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
eYo.span.Dflt_p.addParent_ = function (delta) {
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
eYo.span.Dflt_p.addFooter = function (delta) {
  if (delta) {
    this.footer_ += delta
    this.l_ += delta
    this.addLeft_(delta)
  }
}

/**
 * Add to the foot line number.
 * This may happen only in on of 2 situation:
 * 1) the suite magnet connection status changes
 * 2) the right magnet connection status changes
 * @param {Number} delta  the value to add to the ressource.
 * Actually it can only be 1 or -1.
 */
eYo.span.Dflt_p.addFoot = function (delta) {
  if (delta) {
    this.foot_ += delta
    this.addParent_(delta)
  }
}

/**
 * Add to the suite line number.
 * @param {Number} delta  the value to add to the ressource.
 * Actually it can only be 1 or -1.
 */
eYo.span.Dflt_p.addSuite = function (delta) {
  var b = this.brick
  if (delta && b.isGroup) {
    this.suite_ += delta
    if (this.suite_) {
      if (this.hole_) {
        delta -= this.hole_
        this.hole_ = 0
      }
    } else {
      var r = b.right
      if (!r || r.isComment) {
        this.hole_ = 1
        delta += this.hole_
      }
    }
    this.l_ += delta
    this.addParent_(delta)
  }
}
