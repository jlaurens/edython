/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Clipboard manager, in progress.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

console.error('In progress')

/**
 * 
 */
eYo.o3d.makeC9r(eYo, 'Clipboard', {
  properties: {
    dom: eYo.isNA,
    sourceBoard: eYo.isNA,
    desk: {
      get () {
        return this.sourceBoard.desk
      },
    },
    board: {
      get () {
        return this.sourceBoard.desk.board
      },
    },
  },
})
