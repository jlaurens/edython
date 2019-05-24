/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Workspace model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Workspace')

goog.require('eYo')

goog.forwardDeclare('goog.array');
goog.forwardDeclare('goog.math');

goog.forwardDeclare('eYo.Desktop')


/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 * @param {?Blockly.Options=} options Dictionary of options.
 * @constructor
 */
eYo.Workspace = function(options) {
  /** @type {string} */
  this.id = Blockly.utils.genUid()
  eYo.Workspace.WorkspaceDB_[this.id] = this
  /** @type {!Blockly.Options} */
  this.options = options || {}
  
  /**
   * @type {!Array.<!eYo.Brick>}
   * @private
   */
  this.topBricks_ = []
  /**
   * @type {!Array.<!Function>}
   * @private
   */
  this.listeners_ = []
  /**
   * @type {!Array.<!Blockly.Events.Abstract>}
   * @protected
   */
  this.undoStack_ = []
  /**
   * @type {!Array.<!Blockly.Events.Abstract>}
   * @protected
   */
  this.redoStack_ = []
  /**
   * @type {!Object}
   * @private
   */
  this.brickDB_ = Object.create(null)

  this.getMetrics =
  options.getMetrics || eYo.Workspace.getTopLevelWorkspaceMetrics_
  this.setMetrics =
    options.setMetrics || eYo.Workspace.setTopLevelWorkspaceMetrics_

  this.targetSpace = options.targetSpace

  this.brickDragSurface_ = options.brickDragSurface

  this.workspaceDragSurface_ = options.workspaceDragSurface

  this.useWorkspaceDragSurface_ =
    this.workspaceDragSurface_ && Blockly.utils.is3dSupported()

  /**
   * List of currently highlighted blocks.  Block highlighting is often used to
   * visually mark blocks currently being executed.
   * @type !Array.<!Blockly.BlockSvg>
   * @private
   */
  this.highlightedBlocks_ = []

  Blockly.ConnectionDB.init(this)

  /**
   * Object in charge of loading, storing, and playing audio for a workspace.
   * @type {Blockly.WorkspaceAudio}
   * @private
   */
  this.audioManager_ = new Blockly.WorkspaceAudio(options.parentWorkspace)

  this.resetChangeCount()

}

eYo.Do.addProtocol(eYo.Workspace.prototype, 'ChangeCount')

Object.defineProperties(eYo.Workspace, {
  DELETE_AREA_NONE: { value: null },
  /**
   * ENUM representing that an event is in the delete area of the trash can.
   * @const
   */
  DELETE_AREA_TRASH: { value: 1 },
  /**
   * ENUM representing that an event is in the delete area of the toolbox or
   * flyout.
   * @const
   */
  DELETE_AREA_TOOLBOX: { value: 2 },
})

Object.defineProperties(eYo.Workspace.prototype, {
  /**
   * Is this workspace the surface for a flyout?
   * @readonly
   * @type {boolean}
   */
  isFlyout: {
    get () {
      return !!this.targetSpace
    }
  },
  audioManager: {
    get () {
      return this.getAudioManager()
    }
  },
  draggable: {
    get () {
      return this.isDraggable()
    }
  },
  /**
   * Returns `true` if the workspace is visible and `false` if it's headless.
   * @type {boolean}
   */
  rendered: {
    value: false,
    writable: true
  },
  /**
   * Maximum number of undo events in stack. `0` turns off undo, `Infinity` sets it to unlimited.
   * @type {number}
   */
  MAX_UNDO: {
    value: 1024,
    writable: true
  },
  /**
   * @type {*}
   */
  error: {
    value: undefined,
    writable: true
  },
  recover: {
    get () {
      return this.getRecover()
    }
  },
  driver: {
    get () {
      return this.driver_ || (this.driver_ = this.driverCreate())
    },
    set (newValue) {
      this.driver_ = newValue
    }
  }
})

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Workspace.prototype.dispose = function() {
  // Stop rerendering.
  this.rendered = false;
  if (this.currentGesture_) {
    this.currentGesture_.cancel();
  }
  this.listeners_.length = 0;
  this.clear();
  // Remove from workspace database.
  delete eYo.Workspace.WorkspaceDB_[this.id];
  this.ui_driver.workspaceDispose(this)
  if (this.flyout_) {
    this.flyout_.dispose()
    this.flyout_ = null
  }
  if (this.trashcan) {
    this.trashcan.dispose()
    this.trashcan = null
  }
  if (this.scrollbar) {
    this.scrollbar.dispose()
    this.scrollbar = null
  }
  if (this.zoomControls_) {
    this.zoomControls_.dispose()
    this.zoomControls_ = null
  }
  if (this.audioManager_) {
    this.audioManager_.dispose()
    this.audioManager_ = null
  }

  if (this.flyoutButtonCallbacks_) {
    this.flyoutButtonCallbacks_ = null;
  }
  if (!this.options.parentWorkspace) {
    // Top-most workspace.  Dispose of the div that the
    // SVG is injected into (i.e. injectionDiv).
    goog.dom.removeNode(this.getParentSvg().parentNode);
  }
  if (this.resizeHandlerWrapper_) {
    Blockly.unbindEvent(this.resizeHandlerWrapper_);
    this.resizeHandlerWrapper_ = null;
  }
};

/**
 * Be ready.
 * @param {!Blockly.Block} block Block to add.
 */
eYo.Workspace.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  var d = this.driver_ = new eYo.Svg()
  d.workspaceInit(this)
  var bottom = Blockly.Scrollbar.scrollbarThickness
  if (this.options.hasTrashcan) {
    bottom = this.addTrashcan_(bottom)
  }
  if (workspace.options.zoomOptions && workspace.options.zoomOptions.controls) {
    this.addZoomControls_(bottom)
  }
  this.recordDeleteAreas()
}

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias.  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
eYo.Workspace.SCAN_ANGLE = 3;

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to add.
 */
eYo.Workspace.prototype.addTopBlock = function(block) {
  this.topBricks_.push(block);
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
eYo.Workspace.prototype.removeTopBlock = function(block) {
  if (!goog.array.remove(this.topBricks_, block)) {
    throw 'Block not present in workspace\'s list of top-most blocks.';
  }
};

/**
 * Finds the top-level blocks and returns them.  Blocks are optionally sorted
 * by position; top to bottom.
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} The top-level block objects.
 */
eYo.Workspace.prototype.getTopBlocks = function(ordered) {
  // Copy the topBricks_ list.
  var blocks = [].concat(this.topBricks_);
  if (ordered && blocks.length > 1) {
    var offset = Math.sin(goog.math.toRadians(eYo.Workspace.SCAN_ANGLE));
    blocks.sort(function(a, b) {
      var aXY = a.getRelativeToSurfaceXY();
      var bXY = b.getRelativeToSurfaceXY();
      return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x);
    });
  }
  return blocks;
};

/**
 * Find all blocks in workspace.  No particular order.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
eYo.Workspace.prototype.getAllBlocks = function() {
  var blocks = this.getTopBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    blocks.push.apply(blocks, blocks[i].getChildren());
  }
  return blocks;
};

/**
 * Dispose of all blocks in workspace.
 */
eYo.Workspace.prototype.clear = function() {
  this.setResizesEnabled(false)
  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }
  while (this.topBricks_.length) {
    this.topBricks_[0].dispose();
  }
  if (!existingGroup) {
    Blockly.Events.setGroup(false);
  }
  this.setResizesEnabled(true)
  
  this.error = undefined
}

/**
 * Returns a block subclass for eYo bricks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!eYo.Brick} The created block.
 */
eYo.Workspace.prototype.newBrick = function (prototypeName, opt_id) {
  return eYo.Brick.Manager.create(this, prototypeName, opt_id)
}

/**
 * Obtain a newly created block.
 * Returns a block subclass for eYo bricks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!Blockly.Block} The created block.
 */
eYo.Workspace.prototype.newBlock = eYo.Workspace.prototype.newBrick

/**
 * The number of blocks that may be added to the workspace before reaching
 *     the maxBlocks.
 * @return {number} Number of blocks left.
 */
