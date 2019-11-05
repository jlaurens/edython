/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Focus driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Focus')

/**
 * @name {eYo.Svg.Focus}
 * @namespace
 */

goog.require('eYo.Svg')

goog.forwardDeclare('eYo.Focus')

console.error('NYI')

/*******  Focus  *******/
/**
 * Init the main focus manager.
 * @param {!eYo.Focus.Main} mainMgr  The main focus manager
 */
eYo.Svg.prototype.focusMainInit = eYo.Do.nothing

/**
 * Init the main focus manager.
 * @param {!eYo.Focus.Main} mainMgr  The main focus manager
 */
eYo.Svg.prototype.focusMainDispose = eYo.Do.nothing


/**
 * Init a standard focus manager.
 * @param {!eYo.Focus.Mgr} mgr  The standard focus manager
 */
eYo.Svg.prototype.focusMgrInit = eYo.Do.nothing

/**
 * Init a standard focus manager.
 * @param {!eYo.Focus.Mgr} mgr  The standard focus manager
 */
eYo.Svg.prototype.focusMgrDispose = eYo.Do.nothing

console.error("CSS flag missing in board's dom")
/**
 * Focus on a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a board.
 */
eYo.Svg.prototype.focusOnBoard = function (mgr) {
  var b = mgr.board
  if (b) {
    // add a css style
  }
}

/**
 * Focus off a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a board.
 */
eYo.Svg.prototype.focusOffBoard = function (mgr) {
  var b = mgr.board
  if (b) {
    // remove a css style
  }
}

/**
 * Focus on a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a brick.
 */
eYo.Svg.prototype.focusOnBrick = function (mgr) {
  var b = mgr.brick
  if (b) {
    b.ui.sendToFront()
    var ui = b.ui
    // This seems a bit complicated
    ui.updateShape()
    ui.addFocus()
    if (mgr.field || mgr.magnet) {
      ui.removeBrickHilight_()
    } else {
      ui.addBrickHilight_()
    }
    ui.addStatusFocus_()
  }
}

/**
 * Focus off a brick.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a brick.
 */
eYo.Svg.prototype.focusOffBrick = function (mgr) {
  var b = mgr.brick
  if (b) {
    // unselect/unhilight the previous brick
    var ui = b.ui
    // This seems a bit complicated
    ui.removeFocus()
    ui.removeBrickHilight_()
    ui.removeMagnet_()
    ui.removeStatusFocus_()
  }
}

/**
 * Focus on a field.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a field.
 */
eYo.Svg.prototype.focusOnField = function (mgr) {
  var f = mgr.field
  if (f) {
    var b = mgr.brick
    if (b) {
      var ui = b.ui
      ui.removeBrickHilight_()
      ui.removeMagnet_(mgr.magnet)
    }
  }
}

/**
 * Focus off a field.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a field.
 */
eYo.Svg.prototype.focusOffField = function (mgr) {
  var b = mgr.brick
  if (b) {
    var ui = b.ui
    ui.addBrickHilight_()
  }
}

/**
 * Focus on a magnet.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a magnet.
 */
eYo.Svg.prototype.focusOnMagnet = function (mgr) {
  var m = mgr.magnet
  if (m) {
    var b = mgr.brick
    if (b) {
      var ui = b.ui
      ui.removeBrickHilight_()
      ui.addMagnet_(m)
    }
  }
}

/**
 * Focus off a magnet.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a magnet.
 */
eYo.Svg.prototype.focusOffMagnet = function (mgr) {
  var b = mgr.brick
  if (b) {
    var ui = b.ui
    ui.addBrickHilight_()
    ui.removeMagnet_()
  }
}

