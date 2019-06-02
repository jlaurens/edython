/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Gesture model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Gesture')

goog.require('eYo')

goog.forwardDeclare('eYo.Dom')
goog.forwardDeclare('eYo.BrickDragger')

// goog.forwardDeclare('eYo.DeskDragger')
// goog.forwardDeclare('eYo.FlyoutDragger')

goog.forwardDeclare('goog.math.Coordinate')
goog.forwardDeclare('goog.asserts')

/*
 * Note: In this file "start" refers to touchstart, mousedown, and pointerstart
 * events.  "End" refers to touchend, mouseup, and pointerend events.
 */
// TODO: Consider touchcancel/pointercancel.

/**
 * Class for one gesture.
 * @param {!Event} e The event that kicked off this gesture.
 * @param {!eYo.Desk} creatorDesk The desk that created
 *     this gesture and has a reference to it.
 * @constructor
 */
eYo.Gesture = function(e, desk) {
  /**
   * The position of the mouse when the gesture started.  Units are css pixels,
   * with (0, 0) at the top left of the browser window (mouseEvent clientX/Y).
   * @type {goog.math.Coordinate}
   */
  this.startXY_ = null;

  /**
   * How far the mouse has moved during this drag, in pixel units.
   * (0, 0) is at this.startXY_.
   * @type {goog.math.Coordinate}
   * @private
   */
  this.deltaXY_ = 0

  /**
   * The brick that the gesture started on, or null if it did not start on a
   * brick.
   * @type {eYo.Brick}
   * @private
   */
  this.startBrick_ = null;

  /**
   * The brick that this gesture targets.  If the gesture started on a
   * shadow brick, this is the first non-shadow parent of the brick.  If the
   * gesture started in the flyout, this is the root brick of the brick group
   * that was clicked or dragged.
   * @type {eYo.Brick}
   * @private
   */
  this.targetBrick_ = null;

  /**
   * The desk that the gesture started on.  There may be multiple
   * desks on a page; this is more accurate than using
   * Blockly.getMainDesk().
   * @type {eYo.Desk}
   * @private
   */
  this.desk_ = null;

  /**
   * The desk that created this gesture.  This desk keeps a reference
   * to the gesture, which will need to be cleared at deletion.
   * This may be different from the start desk.  For instance, a flyout is
   * a desk, but its parent desk manages gestures for it.
   * @type {eYo.Desk}
   * @private
   */
  this.creatorDesk_ = desk;

  /**
   * Whether the desk is currently being dragged.
   * @type {boolean}
   * @private
   */
  this.deskDragger_ = undefined

  /**
   * Whether the brick is currently being dragged.
   * @type {boolean}
   * @private
   */
  this.brickDragger_ = undefined

  /**
   * The event that most recently updated this gesture.
   * @type {!Event}
   * @private
   */
  this.event_ = e;

  /**
   * The object tracking a brick drag, or null if none is in progress.
   * @type {eYo.BrickDragger}
   * @private
   */
  this.brickDragger_ = null

  /**
   * The object tracking a desk or flyout desk drag, or null if none
   * is in progress.
   * @type {Blockly.DeskDragger}
   * @private
   */
  this.deskDragger_ = null;

  /**
   * The flyout a gesture started in, if any.
   * @type {eYo.Flyout}
   * @private
   */
  this.flyout_ = null;

  /**
   * Boolean for sanity-checking that some code is only called once.
   * @type {boolean}
   * @private
   */
  this.started_ = false;

  /**
   * Boolean used internally to break a cycle in disposal.
   * @type {boolean}
   * @private
   */
  this.isEnding_ = false;

  /**
   * Boolean used to indicate whether or not to heal the stack after
   * disconnecting a brick.
   * @type {boolean}
   * @private
   */
  this.healStack_ = !eYo.Gesture.DRAG_STACK

  /**
   * Boolean for whether or not this gesture is a multi-touch gesture.
   * @type {boolean}
   * @private
   */
  this.multiTouch_ = false

  /**
   * A map of cached points used for tracking multi-touch gestures.
   * @type {Object<number|string, goog.math.Coordinate>}
   * @private
   */
  this.cachedPoints_ = {};

  /**
   * This is the ratio between the starting distance between the touch points
   * and the most recent distance between the touch points.
   * Scales between 0 and 1 mean the most recent zoom was a zoom out.
   * Scales above 1.0 mean the most recent zoom was a zoom in.
   * @type {number}
   * @private
   */
  this.previousScale_ = 0;

  /**
   * The starting distance between two touch points.
   * @type {number}
   * @private
   */
  this.startDistance_ = 0;

}

