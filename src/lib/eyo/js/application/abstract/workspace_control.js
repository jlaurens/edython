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

/**
 * Class for a workspace control.
 * @param {eYo.Workspace} workspace The board to sit in.
 * @constructor
 * @readonly
 * @property {eYo.geom.Rect} viewRect,  The view rectangle
 * @readonly
 * @property {eYo.Workspace} workspace,  The workspace...
 * @readonly
 * @property {Number} top,  ...
 * @private
 * @readonly
 * @property {number} WIDTH_, Width of both the control
 * @private
 * @readonly
 * @property {number} MARGIN_BOTTOM_, Distance between trash can and bottom edge of board.
 * @private
 * @readonly
 * @property {number} MARGIN_SIDE_, Distance between trash can and right edge of board.
 *
 */
eYo.o3d.makeC9r(eYo.pane, 'WorkspaceControl', {
  computed: {
    workspace () {
      return this.owner
    },
    top () {
      return this.viewRect_.y
    }
  },
  copied: {
    viewRect () {
      var ans = new eYo.geom.Rect()
      ans.width = this.WIDTH_
      ans.height = this.HEIGHT_
      return ans
    }
  },
  valued: {
    WIDTH_: 47,
    MARGIN_BOTTOM_: 20,
    MARGIN_SIDE_: 20,
  }
})

/**
 * Move the workspace control to the bottom-right corner.
 * Just change the view rectangle.
 * Subclassers will place th receiver according to their driver.
 */
eYo.pane.WorkspaceControl_p.place = function(bottom) {
  var board = this.board
  var view = board.metrics.view
  var r = this.viewRect__
  var flyout = this.flyout_
  r.right = (flyout && flyout.atRight
    ? flyout.viewRect.left
    : view.left) - this.MARGIN_SIDE_
  r.y_max = bottom - this.MARGIN_BOTTOM_
}
