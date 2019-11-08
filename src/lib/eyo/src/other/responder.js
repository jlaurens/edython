/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Responder model, responds to dom event.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Responder')

goog.require('eYo.Protocol')

goog.forwardDeclare('eYo.Dom')

goog.forwardDeclare('goog.asserts')

/*
 * Note: In this file "start" refers to touchstart,
 * mousedown, and pointerstart events.
 * "end" refers to touchend, mouseup, and pointerend events.
 */
// TODO: Consider touchcancel/pointercancel.

/**
 * Class for one responder.
 * There should be only one active responder at a time.
 * Actually, the topmost object, eYo.Application, is managing this responder.
 * The responder has different delegates to handle different events.
 * 
 * @param {!Event} e The event that kicked off this responder.
 * @param {!eYo.Desk} desk The top application where the event occured.
 * @constructor
 */
eYo.Responder = function(desk, e) {
  eYo.Responder.superClass_.constructor.call(this, desk)
  /**
   * The event that most recently updated this responder.
   * @type {!Event}
   * @private
   */
  this.event_ = e

  /**
   * A map of cached points used for tracking multi-touch gestures.
   * @type {Object<number|string, eYo.Where>}
   * @private
   */
  this.cachedPoints_ = Object.create(null)

  this.change_ = new eYo.Change()

}
goog.inherits(eYo.Responder, eYo.Owned)

/**
 * Sever all links from this object.
 */
eYo.Responder.prototype.dispose = function() {
  this.change_ = this.cachedPoints_ = this.desktop_ = this.event_ = null

  
  eYo.Dom.clearTouchIdentifier()
  Blockly.Tooltip.unblock()
  // Clear the owner's reference to this responder.
  this.owner_.clearMotion()
  eYo.Dom.unbindMouseEvents(this)
  this.startBrick_ = this.targetBrick_ = null
  this.flyout_ = null
  this.brickDragger_ && (this.brickDragger_ = this.brickDragger_.clearMotion())
  this.boardDragger_ && (this.boardDragger_ = this.boardDragger_.clearMotion())
  eYo.Responder.superClass_.dispose.call(this)
}

Object.defineProperties(eYo.Responder.prototype, {
  /**
   * The desk.
   * @type {eYo.Desk}
   */
  desktop: {
    get () {
      return this.owner
    }
  },
  /**
   * The position of the mouse when the responder started.  Units are css pixels,
   * with (0, 0) at the top left of the browser window (mouseEvent clientX/Y).
   * @type {eYo.Where}
   */
  xyStart_: {
    value: null
  },
  /**
   * How far the mouse has moved during this drag, in pixel units.
   * (0, 0) is at this.xyStart_.
   * @type {eYo.Where}
   * @private
   */
  xyDelta_: {
    value: null
  },
  /**
   * Boolean for whether or not this responder is a multi-touch responder.
   * @type {boolean}
   * @private
   */
  multiTouch_: {
    value: false
  },

/**
 * Boolean for sanity-checking that some code is only called once.
 * @type {boolean}
 * @private
 */
  started_: {
    value: null
  },

  /**
   * Boolean used internally to break a cycle in disposal.
   * @type {boolean}
   * @private
  */
  isEnding_: {
    value: null,
  },
})

/**
 * Handle a mouse down, touch start, or pointer down event.
 * @param {!Event} e A mouse down, touch start, or pointer down event.
 */
eYo.Responder.prototype.on_mousedown = function(e) {
  this.change_.done()
  if (this.dragging) {
    // A drag has already started, so this can no longer be a pinch-zoom.
    return
  }
  if (eYo.Dom.isTouchEvent(e)) {
    this.handleTouchStart(e)
    if (this.multiTouch) {
      eYo.Dom.longStop_()
    }
  }
}

/**
 * Handle a touch start or pointer down event and keep track of current pointers.
 * @param {!Event} e A touch start, or pointer down event.
 */
