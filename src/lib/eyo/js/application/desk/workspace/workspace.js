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

eYo.require('decorate')

eYo.forwardDeclare('Flyout')
eYo.forwardDeclare('app')
eYo.forwardDeclare('Backer')
eYo.forwardDeclare('Scrollbar')

goog.forwardDeclare('goog.array');

/**
 * @name{eYo.pane.Workspace}
 * Class for a workspace.
 * This is the structure above the boards but below the desk.
 * The workspace has 3+n boards:
 * - the board one where bricks are dropped to be executed,
 * - the 2+n in the flyout,
 * @param {eYo.app.Dflt|Object} owner Owner application.
 * @constructor
 */
eYo.pane.makeC9r('Workspace', {
  owned: {
    /**
     * @type {?eYo.board.Main} 
     */
    board () { return new eYo.board.Main(this) },
    /**
     * The flyout.
     * @type {?eYo.Flyout} 
     */
    flyout () { return new eYo.Flyout(this) },
    /**
     * The undo/redo manager
     * @type {?eYo.Backer} 
     */
    backer () { return new eYo.Backer(this) },
    /**
     * The workspace's trashCan (if any).
     * @type {eYo.pane.TrashCan}
     */
    trashCan () { return new eYo.pane.TrashCan(this) },
    /**
     * The main focus manager.
     * @type {?eYo.focus.Main} 
     */
    focus_main () { return new eYo.focus.Main(this) },
    zoomer () { return new eYo.pane.Zoomer(this) },
  },
  copied: {
    /** @type {!eYo.c9r.Rect} */
    viewRect () {
      new eYo.c9r.Rect()
    }
  },
  valued: {
    scale () {
      return this.options.zoom.startScale || 1
    },
  },
  computed: {
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
  },
  ui: {
    /**
     * Make the user interface.
     */
    init () {
      this.recordDeleteAreas()
      this.layout()  
    }
  },
})

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
eYo.pane.Workspace_p.updateMetrics = function() {
  this.ui_driver.updateMetrics(this)
  this.board.updateMetrics()
  this.flyout.updateMetrics()
}

/**
 * Update the metrics and place the components accordingly.
 */
eYo.pane.Workspace_p.layout = function() {
  this.updateMetrics()
  this.place()
}

/**
 * Place the boards.
 */
eYo.pane.Workspace_p.place = function() {
  this.ui_driver.place(this)
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
eYo.pane.Workspace_p.recordDeleteAreas = function() {
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
eYo.pane.Workspace_p.undo = function(redo) {
  this.backer__.undo(redo)
}

