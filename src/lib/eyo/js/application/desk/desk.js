/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Desk programming model.
 * The desk is the top object containing bricks.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.forwardDeclare('app')

eYo.forwardDeclare('view.Terminal')
eYo.forwardDeclare('view.Turtle')
eYo.forwardDeclare('view.Graphic')
eYo.forwardDeclare('view.Variable')
eYo.forwardDeclare('view.Workspace')

/**
 * @name{eYo.view.Desk}
 * Class for a desk.
 * This is the structure above the panes but below the application.
 * @param {eYo.app.Dflt|Object} owner Owner application.
 * @constructor
 */
eYo.view.makeC9r('Desk', {
  views: {
    /**
     * Terminal.
     * @type{eYo.view.Terminal}
     */
    terminal () {
      return new eYo.view.Terminal(this)
    },
    /**
     * Turtle.
     * @type{eYo.view.Turtle}
     */
    turtle () {
      return new eYo.view.Turtle(this)
    },
    /**
     * Graphic.
     * @type{eYo.view.Graphic}
     */
    graphic () {
      return new eYo.view.Graphic(this)
    },
    /**
     * Variable.
     * @type{eYo.view.Variable}
     */
    variable () {
      return new eYo.view.Variable(this)
    },
    /**
     * Wokspace.
     * @type{eYo.view.Workspace}
     */
    workspace () {
      return new eYo.view.Workspace(this)
    },
  },
  properties: {
    /**
     * The desk's desk.
     * @type {!eYo.view.Desk}
     */
    desk: {
      get () {
        return this
      },
    },
  },
  ui: {
    /**
     * Make the user interface.
     */
    init () {
      this.layout()
    }
  },
})

/**
 * Make the user interface.
 */
eYo.view.Desk_p.forEachPane = function (f) {
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
eYo.view.Desk_p.layout = function() {
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
eYo.view.Desk_p.updateMetrics = function() {
  this.ui_driver.updateMetrics(this)
  this.forEachPane(p => p.updateMetrics())
}

/**
 * Place the panes.
 */
eYo.view.Desk_p.place = function() {
  this.ui_driver.place(this)
  this.forEachPane(p => p.place())
}

/**
 * See `deskWhereElement`.
 * @param {Element}
 * @return {eYo.geom.Where}
 */
eYo.view.Desk_p.xyElementInDesk = function(element) {
  return this.ui_driver.whereElement(this, element)
}

/**
 * Update items that use screen coordinate calculations
 * because something has changed (e.g. scroll position, window size).
 * @private
 */
eYo.view.Desk_p.updateScreenCalculations_ = function() {
  this.workspace.recordDeleteAreas()
}

eYo.view.Dflt.eyo.propertiesMerge({
  /**
   * The desk of the receiver.
   * @type {eYo.view.Desk}
   * @readonly
   */
  desk: {
    get () {
      return this.owner.desk
    },
  },
})