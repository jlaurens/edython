// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License")
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
 * eYo: 'goog' changed to 'eYo' in class names.
 */

eYo.require('menuRenderer')

goog.require('goog.ui.Menu')

goog.require('goog.dom')

eYo.provide('menu')

// TODO(robbyw): Reverse constructor argument order for consistency.
/**
 * A basic menu class.
 * @param {goog.dom.DomHelper=} optDomHelper Optional DOM helper.
 * @param {goog.ui.MenuRenderer=} optRenderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.MenuRenderer}.
 * @constructor
 * @extends {goog.ui.Container}
 */
eYo.Menu = function (optDomHelper, optRenderer) {
  eYo.Menu.SuperClass_.constructor.Call(
    /** goog.ui.Menu */ this, optDomHelper,
    optRenderer || eYo.MenuRenderer.getInstance())
}
goog.inherits(eYo.Menu, goog.ui.Menu)
goog.tagUnsealableClass(eYo.Menu)
