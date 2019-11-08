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

goog.require('eYo.Driver')

goog.provide('eYo.Driver.brick')

/**
 * Shared brick driver.
 */
eYo.Driver.brick = Object.create({
  init: eYo.Do.nothing,
  dispose: eYo.Do.nothing,
})


/**
 * Returns the bounding box of the node.
 * Defaults implementation returns `eYo.VOID`.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.brickGetBBox = function (node) {
  return eYo.VOID
}

/**
 * Whether the node is visually selected.
 * The default implementation returns false.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.brickHasFocus = function (node) {
  return false
}

/**
 * Before node rendering.
 * @param {!Object} node  the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Driver.brickWillRender = eYo.Do.nothing

/**
 * After node rendering.
 * @param {!Object} node  the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Driver.brickDidRender = eYo.Do.nothing

/**
 * Draw the path of the brick.
 * @param {!Object} node  the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.Driver.brickDraw = function (node, recorder) {
}

/**
 * Compute the paths of the brick depending on its size.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickUpdateShape = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.Driver.brickDrawModelBegin = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.Driver.brickDrawModelEnd = eYo.Do.nothing

/**
 * Get the displayed status of the given node.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickDisplayedGet = eYo.Do.nothing

/**
 * Set the displayed status of the given node.
 * @param {!Object} node  the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.Driver.brickDisplayedSet = eYo.Do.nothing

/**
 * Translates the brick, forwards to the ui driver.
 * @param {number} x The x coordinate of the translation in board units.
 * @param {number} y The y coordinate of the translation in board units.
 */
eYo.Driver.brickMoveTo = eYo.Do.nothing

/**
 * Return the coordinates of the top-left corner of this brick relative to the
 * drawing surface's origin (0,0), in board units.
 * If the brick is on the board, (0, 0) is the origin of the board
 * coordinate system.
 * This does not change with board scale.
 * @return {!eYo.Where} Object with .x and .y properties in
 *     board coordinates.
 */
eYo.Driver.brickWhereInBoard = eYo.Do.nothing
