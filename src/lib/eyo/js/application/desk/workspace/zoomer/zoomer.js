/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Zoomer.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('eYo.WorkspaceControl')

/**
 * Zoom controls model
 * @param {eYo.Workspace} workspace Workspace to zoom.
 * @constructor
 */
eYo.WorkspaceControl.makeSubclass(eYo, 'Zoomer')

Object.defineProperties(eYo.Zoomer.prototype, {
  HEIGHT_: { value: 110 },
})
