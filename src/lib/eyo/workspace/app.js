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
goog.require('eYo.Scan')

eYo.App = Object.create(null)

/**
 * Copy a block onto the local clipboard.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 * @return {Boolean} true if copied, false otherwise
 */
eYo.App.doCopy = function(optNoNext) {
  var block = eYo.Selected.block
  if (block) {
    eYo.copyBlock(block, !optNoNext)
    return true
  }
};

/**
 * Send the selected block to the front.
 * This is a job for the renderer.
 */
eYo.App.doFront = function() {
  var eyo = eYo.Selected.eyo
  if (eyo) {
    eyo.ui.sendToFront()
  }
}

/**
 * Send the selected block to the back.
 */
eYo.App.doBack = function() {
  var eyo = eYo.Selected.eyo
  if (eyo) {
    eyo.ui.sendToBack()
  }
}

/**
 * Scroll the workspace to show the selected block.
 */
eYo.App.doFocus = () => {
  var block = eYo.Selected.block
  if (block) {
    block.workspace.eyo.scrollBlockTopLeft(block.id)
  }
}
