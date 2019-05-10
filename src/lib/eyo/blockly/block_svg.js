/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.BlockSvg')

goog.require('eYo.Do')
goog.require('eYo.Block')
goog.require('eYo.DelegateSvg')
goog.require('goog.dom');
goog.require('Blockly.BlockSvg')
goog.forwardDeclare('eYo.MenuManager')
goog.require('eYo.BlockDragger')

eYo.Do.inherits(Blockly.BlockSvg, eYo.Block)

/**
 * Class for a block's SVG representation.
 * Not normally called directly, workspace.newBlock() is preferred.
 * For edython.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @extends {Blockly.BlockSvg}
 * @constructor
 */
eYo.BlockSvg = function (workspace, prototypeName, optId) {
  eYo.BlockSvg.superClass_.constructor.call(this,
    workspace, prototypeName, optId)
}
goog.inherits(eYo.BlockSvg, Blockly.BlockSvg)

/**
 * Noop. Override blockly's behaviour.
 */
eYo.BlockSvg.prototype.initSvg = function () {
}

/**
 * Returns the named field from a block.
 * When not found using the inherited method,
 * ask the delegate.
 * NB: not all fields belong to an input.
 * @param {string} name The name of the field.
 * @return {Blockly.Field} Named field, or null if field does not exist.
 */
eYo.BlockSvg.prototype.getField = function (name) {
  return eYo.BlockSvg.superClass_.getField.call(this, name) || this.eyo.getField(name)
}

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {boolean=} optBubble If false, just render this block.
 * @param {?Object} io  rendering state recorder.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
eYo.BlockSvg.prototype.render = function (optBubble, io) {
  if (this.workspace) {
    this.eyo.render(optBubble, io)
  }
}

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
eYo.BlockSvg.prototype.getInput = function (name) {
  var input = this.eyo.getInput(name)
  if (!input) {
    input = eYo.BlockSvg.superClass_.getInput.call(this, name)
  }
  if (input) {
    eYo.Input.setupEyO(input)
  }
  return input
}

/**
 * Set parent of this block to be a new block or null.
 * This is noop.
 * @param {Blockly.BlockSvg} newParent New parent block.
 */
Blockly.BlockSvg.prototype.setParent = function(newParent) {
  Blockly.BlockSvg.superClass_.setParent.call(this, newParent);
};


/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 */
eYo.BlockSvg.prototype.connectionUiEffect = function () {
  this.workspace.getAudioManager().play('click')
  if (this.workspace.scale < 1) {
    return // Too small to care about visual effects.
  }
  var ui = this.eyo.ui
  if (ui) {
    ui.connectionUiEffect()
    return
  }
  eYo.BlockSvg.superClass_.connectionUiEffect.call(this)
}

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
eYo.BlockSvg.connectionUiStep_ = function (ripple, start, workspaceScale) {
  var ms = new Date() - start
  var percent = ms / 200
  if (percent > 1) {
    goog.dom.removeNode(ripple)
  } else {
    ripple.style.opacity = 8 * Math.pow(percent, 2) * Math.pow(1 - percent, 2)
    Blockly.BlockSvg.disconnectUiStop_.pid_ = setTimeout(
      eYo.BlockSvg.connectionUiStep_, 10, ripple, start, workspaceScale)
  }
}

/**
 * Returns a bounding box describing the dimensions of this block
 * and any blocks stacked below it.
 * @return {!{height: number, width: number}} Object with height and width
 *    properties in workspace units.
 */
eYo.BlockSvg.prototype.getHeightWidth = function () {
  return this.eyo.ui.getHeightWidth()
}

/**
 * Set whether the block is collapsed or not.
 * By pass Blockly.BlockSvg.prototype.setCollapsed
 * @param {boolean} collapsed True if collapsed.
 */
eYo.BlockSvg.prototype.setCollapsed = function (collapsed) {
  if (this.collapsed_ === collapsed) {
    return
  }
  var renderList = []
  // Show/hide the next statement inputs.
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    renderList.push.apply(renderList, input)
    if (input.eyo.isNextLike) {
      input.setVisible(!collapsed)
    }
  }
  Blockly.BlockSvg.superClass_.setCollapsed.call(this, collapsed)
  if (!renderList.length) {
    // No child blocks, just render this block.
    renderList[0] = this
  }
  if (this.eyo.rendered) {
    var block
    for (i = 0; (block = renderList[i]); i++) {
      block.render()
    }
    // Don't bump neighbours.
    // Although bumping neighbours would make sense, users often collapse
    // all their functions and store them next to each other.  Expanding and
    // bumping causes all their definitions to go out of alignment.
  }
}