eYo.Responder.prototype.handleTouchStart = function(e) {
  var pointerId = eYo.Dom.touchIdentifierFromEvent(e)
  // store the pointerId in the current list of pointers
  this.cachedPoints_[pointerId] = this.getTouchPoint_(e)
  var pointers = Object.keys(this.cachedPoints_)
  // If two pointers are down, check for pinch gestures
  if (pointers.length === 2) {
    var point0 = this.cachedPoints_[pointers[0]]
    var point1 = this.cachedPoints_[pointers[1]]
    this.startDistance_ = point0.distance(point1)
    this.multiTouch_ = true
    e.preventDefault()
  }
}

Object.defineProperties(eYo.Responder.prototype, {
  /**
   * The brick that the responder started on, or null if it did not start on a
   * brick.
   * @type {eYo.Brick}
   * @private
   */
  startBrick_: {
    value: null,
    writable: true
  },

  /**
   * The brick that this responder targets.  If the responder started on a
   * shadow brick, this is the first non-shadow parent of the brick.  If the
   * responder started in the flyout, this is the root brick of the brick group
   * that was clicked or dragged.
   * @type {eYo.Brick}
   * @private
   */
  targetBrick_: {
    value: null,
    writable: true
  },

  /**
   * The object tracking a brick drag, or null if none is in progress.
   * @type {eYo.BrickDragger}
   * @private
   */
  brickDragger_: {
    value: null,
    writable: true
  },

  /**
   * The object tracking a board or flyout board drag, or null if none
   * is in progress.
   * @type {eYo.BoardDragger}
   * @private
   */
  boardDragger_: {
    value: null,
    writable: true
  },

  /**
   * The flyout a responder started in, if any.
   * @type {eYo.Flyout}
   * @private
   */
  flyout_: {
    value: null,
    writable: true
  },

  /**
   * Boolean used to indicate whether or not to heal the stack after
   * disconnecting a brick.
   * @type {boolean}
   * @private
   */
  healStack_: {
    value: !eYo.Responder.DRAG_STACK,
    writable: true
  },

  /**
   * This is the ratio between the starting distance between the touch points
   * and the most recent distance between the touch points.
   * Scales between 0 and 1 mean the most recent zoom was a zoom out.
   * Scales above 1.0 mean the most recent zoom was a zoom in.
   * @type {number}
   * @private
   */
  previousScale_: {
    value: 0,
    writable: true
  },
  /**
   * The starting distance between two touch points.
   * @type {number}
   * @private
   */
  startDistance_: {
    value: 0,
    writable: true
  },

  /**
   * The owner.
   * @type {eYo.Board}
   * @private
   */
  board_: {
    value: null,
    writable: true
  },
})


Object.defineProperties(eYo.Responder, {
  /**
   * Number of pixels the mouse must move before a drag starts.
   */
  DRAG_RADIUS: { value: 5},
  /**
   * Number of pixels the mouse must move before a drag/scroll starts from the
   * flyout.  Because the drag-intention is determined when this is reached, it is
   * larger than DRAG_RADIUS so that the drag-direction is clearer.
   */
  FLYOUT_DRAG_RADIUS: { value: 10},
  /**
   * A multiplier used to convert the responder scale to a zoom in delta.
   * @const
   */
  ZOOM_IN_FACTOR: { value: 5 },
  /**
   * A multiplier used to convert the responder scale to a zoom out delta.
   * @const
   */
  ZOOM_OUT_FACTOR: { value: 6 },
  /**
   * When dragging a block out of a stack, split the stack in two (true), or drag
   * out the block healing the stack (false).
   */
  DRAG_STACK: { value: true },
})

