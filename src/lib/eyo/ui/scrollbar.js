/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Dom utils.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Scrollbar')

goog.provide('eYo.ScrollbarPair');

goog.require('eYo')

goog.forwardDeclare('eYo.Board')

goog.forwardDeclare('goog.dom')
goog.forwardDeclare('goog.events')


/**
 * A note on units: most of the numbers that are in CSS pixels are scaled if the
 * scrollbar is in a mutator.
 */

/**
 * Class for a pair of scrollbars.  Horizontal and vertical.
 * @param {!eYo.Board} board Board to bind the scrollbars to.
 * @constructor
 */
eYo.ScrollbarPair = function(board) {
  this.board_ = board
  this.hScroll = new eYo.Scrollbar(
    board,
    true,
    true,
    'blocklyMainBoardScrollbar'
  )
  this.vScroll = new eYo.Scrollbar(
    board,
    false,
    true,
    'blocklyMainBoardScrollbar'
  )
  this.disposeUI = eYo.Do.nothing
  board.hasUI && this.makeUI()
}

Object.defineProperties(eYo.ScrollbarPair.prototype, {
  /**
   * @type{eYo.Board} The scrolled board...
   * @readonly
   */
  board: {
    get () {
      return this.board_
    }
  },
  /**
   * @type{eYo.Driver} The ui driver...
   * @readonly
   */
  ui_driver: {
    get () {
      return this.board_.ui_driver
    }
  },
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
  /**
   * Set whether this scrollbar's container is visible.
   * @param {boolean} visible Whether the container is visible.
   */
  containerVisible: {
    get () {
      return this.hScroll.containerVisible || this.vScroll.containerVisible
    },
    set (newValue) {
      this.hScroll.containerVisible = newValue
      this.vScroll.containerVisible = newValue
    }
  },
  /**
   * Is the scrollbar visible.  Non-paired scrollbars disappear when they aren't
   * needed.
   * @return {boolean} True if visible.
   */
  visible: {
    get () {
      return this.hScroll.visible || this.vScroll.visible
    }
  },
})

/**
 * Previously recorded metrics from the board.
 * @type {Object}
 * @private
 */
eYo.ScrollbarPair.prototype.makeUI = function () {
  this.makeUI = eYo.Do.nothing
  this.ui_driver.scrollbarPairInit(this)
  delete this.disposeUI
}

/**
 * Previously recorded metrics from the board.
 * @type {Object}
 * @private
 */
eYo.ScrollbarPair.prototype.disposeUI = function () {
  this.disposeUI = eYo.Do.nothing
  delete this.makeUI
  this.hScroll.disposeUI()
  this.vScroll.disposeUI()
  this.ui_driver.ScrollbarPairDispose(this)
}

/**
 * Previously recorded metrics from the board.
 * @type {Object}
 * @private
 */
eYo.ScrollbarPair.prototype.oldHostMetrics_ = null;

/**
 * Dispose of this pair of scrollbars.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.ScrollbarPair.prototype.dispose = function() {
  this.disposeUI()
  this.board_ = null
  this.oldHostMetrics_ = null
  this.hScroll.dispose()
  this.hScroll = null
  this.vScroll.dispose()
  this.vScroll = null
}

/**
 * Recalculate both of the scrollbars' locations and lengths.
 * Also reposition the corner rectangle.
 */
