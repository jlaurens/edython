/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate. Do nothing driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Faceless driver for Focus managers.
 */
eYo.fcls.makeDriverC9r('Focus')

/**
 * Init the main focus manager.
 * @param {eYo.focus.Main} mainMngr  The main focus manager
 */
eYo.fcls.Focus.prototype.mainInitUI = eYo.doNothing

/**
 * Init the main focus manager.
 * @param {eYo.focus.Main} mainMngr  The main focus manager
 */
eYo.fcls.Focus.prototype.mainDisposeUI = eYo.doNothing

/**
 * Init a standard focus manager.
 * @param {eYo.focus.Mngr} mngr  The standard focus manager
 */
eYo.fcls.Focus.prototype.mngrInitUI = eYo.doNothing

/**
 * Init a standard focus manager.
 * @param {eYo.focus.Main} mngr  The standard focus manager
 */
eYo.fcls.Focus.prototype.mngrDisposeUI = eYo.doNothing

/**
 * Focus on a board.
 * @param {eYo.focus.Main} mngr  The main focus manager that should put focus on a board.
 */
eYo.fcls.Focus.prototype.boardOn = eYo.doNothing

/**
 * Focus off a board.
 * @param {eYo.focus.Main} mngr  The main focus manager that should put focus off a board.
 */
eYo.fcls.Focus.prototype.boardOff = eYo.doNothing

/**
 * Focus on a board.
 * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus on a brick.
 */
eYo.fcls.Focus.prototype.brickOn = eYo.doNothing

/**
 * Focus off a brick.
 * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus off a brick.
 */
eYo.fcls.Focus.prototype.brickOff = eYo.doNothing

/**
 * Focus on a field.
 * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus on a field.
 */
eYo.fcls.Focus.prototype.fieldOn = eYo.doNothing

/**
 * Focus off a field.
 * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus off a field.
 */
eYo.fcls.Focus.prototype.fieldOff = eYo.doNothing

/**
 * Focus on a magnet.
 * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus on a magnet.
 */
eYo.fcls.Focus.prototype.magnetOn = eYo.doNothing

/**
 * Focus off a magnet.
 * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus off a magnet.
 */
eYo.fcls.Focus.prototype.magnetOff = eYo.doNothing
