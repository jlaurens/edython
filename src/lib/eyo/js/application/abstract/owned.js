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
goog.require('eYo.Constructor')

goog.provide('eYo.Owned')

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
 * Class for a basic object.
 * 
 * @param {!eYo.Application|eYo.Desk|eYo.Flyout|eYo.Board|eYo.Brick|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @constructor
 */
eYo.Constructor.make({
  key: 'Owned',
  owner: eYo,
  super: null,
  init (owner) {
    this.owner_ = owner
  },
  props: {
    link: {
      owner: {
        didChange (before, after) {
          this.appForget() // do not update, may be the owner is not complete
          this.constructor.eyo.forEachOwned(k => {
            var x = this[k]
            x && x.appForget && x.appForget()
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
          this.constructor.eyo.forEachOwned(k => {
            var x = this[k]
            x && x.appForget && x.appForget()
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
