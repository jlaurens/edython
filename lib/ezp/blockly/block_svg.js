/**
 * @license
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview BlockSvg for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.BlockSvg');
goog.provide('ezP.DelegateSvg');

goog.require('ezP.Block');
goog.require('Blockly.BlockSvg');

ezP.BlockSvg.CORNER_RADIUS = 3;

ezP.inherits(Blockly.BlockSvg,ezP.Block);

/**
 * Class for a DelegateSvg.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg = function(prototypeName)  {
  ezP.DelegateSvg.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(ezP.DelegateSvg, ezP.Delegate);

ezP.DelegateSvg.Manager = function() {
  var me = {};
  var ctors = {};
  /**
   * DelegateSvg creator.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.create = function(prototypeName)  {
    var ctor = ctors[prototypeName];
    if (ctor !== undefined) {
      return new ctor(prototypeName);
    }
    var Ks = prototypeName.split('_');
    if (Ks[0] == 'ezp') {
      while (Ks.length>1) {
        Ks.splice(-1,1);
        var name = Ks.join('_');
        ctor = ctors[name];
        if (ctor !== undefined) {
          ctors[prototypeName] = ctor;
          return new ctor(prototypeName);
        }
      }
      ctors[prototypeName] = ezP.DelegateSvg;
      return new ezP.DelegateSvg(prototypeName);
    }
    return undefined;
  };
  /**
   * Delegate registrator.
   * @param {?string} prototypeName Name of the language object containing
   * @param {Object} constructor
   */
  me.register = function(prototypeName,ctor) {
    ctors[prototypeName] = ctor;
  }
  return me;
}();

/**
 * Class for a block's SVG representation.
 * Not normally called directly, workspace.newBlock() is preferred.
 * For ezPython.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.BlockSvg = function(workspace, prototypeName, opt_id)  {
  if (!this.ezp) {
    this.ezp = ezP.DelegateSvg.Manager.create(prototypeName);
  }
  ezP.BlockSvg.superClass_.constructor.call(this,
                                            workspace, prototypeName, opt_id);
};
goog.inherits(ezP.BlockSvg, Blockly.BlockSvg);

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {boolean=} opt_bubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
ezP.BlockSvg.prototype.render = function(opt_bubble) {
  this.ezp.render(this,opt_bubble);
};

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
ezP.BlockSvg.prototype.getInput = function(name) {
  var input = this.ezp.getInput(this,name);
  return input !== undefined? input:
  ezP.BlockSvg.superClass_.getInput.call(this,name);
};

/**
 * Select this block.  Highlight it visually.
 */
ezP.BlockSvg.prototype.addSelect = function() {
  if (this.ezp.svgPathHighlight_.parentNode) {
    return;
  }
  Blockly.utils.addClass(this.svgGroup_,'ezp-selected');
  this.svgGroup_.appendChild(this.ezp.svgPathHighlight_);
  for (var _ = 0, input; input = this.inputList[_++];) {
    for (var __ = 0, field; field = input.fieldRow[__++];) {
      var addSelect = field.addSelect;
      if (addSelect) {
        field.addSelect();
      }
    }
  }
};

/**
 * Unselect this block.  Remove its highlighting.
 */
ezP.BlockSvg.prototype.removeSelect = function() {
  if (!this.ezp.svgPathHighlight_.parentNode) {
    return;
  }
  Blockly.utils.removeClass(this.svgGroup_,'ezp-selected');
  for (var _ = 0, input; input = this.inputList[_++];) {
    for (var __ = 0, field; field = input.fieldRow[__++];) {
      var removeSelect = field.removeSelect;
      if (removeSelect) {
        field.removeSelect();
      }
    }
  }
  goog.dom.removeNode(this.ezp.svgPathHighlight_);
};

/**
 * Set parent of this block to be a new block or null.
 * Place the highlighting path at the end.
 * @param {Blockly.BlockSvg} newParent New parent block.
 */
