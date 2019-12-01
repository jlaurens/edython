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

goog.require('eYo.Svg')

goog.provide('eYo.Svg.DnD')

goog.forwardDeclare('eYo.DnD')

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


eYo.Debug.test() // remove this line when finished
