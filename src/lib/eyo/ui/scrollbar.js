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

goog.forwardDeclare('eYo.Workspace')

goog.forwardDeclare('goog.dom')
goog.forwardDeclare('goog.events')


/**
 * A note on units: most of the numbers that are in CSS pixels are scaled if the
 * scrollbar is in a mutator.
 */

/**
 * Class for a pair of scrollbars.  Horizontal and vertical.
 * @param {!eYo.Workspace} workspace Workspace to bind the scrollbars to.
 * @constructor
 */
eYo.ScrollbarPair = function(workspace) {
  this.workspace_ = workspace;
  this.hScroll = new eYo.Scrollbar(
    workspace,
    true,
    true,
    'blocklyMainWorkspaceScrollbar'
  )
  this.vScroll = new eYo.Scrollbar(
    workspace,
    false,
    true,
    'blocklyMainWorkspaceScrollbar'
  )
  this.disposeUI = eYo.Do.nothing
}

Object.defineProperties(eYo.ScrollbarPair.prototype, {
  /**
   * @type{eYo.Driver} The ui driver...
   * @readonly
   */
  ui_driver: {
    get () {
      return this.workspace_.ui_driver
    }
  },
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
})

/**
 * Previously recorded metrics from the workspace.
 * @type {Object}
 * @private
 */
eYo.ScrollbarPair.prototype.makeUI = funtion () {
  this.makeUI = eYo.Do.nothing
  this.ui_driver.ScrollbarPairInit(this)
  delete this.disposeUI
}

/**
 * Previously recorded metrics from the workspace.
 * @type {Object}
 * @private
 */
eYo.ScrollbarPair.prototype.disposeUI = funtion () {
  this.disposeUI = eYo.Do.nothing
  delete this.makeUI
  this.hScroll.disposeUI()
  this.vScroll.disposeUI()
  this.ui_driver.ScrollbarPairDispose(this)
}

/**
 * Previously recorded metrics from the workspace.
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
  this.workspace_ = null
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
  var hostMetrics = this.workspace_.getMetrics();
  if (!hostMetrics) {
    // Host element is likely not visible.
    return;
  }

  // Only change the scrollbars if there has been a change in metrics.
  var resizeH = false;
  var resizeV = false;
  if (!this.oldHostMetrics_ ||
      this.oldHostMetrics_.viewWidth != hostMetrics.viewWidth ||
      this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight ||
      this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop ||
      this.oldHostMetrics_.absoluteLeft != hostMetrics.absoluteLeft) {
    // The window has been resized or repositioned.
    resizeH = true;
    resizeV = true;
  } else {
    // Has the content been resized or moved?
    if (!this.oldHostMetrics_ ||
        this.oldHostMetrics_.contentWidth != hostMetrics.contentWidth ||
        this.oldHostMetrics_.viewLeft != hostMetrics.viewLeft ||
        this.oldHostMetrics_.contentLeft != hostMetrics.contentLeft) {
      resizeH = true;
    }
    if (!this.oldHostMetrics_ ||
        this.oldHostMetrics_.contentHeight != hostMetrics.contentHeight ||
        this.oldHostMetrics_.viewTop != hostMetrics.viewTop ||
        this.oldHostMetrics_.contentTop != hostMetrics.contentTop) {
      resizeV = true;
    }
  }
  if (resizeH) {
    this.hScroll.resize(hostMetrics);
  }
  if (resizeV) {
    this.vScroll.resize(hostMetrics);
  }

  // Reposition the corner square.
  if (!this.oldHostMetrics_ ||
      this.oldHostMetrics_.viewWidth != hostMetrics.viewWidth ||
      this.oldHostMetrics_.absoluteLeft != hostMetrics.absoluteLeft) {
    this.corner_.setAttribute('x', this.vScroll.position_.x);
  }
  if (!this.oldHostMetrics_ ||
      this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight ||
      this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop) {
    this.corner_.setAttribute('y', this.hScroll.position_.y);
  }

  // Cache the current metrics to potentially short-cut the next resize event.
  this.oldHostMetrics_ = hostMetrics;
};

/**
 * Set the handles of both scrollbars to be at a certain position in CSS pixels
 * relative to their parents.
 * @param {number} x Horizontal scroll value.
 * @param {number} y Vertical scroll value.
 */
