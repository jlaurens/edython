/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Desk model.
 * The desk is the top object containing bricks.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Desk')

goog.require('eYo')

goog.forwardDeclare('goog.array');
goog.forwardDeclare('goog.math');

goog.forwardDeclare('eYo.Desktop')
goog.forwardDeclare('eYo.Backer')
goog.forwardDeclare('eYo.Scrollbar')
goog.forwardDeclare('eYo.Options')

/**
 * Class for a desk.
 * This is the structure above the boards but below the desktop.
 * The desk has 3 boards:
 * - the main one where bricks are dropped to be executed,
 * - the flyout one from which the bricks are dragged,
 * - the draft one, which serves as a draft...
 * @param {?Object=} options Dictionary of options.
 * @constructor
 */
eYo.Desk = function(options) {
  /** @type {!eYo.Options} */
  this.options_ = options = new eYo.Options(options || {})
  // Load CSS.
  eYo.Css.inject(options.hasCss, options.pathToMedia)
  this.viewRect_ = new eYo.Rect()
  // create the main board
  this.main_ = new eYo.Board.Main(options)
  this.draft_ = new eYo.Board.Draft(options)
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

/**
 * The desk's owner (if any).
 * @type {eYo.Desktop}
 */
eYo.Desk.prototype.owner_ = null
  
/**
 * The desk's trashcan (if any).
 * @type {eYo.Trashcan}
 */
eYo.Desk.prototype.trashcan_ = null

Object.defineProperties(eYo.Desk.prototype, {
  /**
   * The owned main board instance.
   */
  main: {
    /**
     * The main board.
     * @return {?eYo.Board.Main} 
     */
    get () {
      return this.main__
    }
  },
  main_: {
    /**
     * The main board.
     * @return {?eYo.Board.Main} 
     */
    get () {
      return this.main__
    },
    /**
     * Takes care of ownership
     * @param {?eYo.Board.Main} newValue 
     */
    set (newValue) {
      if (newValue != this.main__) {
        this.main__ && (this.main__.desk_ = null)
        this.main__ = newValue
        newValue && (newValue.desk_ = this)
      }
    }
  },
  draft: {
    /**
     * The draft board.
     * @return {?eYo.Board.Draft} 
     */
    get () {
      return this.draft__
    }
  },
  draft_: {
    /**
     * The draft board.
     * @return {?eYo.Board.Draft} 
     */
    get () {
      return this.draft__
    },
    /**
     * Takes care of ownership
     * @param {?eYo.Board.Draft} newValue 
     */
    set (newValue) {
      if (newValue != this.draft__) {
        this.draft__ && (this.draft__.desk_ = null)
        this.draft__ = newValue
        newValue && (newValue.desk_ = this)
      }
    }
  },
  flyout: {
    /**
     * The flyout.
     * @return {?eYo.Flyout} 
     */
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
        this.flyout__ && (this.flyout__.desk_ = null)
        this.flyout__ = newValue
        newValue && (newValue.desk_ = this)
      }
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
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
  ui_driver: {
    get () {
      return this.ui_driver_
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
  /**
   * The owned audio manager.
   */
  audio: {
    get () {
      return this.audio_
    }
  },
  options: {
    get () {
      return this.options_
    }
  },
})

/**
 * Make the user interface.
 */
eYo.Desk.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  delete this.deleteUI
  this.audio_ = new eYo.Audio(this.options.pathToMedia)
  var d = this.ui_driver_ = new eYo.Svg(this)
  d.deskInit(this)
  this.willFlyout_ && this.addFlyout()
  this.main__.makeUI()
  this.draft__.makeUI()
  this.flyout__.makeUI()
  this.recordDeleteAreas()
  this.layout()
}

/**
 * Dispose of UI resources.
 */
eYo.Desk.prototype.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  delete this.makeUI
  this.ui_driver_ && this.ui_driver_.dispose()
  this.ui_driver_ = null
  this.zoomControls_ && this.zoomControls_.disposeUI()
  this.trashcan && this.trashcan.disposeUI()
  this.main__.disposeUI()
  this.draft__.disposeUI()
  this.flyout__.disposeUI()
}

/**
 * Dispose of this desk's board.
 */
eYo.Desk.prototype.dispose = function() {
  this.disposeUI()
  eYo.Do.disposeProperties(this, [
    "backer_",
    "main_",
    "flyout_",
    "draft_",
    "zoomControls_",
    "trashcan"
  ])
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
 * 2) Then the main board dimensions.
 
 */
eYo.Desk.prototype.updateMetrics = function() {
  this.ui_driver.deskUpdateMetrics(this)
  this.main__.updateMetrics()
  this.draft__.updateMetrics()
  this.flyout__.updateMetrics()
}

/**
 * Update the metrics and place the components accordingly.
 */
eYo.Desk.prototype.layout = function() {
  this.updateMetrics()
  this.place()
}

/**
 * Place the boards.
 */
eYo.Desk.prototype.place = function() {
  this.ui_driver.deskPlace(this)
  this.main__.place()
  this.draft__.place()
  this.flyout__.place()
  this.trashcan && this.trashcan.place()
  this.zoomControls_ && this.zoomControls_.place()
}

/**
 * Size the main board to completely fill its container.
 * Call this when the view actually changes sizes
 * (e.g. on a window resize/device orientation change).
 * @return {eYo.Where}
 */
eYo.Desk.prototype.xyElementInDesk = function(element) {
  return this.ui_driver_.deskWhereElement(this, element)
}

/**
 * Make a list of all the delete areas for this board.
 */
eYo.Desk.prototype.recordDeleteAreas = function() {
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
eYo.Desk.prototype.updateScreenCalculations_ = function() {
  this.recordDeleteAreas()
}

/**
 * Forwards to the backer.
 * @param{Boolean} redo  True when redoing, false otherwise
 */
eYo.Desk.prototype.undo = function(redo) {
  this.backer__.undo(redo)
}

