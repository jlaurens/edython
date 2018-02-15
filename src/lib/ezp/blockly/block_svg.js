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
  this.ezp.initBlock_(this)
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
  if (this.ezp.wrapped_ && this.getParent()) {
    // Shadow blocks should not be selected.
    this.getParent().select();
    return;
  }
  ezP.BlockSvg.superClass_.select.call(this)
}

/**
 * Select this block.  Highlight it visually.
 */
ezP.BlockSvg.prototype.addSelect = function () {
  if (!this.ezp.wrapped_) {
    if (!this.ezp.svgPathHighlight_ ||
      this.ezp.svgPathHighlight_.parentNode) {
      return
    }
    Blockly.utils.addClass(this.svgGroup_, 'ezp-selected')
    this.svgGroup_.appendChild(this.ezp.svgPathHighlight_)
  }
  for (var _ = 0, input; (input = this.inputList[_++]);) {
    for (var __ = 0, field; (field = input.fieldRow[__++]);) {
      var addSelect = field.addSelect
      if (addSelect) {
        field.addSelect()
      }
    }
  }
}

/**
 * Unselect this block.  Remove its highlighting.
 */
ezP.BlockSvg.prototype.removeSelect = function () {
  if (!this.ezp.wrapped_) {
    if (!this.ezp.svgPathHighlight_
      || !this.ezp.svgPathHighlight_.parentNode) {
      return
    }
    Blockly.utils.removeClass(this.svgGroup_, 'ezp-selected')
    goog.dom.removeNode(this.ezp.svgPathHighlight_)
  }
  for (var _ = 0, input; (input = this.inputList[_++]);) {
    for (var __ = 0, field; (field = input.fieldRow[__++]);) {
      var removeSelect = field.removeSelect
      if (removeSelect) {
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
  if (this.ezp.svgPathHighlight_ &&
      this.svgGroup_ === this.ezp.svgPathHighlight_.parentElement) {
    this.removeSelect()
    this.addSelect()
  } else if (newParent &&newParent.ezp.svgPathHighlight_ &&
      newParent.svgGroup_ === newParent.ezp.svgPathHighlight_.parentElement) {
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
 * Returns the total number of code lines for that node and the node below.
 * One atomic instruction is one line.
 * @return {Number}.
 */
ezP.BlockSvg.prototype.getStatementCount = function () {
  var n = 1
  for (var _ = 0, input; (input = this.inputList[_]); ++_) {
    var c8n = input.connection
    if (c8n && c8n.type === Blockly.NEXT_STATEMENT) {
      var hasNext = true
      if (c8n.isConnected()) {
        var block = c8n.targetBlock()
        do {
          n += block.getStatementCount()
        } while ((block = block.getNextBlock()))
      }
    }
  }
  return hasNext && n === 1 ? 2 : n
}
Blockly.BlockSvg.prototype.getStatementCount = function () {
  return 1
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
 * This is used to prevent a dragging operation of a sealed block.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
ezP.BlockSvg.prototype.onMouseDown_ = function(e) {
  if (this.ezp.wrapped_ && this.getParent()) {
    this.getParent().onMouseDown_(e)
  } else {
    ezP.BlockSvg.superClass_.onMouseDown_.call(this, e)
  }
};

