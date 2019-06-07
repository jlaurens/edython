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
   * @type {Number} Positive scale factor.
   * Bricks visible dimensions are propotional to this value.
   * Doubling the scale will double the size of the bricks on screen.
   * Each time the scale changes, an `update` message is sent.
   * The same holds for other properties.
   * NB: The scroll offset, view and content rectangles
   * are not affected by this value.
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
      if (!newValue.equals(this.scroll_)) {
        this.scroll_.set(newValue)
        this.update()
      }
    }
  },
  /**
   * The view rect is the visible rectangle on screen.
   * For the main board it is the bounding rect of the enclosing
   * desk's div.
   * @type {eYo.Rect} 
   */
  view: {
    get () {
      return this.view_.clone
    },
    set (newValue) {
      if (!newValue.equals(this.view_)) {
        this.view_.set(newValue)
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