eYo.Workspace.prototype.remainingCapacity = function() {
  if (isNaN(this.options.maxBlocks)) {
    return Infinity;
  }
  return this.options.maxBlocks - this.getAllBlocks().length;
};

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.Workspace.prototype.undo = function(redo) {
  var inputStack = redo ? this.redoStack_ : this.undoStack_
  var outputStack = redo ? this.undoStack_ : this.redoStack_
  while (true) {
    var inputEvent = inputStack.pop()
    if (!inputEvent) {
      return
    }
    var events = [inputEvent]
    // Do another undo/redo if the next one is of the same group.
    while (inputStack.length && inputEvent.group &&
        inputEvent.group == inputStack[inputStack.length - 1].group) {
      events.push(inputStack.pop())
      // update the change count
    }
    events = Blockly.Events.filter(events, redo)
    if (events.length) {
      // Push these popped events on the opposite stack.
      events.forEach((event) => {
        outputStack.push(event)
      })
      eYo.Events.recordUndo = false
      var Bs = []
      eYo.Do.tryFinally(() => { // try
        if (this.rendered) {
          events.forEach(event => {
            var B = this.getBlockById(event.blockId)
            if (B) {
              B.changeBegin()
              Bs.push(B)
            }
          })
        }
        events.forEach(event => {
          event.run(redo)
          this.updateChangeCount(event, redo)
        })
      }, () => { // finally
        eYo.Events.recordUndo = true
        Bs.forEach(B => B.changeEnd())
        eYo.App.didProcessUndo && (eYo.App.didProcessUndo(redo))
      })
      return
    }
  }
}

/**
 * Clear the undo/redo stacks.
 */
eYo.Workspace.prototype.clearUndo = function() {
  this.undoStack_.length = 0;
  this.redoStack_.length = 0;
  // Stop any events already in the firing queue from being undoable.
  Blockly.Events.clearPendingUndo()
  eYo.App.didClearUndo && eYo.App.didClearUndo()
};

/**
 * When something in this workspace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Function} Function that can be passed to
 *     removeChangeListener.
 */
eYo.Workspace.prototype.addChangeListener = function(func) {
  this.listeners_.push(func);
  return func;
};

/**
 * Stop listening for this workspace's changes.
 * @param {Function} func Function to stop calling.
 */
eYo.Workspace.prototype.removeChangeListener = function(func) {
  goog.array.remove(this.listeners_, func);
};

/**
 * Fire a change event.
 * @param {!Blockly.Events.Abstract} event Event to fire.
 */
eYo.Workspace.prototype.fireChangeListener = function(event) {
  var before = this.undoStack_.length
  if (event.recordUndo) {
    this.undoStack_.push(event);
    this.redoStack_.length = 0;
    if (this.undoStack_.length > this.MAX_UNDO) {
      this.undoStack_.unshift();
    }
  }
  this.listeners_.forEach(f => f(event))
  // For newly created events, update the change count
  if (event.recordUndo) {
    this.updateChangeCount(event, true)
    if (before === this.undoStack_.length) {
      eYo.App.didUnshiftUndo && eYo.App.didUnshiftUndo()
    } else {
      eYo.App.didPushUndo && eYo.App.didPushUndo()
    }
  }
}

/**
 * Find the block on this workspace with the specified ID.
 * Wrapped bricks have a complex id.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The sought after block or null if not found.
 */
eYo.Workspace.prototype.getBlockById = eYo.Workspace.prototype.getBrickById = function(id) {
  var brick = this.brickDB_[id]
  if (brick) {
    return brick
  }
  var m = XRegExp.exec(id, eYo.XRE.id_wrapped)
  if (m && (brick = this.brickDB_[m.id])) {
    return brick.someInputMagnet(m4t => {
      var b3k = m4t.targetBrick
      if (b3k && b3k.id === id) {
        return b3k
      }
    })
  }
}

/**
 * Checks whether all value and statement inputs in the workspace are filled
 * with blocks.
 * @param {boolean=} opt_shadowBlocksAreFilled An optional argument controlling
 *     whether shadow blocks are counted as filled. Defaults to true.
 * @return {boolean} True if all inputs are filled, false otherwise.
 */
eYo.Workspace.prototype.allInputsFilled = function(opt_shadowBlocksAreFilled) {
  var blocks = this.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (!block.allInputsFilled(opt_shadowBlocksAreFilled)) {
      return false;
    }
  }
  return true;
}

/**
 * Database of all workspaces.
 * @private
 */
eYo.Workspace.WorkspaceDB_ = Object.create(null);

/**
 * Find the workspace with the specified ID.
 * @param {string} id ID of workspace to find.
 * @return {eYo.Workspace} The sought after workspace or null if not found.
 */
eYo.Workspace.getById = function(id) {
  return eYo.Workspace.WorkspaceDB_[id] || null;
};

// Export symbols that would otherwise be renamed by Closure compiler.
eYo.Workspace.prototype['clear'] = eYo.Workspace.prototype.clear;
eYo.Workspace.prototype['clearUndo'] =
    eYo.Workspace.prototype.clearUndo;
eYo.Workspace.prototype['addChangeListener'] =
    eYo.Workspace.prototype.addChangeListener;
eYo.Workspace.prototype['removeChangeListener'] =
    eYo.Workspace.prototype.removeChangeListener;

/**
 * A wrapper function called when a resize event occurs.
 * You can pass the result to `unbindEvent`.
 * @type {Array.<!Array>}
 */
eYo.Workspace.prototype.resizeHandlerWrapper_ = null;

/**
 * The render status of an SVG workspace.
 * Returns `true` for visible workspaces and `false` for non-visible,
 * or headless, workspaces.
 * @type {boolean}
 */
eYo.Workspace.prototype.rendered = true;

/**
 * Is this workspace the surface for a mutator?
 * @type {boolean}
 * @package
 */
eYo.Workspace.prototype.isMutator = false;

/**
 * Whether this workspace has resizes enabled.
 * Disable during batch operations for a performance improvement.
 * @type {boolean}
 * @private
 */
eYo.Workspace.prototype.resizesEnabled_ = true;

/**
 * Current horizontal scrolling offset in pixel units.
 * @type {number}
 */
eYo.Workspace.prototype.scrollX = 0;

/**
 * Current vertical scrolling offset in pixel units.
 * @type {number}
 */
eYo.Workspace.prototype.scrollY = 0;

/**
 * Horizontal scroll value when scrolling started in pixel units.
 * @type {number}
 */
eYo.Workspace.prototype.startScrollX = 0;

/**
 * Vertical scroll value when scrolling started in pixel units.
 * @type {number}
 */
eYo.Workspace.prototype.startScrollY = 0;

/**
 * Distance from mouse to object being dragged.
 * @type {goog.math.Coordinate}
 * @private
 */
eYo.Workspace.prototype.dragDeltaXY_ = null;

/**
 * Current scale.
 * @type {number}
 */
eYo.Workspace.prototype.scale = 1;

/**
 * The workspace's trashcan (if any).
 * @type {Blockly.Trashcan}
 */
eYo.Workspace.prototype.trashcan = null;

/**
 * This workspace's scrollbars, if they exist.
 * @type {Blockly.ScrollbarPair}
 */
eYo.Workspace.prototype.scrollbar = null;

/**
 * The current gesture in progress on this workspace, if any.
 * @type {Blockly.TouchGesture}
 * @private
 */
eYo.Workspace.prototype.currentGesture_ = null;

/**
 * This workspace's surface for dragging blocks, if it exists.
 * @type {eYo.BrickDragSurfaceSvg}
 * @private
 */
eYo.Workspace.prototype.brickDragSurface_ = null;

/**
 * This workspace's drag surface, if it exists.
 * @type {eYo.WorkspaceDragSurfaceSvg}
 * @private
 */
eYo.Workspace.prototype.workspaceDragSurface_ = null;

/**
 * Whether to move workspace to the drag surface when it is dragged.
 * True if it should move, false if it should be translated directly.
 * @type {boolean}
 * @private
 */
eYo.Workspace.prototype.useWorkspaceDragSurface_ = false;

/**
 * Whether the drag surface is actively in use. When true, calls to
 * translate will translate the drag surface instead of the translating the
 * workspace directly.
 * This is set to true in setupDragSurface and to false in resetDragSurface.
 * @type {boolean}
 * @private
 */
eYo.Workspace.prototype.isDragSurfaceActive_ = false;

/**
 * Last known position of the page scroll.
 * This is used to determine whether we have recalculated screen coordinate
 * stuff since the page scrolled.
 * @type {!goog.math.Coordinate}
 * @private
 */
eYo.Workspace.prototype.lastRecordedPageScroll_ = null;

