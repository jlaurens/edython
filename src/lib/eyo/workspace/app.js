/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
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
 * Copy a brick onto the local clipboard.
 * @param {!Blockly.Block} brick Block to be copied.
 * @private
 * @return {Boolean} true if copied, false otherwise
 */
eYo.App.doCopy = function(optNoNext) {
  var brick = eYo.Selected.brick
  if (brick) {
    eYo.Desktop.copyBrick(brick, !optNoNext)
    return true
  }
};

/**
 * Send the selected brick to the front.
 * This is a job for the renderer.
 */
eYo.App.doFront = function() {
  var eyo = eYo.Selected.brick
  if (eyo) {
    eyo.ui.sendToFront()
  }
}

/**
 * Send the selected brick to the back.
 */
eYo.App.doBack = function() {
  var eyo = eYo.Selected.brick
  if (eyo) {
    eyo.ui.sendToBack()
  }
}

/**
 * Scroll the workspace to show the selected brick.
 */
eYo.App.doFocus = () => {
  var brick = eYo.Selected.brick
  if (brick) {
    brick.workspace.eyo.scrollBlockTopLeft(brick.id)
  }
}
