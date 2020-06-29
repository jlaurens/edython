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

eYo.forward('flyout.View')
eYo.forward('app')
eYo.forward('event')
eYo.forward('view.Scrollbar')

//g@@g.forwardDeclare('g@@g.array');

/**
 * @name{eYo.view.Workspace}
 * Class for a workspace.
 * This is the structure above the boards but below the desk.
 * The workspace has 3+n boards:
 * - the board one where bricks are dropped to be executed,
 * - the 2+n in the flyout,
 * @param {eYo.app.BaseC9r|Object} owner Owner application.
 * @constructor
 */
eYo.view.newC9r('Workspace', {
  properties: {
    /**
     * @type {?eYo.board.Main} 
     */
    board: {
      value () {
        return new eYo.board.Main(this)
      },
    },
    /**
     * The flyout.
     * @type {?eYo.flyout.View} 
     */
    flyout: {
      value () {
        return new eYo.flyout.View(this)
      },
    },
    /**
     * The undo/redo manager
     * @type {?eYo.event.Mngr} 
     */
    backer: {
      value () {
        return new eYo.event.Mngr(this)
      },
    },
    /**
     * The workspace's trashCan (if any).
     * @type {eYo.control.TrashCan}
     */
    trashCan: {
      value () {
        return new eYo.control.TrashCan(this)
      },
    },
    zoomer: {
      value () {
        return new eYo.control.Zoomer(this)
      },
    },
    /** @type {!eYo.geom.Rect} */
    viewRect: {
      get () {
        new eYo.geom.Rect()
      },
      copy: true,
    },
    scale: {
      get () {
        return this.options.zoom.scaleStart || 1
      },
    },
    /**
     * The workspace's desk.
     * @type {!eYo.view.Desk}
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
eYo.view.Workspace_p.updateMetrics = function() {
  this.ui_driver.updateMetrics(this)
  this.board.updateMetrics()
  this.flyout.updateMetrics()
}

/**
 * Update the metrics and place the components accordingly.
 */
eYo.view.Workspace_p.layout = function() {
  this.updateMetrics()
  this.place()
}

/**
 * Place the boards.
 */
eYo.view.Workspace_p.place = function() {
  this.ui_driver.place(this)
  this.board.place()
  this.flyout.place()
  var bottom = eYo.view.SCROLLBAR_THICKNESS
  this.trashCan.place(bottom)
  bottom = this.trashCan.top
  this.zoomer.place(bottom)
}

/**
 * Make a list of all the delete areas for this workspace.
 */
eYo.view.Workspace_p.recordDeleteAreas = function() {
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
eYo.view.Workspace_p.undo = function(redo) {
  this.backer_.undo(redo)
}