/**
 * Map from function names to callbacks, for deciding what to do when a button
 * is clicked.
 * @type {!Object.<string, function(!Blockly.FlyoutButton)>}
 * @private
 */
eYo.Workspace.prototype.flyoutButtonCallbacks_ = {};

/**
 * Developers may define this function to add custom menu options to the
 * workspace's context menu or edit the workspace-created set of menu options.
 * @param {!Array.<!Object>} options List of menu options to add to.
 */
eYo.Workspace.prototype.configureContextMenu = null;

/**
 * In a flyout, the target workspace where blocks should be placed after a drag.
 * Otherwise null.
 * @type {?eYo.Workspace}
 * @package
 */
eYo.Workspace.prototype.targetSpace = null;

/**
 * Inverted screen CTM, for use in mouseToSvg.
 * @type {SVGMatrix}
 * @private
 */
eYo.Workspace.prototype.inverseScreenCTM_ = null;

/**
 * Getter for the inverted screen CTM.
 * @return {SVGMatrix} The matrix to use in mouseToSvg
 */
eYo.Workspace.prototype.getInverseScreenCTM = function() {
  return this.inverseScreenCTM_;
};

/**
 * Update the inverted screen CTM.
 */
eYo.Workspace.prototype.updateInverseScreenCTM = function() {
  var ctm = this.getParentSvg().getScreenCTM();
  if (ctm) {
    this.inverseScreenCTM_ = ctm.inverse();
  }
};

/**
 * Return the absolute coordinates of the top-left corner of this element,
 * scales that after canvas SVG element, if it's a descendant.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 * @private
 */
eYo.Workspace.prototype.getSvgXY = function(element) {
  var x = 0;
  var y = 0;
  var scale = 1;
  if (goog.dom.contains(this.getCanvas(), element)) {
    // Before the SVG canvas, scale the coordinates.
    scale = this.scale;
  }
  do {
    // Loop through this block and every parent.
    var xy = Blockly.utils.getRelativeXY(element);
    if (element == this.getCanvas()) {
      // After the SVG canvas, don't scale the coordinates.
      scale = 1;
    }
    x += xy.x * scale;
    y += xy.y * scale;
    element = element.parentNode;
  } while (element && element != this.getParentSvg());
  return new goog.math.Coordinate(x, y);
};

/**
 * Return the position of the workspace origin relative to the injection div
 * origin in pixels.
 * The workspace origin is where a block would render at position (0, 0).
 * It is not the upper left corner of the workspace SVG.
 * @return {!goog.math.Coordinate} Offset in pixels.
 * @package
 */
eYo.Workspace.prototype.getOriginOffsetInPixels = function() {
  return Blockly.utils.getInjectionDivXY_(this.dom.canvas_)
}

/**
 * Save resize handler data so we can delete it later in dispose.
 * @param {!Array.<!Array>} handler Data that can be passed to unbindEvent.
 */
eYo.Workspace.prototype.setResizeHandlerWrapper = function(handler) {
  this.resizeHandlerWrapper_ = handler;
};

/**
 * Obtain a newly created block.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @return {!Blockly.BlockSvg} The created block.
 */
eYo.Workspace.prototype.newBlock = function(prototypeName, opt_id) {
  return new Blockly.BlockSvg(this, prototypeName, opt_id);
};

/**
 * Add a trashcan.
 * @param {number} bottom Distance from workspace bottom to bottom of trashcan.
 * @return {number} Distance from workspace bottom to the top of trashcan.
 * @private
 */
eYo.Workspace.prototype.addTrashcan_ = function(bottom) {
  /** @type {Blockly.Trashcan} */
  this.trashcan = new Blockly.Trashcan(this);
  var svgTrashcan = this.trashcan.createDom();
  this.dom.group_.insertBefore(svgTrashcan, this.svgBlockCanvas_);
  return this.trashcan.init(bottom);
};

/**
 * Add zoom controls.
 * @param {number} bottom Distance from workspace bottom to bottom of controls.
 * @return {number} Distance from workspace bottom to the top of controls.
 * @private
 */
eYo.Workspace.prototype.addZoomControls_ = function(bottom) {
  /** @type {Blockly.ZoomControls} */
  this.zoomControls_ = new Blockly.ZoomControls(this);
  var svgZoomControls = this.zoomControls_.createDom();
  this.dom.group_.appendChild(svgZoomControls);
  return this.zoomControls_.init(bottom);
};

/**
 * Add a flyout element in an element with the given tag name.
 * @param {!Object} switcher  See eYo.FlyoutToolbar constructor.
 */
eYo.Workspace.prototype.addFlyout = function(switcher) {
  var flyoutOptions = {
    flyoutAnchor: this.options.flyoutAnchor,
    switcher: switcher
  }
  /**
  * @type {!eYo.Flyout}
  * @private
  */
  this.flyout_ = new eYo.Flyout(this, flyoutOptions)
}

/**
 * Getter for the flyout associated with this workspace.  This flyout may be
 * owned by either the toolbox or the workspace, depending on toolbox
 * configuration.  It will be null if there is no flyout.
 * @return {Blockly.Flyout} The flyout on this workspace.
 * @package
 */
eYo.Workspace.prototype.getFlyout_ = function() {
  return this.flyout_
}

/**
 * Update items that use screen coordinate calculations
 * because something has changed (e.g. scroll position, window size).
 * @private
 */
eYo.Workspace.prototype.updateScreenCalculations_ = function() {
  this.updateInverseScreenCTM();
  this.recordDeleteAreas();
};

/**
 * If enabled, resize the parts of the workspace that change when the workspace
 * contents (e.g. block positions) change.  This will also scroll the
 * workspace contents if needed.
 * @package
 */
eYo.Workspace.prototype.resizeContents = function() {
  if (!this.resizesEnabled_ || !this.rendered) {
    return;
  }
  this.isSelected = eYo.Selected.brick && eYo.Selected.brick.inVisibleArea() && eYo.Selected.brick
  try {

    if (this.scrollbar) {
      // TODO(picklesrus): Once rachel-fenichel's scrollbar refactoring
      // is complete, call the method that only resizes scrollbar
      // based on contents.
      this.scrollbar.resize();
    }
    this.updateInverseScreenCTM();
  } finally {
    this.isSelected = null
  }
};

/**
 * Resize and reposition all of the workspace chrome (toolbox,
 * trash, scrollbars etc.)
 * This should be called when something changes that
 * requires recalculating dimensions and positions of the
 * trash, zoom, toolbox, etc. (e.g. window resize).
 */
eYo.Workspace.prototype.resize = function() {
  if (this.flyout_) {
    this.flyout_.position();
  }
  if (this.trashcan) {
    this.trashcan.position();
  }
  if (this.zoomControls_) {
    this.zoomControls_.position();
  }
  if (this.scrollbar) {
    this.scrollbar.resize();
  }
  this.updateScreenCalculations_();
};

/**
 * Resizes and repositions workspace chrome if the page has a new
 * scroll position.
 * @package
 */
eYo.Workspace.prototype.updateScreenCalculationsIfScrolled =
    function() {
    /* eslint-disable indent */
  var currScroll = goog.dom.getDocumentScroll();
  if (!goog.math.Coordinate.equals(this.lastRecordedPageScroll_,
    currScroll)) {
    this.lastRecordedPageScroll_ = currScroll;
    this.updateScreenCalculations_();
  }
}; /* eslint-enable indent */

/**
 * Get the SVG element that forms the drawing surface.
 * @return {!Element} SVG element.
 */
eYo.Workspace.prototype.getCanvas = function() {
  return this.svgBlockCanvas_;
};

/**
 * Get the SVG element that contains this workspace.
 * @return {Element} SVG element.
 */
eYo.Workspace.prototype.getParentSvg = function() {
  if (this.cachedParentSvg_) {
    return this.cachedParentSvg_;
  }
  var element = this.dom.group_;
  while (element) {
    if (element.tagName == 'svg') {
      this.cachedParentSvg_ = element;
      return element;
    }
    element = element.parentNode;
  }
  return null;
};