eYo.ScrollbarPair.prototype.resize = function() {
  // Look up the host metrics once, and use for both scrollbars.
  var hostMetrics = this.board_.metrics;
  if (!hostMetrics) {
    // Host element is likely not visible.
    return;
  }
  var oldMetrics = this.oldHostMetrics_
  // Only change the scrollbars if there has been a change in metrics.
  var resizeH = false
  var resizeV = false
  if (!oldMetrics ||
    oldMetrics.view.width != hostMetrics.view.width ||
    oldMetrics.view.height != hostMetrics.view.height ||
    oldMetrics.absolute.y != hostMetrics.absolute.y ||
    oldMetrics.absolute.x != hostMetrics.absolute.x) {
    // The window has been resized or repositioned.
    resizeH = true
    resizeV = true
  } else {
    // Has the content been resized or moved?
    if (!oldMetrics ||
      oldMetrics.content.width != hostMetrics.content.width ||
      oldMetrics.view.x != hostMetrics.view.x ||
      oldMetrics.content.x_min != hostMetrics.content.x_min) {
      resizeH = true
    }
    if (!oldMetrics ||
      oldMetrics.content.height != hostMetrics.content.height ||
      oldMetrics.view.y != hostMetrics.view.y ||
      oldMetrics.content.y_min != hostMetrics.content.y_min) {
      resizeV = true
    }
  }
  if (resizeH) {
    this.hScroll.resize(hostMetrics)
  }
  if (resizeV) {
    this.vScroll.resize(hostMetrics)
  }
  // Reposition the corner square.
  this.ui_driver.scrollbarPairPlaceCorner(this, hostMetrics)

  // Cache the current metrics to potentially short-cut the next resize event.
  this.oldHostMetrics_ = hostMetrics
}

/**
 * Set the handles of both scrollbars to be at a certain position in CSS pixels
 * relative to their parents.
 * @param {eYo.Where} xy
 */
eYo.ScrollbarPair.prototype.set = (() => {
  /*
   * Helper to calculate the ratio of handle position to scrollbar view size.
   * @param {number} handlePosition The value of the handle.
   * @param {number} viewSize The total size of the scrollbar's view.
   * @return {number} Ratio.
   * @private
   */
  var getRatio = function(handlePosition, viewSize) {
    var ratio = handlePosition / viewSize
    return isNaN(ratio) ? 0 : ratio
  }
  return function(xy) {
    // This function is equivalent to:
    //   this.hScroll.set(x);
    //   this.vScroll.set(y);
    // However, that calls setMetrics twice which causes a chain of
    // getAttribute->setAttribute->getAttribute resulting in an extra layout pass.
    // Combining them speeds up rendering.
    var xyRatio = new eYo.Where()

    var hHandlePosition = xy.x * this.hScroll.ratio_
    var vHandlePosition = xy.y * this.vScroll.ratio_

    var hLength = this.hScroll.viewLength_
    var vLength = this.vScroll.viewLength_

    xyRatio.x = getRatio(hHandlePosition, hLength)
    xyRatio.y = getRatio(vHandlePosition, vLength)
    this.board_.setMetrics(xyRatio)

    this.hScroll.handlePosition = hHandlePosition
    this.vScroll.handlePosition = vHandlePosition
  }
})()

// --------------------------------------------------------------------

/**
 * Class for a pure SVG scrollbar.
 * This technique offers a scrollbar that is guaranteed to work, but may not
 * look or behave like the system's scrollbars.
 * @param {!eYo.Board} board Board to bind the scrollbar to.
 * @param {boolean} horizontal True if horizontal, false if vertical.
 * @param {boolean=} opt_pair True if scrollbar is part of a horiz/vert pair.
 * @param {string=} opt_class A class to be applied to this scrollbar.
 * @constructor
 */
eYo.Scrollbar = function(board, horizontal, opt_pair, opt_class) {
  this.disposeUI = eYo.Do.nothing
  this.board_ = board
  this.pair_ = opt_pair || false
  this.opt_class_ = opt_class
  this.horizontal_ = horizontal

  this.oldHostMetrics_ = null
  this.origin_ = new eYo.Where()
  this.position_ = new eYo.Where()
  this.deleteUI = eYo.Do.nothing
  board.hasUI && this.makeUI(opt_class)
}

Object.defineProperties(eYo.Scrollbar, {
  /**
   * Width of vertical scrollbar or height of horizontal scrollbar in CSS pixels.
   * Scrollbars should be larger on touch devices.
   */
  thickness: {
    value: goog.events.BrowserFeature.TOUCH_ENABLED ? 25 : 15
  },
})

