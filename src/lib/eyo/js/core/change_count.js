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

eYo.o4t.makeNS('changeCount')

eYo.o4t.changeCount.modelDeclare({
  properties: {
    changeCount: 0,
  },
  methods: {
    /**
     * If the event is not a UI event,
     * adds 1 to change count on redo,
     * removes 2 on undo.
     * Order of params does not matter.
     * @param {Boolean} [redo] - defaults to `true`
     * @param {Event} [event]
     */
    updateChangeCount (redo, event) {
      if (redo === true) {
        var what = 1
      } else if (redo === false) {
        what = -1
      } else {
        what = event || eYo.isNA(event) ? 1 : -1
        event = redo
      }
      if (!event || !event.isUI) {
        this.changeCount_ += what
      }
    },
    /**
     * Resets the change count to 0.
     */
    resetChangeCount () {
      this.changeCount_ = 0
    }
  },
})
