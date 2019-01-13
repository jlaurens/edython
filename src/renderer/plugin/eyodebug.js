Blockly.BlockDragger.prototype.startBlockDrag = (() => {
  var startBlockDrag = Blockly.BlockDragger.prototype.startBlockDrag
  return function (currentDragDeltaXY, healStack) {
    eYo.debug = true
    console.error('startBlockDrag', this.draggingBlock_.getRelativeToSurfaceXY())
    startBlockDrag.call(this, currentDragDeltaXY, healStack)
    eYo.debug = false
  }
})()

Blockly.utils.getRelativeXY = function (element) {
  var xy = new goog.math.Coordinate(0, 0)
  // First, check for x and y attributes.
  var x = element.getAttribute('x')
  if (x) {
    xy.x = parseInt(x, 10)
  }
  var y = element.getAttribute('y')
  if (y) {
    xy.y = parseInt(y, 10)
  }
  // Second, check for transform="translate(...)" attribute.
  var transform = element.getAttribute('transform')
  var r = transform && transform.match(Blockly.utils.getRelativeXY.XY_REGEX_)
  if (r) {
    var dx = parseFloat(r[1])
    if (isNaN(dx)) {
      console.error('8 ERRORS', transform, xy, Blockly.utils.getRelativeXY.XY_REGEX_, r)
      r = transform.match(/translate\(\s*([-+\d.e]+)(?:\s*,?\s*([-+\d.e]+)\s*\))?/)
      dx = parseFloat(r[1])
      xy.x += dx
      if (r[2]) {
        xy.y += parseFloat(r[2])
      }
    } else {
      xy.x += dx
      if (r[3]) {
        xy.y += parseFloat(r[3])
      }
    }
  }

  // Then check for style = transform: translate(...) or translate3d(...)
  var style = element.getAttribute('style')
  if (style && style.indexOf('translate') > -1) {
    var styleComponents = style.match(Blockly.utils.getRelativeXY.XY_2D_REGEX_)
    // Try transform3d if 2d transform wasn't there.
    if (!styleComponents) {
      styleComponents = style.match(Blockly.utils.getRelativeXY.XY_3D_REGEX_)
    }
    if (styleComponents) {
      xy.x += parseFloat(styleComponents[1])
      if (isNaN(xy.x)) {
        console.error('9 ERRORS', xy)
      }
      if (styleComponents[3]) {
        xy.y += parseFloat(styleComponents[3])
      }
    }
  }
  if (isNaN(xy.x)) {
    console.error('6 ERRORS', xy)
  }
  return xy
}

Blockly.utils.getRelativeXY.XY_REGEX_ =
  /translate\(\s*([-+\d.e]+)([ ,]\s*([-+\d.e]+)\s*\))?/

