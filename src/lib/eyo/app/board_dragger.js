/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Boards dragger for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.BoardDragger')

goog.require('eYo')

/**
 * Class for a board dragger. Set some scrollbar according to the drag delta. The scrollbar depends on whether the board is in a flyout.
 * @param {!eYo.Board} board The board to drag.
 * @constructor
 */
eYo.BoardDragger = function(board) {
  this.board_ = board
}

Object.defineProperties(eYo.BoardDragger.prototype, {
  desk: {
    get () {
      return this.board_.desk
    }
  },
  board: {
    get () {
      return this.board_
    }
  },
  ui_driver: {
    get () {
      return this.desk.ui_driver
    }
  },
  startDrag: {
    get () {
      return this.startDrag_.clone
    }
  },
})

/**
 * Sever all links from this object.
 */
eYo.BoardDragger.prototype.dispose = function() {
  this.board_ = this.startDrag_ = this.startWhere_ = null
}

/**
 * Whether the drag surface is actively in use. When true, calls to
 * translate will translate the drag surface instead of the translating the
 * board directly.
 * This is set to true in dragSetup and to false in the end of drag management.
 * @type {boolean}
 * @private
 */
eYo.BoardDragger.prototype.isActive_ = false

/**
 * Start dragging the board.
 * @param {!eYo.Gesture} gesture
 * @return {Boolean} started or not
 */
eYo.BoardDragger.prototype.start = function(gesture) {
  if (this.isActive_) {
    // The drag has already started, nothing more to do.
    // This can happen if the user starts a drag, mouses up outside of the
    // document where the mouseup listener is registered (e.g. outside of an
    // iframe) and then moves the mouse back in the board.  On mobile and ff,
    // we get the mouseup outside the frame. On chrome and safari desktop we do
    // not.
    return true
  }
  this.isActive_ = true
  /**
   * @type {!eYo.Board}
   * @private
   */
  var board = this.board_ = gesture.board

  /**
   * The board's metrics' drag object at the beginning of the drag.
   * Coordinate system: pixel coordinates.
   * @type {!eYo.Where}
   * @private
   * @package
   */
  this.startDrag_ = board.metrics.drag

  /**
   * The local start where. Used to manage the boundaries:
   * dragging past the limits is recorded.
   * @type {!eYo.Where}
   * @private
   * @package
   */
  this.startWhere_ = new eYo.Where()
  if (eYo.Selected.brick) {
    eYo.Selected.brick.unselect()
  }
}

/**
 * Reset gesture.
 */
eYo.BoardDragger.prototype.clearGesture = function() {
  this.gesture_ = null
}

/**
 * Move the board based on the most recent mouse movements.
 */
eYo.BoardDragger.prototype.drag = function() {
  var board = this.board_
  var deltaWhere = board.gesture_.deltaWhere_
  var m_ = board.metrics_
  m_.drag = this.startDrag.forward(deltaWhere)
  if (board.scrollbar) {
    board.scrollbar.layout()
  }
  if (m_.dragPastLimits) {
//    this.startDrag_ = m_.drag
  }
}

/**
 * Translate the board to new coordinates given by its metrics' scroll.
 */
eYo.BoardDragger.prototype.move = function() {
  this.board.place()
}

/**
 * Finish dragging the board.
 */
eYo.BoardDragger.prototype.end = function() {
  this.drag()
  this.isActive_ = false
  return
}
