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

eYo.require('fcls')

eYo.provide('fcls.Brick')

eYo.forwardDeclare('brick')

/**
 * Faceless driver for bricks.
 */
eYo.fcls.makeDriverC9r('Brick')

/**
 * The default implementation does nothing.
 * @param {eYo.brick.Dflt} newParent to be connected.
 */
eYo.fcls.Brick_p.parentWillChange = eYo.do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.Dflt} oldParent replaced.
 */
eYo.fcls.Brick_p.parentDidChange = eYo.do.nothing

/**
 * Returns the bounding box of the node.
 * Defaults implementation returns `eYo.NA`.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 * @private
 */
eYo.fcls.Brick_p.getBBox = function (brick) {
  return eYo.NA
}

/**
 * Whether the node is visually selected.
 * The default implementation returns false.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 * @private
 */
eYo.fcls.Brick_p.hasFocus = function (node) {
  return false
}

/**
 * Before node rendering.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.fcls.Brick_p.willRender_ = eYo.do.nothing

/**
 * After node rendering.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.fcls.Brick_p.didRender_ = eYo.do.nothing

/**
 * Draw the path of the brick.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.fcls.Brick_p.draw_ = eYo.do.nothing

/**
 * Compute the paths of the brick depending on its size.
 * Default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.updateShape = eYo.do.nothing

/**
 * Default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.fcls.Brick_p.drawModelBegin_ = eYo.do.nothing

/**
 * Default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.fcls.Brick_p.drawModelEnd_ = eYo.do.nothing

/**
 * Get the displayed status of the given node.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.displayedGet = eYo.do.nothing

/**
 * Set the displayed status of the given node.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.fcls.Brick_p.displayedSet = eYo.do.nothing

/**
 * Translates the brick, forwards to the ui driver.
 * @param {number} x - The x coordinate of the translation in board units.
 * @param {number} y - The y coordinate of the translation in board units.
 */
eYo.fcls.Brick_p.moveTo = eYo.do.nothing

/**
 * Return the coordinates of the top-left corner of this brick relative to the
 * drawing surface's origin (0,0), in board units.
 * If the brick is on the board, (0, 0) is the origin of the board
 * coordinate system.
 * This does not change with board scale.
 * @return {!eYo.Where} Object with .x and .y properties in
 *     board coordinates.
 */
eYo.fcls.Brick_p.whereInBoard = eYo.do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.updateDisabled = eYo.do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.connectEffect = eYo.do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 * @param {Object} menu
 */
eYo.fcls.Brick_p.menuShow = eYo.do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.makeWrapped = eYo.do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.makeUnwrapped = eYo.do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.sendToFront = eYo.do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.sendToBack = eYo.do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.hilightAdd_ = eYo.do.nothing

/**
 * Remove the hilight path.
 * Default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.hilightAdd_ = eYo.do.nothing

/**
 * Add the select path.
 * Default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.selectAdd_ = eYo.do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.removeSelect_ = eYo.do.nothing

/**
 * The svg group has an `eyo-top` class.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.statusTopAdd_ = eYo.do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.statusTopRemove_ = eYo.do.nothing

/**
 * Default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.statusFocusAdd_ = eYo.do.nothing

/**
 * Reverse `nodestatusFocusAdd_`.
 * Default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the node the driver acts on
 */
eYo.fcls.Brick_p.statusFocusRemove_ = eYo.do.nothing

/**
 * Whether the given brick can draw.
 * @param {eYo.brick.Dflt} brick  the brick the driver acts on
 * @private
 */
eYo.fcls.Brick_p.canDraw = function (brick) {
  return true
}

/**
 * Update the |disbled| status of the given brick.
 * The default implementation does nothing.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.updateDisabled_ = eYo.do.nothing

/**
 * Make the given brick wrapped.
 * The default implementation forwards to the driver.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.updateWrapped = eYo.do.nothing

/**
 * Add the hilight path_.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.hilightAdd_ = eYo.do.nothing


/**
 * Remove the hilight path.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.hilightAdd_ = eYo.do.nothing

/**
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.Dflt_p, 'hilightAdd_')

/**
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.Dflt_p, 'hilightAdd_')

/**
 * Add the select path.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.selectAdd = eYo.do.nothing

/**
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.Dflt_p, 'selectAdd')

/**
 * Remove the select path.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.selectAdd = eYo.do.nothing

/**
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.Dflt_p, 'selectRemove')

/**
 * Forwards to the |selectRemove|.
* @param {eYo.brick.Dflt} brick - the brick the driver acts on
  */
eYo.fcls.Brick._p.focusRemove = function (brick) {
  this.selectRemove(brick)
}

/**
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.Dflt_p, 'selectRemove')

/**
 * Forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.Dflt_p, 'magnetAdd_')

/**
 * Add the magnet connection path_.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.magnetAdd_ = eYo.do.nothing

/**
 * Forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.Dflt_p, 'magnetRemove_')

/**
 * In progress.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.magnetRemove_ = eYo.do.nothing

/**
 * Forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.Dflt_p, 'StatusTopAdd')

/**
 * In progress.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.statusTopAdd_ = eYo.do.nothing

/**
 * Remove the `top` status.
 * Forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.Dflt_p, 'statusTopRemove_')

/**
 * Remove the `top` status.
 */
eYo.fcls.Brick._p.statusTopRemove_ = eYo.do.nothing

/**
 * In progress.
 * Forwards to the driver.
 */
eYo.brick.Dflt_p.statusFocusAdd_ = function () {
  this.ui_driver.statusFocusAdd(this)
  this.slotForEach(slot => {
    slot.fieldForEach(field => {
      eYo.isF(field.selectAdd) && field.selectAdd()
    })
  })
}

/**
 * In progress.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.statusFocusAdd_ = eYo.do.nothing

/**
 * Reverse `statusFocusAdd_`.
 */
eYo.brick.Dflt_p.statusFocusRemove_ = function (brick) {
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
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.statusFocusRemove_ = eYo.do.nothing

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.Dflt_p, 'magnetHilight')

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.magnetHilight = eYo.do.nothing

/**
 * Set the parent.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 * @param {eYo.brick.Dflt} parent - the brick's parent
 */
eYo.fcls.Brick._p.parentSet = eYo.do.nothing

/**
 * Called when the parent will change.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 * @param {eYo.brick.Dflt} after - the brick's parent after the change
 */
eYo.fcls.Brick._p.parentWillChange = eYo.do.nothing

eYo.c9r.appendToMethod(eYo.brick.Dflt_p, 'parentWillChange', function (after) {
  this.ui_driver.parentWillChange(this, after)
})

/**
 * Called when the parent did change.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 * @param {eYo.brick.Dflt} before - the brick's parent before the change
 */
eYo.fcls.Brick._p.parentDidChange = eYo.do.nothing

eYo.c9r.appendToMethod(eYo.brick.Dflt_p, 'parentDidChange', function (before) {
  this.ui_driver.parentDidChange(this, before)
})

/**
 * Place the brick correctly.
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.scheduleSnapAndBump = eYo.do.nothing

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @private
 * @param {eYo.brick.Dflt} brick - the brick the driver acts on
 */
eYo.fcls.Brick._p.bumpNeighbours_ = eYo.do.nothing

/**
 * Hilight the given connection.
 * The default implementation forwards to the driver.
 */
eYo.driver.makeForwarder(eYo.brick.Dflt_p, 'bumpNeighbours_')
