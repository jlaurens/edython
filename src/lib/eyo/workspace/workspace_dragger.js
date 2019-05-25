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
eYo.WorkspaceDragger = function(workspace) {
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
  this.startScroll_ = new goog.math.Coordinate(
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
  /**
   * What is the purpose of this transform correction_
   */
  var element = workspace.dom.svg.group_.parentNode.parentNode // div above the svg
  this.correction_ = eYo.Do.getTransformCorrection(element)

  if (Blockly.utils.is3dSupported()) {
    this.dragSurface_ = workspace.options.workspaceDragSurface
  }
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
 * @param {!Event} e The most recent move event.
 * @package
 */
eYo.WorkspaceDragger.prototype.start = function(e) {
  // Don't do anything if we aren't using a drag surface.
  if (!this.dragSurface_) {
    return
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
  var svg = this.workspace_.dom.svg
  var previousElement = svg.canvas_.previousSibling
  var width = parseInt(svg.group_.getAttribute('width'), 10)
  var height = parseInt(svg.group_.getAttribute('height'), 10)
  var coord = Blockly.utils.getRelativeXY(svg.canvas_)
  this.dragSurface_.setContentsAndShow(svg.canvas_, previousElement, width, height, this.workspace_.scale)
  this.dragSurface_.translateSurface(coord.x, coord.y)
}

/**
 * Finish dragging the workspace and put everything back where it belongs.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} delta How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
eYo.WorkspaceDragger.prototype.end = function(e, delta) {
  this.drag(delta)
  // Don't do anything if we aren't using a drag surface.
  if (!this.dragSurface_) {
    return;
  }
  this.isActive_ = false
  var trans = this.dragSurface_.getSurfaceTranslation()
  this.dragSurface_.clearAndHide(this.dom.svg.group_)
  this.workspace_.canvasMoveTo(trans.x, trans.y)
}

/**
 * Move the workspace based on the most recent mouse movements.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} delta How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
eYo.WorkspaceDragger.prototype.drag = function(e, delta) {
  if (this.correction_) {
    delta = this.correction_(delta)
  }
  var metrics = this.startMetrics_

  var x = this.startScroll_.x + delta.x + metrics.contentLeft
  x = Math.min(x, 0)
  x = Math.max(x, metrics.viewWidth - metrics.contentWidth)

  var y = this.startScroll_.y + delta.y + metrics.contentTop
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
