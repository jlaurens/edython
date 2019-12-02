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

eYo.require('eYo.Fcls')

eYo.provide('eYo.Fcls.Focus')

/**
 * Faceless driver for Focus managers.
 */
eYo.Fcls.makeDriverClass('Focus')

/**
 * Init the main focus manager.
 * @param {!eYo.Focus.Main} mainMgr  The main focus manager
 */
eYo.Fcls.Focus.prototype.mainInitUI = eYo.Do.nothing

/**
 * Init the main focus manager.
 * @param {!eYo.Focus.Main} mainMgr  The main focus manager
 */
eYo.Fcls.Focus.prototype.mainDisposeUI = eYo.Do.nothing

/**
 * Init a standard focus manager.
 * @param {!eYo.Focus.Mgr} mgr  The standard focus manager
 */
eYo.Fcls.Focus.prototype.mgrInitUI = eYo.Do.nothing

/**
 * Init a standard focus manager.
 * @param {!eYo.Focus.Mgr} mgr  The standard focus manager
 */
eYo.Fcls.Focus.prototype.mgrDisposeUI = eYo.Do.nothing

/**
 * Focus on a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a board.
 */
eYo.Fcls.Focus.prototype.onBoard = eYo.Do.nothing

/**
 * Focus off a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a board.
 */
eYo.Fcls.Focus.prototype.offBoard = eYo.Do.nothing

/**
 * Focus on a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a brick.
 */
eYo.Fcls.Focus.prototype.brickOn = eYo.Do.nothing

/**
 * Focus off a brick.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a brick.
 */
eYo.Fcls.Focus.prototype.brickOff = eYo.Do.nothing

/**
 * Focus on a field.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a field.
 */
eYo.Fcls.Focus.prototype.fieldOn = eYo.Do.nothing

/**
 * Focus off a field.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a field.
 */
eYo.Fcls.Focus.prototype.fieldOff = eYo.Do.nothing

/**
 * Focus on a magnet.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a magnet.
 */
eYo.Fcls.Focus.prototype.magnetOn = eYo.Do.nothing

/**
 * Focus off a magnet.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a magnet.
 */
eYo.Fcls.Focus.prototype.magnetOff = eYo.Do.nothing
