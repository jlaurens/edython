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

eYo.forwardDeclare('board')

goog.forwardDeclare('goog.dom')
goog.forwardDeclare('goog.events')

/**
 * @type{eYo.widget.Scroller}
 * Class for a pair of scrollbars.  Horizontal and vertical.
 * @param {eYo.board} board Board to bind the scrollbars to.
 * @constructor
 */
eYo.widget.makeC9r('Scroller', {
  init (board) {
    this.hScroll = new eYo.widget.Scrollbar(
      this,
      true,
      'eyo-main-board-scrollbar'
    )
    this.vScroll = new eYo.widget.Scrollbar(
      this,
      false,
      'eyo-main-board-scrollbar'
    )
    this.cornerRect_ = new eYo.geom.Rect()
    this.disposeUI = eYo.do.nothing
    board.hasUI && this.initUI()
  },
  properties: {
    /**
     * @type {eYo.board.Dflt} The scrolled board...
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
        this.hScroll.containerVisible_ = after
        this.vScroll.containerVisible_ = after
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
  },
})

/**
 * Previously recorded metrics from the board.
 * @type {Object}
 * @private
 */
eYo.widget.Scroller_p.disposeUI = function () {
  this.hScroll.disposeUI()
  this.vScroll.disposeUI()
  this.ui_driver.doDispose(this)
  this.disposeUI = eYo.do.nothing
  delete this.initUI
}

/**
 * Previously recorded metrics from the board.
 * @type {Object}
 * @private
 */
eYo.widget.Scroller_p.oldMetrics_ = null

/**
 * Dispose of this pair of scrollbars.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.widget.Scroller_p.dispose = function() {
  this.disposeUI()
  this.board = null
  this.oldMetrics_ = null
  this.hScroll = this.hScroll.dispose()
  this.vScroll = this.vScroll.dispose()
  this.cornerRect_ = this.cornerRect_.dispose()
  eYo.widget.Scroller.eyo.C9r_s.dispose.call(this)
}

/**
 * Recalculate both of the scrollbars' locations and lengths.
 * Also reposition the corner rectangle.
 */
eYo.widget.Scroller_p.layout = function() {
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
eYo.widget.Scroller_p.place = function() {
  var s
  ;(s = this.hScroll) && s.place()
  ;(s = this.vScroll) && s.place()
}