Object.defineProperties(eYo.Responder.prototype, {
  /**
   * Whether this responder is a drag of either a board or brick.
   * @readonly
   * @type{boolean} true if this responder is a drag of a board or brick.
     */
  dragging: {
    get () {
      return this.boardDragger_ || this.brickDragger_
    }
  },
  event: {
    get () {
      return this.event_
    }
  },
  /**
   * Position of the receiver's event in the board.
   * @type {eYo.Where}
   * @readonly
   */
  where: {
    get () {
      return new eYo.Where(this.event_)
    }
  },
  /**
   * Position of the receiver's event in the board.
   * @type {eYo.Where}
   * @readonly
   */
  xy: {
    get () {
      return new eYo.Where(this.event_)
    }
  },
  /**
   * The move when dragging.
   * @type {eYo.Where}
   * @readonly
   */
  delta: {
    get () {
      return this.xyDelta_.clone
    }
  },
  started: {
    get () {
      return this.started_
    }
  },
  multiTouch: {
    get () {
      return this.multiTouch_
    }
  },
  startBrick: {
    get () {
      return this.startBrick_
    },
    /*
     * Dragging should start for selected blocks only.
     */
    set (brick) {
      if (!this.startBrick_) {
        var candidate
        var selected = eYo.app.focusMgr.brick
        do {
          candidate = brick
        } while (brick.isExpr && (selected !== brick) && (brick = brick.parent))
        this.startBrick_ = candidate
        candidate.isInFlyout && (candidate = candidate.root)
        this.targetBrick_ = candidate
      }
    }
  },
})

/**
 * Handle a touch move or pointer move event and zoom in/out if two pointers are on the screen.
 * @param {!Event} e A touch move, or pointer move event.
 */
eYo.Responder.prototype.handleTouchMove = function(e) {
  var pointerId = eYo.Dom.touchIdentifierFromEvent(e)
  // Update the cache
  this.cachedPoints_[pointerId] = this.getTouchPoint_(e)

  var pointers = Object.keys(this.cachedPoints_)
  // If two pointers are down, check for pinch gestures
  if (pointers.length === 2) {
    // Calculate the distance between the two pointers
    var point0 = this.cachedPoints_[pointers[0]]
    var point1 = this.cachedPoints_[pointers[1]]
    var moveDistance = point0.distance(point1)
    var startDistance = this.startDistance_
    var scale = this.touchScale_ = moveDistance / startDistance
    if (this.previousScale_ > 0 && this.previousScale_ < Infinity) {
      var gestureScale = scale - this.previousScale_
      var delta = gestureScale > 0
      ? gestureScale * eYo.Responder.ZOOM_IN_FACTOR 
      : gestureScale * eYo.Responder.ZOOM_OUT_FACTOR
      this.board_.zoom(e, delta)
    }
    this.previousScale_ = scale
    e.preventDefault()
  }
}

/**
 * Helper function returning the current touch point coordinate.
 * @param {!Event} e A touch or pointer event.
 * @return {eYo.Where} the current touch point coordinate
 * @package
 */
eYo.Responder.prototype.getTouchPoint_ = function(e) {
  if (!this.board_) {
    return null
  }
  return eYo.Where.xy(
    (e.pageX || e.changedTouches[0].pageX),
    (e.pageY || e.changedTouches[0].pageY)
  )
}

/**
 * Update internal state based on an event.
 * @param {!Event} e The most recent mouse or touch event.
 * @private
 */
eYo.Responder.prototype.update_ = function(e) {
  this.event_ = e
  this.xyDelta_ = this.where.backward(this.xyStart_)
  if (!this.dragging) {
    var delta = this.xyDelta_.magnitude
    var limit = this.flyout_
    ? eYo.Responder.FLYOUT_DRAG_RADIUS
    : eYo.Responder.DRAG_RADIUS
    if (delta > limit) {
      this.updateDraggingBrick_() || this.updateDraggingBoard_()
      eYo.Dom.longStop_()
    }
  }
}

/**
 * Update this responder to record whether a brick is being dragged.
 * This function should be called on a mouse/touch move event the first time the drag radius is exceeded.
 * It should be called no more than once per responder.
 * @return {boolean} true if a brick is being dragged.
 * @private
 */
eYo.Responder.prototype.updateDraggingBrick_ = function() {
  var dragger = this.owner_.brickDragger_
  var board = this.flyout_
  ? this.flyout_.desk.board
  : this.board_
  if (board && (this.targetBrick_ = dragger.start(this))) {
    this.startBrick_ = null
    this.brickDragger_ = dragger
    this.board_ = board
    board.updateScreenCalculationsIfScrolled()
    console.log('updateDraggingBrick_: ', this.xyDelta_)
    return true
  }
}

