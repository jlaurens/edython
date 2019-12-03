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

eYo.require('eYo.Svg')

eYo.provide('eYo.Svg.Focus')

eYo.forwardDeclare('eYo.Focus')

console.error('NYI')

/**
 * Svg driver for the focus.
 */
eYo.Svg.makeDriverClass('Focus')

/*******  Focus  *******/
/**
 * Init the main focus manager.
 * @param {!eYo.Focus.Main} mainMngr  The main focus manager
 */
eYo.Svg.Focus.prototype.mainInitUI = eYo.Do.nothing

/**
 * Init the main focus manager.
 * @param {!eYo.Focus.Main} mainMngr  The main focus manager
 */
eYo.Svg.Focus.prototype.mainDisposeUI = eYo.Do.nothing


/**
 * Init a standard focus manager.
 * @param {!eYo.Focus.Mngr} mngr  The standard focus manager
 */
eYo.Svg.Focus.prototype.mngrInitUI = eYo.Do.nothing

/**
 * Init a standard focus manager.
 * @param {!eYo.Focus.Mngr} mngr  The standard focus manager
 */
eYo.Svg.Focus.prototype.mngrDisposeUI = eYo.Do.nothing

console.error("CSS flag missing in board's dom")
/**
 * Focus on a board.
 * @param {!eYo.Focus.Mngr} mngr  The focus manager that should put focus on a board.
 */
eYo.Svg.Focus.prototype.onBoard = function (mngr) {
  var b = mngr.board
  if (b) {
    // add a css style
  }
}

/**
 * Focus off a board.
 * @param {!eYo.Focus.Mngr} mngr  The focus manager that should put focus off a board.
 */
eYo.Svg.Focus.prototype.offBoard = function (mngr) {
  var b = mngr.board
  if (b) {
    // remove a css style
  }
}

/**
 * Focus on a board.
 * @param {!eYo.Focus.Mngr} mngr  The focus manager that should put focus on a brick.
 */
eYo.Svg.Focus.prototype.brickOn = function (mngr) {
  var b = mngr.brick
  if (b) {
    b.ui.sendToFront()
    var ui = b.ui
    // This seems a bit complicated
    ui.updateShape()
    ui.addFocus()
    if (mngr.field || mngr.magnet) {
      ui.removeBrickHilight_()
    } else {
      ui.addBrickHilight_()
    }
    ui.addStatusFocus_()
  }
}

/**
 * Focus off a brick.
 * @param {!eYo.Focus.Mngr} mngr  The focus manager that should put focus off a brick.
 */
eYo.Svg.Focus.prototype.brickOff = function (mngr) {
  var b = mngr.brick
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
 * @param {!eYo.Focus.Mngr} mngr  The focus manager that should put focus on a field.
 */
eYo.Svg.Focus.prototype.fieldOn = function (mngr) {
  var f = mngr.field
  if (f) {
    var b = mngr.brick
    if (b) {
      var ui = b.ui
      ui.removeBrickHilight_()
      ui.removeMagnet_(mngr.magnet)
    }
  }
}

/**
 * Focus off a field.
 * @param {!eYo.Focus.Mngr} mngr  The focus manager that should put focus off a field.
 */
eYo.Svg.Focus.prototype.fieldOff = function (mngr) {
  var b = mngr.brick
  if (b) {
    var ui = b.ui
    ui.addBrickHilight_()
  }
}

/**
 * Focus on a magnet.
 * @param {!eYo.Focus.Mngr} mngr  The focus manager that should put focus on a magnet.
 */
eYo.Svg.Focus.prototype.magnetOn = function (mngr) {
  var m = mngr.magnet
  if (m) {
    var b = mngr.brick
    if (b) {
      var ui = b.ui
      ui.removeBrickHilight_()
      ui.addMagnet_(m)
    }
  }
}

/**
 * Focus off a magnet.
 * @param {!eYo.Focus.Mngr} mngr  The focus manager that should put focus off a magnet.
 */
eYo.Svg.Focus.prototype.magnetOff = function (mngr) {
  var b = mngr.brick
  if (b) {
    var ui = b.ui
    ui.addBrickHilight_()
    ui.removeMagnet_()
  }
}

