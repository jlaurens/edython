/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Terminal model.
 * The terminal is used to execute (python) code.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Terminal')

goog.require('eYo.Pane')
goog.require('eYo.Decorate')

/**
 * Class for a terminal.
 * @param {!eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.Terminal = function(owner) {
  eYo.Terminal.superClass_.constructor.call(this, owner)
}
goog.inherits(eYo.Terminal, eYo.Pane)

/**
 * Make the user interface.
 */
eYo.Terminal.prototype.makeUI = eYo.Decorate.makeUI(
  eYo.Terminal,
  function() {
    this.driver.terminalInit(this)
  }
)

/**
 * Dispose of UI resources.
 */
eYo.Terminal.prototype.disposeUI = eYo.Decorate.disposeUI(
  eYo.Terminal,
  function() {
    this.driver.terminalDispose(this)
  }
)

/**
 * Update the metrics of the receiver.
 */
eYo.Terminal.prototype.updateMetrics = function () {
  this.ui_driver_mgr.terminalUpdateMetrics()
}

/**
 * Place the receiver.
 */
eYo.Terminal.prototype.place = function () {
  this.ui_driver_mgr.terminalPlace()
}
