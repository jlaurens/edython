/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */

/**
 * @fileoverview Extended functionality for the right-click context menus.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict';

/**
 * @name ezP.ContextMenu
 * @namespace
 */
goog.provide('Blockly.XtdContextMenu');

goog.require('Blockly.ContextMenu');

/**
 * Create the context menu object and populate it with the given options.
 * Accept menu items as menu options
 * @param {!Array.<!Object>} options Array of menu options.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @return {!goog.ui.Menu} The menu that will be shown on right click.
 * @private
 */
Blockly.ContextMenu.populate_ = function(options, rtl) {
  if (options instanceof goog.ui.Menu) {
    return options;
  } else {
  /* Here's what one option object looks like when not a :
    {text: 'Make It So',
     enabled: true,
     callback: Blockly.MakeItSo}
  */
  var menu = new goog.ui.Menu();
    menu.setRightToLeft(rtl);
    var i = 0, option
    for (; option = options[i]; i++) {
      if (option instanceof goog.ui.MenuItem) {
        var menuItem = option
        menu.addChild(menuItem, true);
        if (menuItem.isEnabled()) {
          menuItem.handleContextMenu = function(/* e */) {
            // Right-clicking on menu option should count as a click.
            goog.events.dispatchEvent(this, goog.ui.Component.EventType.ACTION);
          };
        }
      } else {
        menuItem = new goog.ui.MenuItem(option.text);
        menuItem.setRightToLeft(rtl);
        menu.addChild(menuItem, true);
        menuItem.setEnabled(option.enabled);
        if (option.enabled) {
          goog.events.listen(menuItem, goog.ui.Component.EventType.ACTION,
                             option.callback);
          menuItem.handleContextMenu = function(/* e */) {
            // Right-clicking on menu option should count as a click.
            goog.events.dispatchEvent(this, goog.ui.Component.EventType.ACTION);
          };
        }
      }
    }
    return menu;
  }
};
