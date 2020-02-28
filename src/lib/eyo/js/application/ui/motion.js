/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Motion model. Superseeds the dom events relatd to mouse, pointer and touch.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.forwardDeclare('board')
eYo.forwardDeclare('brick')
eYo.forwardDeclare('field')
eYo.forwardDeclare('magnet')

eYo.forwardDeclare('dnd')
eYo.forwardDeclare('event.Scaler')

eYo.forwardDeclare('dom')

/*
 * Note: In this file "start" refers to touchstart,
 * mousedown, and pointerstart events.
 * "end" refers to touchend, mouseup, and pointerend events.
 */
// TODO: Consider touchcancel/pointercancel.

Object.defineProperties(eYo.event._p, {
  /**
   * The latency between 2 mouse down/up events,
   * in order to recognize a (multi) click event.
   * @type {number}
   */
  DOUBLE_LATENCY: { value: 350 },
  /**
   * The latency between 2 mouse down/up events,
   * in order to recognize a (multi) click event.
   * @type {number}
   */
  LONG_PRESS_LATENCY: { value: 500 },
  /**
   * The latency between 2 mouse down/up events,
   * in order to recognize a (multi) click event.
   * @type {number}
   */
  CANCEL_LATENCY: { value: 15000 },
  /**
   * Number of pixels the mouse must move before a drag starts.
   */
  DRAG_RADIUS: { value: 5 },
  /**
   * Number of pixels the mouse must move before a drag/scroll starts from the
   * flyout.  Because the drag-intention is determined when this is reached, it is
   * larger than DRAG_RADIUS so that the drag-direction is clearer.
   */
  FLYOUT_DRAG_RADIUS: { value: 10 },
  /**
   * A multiplier used to convert the motion scale to a zoom in delta.
   * @const
   */
  ZOOM_IN_FACTOR: { value: 5 },
  /**
   * A multiplier used to convert the motion scale to a zoom out delta.
   * @const
   */
  ZOOM_OUT_FACTOR: { value: 6 },
  /**
   * If the scale is bigger than this limit, a zoom out occurs.
   * @const
   */
  ZOOM_IN_LIMIT: { value: 1.05 },
  /**
   * If the scale is less than this limit, a zoom out occurs.
   * @const
   */
  ZOOM_OUT_LIMIT: { value: 0.95 },
  /**
   * When dragging a block out of a stack, split the stack in two (true), or drag
   * out the block healing the stack (false).
   * @const
   */
  DRAG_STACK: { value: true },
  /**
   * NYD.
   * @const
   */
  SNAP_RADIUS: { value: 20 },
  DELETE_AREA_NONE: { value: null },
  /**
   * ENUM representing that an event is in the delete area of the trash can.
   * @const
   */
  DELETE_AREA_TRASH: { value: 1 },
  /**
   * ENUM representing that an event is in the delete area of the flyout or
   * flyout.
   * @const
   */
  DELETE_AREA_TOOLBOX: { value: 2 },
  CAPTURE_IGNORED: { value: 0 },
  CAPTURE_STARTED: { value: 1 },
  CAPTURE_UPDATING: { value: 2 },
})

/**
 * @name{eYo.event.Motion}
 * @constructor
 * Class for one motion.
 * There should be only one active motion at a time.
 * Actually, the topmost object, eYo.app.Base, is managing this motion.
 * 
 * @param {eYo.app.Base} application - The top application where the event occured.
 * @constructor
 */
