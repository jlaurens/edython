/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Terminal model.
 * The terminal is used to execute (python) code.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('eYo.Pane')

eYo.provide('eYo.Terminal')

/**
 * Class for a terminal.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.NS_UI.makeClass('Terminal', eYo.Pane)
