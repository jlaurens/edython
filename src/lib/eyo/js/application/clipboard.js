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
eYo.makeC9r('Clipboard', eYo.c9r.Owned, {
  valued: {
    dom: eYo.isNA,
    sourceBoard: eYo.isNA,
  },
  computed: {
    desk () {
      return this.sourceBoard_.desk
    },
    board () {
      return this.sourceBoard_.desk.board
    },
  },
})
