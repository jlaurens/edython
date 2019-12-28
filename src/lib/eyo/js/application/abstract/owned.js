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

eYo.require('Decorate')
eYo.require('C9r')

// eYo.provide('C9r.Owned')

// Possible owner
eYo.forwardDeclare('Application')
// Possible owned
eYo.forwardDeclare('Desk')
eYo.forwardDeclare('Workspace')
eYo.forwardDeclare('Flyout')
eYo.forwardDeclare('Board')
eYo.forwardDeclare('Brick')
eYo.forwardDeclare('Slot')
eYo.forwardDeclare('Magnet')

/**
 * Class for a basic object.
 * 
 * @param {eYo.Application|eYo.Desk|eYo.Flyout|eYo.Board|eYo.Expr|eYo.Stmt|eYo.Slot|eYo.Magnet.Dflt} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @constructor
 */
eYo.C9r.makeClass('Owned', {
  init (owner) {
    eYo.parameterAssert(owner, 'Missing owner!')
    this.owner_ = owner
  },
  valued: {
    owner: {
      didChange (before, after) {
        if (before) {
          this.appForget() // do not update, may be the owner is not yet complete
          this.ownedForEach(x => {
            x.appForget && x.appForget()
          })  
        }
      },
      consolidate(after) {
        if (after.hasUI) {
          this.initUI()
        } else {
          this.disposeUI()
        }
      }
    }
  },
  cached: {
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
    }
  },
  computed: {
    /**
     * Options
     */
    options () {
      return this.owner.options
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
     * @type {eYo.Board}
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

eYo.assert(eYo.C9r.Owned, 'MISSING eYo.C9r.Owned')

/**
 * Class for a basic object indirectly owned by a brick.
 * 
 * @name {eYo.C9r.BSMOwned}
 * @constructor
 * @param {eYo.Brick|eYo.Slot|eYo.Magnet.Dflt} owner  the immediate owner of this magnet. When not a brick, it is indirectly owned by a brick.
 * @readonly
 * @property {eYo.Brick.UI} ui  The ui object used for rendering.
 * @readonly
 * @property {eYo.Brick} brick  The brick.
 * @readonly
 * @property {eYo.Slot} slot  The slot.
 * @readonly
 * @property {eYo.Magnet.Dflt} magnet  The magnet.
 */

eYo.C9r.Owned.makeSubclass('BSMOwned', {
  valued: ['slot', 'brick', 'magnet'],
  computed: {
    ui () {
      return this.brick.ui
    }
  }
})

eYo.assert(!!eYo.C9r.BSMOwned && !!eYo.C9r.BSMOwned_p, 'MISSED/FAILURE...')

eYo.forwardDeclare('Brick')
eYo.forwardDeclare('Brick.UI')
eYo.forwardDeclare('Slot')
eYo.forwardDeclare('Magnet')

eYo.C9r.BSMOwned_p.ownerDidChange = function (before, after) {
  this.slot_ = this.brick_ = this.magnet_ = eYo.NA
  if (after instanceof eYo.Slot) {
    this.slot_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.Magnet.Dflt) {
    this.magnet_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.Brick.Dflt) {
    this.brick_ = after
  }
}
