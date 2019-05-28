/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Flyout overriden.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('eYo.Flyout');

goog.forwardDeclare('eYo.FlyoutCategory');
goog.forwardDeclare('eYo.Style');
goog.forwardDeclare('eYo.Unit');
goog.forwardDeclare('eYo.Brick');
goog.forwardDeclare('eYo.FlyoutToolbar');
goog.forwardDeclare('eYo.Tooltip');
goog.forwardDeclare('eYo.MenuRenderer');
goog.forwardDeclare('eYo.MenuButtonRenderer');

goog.forwardDeclare('goog.math.Coordinate')

/**
 * Class for a flyout.
 * @param {!eYo.Workspace} targetSpace Dictionary of options for the workspace.
 * @param {!Object} flyoutOptions Dictionary of options for the workspace.
 * @constructor
 */
eYo.Flyout = function(factory, flyoutOptions) {

  this.factory_ = factory

  /**
   * Position of the toolbox and flyout relative to the workspace.
   * @type {number}
   * @private
   */
  this.anchor_ = flyoutOptions.anchor || eYo.Flyout.AT_RIGHT

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
  this.listeners_ = [];

  /**
   * List of bricks that should always be disabled.
   * @type {!Array.<!eYo.Brick>}
   * @private
   */
  this.permanentlyDisabled_ = []

  if (flyoutOptions.autoClose) {
    this.autoClose = true
  }

  if (!this.autoClose) {
    this.filterWrapper_ = this.filterForCapacity_.bind(this);
    workspace.addChangeListener(this.filterWrapper_)
  }
  
  this.disposeUI = eYo.Do.nothing
}