/**
 * Translate this workspace to new coordinates.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
eYo.Workspace.prototype.translate = function(x, y) {
  if (this.useWorkspaceDragSurface_ && this.isDragSurfaceActive_) {
    this.workspaceDragSurface_.translateSurface(x,y);
  } else {
    var translation = 'translate(' + x + ',' + y + ') ' +
        'scale(' + this.scale + ')';
    this.svgBlockCanvas_.setAttribute('transform', translation)
  }
  // Now update the block drag surface if we're using one.
  if (this.brickDragSurface_) {
    this.brickDragSurface_.translateAndScaleGroup(x, y, this.scale);
  }
};

/**
 * Called at the end of a workspace drag to take the contents
 * out of the drag surface and put them back into the workspace SVG.
 * Does nothing if the workspace drag surface is not enabled.
 * @package
 */
eYo.Workspace.prototype.resetDragSurface = function() {
  // Don't do anything if we aren't using a drag surface.
  if (!this.useWorkspaceDragSurface_) {
    return;
  }

  this.isDragSurfaceActive_ = false;

  var trans = this.workspaceDragSurface_.getSurfaceTranslation();
  this.workspaceDragSurface_.clearAndHide(this.dom.group_);
  var translation = 'translate(' + trans.x + ',' + trans.y + ') ' +
      'scale(' + this.scale + ')';
  this.svgBlockCanvas_.setAttribute('transform', translation)
};

/**
 * Called at the beginning of a workspace drag to move contents of
 * the workspace to the drag surface.
 * Does nothing if the drag surface is not enabled.
 * @package
 */
eYo.Workspace.prototype.setupDragSurface = function() {
  // Don't do anything if we aren't using a drag surface.
  if (!this.useWorkspaceDragSurface_) {
    return;
  }

  // This can happen if the user starts a drag, mouses up outside of the
  // document where the mouseup listener is registered (e.g. outside of an
  // iframe) and then moves the mouse back in the workspace.  On mobile and ff,
  // we get the mouseup outside the frame. On chrome and safari desktop we do
  // not.
  if (this.isDragSurfaceActive_) {
    return;
  }

  this.isDragSurfaceActive_ = true;

  // Figure out where we want to put the canvas back.  The order
  // in the is important because things are layered.
  var previousElement = this.svgBlockCanvas_.previousSibling;
  var width = parseInt(this.getParentSvg().getAttribute('width'), 10);
  var height = parseInt(this.getParentSvg().getAttribute('height'), 10);
  var coord = Blockly.utils.getRelativeXY(this.svgBlockCanvas_);
  this.workspaceDragSurface_.setContentsAndShow(this.svgBlockCanvas_, previousElement, width, height, this.scale);
  this.workspaceDragSurface_.translateSurface(coord.x, coord.y);
};

/**
 * Returns the horizontal offset of the workspace.
 * @return {number} Width.
 */
eYo.Workspace.prototype.getWidth = function() {
  var metrics = this.getMetrics();
  return metrics ? metrics.viewWidth / this.scale : 0;
}

/**
 * Toggles the visibility of the workspace.
 * Currently only intended for main workspace.
 * @param {boolean} isVisible True if workspace should be visible.
 */
eYo.Workspace.prototype.setVisible = function(isVisible) {

  // Tell the scrollbar whether its container is visible so it can
  // tell when to hide itself.
  if (this.scrollbar) {
    this.scrollbar.setContainerVisible(isVisible);
  }

  // Tell the flyout whether its container is visible so it can
  // tell when to hide itself.
  if (this.getFlyout_()) {
    this.getFlyout_().setContainerVisible(isVisible);
  }

  this.getParentSvg().style.display = isVisible ? 'block' : 'none';
  if (isVisible) {
    this.render();
  } else {
    Blockly.hideChaff(true);
  }
};

/**
 * Render all blocks in workspace.
 */
eYo.Workspace.prototype.render = function() {
  // Generate list of all blocks.
  var blocks = this.getAllBlocks();
  // Render each block.
  for (var i = blocks.length - 1; i >= 0; i--) {
    blocks[i].render(false);
  }
};

/**
 * Was used back when block highlighting (for execution) and block selection
 * (for editing) were the same thing.
 * Any calls of this function can be deleted.
 * @deprecated October 2016
 */
eYo.Workspace.prototype.traceOn = function() {
  console.warn('Deprecated call to traceOn, delete this.');
};

/**
 * Highlight or unhighlight a block in the workspace.  Block highlighting is
 * often used to visually mark blocks currently being executed.
 * @param {?string} id ID of block to highlight/unhighlight,
 *   or null for no block (used to unhighlight all blocks).
 * @param {boolean=} opt_state If undefined, highlight specified block and
 * automatically unhighlight all others.  If true or false, manually
 * highlight/unhighlight the specified block.
 */
eYo.Workspace.prototype.highlightBlock = function(id, opt_state) {
  if (opt_state === undefined) {
    // Unhighlight all blocks.
    for (var i = 0, block; block = this.highlightedBlocks_[i]; i++) {
      block.setHighlighted(false);
    }
    this.highlightedBlocks_.length = 0;
  }
  // Highlight/unhighlight the specified block.
  var block = id ? this.getBlockById(id) : null;
  if (block) {
    var state = (opt_state === undefined) || opt_state;
    // Using Set here would be great, but at the cost of IE10 support.
    if (!state) {
      goog.array.remove(this.highlightedBlocks_, block);
    } else if (this.highlightedBlocks_.indexOf(block) == -1) {
      this.highlightedBlocks_.push(block);
    }
    block.setHighlighted(state);
  }
};

/**
 * Paste the provided block onto the workspace.
 * @param {!Element} xmlBlock XML block element.
 */
eYo.Workspace.prototype.paste = function (dom) {
  if (!this.rendered || dom.getElementsByTagName('s').length + dom.getElementsByTagName('x').length >=
      this.remainingCapacity()) {
    return
  }
  if (this.currentGesture_) {
    this.currentGesture_.cancel() // Dragging while pasting?  No.
  }
  var m4t, targetM4t, b3k
  eYo.Events.groupWrap(() => {
    if ((b3k = eYo.Xml.domToBrick(dom, this))) {
      if ((m4t = eYo.Selected.magnet)) {
        if (m4t.isInput) {
          targetM4t = b3k.out_m
        } else if (m4t.isFoot || m4t.isSuite) {
          targetM4t = b3k.head_m
        } else if (m4t.isHead) {
          targetM4t = b3k.foot_m
        } else if (m4t.isLeft) {
          targetM4t = b3k.right_m
        } else if (m4t.isRight) {
          targetM4t = b3k.left_m
        }
        if (targetM4t && m4t.checkType_(targetM4t)) {
          if (m4t.isHead) {
            // the pasted brick must move before it is connected
            // otherwise the newly created brick will attract the old one
            // resulting in a move of the existing connection
            var xy = targetM4t.ui.xyInWorkspace
            var xx = targetM4t.x + xy.x
            var yy = targetM4t.y + xy.y
            xy = m4t.ui.xyInWorkspace
            targetM4t.brick.moveByXY(m4t.x + xy.x - xx, m4t.y + xy.y - yy)
          }
          m4t.connect(targetM4t)
          // if (magnet.isHead) {
          //   targetMagnet = brick.foot_m
          // }
          b3k.select()
        }
      } else {
        // Move the duplicate to original position.
        var dx = parseInt(dom.getAttribute('x'), 10)
        var dy = parseInt(dom.getAttribute('y'), 10)
        if (!isNaN(dx) && !isNaN(dy)) {
          // Offset block until not clobbering another block and not in connection
          // distance with neighbouring bricks.
          var allBlocks = this.getAllBlocks()
          var avoidCollision = () => {
            do {
              var collide = allBlocks.some(b => {
                var xy = b.ui.xyInWorkspace
                if (Math.abs(dx - xy.x) <= 10 &&
                    Math.abs(dy - xy.y) <= 10) {
                  return true
                }
              }) || b3k.getMagnets_(false).some(m4t => {
                  var neighbour = m4t.closest(Blockly.SNAP_RADIUS,
                    new goog.math.Coordinate(dx, dy))
                  if (neighbour) {
                    return true
                  }
              })
              if (collide) {
                dx += Blockly.SNAP_RADIUS
                dy += Blockly.SNAP_RADIUS * 2
              }
            } while (collide)
          }
          avoidCollision()
          // is the block in the visible area ?
          var metrics = this.getMetrics()
          var scale = this.scale || 1
          var size = b3k.size
          // the block is in the visible area if we see its center
          var leftBound = metrics.viewLeft / scale - size.width / 2
          var topBound = metrics.viewTop / scale - size.height / 2
          var rightBound = (metrics.viewLeft + metrics.viewWidth) / scale - size.width / 2
          var downBound = (metrics.viewTop + metrics.viewHeight) / scale - size.height / 2
          var inVisibleArea = () => {
            return dx >= leftBound && dx <= rightBound &&
            dy >= topBound && dy <= downBound
          }
          if (!inVisibleArea()) {
            dx = (metrics.viewLeft + metrics.viewWidth / 2) / scale - size.width / 2
            dy = (metrics.viewTop + metrics.viewHeight / 2) / scale - size.height / 2
            avoidCollision()
          }
          b3k.moveByXY(dx, dy)
        }
        b3k.select().scrollToVisible()
      }
    }
  })
}

