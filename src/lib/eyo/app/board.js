/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Board')

goog.require('eYo.Protocol.ChangeCount')

goog.forwardDeclare('eYo.Metrics')

goog.forwardDeclare('goog.array');
goog.forwardDeclare('goog.math');

goog.forwardDeclare('eYo.Desktop')


/**
 * Class for a board.  This is a data structure that contains bricks.
 * @param {!eYo.Desk} desk Any board belongs to a desk.
 * @constructor
 */
eYo.Board = function(desk, options) {
  /** @type {string} */
  this.id = eYo.Do.genUid()
  eYo.Board.BoardDB_[this.id] = this

  this.desk_ = desk
  this.options = options

  this.change_ = new eYo.Change(this)

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

  this.metrics_ = new eYo.Metrics(this)

  this.scale_ = 1

  this.dragger_ = new eYo.BoardDragger(this)
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

eYo.Do.addProtocol(eYo.Board.prototype, 'ChangeCount')

Object.defineProperties(eYo.Board, {
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

Object.defineProperties(eYo.Board.prototype, {
  /**
   * The change manager.
   * @readonly
   * @type {eYo.Change}
   */
  change: {
    get () {
      return this.change_
    }
  },
  /**
   * The desk owning the board.
   * @readonly
   * @type {eYo.Desk}
   */
  desk: {
    get () {
      return this.desk_
    }
  },
  flyout: {
    /**
     * The flyout associate to the board.
     * @return{eYo.Flyout}
     */
    get () {
      return this.flyout_
    },
    /**
     * @param{?eYo.Flyout}
     */
    set (newValue) {
      var oldValue = this.flyout_
      if (newValue !== oldValue) {
        this.flyout_ = newValue
        if (oldValue) {
          oldValue.targetBoard = null
        }
        if (newValue) {
          this.targetBoard = null
          newValue.board.targetBoard = this
        }
      }
    }
  },
  /**
   * In a flyout, the target board where bricks should be placed after a drag.
   * Otherwise null.
   * @type {?eYo.Board}
   * @package
   */
  targetBoard: {
    get () {
      return this.targetBoard_
    },
    set (newValue) {
      var oldValue = this.targetBoard_
      if (newValue !== oldValue) {
        this.targetBoard_ = newValue
        if (oldValue) {
          oldValue.flyout = null
        }
        if (newValue) {
          this.flyout = null
          if (newValue.flyout) {
            newValue.flyout.targetBoard = newValue
          }
        }
      }
    }
  },
  /**
   * Is this board the surface for a flyout?
   * @readonly
   * @type {boolean}
   */
  isMain: {
    get () {
      return this === this.desk.mainBoard
    }
  },
  /**
   * Is this board the surface for a flyout?
   * @readonly
   * @type {boolean}
   */
  isFlyout: {
    get () {
      return !!this.targetBoard
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
      return (this.desk || this.targetBoard).audio
    }
  },
  /**
   * Is this board draggable and scrollable?
   * @type {boolean} True if this board may be dragged.
   */
  visible: {
    get () {
      return this.ui_driver.boardVisibleGet(this)

    },
    /**
     * Toggles the visibility of the board.
     * Currently only intended for main board.
     * @param {boolean} newValue True if board should be visible.
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
      this.ui_driver.boardVisibleSet(this, newValue)
      if (newValue) {
        this.render()
      } else {
        eYo.App.hideChaff()
      }
    }
  },
  /**
   * Is this board draggable and scrollable?
   * @type {boolean} True if this board may be dragged.
   */
  draggable: {
    get () {
      return this.targetBoard
      ? this.targetBoard.flyout_.scrollable
      : !!this.scrollbar
    }
  },
  /**
   * Is the user currently dragging a brick or scrolling the flyout/board?
   * @return {boolean} True if currently dragging or scrolling.
   */
  isDragging: {
    get () {
      return this.gesture_ != null && this.gesture_.isDragging
    }
  },
  /**
   * Returns `true` if the board is visible and `false` if it's headless.
   * @type {boolean}
   */
  rendered: {
    value: false,
    writable: true
  },
  /**
   * @type {eYo.Scrollbar | eYo.ScrollbarPair}
   * @readonly
   */
  scrollbar: {
    get () {
      return this.scrollbar_
    }
  },
  /**
   * @type {eYo.Metrics}
   * @readonly
   */
  metrics: {
    get () {
      return this.metrics_.clone
    }
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
    value: eYo.VOID,
    writable: true
  },
  recover: {
    get () {
      return this.getRecover()
    }
  },
  ui_driver: {
    get () {
      return this.desk.ui_driver_
    }
  },
  gesture: {
    get () {
      return this.gesture_
    }
  },
  scale: {
    get () {
      return this.metrics_.scale
    },
    /**
     * Set the board's zoom factor.
     * zoom options are required
     * @param {number} newScale Zoom factor.
     */
    set (newScale) {
      this.metrics_.scale = newScale
    }
  },
  /**
   * Calculate the bounding box for the bricks on the board.
   * Coordinate system: board coordinates.
   *
   * @return {Object} Contains the position and size of the bounding box
   *   containing the bricks on the board.
   */
  bricksBoundingRect: {
    get () {
      var topBricks = this.topBricks.filter(b3k => b3k.ui && b3k.ui.rendered)
      if (topBricks.length) {
        var ans = topBricks.shift().ui.boundingRect
        topBricks.forEach(b3k => ans.union(b3k.ui.boundingRect))
        return ans
      }
      // There are no rendered bricks, return empty rectangle.
      return new eYo.Rect()
    }
  },
  /**
   * Return the position of the board origin relative to the injection div
   * origin in pixels.
   * The board origin is where a brick would render at position (0, 0).
   * It is not the upper left corner of the board SVG.
   * @return {!eYo.Where} Offset in pixels.
   * @package
   */
  originInDesk: {
    get () {
      return this.desk_.xyElementInDesk(this.dom.svg.canvas_)
    }
  },
  /**
   * Current scrolling offset in pixel units.
   * @readonly
   * @type {eYo.Where}
   */
  scroll: {
    get () {
      return this.metrics_.scroll
    }
  },
  /**
   * the top bricks of the board.
   */
  topBricks: {
    get () {
      return [].slice.call(this.topBricks_)
    }
  },
  /**
   * the ordered top bricks of the board.
   */
  orderedTopBricks: {
    get () {
      return this.getTopBricks(true)
    }
  }
})

/**
 * Dispose of this board.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Board.prototype.dispose = function() {
  this.dispose = eYo.Do.nothing
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
  // Remove from board database.
  delete eYo.Board.BoardDB_[this.id]
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
  
  this.metrics_.dispose()
  this.metrics = null
  
  this.change_.dispose()
  this.change_ = null

  this.topBricks_.forEach(b3k => b3k.dispose())
  this.topBricks_ = this.listeners_ = this.undoStack_ = this.redoStack_ = this.brickDB_ = null
}

/**
 * Make the UI.
 */
eYo.Board.prototype.makeUI = function() {
  var options = this.options
  this.makeUI = eYo.Do.nothing
  this.ui_driver.boardInit(this)
  if (options.hasScrollbars) {
      // Add scrollbar.
    this.scrollbar_ = this.isFlyout
      ? new eYo.Scrollbar(
          this,
          false /*this.horizontalLayout_*/,
          false, 'eyo-flyout-scrollbar'
        )
      : new eYo.ScrollbarPair(this)
    this.scrollbar_.resize()
  }
  var bottom = eYo.Scrollbar.thickness
  if (options.hasTrashcan) {
    this.trashcan = new eYo.Trashcan(this, bottom)
    bottom = this.trashcan.top
  }
  if (options.zoom) {
    board.scale = options.zoom.startScale || 1
    if (options.zoom.controls) {
      this.zoomControls_ = new eYo.ZoomControls(this, bottom)
      bottom = this.zoomControls_.top
    }
  }
  this.recordDeleteAreas()
}

/**
 * Dispose the UI related resources.
 */
eYo.Board.prototype.disposeUI = function() {
  this.zoomControls_ && this.zoomControls_.disposeUI()
  this.trashcan && this.trashcan.disposeUI()
  var d = this.ui_driver_
  if (d) {
    d.boardDispose(this)
  }
  this.ui_driver_ = null
}

/**
 * Update the UI according to the scale change.
 */
eYo.Board.prototype.didScale = function() {
  if (this.scrollbar) {
    this.scrollbar.resize()
  } else {
    this.move()
  }
  eYo.App.hideChaff()
  if (this.flyout_) {
    // Resize flyout.
    this.flyout_.reflow()
  }
}

/**
 * Angle away from the horizontal to sweep for bricks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias.  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
eYo.Board.SCAN_ANGLE = 3

/**
 * Finds the top-level bricks and returns them.  Bricks are optionally sorted
 * by position; top to bottom.
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!eYo.Brick>} The top-level brick objects.
 */
eYo.Board.prototype.getTopBricks = function(ordered) {
  // Copy the topBricks_ list.
  var bricks = [].concat(this.topBricks_)
  if (ordered && bricks.length > 1) {
    var offset = Math.sin(goog.math.toRadians(eYo.Board.SCAN_ANGLE));
    bricks.sort(function(a, b) {
      var aWhere = a.whereInBoard
      var bWhere = b.whereInBoard
      return (aWhere.y + offset * aWhere.x) - (bWhere.y + offset * bWhere.x)
    })
  }
  return bricks
}

/**
 * Dispose of all bricks in board.
 */
eYo.Board.prototype.clear = function() {
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
  this.error = eYo.VOID
}

/**
 * Returns a brick subclass for eYo bricks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this brick.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!eYo.Brick} The created brick.
 */
eYo.Board.prototype.newBrick = function (prototypeName, opt_id) {
  return eYo.Brick.Manager.create(this, prototypeName, opt_id)
}

/**
 * Obtain a newly created brick.
 * Returns a brick subclass for eYo bricks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this brick.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!eYo.Brick} The created brick.
 */
eYo.Board.prototype.newBrick = eYo.Board.prototype.newBrick

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.Board.prototype.undo = function(redo) {
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
              B.change.begin()
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
        Bs.forEach(B => B.change.end())
        eYo.App.didProcessUndo && (eYo.App.didProcessUndo(redo))
      })
      return
    }
  }
}

