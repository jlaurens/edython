/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview An SVG element that floats on top of the board.
 * Bricks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated using css translation instead of SVG so the
 * blocks are never repainted during drag improving performance.
 * katelyn@google.com (Katelyn Mann)
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

/**
 * Class for a drag surface for the currently dragged block. This is a separate
 * SVG that contains only the currently moving block, or nothing.
 * @param {Element} container Containing element.
 * @constructor
 */
eYo.svg.brickDragSurface = function(container) {
  /**
   * @type {!Element}
   * @private
   */
  var dom = this.dom = Object.create(null)
  var svg = dom.svg = Object.create(null)
  var root = svg.root_ = eYo.svg.newElementSvg(container, 'eyo-brick-drag-surface')
  var x = eYo.svg.newElement('rect', {
    x: eYo.geom.X,
    y: eYo.geom.Y,
    width: 10 * eYo.geom.X,
    height: 3 * eYo.geom.Y,
    class: 'eyo-background-drag-surface'
  }, root)
  x.setAttribute('fill', 'yellow')
  var g = svg.group_ = eYo.svg.newElement('g', {
    class: 'eyo-brick-surface'
  }, root)
  svg.canvas_ = eYo.svg.newElement('g', {
    class: 'eyo-brick-canvas'
  }, g)
  this.where_ = new eYo.geom.Point()
}

/**
 * Sever all the links and remove dom nodes.
 */
eYo.svg.brickDragSurface.prototype.dispose = function() {
  this.dispose = eYo.doNothing
  eYo.dom.removeNode(this.dom.svg.root_)
  this.limits_ = this.dom = this.brick_ = null
}

