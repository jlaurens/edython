/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board metrics model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Metrics')

goog.forwardDeclare(eYo.Board)
goog.forwardDeclare(eYo.Geometry)

/**
 * The `content` rect is enclosing all the bricks.
 * Its coordinates define the board coordinates.
 * The `view` rectangle corresponds to the view port.
 * Its coordinates correspond to screen coordinates or at least
 * the enclosing graphical element's coordinates.
 * @param {?eYo.Board} board the owner board.
 */
eYo.Metrics = function (board) {
  this.board_ = board
  this.content_ = new eYo.Rect()
  this.view_ = new eYo.Rect()
  this.box_ = new eYo.Rect()
  this.scroll_ = new eYo.Where()
  this.scale_ = 1
  this.updateDepth_ = 0
}

Object.defineProperties(eYo.Metrics.prototype, {
  board: {
    get () {
      return this.board_
    }
  },
  options: {
    get () {
      return this.board_ && this.board_.options.zoom || {}
    }
  },
  /**
   * Bricks visible dimensions are propotional to this value.
   * Doubling the scale will double the size of the bricks on screen.
   * Each time the scale changes, an `update` message is sent.
   * The same holds for other properties.
   * @type {Number} Positive scale factor.
   */
  scale: {
    get () {
      return this.scale_
    },
    set (newValue) {
      if (newValue <= 0) {
        newValue = 1
      }
      if (this.scale_ !== newValue) {
        var options = this.options
        if (options && options.maxScale &&
          newValue > options.maxScale) {
            newValue = options.maxScale
        } else if (options && options.minScale &&
          newValue < options.minScale) {
            newValue = options.minScale
        }
        this.scale_ = newValue
        this.board_ && this.board_.didScale()
      }
    }
  },
  /**
   * How much is the content rect scrolled
   * relative to the view rect, in desk coordinates.
   * When this point is (0,0) the view topleft corner
   * and the (0,0) point in the content are exactly
   * at the same location on screen.
   * 
   * @type {eYo.Where} 
   */
  scroll: {
    get () {
      return this.scroll_.clone
    },
    set (newValue) {
      var r = this.scrollLimits(eYo.Where.xy())
      if (newValue.x < r.x) {
        newValue.x = r.x
      }
      if (newValue.x > r.x_max) {
        newValue.x = r.x_max
      }
      if (newValue.y < r.y) {
        newValue.y = r.y
      }
      if (newValue.y > r.y_max) {
        newValue.y = r.y_max
      }
      if (!this.scroll_.equals(newValue)) {
        this.wrapUpdate(() => this.scroll_.set(newValue))
      }
    }
  },
  /**
   * The view rect is the visible rectangle on screen (the view port).
   * For the main board it is the bounding rect of the enclosing
   * desk's div. For a flyout, it is generally smaller.
   * It is used for clipping the svg.
   * @type {eYo.Rect} 
   */
  view: {
    get () {
      return this.view_.clone
    },
    set (newValue) {
      if (!this.view_.equals(newValue)) {
        this.wrapUpdate(() => this.view_.set(newValue))
      }
    }
  },
  /**
   * The content rect is enclosing all the bricks.
   * In board coordinates.
   * @type {eYo.Rect} 
   * @readonly 
   */
  content: {
    get () {
      return this.content_.clone
    },
    set (newValue) {
      if (!this.content_.equals(newValue)) {
        this.wrapUpdate(() => {
          this.content_.set(newValue)
          this.content_.xyInset()
        })
      }
    }
  },
  /**
   * The content rect is enclosing all the bricks.
   * In board coordinates.
   * @type {eYo.Rect} 
   * @readonly 
   */
  contentInView: {
    get () {
      return this.toView(this.content)
    }
  },
  /**
   * The box rect is bigger than the content rect.
   * It is reset each time the content rect changes.
   * @type {eYo.Rect} 
   * @readonly 
   */
  box: {
    get () {
      return this.box_.clone
    },
    set (newValue) {
      if (!this.box_.equals(newValue)) {
        this.wrapUpdate(() => this.box_.set(newValue))
      }
    }
  },
  /**
   * Clone the object.
   */
  clone: {
    get () {
      var ans = new eYo.Metrics()
      ans.scale = this.scale_
      ans.view = this.view_
      ans.content = this.content_
      ans.scroll = this.scroll_
      ans.box = this.box_
      return ans
    }
  },
})

/**
 * Sever the links and dispose of the resources.
 */
eYo.Metrics.prototype.dispose = function () {
  this.board_ = null
  this.box_.dispose()
  this.scroll_.dispose()
  this.view_.dispose()
  this.content_.dispose()
  this.box_ = this.scroll_ = this.view_ = this.content_ = null
}

/**
 * Update the board.
 */
eYo.Metrics.prototype.update = function () {
  this.board_ && this.board_.metricsDidChange()
}

/**
 * Update the board.
 */
eYo.Metrics.prototype.wrapUpdate = function (do_it) {
  try {
    ++this.updateDepth_
    do_it()
  } finally {
    if(--this.updateDepth_) {
      return
    }
    this.update()
  }
}

/**
 * Convert the given argument from `board` coordinates to `view` coordinates.
 * @param{eYo.Rect | eYo.Where} WR
 */
eYo.Metrics.prototype.toView = function (WR) {
  // Referential(content) = (origin: O, basis: {I, J})
  // Referential(view) = (origin: o, basis: {i, j})
  // I = i * scale, J = j * scale
  // o + scroll = O, scroll is a vector in view coordinates
  // P = o + (x, y) •{i, j}
  //   = O + (X, Y) • {I, J}
  //   = o + scroll • {i, j} + (X, Y) * scale • {i, j} 
  //  (x, y) = scroll + (X, Y) * scale
  //  (X, Y) = ((x, y) - scroll) / scale
  return WR.scale(this.scale).forward(this.scroll_)
}

/**
 * Convert the given argument from `view` coordinates to `board` coordinates.
 * @param{eYo.Rect | eYo.Where} wr
 */
eYo.Metrics.prototype.fromView = function (wr) {
  return wr.backward(this.scroll_).unscale(this.scale)
}

/**
 * The scroll limits in view coordinates.
 * @param{eYo.Size} margin  Extra margin in board coordinates, in general, it is the size of some brick.
 */
eYo.Metrics.prototype.scrollLimits = function (margin) {
  // Limits for scroll values.
  // given view port dimensions and content dimensions,
  // what are the possible values for the scroll vector.
  // The top limitation is when the top of the content rect is
  // at the top of the view.
  // The bottom limitation is when the bottom of the content view is
  // at the bottom of the view.
  // And so forth.
  // An extra margin is required to manage brick scrolling.
  // `o + scroll` and `o + scroll + view_size` must be within the limits
  // of the content rect.
  /* Note about scrolling.
    Scrolling the board and the brick is extended.
    When the mouse is close to the boundary, then scrolling may occur
    without any mouse move.
  */
  var ans = this.content
  var size = this.view.size.scale(this.scale)
  ans.x_min -= Math.max(size.width, margin.width)
  ans.y_min -= Math.max(size.height, margin.height)
  return ans.unscale(this.scale)
}

/**
 * Get the dragging limits.
 * Reference is the brick board.
 * @param{?eYo.Rect} rect
 */
eYo.Metrics.prototype.getDraggingLimits = function (rect) {
  var view = this.fromView(this.view)
  var limits = this.content
  if (rect) {

  }
}

