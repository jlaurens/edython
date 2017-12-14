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
 * @fileoverview Renderer for {@link goog.ui.MenuItem}s.
 * Twisted to fit print options and alike.
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('ezP.MenuItemRenderer');
goog.provide('ezP.KeyValueMenuItemRenderer');
goog.provide('ezP.NoOptionMenuItemRenderer');
goog.provide('ezP.MenuItemCodeRenderer');
goog.provide('ezP.MenuItemVarRenderer');
goog.provide('ezP.SeparatorRenderer');

goog.require('goog.ui.MenuItemRenderer');
goog.require('ezP.Style');

//NB: take a look at goog.ui.ControlRenderer.getCustomRenderer

ezP.MenuItemRenderer = function() {
  goog.ui.MenuItemRenderer.call(this);
};

goog.inherits(ezP.MenuItemRenderer, goog.ui.MenuItemRenderer);
goog.addSingletonGetter(ezP.MenuItemRenderer);

/**
 * Overrides {@link goog.ui.MenuItemRenderer#createDom} by adding extra markup
 * and stying to the menu item's element if it is selectable or checkable.
 * @param {goog.ui.Control} item Menu item to render.
 * @return {Element} Root element for the item.
 * @override
 */
ezP.MenuItemRenderer.prototype.createDom = function(item) {
  var element = ezP.MenuItemRenderer.superClass_.createDom.call(this, item);
  Blockly.utils.addClass(element, 'ezp-nocheckbox');
  Blockly.utils.addClass(element, 'ezp-noaccel');
  return element;
};

ezP.Style.setControlRendererCssClass = function() {
  var helper = function(name, dict) {
    var RA = [];
    for (var k in dict) {
      if (k == '') {
        RA.push(dict[k],';');
      } else {
        RA.push(k,':',dict[k],';');
      }
    }
    var rule = '.'+name+'{\n'+RA.join('')+'\n}';
    ezP.Style.insertCssRuleAt(rule);
  }
  return function(renderer, cssClass) {
    goog.addSingletonGetter(renderer);
    renderer.CSS_CLASS = goog.getCssName(cssClass);
    renderer.prototype.getCssClass = function() {return cssClass;};
    var args = [].slice.call(arguments);
    var i = 2;
    var dict = args[i++];
    if (dict) {
      if (typeof dict === 'object') {
        helper(cssClass, dict);
        var name = args[i++];
      } else {
        name = dict;
      }
      while (name && typeof name === 'string') {
        var dict = args[i++];
        if (dict && typeof dict === 'object') {
          helper(goog.getCssName(cssClass, name),dict);
          name = args[i++];
          continue;
        }
        break;
      }
    }
  };
}();

ezP.Style.setControlRendererCssClass(
  ezP.MenuItemRenderer,
  'ezp-menuitem',
  'content',
  {'padding': '4px 6px'},
  'hover',
  {'background-color': '#d6e9f8'}
);

/**
 * Takes a single {@link goog.ui.Component.State}, and returns the
 * corresponding CSS class name (null if none).
 * No overriding by goog.ui.MenuItemRenderer.
 * @param {goog.ui.Component.State} state Component state.
 * @return {string|undefined} CSS class representing the given state
 *     (undefined if none).
 * @override
 */
ezP.MenuItemRenderer.prototype.getClassForState = function(state) {
  return goog.ui.MenuItemRenderer.superClass_.getClassForState.call(
          this, state);
};

ezP.KeyValueMenuItemRenderer = function() {
  goog.ui.MenuItemRenderer.call(this);
};

goog.inherits(ezP.KeyValueMenuItemRenderer, goog.ui.MenuItemRenderer);
goog.addSingletonGetter(ezP.KeyValueMenuItemRenderer);

ezP.Style.setControlRendererCssClass(
  ezP.KeyValueMenuItemRenderer,
  'ezp-key-value-menuitem',
  'content',
  {'padding': '4px 6px 4px '+(ezP.Font.space+12)+'px;'},
  'hover',
  {'background-color': '#d6e9f8'}
);

ezP.KeyValueMenuItemRenderer.prototype.getClassForState
  = ezP.MenuItemRenderer.prototype.getClassForState;

// /**
//  * Constants for referencing composite CSS classes.
//  * @enum {number}
//  * @private
//  */
// goog.ui.MenuItemRenderer.CompositeCssClassIndex_ = {
//   HOVER: 0,
//   CHECKBOX: 1,
//   CONTENT: 2
// };
//

