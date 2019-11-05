/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Workspace model.
 * The desk is the top object containing bricks.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Workspace')

goog.require('eYo.Owned')

goog.forwardDeclare('eYo.Application')
goog.forwardDeclare('eYo.Backer')
goog.forwardDeclare('eYo.Scrollbar')
goog.forwardDeclare('eYo.Options')

goog.forwardDeclare('goog.array');
goog.forwardDeclare('goog.math');

/**
 * Class for a workspace.
 * This is the structure above the boards but below the desk.
 * The workspace has 3+n boards:
 * - the board one where bricks are dropped to be executed,
 * - the 2+n in the flyout,
 * @param {!eYo.Application|Object} owner Owner application.
 * @constructor
 */
eYo.Workspace = function(owner) {
  eYo.Workspace.superClass_.constructor.call(this, owner)
  /** @type {!eYo.Options} */
  var options = this.options_ = new eYo.Options(options || {})
  // Load CSS.
  eYo.Css.inject(options.hasCss, options.pathToMedia)
  this.viewRect_ = new eYo.Rect()
  // create the board
  this.board_ = new eYo.Board.Main(options)
  this.flyout_ = new eYo.Flyout(options)
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
  this.backer_ = new eYo.Backer()
}
goog.inherits(eYo.Workspace, eYo.Owned)

Object.defineProperties(eYo.Workspace.prototype, {
  /**
   * The desk's trashcan (if any).
   * @type {eYo.Trashcan}
   */
  trashcan_: {value: null, writable: true},
  /**
   * The desk's owner (if any).
   * @type {!eYo.Application|Object}
   * @private
   */
  owner: {
    get () {
      return this.owner_
    }
  },
  /**
   * The owned board instance.
   */
  board: {
    /**
     * The board.
     * @return {?eYo.Board.Main} 
     */
    get () {
      return this.board__
    }
  },
  board_: {
    /**
     * The board.
     * @return {?eYo.Board.Main} 
     */
    get () {
      return this.board__
    },
    /**
     * Takes care of ownership
     * @param {?eYo.Board.Main} newValue 
     */
    set (newValue) {
      if (newValue != this.board__) {
        this.board__ && (this.board__.desk_ = null)
        this.board__ = newValue
        newValue && (newValue.desk_ = this)
      }
    }
  },
  /**
   * The flyout.
   * @type {?eYo.Flyout} 
   */
  flyout: {
    get () {
      return this.flyout__
    }
  },
  flyout_: {
    /**
     * The flyout.
     * @return {?eYo.Flyout} 
     */
    get () {
      return this.flyout__
    },
    /**
     * Takes care of ownership
     * @param {?eYo.Flyout} newValue 
     */
    set (newValue) {
      if (newValue != this.flyout__) {
        this.flyout__ && (this.flyout__.owner_ = null)
        this.flyout__ = newValue
        newValue && (newValue.owner_ = this)
      }
    }
  },
  /**
   * The main focus manager
   * @type {eYo.Focus.Main}
   * @private
   */
  focus_: {
    value: null
  },
  /**
   * The main focus manager
   * @type {eYo.Focus.Main}
   * @readonly
   */
  focus: {
    get () {
      return this.focus_
    }
  },
  /**
   * The undo/redo manager
   */
  backer: {
    value: this.backer__
  },
  backer_: {
    get () {
      return this.backer__
    },
    set (newValue) {
      if (this.backer__) {
        this.backer__.owner_ = null
      }
      this.backer__ = newValue
      if (newValue) {
        newValue.owner_ = this
      }
    }
  },
  /**
   * The view rectangle
   */
  viewRect: {
    get () {
      return this.viewRect_.clone
    },
    /**
     * Actually set from a `div` object.
     */
    set (newValue) {
      this.viewRect_.set(newValue)
    }
  },
  options: {
    get () {
      return this.owner.options
    }
  },
})

/**
 * Make the user interface.
 */
eYo.Workspace.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  delete this.deleteUI
  var d = this.ui_driver_ = new eYo.Svg(this)
  d.deskInit(this)
  this.willFlyout_ && this.addFlyout()
  this.board__.makeUI()
  this.flyout__.makeUI()
  this.recordDeleteAreas()
  this.layout()
}

/**
 * Dispose of UI resources.
 */
eYo.Workspace.prototype.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  delete this.makeUI
  this.zoomControls_ && this.zoomControls_.disposeUI()
  this.trashcan && this.trashcan.disposeUI()
  this.board__.disposeUI()
  this.flyout__.disposeUI()
}

/**
 * Dispose of this desk's board.
 */
eYo.Workspace.prototype.dispose = function() {
  this.disposeUI()
  eYo.Property.disposeMany(this, [
    "backer",
    "board",
    "flyout",
    "zoomControls",
    "trashcan",
  ])
  eYo.Workspace.superClass_.constructor.call(this, owner)
}

/**
 * Update metrics. Sent on document's resize and other occasions.
 * The size and location of the view may change due to user interaction,
 * for example a window resize, a pane resize.
 * The driver updates the internal state accordingly.
 * The desk's metrics are supposed to be up to date first, then the
 * other metrics are set up in cascade in next order.
 * 1) the desk injection div is queried for its size and location.
 *    This gives the desk viewRect.
 * 2) Then the board dimensions.
 
 */
eYo.Workspace.prototype.updateMetrics = function() {
  this.ui_driver.deskUpdateMetrics(this)
  this.board__.updateMetrics()
  this.flyout__.updateMetrics()
}

/**
 * Update the metrics and place the components accordingly.
 */
eYo.Workspace.prototype.layout = function() {
  this.updateMetrics()
  this.place()
}

/**
 * Place the boards.
 */
eYo.Workspace.prototype.place = function() {
  this.ui_driver.deskPlace(this)
  this.board__.place()
  this.flyout__.place()
  this.trashcan && this.trashcan.place()
  this.zoomControls_ && this.zoomControls_.place()
}

/**
 * Size the board to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
 * @return {eYo.Where}
 */
eYo.Workspace.prototype.xyElementInWorkspace = function(element) {
  return this.ui_driver_.deskWhereElement(this, element)
}

/**
 * Make a list of all the delete areas for this board.
 */
eYo.Workspace.prototype.recordDeleteAreas = function() {
  if (this.trashcan && this.dom.svg.group_.parentNode) {
    this.deleteRectTrash_ = this.trashcan.getClientRect()
  } else {
    this.deleteRectTrash_ = null
  }
  if (this.flyout__) {
    this.deleteRectFlyout_ = this.flyout__.deleteRect
  } else {
    this.deleteRectFlyout_ = null
  }
}

/**
 * Update items that use screen coordinate calculations
 * because something has changed (e.g. scroll position, window size).
 * @private
 */
eYo.Workspace.prototype.updateScreenCalculations_ = function() {
  this.recordDeleteAreas()
}

/**
 * Forwards to the backer.
 * @param{Boolean} redo  True when redoing, false otherwise
 */
eYo.Workspace.prototype.undo = function(redo) {
  this.backer__.undo(redo)
}


/**
 * Add a flyout.
 * @param {!Object} switcher  See eYo.FlyoutToolbar constructor.
 */
eYo.Workspace.prototype.addFlyout = function(switcher) {
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
eYo.Workspace.prototype.removeFlyout = function() {
  var x = this.flyout_
  if (x) {
    this.flyout_ = null
    this.board_.flyout = null
    x.dispose()
  }
}
