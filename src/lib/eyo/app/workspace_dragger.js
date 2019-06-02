/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Desks dragger for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DeskDragger')

goog.require('eYo')

/**
 * Class for a desk dragger. Set some scrollbar according to the drag delta. The scrollbar depends on whether the desk is in a flyout.
 * @param {!eYo.Desk} desk The desk to drag.
 * @constructor
 */
eYo.DeskDragger = function(desk) {
  this.desk_ = desk
  this.disposeUI = eYo.Do.nothing
  desk.hasUI && this.makeUI()
}

Object.defineProperties(eYo.DeskDragger.prototype, {
  factory: {
    get () {
      return this.desk_.factory
    }
  },
  desk: {
    get () {
      return this.desk_
    }
  },
  ui_driver: {
    get () {
      return this.factory_.ui_driver
    }
  },
  has_UI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  },
})

/**
 * Prepare the UI for dragging.
 * @package
 */
eYo.DeskDragger.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  delete this.disposeUI
  this.ui_driver.deskDraggerInit(this)
}

/**
 * Dispose of the UI resources.
 * @package
 */
eYo.DeskDragger.prototype.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  delete this.makeUI
  this.ui_driver.deskDraggerDispose(this)
}

/**
 * Sever all links from this object.
 * @package
 */
eYo.DeskDragger.prototype.dispose = function() {
  this.disposeUI()
  this.desk_ = null
  this.correction_ = null
}

/**
 * Whether the drag surface is actively in use. When true, calls to
 * translate will translate the drag surface instead of the translating the
 * desk directly.
 * This is set to true in dragSetup and to false in the end of drag management.
 * @type {boolean}
 * @private
 */
eYo.DeskDragger.prototype.isActive_ = false

/**
 * Start dragging the desk.
 * @param {!eYo.Gesture} gesture
 * @package
 */
eYo.DeskDragger.prototype.start = function(gesture) {
  var desk = gesture.desk
  /**
   * @type {!eYo.DeskSvg}
   * @private
   */
  this.desk_ = desk

  /**
   * The desk's metrics object at the beginning of the drag.  Contains size
   * and position metrics of a desk.
   * Coordinate system: pixel coordinates.
   * @type {!Object}
   * @private
   */
  this.startMetrics_ = desk.getMetrics()

  /**
   * The scroll position of the desk at the beginning of the drag.
   * Coordinate system: pixel coordinates.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.startXY_ = new goog.math.Coordinate(
      desk.scrollX, desk.scrollY)
  
  /*
  * Move the scrollbars to drag the desk.
  * x and y are in pixels.
  * @param {number} x The new x position to move the scrollbar to.
  * @param {number} y The new y position to move the scrollbar to.
  * @private
  */
  this.startMetrics_.updateScroll_ = desk.isFlyout
  ? function (x, y) {
    desk.targetDesk.flyout_.scrollbar_.set(y)
  }
  : function (x, y) {
    desk.scrollbar.set(x, y)
  }

  if (eYo.Selected.brick) {
    eYo.Selected.brick.unselect()
  }
  // This can happen if the user starts a drag, mouses up outside of the
  // document where the mouseup listener is registered (e.g. outside of an
  // iframe) and then moves the mouse back in the desk.  On mobile and ff,
  // we get the mouseup outside the frame. On chrome and safari desktop we do
  // not.
  if (this.isActive_) {
    return
  }

  this.isActive_ = true

  /**
   * What is the purpose of this transform correction_?
   * Zoom I guess
   * Is it for the flyout also?
   */
  desk.ui_driver.deskStartDrag(desk)
}

/**
 * Finish dragging the desk and put everything back where it belongs.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} delta How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
eYo.DeskDragger.prototype.end = function() {
  this.drag()
  // Don't do anything if we aren't using a drag surface.
  if (!this.dragSurface_) {
    return;
  }
  this.isActive_ = false
  var trans = this.dragSurface_.translation
  this.dragSurface_.clearAndHide(this.dom.svg.group_)
  this.desk_.canvasMoveTo(trans.x, trans.y)
}

/**
 * Move the desk based on the most recent mouse movements.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} deltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
eYo.DeskDragger.prototype.drag = function() {
  var deltaXY = this.desk_.ui_driver.deskDragDeltaXY(this.desk_)
  var metrics = this.startMetrics_

  var x = this.startXY_.x + deltaXY.x + metrics.content.left
  x = Math.min(x, 0)
  x = Math.max(x, metrics.view.width - metrics.content.width)

  var y = this.startXY_.y + deltaXY.y + metrics.content.top
  y = Math.min(y, 0)
  y = Math.max(y, metrics.view.height - metrics.content.height)

  this.startMetrics_.updateScroll_(-x, -y)
}

/**
 * Translate the desk to new coordinates.
 * @param {number} x
 * @param {number} y
 */
eYo.DeskDragger.prototype.xyMoveTo = function(x, y) {
  if (this.dragSurface_ && this.isActive_) {
    this.dragSurface_.xyMoveTo(x,y)
  } else {
    this.desk_.canvasMoveTo(x, y)
  }
}