/**
 * Make a list of all the delete areas for this workspace.
 */
eYo.Workspace.prototype.recordDeleteAreas = function() {
  if (this.trashcan && this.dom.group_.parentNode) {
    this.deleteAreaTrash_ = this.trashcan.getClientRect();
  } else {
    this.deleteAreaTrash_ = null;
  }
  if (this.flyout_) {
    this.deleteAreaToolbox_ = this.flyout_.clientRect
  } else {
    this.deleteAreaToolbox_ = null;
  }
};

/**
 * Is the mouse event over a delete area (toolbox or non-closing flyout)?
 * @param {!Event} e Mouse move event.
 * @return {?number} Null if not over a delete area, or an enum representing
 *     which delete area the event is over.
 */
eYo.Workspace.prototype.isDeleteArea = function(e) {
  var xy = new goog.math.Coordinate(e.clientX, e.clientY);
  if (this.deleteAreaTrash_ && this.deleteAreaTrash_.contains(xy)) {
    return Blockly.DELETE_AREA_TRASH;
  }
  if (this.deleteAreaToolbox_ && this.deleteAreaToolbox_.contains(xy)) {
    return Blockly.DELETE_AREA_TOOLBOX;
  }
  return Blockly.DELETE_AREA_NONE;
};

/**
 * Handle a mouse-down on SVG drawing surface.
 * @param {!Event} e Mouse down event.
 * @private
 */
eYo.Workspace.prototype.onMouseDown_ = function(e) {
  var gesture = this.getGesture(e)
  if (gesture) {
    gesture.handleWsStart(e, this);
  }
};

/**
 * Start tracking a drag of an object on this workspace.
 * @param {!Event} e Mouse down event.
 * @param {!goog.math.Coordinate} xy Starting location of object.
 */
eYo.Workspace.prototype.startDrag = function(e, xy) {
  var point = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  this.dragDeltaXY_ = goog.math.Coordinate.difference(xy, point);
};

/**
 * Track a drag of an object on this workspace.
 * @param {!Event} e Mouse move event.
 * @return {!goog.math.Coordinate} New location of object.
 */
eYo.Workspace.prototype.moveDrag = function(e) {
  var point = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  return goog.math.Coordinate.sum(this.dragDeltaXY_, point);
};

/**
 * Is the user currently dragging a block or scrolling the flyout/workspace?
 * @return {boolean} True if currently dragging or scrolling.
 */
eYo.Workspace.prototype.isDragging = function() {
  return this.currentGesture_ != null && this.currentGesture_.isDragging();
};

/**
 * Is this workspace draggable and scrollable?
 * @return {boolean} True if this workspace may be dragged.
 */
eYo.Workspace.prototype.isDraggable = function() {
  return !!this.scrollbar
}

/**
 * Calculate the bounding box for the blocks on the workspace.
 * Coordinate system: workspace coordinates.
 *
 * @return {Object} Contains the position and size of the bounding box
 *   containing the blocks on the workspace.
 */
eYo.Workspace.prototype.getBlocksBoundingBox = function() {
  var topBlocks = this.getTopBlocks(false);
  // Initialize boundary using the first rendered block, if any.
  var i = 0
  while (i < topBlocks.length) {
    var b = topBlocks[i]
    if (b.ui && b.ui.rendered) {
      var bound = b.ui.boundingRect
      while (++i < topBlocks.length) {
        var b = topBlocks[i]
        if (b.ui.rendered) {
          var blockBoundary = b.ui.boundingRect
          if (blockBoundary.topLeft.x < bound.topLeft.x) {
            bound.topLeft.x = blockBoundary.topLeft.x
          }
          if (blockBoundary.bottomRight.x > bound.bottomRight.x) {
            bound.bottomRight.x = blockBoundary.bottomRight.x
          }
          if (blockBoundary.topLeft.y < bound.topLeft.y) {
            bound.topLeft.y = blockBoundary.topLeft.y
          }
          if (blockBoundary.bottomRight.y > bound.bottomRight.y) {
            bound.bottomRight.y = blockBoundary.bottomRight.y
          }
        }
      }
      return {
        x: bound.topLeft.x,
        y: bound.topLeft.y,
        width: bound.bottomRight.x - bound.topLeft.x,
        height: bound.bottomRight.y - bound.topLeft.y
      }
    }
    ++i
  }
  // There are no rendered bricks, return empty rectangle.
  return {x: 0, y: 0, width: 0, height: 0}
}

/**
 * Clean up the workspace by ordering all the blocks in a column.
 */
eYo.Workspace.prototype.cleanUp = function() {
    this.setResizesEnabled(false)
  Blockly.Events.setGroup(true)
  var cursorY = 0
  this.getTopBlocks(true).forEach(brick => {
    var xy = brick.ui.xyInWorkspace
    brick.ui.moveBy(-xy.x, cursorY - xy.y)
    block.ui.snapToGrid()
    cursorY = brick.ui.xyInWorkspace.y +
        brick.size.height + eYo.Unit.y
  })
  Blockly.Events.setGroup(false)
  this.setResizesEnabled(true)
}
   

/**
 * Show the context menu for the workspace.
 * @param {!Event} e Mouse event.
 * @private
 * @suppress{accessControls}
 */
eYo.Workspace.prototype.showContextMenu_ = function (e) {
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

  // Option to clean up bricks.
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
      var b3k = topBlocks[i]
      while (b3k) {
        if (b3k.collapsed) {
          hasCollapsedBlocks = true
        } else {
          hasExpandedBlocks = true
        }
        b3k = b3k.foot
      }
    }

    /**
     * Option to collapse or expand top bricks.
     * @param {boolean} shouldCollapse Whether a block should collapse.
     * @private
     */
    var toggleOption = (shouldCollapse) => {
      var ms = 0
      for (var i = 0; i < topBlocks.length; i++) {
        var block = topBlocks[i]
        while (block) {
          setTimeout(block.setCollapsed.bind(block, shouldCollapse), ms)
          block = block.foot
          ms += DELAY
        }
      }
    }

    // Option to collapse top bricks.
    var collapseOption = {enabled: hasExpandedBlocks}
    collapseOption.text = eYo.Msg.COLLAPSE_ALL
    collapseOption.callback = () => {
      toggleOption(true)
    }
    menuOptions.push(collapseOption)

    // Option to expand top bricks.
    var expandOption = {enabled: hasCollapsedBlocks}
    expandOption.text = eYo.Msg.EXPAND_ALL
    expandOption.callback = () => {
      toggleOption(false)
    }
    menuOptions.push(expandOption)
  }

  // Option to delete all bricks.
  // Count the number of bricks that are deletable.
  var deleteList = []
  function addDeletableBlocks (b3k) {
    if (b3k.isDeletable()) {
      deleteList = deleteList.concat(b3k.getWrappedDescendants())
    } else {
      b3k.getChildren().forEach(child => addDeletableBlocks(child))
    }
  }
  topBlocks.forEach(child => addDeletableBlocks(child))

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

  Blockly.ContextMenu.show(e, menuOptions)
}

/**
 * Mark this workspace as the currently focused main workspace.
 */
eYo.Workspace.prototype.markFocused = function() {
  if (this.options.parentWorkspace) {
    this.options.parentWorkspace.markFocused();
  } else {
    Blockly.mainWorkspace = this;
    // We call e.preventDefault in many event handlers which means we
    // need to explicitly grab focus (e.g from a textarea) because
    // the browser will not do it for us.  How to do this is browser dependant.
    this.setBrowserFocus();
  }
};

/**
 * Set the workspace to have focus in the browser.
 * @private
 */
