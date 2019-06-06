/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Flyout overriden.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Flyout')

goog.require('eYo.Unit')

goog.forwardDeclare('eYo.FlyoutCategory');
goog.forwardDeclare('eYo.Style');
goog.forwardDeclare('eYo.Brick');
goog.forwardDeclare('eYo.FlyoutToolbar');
goog.forwardDeclare('eYo.Tooltip');
goog.forwardDeclare('eYo.MenuRenderer');
goog.forwardDeclare('eYo.MenuButtonRenderer');

/**
 * Class for a flyout.
 * Circular dependencies:
 *  flyout >>> board >>> targetBoard >>> flyout
 * 
 * When defined, we have
 * flyout === flyout.board.targetBoard.flyout
 * A board has either a flyout or a targetBoard
 * but never has both.
 * This constructor takes care of this cycle.
 * @param {!eYo.Board} board
 * @param {!eYo.Board} targetBoard
 * @param {!Object} flyoutOptions Dictionary of options for the board.
 * @constructor
 */
eYo.Flyout = function(board, targetBoard, flyoutOptions) {
  // First
  this.board = board
  // second
  this.targetBoard = targetBoard
  /**
   * Position of the flyout relative to the board.
   * @type {number}
   * @private
   */
  this.anchor_ = flyoutOptions.anchor || eYo.Flyout.AT_RIGHT
  
  /**
   * Position and dimensions of the flyout in the desk.
   * @type {number}
   * @private
   */
  this.rect_ = new eYo.Rect(
  
  /**
   * Opaque data that can be passed to unbindEvent.
   * @type {!Array.<!Array>}
   * @private
   */
  this.eventWrappers_ = []
  /**
   * List of event listeners.
   * Array of opaque data that can be passed to unbindEvent.
   * @type {!Array.<!Array>}
   * @private
   */
  this.listeners_ = []
  /**
   * List of bricks that should always be disabled.
   * @type {!Array.<!eYo.Brick>}
   * @private
   */
  this.permanentlyDisabled_ = []

  if (flyoutOptions.autoClose) {
    this.autoClose = true
  }
  this.disposeUI = eYo.Do.nothing
  this.makeUI()
}

Object.defineProperties(eYo.Flyout.prototype, {
  /**
   * The desk
   * @type {eYo.Desk}
   * @readonly
   */
  desk: { 
    get () {
      return this.desk_
    }
  },
  /**
   * @type {eYo.Board} The board inside the flyout.
   */
  board: {
    get () {
      return this.board_
    },
    set (newValue) {
      var oldValue = this.board_ 
      if (newValue !== oldValue) {
        var oldTWS = this.targetBoard
        this.board_ = newValue
        if (newValue) {
          if (newValue.targetBoard !== oldTWS) {
            if (oldTWS) {
              oldTWS.removeChangeListener(this.filterWrapper_)
              this.filterWrapper_ = null
            }
            var newTWS = newValue.targetBoard
            if (!this.autoClose) {
              this.filterWrapper_ = this.filterForCapacity_.bind(this)
              newTWS.addChangeListener(this.filterWrapper_)
            }
            newTWS.flyout = this
          }
        }
      }
    }
  },
  /**
   * @type {eYo.Board} The fyout's board's targetBoard.
   */
  targetBoard: {
    get () {
      return this.board_ && this.board_.targetBoard_
    },
    set (newValue) {
      var old = this.targetBoard
      if ((newValue !== old)) {
        if (old) {
          old.removeChangeListener(this.filterWrapper_)
          this.filterWrapper_ = null
        }
        if (newValue && !this.autoClose) {
          this.filterWrapper_ = this.filterForCapacity_.bind(this)
          newValue.addChangeListener(this.filterWrapper_)
        }
        if ((this.board_.targetBoard = newValue)) {
          newValue.flyout = this
        }
      }
    }
  },
  /**
   * Does the flyout automatically close when a brick is created?
   * @type {boolean}
   */
  autoClose: { value: true, writable: true},
  /**
   * Whether the flyout is visible.
   * @type {boolean}
   * @private
   */
  visible_: { value: false, writable: true},
  /**
   * Whether the flyout is closed.
   * @type {boolean}
   * @private
   */
  closed: { value: false, writable: true},
  /**
   * Whether the board containing this flyout is visible.
   * @type {boolean}
   * @private
   */
  containerVisible_: { value: true, writable: true},
  /**
   * Top/bottom padding between scrollbar and edge of flyout background.
   * @type {number}
   * @const
   */
  SCROLLBAR_PADDING: { value: 2 },
  TOP_MARGIN: { value: 0 }, // 4 * eYo.Unit.rem
  BOTTOM_MARGIN: { value: 16 }, // scroll bar width
  TOP_OFFSET : { value: 2 * eYo.Unit.y },
  /**
   * Margin around the edges of the bricks.
   * @type {number}
   * @const
   */
  MARGIN : { value: eYo.Unit.rem / 4 },
  /**
   * This size and anchor of the receiver and wrapped
   * in an object with eponym keys.
   */
  /**
   * Width of flyout.
   * @type {number}
   * @private
   */
  width_: {
    get () {
      return this.rect_.size_.width
    },
    set (newValue) {
      if (this.rect_.size_.width !== newValue) {
        this.rect_.size_.width = newValue
        this.targetBoard_.resize()
      }
    }
  },
  /**
   * Height of flyout.
   * @type {number}
   * @private
   */
  height_: {
    get () {
      return this.rect_.size_.height
    },
    set (newValue) {
      this.rect_.size_.height = newValue
    }
  },
  /**
   * This size and anchor of the receiver and wrapped
   * in an object with eponym keys.
   */
  size: {
    get () {
      var ans = new eYo.Size(this.rect_.size_)
      ans.anchor = this.anchor_
      return ans
    },
    set (newValue) {
      this.rect_.size_.width = newValue.width
      this.rect_.size_.height = newValue.height
    }
  },
  /**
   * Range of a drag angle from a flyout considered "dragging toward board".
   * Drags that are within the bounds of this many degrees from the orthogonal
   * line to the flyout edge are considered to be "drags toward the board".
   * Example:
   * Flyout                                                  Edge   Board
   * [brick] /  <-within this angle, drags "toward board" |
   * [brick] ---- orthogonal to flyout boundary ----          |
   * [brick] \                                                |
   * The angle is given in degrees from the orthogonal.
   *
   * This is used to know when to create a new brick and when to scroll the
   * flyout. Setting it to 360 means that all drags create a new brick.
   * @type {number}
   * @private
  */
  dragAngleLimit_: { value: 70, writable: true},
  /**
   * Return the deletion rectangle for this flyout in viewport coordinates.
   * Edython : add management of the 0 width rectange
   * @return {eYo.Rect} Rectangle in which to delete.
   */
  deleteRect: {
    get () {
      var rect = flyout.rect
      var width = rect.width
      if (!width) {
        return null
      }
      // BIG_NUM is offscreen padding so that bricks dragged beyond the shown flyout
      // area are still deleted.  Must be larger than the largest screen size,
      // but be smaller than half Number.MAX_SAFE_INTEGER (not available on IE).
      var BIG_NUM = 1000000000
      if (flyout.atRight) {
        rect.x_max += BIG_NUM
      } else {
        rect.x_min -= BIG_NUM
      }
      rect.y_min = -BIG_NUM
      rect.y_max = BIG_NUM
      return rect
    }
  },
  toolbar: {
    get () {
      return this.toolbar_
    }
  }
})

/**
 * Make the UI
 */
eYo.Flyout.prototype.makeUI = function () {
  delete this.disposeUI
  this.makeUI = eYo.Do.nothing
  // Add scrollbar.
  this.scrollbar_ = new eYo.Scrollbar(
    this.board_,
    false /*this.horizontalLayout_*/,
    false, 'eyo-flyout-scrollbar'
  )
  this.hide()
  var d = this.ui_driver
  d.flyoutInit(this)
  if (flyoutOptions.switcher) {
    var tb = this.toolbar_ = new eYo.FlyoutToolbar(this, flyoutOptions.switcher)
    d.flyoutToolbarInit(tb)
    tb.doSelectGeneral(null) // is it necessary ?
  }
}

/**
 * Dispose of this flyout UI resources.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Flyout.prototype.disposeUI = function() {
  delete this.makeUI
  this.disposeUI = eYo.Do.nothing
  this.hide()
  var d = this.ui_driver
  this.toolbar_ && d.flyoutToolbarDispose(tb)
  d.flyoutDispose(this)
  if (this.scrollbar_) {
    this.scrollbar_.dispose()
    this.scrollbar_ = null
  }
}

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Flyout.prototype.dispose = function() {
  if (!this.desk_) {
    return
  }
  this.disposeUI()
  if (this.rect_) {
    this.rect_.dispose()
    this.rect_ = null
  }
  this.targetBoard = null
  this.board = null
  this.desk_ = null
}

Object.defineProperties(eYo.Flyout, {
  AT_RIGHT: { value: 1 },
  AT_LEFT: { value: 2 }
})

Object.defineProperties(eYo.Flyout.prototype, {
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
  rect: {
    get () {
      return this.rect_.clone()
    }
  }
  position: {
    get () {
      return this.rect_.origin
    },
    set (newValue) {
      this.rect_.origin = newValue
    }
  }
  /**
   * @readonly
   * @type {number} The width of the flyout.
   */
  width: {
    get () {
      return this.rect_.size_.width
    }
  },
  /**
   * @readonly
   * @type {number} The height of the flyout.
   */
  height: {
    get () {
      return this.rect_.size_.height
    }
  },
  /**
   * Is the flyout visible?
   * @type {boolean} True if visible.
   */
  visible: {
    get () {
      return this.visible_
    },
    set (visible) {
      if(visible != this.visible_) {
        this.visible_ = visible
        this.updateDisplay_()
      }
    }
  },
  /**
   * Whether this flyout's container is visible.
   * @type {boolean}
   */
  containerVisible: {
    get () {
      return this.containerVisible_
    },
    set (visible) {
      if(visible != this.containerVisible_) {
        this.containerVisible_ = visible
        this.updateDisplay_()
      }
    }
  },
  /**
   * @type {boolean} True if this flyout may be scrolled with a scrollbar or by
   *     dragging.
   * @package
   */
  scrollable: {
    get () {
      return this.scrollbar_ && this.scrollbar_.isVisible()
    }
  },
  /**
   * @type {Number} where the flyout is anchored.
   * @package
   */
  anchor: {
    get () {
      return this.anchor_
    }
  },
  /**
   * @type {Boolean} Is it anchored at right ?
   * @readonly
   * @package
   */
  atRight: {
    get () {
      return this.anchor_ === eYo.Flyout.AT_RIGHT
    }
  },
})

