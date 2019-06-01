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
 * This is the structure above the workspace and the flyout.
 * @param {?Object=} options Dictionary of options.
 * @constructor
 */
eYo.Factory = function(options) {
  /** @type {!eYo.Options} */
  options = new eYo.Options(options || {})
  // Load CSS.
  eYo.Css.inject(options.hasCss, options.pathToMedia)
  this.options_ = options
  // create the various workspaces and flyout
  this.mainWorkspace_ = new eYo.Workspace(this, options)
}

Object.defineProperties(eYo.Factory.prototype, {
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
  mainWorkspace: {
    get () {
      return this.mainWorkspace_
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
 * Class for a factory. This is the structure above the workspace.
 * @param {?eYo.Options=} options Dictionary of options.
 * @constructor
 */
eYo.Factory.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  delete this.deleteUI
  this.audio_ = new eYo.Audio(this.options.pathToMedia)
  this.ui_driver_ = new eYo.Svg(this)
  this.ui_driver_.factoryInit(this)
  this.mainWorkspace_.makeUI()
}

/**
 * Dispose of UI resources.
 */
eYo.Factory.prototype.disposeUI = function() {
  delete this.makeUI
  this.mainWorkspace_ && this.mainWorkspace_.disposeUI()
  this.audio_.dispose()
  this.audio_ = null
  this.flyout_ && this.flyout_.disposeUI()
  this.flyoutSpace_ && this.flyoutSpace_.disposeUI()
  this.ui_driver_ && this.ui_driver_.dispose()
  this.ui_driver_ = null
}

/**
 * Dispose of this factory.
 */
eYo.Factory.prototype.dispose = function() {
  if (this.flyout_) {
    this.mainWorkspace_.flyout = null
    this.flyout_.dispose()
    this.flyout_ = null
  }
  if (this.flyoutSpace_) {
    this.flyoutSpace_.dispose()
    this.flyoutSpace_ = null
  }
  if (this.mainWorkspace_) {
    this.mainWorkspace_.dispose()
    this.mainWorkspace_ = null
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
  var space = this.flyoutSpace_ = new eYo.Workspace(this, options)
  space.options = this.mainWorkspace_.options
  var flyout = this.flyout_ = new eYo.Flyout(this, space, flyoutOptions)
  flyout.workspace = this.flyoutSpace_
  flyout.targetWorkspace = this.mainWorkspace_
}

/**
 * Remove a previously added flyout.
*/
eYo.Factory.prototype.removeFlyout = function() {
  var x = this.flyout_
  if (x) {
    this.flyout_ = null
    this.mainWorkspace_.flyout = null
    x.dispose()

  }
}

/**
 * Size the main workspace to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
*/
eYo.Factory.prototype.resize = function() {
  this.ui_driver_.factoryResize(this)
}

/**
 * Size the main workspace to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
*/
eYo.Factory.prototype.xyElementInFactory = function(element) {
  this.ui_driver_.factoryXYElement(this, element)
}
