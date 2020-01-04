/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.provide('ChangeCount')

eYo.Dlgt_p.changeCountAdd = function () {
  this.modelDeclare({
    valued: {
      changeCount: 0,
    },
    called: {
      updateChangeCount (event, redo) {
        if (event.type == eYo.Events.UI) {
          return
        }
        if (redo) {
          ++this.changeCount_
        } else {
          --this.changeCount_
        }
      },
      resetChangeCount () {
        this.changeCount_ = 0
      }
    },
  })
}