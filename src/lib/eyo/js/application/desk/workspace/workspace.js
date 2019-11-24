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
eYo.Pane.makeSubclass({
  key: 'Workspace',
  props: {
    owned: {
      /**
       * @type {?eYo.Board.Main} newValue 
       */
      board () { return new eYo.Board.Main(this) },
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
       * @type {eYo.TrashCan}
       */
      trashCan () { return new eYo.TrashCan(this) },
      /**
       * The main focus manager.
       * @type {?eYo.Focus.Main} 
       */
      focus () { return new eYo.Focus.Main(this) },
      zoomer () { return new eYo.Zoomer(this) },
    },
    clonable: {
      /** @type {!eYo.Rect} */
      viewRect () {
        new eYo.Rect()
      }
    },
    link: {
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
    }
  },
  ui: {
    /**
     * Make the user interface.
     */
    init () {
      this.recordDeleteAreas()
      this.layout()  
    }
  }
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
eYo.Workspace.prototype.updateMetrics = function() {
  this.ui_driver.updateMetrics(this)
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