eYo.Flyout.prototype.getWidth = function() {
  throw "DEPRECATED getWidth"
}

eYo.Flyout.prototype.getHeight = function() {
  throw "DEPRECATED getHeight"
};

eYo.Flyout.prototype.getBoard = function() {
  throw "DEPRECATED getBoard"
}

/**
 * Update the display property of the flyout based whether it thinks it should
 * be visible and whether its containing board is visible.
 * @private
 */
eYo.Flyout.prototype.updateDisplay_ = function() {
  var show = this.containerVisible_ && this.visible_
  this.ui_driver.flyoutDisplaySet(show)
  // Update the scrollbar's visiblity too since it should mimic the
  // flyout's visibility.
  this.scrollbar_.containerVisible = show
}

/**
 * Hide and empty the flyout.
 */
eYo.Flyout.prototype.hide = function() {
  if (!this.visible) {
    return
  }
  this.visible = false

  this.ui_driver.flyoutRemoveListeners(this)
  
  if (this.reflowWrapper_) {
    this.board_.removeChangeListener(this.reflowWrapper_)
    this.reflowWrapper_ = null;
  }
  // Do NOT delete the bricks here.  Wait until Flyout.show.
  // https://neil.fraser.name/news/2014/08/09/
};

/**
 * Show and populate the flyout.
 * More tagnames accepted.
 * @param {!Array|string} model List of bricks to show.
 */
