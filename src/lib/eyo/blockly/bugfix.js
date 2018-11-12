goog.provide('Blockly.BlockDraggerFix')

goog.require('Blockly.BlockDragger')
goog.require('Blockly.BlockSvg.render')
goog.require('Blockly.BlockDraggerFix')

/**
 * Finish a block drag and put the block back on the workspace.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 * @suppress {accessControls, duplicate}
 */
Blockly.BlockDragger.prototype.endBlockDrag = function (e, currentDragDeltaXY) {
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

/**
 * Handle a mouse move or touch move event.
 * @param {!Event} e A mouse move or touch move event.
 * @package
 */
Blockly.Gesture.prototype.handleMove = function(e) {
  this.updateFromEvent_(e);
  if (this.isDraggingWorkspace_) {
    this.workspaceDragger_.drag(this.currentDragDeltaXY_);
  } else if (this.isDraggingBlock_) {
    this.blockDragger_ && this.blockDragger_.dragBlock(this.mostRecentEvent_,
        this.currentDragDeltaXY_); // sometimes it fails
  } else if (this.isDraggingBubble_) {
    this.bubbleDragger_ && this.bubbleDragger_.dragBubble(this.mostRecentEvent_,
        this.currentDragDeltaXY_);
  }
  e.preventDefault();
  e.stopPropagation();
};