Object.defineProperties(eYo.Gesture, {
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
   * A multiplier used to convert the gesture scale to a zoom in delta.
   * @const
   */
  ZOOM_IN_FACTOR: { value: 5 },
  /**
   * A multiplier used to convert the gesture scale to a zoom out delta.
   * @const
   */
  ZOOM_OUT_FACTOR: { value: 6 },
  /**
   * When dragging a block out of a stack, split the stack in two (true), or drag
   * out the block healing the stack (false).
   */
  DRAG_STACK: { value: true },
})

Object.defineProperties(eYo.Gesture.prototype, {
  /**
   * Whether this gesture is a drag of either a desk or brick.
   * @readonly
   * @type{boolean} true if this gesture is a drag of a desk or brick.
   * @package
   */
  dragging: {
    get () {
      return this.deskDragger_ || this.brickDragger_
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
        var selected = eYo.Selected.brick
        do {
          candidate = brick
        } while (brick.isExpr && (selected !== brick) && (brick = brick.parent))
        this.startBrick_ = candidate
        candidate.isInFlyout && (candidate = candidate.root)
        this.targetBrick_ = candidate
      }
    }
  },
  /**
   * General purpose ui_driver from the creator desk.
   */
  ui_driver: {
    get () {
      return this.creatorDesk_.ui_driver
    }
  },
  /**
   * General purpose ui_driver from the creator desk.
   */
  creatorDesk: {
    get () {
      return this.creatorDesk_
    }
  },
  /**
   * General purpose ui_driver from the creator desk.
   */
  desk: {
    get () {
      return this.desk_
    }
  }
})

/**
 * Sever all links from this object.
 * @package
 */
eYo.Gesture.prototype.dispose = function() {
  eYo.Dom.clearTouchIdentifier()
  Blockly.Tooltip.unblock()
  // Clear the owner's reference to this gesture.
  this.creatorDesk_.clearGesture()
  eYo.Dom.unbindMouseEvents(this)
  this.startBrick_ = this.targetBrick_ = null
  this.desk_ = this.creatorDesk_ = this.flyout_ = null
  this.brickDragger_ && (this.brickDragger_ = this.brickDragger_.clearGesture())
  this.deskDragger_ && (this.deskDragger_ = this.deskDragger_.clearGesture())
}

/**
 * Handle a mouse down, touch start, or pointer down event.
 * @param {!Event} e A mouse down, touch start, or pointer down event.
 * @package
 */
