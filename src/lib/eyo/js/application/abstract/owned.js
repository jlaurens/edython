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

goog.require('eYo.Decorate')
goog.require('eYo.Dlgt')

// goog.provide('eYo.Owned')

// Possible owner
goog.forwardDeclare('eYo.Application')
// Possible owned
goog.forwardDeclare('eYo.Desk')
goog.forwardDeclare('eYo.Workspace')
goog.forwardDeclare('eYo.Flyout')
goog.forwardDeclare('eYo.Board')
goog.forwardDeclare('eYo.Brick')
goog.forwardDeclare('eYo.Slot')
goog.forwardDeclare('eYo.Magnet')

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
      this.forEachOwned(k => {
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
 * @param {!eYo.Application|eYo.Desk|eYo.Flyout|eYo.Board|eYo.Brick|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @constructor
 */
eYo.Dflt.makeSubclass('Owned', {
  init (owner) {
    this.owner_ = owner
  },
  props: {
    link: {
      owner: {
        didChange (before, after) {
          this.appForget() // do not update, may be the owner is not complete
          this.forEachOwned(x => {
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
          this.forEachOwned(x => {
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
  },
})
