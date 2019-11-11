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
goog.require('eYo.Property')

goog.provide('eYo.Owned')
goog.provide('eYo.Owned.UI')

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
  owner_: {
    get () {
      return this.owner__
    },
    set (owner) {
      var old = this.owner__
      if (old !== owner) {
        this.ownerWillChange(old, owner)
        this.owner__ = owner
        this.ownerDidChange(old, owner)
      }
    }
  },
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
   * The owner's overall options.
   * @readonly
   * @type {eYo.Options}
   */
  options: {
    get () {
      return this.owner.options
    }
  },
  /**
   * The owner's application...
   * @readonly
   * @type {eYo.Application}
   */
  app: {
    get () {
      return this.owner.app
    }
  },
  /**
   * The owner's desk
   * @readonly
   * @type {eYo.Board}
   */
  desk: {
    get () {
      return this.owner.desk
    }
  },
  /**
   * The desk's flyout...
   * @readonly
   * @type {eYo.Flyout}
   */
  flyout: {
    get () {
      return this.desk.flyout
    }
  },
  /**
   * The desk's board
   * @readonly
   * @type {eYo.Board}
   */
  board: {
    get () {
      return this.desk.board
    }
  },
  /**
   * The owner's workspace...
   * @readonly
   * @type {eYo.Workspace}
   */
  workspace: {
    get () {
      return this.owner.workspace
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
 * Decorator to wrap the `dispose` between appropriate calls to `disposeUI` and the inherited code.
 * Caveat: Arguments are the same for all the hierarchy.
 */
eYo.Decorate.dispose = (constructor, f) => {
  return function () {
    try {
      this.dispose = eYo.Do.nothing
      this.disposeUI()
      f.apply(this, arguments)
      var super_ = constructor.superClass_
      if (!!super_ && !!super_.dispose) {
        super_.dispose.apply(this, arguments)
      }
    } finally {
      delete this.dispose
    }
  }
}

/**
 * Class for a basic object with a UI driver.
 * 
 * @param {!eYo.Application|eYo.Desk|eYo.Flyout|eYo.Board|eYo.Brick|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @constructor
 */
eYo.Owned.UI = function (owner) {
  eYo.Owned.UI.superClass_.constructor.call(this, owner)
  this.disposeUI = eYo.Do.nothing
}
goog.inherits(eYo.Owned.UI, eYo.Owned)

Object.defineProperties(eYo.Owned.UI.prototype, {
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
   * @type {eYo.Driver.Mgr}  The ui driver manager used for rendering.
   * @readonly
   */
  ui_driver_mgr: {
    get () {
      return this.hasUI && this.app.ui_driver_mgr
    }
  },
})

/**
 * Decorator to make the UI only when the owner has a UI.
 * Caveat: arguments are the same throughout the inheritance hierarchy.
 */
eYo.Decorate.makeUI = (constructor, f) => {
  return function () {
    if (this.owner.hasUI) {
      try {
        this.makeUI = eYo.Do.nothing
        f.apply(this, arguments)
        var super_ = constructor.superClass_
        if (!!super_ && !!super_.makeUI) {
          super_.makeUI.apply(this, arguments)
        }
      } finally {
        delete this.disposeUI
      }
    }
  }
}

/**
 * Decorator to make the UI only when the owner has a UI.
 */
eYo.Decorate.disposeUI = (constructor, f) => {
  return function () {
    this.disposeUI = eYo.Do.nothing
    try {
      f.call(this)
      var super_ = super_
      if (!!super_ && !!super_.disposeUI) {
        super_.disposeUI.call(this)
      }
    } finally {
      delete this.makeUI
    }
  }
}

/**
 * Add a driver to the given prototype.
 */
eYo.Property.addUIDriver = (proto, key) => {
  eYo.Property.addCached(proto, 'ui_driver', {
    get () {
      return this.app.ui_driver_mgr[key]
    }
  })
}