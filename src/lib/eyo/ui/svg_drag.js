/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview An SVG that floats on top of the board.
 * Bricks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated using css translation instead of SVG so the
 * blocks are never repainted during drag improving performance.
 * katelyn@google.com (Katelyn Mann)
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Svg.BoardDragSurface')
goog.provide('eYo.Svg.BrickDragSurface')

goog.require('eYo.Svg')

goog.forwardDeclare('goog.asserts')
goog.forwardDeclare('goog.math.Coordinate')


/**
 * Class for a drag surface for the currently dragged block. This is a separate
 * SVG that contains only the currently moving block, or nothing.
 * @param {!Element} container Containing element.
 * @constructor
 */
eYo.Svg.BrickDragSurface = function(container) {
  /**
   * @type {!Element}
   * @private
   */
  var dom = this.dom = Object.create(null)
  var svg = dom.svg = Object.create(null)
  var root = svg.root_ = eYo.Svg.newElement('svg', {
    xmlns: eYo.Dom.SVG_NS,
    'xmlns:html': eYo.Dom.HTML_NS,
    'xmlns:xlink': eYo.Dom.XLINK_NS,
    version: '1.1',
    class: 'eyo-brick-drag-surface'
  }, container)
  var g = svg.group_ = eYo.Svg.newElement('g', {
    class: 'eyo-brick-surface'
  }, root)
  svg.canvas_ = eYo.Svg.newElement('g', {
    class: 'eyo-brick-canvas'
  }, g)
}

/**
 * Sever all the links and remove dom nodes.
 */
eYo.Svg.BrickDragSurface.prototype.dispose = function() {
  this.dispose = eYo.Do.Nothing
  goog.dom.removeNode(this.dom.svg.root_)
  this.dom = null
}

Object.defineProperties(eYo.Svg.BrickDragSurface.prototype, {
  /**
   * Get the current blocks on the drag surface, if any (primarily
   * for BlockSvg.getRelativeToSurfaceXY).
   * @return {!Element|eYo.VOID} Drag surface block DOM element, or eYo.VOID
   * if no blocks exist.
   */
  brickGroup: {
    get () {
      return this.dom.svg.canvas_.firstChild
    }
  },
  /**
   * Cached value for the scale of the drag surface.
   * Used to set/get the correct translation during and after a drag.
   * @type {number}
   * @private
   */
  scale_: {
    value: 1,
    writable: true
  },
  /**
   * Cached value for the translation of the drag surface.
   * This translation is in pixel units, because the scale is applied to the
   * drag group rather than the top-level SVG.
   * @type {goog.math.Coordinate}
   * @private
   */
  surfaceXY_: {
    value: null,
    writable: true
  },
  /**
   * Reports the surface translation in scaled board coordinates.
   * Use this when finishing a drag to return blocks to the correct position.
   * @return {!goog.math.Coordinate} Current translation of the surface.
   */
  translation: {
    get () {
      var xy = eYo.Svg.getRelativeXY(this.dom.svg.root_)
      return new goog.math.Coordinate(
        xy.x / this.scale_,
        xy.y / this.scale_
      )
    }
  },
})

/**
 * Set the SVG block's group on the drag surface's group and show the surface.
 * @param {!Element} group Brick's group element.
 */
eYo.Svg.BrickDragSurface.prototype.show = function(blocks) {
  goog.asserts.assert(
      this.dom.svg.canvas_.childNodes.length == 0, 'Already dragging a block.');
  // appendChild removes the blocks from the previous parent
  this.dom.svg.canvas_.appendChild(blocks)
  this.dom.svg.root_.style.display = 'block'
  this.surfaceXY_ = new eYo.Where(0, 0)
}

/**
 * Translate and scale the entire drag surface group to the given position, to
 * keep in sync with the board.
 * @param {?number | eYo.Where} x X translation in board coordinates.
 * @param {?number} y Y translation in board coordinates, or scale.
 * @param {?number} scale Scale of the group.
 */
eYo.Svg.BrickDragSurface.prototype.xyMoveToAndScaleGroup = function(x = 0, y = 0, scale = 1) {
  if (x && goog.isDef(x.x)) {
    scale = y
    y = x.y
    x = x.x
  }
  this.scale_ = scale
  // This is a work-around to prevent bricks from rendering
  // fuzzy while dragged.
  var fixedX = x.toFixed(0)
  var fixedY = y.toFixed(0)
  this.dom.svg.canvas_.setAttribute(
    'transform',
    `translate(${fixedX},${fixedY}) scale(${scale})`
  )
}

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {number} x X translation for the entire surface.
 * @param {number} y Y translation for the entire surface.
 */
eYo.Svg.BrickDragSurface.prototype.xyMoveTo = function(x = 0, y = 0) {
  if (goog.isDef(x.x)) {
    y = x.y
    x = x.x
  }
  this.dom.svg.root_.style.display = 'block'
  this.surfaceXY_ = new goog.math.Coordinate(x * this.scale_, y * this.scale_)
  var x = this.surfaceXY_.x.toFixed(0)
  var y = this.surfaceXY_.y.toFixed(0)
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being dragged on the drag surface.
  var transform = `translate3d(${x}px,${y}px, 0px)`
  console.log('transform', transform)
  eYo.Dom.setCssTransform(
    this.dom.svg.root_,
    transform
  )
}

