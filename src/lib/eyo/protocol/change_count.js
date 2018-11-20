/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Workspace override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Protocol.ChangeCount')

goog.require('eYo.Protocol')
goog.require('eYo.Events')

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
 * @param {Blockly.Event} event  The current event fired.
 * @param {!Boolean} redo  Whether (re)doing, id est not undoing.
 */
eYo.Protocol.ChangeCount.methods.updateChangeCount = function (event, redo) {
  if (event.type == Blockly.Events.UI) {
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
