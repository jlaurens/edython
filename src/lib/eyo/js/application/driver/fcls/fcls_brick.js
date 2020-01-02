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

eYo.require('Fcls')

eYo.provide('Fcls.Brick')

eYo.forwardDeclare('Brick')

/**
 * Faceless driver for bricks.
 */
eYo.Fcls.makeDriverClass('Brick')

/**
 * The default implementation does nothing.
 * @param {eYo.Brick.Dflt} newParent to be connected.
 */
eYo.Fcls.Brick_p.parentWillChange = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.Brick.Dflt} oldParent replaced.
 */
eYo.Fcls.Brick_p.parentDidChange = eYo.Do.nothing

/**
 * Returns the bounding box of the node.
 * Defaults implementation returns `eYo.NA`.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 * @private
 */
eYo.Fcls.Brick_p.getBBox = function (brick) {
  return eYo.NA
}

/**
 * Whether the node is visually selected.
 * The default implementation returns false.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 * @private
 */
eYo.Fcls.Brick_p.hasFocus = function (node) {
  return false
}

/**
 * Before node rendering.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Fcls.Brick_p.willRender_ = eYo.Do.nothing

/**
 * After node rendering.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Fcls.Brick_p.didRender_ = eYo.Do.nothing

/**
 * Draw the path of the brick.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.Fcls.Brick_p.draw_ = eYo.Do.nothing

/**
 * Compute the paths of the brick depending on its size.
 * Default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.updateShape = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.Fcls.Brick_p.drawModelBegin_ = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.Fcls.Brick_p.drawModelEnd_ = eYo.Do.nothing

/**
 * Get the displayed status of the given node.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.displayedGet = eYo.Do.nothing

/**
 * Set the displayed status of the given node.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.Fcls.Brick_p.displayedSet = eYo.Do.nothing

/**
 * Translates the brick, forwards to the ui driver.
 * @param {number} x - The x coordinate of the translation in board units.
 * @param {number} y - The y coordinate of the translation in board units.
 */
eYo.Fcls.Brick_p.moveTo = eYo.Do.nothing

/**
 * Return the coordinates of the top-left corner of this brick relative to the
 * drawing surface's origin (0,0), in board units.
 * If the brick is on the board, (0, 0) is the origin of the board
 * coordinate system.
 * This does not change with board scale.
 * @return {!eYo.Where} Object with .x and .y properties in
 *     board coordinates.
 */
eYo.Fcls.Brick_p.whereInBoard = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.updateDisabled = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.connectEffect = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 * @param {Object} menu
 */
eYo.Fcls.Brick_p.menuShow = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.makeWrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.makeUnwrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.sendToFront = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.sendToBack = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.hilightAdd_ = eYo.Do.nothing

/**
 * Remove the hilight path.
 * Default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.hilightAdd_ = eYo.Do.nothing

/**
 * Add the select path.
 * Default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.selectAdd_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.removeSelect_ = eYo.Do.nothing

/**
 * The svg group has an `eyo-top` class.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.statusTopAdd_ = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.statusTopRemove_ = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.statusFocusAdd_ = eYo.Do.nothing

/**
 * Reverse `nodestatusFocusAdd_`.
 * Default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the node the driver acts on
 */
eYo.Fcls.Brick_p.statusFocusRemove_ = eYo.Do.nothing

/**
 * Whether the given brick can draw.
 * @param {eYo.Brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.Fcls.Brick_p.canDraw = function (brick) {
  return true
}

/**
 * Update the |disbled| status of the given brick.
 * The default implementation does nothing.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.updateDisabled_ = eYo.Do.nothing

/**
 * Make the given brick wrapped.
 * The default implementation forwards to the driver.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.updateWrapped = eYo.Do.nothing

/**
 * Add the hilight path_.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.hilightAdd_ = eYo.Do.nothing


/**
 * Remove the hilight path.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.hilightAdd_ = eYo.Do.nothing

/**
 * The default implementation forwards to the driver.
 */
eYo.Driver.makeForwarder(eYo.Brick.Dflt_p, 'hilightAdd_')

