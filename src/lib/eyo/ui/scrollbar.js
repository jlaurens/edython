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

goog.provide('eYo.ScrollbarPair')

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
    this,
    'eyo-main-board-scrollbar'
  )
  this.vScroll = new eYo.Scrollbar(
    board,
    false,
    this,
    'eyo-main-board-scrollbar'
  )
  this.cornerRect_ = new eYo.Rect()
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
eYo.ScrollbarPair.prototype.oldMetrics_ = null;

/**
 * Dispose of this pair of scrollbars.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.ScrollbarPair.prototype.dispose = function() {
  this.disposeUI()
  this.board_ = null
  this.oldMetrics_ = null
  this.hScroll.dispose()
  this.hScroll = null
  this.vScroll.dispose()
  this.vScroll = null
  this.cornerRect_.dispose()
  this.cornerRect_ = null
}

/**
 * Recalculate both of the scrollbars' locations and lengths.
 * Also reposition the corner rectangle.
 */
eYo.ScrollbarPair.prototype.resize = function() {
  // Look up the host metrics once, and use for both scrollbars.
  var hostMetrics = this.board_.metrics
  if (!hostMetrics) {
    // Host element is likely not visible. Not any longer
    return
  }
  // In order to resize properly, cross visibility is required
  this.hScroll.resize(hostMetrics, true)
  this.vScroll.resize(hostMetrics, true)
  this.hScroll.resize(hostMetrics, false)
  this.vScroll.resize(hostMetrics, false)
  // resize the corner
  var r = this.cornerRect_
  var rr = this.vScroll.viewRect
  r.left = rr.left
  r.right = rr.right
  rr = this.hScroll.viewRect
  r.top = rr.top
  r.bottom = rr.bottom
  // Reposition the corner square.
  this.ui_driver.scrollbarPairPlaceCorner(this)
}

/**
 * Set the handles of both scrollbars to be at a certain position in CSS pixels
 * relative to their parents.
 * @param {eYo.Where} xy
 */
eYo.ScrollbarPair.prototype.set = (() => {
  /*
   * Helper to calculate the ratio of handle position to scrollbar view size.
   * @param {number} handlePosition_ The value of the handle.
   * @param {number} viewSize The total size of the scrollbar's view.
   * @return {number} Ratio.
   * @private
   */
  var getRatio = function(handlePosition_, viewSize) {
    var ratio = handlePosition_ / viewSize
    return isNaN(ratio) ? 0 : ratio
  }
  return function(xy) {
    var xyRatio = new eYo.Where()

    var hHandlePosition = xy.x * this.hScroll.handleLength_
    var vHandlePosition = xy.y * this.vScroll.handleLength_

    var hLength = this.hScroll.viewLength_
    var vLength = this.vScroll.viewLength_

    xyRatio.x = getRatio(hHandlePosition, hLength)
    xyRatio.y = getRatio(vHandlePosition, vLength)
    this.board_.doRelativeScroll(xyRatio)
  }
})()

/**
 * Stop binding to mouseup and mousemove events.  Call this to
 * wrap up lose ends associated with the scrollbar.
 * @private
 */
eYo.ScrollbarPair.prototype.place = function() {
  var s
  ;(s = this.hScroll) && s.place()
  ;(s = this.vScroll) && s.place()
}

// --------------------------------------------------------------------

/**
 * Class for a pure SVG scrollbar.
 * This technique offers a scrollbar that is guaranteed to work, but may not
 * look or behave like the system's scrollbars.
 * @param {!eYo.Board} board Board to bind the scrollbar to.
 * @param {boolean} horizontal True if horizontal, false if vertical.
 * @param {?eYo.ScrollbarPair} opt_pair True if scrollbar is part of a horiz/vert pair.
 * @param {string=} opt_class A class to be applied to this scrollbar.
 * @constructor
 */
eYo.Scrollbar = function(board, horizontal, opt_pair, opt_class) {
  this.disposeUI = eYo.Do.nothing
  this.board_ = board
  this.pair_ = opt_pair
  this.horizontal_ = horizontal
  this.viewRect_ = new eYo.Rect()
  this.oldMetrics_ = null
  board.hasUI && this.makeUI(opt_class)
}

