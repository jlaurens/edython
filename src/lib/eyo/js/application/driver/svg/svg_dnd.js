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

eYo.provide('eYo.Svg.DnD')

eYo.forwardDeclare('eYo.DnD')

/**
 * Svg driver for DnD.
 */

eYo.Svg.makeDriverClass('DnD', {
  /**
   * Initiate the DnD manager UI.
   * @param {!eYo.DnD.Mgr} mgr  The DnD manager we must init the UI.
   */
  initUI (mgr) {
  },
  /**
   * Dispose of the DnD manager UI.
   * @param {!eYo.DnD.Mgr} mgr  The DnD manager we must dispose of the UI.
   */
  disposeUI (mgr) {
  },
})

