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
 * @name {eYo.control}
 * @namespace
 */
eYo.view.makeNS(eYo, 'control')

Object.defineProperties(eYo.control._p, {
  WIDTH_: {value: 47},
  MARGIN_BOTTOM_: {value: 20},
  MARGIN_SIDE_: {value: 20},
})

/**
 * Class for a workspace control.
 * @param {eYo.view.Workspace} workspace The board to sit in.
 * @constructor
 * @readonly
 * @property {eYo.geom.Rect} viewRect,  The view rectangle
 * @readonly
 * @property {eYo.view.Workspace} workspace - The workspace...
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
eYo.control.makeBase({
  aliases: {
    'viewRect.y': 'top',
  },
  properties: {
    workspace: {
      get () {
        return this.owner
      },
    },
    viewRect () {
      var ans = new eYo.geom.Rect()
      ans.width = this.ns.WIDTH_
      ans.height = this.HEIGHT_
      return ans
    },
  },
  methods: {
    /**
     * Move the workspace control to the bottom-right corner.
     * Just change the view rectangle.
     * Subclassers will place the receiver according to their driver.
     * @param {Number} bottom - 
     */
    place (bottom) {
      var board = this.board
      var view = board.metrics.view
      var r = this.viewRect__
      var flyout = this.flyout_
      r.right_ = (flyout && flyout.atRight
        ? flyout.viewRect.left
        : view.left) - this.ns.MARGIN_SIDE_
      r.y_max_ = bottom - this.ns.MARGIN_BOTTOM_
    }
  },
})
