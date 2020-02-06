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
 * @name{eYo.o3d.Dflt}
 * @constructor
 */
eYo.o3d.makeDflt({
  /** @param {eYo.app.Dflt|eYo.Desk|eYo.Flyout|eYo.board|eYo.expr|eYo.stmt|eYo.slot.Dflt|eYo.magnet.Dflt} owner  the immediate owner of this object. When not a brick, it is directly owned by a brick.
   */
  init (owner) {
    !owner && eYo.throw('Missing owner!')
    this.owner_ = owner
  },
  valued: {
    owner: {
      didChange (before) /** @suppress {globalThis} */ {
        if (before) {
          this.appForget() // do not update, may be the owner is not yet complete
          this.ownedForEach(x => {
            x.appForget && x.appForget()
          })  
        }
      },
      consolidate (after) {
        if (after.hasUI) {
          this.initUI()
        } else {
          this.disposeUI()
        }
      }
    }
  },
  cached: {
    /**
     * The root application
     * @type {eYo.app}
     */
    app: {
      init () {
        let o = this.owner ; return o && o.app
      },
      forget (forgetter) {
        this.ownedForEach(x => {
          x.appForget && x.appForget()
        })
        forgetter()
      },
    },
  },
  computed: {
    /**
     * Options
     */
    options () {
      return this.owner.options
    },
    /**
     * The app's audio manager
     * @readonly
     * @type {eYo.dom.Audio}
     */
    audio () {
      let a = this.app ; return a && a.audio
    },
    /**
     * The app's desk
     * @readonly
     * @type {eYo.Desk}
     */
    desk () {
      let a = this.app ; return a && a.desk
    },
    /**
     * The desk's flyout...
     * @readonly
     * @type {eYo.Flyout}
     */
    flyout () {
      let d = this.desk ; return d && d.flyout
    },
    /**
     * The desk's board
     * @readonly
     * @type {eYo.board}
     */
    board () {
      let d = this.desk ; return d && d.board
    },
    /**
     * The owner's workspace...
     * @readonly
     * @type {eYo.Workspace}
     */
    workspace () {
      let d = this.desk ; return d && d.workspace
    },
  },
})