Object.defineProperties(eYo.Scrollbar.prototype, {
  /**
   * @type{eYo.Board} The scrolled board...
   * @readonly
   */
  board: {
    get () {
      return this.board_
    }
  },
  /**
   * Is the scrollbar visible.  Non-paired scrollbars disappear when they aren't
   * needed.
   * @return {boolean} True if visible.
   */
  visible: {
    get () {
      return this.visible_
    },
    /**
     * Set whether the scrollbar is visible.
     * Only applies to non-paired scrollbars.
     * @param {boolean} newValue True if visible.
     */
    set (newValue) {
      var visibilityChanged = (newValue != this.visible_)
      // Ideally this would also apply to scrollbar pairs, but that's a bigger
      // headache (due to interactions with the corner square).
      if (this.pair_) {
        throw 'Unable to toggle visibility of paired scrollbars.'
      }
      this.visible_ = newValue
      if (visibilityChanged) {
        this.updateDisplay_()
      }
    }
  },
  /**
   * Set whether the scrollbar's container is visible and update
   * display accordingly if visibility has changed.
   * @param {boolean} visible Whether the container is visible
   */
  containerVisible: {
    get () {
      return this.containerVisible_
    },
    set (newValue) {
      var visibilityChanged = (newValue != this.containerVisible_)
      this.containerVisible_ = newValue
      if (visibilityChanged) {
        this.updateDisplay_()
      }
    }
  },
})

/**
 * @param {!Object} first An object containing computed measurements of a
 *    board.
 * @param {!Object} second Another object containing computed measurements of a
 *    board.
 * @return {boolean} Whether the two sets of metrics are equivalent.
 * @private
 */
eYo.Scrollbar.metricsAreEquivalent_ = function(first, second) {
  if (!(first && second)) {
    return false
  }
  if (first.view.width != second.view.width ||
      first.view.height != second.view.height ||
      first.view.x != second.view.x ||
      first.view.y != second.view.y ||
      first.absolute.y != second.absolute.y ||
      first.absolute.x != second.absolute.x ||
      first.content.width != second.content.width ||
      first.content.height != second.content.height ||
      first.content.x_min != second.content.x_min ||
      first.content.y_min != second.content.y_min) {
    return false
  }

  return true
}

