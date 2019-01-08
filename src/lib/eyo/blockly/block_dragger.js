/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Methods for dragging a block visually with transform support.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('eYo.BlockDragger')

goog.require('Blockly.BlockDragger')

/**
 * Start dragging a block.  This includes moving it to the drag surface.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @param {boolean} healStack whether or not to heal the stack after disconnecting
 * @package
 */
Blockly.BlockDragger.prototype.startBlockDrag = (() => {
  var startBlockDrag = Blockly.BlockDragger.prototype.startBlockDrag
  return function(currentDragDeltaXY, healStack) {
    eYo.Selected.connection = null
    var element = this.draggingBlock_.workspace.svgGroup_.parentNode.parentNode
    this.eyo_transformCorrection = eYo.Do.getTransformCorrection(element)
    return startBlockDrag.call(this, currentDragDeltaXY, healStack)
  }
})()

/**
 * Execute a step of block dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.BlockDragger.prototype.dragBlock = (() => {
  var dragBlock = Blockly.BlockDragger.prototype.dragBlock
  return function(e, currentDragDeltaXY) {
    if (currentDragDeltaXY && this.eyo_transformCorrection) {
      currentDragDeltaXY = this.eyo_transformCorrection(currentDragDeltaXY)
    }
    return dragBlock.call(this, e, currentDragDeltaXY)
  }
})()

/**
 * Finish a block drag and put the block back on the workspace.
 * Takes the transform into account.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 * @suppress {accessControls, duplicate}
 */
Blockly.BlockDragger.prototype.endBlockDrag = function (e, currentDragDeltaXY) {
  // take the transform into account
  if (currentDragDeltaXY && this.eyo_transformCorrection) {
    currentDragDeltaXY = this.eyo_transformCorrection(currentDragDeltaXY)
    this.eyo_transformCorrection = null // !important
  }
  // Make sure internal state is fresh.
  this.dragBlock(e, currentDragDeltaXY)
  this.dragIconData_ = []

  Blockly.BlockSvg.disconnectUiStop_()

  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY)
  var newLoc = goog.math.Coordinate.sum(this.startXY_, delta)
  this.draggingBlock_.moveOffDragSurface_(newLoc)

  var deleted = this.maybeDeleteBlock_()
  if (!deleted) {
    // These are expensive and don't need to be done if we're deleting.
    this.draggingBlock_.moveConnections_(delta.x, delta.y)
    this.draggingBlock_.setDragging(false)
    this.fireMoveEvent_()// JL Fixed this
    this.draggedConnectionManager_.applyConnections()
    // Moving a block around will not cause rendering
    // because rendering does not depend on the position
    // except when connected / disconnectd but this is already managed
    this.draggingBlock_.render()
    this.draggingBlock_.scheduleSnapAndBump()
  }
  this.workspace_.setResizesEnabled(true)

  var toolbox = this.workspace_.getToolbox()
  if (toolbox) {
    var style = this.draggingBlock_.isDeletable() ? 'blocklyToolboxDelete'
      : 'blocklyToolboxGrab'
    toolbox.removeStyle(style)
  }
  Blockly.Events.setGroup(false)
}
