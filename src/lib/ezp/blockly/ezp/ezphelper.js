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
 * @fileoverview helper for ezPython.
 * In order to avoid name collisions, every subclass of either a
 * closure object or a Blockly object has a minimum of extra properties.
 * All these properties and methods are gathered in the  helper.
 * Block helpers are called delegates.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.Helper');

goog.require('goog.Disposable');

/**
 * Class for a an object helper for ezPython related subclasses.
 * @constructor
 */
ezP.Helper = function()  {
  ezP.Helper.superClass_.constructor.call(this);
};
goog.inherits(ezP.Helper, goog.Disposable);
