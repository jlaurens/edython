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

goog.require('eYo.Pane')
goog.require('eYo.Decorate')

goog.provide('eYo.Workspace')

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
  /** @type {!eYo.Rect} */
  this.viewRect__ = new eYo.Rect()
  // create the board
  this.board_ = new eYo.Board.Main(this)
  this.flyout_ = new eYo.Flyout(this)
  this.backer_ = new eYo.Backer(this)
  this.trashCan_ = new eYo.TrashCan(this)
  this.zoomer_ = new eYo.Zoomer(this)
  this.scale = this.options.zoom.startScale || 1
}
goog.inherits(eYo.Workspace, eYo.Pane)

eYo.Property.addMany(
  eYo.Workspace.prototype,
  {
    /**
     * @type {?eYo.Board.Main} newValue 
     */
    board: {},
    /**
     * The workspace's trashCan (if any).
     * @type {eYo.TrashCan}
     */
    trashCan: {},
    /**
     * The flyout.
     * @type {?eYo.Flyout} 
     */
    flyout: {},
    /**
     * The main focus manager.
     * @type {?eYo.Focus.Main} 
     */
    focus: {},
    /**
     * The undo/redo manager
     * @type {?eYo.Backer} 
     */
    backer: {},
    /**
     * The view rectangle
     * @type {eYo.ViewRect}
     */
    viewRect: {
      get () {
        return this.viewRect__.clone
      },
      /**
       * Actually set from a `div` object.
       */
      set (newValue) {
        this.viewRect__.set(newValue)
      }
    },
    /**
     * The scale
     * @type {Number} 
     */
    scale: {value: 1},
  }
)

Object.defineProperties(eYo.Workspace.prototype, {
  /**
   * The workspace's desk.
   * @type {!eYo.Desk}
   * @private
   */
  desk: {
    get () {
      return this.owner
    }
  },
  /**
   * The workspace's workspace.
   * @type {!eYo.Workspace}
   * @private
   */
  workspace: {
    get () {
      return this
    }
  },
})

/**
 * Make the user interface.
 */
eYo.Workspace.prototype.makeUI = eYo.Decorate.makeUI(
  eYo.Workspace,
  function() {
    this.driver.workspaceInit(this)
    this.trashCan.makeUI()
    this.zoomer.makeUI()
    this.board__.makeUI()
    this.flyout__.makeUI()
    this.recordDeleteAreas()
    this.layout()  
  }
)

/**
 * Dispose of UI resources.
 */
eYo.Workspace.prototype.disposeUI = eYo.Decorate.disposeUI(
  eYo.Workspace,
  function() {
    this.flyout__.disposeUI()
    this.board__.disposeUI()
    this.zoomer__.disposeUI()
    this.trashCan__.disposeUI()
    this.driver.workspaceDispose(this)
  }
)

/**
 * Dispose of this desk's board.
 */
eYo.Workspace.prototype.dispose = eYo.Decorate.dispose(
  eYo.Workspace,
  function() {
    eYo.Property.dispose(
      this,
      'backer',
      'board',
      'flyout',
      'zoomer',
      'trashCan',
    )
  }
)

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
  this.ui_driver_mgr.workspaceUpdateMetrics(this)
  this.board.updateMetrics()
  this.flyout.updateMetrics()
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
  this.ui_driver_mgr.wokspacePlace(this)
  this.board.place()
  this.flyout.place()
  var bottom = eYo.Scrollbar.thickness
  this.trashCan.place(bottom)
  bottom = this.trashCan.top
  this.zoomer.place(bottom)
}

/**
 * Make a list of all the delete areas for this workspace.
 */
eYo.Workspace.prototype.recordDeleteAreas = function() {
  if (this.trashCan) {
    this.deleteRectTrash_ = this.trashCan.getClientRect()
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
 * Forwards to the backer.
 * @param{Boolean} redo  True when redoing, false otherwise
 */
eYo.Workspace.prototype.undo = function(redo) {
  this.backer__.undo(redo)
}

