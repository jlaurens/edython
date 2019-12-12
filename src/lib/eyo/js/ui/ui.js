/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Standalone Audio manager.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Factory')
eYo.require('Factory.Owned')

// eYo.provide('UI')

/**
 * Class for loading, storing, and playing audio.
 * @name {eYo.UI}
 * @namespace
 */

 eYo.makeNS('UI')

/**
 * @name {eYo.UI.Dlgt}
 * @param {Function} c9r -  constructor
 * @param {String} key -  key
 * @param {Object} key -  model
 * @constructor
 * Constructor delegate subclass
 */
eYo.Dlgt.makeSubclass(eYo.UI)

/**
 * Make the dispose function.
 * @override
 */
eYo.UI.Dlgt.prototype.disposeDecorate = function (f) {
  return eYo.UI.Dlgt.superClass_.disposeDecorate.call(this, function () {
    this.disposeUI()
    f && f.apply(this, arguments)
  })
}

/**
 * Helper to make the `initUI` method based on the given function.
 * @param {Function} [f]  a function with at least one argument.
 */
eYo.UI.Dlgt.prototype.initUIDecorate = function (f) {
  return f
}

/**
 * Helps to make the `disposeUI` method based on the given function.
 * @param {Function} [f]  a function with at least one argument.
 */
eYo.UI.Dlgt.prototype.disposeUIDecorate = function (f) {
  return f
}

/**
 * Add the cached `app` property to the associate constructor.
 * NYU.
 */
eYo.UI.Dlgt.prototype.addApp = function () {
  this.declareCached_('app', {
    get () {
      return this.owner__.app
    },
    forget () {
      this.ownedForEach(k => {
        var x = this[k]
        x && x.appForget && x.appForget()
      })
      this.ui_driverForget && this.ui_driverForget()
    }
  })
}

/**
 * Class for a basic object with a UI driver.
 * 
 * @name {eYo.UI.Dflt}
 * @constructor
 * @param {eYo.Application|eYo.Desk|eYo.Flyout|eYo.Board|eYo.Brick|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @constructor
 * @readonly
 * @property {Boolean} hasUI, Whether the receiver is faceless.
 * @readonly
 * @property {eYo.Options} options, The owner's overall options.
 * @readonly
 * @property {eYo.Driver.Mngr}ui_driver_mngr,  The ui driver manager used for rendering.
 */
eYo.Factory.Owned.makeSubclass(eYo.UI, 'Dflt', {
  init: {
    begin () {
      this.disposeUI = eYo.Do.nothing
    }
  },
  cached: {
    ui_driver: {
      init () {
        var mngr = this.ui_driver_mngr
        return mngr && mngr.driver(this)
      }
    },
    didChange () {
      this.ownedForEach(x => {
        x.ui_driverUpdate && x.ui_driverUpdate()
      })
    }
  },
  computed: {
    hasUI () {
      return !this.initUI || this.initUI === eYo.Do.nothing
    },
    options () {
      return this.owner.options
    },
    ui_driver_mngr () {
      return this.hasUI && this.app && this.app.ui_driver_mngr
    },          
  }
})

eYo.assert(eYo.UI.Dflt, 'MISSING eYo.UI.Dflt')

/**
 * Update the cached `ui_driver` each time the app object changes.
 * 
 */
eYo.UI.Dflt.prototype.appDidChange = function () {
  var super_ = eYo.UI.Dflt.superClass_.appDidChange
  super_ && super_.call(this)
  this.ui_driverUpdate()
}

eYo.UI.Dflt.prototype.ownerDidChange = function (before, after) {
  var super_ = eYo.UI.Dflt.superClass_.ownerDidChange
  super_ && super_call(this, before, after)
  this.slot_ = this.brick_ = this.magnet_ = eYo.NA
  if (after instanceof eYo.Slot) {
    this.slot_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.Magnet) {
    this.magnet_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.Brick.Dflt) {
    this.brick_ = after
  }
}

 /**
  * @name {eYo.UI.makeClass}
 * Constructor maker.
 * The delegate of the constructor has convenient methods
 * named `initUIDecorate` and `disposeUIDecorate` to
 * make the `initUI` and `disposeUI` methods of the prototype.
 * @param {Object} [ns] -  A namespace. Defaults to `eYo`.
 * @param {String} key -  The key.
 * @param {Function} [Super] -  The eventual super class. There is no default value. If given, it must be a subclass of `eYo.UI.Dflt`.
 * @param {Function} [Dlgt] -  The constructor's delegate class. Defaults to the constructor of `Super`'s delegate if any. Must be a subclass of `eYo.UI.Dlgt`.
 * @param {Object} model -  The dictionary of parameters.
 * @return {Function} the created constructor.
 */
eYo.UI.constructor.prototype.makeClass = function (ns, key, Super, Dlgt, model) {
  var C9r = eYo.UI.constructor.superClass_.makeClass.apply(this, arguments)
  var eyo = C9r.eyo
  model = eyo.model // arguments may have changed
  var ui = model.ui
  if (!eYo.isF(eyo.initUIDecorate)) {
    console.error('BREAK HERE')
    C9r = eYo.makeClass(ns, key, Super, Dlgt, model)
  }
  var f = eyo.initUIDecorate(ui && ui.dispose)
  C9r.prototype.initUI = function (...args) {
    try {
      this.initUI = eYo.Do.nothing
      var super_ = C9r.superClass_
      !!super_ && !!super_.initUI && !!super_.initUI.call(this, ...args)
      this.ui_driver.init(this, ...args)
      f && f.apply(this, ...args)
    } finally {
      delete this.initUI
    }
  }
  var f = eyo.disposeUIDecorate (ui && ui.init)
  C9r.prototype.disposeUI = function (...args) {
    try {
      this.disposeUI = eYo.Do.nothing
      f && f.apply(this, arguments)
      this.ui_driver.disposeInstance(this)
      var super_ = C9r.superClass_
      !!super_ && !!super_.disposeUI && !!super_.disposeUI.apply(this, arguments)
    } finally {
      delete this.disposeUI
    }
  }
  return C9r
}