/**
 * Update this responder to record whether a board is being dragged.
 * This function should be called on a mouse/touch move event the first time the
 * drag radius is exceeded.  It should be called no more than once per responder.
 * If a board is being dragged this function creates the necessary
 * BoardDragger or FlyoutDragger and starts the drag.
 * @private
 */
eYo.Responder.prototype.updateDraggingBoard_ = function() {
  var board = 
    this.flyout_
    ? this.flyout_.board_
    : this.board_
  if (board && (this.boardDragger_ = board.dragger)) {
    this.boardDragger_.start(this)
  }
}

/**
 * Handle a mouse move or touch move event.
 * @param {!Event} e A mouse move or touch move event.
 */
eYo.Responder.prototype.on_mousemove = (() => {
  var move = function (self, e) {
    self.update_(e)
    var d
    if ((d = self.boardDragger_)) {
      d.drag()
    } else if ((d = self.brickDragger_)) {
      d.drag() // sometimes it failed when in Blockly
    }
    eYo.Dom.gobbleEvent(e) 
  }
  return function(e) {
    console.error('on_mousemove')
    this.change.done()
    if (this.dragging) {
      // We are in the middle of a drag, only handle the relevant events
      if (eYo.Dom.shouldHandleEvent(e)) {
        move(this, e)
      }
      return;
    }
    if (this.multiTouch) {
      if (eYo.Dom.isTouchEvent(e)) {
        this.handleTouchMove(e)
      }
      eYo.Dom.longStop_()
    } else {
      move(this, e)
    }
  }
})()

/**
 * Handle a mouse up or touch end event.
 * @param {!Event} e A mouse up or touch end event.
 */
eYo.Responder.prototype.on_mouseup = function(e) {
  this.change.done()
  if (eYo.Dom.isTouchEvent(e) && !this.dragging) {
    var pointerId = eYo.Dom.touchIdentifierFromEvent(e)
    if (this.cachedPoints_[pointerId]) {
      delete this.cachedPoints_[pointerId]
    }
    if (Object.keys(this.cachedPoints_).length < 2) {
      this.cachedPoints_ = {}
      this.previousScale_ = 0
    }
  }
  if (!this.multiTouch || this.dragging) {
    if (!eYo.Dom.shouldHandleEvent(e)) {
      return
    }
    this.update_(e)
    eYo.Dom.longStop_()

    if (this.isEnding_) {
      console.log('Trying to end a responder recursively.')
      return
    }
    this.isEnding_ = true
    // The ordering of these checks is important: drags have higher priority than
    // clicks.  Magnets have higher priority than bricks; bricks have higher
    // priority than boards.
    // The ordering within drags does not matter, because the three types of
    // dragging are exclusive.
    if (this.brickDragger_) {
      this.brickDragger_.end()
      this.brickDragger_ = null
    } else if (this.boardDragger_) {
      this.boardDragger_.end()
      this.boardDragger_ = null
    } else if (this.startBrick_) {
      console.error('doBrickClick_')
      this.startBrick_.hasFocus ? this.doBrickClick_() : this.doBoardClick_()
    } else {
      console.error('doBoardClick_')
      this.doBoardClick_()
    }
  }
  eYo.Dom.gobbleEvent(e)
  this.dispose()
}

/**
 * Cancel an in-progress responder.  If a board or brick drag is in progress,
 * end the drag at the most recent location.
 */
eYo.Responder.prototype.cancel = function() {
  // Disposing of a brick cancels in-progress drags, but dragging to a delete
  // area disposes of a brick and leads to recursive disposal. Break that cycle.
  if (this.isEnding) {
    return
  }
  eYo.Dom.longStop_()
  if (this.brickDragger_) {
    this.brickDragger_.end()
  } else if (this.boardDragger_) {
    this.boardDragger_.end()
  }
  this.dispose()
}

/**
 * Handle a real or faked right-click event by showing a context menu.
 * @param {!Event} e A mouse move or touch move event.
 */
eYo.Responder.prototype.handleRightClick = function(e) {
  if (this.targetBrick_) {
    this.bringBrickToFront_()
    this.targetBrick_.ui.showContextMenu_(e)
  } else if (this.board_ && !this.flyout_) {
    this.board_.showContextMenu_(e)
  }
  eYo.Dom.gobbleEvent(e)
  this.dispose()
}

