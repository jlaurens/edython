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
 * @name {eYo.view.Template}
 * Class for a template environment.
 * To be subclassed.
 * @param {eYo.view.Desk} owner Owner desk.
 * @constructor
 */
eYo.view.makeC9r('Template')

/**
 * Update the metrics of the receiver.
 */
eYo.view.Template_p.updateMetrics = function () {
  this.ui_driver.updateMetrics(this)
}

/**
 * Place the receiver.
 */
eYo.view.Template_p.place = function () {
  this.ui_driver.place(this)
}
