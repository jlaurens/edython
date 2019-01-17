/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview WorkspaceSvg override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.WorkspaceSvg')

goog.require('Blockly.WorkspaceSvg')

goog.require('eYo.Do')
goog.require('eYo.Msg')
goog.require('eYo.BlockSvg')
goog.require('eYo.Workspace')
goog.require('goog.dom');
goog.require('eYo.WorkspaceDragger');

eYo.Do.inherits(Blockly.WorkspaceSvg, eYo.Workspace)

/**
 * Obtain a newly created block.
 * Returns a block subclass for EZP blocks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!Blockly.BlockSvg|eYo.BlockSvg} The created block.
 * @suppress{accessControls}
 */
Blockly.WorkspaceSvg.prototype.newBlock = function (prototypeName, optId) {
  if (prototypeName && prototypeName.startsWith('eyo:')) {
    return new eYo.BlockSvg(/** Blockly.Workspace */ this, prototypeName, optId)
  } else {
    return new Blockly.BlockSvg(/** Blockly.Workspace */ this, prototypeName, optId)
  }
}

goog.provide('eYo.Gesture')

/**
 * Handle a mousedown/touchstart event on a workspace.
 * This is overriden because
 * `Blockly.WorkspaceSvg.prototype.onMouseDown_`
 * cannot.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.Workspace} ws The workspace the event hit.
 * @package
 * @suppress{accessControls}
 */
Blockly.Gesture.prototype.handleWsStart = (() => {
  var handleWsStart = Blockly.Gesture.prototype.handleWsStart
  return function (e, ws) {
    if (Blockly.WidgetDiv.DIV.childNodes.length) {
      Blockly.WidgetDiv.hide()
    } else {
      handleWsStart.call(this, e, ws)
    }
  }
}) ()

