/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Workspaces dragger for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.WorkspaceDragger')

goog.require('eYo')

/**
 * Class for a workspace dragger. Set some scrollbar according to the drag delta. The scrollbar depends on whether the workspace is in a flyout.
 * @param {!eYo.Workspace} workspace The workspace to drag.
 * @constructor
 */
eYo.WorkspaceDragger = function() {
}

/**
 * Sever all links from this object.
 * @package
 */
eYo.WorkspaceDragger.prototype.dispose = function() {
  this.workspace_ = null
  this.correction_ = null
}

/**
 * Whether the drag surface is actively in use. When true, calls to
 * translate will translate the drag surface instead of the translating the
 * workspace directly.
 * This is set to true in dragSetup and to false in resetDragSurface.
 * @type {boolean}
 * @private
 */
eYo.Workspace.prototype.isDragSurfaceActive_ = false;

/**
 * Start dragging the workspace.
 * @param {!eYo.Gesture} gesture
 * @package
 */
eYo.WorkspaceDragger.prototype.start = function(gesture) {
  var workspace = gesture.workspace
  /**
   * @type {!eYo.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace

  /**
   * The workspace's metrics object at the beginning of the drag.  Contains size
   * and position metrics of a workspace.
   * Coordinate system: pixel coordinates.
   * @type {!Object}
   * @private
   */
  this.startMetrics_ = workspace.getMetrics()

  /**
   * The scroll position of the workspace at the beginning of the drag.
   * Coordinate system: pixel coordinates.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.startXY_ = new goog.math.Coordinate(
      workspace.scrollX, workspace.scrollY)
  
  /*
  * Move the scrollbars to drag the workspace.
  * x and y are in pixels.
  * @param {number} x The new x position to move the scrollbar to.
  * @param {number} y The new y position to move the scrollbar to.
  * @private
  */
  this.startMetrics_.updateScroll_ = workspace.isFlyout
  ? function (x, y) {
    workspace.targetSpace.flyout_.scrollbar_.set(y)
  }
  : function (x, y) {
    workspace.scrollbar.set(x, y)
  }

  if (eYo.Selected.brick) {
    eYo.Selected.brick.unselect()
  }
  // This can happen if the user starts a drag, mouses up outside of the
  // document where the mouseup listener is registered (e.g. outside of an
  // iframe) and then moves the mouse back in the workspace.  On mobile and ff,
  // we get the mouseup outside the frame. On chrome and safari desktop we do
  // not.
  if (this.isActive_) {
    return
  }

  this.isActive_ = true

  // Figure out where we want to put the canvas back.  The order
  // in the dom is important because things are layered.
  if (Blockly.utils.is3dSupported()) {
    this.dragSurface_ = workspace.options.workspaceDragSurface
  }
  /**
   * What is the purpose of this transform correction_?
   * Zoom I guess
   * Is it for the flyout also?
   */
  workspace.ui_driver.workspaceStartDrag(workspace)
}

/**
 * Finish dragging the workspace and put everything back where it belongs.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} delta How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
eYo.WorkspaceDragger.prototype.end = function() {
  this.drag()
  // Don't do anything if we aren't using a drag surface.
  if (!this.dragSurface_) {
    return;
  }
  this.isActive_ = false
  var trans = this.dragSurface_.surfaceTranslation
  this.dragSurface_.clearAndHide(this.dom.svg.group_)
  this.workspace_.canvasMoveTo(trans.x, trans.y)
}

/**
 * Move the workspace based on the most recent mouse movements.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} deltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
eYo.WorkspaceDragger.prototype.drag = function() {
  var deltaXY = this.workspace_.ui_driver.workspaceDragDeltaXY(this.workspace_)
  var metrics = this.startMetrics_

  var x = this.startXY_.x + deltaXY.x + metrics.contentLeft
  x = Math.min(x, 0)
  x = Math.max(x, metrics.viewWidth - metrics.contentWidth)

  var y = this.startXY_.y + deltaXY.y + metrics.contentTop
  y = Math.min(y, 0)
  y = Math.max(y, metrics.viewHeight - metrics.contentHeight)

  this.updateScroll_(-x, -y)
}

/**
 * Translate the workspace to new coordinates.
 * @param {number} x
 * @param {number} y
 */
eYo.WorkspaceDragger.prototype.moveTo = function(x, y) {
  if (this.dragSurface_ && this.isDragSurfaceActive_) {
    this.dragSurface_.translateSurface(x,y)
  } else {
    this.workspace_.canvasMoveTo(x, y)
  }
}
