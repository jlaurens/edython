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
eYo.fcls.newDriverC9r('Brick')

/**
 * The default implementation does nothing.
 * @param {eYo.brick.BaseC9r} newParent to be connected.
 */
eYo.fcls.Brick_p.parentWillChange = eYo.doNothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.BaseC9r} oldParent replaced.
 */
eYo.fcls.Brick_p.parentDidChange = eYo.doNothing

/**
 * Returns the bounding box of the node.
 * Defaults implementation returns `eYo.NA`.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 * @private
 */
eYo.fcls.Brick_p.getBBox = function (brick) { // eslint-disable-line
  return eYo.NA
}

/**
 * Whether the node is visually selected.
 * The default implementation returns false.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 * @private
 */
eYo.fcls.Brick_p.hasFocus = function (brick) { // eslint-disable-line
  return false
}

/**
 * Before node rendering.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.fcls.Brick_p.willRender_ = eYo.doNothing

/**
 * After node rendering.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.fcls.Brick_p.didRender_ = eYo.doNothing

/**
 * Draw the path of the brick.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.fcls.Brick_p.draw_ = eYo.doNothing

/**
 * Compute the paths of the brick depending on its size.
 * Default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.updateShape = eYo.doNothing

/**
 * Default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.fcls.Brick_p.drawModelBegin_ = eYo.doNothing

/**
 * Default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.fcls.Brick_p.drawModelEnd_ = eYo.doNothing

/**
 * Get the displayed status of the given node.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.displayedGet = eYo.doNothing

/**
 * Set the displayed status of the given node.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.fcls.Brick_p.displayedSet = eYo.doNothing

/**
 * Translates the brick, forwards to the ui driver.
 * @param {number} x - The x coordinate of the translation in board units.
 * @param {number} y - The y coordinate of the translation in board units.
 */
eYo.fcls.Brick_p.moveTo = eYo.doNothing

/**
 * Return the coordinates of the top-left corner of this brick relative to the
 * drawing surface's origin (0,0), in board units.
 * If the brick is on the board, (0, 0) is the origin of the board
 * coordinate system.
 * This does not change with board scale.
 * @return {!eYo.geom.Point} Object with .x and .y properties in
 *     board coordinates.
 */
eYo.fcls.Brick_p.whereInBoard = eYo.doNothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.updateDisabled = eYo.doNothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.connectEffect = eYo.doNothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 * @param {Object} menu
 */
eYo.fcls.Brick_p.menuShow = eYo.doNothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.makeWrapped = eYo.doNothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.makeUnwrapped = eYo.doNothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.sendToFront = eYo.doNothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.sendToBack = eYo.doNothing

/**
 * Add the hilight path_.
 * Default implementation does nothing
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.hilightAdd_ = eYo.doNothing

/**
 * Remove the hilight path.
 * Default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.hilightAdd_ = eYo.doNothing

/**
 * Add the select path.
 * Default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.selectAdd_ = eYo.doNothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.removeSelect_ = eYo.doNothing

/**
 * The svg group has an `eyo-top` class.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.statusTopAdd_ = eYo.doNothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.statusTopRemove_ = eYo.doNothing

/**
 * Default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.statusFocusAdd_ = eYo.doNothing

/**
 * Reverse `nodestatusFocusAdd_`.
 * Default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.statusFocusRemove_ = eYo.doNothing

/**
 * Whether the given brick can draw.
 * @param {eYo.brick.BaseC9r} brick  the brick the driver acts on
 * @private
 */
eYo.fcls.Brick_p.canDraw = function (brick) { // eslint-disable-line
  return true
}

/**
 * Update the |disbled| status of the given brick.
 * The default implementation does nothing.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.updateDisabled_ = eYo.doNothing

/**
 * Make the given brick wrapped.
 * The default implementation forwards to the driver.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.updateWrapped = eYo.doNothing

/**
 * Add the hilight path_.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.hilightAdd_ = eYo.doNothing


/**
 * Remove the hilight path.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.hilightAdd_ = eYo.doNothing

/**
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'hilightAdd_')

/**
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'hilightAdd_')

/**
 * Add the select path.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.selectAdd = eYo.doNothing

/**
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'selectAdd')

/**
 * Remove the select path.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.selectAdd = eYo.doNothing

/**
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'selectRemove')

/**
 * Forwards to the |selectRemove|.
* @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
  */
eYo.fcls.Brick_p.focusRemove = function (brick) {
  this.selectRemove(brick)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'selectRemove')

/**
 * Forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'magnetAdd_')

/**
 * Add the magnet connection path_.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.magnetAdd_ = eYo.doNothing

/**
 * Forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'magnetRemove_')

/**
 * In progress.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.magnetRemove_ = eYo.doNothing

/**
 * Forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'StatusTopAdd')

/**
 * In progress.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.statusTopAdd_ = eYo.doNothing

/**
 * Remove the `top` status.
 * Forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'statusTopRemove_')

/**
 * Remove the `top` status.
 */
eYo.fcls.Brick_p.statusTopRemove_ = eYo.doNothing

/**
 * In progress.
 * Forwards to the driver.
 */
eYo.brick.BaseC9r_p.statusFocusAdd_ = function () {
  this.ui_driver.statusFocusAdd(this)
  this.slotForEach(slot => {
    slot.fieldForEach(field => {
      eYo.isF(field.selectAdd) && field.selectAdd()
    })
  })
}

/**
 * In progress.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.statusFocusAdd_ = eYo.doNothing

/**
 * Reverse `statusFocusAdd_`.
 */
eYo.brick.BaseC9r_p.statusFocusRemove_ = function (brick) { // eslint-disable-line
  this.ui_driver.statusSelectRemove(this)
  this.slotForEach(slot => {
    slot.fieldForEach(field => {
      eYo.isF(field.focusRemove) && field.focusRemove()
    })
  })
}

/**
 * Reverse `statusFocusAdd_`.
 * Forwards to the driver and various fields.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.statusFocusRemove_ = eYo.doNothing

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'magnetHilight')

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.magnetHilight = eYo.doNothing

/**
 * Set the parent.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {eYo.brick.BaseC9r} parent - the brick's parent
 */
eYo.fcls.Brick_p.parentSet = eYo.doNothing

/**
 * Called when the parent will change.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {eYo.brick.BaseC9r} after - the brick's parent after the change
 */
eYo.fcls.Brick_p.parentWillChange = eYo.doNothing

eYo.c9r.appendToMethod(eYo.brick.BaseC9r_p, 'parentWillChange', function (after) {
  this.ui_driver.parentWillChange(this, after)
})

/**
 * Called when the parent did change.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 * @param {eYo.brick.BaseC9r} before - the brick's parent before the change
 */
eYo.fcls.Brick_p.parentDidChange = eYo.doNothing

eYo.c9r.appendToMethod(eYo.brick.BaseC9r_p, 'parentDidChange', function (before) {
  this.ui_driver.parentDidChange(this, before)
})

/**
 * Place the brick correctly.
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.scheduleSnapAndBump = eYo.doNothing

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @private
 * @param {eYo.brick.BaseC9r} brick - the brick the driver acts on
 */
eYo.fcls.Brick_p.bumpNeighbours_ = eYo.doNothing

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.BaseC9r_p, 'bumpNeighbours_')
