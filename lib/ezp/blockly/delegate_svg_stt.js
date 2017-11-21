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

EZP.DelegateSvg.Statement.prototype.pathDef_ =
  EZP.DelegateSvg.Statement.prototype.statementPathDef_;

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
 * Will render the block.
 * @param {!Block} block.
 * @private
 */
EZP.DelegateSvg.Statement.Print.prototype.willRender_ = function(block) {
  this.tupleConsolidate(block);
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

/**
 * Render the fields of a value input, if relevant.
 * @param io the input/output argument.
 * @private
 */
EZP.DelegateSvg.Statement.Print.prototype.renderDrawValueInput_ = function(io) {
  if (!io.canValue || io.input.type != Blockly.INPUT_VALUE) {
    return false;
  }
  if (io.input.name == "END"
    || io.input.name == "SEP"
      || io.input.name == "FILE") {
    var input = io.block.getInput("OPTIONS");
    var field = input.fieldRow[0];
    if (field) {
      var state = field.ezpState;
      if (state) {
        var visible = state[io.input.name];
        for (var _ = 0; field = io.input.fieldRow[_];++_) {
          field.setVisible(visible);
          var c10n = io.input.connection;
          if (c10n && c10n.isConnected()) {
            var target = c10n.targetBlock();
            var root = target.getSvgRoot();
            if(root) {
              if (visible) {
                Blockly.utils.removeClass(root,'hidden');
              } else {
                Blockly.utils.addClass(root,'hidden');
              }
            }
          }
        }
        if(visible) {
          return EZP.DelegateSvg.Statement.Print.superClass_.renderDrawValueInput_.call(this,io);
        }
        return true;
      }
    }
  }
  return EZP.DelegateSvg.Statement.Print.superClass_.renderDrawValueInput_.call(this,io);
};
