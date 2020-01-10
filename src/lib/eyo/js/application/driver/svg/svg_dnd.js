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

eYo.require('svg')

eYo.forwardDeclare('dnd')

/**
 * Svg driver for DnD.
 */

eYo.svg.makeDriverC9r('Dnd', {
  /**
   * Initiate the DnD manager UI.
   * @param {eYo.dnd.Mngr} mngr  The DnD manager we must init the UI.
   */
  initUI (mngr) {
  },
  /**
   * Dispose of the DnD manager UI.
   * @param {eYo.dnd.Mngr} mngr  The DnD manager we must dispose of the UI.
   */
  disposeUI (mngr) {
  },
})

