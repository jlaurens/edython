/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Node.Driver')

goog.require('eYo.Node')
goog.require('eYo.Do')

/**
 * Rendering driver to help the renderer
 * @constructor
 * @readonly
 */
eYo.Node.Driver = function() {
}

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeDispose = eYo.Do.nothing

Object.defineProperties(eYo.Node.Driver, {
  renderer: {
    get() {
      return this.node.renderer
    }
  }
})

/**
 * Returns the bounding box of the node.
 * Defaults implementation returns `undefined`.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Node.Driver.nodeGetBBox = function (node) {
  return undefined
}

/**
 * Whether the node is visually selected.
 * The default implementation returns false.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Node.Driver.nodeHasSelect = function (node) {
  return false
}

/**
 * Prepares the various paths.
 * @param {!Object} node  the node the driver acts on
 * @param {*} recorder
 * @private
 */
eYo.Node.Driver.nodeWillRender = function (node, recorder) {
}

/**
 * Draw the path of the block.
 * @param {!Object} node  the node the driver acts on
 * @param {Object} recorder
 * @private
 */
eYo.Node.Driver.nodeDraw = function (node, recorder) {
}

/**
 * Compute the paths of the block depending on its size.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeUpdateShape = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {Object} recorder 
 * @private
 */
eYo.Node.Driver.nodeDrawModelEnd = eYo.Do.nothing

/**
 * Hide the block. Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {?Object} recorder 
 * @private
 */
eYo.Node.Driver.nodeHide = eYo.Do.nothing

/**
 * Hide the given field. Default implementation forwards to the driver's eponym method.
 * @param {Object} field  the field to hide.
 * @param {?Object} recorder 
 * @private
 */
eYo.Node.Driver.fieldHide = eYo.Do.nothing

/**
 * The field text will change.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Node.Driver.fieldTextErase = eYo.Do.nothing

/**
 * Display the field text.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Node.Driver.fieldTextDisplay = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Node.Driver.prototype.fieldSetVisualAttribute = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Node.Driver.prototype.fieldEditorResize = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.Node.Driver.nodeParentWillChange = eYo.Do.nothing

/**
 * Prepare the given slot.
 * The default implementation does nothing.
 * @param {!eYo.Slot} slot  slot to be prepared.
 */
eYo.Node.Driver.slotInit = eYo.Do.nothing

/**
 * Dispose of the given slot's rendering resources.
 * Default implementation does nothing.
 * @param {eYo.Slot} slot
 */
eYo.Node.Driver.slotDispose = eYo.Do.nothing

/**
 * Prepare the given label field.
 * The default implementation does nothing.
 * @param {!eYo.Field} field  field to be prepared.
 */
eYo.Node.Driver.fieldInit = eYo.Do.nothing

/**
 * Dispose of the given field's rendering resources.
 * Default implementation does nothing.
 * @param {!Object} field
 */
eYo.Node.Driver.fieldDispose = eYo.Do.nothing

/**
 * Show the inline editor.
 * Default implementation does nothing.
 * @param {!Object} field
 * @param {boolean} quietInput
 */
eYo.Node.Driver.fieldInlineEditorShow = eYo.Do.nothing

/**
 * Update the inline editor.
 * Default implementation does nothing.
 * @param {!Object} field
 */
eYo.Node.Driver.fieldInlineEditorUpdate = eYo.Do.nothing

/**
 * Callback at widget disposal.
 * Forwards to the driver.
 * @param {*} field
 */
eYo.Node.Driver.prototype.fieldWidgetDisposeCallback = function (field) {
  return eYo.Do.nothing
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Node.Driver.fieldMakeReserved = eYo.Do.nothing

/**
 * Make the given field an error.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Node.Driver.fieldMakeError = eYo.Do.nothing

/**
 * Make the given field a placeholder.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Node.Driver.fieldMakePlaceholder = eYo.Do.nothing

/**
 * Make the given field a comment.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Node.Driver.fieldMakeComment = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeUpdateDisabled = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeConnectionUIEffect = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {!Object} menu
 */
eYo.Node.Driver.nodeMenuShow = eYo.Do.nothing

/**
 * Hilight the given connection.
 * The default implementation does nothing.
 * @param {*} c_eyo
 */
eYo.Node.Driver.connectionHilight = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeMakeWrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeDuringUnwrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeSendToFront = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeSendToBack = eYo.Do.nothing

/**
 * Set the offset of the receiver's node.
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {*} dx 
 * @param {*} dy 
 * @return {boolean}
 */
eYo.Node.Driver.nodeSetOffset = eYo.Do.nothing

/**
 * Called when the parent did just change.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.Node.Driver.nodeParentDidChange = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeAddBlockHilight_ = eYo.Do.nothing

/**
 * Remove the hilight path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeRemoveBlockHilight_ = eYo.Do.nothing

/**
 * Add the select path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.prototype.nodeAddBlockSelect_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeRemoveBlockSelect_ = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeAddBlockConnection_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeRemoveBlockConnection_ = eYo.Do.nothing

/**
 * The svg group has an `eyo-top` class.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeAddStatusTop_ = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeRemoveStatusTop_ = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeAddStatusSelect_ = eYo.Do.nothing

/**
 * Reverse `nodeAddStatusSelect_`.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeRemoveStatusSelect_ = eYo.Do.nothing

/**
 * Set the displayed status of the given node.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.Node.Driver.nodeSetDisplayed = eYo.Do.nothing

/**
 * Make the given field disabled eventually.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Node.Driver.nodeUpdateDisabled = eYo.Do.nothing