Object.defineProperties(eYo.Scrollbar.prototype, {
/**
   * @type{eYo.Driver} The ui driver...
   * @readonly
   */
  ui_driver: {
    get () {
      return this.board_.ui_driver
    }
  },
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
  origin: {
    /**
     * The location of the origin of the board that the scrollbar is in,
     * measured in CSS pixels relative to the desk origin.  This is usually
     * (0, 0).  When the scrollbar is in a flyout it may have a different origin.
     * @type {eYo.Where}
     * @readonly
     */
    get () {
      return new eYo.Where(this.origin_)
    },
    /**
     * Record the origin of the board that the scrollbar is in, in pixels
     * relative to the injection div origin. This is for times when the scrollbar is
     * used in an object whose origin isn't the same as the main board
     * (e.g. in a flyout.)
     * @param {eYo.Where} newOrigin The coordinates of the scrollbar's origin, in CSS pixels.
     */
    set (newValue) {
      this.origin_.xySet(newValue)
    }
  },
  position: {
    /**
     * The upper left corner of the scrollbar's SVG group in CSS pixels relative
     * to the scrollbar's origin.  This is usually relative to the injection div
     * origin.
     * @type {eYo.Where}
     */
    get () {
      return new eYo.Where(this.position_)
    },
    /**
     * Set the position of the scrollbar's SVG group in CSS pixels relative to the
     * scrollbar's origin.  This sets the scrollbar's location within the board.
     * @param {eYo.Where} newValue The new coordinates.
     * @private
     */
    set (newValue) {
      this.position_.xySet(newValue)
      this.ui_driver.scrollbarPlace(this)
    }
  },
  /**
   * The upper left corner of the scrollbar's SVG group in CSS pixels relative
   * to the desk origin.
   * @type {eYo.Where}
   * @readonly
   */
  positionInDesk: {
    get () {
      return this.origin.forward(this.position_)
    }
  },
  /**
   * The position of the mouse along this scrollbar's major axis at the start of
   * the most recent drag.
   * Units are CSS pixels, with (0, 0) at the top left of the browser window.
   * For a horizontal scrollbar this is the x coordinate of the mouse down event;
   * for a vertical scrollbar it's the y coordinate of the mouse down event.
   * @type {eYo.Where}
   */
  startDragMouse_: {
    value: 0,
    writable: true
  },
  /**
   * The size of the area within which the scrollbar handle can move, in CSS
   * pixels.
   * @type {number}
   * @private
   */
  viewLength_: {
    value: 0,
    writable: true
  },
  /**
   * The length of the scrollbar handle in CSS pixels.
   * @type {number}
   * @private
   */
  handleLength_: {
    value: 0,
    writable: true
  },
  /**
   * The offset of the start of the handle from the scrollbar position, in CSS
   * pixels.
   * @type {number}
   * @private
   */
  handlePosition_: {
    value: 0,
    writable: true
  },
  /**
   * The offset of the start of the handle from the scrollbar position, in CSS
   * pixels.
   * @type {number}
   * @private
   */
  handlePosition: {
    get () {
      return this.handlePosition_
    },
    /**
     * Set the offset of the scrollbar's handle from the scrollbar's position, and
     * change the SVG attribute accordingly.
     * @param {number} newPosition The new scrollbar handle offset in CSS pixels.
     */
    set (newValue) {
      this.handlePosition_ = newValue
      this.ui_driver.scrollbarUpdateHandle(this)
    }
  },
  /**
   * Whether the scrollbar handle is visible.
   * @type {boolean}
   * @private
   */
  visible_: {
    value: true,
    writable: true
  },
  /**
   * Whether the board containing this scrollbar is visible.
   * @type {boolean}
   * @private
   */
  containerVisible_: {
    value: true,
    writable: true
  },

})

/**
 * Create all the DOM elements required for a scrollbar.
 * The resulting widget is not sized.
 * @param {string=} opt_class A class to be applied to this scrollbar.
 * @private
 */
eYo.Scrollbar.prototype.makeUI = function(opt_class) {
  if (this.board_.hasUI) {
    this.makeUI = eYo.Do.nothing
    delete this.disposeUI
    return this.ui_driver.scrollbarInit(this, opt_class)
  }
}

/**
 * Dispose of the UI resources
 */
eYo.Scrollbar.prototype.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  delete this.makeUI
  return this.ui_driver.scrollbarDispose(this)
}

/**
 * Dispose of this scrollbar.
 */
eYo.Scrollbar.prototype.dispose = function() {
  this.disposeUI()
  this.board_ = null
}

/**
 * Set the length of the scrollbar's handle and change the SVG attribute
 * accordingly.
 * @param {number} newLength The new scrollbar handle length in CSS pixels.
 */
eYo.Scrollbar.prototype.setHandleLength_ = function(newLength) {
  this.handleLength_ = newLength
  this.ui_driver.scrollbarUpdateHandle(this)
}

/**
 * Set the size of the scrollbar's background and change the SVG attribute
 * accordingly.
 * @param {number} newSize The new scrollbar background length in CSS pixels.
 * @private
 */
eYo.Scrollbar.prototype.setScrollViewSize_ = function(newSize) {
  this.viewLength_ = newSize
  this.ui_driver.scrollbarUpdateView(this)
}

/**
 * Recalculate the scrollbar's location and its length.
 * @param {Object=} opt_metrics A data structure of from the describing all the
 * required dimensions.  If not provided, it will be fetched from the host
 * object.
 */
