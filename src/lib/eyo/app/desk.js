/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Desk model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Desk')

goog.require('eYo')

goog.forwardDeclare('goog.array');
goog.forwardDeclare('goog.math');

goog.forwardDeclare('eYo.Desktop')
goog.forwardDeclare('eYo.Options')


/**
 * Class for a desk.
 * This is the structure above the board and the flyout.
 * @param {?Object=} options Dictionary of options.
 * @constructor
 */
eYo.Desk = function(options) {
  /** @type {!eYo.Options} */
  options = new eYo.Options(options || {})
  // Load CSS.
  eYo.Css.inject(options.hasCss, options.pathToMedia)
  this.options_ = options
  // create the various boards and flyout
  this.board_ = new eYo.Board(this, options)
  this.viewRect_ = new eYo.Rect()
}

Object.defineProperties(eYo.Desk.prototype, {
  /**
   * Convenient property.
   */
  desk: {
    get () {
      return this
    }
  },
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
  /**
   * The owned main board instance.
   */
  board: {
    get () {
      return this.board_
    }
  },
  /**
   * The onwed flyout instance, eventually.
   */
  flyout: {
    get () {
      return this.flyout_
    }
  },
  ui_driver: {
    get () {
      return this.ui_driver_
    }
  },
  /**
   * The view rectangle
   */
  viewRect: {
    get () {
      return this.viewRect_.clone
    },
    /**
     * Actually set from a `div` object.
     */
    set (newValue) {
      this.viewRect_.set(newValue)
    }
  },
  /**
   * The owned audio manager.
   */
  audio: {
    get () {
      return this.audio_
    }
  },
  options: {
    get () {
      return this.options_
    }
  },
})

/**
 * Class for a desk. This is the structure above the board.
 * @param {?eYo.Options=} options Dictionary of options.
 * @constructor
 */
eYo.Desk.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  delete this.deleteUI
  this.audio_ = new eYo.Audio(this.options.pathToMedia)
  var d = this.ui_driver_ = new eYo.Svg(this)
  d.deskInit(this)
  this.board_.makeUI()
  this.willFlyout_ && this.addFlyout()
  this.layout()
}

/**
 * Dispose of UI resources.
 */
eYo.Desk.prototype.disposeUI = function() {
  delete this.makeUI
  this.board_ && this.board_.disposeUI()
  this.audio_.dispose()
  this.audio_ = null
  this.flyout_ && this.flyout_.disposeUI()
  this.ui_driver_ && this.ui_driver_.dispose()
  this.ui_driver_ = null
}

/**
 * Dispose of this desk.
 */
eYo.Desk.prototype.dispose = function() {
  if (this.flyout_) {
    this.board_.flyout = null
    this.flyout_.dispose()
    this.flyout_ = null
  }
  if (this.board_) {
    this.board_.dispose()
    this.board_ = null
  }
}

/**
 * Update metrics. Sent on document's resize and other occasions.
 * The size and location of the view may change due to user interaction,
 * for example a window resize, a pane resize.
 * The driver updates the internal state accordingly.
 * The desk's metrics are supposed to be up to date first, then the
 * other metrics are set up in cascade in next order.
 * 1) the desk injection div is queried for its size and location.
 *    This gives the desk viewRect.
 * 2) Then the main board dimensions.
 * 3) the flyout's div viewRect and its board as side effect.
 
 */
eYo.Desk.prototype.updateMetrics = function() {
  this.ui_driver.deskUpdateMetrics(this)
  this.board_.updateMetrics()
  this.flyout_ && this.flyout_.updateMetrics()
}

/**
 * Update the metrics and place the components accordingly.
 */
eYo.Desk.prototype.layout = function() {
  this.updateMetrics()
  this.place()
}

/**
 * Place the board and the flyout.
 */
eYo.Desk.prototype.place = function() {
  this.ui_driver.deskPlace(this)
  this.board_.place()
  this.flyout_ && this.flyout_.place()
}

/**
 * Add a flyout.
 * @param {!Object} switcher  See eYo.FlyoutToolbar constructor.
 */
eYo.Desk.prototype.addFlyout = function(switcher) {
  if (!this.hasUI) {
    this.willFlyout_ = true
    return
  }
  delete this.willFlyout_
  var flyoutOptions = {
    flyoutAnchor: this.options.flyoutAnchor,
    switcher: switcher
  }
  var flyout = this.flyout_ = new eYo.Flyout(this, flyoutOptions)
  flyout.targetBoard = this.board_
  this.ui_driver.deskInstallFlyout(this)
}

/**
 * Remove a previously added flyout.
*/
eYo.Desk.prototype.removeFlyout = function() {
  var x = this.flyout_
  if (x) {
    this.flyout_ = null
    this.board_.flyout = null
    x.dispose()
  }
}

/**
 * Size the main board to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
 * @return {eYo.Where}
 */
eYo.Desk.prototype.xyElementInDesk = function(element) {
  return this.ui_driver_.deskWhereElement(this, element)
}
