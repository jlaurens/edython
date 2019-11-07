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

goog.require('eYo.Owned')
goog.require('eYo.Decorate')

goog.forwardDeclare('eYo.Workspace')

goog.forwardDeclare('eYo.Metrics')

goog.forwardDeclare('goog.array')
goog.forwardDeclare('goog.math')


/**
 * Class for a board. This is a data structure that contains bricks
 * and the UI to display them.
 * The desk contains the main board and the draft board.
 * The flyout contains the flyout board.
 * There is also a board used to drag bricks around.
 * That makes at least 4 different boards.
 * @param {!eYo.Desk|eYo.Workspace|eYo.Section} owner.
 * @constructor
 */
eYo.Board = function(owner) {
  eYo.Board.superClass_.constructor.call(this, owner)
  /**
   * The top bricks are all the bricks with no parent.
   * They are owned by a board.
   * They are ordered by line number.
   * @type {!eYo.List}
   * @private
   */
  this.list_ = new eYo.List()

  /**
   * @type {!Object}
   * @private
   */
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

  /**
   * `true` if the board is visible and `false` if it's headless.
   * @type {boolean}
   */
  this.rendered = false
  /**
   * @type {*}
   */
  this.error = eYo.VOID
}
goog.inherits(eYo.Board, eYo.Owned.UI)

Object.defineProperties(eYo.Board.prototype, {
  list: {
    get () {
      return this.list__
    }
  },
  list_: {
    get () {
      return this.list__
    },
    set (newValue) {
      if (newValue != this.list__) {
        this.list__ && this.list__.dispose()
        this.list__ = newValue
      }
    }
  }
})

eYo.Board.prototype.list__ = null

/**
 * Class for a main board.  This is a data structure that contains bricks, has event, undo/redo management...
 * @param {!eYo.Desk} owner The main board belongs to a workspace. We allways have `this === owner.board`, which means that each kind of owner may have only one board.
 * @constructor
 */
