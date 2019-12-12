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

eYo.require('eYo.Decorate')
eYo.require('eYo.Factory')

// eYo.provide('eYo.Factory.Owned')

// Possible owner
eYo.forwardDeclare('eYo.Application')
// Possible owned
eYo.forwardDeclare('eYo.Desk')
eYo.forwardDeclare('eYo.Workspace')
eYo.forwardDeclare('eYo.Flyout')
eYo.forwardDeclare('eYo.Board')
eYo.forwardDeclare('eYo.Brick')
eYo.forwardDeclare('eYo.Slot')
eYo.forwardDeclare('eYo.Magnet')

/**
 * Add the cached `app` property to the associate constructor.
 * NYU.
 */
eYo.Dlgt.prototype.addApp = function () {
  this.declareCached_('app', {
    get () {
      return this.owner__.app
    },
    forget () {
      this.ownedForEach(k => {
        var x = this[k]
        x && x.appForget && x.appForget()
      })
//      this.ui_driverForget && this.ui_driverForget()
    }
  })
}

/**
 * Class for a basic object.
 * 
 * @param {eYo.Application|eYo.Desk|eYo.Flyout|eYo.Board|eYo.Expr|eYo.Stmt|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @constructor
 */
eYo.Factory.makeClass('Owned', eYo.Dflt, {
  init (owner) {
    this.owner_ = owner
  },
  linked: {
    owner: {
      didChange (before, after) {
        this.appForget() // do not update, may be the owner is not complete
        this.ownedForEach(x => {
          x.appForget && x.appForget()
        })
      }
    }
  },
  cached: {
    app: {
      init () {
        return this.owner && this.owner.app
      },
      didChange (before, after) {
        this.ownedForEach(x => {
          x.appForget && x.appForget()
        })
      },
    }
  },
  computed: {
    /**
     * The app's desk
     * @readonly
     * @type {eYo.Desk}
     */
    desk () {
      return this.app.desk
    },
    /**
     * The desk's flyout...
     * @readonly
     * @type {eYo.Flyout}
     */
    flyout () {
      return this.desk.flyout
    },
    /**
     * The desk's board
     * @readonly
     * @type {eYo.Board}
     */
    board () {
      return this.desk.board
    },
    /**
     * The owner's workspace...
     * @readonly
     * @type {eYo.Workspace}
     */
    workspace () {
      return this.desk.workspace
    },
  },
})

eYo.assert(eYo.Factory.Owned, 'MISSING eYo.Factory.Owned')
