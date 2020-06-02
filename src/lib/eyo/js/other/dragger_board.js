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

/**
 * Class for a board dragger. Set some scrollbar according to the drag delta. The scrollbar depends on whether the board is in a flyout.
 * @param {eYo.board} board The board to drag.
 * @constructor
 */
eYo.dragger.newC9r('Board', {
  aliases: {
    owner: 'board',
  },
  properties: {
    desk: {
      get () {
        return this.board_.desk
      }
    },
    startDrag: {
      copy: true
    },
    xyStar: {
      copy: true
    },
    /**
     * Whether the drag surface is actively in use. When true, calls to
     * translate will translate the drag surface instead of the translating the
     * board directly.
     * This is set to true in dragSetup and to false in the end of drag management.
     * @type {boolean}
     * @private
     */
    isActive: false,
  },
  method: {
    /**
     * Start dragging the board.
     * @param {eYo.event.Motion} motion
     * @return {Boolean} started or not
     */
    start (motion) {
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
       * @type {!eYo.view.Board}
       * @private
       */
      var board = this.board_ = motion.board

      /**
       * The board's metrics' drag object at the beginning of the drag.
       * Coordinate system: pixel coordinates.
       * @type {!eYo.geom.Point}
       * @private
       * @package
       */
      this.startDrag_ = board.metrics.drag

      /**
       * The local start where. Used to manage the boundaries:
       * dragging past the limits is recorded.
       * @type {!eYo.geom.Point}
       * @private
       * @package
       */
      this.xyStart_ = new eYo.geom.Point()
      if (eYo.app.focus_mngr.brick) {
        eYo.app.focus_mngr.brick.FocusOff()
      }
    },
    /**
     * Move the board based on the most recent mouse movements.
     */
    drag () {
      var board = this.board_
      var deltaWhere = board.motion_.xyDelta_
      var m_ = board.metrics_
      m_.drag = this.startDrag.forward(deltaWhere)
      if (board.scrollbar) {
        board.scrollbar.layout()
      }
      if (m_.dragPastLimits) {
    //    this.startDrag_ = m_.drag
      }
    },
    /**
     * Translate the board to new coordinates given by its metrics' scroll.
     */
    move () {
      this.board.place()
    },
    /**
     * Finish dragging the board.
     */
    end () {
      this.drag()
      this.isActive_ = false
      return
    }
  },
})