eYo.Workspace.prototype.setBrowserFocus = function() {
  // Blur whatever was focused since explcitly grabbing focus below does not
  // work in Edge.
  if (document.activeElement) {
    document.activeElement.blur();
  }
  try {
    // Focus the workspace SVG - this is for Chrome and Firefox.
    this.getParentSvg().focus();
  } catch (e) {
    // IE and Edge do not support focus on SVG elements. When that fails
    // above, get the injectionDiv (the workspace's parent) and focus that
    // instead.  This doesn't work in Chrome.
    try {
      // In IE11, use setActive (which is IE only) so the page doesn't scroll
      // to the workspace gaining focus.
      this.getParentSvg().parentNode.setActive();
    } catch (e) {
      // setActive support was discontinued in Edge so when that fails, call
      // focus instead.
      this.getParentSvg().parentNode.focus();
    }
  }
};

/**
 * Zooming the blocks centered in (x, y) coordinate with zooming in or out.
 * @param {number} x X coordinate of center.
 * @param {number} y Y coordinate of center.
 * @param {number} amount Amount of zooming
 *                        (negative zooms out and positive zooms in).
 */
eYo.Workspace.prototype.zoom = function(x, y, amount) {
  var speed = this.options.zoomOptions.scaleSpeed;
  var metrics = this.getMetrics();
  var center = this.getParentSvg().createSVGPoint();
  center.x = x;
  center.y = y;
  center = center.matrixTransform(this.getCanvas().getCTM().inverse());
  x = center.x;
  y = center.y;
  var canvas = this.getCanvas();
  // Scale factor.
  var scaleChange = Math.pow(speed, amount);
  // Clamp scale within valid range.
  var newScale = this.scale * scaleChange;
  if (newScale > this.options.zoomOptions.maxScale) {
    scaleChange = this.options.zoomOptions.maxScale / this.scale;
  } else if (newScale < this.options.zoomOptions.minScale) {
    scaleChange = this.options.zoomOptions.minScale / this.scale;
  }
  if (this.scale == newScale) {
    return;  // No change in zoom.
  }
  if (this.scrollbar) {
    var matrix = canvas.getCTM()
        .translate(x * (1 - scaleChange), y * (1 - scaleChange))
        .scale(scaleChange);
    // newScale and matrix.a should be identical (within a rounding error).
    // ScrollX and scrollY are in pixels.
    this.scrollX = matrix.e - metrics.absoluteLeft;
    this.scrollY = matrix.f - metrics.absoluteTop;
  }
  this.setScale(newScale);
};

/**
 * Zooming the blocks centered in the center of view with zooming in or out.
 * @param {number} type Type of zooming (-1 zooming out and 1 zooming in).
 */
eYo.Workspace.prototype.zoomCenter = function(type) {
  var metrics = this.getMetrics();
  var x = metrics.viewWidth / 2;
  var y = metrics.viewHeight / 2;
  this.zoom(x, y, type);
};

/**
 * Zoom the blocks to fit in the workspace if possible.
 */
eYo.Workspace.prototype.zoomToFit = function() {
  var metrics = this.getMetrics();
  var blocksBox = this.getBlocksBoundingBox();
  var blocksWidth = blocksBox.width;
  var blocksHeight = blocksBox.height;
  if (!blocksWidth) {
    return;  // Prevents zooming to infinity.
  }
  var workspaceWidth = metrics.viewWidth;
  var workspaceHeight = metrics.viewHeight;
  if (this.flyout_) {
    workspaceWidth -= this.flyout_.width_;
  }
  if (!this.scrollbar) {
    // Origin point of 0,0 is fixed, blocks will not scroll to center.
    blocksWidth += metrics.contentLeft;
    blocksHeight += metrics.contentTop;
  }
  var ratioX = workspaceWidth / blocksWidth;
  var ratioY = workspaceHeight / blocksHeight;
  this.setScale(Math.min(ratioX, ratioY));
  this.scrollCenter();
};

/**
 * Center the workspace.
 */
eYo.Workspace.prototype.scrollCenter = function() {
  if (!this.scrollbar) {
    // Can't center a non-scrolling workspace.
    console.warn('Tried to scroll a non-scrollable workspace.');
    return;
  }
  var metrics = this.getMetrics();
  var x = (metrics.contentWidth - metrics.viewWidth) / 2;
  if (this.flyout_) {
    x -= this.flyout_.width_ / 2;
  }
  var y = (metrics.contentHeight - metrics.viewHeight) / 2;
  this.scrollbar.set(x, y);
};
  
/**
 * Scroll the workspace to center on the given block.
 * @param {?string} id ID of block center on.
 * @public
 */
eYo.Workspace.prototype.centerOnBlock = function(id) {
  if (!this.scrollbar) {
    console.warn('Tried to scroll a non-scrollable workspace.');
    return;
  }

  var block = this.getBlockById(id);
  if (!block) {
    return;
  }

  // XY is in workspace coordinates.
  var xy = block.getRelativeToSurfaceXY();
  // Height/width is in workspace units.
  var heightWidth = block.getHeightWidth();

  // Find the enter of the block in workspace units.
  var blockCenterY = xy.y + heightWidth.height / 2;

  var blockCenterX = xy.x + heightWidth.width / 2;

  // Workspace scale, used to convert from workspace coordinates to pixels.
  var scale = this.scale;

  // Center in pixels.  0, 0 is at the workspace origin.  These numbers may
  // be negative.
  var pixelX = blockCenterX * scale;
  var pixelY = blockCenterY * scale;

  var metrics = this.getMetrics();

  // Scrolling to here would put the block in the top-left corner of the
  // visible workspace.
  var scrollToBlockX = pixelX - metrics.contentLeft;
  var scrollToBlockY = pixelY - metrics.contentTop;

  // viewHeight and viewWidth are in pixels.
  var halfViewWidth = metrics.viewWidth / 2;
  var halfViewHeight = metrics.viewHeight / 2;

  // Put the block in the center of the visible workspace instead.
  var scrollToCenterX = scrollToBlockX - halfViewWidth;
  var scrollToCenterY = scrollToBlockY - halfViewHeight;

  Blockly.hideChaff();
  this.scrollbar.set(scrollToCenterX, scrollToCenterY);
};

/**
 * Set the workspace's zoom factor.
 * @param {number} newScale Zoom factor.
 */
eYo.Workspace.prototype.setScale = function(newScale) {
  if (this.options.zoomOptions.maxScale &&
      newScale > this.options.zoomOptions.maxScale) {
    newScale = this.options.zoomOptions.maxScale;
  } else if (this.options.zoomOptions.minScale &&
      newScale < this.options.zoomOptions.minScale) {
    newScale = this.options.zoomOptions.minScale;
  }
  this.scale = newScale;
  if (this.scrollbar) {
    this.scrollbar.resize();
  } else {
    this.translate(this.scrollX, this.scrollY);
  }
  Blockly.hideChaff(false);
  if (this.flyout_) {
    // No toolbox, resize flyout.
    this.flyout_.reflow();
  }
};

/**
 * Get the dimensions of the given workspace component, in pixels.
 * @param {Blockly.Toolbox|Blockly.Flyout} elem The element to get the
 *     dimensions of, or null.  It should be a toolbox or flyout, and should
 *     implement getWidth() and getHeight().
 * @return {!Object} An object containing width and height attributes, which
 *     will both be zero if elem did not exist.
 * @private
 */
eYo.Workspace.getDimensionsPx_ = function(elem) {
  var width = 0;
  var height = 0;
  if (elem) {
    width = elem.getWidth();
    height = elem.getHeight();
  }
  return {
    width: width,
    height: height
  };
};
  
/**
 * Get the content dimensions of the given workspace, taking into account
 * whether or not it is scrollable and what size the workspace div is on screen.
 * @param {!eYo.Workspace} ws The workspace to measure.
 * @param {!Object} svgSize An object containing height and width attributes in
 *     CSS pixels.  Together they specify the size of the visible workspace, not
 *     including areas covered up by the toolbox.
 * @return {!Object} The dimensions of the contents of the given workspace, as
 *     an object containing at least
 *     - height and width in pixels
 *     - left and top in pixels relative to the workspace origin.
 * @private
 */
eYo.Workspace.getContentDimensions_ = function(ws, svgSize) {
  if (ws.scrollbar) {
    return eYo.Workspace.getContentDimensionsBounded_(ws, svgSize);
  } else {
    return eYo.Workspace.getContentDimensionsExact_(ws);
  }
};

/**
 * Get the bounding box for all workspace contents, in pixels.
 * @param {!eYo.Workspace} ws The workspace to inspect.
 * @return {!Object} The dimensions of the contents of the given workspace, as
 *     an object containing
 *     - height and width in pixels
 *     - left, right, top and bottom in pixels relative to the workspace origin.
 * @private
 */
