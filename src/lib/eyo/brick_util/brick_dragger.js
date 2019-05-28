/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Brick dragger for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'


goog.provide('eYo.BrickDragger')


goog.forwardDeclare('eYo.Dom')
goog.forwardDeclare('eYo.Brick')
goog.forwardDeclare('eYo.Workspace')
goog.forwardDeclare('eYo.Events.BrickMove')

goog.forwardDeclare('goog.math.Coordinate')


/**
 * Class for a brick dragger.  It moves bricks around the workspace when they
 * are being dragged by a mouse or touch.
 * @param {!eYo.Brick} brick The brick to drag.
 * @param {!eYo.Workspace} destination The workspace to drag on.
 * @constructor
 */
eYo.BrickDragger = function(destination) {
  /**
   * The workspace on which the brick is being dragged.
   * @type {!eYo.Workspace}
   * @private
   */
  this.destination = destination
}

Object.defineProperties(eYo.BrickDragger, {
  ui_driver: {
    get () {
      return this.destination.eyo.driver
    }
  },
  workspace_: {
    get () {
      throw 'DEPRECATED, use destination instead'
    }
  }
})

/**
 * Sever all links from this object.
 * @package
 */
eYo.BrickDragger.prototype.dispose = function() {
  this.availableMagnets_.length = 0
  this.availableMagnets_ = this.brick_ = this.target_ = this.magnet_ = null
  this.destination = null
}

/**
 * Eventually start dragging a brick.
 * @param {!eYo.Gesture} gesture  The gesture initiating the eventual drag.
 * @return {eYo.Brick}  The target brick of the drag event, if any.
 * @package
 */
eYo.BrickDragger.prototype.start = function(gesture) {
  this.gesture_ = gesture
  var targetBrick = gesture.targetBrick_
  if (!targetBrick) {
    return
  }
  var flyout = gesture.flyout_
  var deltaXY = gesture.xyDelta_
  if (flyout) {
    /*
     * Update this gesture to record whether a brick is being dragged from the
     * flyout.
     * This function should be called on a mouse/touch move event the first time the
     * drag radius is exceeded.  It should be called no more than once per gesture.
     * If a brick should be dragged from the flyout this function creates the new
     * brick on the main workspace and updates targetBrick_ and workspace_.
     * @return {boolean} True if a brick is being dragged from the flyout.
     * @private
     */
    // Disabled bricks may not be dragged from the flyout.
    if (targetBrick.disabled) {
      return
    }
    if (flyout.scrollable && !flyout.isDragTowardWorkspace(deltaXY)) {
      return
    }
    // Start the event group now,
    // so that the same event group is used for brick
    // creation and brick dragging.
    // The start brick is no longer relevant, because this is a drag.
    eYo.Events.disableWrap(() => {
      targetBrick = flyout.createBrick(targetBrick)
    })
    targetBrick.select()
  } else if (!targetBrick.movable) {
    return
  }
  var healStack = gesture.healStack_
  /**
   * The top brick in the stack that is being dragged.
   * @type {!eYo.Brick}
   * @private
   */
  this.brick_ = targetBrick.select()

  /**
   * The connections on the dragging bricks that are available to connect to
   * other bricks.  This includes all open connections on the top brick, as well
   * as the last connection on the brick stack.
   * Does not change during a drag.
   * @type {!Array.<!eYo.Magnet>}
   * @private
   */
  this.availableMagnets_ = targetBrick.getMagnets_(false)
  // Also check the last connection on this stack
  var m4t = targetBrick.footMost.foot_m
  if (m4t && m4t != targetBrick.foot_m) {
    this.availableMagnets_.push(m4t)
  }

  /**
   * The connection that would connect to this.target_ if this brick
   * were released immediately.
   * Updated on every mouse move.
   * @type {eYo.Magnet}
   * @private
   */
  this.magnet_ = null

  /**
   * The target magnet that this brick would connect to if released immediately.
   * Updated on every mouse move.
   * @type {eYo.Magnet}
   * @private
   */
  this.target_ = null

  /**
   * The distance between this.target_ and this.magnet_,
   * in workspace units.
   * Updated on every mouse move.
   * @type {number}
   * @private
   */
  this.distance_ = 0

  /**
   * Whether the brick would be deleted if it were dropped immediately.
   * Updated on every mouse move.
   * @type {boolean}
   * @private
   */
  this.wouldDelete_ = false

  /**
   * Which delete area the mouse pointer is over, if any.
   * One of {@link eYo.Workspace.DELETE_AREA_TRASH},
   * {@link eYo.Workspace.DELETE_AREA_TOOLBOX}, or {@link eYo.Workspace.DELETE_AREA_NONE}.
   * @type {?number}
   * @private
   */
  this.deleteArea_ = null

  /**
   * The location of the top left corner of the dragging brick at the beginning
   * of the drag in workspace coordinates.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.xyStart_ = this.brick_.ui.xyInWorkspace

  eYo.Selected.magnet = null
  var element = this.draggingBlock_.workspace.dom.div_
  this.transformCorrection_ = eYo.Do.getTransformCorrection(element)

  if (!eYo.Events.getGroup()) {
    eYo.Events.setGroup(true);
  }
  this.destination.setResizesEnabled(false)
  this.ui_driver.disconnectStop()
  if (this.brick_.parent ||
      (healStack && this.brick_.foot_m && this.brick_.foot_m.target)) {
    this.brick_.unplug(healStack)
    var xyDelta = this.destination.fromPixelUnit(deltaXY)
    var newLoc = goog.math.Coordinate.sum(this.xyStart_, xyDelta)
    this.brick_.ui.translate(newLoc.x, newLoc.y)
    this.brick_.ui.disconnectEffect();
  }
  this.brick_.ui.dragging = true
  this.brick_.ui.moveToDragSurface()

  this.drag()
  return targetBrick
}

/**
 * Execute a step of brick dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!goog.math.Coordinate} delta How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
eYo.BrickDragger.prototype.drag = function() {
  delta = this.gesture_.xyDelta_
  if (delta && this.transformCorrection_) {
    delta = this.transformCorrection_(delta)
  }
  var dXY = this.destination.fromPixelUnit(delta)
  var newLoc = goog.math.Coordinate.sum(this.xyStart_, dXY)

  this.brick_.ui.moveDuringDrag(newLoc)
  
  this.update(dXY)

  this.brick_.ui.setDeleteStyle(this.wouldDelete_)
  var trashcan = this.destination.trashcan
  if (trashcan) {
    trashcan.setOpen_(this.wouldDelete_ && this.deleteArea_ === eYo.DELETE_AREA_TRASH)
  }
}

/**
 * Finish a brick drag and put the brick back on the workspace.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} delta How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
eYo.BrickDragger.prototype.end = (() => {
  /**
   * Fire a move event at the end of a brick drag.
   * @private
   */
  var fireMoveEvent = self => {
    var event = new eYo.Events.BrickMove(self.brick_)
    event.oldCoordinate = self.xyStart_
    event.recordNew()
    eYo.Events.fire(event)
  }
  return function(e, delta) {
    if (delta && this.transformCorrection_) {
      delta = this.transformCorrection_(delta)
      this.transformCorrection_ = null // !important
    }
    // Make sure internal state is fresh.
    this.drag(delta)
    this.ui_driver.disconnectStop()
    var dXY = this.destination.fromPixelUnit(delta)
    var newLoc = goog.math.Coordinate.sum(this.xyStart_, dXY)
    var b3k = this.brick_
    b3k.ui.moveOffDragSurface(newLoc)
    if (this.wouldDelete_) {
      if (!this.gesture_.flyout_) {
        fireMoveEvent(this)
      }
      b3k.dispose(false, true)
    } else {
      // These are expensive and don't need to be done if we're deleting.
      b3k.moveMagnets_(dXY.x, dXY.y)
      b3k.ui.setDragging(false)
      this.connect()
      b3k.render()
      if (this.gesture_.flyout_) {
        eYo.Events.fireBrickCreate(b3k, true) 
      }
      fireMoveEvent(this)
      b3k.ui.scheduleSnapAndBump()
    }
    var trashcan = this.destination.trashcan
    if (trashcan) {
      goog.Timer.callOnce(trashcan.close, 100, trashcan)
    }
    this.destination.setResizesEnabled(true)

    eYo.Events.setGroup(false)
    this.availableMagnets_.length = 0
    this.availableMagnets_ = this.brick_ = this.target_ = this.magnet_ = null
  }
})()

