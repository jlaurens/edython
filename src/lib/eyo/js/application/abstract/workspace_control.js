/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Workspace control, for workspace control and zoomer.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.require('eYo.Owned')

goog.provide('eYo.WorkspaceControl')

/**
 * Class for a workspace control.
 * @param {!eYo.Workspace} workspace The board to sit in.
 * @constructor
 */
eYo.WorkspaceControl = function(workspace) {
  eYo.WorkspaceControl.superClass_.constructor.call(this, workspace)
  /**
   * The view rectangle
   * @type {eYo.Rect}
   */
  var r = this.viewRect__ = new eYo.Rect()
  r.width = this.WIDTH_
  r.height = this.HEIGHT_
}
goog.inherits(eYo.WorkspaceControl, eYo.Owned.UI)

eYo.Property.addClonableMany(
  eYo.WorkspaceControl.prototype,
  'viewRect'
)
Object.defineProperties(eYo.WorkspaceControl.prototype, {
  /**
   * The workspace where the control is displayed.
   * @type {eYo.Workspace}
   */
  workspace: {
    get () {
      return this.owner
    }
  },
  top: {
    get () {
      return this.viewRect_.y
    }
  },
  /**
   * Width of both the control.
   * @type {number}
   * @private
   */
  WIDTH_: {value: 47, writable: true},
  /**
   * Distance between trash can and bottom edge of board.
   * @type {number}
   * @private
   */
  MARGIN_BOTTOM_: {value: 20, writable: true},
  /**
   * Distance between trash can and right edge of board.
   * @type {number}
   * @private
   */
  MARGIN_SIDE_: {value: 20, writable: true},
})

/**
 * Dispose of this workspace control and its UI.
 */
eYo.Decorate.makeDispose(
  eYo.WorkspaceControl,
  function() {
    eYo.Property.dispose(this, 'viewRect')
  }
)

/**
 * Move the workspace control to the bottom-right corner.
 * Just change the view rectangle.
 * Subclassers will place th receiver according to their driver.
 */
eYo.WorkspaceControl.prototype.place = function(bottom) {
  var board = this.board
  var view = board.metrics.view
  var r = this.viewRect__
  var flyout = this.flyout_
  r.right = (flyout && flyout.atRight
    ? flyout.viewRect.left
    : view.left) - this.MARGIN_SIDE_
  r.y_max = bottom - this.MARGIN_BOTTOM_
}