/**
 * The default implementation forwards to the driver.
 */
eYo.Driver.makeForwarder(eYo.Brick.Dflt_p, 'hilightAdd_')

/**
 * Add the select path.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.selectAdd = eYo.Do.nothing

/**
 * The default implementation forwards to the driver.
 */
eYo.Driver.makeForwarder(eYo.Brick.Dflt_p, 'selectAdd')

/**
 * Remove the select path.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.selectAdd = eYo.Do.nothing

/**
 * The default implementation forwards to the driver.
 */
eYo.Driver.makeForwarder(eYo.Brick.Dflt_p, 'selectRemove')

/**
 * Forwards to the |selectRemove|.
* @param {eYo.Brick.Dflt} brick - the brick the driver acts on
  */
eYo.Fcls.Brick._p.focusRemove = function (brick) {
  this.selectRemove(brick)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.Driver.makeForwarder(eYo.Brick.Dflt_p, 'selectRemove')

/**
 * Forwards to the driver.
 */
eYo.Driver.makeForwarder(eYo.Brick.Dflt_p, 'magnetAdd_')

/**
 * Add the magnet connection path_.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.magnetAdd_ = eYo.Do.nothing

/**
 * Forwards to the driver.
 */
eYo.Driver.makeForwarder(eYo.Brick.Dflt_p, 'magnetRemove_')

/**
 * In progress.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.magnetRemove_ = eYo.Do.nothing

/**
 * Forwards to the driver.
 */
eYo.Driver.makeForwarder(eYo.Brick.Dflt_p, 'StatusTopAdd')

/**
 * In progress.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.statusTopAdd_ = eYo.Do.nothing

/**
 * Remove the `top` status.
 * Forwards to the driver.
 */
eYo.Driver.makeForwarder(eYo.Brick.Dflt_p, 'statusTopRemove_')

/**
 * Remove the `top` status.
 */
eYo.Fcls.Brick._p.statusTopRemove_ = eYo.Do.nothing

/**
 * In progress.
 * Forwards to the driver.
 */
eYo.Brick.Dflt_p.statusFocusAdd_ = function () {
  this.ui_driver.statusFocusAdd(this)
  this.slotForEach(slot => {
    slot.fieldForEach(field => {
      eYo.isF(field.selectAdd) && field.selectAdd()
    })
  })
}

/**
 * In progress.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.statusFocusAdd_ = eYo.Do.nothing

/**
 * Reverse `statusFocusAdd_`.
 */
eYo.Brick.Dflt_p.statusFocusRemove_ = function (brick) {
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
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.statusFocusRemove_ = eYo.Do.nothing

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 */
eYo.Driver.makeForwarder(eYo.Brick.Dflt_p, 'magnetHilight')

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.magnetHilight = eYo.Do.nothing

/**
 * Set the parent.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 * @param {eYo.Brick.Dflt} parent - the brick's parent
 */
eYo.Fcls.Brick._p.parentSet = eYo.Do.nothing

/**
 * Called when the parent will change.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 * @param {eYo.Brick.Dflt} after - the brick's parent after the change
 */
eYo.Fcls.Brick._p.parentWillChange = eYo.Do.nothing

eYo.C9r.appendToMethod(eYo.Brick.Dflt_p, 'parentWillChange', function (after) {
  this.ui_driver.parentWillChange(this, after)
})

/**
 * Called when the parent did change.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 * @param {eYo.Brick.Dflt} before - the brick's parent before the change
 */
eYo.Fcls.Brick._p.parentDidChange = eYo.Do.nothing

eYo.C9r.appendToMethod(eYo.Brick.Dflt_p, 'parentDidChange', function (before) {
  this.ui_driver.parentDidChange(this, before)
})

/**
 * Place the brick correctly.
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.scheduleSnapAndBump = eYo.Do.nothing

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @private
 * @param {eYo.Brick.Dflt} brick - the brick the driver acts on
 */
eYo.Fcls.Brick._p.bumpNeighbours_ = eYo.Do.nothing

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 */
eYo.Driver.makeForwarder(eYo.Brick.Dflt_p, 'bumpNeighbours_')
