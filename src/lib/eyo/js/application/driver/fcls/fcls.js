/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Fcls utils. Some code specific to flyout and desk.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('eYo.NS_Driver')

/**
 * @name {eYo.NS_Fcls}
 * @namespace
 */
eYo.NS_Driver.makeNS(eYo, 'Fcls')

/**
 * @name {eYo.NS_Fcls.Mngr}
 * The manager of all the faceless drivers.
 */
eYo.NS_Fcls.makeMngrClass()
