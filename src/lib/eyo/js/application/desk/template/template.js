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

goog.require('eYo.Pane')

goog.require('eYo.Decorate')
goog.provide('eYo.Template')

/**
 * Class for a template environment.
 * To be subclassed.
 * @param {!eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.UI.Constructor.make({
  key: 'Template',
  owner: eYo,
  super: eYo.Pane,
})
eYo.Template = function(owner) {
  eYo.Template.superClass_.constructor.call(this, owner)
}
goog.inherits(eYo.Template, eYo.Pane)

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
