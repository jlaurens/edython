/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Zoomer.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.require('eYo.WorkspaceControl')

goog.provide('eYo.Zoomer')

/**
 * Zoom controls model
 * @param {!eYo.Workspace} workspace Workspace to zoom.
 * @constructor
 */
eYo.Zoomer = function(workspace) {
  eYo.Zoomer.superClass_.constructor.call(this, workspace)
}
goog.inherits(eYo.Zoomer, eYo.WorkspaceControl)

Object.defineProperties(eYo.Zoomer.prototype, {
  HEIGHT_: { value: 110 },
})

/**
 * Create the zoom controls UI at above the given bottom.
 * @param {Number} bottom
 */
eYo.Zoomer.prototype.initUI = eYo.Decorate.makeInitUI(eYo.Zoomer, function() {
  this.ui_driver_mgr.initUI(this)
})

/**
 * Create the zoom controls.
 * @return {!Element} The zoom controls SVG group.
 */
eYo.Decorate.makeDisposeUI(
  eYo.Zoomer,
  function() {
    this.ui_driver_mgr.disposeUI(this)
  }
)

/**
 * Move the zoom controls to the bottom-right corner.
 * @param {Number} bottom
 */
eYo.Zoomer.prototype.place = function(bottom) {
  eYo.Zoomer.superClass_.place.call(this, bottom)
  this.ui_driver_mgr.place(this)
}
