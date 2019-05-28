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


/**
 * Class for a factory.
 * This is the structure above the workspace and the flyout.
 * @param {?Object=} options Dictionary of options.
 * @constructor
 */
eYo.Factory = function(options) {
  /** @type {!Blockly.Options} */
  options = new Blockly.Options(options || {})
  // Load CSS.
  Blockly.Css.inject(options.hasCss, options.pathToMedia)
  this.options_ = options
  this.audio_ = new eYo.Audio(options.pathToMedia)

  // create the various workspaces and flyout
  var mainSpace = this.mainSpace_ = new eYo.Workspace(this, options)
}

Object.defineProperties(eYo.Factory.prototype, {
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
})

/**
 * Class for a factory. This is the structure above the workspace.
 * @param {?Blockly.Options=} options Dictionary of options.
 * @constructor
 */
eYo.Factory.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  delete this.deleteUI
  this.ui_driver = new eYo.Svg(this)
  this.ui_driver.factoryInit(this)
  this.mainSpace_.makeUI()
}

/**
 * Dispose of UI resources.
 */
eYo.Factory.prototype.disposeUI = function() {
  delete this.makeUI
  this.mainSpace_ && this.mainSpace_.disposeUI()
  this.flyout_ && this.flyout_.disposeUI()
  this.flyoutSpace_ && this.flyoutSpace_.disposeUI()
  this.ui_driver = null
}

/**
 * Dispose of this factory.
 */
eYo.Factory.prototype.dispose = function() {
  if (this.flyout_) {
    this.mainSpace_.flyout = null
    this.flyout_.dispose()
    this.flyout_ = null
  }
  if (this.flyoutSpace_) {
    this.flyoutSpace_.dispose()
    this.flyoutSpace_ = null
  }
  if (this.mainSpace_) {
    this.mainSpace_.dispose()
    this.mainSpace_ = null
  }
}


/**
 * Add a flyout element in an element with the given tag name.
 * @param {!Object} switcher  See eYo.FlyoutToolbar constructor.
 */
eYo.Factory.prototype.addFlyout = function(switcher) {
  var flyoutOptions = {
    flyoutAnchor: this.options.flyoutAnchor,
    switcher: switcher
  }
  /**
  * @type {!eYo.Flyout}
  * @private
  */
  var flyout = this.flyout = new eYo.Flyout(this, flyoutOptions)
  var options = {
    getMetrics: flyout.getMetrics_.bind(flyout),
    setMetrics: flyout.setMetrics_.bind(flyout),
  }
  var space = this.flyoutSpace_ = new eYo.Workspace(this, options)
  space.options = this.mainSpace_.options
  this.mainSpace_.flyout = flyout
  space.targetSpace_ = this.mainSpace_
}
