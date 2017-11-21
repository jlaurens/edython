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

goog.provide('EZP.DelegateSvg.Value');

goog.require('EZP.DelegateSvg');

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, EZP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
EZP.DelegateSvg.Value = function(prototypeName)  {
  EZP.DelegateSvg.Value.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(EZP.DelegateSvg.Value, EZP.DelegateSvg);

EZP.DelegateSvg.Manager.register('ezp_val', EZP.DelegateSvg.Value);

EZP.DelegateSvg.Value.prototype.pathDef_ =
  EZP.DelegateSvg.Value.prototype.valuePathDef_;

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
EZP.DelegateSvg.Value.prototype.renderDrawInput_ = function(io) {
  this.renderDrawDummyInput_(io)
    || this.renderDrawValueInput_(io);
};

/**
 * Class for a DelegateSvg, quoted string value block.
 * Not normally called directly, EZP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
EZP.DelegateSvg.Value.Text = function(prototypeName)  {
  EZP.DelegateSvg.Value.Text.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(EZP.DelegateSvg.Value.Text, EZP.DelegateSvg.Value);

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
EZP.DelegateSvg.Value.Text.prototype.renderDrawInput_ = function(io) {
  this.renderDrawDummyInput_(io);
};

EZP.DelegateSvg.Manager.register('ezp_val_text', EZP.DelegateSvg.Value.Text);
EZP.DelegateSvg.Manager.register('ezp_val_any', EZP.DelegateSvg.Value.Text);

/**
 * Class for a DelegateSvg, one input value block.
 * Not normally called directly, EZP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
EZP.DelegateSvg.Value.Input = function(prototypeName)  {
  EZP.DelegateSvg.Value.Input.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(EZP.DelegateSvg.Value.Input, EZP.DelegateSvg.Value);

EZP.DelegateSvg.Manager.register('ezp_val_minus', EZP.DelegateSvg.Value.Input);

/**
 * Class for a DelegateSvg, tuple value block.
 * Not normally called directly, EZP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
EZP.DelegateSvg.Value.Tuple = function(prototypeName)  {
  EZP.DelegateSvg.Value.Tuple.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(EZP.DelegateSvg.Value.Tuple, EZP.DelegateSvg.Value);

EZP.DelegateSvg.Manager.register('ezp_val_tuple', EZP.DelegateSvg.Value.Tuple);

/**
 * Will render the block.
 * @param {!Block} block.
 * @private
 */
EZP.DelegateSvg.Value.Tuple.prototype.willRender_ = function(block) {
  this.tupleConsolidate(block);
}

/**
 * Render tuple inputs only.
 * @param io.
 * @private
 */
EZP.DelegateSvg.Value.Tuple.prototype.renderDrawInput_ = function(io) {
  this.renderDrawTupleInput_(io);
};

/**
 * Fetches the named input object, forwards to getInputTuple_.
 * @param {!Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
EZP.DelegateSvg.Value.Tuple.prototype.getInput = function(block, name) {
  return this.getInputTuple_(block,name);
};

/**
 * Class for a DelegateSvg, tuple value block.
 * Not normally called directly, EZP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
EZP.DelegateSvg.Value.Range = function(prototypeName)  {
  EZP.DelegateSvg.Value.Range.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(EZP.DelegateSvg.Value.Range, EZP.DelegateSvg.Value.Tuple);

EZP.DelegateSvg.Manager.register('ezp_val_range', EZP.DelegateSvg.Value.Range);

/**
 * @param {!Block} block.
 * @param {Number} the group of tuples.
 * @return {Number} The max number of inputs. null for unlimited.
 * @private
 */
EZP.DelegateSvg.Value.Range.prototype.getInputTupleMax = function(block, grp) {
  return null;
}