/**
 * Clear the undo/redo stacks.
 */
eYo.Board.prototype.clearUndo = function() {
  this.undoStack_.length = 0;
  this.redoStack_.length = 0;
  // Stop any events already in the firing queue from being undoable.
  eYo.Events.clearPendingUndo()
  eYo.App.didClearUndo && eYo.App.didClearUndo()
};

/**
 * When something in this board changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Function} Function that can be passed to
 *     removeChangeListener.
 */
eYo.Board.prototype.addChangeListener = function(func) {
  this.listeners_.push(func)
  return func
};

/**
 * Stop listening for this board's changes.
 * @param {Function} func Function to stop calling.
 */
eYo.Board.prototype.removeChangeListener = function(func) {
  goog.array.remove(this.listeners_, func)
};

/**
 * Fire a change event.
 * @param {!eYo.Events.Abstract} event Event to fire.
 */
eYo.Board.prototype.fireChangeListener = function(event) {
  var before = this.undoStack_.length
  if (event.recordUndo) {
    this.undoStack_.push(event)
    this.redoStack_.length = 0
    if (this.undoStack_.length > this.MAX_UNDO) {
      this.undoStack_.unshift()
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
 * Find the brick on this board with the specified ID.
 * Wrapped bricks have a complex id.
 * @param {string} id ID of brick to find.
 * @return {eYo.Brick} The sought after brick or null if not found.
 */
eYo.Board.prototype.getBrickById = eYo.Board.prototype.getBrickById = function(id) {
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
 * Checks whether all value and statement inputs in the board are filled
 * with bricks.
 * @param {boolean=} opt_shadowBricksAreFilled An optional argument controlling
 *     whether shadow bricks are counted as filled. Defaults to true.
 * @return {boolean} True if all inputs are filled, false otherwise.
 */
eYo.Board.prototype.allInputsFilled = function(opt_shadowBricksAreFilled) {
  if (this.topBricks.some(b3k => !brick.allInputsFilled(opt_shadowBricksAreFilled))) {
    return false
  }
  return true
}

/**
 * Database of all boards.
 * @private
 */
eYo.Board.BoardDB_ = Object.create(null)

/**
 * Find the board with the specified ID.
 * @param {string} id ID of board to find.
 * @return {eYo.Board} The sought after board or null if not found.
 */
eYo.Board.getById = function(id) {
  return eYo.Board.BoardDB_[id] || null
}

// Export symbols that would otherwise be renamed by Closure compiler.
eYo.Board.prototype['clear'] = eYo.Board.prototype.clear;
eYo.Board.prototype['clearUndo'] =
    eYo.Board.prototype.clearUndo;
eYo.Board.prototype['addChangeListener'] =
    eYo.Board.prototype.addChangeListener;
eYo.Board.prototype['removeChangeListener'] =
    eYo.Board.prototype.removeChangeListener;

/**
 * The render status of an SVG board.
 * Returns `true` for visible boards and `false` for non-visible,
 * or headless, boards.
 * @type {boolean}
 */
eYo.Board.prototype.rendered = true;

/**
 * Whether this board has resizes enabled.
 * Disable during batch operations for a performance improvement.
 * @type {boolean}
 * @private
 */
eYo.Board.prototype.resizesEnabled_ = true;

/**
 * The board's trashcan (if any).
 * @type {eYo.Trashcan}
 */
eYo.Board.prototype.trashcan = null

/**
 * The current gesture in progress on this board, if any.
 * @type {eYo.Gesture}
 * @private
 */
eYo.Board.prototype.gesture_ = null

/**
 * Last known position of the page scroll.
 * This is used to determine whether we have recalculated screen coordinate
 * stuff since the page scrolled.
 * @type {!eYo.Where}
 * @private
 */
eYo.Board.prototype.lastPageScroll_ = null;

/**
 * Developers may define this function to add custom menu options to the
 * board's context menu or edit the board-created set of menu options.
 * @param {!Array.<!Object>} options List of menu options to add to.
 */
eYo.Board.prototype.configureContextMenu = null;

/**
 * Save resize handler data so we can delete it later in dispose.
 * @param {!Array.<!Array>} handler Data that can be passed to unbindEvent.
 */
eYo.Board.prototype.setResizeHandlerWrapper = function(handler) {
  this.resizeHandlerWrapper_ = handler;
}

Object.defineProperties(eYo.Board.prototype, {
  /**
   * The number of bricks that may be added to the board before reaching
   *     the maxBricks.
   * @return {number} Number of bricks left.
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
   * Find all bricks in board.  No particular order.
   * @return {!Array.<!eYo.Brick>} Array of bricks.
   */
  allBricks: {
    get () {
      var bricks = this.topBricks
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
 * Getter for the flyout associated with this board.  This flyout may be
 * owned by either the toolbox or the board, depending on toolbox
 * configuration.  It will be null if there is no flyout.
 * @return {eYo.Flyout} The flyout on this board.
 * @package
 */
eYo.Board.prototype.getFlyout_ = function() {
  return this.flyout_
}

/**
 * Update items that use screen coordinate calculations
 * because something has changed (e.g. scroll position, window size).
 * @private
 */
eYo.Board.prototype.updateScreenCalculations_ = function() {
  this.recordDeleteAreas()
}

/**
 * Update the board metrics according to the desk.
 * NB: No css styling.
 */
eYo.Board.prototype.updateMetrics = function() {
  this.metrics_.view_.size = this.desk.viewRect.size
}

/**
 * Update the metrics and place the board.
 * @package
 */
eYo.Board.prototype.resize = function() {
  this.updateMetrics(this)
  this.place(this)
}

/**
 * If enabled, resize the parts of the board that change when the board
 * contents (e.g. brick positions) change.  This will also scroll the
 * board contents if needed. Should be sent after `updateMetrics`.
 * @package
 */
eYo.Board.prototype.place = function() {
  this.ui_driver.boardPlace(this)
}

/**
 * Hook after a `metrics` change.
 * @package
 */
eYo.Board.prototype.metricsDidChange = function() {
  this.place()
}

/**
 * If enabled, resize the parts of the board that change when the board
 * contents (e.g. brick positions) change.  This will also scroll the
 * board contents if needed.
 * @package
 */
eYo.Board.prototype.resizeContents = function() {
  if (!this.resizesEnabled_ || !this.rendered) {
    return
  }
  if (this.scrollbar) {
    this.scrollbar.resize()
  }
  this.metrics_.content = this.bricksBoundingRect
  this.ui_driver.boardResizeContents(this)
}

/**
 * Resize and reposition all of the board chrome (toolbox,
 * trash, scrollbars etc.)
 * This should be called when something changes that
 * requires recalculating dimensions and positions of the
 * trash, zoom, etc. (e.g. window resize).
 */
eYo.Board.prototype.resize = function() {
  this.updateMetrics()
  this.place()
}

/**
 * Resize and reposition all of the board chrome (toolbox,
 * trash, scrollbars etc.)
 * This should be called when something changes that
 * requires recalculating dimensions and positions of the
 * trash, zoom, toolbox, etc. (e.g. window resize).
 */
eYo.Board.prototype.place = function() {
  this.ui_driver.boardPlace(this)
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
    this.scrollbar.place()
  }
  this.updateScreenCalculations_()
}

/**
 * Resizes and repositions board chrome if the page has a new
 * scroll position.
 * @package
 */
eYo.Board.prototype.updateScreenCalculationsIfScrolled =
    function() {
  var currScroll = goog.dom.getDocumentScroll()
  if (!this.lastPageScroll_ || !this.lastPageScroll_.equals(currScroll)) {
    this.lastPageScroll_ = currScroll
    this.updateScreenCalculations_()
  }
}

/**
 * Move the receiver to the new coordinates given by its metrics' scroll.
 */
eYo.Board.prototype.move = function() {
  this.dragger && this.dragger.move()
}

/**
 * Move the receiver to new coordinates.
 * @param {eYo.Where} xy Translation.
 */
eYo.Board.prototype.moveTo = function(xy) {
  this.metrics_.scroll = xy
  this.move()
}

/**
 * Translate this board to new coordinates.
 * @param {eYo.Where} xy translation.
 */
eYo.Board.prototype.canvasMoveTo = function(xy) {
  this.ui_driver.boardCanvasMoveTo(this, xy)
}

/**
 * Render all bricks in board.
 */
eYo.Board.prototype.render = function() {
  var bricks = this.allBricks
  // Render each brick
  var i = bricks.length
  while (i--) {
    bricks[i].render(false)
  }
}

/**
 * Highlight or unhighlight a brick in the board.  Brick highlighting is
 * often used to visually mark bricks currently being executed.
 * @param {?string} id ID of brick to highlight/unhighlight,
 *   or null for no brick (used to unhighlight all bricks).
 * @param {boolean=} opt_state If eYo.VOID, highlight specified brick and
 * automatically unhighlight all others.  If true or false, manually
 * highlight/unhighlight the specified brick.
 */
eYo.Board.prototype.highlightBrick = function(id, opt_state) {
  if (opt_state === eYo.VOID) {
    // Unhighlight all bricks.
    for (var i = 0, brick; brick = this.highlightedBricks_[i]; i++) {
      brick.setHighlighted(false);
    }
    this.highlightedBricks_.length = 0;
  }
  // Highlight/unhighlight the specified brick.
  var brick = id ? this.getBrickById(id) : null;
  if (brick) {
    var state = (opt_state === eYo.VOID) || opt_state;
    // Using Set here would be great, but at the cost of IE10 support.
    if (!state) {
      goog.array.remove(this.highlightedBricks_, brick);
    } else if (this.highlightedBricks_.indexOf(brick) == -1) {
      this.highlightedBricks_.push(brick);
    }
    brick.setHighlighted(state);
  }
};

/**
 * Paste the content of the clipboard onto the board.
 */
eYo.Board.prototype.paste = function () {
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
          if (m4t.isHead || m4t.isRight) {
            // the pasted brick must move before it is connected
            // otherwise the newly created brick will attract the old one
            // resulting in a move of the existing connection
            var xy = targetM4t.brick.xy.forward(m4t).backward(targetM4t)
            targetM4t.brick.moveBy(xy)
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
          // Offset brick until not clobbering another brick and not in connection
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
                    eYo.Where.xy(dx, dy))
                  if (neighbour) {
                    return true
                  }
              })
              if (collide) {
                dx += eYo.Board.SNAP_RADIUS
                dy += eYo.Board.SNAP_RADIUS * 2
              }
            } while (collide)
          }
          avoidCollision()
          // is the brick in the visible area ?
          var view = this.metrics.view
          var scale = this.scale || 1
          var size = b3k.size
          // the brick is in the visible area if we see its center
          var bounds = view.clone.unscale(scale).inset(size.width / 2, size.height / 2)
          if (!bounds.xyContains(dx, dy)) {
            dx = (view.x + view.width / 2) / scale - size.width / 2
            dy = (view.y + view.height / 2) / scale - size.height / 2
            avoidCollision()
          }
          b3k.moveBy(eYo.Where.xy(dx, dy))
        }
        b3k.select().scrollToVisible()
      }
    }
  })
}

