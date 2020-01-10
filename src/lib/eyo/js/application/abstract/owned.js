/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Basic object owned by either an application...
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('decorate')
eYo.require('c9r')

// eYo.provide('c9r.Owned')

// Possible owner
eYo.forwardDeclare('app')
// Possible owned
eYo.forwardDeclare('Desk')
eYo.forwardDeclare('Workspace')
eYo.forwardDeclare('Flyout')
eYo.forwardDeclare('board')
eYo.forwardDeclare('brick')
eYo.forwardDeclare('slot')
eYo.forwardDeclare('magnet')

/**
 * Class for a basic object.
 * 
 * @param {eYo.app.Dflt|eYo.Desk|eYo.Flyout|eYo.board|eYo.expr|eYo.stmt|eYo.slot.Dflt|eYo.magnet.Dflt} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @constructor
 */
eYo.c9r.makeClass('Owned', {
  init (owner) {
    eYo.ParameterAssert(owner, 'Missing owner!')
    this.owner_ = owner
  },
  valued: {
    owner: {
      didChange (before, after) /** @suppress {globalThis} */ {
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

eYo.Assert(eYo.c9r.Owned, 'MISSING eYo.c9r.Owned')

/**
 * Class for a basic object indirectly owned by a brick.
 * 
 * @name {eYo.c9r.BSMOwned}
 * @constructor
 * @param {eYo.brick|eYo.slot.Dflt|eYo.magnet.Dflt} owner  the immediate owner of this magnet. When not a brick, it is indirectly owned by a brick.
 * @readonly
 * @property {eYo.brick.UI} ui  The ui object used for rendering.
 * @readonly
 * @property {eYo.brick.Dflt} brick  The brick.
 * @readonly
 * @property {eYo.slot.Dflt} slot  The slot.
 * @readonly
 * @property {eYo.magnet.Dflt} magnet  The magnet.
 */

eYo.c9r.Owned.makeSubclass('BSMOwned', {
  valued: ['slot', 'brick', 'magnet'],
  computed: {
    ui () {
      return this.brick.ui
    }
  }
})

eYo.Assert(!!eYo.c9r.BSMOwned && !!eYo.c9r.BSMOwned_p, 'MISSED/FAILURE...')

eYo.forwardDeclare('brick')
eYo.forwardDeclare('slot')
eYo.forwardDeclare('magnet')

eYo.c9r.BSMOwned_p.ownerDidChange = function (before, after) {
  this.slot_ = this.brick_ = this.magnet_ = eYo.NA
  if (after instanceof eYo.slot.Dflt) {
    this.slot_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.magnet.Dflt) {
    this.magnet_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.brick.Dflt) {
    this.brick_ = after
  }
}
