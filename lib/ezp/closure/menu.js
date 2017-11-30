// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A class for representing items in menus.
 * JL: the accelerator class has changed.
 *
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */

/**
 * @fileoverview A base menu class that supports key and mouse events...
 * ezP: 'goog' changed to 'ezP' in class names.
 */

goog.provide('ezP.Menu');

goog.require('goog.ui.Menu');
goog.require('ezP.MenuRenderer');


// TODO(robbyw): Reverse constructor argument order for consistency.
/**
 * A basic menu class.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {goog.ui.MenuRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.MenuRenderer}.
 * @constructor
 * @extends {goog.ui.Container}
 */
ezP.Menu = function(opt_domHelper, opt_renderer) {
  ezP.Menu.superClass_.constructor.call(
      this, opt_domHelper,
      opt_renderer || ezP.MenuRenderer.getInstance());
};
goog.inherits(ezP.Menu, goog.ui.Menu);
goog.tagUnsealableClass(ezP.Menu);
