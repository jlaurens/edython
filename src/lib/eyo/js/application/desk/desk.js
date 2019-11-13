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

goog.require('eYo.Owned')
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
eYo.Desk = function(owner) {
  eYo.Desk.superClass_.constructor.call(this, owner)
  /**
   * Wokspace.
   * @type{eYo.Workspace}
   */
  this.workspace_ = new eYo.Workspace(this)
  /**
   * Terminal.
   * @type{eYo.Terminal}
   */
  this.terminal_ = new eYo.Terminal(this)
  /**
   * Turtle.
   * @type{eYo.Turtle}
   */
  this.turtle_ = new eYo.Turtle(this)
  /**
   * Graphic.
   * @type{eYo.Graphic}
   */
  this.graphic_ = new eYo.Graphic(this)
  /**
   * Variable.
   * @type{eYo.Variable}
   */
  this.variable_ = new eYo.Variable(this)
  /**
   * Main focus manager.
   * @type{eYo.Focus.Main}
   */
  this.panes_ = [
    this.workspace_,
    this.terminal_,
    this.turtle_,
    this.graphic_,
    this.variable_
  ]
  this.focus_ = new eYo.Focus.Main(this)
}
goog.inherits(eYo.Desk, eYo.Owned.UI)

eYo.Property.addApp(
  eYo.Desk.prototype,
  'app',
  function() {
    return this.owner__.app
  }
)

eYo.Property.addMany(
  eYo.Desk.prototype,
  {
    terminal: {},
    turtle: {},
    graphic: {},
    variable: {},
    workspace: {},
    focus: {},
  }
)
Object.defineProperties(eYo.Desk.prototype, {
  /**
   * The desk's application.
   * @type {!eYo.Application|Object}
   * @private
   */
  app: {
    get () {
      return this.owner_
    }
  },
  /**
   * The desk's desk.
   * @type {!eYo.Desk}
   * @private
   */
  desk: {
    get () {
      return this
    }
  },
})

/**
 * Make the user interface.
 */
eYo.Desk.prototype.initUI = eYo.Decorate.makeInitUI(
  eYo.Desk,
  function() {
    this.ui_driver_mgr.initUI(this)
    this.panes_.forEach(p => p.initUI())
    this.layout()
  }
)

/**
 * Dispose of UI resources.
 */
eYo.Decorate.makeDisposeUI(
  eYo.Desk,
  function() {
    [].concate(this.panes_).reverse().forEach(p => p.disposeUI())
    this.ui_driver_mgr.disposeUI(this)
  }
)

/**
 * Dispose of this desk's board.
 */
eYo.Decorate.makeDispose(
  eYo.Desk,
  function() {
    eYo.Property.dispose(this,
      'workspace',
      'terminal',
      'turtle',
      'graphic',
      'variable',
      'focus',
    )
  }
)

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
  this.ui_driver_mgr.updateMetrics(this)
  this.panes_.forEach(p => p.updateMetrics())
}

/**
 * Place the panes.
 */
eYo.Desk.prototype.place = function() {
  this.ui_driver_mgr.place(this)
  this.panes_.forEach(p => p.place())
}

/**
 * See `deskWhereElement`.
 * @param {!Element}
 * @return {eYo.Where}
 */
eYo.Desk.prototype.xyElementInDesk = function(element) {
  return this.ui_driver_mgr.whereElement(this, element)
}

/**
 * Update items that use screen coordinate calculations
 * because something has changed (e.g. scroll position, window size).
 * @private
 */
eYo.Desk.prototype.updateScreenCalculations_ = function() {
  this.workspace.recordDeleteAreas()
}