/**
 * Make a list of all the delete areas for this board.
 */
eYo.Board.prototype.recordDeleteAreas = function() {
  if (this.trashcan && this.dom.svg.group_.parentNode) {
    this.deleteRectTrash_ = this.trashcan.getClientRect();
  } else {
    this.deleteRectTrash_ = null;
  }
  if (this.flyout_) {
    this.deleteRectFlyout_ = this.flyout_.deleteRect
  } else {
    this.deleteRectFlyout_ = null;
  }
};

/**
 * Is the gesture over a delete area (toolbox or non-closing flyout)?
 * @param {!eYo.Gesture} e Mouse move event.
 * @return {?number} Null if not over a delete area, or an enum representing
 *     which delete area the event is over.
 */
eYo.Board.prototype.inDeleteArea = function(gesture) {
  var xy = gesture.where
  if (this.deleteRectTrash_ && this.deleteRectTrash_.contains(xy)) {
    return eYo.Board.DELETE_AREA_TRASH
  }
  if (this.deleteRectFlyout_ && this.deleteRectFlyout_.contains(xy)) {
    return eYo.Board.DELETE_AREA_TOOLBOX
  }
  return eYo.Board.DELETE_AREA_NONE
}

/**
 * Start tracking a drag of an object on this board.
 * @param {!Event} e Mouse down event.
 * @param {!eYo.Where} xy Starting location of object.
 */
