/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview A class representing menu items that open a submenu.
 * JL: Fix bug for css class name (explicit 'goog-submenu-open')
 * @see goog.ui.Menu
 *
 * @see ../demos/submenus.html
 * @see ../demos/submenus2.html
 */

eYo.require('eYo.MenuRenderer')

goog.require('goog.dom');

goog.require('goog.ui.SubMenu')
eYo.provide('eYo.SubMenu')

/**
 * Class representing a submenu that can be added as an item to other menus.
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to
 *     display as the content of the submenu (use to add icons or styling to
 *     menus).
 * @param {*=} optModel Data/model associated with the menu item.
 * @param {goog.dom.DomHelper=} optDomHelper Optional dom helper used for dom
 *     interactions.
 * @param {goog.ui.MenuItemRenderer=} optRenderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.SubMenuRenderer}.
 * @constructor
 * @extends {goog.ui.SubMenu}
 */
eYo.SubMenu = function (content, optModel, optDomHelper, optRenderer) {
  goog.ui.SubMenu.call(
    this, content, optModel, optDomHelper,
    optRenderer || eYo.SubMenuRenderer.getInstance())
}
goog.inherits(eYo.SubMenu, goog.ui.SubMenu)
goog.tagUnsealableClass(eYo.SubMenu)

/**
 * Sets the visiblility of the sub menu.
 * @param {boolean} visible Whether to show menu.
 * @private
 * @suppress{accessControls}
 */
eYo.SubMenu.prototype.setSubMenuVisible_ = function (visible) {
  // Unhighlighting the menuitems if closing the menu so the event handlers can
  // determine the correct state.
  var subMenu = this.getMenu()
  if (!visible && subMenu) {
    subMenu.setHighlightedIndex(-1)
  }

  // Dispatch OPEN event before calling getMenu(), so we can create the menu
  // lazily on first access.
  this.dispatchEvent(
    goog.ui.Component.getStateTransitionEvent(
      goog.ui.Component.State.OPENED, visible))
  if (visible !== this.menuIsVisible_) {
    goog.dom.classlist.enable(
      eYo.assert(this.getElement()),
      subMenu.getRenderer().getCssClass() + '-open', visible)
  }
  if (visible !== subMenu.isVisible()) {
    if (visible) {
      // Lazy-render menu when first shown, if needed.
      if (!subMenu.isInDocument()) {
        subMenu.render()
      }
      subMenu.setHighlightedIndex(-1)
    }
    subMenu.setVisible(visible)
    // We must position after the menu is visible, otherwise positioning logic
    // breaks in RTL.
    if (visible) {
      this.positionSubMenu()
    }
  }
  this.menuIsVisible_ = visible
}

/**
 * Gets a reference to the submenu's actual menu.
 * @return {!goog.ui.Menu} Reference to the object representing the sub menu.
 * @suppress{accessControls}
 */
eYo.SubMenu.prototype.getMenu = function () {
  if (!this.subMenu_) {
    this.setMenu(
      new eYo.Menu(this.getDomHelper()), /* opt_internal */ true)
  } else if (this.externalSubMenu_ && this.subMenu_.getParent() !== this) {
    // Since it is possible for the same popup menu to be attached to multiple
    // submenus, we need to ensure that it has the correct parent event target.
    this.subMenu_.setParent(this)
  }
  // Always create the menu DOM, for backward compatibility.
  if (!this.subMenu_.getElement()) {
    this.subMenu_.createDom()
  }
  return this.subMenu_
}
