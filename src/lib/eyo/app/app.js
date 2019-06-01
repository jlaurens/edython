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

goog.require('eYo.Do')

goog.forwardDeclare('eYo.Css')
goog.forwardDeclare('eYo.Desktop')
goog.forwardDeclare('eYo.Selected')

eYo.App = Object.create(null)

/**
 * Copy the selected brick onto the local clipboard.
 * @param {Boolean} optNoNext Whether the next blocks may be copied too.
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
  var b3k = eYo.Selected.brick
  if (b3k) {
    b3k.ui.sendToFront()
  }
}

/**
 * Send the selected brick to the back.
 */
eYo.App.doBack = function() {
  var b3k = b3k.Selected.brick
  if (b3k) {
    b3k.ui.sendToBack()
  }
}

/**
 * Scroll the workspace to show the selected brick.
 */
eYo.App.doFocus = () => {
  var brick = eYo.Selected.brick
  if (brick) {
    brick.workspace.scrollBrickTopLeft(brick.id)
  }
}

/**
 * Scroll the workspace to show the selected brick.
 */
eYo.App.makeFactory = options => {
  var f = eYo.App.factory = new eYo.Factory(options)
  eYo.App.workspace = f.mainWorkspace
  eYo.setup(eYo.App.workspace)
  eYo.App.workspace.clearUndo()
  f.makeUI()
}

/**
 * Close tooltips, context menus, dropdown selections, etc.
 */
eYo.App.hideChaff = eYo.Do.nothing