eYo.event.makeC9r('Motion', {
  /**
   * Reset and sever all links from this object.
   */
  dispose () {
    this.reset()
  },
  aliases: {
    owner: 'event',
  },
  properties: {
    scaler () {
      return new eYo.event.Scaler(this)
    },
    dndmngr () {
      return new eYo.dnd.Mngr(this)
    },
    change () {
      return new eYo.change.Base(this)
    },
    touchIDs () {
      return []
    },
    /**
     * The board the motion started on,
     * including the brick's board if it started on a brick,
     * or null if it did not start on a brick.
     * @type {eYo.board}
     * @private
     */
    starter: {
      dispose: false,
    },
    /**
     * The position of the mouse when the motion started.
     * Units are css pixels, with (0, 0) at the top left of
     * the browser window (mouseEvent clientX/Y).
     * @type {eYo.geom.Point}
     */
    xyStart: eYo.NA,
    /**
     * How far the mouse has moved during this drag, in pixel units.
     * (0, 0) is at this.xyStart_.
     * @type {eYo.geom.Point}
     * @private
     */
    xyDelta: {
      copy: true,
    },
    /**
     * Boolean used internally to break a cycle in disposal.
     * @type {boolean}
     * @private
    */
    isEnding_: false,
    /**
     * This is the ratio between the starting distance between the touch points
     * and the most recent distance between the touch points.
     * Scales between 0 and 1 mean the most recent zoom was a zoom out.
     * Scales above 1.0 mean the most recent zoom was a zoom in.
     * @type {number}
     * @private
     */
    previousScale: 0,
    /**
     * The starting distance between two touch points.
     * @type {number}
     * @private
     */
    startDistance: 0,
    pidLong: {
      value: 0,
      willChange(before, after) {
        clearTimeout(before)
      },
    },
    pidCancel: {
      value: 0,
      willChange(before, after) {
        clearTimeout(before)
      },
    },
    pidHandle: {
      value: 0,
      willChange(before, after) {
        clearTimeout(before)
      },
    },
    clickCount: 0,
    shouldSelect: eYo.NA,
    startBrick: {
      /*
       * Dragging should start for selected bricks only.
       */
      validate (after) {
        if (!this.brick) {
          let selected = this.app.focus_mngr.brick
          do {
            var candidate = after
          } while (after.isExpr && (selected !== after) && (after = after.parent))
          return candidate.isInFlyout && candidate.root || candidate
        }
      },
      dispose: false,
    },
    /**
     * The field that the motion started on,
     * or null if it did not start on a field.
     * @type {eYo.brick.Base}
     * @private
     */
    field: {
      get () {
        return this.starter__ && this.starter__.isField && this.starter__
      },
    },
    /**
     * The brick that the motion started on,
     * including the field's brick if it started on a field,
     * or null if it did not start on a brick.
     * @type {eYo.brick.Base}
     * @private
     */
    brick: {
      get () {
        return this.starter__ && (
          this.starter__.isBrick?
            this.starter__.wrapper:
            this.field_.brick.wrapper
        )
      },
    },
    /**
     * The brick that this motion targets.
     * If the motion started in the flyout,
     * this is the root brick of the brick group
     * that was clicked or dragged.
     * @type {eYo.brick.Base}
     * @private
     */
    targetBrick: {
      get () {
        var b3k = this.brick
        return b3k && (b3k.inLibrary ? b3k.root: b3k)
      },
    },
    /**
     * The board the motion started on,
     * including the brick's board if it started on a brick,
     * or null if it did not start on a brick.
     * @type {eYo.board}
     * @private
     */
    board: {
      get () {
        var starter = this.starter__ 
        return this.starter__ && (starter.isBoard
          ? starter
          : (starter = this.field_ || this.brick_) && starter.board
        )
      },
    },
    /**
     * Boolean for whether or not this motion is a multi-touch motion.
     * @type {boolean}
     * @private
     */
    isMultiTouch: {
      get () {
        return this.touchIDs.length > 1
      },
    },
    /**
     * The flyout of the board the motion started on, if any.
     * @type {eYo.view.Flyout}
     * @private
     */
    flyout: {
      get () {
        let b3d = this.board
        return b3d && b3d.flyout
      },
    },
    /**
     * General purpose ui_driver_mngr from the creator board.
     */
    ui_driver_mngr: {
      get () {
        let b3d = this.board
        return b3d && b3d.ui_driver_mngr
      },
    },
    /**
     * Position of the receiver's event in the board.
     * @type {eYo.geom.Point}
     * @readonly
     */
    where: {
      get () {
        return new eYo.geom.Point(this.event)
      },
    },
  },
  methods: {
    /**
     * The receiver has been started.
     * @param {Event} e - the dom event
     * @return {eYo.event.Motion} the receiver
     */
    update (e) {
      return this
    },
    /**
     * Reset the receiver to default values.
     * @return {eYo.event.Motion} the receiver
     */
    reset () {
      if (this.event) {
        this.change_.reset()
        this.dndmngr_.reset()
        this.scaler_.reset()
        this.starter_ = null
        this.touchIDs_.length = 0
        this.touchID_ = null
        this.startDistance_ = 0
        eYo.dom.clearTouchIdentifier()
        Blockly.Tooltip.unblock()
        eYo.dom.unbindMouseEvents(this)
        this.pidCancel_ = this.pidLong_ = this.pidHandle_ = 0
        this.event_ = null
        this.abortCapture()
        this.clickCount_ = 0
        this.shouldSelect_ = null
      }
      return this
    },
    /**
     * Cancel an event.
     * @private
     */
    cancel (e) {
      this.abortCancel_()
      this.scaler_.cancel() || this.dndmngr_.cancel()
      this.reset()
    },
    /**
     * Kill the queued cancel task.
     * @private
     */
    abortCancel_ () {
      this.pidCancel_ = 0
    },
  },
})

