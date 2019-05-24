/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview An SVG that floats on top of the workspace.
 * Bricks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated using css translation instead of SVG so the
 * blocks are never repainted during drag improving performance.
 * katelyn@google.com (Katelyn Mann)
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

'use strict';

goog.provide('eYo.WorkspaceDragSurfaceSvg');

goog.require('Blockly.utils');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


/**
 * @param {!Element} container Containing element.
 * @constructor
 */
eYo.WorkspaceDragSurfaceSvg = function(container) {
  this.container_ = container;
  this.createDom();
};

/**
 * The SVG drag surface. Set once by eYo.WorkspaceDragSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
eYo.WorkspaceDragSurfaceSvg.prototype.SVG_ = null;

/**
 * SVG group inside the drag surface that holds blocks while a drag is in
 * progress. Blocks are moved here by the workspace at start of a drag and moved
 * back into the main SVG at the end of a drag.
 *
 * @type {Element}
 * @private
 */
eYo.WorkspaceDragSurfaceSvg.prototype.dragGroup_ = null;

/**
 * Containing HTML element; parent of the workspace and the drag surface.
 * @type {Element}
 * @private
 */
eYo.WorkspaceDragSurfaceSvg.prototype.container_ = null;

/**
 * Create the drag surface and inject it into the container.
 */
eYo.WorkspaceDragSurfaceSvg.prototype.createDom = function() {
  if (this.SVG_) {
    return;  // Already created.
  }
  /**
  * Dom structure when the workspace is being dragged. If there is no drag in
  * progress, the SVG is empty and display: none.
  * <svg class="blocklyWsDragSurface" style=transform:translate3d(...)>
  *   <g class="eyo-brick-canvas"></g>
  * </svg>
  */
  this.SVG_ = eYo.Svg.newElement('svg', {
    'xmlns:html': Blockly.HTML_NS,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklyWsDragSurface blocklyOverflowVisible'
  }, this.container_)
}

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {number} x X translation for the entire surface
 * @param {number} y Y translation for the entire surface
 * @package
 */
eYo.WorkspaceDragSurfaceSvg.prototype.translateSurface = function(x, y) {
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being moved on the drag surface.
  var fixedX = x.toFixed(0);
  var fixedY = y.toFixed(0);

  this.SVG_.style.display = 'block';
  Blockly.utils.setCssTransform(
      this.SVG_, 'translate3d(' + fixedX + 'px, ' + fixedY + 'px, 0px)');
};

/**
 * Reports the surface translation in scaled workspace coordinates.
 * Use this when finishing a drag to return blocks to the correct position.
 * @return {!goog.math.Coordinate} Current translation of the surface
 * @package
 */
eYo.WorkspaceDragSurfaceSvg.prototype.getSurfaceTranslation = function() {
  return Blockly.utils.getRelativeXY(this.SVG_);
};

/**
 * Move the blockCanvas out of the surface SVG and on to
 * newSurface.
 * @param {SVGElement} newSurface The element to put the drag surface contents
 *     into.
 * @package
 */
eYo.WorkspaceDragSurfaceSvg.prototype.clearAndHide = function(newSurface) {
  if (!newSurface) {
    throw 'Couldn\'t clear and hide the drag surface: missing new surface.';
  }
  var blockCanvas = this.SVG_.childNodes[0];

  // If there is a previous sibling, put the blockCanvas back right afterwards,
  // otherwise insert it as the first child node in newSurface.
  if (this.previousSibling_ != null) {
    Blockly.utils.insertAfter_(blockCanvas, this.previousSibling_);
  } else {
    newSurface.insertBefore(blockCanvas, newSurface.firstChild);
  }

  // Hide the drag surface.
  this.SVG_.style.display = 'none';
  goog.asserts.assert(
      this.SVG_.childNodes.length == 0, 'Drag surface was not cleared.');
  Blockly.utils.setCssTransform(this.SVG_, '');
  this.previousSibling_ = null;
};

/**
 * Set the SVG to have the block canvas in it and then
 * show the surface.
 * @param {!Element} blockCanvas The block canvas <g> element from the workspace.
 * @param {?Element} previousSibling The element to insert the block canvas after when it goes back in the DOM at the end of a drag.
 * @param {number} width The width of the workspace SVG element.
 * @param {number} height The height of the workspace SVG element.
 * @param {number} scale The scale of the workspace being dragged.
 * @package
 */
eYo.WorkspaceDragSurfaceSvg.prototype.setContentsAndShow = function(
    blockCanvas, previousSibling, width, height, scale) {
  goog.asserts.assert(
      this.SVG_.childNodes.length == 0, 'Already dragging a block.');
  this.previousSibling_ = previousSibling;
  // Make sure the blocks canvas is scaled appropriately.
  blockCanvas.setAttribute('transform', 'translate(0, 0) scale(' + scale + ')')
  this.SVG_.setAttribute('width', width);
  this.SVG_.setAttribute('height', height);
  this.SVG_.appendChild(blockCanvas);
  this.SVG_.style.display = 'block';
};

goog.provide('eYo.BrickDragSurfaceSvg');
goog.require('Blockly.utils');
goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


/**
 * Class for a drag surface for the currently dragged block. This is a separate
 * SVG that contains only the currently moving block, or nothing.
 * @param {!Element} container Containing element.
 * @constructor
 */
eYo.BrickDragSurfaceSvg = function(container) {
  /**
   * @type {!Element}
   * @private
   */
  this.container_ = container;
  this.createDom();
};

/**
 * The SVG drag surface. Set once by eYo.BrickDragSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
eYo.BrickDragSurfaceSvg.prototype.SVG_ = null;

/**
 * This is where blocks live while they are being dragged if the drag surface
 * is enabled.
 * @type {Element}
 * @private
 */