/**
 * Handle a mousedown/touchstart event on a board.
 * Used by board and flyout.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!eYo.Board} board The board the event hit.
 * @package
 */
eYo.Responder.prototype.handleBoardStart = function(e, board) {
  this.handleBoardStart = eYo.Do.nothing
  this.board_ = board
  var b3k = eYo.app.focusMgr.brick
  b3k && (b3k.ui.selectMouseDownEvent = e)
  if (eYo.Dom.isTargetInput(e)) {
    this.cancel()
    return
  }
  this.event_ = e
  this.ui_driver_mgr.disconnectStop()
  board.updateScreenCalculationsIfScrolled()
  board.markFocused()

  // Hide chaff also hides the flyout, so don't do it if the click is in a flyout.
  Blockly.Tooltip.block()

  if (this.targetBrick_) {
    this.targetBrick_.focusOn()
  }

  if (eYo.Dom.isRightButton(e)) {
    this.handleRightClick(e)
    return
  }
  console.log('START')
  if (e.type == 'touchstart' ||
      (e.type == 'pointerdown' && e.pointerType != 'mouse')) {
   console.log('LONG')
   eYo.Do.longStart_(e, this)
  }

  this.xyStart_ = new eYo.Where(e)
  this.startDrag_ = new eYo.Where()
  this.healStack_ = e.altKey || e.ctrlKey || e.metaKey

  eYo.Dom.unbindMouseEvents(this)
  eYo.Dom.bindMouseEvents(this, document, {willUnbind: true, noCaptureIdentifier: true})

  if (!this.isEnding_ && eYo.Dom.isTouchEvent(e)) {
    this.handleTouchStart(e)
  }
  eYo.Dom.gobbleEvent(e)
}

/**
 * Handle a mousedown/touchstart event on a flyout.
 * Used by flyout.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.Flyout} flyout The flyout the event hit.
 */
eYo.Responder.prototype.handleFlyoutStart = function(e, flyout) {
  this.handleFlyoutStart = eYo.Do.nothing
  this.flyout_ || (this.flyout_ = flyout)
  this.handleBoardStart(e, flyout.board)
}

/**
 * Handle a mousedown/touchstart event on a brick.
 * Used by brick's on_mousedown (or synonym).
 * @param {!Event} e A mouse down or touch start event.
 * @param {!eYo.Brick} brick The brick the event hits.
 */
eYo.Responder.prototype.handleBrickStart = function(e, brick) {
  this.handleBrickStart = eYo.Do.nothing
  this.startBrick = brick.wrapper
  this.event_ = e
}

/* Begin functions defining what actions to take to execute clicks on each type
 * of target.  Any developer wanting to add behaviour on clicks should modify
 * only this code. */

/**
 * Execute a brick click.
 * @private
 */
eYo.Responder.prototype.doBrickClick_ = function() {
  if (this.flyout_ && this.flyout_.autoClose) {
   // Brick click in an autoclosing flyout.
   if (!this.targetBrick_.disabled) {
      if (!eYo.Events.group) {
        eYo.Events.group = true
      }
      var newBrick = this.flyout_.createBrick(this.targetBrick_)
      newBrick.ui.scheduleSnapAndBump()
    }
  }
  this.bringBrickToFront_()
  eYo.Events.group = false
}

/**
 * Execute a board click.
 * @private
 */
eYo.Responder.prototype.doBoardClick_ = function() {
  eYo.app.focusMgr.brick && eYo.app.focusMgr.brick.focusOff()
}

/* End functions defining what actions to take to execute clicks on each type
 * of target. */

/**
 * Move the dragged/clicked brick to the front of the board so that it is
 * not occluded by other bricks.
 * @private
 */
eYo.Responder.prototype.bringBrickToFront_ = function() {
  // Bricks in the flyout don't overlap, so skip the work.
  if (this.targetBrick_ && !this.flyout_) {
    this.targetBrick_.ui.sendToFront()
  }
}
