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
eYo.fcls.newDrvrC9r('Focus', {
  methods: {
    /**
     * Init the main focus manager.
     * @param {eYo.focus.Main} mainMngr  The main focus manager
     */
    do_mainInitUI: eYo.doNothing,
    /**
     * Init the main focus manager.
     * @param {eYo.focus.Main} mainMngr  The main focus manager
     */
    do_mainDisposeUI: eYo.doNothing,
    /**
     * Init a standard focus manager.
     * @param {eYo.focus.Mngr} mngr  The standard focus manager
     */
    do_mngrInitUI: eYo.doNothing,
    /**
     * Init a standard focus manager.
     * @param {eYo.focus.Main} mngr  The standard focus manager
     */
    do_mngrDisposeUI: eYo.doNothing,
    /**
     * Focus on a board.
     * @param {eYo.focus.Main} mngr  The main focus manager that should put focus on a board.
     */
    do_boardOn: eYo.doNothing,

    /**
     * Focus off a board.
     * @param {eYo.focus.Main} mngr  The main focus manager that should put focus off a board.
     */
    do_boardOff: eYo.doNothing,

    /**
     * Focus on a board.
     * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus on a brick.
     */
    do_brickOn: eYo.doNothing,

    /**
     * Focus off a brick.
     * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus off a brick.
     */
    do_brickOff: eYo.doNothing,

    /**
     * Focus on a field.
     * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus on a field.
     */
    do_fieldOn: eYo.doNothing,

    /**
     * Focus off a field.
     * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus off a field.
     */
    do_fieldOff: eYo.doNothing,

    /**
     * Focus on a magnet.
     * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus on a magnet.
     */
    do_magnetOn: eYo.doNothing,

    /**
     * Focus off a magnet.
     * @param {eYo.focus.Mngr} mngr  The focus manager that should put focus off a magnet.
     */
    do_magnetOff: eYo.doNothing,
  },
})




