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

goog.require('eYo.UI.Owned')
goog.require('eYo.Decorate')

goog.provide('eYo.Desk')

goog.forwardDeclare('eYo.Application')
goog.forwardDeclare('eYo.Backer')
goog.forwardDeclare('eYo.Options')

goog.forwardDeclare('goog.array');
goog.forwardDeclare('goog.math');

/**
 * Class for a desk.
 * This is the structure above the panes but below the application.
 * @param {!eYo.Application|Object} owner Owner application.
 * @constructor
 */
eYo.UI.Constructor.make('Desk', {
  props: {
    owned: {
      /**
       * Terminal.
       * @type{eYo.Terminal}
       */
      terminal () {
        return new eYo.Terminal(this)
      },
      /**
       * Turtle.
       * @type{eYo.Turtle}
       */
      turtle () {
        return new eYo.Turtle(this)
      },
      /**
       * Graphic.
       * @type{eYo.Graphic}
       */
      graphic () {
        return new eYo.Graphic(this)
      },
      /**
       * Variable.
       * @type{eYo.Variable}
       */
      variable () {
        return new eYo.Variable(this)
      },
      /**
       * Wokspace.
       * @type{eYo.Workspace}
       */
      workspace () {
        return new eYo.Workspace(this)
      },
      /**
       * Main focus manager.
       * @type{eYo.Focus.Main}
       */
      focus () {
        return new eYo.Focus.Main(this)
      },
    },
    computed: {
      /**
       * The desk's desk.
       * @type {!eYo.Desk}
       */
      desk () {
        return this
      },
    }
  },
  ui: {
    /**
     * Make the user interface.
     */
    init () {
      this.layout()
    }
  }
})

/**
 * Make the user interface.
 */
eYo.Desk.prototype.forEachPane = function (f) {
  [
    this.workspace,
    this.terminal,
    this.turtle,
    this.graphic,
    this.variable,
  ].forEach(f)
}

/**
 * Update the metrics and place the components accordingly.
 */
eYo.Desk.prototype.layout = function() {
  this.updateMetrics()
  this.place()
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
eYo.Desk.prototype.updateMetrics = function() {
  this.ui_driver.updateMetrics(this)
  this.forEachPane(p => p.updateMetrics())
}

/**
 * Place the panes.
 */
eYo.Desk.prototype.place = function() {
  this.ui_driver.place(this)
  this.forEachPane(p => p.place())
}

/**
 * See `deskWhereElement`.
 * @param {!Element}
 * @return {eYo.Where}
 */
eYo.Desk.prototype.xyElementInDesk = function(element) {
  return this.ui_driver.whereElement(this, element)
}

/**
 * Update items that use screen coordinate calculations
 * because something has changed (e.g. scroll position, window size).
 * @private
 */
eYo.Desk.prototype.updateScreenCalculations_ = function() {
  this.workspace.recordDeleteAreas()
}