eYo.Board.prototype.eventWhere = function(e) {
  return this.ui_driver.boardEventWhere(this, e)
}

/**
 * Clean up the board by ordering all the bricks in a column.
 */
eYo.Board.prototype.cleanUp = function() {
    this.setResizesEnabled(false)
  eYo.Events.group = true
  var cursor = new eYo.Where()
  this.orderedTopBricks.forEach(brick => {
    brick.moveTo(cursor)
    brick.ui.snapToGrid()
    cursor.y = brick.xy.y +
        brick.size.height + eYo.Unit.y / 2
  })
  eYo.Events.group = false
  this.setResizesEnabled(true)
}

/**
 * Show the context menu for the board.
 * @param {!Event} e Mouse event.
 * @private
 * @suppress{accessControls}
 */
eYo.Board.prototype.showContextMenu_ = function (e) {
  if (this.options.readOnly || this.isFlyout) {
    return
  }
  var menuOptions = []
  var topBricks = this.orderedTopBricks
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
     * @param {boolean} shouldCollapse Whether a brick should collapse.
     * @private
     */
    var toggleOption = (shouldCollapse) => {
      var ms = 0
      for (var i = 0; i < topBricks.length; i++) {
        var brick = topBricks[i]
        while (brick) {
          setTimeout(brick.setCollapsed.bind(brick, shouldCollapse), ms)
          brick = brick.foot
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
    var brick = deleteList.shift()
    if (brick) {
      if (brick.board) {
        brick.dispose(false, true)
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
 * Mark this board's desk main board as the currently focused main board.
 */
eYo.Board.prototype.markFocused = function() {
  var mainBoard = this.desk.mainBoard
  mainBoard.ui_driver.boardSetBrowserFocus(mainBoard)
}

/**
 * Zooming the bricks given the center with zooming in or out.
 * @param {eYo.Where | Event} center coordinate of center.
 * @param {number} amount Amount of zooming
 *                        (negative zooms out and positive zooms in).
 */
eYo.Board.prototype.zoom = function(center, amount) {
  var options = this.options.zoom
  goog.asserts.assert(options, 'Forbidden zoom with no zoom options')
  var speed = options.scaleSpeed
  // Scale factor.
  var scaleChange = Math.pow(speed, amount)
  // Clamp scale within valid range.
  var newScale = this.scale * scaleChange
  if (newScale > options.maxScale) {
    scaleChange = options.maxScale / this.scale
  } else if (newScale < options.minScale) {
    scaleChange = options.minScale / this.scale
  }
  if (scaleChange == 1) {
    return // No change in zoom.
  }
  this.scale *= scaleChange
  if (goog.isDef(center.clientX)) {
    center = new eYo.Where(center)
  }
  this.ui_driver.boardZoom(this, center, scaleChange)
}

/**
 * Zooming the bricks centered in the center of view with zooming in or out.
 * @param {number} type Type of zooming (-1 zooming out and 1 zooming in).
 */
eYo.Board.prototype.zoomCenter = function(type) {
  this.zoom(this.metrics.view.center, type)
}

/**
 * Scroll one page up or down, left or right.
 * Horizontally: increase to right, decrease to the left.
 * Vertically: increase to the bottom, decrease to the top.
 * @param {Boolean} horizontally
 * @param {Boolean} increase  true for a scroll up, false otherwise
 */
eYo.Board.prototype.scrollPage = function(horizontally, increase) {
  // how many lines are visible actually
  var metrics = this.metrics_
  var scroll = metrics.scroll
  var size = metrics.view.size.unscale(board.scale)
  if (horizontally) {
    var scrollAmount = Math.max(Math.floor(size.w) * 0.75, 1)
    if (increase) {
      scroll.x += scrollAmount
    } else {
      scroll.x -= scrollAmount
    }
  } else {
    scrollAmount = Math.max(Math.floor(size.h) - 1, 1)
    if (increase) {
      scroll.y += scrollAmount
    } else {
      scroll.y -= scrollAmount
    }
  }
  this.moveTo(scroll)
}

/**
 * Zoom the bricks to fit in the view rect if possible.
 */
eYo.Board.prototype.zoomToFit = function() {
  var rect = this.bricksBoundingRect
  var width = rect.width
  if (!width) {
    return  // Prevents zooming to infinity.
  }
  var height = rect.height
  var metrics = this.metrics
  var size = metrics.view.size
  if (this.flyout_) {
    size.width -= this.flyout_.viewRect.width
  }
  if (!this.scrollbar) {
    // Origin point of 0,0 is fixed, bricks will not scroll to center.
    width += metrics.content.x_min
    height += metrics.content.y_min
  }
  size.unscale(width, height)
  this.scale = Math.min(size.x, size.y)
  this.scrollCenter()
  if (this.flyout_) {
    this.moveBy(eYo.Where.xy(-this.flyout_.viewRect.width / 2, 0))
  }
}

/**
 * Center the board.
 */
eYo.Board.prototype.scrollCenter = function() {
  this.doRelativeScroll({x: 1 / 2, y: 1 / 2})
}
  
/**
 * Scroll the board to center on the given brick.
 * @param {?string} id ID of brick center on.
 * @public
 */
eYo.Board.prototype.centerOnBrick = function(id) {
  if (!this.scrollbar) {
    console.warn('Tried to scroll a non-scrollable board.');
    return;
  }
  var brick = this.getBrickById(id)
  if (!brick) {
    return
  }
  // Board scale, used to convert from board coordinates to pixels.
  var metrics = this.metrics_
  this.moveTo(brick.ui.center.scale(-metrics.scale).forward(metrics.view.center))
}

/**
 * Sets the X/Y translations of a top level board to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 * @this eYo.Board
 */
eYo.Board.doRelativeScroll = function(xyRatio) {
  if (!this.scrollbar) {
    throw 'Attempt to set top level board scroll without scrollbars.'
  }
  var metrics = this.metrics_
  var content = metrics.content
  var view = metrics.content
  var scroll = metrics.scroll
  if (goog.isNumber(xyRatio.x)) {
    var t = Math.min(1, Math.max(0, xyRatio.x))
    // view.x_max - content.x_max <= scroll.x <= view.x_min - content.x_min
    scroll.x = view.x_max - content.x_max + t * (view.width - content.width)
  }
  if (goog.isNumber(xyRatio.y)) {
    var t = Math.min(1, Math.max(0, xyRatio.y))
    scroll.y = view.y_max - content.y_max + t * (view.height - content.height)
  }
  this.moveTo(scroll)
}

/**
 * Update whether this board has resizes enabled.
 * If enabled, board will resize when appropriate.
 * If disabled, board will not resize until re-enabled.
 * Use to avoid resizing during a batch operation, for performance.
 * @param {boolean} enabled Whether resizes should be enabled.
 */
eYo.Board.prototype.setResizesEnabled = function(enabled) {
  var reenabled = (!this.resizesEnabled_ && enabled)
  this.resizesEnabled_ = enabled
  if (reenabled) {
    // Newly enabled.  Trigger a resize.
    this.resizeContents()
  }
}

/**
 * Look up the gesture that is tracking this touch stream on this board.
 * May create a new gesture.
 * Forwards to rhe target board if any.
 * @param {!Event} e Mouse event or touch event.
 * @return {eYo.Gesture} The gesture that is tracking this touch
 *     stream, or null if no valid gesture exists.
 * @package
 */
eYo.Board.prototype.getGesture = function(e) {
  if (this.targetBoard_) {
    return this.targetBoard_.getGesture(e)
  }
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

  // No gesture existed on this board, but this looks like the start of a
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
eYo.Board.prototype.clearGesture = function() {
  this.gesture_ = null
}

/**
 * Cancel the current gesture, if one exists.
 * @package
 */
eYo.Board.prototype.cancelCurrentGesture = function() {
  if (this.gesture_) {
    this.gesture_.cancel()
  }
}

/**
 * Get the audio manager for this board.
 * @return {Brickly.BoardAudio} The audio manager for this board.
 */
eYo.Board.prototype.getAudioManager = function() {
  return this.audioManager_
};
   
eYo.Board.prototype.logAllConnections = function (comment) {
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
      console.log(m4t.whereInBrick, m4t.whereInBoard, m4t.brick.type)
    })
  })
}

/**
 * Convert a coordinate object from pixels to board units.
 * @param {!eYo.Where} pixelCoord  A coordinate with x and y values
 *     in css pixel units.
 * @return {!eYo.Where} The input coordinate divided by the board
 *     scale.
 * @private
 */
eYo.Board.prototype.fromPixelUnit = function(xy) {
  return new eYo.Where(xy).unscale(this.scale)
}

/**
 *
 */
eYo.Board.prototype.getRecover = (() => {
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
 * Add the nodes from string to the board.
 * Usefull for testing? -> commonn test methods.
 * @param {!String} str
 * @return {Array.<string>} An array containing new brick IDs.
 */
eYo.Board.prototype.fromDom = function (dom) {
  return dom &&(eYo.Xml.domToBoard(dom, this))
}

/**
 * Add the nodes from string to the board.
 * @param {!String} str
 * @return {Array.<string>} An array containing new brick IDs.
 */
eYo.Board.prototype.fromString = function (str) {
  var parser = new DOMParser()
  var dom = parser.parseFromString(str, 'application/xml')
  return this.fromDom(dom)
}


/**
 * Convert the board to string.
 * @param {?Object} opt  See eponym parameter in `eYo.Xml.brickToDom`.
 */
eYo.Board.prototype.toDom = function (opt) {
  return eYo.Xml.boardToDom(this, opt)
}

/**
 * Convert the board to string.
 * @param {?Boolean} opt_noId
 */
eYo.Board.prototype.toString = function (opt_noId) {
  let oSerializer = new XMLSerializer()
  return oSerializer.serializeToString(this.toDom())
}

/**
 * Convert the board to UTF8 byte array.
 * @param {?Boolean} opt_noId
 */
eYo.Board.prototype.toUTF8ByteArray = function (opt_noId) {
  var s = '<?xml version="1.0" encoding="utf-8"?>\n' + this.toString(optNoId)
  return goog.crypt.toUTF8ByteArray(s)
}

/**
 * Add the nodes from UTF8 string representation to the board. UNUSED.
 * @param {!Array} bytes
 * @return {Array.<string>} An array containing new brick IDs.
 */
eYo.Board.prototype.fromUTF8ByteArray = function (bytes) {
  var str = goog.crypt.utf8ByteArrayToString(bytes)
  return str && (this.fromString(str))
}


/**
 * Add a brick to the board.
 * @param {eYo.Brick} brick
 * @param {String} opt_id
 */
eYo.Board.prototype.addBrick = function (brick, opt_id) {
  this.change.wrap(() => {
    brick.id = (opt_id && !this.getBrickById(opt_id)) ?
    opt_id : eYo.Do.genUid()
    this.hasUI && brick.makeUI()
    this.topBricks_.push(brick)
    this.brickDB_[brick.id] = brick
  })
  this.resizeContents()
}

/**
 * Remove a brick from the board.
 * @param {eYo.Brick} brick
 */
eYo.Board.prototype.removeBrick = function (brick) {
  this.change.wrap(() => {
    if (!goog.array.remove(this.topBricks_, brick)) {
      throw 'Brick not present in board\'s list of top-most bricks.'
    }
    // Remove from board
    this.brickDB_[brick.id] = null
  })
}

/**
 * Tidy up the nodes.
 * @param {?Object} kvargs  key value arguments
 * IN PROGRESS
eYo.Board.prototype.tidyUp = function (kvargs) {
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
 * Scroll the board to show the brick with the given id in the top left corner.
 * @param {?string} id ID of brick center on.
 * @public
 */
eYo.Board.prototype.scrollBrickTopLeft = function(id) {
  if (!this.scrollbar) {
    console.warn('Tried to scroll a non-scrollable board.')
    return;
  }
  var brick = this.getBrickById(id)
  if (!brick) {
    return
  }
  if (!brick.isStmt) {
    brick = brick.stmtParent || brick.root
  }
  // `where` is in board coordinates.
  
  // Scrolling to here will put the brick line in the top-left corner of the
  // visible board.
  var metrics = this.metrics_
  this.moveTo(brick.xy
    // Find the top left of the brick in board units.
    .forward(1/2 + brick.depth * eYo.Span.INDENT, 1/4)
    .scale(-this.scale)
    .backward(metrics.view.origin)
  )
}
