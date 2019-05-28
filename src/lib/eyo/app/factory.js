/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Factory model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Factory')

goog.require('eYo')

goog.forwardDeclare('goog.array');
goog.forwardDeclare('goog.math');

goog.forwardDeclare('eYo.Desktop')


/**
 * Class for a factory.
 * This is the structure above the workspace and the flyout.
 * @param {?Object=} options Dictionary of options.
 * @constructor
 */
eYo.Factory = function(options) {
  /** @type {!Blockly.Options} */
  options = new Blockly.Options(options || {})
  // Load CSS.
  Blockly.Css.inject(options.hasCss, options.pathToMedia)
  this.options_ = options
  this.audio_ = new eYo.Audio(options.pathToMedia)
}

/**
 * Class for a factory. This is the structure above the workspace.
 * @param {?Blockly.Options=} options Dictionary of options.
 * @constructor
 */
eYo.Factory.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  this.ui_driver = new eYo.Svg(this)
}

/**
 * Class for a factory. This is the structure above the workspace.
 * @param {?Blockly.Options=} options Dictionary of options.
 * @constructor
 */
eYo.Factory.prototype.disposeUI = function() {
  delete this.makeUI
  this.ui_driver = null
}

/**
 * Dispose of this factory.
 */
eYo.Factory.prototype.dispose = function() {
  // Stop rerendering.
  this.rendered = false;
  if (this.currentGesture_) {
    this.currentGesture_.cancel();
  }
  this.listeners_.length = 0;
  this.clear();
  if (this.dragger_) {
    this.dragger_.dispose()
    this.dragger_ = null
  }
  // Remove from factory database.
  delete eYo.Factory.FactoryDB_[this.id];
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

  if (this.audioManager_) {
    this.audioManager_.dispose()
    this.audioManager_ = null
  }

  if (this.flyoutButtonCallbacks_) {
    this.flyoutButtonCallbacks_ = null;
  }
  if (!this.options.parentFactory) {
    // Top-most factory.  Dispose of the div that the
    // SVG is injected into (i.e. injectionDiv).
    goog.dom.removeNode(this.getParentSvg().parentNode);
  }
};

/**
 * Make the UI.
 */
eYo.Factory.prototype.makeUI = function(container) {
  var options = this.options
  if (container) {
    options.container = container
  } else {
    container = options.container
  }
  // no UI if no valid container
  if (goog.isString(container)) {
    options.container = document.getElementById(container) ||
        document.querySelector(container)
  }
  if (!goog.dom.contains(document, options.container)) {
    throw 'Error: container is not in current document.'
  }
  this.makeUI = eYo.Do.nothing
  var d = this.ui_driver_ = new eYo.Svg()
  d.factoryInit(this)
  var bottom = Blockly.Scrollbar.scrollbarThickness
  if (options.hasTrashcan) {
    this.trashcan = new eYo.Trashcan(this, bottom)
    bottom = this.trashcan.top
  }
  if (options.zoomOptions && options.zoomOptions.controls) {
    this.zoomControls_ = new eYo.ZoomControls(this, bottom)
    return this.zoomControls_.top
  }
  this.recordDeleteAreas()
}

/**
 * Dispose the UI related resources.
 */
eYo.Factory.prototype.disposeUI = function() {
  this.zoomControls_ && this.zoomControls_.disposeUI()
  this.trashcan && this.trashcan.disposeUI()
  var d = this.ui_driver_
  if (d) {
    d.factoryDispose(this)
  }
  this.ui_driver_ = null
}

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias.  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
eYo.Factory.SCAN_ANGLE = 3

/**
 * Finds the top-level blocks and returns them.  Blocks are optionally sorted
 * by position; top to bottom.
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!eYo.Brick>} The top-level block objects.
 */
eYo.Factory.prototype.getTopBricks = function(ordered) {
  // Copy the topBricks_ list.
  var bricks = [].concat(this.topBricks_);
  if (ordered && bricks.length > 1) {
    var offset = Math.sin(goog.math.toRadians(eYo.Factory.SCAN_ANGLE));
    bricks.sort(function(a, b) {
      var aXY = a.xyInFactory
      var bXY = b.xyInFactory
      return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x)
    })
  }
  return bricks
}

/**
 * Find all blocks in factory.  No particular order.
 * @return {!Array.<!eYo.Brick>} Array of bricks.
 */
