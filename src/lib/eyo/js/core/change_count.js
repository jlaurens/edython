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

eYo.require('c9r')
eYo.provide('changeCount')

eYo.c9r.Dlgt_p.changeCountAdd = function () {
  this.modelDeclare({
    properties: {
      changeCount: 0,
    },
    methods: {
      updateChangeCount (event, redo) {
        if (event.type == eYo.event.UI) {
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