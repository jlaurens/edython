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

eYo.require('pane.WorkspaceControl')

/**
 * Zoom controls model
 * @param {eYo.Workspace} workspace Workspace to zoom.
 * @constructor
 */
eYo.pane.WorkspaceControl.makeInheritedC9r('Zoomer', {
  valued: {
    HEIGHT_: { init: 110 },
  }
})
