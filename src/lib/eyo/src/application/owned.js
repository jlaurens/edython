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

goog.provide('eYo.Owned')

goog.require('eYo.Property')
goog.require('eYo.Decorate')

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
eYo.Owned = function (owner) {
  this.owner__ = owner
  this.disposeUI = eYo.Do.nothing
}

// public computed properties

Object.defineProperties(eYo.Owned.prototype, {
  /**
   * @type {Object}
   */
  owner__: {value: null, writable: true},
  /**
   * @type {Object}
   * @readonly
   */
  owner: {
    get () {
      return this.owner__
    }
  },
  /**
   * @readonly
   * @type {eYo.Application}  The application...
   */
  app: {
    get () {
      return this.owner.app
    }
  },
  /**
   * @readonly
   * @type {eYo.Board}  The board...
   */
  desk: {
    get () {
      return this.owner.desk
    }
  },
  /**
   * @readonly
   * @type {eYo.Board}  The board...
   */
  board: {
    get () {
      return this.owner.board
    }
  },
  /**
   * @readonly
   * @type {eYo.Board}  The board...
   */
  workspace: {
    get () {
      return this.owner.workspace
    }
  },
  /**
   * Whether the receiver is faceless.
   * @type {Boolean}
   */
  hasUI: {
    get () {
      return !this.makeUI || this.makeUI === eYo.Do.nothing
    }
  },
  /**
   * @readonly
   * @type {eYo.Driver}  The ui driver used for rendering.
   */
  ui_driver: {
    get () {
      return this.hasUI && this.owner.ui_driver
    }
  },
})

/**
 * Dispose of the ressources, sever the links.
 */
eYo.Owned.prototype.dispose = function () {
  this.owner__ = null
}

/**
 * Decorator to make the UI only when the owner has a UI.
 */
eYo.Decorate.makeUI = (f) => {
  return function () {
    if (this.owner.hasUI) {
      f.apply(this, arguments)
    }
  }
}