Blockly.Workspace.prototype.logAllConnections = function (comment) {
  comment = comment || ''
  var dbList = this.connectionDBList
  console.log(comment + '> Blockly.INPUT_VALUE connections')
  var db = dbList[Blockly.INPUT_VALUE]
  for (var i = 0, c8n; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.offsetInBlock_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.OUTPUT_VALUE connections')
  db = dbList[Blockly.OUTPUT_VALUE]
  for (i = 0; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.offsetInBlock_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.NEXT_STATEMENT connections')
  db = dbList[Blockly.NEXT_STATEMENT]
  for (i = 0; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.offsetInBlock_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.PREVIOUS_STATEMENT connections')
  db = dbList[Blockly.PREVIOUS_STATEMENT]
  for (i = 0; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.offsetInBlock_, c8n.sourceBlock_.type])
  }
}

/**
 * Show the context menu for the workspace.
 * @param {!Event} e Mouse event.
 * @private
 * @suppress{accessControls}
 */
Blockly.WorkspaceSvg.prototype.showContextMenu_ = function (e) {
  if (this.options.readOnly || this.isFlyout) {
    return
  }
  var menuOptions = []
  var topBlocks = this.getTopBlocks(true)
  var eventGroup = Blockly.utils.genUid()
  var ws = this

  // Options to undo/redo previous action.
  var undoOption = {}
  undoOption.text = eYo.Msg.UNDO
  undoOption.enabled = this.undoStack_.length > 0
  undoOption.callback = this.undo.bind(this, false)
  menuOptions.push(undoOption)
  var redoOption = {}
  redoOption.text = eYo.Msg.REDO
  redoOption.enabled = this.redoStack_.length > 0
  redoOption.callback = this.undo.bind(this, true)
  menuOptions.push(redoOption)

  // Option to clean up blocks.
  if (this.scrollbar) {
    var cleanOption = {}
    cleanOption.text = eYo.Msg.CLEAN_UP
    cleanOption.enabled = topBlocks.length > 1
    cleanOption.callback = this.cleanUp.bind(this)
    menuOptions.push(cleanOption)
  }

  // Add a little animation to collapsing and expanding.
  var DELAY = 10
  if (this.options.collapse) {
    var hasCollapsedBlocks = false
    var hasExpandedBlocks = false
    for (var i = 0; i < topBlocks.length; i++) {
      var block = topBlocks[i]
      while (block) {
        if (block.isCollapsed()) {
          hasCollapsedBlocks = true
        } else {
          hasExpandedBlocks = true
        }
        block = block.getNextBlock()
      }
    }

    /**
     * Option to collapse or expand top blocks.
     * @param {boolean} shouldCollapse Whether a block should collapse.
     * @private
     */
    var toggleOption = (shouldCollapse) => {
      var ms = 0
      for (var i = 0; i < topBlocks.length; i++) {
        var block = topBlocks[i]
        while (block) {
          setTimeout(block.setCollapsed.bind(block, shouldCollapse), ms)
          block = block.getNextBlock()
          ms += DELAY
        }
      }
    }

    // Option to collapse top blocks.
    var collapseOption = {enabled: hasExpandedBlocks}
    collapseOption.text = eYo.Msg.COLLAPSE_ALL
    collapseOption.callback = () => {
      toggleOption(true)
    }
    menuOptions.push(collapseOption)

    // Option to expand top blocks.
    var expandOption = {enabled: hasCollapsedBlocks}
    expandOption.text = eYo.Msg.EXPAND_ALL
    expandOption.callback = () => {
      toggleOption(false)
    }
    menuOptions.push(expandOption)
  }

  // Option to delete all blocks.
  // Count the number of blocks that are deletable.
  var deleteList = []
  function addDeletableBlocks (block) {
    if (block.isDeletable()) {
      deleteList = deleteList.concat(block.eyo.getWrappedDescendants())
    } else {
      var children = block.getChildren()
      for (var i = 0; i < children.length; i++) {
        addDeletableBlocks(children[i])
      }
    }
  }
  for (i = 0; i < topBlocks.length; i++) {
    addDeletableBlocks(topBlocks[i])
  }

  function deleteNext () {
    Blockly.Events.setGroup(eventGroup)
    var block = deleteList.shift()
    if (block) {
      if (block.workspace) {
        block.dispose(false, true)
        setTimeout(deleteNext, DELAY)
      } else {
        deleteNext()
      }
    }
  }

  var deleteOption = {
    text: deleteList.length === 1 ? eYo.Msg.DELETE_BLOCK
      : eYo.Msg.DELETE_X_BLOCKS.replace('{0}', String(deleteList.length)),
    enabled: deleteList.length > 0,
    callback: function () {
      if (ws.currentGesture_) {
        ws.currentGesture_.cancel()
      }
      if (deleteList.length < 2) {
        deleteNext()
      } else {
        Blockly.confirm(eYo.Msg.DELETE_ALL_BLOCKS
          .replace('%1', deleteList.length),
        function (ok) {
          if (ok) {
            deleteNext()
          }
        })
      }
    }
  }
  menuOptions.push(deleteOption)

  Blockly.ContextMenu.show(e, menuOptions, this.RTL)
}

/**
 * Populate a dom element to make a workspace.
 * @param {!Element} workspaceXMLElement dom element to populate, in general the workspace in the main html file.
 * @param {!String} type, prototype of the block.
 * @param {!number} x
 * @param {!number} y
 * @private
 */
Blockly.WorkspaceSvg.prototype.addElementInWorkspaceBlocks = function (workspaceXMLElement, type, x, y) {
  var block = eYo.DelegateSvg.newBlockComplete(this, type)
  var child = eYo.Xml.blockToDom(block, {noId: true})
  child.setAttribute('x', x)
  child.setAttribute('y', y)
  goog.dom.appendChild(workspaceXMLElement, child)
}

/**
 * Populate a dom element to make a workspace.
 * Aligns elements in n_col columns.
 * Blockly will transform these elements in blocks.
 * This should be replaced by a direct method that creates a block and place it at the right position.
 * @param {!Element} workspaceXMLElementMouse dom element to populate, in general the workspaceBlocks in the main html file.
 * @param {!Array} types, list of prototypes.
 * @param {!integer} n_col the number of columns to use.
 * @param {!Object} offset, with x and y attributes
 * @param {!Object} step, with x and y attributes
 * @private
 */
Blockly.WorkspaceSvg.prototype.addElementsInWorkspaceBlocks = function (workspaceXMLElement, types, n_col, offset, step) {
  workspaceXMLElement.setAttribute('xmlns', 'urn:edython:0.2')
  workspaceXMLElement.setAttribute('xmlns:eyo', 'urn:edython:0.2')
  var n = 0
  var x = offset.x
  var y = offset.y
  var i = 0
  eYo.Events.groupWrap(
    () => {
      for (; i < types.length; i++) {
        this.addElementInWorkspaceBlocks(workspaceXMLElement, types[i], x, y)
        if (++n < n_col) {
          x += step.x
          y += step.y
        } else {
          n = 0
          x = offset.x
          y += step.y
        }
      }
      if (n < n_col) {
        x = offset.x
        y += step.y
      }
    }
  )
  return {x: x, y: y}
}

/**
 * Paste the provided block onto the workspace.
 * Take into account the selected connection if any.
 * @param {!Element} xmlBlock XML block element.
 * @override
 * @suppress {accessControls}
 */
Blockly.WorkspaceSvg.prototype.paste = function (xmlBlock) {
  if (!this.rendered || xmlBlock.getElementsByTagName('block').length >=
      this.remainingCapacity()) {
    return
  }
  if (this.currentGesture_) {
    this.currentGesture_.cancel() // Dragging while pasting?  No.
  }
  var c8n, targetC8n, block
  if ((c8n = eYo.Selected.connection)) {
    eYo.Events.groupWrap(
      () => {
        block = Blockly.Xml.domToBlock(xmlBlock, this)
        if (c8n.eyo.isInput) {
          targetC8n = block.outputConnection
        } else if (c8n.eyo.isNextLike) {
          targetC8n = block.previousConnection
        } else if (c8n.eyo.isPrevious) {
          targetC8n = block.nextConnection
        }
        if (targetC8n && c8n.checkType_(targetC8n)) {
          if (c8n.eyo.isPrevious) {
            // the pasted block must move before it is connected
            // otherwise the newly created block will attract the old one
            // resulting in a move of the existing connection
            // 1) get the location of c8n in the workspace
            var xy = c8n.offsetInBlock_.clone()
            var xy_block = c8n.sourceBlock_.getRelativeToSurfaceXY()
            xy.translate(xy_block.x, xy_block.y)
            // This is where the targetC8n should be once the
            // connection has been made
            var xyxy = targetC8n.offsetInBlock_.clone()
            xy_block = targetC8n.getSourceBlock().getRelativeToSurfaceXY()
            xyxy.translate(xy_block.x, xy_block.y)
            // This is where the targetC8n is
            xyxy.scale(-1)
            xy.translate(xyxy.x, xyxy.y)
            targetC8n.getSourceBlock().moveBy(xy.x, xy.y)
          }
          c8n.connect(targetC8n)
          if (c8n.eyo.isPrevious) {
            targetC8n = block.nextConnection
          }
          block.select()
        }
      }
    )
    return
  }
  eYo.Events.groupWrap(
    () => {
      block = Blockly.Xml.domToBlock(xmlBlock, this)
      // Move the duplicate to original position.
      var blockX = parseInt(xmlBlock.getAttribute('x'), 10)
      var blockY = parseInt(xmlBlock.getAttribute('y'), 10)
      if (!isNaN(blockX) && !isNaN(blockY)) {
        if (this.RTL) {
          blockX = -blockX
        }
        // Offset block until not clobbering another block and not in connection
        // distance with neighbouring blocks.
        var allBlocks = this.getAllBlocks()
        var avoidCollision = () => {
          do {
            var collide = allBlocks.some((otherBlock) => {
              var otherXY = otherBlock.getRelativeToSurfaceXY()
              if (Math.abs(blockX - otherXY.x) <= 10 &&
                  Math.abs(blockY - otherXY.y) <= 10) {
                return true
              }
            }) || block.getConnections_(false).some((connection) => {
                var neighbour = connection.closest(Blockly.SNAP_RADIUS,
                  new goog.math.Coordinate(blockX, blockY))
                if (neighbour.connection) {
                  return true
                }
            })
            if (collide) {
              blockX += Blockly.SNAP_RADIUS
              blockY += Blockly.SNAP_RADIUS * 2
            }
          } while (collide)
        }
        avoidCollision()
        // is the block in the visible area ?
        var metrics = this.getMetrics()
        var scale = this.scale || 1
        var heightWidth = block.getHeightWidth()
        // the block is in the visible area if we see its center
        var leftBound = metrics.viewLeft / scale - heightWidth.width / 2
        var topBound = metrics.viewTop / scale - heightWidth.height / 2
        var rightBound = (metrics.viewLeft + metrics.viewWidth) / scale - heightWidth.width / 2
        var downBound = (metrics.viewTop + metrics.viewHeight) / scale - heightWidth.height / 2
        var inVisibleArea = () => {
          return blockX >= leftBound && blockX <= rightBound &&
          blockY >= topBound && blockY <= downBound
        }
        if (!inVisibleArea()) {
          blockX = (metrics.viewLeft + metrics.viewWidth / 2) / scale - heightWidth.width / 2
          blockY = (metrics.viewTop + metrics.viewHeight / 2) / scale - heightWidth.height / 2
          avoidCollision()
        }
        block.moveBy(blockX, blockY)
      }
      block.select()
      eYo.Selected.scrollToVisible()
    }
  )
}
/**
 * If enabled, resize the parts of the workspace that change when the workspace
 * contents (e.g. block positions) change.  This will also scroll the
 * workspace contents if needed.
 * @package
 */
Blockly.WorkspaceSvg.prototype.resizeContents = (() => {
  var resizeContents = Blockly.WorkspaceSvg.prototype.resizeContents
  return function () {
    if (eYo.Selected.eyo && eYo.Selected.eyo.inVisibleArea()) {
      return;
    }
    resizeContents.call(this)
  }
})()

/**
 * Tidy up the nodes.
 * @param {?Object} kvargs  key value arguments
 */
eYo.WorkspaceDelegate.prototype.tidyUp = function (kvargs) {
  // x + y < O / x + y > 0
  var x_plus_y = (l, r) => {
    var dx = r.xy.x - l.xy.x
    var dy = r.xy.y - l.xy.y
    return dx + dy
  }
  // x - y < O \ x - y > 0
  var x_minus_y = (l, r) => {
    var dx = r.xy.x - l.xy.x
    var dy = r.xy.y - l.xy.y
    return dx - dy
  }
  var lowest = (tops, helper, x) => {
    var leaf
    var distance = Infinity
    tops.forEach(top => {
      var candidate = helper(top, x)
      if (candidate < distance) {
        distance = candidate
        leaf = top
      }
    })
    return {leaf, distance}
  }
  var topleft = (tops) => {
    return lowest(tops, (top) => top.xy.x + top.xy.y)
  }
  var topright = (tops) => {
    return lowest(tops, (top) => top.xy.y - top.xy.x)
  }
  var tops = this.workspace_.topBlocks_.filter(block => {
    return {
      block,
      xy: block.getRelativeToSurfaceXY()
    }
  })
  var ordered = {}
  var distances = []
  while (tops.length) {
    var tl = topleft(tops)
    if (tl.leaf) {
      distances.push(tl.distance)
      var l = ordered[tl.distance]
      if (l) {
        l.push(tl.leaf)
      } else {
        ordered[tl.distance] = [tl.leaf]
      }
    }
    tops.splice(tops.indexOf(tl), 1)
  }
  distances.forEach(d => {
    var l = ordered[d]
    var ll = []
    while (l.length) {
      var tr = topright(l)
      ll.push(tr.leaf)
      l.splice(l.indexOf(tl), 1)
    }
    ordered[d] = ll
  })
  tops = [].concat(...distances.map(d => ordered[d]))
  
  var order = (l, r) => {
    var dx = r.xy.x - l.xy.x
    var dy = r.xy.y - l.xy.y
    if (dy > dx) { // bottom left
      if (dy > -dx) { // bottom
        return 'b'
      } else { // left
        return 'l'
      }
    } else { // top right
      if (dy > -dx) { // right
        return 'r'
      } else { // top
        return 't'
      }
    }
  }
  var insert = (start, leaf) => {
    var o = order(start, leaf)
    if (o === 'l') {
      if (start.l) {

      }
    }
  }
}

/**
 * Scroll the workspace to center on the given block.
 * @param {?string} id ID of block center on.
 * @public
 */
eYo.WorkspaceDelegate.prototype.scrollBlockTopLeft = function(id) {
  if (!this.workspace_.scrollbar) {
    console.warn('Tried to scroll a non-scrollable workspace.');
    return;
  }

  var block = this.workspace_.getBlockById(id);
  if (!block) {
    return;
  }

  if (!block.eyo.isStmt) {
    block = block.eyo.stmtParent.block_ || block.eyo.root.block_ || block
  }
  // XY is in workspace coordinates.
  var xy = block.getRelativeToSurfaceXY();
  
  // Find the top left of the block in workspace units.
  var y = xy.y - eYo.Unit.y / 2

  // In RTL the block's position is the top right of the block, not top left.
  var x = xy.x - eYo.Unit.x / 2 - block.eyo.depth * eYo.Font.tabWidth

  // Workspace scale, used to convert from workspace coordinates to pixels.
  var scale = this.workspace_.scale;

  // Center in pixels.  0, 0 is at the workspace origin.  These numbers may
  // be negative.
  var pixelX = x * scale;
  var pixelY = y * scale;

  var metrics = this.workspace_.getMetrics();

  // Scrolling to here will put the block in the top-left corner of the
  // visible workspace.
  var scrollToBlockX = pixelX - metrics.contentLeft;
  var scrollToBlockY = pixelY - metrics.contentTop;

  // Put the block in the center of the visible workspace instead.
  var scrollToCenterX = scrollToBlockX// - halfViewWidth;
  var scrollToCenterY = scrollToBlockY// - halfViewHeight;

  Blockly.hideChaff();
  this.workspace_.scrollbar.set(scrollToCenterX, scrollToCenterY);
};

/**
 * Recalculate a horizontal scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * Edython: position and resize according to the position of the flyout.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
Blockly.Scrollbar.prototype.resizeViewHorizontal = function(hostMetrics) {
  var workspace = this.workspace_
  var flyout = workspace.eyo.flyout_
  if (flyout) {
    var atRight = flyout.toolboxPosition_ === Blockly.TOOLBOX_AT_RIGHT
    var xy = flyout.eyo.flyoutPosition
  }
  if (atRight && xy) {
    var viewSize = xy.x - hostMetrics.absoluteLeft - 1
  } else {
    viewSize = hostMetrics.viewWidth - 1
  }
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= Blockly.Scrollbar.scrollbarThickness;
  }
  this.setScrollViewSize_(Math.max(0, viewSize));

  var xCoordinate = hostMetrics.absoluteLeft + 0.5;
  if (this.pair_ && this.workspace_.RTL) {
    xCoordinate += Blockly.Scrollbar.scrollbarThickness;
  }

  // Horizontal toolbar should always be just above the bottom of the workspace.
  var yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight -
      Blockly.Scrollbar.scrollbarThickness - 0.5;
  this.setPosition_(xCoordinate, yCoordinate);

  // If the view has been resized, a content resize will also be necessary.  The
  // reverse is not true.
  this.resizeContentHorizontal(hostMetrics);
};

/**
 * Recalculate a vertical scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * Edython: position and resize according to the position of the flyout.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
Blockly.Scrollbar.prototype.resizeViewVertical = function(hostMetrics) {
  var viewSize = hostMetrics.viewHeight - 1;
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= Blockly.Scrollbar.scrollbarThickness;
  }

  var workspace = this.workspace_
  var flyout = workspace.eyo.flyout_
  if (flyout) {
    var atRight = flyout.toolboxPosition_ === Blockly.TOOLBOX_AT_RIGHT
  }
  if (atRight) {
    var xy = flyout.eyo.flyoutPosition
    var yOffset = flyout.eyo.TOP_OFFSET
  } else {
    yOffset = 1 * eYo.Unit.rem
  }
  viewSize -= yOffset
  this.setScrollViewSize_(Math.max(0, viewSize));

  if (xy) {
    var xCoordinate = xy.x - hostMetrics.absoluteLeft -     Blockly.Scrollbar.scrollbarThickness - 0.5
  } else {
    xCoordinate = hostMetrics.absoluteLeft + 0.5;
    if (!this.workspace_.RTL) {
      xCoordinate += hostMetrics.viewWidth -
          Blockly.Scrollbar.scrollbarThickness - 1;
    }
  }
  var yCoordinate = hostMetrics.absoluteTop + 0.5;
  yCoordinate += yOffset
  this.setPosition_(xCoordinate, yCoordinate);

  // If the view has been resized, a content resize will also be necessary.  The
  // reverse is not true.
  this.resizeContentVertical(hostMetrics);
};

/**
 * Move the trash can to the bottom-right corner.
 */
Blockly.Trashcan.prototype.position = function() {
  var metrics = this.workspace_.getMetrics();
  if (!metrics) {
    // There are no metrics available (workspace is probably not visible).
    return;
  }
  this.left_ = metrics.viewWidth + metrics.absoluteLeft -
      this.WIDTH_ - this.MARGIN_SIDE_ - Blockly.Scrollbar.scrollbarThickness;

  if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
    var flyoutPosition = this.workspace_.eyo.flyout_.eyo.flyoutPosition
    if (flyoutPosition) {
      this.left_ = flyoutPosition.x -
      this.WIDTH_ - this.MARGIN_SIDE_ - Blockly.Scrollbar.scrollbarThickness  
    } else {
      this.left_ -= metrics.flyoutWidth
    }
  }
  this.top_ = metrics.viewHeight + metrics.absoluteTop -
      (this.BODY_HEIGHT_ + this.LID_HEIGHT_) - this.bottom_;

  if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
    this.top_ -= metrics.flyoutHeight;
  }
  this.svgGroup_.setAttribute('transform',
      'translate(' + this.left_ + ',' + this.top_ + ')');
};
