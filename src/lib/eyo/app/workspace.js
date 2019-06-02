/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Desk model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Desk')

goog.require('eYo.Protocol.ChangeCount')

goog.forwardDeclare('goog.array');
goog.forwardDeclare('goog.math');

goog.forwardDeclare('eYo.Desktop')


/**
 * Class for a desk.  This is a data structure that contains blocks.
 * @param {!eYo.Factory} factory Any desk belongs to a factory.
 * @constructor
 */
eYo.Desk = function(factory, options) {
  /** @type {string} */
  this.id = eYo.Do.genUid()
  eYo.Desk.DeskDB_[this.id] = this

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
  options.getMetrics || eYo.Desk.getTopLevelDeskMetrics_
  this.setMetrics =
    options.setMetrics || eYo.Desk.setTopLevelDeskMetrics_

  this.dragger_ = new eYo.DeskDragger(this)
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

eYo.Do.addProtocol(eYo.Desk.prototype, 'ChangeCount')

Object.defineProperties(eYo.Desk, {
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

Object.defineProperties(eYo.Desk.prototype, {
  /**
   * The factory owning the desk.
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
          oldValue.targetDesk = null
        }
        if (newValue) {
          this.targetDesk = null
          newValue.desk.targetDesk = this
        }
      }
    }
  },
  targetDesk: {
    get () {
      return this.targetDesk_
    },
    set (newValue) {
      var oldValue = this.targetDesk_
      if (newValue !== oldValue) {
        this.targetDesk_ = newValue
        if (oldValue) {
          oldValue.flyout = null
        }
        if (newValue) {
          this.getGesture = newValue.getGesture.bind(newValue)
          this.flyout = null
          if (newValue.flyout) {
            newValue.flyout.targetDesk = newValue
          }
        } else {
          delete this.getGesture
        }
      }
    }
  },
  /**
   * Is this desk the surface for a flyout?
   * @readonly
   * @type {boolean}
   */
  isFlyout: {
    get () {
      return !!this.targetDesk
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
      return (this.factory || this.targetDesk).audio
    }
  },
  /**
   * Is this desk draggable and scrollable?
   * @type {boolean} True if this desk may be dragged.
   */
  visible: {
    get () {
      return this.ui_driver.deskVisibleGet(this)

    },
    /**
     * Toggles the visibility of the desk.
     * Currently only intended for main desk.
     * @param {boolean} newValue True if desk should be visible.
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
      this.ui_driver.deskVisibleSet(this, newValue)
      if (newValue) {
        this.render()
      } else {
        eYo.App.hideChaff()
      }
    }
  },
  /**
   * Is this desk draggable and scrollable?
   * @type {boolean} True if this desk may be dragged.
   */
  draggable: {
    get () {
      return this.targetDesk
      ? this.targetDesk.flyout_.scrollable
      : !!this.scrollbar
    }
  },
  /**
   * Is the user currently dragging a block or scrolling the flyout/desk?
   * @return {boolean} True if currently dragging or scrolling.
   */
  isDragging: {
    get () {
      return this.gesture_ != null && this.gesture_.isDragging
    }
  },
  /**
   * Returns `true` if the desk is visible and `false` if it's headless.
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
  gesture: {
    get () {
      return this.gesture_
    }
  },
  scale: {
    get () {
      return this.scale_
    },
    /**
     * Set the desk's zoom factor.
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
   * Return the position of the desk origin relative to the injection div
   * origin in pixels.
   * The desk origin is where a block would render at position (0, 0).
   * It is not the upper left corner of the desk SVG.
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
 * Dispose of this desk.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Desk.prototype.dispose = function() {
  // Stop rerendering.
  this.rendered = false;
  if (this.gesture_) {
    this.gesture_.cancel()
  }
  this.listeners_.length = 0
  this.clear()
  if (this.dragger_) {
    this.dragger_.dispose()
    this.dragger_ = null
  }
  // Remove from desk database.
  delete eYo.Desk.DeskDB_[this.id]
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
eYo.Desk.prototype.makeUI = function(container) {
  var options = this.options
  this.makeUI = eYo.Do.nothing
  this.ui_driver.deskInit(this)
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
eYo.Desk.prototype.disposeUI = function() {
  this.zoomControls_ && this.zoomControls_.disposeUI()
  this.trashcan && this.trashcan.disposeUI()
  var d = this.ui_driver_
  if (d) {
    d.deskDispose(this)
  }
  this.ui_driver_ = null
}

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias.  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
eYo.Desk.SCAN_ANGLE = 3

/**
 * Finds the top-level blocks and returns them.  Bricks are optionally sorted
 * by position; top to bottom.
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!eYo.Brick>} The top-level block objects.
 */
eYo.Desk.prototype.getTopBricks = function(ordered) {
  // Copy the topBricks_ list.
  var bricks = [].concat(this.topBricks_);
  if (ordered && bricks.length > 1) {
    var offset = Math.sin(goog.math.toRadians(eYo.Desk.SCAN_ANGLE));
    bricks.sort(function(a, b) {
      var aXY = a.xyInDesk
      var bXY = b.xyInDesk
      return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x)
    })
  }
  return bricks
}

/**
 * Dispose of all blocks in desk.
 */
eYo.Desk.prototype.clear = function() {
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
eYo.Desk.prototype.newBrick = function (prototypeName, opt_id) {
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
eYo.Desk.prototype.newBrick = eYo.Desk.prototype.newBrick

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.Desk.prototype.undo = function(redo) {
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
eYo.Desk.prototype.clearUndo = function() {
  this.undoStack_.length = 0;
  this.redoStack_.length = 0;
  // Stop any events already in the firing queue from being undoable.
  eYo.Events.clearPendingUndo()
  eYo.App.didClearUndo && eYo.App.didClearUndo()
};

/**
 * When something in this desk changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Function} Function that can be passed to
 *     removeChangeListener.
 */
eYo.Desk.prototype.addChangeListener = function(func) {
  this.listeners_.push(func);
  return func;
};

/**
 * Stop listening for this desk's changes.
 * @param {Function} func Function to stop calling.
 */
eYo.Desk.prototype.removeChangeListener = function(func) {
  goog.array.remove(this.listeners_, func);
};

/**
 * Fire a change event.
 * @param {!eYo.Events.Abstract} event Event to fire.
 */
eYo.Desk.prototype.fireChangeListener = function(event) {
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
 * Find the block on this desk with the specified ID.
 * Wrapped bricks have a complex id.
 * @param {string} id ID of block to find.
 * @return {eYo.Brick} The sought after block or null if not found.
 */
eYo.Desk.prototype.getBrickById = eYo.Desk.prototype.getBrickById = function(id) {
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
 * Checks whether all value and statement inputs in the desk are filled
 * with blocks.
 * @param {boolean=} opt_shadowBricksAreFilled An optional argument controlling
 *     whether shadow blocks are counted as filled. Defaults to true.
 * @return {boolean} True if all inputs are filled, false otherwise.
 */
eYo.Desk.prototype.allInputsFilled = function(opt_shadowBricksAreFilled) {
  var blocks = this.getTopBricks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (!block.allInputsFilled(opt_shadowBricksAreFilled)) {
      return false;
    }
  }
  return true;
}

/**
 * Database of all desks.
 * @private
 */
eYo.Desk.DeskDB_ = Object.create(null)

/**
 * Find the desk with the specified ID.
 * @param {string} id ID of desk to find.
 * @return {eYo.Desk} The sought after desk or null if not found.
 */
eYo.Desk.getById = function(id) {
  return eYo.Desk.DeskDB_[id] || null
}

// Export symbols that would otherwise be renamed by Closure compiler.
eYo.Desk.prototype['clear'] = eYo.Desk.prototype.clear;
eYo.Desk.prototype['clearUndo'] =
    eYo.Desk.prototype.clearUndo;
eYo.Desk.prototype['addChangeListener'] =
    eYo.Desk.prototype.addChangeListener;
eYo.Desk.prototype['removeChangeListener'] =
    eYo.Desk.prototype.removeChangeListener;

/**
 * The render status of an SVG desk.
 * Returns `true` for visible desks and `false` for non-visible,
 * or headless, desks.
 * @type {boolean}
 */
eYo.Desk.prototype.rendered = true;

/**
 * Whether this desk has resizes enabled.
 * Disable during batch operations for a performance improvement.
 * @type {boolean}
 * @private
 */
eYo.Desk.prototype.resizesEnabled_ = true;

/**
 * Current horizontal scrolling offset in pixel units.
 * @type {number}
 */
eYo.Desk.prototype.scrollX = 0;

/**
 * Current vertical scrolling offset in pixel units.
 * @type {number}
 */
eYo.Desk.prototype.scrollY = 0;

/**
 * Horizontal scroll value when scrolling started in pixel units.
 * @type {number}
 */
eYo.Desk.prototype.startScrollX = 0;

/**
 * Vertical scroll value when scrolling started in pixel units.
 * @type {number}
 */
eYo.Desk.prototype.startScrollY = 0;

/**
 * Distance from mouse to object being dragged.
 * @type {goog.math.Coordinate}
 * @private
 */
eYo.Desk.prototype.dragDeltaXY_ = null

/**
 * The desk's trashcan (if any).
 * @type {eYo.Trashcan}
 */
eYo.Desk.prototype.trashcan = null

/**
 * This desk's scrollbars, if they exist.
 * @type {eYo.ScrollbarPair}
 */
eYo.Desk.prototype.scrollbar = null

/**
 * The current gesture in progress on this desk, if any.
 * @type {eYo.Gesture}
 * @private
 */
eYo.Desk.prototype.gesture_ = null

/**
 * Last known position of the page scroll.
 * This is used to determine whether we have recalculated screen coordinate
 * stuff since the page scrolled.
 * @type {!goog.math.Coordinate}
 * @private
 */
eYo.Desk.prototype.lastRecordedPageScroll_ = null;

/**
 * Developers may define this function to add custom menu options to the
 * desk's context menu or edit the desk-created set of menu options.
 * @param {!Array.<!Object>} options List of menu options to add to.
 */
eYo.Desk.prototype.configureContextMenu = null;

/**
 * In a flyout, the target desk where blocks should be placed after a drag.
 * Otherwise null.
 * @type {?eYo.Desk}
 * @package
 */
eYo.Desk.prototype.targetDesk = null

/**
 * Save resize handler data so we can delete it later in dispose.
 * @param {!Array.<!Array>} handler Data that can be passed to unbindEvent.
 */
eYo.Desk.prototype.setResizeHandlerWrapper = function(handler) {
  this.resizeHandlerWrapper_ = handler;
}

Object.defineProperties(eYo.Desk.prototype, {
  /**
   * The number of blocks that may be added to the desk before reaching
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
   * Find all blocks in desk.  No particular order.
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
 * Getter for the flyout associated with this desk.  This flyout may be
 * owned by either the toolbox or the desk, depending on toolbox
 * configuration.  It will be null if there is no flyout.
 * @return {eYo.Flyout} The flyout on this desk.
 * @package
 */
eYo.Desk.prototype.getFlyout_ = function() {
  return this.flyout_
}

/**
 * Update items that use screen coordinate calculations
 * because something has changed (e.g. scroll position, window size).
 * @private
 */
eYo.Desk.prototype.updateScreenCalculations_ = function() {
  this.ui_driver.deskSizeDidChange(this)
  this.recordDeleteAreas()
};

/**
 * If enabled, resize the parts of the desk that change when the desk
 * contents (e.g. block positions) change.  This will also scroll the
 * desk contents if needed.
 * @package
 */
eYo.Desk.prototype.resizeContents = function() {
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
    this.ui_driver.deskSizeDidChange(this)
  } finally {
    this.isSelected = null
  }
};

/**
 * Resize and reposition all of the desk chrome (toolbox,
 * trash, scrollbars etc.)
 * This should be called when something changes that
 * requires recalculating dimensions and positions of the
 * trash, zoom, toolbox, etc. (e.g. window resize).
 */
eYo.Desk.prototype.resize = function() {
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
 * Resizes and repositions desk chrome if the page has a new
 * scroll position.
 * @package
 */
eYo.Desk.prototype.updateScreenCalculationsIfScrolled =
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
eYo.Desk.prototype.xyMoveTo = function(x, y) {
  this.dragger && this.dragger.xyMoveTo(x, y)
}

/**
 * Translate this desk to new coordinates.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
eYo.Desk.prototype.canvasMoveTo = function(x, y) {
  this.ui_driver.deskCanvasMoveTo(this, x, y)
}

/**
 * Returns the horizontal offset of the desk.
 * @return {number} Width.
 */
eYo.Desk.prototype.getWidth = function() {
  var metrics = this.getMetrics();
  return metrics ? metrics.view.width / this.scale : 0;
}

/**
 * Render all blocks in desk.
 */
eYo.Desk.prototype.render = function() {
  // Generate list of all blocks.
  var bricks = this.allBricks
  // Render each block
  var i = bricks.length - 1
  while (i--) {
    bricks[i].render(false)
  }
}

/**
 * Highlight or unhighlight a brick in the desk.  Brick highlighting is
 * often used to visually mark bricks currently being executed.
 * @param {?string} id ID of brick to highlight/unhighlight,
 *   or null for no brick (used to unhighlight all bricks).
 * @param {boolean=} opt_state If undefined, highlight specified brick and
 * automatically unhighlight all others.  If true or false, manually
 * highlight/unhighlight the specified block.
 */
eYo.Desk.prototype.highlightBrick = function(id, opt_state) {
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
 * Paste the content of the clipboard onto the desk.
 */
eYo.Desk.prototype.paste = function () {
  var xml = eYo.Clipboard.xml
  if (!eYo.Clipboard.xml) {
    return
  }
  if (!this.rendered || xml.getElementsByTagName('s').length + xml.getElementsByTagName('x').length >=
      this.remainingCapacity) {
    return
  }
  if (this.gesture_) {
    this.gesture_.cancel() // Dragging while pasting?  No.
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
                dx += eYo.Desk.SNAP_RADIUS
                dy += eYo.Desk.SNAP_RADIUS * 2
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
 * Make a list of all the delete areas for this desk.
 */
eYo.Desk.prototype.recordDeleteAreas = function() {
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
eYo.Desk.prototype.isDeleteArea = function(e) {
  var xy = new goog.math.Coordinate(e.clientX, e.clientY);
  if (this.deleteAreaTrash_ && this.deleteAreaTrash_.contains(xy)) {
    return eYo.Desk.DELETE_AREA_TRASH;
  }
  if (this.deleteAreaToolbox_ && this.deleteAreaToolbox_.contains(xy)) {
    return eYo.Desk.DELETE_AREA_TOOLBOX;
  }
  return eYo.Desk.DELETE_AREA_NONE;
};

/**
 * Handle a mouse-down on SVG drawing surface.
 * @param {!Event} e Mouse down event.
 * @private
 */
eYo.Desk.prototype.onMouseDown_ = function(e) {
  var gesture = this.getGesture(e)
  if (gesture) {
    gesture.handleWsStart(e, this);
  }
}

/**
 * Start tracking a drag of an object on this desk.
 * @param {!Event} e Mouse down event.
 * @param {!goog.math.Coordinate} xy Starting location of object.
 */
eYo.Desk.prototype.xyEventInDesk = function(e) {
  return this.ui_driver.deskMouseInRoot(this, e)
}

/**
 * Start tracking a drag of an object on this desk.
 * @param {!Event} e Mouse down event.
 * @param {!goog.math.Coordinate} xy Starting location of object.
 */
eYo.Desk.prototype.startDrag = function(e, xy) {
  var point = this.xyEventInDesk(e)
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  this.dragDeltaXY_ = goog.math.Coordinate.difference(xy, point)
}

/**
 * Track a drag of an object on this desk.
 * @param {!Event} e Mouse move event.
 * @return {!goog.math.Coordinate} New location of object.
 */
eYo.Desk.prototype.moveDrag = function(e) {
  var point = this.xyEventInDesk(e)
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  return goog.math.Coordinate.sum(this.dragDeltaXY_, point);
}

/**
 * Calculate the bounding box for the blocks on the desk.
 * Coordinate system: desk coordinates.
 *
 * @return {Object} Contains the position and size of the bounding box
 *   containing the blocks on the desk.
 */
eYo.Desk.prototype.getBricksBoundingBox = function() {
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
 * Clean up the desk by ordering all the blocks in a column.
 */
eYo.Desk.prototype.cleanUp = function() {
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
 * Show the context menu for the desk.
 * @param {!Event} e Mouse event.
 * @private
 * @suppress{accessControls}
 */
eYo.Desk.prototype.showContextMenu_ = function (e) {
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
    if (b3k.deletable) {
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
      if (block.desk) {
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
      if (ws.gesture_) {
        ws.gesture_.cancel()
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
 * Mark this desk's factory main desk as the currently focused main desk.
 */
eYo.Desk.prototype.markFocused = function() {
  var mainDesk = this.factory.mainDesk
  mainDesk.ui_driver.deskSetBrowserFocus(mainDesk)
}

/**
 * Zooming the blocks centered in (x, y) coordinate with zooming in or out.
 * @param {number} x X coordinate of center.
 * @param {number} y Y coordinate of center.
 * @param {number} amount Amount of zooming
 *                        (negative zooms out and positive zooms in).
 */
eYo.Desk.prototype.zoom = function(x, y, amount) {
  this.ui_driver.deskZoom(this, x, y, amount)
}

/**
 * Zooming the blocks centered in the center of view with zooming in or out.
 * @param {number} type Type of zooming (-1 zooming out and 1 zooming in).
 */
eYo.Desk.prototype.zoomCenter = function(type) {
  var metrics = this.getMetrics()
  var x = metrics.view.width / 2
  var y = metrics.view.height / 2
  this.zoom(x, y, type)
};

/**
 * Zoom the blocks to fit in the desk if possible.
 */
eYo.Desk.prototype.zoomToFit = function() {
  var metrics = this.getMetrics();
  var blocksBox = this.getBricksBoundingBox();
  var blocksWidth = blocksBox.width;
  var blocksHeight = blocksBox.height;
  if (!blocksWidth) {
    return;  // Prevents zooming to infinity.
  }
  var deskWidth = metrics.view.width;
  var deskHeight = metrics.view.height;
  if (this.flyout_) {
    deskWidth -= this.flyout_.width_;
  }
  if (!this.scrollbar) {
    // Origin point of 0,0 is fixed, blocks will not scroll to center.
    blocksWidth += metrics.content.left;
    blocksHeight += metrics.content.top;
  }
  var ratioX = deskWidth / blocksWidth;
  var ratioY = deskHeight / blocksHeight;
  this.scale = Math.min(ratioX, ratioY)
  this.scrollCenter()
};

/**
 * Center the desk.
 */
eYo.Desk.prototype.scrollCenter = function() {
  if (!this.scrollbar) {
    // Can't center a non-scrolling desk.
    console.warn('Tried to scroll a non-scrollable desk.');
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
 * Scroll the desk to center on the given block.
 * @param {?string} id ID of block center on.
 * @public
 */
eYo.Desk.prototype.centerOnBrick = function(id) {
  if (!this.scrollbar) {
    console.warn('Tried to scroll a non-scrollable desk.');
    return;
  }

  var block = this.getBrickById(id);
  if (!block) {
    return;
  }

  // XY is in desk coordinates.
  var xy = block.xyInDesk;
  // Height/width is in desk units.
  var heightWidth = block.getHeightWidth();

  // Find the enter of the block in desk units.
  var blockCenterY = xy.y + heightWidth.height / 2;

  var blockCenterX = xy.x + heightWidth.width / 2;

  // Desk scale, used to convert from desk coordinates to pixels.
  var scale = this.scale;

  // Center in pixels.  0, 0 is at the desk origin.  These numbers may
  // be negative.
  var pixelX = blockCenterX * scale;
  var pixelY = blockCenterY * scale;

  var metrics = this.getMetrics();

  // Scrolling to here would put the block in the top-left corner of the
  // visible desk.
  var scrollToBrickX = pixelX - metrics.content.left;
  var scrollToBrickY = pixelY - metrics.content.top;

  // view.height and view.width are in pixels.
  var halfViewWidth = metrics.view.width / 2;
  var halfViewHeight = metrics.view.height / 2;

  // Put the block in the center of the visible desk instead.
  var scrollToCenterX = scrollToBrickX - halfViewWidth;
  var scrollToCenterY = scrollToBrickY - halfViewHeight;

  eYo.App.hideChaff();
  this.scrollbar.set(scrollToCenterX, scrollToCenterY);
}

/**
 * Return an object with all the metrics required to size scrollbars for a
 * top level desk.  The following properties are computed:
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
 * vue coordinates and desk coordinates.
 * @return {!Object} Contains size and position metrics of a top level
 *   desk.
 * @private
 * @this eYo.Desk
 */
eYo.Desk.getTopLevelDeskMetrics_ = (() => {
  /**
   * Get the bounding box for all desk contents, in pixels.
   * @param {!eYo.Desk} ws The desk to inspect.
   * @return {!Object} The dimensions of the contents of the given desk, as
   *     an object containing
   *     - height and width in pixels
   *     - left, right, top and bottom in pixels relative to the desk origin.
   * @private
   */
  var getContentDimensionsExact_ = function(ws) {
    // Brick bounding box is in desk coordinates.
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
   * Calculate the size of a scrollable desk, which should include room for a
   * half screen border around the desk contents.
   * @param {!eYo.Desk} ws The desk to measure.
   * @param {!Object} svgSize An object containing height and width attributes in
   *     CSS pixels.  Together they specify the size of the visible desk, not
   *     including areas covered up by the toolbox.
   * @return {!Object} The dimensions of the contents of the given desk, as
   *     an object containing
   *     - height and width in pixels
   *     - left and top in pixels relative to the desk origin.
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
    // svgSize is now the space taken up by the Blockly desk
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
 * Sets the X/Y translations of a top level desk to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 * @this eYo.Desk
 */
eYo.Desk.setTopLevelDeskMetrics_ = function(xyRatio) {
  if (!this.scrollbar) {
    throw 'Attempt to set top level desk scroll without scrollbars.';
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
 * Update whether this desk has resizes enabled.
 * If enabled, desk will resize when appropriate.
 * If disabled, desk will not resize until re-enabled.
 * Use to avoid resizing during a batch operation, for performance.
 * @param {boolean} enabled Whether resizes should be enabled.
 */
eYo.Desk.prototype.setResizesEnabled = function(enabled) {
  var reenabled = (!this.resizesEnabled_ && enabled);
  this.resizesEnabled_ = enabled;
  if (reenabled) {
    // Newly enabled.  Trigger a resize.
    this.resizeContents();
  }
}

/**
 * Look up the gesture that is tracking this touch stream on this desk.
 * May create a new gesture.
 * @param {!Event} e Mouse event or touch event.
 * @return {Brickly.TouchGesture} The gesture that is tracking this touch
 *     stream, or null if no valid gesture exists.
 * @package
 */
eYo.Desk.prototype.getGesture = function(e) {
  var isStart = (e.type == 'mousedown' || e.type == 'touchstart' ||
      e.type == 'pointerdown')

  var gesture = this.gesture_
  if (gesture) {
    if (isStart && gesture.started) {
      console.warn('tried to start the same gesture twice')
      // That's funny.  We must have missed a mouse up.
      // Cancel it, rather than try to retrieve all of the state we need.
      gesture.cancel()
      return null
    }
    return gesture
  }

  // No gesture existed on this desk, but this looks like the start of a
  // new gesture.
  if (isStart) {
    return (this.gesture_ = new eYo.Gesture(e, this))
  }
  // No gesture existed and this event couldn't be the start of a new gesture.
  return null
}

/**
 * Clear the reference to the current gesture.
 * @package
 */
eYo.Desk.prototype.clearGesture = function() {
  this.gesture_ = null
}

/**
 * Cancel the current gesture, if one exists.
 * @package
 */
eYo.Desk.prototype.cancelCurrentGesture = function() {
  if (this.gesture_) {
    this.gesture_.cancel()
  }
}

/**
 * Get the audio manager for this desk.
 * @return {Brickly.DeskAudio} The audio manager for this desk.
 */
eYo.Desk.prototype.getAudioManager = function() {
  return this.audioManager_
};
   
eYo.Desk.prototype.logAllConnections = function (comment) {
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
 * Convert a coordinate object from pixels to desk units.
 * @param {!goog.math.Coordinate} pixelCoord  A coordinate with x and y values
 *     in css pixel units.
 * @return {!goog.math.Coordinate} The input coordinate divided by the desk
 *     scale.
 * @private
 */
eYo.Desk.prototype.fromPixelUnit = function(xy) {
  return new goog.math.Coordinate(xy.x / this.scale, xy.y / this.scale)
}

/**
 *
 */
eYo.Desk.prototype.getRecover = (() => {
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
 * Add the nodes from string to the desk.
 * Usefull for testing? -> commonn test methods.
 * @param {!String} str
 * @return {Array.<string>} An array containing new block IDs.
 */
eYo.Desk.prototype.fromDom = function (dom) {
  return dom &&(eYo.Xml.domToDesk(dom, this))
}

/**
 * Add the nodes from string to the desk.
 * @param {!String} str
 * @return {Array.<string>} An array containing new block IDs.
 */
eYo.Desk.prototype.fromString = function (str) {
  var parser = new DOMParser()
  var dom = parser.parseFromString(str, 'application/xml')
  return this.fromDom(dom)
}


/**
 * Convert the desk to string.
 * @param {?Object} opt  See eponym parameter in `eYo.Xml.brickToDom`.
 */
eYo.Desk.prototype.toDom = function (opt) {
  return eYo.Xml.deskToDom(this, opt)
}

/**
 * Convert the desk to string.
 * @param {?Boolean} opt_noId
 */
eYo.Desk.prototype.toString = function (opt_noId) {
  let oSerializer = new XMLSerializer()
  return oSerializer.serializeToString(this.toDom())
}

/**
 * Convert the desk to UTF8 byte array.
 * @param {?Boolean} opt_noId
 */
eYo.Desk.prototype.toUTF8ByteArray = function (opt_noId) {
  var s = '<?xml version="1.0" encoding="utf-8"?>\n' + this.toString(optNoId)
  return goog.crypt.toUTF8ByteArray(s)
}

/**
 * Add the nodes from UTF8 string representation to the desk. UNUSED.
 * @param {!Array} bytes
 * @return {Array.<string>} An array containing new block IDs.
 */
eYo.Desk.prototype.fromUTF8ByteArray = function (bytes) {
  var str = goog.crypt.utf8ByteArrayToString(bytes)
  return str && (this.fromString(str))
}


/**
 * Add a brick to the desk.
 * @param {eYo.Brick} brick
 * @param {String} opt_id
 */
eYo.Desk.prototype.addBrick = function (brick, opt_id) {
  brick.id = (opt_id && !this.getBrickById(opt_id)) ?
  opt_id : eYo.Do.genUid()
  this.hasUI && brick.makeUI()
  this.topBricks_.push(brick)
  this.brickDB_[brick.id] = brick
}

/**
 * Add a brick to the desk.
 * @param {eYo.Brick} brick
 */
eYo.Desk.prototype.removeBrick = function (brick) {
  if (!goog.array.remove(this.topBricks_, brick)) {
    throw 'Brick not present in desk\'s list of top-most bricks.';
  }
  // Remove from desk
  this.brickDB_[brick.id] = null
}

/**
 * Tidy up the nodes.
 * @param {?Object} kvargs  key value arguments
 * IN PROGRESS
eYo.Desk.prototype.tidyUp = function (kvargs) {
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
 * Scroll the desk to center on the given block.
 * @param {?string} id ID of block center on.
 * @public
 */
eYo.Desk.prototype.scrollBrickTopLeft = function(id) {
  if (!this.scrollbar) {
    console.warn('Tried to scroll a non-scrollable desk.');
    return;
  }
  var brick = this.getBrickById(id);
  if (!brick) {
    return;
  }
  if (!brick.isStmt) {
    brick = brick.stmtParent || brick.root
  }
  // XY is in desk coordinates.
  var xy = brick.xy

  // Find the top left of the block in desk units.
  var y = xy.y - eYo.Unit.y / 2

  var x = xy.x - eYo.Unit.x / 2 - brick.depth * eYo.Span.tabWidth

  // Desk scale, used to convert from desk coordinates to pixels.
  var scale = this.scale;

  // Center in pixels.  0, 0 is at the desk origin.  These numbers may
  // be negative.
  var pixelX = x * scale;
  var pixelY = y * scale;

  var metrics = this.getMetrics()

  // Scrolling to here will put the block in the top-left corner of the
  // visible desk.
  var scrollX = pixelX - metrics.content.left
  var scrollY = pixelY - metrics.content.top

  eYo.App.hideChaff();
  this.scrollbar.set(scrollX, scrollY)
}
