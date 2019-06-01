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

goog.require('eYo.Protocol.ChangeCount')

goog.forwardDeclare('goog.array');
goog.forwardDeclare('goog.math');

goog.forwardDeclare('eYo.Desktop')


/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * @param {!eYo.Factory} factory Any workspace belongs to a factory.
 * @constructor
 */
eYo.Workspace = function(factory, options) {
  /** @type {string} */
  this.id = eYo.Do.genUid()
  eYo.Workspace.WorkspaceDB_[this.id] = this

  this.factory_ = factory
  this.options = options

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
   * @type {!Array.<!eYo.Events.Abstract>}
   * @protected
   */
  this.undoStack_ = []
  /**
   * @type {!Array.<!eYo.Events.Abstract>}
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

  this.dragger_ = new eYo.WorkspaceDragger(this)
  this.brickDragger_ = new eYo.BrickDragger(this)

  /**
   * List of currently highlighted bricks.  Brick highlighting is often used to
   * visually mark bricks currently being executed.
   * @type !Array.<!eYo.Brick>
   * @private
   */
  this.highlightedBricks_ = []

  eYo.Magnet.DB.init(this)

  this.resetChangeCount()

}

eYo.Do.addProtocol(eYo.Workspace.prototype, 'ChangeCount')

Object.defineProperties(eYo.Workspace, {
  SNAP_RADIUS: { value: 20 },
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
   * The factory owning the workspace.
   * @readonly
   * @type {eYo.Factory}
   */
  factory: {
    get () {
      return this.factory_
    }
  },
  flyout: {
    get () {
      return this.flyout_
    },
    set (newValue) {
      var oldValue = this.flyout_
      if (newValue !== oldValue) {
        this.flyout_ = newValue
        if (oldValue) {
          oldValue.targetWorkspace = null
        }
        if (newValue) {
          this.targetWorkspace = null
          newValue.workspace.targetWorkspace = this
        }
      }
    }
  },
  targetWorkspace: {
    get () {
      return this.targetWorkspace_
    },
    set (newValue) {
      var oldValue = this.targetWorkspace_
      if (newValue !== oldValue) {
        this.targetWorkspace_ = newValue
        if (oldValue) {
          oldValue.flyout = null
        }
        if (newValue) {
          this.getGesture = newValue.getGesture.bind(newValue)
          this.flyout = null
          if (newValue.flyout) {
            newValue.flyout.targetWorkspace = newValue
          }
        } else {
          delete this.getGesture
        }
      }
    }
  },
  /**
   * Is this workspace the surface for a flyout?
   * @readonly
   * @type {boolean}
   */
  isFlyout: {
    get () {
      return !!this.targetWorkspace
    }
  },
  /**
   * The dragger, if relevant.
   */
  dragger: {
    get () {
      return this.draggable && this.dragger_
    }
  },
  audio: {
    get () {
      return (this.factory || this.targetWorkspace).audio
    }
  },
  /**
   * Is this workspace draggable and scrollable?
   * @type {boolean} True if this workspace may be dragged.
   */
  visible: {
    get () {
      return this.ui_driver.workspaceVisibleGet(this)

    },
    /**
     * Toggles the visibility of the workspace.
     * Currently only intended for main workspace.
     * @param {boolean} newValue True if workspace should be visible.
     */
    set (newValue) {
      // Tell the scrollbar whether its container is visible so it can
      // tell when to hide itself.
      if (this.scrollbar) {
        this.scrollbar.containerVisible = newValue
      }

      // Tell the flyout whether its container is visible so it can
      // tell when to hide itself.
      if (this.flyout_) {
        this.flyout_.containerVisible = newValue
      }
      this.ui_driver.workspaceVisibleSet(this, newValue)
      if (newValue) {
        this.render()
      } else {
        eYo.App.hideChaff()
      }
    }
  },
  /**
   * Is this workspace draggable and scrollable?
   * @type {boolean} True if this workspace may be dragged.
   */
  draggable: {
    get () {
      return this.targetWorkspace
      ? this.targetWorkspace.flyout_.scrollable
      : !!this.scrollbar
    }
  },
  /**
   * Is the user currently dragging a block or scrolling the flyout/workspace?
   * @return {boolean} True if currently dragging or scrolling.
   */
  isDragging: {
    get () {
      return this.currentGesture_ != null && this.currentGesture_.isDragging
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
  ui_driver: {
    get () {
      return this.factory.ui_driver_
    }
  },
  scale: {
    get () {
      return this.scale_
    },
    /**
     * Set the workspace's zoom factor.
     * zoom options are required
     * @param {number} newScale Zoom factor.
     */
    set (newScale) {
      var options = this.options.zoom
      if (options.maxScale &&
          newScale > options.maxScale) {
        newScale = options.maxScale;
      } else if (options.minScale &&
          newScale < options.minScale) {
        newScale = options.minScale;
      }
      this.scale_ = newScale
      if (this.scrollbar) {
        this.scrollbar.resize()
      } else {
        this.xyMoveTo(this.scrollX, this.scrollY)
      }
      eYo.App.hideChaff()
      if (this.flyout_) {
        // No toolbox, resize flyout.
        this.flyout_.reflow()
      }
    }
  },
  /**
   * Return the position of the workspace origin relative to the injection div
   * origin in pixels.
   * The workspace origin is where a block would render at position (0, 0).
   * It is not the upper left corner of the workspace SVG.
   * @return {!goog.math.Coordinate} Offset in pixels.
   * @package
   */
  originInFactory: {
    get () {
      return this.factory_.xyElementInFactory(this.dom.svg.canvas_)
    }
  },
  scale: {
    value: 1,
    writable: true
  },
  scrollX: {
    get () {
      return this.scrollX_
    },
    set (newValue) {
      if (isNaN(newValue)) {
        throw "MISSED"
      }
      this.scrollX_ = newValue
    }
  },
  scrollY: {
    get () {
      return this.scrollY_
    },
    set (newValue) {
      if (isNaN(newValue)) {
        throw "MISSED"
      }
      this.scrollY_ = newValue
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
    this.currentGesture_.cancel()
  }
  this.listeners_.length = 0
  this.clear()
  if (this.dragger_) {
    this.dragger_.dispose()
    this.dragger_ = null
  }
  // Remove from workspace database.
  delete eYo.Workspace.WorkspaceDB_[this.id]
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
  this.disposeUI()
}

/**
 * Make the UI.
 * @param {Element!} container
 */
eYo.Workspace.prototype.makeUI = function(container) {
  var options = this.options
  this.makeUI = eYo.Do.nothing
  this.ui_driver.workspaceInit(this)
  var bottom = eYo.Scrollbar.thickness
  if (options.hasTrashcan) {
    this.trashcan = new eYo.Trashcan(this, bottom)
    bottom = this.trashcan.top
  }
  if (options.zoom && options.zoom.controls) {
    this.zoomControls_ = new eYo.ZoomControls(this, bottom)
    return this.zoomControls_.top
  }
  this.recordDeleteAreas()
}

/**
 * Dispose the UI related resources.
 */
eYo.Workspace.prototype.disposeUI = function() {
  this.zoomControls_ && this.zoomControls_.disposeUI()
  this.trashcan && this.trashcan.disposeUI()
  var d = this.ui_driver_
  if (d) {
    d.workspaceDispose(this)
  }
  this.ui_driver_ = null
}

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias.  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
eYo.Workspace.SCAN_ANGLE = 3

/**
 * Finds the top-level blocks and returns them.  Bricks are optionally sorted
 * by position; top to bottom.
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!eYo.Brick>} The top-level block objects.
 */
eYo.Workspace.prototype.getTopBricks = function(ordered) {
  // Copy the topBricks_ list.
  var bricks = [].concat(this.topBricks_);
  if (ordered && bricks.length > 1) {
    var offset = Math.sin(goog.math.toRadians(eYo.Workspace.SCAN_ANGLE));
    bricks.sort(function(a, b) {
      var aXY = a.xyInWorkspace
      var bXY = b.xyInWorkspace
      return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x)
    })
  }
  return bricks
}

/**
 * Dispose of all blocks in workspace.
 */
eYo.Workspace.prototype.clear = function() {
  this.setResizesEnabled(false)
  var existingGroup = eYo.Events.group
  if (!existingGroup) {
    eYo.Events.group = true
  }
  while (this.topBricks_.length) {
    this.topBricks_[0].dispose()
  }
  if (!existingGroup) {
    eYo.Events.group = false
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
 * @return {!eYo.Brick} The created block.
 */
eYo.Workspace.prototype.newBrick = eYo.Workspace.prototype.newBrick

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
    events = eYo.Events.filter(events, redo)
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
            var B = this.getBrickById(event.brickId)
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
  eYo.Events.clearPendingUndo()
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
 * @param {!eYo.Events.Abstract} event Event to fire.
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
 * @return {eYo.Brick} The sought after block or null if not found.
 */
eYo.Workspace.prototype.getBrickById = eYo.Workspace.prototype.getBrickById = function(id) {
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
 * @param {boolean=} opt_shadowBricksAreFilled An optional argument controlling
 *     whether shadow blocks are counted as filled. Defaults to true.
 * @return {boolean} True if all inputs are filled, false otherwise.
 */
eYo.Workspace.prototype.allInputsFilled = function(opt_shadowBricksAreFilled) {
  var blocks = this.getTopBricks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (!block.allInputsFilled(opt_shadowBricksAreFilled)) {
      return false;
    }
  }
  return true;
}

/**
 * Database of all workspaces.
 * @private
 */
eYo.Workspace.WorkspaceDB_ = Object.create(null)

/**
 * Find the workspace with the specified ID.
 * @param {string} id ID of workspace to find.
 * @return {eYo.Workspace} The sought after workspace or null if not found.
 */
eYo.Workspace.getById = function(id) {
  return eYo.Workspace.WorkspaceDB_[id] || null
}

// Export symbols that would otherwise be renamed by Closure compiler.
eYo.Workspace.prototype['clear'] = eYo.Workspace.prototype.clear;
eYo.Workspace.prototype['clearUndo'] =
    eYo.Workspace.prototype.clearUndo;
eYo.Workspace.prototype['addChangeListener'] =
    eYo.Workspace.prototype.addChangeListener;
eYo.Workspace.prototype['removeChangeListener'] =
    eYo.Workspace.prototype.removeChangeListener;

/**
 * The render status of an SVG workspace.
 * Returns `true` for visible workspaces and `false` for non-visible,
 * or headless, workspaces.
 * @type {boolean}
 */
eYo.Workspace.prototype.rendered = true;

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
eYo.Workspace.prototype.dragDeltaXY_ = null

/**
 * The workspace's trashcan (if any).
 * @type {eYo.Trashcan}
 */
eYo.Workspace.prototype.trashcan = null

/**
 * This workspace's scrollbars, if they exist.
 * @type {eYo.ScrollbarPair}
 */
eYo.Workspace.prototype.scrollbar = null

/**
 * The current gesture in progress on this workspace, if any.
 * @type {eYo.Gesture}
 * @private
 */
eYo.Workspace.prototype.currentGesture_ = null

/**
 * Last known position of the page scroll.
 * This is used to determine whether we have recalculated screen coordinate
 * stuff since the page scrolled.
 * @type {!goog.math.Coordinate}
 * @private
 */
eYo.Workspace.prototype.lastRecordedPageScroll_ = null;

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
eYo.Workspace.prototype.targetWorkspace = null

/**
 * Save resize handler data so we can delete it later in dispose.
 * @param {!Array.<!Array>} handler Data that can be passed to unbindEvent.
 */
eYo.Workspace.prototype.setResizeHandlerWrapper = function(handler) {
  this.resizeHandlerWrapper_ = handler;
}

Object.defineProperties(eYo.Workspace.prototype, {
  /**
   * The number of blocks that may be added to the workspace before reaching
   *     the maxBricks.
   * @return {number} Number of blocks left.
   */
  remainingCapacity: {
    get () {
      if (isNaN(this.options.maxBricks)) {
        return Infinity;
      }
      return this.options.maxBricks - this.getAllBricks().length
    }
  },
  /**
   * Find all blocks in workspace.  No particular order.
   * @return {!Array.<!eYo.Brick>} Array of bricks.
   */
  allBricks: {
    get () {
      var bricks = this.getTopBricks(false)
      for (var i = 0; i < bricks.length; i++) {
        bricks.push.apply(bricks, bricks[i].children)
      }
      return bricks
    }
  },
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
})

/**
 * Getter for the flyout associated with this workspace.  This flyout may be
 * owned by either the toolbox or the workspace, depending on toolbox
 * configuration.  It will be null if there is no flyout.
 * @return {eYo.Flyout} The flyout on this workspace.
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
  this.ui_driver.workspaceSizeDidChange(this)
  this.recordDeleteAreas()
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
    this.ui_driver.workspaceSizeDidChange(this)
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
    this.flyout_.place()
  }
  if (this.trashcan) {
    this.trashcan.place()
  }
  if (this.zoomControls_) {
    this.zoomControls_.place()
  }
  if (this.scrollbar) {
    this.scrollbar.resize()
  }
  this.updateScreenCalculations_()
}

/**
 * Resizes and repositions workspace chrome if the page has a new
 * scroll position.
 * @package
 */
eYo.Workspace.prototype.updateScreenCalculationsIfScrolled =
    function() {
    /* eslint-disable indent */
  var currScroll = goog.dom.getDocumentScroll()
  if (!goog.math.Coordinate.equals(
    this.lastRecordedPageScroll_,
    currScroll
    )) {
    this.lastRecordedPageScroll_ = currScroll
    this.updateScreenCalculations_()
  }
}; /* eslint-enable indent */

/**
 * Move the receiver to new coordinates.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
eYo.Workspace.prototype.xyMoveTo = function(x, y) {
  this.dragger && this.dragger.xyMoveTo(x, y)
}

/**
 * Translate this workspace to new coordinates.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
eYo.Workspace.prototype.canvasMoveTo = function(x, y) {
  this.ui_driver.workspaceCanvasMoveTo(this, x, y)
}

/**
 * Returns the horizontal offset of the workspace.
 * @return {number} Width.
 */
eYo.Workspace.prototype.getWidth = function() {
  var metrics = this.getMetrics();
  return metrics ? metrics.view.width / this.scale : 0;
}

/**
 * Render all blocks in workspace.
 */
eYo.Workspace.prototype.render = function() {
  // Generate list of all blocks.
  var bricks = this.allBricks
  // Render each block
  var i = bricks.length - 1
  while (i--) {
    bricks[i].render(false)
  }
}

/**
 * Highlight or unhighlight a brick in the workspace.  Brick highlighting is
 * often used to visually mark bricks currently being executed.
 * @param {?string} id ID of brick to highlight/unhighlight,
 *   or null for no brick (used to unhighlight all bricks).
 * @param {boolean=} opt_state If undefined, highlight specified brick and
 * automatically unhighlight all others.  If true or false, manually
 * highlight/unhighlight the specified block.
 */
eYo.Workspace.prototype.highlightBrick = function(id, opt_state) {
  if (opt_state === undefined) {
    // Unhighlight all blocks.
    for (var i = 0, block; block = this.highlightedBricks_[i]; i++) {
      block.setHighlighted(false);
    }
    this.highlightedBricks_.length = 0;
  }
  // Highlight/unhighlight the specified block.
  var block = id ? this.getBrickById(id) : null;
  if (block) {
    var state = (opt_state === undefined) || opt_state;
    // Using Set here would be great, but at the cost of IE10 support.
    if (!state) {
      goog.array.remove(this.highlightedBricks_, block);
    } else if (this.highlightedBricks_.indexOf(block) == -1) {
      this.highlightedBricks_.push(block);
    }
    block.setHighlighted(state);
  }
};

/**
 * Paste the content of the clipboard onto the workspace.
 */
eYo.Workspace.prototype.paste = function () {
  var xml = eYo.Clipboard.xml
  if (!eYo.Clipboard.xml) {
    return
  }
  if (!this.rendered || xml.getElementsByTagName('s').length + xml.getElementsByTagName('x').length >=
      this.remainingCapacity) {
    return
  }
  if (this.currentGesture_) {
    this.currentGesture_.cancel() // Dragging while pasting?  No.
  }
  var m4t, targetM4t, b3k
  eYo.Events.groupWrap(() => {
    if ((b3k = eYo.Xml.domToBrick(xml, this))) {
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
            var xy = targetM4t.brick.xy
            var xx = targetM4t.x + xy.x
            var yy = targetM4t.y + xy.y
            xy = m4t.brick.xy
            targetM4t.brick.xyMoveBy(m4t.x + xy.x - xx, m4t.y + xy.y - yy)
          }
          m4t.connect(targetM4t)
          // if (magnet.isHead) {
          //   targetMagnet = brick.foot_m
          // }
          b3k.select()
        }
      } else {
        // Move the duplicate to original position.
        var dx = parseInt(xml.getAttribute('x'), 10)
        var dy = parseInt(xml.getAttribute('y'), 10)
        if (!isNaN(dx) && !isNaN(dy)) {
          // Offset block until not clobbering another block and not in connection
          // distance with neighbouring bricks.
          var allBricks = this.allBricks
          var avoidCollision = () => {
            do {
              var collide = allBricks.some(b => {
                var xy = b.xy
                if (Math.abs(dx - xy.x) <= 10 &&
                    Math.abs(dy - xy.y) <= 10) {
                  return true
                }
              }) || b3k.getMagnets_(false).some(m4t => {
                  var neighbour = m4t.closest(Brickly.SNAP_RADIUS,
                    new goog.math.Coordinate(dx, dy))
                  if (neighbour) {
                    return true
                  }
              })
              if (collide) {
                dx += eYo.Workspace.SNAP_RADIUS
                dy += eYo.Workspace.SNAP_RADIUS * 2
              }
            } while (collide)
          }
          avoidCollision()
          // is the block in the visible area ?
          var metrics = this.getMetrics()
          var scale = this.scale || 1
          var size = b3k.size
          // the block is in the visible area if we see its center
          var leftBound = metrics.view.left / scale - size.width / 2
          var topBound = metrics.view.top / scale - size.height / 2
          var rightBound = (metrics.view.left + metrics.view.width) / scale - size.width / 2
          var downBound = (metrics.view.top + metrics.view.height) / scale - size.height / 2
          var inVisibleArea = () => {
            return dx >= leftBound && dx <= rightBound &&
            dy >= topBound && dy <= downBound
          }
          if (!inVisibleArea()) {
            dx = (metrics.view.left + metrics.view.width / 2) / scale - size.width / 2
            dy = (metrics.view.top + metrics.view.height / 2) / scale - size.height / 2
            avoidCollision()
          }
          b3k.xyMoveBy(dx, dy)
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
  if (this.trashcan && this.dom.svg.group_.parentNode) {
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
    return eYo.Workspace.DELETE_AREA_TRASH;
  }
  if (this.deleteAreaToolbox_ && this.deleteAreaToolbox_.contains(xy)) {
    return eYo.Workspace.DELETE_AREA_TOOLBOX;
  }
  return eYo.Workspace.DELETE_AREA_NONE;
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
}

/**
 * Start tracking a drag of an object on this workspace.
 * @param {!Event} e Mouse down event.
 * @param {!goog.math.Coordinate} xy Starting location of object.
 */
eYo.Workspace.prototype.xyEventInWorkspace = function(e) {
  return point = this.ui_driver.workspaceMouseInRoot(this, e)
}

/**
 * Start tracking a drag of an object on this workspace.
 * @param {!Event} e Mouse down event.
 * @param {!goog.math.Coordinate} xy Starting location of object.
 */
eYo.Workspace.prototype.startDrag = function(e, xy) {
  var point = this.xyEventInWorkspace(e)
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  this.dragDeltaXY_ = goog.math.Coordinate.difference(xy, point)
}

/**
 * Track a drag of an object on this workspace.
 * @param {!Event} e Mouse move event.
 * @return {!goog.math.Coordinate} New location of object.
 */
eYo.Workspace.prototype.moveDrag = function(e) {
  var point = this.xyEventInWorkspace(e)
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  return goog.math.Coordinate.sum(this.dragDeltaXY_, point);
}

/**
 * Calculate the bounding box for the blocks on the workspace.
 * Coordinate system: workspace coordinates.
 *
 * @return {Object} Contains the position and size of the bounding box
 *   containing the blocks on the workspace.
 */
eYo.Workspace.prototype.getBricksBoundingBox = function() {
  var topBricks = this.getTopBricks(false);
  // Initialize boundary using the first rendered block, if any.
  var i = 0
  while (i < topBricks.length) {
    var b = topBricks[i]
    if (b.ui && b.ui.rendered) {
      var bound = b.ui.boundingRect
      while (++i < topBricks.length) {
        var b = topBricks[i]
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
  eYo.Events.group = true
  var cursorY = 0
  this.getTopBricks(true).forEach(brick => {
    var xy = brick.xy
    brick.ui.moveBy(-xy.x, cursorY - xy.y)
    block.ui.snapToGrid()
    cursorY = brick.xy.y +
        brick.size.height + eYo.Unit.y
  })
  eYo.Events.group = false
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
  var topBricks = this.getTopBricks(true)
  var eventGroup = eYo.Do.genUid()
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
    cleanOption.enabled = topBricks.length > 1
    cleanOption.callback = this.cleanUp.bind(this)
    menuOptions.push(cleanOption)
  }

  // Add a little animation to collapsing and expanding.
  var DELAY = 10
  if (this.options.collapse) {
    var hasCollapsedBricks = false
    var hasExpandedBricks = false
    for (var i = 0; i < topBricks.length; i++) {
      var b3k = topBricks[i]
      while (b3k) {
        if (b3k.collapsed) {
          hasCollapsedBricks = true
        } else {
          hasExpandedBricks = true
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
      for (var i = 0; i < topBricks.length; i++) {
        var block = topBricks[i]
        while (block) {
          setTimeout(block.setCollapsed.bind(block, shouldCollapse), ms)
          block = block.foot
          ms += DELAY
        }
      }
    }

    // Option to collapse top bricks.
    var collapseOption = {enabled: hasExpandedBricks}
    collapseOption.text = eYo.Msg.COLLAPSE_ALL
    collapseOption.callback = () => {
      toggleOption(true)
    }
    menuOptions.push(collapseOption)

    // Option to expand top bricks.
    var expandOption = {enabled: hasCollapsedBricks}
    expandOption.text = eYo.Msg.EXPAND_ALL
    expandOption.callback = () => {
      toggleOption(false)
    }
    menuOptions.push(expandOption)
  }

  // Option to delete all bricks.
  // Count the number of bricks that are deletable.
  var deleteList = []
  function addDeletableBricks (b3k) {
    if (b3k.isDeletable()) {
      deleteList = deleteList.concat(b3k.getWrappedDescendants())
    } else {
      b3k.children.forEach(child => addDeletableBricks(child))
    }
  }
  topBricks.forEach(child => addDeletableBricks(child))

  function deleteNext () {
    eYo.Events.group = eventGroup
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
 * Mark this workspace's factory main workspace as the currently focused main workspace.
 */
eYo.Workspace.prototype.markFocused = function() {
  var mainWorkspace = this.factory.mainWorkspace
  mainWorkspace.ui_driver.workspaceSetBrowserFocus(mainWorkspace)
}

/**
 * Zooming the blocks centered in (x, y) coordinate with zooming in or out.
 * @param {number} x X coordinate of center.
 * @param {number} y Y coordinate of center.
 * @param {number} amount Amount of zooming
 *                        (negative zooms out and positive zooms in).
 */
eYo.Workspace.prototype.zoom = function(x, y, amount) {
  this.ui_driver.workspaceZoom(this, x, y, amount)
}

/**
 * Zooming the blocks centered in the center of view with zooming in or out.
 * @param {number} type Type of zooming (-1 zooming out and 1 zooming in).
 */
eYo.Workspace.prototype.zoomCenter = function(type) {
  var metrics = this.getMetrics()
  var x = metrics.view.width / 2
  var y = metrics.view.height / 2
  this.zoom(x, y, type)
};

/**
 * Zoom the blocks to fit in the workspace if possible.
 */
eYo.Workspace.prototype.zoomToFit = function() {
  var metrics = this.getMetrics();
  var blocksBox = this.getBricksBoundingBox();
  var blocksWidth = blocksBox.width;
  var blocksHeight = blocksBox.height;
  if (!blocksWidth) {
    return;  // Prevents zooming to infinity.
  }
  var workspaceWidth = metrics.view.width;
  var workspaceHeight = metrics.view.height;
  if (this.flyout_) {
    workspaceWidth -= this.flyout_.width_;
  }
  if (!this.scrollbar) {
    // Origin point of 0,0 is fixed, blocks will not scroll to center.
    blocksWidth += metrics.content.left;
    blocksHeight += metrics.content.top;
  }
  var ratioX = workspaceWidth / blocksWidth;
  var ratioY = workspaceHeight / blocksHeight;
  this.scale = Math.min(ratioX, ratioY)
  this.scrollCenter()
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
  var x = (metrics.content.width - metrics.view.width) / 2;
  if (this.flyout_) {
    x -= this.flyout_.width_ / 2;
  }
  var y = (metrics.content.height - metrics.view.height) / 2;
  this.scrollbar.set(x, y);
};
  
/**
 * Scroll the workspace to center on the given block.
 * @param {?string} id ID of block center on.
 * @public
 */
eYo.Workspace.prototype.centerOnBrick = function(id) {
  if (!this.scrollbar) {
    console.warn('Tried to scroll a non-scrollable workspace.');
    return;
  }

  var block = this.getBrickById(id);
  if (!block) {
    return;
  }

  // XY is in workspace coordinates.
  var xy = block.xyInWorkspace;
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
  var scrollToBrickX = pixelX - metrics.content.left;
  var scrollToBrickY = pixelY - metrics.content.top;

  // view.height and view.width are in pixels.
  var halfViewWidth = metrics.view.width / 2;
  var halfViewHeight = metrics.view.height / 2;

  // Put the block in the center of the visible workspace instead.
  var scrollToCenterX = scrollToBrickX - halfViewWidth;
  var scrollToCenterY = scrollToBrickY - halfViewHeight;

  eYo.App.hideChaff();
  this.scrollbar.set(scrollToCenterX, scrollToCenterY);
}

/**
 * Return an object with all the metrics required to size scrollbars for a
 * top level workspace.  The following properties are computed:
 * Coordinate system: pixel coordinates.
 * .view.height: Height of the visible rectangle,
 * .view.width: Width of the visible rectangle,
 * .content.height: Height of the contents,
 * .content.width: Width of the content,
 * .view.top: Offset of top edge of visible rectangle from parent,
 * .view.left: Offset of left edge of visible rectangle from parent,
 * .content.top: Offset of the top-most content from the y=0 coordinate,
 * .content.left: Offset of the left-most content from the x=0 coordinate.
 * .absolute.top: Top-edge of view.
 * .absolute.left: Left-edge of view.
 * .flyout.width: Width of the flyout if it is always open.  Otherwise zero.
 * .flyout.height: Height of flyout if it is always open.  Otherwise zero.
 * .flyout.anchor: Top, bottom, left or right.
 * TODO: rename/refactor to clearly make the difference between
 * vue coordinates and workspace coordinates.
 * @return {!Object} Contains size and position metrics of a top level
 *   workspace.
 * @private
 * @this eYo.Workspace
 */
eYo.Workspace.getTopLevelWorkspaceMetrics_ = (() => {
  /**
   * Get the bounding box for all workspace contents, in pixels.
   * @param {!eYo.Workspace} ws The workspace to inspect.
   * @return {!Object} The dimensions of the contents of the given workspace, as
   *     an object containing
   *     - height and width in pixels
   *     - left, right, top and bottom in pixels relative to the workspace origin.
   * @private
   */
  var getContentDimensionsExact_ = function(ws) {
    // Brick bounding box is in workspace coordinates.
    var blockBox = ws.getBricksBoundingBox();
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
  var getContentDimensionsBounded_ = function(ws, svgSize) {
    var content = getContentDimensionsExact_(ws)

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
  return function() {
    // Contains height and width in CSS pixels.
    // svgSize is equivalent to the size of the factory div at this point.
    var svgSize = this.dom.svg.size
    // svgSize is now the space taken up by the Blockly workspace
    if (this.scrollbar) {
      var dimensions = getContentDimensionsBounded_(this, svgSize)
    } else {
      dimensions = getContentDimensionsExact_(this)
    }
    var metrics = {
      content: dimensions,
      view: {
        height: svgSize.height,
        width: svgSize.width,
        top: -this.scrollY,   // Must be in pixels, somehow.
        left: -this.scrollX,  // Must be in pixels, somehow.
      },
      absolute: {
        top: 0,
        left: 0,
      },
      flyout: this.flyout_ && this.flyout_.size,
    }
    return metrics
  }
})()

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
  var metrics = this.getMetrics()
  if (goog.isNumber(xyRatio.x)) {
    this.scrollX = -metrics.content.width * xyRatio.x - metrics.content.left
  }
  if (goog.isNumber(xyRatio.y)) {
    this.scrollY = -metrics.content.height * xyRatio.y - metrics.content.top
  }
  var x = this.scrollX + metrics.absolute.left
  var y = this.scrollY + metrics.absolute.top
  this.xyMoveTo(x, y)
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
}

/**
 * Look up the gesture that is tracking this touch stream on this workspace.
 * May create a new gesture.
 * @param {!Event} e Mouse event or touch event.
 * @return {Brickly.TouchGesture} The gesture that is tracking this touch
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
    return (this.currentGesture_ = new eYo.Gesture(e, this))
  }
  // No gesture existed and this event couldn't be the start of a new gesture.
  return null
}

/**
 * Clear the reference to the current gesture.
 * @package
 */
eYo.Workspace.prototype.clearGesture = function() {
  this.currentGesture_ = null
}

/**
 * Cancel the current gesture, if one exists.
 * @package
 */
eYo.Workspace.prototype.cancelCurrentGesture = function() {
  if (this.currentGesture_) {
    this.currentGesture_.cancel()
  }
}

/**
 * Get the audio manager for this workspace.
 * @return {Brickly.WorkspaceAudio} The audio manager for this workspace.
 */
eYo.Workspace.prototype.getAudioManager = function() {
  return this.audioManager_
};
   
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
    var dbList = this.magnetDBList
    console.log(`${comment} > ${k} magnet`)
    dbList[eYo.Magnet[k]].forEach(m4t => {
      console.log(m4t.x_, m4t.y_, m4t.xyInBrick_, m4t.brick.type)
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
  brick.id = (opt_id && !this.getBrickById(opt_id)) ?
  opt_id : eYo.Do.genUid()
  this.hasUI && brick.makeUI()
  this.topBricks_.push(brick)
  this.brickDB_[brick.id] = brick
}


/**
 * Add a brick to the workspace.
 * @param {eYo.Brick} brick
 */
eYo.Workspace.prototype.removeBrick = function (brick) {
  this.removeTopBrick(brick)
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
      xy: b3k.xy
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
eYo.Workspace.prototype.scrollBrickTopLeft = function(id) {
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
  var xy = brick.xy

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
  var scrollX = pixelX - metrics.content.left
  var scrollY = pixelY - metrics.content.top

  eYo.App.hideChaff();
  this.scrollbar.set(scrollX, scrollY)
}
