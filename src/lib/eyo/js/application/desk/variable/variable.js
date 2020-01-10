/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Variable inspector.
 * 
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('c9r.Pane')

eYo.require('decorate')

/**
 * @name {eYo.Variable}
 * Class for a variable inspector.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.makeC9r('Variable', eYo.c9r.Pane)
