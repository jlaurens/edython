/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Driver')

goog.forwardDeclare('eYo.UI')

goog.require('eYo.Do')

/**
 * Rendering driver to help the renderer
 * @constructor
 * @readonly
 */
eYo.Driver = function() {
}

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickDispose = eYo.Do.nothing

/**
 * Returns the bounding box of the node.
 * Defaults implementation returns `undefined`.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.brickGetBBox = function (node) {
  return undefined
}

/**
 * Whether the node is visually selected.
 * The default implementation returns false.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.brickHasSelect = function (node) {
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
eYo.Driver.prototype.brickDisplayedGet = eYo.Do.nothing

/**
 * Set the displayed status of the given node.
 * @param {!Object} node  the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.Driver.prototype.brickDisplayedSet = eYo.Do.nothing

/**
 * Translates the brick, forwards to the ui driver.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 */
eYo.Driver.prototype.brickTranslate = eYo.Do.nothing

/**
 * Return the coordinates of the top-left corner of this brick relative to the
 * drawing surface's origin (0,0), in workspace units.
 * If the brick is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!goog.math.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 */
eYo.Driver.prototype.brickXYInSurface = eYo.Do.nothing

/**
 * Set the location.
 * @param {*} field
 * @param {*} where
 */
eYo.Driver.prototype.fieldPositionSet = eYo.Do.nothing

/**
 * The field text will change.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Driver.fieldTextRemove = eYo.Do.nothing

/**
 * Display the field text.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Driver.fieldTextCreate = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Driver.prototype.fieldSetVisualAttribute = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Driver.prototype.fieldInlineEditorResize = eYo.Do.nothing

/**
 * Whether the field is displayed.
 * @param {!Object} field  the field to query about
 */
eYo.Driver.prototype.fieldDisplayedGet = eYo.Do.nothing

/**
 * Display/hide the given field.
 * @param {!Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.prototype.fieldDisplayedSet = eYo.Do.nothing

/**
 * Display/hide the given field, according to its `isVisible` status.
 * @param {!Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.prototype.fieldDisplayedUpdate = eYo.Do.nothing

/**
 * Whether the slot is displayed.
 * @param {!Object} slot  the slot to query about
 */
eYo.Driver.prototype.slotDisplayedGet = eYo.Do.nothing

/**
 * Display/hide the given slot.
 * @param {!Object} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.prototype.slotDisplayedSet = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.Driver.brickParentWillChange = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Blockly.Block} oldParent replaced.
 */
eYo.Driver.brickParentDidChange = eYo.Do.nothing

/**
 * Prepare the given slot.
 * The default implementation does nothing.
 * @param {!eYo.Slot} slot  slot to be prepared.
 */
eYo.Driver.slotInit = eYo.Do.nothing

/**
 * Dispose of the given slot's rendering resources.
 * Default implementation does nothing.
 * @param {eYo.Slot} slot
 */
eYo.Driver.slotDispose = eYo.Do.nothing

/**
 * Prepare the given label field.
 * The default implementation does nothing.
 * @param {!eYo.Field} field  field to be prepared.
 */
eYo.Driver.fieldInit = eYo.Do.nothing

/**
 * Dispose of the given field's rendering resources.
 * Default implementation does nothing.
 * @param {!Object} field
 */
eYo.Driver.fieldDispose = eYo.Do.nothing

/**
 * Update the inline editor.
 * Default implementation does nothing.
 * @param {!Object} field
 */
eYo.Driver.fieldInlineEditorUpdate = eYo.Do.nothing

/**
 * Callback at widget disposal.
 * Forwards to the driver.
 * @param {*} field
 */
eYo.Driver.prototype.fieldWidgetDisposeCallback = function (field) {
  return eYo.Do.nothing
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.fieldMakeReserved = eYo.Do.nothing

/**
 * Make the given field an error.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.fieldMakeError = eYo.Do.nothing

/**
 * Make the given field a placeholder.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.fieldMakePlaceholder = eYo.Do.nothing

/**
 * Make the given field a comment.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.fieldMakeComment = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickUpdateDisabled = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.blockConnectEffect = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {!Object} menu
 */
eYo.Driver.brickMenuShow = eYo.Do.nothing

/**
 * Hilight the given connection.
 * The default implementation does nothing.
 * @param {*} c_eyo
 */
eYo.Driver.magnetHilight = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickMakeWrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickMakeUnwrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickSendToFront = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickSendToBack = eYo.Do.nothing

/**
 * Set the offset of the receiver's node.
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {*} dx
 * @param {*} dy
 * @return {boolean}
 */
eYo.Driver.brickSetOffset = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickAddBlockHilight_ = eYo.Do.nothing

/**
 * Remove the hilight path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickRemoveBlockHilight_ = eYo.Do.nothing

/**
 * Add the select path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickAddSelect_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickRemoveSelect_ = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickAddBlockConnection_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickRemoveBlockConnection_ = eYo.Do.nothing

/**
 * The svg group has an `eyo-top` class.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickAddStatusTop_ = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickRemoveStatusTop_ = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickAddStatusSelect_ = eYo.Do.nothing

/**
 * Reverse `nodeAddStatusSelect_`.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickRemoveStatusSelect_ = eYo.Do.nothing

/**
 * Set the displayed status of the given node.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.Driver.brickDisplayedSet = eYo.Do.nothing

/**
 * Make the given field disabled eventually.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickUpdateDisabled = eYo.Do.nothing

/**
 * Set the display mode for bricks.
 * @param {!String} mode  The display mode for bocks.
 */
eYo.Driver.setBlockDisplayMode = eYo.Do.nothing

