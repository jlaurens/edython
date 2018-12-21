// Remove this file when done
// copy and override functions here.

/**
 * Start dragging a block.  This includes moving it to the drag surface.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @param {boolean} healStack whether or not to heal the stack after disconnecting
 * @package
 */
Blockly.BlockDragger.prototype.startBlockDrag = (() => {
  var startBlockDrag = Blockly.BlockDragger.prototype.startBlockDrag
  var getMatrix = (str) => {
    var values = str.split(/\s*,\s*|\)\s*|.*\(/)
    if (values.length > 6) {
      return {
        a11: parseFloat(values[1]),
        a21: parseFloat(values[2]),
        a12: parseFloat(values[3]),
        a22: parseFloat(values[4]),
        b1: parseFloat(values[5]),
        b2: parseFloat(values[6])
      }
    }
  }
  var getInverse = (A) => {
    var det = A.a11 * A.a22 - A.a21 * A.a12
    if (det) {
      var B = {
        a11: A.a22 / det,
        a21: -A.a12 / det,
        a12: -A.a21 / det,
        a22: A.a11 / det
      }
      B.b1 = - B.a11 * A.b1 - B.a12 * A.b2
      B.b2 = - B.a21 * A.b1 - B.a22 * A.b2
      return B
    }
  }
  var getCompose = (A, B) => {
    return {
      a11: A.a11 * B.a11 + A.a12 * B.a21,
      a21: A.a21 * B.a11 + A.a22 * B.a21,
      a12: A.a11 * B.a12 + A.a12 * B.a22,
      a22: A.a21 * B.a12 + A.a22 * B.a22,
      b1: A.a11 * B.b1 + A.a12 * B.b2 + A.b1,
      b2: A.a21 * B.b1 + A.a22 * B.b2 + A.b2,
    }
  }
  var getCumulated = (div) => {
    var A
    var parent
    while ((parent = div.parentNode)) {
      var style = window.getComputedStyle(div, null)
      var transform = style.getPropertyValue("transform") ||
        style.getPropertyValue("-webkit-transform") ||
        style.getPropertyValue("-moz-transform") ||
        style.getPropertyValue("-ms-transform") ||
        style.getPropertyValue("-o-transform")
      var B = getMatrix(transform)
      console.error(transform, B)
      if (B) {
        A = A ? getCompose(B, A) : B
      }
      div = parent
    }
    return A
  }
  var getTransform = (block) => {
    var div = block.workspace.svgGroup_.parentNode.parentNode
    var A = getCumulated(div)
    if (A) {
      B = getInverse(A)
    if (B) {
      return (xy) => {
        return {
          x: B.a11 * xy.x + B.a12 * xy.y + B.b1,
          y: B.a21 * xy.x + B.a22 * xy.y + B.b2
        }
      }
    }
    }
  }
  return function(currentDragDeltaXY, healStack) {
    this.eyo_transformCorrection = getTransform(this.draggingBlock_)
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
    if (this.eyo_transformCorrection) {
      currentDragDeltaXY = this.eyo_transformCorrection(currentDragDeltaXY)
    }
    return dragBlock.call(this, e, currentDragDeltaXY)
  }
})()