eYo.Gesture.prototype.on_mousedown = function(e) {
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
 * @package
 */
eYo.Gesture.prototype.handleTouchStart = function(e) {
  var pointerId = eYo.Dom.touchIdentifierFromEvent(e)
  // store the pointerId in the current list of pointers
  this.cachedPoints_[pointerId] = this.getTouchPoint_(e)
  var pointers = Object.keys(this.cachedPoints_)
  // If two pointers are down, check for pinch gestures
  if (pointers.length === 2) {
    var point0 = this.cachedPoints_[pointers[0]]
    var point1 = this.cachedPoints_[pointers[1]]
    this.startDistance_ = goog.math.Coordinate.distance(point0, point1)
    this.multiTouch_ = true
    e.preventDefault()
  }
}

/**
 * Handle a touch move or pointer move event and zoom in/out if two pointers are on the screen.
 * @param {!Event} e A touch move, or pointer move event.
 * @package
 */
eYo.Gesture.prototype.handleTouchMove = function(e) {
  var pointerId = eYo.Dom.touchIdentifierFromEvent(e)
  // Update the cache
  this.cachedPoints_[pointerId] = this.getTouchPoint_(e)

  var pointers = Object.keys(this.cachedPoints_)
  // If two pointers are down, check for pinch gestures
  if (pointers.length === 2) {
    // Calculate the distance between the two pointers
    var point0 = this.cachedPoints_[pointers[0]]
    var point1 = this.cachedPoints_[pointers[1]]
    var moveDistance = goog.math.Coordinate.distance(point0, point1)
    var startDistance = this.startDistance_
    var scale = this.touchScale_ = moveDistance / startDistance
    if (this.previousScale_ > 0 && this.previousScale_ < Infinity) {
      var gestureScale = scale - this.previousScale_
      var delta = gestureScale > 0
      ? gestureScale * eYo.Gesture.ZOOM_IN_FACTOR 
      : gestureScale * eYo.Gesture.ZOOM_OUT_FACTOR
      var desk = this.desk_
      var position = desk.xyEventInDesk(e)
      desk.zoom(position.x, position.y, delta)
    }
    this.previousScale_ = scale
    e.preventDefault()
  }
}

/**
 * Helper function returning the current touch point coordinate.
 * @param {!Event} e A touch or pointer event.
 * @return {goog.math.Coordinate} the current touch point coordinate
 * @package
 */
eYo.Gesture.prototype.getTouchPoint_ = function(e) {
  if (!this.desk_) {
    return null
  }
  return new goog.math.Coordinate(
    (e.pageX ? e.pageX : e.changedTouches[0].pageX),
    (e.pageY ? e.pageY : e.changedTouches[0].pageY)
  )
}

/**
 * Update internal state based on an event.
 * @param {!Event} e The most recent mouse or touch event.
 * @private
 */
eYo.Gesture.prototype.updateFromEvent_ = function(e) {
  console.log(e)
  this.event_ = e
  var currentXY = new goog.math.Coordinate(e.clientX, e.clientY)
  this.deltaXY_ = goog.math.Coordinate.difference(currentXY, this.startXY_)
  if (!this.dragging) {
    var delta = goog.math.Coordinate.magnitude(this.deltaXY_)
    var limit = this.flyout_
    ? eYo.Gesture.FLYOUT_DRAG_RADIUS
    : eYo.Gesture.DRAG_RADIUS
    if (delta > limit) {
      this.updateDraggingBrick_() || this.updateDraggingDesk_()
      eYo.Dom.longStop_()
    }
  }
}

/**
 * Update this gesture to record whether a brick is being dragged.
 * This function should be called on a mouse/touch move event the first time the drag radius is exceeded.
 * It should be called no more than once per gesture.
 * @return {boolean} true if a brick is being dragged.
 * @private
 */
eYo.Gesture.prototype.updateDraggingBrick_ = function() {
  var desk = this.flyout_
  ? this.flyout_.targetDesk_
  : this.desk_
  if (desk && (this.targetBrick_ = desk.brickDragger_.start(this))) {
    this.startBrick_ = null
    this.brickDragger_ = desk.brickDragger_
    this.desk_ = desk
    desk.updateScreenCalculationsIfScrolled()
    return true
  }
}

/**
 * Update this gesture to record whether a desk is being dragged.
 * This function should be called on a mouse/touch move event the first time the
 * drag radius is exceeded.  It should be called no more than once per gesture.
 * If a desk is being dragged this function creates the necessary
 * DeskDragger or FlyoutDragger and starts the drag.
 * @private
 */
eYo.Gesture.prototype.updateDraggingDesk_ = function() {
  var desk = 
    this.flyout_
    ? this.flyout_.desk_
    : this.desk_
  if (desk && (this.deskDragger_ = desk.dragger)) {
    this.deskDragger_.start(this)
  }
}

/**
 * Handle a mouse move or touch move event.
 * @param {!Event} e A mouse move or touch move event.
 * @package
 */
eYo.Gesture.prototype.on_mousemove = (() => {
  var move = function (e) {
    this.updateFromEvent_(e)
    if (this.deskDragger_) {
      this.deskDragger_.drag()
    } else if (this.brickDragger_) {
      this.brickDragger_.drag() // sometimes it failed when in Blockly
    }
    eYo.Dom.gobbleEvent(e) 
  }
  return function(e) {
    if (this.dragging) {
      // We are in the middle of a drag, only handle the relevant events
      if (eYo.Dom.shouldHandleEvent(e)) {
        move.call(this, e);
      }
      return;
    }
    if (this.multiTouch) {
      if (eYo.Dom.isTouchEvent(e)) {
        this.handleTouchMove(e)
      }
      eYo.Dom.longStop_()
    } else {
      move.call(this, e)
    }
  }
})()

/**
 * Handle a mouse up or touch end event.
 * @param {!Event} e A mouse up or touch end event.
 * @package
 */
eYo.Gesture.prototype.on_mouseup = function(e) {
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
    this.updateFromEvent_(e)
    eYo.Dom.longStop_()

    if (this.isEnding_) {
      console.log('Trying to end a gesture recursively.')
      return
    }
    this.isEnding_ = true
    // The ordering of these checks is important: drags have higher priority than
    // clicks.  Magnets have higher priority than bricks; bricks have higher
    // priority than desks.
    // The ordering within drags does not matter, because the three types of
    // dragging are exclusive.
    if (this.brickDragger_) {
      this.brickDragger_.end()
    } else if (this.deskDragger_) {
      this.deskDragger_.end()
    } else if (this.startBrick_) {
      this.doBrickClick_()
    } else {
      this.doDeskClick_()
    }
  }
  eYo.Dom.gobbleEvent(e)
  this.dispose()
}