eYo.ScrollbarPair.prototype.set = function(x, y) {
  // This function is equivalent to:
  //   this.hScroll.set(x);
  //   this.vScroll.set(y);
  // However, that calls setMetrics twice which causes a chain of
  // getAttribute->setAttribute->getAttribute resulting in an extra layout pass.
  // Combining them speeds up rendering.
  var xyRatio = {};

  var hHandlePosition = x * this.hScroll.ratio_;
  var vHandlePosition = y * this.vScroll.ratio_;

  var hBarLength = this.hScroll.scrollViewSize_;
  var vBarLength = this.vScroll.scrollViewSize_;

  xyRatio.x = this.getRatio_(hHandlePosition, hBarLength);
  xyRatio.y = this.getRatio_(vHandlePosition, vBarLength);
  this.workspace_.setMetrics(xyRatio);

  this.hScroll.setHandlePosition(hHandlePosition);
  this.vScroll.setHandlePosition(vHandlePosition);
};

/**
 * Helper to calculate the ratio of handle position to scrollbar view size.
 * @param {number} handlePosition The value of the handle.
 * @param {number} viewSize The total size of the scrollbar's view.
 * @return {number} Ratio.
 * @private
 */
eYo.ScrollbarPair.prototype.getRatio_ = function(handlePosition, viewSize) {
  var ratio = handlePosition / viewSize;
  if (isNaN(ratio)) {
    return 0;
  }
  return ratio;
}

/**
 * Set whether this scrollbar's container is visible.
 * @param {boolean} visible Whether the container is visible.
 */
eYo.ScrollbarPair.prototype.setContainerVisible = function(visible) {
  this.hScroll.setContainerVisible(visible)
  this.vScroll.setContainerVisible(visible)
}

// --------------------------------------------------------------------

/**
 * Class for a pure SVG scrollbar.
 * This technique offers a scrollbar that is guaranteed to work, but may not
 * look or behave like the system's scrollbars.
 * @param {!eYo.Workspace} workspace Workspace to bind the scrollbar to.
 * @param {boolean} horizontal True if horizontal, false if vertical.
 * @param {boolean=} opt_pair True if scrollbar is part of a horiz/vert pair.
 * @param {string=} opt_class A class to be applied to this scrollbar.
 * @constructor
 */
eYo.Scrollbar = function(workspace, horizontal, opt_pair, opt_class) {
  this.workspace_ = workspace
  this.pair_ = opt_pair || false
  this.horizontal_ = horizontal

  this.oldHostMetrics_ = null
  /**
   * The upper left corner of the scrollbar's SVG group in CSS pixels relative
   * to the scrollbar's origin.  This is usually relative to the injection div
   * origin.
   * @type {goog.math.Coordinate}
   * @private
   */
  this.position_ = new goog.math.Coordinate(0, 0)

  this.disposeUI = eYo.Do.nothing
  this.makeUI(opt_class)  
}

Object.defineProperties(eYo.Scrollbar.prototype, {
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
  /**
   * The location of the origin of the workspace that the scrollbar is in,
   * measured in CSS pixels relative to the injection div origin.  This is usually
   * (0, 0).  When the scrollbar is in a flyout it may have a different origin.
   * @type {goog.math.Coordinate}
   * @private
   */
  origin_: {
    value: new goog.math.Coordinate(0, 0),
    writable: true
  },
  /**
   * The position of the mouse along this scrollbar's major axis at the start of
   * the most recent drag.
   * Units are CSS pixels, with (0, 0) at the top left of the browser window.
   * For a horizontal scrollbar this is the x coordinate of the mouse down event;
   * for a vertical scrollbar it's the y coordinate of the mouse down event.
   * @type {goog.math.Coordinate}
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
  scrollViewSize_: {
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
   * Whether the scrollbar handle is visible.
   * @type {boolean}
   * @private
   */
  isVisible_: {
    value: true,
    writable: true
  },
  /**
   * Whether the workspace containing this scrollbar is visible.
   * @type {boolean}
   * @private
   */
  containerVisible_: {
    value: true,
    writable: true
  },

})

Object.defineProperties(eYo.Scrollbar, {
  /**
   * Width of vertical scrollbar or height of horizontal scrollbar in CSS pixels.
   * Scrollbars should be larger on touch devices.
   */
  thickness: {
    value: goog.events.BrowserFeature.TOUCH_ENABLED ? 25 : 15
  }
})

/**
 * Create all the DOM elements required for a scrollbar.
 * The resulting widget is not sized.
 * @param {string=} opt_class A class to be applied to this scrollbar.
 * @private
 */
