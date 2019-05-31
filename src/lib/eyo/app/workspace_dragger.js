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
eYo.WorkspaceDragger = function(factory) {
  this.factory_ = factory
  this.disposeUI = eYo.Do.nothing
  factory.hasUI && this.makeUI()
}

Object.defineProperties(eYo.WorkspaceDragger.prototype, {
  factory: {
    get () {
      return this.factory_
    }
  },
  workspace: {
    get () {
      return this.workspace_
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
eYo.WorkspaceDragger.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  delete this.disposeUI
  this.ui_driver.workspaceDraggerInit(this)
}

/**
 * Dispose of the UI resources.
 * @package
 */
eYo.WorkspaceDragger.prototype.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  delete this.makeUI
  this.ui_driver.workspaceDraggerDispose(this)
}

/**
 * Sever all links from this object.
 * @package
 */
eYo.WorkspaceDragger.prototype.dispose = function() {
  this.disposeUI()
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
eYo.WorkspaceDragger.prototype.isActive_ = false;

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
    workspace.targetWorkspace.flyout_.scrollbar_.set(y)
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

  var x = this.startXY_.x + deltaXY.x + metrics.content.left
  x = Math.min(x, 0)
  x = Math.max(x, metrics.view.width - metrics.content.width)

  var y = this.startXY_.y + deltaXY.y + metrics.content.top
  y = Math.min(y, 0)
  y = Math.max(y, metrics.view.height - metrics.content.height)

  this.updateScroll_(-x, -y)
}

/**
 * Translate the workspace to new coordinates.
 * @param {number} x
 * @param {number} y
 */
eYo.WorkspaceDragger.prototype.xyMoveTo = function(x, y) {
  if (this.dragSurface_ && this.isActive_) {
    this.dragSurface_.xyMoveTo(x,y)
  } else {
    this.workspace_.canvasMoveTo(x, y)
  }
}
