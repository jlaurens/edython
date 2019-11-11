/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Variable inspector.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Variable')

goog.require('eYo.Pane')
goog.require('eYo.Decorate')

/**
 * Class for a variable inspector.
 * @param {!eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.Variable = function(owner) {
  eYo.Turtle.superClass_.constructor.call(this, owner)
}
goog.inherits(eYo.Variable, eYo.Pane)

/**
 * Make the user interface.
 */
eYo.Variable.prototype.initUI = eYo.Decorate.makeInitUI(
  eYo.Variable,
  function() {
    this.driver.variableInit(this)
  }
)

/**
 * Dispose of UI resources.
 */
eYo.Decorate.makeDisposeUI(
  eYo.Variable,
  function() {
    this.driver.variableDispose(this)
  }
)

/**
 * Update the metrics of the receiver.
 */
eYo.Variable.prototype.updateMetrics = function () {
  this.ui_driver_mgr.variableUpdateMetrics()
}

/**
 * Place the receiver.
 */
eYo.Variable.prototype.place = function () {
  this.ui_driver_mgr.variablePlace()
}