/**
 * Cancel an in-progress gesture.  If a desk or brick drag is in progress,
 * end the drag at the most recent location.
 * @package
 */
eYo.Gesture.prototype.cancel = function() {
  // Disposing of a brick cancels in-progress drags, but dragging to a delete
  // area disposes of a brick and leads to recursive disposal. Break that cycle.
  if (this.isEnding) {
    return
  }
  eYo.Dom.longStop_()
  if (this.brickDragger_) {
    this.brickDragger_.end()
  } else if (this.deskDragger_) {
    this.deskDragger_.end()
  }
  this.dispose()
}

/**
 * Handle a real or faked right-click event by showing a context menu.
 * @param {!Event} e A mouse move or touch move event.
 * @package
 */
eYo.Gesture.prototype.handleRightClick = function(e) {
  if (this.targetBrick_) {
    this.bringBrickToFront_()
    this.targetBrick_.ui.showContextMenu_(e)
  } else if (this.desk_ && !this.flyout_) {
    this.desk_.showContextMenu_(e)
  }
  eYo.Dom.gobbleEvent(e)
  this.dispose()
}

/**
 * Handle a mousedown/touchstart event on a desk.
 * Used by desk and flyout.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.Desk} ws The desk the event hit.
 * @package
 */
eYo.Gesture.prototype.handleWsStart = function(e, ws) {
  goog.asserts.assert(!this.started_,
      'Tried to call gesture.handleWsStart, but the gesture had already been ' +
      'started.');
  this.started_ = true
  this.desk_ = ws
  var b3k = eYo.Selected.brick
  b3k && (b3k.ui.selectMouseDownEvent = e)
  this.doStart(e)
}

/**
 * Start a gesture: update the desk to indicate that a gesture is in
 * progress and bind mousemove and mouseup handlers.
 * Called from `handleWsStart`
 * @param {!Event} e A mouse down or touch start event.
 * @package
 */
