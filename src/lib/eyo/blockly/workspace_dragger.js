/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
