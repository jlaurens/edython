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

goog.require('eYo')

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
eYo.BrickDragger = function(brick, destination) {
  /**
   * The top brick in the stack that is being dragged.
   * @type {!eYo.Brick}
   * @private
   */
  this.brick_ = brick.select()

  /**
   * The connections on the dragging bricks that are available to connect to
   * other bricks.  This includes all open connections on the top brick, as well
   * as the last connection on the brick stack.
   * Does not change during a drag.
   * @type {!Array.<!eYo.Magnet>}
   * @private
   */
  this.availableMagnets_ = this.brick_.getMagnets_(false)
  // Also check the last connection on this stack
  var m4t = this.brick_.footMost.foot_m
  if (m4t && m4t != this.brick_.foot_m) {
    this.availableMagnets_.push(m4t)
  }

  /**
   * The workspace on which the brick is being dragged.
   * @type {!eYo.Workspace}
   * @private
   */
  this.destination = destination

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
  this.brick_ = this.target_ = this.magnet_ = null
  this.availableMagnets_.length = 0
  this.destination = null
}

/**
 * Start dragging a brick.  This includes moving it to the drag surface.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @param {boolean} healStack whether or not to heal the stack after disconnecting
 * @package
 */
eYo.BrickDragger.prototype.startBlockDrag = function(delta, healStack) {
  if (!eYo.Events.getGroup()) {
    eYo.Events.setGroup(true);
  }
  this.destination.setResizesEnabled(false)
  this.ui_driver.disconnectStop()
  if (this.brick_.parent ||
      (healStack && this.brick_.foo_m && this.brick_.foo_m.target)) {
    this.brick_.unplug(healStack)
    var dXY = this.destination.fromPixelUnit(delta)
    var newLoc = goog.math.Coordinate.sum(this.xyStart_, dXY)
    this.brick_.translate(newLoc.x, newLoc.y)
    this.brick_.ui.disconnectEffect();
  }
  this.brick_.ui.dragging = true
  // For future consideration: we may be able to put moveToDragSurface inside
  // the brick dragger, which would also let the brick not track the brick drag
  // surface.
  this.brick_.moveToDragSurface_()

  var toolbox = this.destination.toolbox
  toolbox && toolbox.addStyle(this.brick_.deletable
    ? 'eyo-toolbox-delete'
    : 'eyo-toolbox-grab'
  )
}

/**
 * Execute a step of brick dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} delta How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
eYo.BrickDragger.prototype.dragBlock = function(e, delta) {
  var dXY = this.destination.fromPixelUnit(delta)
  var newLoc = goog.math.Coordinate.sum(this.xyStart_, dXY)

  this.brick_.moveDuringDrag(newLoc)
  
  this.update(dXY)

  this.brick_.setDeleteStyle(this.wouldDelete_)
  var trashcan = this.destination.trashcan
  if (trashcan) {
    trashcan.setOpen_(this.wouldDelete_ && this.deleteArea_ === eYo.DELETE_AREA_TRASH)
  }
}

/**
 * Finish a brick drag and put the brick back on the workspace.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!goog.math.Coordinate} delta How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
eYo.BrickDragger.prototype.endBlockDrag = (() => {
  /**
   * Fire a move event at the end of a brick drag.
   * @private
   */
  var fireMoveEvent = (self) => {
    var event = new eYo.Events.BrickMove(self.brick_)
    event.oldCoordinate = self.xyStart_
    event.recordNew()
    eYo.Events.fire(event)
  }
  return function(e, delta) {
    // Make sure internal state is fresh.
    this.dragBlock(e, delta)
    this.ui_driver.disconnectStop()
    var dXY = this.destination.fromPixelUnit(delta)
    var newLoc = goog.math.Coordinate.sum(this.xyStart_, dXY)
    var b3k = this.brick_
    b3k.moveOffDragSurface_(newLoc)

    if (this.wouldDelete_) {
      fireMoveEvent(this)
      b3k.dispose(false, true)
    } else {
      // These are expensive and don't need to be done if we're deleting.
      b3k.moveMagnets_(dXY.x, dXY.y)
      b3k.ui.setDragging(false)
      this.connect()
      b3k.render()
      fireMoveEvent(this)
      b3k.scheduleSnapAndBump()
    }
    var trashcan = this.destination.trashcan
    if (trashcan) {
      goog.Timer.callOnce(trashcan.close, 100, trashcan)
    }
    this.destination.setResizesEnabled(true)

    var toolbox = this.destination.toolbox
    toolbox && toolbox.removeStyle(this.brick_.deletable
    ? 'eyo-toolbox-delete'
    : 'eyo-toolbox-grab')
    eYo.Events.setGroup(false)
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
  this.deleteArea_ = this.destination.isDeleteArea(e)
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
