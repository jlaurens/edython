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

eYo.forward('dnd')

/**
 * Svg driver for DnD.
 */

eYo.svg.newDrvrC3s('Dnd', {
  /**
   * Initiate the DnD manager UI.
   * @param {eYo.dnd.Mngr} mngr  The DnD manager we must init the UI.
   */
  initUI (mngr) { // eslint-disable-line
  },
  /**
   * Dispose of the DnD manager UI.
   * @param {eYo.dnd.Mngr} mngr  The DnD manager we must dispose of the UI.
   */
  disposeUI (mngr) { // eslint-disable-line
  },
})

