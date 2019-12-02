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

eYo.require('eYo.Protocol')

eYo.provide('eYo.Protocol.ChangeCount')

eYo.forwardDeclare('eYo.Events')

eYo.Protocol.ChangeCount = {
  methods: {},
  properties: {}
}

/**
 * Reset the change count to 0.
 * Should be sent when the document is saved.
 * `this.resetChangeCount()` must be sent at initialization time by the constructor.
 */
eYo.Protocol.ChangeCount.methods.resetChangeCount = function () {
  this.changeCount_ = 0
}

/**
 * Update the change count.
 * @param {eYo.Event} event  The current event fired.
 * @param {!Boolean} redo  Whether (re)doing, id est not undoing.
 */
eYo.Protocol.ChangeCount.methods.updateChangeCount = function (event, redo) {
  if (event.type == eYo.Events.UI) {
    return
  }
  if (redo) {
    ++this.changeCount_
  } else {
    --this.changeCount_
  }
}

/**
 * Read only change count property.
 */
eYo.Protocol.ChangeCount.properties.changeCount = {
  get () {
    return this.changeCount_
  }
}
