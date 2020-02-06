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

eYo.require('decorate')

/**
 * @name {eYo.pane.Template}
 * Class for a template environment.
 * To be subclassed.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.pane.makeC9r('Template')

/**
 * Update the metrics of the receiver.
 */
eYo.pane.Template_p.updateMetrics = function () {
  this.ui_driver.updateMetrics(this)
}

/**
 * Place the receiver.
 */
eYo.pane.Template_p.place = function () {
  this.ui_driver.place(this)
}
