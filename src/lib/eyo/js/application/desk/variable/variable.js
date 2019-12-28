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

eYo.require('C9r.Pane')

eYo.require('Decorate')

/**
 * @name {eYo.Variable}
 * Class for a variable inspector.
 * @param {eYo.Desk} owner Owner desk.
 * @constructor
 */
eYo.makeClass('Variable', eYo.C9r.Pane)
