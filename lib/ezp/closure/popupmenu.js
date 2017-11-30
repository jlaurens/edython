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
 * @fileoverview The goog.ui.PopupMenu with custom class, at least.
 */

goog.provide('ezP.PopupMenu');

goog.require('goog.ui.PopupMenu');


/**
 * A basic menu class.
 * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {?goog.ui.MenuRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.MenuRenderer}.
 * @extends {goog.ui.Menu}
 * @constructor
 */
ezP.PopupMenu = function(opt_domHelper, opt_renderer) {
  goog.ui.PopupMenu.call(this, opt_domHelper,
    opt_renderer||ezP.MenuRenderer.getInstance());
};
goog.inherits(ezP.PopupMenu, goog.ui.PopupMenu);
goog.tagUnsealableClass(ezP.PopupMenu);