/**
 * Static regex to pull the scale values out of a transform style property.
 * Accounts for same exceptions as XY_REGEXP_.
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getScale_REGEXP_ = /scale\(\s*([-+\d.e]+)\s*\)/

/**
 * Static regex to pull the x,y,z values out of a translate3d() style property.
 * Accounts for same exceptions as XY_REGEXP_.
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getRelativeXY.XY_3D_REGEX_ =
  /transform:\s*translate3d\(\s*([-+\d.e]+)px([ ,]\s*([-+\d.e]+)\s*)px([ ,]\s*([-+\d.e]+)\s*)px\)?/

Blockly.BlockSvg.prototype.getRelativeToSurfaceXY = function () {
  var x = 0
  var y = 0

  var dragSurfaceGroup = this.useDragSurface_
    ? this.workspace.blockDragSurface_.getGroup()
    : null

  var element = this.getSvgRoot()
  if (element) {
    do {
      // Loop through this block and every parent.
      var xy = Blockly.utils.getRelativeXY(element)
      x += xy.x
      y += xy.y
      // If this element is the current element on the drag surface, include
      // the translation of the drag surface itself.
      if (this.useDragSurface_ &&
        this.workspace.blockDragSurface_.getCurrentBlock() === element) {
        var surfaceTranslation = this.workspace.blockDragSurface_.getSurfaceTranslation()
        x += surfaceTranslation.x
        y += surfaceTranslation.y
      }
      element = element.parentNode
    } while (element && element !== this.workspace.getCanvas() &&
      element !== dragSurfaceGroup)
  }
  if (isNaN(x)) {
    console.error('5 ERRORS', x, y)
  }
  if (eYo.debug) {
    console.warn('getRelativeToSurfaceXY', x, y)
  }
  return new goog.math.Coordinate(x, y)
}

Blockly.BlockSvg.prototype.getBoundingRectangle = function () {
  var blockXY = this.getRelativeToSurfaceXY(this)
  var tab = this.outputConnection
    ? Blockly.BlockSvg.TAB_WIDTH
    : 0
  var blockBounds = this.getHeightWidth()
  var topLeft
  var bottomRight
  if (this.RTL) {
    // Width has the tab built into it already so subtract it here.
    topLeft = new goog.math.Coordinate(blockXY.x - (blockBounds.width - tab),
      blockXY.y)
    // Add the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    bottomRight = new goog.math.Coordinate(blockXY.x + tab,
      blockXY.y + blockBounds.height)
  } else {
    // Subtract the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    topLeft = new goog.math.Coordinate(blockXY.x - tab, blockXY.y)
    // Width has the tab built into it already so subtract it here.
    bottomRight = new goog.math.Coordinate(blockXY.x + blockBounds.width - tab,
      blockXY.y + blockBounds.height)
  }
  if (isNaN(topLeft.x)) {
    console.error('4 ERRORS')
  }
  return {topLeft: topLeft, bottomRight: bottomRight}
}

Blockly.WorkspaceSvg.prototype.getBlocksBoundingBox = function () {
  var topBlocks = this.getTopBlocks(false)
  // There are no blocks, return empty rectangle.
  if (!topBlocks.length) {
    return {x: 0, y: 0, width: 0, height: 0}
  }

  // Initialize boundary using the first block.
  var boundary = topBlocks[0].getBoundingRectangle()

  // Start at 1 since the 0th block was used for initialization
  for (var i = 1; i < topBlocks.length; i++) {
    var blockBoundary = topBlocks[i].getBoundingRectangle()
    if (blockBoundary.topLeft.x < boundary.topLeft.x) {
      boundary.topLeft.x = blockBoundary.topLeft.x
    }
    if (blockBoundary.bottomRight.x > boundary.bottomRight.x) {
      boundary.bottomRight.x = blockBoundary.bottomRight.x
    }
    if (blockBoundary.topLeft.y < boundary.topLeft.y) {
      boundary.topLeft.y = blockBoundary.topLeft.y
    }
    if (blockBoundary.bottomRight.y > boundary.bottomRight.y) {
      boundary.bottomRight.y = blockBoundary.bottomRight.y
    }
  }
  if (isNaN(boundary.topLeft.x)) {
    console.error('ERROR ERROR ERROR')
  }
  return {
    x: boundary.topLeft.x,
    y: boundary.topLeft.y,
    width: boundary.bottomRight.x - boundary.topLeft.x,
    height: boundary.bottomRight.y - boundary.topLeft.y
  }
}

Blockly.WorkspaceSvg.getContentDimensionsExact_ = function (ws) {
  // Block bounding box is in workspace coordinates.
  var blockBox = ws.getBlocksBoundingBox()
  var scale = ws.scale

  // Convert to pixels.
  var width = blockBox.width * scale
  var height = blockBox.height * scale
  var left = blockBox.x * scale
  var top = blockBox.y * scale

  if (isNaN(left)) {
    console.error('ERROR ERROR')
  }

  return {
    left: left,
    top: top,
    right: left + width,
    bottom: top + height,
    width: width,
    height: height
  }
}

Blockly.WorkspaceSvg.getContentDimensionsBounded_ = function (ws, svgSize) {
  var content = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws)

  // View height and width are both in pixels, and are the same as the SVG size.
  var viewWidth = svgSize.width
  var viewHeight = svgSize.height
  var halfWidth = viewWidth / 2
  var halfHeight = viewHeight / 2

  // Add a border around the content that is at least half a screenful wide.
  // Ensure border is wide enough that blocks can scroll over entire screen.
  var left = Math.min(content.left - halfWidth, content.right - viewWidth)
  var right = Math.max(content.right + halfWidth, content.left + viewWidth)
  var top = Math.min(content.top - halfHeight, content.bottom - viewHeight)
  var bottom = Math.max(content.bottom + halfHeight, content.top + viewHeight)

  var dimensions = {
    left: left,
    top: top,
    height: bottom - top,
    width: right - left
  }
  return dimensions
}

Blockly.WorkspaceSvg.getTopLevelWorkspaceMetrics_ = function () {
  var toolboxDimensions =
      Blockly.WorkspaceSvg.getDimensionsPx_(this.toolbox_)
  var flyoutDimensions =
      Blockly.WorkspaceSvg.getDimensionsPx_(this.flyout_)

  // Contains height and width in CSS pixels.
  // svgSize is equivalent to the size of the injectionDiv at this point.
  var svgSize = Blockly.svgSize(this.getParentSvg())
  if (this.toolbox_) {
    if (this.toolboxPosition === Blockly.TOOLBOX_AT_TOP ||
        this.toolboxPosition === Blockly.TOOLBOX_AT_BOTTOM) {
      svgSize.height -= toolboxDimensions.height
    } else if (this.toolboxPosition === Blockly.TOOLBOX_AT_LEFT ||
        this.toolboxPosition === Blockly.TOOLBOX_AT_RIGHT) {
      svgSize.width -= toolboxDimensions.width
    }
  }

  // svgSize is now the space taken up by the Blockly workspace, not including
  // the toolbox.
  var contentDimensions =
    Blockly.WorkspaceSvg.getContentDimensions_(this, svgSize)

  var absoluteLeft = 0
  if (this.toolbox_ && this.toolboxPosition === Blockly.TOOLBOX_AT_LEFT) {
    absoluteLeft = toolboxDimensions.width
  }
  var absoluteTop = 0
  if (this.toolbox_ && this.toolboxPosition === Blockly.TOOLBOX_AT_TOP) {
    absoluteTop = toolboxDimensions.height
  }
  if (isNaN(contentDimensions.left)) {
    console.error('ERROR')
  }
  var metrics = {
    contentHeight: contentDimensions.height,
    contentWidth: contentDimensions.width,
    contentTop: contentDimensions.top,
    contentLeft: contentDimensions.left,

    viewHeight: svgSize.height,
    viewWidth: svgSize.width,
    viewTop: -this.scrollY, // Must be in pixels, somehow.
    viewLeft: -this.scrollX, // Must be in pixels, somehow.

    absoluteTop: absoluteTop,
    absoluteLeft: absoluteLeft,

    toolboxWidth: toolboxDimensions.width,
    toolboxHeight: toolboxDimensions.height,

    flyoutWidth: flyoutDimensions.width,
    flyoutHeight: flyoutDimensions.height,

    toolboxPosition: this.toolboxPosition
  }
  return metrics
}

Blockly.Flyout.prototype.positionAt_ = function (width, height, x, y) {
  this.svgGroup_.setAttribute('width', width)
  this.svgGroup_.setAttribute('height', height)
  var transform = 'translate(' + x.toFixed(3) + 'px,' + y.toFixed(3) + 'px)'
  Blockly.utils.setCssTransform(this.svgGroup_, transform)
  console.error('POSITION AT', transform, this.svgGroup_.style.transform)
  // Update the scrollbar (if one exists).
  if (this.scrollbar_) {
    // Set the scrollbars origin to be the top left of the flyout.
    this.scrollbar_.setOrigin(x, y)
    this.scrollbar_.resize()
  }
}

var eYoDebug = {}

eYoDebug.test = function () {
  console.error('TEST eYoDebug')
}

eYoDebug.install = function (Vue, options) {
  console.error('INSTALLING eYoDebug')
  // 1. add global method or property
}

export default eYoDebug
