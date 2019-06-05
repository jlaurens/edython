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
  this.disposeUI = eYo.Do.nothing
  board.hasUI && this.makeUI()
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
      return this.desk_.ui_driver
    }
  },
  has_UI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
})

/**
 * Prepare the UI for dragging.
 * @package
 */
eYo.BoardDragger.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  delete this.disposeUI
  this.ui_driver.boardDraggerInit(this)
}

/**
 * Dispose of the UI resources.
 * @package
 */
eYo.BoardDragger.prototype.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  delete this.makeUI
  this.ui_driver.boardDraggerDispose(this)
}

/**
 * Sever all links from this object.
 * @package
 */
eYo.BoardDragger.prototype.dispose = function() {
  this.disposeUI()
  this.board_ = null
  this.correction_ = null
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
 * @package
 */
eYo.BoardDragger.prototype.start = function(gesture) {
  var board = gesture.board
  /**
   * @type {!eYo.BoardSvg}
   * @private
   */
  this.board_ = board

  /**
   * The board's metrics object at the beginning of the drag.  Contains size
   * and position metrics of a board.
   * Coordinate system: pixel coordinates.
   * @type {!Object}
   * @private
   */
  this.startMetrics_ = board.getMetrics()

  /**
   * The scroll position of the board at the beginning of the drag.
   * Coordinate system: pixel coordinates.
   * @type {!eYo.Where}
   * @private
   */
  this.startXY_ = new eYo.Where(board.scroll)
  
  /*
  * Move the scrollbars to drag the board.
  * x and y are in pixels.
  * @param {number} x The new x position to move the scrollbar to.
  * @param {number} y The new y position to move the scrollbar to.
  * @private
  */
  this.startMetrics_.updateScroll_ = board.isFlyout
  ? function (x, y) {
    board.targetBoard.flyout_.scrollbar_.set(y)
  }
  : function (x, y) {
    board.scrollbar.set(x, y)
  }

  if (eYo.Selected.brick) {
    eYo.Selected.brick.unselect()
  }
  // This can happen if the user starts a drag, mouses up outside of the
  // document where the mouseup listener is registered (e.g. outside of an
  // iframe) and then moves the mouse back in the board.  On mobile and ff,
  // we get the mouseup outside the frame. On chrome and safari boardtop we do
  // not.
  if (this.isActive_) {
    return
  }

  this.isActive_ = true

  /**
   * What is the purpose of this transform correction_?
   * Zoom I guess
   * Is it for the flyout also?
   */
  board.ui_driver.boardStartDrag(board)
}

/**
 * Reset gesture.
 * @package
 */
eYo.BoardDragger.prototype.clearGesture = function() {
  this.gesture_ = null
}

/**
 * Finish dragging the board and put everything back where it belongs.
 * @param {!Event} e The most recent move event.
 * @param {!eYo.Where} delta How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
eYo.BoardDragger.prototype.end = function() {
  this.drag()
  // Don't do anything if we aren't using a drag surface.
  if (!this.dragSurface_) {
    return
  }
  this.isActive_ = false
  var trans = this.dragSurface_.translation
  this.dragSurface_.clearAndHide(this.dom.svg.group_)
  this.board_.canvasMoveTo(trans)
  console.log('?', eYo.App.board.topBricks_[0].ui.xyInDesk)
}

/**
 * Move the board based on the most recent mouse movements.
 * @param {!Event} e The most recent move event.
 * @param {!eYo.Where} deltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
eYo.BoardDragger.prototype.drag = function() {
  var deltaXY = this.board_.ui_driver.boardDragDeltaXY(this.board_)
  var metrics = this.startMetrics_

  var x = this.startXY_.x + deltaXY.x + metrics.content.x_min
  x = Math.min(x, 0)
  x = Math.max(x, metrics.view.width - metrics.content.width)

  var y = this.startXY_.y + deltaXY.y + metrics.content.y_min
  y = Math.min(y, 0)
  y = Math.max(y, metrics.view.height - metrics.content.height)

  this.startMetrics_.updateScroll_(-x, -y)
}

/**
 * Translate the board to new coordinates.
 * @param {eYo.Where} xy
 */
eYo.BoardDragger.prototype.moveTo = function(xy) {
  if (this.dragSurface_ && this.isActive_) {
    this.dragSurface_.moveTo(xy)
  } else {
    this.board_.canvasMoveTo(xy)
  }
}
