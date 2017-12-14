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

goog.provide('ezP.DelegateSvg.Proc');

goog.require('ezP.DelegateSvg.Group');

/**
 * Class for a DelegateSvg, proc block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Proc = function(prototypeName)  {
  ezP.DelegateSvg.Proc.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(ezP.DelegateSvg.Proc, ezP.DelegateSvg.Group);
ezP.DelegateSvg.Manager.register(ezP.Const.Prc.DEFAULT, ezP.DelegateSvg.Proc);
ezP.DelegateSvg.Manager.register(ezP.Const.Prc.DEF, ezP.DelegateSvg.Proc);
ezP.DelegateSvg.Manager.register(ezP.Const.Prc.CLASS, ezP.DelegateSvg.Proc);