// /**
//  * Returns the composite CSS class by using the cached value or by constructing
//  * the value from the base CSS class and the passed index.
//  * @param {goog.ui.MenuItemRenderer.CompositeCssClassIndex_} index Index for the
//  *     CSS class - could be highlight, checkbox or content in usual cases.
//  * @return {string} The composite CSS class.
//  * @private
//  */
// ezP.KeyValueMenuItemRenderer.prototype.getCompositeCssClass_ = function(index) {
//   var result = this.classNameCache_[index];
//   if (!result) {
//     switch (index) {
//       case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER:
//         result = goog.getCssName(this.getStructuralCssClass(), 'highlight');
//         break;
//       case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX:
//         result = goog.getCssName(this.getStructuralCssClass(), 'checkbox');
//         break;
//       case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT:
//         result = goog.getCssName(this.getStructuralCssClass(), 'content');
//         break;
//     }
//     this.classNameCache_[index] = result;
//   }
//
//   return result;
// };


// /** @override */
// ezP.KeyValueMenuItemRenderer.prototype.getAriaRole = function() {
//   return goog.a11y.aria.Role.MENU_ITEM;
// };


// /**
//  * Overrides {@link goog.ui.ControlRenderer#createDom} by adding extra markup
//  * and stying to the menu item's element if it is selectable or checkable.
//  * @param {goog.ui.Control} item Menu item to render.
//  * @return {Element} Root element for the item.
//  * @override
//  */
// ezP.KeyValueMenuItemRenderer.prototype.createDom = function(item) {
//   var element = item.getDomHelper().createDom(
//       goog.dom.TagName.DIV, this.getClassNames(item).join(' '),
//       this.createContent(item.getContent(), item.getDomHelper()));
//   this.setEnableCheckBoxStructure(
//       item, element, item.isSupportedState(goog.ui.Component.State.SELECTED) ||
//           item.isSupportedState(goog.ui.Component.State.CHECKED));
//   return element;
// };


/** @override */
ezP.KeyValueMenuItemRenderer.prototype.getContentElement = function(element) {
  return /** @type {Element} */ (element && element.firstChild);
};


/**
 * Overrides {@link goog.ui.ControlRenderer#decorate} by initializing the
 * menu item to checkable based on whether the element to be decorated has
 * extra stying indicating that it should be.
 * @param {goog.ui.Control} item Menu item instance to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
ezP.KeyValueMenuItemRenderer.prototype.decorate = function(item, element) {
  goog.asserts.assert(element);
  if (!this.hasContentStructure(element)) {
    element.appendChild(
        this.createContent(element.childNodes, item.getDomHelper()));
  }
  (/** @type {goog.ui.MenuItem} */ (item)).setCheckable(true);
  this.setCheckable(item, element, true);
  return ezP.KeyValueMenuItemRenderer.superClass_.decorate.call(
      this, item, element);
};


// /**
//  * Takes a menu item's root element, and sets its content to the given text
//  * caption or DOM structure.  Overrides the superclass immplementation by
//  * making sure that the checkbox structure (for selectable/checkable menu
//  * items) is preserved.
//  * @param {Element} element The item's root element.
//  * @param {goog.ui.ControlContent} content Text caption or DOM structure to be
//  *     set as the item's content.
//  * @override
//  */
// ezP.KeyValueMenuItemRenderer.prototype.setContent = function(element, content) {
//   // Save the checkbox element, if present.
//   var contentElement = this.getContentElement(element);
//   var checkBoxElement =
//       this.hasCheckBoxStructure(element) ? contentElement.firstChild : null;
//   goog.ui.MenuItemRenderer.superClass_.setContent.call(this, element, content);
//   if (checkBoxElement && !this.hasCheckBoxStructure(element)) {
//     // The call to setContent() blew away the checkbox element; reattach it.
//     contentElement.insertBefore(
//         checkBoxElement, contentElement.firstChild || null);
//   }
// };


/**
 * Returns true if the element appears to have a proper menu item structure by
 * checking whether its first child has the appropriate structural class name.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element appears to have a proper menu item DOM.
 * @protected
 */
ezP.KeyValueMenuItemRenderer.prototype.hasContentStructure = function(element) {
  var child = goog.dom.getFirstElementChild(element);
  var contentClassName = this.getCompositeCssClass_(
      goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT);
  return !!child && goog.dom.classlist.contains(child, contentClassName);
};


