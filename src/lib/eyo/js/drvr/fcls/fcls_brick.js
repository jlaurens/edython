/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate. Do nothing driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.forward('brick')

/**
 * Faceless driver for bricks.
 */
eYo.fcls.newDrvrC9r('Brick', {
  methods: {
    /**
     * The default implementation does nothing.
     * @param {eYo.brick.BaseC9r} brick to be connected.
     * @param {eYo.brick.BaseC9r} newParent to be connected.
     */
    do_parentWillChange: eYo.doNothing,
    /**
     * The default implementation does nothing.
     * @param {eYo.brick.BaseC9r} oldParent replaced.
     */
    do_parentDidChange: eYo.doNothing,
    /**
     * Returns the bounding box of the node.
     * Defaults implementation returns `eYo.NA`.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     * @private
     */
    getBBox (brick) { // eslint-disable-line
      return eYo.NA
    },
    /**
     * Whether the node is visually selected.
     * The default implementation returns false.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     * @private
     */
    hasFocus (brick) { // eslint-disable-line
      return false
    },
    /**
     * Before node rendering.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     * @param {*} recorder
     * @private
     */
    do_willRender_: eYo.doNothing,
    /**
     * After node rendering.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     * @param {*} recorder
     * @private
     */
    do_didRender_: eYo.doNothing,
    /**
     * Draw the path of the brick.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     * @param {Object} recorder
     * @private
     */
    do_draw_: eYo.doNothing,

    /**
     * Compute the paths of the brick depending on its size.
     * Default implementation does nothing.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     */
    do_updateShape: eYo.doNothing,
    /**
     * Default implementation does nothing.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     * @param {Object} recorder
     * @private
     */
    /**
     * The default implementation does nothing.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     */
    do_sendToFront: eYo.doNothing,
    /**
     * The default implementation does nothing.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     */
    do_sendToBack: eYo.doNothing,
    do_displayedGet: eYo.doNothing,
    /**
     * Set the displayed status of the given node.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     * @param {boolean} visible  the expected visibility status
     */
    do_displayedSet: eYo.doNothing,
    /**
     * The default implementation does nothing.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     */
    do_makeWrapped: eYo.doNothing,
    /**
     * The default implementation does nothing.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     */
    do_makeUnwrapped: eYo.doNothing,
    /**
     * The default implementation does nothing.
     * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
     */
    do_magnetHilight: eYo.doNothing,
  },
})

//<<< mochai: eYo.fcls.Brick
//... chai.assert(eYo.fcls.Brick)
//>>>

eYo.fcls.Brick[eYo.$].methodsMerge({
  drawModelBegin_: eYo.doNothing,
  /**
   * Default implementation does nothing.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   * @param {Object} recorder
   * @private
   */
  drawModelEnd_: eYo.doNothing,
  /**
   * Get the displayed status of the given node.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   */
  /**
   * Translates the brick, forwards to the ui driver.
   * @param {number} x - The x coordinate of the translation in board units.
   * @param {number} y - The y coordinate of the translation in board units.
   */
  do_moveTo: eYo.doNothing,
  /**
   * Return the coordinates of the top-left corner of this brick relative to the
   * drawing surface's origin (0,0), in board units.
   * If the brick is on the board, (0, 0) is the origin of the board
   * coordinate system.
   * This does not change with board scale.
   * @return {!eYo.geom.Point} Object with .x and .y properties in
   *     board coordinates.
   */
  whereInBoard: eYo.doNothing,
  /**
   * The default implementation does nothing.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   */
  updateDisabled: eYo.doNothing,
  /**
   * The default implementation does nothing.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   */
  connectEffect: eYo.doNothing,
  /**
   * The default implementation does nothing.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   * @param {Object} menu
   */
  menuShow: eYo.doNothing,
  /**
   * Add the hilight path_.
   * Default implementation does nothing
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   */
  hilightAdd_: eYo.doNothing,

  /**
   * Remove the hilight path.
   * Default implementation does nothing.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   */
  hilightRemove_: eYo.doNothing,

  /**
   * Add the select path.
   * Default implementation does nothing.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   */
  selectAdd_: eYo.doNothing,

  /**
   * Remove the select path.
   * Default implementation does nothing.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   */
  selectRemove_: eYo.doNothing,

  /**
   * The svg group has an `eyo-top` class.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   */
  statusTopAdd_: eYo.doNothing,

  /**
   * The default implementation does nothing.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   */
  statusTopRemove_: eYo.doNothing,

  /**
   * Default implementation does nothing.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   */
  statusFocusAdd_: eYo.doNothing,

  /**
   * Reverse `nodestatusFocusAdd_`.
   * Default implementation does nothing.
   * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
   */
  statusFocusRemove_: eYo.doNothing,

  /**
   * Whether the given brick can draw.
   * @param {eYo.brick.BaseC9r} brick  the brick the driver acts on
   * @private
   */
  canDraw (brick) { // eslint-disable-line
    return true
  },

  /**
   * Update the |disbled| status of the given brick.
   * The default implementation does nothing.
   * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
   */
  updateDisabled_: eYo.doNothing,

  /**
   * Make the given brick wrapped.
   * The default implementation forwards to the driver.
   * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
   */
  updateWrapped: eYo.doNothing,

  /**
   * Add the select path.
   * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
   */
  focusAdd: eYo.doNothing,
  /**
   * Add the select path.
   * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
   */
  focusRemove: eYo.doNothing,

})

/**
 * The default implementation forwards to the driver.
 */
eYo.drvr.makeForwarder(
  eYo.brick.BaseC9r_p,
  'hilightAdd_', 'hilightRemove_',
  'selectAdd', 'selectRemove',
  'magnetAdd_', 'magnetRemove_',
  'statusTopAdd_', 'statusTopRemove_',
  'statusFocusAdd_', 'statusFocusRemove_',
  'parentWillChange', 'parentDidChange',
)

eYo.Brick[eYo.$].methodsMerge({
  /**
   * In progress.
   * Forwards to the driver.
   */
  statusFocusAdd_ () {
    this.drvr.do_statusFocusAdd_(this)
    this.slotForEach(slot => {
      slot.fieldForEach(field => {
        eYo.isF(field.selectAdd) && field.selectAdd()
      })
    })
  },
  /**
   * Reverse `statusFocusAdd_`.
   */
  statusFocusRemove_ () {
    this.drvr.do_statusFocusRemove_(this)
    this.slotForEach(slot => {
      slot.fieldForEach(field => {
        eYo.isF(field.focusRemove) && field.focusRemove()
      })
    })
  },
})

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 */
eYo.drvr.makeForwarder(eYo.brick.BaseC9r_p, 'magnetHilight')

/**
 * Set the parent.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {eYo.brick.BaseC9r} parent - the brick's parent
 */
eYo.doNothing

