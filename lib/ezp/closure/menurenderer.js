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
 * @fileoverview Renderer with css class in ctor.
 *
 * @author jerome.laurens@u-bourgogne.fr
 */

goog.provide('ezP.MenuRenderer');

goog.require('ezP');
goog.require('goog.ui.MenuRenderer');

/**
 * Default renderer for {@link ezP.Menu}s, based on {@link
 * goog.ui.Menu}.
 * JL: default menu class changed.
 * @param {string=} opt_ariaRole Optional ARIA role used for the element.
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
ezP.MenuRenderer = function(opt_ariaRole) {
  goog.ui.MenuRenderer.call(this, opt_ariaRole);
};
goog.inherits(ezP.MenuRenderer, goog.ui.MenuRenderer);
goog.addSingletonGetter(ezP.MenuRenderer);

ezP.MenuRenderer.CSS_CLASS = 'ezp-menu';

/** @override */
ezP.MenuRenderer.prototype.getCssClass = function() {
  return ezP.MenuRenderer.CSS_CLASS;
};