/**
 * Noop. Bypass the inherited method.
 * @override
 */
eYo.BlockSvg.prototype.updateColour = function () {

}

/**
 * Show the context menu for this block.
 * @param {!Event} e Mouse event.
 * @private
 */
eYo.BlockSvg.prototype.showContextMenu_ = function (e) {
  // this part is copied as is from the parent's implementation. Is it relevant ?
  if (this.workspace.options.readOnly || !this.contextMenu) {
    return
  }
  eYo.MenuManager.shared().showMenu(this, e)
}

/**
 * Dispose of this block.
 * If the block was selected, then something else should be selected.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 * @param {boolean} animate If true, show a disposal animation and sound.
 * @override
 */
eYo.BlockSvg.prototype.dispose = function (healStack, animate) {
  if (!this.workspace) {
    return
  }
  eYo.Events.groupWrap(() => {
    if (this === eYo.Selected.block) {
      // this block was selected, select the block below or above before deletion
      var m4t, target
      var m4ts = this.eyo.targets
      if (((m4t = m4ts.foot) && (target = m4t.target)) || ((m4t = m4ts.head) && (target = m4t.target))) {
        eYo.Selected.eyo = target.b_eyo
      } else if ((m4t = m4ts.output) && (target = m4t.target)) {
        eYo.Selected.magnet = target
      }
    }
    this.eyo.consolidate = eYo.Do.nothing
    this.unplug(healStack)
    eYo.BlockSvg.superClass_.dispose.call(this, healStack, animate)
  })
}

/**
 * Move this block during a drag, taking into account whether we are using a
 * drag surface to translate blocks.
 * This block must be a top-level block.
 * @param {!goog.math.Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
eYo.BlockSvg.prototype.moveDuringDrag = function(newLoc) {
  var d = this.eyo.getDistanceFromVisible(newLoc)
  if (d) {
    newLoc.x -= d.x
    newLoc.y -= d.y
  }
  if (this.useDragSurface_) {
    this.workspace.blockDragSurface_.translateSurface(newLoc.x, newLoc.y);
  } else {
    this.svgGroup_.translate_ = 'translate(' + newLoc.x + ',' + newLoc.y + ')';
    this.svgGroup_.setAttribute('transform',
        this.svgGroup_.translate_ + this.svgGroup_.skew_);
  }
};
/**
 * Recursively adds or removes the dragging class to this node and its children.
 * Store `adding` in a property of the delegate.
 * @param {boolean} adding True if adding, false if removing.
 * @package
 */
eYo.BlockSvg.prototype.setDragging = function(adding) {
  this.eyo.isDragging_ = adding
  eYo.BlockSvg.superClass_.setDragging.call(this, adding)
};

/**
 * Update the visual effect for disabled/enabled blocks.
 */
Blockly.BlockSvg.prototype.updateDisabled = function() {
  var ui = this.eyo.ui
  if (ui) {
    ui.updateDisabled()
    this.getChildren().forEach(child => child.updateDisabled())
  }
}
/**
 * Whether the receiver is movable.
 */
eYo.BlockSvg.prototype.isMovable = function() {
  return !this.eyo.wrapped_ && eYo.BlockSvg.superClass_.isMovable.call(this)
}

/**
 * Returns connections originating from this block.
 * @param {boolean} all If true, return all connections even hidden ones.
 *     Otherwise, for a non-rendered block return an empty list, and for a
 *     collapsed block don't return inputs connections.
 * @return {!Array.<!Blockly.Connection>} Array of connections.
 * @package
 */
eYo.BlockSvg.prototype.getConnections_ = function(all) {
  var myConnections = eYo.BlockSvg.superClass_.getConnections_.call(this, all)
  if (all || this.eyo.rendered) {
    if (this.eyo.magnets.left) {
      myConnections.push(this.eyo.magnets.left)
    }
  }
  return myConnections
}

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0), in workspace units.
 * If the block is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!goog.math.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 */
eYo.BlockSvg.prototype.getRelativeToSurfaceXY = function() {
  return this.eyo.ui.xyInSurface
}

/**
 * May return nothing.
 * @return {!Element} The group element.
 */
eYo.BlockSvg.prototype.getSvgRoot = function() {
  var g = this.eyo.ui
  return g && (g = g.driver.nodeSvgGroup) && g(this.eyo)
}

/**
 * Translates the block, forwards to the ui driver.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 */
eYo.BlockSvg.prototype.translate = function(x, y) {
  this.eyo.ui.translate(x, y)
}