eYo.Workspace.getContentDimensionsExact_ = function(ws) {
  // Block bounding box is in workspace coordinates.
  var blockBox = ws.getBlocksBoundingBox();
  var scale = ws.scale;

  // Convert to pixels.
  var width = blockBox.width * scale;
  var height = blockBox.height * scale;
  var left = blockBox.x * scale;
  var top = blockBox.y * scale;

  return {
    left: left,
    top: top,
    right: left + width,
    bottom: top + height,
    width: width,
    height: height
  };
};
  
/**
 * Calculate the size of a scrollable workspace, which should include room for a
 * half screen border around the workspace contents.
 * @param {!eYo.Workspace} ws The workspace to measure.
 * @param {!Object} svgSize An object containing height and width attributes in
 *     CSS pixels.  Together they specify the size of the visible workspace, not
 *     including areas covered up by the toolbox.
 * @return {!Object} The dimensions of the contents of the given workspace, as
 *     an object containing
 *     - height and width in pixels
 *     - left and top in pixels relative to the workspace origin.
 * @private
 */
eYo.Workspace.getContentDimensionsBounded_ = function(ws, svgSize) {
  var content = eYo.Workspace.getContentDimensionsExact_(ws);

  // View height and width are both in pixels, and are the same as the SVG size.
  var viewWidth = svgSize.width;
  var viewHeight = svgSize.height;
  var halfWidth = viewWidth / 2;
  var halfHeight = viewHeight / 2;

  // Add a border around the content that is at least half a screenful wide.
  // Ensure border is wide enough that blocks can scroll over entire screen.
  var left = Math.min(content.left - halfWidth, content.right - viewWidth);
  var right = Math.max(content.right + halfWidth, content.left + viewWidth);

  var top = Math.min(content.top - halfHeight, content.bottom - viewHeight);
  var bottom = Math.max(content.bottom + halfHeight, content.top + viewHeight);

  var dimensions = {
    left: left,
    top: top,
    height: bottom - top,
    width: right - left
  };
  return dimensions;
};

/**
 * Return an object with all the metrics required to size scrollbars for a
 * top level workspace.  The following properties are computed:
 * Coordinate system: pixel coordinates.
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the content,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .viewLeft: Offset of left edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate.
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * .toolboxWidth: Width of toolbox, if it exists.  Otherwise zero.
 * .toolboxHeight: Height of toolbox, if it exists.  Otherwise zero.
 * .flyoutWidth: Width of the flyout if it is always open.  Otherwise zero.
 * .flyoutHeight: Height of flyout if it is always open.  Otherwise zero.
 * .flyoutAnchor: Top, bottom, left or right.
 * @return {!Object} Contains size and position metrics of a top level
 *   workspace.
 * @private
 * @this eYo.Workspace
 */
eYo.Workspace.getTopLevelWorkspaceMetrics_ = function() {

  var flyoutDimensions =
      eYo.Workspace.getDimensionsPx_(this.flyout_);

  // Contains height and width in CSS pixels.
  // svgSize is equivalent to the size of the injectionDiv at this point.
  var svgSize = Blockly.svgSize(this.getParentSvg());

  // svgSize is now the space taken up by the Blockly workspace, not including
  // the toolbox.
  var contentDimensions =
      eYo.Workspace.getContentDimensions_(this, svgSize);

  var absoluteLeft = 0;
  var absoluteTop = 0;

  var metrics = {
    contentHeight: contentDimensions.height,
    contentWidth: contentDimensions.width,
    contentTop: contentDimensions.top,
    contentLeft: contentDimensions.left,

    viewHeight: svgSize.height,
    viewWidth: svgSize.width,
    viewTop: -this.scrollY,   // Must be in pixels, somehow.
    viewLeft: -this.scrollX,  // Must be in pixels, somehow.

    absoluteTop: absoluteTop,
    absoluteLeft: absoluteLeft,

    toolboxWidth: toolboxDimensions.width,
    toolboxHeight: toolboxDimensions.height,

    flyoutWidth: flyoutDimensions.width,
    flyoutHeight: flyoutDimensions.height,

    flyoutAnchor: this.flyout_.anchor
  };
  return metrics;
};

/**
 * Sets the X/Y translations of a top level workspace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 * @this eYo.Workspace
 */
eYo.Workspace.setTopLevelWorkspaceMetrics_ = function(xyRatio) {
  if (!this.scrollbar) {
    throw 'Attempt to set top level workspace scroll without scrollbars.';
  }
  var metrics = this.getMetrics();
  if (goog.isNumber(xyRatio.x)) {
    this.scrollX = -metrics.contentWidth * xyRatio.x - metrics.contentLeft;
  }
  if (goog.isNumber(xyRatio.y)) {
    this.scrollY = -metrics.contentHeight * xyRatio.y - metrics.contentTop;
  }
  var x = this.scrollX + metrics.absoluteLeft;
  var y = this.scrollY + metrics.absoluteTop;
  this.translate(x, y);
};

/**
 * Update whether this workspace has resizes enabled.
 * If enabled, workspace will resize when appropriate.
 * If disabled, workspace will not resize until re-enabled.
 * Use to avoid resizing during a batch operation, for performance.
 * @param {boolean} enabled Whether resizes should be enabled.
 */
eYo.Workspace.prototype.setResizesEnabled = function(enabled) {
  var reenabled = (!this.resizesEnabled_ && enabled);
  this.resizesEnabled_ = enabled;
  if (reenabled) {
    // Newly enabled.  Trigger a resize.
    this.resizeContents();
  }
};

/**
 * Register a callback function associated with a given key, for clicks on
 * buttons and labels in the flyout.
 * For instance, a button specified by the XML
 * <button text="create variable" callbackKey="CREATE_VARIABLE"></button>
 * should be matched by a call to
 * registerButtonCallback("CREATE_VARIABLE", yourCallbackFunction).
 * @param {string} key The name to use to look up this function.
 * @param {function(!Blockly.FlyoutButton)} func The function to call when the
 *     given button is clicked.
 */
eYo.Workspace.prototype.registerButtonCallback = function(key, func) {
  goog.asserts.assert(goog.isFunction(func),
      'Button callbacks must be functions.');
  this.flyoutButtonCallbacks_[key] = func;
};

/**
 * Get the callback function associated with a given key, for clicks on buttons
 * and labels in the flyout.
 * @param {string} key The name to use to look up the function.
 * @return {?function(!Blockly.FlyoutButton)} The function corresponding to the
 *     given key for this workspace; null if no callback is registered.
 */
eYo.Workspace.prototype.getButtonCallback = function(key) {
  var result = this.flyoutButtonCallbacks_[key];
  return result ? result : null;
};

/**
 * Remove a callback for a click on a button in the flyout.
 * @param {string} key The name associated with the callback function.
 */
eYo.Workspace.prototype.removeButtonCallback = function(key) {
  this.flyoutButtonCallbacks_[key] = null;
}

/**
 * Look up the gesture that is tracking this touch stream on this workspace.
 * May create a new gesture.
 * @param {!Event} e Mouse event or touch event.
 * @return {Blockly.TouchGesture} The gesture that is tracking this touch
 *     stream, or null if no valid gesture exists.
 * @package
 */
eYo.Workspace.prototype.getGesture = function(e) {
  var isStart = (e.type == 'mousedown' || e.type == 'touchstart' ||
      e.type == 'pointerdown')

  var gesture = this.currentGesture_
  if (gesture) {
    if (isStart && gesture.hasStarted()) {
      console.warn('tried to start the same gesture twice')
      // That's funny.  We must have missed a mouse up.
      // Cancel it, rather than try to retrieve all of the state we need.
      gesture.cancel()
      return null
    }
    return gesture
  }

  // No gesture existed on this workspace, but this looks like the start of a
  // new gesture.
  if (isStart) {
    this.currentGesture_ = new eYo.Gesture(e, this)
    return this.currentGesture_
  }
  // No gesture existed and this event couldn't be the start of a new gesture.
  return null
}

/**
 * Clear the reference to the current gesture.
 * @package
 */
eYo.Workspace.prototype.clearGesture = function() {
  this.currentGesture_ = null;
};

/**
 * Cancel the current gesture, if one exists.
 * @package
 */
