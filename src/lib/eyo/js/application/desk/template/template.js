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

eYo.require('C9r.Pane')

eYo.require('Decorate')

/**
 * @name {eYo.Template}
 * Class for a template environment.
 * To be subclassed.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.makeClass('Template', eYo.C9r.Pane)

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
