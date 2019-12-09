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

eYo.require('eYo.ns.Svg')

eYo.forwardDeclare('eYo.DnD')

/**
 * Svg driver for DnD.
 */

eYo.ns.Svg.makeDriverClass('DnD', {
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

