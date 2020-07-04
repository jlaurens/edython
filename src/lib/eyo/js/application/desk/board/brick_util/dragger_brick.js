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


eYo.forward('dom')
eYo.forward('brick')
eYo.forward('board')
eYo.forward('event.BrickMove')

/**
 * Class for a brick dragger.  It moves bricks around the board when they
 * are being dragged by a mouse or touch.
 * @param {eYo.board} destination The board to drag on.
 * @constructor
 */
eYo.dragger.newC9r('Brick', {
  init (destination) {
    this.destination_ = destination
  },
  aliases: {
    'motion.changer': 'changer'
  },
  properties: {
    destination: eYo.NA,
    brick: eYo.NA,
    target: eYo.NA,
    magnet: eYo.NA,
    motion: eYo.NA,
    availableMagnets: eYo.NA,
    /**
     * The associate drag surface
     * @type{eYo.NS.BrickDragSurface}
     * @readonly
     */
    dragSurface: {
      get () {
        return this.destination_.dom.svg.brickDragSurface
      }
    },
    xyStart: {
      copy: true,
    },
    /**
     * Returns the deplacement relative to the starting point.
     * 
     */
    xyDelta: {
      get: eYo.changer.memoize('xyDeltadragger.Brick', function () {
        return {ans: this.destination.fromPixelUnit(this.motion_.xyDelta_)}
      }),
      copy: true,
    },
    xyNew_: {
      get () {
        return this.xyStart.forward(this.xyDelta_)
      }
    },
    desk: {
      get () {
        return this.destination_.desk
      }
    },
    driver_mngr: {
      get () {
        return this.desk.driver_mngr
      }
    },
  },
  methods: {
    /**
     * Eventually start dragging a brick.
     * One of the problem is to constrain dragging.
     * There are different options, but the one chosen implies
     * the dragging of the board.
     * There is a possibility that has not been explored:
     * move the bricks on the board to indicate where to put the dradded brick.
     * This seems a very interesting and appealing strategy but highly expensive.
     * Here is how it is implemented.
     * As long as the brick is in the visible area, do not scroll the board.
     * When the brick will be out of the visible area, scroll the board instead
     * as far as possible, then scroll the brick accordingly.
     * We track both the mouse location and the brick location.
     * When the center of the brick will gout out the visible area,
     * we scroll the brick board to keep it back.
     * @param {eYo.event.Motion} motion  The motion initiating the eventual drag.
     * @return {eYo.brick.BaseC9r}  The target brick of the drag event, if any.
     */
    start (motion) {
      if (this.brick_) {
        return this.brick_
      }
      this.motion_ = motion
      var targetBrick = motion.targetBrick_
      if (!targetBrick) {
        return
      }
      var flyout = motion.flyout_
      if (flyout) {
        /*
        * Update this motion to record whether a brick is being dragged from the
        * flyout.
        * This function should be called on a mouse/touch move event the first time the
        * drag radius is exceeded.  It should be called no more than once per motion.
        * If a brick should be dragged from the flyout this function creates the new
        * brick on the main board and updates targetBrick_ and board_.
        * @return {boolean} destination_ if a brick is being dragged from the flyout.
        * @private
        */
        // Disabled bricks may not be dragged from the flyout.
        if (targetBrick.disabled) {
          return
        }
        if (!flyout.isDragTowardBoard(motion)) {
          return
        }
        // Start the event group now,
        // so that the same event group is used for brick
        // creation and brick dragging.
        // The start brick is no longer relevant, because this is a drag.
        eYo.event.disableWrap(() => {
          targetBrick = flyout.createBrick(targetBrick)
        })
      } else if (!targetBrick.movable) {
        return
      }
      /**
      * The top brick in the stack that is being dragged.
      * @type {!eYo.brick.BaseC9r}
      * @private
      */
      this.brick_ = targetBrick.focusOn()

      /**
      * The connections on the dragging bricks that are available to connect to
      * other bricks.  This includes all open connections on the top brick, as well
      * as the last connection on the brick stack.
      * Does not change during a drag.
      * @type {!Array<!eYo.magnet>}
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
      * @type {eYo.magnet.BaseC9r}
      * @private
      */
      this.magnet_ = null

      /**
      * The target magnet that this brick would connect to if released immediately.
      * Updated on every mouse move.
      * @type {eYo.magnet.BaseC9r}
      * @private
      */
      this.target_ = null

      /**
      * The distance between this.target_ and this.magnet_,
      * in board units.
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
      * One of {@link eYo.event.DELETE_AREA_TRASH},
      * {@link eYo.event.DELETE_AREA_TOOLBOX}, or {@link eYo.event.DELETE_AREA_NONE}.
      * @type {?number}
      * @private
      */
      this.deleteRect_ = null

      /**
      * The location of the top left corner of the dragging brick at the beginning
      * of the drag in board coordinates.
      * @type {!eYo.geom.Point}
      * @private
      */
      this.xyStart_ = this.brick_.xy

      eYo.focus.magnet = null
      
      eYo.event.beginGroup()
      this.destination.setResizesEnabled(false)
      var d = this.driver_mngr
      d.brickEffectStop()
      var healStack = motion.healStack_
      var b3k = this.brick_
      b3k.ui.dragging = true
      if (b3k.parent ||
          (healStack && b3k.foot_m && b3k.foot_m.target)) {
        b3k.unplug(healStack)
        b3k.moveBy(this.xyDelta)
        b3k.disconnectEffect()
      }
      d.draggerBrickStart(this)
      this.drag()
      return targetBrick
    },
    /**
     * Get the position of receiver's brick relative to
     * the visible area.
     * Return value: if `x < 0`, left of the visible area,
     * if `x > 0`, right of the visible area, 0 otherwise.
     * eYo.NA when the brick is not in a board.
     * The same holds for `y`.
     * The values are the signed distances between the center
     * of the brick and the visible area.
     * If the answer is `{x: -15, y: 0}`, we just have to scroll the board
     * 15 units to the right and the brick is visible.
     * For edython.
     * @param {eYo.brick.BaseC9r} brick The new location of the receiver, the actual location when eYo.NA.
     * @param {Object} [newLoc] The new location of the receiver, the actual location when eYo.NA.
     * @return {{x: number, y: number}|eYo.NA}
     */
    getOffsetFromVisible (brick ,newLoc) {
      var ui = brick.ui
      var board = brick.board
      if (!board) {
        return eYo.NA
      }
      // is the brick in the visible area ?
      var metrics = board.metrics
      if (!metrics) {
        // sometimes eYo.NA is returned
        console.error("UNDEFINED METRICS, BREAK HERE TO DEBUG")
        return {
          x: 0,
          y: 0
        }
      }
      var scale = board.scale || 1
      var HW = ui.size
      // the brick is in the visible area if we see its center
      var view = metrics.view
      var leftBound = view.x / scale - HW.width / 2
      var topBound = view.y / scale - HW.height / 2
      var rightBound = view.x_max / scale - HW.width / 2
      var downBound = view.y_max / scale - HW.height / 2
      var xy = newLoc || ui.whereInBoard
      return {
        x: xy.x < leftBound
          ? xy.x - leftBound
          : xy.x > rightBound
            ? xy.x - rightBound
            : 0,
        y: xy.y < topBound
          ? xy.y - topBound
          : xy.y > downBound
            ? xy.y - downBound
            : 0,
      }
    },
    /**
     * Execute a step of brick dragging, based on the given event.  Update the
     * display accordingly.
     * @param {eYo.geom.Point} delta How far the pointer has
     *     moved from the position at the start of the drag, in pixel units.
     */
    drag () {
      var xyNew = this.xyNew_
      var b3k = this.brick_
      var d = this.getOffsetFromVisible(b3k, xyNew)
      if (d) {
        xyNew.x -= d.x
        xyNew.y -= d.y
      }
      var bds = this.dragSurface
      if (bds) {
        bds.move()
      } else {
        this.driver_mngr.brickSetOffsetDuringDrag(b3k, xyNew)
      }
      this.brick_.drvr.deleteStyleSet(this.wouldDelete_)
      this.update()

      var trashCan = this.destination.trashCan
      if (trashCan) {
        trashCan.setOpen_(this.wouldDelete_ && this.deleteRect_ === eYo.event.DELETE_AREA_TRASH)
      }
    },
    /**
     * Finish a brick drag and put the brick back on the board.
     * @param {Event} e The most recent move event.
     * @param {eYo.geom.Point} delta How far the pointer has
     *     moved from the position at the start of the drag, in pixel units.
     */
    end: (() => {
      /**
       * Fire a move event at the end of a brick drag.
       * @private
       */
      let fireMoveEvent = $this => {
        eYo.event.fireBrickMove($this.brick_, event => {
          event.oldCoordinate = $this.xyStart_
        })
      }
      return function(e, delta) {
        this.drag(delta)
        this.driver_mngr.draggerBrickEnd(this)
        var b3k = this.brick_
        if (this.wouldDelete_) {
          if (!this.motion_.flyout_) {
            fireMoveEvent(this)
          }
          b3k.dispose(false, true)
        } else {
          // These may be expensive and won't be done if we're deleting.
          b3k.ui.placeMagnets_()
          b3k.ui.dragging = false
          this.connect()
          b3k.render()
          if (this.motion_.flyout_) {
            eYo.event.fireBrickCreate(b3k, true) 
          }
          fireMoveEvent(this)
          b3k.drvr.scheduleSnapAndBump(b3k)
        }
        var trashCan = this.destination.trashCan
        if (trashCan) {
          goog.Timer.callOnce(trashCan.close, 100, trashCan)
        }
        this.destination.setResizesEnabled(true)

        eYo.event.endGroup()
        this.availableMagnets_.length = 0
        this.availableMagnets_ = this.brick_ = this.target_ = this.magnet_ = this.clearMotion()
      }
    })(),
    /**
     * Reset motion.
     */
    clearMotion () {
      this.motion_ = null
    },
    /**
     * Connect to the closest magnet and render the results.
     * This should be called at the end of a drag.
     */
    connect () {
      if (this.target_) {
        // Connect the two magnets
        this.magnet_.connect(this.target_)
        if (this.brick_.rendered) {
          // Trigger a connection animation.
          // Determine which connection is inferior (lower in the source stack).
          var inferiorM4t = this.magnet_.isSuperior ?
            this.target_ : this.magnet_
          inferiorM4t.brick.connectEffect()
          // Bring the just-edited stack to the front.
          this.brick_.root.sendToFront()
        }
        this.target_ && this.target_.ui.hilightAdd_()
      }
    },
  },
})

