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
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 * Called by the `beReady` method.
 */
eYo.BlockSvg.prototype.initSvg = function () {
  this.eyo.preInitSvg(this)
  goog.asserts.assert(this.workspace.rendered, 'Workspace is headless.')
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    input.init()
  }
  if (!this.getSvgRoot().parentNode) {
    this.workspace.getCanvas().appendChild(this.getSvgRoot())
  }
  this.eyo.postInitSvg(this)
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
 * Place the highlighting path at the end.
 * @param {Blockly.BlockSvg} newParent New parent block.
 */
eYo.BlockSvg.prototype.setParent = function (newParent) {
  if (newParent === this.parentBlock_) {
    return
  }
  this.eyo.parentWillChange(newParent)
  eYo.BlockSvg.superClass_.setParent.call(this, newParent)
  this.eyo.parentDidChange(newParent)
  if ((this.eyo.svgPathSelect_ &&
      this.svgGroup_ === this.eyo.svgPathSelect_.parentElement) || (this.eyo.svgPathConnection_ &&
        this.svgGroup_ === this.eyo.svgPathConnection_.parentElement)) {
    this.removeSelect()
    this.addSelect()
  } else if (newParent && ((newParent.eyo.svgPathSelect_ &&
      newParent.svgGroup_ === newParent.eyo.svgPathSelect_.parentElement) || (newParent.eyo.svgPathConnection_ &&
      newParent.svgGroup_ === newParent.eyo.svgPathConnection_.parentElement))) {
    newParent.removeSelect()
    newParent.addSelect()
  }
}

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 */
eYo.BlockSvg.prototype.connectionUiEffect = function () {
  if (this.eyo) {
    this.workspace.getAudioManager().play('click')
    if (this.workspace.scale < 1) {
      return // Too small to care about visual effects.
    }
    var xy = this.workspace.getSvgXY(/** @type {!Element} */ (this.svgGroup_))
    if (this.outputConnection) {
      var h = this.height * this.workspace.scale / 2
      var ripple = Blockly.utils.createSvgElement('circle',
        {'class': 'blocklyHighlightedConnectionPathH', 'cx': xy.x, 'cy': xy.y + h, 'r': 2 * h / 3},
        this.workspace.getParentSvg())
    } else {
    // Determine the absolute coordinates of the inferior block.
      var steps = Blockly.Connection.highlightedPath_.attributes['d'].value
      ripple = Blockly.utils.createSvgElement('path',
        {'class': 'blocklyHighlightedConnectionPath',
          'd': steps,
          transform: `translate(${xy.x},${xy.y}) scale(1,2)`},
        this.workspace.getParentSvg())
    }
    // Start the animation.
    eYo.BlockSvg.connectionUiStep_(ripple, new Date(), this.workspace.scale)
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
  var height = this.height
  var width = this.width
  // Recursively add size of subsequent blocks.
  var nextBlock = this.getNextBlock()
  if (nextBlock) {
    var nextHeightWidth = nextBlock.getHeightWidth()
    height += nextHeightWidth.height // NO Height of tab.
    width = Math.max(width, nextHeightWidth.width)
  }
  return {height: height, width: width}
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
  if (this.rendered) {
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
  eYo.Events.groupWrap(
    () => {
      if (this === eYo.Selected.block) {
        // this block was selected, select the block below or above before deletion
        var c8n, target
        if (((c8n = this.nextConnection) && (target = c8n.targetBlock())) || ((c8n = this.previousConnection) && (target = c8n.targetBlock()))) {
          target.select()
        } else if ((c8n = this.outputConnection) && (c8n = c8n.targetConnection)) {
          target = c8n.sourceBlock_
          target.select()
          eYo.Selected.connection = c8n
        }
      }
      eYo.BlockSvg.superClass_.dispose.call(this, healStack, animate)
    }
  )
}

/**
 * Move this block to the front of the visible workspace.
 * <g> tags do not respect z-index so SVG renders them in the
 * order that they are in the DOM.  By placing this block first within the
 * block group's <g>, it will render on top of any other blocks.
 * This message is sent from the mouse down event
 * But this event may select the block above
 * (when the connection between the blocks is selected)
 * @package
 * @override
 */
eYo.BlockSvg.prototype.bringToFront = function () {
  if (this === eYo.Selected.block) {
    eYo.BlockSvg.superClass_.bringToFront.call(this)
  }
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
 * Move this block to the front of the visible workspace.
 * <g> tags do not respect z-index so SVG renders them in the
 * order that they are in the DOM.  By placing this block first within the
 * block group's <g>, it will render on top of any other blocks.
 * Problem with chromium.
 * @package
 */
eYo.BlockSvg.prototype.bringToFront = function() {
  var block = this;
  try {
    do {
      var root = block.getSvgRoot();
      if (root.parentNode) {
        goog.dom.appendChild(root.parentNode, root)
        block = block.getParent();
      } else {
        break
      }
    } while (block);
  } catch (err) {
    console.error(err)
  }
};


/**
 * Enable or disable a block.
 * Remove the reference to the svgPath_
 */
Blockly.BlockSvg.prototype.updateDisabled = function() {
  if (this.disabled || this.getInheritedDisabled()) {
    var added = Blockly.utils.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDisabled');
    // if (added) {
    //   this.svgPath_.setAttribute('fill',
    //       'url(#' + this.workspace.options.disabledPatternId + ')');
    // }
  } else {
    var removed = Blockly.utils.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDisabled');
    if (removed) {
      this.updateColour();
    }
  }
  var children = this.getChildren();
  for (var i = 0, child; child = children[i]; i++) {
    child.updateDisabled();
  }
};

/**
 * Whether the receiver is movable.
 */
eYo.BlockSvg.prototype.isMovable = function() {
  return !this.eyo.wrapped_ && eYo.BlockSvg.superClass_.isMovable.call(this)
}
