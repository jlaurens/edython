/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Template.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('Pane')

eYo.require('Decorate')
eYo.provide('Template')

/**
 * Class for a template environment.
 * To be subclassed.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.C9r.UI.makeClass('Template', eYo.Pane)

/**
 * Update the metrics of the receiver.
 */
eYo.Template.prototype.updateMetrics = function () {
  this.ui_driver.updateMetrics(this)
}

/**
 * Place the receiver.
 */
eYo.Template.prototype.place = function () {
  this.ui_driver.place(this)
}
