
/**
 * @fileoverview Methods for dragging a workspace visually,
 * patch to take transforms into account.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('eYo.WorkspaceDragger');
goog.require('Blockly.WorkspaceDragger');

/**
 * Start dragging the workspace.
 * @package
 */
Blockly.WorkspaceDragger.prototype.startDrag = (() => {
  var startDrag = Blockly.WorkspaceDragger.prototype.startDrag
  return function() {
    var element = this.workspace_.svgGroup_.parentNode.parentNode
    this.eyo_transformCorrection = eYo.Do.getTransformCorrection(element)
    return startDrag.call(this)
  }
})()

/**
 * Finish dragging the workspace and put everything back where it belongs.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
Blockly.WorkspaceDragger.prototype.endDrag = (() => {
  var endDrag = Blockly.WorkspaceDragger.prototype.endDrag
  return function(currentDragDeltaXY) {
    if (currentDragDeltaXY && this.eyo_transformCorrection) {
      currentDragDeltaXY = this.eyo_transformCorrection(currentDragDeltaXY)
      this.eyo_transformCorrection = null
    }
    return endDrag.call(this, currentDragDeltaXY)
  }
})()

/**
 * Move the workspace based on the most recent mouse movements.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
Blockly.WorkspaceDragger.prototype.drag = (() => {
  var drag = Blockly.WorkspaceDragger.prototype.drag
  return function(currentDragDeltaXY) {
    if (currentDragDeltaXY && this.eyo_transformCorrection) {
      currentDragDeltaXY = this.eyo_transformCorrection(currentDragDeltaXY)
    }
    return drag.call(this, currentDragDeltaXY)
  }
})()
