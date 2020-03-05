/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview An object owns properties ans is owned by someone.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Namespace for owned objects.
 * Quite all the objects are owned.
 * Only a very few of them are top level object.
 * @name {eYo.o3d}
 * @namespace
 */
eYo.o4t.makeNS(eYo, 'o3d')

/**
 * @name{eYo.o3d.Base}
 * @constructor
 */
eYo.o3d.makeBase({
  /** @param {eYo.app.Base|eYo.view.Desk|eYo.flyout.View|eYo.board|eYo.expr|eYo.stmt|eYo.slot.Base|eYo.magnet.Base} owner  the immediate owner of this object. When not a brick, it is directly owned by a brick.
   */
  init (owner) {
    owner || eYo.throw('Missing owner!')
    this.owner_ = owner
  },
  dispose () {
    this.owner_ = eYo.NA
  },
  properties: {
    owner: {
      consolidate (after) {
        if (after.hasUI) {
          this.initUI()
        } else {
          this.disposeUI()
        }
      },
    },
    /**
     * Options
     */
    options: {
      get () {
        return this.owner_.options
      },
    },
  },
  methods: {
    /**
     * The default implementation does nothing.
     * For subclassers.
     * @param{*} before - the owner before the change
     * @param{*} after - the owner after the change
     */
    ownerWillChange: eYo.doNothing,
    /**
     * The default implementation does nothing.
     * For subclassers.
     * @param{*} before - the owner before the change
     * @param{*} after - the owner after the change
     */
    ownerDidChange: eYo.doNothing,
  }
})
