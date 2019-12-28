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

eYo.require('C9r.Pane')

/**
 * @name {eYo.Terminal}
 * Class for a terminal.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.makeClass('Terminal', eYo.C9r.Pane)