eYo.Flyout.prototype.show = function(model) {
  this.board_.setResizesEnabled(false)
  this.hide()
  eYo.Events.disableWrap(() => {
    this.clearOldBricks_()
    // Create the bricks to be shown in this flyout.
    var contents = []
    this.permanentlyDisabled_.length = 0
    model.forEach(xml => {
      if (xml.tagName) {
        var tagName = xml.tagName.toUpperCase()
        if (tagName.startsWith('EYO:')) {
          var curBrick = eYo.Xml.domToBrick(xml, this.board_)
          if (curBrick.disabled) {
            // Record bricks that were initially disabled.
            // Do not enable these bricks as a result of capacity filtering.
            this.permanentlyDisabled_.push(curBrick)
          }
          contents.push(curBrick)
        }
      } else {
        var createOneBrick = xml => {
          try {
            var brick = this.board_.newBrick(xml)
            contents.push(brick)
            brick.ui.addTooltip(xml.title || (xml.data && xml.data.main) || xml.data)
          } catch (err) {
            console.error(xml, err)
            // throw err: catch the error here definitely
          }
        }
        // this is the part specific to edython
        if (goog.isFunction(xml)) {
          // xml is either a function that returns an array of objects
          // or a function that creates brick.
          var ra = xml(createOneBrick)
          if (ra && ra.forEach) {
            ra.forEach(createOneBrick)
          }
        } else {
          createOneBrick(xml)
        }
      }
    })

    this.visible = true
    this.layout_(contents)

    // IE 11 is an incompetent browser that fails to fire mouseout events.
    // When the mouse is over the background, deselect all bricks.
    this.ui_driver.flyoutListen_mouseover(this)

    this.width_ = 0
    this.board_.setResizesEnabled(true)
    this.reflow()

    this.filterForCapacity_()

    // Correctly position the flyout's scrollbar when it opens.
    this.place()

    this.reflowWrapper_ = this.reflow.bind(this)
    this.board_.addChangeListener(this.reflowWrapper_)
  })
}