Object.defineProperties(eYo.Flyout.prototype, {
  anchor: {
    get () {
      return this.anchor_
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
   * Whether the workspace containing this flyout is visible.
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
   * Width of flyout.
   * @type {number}
   * @private
   */
  width_: { value: 0, writable: true},
  /**
   * Height of flyout.
   * @type {number}
   * @private
   */
  height_: { value: 0, writable: true},
  /**
   * Range of a drag angle from a flyout considered "dragging toward workspace".
   * Drags that are within the bounds of this many degrees from the orthogonal
   * line to the flyout edge are considered to be "drags toward the workspace".
   * Example:
   * Flyout                                                  Edge   Workspace
   * [brick] /  <-within this angle, drags "toward workspace" |
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
   * @return {goog.math.Rect} Rectangle in which to delete.
   */
  clientRect: {
    get () {
      return this.ui_driver.flyoutClientRect(this)
    }
  },
  /**
   * @readonly
   * @type {eYo.Workspace} The workspace inside the flyout.
   */
  workspace: {
    get () {
      return this.workspace_
    }
  },
  /**
   * @type {eYo.Workspace} The fyout's workspace's targetSpace.
   */
  targetSpace: {
    get () {
      return this.workspace_.targetSpace_
    },
    set (newValue) {
      var old = this.targetSpace
      if ((newValue !== old)) {
        if (old) {
          old.removeChangeListener(this.filterWrapper_)
          this.filterWrapper_ = null
        }
        if (newValue && !this.autoClose) {
          this.filterWrapper_ = this.filterForCapacity_.bind(this)
          newValue.addChangeListener(this.filterWrapper_)
        }
        this.workspace_.targetSpace = newValue
      }
    }
  }
})

/**
 * Make the UI
 */
eYo.Flyout.prototype.makeUI = function () {
  // Add scrollbar.
  this.scrollbar_ = new Blockly.Scrollbar(this.workspace_,
    false /*this.horizontalLayout_*/, false, 'eyo-flyout-scrollbar')
  this.hide()
  var d = this.ui_driver
  d.flyoutInit(this)
  if (flyoutOptions.switcher) {
    var tb = this.toolbar_ = new eYo.FlyoutToolbar(this, flyoutOptions.switcher)
    d.flyoutToolbarInit(tb)
    tb.doSelectGeneral(null) // is it necessary ?
  }
  delete this.disposeUI
}

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Flyout.prototype.disposeUI = function() {
  this.hide()
  var d = this.ui_driver
  if (this.scrollbar_) {
    this.scrollbar_.dispose()
    this.scrollbar_ = null
  }
  d.flyoutDispose(this)
  this.factory_ = null
  delete this.makeUI
}

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Flyout.prototype.dispose = function() {
  if (!this.factory_) {
    return
  }
  this.disposeUI()
  if (this.scrollbar_) {
    this.scrollbar_.dispose()
    this.scrollbar_ = null
  }
  if (this.workspace_) {
    this.workspace_.targetSpace = null
    this.workspace_ = null
  }
  this.factory_ = null
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
  /**
   * @readonly
   * @type {number} The width of the flyout.
   */
  width: {
    get () {
      return this.width_
    }
  },
  /**
   * @readonly
   * @type {number} The height of the flyout.
   */
  height: {
    get () {
      return this.height_
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
   * @type {Number} Where the flyout is anchored.
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

eYo.Flyout.prototype.getWorkspace = function() {
  throw "DEPRECATED getWorkspace"
};

eYo.Flyout.prototype.isVisible = function() {
  throw "DEPRECATED isVisible"
};

eYo.Flyout.prototype.setVisible = function(visible) {
  throw "DEPRECATED setVisible"
};

eYo.Flyout.prototype.setContainerVisible = function(visible) {
  throw "DEPRECATED setContainerVisible"
};

eYo.Flyout.prototype.isScrollable = function() {
  throw "DEPRECATED isScrollable"
};

/**
 * Update the display property of the flyout based whether it thinks it should
 * be visible and whether its containing workspace is visible.
 * @private
 */
eYo.Flyout.prototype.updateDisplay_ = function() {
  var show = this.containerVisible_ && this.visible_
  this.ui_driver.flyoutDisplaySet(show)
  // Update the scrollbar's visiblity too since it should mimic the
  // flyout's visibility.
  this.scrollbar_.setContainerVisible(show)
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
    this.workspace_.removeChangeListener(this.reflowWrapper_)
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
  this.workspace_.setResizesEnabled(false)
  this.hide()
  eYo.Events.disableWrap(() => {
    this.clearOldBricks_()

    // Create the bricks to be shown in this flyout.
    var contents = []

    this.permanentlyDisabled_.length = 0

    model.forEach(xml => {
      if (xml.tagName) {
        var tagName = xml.tagName.toUpperCase();
        if (tagName.startsWith('EYO:')) {
          var curBrick = eYo.Xml.domToBrick(xml, this.workspace_)
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
            var brick = this.workspace_.newBrick(xml)
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

    this.width_ = 0;
    this.workspace_.setResizesEnabled(true)
    this.reflow()

    this.filterForCapacity_()

    // Correctly position the flyout's scrollbar when it opens.
    this.place()

    this.reflowWrapper_ = this.reflow.bind(this)
    this.workspace_.addChangeListener(this.reflowWrapper_)
  })
}

/**
 * Delete bricks, mats and buttons from a previous showing of the flyout.
 * @private
 */
eYo.Flyout.prototype.clearOldBricks_ = function() {
  // Delete any bricks from a previous showing.
  this.workspace_.getTopBricks(false).forEach(brick => brick.dispose())
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
    var pos = (metrics.viewTop - metrics.contentTop) + delta
    var limit = metrics.contentHeight - metrics.viewHeight
    pos = Math.min(pos, limit)
    pos = Math.max(pos, 0)
    this.scrollbar_.set(pos)
  }
  this.ui_driver.gobbleEvent(e)
}

/**
 * Create a copy of this brick on the workspace.
 * @param {!eYo.Brick} originalBrick The brick to copy from the flyout.
 * @return {eYo.Brick} The newly created brick, or null if something
 *     went wrong with deserialization.
 * @package
 */
eYo.Flyout.prototype.createBrick = function(originalBrick) {
  this.targetSpace_.setResizesEnabled(false)
  var newBrick
  eYo.Events.disableWrap(() => {
    newBrick = this.placeNewBrick_(originalBrick)
    // Close the flyout.
    Blockly.hideChaff()
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
  this.workspace_.scale = this.targetSpace_.scale
  var cursorX = this.MARGIN
  var cursorY = this.MARGIN
  contents.forEach(brick => {
    // Mark bricks as being inside a flyout.  This is used to detect and
    // prevent the closure of the flyout if the user right-clicks on such a
    // brick.
    brick.getDescendants().forEach(child => child.isInFlyout = true)
    brick.render()
    brick.moveBy(cursorX, cursorY)
    this.ui_driver.flyoutAddListeners(this, brick)
    cursorY += brick.size.height + eYo.Unit.y / 4
  })
}

/**
 * Scroll the flyout to the top.
 */
eYo.Flyout.prototype.scrollToStart = function() {
  this.scrollbar_.set(0)
}

/**
 * Determine if a drag delta is toward the workspace, based on the position
 * and orientation of the flyout. This is used in determineDragIntention_ to
 * determine if a new brick should be created or if the flyout should scroll.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @return {boolean} true if the drag is toward the workspace.
 * @package
 */
eYo.Flyout.prototype.isDragTowardWorkspace = function(delta) {
  var dx = delta.x
  var dy = delta.y
  // Direction goes from -180 to 180, with 0 toward the right and 90 on top.
  var direction = Math.atan2(dy,
    this.anchor_ === eYo.Flyout.AT_RIGHT ? -dx : dx
  ) / Math.PI * 180
  var limit = this.dragAngleLimit_
  return direction < limit && - range < limit
}

/**
 * Filter the bricks on the flyout to disable the ones that are above the
 * capacity limit.  For instance, if the user may only place two more bricks on
 * the workspace, an "a + b" brick that has two shadow bricks would be disabled.
 * @private
 */
eYo.Flyout.prototype.filterForCapacity_ = function() {
  var remainingCapacity = this.targetSpace_.remainingCapacity()
  this.workspace_.getTopBricks(false).forEach(brick => {
    if (this.permanentlyDisabled_.indexOf(brick) < 0) {
      var allBricks = brick.getDescendants()
      brick.disabled = allBricks.length > remainingCapacity
    }
  })
}

/**
 * Reflow bricks and their mats.
 */
eYo.Flyout.prototype.reflow = function() {
  if (this.reflowWrapper_) {
    this.workspace_.removeChangeListener(this.reflowWrapper_)
  }
  this.workspace_.scale = this.targetSpace_.scale
  var flyoutWidth = 0
  var bricks = this.workspace_.getTopBricks(false)
  bricks.forEach(brick => {
    flyoutWidth = Math.max(flyoutWidth, brick.span.size.width)
  })
  flyoutWidth += this.MARGIN * 1.5
  flyoutWidth *= this.workspace_.scale
  flyoutWidth += eYo.Scrollbar.thickness
  if (this.width_ != flyoutWidth) {
    // Record the width for .getMetrics_ and .place.
    this.width_ = flyoutWidth
    // Call this since it is possible the trash and zoom buttons need
    // to move. e.g. on a bottom positioned flyout when zoom is clicked.
    this.targetSpace_.resize()
  }
  if (this.reflowWrapper_) {
    this.workspace_.addChangeListener(this.reflowWrapper_)
  }
}

/**
 * Move the flyout to the edge of the workspace.
 */
eYo.Flyout.prototype.place = function () {
  if (!this.visible_) {
    return
  }
  var metrics = this.targetSpace_.getMetrics()
  if (!metrics || metrics.viewHeight <= 0) {
    // Hidden components will return null.
    return;
  }
  // Record the height for eYo.Flyout.getMetrics_
  this.height_ = metrics.viewHeight - this.TOP_OFFSET

  var edgeWidth = this.width_
  var edgeHeight = metrics.viewHeight
  this.ui_driver.flyoutUpdate(edgeWidth, edgeHeight)
  this.toolbar_.resize(edgeWidth, edgeHeight)

  var y = metrics.absoluteTop
  var x = metrics.absoluteLeft
  if (this.anchor_ === eYo.Flyout.AT_RIGHT) {
    x += (metrics.viewWidth - this.width_)
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
  this.ui_driver.flyoutPlaceAt(this, this.width_, this.height_, x, y)
}

/**
 * Return an object with all the metrics required to size scrollbars for the
 * flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the contents,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .absoluteTop: Top-edge of view.
 * .viewLeft: Offset of the left edge of visible rectangle from parent,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate,
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of the flyout.
 * @private
 */
eYo.Flyout.prototype.getMetrics_ = function() {
  return this.ui_driver.flyoutGetMetrics_(this)
}

/**
 * Copy a brick from the flyout to the workspace and position it correctly.
 * Edython adds a full rendering process.
 * No rendering is made while bricks are dragging.
 * @param {!eYo.Brick} oldBrick The flyout brick to copy.
 * @return {!eYo.Brick} The new brick in the main workspace.
 * @private
 */
eYo.Flyout.prototype.placeNewBrick_ = function(oldBrick) {

  // Create the new brick by cloning the brick in the flyout (via XML).
  var xml = eYo.Xml.brickToDom(oldBrick)
  // The target workspace would normally resize during domToBrick, which will
  // lead to weird jumps.  Save it for terminateDrag.
  var targetSpace = this.targetSpace_
  targetSpace.setResizesEnabled(false)

  // Using domToBrick instead of domToWorkspace means that the new brick will be
  // placed at position (0, 0) in main workspace units.
  var brick = eYo.Xml.domToBrick(xml, targetSpace)

  // The offset in pixels between the main workspace's origin and the upper left
  // corner of the injection div.
  var mainOffsetPixels = targetSpace.getOriginOffsetInPixels()

  // The offset in pixels between the flyout workspace's origin and the upper
  // left corner of the injection div.
  var flyoutOffsetPixels = this.workspace_.getOriginOffsetInPixels()

  // The position of the old brick in flyout workspace coordinates.
  var oldBrickPosWs = oldBrick.xyInWorkspace

  // The position of the old brick in pixels relative to the flyout
  // workspace's origin.
  var oldBrickPosPixels = oldBrickPosWs.scale(this.workspace_.scale)

  // The position of the old brick in pixels relative to the upper left corner
  // of the injection div.
  var oldBrickOffsetPixels = goog.math.Coordinate.sum(flyoutOffsetPixels,
      oldBrickPosPixels)

  // The position of the old brick in pixels relative to the origin of the
  // main workspace.
  var finalOffsetPixels = goog.math.Coordinate.difference(oldBrickOffsetPixels,
      mainOffsetPixels)

  // The position of the old brick in main workspace coordinates.
  var finalOffsetMainWs = finalOffsetPixels.scale(1 / targetSpace.scale)

  brick.xyMoveBy(finalOffsetMainWs.x, finalOffsetMainWs.y)

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
  var metrics = this.targetSpace_.getMetrics()
  if (!metrics) {
    // Hidden components will return null.
    return;
  }
  this.slide_locked = true
  var atRight = this.anchor_ == eYo.Flyout.AT_RIGHT
  this.visible = true
  eYo.Tooltip.hideAll(this.dom.svg.group_)
  var left = metrics.absoluteLeft
  var right = left + metrics.viewWidth
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
  var y = metrics.absoluteTop;
  n = 0
  var id = setInterval(() => {
    if (n >= n_steps) {
      clearInterval(id)
      if ((this.closed = close)) {
        this.visible = false
      }
      this.ui_driver.flyoutUpdate(this.width_, this.height_)
      this.toolbar_.resize(this.width_, this.height_)
      delete this.slide_locked
      this.targetSpace_.recordDeleteAreas()
      this.slideOneStep(steps[n_steps])
      this.didSlide(close)
    } else {
      this.ui_driver.flyoutPlaceAt(this, this.width_, this.height_, positions[n], y)
      this.slideOneStep(steps[n])
      // the scrollbar won't resize because the metrics of the workspace did not change
      var hostMetrics = this.workspace_.getMetrics()
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