eYo.Scrollbar.prototype.makeUI = function(opt_class) {
  if (this.workspace_.hasUI) {
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
  this.workspace_ = null
}

/**
 * @param {!Object} first An object containing computed measurements of a
 *    workspace.
 * @param {!Object} second Another object containing computed measurements of a
 *    workspace.
 * @return {boolean} Whether the two sets of metrics are equivalent.
 * @private
 */
eYo.Scrollbar.metricsAreEquivalent_ = function(first, second) {
  if (!(first && second)) {
    return false
  }
  if (first.viewWidth != second.viewWidth ||
      first.viewHeight != second.viewHeight ||
      first.viewLeft != second.viewLeft ||
      first.viewTop != second.viewTop ||
      first.absoluteTop != second.absoluteTop ||
      first.absoluteLeft != second.absoluteLeft ||
      first.contentWidth != second.contentWidth ||
      first.contentHeight != second.contentHeight ||
      first.contentLeft != second.contentLeft ||
      first.contentTop != second.contentTop) {
    return false
  }

  return true
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
 * Set the offset of the scrollbar's handle from the scrollbar's position, and
 * change the SVG attribute accordingly.
 * @param {number} newPosition The new scrollbar handle offset in CSS pixels.
 */
eYo.Scrollbar.prototype.setHandlePosition = function(newPosition) {
  this.handlePosition_ = newPosition
  this.ui_driver.scrollbarUpdateHandle(this)
}

/**
 * Set the size of the scrollbar's background and change the SVG attribute
 * accordingly.
 * @param {number} newSize The new scrollbar background length in CSS pixels.
 * @private
 */
eYo.Scrollbar.prototype.setScrollViewSize_ = function(newSize) {
  this.scrollViewSize_ = newSize
  this.ui_driver.scrollbarUpdateView(this)
}

/**
 * Set the position of the scrollbar's SVG group in CSS pixels relative to the
 * scrollbar's origin.  This sets the scrollbar's location within the workspace.
 * @param {number} x The new x coordinate.
 * @param {number} y The new y coordinate.
 * @private
 */
eYo.Scrollbar.prototype.setPosition_ = function(x, y) {
  this.position_.x = x
  this.position_.y = y
  this.ui_driver.scrollbarPlace(this)
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
    hostMetrics = this.workspace_.getMetrics()
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
   * .viewHeight: Height of the visible rectangle,
   * .viewWidth: Width of the visible rectangle,
   * .contentHeight: Height of the contents,
   * .contentWidth: Width of the content,
   * .viewTop: Offset of top edge of visible rectangle from parent,
   * .viewLeft: Offset of left edge of visible rectangle from parent,
   * .contentTop: Offset of the top-most content from the y=0 coordinate,
   * .contentLeft: Offset of the left-most content from the x=0 coordinate,
   * .absoluteTop: Top-edge of view.
   * .absoluteLeft: Left-edge of view.
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
  var viewSize = hostMetrics.viewWidth - 1
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= eYo.Scrollbar.thickness
  }
  this.setScrollViewSize_(Math.max(0, viewSize))

  var xCoordinate = hostMetrics.absoluteLeft + 0.5
  // Horizontal toolbar should always be just above the bottom of the workspace.
  var yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight -
      eYo.Scrollbar.thickness - 0.5
  this.setPosition_(xCoordinate, yCoordinate)

  // If the view has been resized, a content resize will also be necessary.
  // The converse is not true.
  this.resizeContentHorizontal(hostMetrics)
};

/**
 * Recalculate a horizontal scrollbar's location within its path and length.
 * This should be called when the contents of the workspace have changed.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
eYo.Scrollbar.prototype.resizeContentHorizontal = function(hostMetrics) {
  if (!this.pair_) {
    // Only show the scrollbar if needed.
    // Ideally this would also apply to scrollbar pairs, but that's a bigger
    // headache (due to interactions with the corner square).
    this.setVisible(this.scrollViewSize_ < hostMetrics.contentWidth)
  }

  this.ratio_ = this.scrollViewSize_ / hostMetrics.contentWidth;
  if (this.ratio_ === -Infinity || this.ratio_ === Infinity ||
      isNaN(this.ratio_)) {
    this.ratio_ = 0
  }

  var handleLength = hostMetrics.viewWidth * this.ratio_
  this.setHandleLength_(Math.max(0, handleLength))

  var handlePosition = (hostMetrics.viewLeft - hostMetrics.contentLeft) *
      this.ratio_
  this.setHandlePosition(this.constrainHandle_(handlePosition))
}

/**
 * Is the scrollbar visible.  Non-paired scrollbars disappear when they aren't
 * needed.
 * @return {boolean} True if visible.
 */
eYo.Scrollbar.prototype.isVisible = function() {
  return this.isVisible_;
};

/**
 * Set whether the scrollbar's container is visible and update
 * display accordingly if visibility has changed.
 * @param {boolean} visible Whether the container is visible
 */
eYo.Scrollbar.prototype.setContainerVisible = function(visible) {
  var visibilityChanged = (visible != this.containerVisible_);

  this.containerVisible_ = visible;
  if (visibilityChanged) {
    this.updateDisplay_();
  }
};

/**
 * Set whether the scrollbar is visible.
 * Only applies to non-paired scrollbars.
 * @param {boolean} visible True if visible.
 */
eYo.Scrollbar.prototype.setVisible = function(visible) {
  var visibilityChanged = (visible != this.isVisible());

  // Ideally this would also apply to scrollbar pairs, but that's a bigger
  // headache (due to interactions with the corner square).
  if (this.pair_) {
    throw 'Unable to toggle visibility of paired scrollbars.';
  }
  this.isVisible_ = visible;
  if (visibilityChanged) {
    this.updateDisplay_();
  }
};

/**
 * Update visibility of scrollbar based on whether it thinks it should
 * be visible and whether its containing workspace is visible.
 * We cannot rely on the containing workspace being hidden to hide us
 * because it is not necessarily our parent in the DOM.
 */
eYo.Scrollbar.prototype.updateDisplay_ = function() {
  var show = true
  // Check whether our parent/container is visible.
  show = !this.containerVisible_
  ? false
  : this.isVisible()
  this.ui_driver.scrollbarUpdateDisplay(this, show)
}

/**
 * Scroll by one pageful.
 * Called when scrollbar background is clicked.
 * @param {!Event} e Mouse down event.
 * @private
 */
eYo.Scrollbar.prototype.onMouseDownBar_ = function(e) {
  this.workspace_.markFocused()
  this.workspace_.ui_driver.clearTouchIdentifier()  // This is really a click.
  this.cleanUp_()
  if (eYo.Dom.isRightButton(e)) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation()
    return
  }
  var mouseXY = eYo.utils.mouseToSvg(e, this.workspace_.getParentSvg(),
      this.workspace_.getInverseScreenCTM());
  var mouseLocation = this.horizontal_ ? mouseXY.x : mouseXY.y;

  var handleXY = eYo.utils.getInjectionDivXY_(this.svgHandle_);
  var handleStart = this.horizontal_ ? handleXY.x : handleXY.y;
  var handlePosition = this.handlePosition_;

  var pageLength = this.handleLength_ * 0.95;
  if (mouseLocation <= handleStart) {
    // Decrease the scrollbar's value by a page.
    handlePosition -= pageLength;
  } else if (mouseLocation >= handleStart + this.handleLength_) {
    // Increase the scrollbar's value by a page.
    handlePosition += pageLength;
  }

  this.setHandlePosition(this.constrainHandle_(handlePosition));

  this.didScroll_();
  eYo.Dom.gobbleEvent(e)
};