eYo.Scrollbar.prototype.resize = function(opt_metrics) {
  // Determine the location, height and width of the host element.
  var hostMetrics = opt_metrics
  if (!hostMetrics) {
    hostMetrics = this.board_.metrics
    if (!hostMetrics) {
      // Host element is likely not visible.
      return
    }
  }
  if (eYo.Scrollbar.metricsAreEquivalent_(hostMetrics,
      this.oldHostMetrics_)) {
    return
  }
  this.oldHostMetrics_ = hostMetrics

  /* hostMetrics is an object with the following properties.
   * .view.height: Height of the visible rectangle,
   * .view.width: Width of the visible rectangle,
   * .content.height: Height of the contents,
   * .content.width: Width of the content,
   * .view.y: Offset of top edge of visible rectangle from parent,
   * .view.x: Offset of left edge of visible rectangle from parent,
   * .content.y_min: Offset of the top-most content from the y=0 coordinate,
   * .content.x_min: Offset of the left-most content from the x=0 coordinate,
   * .absolute.y: Top-edge of view.
   * .absolute.x: Left-edge of view.
   */
  if (this.horizontal_) {
    this.resizeViewHorizontal(hostMetrics)
  } else {
    this.resizeViewVertical(hostMetrics)
  }
  // Resizing may have caused some scrolling.
  this.didScroll_()
}

/**
 * Recalculate a horizontal scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
eYo.Scrollbar.prototype.resizeViewHorizontal = function(hostMetrics) {
  var viewSize = hostMetrics.view.width - 1
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= eYo.Scrollbar.thickness
  }
  this.setScrollViewSize_(Math.max(0, viewSize))

  var coordinates = new eYo.Where(hostMetrics.absolute)
  coordinates.x += 0.5
  // Horizontal toolbar should always be just above the bottom of the board.
  coordinates.y += hostMetrics.view.height - eYo.Scrollbar.thickness - 0.5
  this.position = coordinates

  // If the view has been resized, a content resize will also be necessary.
  // The converse is not true.
  this.resizeContentHorizontal(hostMetrics)
}

/**
 * Recalculate a horizontal scrollbar's location within its path and length.
 * This should be called when the contents of the board have changed.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
eYo.Scrollbar.prototype.resizeContentHorizontal = function(hostMetrics) {
  if (!this.pair_) {
    // Only show the scrollbar if needed.
    // Ideally this would also apply to scrollbar pairs, but that's a bigger
    // headache (due to interactions with the corner square).
    this.visible = this.viewLength_ < hostMetrics.content.width
  }

  this.ratio_ = this.viewLength_ / hostMetrics.content.width
  if (this.ratio_ === -Infinity || this.ratio_ === Infinity ||
      isNaN(this.ratio_)) {
    this.ratio_ = 0
  }

  var handleLength = hostMetrics.view.width * this.ratio_
  this.setHandleLength_(Math.max(0, handleLength))

  var handlePosition = (hostMetrics.view.x - hostMetrics.content.x_min) *
      this.ratio_
  this.handlePosition = this.constrainHandle_(handlePosition)
}

/**
 * Update visibility of scrollbar based on whether it thinks it should
 * be visible and whether its containing board is visible.
 * We cannot rely on the containing board being hidden to hide us
 * because it is not necessarily our parent in the DOM.
 */
eYo.Scrollbar.prototype.updateDisplay_ = function() {
  var show = true
  // Check whether our parent/container is visible.
  show = this.containerVisible_ && this.visible_
  this.ui_driver.scrollbarUpdateDisplay(this, show)
}

/**
 * Constrain the handle's position within the minimum (0) and maximum
 * (length of scrollbar) values allowed for the scrollbar.
 * @param {number} value Value that is potentially out of bounds, in CSS pixels.
 * @return {number} Constrained value, in CSS pixels.
 * @private
 */
eYo.Scrollbar.prototype.constrainHandle_ = function(value) {
  if (value <= 0 || isNaN(value) || this.viewLength_ < this.handleLength_) {
    value = 0;
  } else {
    value = Math.min(value, this.viewLength_ - this.handleLength_);
  }
  return value;
}

/**
 * Called when scrollbar has moved.
 * @private
 */
