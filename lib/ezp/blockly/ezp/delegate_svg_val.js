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

goog.provide('ezP.DelegateSvg.Value');

goog.require('ezP.DelegateSvg');

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Value = function(prototypeName)  {
  ezP.DelegateSvg.Value.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(ezP.DelegateSvg.Value, ezP.DelegateSvg);

ezP.DelegateSvg.Manager.register(ezP.Const.val.DEFAULT, ezP.DelegateSvg.Value);

ezP.DelegateSvg.Value.prototype.shapePathDef_ =
  ezP.DelegateSvg.Value.prototype.contourPathDef_ =
    ezP.DelegateSvg.Value.prototype.highlightedPathDef_ =
      ezP.DelegateSvg.Value.prototype.valuePathDef_;

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Value.prototype.renderDrawInput_ = function(io) {
  this.renderDrawDummyInput_(io)
    || this.renderDrawValueInput_(io);
};

/**
 * Class for a DelegateSvg, quoted string value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Value.Text = function(prototypeName)  {
  ezP.DelegateSvg.Value.Text.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(ezP.DelegateSvg.Value.Text, ezP.DelegateSvg.Value);

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Value.Text.prototype.renderDrawInput_ = function(io) {
  this.renderDrawDummyInput_(io);
};

ezP.DelegateSvg.Manager.register(ezP.Const.val.TEXT, ezP.DelegateSvg.Value.Text);
ezP.DelegateSvg.Manager.register(ezP.Const.val.ANY, ezP.DelegateSvg.Value.Text);

/**
 * Class for a DelegateSvg, one input value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Value.Input = function(prototypeName)  {
  ezP.DelegateSvg.Value.Input.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(ezP.DelegateSvg.Value.Input, ezP.DelegateSvg.Value);

ezP.DelegateSvg.Manager.register(ezP.Const.val.MINUS, ezP.DelegateSvg.Value.Input);

/**
 * Class for a DelegateSvg, tuple value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Value.Tuple = function(prototypeName)  {
  ezP.DelegateSvg.Value.Tuple.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(ezP.DelegateSvg.Value.Tuple, ezP.DelegateSvg.Value);

ezP.DelegateSvg.Manager.register(ezP.Const.val.TUPLE, ezP.DelegateSvg.Value.Tuple);

/**
 * Will render the block.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Value.Tuple.prototype.willRender_ = function(block) {
  ezP.DelegateSvg.Value.Tuple.superClass_.willRender_.call(this, block);
  this.tupleConsolidate(block);
}

/**
 * Render tuple inputs only.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Value.Tuple.prototype.renderDrawInput_ = function(io) {
  this.renderDrawTupleInput_(io);
};

/**
 * Fetches the named input object, forwards to getInputTuple_.
 * @param {!Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
ezP.DelegateSvg.Value.Tuple.prototype.getInput = function(block, name) {
  return this.getInputTuple_(block,name);
};

/**
 * Class for a DelegateSvg, tuple value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Value.Range = function(prototypeName)  {
  ezP.DelegateSvg.Value.Range.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(ezP.DelegateSvg.Value.Range, ezP.DelegateSvg.Value.Tuple);

ezP.DelegateSvg.Manager.register(ezP.Const.val.RANGE, ezP.DelegateSvg.Value.Range);

/**
 * Render tuple inputs only.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Value.Range.prototype.renderDrawInput_ = function(io) {
  this.renderDrawFields_(io)
    || this.renderDrawTupleInput_(io);
};

/**
 * @param {!Block} block.
 * @param {Number} the group of tuples.
 * @return {Number} The max number of inputs. null for unlimited.
 * @private
 */
ezP.DelegateSvg.Value.Range.prototype.getInputTupleMax = function(block, grp) {
  return grp? 0: 3;
}