eYo.Gesture.prototype.doStart = function(e) {
  if (eYo.Dom.isTargetInput(e)) {
    this.cancel()
    return
  }
  this.event_ = e
  this.ui_driver.disconnectStop()
  this.desk.updateScreenCalculationsIfScrolled()
  this.desk.markFocused()

  // Hide chaff also hides the flyout, so don't do it if the click is in a flyout.
  Blockly.Tooltip.block()

  if (this.targetBrick_) {
    this.targetBrick_.select()
  }

  if (eYo.Dom.isRightButton(e)) {
    this.handleRightClick(e)
    return
  }

  if (e.type == 'touchstart' ||
      (e.type == 'pointerdown' && e.pointerType != 'mouse')) {
    eYo.Do.longStart_(e, this)
  }

  this.startXY_ = new goog.math.Coordinate(e.clientX, e.clientY)
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
 * @package
 */
eYo.Gesture.prototype.handleFlyoutStart = function(e, flyout) {
  goog.asserts.assert(!this.started_,
      'Tried to call gesture.handleFlyoutStart, but the gesture had already ' +
      'been started.')
  this.flyout_ || (this.flyout_ = flyout)
  this.handleWsStart(e, flyout.desk)
}

/**
 * Handle a mousedown/touchstart event on a brick.
 * Used by brick's on_mousedown (or synonym).
 * @param {!Event} e A mouse down or touch start event.
 * @param {!eYo.Brick} brick The brick the event hits.
 * @package
 */
eYo.Gesture.prototype.handleBrickStart = function(e, brick) {
  goog.asserts.assert(!this.started_,
      'Tried to call gesture.handleBrickStart, but the gesture had already ' +
      'been started.')
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
eYo.Gesture.prototype.doBrickClick_ = function() {
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
 * Execute a desk click.
 * @private
 */
eYo.Gesture.prototype.doDeskClick_ = function() {
  eYo.Selected.brick && eYo.Selected.brick.unselect()
}

/* End functions defining what actions to take to execute clicks on each type
 * of target. */

/**
 * Move the dragged/clicked brick to the front of the desk so that it is
 * not occluded by other bricks.
 * @private
 */
eYo.Gesture.prototype.bringBrickToFront_ = function() {
  // Bricks in the flyout don't overlap, so skip the work.
  if (this.targetBrick_ && !this.flyout_) {
    this.targetBrick_.ui.sendToFront()
  }
}

/* Begin functions for populating a gesture at mouse down. */

/**
 * Record the brick that a gesture started on, and set the target brick
 * appropriately.
 * @param {eYo.Brick} brick The brick the gesture started on.
 * @package
 */
eYo.Gesture.prototype.setStartBrick = function(brick) {
  console.error("BREAK HERE")
  throw "DEPRECATED"
}

/**
 * Record the flyout that a gesture started on.
 * @param {Blockly.Flyout} flyout The flyout the gesture started on.
 * @private
 */
eYo.Gesture.prototype.setStartFlyout_ = function(flyout) {
  console.error("BREAK HERE")
  throw "DEPRECATED"
}

/**
 * Record the desk that a gesture started on.
 * @param {eYo.Desk} ws The desk the gesture started on.
 * @private
 */
eYo.Gesture.prototype.setStartDesk_ = function(ws) {
  console.error("BREAK HERE")
  throw "DEPRECATED"
}

/* End functions for populating a gesture at mouse down. */

/**
 * Whether this gesture has already been started.  In theory every mouse down
 * has a corresponding mouse up, but in reality it is possible to lose a
 * mouse up, leaving an in-process gesture hanging.
 * @return {boolean} whether this gesture was a click on a desk.
 * @package
 */
eYo.Gesture.prototype.hasStarted = function() {
  console.log('ERROR')
  throw "DEPRECATED"
}