/**
 * Constrain the handle's position within the minimum (0) and maximum
 * (length of scrollbar) values allowed for the scrollbar.
 * @param {number} value Value that is potentially out of bounds, in CSS pixels.
 * @return {number} Constrained value, in CSS pixels.
 * @private
 */
eYo.Scrollbar.prototype.constrainHandle_ = function(value) {
  if (value <= 0 || isNaN(value) || this.scrollViewSize_ < this.handleLength_) {
    value = 0;
  } else {
    value = Math.min(value, this.scrollViewSize_ - this.handleLength_);
  }
  return value;
};

/**
 * Called when scrollbar has moved.
 * @private
 */
eYo.Scrollbar.prototype.didScroll_ = function() {
  var ratio = this.handlePosition_ / this.scrollViewSize_
  if (isNaN(ratio)) {
    ratio = 0
  }
  var xyRatio = {}
  xyRatio[this.horizontal_ ? 'x' : 'y'] = ratio
  this.workspace_.setMetrics(xyRatio)
}

/**
 * Set the scrollbar handle's position.
 * @param {number} value The distance from the top/left end of the bar, in CSS
 *     pixels.  It may be larger than the maximum allowable position of the
 *     scrollbar handle.
 */
eYo.Scrollbar.prototype.set = function(value) {
  this.setHandlePosition(this.constrainHandle_(value * this.ratio_))
  this.didScroll_()
}

/**
 * Record the origin of the workspace that the scrollbar is in, in pixels
 * relative to the injection div origin. This is for times when the scrollbar is
 * used in an object whose origin isn't the same as the main workspace
 * (e.g. in a flyout.)
 * @param {number} x The x coordinate of the scrollbar's origin, in CSS pixels.
 * @param {number} y The y coordinate of the scrollbar's origin, in CSS pixels.
 */
