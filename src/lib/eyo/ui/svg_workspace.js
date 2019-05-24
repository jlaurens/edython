/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Workspace rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Workspace')

goog.require('eYo.Svg')
goog.forwardDeclare('eYo.Workspace')

/**
 * Initializes the workspace SVG ressources.
 * @param {!eYo.Workspace} workspace
 */
eYo.Svg.prototype.workspaceInit = function(workspace) {
  var dom = workspace.dom = {}
  return g
}

/**
 * Unbind events of the receiver.
 * @param {!eYo.Workspace} workspace
 */
eYo.Svg.prototype.workspaceUnbindEvents = function (workspace) {
  this.unbindEvent(workspace.eventWrappers_)
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {!eYo.Workspace} workspace
 */
eYo.Svg.prototype.workspaceDispose = function (workspace) {
  eYo.Svg.superClass_.workspaceDispose.call(this, workspace)
  goog.dom.removeNode(workspace.dom.group_)
  workspace.dom = undefined
}

/**
 * Add a `mousedown` listener.
 * @param {!eYo.Workspace} workspace
 */
eYo.Svg.prototype.workspaceBind_mousedown = function(workspace) {
  var bound = workspace.dom.bound || Object.create(null)
  if (bound.mousedown) {
    return
  }
  bound.mousedown = this.bindEvent(
    this.dom.group_,
    'mousedown',
    null,
    this.workspaceOn_mousedown.bind(workspace),
    {noPreventDefault: true}
  )
}

/**
 * Add a `wheel` listener.
 * @param {!eYo.Workspace} workspace
 */
eYo.Svg.prototype.workspaceBind_wheel = function(workspace) {
    var bound = workspace.dom.bound || Object.create(null)
  if (bound.wheel) {
    return
  }
  bound.wheel = this.bindEvent(
    this.dom.group_,
    'wheel',
    null,
    this.workspaceOn_wheel.bind(workspace)
  )
}

/**
 * Handle a mouse-wheel on SVG drawing surface.
 * @param {!Event} e Mouse wheel event.
 * @private
 */
eYo.Workspace.prototype.workspaceOn_wheel = function(e) {
  // TODO: Remove gesture cancellation and compensate for coordinate skew during
  // zoom.
  if (this.currentGesture_) {
    this.currentGesture_.cancel();
  }
  // The vertical scroll distance that corresponds to a click of a zoom button.
  var PIXELS_PER_ZOOM_STEP = 50;
  var delta = -e.deltaY / PIXELS_PER_ZOOM_STEP;
  var position = Blockly.utils.mouseToSvg(e, this.dom.group_,
      this.getInverseScreenCTM());
  this.zoom(position.x, position.y, delta);
  e.preventDefault();
};

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Workspace} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workspaceSetBrickDisplayMode = function (workspace, mode) {
  var canvas = workspace.svgBlockCanvas_
  workspace.currentBrickDisplayMode && (goog.dom.classlist.remove(canvas, `eyo-${workspace.currentBrickDisplayMode}`))
  if ((workspace.currentBrickDisplayMode = mode)) {
    goog.dom.classlist.add(canvas, `eyo-${workspace.currentBrickDisplayMode}`)
  }
}

/**
 * Set the display mode for bricks.
 * Used to draw bricks lighter or not.
 * @param {!eYo.Workspace} mode  The display mode for bricks.
 * @param {!String} mode  The display mode for bricks.
 */
eYo.Svg.prototype.workspaceBind_resize = function (workspace) {
  var bound = workspace.dom.bound || Object.create(null)
  if (bound.mousedown) {
    return
  }
  bound.resize = this.bindEvent(
    window,
    'resize',
    null,
    function() {
      Blockly.hideChaff(true)
      Blockly.svgResize(workspace)
    }
  )
}