ezP.BlockSvg.prototype.setParent = function(newParent) {
  ezP.BlockSvg.superClass_.setParent.call(this,newParent);
  if (this.ezp.svgPathHighlight_
      && this.svgGroup_ == this.ezp.svgPathHighlight_.parentElement) {
    this.removeSelect();
    this.addSelect();
  } else if (newParent && newParent.ezp.svgPathHighlight_
      && newParent.svgGroup_ == newParent.ezp.svgPathHighlight_.parentElement) {
    newParent.removeSelect();
    newParent.addSelect();
  }
};

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 */
ezP.BlockSvg.prototype.connectionUiEffect = function() {
  if (this.ezp) {
    this.workspace.getAudioManager().play('click');
    if (this.workspace.scale < 1) {
      return;  // Too small to care about visual effects.
    }
    var xy = this.workspace.getSvgXY(/** @type {!Element} */ (this.svgGroup_));
    if (this.outputConnection) {
      var h = this.height*this.workspace.scale/2;
      var ripple = Blockly.utils.createSvgElement('circle',
                                                  {'class': 'blocklyHighlightedConnectionPathH', 'cx': xy.x, 'cy': xy.y+h, 'r': 2*h/3},
                                                  this.workspace.getParentSvg());
    } else {
    // Determine the absolute coordinates of the inferior block.
      var steps = Blockly.Connection.highlightedPath_.attributes['d'].value;
      var ripple = Blockly.utils.createSvgElement('path',
                                                  {'class': 'blocklyHighlightedConnectionPath',
                                                  'd': steps,
                                                  transform: 'translate(' + xy.x + ',' + xy.y + ') scale(1,2)'},
                                                  this.workspace.getParentSvg());
    }
    // Start the animation.
    ezP.BlockSvg.connectionUiStep_(ripple, new Date, this.workspace.scale);
    return;
  }
  ezP.BlockSvg.superClass_.connectionUiEffect.call(this);
};

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
ezP.BlockSvg.connectionUiStep_ = function(ripple, start, workspaceScale) {
  var ms = new Date - start;
  var percent = ms / 200;
  if (percent > 1) {
    goog.dom.removeNode(ripple);
  } else {
    ripple.style.opacity = 8*percent**2*(1 - percent)**2;
    Blockly.BlockSvg.disconnectUiStop_.pid_ = setTimeout(
                                                         ezP.BlockSvg.connectionUiStep_, 10, ripple, start, workspaceScale);
  }
};

/**
 * Returns a bounding box describing the dimensions of this block
 * and any blocks stacked below it.
 * @return {!{height: number, width: number}} Object with height and width
 *    properties in workspace units.
 */
ezP.BlockSvg.prototype.getHeightWidth = function() {
  var height = this.height;
  var width = this.width;
  // Recursively add size of subsequent blocks.
  var nextBlock = this.getNextBlock();
  if (nextBlock) {
    var nextHeightWidth = nextBlock.getHeightWidth();
    height += nextHeightWidth.height;  // NO Height of tab.
    width = Math.max(width, nextHeightWidth.width);
  }
  return {height: height, width: width};
};

/**
 * Returns the total number of code lines for that node and the node below.
 * One atomic instruction is one line.
 * @return {Number}.
 */
ezP.BlockSvg.prototype.getStatementCount = function() {
  var n = 1;
  for (var _ = 0, input; input = this.inputList[_]; ++_) {
    var c8n = input.connection;
    if (c8n && c8n.type == Blockly.NEXT_STATEMENT) {
      var hasNext = true;
      if (c8n.isConnected()) {
        var block = c8n.targetBlock();
        do {
          n += block.getStatementCount();
        } while((block = block.getNextBlock()));
      }
    }
  }
  return hasNext && n==1?2:n;
};
Blockly.BlockSvg.prototype.getStatementCount = function() {
  return 1;
};

/**
 * Set whether the block is collapsed or not.
 * By pass Blockly.BlockSvg.prototype.setCollapsed
 * @param {boolean} collapsed True if collapsed.
 */
ezP.BlockSvg.prototype.setCollapsed = function(collapsed) {
  if (this.collapsed_ == collapsed) {
    return;
  }
  var renderList = [];
  // Show/hide the next statement inputs.
  for (var i = 0, input; input = this.inputList[i]; i++) {
    renderList.push.apply(renderList, input);
    if (input.type == Blockly.NEXT_STATEMENT) {
      input.setVisible(!collapsed);
    }
  }
  Blockly.BlockSvg.superClass_.setCollapsed.call(this, collapsed);
  if (!renderList.length) {
    // No child blocks, just render this block.
    renderList[0] = this;
  }
  if (this.rendered) {
    for (var i = 0, block; block = renderList[i]; i++) {
      block.render();
    }
    // Don't bump neighbours.
    // Although bumping neighbours would make sense, users often collapse
    // all their functions and store them next to each other.  Expanding and
    // bumping causes all their definitions to go out of alignment.
  }
};

