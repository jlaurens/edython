goog.provide('Blockly.BlockDraggerFix')

goog.require('Blockly.BlockDragger')
goog.require('Blockly.BlockSvg.render')
goog.require('Blockly.BlockDraggerFix')

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
