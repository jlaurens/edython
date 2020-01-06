/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Focus driver both for `Main` and `Mngr` instances.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Svg')

eYo.forwardDeclare('Focus')

console.error('NYI')

/**
 * Svg driver for the focus.
 */
eYo.Svg.makeDriverClass('Focus')

/*******  Focus  *******/
/**
 * Init the main focus manager.
 * @param {eYo.Focus.Main} mainMngr  The main focus manager
 */
eYo.Svg.Focus.prototype.mainInitUI = eYo.Do.nothing

/**
 * Init the main focus manager.
 * @param {eYo.Focus.Main} mainMngr  The main focus manager
 */
eYo.Svg.Focus.prototype.mainDisposeUI = eYo.Do.nothing


/**
 * Init a standard focus manager.
 * @param {eYo.Focus.Mngr} mngr  The standard focus manager
 */
eYo.Svg.Focus.prototype.mngrInitUI = eYo.Do.nothing

/**
 * Init a standard focus manager.
 * @param {eYo.Focus.Mngr} mngr  The standard focus manager
 */
eYo.Svg.Focus.prototype.mngrDisposeUI = eYo.Do.nothing

console.error("CSS flag missing in board's dom")
/**
 * Focus on a board.
 * @param {eYo.Focus.Main} mngr - The main focus manager that should put focus on a board.
 */
eYo.Svg.Focus.prototype.boardOn = function (mngr) {
  var b = mngr.board
  if (b) {
    // add a css style
  }
}

/**
 * Focus off a board.
 * @param {eYo.Focus.Main} mngr - The main focus manager that should put focus off a board.
 */
eYo.Svg.Focus.prototype.boardOff = function (mngr) {
  var b = mngr.board
  if (b) {
    // remove a css style
  }
}

/**
 * Focus on a board.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus on a brick.
 */
eYo.Svg.Focus.prototype.brickOn = function (mngr) {
  var b = mngr.brick
  if (b) {
    b.sendToFront()
    // This seems a bit complicated
    b.updateShape()
    if (mngr.field || mngr.magnet) {
      b.hilightAdd_()
    } else {
      b.hilightAdd_()
    }
    b.statusFocusAdd_()
  }
}

/**
 * Focus off a brick.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus off a brick.
 */
eYo.Svg.Focus.prototype.brickOff = function (mngr) {
  var b = mngr.brick
  if (b) {
    // unselect/unhilight the previous brick
    var ui = b.ui
    // This seems a bit complicated
    ui.focusRemove()
    ui.hilightAdd_()
    ui.magnetRemove_()
    ui.statusFocusRemove_()
  }
}

/**
 * Focus on a field.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus on a field.
 */
eYo.Svg.Focus.prototype.fieldOn = function (mngr) {
  var f = mngr.field
  if (f) {
    var b = mngr.brick
    if (b) {
      var ui = b.ui
      ui.hilightAdd_()
      ui.magnetRemove_(mngr.magnet)
    }
  }
}

/**
 * Focus off a field.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus off a field.
 */
eYo.Svg.Focus.prototype.fieldOff = function (mngr) {
  var b = mngr.brick
  if (b) {
    var ui = b.ui
    ui.hilightAdd_()
  }
}

/**
 * Focus on a magnet.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus on a magnet.
 */
eYo.Svg.Focus.prototype.magnetOn = function (mngr) {
  var m = mngr.magnet
  if (m) {
    var b = mngr.brick
    if (b) {
      b.hilightAdd_()
      b.magnetAdd_(m)
    }
  }
}

/**
 * Focus off a magnet.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus off a magnet.
 */
eYo.Svg.Focus.prototype.magnetOff = function (mngr) {
  var b = mngr.brick
  if (b) {
    var ui = b.ui
    ui.hilightAdd_()
    ui.magnetRemove_()
  }
}