eYo.Scrollbar.prototype.setOrigin = function(x, y) {
  this.origin_ = new goog.math.Coordinate(x, y)
}

// /**
//  * Recalculate a vertical scrollbar's location on the screen and path length.
//  * This should be called when the layout or size of the window has changed.
//  * @param {!Object} hostMetrics A data structure describing all the
//  *     required dimensions, possibly fetched from the host object.
//  */
// eYo.Scrollbar.prototype.resizeViewVertical = function(hostMetrics) {
//   var viewSize = hostMetrics.viewHeight - 1;
//   if (this.pair_) {
//     // Shorten the scrollbar to make room for the corner square.
//     viewSize -= eYo.Scrollbar.thickness;
//   }
//   this.setScrollViewSize_(Math.max(0, viewSize));

//   var xCoordinate = hostMetrics.absoluteLeft + 0.5;
//   if (!this.workspace_.RTL) {
//     xCoordinate += hostMetrics.viewWidth -
//         eYo.Scrollbar.thickness - 1;
//   }
//   var yCoordinate = hostMetrics.absoluteTop + 0.5;
//   this.setPosition_(xCoordinate, yCoordinate);

//   // If the view has been resized, a content resize will also be necessary.  The
//   // reverse is not true.
//   this.resizeContentVertical(hostMetrics);
// };

// /**
//  * Recalculate a vertical scrollbar's location within its path and length.
//  * This should be called when the contents of the workspace have changed.
//  * @param {!Object} hostMetrics A data structure describing all the
//  *     required dimensions, possibly fetched from the host object.
//  */
// eYo.Scrollbar.prototype.resizeContentVertical = function(hostMetrics) {
//   if (!this.pair_) {
//     // Only show the scrollbar if needed.
//     this.setVisible(this.scrollViewSize_ < hostMetrics.contentHeight);
//   }

//   this.ratio_ = this.scrollViewSize_ / hostMetrics.contentHeight;
//   if (this.ratio_ == -Infinity || this.ratio_ == Infinity ||
//       isNaN(this.ratio_)) {
//     this.ratio_ = 0;
//   }

//   var handleLength = hostMetrics.viewHeight * this.ratio_;
//   this.setHandleLength_(Math.max(0, handleLength));

//   var handlePosition = (hostMetrics.viewTop - hostMetrics.contentTop) *
//       this.ratio_;
//   this.setHandlePosition(this.constrainHandle_(handlePosition));
// };


/**
 * Recalculate a horizontal scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * Edython: position and resize according to the position of the flyout.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
eYo.Scrollbar.prototype.resizeViewHorizontal = function(hostMetrics) {
  var workspace = this.workspace_
  var flyout = workspace.flyout_
  if (flyout && flyout.atRight) {
    var xy = flyout.positionInPixels
    var viewSize = xy.x - hostMetrics.absoluteLeft - 1
  } else {
    viewSize = hostMetrics.viewWidth - 1
  }
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= eYo.Scrollbar.thickness;
  }
  this.setScrollViewSize_(Math.max(0, viewSize));

  var xCoordinate = hostMetrics.absoluteLeft + 0.5;
  
  // Horizontal toolbar should always be just above the bottom of the workspace.
  var yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight -
      eYo.Scrollbar.thickness - 0.5;
  this.setPosition_(xCoordinate, yCoordinate);

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
  var viewSize = hostMetrics.viewHeight - 1;
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= eYo.Scrollbar.thickness;
  }
  var workspace = this.workspace_
  var flyout = workspace.flyout_
  if (flyout && flyout.atRight) {
    var xy = flyout.positionInPixels
    var yOffset = flyout.TOP_OFFSET
  } else {
    yOffset = 1 * eYo.Unit.rem
  }
  viewSize -= yOffset
  this.setScrollViewSize_(Math.max(0, viewSize));

  if (xy) {
    var xCoordinate = xy.x - hostMetrics.absoluteLeft -     eYo.Scrollbar.thickness - 0.5
  } else {
    xCoordinate = hostMetrics.absoluteLeft + 0.5;
    xCoordinate += hostMetrics.viewWidth -
        eYo.Scrollbar.thickness - 1
  }
  var yCoordinate = hostMetrics.absoluteTop + 0.5
  yCoordinate += yOffset
  this.setPosition_(xCoordinate, yCoordinate)

  // If the view has been resized, a content resize will also be necessary.
  // The converse is not true.
  this.resizeContentVertical(hostMetrics)
}
