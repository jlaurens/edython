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

eYo.require('fcls')

eYo.provide('fcls.focus')

/**
 * Faceless driver for Focus managers.
 */
eYo.fcls.makeDriverClass('Focus')

/**
 * Init the main focus manager.
 * @param {eYo.Focus.Main} mainMngr  The main focus manager
 */
eYo.fcls.Focus.prototype.MainInitUI = eYo.do.nothing

/**
 * Init the main focus manager.
 * @param {eYo.Focus.Main} mainMngr  The main focus manager
 */
eYo.fcls.Focus.prototype.MainDisposeUI = eYo.do.nothing

/**
 * Init a standard focus manager.
 * @param {eYo.Focus.Mngr} mngr  The standard focus manager
 */
eYo.fcls.Focus.prototype.MngrInitUI = eYo.do.nothing

/**
 * Init a standard focus manager.
 * @param {eYo.Focus.Main} mngr  The standard focus manager
 */
eYo.fcls.Focus.prototype.MngrDisposeUI = eYo.do.nothing

/**
 * Focus on a board.
 * @param {eYo.Focus.Main} mngr  The main focus manager that should put focus on a board.
 */
eYo.fcls.Focus.prototype.BoardOn = eYo.do.nothing

/**
 * Focus off a board.
 * @param {eYo.Focus.Main} mngr  The main focus manager that should put focus off a board.
 */
eYo.fcls.Focus.prototype.BoardOff = eYo.do.nothing

/**
 * Focus on a board.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus on a brick.
 */
eYo.fcls.Focus.prototype.BrickOn = eYo.do.nothing

/**
 * Focus off a brick.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus off a brick.
 */
eYo.fcls.Focus.prototype.BrickOff = eYo.do.nothing

/**
 * Focus on a field.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus on a field.
 */
eYo.fcls.Focus.prototype.FieldOn = eYo.do.nothing

/**
 * Focus off a field.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus off a field.
 */
eYo.fcls.Focus.prototype.FieldOff = eYo.do.nothing

/**
 * Focus on a magnet.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus on a magnet.
 */
eYo.fcls.Focus.prototype.MagnetOn = eYo.do.nothing

/**
 * Focus off a magnet.
 * @param {eYo.Focus.Mngr} mngr  The focus manager that should put focus off a magnet.
 */
eYo.fcls.Focus.prototype.MagnetOff = eYo.do.nothing