/**
 * Connect to the closest magnet and render the results.
 * This should be called at the end of a drag.
 * @package
 */
eYo.BrickDragger.prototype.connect = function() {
  if (this.target_) {
    // Connect the two magnets
    this.magnet_.connect(this.target_)
    if (this.brick_.rendered) {
      // Trigger a connection animation.
      // Determine which connection is inferior (lower in the source stack).
      var inferiorM4t = this.magnet_.isSuperior ?
          this.target_ : this.magnet_
      inferiorM4t.brick.ui.connectEffect()
      // Bring the just-edited stack to the front.
      this.brick_.root.ui.sendToFront()
    }
    this.target_ && this.target_.ui.removeBlockHilight_()
  }
}

/**
 * Update highlighted connections based on the most recent move location.
 * @param {!goog.math.Coordinate} dxy Position relative to drag start,
 *     in workspace units.
 * @package
 */
eYo.BrickDragger.prototype.update = function(dxy) {
  this.deleteArea_ = this.destination.isDeleteArea(this.gesture_.event_)
  var oldTarget = this.target_
  this.target_ = this.magnet_ = null
  this.distance_ = Blockly.SNAP_RADIUS
  this.availableMagnets_.forEach(m4t => {
    var neighbour = m4t.closest(this.distance_, dxy)
    if (neighbour.magnet) {
      this.target_ = neighbour.magnet
      this.magnet_ = m4t
      this.distance_ = neighbour.radius
    }
  })
  if (oldTarget && oldTarget != this.target_) {
    oldTarget.ui.removeBlockHilight_()
  }

  // Prefer connecting over dropping into the trash can, but prefer dragging to
  // the toolbox over connecting to other bricks.
  var wouldConnect = !!this.target_ &&
      deleteArea != Blockly.DELETE_AREA_TOOLBOX
  var wouldDelete = !wouldConnect && !!deleteArea && !this.brick_.parent &&
      this.brick_.deletable
  this.wouldDelete_ = wouldDelete

  // Get rid of highlighting so we don't send mixed messages.
  if (wouldDelete && this.target_) {
    this.target_.ui.removeBlockHilight_()
    this.target_ = null
  }
  if (!wouldDelete_ && this.target_ && oldTarget != this.target_) {
    this.target_.ui.addBlockHilight_()
  }
}
