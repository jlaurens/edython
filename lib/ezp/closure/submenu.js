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
 * @fileoverview A class representing menu items that open a submenu.
 * JL: Fix bug for css class name (explicit 'goog-submenu-open')
 * @see goog.ui.Menu
 *
 * @see ../demos/submenus.html
 * @see ../demos/submenus2.html
 */

goog.provide('ezP.SubMenu');

goog.require('goog.ui.SubMenu');
goog.require('ezP.MenuRenderer');

//
// goog.provide('goog.ui.SubMenu');
//
// goog.require('goog.Timer');
// goog.require('goog.asserts');
// goog.require('goog.dom');
// goog.require('goog.dom.classlist');
// goog.require('goog.events.KeyCodes');
// goog.require('goog.positioning.AnchoredViewportPosition');
// goog.require('goog.positioning.Corner');
// goog.require('goog.style');
// goog.require('goog.ui.Component');
// goog.require('goog.ui.Menu');
// goog.require('goog.ui.MenuItem');
// goog.require('goog.ui.SubMenuRenderer');
// goog.require('goog.ui.registry');



/**
 * Class representing a submenu that can be added as an item to other menus.
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to
 *     display as the content of the submenu (use to add icons or styling to
 *     menus).
 * @param {*=} opt_model Data/model associated with the menu item.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional dom helper used for dom
 *     interactions.
 * @param {goog.ui.MenuItemRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.SubMenuRenderer}.
 * @constructor
 * @extends {goog.ui.SubMenu}
 */
ezP.SubMenu = function(content, opt_model, opt_domHelper, opt_renderer) {
  goog.ui.SubMenu.call(
      this, content, opt_model, opt_domHelper,
      opt_renderer || ezP.SubMenuRenderer.getInstance());
};
goog.inherits(ezP.SubMenu, goog.ui.SubMenu);
goog.tagUnsealableClass(ezP.SubMenu);

/**
 * Sets the visiblility of the sub menu.
 * @param {boolean} visible Whether to show menu.
 * @private
 */
ezP.SubMenu.prototype.setSubMenuVisible_ = function(visible) {
  // Unhighlighting the menuitems if closing the menu so the event handlers can
  // determine the correct state.
  var subMenu = this.getMenu();
  if (!visible && subMenu) {
    subMenu.setHighlightedIndex(-1);
  }

  // Dispatch OPEN event before calling getMenu(), so we can create the menu
  // lazily on first access.
  this.dispatchEvent(
      goog.ui.Component.getStateTransitionEvent(
          goog.ui.Component.State.OPENED, visible));
  if (visible != this.menuIsVisible_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.getElement()),
        goog.getCssName(subMenu.getRenderer().getCssClass(), 'open'), visible);
  }
  if (visible != subMenu.isVisible()) {
    if (visible) {
      // Lazy-render menu when first shown, if needed.
      if (!subMenu.isInDocument()) {
        subMenu.render();
      }
      subMenu.setHighlightedIndex(-1);
    }
    subMenu.setVisible(visible);
    // We must position after the menu is visible, otherwise positioning logic
    // breaks in RTL.
    if (visible) {
      this.positionSubMenu();
    }
  }
  this.menuIsVisible_ = visible;
};

/**
 * Gets a reference to the submenu's actual menu.
 * @return {!goog.ui.Menu} Reference to the object representing the sub menu.
 */
ezP.SubMenu.prototype.getMenu = function() {
  if (!this.subMenu_) {
    this.setMenu(
        new ezP.Menu(this.getDomHelper()), /* opt_internal */ true);
  } else if (this.externalSubMenu_ && this.subMenu_.getParent() != this) {
    // Since it is possible for the same popup menu to be attached to multiple
    // submenus, we need to ensure that it has the correct parent event target.
    this.subMenu_.setParent(this);
  }
  // Always create the menu DOM, for backward compatibility.
  if (!this.subMenu_.getElement()) {
    this.subMenu_.createDom();
  }
  return this.subMenu_;
};
