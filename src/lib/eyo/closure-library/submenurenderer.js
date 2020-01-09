// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Renderer for {@link goog.ui.SubMenu}s edython.
 *
 */

goog.require('goog.dom');

goog.require('goog.ui.SubMenuRenderer')
eYo.provide('subMenuRenderer')

/**
 * Default renderer for {@link goog.ui.SubMenu}s.  Each item has the following
 * structure:
 *
 *    <div class="goog-submenu">
 *      ...(menuitem content)...
 *      <div class="goog-menu">
 *        ... (submenu content) ...
 *      </div>
 *    </div>
 *
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 * @final
 */
eYo.SubMenuRenderer = function () {
  goog.ui.SubMenuRenderer.call(this, eYo.NA)
}
goog.inherits(eYo.SubMenuRenderer, goog.ui.SubMenuRenderer)
goog.addSingletonGetter(eYo.SubMenuRenderer)

/**
* Default CSS class to be applied to the root element of components rendered
* by this renderer.
* @type {string}
*/
eYo.SubMenuRenderer.CSS_CLASS = goog.getCssName('eyo-submenu')

eYo.SubMenuRenderer.prototype.getCssClass = function () {
  return eYo.SubMenuRenderer.CSS_CLASS
}

// /**
//  * The CSS class for submenus that displays the submenu arrow.
//  * @type {string}
//  * @private
//  */
// goog.ui.SubMenuRenderer.CSS_CLASS_SUBMENU_ =
//     goog.getCssName('goog-submenu-arrow')

/**
 * Overrides {@link goog.ui.MenuItemRenderer#createDom} by adding
 * the additional class 'goog-submenu' to the created element,
 * and passes the element to {@link goog.ui.SubMenuItemRenderer#addArrow_}
 * to add an child element that can be styled to show an arrow.
 * @param {goog.ui.Control} control goog.ui.SubMenu to render.
 * @return {!Element} Root element for the item.
 * @override
 */
eYo.SubMenuRenderer.prototype.CreateDom = function (control) {
  var subMenu = /** @type {goog.ui.SubMenu} */ (control)
  var element =
    eYo.subMenuRenderer.SuperClass_.createDom.Call(this, subMenu)
  goog.dom.classlist.remove(element, goog.ui.SubMenuRenderer.CSS_CLASS)
  return element
}

// /**
//  * Overrides {@link goog.ui.MenuItemRenderer#decorate} by adding
//  * the additional class 'goog-submenu' to the decorated element,
//  * and passing the element to {@link goog.ui.SubMenuItemRenderer#addArrow_}
//  * to add a child element that can be styled to show an arrow.
//  * Also searches the element for a child with the class goog-menu. If a
//  * matching child element is found, creates a goog.ui.Menu, uses it to
//  * decorate the child element, and passes that menu to subMenu.setMenu.
//  * @param {goog.ui.Control} control goog.ui.SubMenu to render.
//  * @param {Element} element Element to decorate.
//  * @return {!Element} Root element for the item.
//  * @override
//  */
// goog.ui.SubMenuRenderer.prototype.decorate = function(control, element) {
//   var subMenu = /** @type {goog.ui.SubMenu} */ (control)
//   element =
//       goog.ui.SubMenuRenderer.superClass_.decorate.call(this, subMenu, element)
//   eYo.Assert(element)
//   goog.dom.classlist.add(element, goog.ui.SubMenuRenderer.CSS_CLASS)
//   this.addArrow_(subMenu, element)
//
//   // Search for a child menu and decorate it.
//   var childMenuEls = goog.dom.getElementsByTagNameAndClass(
//       goog.dom.TagName.DIV, goog.getCssName('goog-menu'), element)
//   if (childMenuEls.length) {
//     var childMenu = new goog.ui.Menu(subMenu.getDomHelper())
//     var childMenuEl = childMenuEls[0]
//     // Hide the menu element before attaching it to the document body; see
//     // bug 1089244.
//     goog.style.setElementShown(childMenuEl, false)
//     subMenu.getDomHelper().getDocument().body.appendChild(childMenuEl)
//     childMenu.decorate(childMenuEl)
//     subMenu.setMenu(childMenu, true)
//   }
//   return element
// }

/**
 * Takes a menu item's root element, and sets its content to the given text
 * caption or DOM structure.  Overrides the superclass immplementation by
 * making sure that the submenu arrow structure is preserved.
 * @param {Element} element The item's root element.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to be
 *     set as the item's content.
 * @override
 */
