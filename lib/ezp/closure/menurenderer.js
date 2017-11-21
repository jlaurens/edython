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

goog.provide('EZP.MenuRenderer');

goog.require('EZP');
goog.require('goog.ui.MenuRenderer');


/**
 * Default renderer for {@link goog.ui.Menu}s, based on {@link
 * goog.ui.ContainerRenderer}.
 * JL: Adding support for css class singletons.
 * @param {string=} opt_ariaRole Optional ARIA role used for the element.
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
EZP.MenuRenderer = function(opt_ariaRole, opt_class) {
  goog.ui.ContainerRenderer.call(
      this, opt_ariaRole || goog.a11y.aria.Role.MENU);
  if (!this.cssClass_) {
    this.cssClass_ = opt_class || goog.ui.MenuRenderer.CSS_CLASS;
  }
};
goog.inherits(EZP.MenuRenderer, goog.ui.MenuRenderer);

/**
 * Returns the singleton for that ARIA role and css class.
 * If no role nor class is given, simply returns the inherited value.
 * @param {opt_class} element Element to decorate.
 * @param {opt_ariaRole} element Element to decorate.
 * @return {EZP.MenuRenderer}.
 * @override
 */
EZP.MenuRenderer.getInstance = function() {
  var Ss = {};
  var gI = function(opt_ariaRole, opt_class) {
    var K = opt_ariaRole? opt_ariaRole: goog.a11y.aria.Role.MENU;
    var SSs = Ss[K]?Ss[K]:(Ss[K]={});
    K = opt_class? opt_class: goog.ui.MenuRenderer.CSS_CLASS;
    var S = SSs[K];
    if (!S) {
      S = (SSs[K] = (opt_ariaRole || opt_class?
        new EZP.MenuRenderer(opt_ariaRole, opt_class):
        goog.ui.MenuRenderer.getInstance()));
    }
    return S;
  };
  return gI;
}();

/** @override */
EZP.MenuRenderer.prototype.getCssClass = function() {
  return this.cssClass_;
};