/**
 * Delete bricks, mats and buttons from a previous showing of the flyout.
 * @private
 */
eYo.Flyout.prototype.clearOldBricks_ = function() {
  // Delete any bricks from a previous showing.
  this.board_.getTopBricks(false).forEach(brick => brick.dispose())
}

/**
 * Scroll the flyout.
 * @param {!Event} e Mouse wheel scroll event.
 * @private
 */
eYo.Flyout.prototype.on_wheel = function(e) {
  var delta = e.deltaY
  if (delta) {
    if (goog.userAgent.GECKO) {
      // Firefox's deltas are a tenth that of Chrome/Safari.
      delta *= 10
    }
    var metrics = this.getMetrics_()
    var pos = (metrics.view.y - metrics.content.y_min) + delta
    var limit = metrics.content.height - metrics.view.height
    pos = Math.min(pos, limit)
    pos = Math.max(pos, 0)
    this.scrollbar_.set(pos)
  }
  eYo.Dom.gobbleEvent(e)
}

/**
 * Create a copy of this brick on the board.
 * @param {!eYo.Brick} originalBrick The brick to copy from the flyout.
 * @return {eYo.Brick} The newly created brick, or null if something
 *     went wrong with deserialization.
 * @package
 */
eYo.Flyout.prototype.createBrick = function(originalBrick) {
  this.targetBoard_.setResizesEnabled(false)
  var newBrick
  eYo.Events.disableWrap(() => {
    newBrick = this.placeNewBrick_(originalBrick)
    // Close the flyout.
    eYo.App.hideChaff()
  })
  eYo.Events.fireBrickCreate(newBrick, true)
  if (this.autoClose) {
    this.hide()
  } else {
    this.filterForCapacity_()
  }
  return newBrick
}

/**
 * Lay out the bricks in the flyout.
 * @param {!Array.<!Object>} contents The bricks and buttons to lay out.
 * @param {!Array.<number>} gaps The visible gaps between bricks.
 * @private
 */
eYo.Flyout.prototype.layout_ = function(contents) {
  this.board_.scale = this.targetBoard_.scale
  var cursor = new eYo.Where().xySet(this.MARGIN, this.MARGIN)
  contents.forEach(brick => {
    // Mark bricks as being inside a flyout.  This is used to detect and
    // prevent the closure of the flyout if the user right-clicks on such a
    // brick.
    brick.descendants.forEach(child => child.isInFlyout = true)
    brick.render()
    brick.moveBy(cursor)
    this.ui_driver.flyoutAddListeners(this, brick)
    cursor.y += brick.size.height + eYo.Unit.y / 4
  })
}

/**
 * Scroll the flyout to the top.
 */
eYo.Flyout.prototype.scrollToStart = function() {
  this.scrollbar_.set(0)
}

