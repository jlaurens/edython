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

eYo.forwardDeclare('Board')
eYo.forwardDeclare('Brick')
eYo.forwardDeclare('Field')
eYo.forwardDeclare('Magnet')

eYo.forwardDeclare('DnD')
eYo.forwardDeclare('Scaler')

eYo.forwardDeclare('Dom')

/*
 * Note: In this file "start" refers to touchstart,
 * mousedown, and pointerstart events.
 * "end" refers to touchend, mouseup, and pointerend events.
 */
// TODO: Consider touchcancel/pointercancel.

/**
 * @name{eYo.Motion}
 * @constructor
 * Class for one motion.
 * There should be only one active motion at a time.
 * Actually, the topmost object, eYo.App.Dflt, is managing this motion.
 * 
 * @param {eYo.App.Dflt} application - The top application where the event occured.
 * @constructor
 */
eYo.C9r.Dflt.makeSubclass(eYo, 'Motion', {
  /**
   * Reset and sever all links from this object.
   */
  dispose () {
    this.reset()
  },
  CONST: {
    /**
     * The latency between 2 mouse down/up events,
     * in order to recognize a (multi) click event.
     * @type {number}
     */
    DOUBLE_LATENCY: 350,
    /**
     * The latency between 2 mouse down/up events,
     * in order to recognize a (multi) click event.
     * @type {number}
     */
    LONG_PRESS_LATENCY: 500,
    /**
     * The latency between 2 mouse down/up events,
     * in order to recognize a (multi) click event.
     * @type {number}
     */
    CANCEL_LATENCY: 15000,
    /**
     * Number of pixels the mouse must move before a drag starts.
     */
    DRAG_RADIUS: 5,
    /**
     * Number of pixels the mouse must move before a drag/scroll starts from the
     * flyout.  Because the drag-intention is determined when this is reached, it is
     * larger than DRAG_RADIUS so that the drag-direction is clearer.
     */
    FLYOUT_DRAG_RADIUS: 10,
    /**
     * A multiplier used to convert the motion scale to a zoom in delta.
     * @const
     */
    ZOOM_IN_FACTOR: 5,
    /**
     * A multiplier used to convert the motion scale to a zoom out delta.
     * @const
     */
    ZOOM_OUT_FACTOR: 6,
    /**
     * If the scale is bigger than this limit, a zoom out occurs.
     * @const
     */
    ZOOM_IN_LIMIT: 1.05,
    /**
     * If the scale is less than this limit, a zoom out occurs.
     * @const
     */
    ZOOM_OUT_LIMIT: 0.95,
    /**
     * When dragging a block out of a stack, split the stack in two (true), or drag
     * out the block healing the stack (false).
     * @const
     */
    DRAG_STACK: true,
    /**
     * NYD.
     * @const
     */
    SNAP_RADIUS: 20,
    DELETE_AREA_NONE: null,
    /**
     * ENUM representing that an event is in the delete area of the trash can.
     * @const
     */
    DELETE_AREA_TRASH: 1,
    /**
     * ENUM representing that an event is in the delete area of the flyout or
     * flyout.
     * @const
     */
    DELETE_AREA_TOOLBOX: 2,
    CAPTURE_IGNORED: 0,
    CAPTURE_STARTED: 1,
    CAPTURE_UPDATING: 2,
  },
  owned: {
    scaler () {
      return new eYo.Scaler(this)
    },
    dndmngr () {
      return new eYo.DnD.Mngr(this)
    },
    change () {
      return new eYo.C9r.Change()
    }
  },
  valued:  {
    /**
     * The desktop.
     * @type {eYo.App.Dflt}
     */
    desktop: eYo.NA,
    touchIDs () {
      return []
    },
    /**
     * The board the motion started on,
     * including the brick's board if it started on a brick,
     * or null if it did not start on a brick.
     * @type {eYo.Board}
     * @private
     */
    starter: eYo.NA,
    event: eYo.NA,
    /**
     * The position of the mouse when the motion started.
     * Units are css pixels, with (0, 0) at the top left of
     * the browser window (mouseEvent clientX/Y).
     * @type {eYo.Where}
     */
    xyStart: eYo.NA,
    /**
     * How far the mouse has moved during this drag, in pixel units.
     * (0, 0) is at this.xyStart_.
     * @type {eYo.Where}
     * @private
     */
    xyDelta: eYo.NA,
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
    event: eYo.NA,
    shouldSelect: eYo.NA,
    startBrick: {
      /*
       * Dragging should start for selected blocks only.
       */
      validate (after) {
        if (!this.brick) {
          let selected = eYo.app.focusMngr.brick
          do {
            var candidate = after
          } while (after.isExpr && (selected !== after) && (after = after.parent))
          return candidate.isInFlyout && candidate.root || candidate
        }
      },
    },
  },
  computed: {
    /**
     * The field that the motion started on,
     * or null if it did not start on a field.
     * @type {eYo.Brick}
     * @private
     */
    field () {
      return this.starter__ && this.starter__.isField && this.starter__
    },
    /**
     * The brick that the motion started on,
     * including the field's brick if it started on a field,
     * or null if it did not start on a brick.
     * @type {eYo.Brick}
     * @private
     */
    brick () {
      return this.starter__ && (
        this.starter__.isBrick?
          this.starter__.wrapper:
          this.field_.brick.wrapper
      )
    },
    /**
     * The brick that this motion targets.
     * If the motion started in the flyout,
     * this is the root brick of the brick group
     * that was clicked or dragged.
     * @type {eYo.Brick}
     * @private
     */
    targetBrick () {
      var b3k = this.brick
      return b3k && (b3k.inLibrary ? b3k.root: b3k)
    },
    /**
     * The board the motion started on,
     * including the brick's board if it started on a brick,
     * or null if it did not start on a brick.
     * @type {eYo.Board}
     * @private
     */
    board () {
      return this.starter__ && (
        this.starter__.isBoard?
          this.starter__:
          (this.field_ || this.brick_).board
      )
    },
    /**
     * Boolean for whether or not this motion is a multi-touch motion.
     * @type {boolean}
     * @private
     */
    multiTouch () {
      return this.touchIDs.length > 1
    },
    /**
     * The flyout of the board the motion started on, if any.
     * @type {eYo.Flyout}
     * @private
     */
    flyout () {
      let b3d = this.board ; return b3d && b3d.flyout
    },
    /**
     * General purpose ui_driver_mngr from the creator board.
     */
    ui_driver_mngr () {
      let b3d = this.board ; return b3d && b3d.ui_driver_mngr
    },
    /**
     * Position of the receiver's event in the board.
     * @type {eYo.Where}
     * @readonly
     */
    where () {
      return new eYo.Where(this.event)
    },
  },
})

