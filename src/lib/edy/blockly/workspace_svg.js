/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview WorkspaceSvg override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.WorkspaceSvg')

goog.require('Blockly.WorkspaceSvg')
goog.require('edY.BlockSvg')
goog.require('edY.Workspace')

edY.inherits(Blockly.WorkspaceSvg, edY.Workspace)

/**
 * Obtain a newly created block.
 * Returns a block subclass for EZP blocks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!Blockly.BlockSvg} The created block.
 */
Blockly.WorkspaceSvg.prototype.newBlock = function (prototypeName, optId) {
  if (prototypeName.startsWith('edy:')) {
    return new edY.BlockSvg(this, prototypeName, optId)
  } else {
    return new Blockly.BlockSvg(this, prototypeName, optId)
  }
}

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
 */
Blockly.WorkspaceSvg.prototype.showContextMenu_ = function(e) {
  if (this.options.readOnly || this.isFlyout) {
    return;
  }
  var menuOptions = [];
  var topBlocks = this.getTopBlocks(true);
  var eventGroup = Blockly.utils.genUid();
  var ws = this;

  // Options to undo/redo previous action.
  var undoOption = {};
  undoOption.text = Blockly.Msg.UNDO;
  undoOption.enabled = this.undoStack_.length > 0;
  undoOption.callback = this.undo.bind(this, false);
  menuOptions.push(undoOption);
  var redoOption = {};
  redoOption.text = Blockly.Msg.REDO;
  redoOption.enabled = this.redoStack_.length > 0;
  redoOption.callback = this.undo.bind(this, true);
  menuOptions.push(redoOption);

  // Option to clean up blocks.
  if (this.scrollbar) {
    var cleanOption = {};
    cleanOption.text = Blockly.Msg.CLEAN_UP;
    cleanOption.enabled = topBlocks.length > 1;
    cleanOption.callback = this.cleanUp.bind(this);
    menuOptions.push(cleanOption);
  }

  // Add a little animation to collapsing and expanding.
  var DELAY = 10;
  if (this.options.collapse) {
    var hasCollapsedBlocks = false;
    var hasExpandedBlocks = false;
    for (var i = 0; i < topBlocks.length; i++) {
      var block = topBlocks[i];
      while (block) {
        if (block.isCollapsed()) {
          hasCollapsedBlocks = true;
        } else {
          hasExpandedBlocks = true;
        }
        block = block.getNextBlock();
      }
    }

    /**
     * Option to collapse or expand top blocks.
     * @param {boolean} shouldCollapse Whether a block should collapse.
     * @private
     */
    var toggleOption = function(shouldCollapse) {
      var ms = 0;
      for (var i = 0; i < topBlocks.length; i++) {
        var block = topBlocks[i];
        while (block) {
          setTimeout(block.setCollapsed.bind(block, shouldCollapse), ms);
          block = block.getNextBlock();
          ms += DELAY;
        }
      }
    };

    // Option to collapse top blocks.
    var collapseOption = {enabled: hasExpandedBlocks};
    collapseOption.text = Blockly.Msg.COLLAPSE_ALL;
    collapseOption.callback = function() {
      toggleOption(true);
    };
    menuOptions.push(collapseOption);

    // Option to expand top blocks.
    var expandOption = {enabled: hasCollapsedBlocks};
    expandOption.text = Blockly.Msg.EXPAND_ALL;
    expandOption.callback = function() {
      toggleOption(false);
    };
    menuOptions.push(expandOption);
  }

  // Option to delete all blocks.
  // Count the number of blocks that are deletable.
  var deleteList = [];
  function addDeletableBlocks(block) {
    if (block.isDeletable()) {
      deleteList = deleteList.concat(block.edy.getWrappedDescendants(block));
    } else {
      var children = block.getChildren();
      for (var i = 0; i < children.length; i++) {
        addDeletableBlocks(children[i]);
      }
    }
  }
  for (var i = 0; i < topBlocks.length; i++) {
    addDeletableBlocks(topBlocks[i]);
  }

  function deleteNext() {
    Blockly.Events.setGroup(eventGroup);
    var block = deleteList.shift();
    if (block) {
      if (block.workspace) {
        block.dispose(false, true);
        setTimeout(deleteNext, DELAY);
      } else {
        deleteNext();
      }
    }
    grouper.stop();
  }

  var deleteOption = {
    text: deleteList.length == 1 ? Blockly.Msg.DELETE_BLOCK :
        Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(deleteList.length)),
    enabled: deleteList.length > 0,
    callback: function() {
      if (ws.currentGesture_) {
        ws.currentGesture_.cancel();
      }
      if (deleteList.length < 2 ) {
        deleteNext();
      } else {
        Blockly.confirm(Blockly.Msg.DELETE_ALL_BLOCKS.
            replace('%1', deleteList.length),
            function(ok) {
              if (ok) {
                deleteNext();
              }
            });
      }
    }
  };
  menuOptions.push(deleteOption);

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
}