/**
 * Show the context menu for this block.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.BlockSvg.prototype.showContextMenu_ = function(e) {
  if (this.workspace.options.readOnly || !this.contextMenu) {
    return;
  }
  // Save the current block in a variable for use in closures.
  var block = this;
  var menuOptions = [];

  if (this.isDeletable() && this.isMovable() && !block.isInFlyout) {
    // Option to duplicate this block.
    var duplicateOption = {
      text: Blockly.Msg.DUPLICATE_BLOCK,
      enabled: this.getDescendants().length < this.workspace.remainingCapacity(),
      callback: function() {
        Blockly.duplicate_(block);
      }
    };
    menuOptions.push(duplicateOption);

    if (this.isEditable() && !this.collapsed_ &&
        this.workspace.options.comments) {
      // Option to add/remove a comment.
      var commentOption = {enabled: !goog.userAgent.IE && !this.outputConnection};
      if (this.comment) {
        commentOption.text = Blockly.Msg.REMOVE_COMMENT;
        commentOption.callback = function() {
          block.setCommentText(null);
        };
      } else {
        commentOption.text = Blockly.Msg.ADD_COMMENT;
        commentOption.callback = function() {
          block.setCommentText('');
        };
      }
      menuOptions.push(commentOption);
    }

    if (this.workspace.options.collapse) {
      // Option to collapse/expand block.
      if (this.collapsed_) {
        var expandOption = {enabled: true};
        expandOption.text = Blockly.Msg.EXPAND_BLOCK;
        expandOption.callback = function() {
          block.setCollapsed(false);
        };
        menuOptions.push(expandOption);
      } else {
        var collapseOption = {enabled: block.getStatementCount()>2};
        collapseOption.text = Blockly.Msg.COLLAPSE_BLOCK;
        collapseOption.callback = function() {
          block.setCollapsed(true);
        };
        menuOptions.push(collapseOption);
      }
    }

    if (this.workspace.options.disable) {
      // Option to disable/enable block.
      var disableOption = {
        text: this.disabled ?
            Blockly.Msg.ENABLE_BLOCK : Blockly.Msg.DISABLE_BLOCK,
        enabled: !block.outputConnection,
        callback: function() {
          block.setDisabled(!block.disabled);
        }
      };
      menuOptions.push(disableOption);
    }

    // Option to delete this block.
    // Count the number of blocks that are nested in this block.
    var descendantCount = this.getDescendants().length;
    var nextBlock = this.getNextBlock();
    if (nextBlock) {
      // Blocks in the current stack would survive this block's deletion.
      descendantCount -= nextBlock.getDescendants().length;
    }
    var deleteOption = {
      text: descendantCount == 1 ? Blockly.Msg.DELETE_BLOCK :
          Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(descendantCount)),
      enabled: true,
      callback: function() {
        Blockly.Events.setGroup(true);
        block.dispose(true, true);
        Blockly.Events.setGroup(false);
      }
    };
    menuOptions.push(deleteOption);
  }

  // Option to get help.
  var url = goog.isFunction(this.helpUrl) ? this.helpUrl() : this.helpUrl;
  var helpOption = {enabled: !!url};
  helpOption.text = Blockly.Msg.HELP;
  helpOption.callback = function() {
    block.showHelp_();
  };
  menuOptions.push(helpOption);

  // Allow the block to add or modify menuOptions.
  if (this.customContextMenu) {
    this.customContextMenu(menuOptions);
  }

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
  Blockly.ContextMenu.currentBlock = this;
};

/**
 * Enable or disable a block. Noop. Disabled blocks start with '#'.
 * @override
 */
ezP.BlockSvg.prototype.updateDisabled = function() {
  this.render();
};

/**
 * Noop. Bypass the inherited method.
 * @override
 */
ezP.BlockSvg.prototype.updateColour = function() {
  return;
};