eYo.BrickDragSurfaceSvg.prototype.dragGroup_ = null;

/**
 * Containing HTML element; parent of the workspace and the drag surface.
 * @type {Element}
 * @private
 */
eYo.BrickDragSurfaceSvg.prototype.container_ = null;

/**
 * Cached value for the scale of the drag surface.
 * Used to set/get the correct translation during and after a drag.
 * @type {number}
 * @private
 */
eYo.BrickDragSurfaceSvg.prototype.scale_ = 1;

/**
 * Cached value for the translation of the drag surface.
 * This translation is in pixel units, because the scale is applied to the
 * drag group rather than the top-level SVG.
 * @type {goog.math.Coordinate}
 * @private
 */
eYo.BrickDragSurfaceSvg.prototype.surfaceXY_ = null;

/**
 * Create the drag surface and inject it into the container.
 */
eYo.BrickDragSurfaceSvg.prototype.createDom = function() {
  if (this.SVG_) {
    return;  // Already created.
  }
  this.SVG_ = Blockly.utils.createSvgElement('svg', {
    'xmlns': Blockly.SVG_NS,
    'xmlns:html': Blockly.HTML_NS,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklyBlockDragSurface'
  }, this.container_);
  this.dragGroup_ = Blockly.utils.createSvgElement('g', {}, this.SVG_);
};

/**
 * Set the SVG blocks on the drag surface's group and show the surface.
 * Only one block group should be on the drag surface at a time.
 * @param {!Element} blocks Block or group of blocks to place on the drag
 * surface.
 */
eYo.BrickDragSurfaceSvg.prototype.setBlocksAndShow = function(blocks) {
  goog.asserts.assert(
      this.dragGroup_.childNodes.length == 0, 'Already dragging a block.');
  // appendChild removes the blocks from the previous parent
  this.dragGroup_.appendChild(blocks);
  this.SVG_.style.display = 'block';
  this.surfaceXY_ = new goog.math.Coordinate(0, 0);
};

/**
 * Translate and scale the entire drag surface group to the given position, to
 * keep in sync with the workspace.
 * @param {number} x X translation in workspace coordinates.
 * @param {number} y Y translation in workspace coordinates.
 * @param {number} scale Scale of the group.
 */
eYo.BrickDragSurfaceSvg.prototype.translateAndScaleGroup = function(x, y, scale) {
  this.scale_ = scale;
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being dragged on the drag surface.
  var fixedX = x.toFixed(0);
  var fixedY = y.toFixed(0);
  this.dragGroup_.setAttribute('transform',
      'translate('+ fixedX + ','+ fixedY + ') scale(' + scale + ')');
};

/**
 * Translate the drag surface's SVG based on its internal state.
 * @private
 */
eYo.BrickDragSurfaceSvg.prototype.translateSurfaceInternal_ = function() {
  var x = this.surfaceXY_.x;
  var y = this.surfaceXY_.y;
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being dragged on the drag surface.
  x = x.toFixed(0);
  y = y.toFixed(0);
  this.SVG_.style.display = 'block';

  Blockly.utils.setCssTransform(this.SVG_,
      'translate3d(' + x + 'px, ' + y + 'px, 0px)');
};

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {number} x X translation for the entire surface.
 * @param {number} y Y translation for the entire surface.
 */
eYo.BrickDragSurfaceSvg.prototype.translateSurface = function(x, y) {
  this.surfaceXY_ = new goog.math.Coordinate(x * this.scale_, y * this.scale_);
  this.translateSurfaceInternal_();
};

/**
 * Reports the surface translation in scaled workspace coordinates.
 * Use this when finishing a drag to return blocks to the correct position.
 * @return {!goog.math.Coordinate} Current translation of the surface.
 */
eYo.BrickDragSurfaceSvg.prototype.getSurfaceTranslation = function() {
  var xy = Blockly.utils.getRelativeXY(this.SVG_);
  return new goog.math.Coordinate(xy.x / this.scale_, xy.y / this.scale_);
};

/**
 * Provide a reference to the drag group (primarily for
 * BlockSvg.getRelativeToSurfaceXY).
 * @return {Element} Drag surface group element.
 */
eYo.BrickDragSurfaceSvg.prototype.getGroup = function() {
  return this.dragGroup_;
};

/**
 * Get the current blocks on the drag surface, if any (primarily
 * for BlockSvg.getRelativeToSurfaceXY).
 * @return {!Element|undefined} Drag surface block DOM element, or undefined
 * if no blocks exist.
 */
eYo.BrickDragSurfaceSvg.prototype.getCurrentBlock = function() {
  return this.dragGroup_.firstChild;
};

/**
 * Clear the group and hide the surface; move the blocks off onto the provided
 * element.
 * If the block is being deleted it doesn't need to go back to the original
 * surface, since it would be removed immediately during dispose.
 * @param {Element=} opt_newSurface Surface the dragging blocks should be moved
 *     to, or null if the blocks should be removed from this surface without
 *     being moved to a different surface.
 */
eYo.BrickDragSurfaceSvg.prototype.clearAndHide = function(opt_newSurface) {
  if (opt_newSurface) {
    // appendChild removes the node from this.dragGroup_
    opt_newSurface.appendChild(this.getCurrentBlock());
  } else {
    this.dragGroup_.removeChild(this.getCurrentBlock());
  }
  this.SVG_.style.display = 'none';
  goog.asserts.assert(
      this.dragGroup_.childNodes.length == 0, 'Drag group was not cleared.');
  this.surfaceXY_ = null;
};
