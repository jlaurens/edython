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

eYo.require('driver')

/**
 * @name {eYo.fcls}
 * @namespace
 */
eYo.driver.makeNS(eYo, 'fcls')

/**
 * @name {eYo.fcls.Mngr}
 * The manager of all the faceless drivers.
 */
eYo.fcls.makeMngr()