eYo.subMenuRenderer.prototype.SetContent = function (element, content) {
  // Save the submenu arrow element, if present.
  var contentElement = this.getContentElement(element)
  var arrowElement = contentElement && contentElement.lastChild
  goog.ui.SubMenuRenderer.superClass_.setContent.call(this, element, content)
  // If the arrowElement was there, is no longer there, and really was an arrow,
  // reappend it.
  if (arrowElement && contentElement.lastChild !== arrowElement &&
       goog.dom.classlist.contains(
         /** @type {!Element} */ (arrowElement),
         this.getCssClass() + '-arrow')) {
    contentElement.appendChild(arrowElement)
  }
}

/**
 * Overrides {@link goog.ui.MenuItemRenderer#initializeDom} to tweak
 * the DOM structure for the span.goog-submenu-arrow element
 * depending on the text direction (LTR or RTL). When the SubMenu is RTL
 * the arrow will be given the additional class of goog-submenu-arrow-rtl,
 * and the arrow will be moved up to be the first child in the SubMenu's
 * element. Otherwise the arrow will have the class goog-submenu-arrow-ltr,
 * and be kept as the last child of the SubMenu's element.
 * @param {goog.ui.Control} control goog.ui.SubMenu whose DOM is to be
 *     initialized as it enters the document.
 * @override
 * @suppress{accessControls}
 */
goog.ui.SubMenuRenderer.prototype.initializeDom = function (control) {
  var subMenu = /** @type {goog.ui.SubMenu} */ (control)
  goog.ui.SubMenuRenderer.superClass_.initializeDom.call(this, subMenu)
  var element = subMenu.getContentElement()
  var arrow = subMenu.getDomHelper().getElementsByTagNameAndClass(
    goog.dom.TagName.SPAN, this.getCssClass() + '-arrow',
    element)[0]
  goog.ui.SubMenuRenderer.setArrowTextContent_(subMenu, arrow)
  if (arrow !== element.lastChild) {
    element.appendChild(arrow)
  }
  var subMenuElement = subMenu.getElement()
  eYo.Assert(
    subMenuElement, 'The sub menu DOM element cannot be null.')
  goog.a11y.aria.setState(
    subMenuElement, goog.a11y.aria.State.HASPOPUP, 'true')
}

/**
 * Appends a child node with the class goog.getCssName('goog-submenu-arrow') or
 * 'goog-submenu-arrow-rtl' which can be styled to show an arrow.
 * @param {goog.ui.SubMenu} subMenu SubMenu to render.
 * @param {Element} element Element to decorate.
 * @private
 * @suppress{accessControls}
 */
goog.ui.SubMenuRenderer.prototype.addArrow_ = function (subMenu, element) {
  var arrow = subMenu.getDomHelper().createDom(goog.dom.TagName.SPAN)
  arrow.className = this.getCssClass() + '-arrow'
  goog.ui.SubMenuRenderer.setArrowTextContent_(subMenu, arrow)
  this.getContentElement(element).appendChild(arrow)
}

/**
 //  * The unicode char for a left arrow.
 //  * @type {string}
 //  * @private
 //  */
// goog.ui.SubMenuRenderer.LEFT_ARROW_ = '\u25C4'
//
//
// /**
//  * The unicode char for a right arrow.
//  * @type {string}
//  * @private
//  */
// goog.ui.SubMenuRenderer.RIGHT_ARROW_ = '\u25BA'
//
//
// /**
//  * Set the text content of an arrow.
//  * @param {goog.ui.SubMenu} subMenu The sub menu that owns the arrow.
//  * @param {Element} arrow The arrow element.
//  * @private
//  */
// goog.ui.SubMenuRenderer.setArrowTextContent_ = function(subMenu, arrow) {
//   // Fix arrow rtl
//   var leftArrow = goog.ui.SubMenuRenderer.LEFT_ARROW_
//   var rightArrow = goog.ui.SubMenuRenderer.RIGHT_ARROW_
//
//   eYo.Assert(arrow)
//
//   if (subMenu.isRightToLeft()) {
//     goog.dom.classlist.add(arrow, goog.getCssName('goog-submenu-arrow-rtl'))
//     // Unicode character - Black left-pointing pointer iff aligned to end.
//     goog.dom.setTextContent(
//         arrow, subMenu.isAlignedToEnd() ? leftArrow : rightArrow)
//   } else {
//     goog.dom.classlist.remove(arrow, goog.getCssName('goog-submenu-arrow-rtl'))
//     // Unicode character - Black right-pointing pointer iff aligned to end.
//     goog.dom.setTextContent(
//         arrow, subMenu.isAlignedToEnd() ? rightArrow : leftArrow)
//   }
// }

eYo.Setup.register(() => {
  eYo.Css.insertRuleAt('.eyo-submenu-content {',
      eYo.font.MenuStyle,
  '}')
})
