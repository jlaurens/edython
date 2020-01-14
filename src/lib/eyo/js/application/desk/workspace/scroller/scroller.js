/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Dom utils.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('c9r')

eYo.provide('scroller')

eYo.forwardDeclare('board')

goog.forwardDeclare('goog.dom')
goog.forwardDeclare('goog.events')

/**
 * Class for a pair of scrollbars.  Horizontal and vertical.
 * @param {eYo.board} board Board to bind the scrollbars to.
 * @constructor
 */
eYo.Scroller = function(board) {
  eYo.Scroller.SuperProto_.constructor.Call(this, board)
  this.hScroll = new eYo.Scrollbar(
    this,
    true,
    'eyo-main-board-scrollbar'
  )
  this.vScroll = new eYo.Scrollbar(
    this,
    false,
    'eyo-main-board-scrollbar'
  )
  this.cornerRect_ = new eYo.c9r.Rect()
  this.disposeUI = eYo.do.nothing
  board.hasUI && this.initUI()
}
goog.inherits(eYo.Scroller, eYo.c9r.Dflt)

Object.defineProperties(eYo.Scroller.prototype, {
  /**
   * @type{eYo.board} The scrolled board...
   * @readonly
   */
  board: {
    get () {
      return this.owner
    }
  },
  /**
   * Set/get whether this scrollbar's container is visible.
   * @param {boolean} visible Whether the container is visible.
   */
  containerVisible: {
    get () {
      return this.hScroll.containerVisible || this.vScroll.containerVisible
    },
    set (after) {
      this.hScroll.containerVisible = after
      this.vScroll.containerVisible = after
    }
  },
  /**
   * Is the scrollbar visible.  Non-paired scrollbars disappear when they aren't
   * needed.
   * @return {boolean} True if visible.
   */
  visible: {
    get () {
      return this.hScroll.visible || this.vScroll.visible
    }
  },
})

/**
 * Previously recorded metrics from the board.
 * @type {Object}
 * @private
 */
eYo.Scroller.prototype.initUI = function () {
  this.ui_driver_mngr.scrollerInit(this)
  this.initUI = eYo.do.nothing
  delete this.disposeUI
}

/**
 * Previously recorded metrics from the board.
 * @type {Object}
 * @private
 */
eYo.Scroller.prototype.disposeUI = function () {
  this.hScroll.disposeUI()
  this.vScroll.disposeUI()
  this.ui_driver_mngr.scrollerDispose(this)
  this.disposeUI = eYo.do.nothing
  delete this.initUI
}

/**
 * Previously recorded metrics from the board.
 * @type {Object}
 * @private
 */
eYo.Scroller.prototype.oldMetrics_ = null;

/**
 * Dispose of this pair of scrollbars.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Scroller.prototype.dispose = function() {
  this.disposeUI()
  this.board = null
  this.oldMetrics_ = null
  this.hScroll.dispose()
  this.hScroll = null
  this.vScroll.dispose()
  this.vScroll = null
  this.cornerRect_.dispose()
  this.cornerRect_ = null
  eYo.Scroller.SuperProto_.dispose.Call(this)
}

/**
 * Recalculate both of the scrollbars' locations and lengths.
 * Also reposition the corner rectangle.
 */
eYo.Scroller.prototype.layout = function() {
  // Look up the host metrics once, and use for both scrollbars.
  var hostMetrics = this.board.metrics
  if (!hostMetrics) {
    // Host element is likely not visible. Not any longer
    return
  }
  // In order to layout properly, cross visibility is required
  this.hScroll.layout(hostMetrics, true)
  this.vScroll.layout(hostMetrics, true)
  this.hScroll.layout(hostMetrics, false)
  this.vScroll.layout(hostMetrics, false)
  // layout the corner
  var r = this.cornerRect_
  var rr = this.vScroll.viewRect
  r.left = rr.left
  r.right = rr.right
  rr = this.hScroll.viewRect
  r.top = rr.top
  r.bottom = rr.bottom
  // Reposition the corner square.
  this.ui_driver_mngr.scrollerPlaceCorner(this)
}

/**
 * Place the scroller.
 * @private
 */
eYo.Scroller.prototype.place = function() {
  var s
  ;(s = this.hScroll) && s.place()
  ;(s = this.vScroll) && s.place()
}
