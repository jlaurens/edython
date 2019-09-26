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
 * @param {!eYo.Desk | eYo.Flyout | eYo.Board} owner Any board belongs to either a desk (the main board), a flyout (the flyout board) or another board (the brick dragger board). We allways have `this === owner.board`, which means that each kind of owner may have only one board.
 * @constructor
 */
eYo.Board = function(owner, options) {
  owner.board_ = this
  this.owner_ = owner

  this.options = options
  
  eYo.Magnet.DB.init(this)

  /**
   * The top bricks are all the bricks with no parent.
   * They are owned by a board.
   * @type {!Array.<!eYo.Brick>}
   * @private
   */
  this.topBricks_ = []

  /**
   * @type {!Object}
   * @private
   */
  this.brickDB_ = Object.create(null)

  this.metrics_ = new eYo.Metrics(this)
  
  if (!this.isDragger) {
    this.boardDragger_ = new eYo.BoardDragger(this)
  }

  /**
   * List of currently highlighted bricks.  Brick highlighting is often used to
   * visually mark bricks currently being executed.
   * @type !Array.<!eYo.Brick>
   * @private
   */
  this.highlightedBricks_ = []

  this.resetChangeCount()
}

/**
 * Class for a main board.  This is a data structure that contains bricks, has event, undo/redo management...
 * @param {!eYo.Desk} owner The main board belongs to a desk. We allways have `this === owner.board`, which means that each kind of owner may have only one board.
 * @constructor
 */
eYo.Board.Main = function(owner, options) {
  eYo.Board.Main.superClass_.constructor.call(this, owner, options)
  
  /** @type {string} */
  this.id = eYo.Do.genUid()
  eYo.Board.Main.DB_[this.id] = this

  this.change_ = new eYo.Change(this)

  /**
   * The main bricks are displayed in the main pane,
   * which is the right part of the board.
   * @type {!Array.<!eYo.Brick>}
   * @private
   */
  this.mainBricks_ = []

  /**
   * The draft bricks are displayed in the draft pane,
   * which is the left part of the board, with a grey background.
   * @type {!Array.<!eYo.Brick>}
   * @private
   */
  this.draftBricks_ = []

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
   * @type {!Array.<!Function>}
   * @private
   */
  this.listeners_ = []
  
  this.board_ = new eYo.Board(this, {
    backgroundClass: 'eyo-board-dragger-background'
  })
  this.brickDragger_ = new eYo.BrickDragger(this)
}

goog.inherits(eYo.Board.Main, eYo.Board)

eYo.Do.addProtocol(eYo.Board.prototype, 'ChangeCount')