Object.defineProperties(eYo.Scrollbar, {
  /**
   * Width of vertical scrollbar or height of horizontal scrollbar in CSS pixels.
   * Scrollbars should be larger on touch devices.
   */
  thickness: {
    value: goog.events.BrowserFeature.TOUCH_ENABLED ? 26 : 16
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
  viewRect: {
    /**
     * The view rectangle
     * @type {eYo.Rect}
     * @readonly
     */
    get () {
      return this.viewRect_.clone
    },
    /**
     * Record the origin of the board that the scrollbar is in, in pixels
     * relative to the injection div origin. This is for times when the scrollbar is
     * used in an object whose origin isn't the same as the main board
     * (e.g. in a flyout.)
     * @param {eYo.Where} newOrigin The coordinates of the scrollbar's origin, in CSS pixels.
     */
    set (newValue) {
      this.viewRect_.set(newValue)
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
  dragStart_: {
    value: 0,
    writable: true
  },
  /**
   * The length of the scrollbar handle in CSS pixels.
   * @type {number}
   * @private
   */
  handleLength__: {
    value: 0,
    writable: true
  },
  /**
   * The offset of the start of the handle from the scrollbar position, in CSS
   * pixels.
   * @type {number}
   * @private
   */
  handlePosition__: {
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
    get () {
      return this.handlePosition__
    },
    /**
     * Set the offset of the scrollbar's handle from the scrollbar's position, and
     * change the SVG attribute accordingly.
     * @param {number} newPosition The new scrollbar handle offset in CSS pixels.
     */
    set (newValue) {
      if (newValue <= 0 || isNaN(newValue) || this.viewLength_ < this.handleLength_) {
        newValue = 0
      } else {
        newValue = Math.min(newValue, this.viewLength_ - this.handleLength_)
      }
      if (this.handlePosition__ !== newValue) {
        this.handlePosition__ = newValue
        this.ui_driver.scrollbarUpdateHandle(this)
      }
    }
  },
  handleLength_: {
    get () {
      return this.handleLength__
    },
    /**
     * Set the length of the scrollbar's handle and change the SVG attribute
     * accordingly.
     * @param {number} newLength The new scrollbar handle length in CSS pixels.
     */
    set (newValue) {
      newValue = Math.min(Math.max(0, newValue), this.viewLength_)
      if (newValue !== this.handleLength__) {
        this.handleLength__ = newValue
        if (this.handlePosition__ + newValue > this.viewLength_) {
          this.handlePosition__ = this.viewLength_ - newValue
        }
        this.ui_driver.scrollbarUpdateView(this)
      }
    }
  },
  viewLength_: {
    get () {
      var size = this.viewRect_.size
      return this.horizontal_ ? size.width : size.height
    },
    /**
     * Set the size of the scrollbar's background and change the SVG attribute
     * accordingly.
     * @param {number} newSize The new scrollbar background length in CSS pixels.
     * @private
     */
    set (newValue) {
      newValue = Math.max(0, newValue)
      var old = this.viewLength_
      if (newValue !== old) {
        var ratio = old ? newValue / old : 1
        var size = this.viewRect_.size
        this.horizontal_
        ? (size.width = newValue)
        : (size.height = newValue)
        this.handlePosition__ *= ratio
        this.handleLength__ *= ratio
        this.ui_driver.scrollbarUpdateView(this)
      }
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
 * Dispose of this scrollbar and sever the links.
 */
eYo.Scrollbar.prototype.dispose = function() {
  this.disposeUI()
  this.board_ = null
  this.pair_ = null
}

/**
 * Recalculate the scrollbar's location and its length.
 * When `prepare` is true, updates the visibility status, when `false` it does not.
 * @param {Object=} opt_metrics A data structure of from the describing all the
 * required dimensions.  If not provided, it will be fetched from the host
 * object.
 * @param{?Boolean} prepare  True when prepare only.
 */
eYo.Scrollbar.prototype.resize = function(hostMetrics, prepare) {
  if (this.horizontal_) {
    this.resizeHorizontal(hostMetrics, prepare)
  } else {
    this.resizeVertical(hostMetrics, prepare)
  }
  this.place()
}

/**
 * Recalculate a horizontal scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 * @param {?Boolean} prepare  True when only preparing.
 */
eYo.Scrollbar.prototype.resizeHorizontal = function(hostMetrics, prepare) {
  var view = hostMetrics.view
  var content = hostMetrics.content
  var range = content.width - view.width
  if (prepare !== false) {
    this.visible = (view.width > this.pair_
    ? 2 * eYo.Scrollbar.thickness
    : eYo.Scrollbar.thickness) && (this.pair_ || range > 0)
    if (prepare) {
      return
    }
  }
  var oldMetrics = this.oldMetrics_
  if (!oldMetrics
    || oldMetrics.scroll.x != hostMetrics.scroll.x
    || oldMetrics.view.width != view.width
    || oldMetrics.content.width != content.width) {
    // The window has been resized or repositioned.
    this.oldMetrics_ = hostMetrics
    var r = this.viewRect_
    r.left = view.left
    r.right = this.pair_ && this.pair_.vScroll.visible ? view.right - eYo.Scrollbar.thickness : view.right
    r.top = (r.bottom = view.bottom) - eYo.Scrollbar.thickness
    r.xyInset(0.5)
    // resize the content
    this.handleLength_ = view.width / content.width * r.width
    if (this.handleLength_ === -Infinity || this.handleLength_ === Infinity ||
        isNaN(this.handleLength_)) {
      this.handleLength_ = 0
    }
    // view.x_max - content.x_max <= scroll.x <= view.x_min - content.x_min
    if (range > 0) {
      this.handlePosition_ = (scroll.x - view.x_max + content.x_max) / range * (r.width - this.handleLength_)
    } else {
      this.handlePosition_ = r.width / 2
    }
  }
}

/**
 * Recalculate a vertical scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 * @param {?Boolean} prepare  True when preparing.
 */
eYo.Scrollbar.prototype.resizeVertical = function(hostMetrics, prepare) {
  var view = hostMetrics.view
  var content = hostMetrics.content
  var range = content.height - view.height
  if (prepare !== false) {
    this.visible = (view.height > this.pair_
    ? 2 * eYo.Scrollbar.thickness
    : eYo.Scrollbar.thickness) && (this.pair_ || range > 0)
    if (prepare) {
      return
    }
  }
  var oldMetrics = this.oldMetrics_
  if (!oldMetrics
    || oldMetrics.scroll.y != hostMetrics.scroll.y
    || oldMetrics.view.height != view.height
    || oldMetrics.content.height != content.height) {
    // The window has been resized or repositioned.
    this.oldMetrics_ = hostMetrics
    var r = this.viewRect_
    r.top = view.top
    r.bottom = this.pair_ && this.pair_.hScroll.visible ? view.bottom - eYo.Scrollbar.thickness : view.bottom
    r.top = (r.bottom = view.bottom) - eYo.Scrollbar.thickness
    r.xyInset(0.5)
    // resize the content
    this.handleLength_ = view.height / content.height * r.height
    if (this.handleLength_ === -Infinity || this.handleLength_ === Infinity ||
        isNaN(this.handleLength_)) {
      this.handleLength_ = 0
    }
    // view.y_max - content.y_max <= scroll.y <= view.y_min - content.y_min
    if (range > 0) {
      this.handlePosition_ = (scroll.y - view.y_max + content.y_max) / range * (r.height - this.handleLength_)
    } else {
      this.handlePosition_ = r.height / 2
    }
  }
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
 * Set the scrollbar handle's position.
 * @param {number} value The distance from the top/left end of the bar, in CSS
 *     pixels.  It may be larger than the maximum allowable position of the
 *     scrollbar handle.
 */
eYo.Scrollbar.prototype.set = function(value) {
  var v = value[this.horizontal_ ? 'x' : 'y']
  this.handlePosition_ = (v || value) * this.handleLength_
}

/**
 * Stop binding to mouseup and mousemove events.  Call this to
 * wrap up lose ends associated with the scrollbar.
 * @private
 */
eYo.Scrollbar.prototype.cleanUp_ = function() {
  this.ui_driver.scrollbarCleanUp(this)
}

/**
 * Stop binding to mouseup and mousemove events.  Call this to
 * wrap up lose ends associated with the scrollbar.
 * @private
 */
eYo.Scrollbar.prototype.place = function() {
  this.ui_driver.scrollbarPlace(this)
}