/**
 * The receiver has been started.
 * @param {Event} e - the dom event
 * @return {eYo.Motion} the receiver
 */
eYo.Motion_p.update = function(e) {
  return this
}

/**
 * Reset the receiver to default values.
 * @return {eYo.Motion} the receiver
 */
eYo.Motion_p.reset = function() {
  if (this.event) {
    this.change_.reset()
    this.dndmngr_.reset()
    this.scaler_.reset()
    this.starter_ = null
    this.touchIDs_.length = 0
    this.touchID_ = null
    this.startDistance_ = 0
    eYo.Dom.clearTouchIdentifier()
    Blockly.Tooltip.unblock()
    eYo.Dom.unbindMouseEvents(this)
    this.pidCancel_ = this.pidLong_ = this.pidHandle_ = 0
    this.event_ = null
    this.abortCapture()
    this.clickCount_ = 0
    this.shouldSelect_ = null
  }
  return this
}

Object.defineProperties(eYo.Motion_p, {
  /**
   * @private
   */
  abortCaptureMove_: {
    value: eYo.Do.nothing
  },
  /**
   * @private
   */
  abortCaptureGestureMove_: {
    value: eYo.Do.nothing
  },
  /**
   * @private
   */
  abortCaptureCancel_: {
    value: eYo.Do.nothing
  },
  /**
   * @private
   */
  abortCaptureUp_: {
    value: eYo.Do.nothing
  },
})

/**
 * Start capturing a motion.
 * We are not able to handle the motion yet because we do not know
 * in what kind it will end to. For example, is it a (multi) click,
 * a drag, a touch, a pinch... What we only know is the caller.
 * If the return value is true, the caller should prevent default
 * event handling, it should not otherwise.
 * @param {Event} e - A mouse/pointer down or touch start dom event.
 * @param {eYo.Brick|eYo.Board} [starter] - The object that received the starting event, either a board or a brick.
 * @return {Object} Whether the start is successfull
 */
eYo.Motion_p.captureStart = function(e, starter) {
  if (eYo.Dom.isTargetInput(e)) {
    this.cancel()
    return this.CAPTURE_IGNORED
  }
  if (this.event_) {
    return this.CAPTURE_UPDATING
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
    }, this.CANCEL_LATENCY)
    this.ui_driver.disconnectStop()
    var board = this.board_
    board.updateScreenCalculationsIfScrolled()
    board.markFocused()  
    capturer.call(this)
    eYo.Dom.gobbleEvent(e)
    return this.CAPTURE_STARTED
  }
  return this.CAPTURE_IGNORED
}

/**
 * Stop capturing 'up', 'move' and 'cancel' events.
 * Remove custom capture method overrides.
 * @private
 */
