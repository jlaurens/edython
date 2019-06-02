/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Factory model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Factory')

goog.require('eYo')

goog.forwardDeclare('goog.array');
goog.forwardDeclare('goog.math');

goog.forwardDeclare('eYo.Desktop')
goog.forwardDeclare('eYo.Options')


/**
 * Class for a factory.
 * This is the structure above the desk and the flyout.
 * @param {?Object=} options Dictionary of options.
 * @constructor
 */
eYo.Factory = function(options) {
  /** @type {!eYo.Options} */
  options = new eYo.Options(options || {})
  // Load CSS.
  eYo.Css.inject(options.hasCss, options.pathToMedia)
  this.options_ = options
  // create the various desks and flyout
  this.mainDesk_ = new eYo.Desk(this, options)
}

Object.defineProperties(eYo.Factory.prototype, {
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
  mainDesk: {
    get () {
      return this.mainDesk_
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
 * Class for a factory. This is the structure above the desk.
 * @param {?eYo.Options=} options Dictionary of options.
 * @constructor
 */
eYo.Factory.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  delete this.deleteUI
  this.audio_ = new eYo.Audio(this.options.pathToMedia)
  this.ui_driver_ = new eYo.Svg(this)
  this.ui_driver_.factoryInit(this)
  this.mainDesk_.makeUI()
}

/**
 * Dispose of UI resources.
 */
eYo.Factory.prototype.disposeUI = function() {
  delete this.makeUI
  this.mainDesk_ && this.mainDesk_.disposeUI()
  this.audio_.dispose()
  this.audio_ = null
  this.flyout_ && this.flyout_.disposeUI()
  this.flyoutDesk_ && this.flyoutDesk_.disposeUI()
  this.ui_driver_ && this.ui_driver_.dispose()
  this.ui_driver_ = null
}

/**
 * Dispose of this factory.
 */
eYo.Factory.prototype.dispose = function() {
  if (this.flyout_) {
    this.mainDesk_.flyout = null
    this.flyout_.dispose()
    this.flyout_ = null
  }
  if (this.flyoutDesk_) {
    this.flyoutDesk_.dispose()
    this.flyoutDesk_ = null
  }
  if (this.mainDesk_) {
    this.mainDesk_.dispose()
    this.mainDesk_ = null
  }
}

/**
 * Add a flyout.
 * @param {!Object} switcher  See eYo.FlyoutToolbar constructor.
 */
eYo.Factory.prototype.addFlyout = function(switcher) {
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
  var space = this.flyoutDesk_ = new eYo.Desk(this, options)
  space.options = this.mainDesk_.options
  var flyout = this.flyout_ = new eYo.Flyout(this, space, flyoutOptions)
  flyout.desk = this.flyoutDesk_
  flyout.targetDesk = this.mainDesk_
}

/**
 * Remove a previously added flyout.
*/
eYo.Factory.prototype.removeFlyout = function() {
  var x = this.flyout_
  if (x) {
    this.flyout_ = null
    this.mainDesk_.flyout = null
    x.dispose()

  }
}

/**
 * Size the main desk to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
*/
eYo.Factory.prototype.resize = function() {
  this.ui_driver_.factoryResize(this)
}

/**
 * Size the main desk to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
*/
eYo.Factory.prototype.xyElementInFactory = function(element) {
  return this.ui_driver_.factoryXYElement(this, element)
}
