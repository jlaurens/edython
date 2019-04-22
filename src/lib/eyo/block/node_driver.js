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

goog.provide('eYo.Driver')

goog.require('eYo.Node')

/**
 * Rendering driver to help the renderer
 * @constructor
 * @readonly
 */
eYo.Node.Driver = function() {
}

/**
 * The default implementation does nothing.
 */
eYo.Node.Driver.dispose = eYo.Do.nothing

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
eYo.Node.Driver.getBBox = function (node) {
  return undefined
}

/**
 * Whether the node is visually selected.
 * The default implementation returns false.
 * @param {!Object} node  the node the driver acts on
 * @private
 */
eYo.Node.Driver.hasSelect = function (node) {
  return false
}

/**
 * Prepares the various paths.
 * @param {*} recorder
 * @private
 */
eYo.Node.Driver.willRender = function (recorder) {
}

/**
 * Draw the path of the block.
 * @param {Object} recorder
 * @private
 */
eYo.Node.Driver.draw = function (recorder) {
}

/**
 * Compute the paths of the block depending on its size.
 * Default implementation does nothing.
 */
eYo.Node.Driver.updateShape = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {Object} recorder 
 * @private
 */
eYo.Node.Driver.drawModelEnd = eYo.Do.nothing

/**
 * Hide the block. Default implementation does nothing.
 * @param {?Object} recorder 
 * @private
 */
eYo.Node.Driver.hide = eYo.Do.nothing

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
eYo.Node.Driver.Svg.fieldTextErase = eYo.Do.nothing

/**
 * Display the field text.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Node.Driver.Svg.fieldTextDisplay = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Renderer.prototype.fieldSetVisualAttribute = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Renderer.prototype.fieldEditorResize = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.Node.Driver.parentWillChange = eYo.Do.nothing

/**
 * Prepare the given slot.
 * The default implementation does nothing.
 * @param {!eYo.Slot} slot  slot to be prepared.
 */
eYo.Node.Driver.slotPrepare = eYo.Do.nothing

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
eYo.Renderer.prototype.fieldWidgetDisposeCallback = function (field) {
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
 * Dispose of the given slot's rendering resources.
 * Default implementation does nothing.
 * @param {eYo.Slot} slot
 */
eYo.Node.Driver.slotDispose = eYo.Do.nothing

/**
 * The default implementation does nothing.
 */
eYo.Node.Driver.updateDisabled = eYo.Do.nothing

/**
 * The default implementation does nothing.
 */
eYo.Node.Driver.connectionUIEffect = eYo.Do.nothing

/**
 * The default implementation does nothing.
 */
eYo.Node.Driver.showMenu = eYo.Do.nothing

/**
 * The default implementation does nothing.
 */
eYo.Node.Driver.highlightConnection = eYo.Do.nothing

/**
 * The default implementation does nothing.
 */
eYo.Node.Driver.makeBlockWrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 */
eYo.Node.Driver.duringBlockUnwrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 */
eYo.Node.Driver.sendToFront = eYo.Do.nothing

/**
 * The default implementation does nothing.
 */
eYo.Node.Driver.sendToBack = eYo.Do.nothing

/**
 * Set the offset of the receiver's node.
 * The default implementation does nothing.
 * @param {*} dx 
 * @param {*} dy 
 * @return {boolean}
 */
eYo.Node.Driver.setOffset = eYo.Do.nothing

/**
 * Called when the parent did just change.
 * Default implementation does nothing.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.Node.Driver.parentDidChange = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing
 */
eYo.Node.Driver.addBlockHilight_ = eYo.Do.nothing

/**
 * Remove the hilight path.
 * Default implementation does nothing.
 */
eYo.Node.Driver.removeBlockHilight_ = eYo.Do.nothing

/**
 * Add the select path.
 * Default implementation does nothing.
 */
eYo.Renderer.Svg.prototype.addBlockSelect_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 */
eYo.Node.Driver.removeBlockSelect_ = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing.
 */
eYo.Node.Driver.addBlockConnection_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 */
eYo.Node.Driver.removeBlockConnection_ = eYo.Do.nothing

/**
 * The svg group has an `eyo-top` class.
 */
eYo.Node.Driver.addStatusTop_ = eYo.Do.nothing

/**
 * The default implementation does nothing.
 */
eYo.Node.Driver.removeStatusTop_ = eYo.Do.nothing

/**
 * Default implementation does nothing.
 */
eYo.Node.Driver.addStatusSelect_ = eYo.Do.nothing

/**
 * Reverse `addStatusSelect_`.
 * Default implementation does nothing.
 */
eYo.Node.Driver.removeStatusSelect_ = eYo.Do.nothing

/**
 * Set the displayed status of the given node.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.Node.Driver.Svg.nodeSetDisplayed = eYo.Do.nothing