eYo.Workspace.prototype.cancelCurrentGesture = function() {
  if (this.currentGesture_) {
    this.currentGesture_.cancel();
  }
};

/**
 * Get the audio manager for this workspace.
 * @return {Blockly.WorkspaceAudio} The audio manager for this workspace.
 */
eYo.Workspace.prototype.getAudioManager = function() {
  return this.audioManager_;
};
   
// Export symbols that would otherwise be renamed by Closure compiler.
eYo.Workspace.prototype['setVisible'] =
    eYo.Workspace.prototype.setVisible;

eYo.Workspace.prototype.logAllConnections = function (comment) {
  comment = comment || ''
  ;[
    'IN',
    'OUT',
    'FOOT',
    'HEAD',
    'LEFT',
    'RIGHT'
  ].forEach(k => {
    var dbList = this.connectionDBList
    console.log(`${comment} > ${k} magnet`)
    dbList[eYo.Magnet[k]].forEach(m4t => {
      console.log(m4t.x_, m4t.y_, m4t.xyInBlock_, m4t.brick.type)
    })
  })
}


/**
 * Convert a coordinate object from pixels to workspace units.
 * @param {!goog.math.Coordinate} pixelCoord  A coordinate with x and y values
 *     in css pixel units.
 * @return {!goog.math.Coordinate} The input coordinate divided by the workspace
 *     scale.
 * @private
 */
eYo.Workspace.prototype.fromPixelUnit = function(xy) {
  return new goog.math.Coordinate(xy.x / this.scale, xy.y / this.scale)
}

/**
 *
 */
eYo.Workspace.prototype.getRecover = (() => {
  var get = function () {
    return this.recover_
  }
  return function () {
    goog.asserts.assert(!this.recover_, 'Collision: this.recover_')
    this.recover_ = new eYo.Xml.Recover(this)
    this.getRecover = get
    return this.recover_
  }
}) ()

/**
 * Create a driver for rendering.
 * @return {eYo.Driver}
 */
eYo.Workspace.prototype.driverCreate = function () {
  return new eYo.Svg()
}

/**
 * Add the nodes from string to the workspace.
 * Usefull for testing? -> commonn test methods.
 * @param {!String} str
 * @return {Array.<string>} An array containing new block IDs.
 */
eYo.Workspace.prototype.fromDom = function (dom) {
  return dom &&(eYo.Xml.domToWorkspace(dom, this))
}

/**
 * Add the nodes from string to the workspace.
 * @param {!String} str
 * @return {Array.<string>} An array containing new block IDs.
 */
eYo.Workspace.prototype.fromString = function (str) {
  var parser = new DOMParser()
  var dom = parser.parseFromString(str, 'application/xml')
  return this.fromDom(dom)
}


/**
 * Convert the workspace to string.
 * @param {?Object} opt  See eponym parameter in `eYo.Xml.brickToDom`.
 */
eYo.Workspace.prototype.toDom = function (opt) {
  return eYo.Xml.workspaceToDom(this, opt)
}

/**
 * Convert the workspace to string.
 * @param {?Boolean} opt_noId
 */
eYo.Workspace.prototype.toString = function (opt_noId) {
  let oSerializer = new XMLSerializer()
  return oSerializer.serializeToString(this.toDom())
}

/**
 * Convert the workspace to UTF8 byte array.
 * @param {?Boolean} opt_noId
 */
eYo.Workspace.prototype.toUTF8ByteArray = function (opt_noId) {
  var s = '<?xml version="1.0" encoding="utf-8"?>\n' + this.toString(optNoId)
  return goog.crypt.toUTF8ByteArray(s)
}

/**
 * Add the nodes from UTF8 string representation to the workspace. UNUSED.
 * @param {!Array} bytes
 * @return {Array.<string>} An array containing new block IDs.
 */
eYo.Workspace.prototype.fromUTF8ByteArray = function (bytes) {
  var str = goog.crypt.utf8ByteArrayToString(bytes)
  return str && (this.fromString(str))
}


/**
 * Add a brick to the workspace.
 * @param {eYo.Brick} brick
 * @param {String} opt_id
 */
eYo.Workspace.prototype.addBrick = function (brick, opt_id) {
  brick.id = (opt_id && !this.getBlockById(opt_id)) ?
  opt_id : Blockly.utils.genUid()
  this.hasUI && brick.makeUI()
  this.addTopBlock(brick)
  this.brickDB_[brick.id] = brick
}


/**
 * Add a brick to the workspace.
 * @param {eYo.Brick} brick
 */
eYo.Workspace.prototype.removeBrick = function (brick) {
  this.removeTopBlock(brick)
  // Remove from workspace
  this.brickDB_[brick.id]
}

/**
 * Tidy up the nodes.
 * @param {?Object} kvargs  key value arguments
 * IN PROGRESS
eYo.Workspace.prototype.tidyUp = function (kvargs) {
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
  var tops = this.topBricks_.filter(b3k => {
    return {
      b3k,
      xy: b3k.ui.xyInWorkspace
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
*/

/**
 * Scroll the workspace to center on the given block.
 * @param {?string} id ID of block center on.
 * @public
 */
eYo.Workspace.prototype.scrollBlockTopLeft = function(id) {
  if (!this.scrollbar) {
    console.warn('Tried to scroll a non-scrollable workspace.');
    return;
  }
  var brick = this.getBrickById(id);
  if (!brick) {
    return;
  }
  if (!brick.isStmt) {
    brick = brick.stmtParent || brick.root
  }
  // XY is in workspace coordinates.
  var xy = brick.ui.xyInWorkspace

  // Find the top left of the block in workspace units.
  var y = xy.y - eYo.Unit.y / 2

  var x = xy.x - eYo.Unit.x / 2 - brick.depth * eYo.Span.tabWidth

  // Workspace scale, used to convert from workspace coordinates to pixels.
  var scale = this.scale;

  // Center in pixels.  0, 0 is at the workspace origin.  These numbers may
  // be negative.
  var pixelX = x * scale;
  var pixelY = y * scale;

  var metrics = this.getMetrics()

  // Scrolling to here will put the block in the top-left corner of the
  // visible workspace.
  var scrollX = pixelX - metrics.contentLeft
  var scrollY = pixelY - metrics.contentTop

  Blockly.hideChaff();
  this.scrollbar.set(scrollX, scrollY)
}


/**
 * Recalculate a horizontal scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * Edython: position and resize according to the position of the flyout.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
Blockly.Scrollbar.prototype.resizeViewHorizontal = function(hostMetrics) {
  var workspace = this.workspace_
  var flyout = workspace.flyout_
  if (flyout) {
    var atRight = flyout.toolboxPosition_ === eYo.Flyout.AT_RIGHT
    var xy = flyout.flyoutPosition
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
  var flyout = workspace.flyout_
  if (flyout) {
    var atRight = flyout.toolboxPosition_ === Blockly.TOOLBOX_AT_RIGHT
  }
  if (atRight) {
    var xy = flyout.flyoutPosition
    var yOffset = flyout.TOP_OFFSET
  } else {
    yOffset = 1 * eYo.Unit.rem
  }
  viewSize -= yOffset
  this.setScrollViewSize_(Math.max(0, viewSize));

  if (xy) {
    var xCoordinate = xy.x - hostMetrics.absoluteLeft -     Blockly.Scrollbar.scrollbarThickness - 0.5
  } else {
    xCoordinate = hostMetrics.absoluteLeft + 0.5;
    xCoordinate += hostMetrics.viewWidth -
        Blockly.Scrollbar.scrollbarThickness - 1;
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

  if (metrics.flyoutAnchor == eYo.Flyout.AT_RIGHT) {
    var flyoutPosition = this.workspace_.flyout_.flyoutPosition
    if (flyoutPosition) {
      this.left_ = flyoutPosition.x -
      this.WIDTH_ - this.MARGIN_SIDE_ - Blockly.Scrollbar.scrollbarThickness
    } else {
      this.left_ -= metrics.flyoutWidth
    }
  }
  this.top_ = metrics.viewHeight + metrics.absoluteTop -
      (this.BODY_HEIGHT_ + this.LID_HEIGHT_) - this.bottom_;

  if (metrics.flyoutAnchor == eYo.Flyout.AT_BOTTOM) {
    this.top_ -= metrics.flyoutHeight
  }
  this.dom.group_.setAttribute('transform',
      'translate(' + this.left_ + ',' + this.top_ + ')');
};