Object.defineProperties(eYo.Board.Main, {
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
   * Convenient property.
   * @readonly
   * @type {eYo.Board}
   */
  owner: {
    get () {
      return this.owner_
    }
  },
  /**
   * The desk enclosing the board. Every board belongs to a desk, either directly or not.
   * @readonly
   * @type {eYo.Desk}
   */
  desk: {
    get () {
      // This is why the owner's desk is itself when being a desk
      return this.owner_.desk
    }
  },
  /**
   * In a flyout, the target board where bricks should be placed after a drag.
   * Otherwise null.
   * @type {?eYo.Board}
   * @readonly
   */
  targetBoard: {
    get () {
      return this.inFlyout && this.owner_.owner_ || null
    }
  },
  /**
   * The main board is the receiver.
   * @readonly
   * @type {eYo.Board}
   */
  main: {
    get () {
      return this.inFlyout && this.owner_.owner_ || this.owner_
    }
  },
  /**
   * Dragger boards are owned by another board.
   * @readonly
   * @type {boolean}
   */
  isDragger: {
    get () {
      return this.owner_ instanceof eYo.Board
    }
  },
  /**
   * Is this board belonging to a flyout?
   * @readonly
   * @type {boolean}
   */
  inFlyout: {
    get () {
      return this.owner_ instanceof eYo.Flyout
    }
  },
  /**
   * The dragger, if relevant.
   */
  dragger: {
    get () {
      return this.draggable && this.boardDragger_
    }
  },
  audio: {
    get () {
      return this.desk.audio
    }
  },
  /**
   * Is this board visible
   * @type {boolean} True if this board is visible.
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
      return this.targetBoard // or this.inFlyout
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
      return this.gesture_ && this.gesture_.isDragging
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
   * @type {eYo.Scrollbar | eYo.Scroller}
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
    set (newValue) {
      this.metrics_.scale = newValue
    }
  },
  drag: {
    get () {
      return this.metrics_.drag
    },
    /**
     * Set the board's scroll vector.
     * @param {eYo.Size} newValue Scroll factor.
     */
    set (newValue) {
      this.metrics_.drag = newValue
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
      // JL: TODO separate main bricks and draft bricks
      var ans = new eYo.Rect()
      var bricks = this.topBricks.filter(b3k => b3k.ui && b3k.hasUI)
      bricks.length && bricks.forEach(b3k => ans.union(b3k.ui.boundingRect))
      return ans
    }
  },
  /**
   * Calculate the bounding box for the bricks on the board.
   * Coordinate system: board coordinates.
   *
   * @return {Object} Contains the position and size of the bounding box
   *   containing the bricks on the board.
   */
  mainBricksBoundingRect: {
    get () {
      var ans = new eYo.Rect()
      var bricks = this.mainBricks.filter(b3k => b3k.ui && b3k.hasUI)
      bricks.length && bricks.forEach(b3k => ans.union(b3k.ui.boundingRect))
      return ans
    }
  },
  /**
   * Calculate the bounding box for the bricks on the board.
   * Coordinate system: board coordinates.
   *
   * @return {Object} Contains the position and size of the bounding box
   *   containing the bricks on the board.
   */
  draftBricksBoundingRect: {
    get () {
      var ans = new eYo.Rect()
      var bricks = this.draftBricks.filter(b3k => b3k.ui && b3k.hasUI)
      bricks.length && bricks.forEach(b3k => ans.union(b3k.ui.boundingRect))
      return ans
    }
  },
  /**
   * Return the position of the board origin relative to the injection div
   * origin in pixels.
   * The board origin is where a brick would render at position (0, 0).
   * It is not the upper left corner of the board SVG.
   * @return {!eYo.Where} Offset in pixels.
   */
  originInDesk: {
    get () {
      return this.desk.xyElementInDesk(this.dom.svg.canvas_)
    }
  },
  /**
   * the top bricks of the board.
   */
  topBricks: {
    get () {
      return [].concat(this.topBricks_)
    }
  },
  /**
   * the ordered top bricks of the board.
   */
  orderedTopBricks: {
    get () {
      return this.getTopBricks(true)
    }
  },
  /**
   * the main bricks of the board.
   */
  mainBricks: {
    get () {
      return [].concat(this.mainBricks_)
    }
  },
  /**
   * the draft bricks of the board.
   */
  draftBricks: {
    get () {
      return [].concat(this.draftBricks_)
    }
  },
})

