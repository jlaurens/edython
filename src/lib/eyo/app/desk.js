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

goog.forwardDeclare('eYo.Boardtop')
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
  this.mainBoard_ = new eYo.Board(this, options)
}

Object.defineProperties(eYo.Desk.prototype, {
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
  mainBoard: {
    get () {
      return this.mainBoard_
    }
  },
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
  this.ui_driver_ = new eYo.Svg(this)
  this.ui_driver_.deskInit(this)
  this.mainBoard_.makeUI()
}

/**
 * Dispose of UI resources.
 */
eYo.Desk.prototype.disposeUI = function() {
  delete this.makeUI
  this.mainBoard_ && this.mainBoard_.disposeUI()
  this.audio_.dispose()
  this.audio_ = null
  this.flyout_ && this.flyout_.disposeUI()
  this.flyoutBoard_ && this.flyoutBoard_.disposeUI()
  this.ui_driver_ && this.ui_driver_.dispose()
  this.ui_driver_ = null
}

/**
 * Dispose of this desk.
 */
eYo.Desk.prototype.dispose = function() {
  if (this.flyout_) {
    this.mainBoard_.flyout = null
    this.flyout_.dispose()
    this.flyout_ = null
  }
  if (this.flyoutBoard_) {
    this.flyoutBoard_.dispose()
    this.flyoutBoard_ = null
  }
  if (this.mainBoard_) {
    this.mainBoard_.dispose()
    this.mainBoard_ = null
  }
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
  /**
  * @type {!eYo.Flyout}
  * @private
  */
  var options = {
    getMetrics: flyout.getMetrics_.bind(flyout),
    setMetrics: flyout.setMetrics_.bind(flyout),
  }
  var space = this.flyoutBoard_ = new eYo.Board(this, options)
  space.options = this.mainBoard_.options
  var flyout = this.flyout_ = new eYo.Flyout(this, space, flyoutOptions)
  flyout.board = this.flyoutBoard_
  flyout.targetBoard = this.mainBoard_
}

/**
 * Remove a previously added flyout.
*/
eYo.Desk.prototype.removeFlyout = function() {
  var x = this.flyout_
  if (x) {
    this.flyout_ = null
    this.mainBoard_.flyout = null
    x.dispose()

  }
}

/**
 * Size the main board to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
*/
eYo.Desk.prototype.resize = function() {
  this.ui_driver_.deskResize(this)
}

/**
 * Size the main board to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
*/
eYo.Desk.prototype.xyElementInDesk = function(element) {
  return this.ui_driver_.deskXYElement(this, element)
}
