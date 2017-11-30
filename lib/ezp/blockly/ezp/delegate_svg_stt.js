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
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.DelegateSvg.Statement');
goog.require('ezP.DelegateSvg');

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Statement = function(prototypeName)  {
  ezP.DelegateSvg.Statement.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(ezP.DelegateSvg.Statement, ezP.DelegateSvg);
ezP.DelegateSvg.Manager.register('ezp_stt', ezP.DelegateSvg.Statement);

ezP.setup.register(function() {
  ezP.Style.insertCssRuleAt('.ezp-sharp-group{'+ezP.Font.style+'}');
});

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.DelegateSvg.Statement.prototype.init = function(block)  {
  ezP.DelegateSvg.Statement.superClass_.init.call(this,block);
  this.svgSharpGroup_ = Blockly.utils.createSvgElement('g',
    {'class': 'ezp-sharp-group'}, null);
  goog.dom.insertSiblingAfter(this.svgSharpGroup_,this.svgPathContour_);
};

/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects...
 * @protected
 */
ezP.DelegateSvg.Statement.prototype.disposeInternal = function() {
  goog.dom.removeNode(this.svgSharpGroup_);
  this.svgSharpGroup_ = undefined;
  ezP.DelegateSvg.superClass_.disposeInternal.call(this);
};

/**
 * Statement block path.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Statement.prototype.statementPathDef_ = function(block) {
  /* eslint-disable indent */
  var w = block.width;
  var h = block.height;
  var steps = ['m '+w+',0 v '+h];
  var r = ezP.Style.Path.radius();
  var a = ' a '+r+', '+r+' 0 0 1 ';
  var c10n = block.nextConnection;
  if (c10n && c10n.isConnected()) {
    steps.push('h '+(-w));
  } else {
    steps.push('h '+(-w+r) + a+(-r)+','+(-r));
    h -= r;
  }
  c10n = block.previousConnection;
  if (c10n && c10n.isConnected() && c10n.targetBlock().getNextBlock() == block) {
    steps.push('v '+(-h)+' z');
  } else {
    steps.push('v '+(-h+r)+ a+r+','+(-r)+' z');
  }
  return steps.join(' ');
}  /* eslint-enable indent */

ezP.DelegateSvg.Statement.prototype.shapePathDef_ =
  ezP.DelegateSvg.Statement.prototype.contourPathDef_ =
    ezP.DelegateSvg.Statement.prototype.highlightedPathDef_ =
      ezP.DelegateSvg.Statement.prototype.statementPathDef_;

/**
 * Render the leading # character for disabled statement blocks.
 * @param io.
 * @private
 * @override
 */
ezP.DelegateSvg.Statement.prototype.renderDrawSharp_ = function(io) {
  if (io.block.disabled) {
    var children = goog.dom.getChildren(this.svgSharpGroup_);
    var length = children.length;
    if (!length) {
      var y = ezP.Font.totalAscent;
      var text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        this.svgSharpGroup_);
      this.svgSharpGroup_.appendChild(text);
      text.appendChild(document.createTextNode('#'));
      length = 1;
    }
    var expected = io.block.getStatementCount();
    while(length<expected) {
      y = ezP.Font.totalAscent+length*ezP.Font.lineHeight();
      text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        this.svgSharpGroup_);
      this.svgSharpGroup_.appendChild(text);
      text.appendChild(document.createTextNode('#'));
      ++length;
    }
    while(length>expected) {
      text = children[--length];
      this.svgSharpGroup_.removeChild(text);
    }
    this.svgSharpGroup_.setAttribute('transform', 'translate(' + (io.cursorX) +
        ', '+ezP.Padding.t()+')');
    io.cursorX += ezP.Font.space;
  } else {
    goog.dom.removeChildren(this.svgSharpGroup_);
  }
};

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Statement.prototype.renderDrawInput_ = function(io) {
  this.renderDrawDummyInput_(io)
    || this.renderDrawValueInput_(io);
};

/**
 * Class for a DelegateSvg, print statement block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Statement.Print = function(prototypeName)  {
  ezP.DelegateSvg.Statement.Print.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(ezP.DelegateSvg.Statement.Print, ezP.DelegateSvg.Statement);

ezP.DelegateSvg.Manager.register('ezp_stt_print', ezP.DelegateSvg.Statement.Print);

/**
 * The default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {boolean} hidden True if connections are hidden.
 * @override
 */
ezP.DelegateSvg.Statement.Print.prototype.setConnectionsHidden = function(block, hidden) {
  ezP.DelegateSvg.Statement.Print.superClass_.setConnectionsHidden.call(block, hidden);
  this.updateKeyValueInputHidden_(block);
};

/**
 * Update .
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Statement.Print.prototype.updateKeyValueInputHidden_ = function(block) {
  var helper = this.isInputVisibilityHelper;
  if (!helper) {
    var x = block.getInput("OPTIONS").fieldRow;
    for (var _ = 0; helper = x[_++];) {
      if (helper.isInputVisible) {
        this.isInputVisibilityHelper = helper;
        break;
      }
    }
  }
  for (var _ = 0; x = block.inputList[_++];) {
    var yorn = helper.isInputVisible(x);
    if (yorn) {
      x.setVisible(true);
    } else if (yorn == false) {
      x.setVisible(true);// tricky to force an update, issue #8
      x.setVisible(false);
    }
  }
};

/**
 * Will render the block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Statement.Print.prototype.willRender_ = function(block) {
  this.tupleConsolidate(block);
  this.updateKeyValueInputHidden_(block);
  ezP.DelegateSvg.Statement.Print.superClass_.willRender_.call(this,block);
}

/**
 * Fetches the named input object, forwards to getInputTuple_.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
ezP.DelegateSvg.Statement.Print.prototype.getInput = function(block, name) {
  var input = this.getInputTuple_(block,name);
  return input === null?
    ezP.DelegateSvg.Statement.Print.superClass_.getInput.call(this,block,name):
    input;
};

/**
 * Render one input of print block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Statement.Print.prototype.renderDrawInput_ = function(io) {
  this.renderDrawDummyInput_(io)
    || this.renderDrawTupleInput_(io)
      || this.renderDrawValueInput_(io);
};
