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

goog.require('eYo.Svg')

goog.provide('eYo.Svg.Focus')

goog.forwardDeclare('eYo.Focus')

console.error('NYI')

/**
 * Svg driver for the focus.
 */
eYo.Svg.makeDriverClass('Focus')

/*******  Focus  *******/
/**
 * Init the main focus manager.
 * @param {!eYo.Focus.Main} mainMgr  The main focus manager
 */
eYo.Svg.Focus.prototype.mainInitUI = eYo.Do.nothing

/**
 * Init the main focus manager.
 * @param {!eYo.Focus.Main} mainMgr  The main focus manager
 */
eYo.Svg.Focus.prototype.mainDisposeUI = eYo.Do.nothing


/**
 * Init a standard focus manager.
 * @param {!eYo.Focus.Mgr} mgr  The standard focus manager
 */
eYo.Svg.Focus.prototype.mgrInitUI = eYo.Do.nothing

/**
 * Init a standard focus manager.
 * @param {!eYo.Focus.Mgr} mgr  The standard focus manager
 */
eYo.Svg.Focus.prototype.mgrDisposeUI = eYo.Do.nothing

console.error("CSS flag missing in board's dom")
/**
 * Focus on a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a board.
 */
eYo.Svg.Focus.prototype.onBoard = function (mgr) {
  var b = mgr.board
  if (b) {
    // add a css style
  }
}

/**
 * Focus off a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a board.
 */
eYo.Svg.Focus.prototype.offBoard = function (mgr) {
  var b = mgr.board
  if (b) {
    // remove a css style
  }
}

/**
 * Focus on a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a brick.
 */
eYo.Svg.Focus.prototype.brickOn = function (mgr) {
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
eYo.Svg.Focus.prototype.brickOff = function (mgr) {
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
eYo.Svg.Focus.prototype.fieldOn = function (mgr) {
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
eYo.Svg.Focus.prototype.fieldOff = function (mgr) {
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
eYo.Svg.Focus.prototype.magnetOn = function (mgr) {
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
eYo.Svg.Focus.prototype.magnetOff = function (mgr) {
  var b = mgr.brick
  if (b) {
    var ui = b.ui
    ui.addBrickHilight_()
    ui.removeMagnet_()
  }
}


eYo.Debug.test() // remove this line when finished