Object.defineProperties(eYo.svg.brickDragSurface.prototype, {
  /**
   * Get the current blocks on the drag surface, if any (primarily
   * for BlockSvg.getRelativeToSurfaceWhere).
   * @return {!eYo.dragger.Brick} Drag surface block DOM element, or eYo.NA
   * if no blocks exist.
   */
  dragger: {
    get () {
      return this.dragger_
    }
  },
  /**
   * Get the current blocks on the drag surface, if any (primarily
   * for BlockSvg.getRelativeToSurfaceWhere).
   * @return {!Element|eYo.NA} Drag surface block DOM element, or eYo.NA
   * if no blocks exist.
   */
  brick: {
    get () {
      return this.dragger_.brick
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
   * @type {eYo.geom.Point}
   * @private
   */
  where: {
    get () {
      return this.where_
    },
    set (after) {
      this.where_.set(after)
      var x = this.where_.x.toFixed(0)
      var y = this.where_.y.toFixed(0)
      // This is a work-around to prevent a the blocks from rendering
      // fuzzy while they are being dragged on the drag surface.
      var transform = `translate3d(${x}px,${y}px, 0px)`
      eYo.dom.SetCssTransform(
        this.dom.svg.root_,
        transform
      )    
    }
  },
  /**
   * Reports the surface translation in scaled board coordinates.
   * Use this when finishing a drag to return blocks to the correct position.
   * @return {!eYo.geom.Point} Current translation of the surface.
   */
  translation: {
    get () {
      return eYo.svg.getRelativeWhere(this.dom.svg.root_).unscale(this.scale_)
    }
  },
  /**
   * @return {eYo.geom.Rect}
   */
  limits: {
    get () {
      return this.limits_
    }
  }
})

/**
 * Set the SVG brick's group on the drag surface's group and show the surface.
 * Set the size of the svg drag surface equal to the one of the brick's board. Make both canvases transformed similarly.
 * @param {eYo.brick.BaseC3s} brick  A top block with no parent.
 */
eYo.svg.brickDragSurface.prototype.start = function(draggerBrick) {
  this.dragger_ = draggerBrick
  var brick = this.brick
  var svg = this.dom.svg
  var canvas = svg.canvas_
  eYo.assert(
    canvas.childNodes.length == 0, 'Already dragging a brick.')
  var b_svg = brick.board.dom.svg
  var b_root = b_svg.root_
  var root = svg.root_
  root.setAttribute('width', b_root.getAttribute('width'))
  root.setAttribute('height', b_root.getAttribute('height'))
  var transform = b_svg.canvas_.getAttribute('transform')
  transform && canvas.setAttribute(
    'transform',
    transform
  )
  // appendChild removes the group from its previous parent node
  canvas.appendChild(brick.dom.svg.group_)
  svg.root_.style.display = 'block'
  this.where = new eYo.geom.Point()
}

eYo.temp.i = 0

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 */
eYo.svg.brickDragSurface.prototype.move = function() {
  if (++eYo.temp.i > 100) {
    eYo.test && eYo.test.IN_THROW || console.error('BREAK HERE')
  }
  this.where = this.dragger.xyDelta.scale(this.scale_)
}

/**
 * Clear the group and hide the surface; move the blocks off onto the provided
 * element.
 * If the block is being deleted it doesn't need to go back to the original
 * surface, since it would be removed immediately during dispose.
 * @param {eYo.board | true} board Target board where the brick should be dropped on, or true if this is the receiver's brick's board.
 */
eYo.svg.brickDragSurface.prototype.end = function(board) {
  this.brick.moveBy(this.where_, true)
  this.where = 0
  var svg = this.dom.svg
  if (board === true) {
    board = this.brick.board
  }
  if (board) {
    // appendChild removes the node from svg.canvas_
    board.dom.svg.canvas_.appendChild(this.brick.dom.svg.group_)
  } else {
    svg.canvas_.removeChild(this.brick.dom.svg.group_)
  }
  svg.root_.style.display = 'none'
  eYo.assert(
    svg.canvas_.childNodes.length == 0, 'Drag group was not cleared.')
  this.dragger_ = null
}

/**
 * @param {Element} container Containing element.
 * @constructor
 */
eYo.svg.BoardDragSurface = function(container) {
  /**
   * Dom structure when the board is being dragged. If there is no drag in
   * progress, the SVG is empty and display: none.
   * <svg class="eyo-board-drag-surface" style=transform:translate3d(...)>
   *   <g class="eyo-brick-canvas"></g>
   * </svg>
   */
  var dom = this.dom = Object.create(null)
  var svg = dom.svg = Object.create(null)
  svg.root_ = eYo.svg.newElementSvg(container, 'eyo-board-drag-surface eyo-overflow-visible')
}

/**
 * Sever all links.
 * @private
 */
eYo.svg.BoardDragSurface.prototype.dispose = function () {
  let dom = this.dom
  let svg = dom.svg
  eYo.dom.removeNode(svg.root_)
  this.dom = dom.svg = svg.root_ = this.dragger_ = eYo.NA
  this.dispose = eYo.doNothing
}

Object.defineProperties(eYo.svg.BoardDragSurface.prototype, {
  /**
   * Reports the surface translation in scaled board coordinates.
   * Use this when finishing a drag to return bricks to the correct position.
   * @type {!eYo.geom.Point} Current translation of the surface
   */
  translation: {
    get () {
      return eYo.svg.getRelativeWhere(this.dom.svg.root_)
    }
  },
})

/**
 * Set the SVG to have the brick canvas in it and then
 * show the surface.
 * @param {Element} brickCanvas The block canvas <g> element from the board.
 * @param {Element} [previousSibling] The element to insert the block canvas after when it goes back in the DOM at the end of a drag.
 * @param {number} width The width of the board SVG element.
 * @param {number} height The height of the board SVG element.
 * @param {number} scale The scale of the board being dragged.
 */
eYo.svg.BoardDragSurface.prototype.start = function(dragger, width, height) { // eslint-disable-line
  this.dragger_ = dragger
  var board = dragger.board
  var brickCanvas = board.dom.svg.canvas_
  var root = this.dom.svg.root_
  eYo.assert(
    root.childNodes.length == 0, 'Already dragging a block.')
  var coord = eYo.svg.getRelativeWhere(brickCanvas)
  eYo.dom.SetCssTransform(
    root,
    `translate3d(${coord.x.toFixed(0)}px,${coord.y.toFixed(0)}px, 0px)`
  )
  this.previousSibling_ = brickCanvas.previousSibling
  root.appendChild(brickCanvas)
  var svg = board.dom.svg
  root.setAttribute('width', +svg.group_.getAttribute('width'))
  root.setAttribute('height', +svg.group_.getAttribute('height'))
  root.style.display = 'block'
}

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {eYo.geom.Point} xy Translation for the entire surface
 */
eYo.svg.BoardDragSurface.prototype.moveTo = function(xy) {
  // This is a work-around to prevent the bricks from rendering
  // fuzzy while they are being moved on the drag surface.
  var fixedX = xy.x.toFixed(0)
  var fixedY = xy.y.toFixed(0)
  var root = this.dom.svg.root_
  root.style.display = 'block'
  eYo.dom.SetCssTransform(
    root,
    `translate3d(${fixedX}px,${fixedY}px,0px)`
  )
}

/**
 * Move the blockCanvas out of the surface SVG and on to
 * newSurface.
 * @param {SVGElement} [newSurface] The element to put the drag surface contents
 *     into, when there was no previous sibling.
 */
eYo.svg.BoardDragSurface.prototype.clearAndHide = function(newSurface) {
  var root = this.dom.svg.root_
  var canvas = root.childNodes[0]

  // If there is a previous sibling, put the blockCanvas back right afterwards,
  // otherwise insert it as the first child node in newSurface.
  if (this.previousSibling_) {
    eYo.dom.insertAfter(canvas, this.previousSibling_)
  } else if (!newSurface) {
    throw 'Couldn\'t clear and hide the drag surface: missing new surface.'
  } else {
    newSurface.insertBefore(canvas, newSurface.firstChild)
  }
  // Hide the drag surface.
  root.style.display = 'none'
  eYo.assert(
    root.childNodes.length == 0, 'Drag surface was not cleared.')
  eYo.dom.SetCssTransform(root, '')
  this.previousSibling_ = null
}