/**
 * Update highlighted connections based on the most recent move location.
 */
eYo.dragger.Brick.prototype.update = function() {
  var deleteRect = this.deleteRect_ = this.destination.inDeleteArea(this.motion_)
  var oldTarget = this.target_
  this.target_ = this.magnet_ = null
  this.distance_ = eYo.event.SNAP_RADIUS
  this.availableMagnets_.forEach(m4t => {
    var neighbour = m4t.closest(this.distance_, this.xyDelta)
    if (neighbour.magnet) {
      this.target_ = neighbour.magnet
      this.magnet_ = m4t
      this.distance_ = neighbour.radius
    }
  })
  if (oldTarget && oldTarget != this.target_) {
    oldTarget.ui.hilightAdd_()
  }
  // Prefer connecting over dropping into the trash can, but prefer dragging to
  // the flyout over connecting to other bricks.
  var wouldConnect = !!this.target_ &&
      deleteRect != eYo.event.DELETE_AREA_TOOLBOX
  var wouldDelete = !wouldConnect && !!deleteRect && !this.brick_.parent &&
      this.brick_.deletable
  this.wouldDelete_ = wouldDelete

  // Get rid of highlighting so we don't send mixed messages.
  if (wouldDelete && this.target_) {
    this.target_.ui.hilightAdd_()
    this.target_ = null
  }
  if (!wouldDelete && this.target_ && oldTarget != this.target_) {
    this.target_.hilightAdd_()
  }
}
