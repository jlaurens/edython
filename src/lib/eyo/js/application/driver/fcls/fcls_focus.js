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

eYo.require('eYo.NS_Fcls')

eYo.provide('eYo.NS_Fcls.Focus')

/**
 * Faceless driver for Focus managers.
 */
eYo.NS_Fcls.makeDriverClass('Focus')

/**
 * Init the main focus manager.
 * @param {eYo.Focus.Main} mainMngr  The main focus manager
 */
eYo.NS_Fcls.Focus.prototype.mainInitUI = eYo.Do.nothing

/**
 * Init the main focus manager.
 * @param {eYo.Focus.Main} mainMngr  The main focus manager
 */
eYo.NS_Fcls.Focus.prototype.mainDisposeUI = eYo.Do.nothing

/**
 * Init a standard focus manager.
 * @param {eYo.Focus.Mngr} mngr  The standard focus manager
 */
eYo.NS_Fcls.Focus.prototype.mngrInitUI = eYo.Do.nothing

/**
 * Init a standard focus manager.
 * @param {eYo.Focus.Mngr} mngr  The standard focus manager
 */
eYo.NS_Fcls.Focus.prototype.mngrDisposeUI = eYo.Do.nothing

/**
 * Focus on a board.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus on a board.
 */
eYo.NS_Fcls.Focus.prototype.onBoard = eYo.Do.nothing

/**
 * Focus off a board.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus off a board.
 */
eYo.NS_Fcls.Focus.prototype.offBoard = eYo.Do.nothing

/**
 * Focus on a board.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus on a brick.
 */
eYo.NS_Fcls.Focus.prototype.brickOn = eYo.Do.nothing

/**
 * Focus off a brick.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus off a brick.
 */
eYo.NS_Fcls.Focus.prototype.brickOff = eYo.Do.nothing

/**
 * Focus on a field.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus on a field.
 */
eYo.NS_Fcls.Focus.prototype.fieldOn = eYo.Do.nothing

/**
 * Focus off a field.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus off a field.
 */
eYo.NS_Fcls.Focus.prototype.fieldOff = eYo.Do.nothing

/**
 * Focus on a magnet.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus on a magnet.
 */
eYo.NS_Fcls.Focus.prototype.magnetOn = eYo.Do.nothing

/**
 * Focus off a magnet.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus off a magnet.
 */
eYo.NS_Fcls.Focus.prototype.magnetOff = eYo.Do.nothing