// /**
//  * Wraps the given text caption or existing DOM node(s) in a structural element
//  * containing the menu item's contents.
//  * @param {goog.ui.ControlContent} content Menu item contents.
//  * @param {goog.dom.DomHelper} dom DOM helper for document interaction.
//  * @return {Element} Menu item content element.
//  * @protected
//  */
// ezP.KeyValueMenuItemRenderer.prototype.createContent = function(content, dom) {
//   var contentClassName = this.getCompositeCssClass_(
//       goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT);
//   return dom.createDom(goog.dom.TagName.DIV, contentClassName, content);
// };
//
//
// /**
//  * Enables/disables radio button semantics on the menu item.
//  * @param {goog.ui.Control} item Menu item to update.
//  * @param {Element} element Menu item element to update (may be null if the
//  *     item hasn't been rendered yet).
//  * @param {boolean} selectable Whether the item should be selectable.
//  */
// ezP.KeyValueMenuItemRenderer.prototype.setSelectable = function(
//     item, element, selectable) {
//   if (item && element) {
//     this.setEnableCheckBoxStructure(item, element, selectable);
//   }
// };
//
//
// /**
//  * Enables/disables checkbox semantics on the menu item.
//  * @param {goog.ui.Control} item Menu item to update.
//  * @param {Element} element Menu item element to update (may be null if the
//  *     item hasn't been rendered yet).
//  * @param {boolean} checkable Whether the item should be checkable.
//  */
// ezP.KeyValueMenuItemRenderer.prototype.setCheckable = function(
//     item, element, checkable) {
//   if (item && element) {
//     this.setEnableCheckBoxStructure(item, element, checkable);
//   }
// };
//
//
// /**
//  * Determines whether the item contains a checkbox element.
//  * @param {Element} element Menu item root element.
//  * @return {boolean} Whether the element contains a checkbox element.
//  * @protected
//  */
// ezP.KeyValueMenuItemRenderer.prototype.hasCheckBoxStructure = function(element) {
//   var contentElement = this.getContentElement(element);
//   if (contentElement) {
//     var child = contentElement.firstChild;
//     var checkboxClassName = this.getCompositeCssClass_(
//         goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX);
//     return !!child && goog.dom.isElement(child) &&
//         goog.dom.classlist.contains(
//             /** @type {!Element} */ (child), checkboxClassName);
//   }
//   return false;
// };

/**
 * Adds or removes extra markup and CSS styling to the menu item to make it
 * selectable or non-selectable, depending on the value of the
 * {@code selectable} argument.
 * @param {!goog.ui.Control} item Menu item to update.
 * @param {!Element} element Menu item element to update.
 * @param {boolean} enable Whether to add or remove the checkbox structure.
 * @protected
 */
ezP.KeyValueMenuItemRenderer.prototype.setEnableCheckBoxStructure = function(
    item, element, enable) {
  this.setAriaRole(element, item.getPreferredAriaRole());
  this.setAriaStates(item, element);
  var contentElement = this.getContentElement(element);
  if (!item.ezpDomMark) {
    var checkboxClassName = this.getCompositeCssClass_(
        goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX);
        var x = 2;
        var d = ezP.Font.space+2*x;
        var el = item.getDomHelper().createDom(
        goog.dom.TagName.DIV, checkboxClassName);
        el.style.display = 'inline';
        el.style.position = 'relative';
        el.style.width = d+'px';
        el.style.height = ezP.Font.lineHeight+'px';
        el.style.left = (ezP.Padding.h()-d)+'px';
        el.style.top = x+'px';
    contentElement.insertBefore(el, contentElement.firstChild || null);
    var svg = Blockly.utils.createSvgElement('svg',
      {'class': 'ezp-checkbox-icon', 'height':d, 'width':d}, el);
    Blockly.utils.createSvgElement('rect',
      {'class': 'ezp-checkbox-icon-rect',
       'x': '0', 'y': '0', 'rx': x*1.25, 'ry': x*1.25, 'height': d, 'width': d},
        svg);
    d = d-2*x;
    item.ezpMark = Blockly.utils.createSvgElement('rect',
      {'class': 'ezp-checkbox-icon-mark',
       'x': x, 'y': x, 'rx': x, 'ry': x, 'height': d, 'width': d},
        svg);
    item.ezpMark.style.opacity = 0.5;
  }
  if (item.isChecked()) {
    Blockly.utils.addClass(item.ezpMark,'ezp-checked');
  } else {
    Blockly.utils.removeClass(item.ezpMark,'ezp-checked');
  }
};

/**
 * Takes a single CSS class name which may represent a component state, and
 * returns the corresponding component state (0x00 if none).  Overrides the
 * superclass implementation by treating 'goog-option-selected' as special,
 * for backwards compatibility.
 * @param {string} className CSS class name, possibly representing a component
 *     state.
 * @return {goog.ui.Component.State} state Component state corresponding
 *     to the given CSS class (0x00 if none).
 * @override
 */