eYo.event.Motion.eyo.methodsMerge({
  /**
   * @private
   */
  abortCaptureMove_: eYo.doNothing,
  /**
   * @private
   */
  abortCaptureGestureMove_: eYo.doNothing,
  /**
   * @private
   */
  abortCaptureCancel_: eYo.doNothing,
  /**
   * @private
   */
  abortCaptureUp_: eYo.doNothing,
  /**
   * Start capturing a motion.
   * We are not able to handle the motion yet because we do not know
   * in what kind it will end to. For example, is it a (multi) click,
   * a drag, a touch, a pinch... What we only know is the caller.
   * If the return value is true, the caller should prevent default
   * event handling, it should not otherwise.
   * @param {Event} e - A mouse/pointer down or touch start dom event.
   * @param {eYo.brick|eYo.board} [starter] - The object that received the starting event, either a board or a brick.
   * @return {Object} A satus indicating whether the start is successfull
   */
  captureStart (e, starter) {
    if (eYo.dom.isTargetInput(e)) {
      this.cancel()
      return this.ns.CAPTURE_IGNORED
    }
    if (this.event_) {
      return this.ns.CAPTURE_UPDATING
    }
    this.abortCapture_()
    var capturer = {
      mousedown: this.captureMouseStart_,
      pointerdown: this.captureMouseStart_,
      touchstart: this.captureTouchStart_
    } [e.type]
    if (capturer) {
      this.event__ = e
      this.starter_ = starter
      this.pidCancel_ = setTimeout(() => {
        this.pidCancel__ = 0
        this.cancel()
      }, this.ns.CANCEL_LATENCY)
      this.ui_driver.disconnectStop()
      var board = this.board_
      board.updateScreenCalculationsIfScrolled()
      board.markFocused()  
      capturer.call(this)
      eYo.dom.gobbleEvent(e)
      return this.ns.CAPTURE_STARTED
    }
    return this.ns.CAPTURE_IGNORED
  },
  /**
   * Stop capturing 'up', 'move' and 'cancel' events.
   * Remove custom capture method overrides.
   * @private
   */
  abortCapture_ (e) {
    this.abortCaptureUp_()
    this.abortCaptureMove_()
    this.abortCaptureGestureMove_()
    this.abortCaptureCancel_()
    delete this.captureStart
    delete this.captureMouseMove_
    delete this.captureTouchMove_
  },
})