/**
 * Populate a dom element to make a workspace.
 * @param {!Element} workspaceXMLElementMouse dom element to populate, in general the workspace in the main html file.
 * @param {!String} type, prototype of the block.
 * @param {!Object} offset, with x and y attributes
 * @private
 */
Blockly.WorkspaceSvg.prototype.addElementInWorkspaceBlocks = function(workspaceXMLElement, type, x, y) {
  var core = type.substring(4)
  var shortcut = (this instanceof edY.DelegateSvg.Expr? edY.T3.Xml.toDom.Expr: edY.T3.Xml.toDom.Stmt)[core]
  var tag = shortcut && 'edy:' + shortcut || type, text = undefined
  console.log('new workspace element:', type, tag)
  var child = goog.dom.createElement(tag)
  child.setAttribute('x', x)
  child.setAttribute('y', y)
  if (text) {
    goog.dom.appendChild(child, goog.dom.createTextNode(text))
  }
  goog.dom.appendChild(workspaceXMLElement, child)
}

/**
 * Populate a dom element to make a workspace.
 * Aligns elements in n_col columns.
 * Blockly will transform these elements in blocks.
 * This should be replaced by a direct method that creates a block and place it at the right position.
 * @param {!Element} workspaceXMLElementMouse dom element to populate, in general the workspaceBlocks in the main html file.
 * @param {!Array} types, list of prototypes.
 * @param {!Integer} n_col the number of columns to use.
 * @param {!Object} offset, with x and y attributes
 * @param {!Object} step, with x and y attributes
 * @private
 */