/**
 * Determine if a drag delta is toward the board, based on the position
 * and orientation of the flyout. This is used in determineDragIntention_ to
 * determine if a new brick should be created or if the flyout should scroll.
 * @param {!eYo.Gesture} gesture.
 * @return {boolean} true if the drag is toward the board.
 * @package
 */
eYo.Flyout.prototype.isDragTowardBoard = function(gesture) {
  if(!this.scrollable) {
    return true
  }
  var dx = gesture.deltaWhere_.x
  var dy = gesture.deltaWhere_.y
  // Direction goes from -180 to 180, with 0 toward the board.
  var direction = Math.atan2(dy,
    this.anchor_ === eYo.Flyout.AT_RIGHT ? -dx : dx
  ) / Math.PI * 180
  var limit = this.dragAngleLimit_
  return -limit < direction && direction < limit
}

/**
 * Filter the bricks on the flyout to disable the ones that are above the
 * capacity limit.  For instance, if the user may only place two more bricks on
 * the board, an "a + b" brick that has two required placeholders would be disabled.
 * @private
 */
eYo.Flyout.prototype.filterForCapacity_ = function() {
  var remainingCapacity = this.targetBoard_.remainingCapacity
  this.board_.getTopBricks(false).forEach(brick => {
    if (this.permanentlyDisabled_.indexOf(brick) < 0) {
      brick.disabled = brick.descendants.length > remainingCapacity
    }
  })
}

/**
 * Reflow bricks and their mats.
 */
eYo.Flyout.prototype.reflow = function() {
  if (this.reflowWrapper_) {
    this.board_.removeChangeListener(this.reflowWrapper_)
  }
  this.board_.scale = this.targetBoard_.scale
  var rect = this.board_.bricksBoundingBox
  var flyoutWidth = rect.width
  flyoutWidth += this.MARGIN * 1.5
  flyoutWidth *= this.board_.scale
  flyoutWidth += eYo.Scrollbar.thickness
  this.width_ = flyoutWidth
  if (this.reflowWrapper_) {
    this.board_.addChangeListener(this.reflowWrapper_)
  }
}

/**
 * Move the flyout to the edge of the board.
 */
eYo.Flyout.prototype.place = function () {
  if (!this.visible_) {
    return
  }
  var metrics = this.targetBoard_.metrics
  if (!metrics || metrics.view.height <= 0) {
    // Hidden components will return null.
    return;
  }
  // Record the height for eYo.Flyout.getMetrics_
  this.height_ = metrics.view.height - this.TOP_OFFSET

  var size = this.size
  size.height = metrics.view.height
  this.ui_driver.flyoutUpdate(this)

  this.toolbar_.resize(edgeWidth, edgeHeight)

  var y = metrics.absolute.y
  var x = metrics.absolute.x
  if (this.anchor_ === eYo.Flyout.AT_RIGHT) {
    x += (metrics.view.width - this.width_)
    if (this.closed) {
      x += this.width_
    }
     // Save the location of the left edge of the flyout, for use when Firefox
    // gets the bounding client rect wrong.
    this.leftEdge_ = x
  } else if (this.anchor_ === eYo.Flyout.AT_LEFT) {
    if (this.closed) {
      x -= this.width_
    }
    // Save the location of the left edge of the flyout, for use when Firefox
    // gets the bounding client rect wrong.
    this.leftEdge_ = x
  }
  this.ui_driver.flyoutPlaceAt(this, x, y)
}

/**
 * Return an object with all the metrics required to size scrollbars for the
 * flyout.  The following properties are computed:
 * .view.height: Height of the visible rectangle,
 * .view.width: Width of the visible rectangle,
 * .content.height: Height of the contents,
 * .content.width: Width of the contents,
 * .view.y: Offset of top edge of visible rectangle from parent,
 * .content.y_min: Offset of the top-most content from the y=0 coordinate,
 * .absolute.y: Top-edge of view.
 * .view.x: Offset of the left edge of visible rectangle from parent,
 * .content.x_min: Offset of the left-most content from the x=0 coordinate,
 * .absolute.x: Left-edge of view.
 * @return {Object} Contains size and position metrics of the flyout.
 * @private
 */
eYo.Flyout.prototype.getMetrics_ = function() {
  return this.ui_driver.flyoutGetMetrics_(this)
}

