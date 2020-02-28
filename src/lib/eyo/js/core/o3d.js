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
  /** @param {eYo.app.Base|eYo.view.Desk|eYo.view.Flyout|eYo.board|eYo.expr|eYo.stmt|eYo.slot.Base|eYo.magnet.Base} owner  the immediate owner of this object. When not a brick, it is directly owned by a brick.
   */
  init (owner) {
    owner || eYo.throw('Missing owner!')
    this.owner_ = owner
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
      dispose: false,
    },
    /**
     * Options
     */
    options: {
      get () {
        return this.owner.options
      },
    },
    /**
     * The app's audio manager
     * @readonly
     * @type {eYo.dom.Audio}
     */
    audio: {
      get () {
        let a = this.app ; return a && a.audio
      },
    },
    /**
     * The app's desk
     * @readonly
     * @type {eYo.view.Desk}
     */
    desk: {
      get () {
        let a = this.app ; return a && a.desk
      },
    },
    /**
     * The desk's flyout...
     * @readonly
     * @type {eYo.view.Flyout}
     */
    flyout: {
      get () {
        let d = this.desk ; return d && d.flyout
      },
    },
    /**
     * The desk's board
     * @readonly
     * @type {eYo.board}
     */
    board: {
      get () {
        let d = this.desk ; return d && d.board
      },
    },
    /**
     * The desk's workspace...
     * @readonly
     * @type {eYo.view.Workspace}
     */
    workspace: {
      get () {
        let d = this.desk ; return d && d.workspace
      },
    },
  },
})