Blockly.WorkspaceSvg.prototype.addElementsInWorkspaceBlocks = function(workspaceXMLElement, types, n_col, offset, step) {
  workspaceXMLElement.setAttribute('xmlns:edy', 'urn:edython:1.0')
  var n = 0
  var x = offset.x
  var y = offset.y
  var i = 0
  Blockly.Events.setGroup(true)
  try {
    for (; i<types.length; i++) {
      this.addElementInWorkspaceBlocks(workspaceXMLElement, types[i], x, y)
      if (++n<n_col) {
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
  } finally {
    Blockly.Events.setGroup(false)
  }
  return {x: x, y: y}
}

/**
 * Paste the provided block onto the workspace.
 * Take into account the selected connection if any.
 * @param {!Element} xmlBlock XML block element.
 * @override
 */
Blockly.WorkspaceSvg.prototype.paste = function(xmlBlock) {
  if (!this.rendered || xmlBlock.getElementsByTagName('block').length >=
      this.remainingCapacity()) {
    return;
  }
  if (this.currentGesture_) {
    this.currentGesture_.cancel();  // Dragging while pasting?  No.
  }
  var c8n, targetC8n
  if ((c8n = edY.SelectedConnection.get())) {
    try {
      var block = Blockly.Xml.domToBlock(xmlBlock, this);
      if (c8n.type === Blockly.INPUT_VALUE) {
        targetC8n = block.outputConnection
      } else if (c8n.type === Blockly.NEXT_STATEMENT) {
        targetC8n = block.previousConnection
      } else if (c8n.type === Blockly.PREVIOUS_STATEMENT) {
        targetC8n = block.nextConnection
      }
    } catch(e) {
      targetC8n = null
    }
    if (targetC8n  && c8n.checkType_(targetC8n)) {
      Blockly.Events.setGroup(true)
      try {
        if (Blockly.Events.isEnabled()) {
          Blockly.Events.fire(new Blockly.Events.BlockCreate(block))
        }
        if (c8n.type === Blockly.PREVIOUS_STATEMENT) {
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
          xy_block = targetC8n.sourceBlock_.getRelativeToSurfaceXY()
          xyxy.translate(xy_block.x, xy_block.y)
          // This is where the targetC8n is
          xyxy.scale(-1)
          xy.translate(xyxy.x, xyxy.y)
          targetC8n.sourceBlock_.moveBy(xy.x, xy.y)
        }
        c8n.connect(targetC8n)
        if (c8n.type === Blockly.PREVIOUS_STATEMENT) {
          targetC8n = block.nextConnection
        }
        block.select()
        if (c8n.type === Blockly.INPUT_VALUE) {
          var parent = block
          do {
            var e8r = parent.edy.inputEnumerator(parent)
            while (e8r.next()) {
              if ((c8n = e8r.here.connection) && c8n.type === Blockly.INPUT_VALUE && ! c8n.edy.optional_ && !c8n.targetConnection) {
                edY.SelectedConnection.set(c8n)
                parent = null
                break
              }
            }
          } while (parent && (parent = parent.getSurroundParent(parent)))
        } else if ((c8n = block.nextConnection)) {
          edY.SelectedConnection.set(c8n)
        }
      } finally {
        Blockly.Events.setGroup(false)
      }
      return
    } else if (block) {
      block.dispose()
    }
  }
  Blockly.Events.disable()
  try {
    var block = Blockly.Xml.domToBlock(xmlBlock, this);
    // Move the duplicate to original position.
    var blockX = parseInt(xmlBlock.getAttribute('x'), 10);
    var blockY = parseInt(xmlBlock.getAttribute('y'), 10);
    if (!isNaN(blockX) && !isNaN(blockY)) {
      if (this.RTL) {
        blockX = -blockX;
      }
      // Offset block until not clobbering another block and not in connection
      // distance with neighbouring blocks.
      var allBlocks = this.getAllBlocks();
      var avoidCollision = function () {
        do {
          var collide = false;
          for (var i = 0, otherBlock; otherBlock = allBlocks[i]; i++) {
            var otherXY = otherBlock.getRelativeToSurfaceXY();
            if (Math.abs(blockX - otherXY.x) <= 10 &&
                Math.abs(blockY - otherXY.y) <= 10) {
              collide = true;
              break;
            }
          }
          if (!collide) {
            // Check for blocks in snap range to any of its connections.
            var connections = block.getConnections_(false);
            for (var i = 0, connection; connection = connections[i]; i++) {
              var neighbour = connection.closest(Blockly.SNAP_RADIUS,
                  new goog.math.Coordinate(blockX, blockY));
              if (neighbour.connection) {
                collide = true;
                break;
              }
            }
          }
          if (collide) {
            blockX += Blockly.SNAP_RADIUS;
            blockY += Blockly.SNAP_RADIUS * 2;
          }
        } while (collide);
      }
      avoidCollision()
      // is the block in the visible area ?
      var metrics = this.getMetrics()
      var scale = this.scale || 1;
      var heightWidth = block.getHeightWidth();
      // the block is in the visible area if we see its center
      var leftBound = metrics.viewLeft / scale - heightWidth.width / 2
      var topBound = metrics.viewTop / scale - heightWidth.height / 2
      var rightBound = (metrics.viewLeft + metrics.viewWidth) / scale - heightWidth.width / 2
      var downBound = (metrics.viewTop + metrics.viewHeight) / scale - heightWidth.height / 2
      var inVisibleArea = function() {
        return blockX >= leftBound && blockX <= rightBound &&
        blockY >= topBound && blockY <= downBound
      }
      if (!inVisibleArea()) {
        blockX = (metrics.viewLeft + metrics.viewWidth / 2) / scale - heightWidth.width / 2;
        blockY = (metrics.viewTop + metrics.viewHeight / 2)  / scale - heightWidth.height / 2;
        avoidCollision()
      }
      block.moveBy(blockX, blockY);
      if (!inVisibleArea()) {
        this.centerOnBlock(block.id)
      }
    }
  } finally {
    Blockly.Events.enable()
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockCreate(block));
  }
  block.select();
};