// ANCHOR Mouse
eYo.event.Motion.eyo.methodsMerge({
  /**
   * Start capturing a mouse motion.
   * @private
   */
  captureMouseStart_ () {
    if (this.event_.pointerType === 'mouse') {
      return // this will be tracked as mouse event
    }
    // there can be a drag only if the brick is already selected
    // or no brick was clicked at all
    if (!this.brick_ || this.brick_.hasFocus) {
      let captureMove = e => {
        this.captureMouseMove_(e)
      }
      window.addEventListener('mousemove', captureMove, true)
      this.abortCaptureMove_ = () => {
        delete this.abortCaptureMove_
        window.removeEventListener('mousemove', captureMove, true)
      }
    }
    // select the brick if any
    // and prepare a click motion
    if (this.brick_) {
      if (this.brick_.isDescendantOf(eYo.app.focus_mngr.brick) && this.event_.altKey) {
        this.shouldSelect_ = eYo.app.focus_mngr.brick.parent
      } else {
        this.shouldSelect_ = !this.brick_.selected && this.brick_
      }
      this.brick_.focusOn()
    }
    // prepare to capture a mouseup like event
    let captureUp = e => {
      this.captureMouseUp_(e)
    }
    window.addEventListener('mouseup', captureUp, true)
    this.abortCaptureUp_ = () => {
      delete this.abortCaptureUp_
      window.removeEventListener('mouseup', captureUp, true)
    }
  },
  /**
   * Kill the queued handle task.
   * @private
   */
  abortHandle_ () {
    this.pidHandle_ = 0
  },
  /**
   * Capturing a mouse move event.
   * @private
   */
  captureMouseMove_ (e) {
    this.event__ = e
    this.xyDelta_ = this.where.backward(this.xyStart_)
    var delta = this.xyDelta_.magnitude
    var limit = this.flyout
    ? this.ns.FLYOUT_DRAG_RADIUS
    : this.ns.DRAG_RADIUS
    if (delta > limit) {
      this.brick_ && this.brick_.focusOn()
      this.abortLongPress_()
      this.abortHandle_()
      this.captureMouseMove_ = this.captureMouseDrag_
      this.dndmngr_.start()
    }
  },
  /**
   * A dragging operation has started, any move of the device
   * is applied to the dndmngr.
   */
  captureMouseDrag_ (e) {
    this.event__ = e
    this.xyDelta_ = this.where.backward(this.xyStart_)
    this.dndmngr_.update()
  },
  /**
   * Eventually end capturing a mouse motion.
   * @private
   */
  captureMouseUp_ (e) {
    if (this.dragging) {
      this.captureMouseDrag_(e)
      this.dndmngr_.complete()
      this.reset()
      return
    }
    this.clickCount_ += 1
    this.abortLongPress_()
    this.abortCaptureMove_() // no dragging possible
    this.willHandleClick_()
    this.captureStart = this.captureStartMoreMouse_
  },
  /**
   * Capturing a mouse down event, just after a mouse up.
   * Replace `captureStart`.
   * Update the receiver's event.
   * @private
   */
  captureStartMoreMouse_ (e) {
    if (e.type === 'mousedown') {
      this.event__ = e
      this.willHandleClick_()
      eYo.dom.gobbleEvent(e)
    }
  },
})