eYo.Factory.prototype.getAllBricks = function() {
  var bricks = this.getTopBricks(false)
  for (var i = 0; i < bricks.length; i++) {
    bricks.push.apply(bricks, bricks[i].getChildren())
  }
  return bricks
}

/**
 * Dispose of all blocks in factory.
 */
eYo.Factory.prototype.clear = function() {
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
eYo.Factory.prototype.newBrick = function (prototypeName, opt_id) {
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
eYo.Factory.prototype.newBlock = eYo.Factory.prototype.newBrick

/**
 * The number of blocks that may be added to the factory before reaching
 *     the maxBlocks.
 * @return {number} Number of blocks left.
 */
eYo.Factory.prototype.remainingCapacity = function() {
  if (isNaN(this.options.maxBlocks)) {
    return Infinity;
  }
  return this.options.maxBlocks - this.getAllBricks().length;
};

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.Factory.prototype.undo = function(redo) {
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
eYo.Factory.prototype.clearUndo = function() {
  this.undoStack_.length = 0;
  this.redoStack_.length = 0;
  // Stop any events already in the firing queue from being undoable.
  Blockly.Events.clearPendingUndo()
  eYo.App.didClearUndo && eYo.App.didClearUndo()
};

/**
 * When something in this factory changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Function} Function that can be passed to
 *     removeChangeListener.
 */
eYo.Factory.prototype.addChangeListener = function(func) {
  this.listeners_.push(func);
  return func;
};

/**
 * Stop listening for this factory's changes.
 * @param {Function} func Function to stop calling.
 */
eYo.Factory.prototype.removeChangeListener = function(func) {
  goog.array.remove(this.listeners_, func);
};

/**
 * Fire a change event.
 * @param {!Blockly.Events.Abstract} event Event to fire.
 */
eYo.Factory.prototype.fireChangeListener = function(event) {
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
 * Find the block on this factory with the specified ID.
 * Wrapped bricks have a complex id.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The sought after block or null if not found.
 */
eYo.Factory.prototype.getBlockById = eYo.Factory.prototype.getBrickById = function(id) {
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
 * Checks whether all value and statement inputs in the factory are filled
 * with blocks.
 * @param {boolean=} opt_shadowBlocksAreFilled An optional argument controlling
 *     whether shadow blocks are counted as filled. Defaults to true.
 * @return {boolean} True if all inputs are filled, false otherwise.
 */
eYo.Factory.prototype.allInputsFilled = function(opt_shadowBlocksAreFilled) {
  var blocks = this.getTopBricks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (!block.allInputsFilled(opt_shadowBlocksAreFilled)) {
      return false;
    }
  }
  return true;
}

/**
 * Database of all factorys.
 * @private
 */
eYo.Factory.FactoryDB_ = Object.create(null);

/**
 * Find the factory with the specified ID.
 * @param {string} id ID of factory to find.
 * @return {eYo.Factory} The sought after factory or null if not found.
 */
eYo.Factory.getById = function(id) {
  return eYo.Factory.FactoryDB_[id] || null;
};

// Export symbols that would otherwise be renamed by Closure compiler.
eYo.Factory.prototype['clear'] = eYo.Factory.prototype.clear;
eYo.Factory.prototype['clearUndo'] =
    eYo.Factory.prototype.clearUndo;
eYo.Factory.prototype['addChangeListener'] =
    eYo.Factory.prototype.addChangeListener;
eYo.Factory.prototype['removeChangeListener'] =
    eYo.Factory.prototype.removeChangeListener;

/**
 * The render status of an SVG factory.
 * Returns `true` for visible factorys and `false` for non-visible,
 * or headless, factorys.
 * @type {boolean}
 */
eYo.Factory.prototype.rendered = true;

/**
 * Is this factory the surface for a mutator?
 * @type {boolean}
 * @package
 */
eYo.Factory.prototype.isMutator = false;

/**
 * Whether this factory has resizes enabled.
 * Disable during batch operations for a performance improvement.
 * @type {boolean}
 * @private
 */
eYo.Factory.prototype.resizesEnabled_ = true;

/**
 * Current horizontal scrolling offset in pixel units.
 * @type {number}
 */
eYo.Factory.prototype.scrollX = 0;

/**
 * Current vertical scrolling offset in pixel units.
 * @type {number}
 */
eYo.Factory.prototype.scrollY = 0;

/**
 * Horizontal scroll value when scrolling started in pixel units.
 * @type {number}
 */
eYo.Factory.prototype.startScrollX = 0;

/**
 * Vertical scroll value when scrolling started in pixel units.
 * @type {number}
 */
eYo.Factory.prototype.startScrollY = 0;

/**
 * Distance from mouse to object being dragged.
 * @type {goog.math.Coordinate}
 * @private
 */
eYo.Factory.prototype.dragDeltaXY_ = null;

/**
 * Current scale.
 * @type {number}
 */
eYo.Factory.prototype.scale = 1;

/**
 * The factory's trashcan (if any).
 * @type {Blockly.Trashcan}
 */
eYo.Factory.prototype.trashcan = null;

/**
 * This factory's scrollbars, if they exist.
 * @type {Blockly.ScrollbarPair}
 */
eYo.Factory.prototype.scrollbar = null;

/**
 * The current gesture in progress on this factory, if any.
 * @type {Blockly.TouchGesture}
 * @private
 */
eYo.Factory.prototype.currentGesture_ = null;

/**
 * This factory's surface for dragging blocks, if it exists.
 * @type {eYo.Svg.BrickDragSurface}
 * @private
 */
eYo.Factory.prototype.brickDragSurface_ = null;

/**
 * Last known position of the page scroll.
 * This is used to determine whether we have recalculated screen coordinate
 * stuff since the page scrolled.
 * @type {!goog.math.Coordinate}
 * @private
 */
eYo.Factory.prototype.lastRecordedPageScroll_ = null;

/**
 * Map from function names to callbacks, for deciding what to do when a button
 * is clicked.
 * @type {!Object.<string, function(!Blockly.FlyoutButton)>}
 * @private
 */
eYo.Factory.prototype.flyoutButtonCallbacks_ = {};

/**
 * Developers may define this function to add custom menu options to the
 * factory's context menu or edit the factory-created set of menu options.
 * @param {!Array.<!Object>} options List of menu options to add to.
 */
eYo.Factory.prototype.configureContextMenu = null;

/**
 * In a flyout, the target factory where blocks should be placed after a drag.
 * Otherwise null.
 * @type {?eYo.Factory}
 * @package
 */
eYo.Factory.prototype.targetSpace = null;

/**
 * Inverted screen CTM, for use in mouseToSvg.
 * @type {SVGMatrix}
 * @private
 */
eYo.Factory.prototype.inverseScreenCTM_ = null;

/**
 * Getter for the inverted screen CTM.
 * @return {SVGMatrix} The matrix to use in mouseToSvg
 */
eYo.Factory.prototype.getInverseScreenCTM = function() {
  return this.inverseScreenCTM_;
};

/**
 * Update the inverted screen CTM.
 */
eYo.Factory.prototype.updateInverseScreenCTM = function() {
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
eYo.Factory.prototype.getSvgXY = function(element) {
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
 * Return the position of the factory origin relative to the injection div
 * origin in pixels.
 * The factory origin is where a block would render at position (0, 0).
 * It is not the upper left corner of the factory SVG.
 * @return {!goog.math.Coordinate} Offset in pixels.
 * @package
 */
eYo.Factory.prototype.getOriginOffsetInPixels = function() {
  return Blockly.utils.getInjectionDivXY_(this.dom.svg.canvas_)
}

/**
 * Save resize handler data so we can delete it later in dispose.
 * @param {!Array.<!Array>} handler Data that can be passed to unbindEvent.
 */
eYo.Factory.prototype.setResizeHandlerWrapper = function(handler) {
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
eYo.Factory.prototype.newBlock = function(prototypeName, opt_id) {
  return new Blockly.BlockSvg(this, prototypeName, opt_id);
}

/**
 * Add a flyout element in an element with the given tag name.
 * @param {!Object} switcher  See eYo.FlyoutToolbar constructor.
 */
eYo.Factory.prototype.addFlyout = function(switcher) {
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
 * Getter for the flyout associated with this factory.  This flyout may be
 * owned by either the toolbox or the factory, depending on toolbox
 * configuration.  It will be null if there is no flyout.
 * @return {Blockly.Flyout} The flyout on this factory.
 * @package
 */
eYo.Factory.prototype.getFlyout_ = function() {
  return this.flyout_
}

/**
 * Update items that use screen coordinate calculations
 * because something has changed (e.g. scroll position, window size).
 * @private
 */
eYo.Factory.prototype.updateScreenCalculations_ = function() {
  this.updateInverseScreenCTM();
  this.recordDeleteAreas();
};

/**
 * If enabled, resize the parts of the factory that change when the factory
 * contents (e.g. block positions) change.  This will also scroll the
 * factory contents if needed.
 * @package
 */
eYo.Factory.prototype.resizeContents = function() {
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
 * Resize and reposition all of the factory chrome (toolbox,
 * trash, scrollbars etc.)
 * This should be called when something changes that
 * requires recalculating dimensions and positions of the
 * trash, zoom, toolbox, etc. (e.g. window resize).
 */
eYo.Factory.prototype.resize = function() {
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
 * Resizes and repositions factory chrome if the page has a new
 * scroll position.
 * @package
 */
eYo.Factory.prototype.updateScreenCalculationsIfScrolled =
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
eYo.Factory.prototype.getCanvas = function() {
  return this.svgBlockCanvas_;
};

/**
 * Get the SVG element that contains this factory.
 * @return {Element} SVG element.
 */
eYo.Factory.prototype.getParentSvg = function() {
  if (this.cachedParentSvg_) {
    return this.cachedParentSvg_;
  }
  var element = this.dom.svg.group_
  while (element) {
    if (element.tagName == 'svg') {
      return (this.cachedParentSvg_ = element)
    }
    element = element.parentNode
  }
  return null
}

/**
 * Translate this factory to new coordinates.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
eYo.Factory.prototype.translate = function(x, y) {
  this.dragger.translate(x, y)
  // Now update the block drag surface if we're using one.
  if (this.brickDragSurface_) {
    this.brickDragSurface_.translateAndScaleGroup(x, y, this.scale)
  }
}

/**
 * Translate this factory to new coordinates.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
eYo.Factory.prototype.canvasMoveTo = function(x, y) {
  this.ui_driver.factoryCanvasMoveTo(this, x, y)
}

/**
 * Returns the horizontal offset of the factory.
 * @return {number} Width.
 */
eYo.Factory.prototype.getWidth = function() {
  var metrics = this.getMetrics();
  return metrics ? metrics.viewWidth / this.scale : 0;
}

/**
 * Toggles the visibility of the factory.
 * Currently only intended for main factory.
 * @param {boolean} isVisible True if factory should be visible.
 */
eYo.Factory.prototype.setVisible = function(isVisible) {

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
 * Render all blocks in factory.
 */
eYo.Factory.prototype.render = function() {
  // Generate list of all blocks.
  var blocks = this.getAllBricks();
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
eYo.Factory.prototype.traceOn = function() {
  console.warn('Deprecated call to traceOn, delete this.');
};

/**
 * Highlight or unhighlight a block in the factory.  Block highlighting is
 * often used to visually mark blocks currently being executed.
 * @param {?string} id ID of block to highlight/unhighlight,
 *   or null for no block (used to unhighlight all blocks).
 * @param {boolean=} opt_state If undefined, highlight specified block and
 * automatically unhighlight all others.  If true or false, manually
 * highlight/unhighlight the specified block.
 */
eYo.Factory.prototype.highlightBlock = function(id, opt_state) {
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
 * Paste the provided block onto the factory.
 * @param {!Element} xmlBlock XML block element.
 */
eYo.Factory.prototype.paste = function (dom) {
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
            var xy = targetM4t.ui.xyInFactory
            var xx = targetM4t.x + xy.x
            var yy = targetM4t.y + xy.y
            xy = m4t.ui.xyInFactory
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
          var allBlocks = this.getAllBricks()
          var avoidCollision = () => {
            do {
              var collide = allBlocks.some(b => {
                var xy = b.ui.xyInFactory
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
 * Make a list of all the delete areas for this factory.
 */
eYo.Factory.prototype.recordDeleteAreas = function() {
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
eYo.Factory.prototype.isDeleteArea = function(e) {
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
eYo.Factory.prototype.onMouseDown_ = function(e) {
  var gesture = this.getGesture(e)
  if (gesture) {
    gesture.handleWsStart(e, this);
  }
};

/**
 * Start tracking a drag of an object on this factory.
 * @param {!Event} e Mouse down event.
 * @param {!goog.math.Coordinate} xy Starting location of object.
 */
eYo.Factory.prototype.startDrag = function(e, xy) {
  var point = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  this.dragDeltaXY_ = goog.math.Coordinate.difference(xy, point);
};

/**
 * Track a drag of an object on this factory.
 * @param {!Event} e Mouse move event.
 * @return {!goog.math.Coordinate} New location of object.
 */
eYo.Factory.prototype.moveDrag = function(e) {
  var point = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  return goog.math.Coordinate.sum(this.dragDeltaXY_, point);
};

/**
 * Is the user currently dragging a block or scrolling the flyout/factory?
 * @return {boolean} True if currently dragging or scrolling.
 */
eYo.Factory.prototype.isDragging = function() {
  return this.currentGesture_ != null && this.currentGesture_.isDragging();
}

/**
 * Calculate the bounding box for the blocks on the factory.
 * Coordinate system: factory coordinates.
 *
 * @return {Object} Contains the position and size of the bounding box
 *   containing the blocks on the factory.
 */
eYo.Factory.prototype.getBlocksBoundingBox = function() {
  var topBlocks = this.getTopBricks(false);
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
 * Clean up the factory by ordering all the blocks in a column.
 */
eYo.Factory.prototype.cleanUp = function() {
    this.setResizesEnabled(false)
  Blockly.Events.setGroup(true)
  var cursorY = 0
  this.getTopBricks(true).forEach(brick => {
    var xy = brick.ui.xyInFactory
    brick.ui.moveBy(-xy.x, cursorY - xy.y)
    block.ui.snapToGrid()
    cursorY = brick.ui.xyInFactory.y +
        brick.size.height + eYo.Unit.y
  })
  Blockly.Events.setGroup(false)
  this.setResizesEnabled(true)
}
   

/**
 * Show the context menu for the factory.
 * @param {!Event} e Mouse event.
 * @private
 * @suppress{accessControls}
 */
eYo.Factory.prototype.showContextMenu_ = function (e) {
  if (this.options.readOnly || this.isFlyout) {
    return
  }
  var menuOptions = []
  var topBlocks = this.getTopBricks(true)
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
      if (block.factory) {
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
 * Mark this factory as the currently focused main factory.
 */
eYo.Factory.prototype.markFocused = function() {
  if (this.options.parentFactory) {
    this.options.parentFactory.markFocused();
  } else {
    Blockly.mainFactory = this;
    // We call e.preventDefault in many event handlers which means we
    // need to explicitly grab focus (e.g from a textarea) because
    // the browser will not do it for us.  How to do this is browser dependant.
    this.setBrowserFocus();
  }
};

/**
 * Set the factory to have focus in the browser.
 * @private
 */
eYo.Factory.prototype.setBrowserFocus = function() {
  // Blur whatever was focused since explcitly grabbing focus below does not
  // work in Edge.
  if (document.activeElement) {
    document.activeElement.blur();
  }
  try {
    // Focus the factory SVG - this is for Chrome and Firefox.
    this.getParentSvg().focus();
  } catch (e) {
    // IE and Edge do not support focus on SVG elements. When that fails
    // above, get the injectionDiv (the factory's parent) and focus that
    // instead.  This doesn't work in Chrome.
    try {
      // In IE11, use setActive (which is IE only) so the page doesn't scroll
      // to the factory gaining focus.
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
eYo.Factory.prototype.zoom = function(x, y, amount) {
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
eYo.Factory.prototype.zoomCenter = function(type) {
  var metrics = this.getMetrics()
  var x = metrics.viewWidth / 2
  var y = metrics.viewHeight / 2
  this.zoom(x, y, type)
};

/**
 * Zoom the blocks to fit in the factory if possible.
 */
eYo.Factory.prototype.zoomToFit = function() {
  var metrics = this.getMetrics();
  var blocksBox = this.getBlocksBoundingBox();
  var blocksWidth = blocksBox.width;
  var blocksHeight = blocksBox.height;
  if (!blocksWidth) {
    return;  // Prevents zooming to infinity.
  }
  var factoryWidth = metrics.viewWidth;
  var factoryHeight = metrics.viewHeight;
  if (this.flyout_) {
    factoryWidth -= this.flyout_.width_;
  }
  if (!this.scrollbar) {
    // Origin point of 0,0 is fixed, blocks will not scroll to center.
    blocksWidth += metrics.contentLeft;
    blocksHeight += metrics.contentTop;
  }
  var ratioX = factoryWidth / blocksWidth;
  var ratioY = factoryHeight / blocksHeight;
  this.setScale(Math.min(ratioX, ratioY));
  this.scrollCenter();
};

/**
 * Center the factory.
 */
eYo.Factory.prototype.scrollCenter = function() {
  if (!this.scrollbar) {
    // Can't center a non-scrolling factory.
    console.warn('Tried to scroll a non-scrollable factory.');
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
 * Scroll the factory to center on the given block.
 * @param {?string} id ID of block center on.
 * @public
 */
eYo.Factory.prototype.centerOnBlock = function(id) {
  if (!this.scrollbar) {
    console.warn('Tried to scroll a non-scrollable factory.');
    return;
  }

  var block = this.getBlockById(id);
  if (!block) {
    return;
  }

  // XY is in factory coordinates.
  var xy = block.xyInFactory;
  // Height/width is in factory units.
  var heightWidth = block.getHeightWidth();

  // Find the enter of the block in factory units.
  var blockCenterY = xy.y + heightWidth.height / 2;

  var blockCenterX = xy.x + heightWidth.width / 2;

  // Factory scale, used to convert from factory coordinates to pixels.
  var scale = this.scale;

  // Center in pixels.  0, 0 is at the factory origin.  These numbers may
  // be negative.
  var pixelX = blockCenterX * scale;
  var pixelY = blockCenterY * scale;

  var metrics = this.getMetrics();

  // Scrolling to here would put the block in the top-left corner of the
  // visible factory.
  var scrollToBlockX = pixelX - metrics.contentLeft;
  var scrollToBlockY = pixelY - metrics.contentTop;

  // viewHeight and viewWidth are in pixels.
  var halfViewWidth = metrics.viewWidth / 2;
  var halfViewHeight = metrics.viewHeight / 2;

  // Put the block in the center of the visible factory instead.
  var scrollToCenterX = scrollToBlockX - halfViewWidth;
  var scrollToCenterY = scrollToBlockY - halfViewHeight;

  Blockly.hideChaff();
  this.scrollbar.set(scrollToCenterX, scrollToCenterY);
};

/**
 * Set the factory's zoom factor.
 * @param {number} newScale Zoom factor.
 */
eYo.Factory.prototype.setScale = function(newScale) {
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
}

/**
 * Get the content dimensions of the given factory, taking into account
 * whether or not it is scrollable and what size the factory div is on screen.
 * @param {!eYo.Factory} ws The factory to measure.
 * @param {!Object} svgSize An object containing height and width attributes in
 *     CSS pixels.  Together they specify the size of the visible factory, not
 *     including areas covered up by the toolbox.
 * @return {!Object} The dimensions of the contents of the given factory, as
 *     an object containing at least
 *     - height and width in pixels
 *     - left and top in pixels relative to the factory origin.
 * @private
 */
eYo.Factory.getContentDimensions_ = function(ws, svgSize) {
  if (ws.scrollbar) {
    return eYo.Factory.getContentDimensionsBounded_(ws, svgSize);
  } else {
    return eYo.Factory.getContentDimensionsExact_(ws);
  }
};

/**
 * Get the bounding box for all factory contents, in pixels.
 * @param {!eYo.Factory} ws The factory to inspect.
 * @return {!Object} The dimensions of the contents of the given factory, as
 *     an object containing
 *     - height and width in pixels
 *     - left, right, top and bottom in pixels relative to the factory origin.
 * @private
 */
eYo.Factory.getContentDimensionsExact_ = function(ws) {
  // Block bounding box is in factory coordinates.
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
 * Calculate the size of a scrollable factory, which should include room for a
 * half screen border around the factory contents.
 * @param {!eYo.Factory} ws The factory to measure.
 * @param {!Object} svgSize An object containing height and width attributes in
 *     CSS pixels.  Together they specify the size of the visible factory, not
 *     including areas covered up by the toolbox.
 * @return {!Object} The dimensions of the contents of the given factory, as
 *     an object containing
 *     - height and width in pixels
 *     - left and top in pixels relative to the factory origin.
 * @private
 */
eYo.Factory.getContentDimensionsBounded_ = function(ws, svgSize) {
  var content = eYo.Factory.getContentDimensionsExact_(ws);

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
 * top level factory.  The following properties are computed:
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
 * TODO: rename/refactor to clearly make the difference between
 * vue coordinates and factory coordinates.
 * @return {!Object} Contains size and position metrics of a top level
 *   factory.
 * @private
 * @this eYo.Factory
 */
eYo.Factory.getTopLevelFactoryMetrics_ = function() {

  // Contains height and width in CSS pixels.
  // svgSize is equivalent to the size of the injectionDiv at this point.
  var svgSize = Blockly.svgSize(this.getParentSvg());

  // svgSize is now the space taken up by the Blockly factory, not including
  // the toolbox.
  var contentDimensions =
      eYo.Factory.getContentDimensions_(this, svgSize);

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

    flyoutWidth: this.flyout_.width,
    flyoutHeight: this.flyout_.height,

    flyoutAnchor: this.flyout_.anchor
  };
  return metrics;
};

/**
 * Sets the X/Y translations of a top level factory to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 * @this eYo.Factory
 */
eYo.Factory.setTopLevelFactoryMetrics_ = function(xyRatio) {
  if (!this.scrollbar) {
    throw 'Attempt to set top level factory scroll without scrollbars.';
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
 * Update whether this factory has resizes enabled.
 * If enabled, factory will resize when appropriate.
 * If disabled, factory will not resize until re-enabled.
 * Use to avoid resizing during a batch operation, for performance.
 * @param {boolean} enabled Whether resizes should be enabled.
 */
eYo.Factory.prototype.setResizesEnabled = function(enabled) {
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
eYo.Factory.prototype.registerButtonCallback = function(key, func) {
  goog.asserts.assert(goog.isFunction(func),
      'Button callbacks must be functions.')
  this.flyoutButtonCallbacks_[key] = func
}

/**
 * Get the callback function associated with a given key, for clicks on buttons
 * and labels in the flyout.
 * @param {string} key The name to use to look up the function.
 * @return {?function(!Blockly.FlyoutButton)} The function corresponding to the
 *     given key for this factory; null if no callback is registered.
 */
eYo.Factory.prototype.getButtonCallback = function(key) {
  var result = this.flyoutButtonCallbacks_[key]
  return result ? result : null
}

/**
 * Remove a callback for a click on a button in the flyout.
 * @param {string} key The name associated with the callback function.
 */
eYo.Factory.prototype.removeButtonCallback = function(key) {
  this.flyoutButtonCallbacks_[key] = null
}

/**
 * Look up the gesture that is tracking this touch stream on this factory.
 * May create a new gesture.
 * @param {!Event} e Mouse event or touch event.
 * @return {Blockly.TouchGesture} The gesture that is tracking this touch
 *     stream, or null if no valid gesture exists.
 * @package
 */
eYo.Factory.prototype.getGesture = function(e) {
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

  // No gesture existed on this factory, but this looks like the start of a
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
eYo.Factory.prototype.clearGesture = function() {
  this.currentGesture_ = null
}

/**
 * Cancel the current gesture, if one exists.
 * @package
 */
eYo.Factory.prototype.cancelCurrentGesture = function() {
  if (this.currentGesture_) {
    this.currentGesture_.cancel()
  }
}

/**
 * Get the audio manager for this factory.
 * @return {Blockly.FactoryAudio} The audio manager for this factory.
 */
eYo.Factory.prototype.getAudioManager = function() {
  return this.audioManager_
};
   
// Export symbols that would otherwise be renamed by Closure compiler.
eYo.Factory.prototype['setVisible'] =
    eYo.Factory.prototype.setVisible

eYo.Factory.prototype.logAllConnections = function (comment) {
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
 * Convert a coordinate object from pixels to factory units.
 * @param {!goog.math.Coordinate} pixelCoord  A coordinate with x and y values
 *     in css pixel units.
 * @return {!goog.math.Coordinate} The input coordinate divided by the factory
 *     scale.
 * @private
 */
eYo.Factory.prototype.fromPixelUnit = function(xy) {
  return new goog.math.Coordinate(xy.x / this.scale, xy.y / this.scale)
}

/**
 *
 */
eYo.Factory.prototype.getRecover = (() => {
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
eYo.Factory.prototype.driverCreate = function () {
  return new eYo.Svg()
}

/**
 * Add the nodes from string to the factory.
 * Usefull for testing? -> commonn test methods.
 * @param {!String} str
 * @return {Array.<string>} An array containing new block IDs.
 */
eYo.Factory.prototype.fromDom = function (dom) {
  return dom &&(eYo.Xml.domToFactory(dom, this))
}

/**
 * Add the nodes from string to the factory.
 * @param {!String} str
 * @return {Array.<string>} An array containing new block IDs.
 */
eYo.Factory.prototype.fromString = function (str) {
  var parser = new DOMParser()
  var dom = parser.parseFromString(str, 'application/xml')
  return this.fromDom(dom)
}


/**
 * Convert the factory to string.
 * @param {?Object} opt  See eponym parameter in `eYo.Xml.brickToDom`.
 */
eYo.Factory.prototype.toDom = function (opt) {
  return eYo.Xml.factoryToDom(this, opt)
}

/**
 * Convert the factory to string.
 * @param {?Boolean} opt_noId
 */
eYo.Factory.prototype.toString = function (opt_noId) {
  let oSerializer = new XMLSerializer()
  return oSerializer.serializeToString(this.toDom())
}

/**
 * Convert the factory to UTF8 byte array.
 * @param {?Boolean} opt_noId
 */
eYo.Factory.prototype.toUTF8ByteArray = function (opt_noId) {
  var s = '<?xml version="1.0" encoding="utf-8"?>\n' + this.toString(optNoId)
  return goog.crypt.toUTF8ByteArray(s)
}

/**
 * Add the nodes from UTF8 string representation to the factory. UNUSED.
 * @param {!Array} bytes
 * @return {Array.<string>} An array containing new block IDs.
 */
eYo.Factory.prototype.fromUTF8ByteArray = function (bytes) {
  var str = goog.crypt.utf8ByteArrayToString(bytes)
  return str && (this.fromString(str))
}


/**
 * Add a brick to the factory.
 * @param {eYo.Brick} brick
 * @param {String} opt_id
 */
eYo.Factory.prototype.addBrick = function (brick, opt_id) {
  brick.id = (opt_id && !this.getBlockById(opt_id)) ?
  opt_id : Blockly.utils.genUid()
  this.hasUI && brick.makeUI()
  this.topBricks_.push(brick)
  this.brickDB_[brick.id] = brick
}


/**
 * Add a brick to the factory.
 * @param {eYo.Brick} brick
 */
eYo.Factory.prototype.removeBrick = function (brick) {
  this.removeTopBrick(brick)
  // Remove from factory
  this.brickDB_[brick.id]
}

/**
 * Tidy up the nodes.
 * @param {?Object} kvargs  key value arguments
 * IN PROGRESS
eYo.Factory.prototype.tidyUp = function (kvargs) {
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
      xy: b3k.ui.xyInFactory
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
 * Scroll the factory to center on the given block.
 * @param {?string} id ID of block center on.
 * @public
 */
eYo.Factory.prototype.scrollBlockTopLeft = function(id) {
  if (!this.scrollbar) {
    console.warn('Tried to scroll a non-scrollable factory.');
    return;
  }
  var brick = this.getBrickById(id);
  if (!brick) {
    return;
  }
  if (!brick.isStmt) {
    brick = brick.stmtParent || brick.root
  }
  // XY is in factory coordinates.
  var xy = brick.ui.xyInFactory

  // Find the top left of the block in factory units.
  var y = xy.y - eYo.Unit.y / 2

  var x = xy.x - eYo.Unit.x / 2 - brick.depth * eYo.Span.tabWidth

  // Factory scale, used to convert from factory coordinates to pixels.
  var scale = this.scale;

  // Center in pixels.  0, 0 is at the factory origin.  These numbers may
  // be negative.
  var pixelX = x * scale;
  var pixelY = y * scale;

  var metrics = this.getMetrics()

  // Scrolling to here will put the block in the top-left corner of the
  // visible factory.
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
  var factory = this.factory_
  var flyout = factory.flyout_
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
  
  // Horizontal toolbar should always be just above the bottom of the factory.
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
  var factory = this.factory_
  var flyout = factory.flyout_
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
