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

eYo.require('eYo.NS_Fcls')

eYo.provide('eYo.NS_Fcls.Brick')

eYo.forwardDeclare('eYo.NS_Brick')

/**
 * Faceless driver for bricks.
 */
eYo.NS_Fcls.makeDriverClass('Brick')

/**
 * The default implementation does nothing.
 * @param {eYo.NS_Brick.Dflt} newParent to be connected.
 */
eYo.NS_Fcls.Brick.prototype.parentWillChange = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {eYo.NS_Brick.Dflt} oldParent replaced.
 */
eYo.NS_Fcls.Brick.prototype.parentDidChange = eYo.Do.nothing

/**
 * Returns the bounding box of the node.
 * Defaults implementation returns `eYo.NA`.
 * @param {Object} node  the node the driver acts on
 * @private
 */
eYo.NS_Fcls.brickGetBBox = function (node) {
  return eYo.NA
}

/**
 * Whether the node is visually selected.
 * The default implementation returns false.
 * @param {Object} node  the node the driver acts on
 * @private
 */
eYo.NS_Fcls.brickHasFocus = function (node) {
  return false
}

/**
 * Before node rendering.
 * @param {Object} node  the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.NS_Fcls.brickWillRender = eYo.Do.nothing

/**
 * After node rendering.
 * @param {Object} node  the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.NS_Fcls.brickDidRender = eYo.Do.nothing

/**
 * Draw the path of the brick.
 * @param {Object} node  the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.NS_Fcls.brickDraw = function (node, recorder) {
}

/**
 * Compute the paths of the brick depending on its size.
 * Default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.brickUpdateShape = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.NS_Fcls.brickDrawModelBegin = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.NS_Fcls.brickDrawModelEnd = eYo.Do.nothing

/**
 * Get the displayed status of the given node.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.brickDisplayedGet = eYo.Do.nothing

/**
 * Set the displayed status of the given node.
 * @param {Object} node  the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.NS_Fcls.brickDisplayedSet = eYo.Do.nothing

/**
 * Translates the brick, forwards to the ui driver.
 * @param {number} x The x coordinate of the translation in board units.
 * @param {number} y The y coordinate of the translation in board units.
 */
eYo.NS_Fcls.brickMoveTo = eYo.Do.nothing

/**
 * Return the coordinates of the top-left corner of this brick relative to the
 * drawing surface's origin (0,0), in board units.
 * If the brick is on the board, (0, 0) is the origin of the board
 * coordinate system.
 * This does not change with board scale.
 * @return {!eYo.Where} Object with .x and .y properties in
 *     board coordinates.
 */
eYo.NS_Fcls.brickWhereInBoard = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.updateDisabled = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.connectEffect = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 * @param {Object} menu
 */
eYo.NS_Fcls.Brick.prototype.menuShow = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.makeWrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.makeUnwrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.sendToFront = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.sendToBack = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.addBrickHilight_ = eYo.Do.nothing

/**
 * Remove the hilight path.
 * Default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.removeBrickHilight_ = eYo.Do.nothing

/**
 * Add the select path.
 * Default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.addSelect_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.removeSelect_ = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.addBlockConnection_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.removeBlockConnection_ = eYo.Do.nothing

/**
 * The svg group has an `eyo-top` class.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.addStatusTop_ = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.removeStatusTop_ = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.addStatusFocus_ = eYo.Do.nothing

/**
 * Reverse `nodeAddStatusFocus_`.
 * Default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.removeStatusFocus_ = eYo.Do.nothing

/**
 * Set the displayed status of the given node.
 * Default implementation does nothing.
 * @param {Object} node  the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.NS_Fcls.Brick.prototype.displayedSet = eYo.Do.nothing

/**
 * Make the given field disabled eventually.
 * @param {Object} node  the node the driver acts on
 */
eYo.NS_Fcls.Brick.prototype.updateDisabled = eYo.Do.nothing
