/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo
 * @namespace
 */

goog.provide('eYo.App')

goog.require('Blockly')
goog.require('eYo.Xml')
goog.require('eYo.App')
goog.require('eYo.KeyHandler')

eYo.App = Object.create(null)

/**
 * Copy a block onto the local clipboard.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 * @return {Boolean} true if copied, false otherwise
 */
eYo.App.doCopy = function(optNoNext) {
  var block = Blockly.selected
  if (block) {
    var xmlBlock = eYo.Xml.blockToDom(block, {noId: true, noNext: optNoNext});
    // Encode start position in XML.
    var xy = block.getRelativeToSurfaceXY();
    xmlBlock.setAttribute('x', block.RTL ? -xy.x : xy.x);
    xmlBlock.setAttribute('y', xy.y);
    Blockly.clipboardXml_ = xmlBlock;
    Blockly.clipboardSource_ = block.workspace;
    return true
  }
};

/**
 * Send the selected block to the front.
 */
eYo.App.doFront = function() {
  var block = Blockly.selected
  if (block) {
    var parent
    while ((parent = block.getSurroundParent())) {
      block = parent
    }
    var g = block.getSvgRoot()
    if (g.nextSibling && (parent = g.parentNode)) {
      parent.removeChild(g)
      parent.appendChild(g)
    }
  }
}

/**
 * Send the selected block to the back.
 */
eYo.App.doBack = function() {
  var block = Blockly.selected
  if (block) {
    var parent
    while ((parent = block.getSurroundParent())) {
      block = parent
    }
    var g = block.getSvgRoot()
    if (g.previousSibling && (parent = g.parentNode)) {
      parent.removeChild(g)
      parent.insertBefore(g, parent.firstChild)
    }
  }
}

/**
 * Scroll the workspace to show the selected block.
 */
eYo.App.doFocus = function() {
  var block = Blockly.selected
  if (block) {
    block.workspace.centerOnBlock(block.id)
  }
}