/**
 * Clear the group and hide the surface; move the blocks off onto the provided
 * element.
 * If the block is being deleted it doesn't need to go back to the original
 * surface, since it would be removed immediately during dispose.
 * @param {Element=} opt_newSurface Surface the dragging blocks should be moved
 *     to, or null if the blocks should be removed from this surface without
 *     being moved to a different surface.
 */
eYo.Svg.BrickDragSurface.prototype.clearAndHide = function(opt_newSurface) {
  var svg = this.dom.svg
  if (opt_newSurface) {
    // appendChild removes the node from svg.canvas_
    opt_newSurface.appendChild(this.brickGroup)
  } else {
    svg.canvas_.removeChild(this.brickGroup)
  }
  svg.root_.style.display = 'none'
  this.surfaceXY_ = null
  goog.asserts.assert(
    svg.canvas_.childNodes.length == 0, 'Drag group was not cleared.');
}

/**
 * @param {!Element} container Containing element.
 * @constructor
 */
eYo.Svg.BoardDragSurface = function(container) {
  /**
   * Dom structure when the board is being dragged. If there is no drag in
   * progress, the SVG is empty and display: none.
   * <svg class="eyo-board-drag-surface" style=transform:translate3d(...)>
   *   <g class="eyo-brick-canvas"></g>
   * </svg>
   */
  var dom = this.dom = Object.create(null)
  var svg = dom.svg = Object.create(null)
  svg.root_ = eYo.Svg.newElement('svg', {
    xmlns: eYo.Dom.SVG_NS,
    'xmlns:html': eYo.Dom.HTML_NS,
    'xmlns:xlink': eYo.Dom.XLINK_NS,
    version: '1.1',
    class: 'eyo-board-drag-surface eyo-overflow-visible'
  }, container)
}

/**
 * Dispose of the resources.
 * @private
 */
eYo.Svg.BoardDragSurface.prototype.dispose = function () {
  this.dispose = eYo.Do.nothing
  var svg = this.dom.svg
  if (svg) {
    goog.dom.removeNode(svg.root_)
    this.dom = this.dom.svg = svg.root_ = null
  }
}

Object.defineProperties(eYo.Svg.BoardDragSurface.prototype, {
  /**
   * Reports the surface translation in scaled board coordinates.
   * Use this when finishing a drag to return bricks to the correct position.
   * @type {!eYo.Where} Current translation of the surface
   * @package
   */
  translation: {
    get () {
      return eYo.Svg.getRelativeXY(this.dom.svg.root_)
    }
  },
})

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {number|goog.math.Coordinate} x X translation for the entire surface, or coordinates
 * @param {number} y Y translation for the entire surface
 * @package
 */
eYo.Svg.BoardDragSurface.prototype.xyMoveTo = function(x = 0, y = 0) {
  if (goog.isDef(x.x)) {
    y = x.y
    x = x.x
  }
  // This is a work-around to prevent the bricks from rendering
  // fuzzy while they are being moved on the drag surface.
  var fixedX = x.toFixed(0)
  var fixedY = y.toFixed(0)
  this.dom.svg.root_.style.display = 'block'
  eYo.Dom.setCssTransform(
    this.dom.svg.root_,
    `translate3d(${fixedX}px,${fixedY}px,0px)`
  )
}

/**
 * Move the blockCanvas out of the surface SVG and on to
 * newSurface.
 * @param {?SVGElement} newSurface The element to put the drag surface contents
 *     into, when there was no previous sibling.
 * @package
 */
eYo.Svg.BoardDragSurface.prototype.clearAndHide = function(newSurface) {
  var root = this.dom.svg.root_
  var canvas = root.childNodes[0]

  // If there is a previous sibling, put the blockCanvas back right afterwards,
  // otherwise insert it as the first child node in newSurface.
  if (this.previousSibling_) {
    eYo.Dom.insertAfter(canvas, this.previousSibling_)
  } else if (!newSurface) {
    throw 'Couldn\'t clear and hide the drag surface: missing new surface.'
  } else {
    newSurface.insertBefore(canvas, newSurface.firstChild)
  }
  // Hide the drag surface.
  root.style.display = 'none'
  goog.asserts.assert(
    root.childNodes.length == 0, 'Drag surface was not cleared.')
  eYo.Dom.setCssTransform(root, '')
  this.previousSibling_ = null
}

/**
 * Set the SVG to have the block canvas in it and then
 * show the surface.
 * @param {!Element} blockCanvas The block canvas <g> element from the board.
 * @param {?Element} previousSibling The element to insert the block canvas after when it goes back in the DOM at the end of a drag.
 * @param {number} width The width of the board SVG element.
 * @param {number} height The height of the board SVG element.
 * @param {number} scale The scale of the board being dragged.
 * @package
 */
eYo.Svg.BoardDragSurface.prototype.setContentsAndShow = function(
    blockCanvas, previousSibling, width, height, scale) {
  var root = this.dom.svg.root_
  goog.asserts.assert(
    root.childNodes.length == 0, 'Already dragging a block.');
  this.previousSibling_ = previousSibling
  // Make sure the blocks canvas is scaled appropriately.
  blockCanvas.setAttribute('transform', `translate(0, 0) scale(${scale})`)
  root.setAttribute('width', width)
  root.setAttribute('height', height)
  root.appendChild(blockCanvas)
  root.style.display = 'block'
}
