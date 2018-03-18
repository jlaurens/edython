/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.BlockSvg')

goog.require('ezP.Block')
goog.require('ezP.DelegateSvg')
goog.require('Blockly.BlockSvg')
goog.forwardDeclare('ezP.MenuManager')

ezP.inherits(Blockly.BlockSvg, ezP.Block)

/**
 * Class for a block's SVG representation.
 * Not normally called directly, workspace.newBlock() is preferred.
 * For ezPython.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.BlockSvg = function (workspace, prototypeName, optId) {
  ezP.BlockSvg.superClass_.constructor.call(this,
    workspace, prototypeName, optId)
}
goog.inherits(ezP.BlockSvg, Blockly.BlockSvg)

ezP.BlockSvg.prototype.init = function() {
  this.ezp.initBlock(this)
}

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 */
ezP.BlockSvg.prototype.initSvg = function() {
  this.ezp.preInitSvg(this)
  ezP.BlockSvg.superClass_.initSvg.call(this)
  this.ezp.postInitSvg(this)
  this.ezp.initSvgWrap(this)
};

ezP.BlockSvg.CORNER_RADIUS = 3

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {boolean=} optBubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
ezP.BlockSvg.prototype.render = function (optBubble) {
  this.ezp.render(this, optBubble)
}

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
ezP.BlockSvg.prototype.getInput = function (name) {
  var input = this.ezp.getInput(this, name)
  if (!input) {
    input = ezP.BlockSvg.superClass_.getInput.call(this, name)
  }
  if (input) {
    ezP.Input.setupEzpData(input)
  }
  return input
}

/**
 * Select this block.  Highlight it visually.
 * Wrapped blocks are not selectable.
 */
ezP.BlockSvg.prototype.select = function() {
  if (!this.ezp.selectedConnection && this.ezp.wrapped_ && this.getSurroundParent()) {
    // Wrapped blocks should not be selected.
    this.getSurroundParent().select();
    return;
  }
  var more = this.ezp.selectedConnectionSource_ && this.ezp.selectedConnectionSource_.ezp.selectedConnection
  console.log('more', more)
  ezP.BlockSvg.superClass_.select.call(this)
  if (more) {
    if (this.ezp.svgPathHighlight_ && this.ezp.svgPathHighlight_.parentNode) {
      goog.dom.removeNode(this.ezp.svgPathHighlight_)
    }
  } else if (this.ezp.svgPathHighlight_ && !this.ezp.svgPathHighlight_.parentNode) {
    this.svgGroup_.appendChild(this.ezp.svgPathHighlight_)
  }
}

/**
 * Select this block.  Highlight it visually.
 * Wrapped blocks are not selectable.
 */
ezP.BlockSvg.prototype.unselect = function() {
  this.ezp.selectedConnectionSource_ = null
  ezP.SelectedConnection.set(null)
  ezP.BlockSvg.superClass_.unselect.call(this)
  this.removeSelect()
}

/**
 * Select this block.  Highlight it visually.
 * If there is a selected connection, this connection will be highlighted.
 * If the block is wrapped, the first parent which is not wrapped will be
 * selected.
 */
ezP.BlockSvg.prototype.addSelect = function () {
  if (this.ezp.selectedConnection) {
    if (!this.ezp.svgPathConnection_ || this.ezp.svgPathConnection_.parentNode) {
      return
    }
    this.svgGroup_.appendChild(this.ezp.svgPathConnection_)
  } else if (!this.ezp.wrapped_) {
    var hasSelectedConnection = this.ezp.selectedConnectionSource_ && this.ezp.selectedConnectionSource_.ezp.selectedConnection
    if (this.ezp.svgPathHighlight_) {
      if (this.ezp.svgPathHighlight_.parentNode && hasSelectedConnection) {
        goog.dom.removeNode(this.ezp.svgPathHighlight_)
      } else if (!this.ezp.svgPathHighlight_.parentNode && !hasSelectedConnection) {
        this.svgGroup_.appendChild(this.ezp.svgPathHighlight_)
      }
    }
  }
  if (goog.dom.classlist.contains(this.svgGroup_, 'ezp-select')) {
    return
  }
  goog.dom.classlist.add(this.svgGroup_, 'ezp-select')
  // ensure that the svgGroup is the last in the list
  this.bringToFront()
  for (var _ = 0, input; (input = this.inputList[_++]);) {
    for (var __ = 0, field; (field = input.fieldRow[__++]);) {
      if (field.addSelect) {
        field.addSelect()
      }
    }
  }
}

/**
 * Unselect this block.  Remove its highlighting.
 */
ezP.BlockSvg.prototype.removeSelect = function () {
  if (this.ezp.wrapped_) {
    if (!this.ezp.svgPathConnection_ || !this.ezp.svgPathConnection_.parentNode) {
      return
    }
  } else {
    if ((!this.ezp.svgPathHighlight_ || !this.ezp.svgPathHighlight_.parentNode)
      && (!this.ezp.svgPathConnection_ || !this.ezp.svgPathConnection_.parentNode)) {
        Blockly.utils.removeClass(this.svgGroup_, 'ezp-select')
        return
    }
    goog.dom.removeNode(this.ezp.svgPathHighlight_)
  }
  Blockly.utils.removeClass(this.svgGroup_, 'ezp-select')
  if (!this.ezp.selectedConnection) {
    goog.dom.removeNode(this.ezp.svgPathConnection_)
  }
  for (var _ = 0, input; (input = this.inputList[_++]);) {
    for (var __ = 0, field; (field = input.fieldRow[__++]);) {
      if (field.removeSelect) {
        field.removeSelect()
      }
    }
  }
}

