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

eYo.require('Svg')

eYo.forwardDeclare('DnD')

/**
 * Svg driver for DnD.
 */

eYo.Svg.makeDriverClass('DnD', {
  /**
   * Initiate the DnD manager UI.
   * @param {eYo.DnD.Mngr} mngr  The DnD manager we must init the UI.
   */
  initUI (mngr) {
  },
  /**
   * Dispose of the DnD manager UI.
   * @param {eYo.DnD.Mngr} mngr  The DnD manager we must dispose of the UI.
   */
  disposeUI (mngr) {
  },
})