eYo.Motion_p.abortCapture_ = function(e) {
  this.abortCaptureUp_()
  this.abortCaptureMove_()
  this.abortCaptureGestureMove_()
  this.abortCaptureCancel_()
  delete this.captureStart
  delete this.captureMouseMove_
  delete this.captureTouchMove_
}

/**
 * Start capturing a mouse motion.
 * @private
 */
eYo.Motion_p.captureMouseStart_ = function() {
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
    if (this.brick_.isDescendantOf(eYo.app.focusMngr.brick) && this.event_.altKey) {
      this.shouldSelect_ = eYo.app.focusMngr.brick.parent
    } else {
      this.shouldSelect_ = this.brick_.selected ? null: this.brick_
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
}

/**
 * Capturing a mouse move event.
 * @private
 */
eYo.Motion_p.captureMouseMove_ = function(e) {
  this.event__ = e
  this.xyDelta_ = this.where.backward(this.xyStart_)
  var delta = this.xyDelta_.magnitude
  var limit = this.flyout
  ? this.FLYOUT_DRAG_RADIUS
  : this.DRAG_RADIUS
  if (delta > limit) {
    this.brick_ && this.brick_.focusOn()
    this.abortLongPress_()
    this.abortHandle_()
    this.captureMouseMove_ = this.captureMouseDrag_
    this.dndmngr_.start()
  }
}

/**
 * A dragging operation has started, any move of the device
 * is applied to the dndmngr.
 */
eYo.Motion_p.captureMouseDrag_ = function(e) {
  this.event__ = e
  this.xyDelta_ = this.where.backward(this.xyStart_)
  this.dndmngr_.update()
}

/**
 * Eventually end capturing a mouse motion.
 * @private
 */
eYo.Motion_p.captureMouseUp_ = function(e) {
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
}

/**
 * Capturing a mouse down event, just after a mouse up.
 * Replace `captureStart`.
 * Update the receiver's event.
 * @private
 */
eYo.Motion_p.captureStartMoreMouse_ = function(e) {
  if (e.type === 'mousedown') {
    this.event__ = e
    this.willHandleClick_()
    eYo.Dom.gobbleEvent(e)
  }
}

/**
 * Start capturing a touch event.
 * The very first touch event captured will lead to
 * either a click or a drag or a pinch.
 * 
 * @private
 */
eYo.Motion_p.captureTouchStart_ = function() {
  var captureMove = e => {
    this.captureTouchMove_(e)
  }
  window.addEventListener('touchmove', captureMove, true)
  this.abortCaptureMove_ = () => {
    delete this.abortCaptureMove_
    window.removeEventListener('touchmove', captureMove, true)
  }
  var captureUp = e => {
    this.captureTouchEnd_(e)
  }
  window.addEventListener('touchend', captureUp, true)
  this.abortCaptureUp_ = () => {
    delete this.abortCaptureUp_
    window.removeEventListener('touchend', captureUp, true)
  }
  var captureCancel = e => {
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
}

/**
 * Start capturing a second touch event.
 * On success, the motion becomes a multi touch.
 * 
 * @private
 */
eYo.Motion_p.captureStartMoreTouch_ = function(e) {
  if (e.type === 'touchstart') {
    this.event__ = e
    var list = e.changedTouches
    if (list.length) {
      var touch1st = e.touches().identifiedTouch(this.touchIDs_[0])
      var touch2nd = list.item(0)
      this.touchIDs_.push(touch2nd.identifier)
      var xy1st = new eYo.Where(touch1st)
      var xy2nd = new eYo.Where(touch2nd)
      this.startDistance_ = xy1st.distance(xy2nd) // Screen coordinates ?
      // Simply ignore any supplemental touch:
      this.captureStart = eYo.Do.nothing
      eYo.Dom.gobbleEvent(e)
    }
  }
}

/**
 * Start capturing a touch move event.
 * Scaling or dragging may start here.
 * 
 * @private
 */
eYo.Motion_p.captureTouchMove_ = function(e) {
  if (e.type === 'touchmove' || e.type === 'gesturemove') {
    this.event__ = e
    if (e.scale) {
      // this code is executed only when
      // - touchmove and not in WebKit xor 
      // - gesturemove and in WebKit
      if (this.scaler_.start() || this.dndmngr_.start()) {
        eYo.Dom.gobbleEvent(e)
        this.abortLongPress_()
        this.abortHandle_()
        this.captureTouchMove_ = this.captureTouchDragOrScale_
      }
      /*
      if (!this.scaler_.update()) {
        if (e.scale > this.ZOOM_IN_LIMIT || e.scale < this.ZOOM_OUT_LIMIT) {
          this.scaler_.start()
        }
      } else if (!this.dndmngr_.update()) {
        this.xyDelta_ = this.where.backward(this.xyStart_)
        var delta = this.xyDelta_.magnitude
        var limit = this.flyout
        ? this.FLYOUT_DRAG_RADIUS
        : this.DRAG_RADIUS
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
}

/**
 * Start capturing a touch move event for scaling only.
 * 
 * @private
 */
eYo.Motion_p.captureTouchDragOrScale_ = function(e) {
  if (e.type === 'touchmove' || e.type === 'gesturemove') {
    this.event__ = e
    if (e.scale) {
      eYo.Dom.gobbleEvent(e)
      this.scaler_.update() || this.dndmngr_.update()
    }
  }
}

/**
 * Capturing a touch end.
 * @private
 */
eYo.Motion_p.captureTouchEnd_ = function(e) {
  this.event__ = e
  if (this.scaler_.end() || this.dndmngr_.end()) {
    this.reset()
    eYo.Dom.gobbleEvent(e)
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
}

/**
 * Start capturing a second touch event.
 * On success, the motion becomes a multi touch.
 * 
 * @private
 */
eYo.Motion_p.captureStartMoreTouchNoMove_ = function(e) {
  if (e.type === 'touchstart') {
    this.event__ = e
    var list = e.changedTouches
    if (list.length) {
      var touch2nd = list.item(0)
      this.touchIDs_.push(touch2nd.identifier)
      // Simply ignore any supplemental touch:
      this.captureStart = eYo.Do.nothing
      eYo.Dom.gobbleEvent(e)
    }
  }
}

/**
 * Capturing a touch cancel.
 * @private
 */
eYo.Motion_p.captureTouchCancel_ = function(e) {
  this.cancel()
  eYo.Dom.gobbleEvent(e)
}

/**
 * Capturing a touch cancel.
 * @private
 */
eYo.Motion_p.cancel = function(e) {
  this.abortCancel_()
  this.scaler_.cancel() || this.dndmngr_.cancel()
  this.reset()
}

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
eYo.Motion_p.willLongPress = function (e) {
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
  }, this.LONG_PRESS_LATENCY)
}

/**
 * Kill the queued long-press task.
 * @private
 */
eYo.Motion_p.abortLongPress_ = function () {
  this.pidLong_ = 0
}

/**
 * Handle a real or faked right-click event by showing a context menu.
 * @param {Event} e A mouse move or touch move event.
 */
eYo.Motion_p.handleLongPress = function(e) {
  var b = this.targetBrick
  if (b) {
    b.ui.showContextMenu_(e)
  } else if ((b = this.board)) {
    b.showContextMenu_(e)
  }
  eYo.Dom.gobbleEvent(e)
  this.reset()
}

/**
 * Kill the queued cancel task.
 * @private
 */
eYo.Motion_p.abortCancel_ = function () {
  this.pidCancel_ = 0
}

/**
 * Kill the queued handle task.
 * @private
 */
eYo.Motion_p.abortHandle_ = function () {
  this.pidHandle_ = 0
}

/**
 * Schedule a `handleClick_`.
 * @private
 */
eYo.Motion_p.willHandleClick_ = function(e) {
  this.pidHandle_ = setTimeout(() => {
    this.pidHandle__ = 0
    this.handleClick_()
  }, this.DOUBLE_LATENCY)  
}

/**
 * Handle the mouse click.
 * @private
 */
eYo.Motion_p.handleClick_ = function() {
  this.handleClickField_(this)
  || this.handleClickBrick_(this)
  || this.handleClickBoard_(this)
  this.reset()
}

/**
 * Handle a mouse click on a board.
 * @return {Boolean} whether the click was handled
 * @private
 */
eYo.Motion_p.handleClickBoard_ = function() {
  if (this.clickCount_>1) {
    this.board_.close()
  } else {
    eYo.app.focusMngr.brick && eYo.app.focusMngr.brick.focusOff()
  }
}

/**
 * Handle a mouse click on a field or a brick.
 * @return {Boolean} whether the click was handled
 * @private
 */
eYo.Motion_p.handleClickField_ = eYo.Motion_p.handleClickBrick_ = function() {
  var b = this.targetBrick
  if (b) {
    if (this.clickCount_>1) {
      b.open()
    } else {
      if (this.flyout_ && this.flyout_.autoClose) {
        // Brick click in an autoclosing flyout.
        if (!b.disabled) {
          if (!eYo.Events.group) {
            eYo.Events.group = true
          }
          var newBrick = this.flyout_.createBrick(b)
          newBrick.ui_driver.scheduleSnapAndBump(newBrick)
          eYo.Events.group = false
          return true
        }
      } 
      eYo.app.focusMngr.brick = this.shouldSelect_
    }
    return true
  }
}

/**
 * Execute a board click.
 * @return {Boolean}  true iff the click was handled
 * @private
 */
eYo.Motion_p.handleClickBoard_ = function() {
  eYo.app.focusMngr.brick && eYo.app.focusMngr.brick.focusOff()
  return true
}
