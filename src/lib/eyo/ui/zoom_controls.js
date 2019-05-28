/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Workspace model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.ZoomControls')

goog.require('eYo.Touch')
goog.require('goog.dom')


/**
 * Zoom controls model
 * @param {!eYo.Workspace} workspace Workspace to zoom.
 * @constructor
 */
eYo.ZoomControls = function(workspace, bottom) {
  this.workspace_ = workspace
  if (workspace.hasUI) {
    this.makeUI(bottom)
  }
}

Object.defineProperties(eYo.ZoomControls.prototype, {
  /**
   * Width of the zoom controls.
   * @type {number}
   * @private
   */
  WIDTH_: { value: 32 },

  /**
   * Height of the zoom controls.
   * @type {number}
   * @private
   */
  HEIGHT_: { value: 110 },

  /**
   * Distance between zoom controls and bottom edge of workspace.
   * @type {number}
   * @private
   */
  MARGIN_BOTTOM_: { value: 20 },

  /**
   * Distance between zoom controls and right edge of workspace.
   * @type {number}
   * @private
   */
  MARGIN_SIDE_: { value: 20 },

  /**
   * Left coordinate of the zoom controls.
   * @type {number}
   * @private
   */
  left_: { value: 20, writable: true },

  /**
   * Top coordinate of the zoom controls.
   * @type {number}
   * @private
   */
  top_: { value: 20, writable: true },

  ui_driver: {
    get () {
      return this.workspace_.ui_driver
    }
  },

  /**
   * Global top coordinate of the zoom controls.
   * @type {number}
   * @private
   */
  top: {
    get () {
      return this.bottom_ + this.HEIGHT_
    }
  },
})

/**
 * Create the zoom controls UI at above the given bottom.
 * @param {Number} bottom
 */
eYo.ZoomControls.prototype.makeUI = function(bottom) {
  this.bottom_ = this.MARGIN_BOTTOM_ + bottom
  this.ui_driver.zoomControlsInit(this)
}

/**
 * Create the zoom controls.
 * @return {!Element} The zoom controls SVG group.
 */
eYo.ZoomControls.prototype.disposeUI = function() {
  this.ui_driver.zoomControlsDispose(this)
}

/**
 * Dispose of this zoom controls.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.ZoomControls.prototype.dispose = function() {
  this.disposeUI()
  this.workspace_ = null
};

/**
 * Move the zoom controls to the bottom-right corner.
 */
eYo.ZoomControls.prototype.place = function() {
  var ws = this.workspace_
  var metrics = ws.getMetrics()
  if (!metrics) {
    // There are no metrics available (workspace is probably not visible).
    return
  }
  this.left_ = metrics.viewWidth + metrics.absoluteLeft -
      this.WIDTH_ - this.MARGIN_SIDE_ - eYo.Scrollbar.scrollbarThickness

  if (metrics.flyoutPosition === eYo.Flyout.AT_RIGHT) {
    this.left_ -= metrics.flyoutWidth
  }
  this.top_ = metrics.viewHeight + metrics.absoluteTop -
      this.HEIGHT_ - this.bottom_
  ws.ui_driver.zoomControlsPlace(this)
}
