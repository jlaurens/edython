/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Graphic environment.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.require('eYo.Pane')

goog.require('eYo.Decorate')
goog.provide('eYo.Graphic')

/**
 * Class for a graphic environment.
 * @param {!eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.Graphic = function(owner) {
  eYo.Graphic.superClass_.constructor.call(this, owner)
}
goog.inherits(eYo.Graphic, eYo.Pane)

/**
 * Make the user interface.
 */
eYo.Graphic.prototype.initUI = eYo.Decorate.makeInitUI(
  eYo.Graphic,
  function() {
    this.driver.graphicInit(this)
  }
)

/**
 * Dispose of UI resources.
 */
eYo.Decorate.makeDisposeUI(
  eYo.Graphic,
  function() {
    this.driver.graphicDispose(this)
  }
)

/**
 * Update the metrics of the receiver.
 */
eYo.Graphic.prototype.updateMetrics = function () {
  this.ui_driver_mgr.graphicUpdateMetrics()
}

/**
 * Place the receiver.
 */
eYo.Graphic.prototype.place = function () {
  this.ui_driver_mgr.graphicPlace()
}