eYo.Board.Main = function(owner, options) {
  eYo.Board.Main.superClass_.constructor.call(this, owner, options)
  
  /** @type {string} */
  this.id = eYo.Do.genUid()

  this.change_ = new eYo.Change(this)
  
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

Object.defineProperties(eYo.Board.prototype, {
  /**
   * Convenient property.
   * @readonly
   * @type {eYo.Workspace}
   */
  workspace: {
    get () {
      return this.owner
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
  readOnly: {
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
        eYo.app.hideChaff()
      }
    }
  },
  /**
   * Is this board draggable and scrollable?
   * @type {boolean} True if this board may be dragged.
   */
  draggable: {
    get () {
      return !!this.scrollbar
    }
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
  recover: {
    get () {
      return this.getRecover()
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
   * Return the position of the board origin relative to the application.
   * The board origin is where a brick would render at position (0, 0).
   * It is not the upper left corner of the main window due to various offsets.
   * @return {!eYo.Where} Offset in pixels.
   */
  originInApplication: {
    get () {
      return this.desk.xyElementInDesk(this.dom.svg.canvas_)
    }
  },
  /**
   * the top bricks of the board.
   * Returns a copy or the internal array.
   */
  topBricks: {
    get () {
      return this.list.bricks
    }
  },
  /**
   * the ordered top bricks of the board.
   */
  orderedTopBricks: {
    get () {
      return this.list.bricks
    }
  },
  /**
   * the main bricks of the board.
   */
  mainBricks: {
    get () {
      return this.mainBricks_.slice()
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
  // Stop rerendering.
  this.rendered = false
  this.disposeUI()
  this.cancelMotion()
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
  if (this.scrollbar) {
    this.scrollbar.dispose()
    this.scrollbar = null
  }
  if (this.zoomer_) {
    this.zoomer_.dispose()
    this.zoomer_ = null
  }
  this.disposeUI()
  
  this.metrics_.dispose()
  this.metrics = null
  
  this.change_.dispose()
  this.change_ = null

  this.list_.clear()

  eYo.Magnet.DB.dispose(this)

  this.options = null

  if (this.list_) {
    this.list_.dispose()
    this.list_ = null
  }
  if (this.metrics_) {
    this.metrics_.dispose()
    this.metrics_ = null
  }
  if (this.recover_) {
    this.recover_.dispose()
    this.recover_ = null
  }
  this.highlightedBricks_ = this.owner_ = this.owner_.board_ = null
  this.dispose = eYo.Do.nothing
  eYo.Board.superClass_.constructor.dispose(this)
}

/**
 * Dispose of this board.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Board.Main.prototype.dispose = function() {
  // Stop rerendering.
  this.rendered = false;
  this.cancelMotion()
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
  if (this.scrollbar) {
    this.scrollbar.dispose()
    this.scrollbar = null
  }
  if (this.zoomer_) {
    this.zoomer_.dispose()
    this.zoomer_ = null
  }
  this.disposeUI()
  
  this.metrics_.dispose()
  this.metrics = null
  
  this.change_.dispose()
  this.change_ = null

  this.mainBricks_ = this.draftBricks_ = this.listeners_ = this.owner_ = null
  eYo.Board.Main.superClass_.dispose.call(this)
  this.dispose = eYo.Do.nothing
}

/**
 * Make the UI. Called by the board's owner.
 */
eYo.Board.prototype.makeUI = function() {
  delete this.disposeUI
  this.makeUI = eYo.Do.nothing
  this.ui_driver.boardInit(this)
  var options = this.options
  if (options.hasScrollbars) {
      // Add scrollbar.
    this.scrollbar_ = this.readOnly
      ? new eYo.Scrollbar(
          this,
          false /*this.horizontalLayout_*/,
          false, 'eyo-flyout-scrollbar'
        )
      : new eYo.Scroller(this)
  }
}

/**
 * Dispose the UI related resources.
 */
eYo.Board.prototype.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  delete this.makeUI
  var d = this.ui_driver_
  if (d) {
    d.boardDispose(this)
    this.ui_driver_ = null
  }
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
  // eYo.app.hideChaff()
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
  var bricks = this.topBricks_.slice()
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
  this.list_.clear()
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
  return eYo.Brick.Mgr.create(this, prototypeName, opt_id)
}

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
  return this.list_.getBrickById(id)
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
 * Database of all identified boards.
 * @constructor
 */
eYo.Board.DB = function() {
  this.byID_ = Object.create(null)
}

/**
 * Database of all identified boards.
 * @constructor
 */
eYo.Board.DB.prototype.add = function(board) {
  this.byID_ = Object.create(null)
}

/**
 * Find the main board with the specified ID.
 * @param {string} id ID of board to find.
 * @return {eYo.Board} The sought after board or null if not found.
 */
eYo.Board.DB.byId = function(id) {
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
})

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
 * Resize and reposition all of the board chrome (scrollbars etc.)
 * This should be called when something changes that
 * requires recalculating dimensions and positions of the
 * chromes. (e.g. window layout).
 */
eYo.Board.prototype.layout = function() {
  this.updateMetrics()
  this.place()
  this.scrollbar && this.scrollbar.layout()
}

/**
 * Resize and reposition all of the board chromes (scrollbars etc.)
 * This should be called when something changes that
 * requires recalculating dimensions and positions of the
 * chromes. (e.g. window layout).
 */
eYo.Board.prototype.place = function() {
  this.ui_driver && this.ui_driver.boardPlace(this)
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
  var bricks = this.list.all
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
  this.cancelMotion() // Dragging while pasting?  No.
  var m4t, targetM4t, b3k
  eYo.Events.groupWrap(() => {
    if ((b3k = eYo.Xml.domToBrick(xml, this))) {
      if ((m4t = eYo.Focus.magnet)) {
        if (m4t.isSlot) {
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
          b3k.focusOn()
        }
      } else {
        // Move the duplicate to original position.
        var dx = parseInt(xml.getAttribute('x'), 10)
        var dy = parseInt(xml.getAttribute('y'), 10)
        if (!isNaN(dx) && !isNaN(dy)) {
          // Offset brick until not clobbering another brick and not in connection
          // distance with neighbouring bricks.
          var allBricks = this.list.all
          var avoidCollision = () => {
            do {
              var collide = allBricks.some(b => {
                var xy = b.xy
                if (Math.abs(dx - xy.x) <= 10 &&
                    Math.abs(dy - xy.y) <= 10) {
                  return true
                }
              }) || b3k.getMagnets_(false).some(m4t => {
                  var neighbour = m4t.closest(eYo.Motion.SNAP_RADIUS,
                    eYo.Where.xy(dx, dy))
                  if (neighbour) {
                    return true
                  }
              })
              if (collide) {
                dx += eYo.Motion.SNAP_RADIUS
                dy += eYo.Motion.SNAP_RADIUS * 2
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
        b3k.focusOn().scrollToVisible()
      }
    }
  })
}

/**
 * Is the motion over a delete area (flyout or non-closing flyout)?
 * @param {!eYo.Motion} e Mouse move event.
 * @return {?number} Null if not over a delete area, or an enum representing
 *     which delete area the event is over.
 */
eYo.Board.prototype.inDeleteArea = function(motion) {
  var xy = motion.where
  if (this.deleteRectTrash_ && this.deleteRectTrash_.contains(xy)) {
    return eYo.Motion.DELETE_AREA_TRASH
  }
  if (this.deleteRectFlyout_ && this.deleteRectFlyout_.contains(xy)) {
    return eYo.Motion.DELETE_AREA_TOOLBOX
  }
  return eYo.Motion.DELETE_AREA_NONE
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
  if (this.options.readOnly || this.readOnly) {
    return
  }
  var menuOptions = []
  var topBricks = this.orderedTopBricks
  var eventGroup = eYo.Do.genUid()

  if (this.back_) {
    menuOptions.push(this.back_.undoMenuItemData)
    menuOptions.push(this.back_.redoMenuItemData)
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
    callback: () => {
      this.cancelMotion()
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
    this.list_.add(brick, opt_id)
    this.hasUI && brick.makeUI()
    brick.move()
  })
  this.resizePort()
}

/**
 * Remove a brick from the board.
 * @param {eYo.Brick} brick
 * @param {?Function} f
 */
eYo.Board.prototype.removeBrick = function (brick, f) {
  this.change.wrap(() => {
    this.list.remove(brick)
    f && f(this)
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
  tops = ...distances.map(d => ordered[d])

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
eYo.Board.prototype.eventDidFireChange = function(event) {
  const task = () => {
      this.listeners_.forEach(f => f(event))
    }
  if (this.backer_) {
    this.backer_.eventDidFireChange(event, task)
  } else {
    task()
  }
}