eYo.Scrollbar.prototype.didScroll_ = function() {
  var ratio = this.handlePosition_ / this.viewLength_
  if (isNaN(ratio)) {
    ratio = 0
  }
  var xyRatio = {}
  xyRatio[this.horizontal_ ? 'x' : 'y'] = ratio
  this.board_.setMetrics(xyRatio)
}

/**
 * Set the scrollbar handle's position.
 * @param {number} value The distance from the top/left end of the bar, in CSS
 *     pixels.  It may be larger than the maximum allowable position of the
 *     scrollbar handle.
 */
eYo.Scrollbar.prototype.set = function(value) {
  var v = value[this.horizontal_ ? 'x' : 'y']
  this.handlePosition = this.constrainHandle_((v || value) * this.ratio_)
  this.didScroll_()
}

/**
 * Recalculate a vertical scrollbar's location within its path and length.
 * This should be called when the contents of the board have changed.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
eYo.Scrollbar.prototype.resizeContentVertical = function(hostMetrics) {
  if (!this.pair_) {
    // Only show the scrollbar if needed.
    this.visible = this.viewLength_ < hostMetrics.content.height;
  }

  this.ratio_ = this.viewLength_ / hostMetrics.content.height;
  if (this.ratio_ == -Infinity || this.ratio_ == Infinity ||
      isNaN(this.ratio_)) {
    this.ratio_ = 0;
  }

  var handleLength = hostMetrics.view.height * this.ratio_;
  this.setHandleLength_(Math.max(0, handleLength));

  var handlePosition = (hostMetrics.view.y - hostMetrics.content.y_min) *
      this.ratio_;
  this.handlePosition = this.constrainHandle_(handlePosition)
}


/**
 * Recalculate a horizontal scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * Edython: position and resize according to the position of the flyout.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
eYo.Scrollbar.prototype.resizeViewHorizontal = function(hostMetrics) {
  var board = this.board_
  var flyout = board.flyout_
  if (flyout && flyout.atRight) {
    var viewSize = flyout.position.x - hostMetrics.absolute.x - 1
  } else {
    viewSize = hostMetrics.view.width - 1
  }
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= eYo.Scrollbar.thickness;
  }
  this.setScrollViewSize_(Math.max(0, viewSize))

  var coordinates = new eYo.Where(hostMetrics.absolute)

  coordinates.x += 0.5
  // Horizontal toolbar should always be just above the bottom of the board.
  coordinates.y += hostMetrics.view.height - eYo.Scrollbar.thickness - 0.5

  this.position = coordinates

  // If the view has been resized, a content resize will also be necessary.  The
  // reverse is not true.
  this.resizeContentHorizontal(hostMetrics)
}

/**
 * Recalculate a vertical scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * Edython: position and resize according to the position of the flyout.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
eYo.Scrollbar.prototype.resizeViewVertical = function(hostMetrics) {
  var viewSize = hostMetrics.view.height - 1;
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= eYo.Scrollbar.thickness;
  }
  var board = this.board_
  var flyout = board.flyout_
  if (flyout && flyout.atRight) {
    var coordinates = flyout.position
    coordinates.x -= hostMetrics.absolute.x + eYo.Scrollbar.thickness + 0.5
    var yOffset = flyout.TOP_OFFSET
  } else {
    coordinates = hostMetrics.absolute.clone
    coordinates.x += 0.5 + hostMetrics.view.width -
        eYo.Scrollbar.thickness - 1
    yOffset = 1 * eYo.Unit.rem
  }
  viewSize -= yOffset
  this.setScrollViewSize_(Math.max(0, viewSize))
  coordinates.y = hostMetrics.absolute.y + 0.5 + yOffset
  this.position = coordinates

  // If the view has been resized, a content resize will also be necessary.
  // The converse is not true.
  this.resizeContentVertical(hostMetrics)
}

/**
 * Stop binding to mouseup and mousemove events.  Call this to
 * wrap up lose ends associated with the scrollbar.
 * @private
 */
eYo.Scrollbar.prototype.cleanUp_ = function() {
  this.ui_driver.scrollbarCleanUp_(this)
}

