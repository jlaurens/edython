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

goog.provide('EZP.BlockSvg');
goog.provide('EZP.DelegateSvg');

goog.require('EZP.Block');
goog.require('Blockly.BlockSvg');

EZP.BlockSvg.CORNER_RADIUS = 3;

EZP.inherits(Blockly.BlockSvg,EZP.Block);

/**
 * Class for a DelegateSvg.
 * Not normally called directly, EZP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
EZP.DelegateSvg = function(prototypeName)  {
  EZP.DelegateSvg.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(EZP.DelegateSvg, EZP.Delegate);

EZP.DelegateSvg.Manager = function() {
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
      ctors[prototypeName] = EZP.DelegateSvg;
      return new EZP.DelegateSvg(prototypeName);
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
EZP.BlockSvg = function(workspace, prototypeName, opt_id)  {
  if (!this.ezp) {
    this.ezp = EZP.DelegateSvg.Manager.create(prototypeName);
  }
  EZP.BlockSvg.superClass_.constructor.call(this,
                                            workspace, prototypeName, opt_id);
  this.svgPathLight_ = new EZP.BlockSvg.FakePath_();
  this.svgPathDark_.parentNode.removeChild(this.svgPathDark_);
  this.svgPathDark_ = new EZP.BlockSvg.FakePath_();
  this.svgPath_.setAttribute('class', 'ezp-path');
  /**
   * @type {SVGElement}
   * @private
   */
  this.svgPathHighlight_ = Blockly.utils.createSvgElement('path',
  {'class': 'blocklyPath blocklySelected'},null);
  Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
                         'ezp-block');
};
goog.inherits(EZP.BlockSvg, Blockly.BlockSvg);

EZP.BlockSvg.FakePath_ = function() {
  this.style={};
};
EZP.BlockSvg.FakePath_.prototype.setAttribute = function(k,v) {};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {boolean=} opt_bubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
EZP.BlockSvg.prototype.render = function(opt_bubble) {
  this.ezp.render(this,opt_bubble);
};

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
EZP.BlockSvg.prototype.getInput = function(name) {
  var input = this.ezp.getInput(this,name);
  return input !== undefined? input:
  EZP.BlockSvg.superClass_.getInput.call(this,name);
};

/**
 * Select this block.  Highlight it visually.
 */
EZP.BlockSvg.prototype.addSelect = function() {
  this.svgGroup_.appendChild(this.svgPathHighlight_);
};

/**
 * Unselect this block.  Remove its highlighting.
 */
EZP.BlockSvg.prototype.removeSelect = function() {
  try {
    this.svgGroup_.removeChild(this.svgPathHighlight_);
  }
  catch(e) {}
};

/**
 * Set parent of this block to be a new block or null.
 * Place the highlighting path at the end.
 * @param {Blockly.BlockSvg} newParent New parent block.
 */
EZP.BlockSvg.prototype.setParent = function(newParent) {
  EZP.BlockSvg.superClass_.setParent.call(this,newParent);
  if (this.svgPathHighlight_ && this.svgGroup_ == this.svgPathHighlight_.parentElement) {
    this.removeSelect();
    this.addSelect();
  } else if (newParent && newParent.svgPathHighlight_ && newParent.svgGroup_ == newParent.svgPathHighlight_.parentElement) {
    newParent.removeSelect();
    newParent.addSelect();
  }
};

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 */
EZP.BlockSvg.prototype.connectionUiEffect = function() {
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
    EZP.BlockSvg.connectionUiStep_(ripple, new Date, this.workspace.scale);
    return;
  }
  EZP.BlockSvg.superClass_.connectionUiEffect.call(this);
};

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
EZP.BlockSvg.connectionUiStep_ = function(ripple, start, workspaceScale) {
  var ms = new Date - start;
  var percent = ms / 200;
  if (percent > 1) {
    goog.dom.removeNode(ripple);
  } else {
    ripple.style.opacity = 8*percent**2*(1 - percent)**2;
    Blockly.BlockSvg.disconnectUiStop_.pid_ = setTimeout(
                                                         EZP.BlockSvg.connectionUiStep_, 10, ripple, start, workspaceScale);
  }
};

/**
 * Returns a bounding box describing the dimensions of this block
 * and any blocks stacked below it.
 * @return {!{height: number, width: number}} Object with height and width
 *    properties in workspace units.
 */
EZP.BlockSvg.prototype.getHeightWidth = function() {
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
EZP.BlockSvg.prototype.getStatementCount = function() {
  var n = 1;
  for (var i = 0; i < this.inputList.length; i++) {
    var c10n = this.inputList[i].connection;
    if (c10n && c10n.type == Blockly.NEXT_STATEMENT) {
      var hasNext = true;
      if (c10n.isConnected()) {
        var block = c10n.targetConnection.getSourceBlock();
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
 * Shortcut for appending a dummy input with one label field.
 * @param {string=} opt_name Language-neutral identifier which may used to find
 *     this input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
EZP.BlockSvg.prototype.appendTupleInput = function() {
  var input = this.appendInput_(Blockly.INPUT_VALUE, '_');
  input.ezpTuple = {};
  return input;
};