/**
 * Set parent of this block to be a new block or null.
 * Place the highlighting path at the end.
 * @param {Blockly.BlockSvg} newParent New parent block.
 */
ezP.BlockSvg.prototype.setParent = function (newParent) {
  ezP.BlockSvg.superClass_.setParent.call(this, newParent)
  if ((this.ezp.svgPathHighlight_ &&
      this.svgGroup_ === this.ezp.svgPathHighlight_.parentElement) || (this.ezp.svgPathConnection_ &&
        this.svgGroup_ === this.ezp.svgPathConnection_.parentElement)) {
    this.removeSelect()
    this.addSelect()
  } else if (newParent && ((newParent.ezp.svgPathHighlight_ &&
      newParent.svgGroup_ === newParent.ezp.svgPathHighlight_.parentElement) || (newParent.ezp.svgPathConnection_ &&
      newParent.svgGroup_ === newParent.ezp.svgPathConnection_.parentElement))) {
    newParent.removeSelect()
    newParent.addSelect()
  }
}

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 */
ezP.BlockSvg.prototype.connectionUiEffect = function () {
  if (this.ezp) {
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
          transform: 'translate(' + xy.x + ',' + xy.y + ') scale(1,2)'},
        this.workspace.getParentSvg())
    }
    // Start the animation.
    ezP.BlockSvg.connectionUiStep_(ripple, new Date(), this.workspace.scale)
    return
  }
  ezP.BlockSvg.superClass_.connectionUiEffect.call(this)
}

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
ezP.BlockSvg.connectionUiStep_ = function (ripple, start, workspaceScale) {
  var ms = new Date() - start
  var percent = ms / 200
  if (percent > 1) {
    goog.dom.removeNode(ripple)
  } else {
    ripple.style.opacity = 8 * Math.pow(percent, 2) * Math.pow(1-percent,2)
    Blockly.BlockSvg.disconnectUiStop_.pid_ = setTimeout(
      ezP.BlockSvg.connectionUiStep_, 10, ripple, start, workspaceScale)
  }
}

/**
 * Returns a bounding box describing the dimensions of this block
 * and any blocks stacked below it.
 * @return {!{height: number, width: number}} Object with height and width
 *    properties in workspace units.
 */
ezP.BlockSvg.prototype.getHeightWidth = function () {
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
ezP.BlockSvg.prototype.setCollapsed = function (collapsed) {
  if (this.collapsed_ === collapsed) {
    return
  }
  var renderList = []
  // Show/hide the next statement inputs.
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    renderList.push.apply(renderList, input)
    if (input.type === Blockly.NEXT_STATEMENT) {
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
 * Enable or disable a block. Noop. Disabled blocks start with '#'.
 * @override
 */
ezP.BlockSvg.prototype.updateDisabled = function () {
  this.render()
}

/**
 * Noop. Bypass the inherited method.
 * @override
 */
ezP.BlockSvg.prototype.updateColour = function () {

}

/**
 * Show the context menu for this block.
 * @param {!Event} e Mouse event.
 * @private
 */
ezP.BlockSvg.prototype.showContextMenu_ = function (e) {
  // this part is copied as is from the parent's implementation. Is it relevant ?
  if (this.workspace.options.readOnly || !this.contextMenu) {
    return
  }
  ezP.MenuManager.shared().showMenu(this, e)
}

/**
 * Handle a mouse-down on an SVG block.
 * If the block is sealed to its parent, forwards to the parent.
 * This is used to prevent a dragging operation on a sealed block.
 * However, this will manage the selection of an input connection.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
ezP.BlockSvg.prototype.onMouseDown_ = function(e) {
  // get the first unwrapped or selected ancestor
  console.log('onMouseDown_', this.type)
  var B = this
  while(true) {
    if (B.ezp.wrapped_) {
      if (B === Blockly.selected) {
        break
      } else if (!(B = B.getSurroundParent())) {
        // Do nothing, this is an unconnected wrapped block
        console.log('unexpected disconnected wrapped block...')
        return
      }
    } else if (B === Blockly.selected) {
      break
    } else {
      // most probable situation: unselected and unwrapped block
      if (!B.ezp.selectedConnectionSource_ || !B.ezp.selectedConnectionSource_.ezp.selectedConnection) {
        ezP.SelectedConnection.set(null)
      }
      if (B === this) {
        ezP.BlockSvg.superClass_.onMouseDown_.call(B, e)
      }
      return
    }
  }
  var input = this.ezp.getInputForEvent(this, e)
  if (input && input.connection) {
    ezP.SelectedConnection.set(input.connection, B)
  } else {
    B.ezp.selectedConnectionSource_ = null
    ezP.SelectedConnection.set(null)
  }
  console.log('onMouseDown ->', B.type, B.ezp.selectedConnectionSource_, B.ezp.selectedConnectionSource_?B.ezp.selectedConnectionSource_.ezp.selectedConnection:'No selected connection')
  if (B === this) {
    ezP.BlockSvg.superClass_.onMouseDown_.call(B, e)
  }
  return
}