ezP.KeyValueMenuItemRenderer.prototype.getStateFromClass = function(className) {
  return goog.ui.MenuItemRenderer.superClass_.getStateFromClass.call(
          this, className);
};

/**
 * Default renderer for {@link goog.ui.MenuItem}s.  Each item has the following
 * structure:
 *
 *    <div class="ezp-menuitem">
 *      <div class="ezp-menuitem-content">
 *        ...(menu item contents)...
 *      </div>
 *    </div>
 *
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */

ezP.NoOptionMenuItemRenderer = function() {
  goog.ui.MenuItemRenderer.call(this);
};

goog.inherits(ezP.NoOptionMenuItemRenderer, goog.ui.MenuItemRenderer);
goog.addSingletonGetter(ezP.NoOptionMenuItemRenderer);

ezP.Style.setControlRendererCssClass(
  ezP.NoOptionMenuItemRenderer,
  'ezp-menuitem'
);
ezP.NoOptionMenuItemRenderer.prototype.getClassForState
  = ezP.MenuItemRenderer.prototype.getClassForState;

/**
 * Overrides {@link goog.ui.ControlRenderer#decorate} by initializing the
 * menu item to checkable based on whether the element to be decorated has
 * extra stying indicating that it should be.
 * @param {goog.ui.Control} item Menu item instance to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
ezP.NoOptionMenuItemRenderer.prototype.decorate = function(item, element) {
  goog.asserts.assert(element);
  if (!this.hasContentStructure(element)) {
    element.appendChild(
        this.createContent(element.childNodes, item.getDomHelper()));
  }
  return ezP.NoOptionMenuItemRenderer.superClass_.decorate.call(
      this, item, element);
};

/**
 * Renderer of a menu item for a variable.
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */

ezP.MenuItemCodeRenderer = function() {
  ezP.MenuItemRenderer.call(this);
};

goog.inherits(ezP.MenuItemCodeRenderer, ezP.MenuItemRenderer);
goog.addSingletonGetter(ezP.MenuItemCodeRenderer);

ezP.Style.setControlRendererCssClass(
  ezP.MenuItemCodeRenderer,
  'ezp-menuitem-code',
  'content',
  {'': ezP.Font.style},
  'hover',
  {'background-color': '#d6e9f8'}
);

ezP.MenuItemCodeRenderer.prototype.getClassForState
  = ezP.MenuItemRenderer.prototype.getClassForState;

/**
 * Adds or removes extra markup and CSS styling to the menu item to make it
 * selectable or non-selectable, depending on the value of the
 * {@code selectable} argument.
 * @param {!goog.ui.Control} item Menu item to update.
 * @param {!Element} element Menu item element to update.
 * @param {boolean} enable Whether to add or remove the checkbox structure.
 * @protected
 */
ezP.MenuItemCodeRenderer.prototype.setEnableCheckBoxStructure = function(
    item, element, enable) {
  ezP.MenuItemCodeRenderer.superClass_.setEnableCheckBoxStructure.call(this,
          item, element, enable);
  if (!item.isSupportedState(goog.ui.Component.State.CHECKED)) {
    Blockly.utils.addClass(element,'ezp-nocheckbox');
  }
};


/**
 * Renderer of a menu item for a variable.
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */

ezP.MenuItemVarRenderer = function() {
  ezP.MenuItemRenderer.call(this);
};

goog.inherits(ezP.MenuItemVarRenderer, ezP.MenuItemRenderer);
goog.addSingletonGetter(ezP.MenuItemVarRenderer);

ezP.Style.setControlRendererCssClass(
  ezP.MenuItemVarRenderer,
  'ezp-menuitem-var',
  'content',
  {'': ezP.Font.style},
  'hover',
  {'background-color': '#d6e9f8'}
);

ezP.MenuItemVarRenderer.prototype.getClassForState
  = ezP.MenuItemRenderer.prototype.getClassForState;

/**
 * Renderer for menu separators.
 * @constructor
 * @extends {goog.ui.MenuSeparatorRenderer}
 */
ezP.MenuSeparatorRenderer = function() {
  goog.ui.MenuSeparatorRenderer.call(this);
};
goog.inherits(ezP.MenuSeparatorRenderer, goog.ui.MenuSeparatorRenderer);
goog.addSingletonGetter(ezP.MenuSeparatorRenderer);

ezP.Style.setControlRendererCssClass(
  ezP.MenuSeparatorRenderer,
  'ezp-menuseparator',
  { 'border-top':'1px solid #ccc',
        'margin': 0,
        'padding': 0}
);
