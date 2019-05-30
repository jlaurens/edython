// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Renderer for {@link goog.ui.MenuButton}s and subclasses.
 *
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('eYo.MenuButtonRenderer')

goog.require('eYo')

goog.require('goog.ui.MenuButtonRenderer')

/**
 * Renderer for {@link goog.ui.MenuButton}s.  This implementation overrides
 * {@link goog.ui.CustomButtonRenderer#createButton} to create a separate
 * caption and dropdown element.
 * @constructor
 * @extends {goog.ui.CustomButtonRenderer}
 */
eYo.MenuButtonRenderer = function() {
  eYo.MenuButtonRenderer.superClass_.constructor.call(this);
};
goog.inherits(eYo.MenuButtonRenderer, goog.ui.MenuButtonRenderer);
goog.addSingletonGetter(eYo.MenuButtonRenderer);

/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
eYo.MenuButtonRenderer.CSS_CLASS = goog.getCssName('eyo-menu-button');

/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
eYo.MenuButtonRenderer.prototype.getCssClass = function() {
  return eYo.MenuButtonRenderer.CSS_CLASS;
};

/**
 * Returns the button's contents wrapped in the following DOM structure:
 *
 *    <div class="goog-inline-brick goog-custom-button">
 *      <div class="goog-inline-brick goog-custom-button-outer-box">
 *        <div class="goog-inline-brick goog-custom-button-inner-box">
 *          Contents...
 *        </div>
 *      </div>
 *    </div>
 *
 * Overrides {@link goog.ui.ButtonRenderer#createDom}.
 * @param {goog.ui.Control} control goog.ui.Button to render.
 * @return {!Element} Root element for the button.
 * @override
 */
eYo.MenuButtonRenderer.prototype.createDom = function(control) {
  var button = /** @type {goog.ui.Button} */ (control);
  var classNames = this.getClassNames(button);
  var buttonElement = button.getDomHelper().createDom(
      goog.dom.TagName.DIV,
      classNames.join(' '),
      this.createButton(button.getContent(), button.getDomHelper()));
    this.setTooltip(buttonElement, /** @type {!string}*/ (button.getTooltip()));
  return buttonElement;
};

/**
 * Takes a text caption or existing DOM structure, and returns the content and
 * a dropdown arrow element wrapped in a pseudo-rounded-corner box.  Creates
 * the following DOM structure:
 *
 *    <div class="goog-inline-brick goog-menu-button-outer-box">
 *      <div class="goog-inline-brick goog-menu-button-inner-box">
 *        <div class="goog-inline-brick goog-menu-button-caption">
 *          Contents...
 *        </div>
 *        <div class="goog-inline-brick goog-menu-button-dropdown">
 *          &nbsp;
 *        </div>
 *      </div>
 *    </div>
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure
 *     to wrap in a box.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {Element} Pseudo-rounded-corner box containing the content.
 * @override
 */
eYo.MenuButtonRenderer.prototype.createButton = function(content, dom) {
  var cssClass = this.getCssClass()
  var dropdown = dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'dropdown'))
  var svg = eYo.Svg.newElement('svg', null, dropdown)
  var h = eYo.Font.lineHeight / 9 * 4
  svg.style.width = h
  svg.style.height = h * 0.866
  var path = eYo.Svg.newElement('path', {
    class: goog.getCssName(cssClass, 'dropdown-image')
  } , svg)
  path.setAttribute('d', 'M 0,0 l '+h+',0 l -'+ (h/2) +','+(h*0.866)+' z')
  return dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'outer-box'),
    dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'inner-box'),
      [
        dom.createDom(
          goog.dom.TagName.DIV,
          goog.getCssName(cssClass, 'caption'),
          content
        ),
        dropdown
      ]
    )
  );
};

eYo.setup.register(() => {
  eYo.Css.insertRuleAt('.eyo-menu-button {',
      'background: white;',
      'box-sizing: border-box;',
      '-moz-box-sizing: border-box;',
      '-webkit-box-sizing: border-box;',
      'width: 100%;',
      'height: 100%;',
      'z-index: 40;',
      'border:1px solid #AAA;',
      '-moz-border-radius: 5px;',
      'border-radius: 5px;',
    '}')
    eYo.Css.insertRuleAt(
      '.eyo-menu-button-focused {',
      'outline: none;',
    '}')
    eYo.Css.insertRuleAt('.eyo-menu-button-outer-box {',
    'padding-left: 10px;',
    'width: 100%;',
    'height: 100%;',
    'box-sizing: border-box;',
    '-moz-box-sizing: border-box;',
    '-webkit-box-sizing: border-box;',
  '}')
  eYo.Css.insertRuleAt(
    '.eyo-menu-button-inner-box {',
    'width: 100%;',
    'height: 100%;',
    'box-sizing: border-box;',
    '-moz-box-sizing: border-box;',
    '-webkit-box-sizing: border-box;',
    'padding-right: 30px;',
    '}')
  eYo.Css.insertRuleAt('.eyo-menu-button-caption {',
    eYo.Font.menuStyle,
    'white-space: nowrap;',
    'overflow: hidden;',
    'text-overflow: ellipsis;',
  '}')
  eYo.Css.insertRuleAt('.eyo-menu-button-dropdown {',
    'position: absolute;',
    'right: 10px;',
    'top: ', ''+(eYo.Font.lineHeight/2), 'px;',
    'width: 20px;',
  '}')
  eYo.Css.insertRuleAt('.eyo-menu-button-dropdown svg {',
    'position: absolute;',
    'top: 0px;',
  '}')
  eYo.Css.insertRuleAt('.eyo-menu-button-dropdown-image {',
    'fill: #AAA;',
    'fill-opacity:0.666',
  '}')
})