// ANCHOR Touch
eYo.event.Motion.eyo.methodsMerge({
  /**
   * Start capturing a touch event.
   * The very first touch event captured will lead to
   * either a click or a drag or a pinch.
   * 
   * @private
   */
  captureTouchStart_ () {
    let captureMove = e => {
      this.captureTouchMove_(e)
    }
    window.addEventListener('touchmove', captureMove, true)
    this.abortCaptureMove_ = () => {
      delete this.abortCaptureMove_
      window.removeEventListener('touchmove', captureMove, true)
    }
    let captureUp = e => {
      this.captureTouchEnd_(e)
    }
    window.addEventListener('touchend', captureUp, true)
    this.abortCaptureUp_ = () => {
      delete this.abortCaptureUp_
      window.removeEventListener('touchend', captureUp, true)
    }
    let captureCancel = e => {
      this.captureTouchCancel_(e)
    }
    window.addEventListener('touchcancel', captureCancel, true)
    this.abortCaptureCancel_ = () => {
      delete this.abortCaptureCancel_
      window.removeEventListener('touchcancel', captureCancel, true)
    }
    var list = this.event_.changedTouches
    if (list.length) {
      var touch = list.item(0)
      this.touchIDs_.push(touch.identifier)
      this.captureStart = this.captureStartMoreTouch_
    }
  },
  /**
   * Start capturing a second (at least) touch event.
   * On success, the motion becomes a multi touch.
   * 
   * @private
   */
  captureStartMoreTouch_ (e) {
    if (e.type === 'touchstart') {
      this.event__ = e
      var list = e.changedTouches
      if (list.length) {
        var touch1st = e.touches().identifiedTouch(this.touchIDs_[0])
        var touch2nd = list.item(0)
        this.touchIDs_.push(touch2nd.identifier)
        var xy1st = new eYo.geom.Point(touch1st)
        var xy2nd = new eYo.geom.Point(touch2nd)
        this.startDistance_ = xy1st.distance(xy2nd) // Screen coordinates ?
        // Simply ignore any supplemental touch:
        this.captureStart = eYo.doNothing
        eYo.dom.gobbleEvent(e)
      }
    }
  },
  /**
   * Start capturing a touch move event.
   * Scaling or dragging may start here.
   * 
   * @private
   */
  captureTouchMove_ (e) {
    if (e.type === 'touchmove' || e.type === 'gesturemove') {
      this.event__ = e
      if (e.scale) {
        // this code is executed only when
        // - touchmove and not in WebKit xor 
        // - gesturemove and in WebKit
        if (this.scaler_.start() || this.dndmngr_.start()) {
          eYo.dom.gobbleEvent(e)
          this.abortLongPress_()
          this.abortHandle_()
          this.captureTouchMove_ = this.captureTouchDragOrScale_
        }
        /*
        if (!this.scaler_.update()) {
          if (e.scale > this.ns.ZOOM_IN_LIMIT || e.scale < this.ns.ZOOM_OUT_LIMIT) {
            this.scaler_.start()
          }
        } else if (!this.dndmngr_.update()) {
          this.xyDelta_ = this.where.backward(this.xyStart_)
          var delta = this.xyDelta_.magnitude
          var limit = this.flyout
          ? this.ns.FLYOUT_DRAG_RADIUS
          : this.ns.DRAG_RADIUS
          if (delta > limit) {
            this.brick_ && this.brick_.focusOn()
            this.abortLongPress_()
            this.abortHandle_()
            this.captureTouchMove_ = this.captureTouchDragOrScale_
            this.dndmngr_.start()
          }      
        }
        */
      }
    }
  },
  /**
   * Start capturing a touch move event for scaling only.
   * 
   * @private
   */
  captureTouchDragOrScale_ (e) {
    if (e.type === 'touchmove' || e.type === 'gesturemove') {
      this.event__ = e
      if (e.scale) {
        eYo.dom.gobbleEvent(e)
        this.scaler_.update() || this.dndmngr_.update()
      }
    }
  },
  /**
   * Capturing a touch end.
   * @private
   */
  captureTouchEnd_ (e) {
    this.event__ = e
    if (this.scaler_.end() || this.dndmngr_.end()) {
      this.reset()
      eYo.dom.gobbleEvent(e)
    } else {
      var changedTouch = e.changedTouches.item(0)
      this.touchIDs_ = this.touchIDs_.filter(x => x != changedTouch.identifier)
      if (!this.touchIDs_.length) {
        // like a mouse up
        this.clickCount_ += 1
        this.abortLongPress_()
        this.abortCaptureMove_() // no dragging/scaling allowed
        this.willHandleClick_()
        // Do not look for move events
        this.captureStart = this.captureStartMoreTouchNoMove_
      }
    }
  },
  /**
   * Start capturing a second touch event.
   * On success, the motion becomes a multi touch.
   * 
   * @private
   */
  captureStartMoreTouchNoMove_ (e) {
    if (e.type === 'touchstart') {
      this.event__ = e
      var list = e.changedTouches
      if (list.length) {
        var touch2nd = list.item(0)
        this.touchIDs_.push(touch2nd.identifier)
        // Simply ignore any supplemental touch:
        this.captureStart = eYo.doNothing
        eYo.dom.gobbleEvent(e)
      }
    }
  },
  /**
   * Capturing a touch cancel.
   * @private
   */
  captureTouchCancel_ (e) {
    this.cancel()
    eYo.dom.gobbleEvent(e)
  },
})

