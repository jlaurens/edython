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

goog.provide('EZP.DelegateSvg.Statement');
goog.require('EZP.DelegateSvg');

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, EZP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
EZP.DelegateSvg.Statement = function(prototypeName)  {
  EZP.DelegateSvg.Statement.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(EZP.DelegateSvg.Statement, EZP.DelegateSvg);
EZP.DelegateSvg.Manager.register('ezp_stt', EZP.DelegateSvg.Statement);

EZP.setup.register(function() {
  EZP.Style.insertCssRuleAt('.ezp-sharp-group{'+EZP.Font.style+'}');
});

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be intialized.
 * @extends {Blockly.Block}
 * @constructor
 */
EZP.DelegateSvg.Statement.prototype.init = function(block)  {
  EZP.DelegateSvg.Statement.superClass_.init.call(this,block);
  block.svgSharpGroup_ = Blockly.utils.createSvgElement('g',
    {'class': 'ezp-sharp-group'}, null);
  goog.dom.insertSiblingAfter(block.svgSharpGroup_,block.svgPathContour_);
};

/**
 * Statement block path.
 * @param {!Blockly.Block} block.
 * @private
 */
EZP.DelegateSvg.prototype.statementPathDef_ = function(block) {
  /* eslint-disable indent */
  var w = block.width;
  var h = block.height;
  var steps = ['m '+w+',0 v '+h];
  var r = EZP.Style.Path.radius();
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

EZP.DelegateSvg.Statement.prototype.shapePathDef_ =
  EZP.DelegateSvg.Statement.prototype.contourPathDef_ =
    EZP.DelegateSvg.Statement.prototype.highlightedPathDef_ =
      EZP.DelegateSvg.Statement.prototype.statementPathDef_;

/**
 * Render the leading # character for disabled statement blocks.
 * @param io.
 * @private
 * @override
 */
EZP.DelegateSvg.prototype.renderDrawSharp_ = function(io) {
  if (io.block.disabled) {
    var children = goog.dom.getChildren(io.block.svgSharpGroup_);
    var length = children.length;
    if (!length) {
      var y = EZP.Font.totalAscent;
      var text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        io.block.svgSharpGroup_);
      io.block.svgSharpGroup_.appendChild(text);
      text.appendChild(document.createTextNode('#'));
      length = 1;
    }
    var expected = io.block.getStatementCount();
    while(length<expected) {
      y = EZP.Font.totalAscent+length*EZP.Font.lineHeight();
      text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        io.block.svgSharpGroup_);
      io.block.svgSharpGroup_.appendChild(text);
      text.appendChild(document.createTextNode('#'));
      ++length;
    }
    while(length>expected) {
      text = children[--length];
      io.block.svgSharpGroup_.removeChild(text);
    }
    io.block.svgSharpGroup_.setAttribute('transform', 'translate(' + (io.cursorX) +
        ', '+EZP.Padding.t()+')');
    io.cursorX += EZP.Font.space;
  } else {
    goog.dom.removeChildren(io.block.svgSharpGroup_);
  }
};

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
EZP.DelegateSvg.Statement.prototype.renderDrawInput_ = function(io) {
  this.renderDrawDummyInput_(io)
    || this.renderDrawValueInput_(io);
};

/**
 * Class for a DelegateSvg, print statement block.
 * Not normally called directly, EZP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
EZP.DelegateSvg.Statement.Print = function(prototypeName)  {
  EZP.DelegateSvg.Statement.Print.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(EZP.DelegateSvg.Statement.Print, EZP.DelegateSvg.Statement);

EZP.DelegateSvg.Manager.register('ezp_stt_print', EZP.DelegateSvg.Statement.Print);

/**
 * The default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {boolean} hidden True if connections are hidden.
 * @override
 */
EZP.DelegateSvg.Statement.Print.prototype.setConnectionsHidden = function(block, hidden) {
  EZP.DelegateSvg.Statement.Print.superClass_.setConnectionsHidden.call(block, hidden);
  this.updateKeyValueInputHidden_(block);
};

/**
 * Update .
 * @param {!Blockly.Block} block.
 * @private
 */
EZP.DelegateSvg.Statement.Print.prototype.updateKeyValueInputHidden_ = function(block) {
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
EZP.DelegateSvg.Statement.Print.prototype.willRender_ = function(block) {
  this.tupleConsolidate(block);
  this.updateKeyValueInputHidden_(block);
  EZP.DelegateSvg.Statement.Print.superClass_.willRender_.call(this,block);
}

/**
 * Fetches the named input object, forwards to getInputTuple_.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
EZP.DelegateSvg.Statement.Print.prototype.getInput = function(block, name) {
  var input = this.getInputTuple_(block,name);
  return input === null?
    EZP.DelegateSvg.Statement.Print.superClass_.getInput.call(this,block,name):
    input;
};

/**
 * Render one input of print block.
 * @param io.
 * @private
 */
EZP.DelegateSvg.Statement.Print.prototype.renderDrawInput_ = function(io) {
  this.renderDrawDummyInput_(io)
    || this.renderDrawTupleInput_(io)
      || this.renderDrawValueInput_(io);
};