/**
 * Copy a brick from the flyout to the board and position it correctly.
 * Edython adds a full rendering process.
 * No rendering is made while bricks are dragging.
 * @param {!eYo.Brick} oldBrick The flyout brick to copy.
 * @return {!eYo.Brick} The new brick in the main board.
 * @private
 */
eYo.Flyout.prototype.placeNewBrick_ = function(oldBrick) {

  // Create the new brick by cloning the brick in the flyout (via XML).
  var xml = eYo.Xml.brickToDom(oldBrick)
  // The target board would normally resize during domToBrick, which will
  // lead to weird jumps.  Save it for terminateDrag.
  var targetBoard = this.targetBoard_
  targetBoard.setResizesEnabled(false)

  // Using domToBrick instead of domToBoard means that the new brick will be
  // placed at position (0, 0) in main board units.
  var brick = eYo.Xml.domToBrick(xml, targetBoard)

  var xy = this.board_.originInDesk
  .forward(
    oldBrick.whereInBoard.scale(this.board_.scale)
  ).backward(targetBoard.originInDesk)
  .unscale(targetBoard.scale)
  brick.moveTo(xy)

  brick.render()
  return brick
}

/**
 * Does the job of sliding the flyout in or out.
 * @param {?Boolean} close  close corresponds to the final state.
 * When not given, toggle the closed state.
 */
eYo.Flyout.prototype.doSlide = function(close) {
  // nothing to do if in the process of reaching the expected state
  if (this.slide_locked) {
    return
  }
  if (!goog.isDef(close)) {
    close = !this.closed
  }
  // nothing to do either if already in the expected state
  if (!close === !this.closed) {
    return
  }
  var metrics = this.targetBoard_.metrics
  if (!metrics) {
    // Hidden components will return null.
    return;
  }
  this.slide_locked = true
  var atRight = this.anchor_ == eYo.Flyout.AT_RIGHT
  this.visible = true
  eYo.Tooltip.hideAll(this.dom.svg.group_)
  var left = metrics.absolute.x
  var right = left + metrics.view.width
  var n_steps = 50
  var n = 0
  var steps = []
  var positions = []
  if (atRight) {
    var x_start = close? right - this.width_ : right
    var x_end = close? right : right - this.width_
  } else {
    x_start = close? left : left - this.width_
    x_end = close? left - this.width_ : left
  }
  steps[0] = close? 0: 1
  positions[0] = x_start
  for (n = 1; n < n_steps; n++) {
    var step = Math.sin(n*Math.PI/n_steps/2)**2
    steps[n] = close ? step : 1-step
    positions[n] = x_start + step * (x_end - x_start)
  }
  steps[n] = close ? 1 : 0
  positions[n] = x_end
  var y = metrics.absolute.y;
  n = 0
  var id = setInterval(() => {
    if (n >= n_steps) {
      clearInterval(id)
      if ((this.closed = close)) {
        this.visible = false
      }
      this.ui_driver.flyoutUpdate(this)
      this.toolbar_.resize(this.size)
      delete this.slide_locked
      this.targetBoard_.recordDeleteAreas()
      this.slideOneStep(steps[n_steps])
      this.didSlide(close)
    } else {
      this.ui_driver.flyoutPlaceAt(this, positions[n], y)
      this.slideOneStep(steps[n])
      // the scrollbar won't resize because the metrics of the board did not change
      var hostMetrics = this.board_.metrics
      if (hostMetrics) {
        this.scrollbar_.resizeVertical_(hostMetrics)
      }
      ++n
    }
  }, 20);
};

/**
 * Slide the flyout in or out.
 * This 2 levels design allows overwriting.
 * Actually, the ui button calls the slide method.
 * @param {?Boolean} close  close corresponds to the final state.
 * When not given, toggle the closed state.
 */
eYo.Flyout.prototype.slide = function(close) {
  this.doSlide(close)
}

/**
 * Subclassers will add there stuff here.
 * @param {number} step betwwen 0 and 1.
 */
eYo.Flyout.prototype.slideOneStep = function(step) {
}

/**
 * Subclassers will add there stuff here.
 * @param {Boolean} closed
 */
eYo.Flyout.prototype.didSlide = function(closed) {
}

/**
 * List of node models by category.
 * Used by the front end.
 * @param {!String} category The name of the category to retrieve.
 */
eYo.Flyout.prototype.getList = function (category) {
  return eYo.FlyoutCategory[category] || []
}
