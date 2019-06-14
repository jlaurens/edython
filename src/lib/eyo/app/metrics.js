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
 * Its coordinates are the board coordinates.
 * The `view` rectangle corresponds to the view port.
 * Its coordinates correspond to screen coordinates or at least
 * enclosing graphical element coordinates.
 * @param {?eYo.Board} board the owner board.
 */
eYo.Metrics = function (board) {
  this.board_ = board
  this.content_ = new eYo.Rect()
  this.view_ = new eYo.Rect()
  this.box_ = new eYo.Rect()
  this.scroll_ = new eYo.Where()
  this.scale_ = 1
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
   * NB: The scroll offset, view and content rectangles
   * are not affected by this value.
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
   * @type {eYo.Where} 
   */
  scroll: {
    get () {
      return this.scroll_.clone
    },
    set (newValue) {
      // view.x_max - content.x_max <= scroll.x <= view.x_min - content.x_min
      var limit = this.view_.x_max - this.content_.x_max
      if (newValue.x < limit) {
        newValue.x = limit
      } else {
        limit = this.view_.x_min - this.content_.x_min
        if (newValue.x > limit) {
          newValue.x = limit
        }
      }
      // view.y_max - content.y_max <= scroll.y <= view.y_min - content.y_min
      limit = this.view_.y_max - this.content_.y_max
      if (newValue.y < limit) {
        newValue.y = limit
      } else {
        limit = this.view_.y_min - this.content_.y_min
        if (newValue.y > limit) {
          newValue.y = limit
        }
      }
      if (!this.scroll_.equals(newValue)) {
        this.scroll_.set(newValue)
        this.update()
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
        this.view_.set(newValue)
        this.update()
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
        this.content_.set(newValue)
        this.content_.xyInset()
        this.update()
      }
    }
  },
  /**
   * The box rect is bigger than the content rect.
   * It defines the viewBox.
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
        this.box_.set(newValue)
        this.update()
      }
    }
  },
  /**
   * Sever the links and dispose of the resources.
   */
  clone: {
    get () {
      var ans = new eYo.Metrics()
      ans.scale = this.scale_
      ans.view = this.view_
      ans.content = this.content_
      ans.scroll = this.scroll_
      return ans
    }
  },
})

/**
 * Sever the links and dispose of the resources.
 */
eYo.Metrics.prototype.dispose = function () {
  this.board_ = null
  this.scroll_.dispose()
  this.view_.dispose()
  this.content_.dispose()
  this.scroll_ = this.view_ = this.content_ = null
}

/**
 * Update the board.
 */
eYo.Metrics.prototype.update = function () {
  this.board_ && this.board_.metricsDidChange()
}

/**
 * Convert the given rect into `view` coordinates.
 * @param{eYo.Rect | eYo.Where} WR
 */
eYo.Metrics.prototype.toView = function (WR) {
  // Referential(content) = (origin: O, basis: {I, J})
  // Referential(view) = (origin: o, basis: {i, j})
  // I = i * scale, J = j * scale
  // o + scroll = O, scroll is a vector in view coordinates
  // P = O + X I + Y J
  //   = o + x i + y j
  //   = o + scroll.x * i + scroll.y * j + X * scale * i + Y * scale * j 
  //  (x, y) = scroll + (X, Y) * scale
  //  (X, Y) = ((x, y) - scroll) / scale
  return WR.scale(this.scale).forward(this.scroll)
}

/**
 * Convert the given rect from `view` coordinates.
 * @param{eYo.Rect | eYo.Where} wr
 */
eYo.Metrics.prototype.fromView = function (wr) {
  return wr.backward(this.scroll).unscale(this.scale)
}

/**
 * Get dragging limits.
 * Reference is the brick board.
 * @param{?eYo.Rect} rect
 */
eYo.Metrics.prototype.getDraggingLimits = function (rect) {
  var view = this.fromView(this.view)
  var limits = this.content

  if (rect) {

  }
}

