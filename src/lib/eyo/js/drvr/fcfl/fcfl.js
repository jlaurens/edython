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

eYo.require('drvr')

/**
 * @name {eYo.fcls}
 * @namespace
 */
eYo.fcls.newNS(eYo, 'fcfl', {
  OWNER: new eYo.C3s(),
})

/**
 * @name {eYo.fcfl.Mngr}
 * The manager of all the facefull drivers.
 */
eYo.fcfl.makeMngr()
