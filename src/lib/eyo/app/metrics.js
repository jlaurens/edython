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
 * @param {?eYo.Board} board the owner board.
 */
eYo.Metrics = function (board) {
  this.board_ = board
  this.scroll_ = new eYo.Where()
  this.view_ = new eYo.Rect()
  this.content_ = new eYo.Rect()
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
   * relative to the clip rect, in desk coordinates.
   * When this point is (0,0) the clip topleft corner
   * and the (0,0) point in the content are exactly
   * at the same location on screen.
   * @type {eYo.Where} 
   */
  scroll: {
    get () {
      return this.scroll_.clone
    },
    set (newValue) {
      // clip.x_max - content.x_max <= scroll.x <= clip.x_min - content.x_min
      var limit = this.clip_.x_max - this.content_.x_max
      if (newValue.x < limit) {
        newValue.x = limit
      } else {
        limit = this.clip_.x_min - this.content_.x_min
        if (newValue.x > limit) {
          newValue.x = limit
        }
      }
      // clip.y_max - content.y_max <= scroll.y <= clip.y_min - content.y_min
      limit = this.clip_.y_max - this.content_.y_max
      if (newValue.y < limit) {
        newValue.y = limit
      } else {
        limit = this.clip_.y_min - this.content_.y_min
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
   * The view rect is the visible rectangle on screen.
   * For the main board it is the bounding rect of the enclosing
   * desk's div. For a flyout, it is generally smaller.
   * It is used for the svg size and location.
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
   * The clip rect is the clip rectangle on screen.
   * For the main board it is the view rect but for the flyout it is smaller.
   * If any, scrollbars are tied to the clip rectangle.
   * It defines the dimensions of the `clipRect_`.
   * Dimensions in desk coordinates, relative to the top left corner of the view rect.
   * @type {eYo.Rect} 
   */
  clip: {
    get () {
      return this.clip_.clone
    },
    set (newValue) {
      if (!this.clip_.equals(newValue)) {
        this.clip_.set(newValue)
        this.scroll = this.scroll // constrain the value as side effect
        this.update()
      }
    }
  },
  /**
   * The content rect is a rect enclosing all the bricks.
   * @type {eYo.Rect} 
   * @readonly 
   */
  content: {
    get () {
      return this.board_.bricksBoundingRect
    }
  }
})

/**
 * Sever the links and dispose of the resources.
 */
eYo.Metrics.prototype.dispose = function () {
  this.board_ = null
  this.scroll_.dispose()
  this.view_.dispose()
  this.clip_.dispose()
  this.content_.dispose()
  this.scroll_ = this.view_ = this.content_ = null
}

/**
 * Sever the links and dispose of the resources.
 */
eYo.Metrics.prototype.clone = function () {
  var ans = new eYo.Metrics()
  ans.scale = this.scale_
  ans.view = this.view_
  ans.clip = this.clip_
  ans.content = this.content_
  ans.scroll = this.scroll_
  return ans
}

/**
 * Sever the links and dispose of the resources.
 */
eYo.Metrics.prototype.update = function () {
  this.board_ && this.board_.metricsDidChange()
}