Object.defineProperties(eYo.Board.Main.prototype, {
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
   * The main board is the receiver.
   * @readonly
   * @type {eYo.Board}
   */
  main: {
    get () {
      return this
    }
  },
  /**
   * The board used for brick dragging.
   * @readonly
   * @type {eYo.Board}
   */
  draggerBoard: {
    get () {
      return this.board_
    }
  },
  flyout: {
    /**
     * The flyout associate to the board if any.
     * @return{?eYo.Flyout}
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
        goog.asserts.assert(this.isMain, 'Only main boards may have flyouts')
        this.flyout_ = newValue
        oldValue && oldValue.dispose()
      }
    }
  },
  /**
   * Only main boards may have a flyout and draggers.
   * @readonly
   * @type {boolean}
   */
  isMain: {
    value: true
  },

})

/**
 * Dispose of this board.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Board.prototype.dispose = function() {
  this.dispose = eYo.Do.nothing
  // Stop rerendering.
  this.rendered = false;
  this.cancelGesture()
  this.listeners_.length = 0
  this.clear()
  if (this.isMain) {
    this.board_.dispose()
    this.board_ = null
    this.boardDragger_.dispose()
    this.boardDragger_ = null
    this.brickDragger_.dispose()
    this.brickDragger_ = null
  }
  // Remove from board database.
  delete eYo.Board.Main.DB_[this.id]
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

  eYo.Magnet.DB.dispose(this)

  this.options = null

  this.highlightedBricks_ = this.metrics_ = this.topBricks_ = this.brickDB_ = this.owner_ = this.owner_.board_ = null
}

/**
 * Dispose of this board.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Board.Main.prototype.dispose = function() {
  this.dispose = eYo.Do.nothing
  // Stop rerendering.
  this.rendered = false;
  this.cancelGesture()
  this.listeners_.length = 0
  this.clear()
  if (this.isMain) {
    this.boardDragger_.dispose()
    this.boardDragger_ = null
    this.brickDragger_.dispose()
    this.brickDragger_ = null
  }
  // Remove from board database.
  delete eYo.Board.Main.DB_[this.id]
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
  this.topBricks_ = this.mainBricks_ = this.draftBricks_ = this.listeners_ = this.undoStack_ = this.redoStack_ = this.brickDB_ = this.owner_ = null
  eYo.Board.Main.superClass_.dispose.call(this)
}

/**
 * Make the UI. Called by the board's owner.
 */
eYo.Board.prototype.makeUI = function() {
  var options = this.options
  this.makeUI = eYo.Do.nothing
  this.ui_driver.boardInit(this)
  if (options.hasScrollbars) {
      // Add scrollbar.
    this.scrollbar_ = this.inFlyout
      ? new eYo.Scrollbar(
          this,
          false /*this.horizontalLayout_*/,
          false, 'eyo-flyout-scrollbar'
        )
      : new eYo.Scroller(this)
  }
  var bottom = eYo.Scrollbar.thickness
  if (options.hasTrashcan) {
    this.trashcan = new eYo.Trashcan(this, bottom)
    bottom = this.trashcan.top
  }
  if (options.zoom) {
    this.scale = options.zoom.startScale || 1
    if (options.zoom.controls) {
      this.zoomControls_ = new eYo.ZoomControls(this, bottom)
      bottom = this.zoomControls_.top
    }
  }
  this.board_ && this.board_.makeUI()
  this.flyout_ && this.flyout_.makeUI()
  this.recordDeleteAreas()
}

/**
 * Dispose the UI related resources.
 */
eYo.Board.prototype.disposeUI = function() {
  this.flyout_ && this.flyout_.disposeUI()
  this.board_ && this.board_.disposeUI()
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
 * The dimensions and the scroll offset are updated.
 */
eYo.Board.prototype.didScale = function() {
  console.error('BEFORE', this.metrics)
  this.updateMetrics()
  console.error('AFTER', this.metrics)
  this.place()
  this.ui_driver && this.ui_driver.boardDidScale(this)
  // if (this.scrollbar) {
  //   this.scrollbar.layout()
  // } else {
  //   this.move()
  // }
  // eYo.App.hideChaff()
  // if (this.flyout_) {
  //   // Resize flyout.
  //   this.flyout_.reflow()
  // }
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
    var offset = Math.sin(goog.math.toRadians(eYo.Board.SCAN_ANGLE))
    bricks.sort((a, b) => {
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
  while (this.topBricks_.length) {
    this.topBricks_[0].dispose()
  }
  this.setResizesEnabled(true)
  this.error = eYo.VOID
}

/**
 * Dispose of all bricks in board.
 */
eYo.Board.Main.prototype.clear = function() {
  this.setResizesEnabled(false)
  var existingGroup = eYo.Events.group
  if (!existingGroup) {
    eYo.Events.group = true
  }
  this.mainBricks_.length = this.draftBricks_.length = 0
  eYo.Board.Main.superClass_.clear.call(this)
  if (!existingGroup) {
    eYo.Events.group = false
  }
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
eYo.Board.Main.prototype.clearUndo = function() {
  this.undoStack_.length = 0
  this.redoStack_.length = 0
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
}

/**
 * Stop listening for this board's changes.
 * @param {Function} func Function to stop calling.
 */
eYo.Board.prototype.removeChangeListener = function(func) {
  goog.array.remove(this.listeners_, func)
};

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
 * Database of all main boards.
 * @private
 */
eYo.Board.Main.DB_ = Object.create(null)

/**
 * Find the main board with the specified ID.
 * @param {string} id ID of board to find.
 * @return {eYo.Board} The sought after board or null if not found.
 */
eYo.Board.mainWithId = function(id) {
  return eYo.Board.Main.DB_[id] || null
}

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
eYo.Board.prototype.resizesEnabled_ = true

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
 * Save layout handler data so we can delete it later in dispose.
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
  this.resizePort()
  this.flyout_ && this.flyout_.updateMetrics()
}

/**
 * Add a flyout.
 * @param {!Object} switcher  See eYo.FlyoutToolbar constructor.
 */
eYo.Desk.prototype.addFlyout = function(switcher) {
  if (!this.hasUI) {
    this.willFlyout_ = true
    return
  }
  delete this.willFlyout_
  var flyoutOptions = {
    flyoutAnchor: this.options.flyoutAnchor,
    switcher: switcher
  }
  this.flyout_ = new eYo.Flyout(this, flyoutOptions)
}

/**
 * Remove a previously added flyout.
*/
eYo.Desk.prototype.removeFlyout = function() {
  var x = this.flyout_
  if (x) {
    this.flyout_ = null
    this.board_.flyout = null
    x.dispose()
  }
}

/**
 * Hook after a `metrics` change.
 */
eYo.Board.prototype.metricsDidChange = function() {
  this.place()
}

/**
 * If enabled, calculate the metrics' content related info.
 * Update UI accordingly.
 */
eYo.Board.prototype.resizePort = function() {
  if (!this.resizesEnabled_ || !this.rendered) {
    return
  }
  var metrics_ = this.metrics_
  // Start with the minimal rectangle enclosing all the blocks.
  var port = this.bricksBoundingRect
  // add room for the draft
  var z = -3 * eYo.Unit.x
  if (port.left > z) {
    port.left = z
  }
  // add room for line numbering
  this.numbering && (port.left -= 2 * eYo.Unit.x)
  // Add room for the whole visible rectangle.
  var view = metrics_.view
  // remove the room for both scrollers
  var withHScroller = view.height > eYo.Scrollbar.thickness
  if (withHScroller) {
    view.size_.height -= eYo.Scrollbar.thickness
  }
  var withVScroller = view.width > eYo.Scrollbar.thickness
  if (withVScroller) {
    view.size_.width -= eYo.Scrollbar.thickness
  }
  view.unscale(metrics_.scale)
  view.origin_.set()
  // enlarge the port to include the visual rectangle
  if (port.right < view.right) {
    port.right = view.right
  }
  if (port.bottom < view.bottom) {
    port.bottom = view.bottom
  }
  z = -eYo.Unit.y
  if (port.top > z) {
    port.top = z
  }
  // then add the scrollers
  if (withHScroller) {
    port.height += eYo.Scrollbar.thickness / metrics_.scale
  }
  if (withVScroller) {
    port.width += eYo.Scrollbar.thickness / metrics_.scale
  }
  metrics_.port = port
  console.error('port: ', port.toString)
}

/**
 * Resize and reposition all of the board chrome (toolbox,
 * trash, scrollbars etc.)
 * This should be called when something changes that
 * requires recalculating dimensions and positions of the
 * trash, zoom, etc. (e.g. window layout).
 */
eYo.Board.prototype.layout = function() {
  this.updateMetrics()
  this.place()
  this.scrollbar && this.scrollbar.layout()
}

/**
 * Resize and reposition all of the board chrome (toolbox,
 * trash, scrollbars etc.)
 * This should be called when something changes that
 * requires recalculating dimensions and positions of the
 * trash, zoom, toolbox, etc. (e.g. window layout).
 */
eYo.Board.prototype.place = function() {
  this.ui_driver && this.ui_driver.boardPlace(this)
  if (this.flyout_) {
    this.flyout_.place()
  }
  if (this.trashcan) {
    this.trashcan.place()
  }
  if (this.zoomControls_) {
    this.zoomControls_.place()
  }
  this.updateScreenCalculations_()
}

/**
 * Resizes and repositions board chrome if the page has a new
 * scroll position.
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
  console.log('moveTo', xy)
  this.metrics_.drag = xy
  this.move()
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
  this.cancelGesture() // Dragging while pasting?  No.
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
                  var neighbour = m4t.closest(eYo.Board.Main.SNAP_RADIUS,
                    eYo.Where.xy(dx, dy))
                  if (neighbour) {
                    return true
                  }
              })
              if (collide) {
                dx += eYo.Board.Main.SNAP_RADIUS
                dy += eYo.Board.Main.SNAP_RADIUS * 2
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
    this.deleteRectTrash_ = this.trashcan.getClientRect()
  } else {
    this.deleteRectTrash_ = null
  }
  if (this.flyout_) {
    this.deleteRectFlyout_ = this.flyout_.deleteRect
  } else {
    this.deleteRectFlyout_ = null
  }
}

/**
 * Is the gesture over a delete area (toolbox or non-closing flyout)?
 * @param {!eYo.Gesture} e Mouse move event.
 * @return {?number} Null if not over a delete area, or an enum representing
 *     which delete area the event is over.
 */
eYo.Board.prototype.inDeleteArea = function(gesture) {
  var xy = gesture.where
  if (this.deleteRectTrash_ && this.deleteRectTrash_.contains(xy)) {
    return eYo.Board.Main.DELETE_AREA_TRASH
  }
  if (this.deleteRectFlyout_ && this.deleteRectFlyout_.contains(xy)) {
    return eYo.Board.Main.DELETE_AREA_TOOLBOX
  }
  return eYo.Board.Main.DELETE_AREA_NONE
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
 * Show the context menu for the board.
 * @param {!Event} e Mouse event.
 * @private
 * @suppress{accessControls}
 */
eYo.Board.prototype.showContextMenu_ = function (e) {
  if (this.options.readOnly || this.inFlyout) {
    return
  }
  var menuOptions = []
  var topBricks = this.orderedTopBricks
  var eventGroup = eYo.Do.genUid()

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
    callback: () => {
      this.cancelGesture()
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
  var board = this.desk.board
  board.ui_driver.boardSetBrowserFocus(board)
}

/**
 * Zooming the bricks given the center with zooming in or out.
 * @param {eYo.Where | Event} center coordinate of center.
 * @param {number} amount Amount of zooming
 *                        (negative zooms out and positive zooms in).
 */
eYo.Board.prototype.zoom = function(center, amount) {
  var options = this.options.zoom
  console.error(this.options)
  goog.asserts.assert(options, `Forbidden zoom with no zoom options ${this.options}`)
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
  var drag = metrics.drag
  var size = metrics.view.size.unscale(board.scale)
  if (horizontally) {
    var scrollAmount = Math.max(Math.floor(size.w) * 0.75, 1)
    if (increase) {
      drag.x += scrollAmount
    } else {
      drag.x -= scrollAmount
    }
  } else {
    scrollAmount = Math.max(Math.floor(size.h) - 1, 1)
    if (increase) {
      drag.y += scrollAmount
    } else {
      drag.y -= scrollAmount
    }
  }
  this.moveTo(drag)
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
    width += metrics.port.x_min
    height += metrics.port.y_min
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
  var content = metrics.port
  var view = metrics.port
  var drag = metrics.drag
  if (goog.isNumber(xyRatio.x)) {
    var t = Math.min(1, Math.max(0, xyRatio.x))
    // view.x_max - content.x_max <= scroll.x <= view.x_min - content.x_min
    drag.x = view.x_max - content.x_max + t * (view.width - content.width)
  }
  if (goog.isNumber(xyRatio.y)) {
    var t = Math.min(1, Math.max(0, xyRatio.y))
    drag.y = view.y_max - content.y_max + t * (view.height - content.height)
  }
  this.moveTo(drag)
}

/**
 * Update whether this board has resizes enabled.
 * If enabled, board will layout when appropriate.
 * If disabled, board will not layout until re-enabled.
 * Use to avoid resizing during a batch operation, for performance.
 * @param {boolean} enabled Whether resizes should be enabled.
 */
eYo.Board.prototype.setResizesEnabled = function(enabled) {
  var reenabled = (!this.resizesEnabled_ && enabled)
  this.resizesEnabled_ = enabled
  if (reenabled) {
    // Newly enabled.  Trigger a layout.
    this.resizePort()
  }
}

/**
 * Look up the gesture that is tracking this touch stream on this board.
 * Forwards to the main board.
 * @param {!Event} e Mouse event or touch event.
 * @return {eYo.Gesture} The gesture that is tracking this touch
 *     stream, or null if no valid gesture exists.
 */
eYo.Board.prototype.getGesture = function(e) {
  return this.main.getGesture(e)
}

/**
 * Look up the gesture that is tracking this touch stream on this board.
 * May create a new gesture.
 * @param {!Event} e Mouse event or touch event.
 * @return {eYo.Gesture} The gesture that is tracking this touch
 *     stream, or null if no valid gesture exists.
 */
eYo.Board.Main.prototype.getGesture = function(e) {
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
 */
eYo.Board.prototype.clearGesture = function() {
  this.gesture_ = null
}

/**
 * Cancel the current gesture, if one exists.
 */
eYo.Board.prototype.cancelGesture = function() {
  if (this.gesture_) {
    this.gesture_.cancel()
  }
}
   
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
eYo.Board.prototype.addBrick = (() => {
  var insertAt = (array, b, i) => {
    array.splice(i, 0, b)
    var l = b.where.l
    var bb
    while ((bb = array[++i])) {
      l += b.span.l + 2
      if (bb.where.l < l) {
        (b = bb).ui.xy_.l = l
      } else {
        break
      }
    }
  }
  var insert = (array, brick) => {
    var i_min = 0
    var b_min = array[i_min]
    if (!b_min || brick.where.l <= b_min.where.l) {
      insertAt(array, brick, i_min)
    } else {
      var i_max = array.length - 1
      while (i_min < i_max) {
        var i = Math.floor((i_min + i_max) / 2)
        var dl = brick.where.l - array[i].where.l
        if (dl < 0) {
          i_max = i
        } else if (dl > 0) {
          i_min = i
        } else {
          i_max = i
          break
        }
      }
      insertAt(array, brick, i_max)
    }
  }
  return function (brick, opt_id, f) {
    this.change.wrap(() => {
      brick.id = (opt_id && !this.getBrickById(opt_id)) ?
      opt_id : eYo.Do.genUid()
      this.hasUI && brick.makeUI()
      this.brickDB_[brick.id] = brick
      this.topBricks_.push(brick)
      if (brick.isMain) {
        insert(this.mainBricks_, brick)
        brick.ui.xy_.x = 0
      } else {
        insert(this.draftBricks_, brick)
        brick.ui.xy_.c = - brick.span.c + 0.5
        brick.ui.xy_.l += 0.5
      }
      brick.move()
    })
    this.resizePort()
  }
})()

/**
 * Remove a brick from the board.
 * @param {eYo.Brick} brick
 * @param {?Function} f
 */
eYo.Board.prototype.removeBrick = function (brick, f) {
  this.change.wrap(() => {
    if (!goog.array.remove(this.topBricks_, brick)) {
      throw 'Brick not present in board\'s list of top-most bricks.'
    }
    // Remove from board
    this.brickDB_[brick.id] = null
    f && f(this)
  })
}

/**
 * Remove a brick from the board.
 * @param {eYo.Brick} brick
 */
eYo.Board.Main.prototype.removeBrick = function (brick) {
  eYo.Board.Main.superclass_.removeBrick.call(this, brick, () => {
    goog.array.remove(this.mainBricks_, brick)
    goog.array.remove(this.draftBricks_, brick)
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

/**
 * Fire a change event.
 * @param {!eYo.Events.Abstract} event Event to fire.
 */
eYo.Board.Main.prototype.fireChangeListener = function(event) {
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
