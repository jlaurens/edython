/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate. In progress.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Driver')

goog.require('eYo')

goog.forwardDeclare('eYo.Factory')
goog.forwardDeclare('eYo.Brick.UI')

goog.require('eYo.Do')

/**
 * Rendering driver to help the renderer
 * @param {!eYo.Factory} factory
 * @constructor
 * @readonly
 */
eYo.Driver = function(factory) {
  this.factory_ = factory
}

/**
 * Sever links.
 */
eYo.Driver.prototype.dispose = function () {
  this.factory_ = null
}

/**
 * Returns the bounding box of the node.
 * Defaults implementation returns `undefined`.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.prototype.brickGetBBox = function (node) {
  return undefined
}

/**
 * Whether the node is visually selected.
 * The default implementation returns false.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Driver.prototype.brickHasSelect = function (node) {
  return false
}

/**
 * Before node rendering.
 * @param {!Object} node  the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Driver.prototype.brickWillRender = eYo.Do.nothing

/**
 * After node rendering.
 * @param {!Object} node  the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Driver.prototype.brickDidRender = eYo.Do.nothing

/**
 * Draw the path of the brick.
 * @param {!Object} node  the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.Driver.prototype.brickDraw = function (node, recorder) {
}

/**
 * Compute the paths of the brick depending on its size.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickUpdateShape = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.Driver.prototype.brickDrawModelBegin = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.Driver.prototype.brickDrawModelEnd = eYo.Do.nothing

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
eYo.Driver.prototype.brickMoveTo = eYo.Do.nothing

/**
 * Return the coordinates of the top-left corner of this brick relative to the
 * drawing surface's origin (0,0), in workspace units.
 * If the brick is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!goog.math.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 */
eYo.Driver.prototype.brickXYInWorkspace = eYo.Do.nothing

/**
 * Set the location.
 * @param {*} field
 * @param {*} where
 */
eYo.Driver.prototype.fieldMoveTo = eYo.Do.nothing

/**
 * The field text will change.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Driver.prototype.fieldTextRemove = eYo.Do.nothing

/**
 * Display the field text.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Driver.prototype.fieldTextCreate = eYo.Do.nothing

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
 * Display/hide the given field, according to its `visible` status.
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
 * @param {!eYo.Brick} newParent to be connected.
 */
eYo.Driver.prototype.brickParentWillChange = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!eYo.Brick} oldParent replaced.
 */
eYo.Driver.prototype.brickParentDidChange = eYo.Do.nothing

/**
 * Prepare the given slot.
 * The default implementation does nothing.
 * @param {!eYo.Slot} slot  slot to be prepared.
 */
eYo.Driver.prototype.slotInit = eYo.Do.nothing

/**
 * Dispose of the given slot's rendering resources.
 * Default implementation does nothing.
 * @param {eYo.Slot} slot
 */
eYo.Driver.prototype.slotDispose = eYo.Do.nothing

/**
 * Prepare the given label field.
 * The default implementation does nothing.
 * @param {!eYo.Field} field  field to be prepared.
 */
eYo.Driver.prototype.fieldInit = eYo.Do.nothing

/**
 * Dispose of the given field's rendering resources.
 * Default implementation does nothing.
 * @param {!Object} field
 */
eYo.Driver.prototype.fieldDispose = eYo.Do.nothing

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
eYo.Driver.prototype.fieldMakeReserved = eYo.Do.nothing

/**
 * Make the given field an error.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.prototype.fieldMakeError = eYo.Do.nothing

/**
 * Make the given field a placeholder.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.prototype.fieldMakePlaceholder = eYo.Do.nothing

/**
 * Make the given field a comment.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.prototype.fieldMakeComment = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickUpdateDisabled = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.blockConnectEffect = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {!Object} menu
 */
eYo.Driver.prototype.brickMenuShow = eYo.Do.nothing

/**
 * Hilight the given connection.
 * The default implementation does nothing.
 * @param {*} c_eyo
 */
eYo.Driver.prototype.magnetHilight = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickMakeWrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickMakeUnwrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickSendToFront = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickSendToBack = eYo.Do.nothing

/**
 * Set the offset of the receiver's node.
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {*} dx
 * @param {*} dy
 * @return {boolean}
 */
eYo.Driver.prototype.brickSetOffset = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickAddBrickHilight_ = eYo.Do.nothing

/**
 * Remove the hilight path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickRemoveBrickHilight_ = eYo.Do.nothing

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
eYo.Driver.prototype.brickRemoveSelect_ = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickAddBlockConnection_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickRemoveBlockConnection_ = eYo.Do.nothing

/**
 * The svg group has an `eyo-top` class.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickAddStatusTop_ = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickRemoveStatusTop_ = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickAddStatusSelect_ = eYo.Do.nothing

/**
 * Reverse `nodeAddStatusSelect_`.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickRemoveStatusSelect_ = eYo.Do.nothing

/**
 * Set the displayed status of the given node.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.Driver.prototype.brickDisplayedSet = eYo.Do.nothing

/**
 * Make the given field disabled eventually.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.prototype.brickUpdateDisabled = eYo.Do.nothing

/**
 * Set the display mode for bricks.
 * @param {!String} mode  The display mode for bocks.
 */
eYo.Driver.prototype.setBlockDisplayMode = eYo.Do.nothing