// ANCHOR long press
eYo.event.Motion.eyo.methodsMerge({
  /**
   * Schedule a long press.
   * Context menus on touch devices are activated using a long-press.
   * Unfortunately the contextmenu touch event is currently (2015) only supported
   * by Chrome.  This function is fired on any touchstart event, queues a task,
   * which after about a second opens the context menu.  The tasks is killed
   * if the touch event terminates early.
   * @param {Event} e Touch start event.
   * @private
   */
  willLongPress (e) {
    this.abortLongPress_()
    // Punt on multitouch events.
    if (e.changedTouches && e.changedTouches.length != 1) {
      return
    }
    this.pidLong_ = setTimeout(() => {
      // Assuming that e does not change during the time interval.
      // Additional check to distinguish between touch events and pointer events
      if (e.changedTouches) {
        // TouchEvent
        e.button = 2  // Simulate a right button click.
        // e was a touch event.  It needs to pretend to be a mouse event.
        e.clientX = e.changedTouches[0].clientX
        e.clientY = e.changedTouches[0].clientY
      }
      // Let the motion route the right-click correctly.
      this.handleLongPress(e)
      setTimeout(() => {
        this.reset()
      })
    }, this.ns.LONG_PRESS_LATENCY)
  },
  /**
   * Kill the queued long-press task.
   * @private
   */
  abortLongPress_ () {
    this.pidLong_ = 0
  },
  /**
   * Handle a real or faked right-click event by showing a context menu.
   * @param {Event} e A mouse move or touch move event.
   */
  handleLongPress (e) {
    var b = this.targetBrick
    if (b) {
      b.ui_driver.showContextMenu_(b, e)
    } else if ((b = this.board)) {
      b.ui_driver.showContextMenu_(b, e)
    }
    eYo.dom.gobbleEvent(e)
    this.reset()
  },
})

// ANCHOR click
eYo.event.Motion.eyo.methodsMerge({
  /**
   * Schedule a `handleClick_`.
   * @private
   */
  willHandleClick_ (e) {
    this.pidHandle_ = setTimeout(() => {
      this.pidHandle__ = 0
      this.handleClick_()
    }, this.ns.DOUBLE_LATENCY)  
  },
  /**
   * Handle the mouse click.
   * @private
   */
  handleClick_ () {
    this.handleClickField_(this)
    || this.handleClickBrick_(this)
    || this.handleClickBoard_(this)
    this.reset()
  },
  /**
   * Handle a mouse click on a board.
   * @return {Boolean} whether the click was handled
   * @private
   */
  handleClickBoard_ () {
    if (this.clickCount_>1) {
      this.board_.close()
    } else {
      eYo.app.focus_mngr.brick && eYo.app.focus_mngr.brick.focusOff()
    }
    return true
  },
  /**
   * Handle a mouse click on a field or a brick.
   * @return {Boolean} whether the click was handled
   * @private
   */
  handleClickBrick_ () {
    var b = this.targetBrick
    if (b) {
      if (this.clickCount_>1) {
        b.open()
      } else {
        if (this.flyout_ && this.flyout_.autoClose) {
          // Brick click in an autoclosing flyout.
          if (!b.disabled) {
            if (!eYo.event.group) {
              eYo.event.group = true
            }
            var newBrick = this.flyout_.createBrick(b)
            newBrick.ui_driver.scheduleSnapAndBump(newBrick)
            eYo.event.group = false
            return true
          }
        } 
        eYo.app.focus_mngr.brick = this.shouldSelect_
      }
      return true
    }
  },
})

eYo.event.Motion_p.handleClickField_ = eYo.event.Motion_p.handleClickBrick_