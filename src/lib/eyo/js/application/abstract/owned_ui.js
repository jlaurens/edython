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
goog.require('eYo.Owned')

goog.provide('eYo.Owned.UI')
goog.provide('eYo.Constructor.UI')

/**
 * Class for a basic object with a UI driver.
 * 
 * @param {!eYo.Application|eYo.Desk|eYo.Flyout|eYo.Board|eYo.Brick|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @constructor
 * @readonly
 * @property {Boolean} hasUI, Whether the receiver is faceless.
 * @readonly
 * @property {eYo.Options} options, The owner's overall options.
 * @readonly
 * @property {eYo.Driver.Mgr}ui_driver_mgr,  The ui driver manager used for rendering.
 */
eYo.Constructor.make({
  key: 'UI',
  owner: eYo.Owned,
  init: {
    begin () {
      this.disposeUI = eYo.Do.nothing
    }
  },
  props: {
    cached: {
      ui_driver: {
        init () {
          var mgr = ui_driver_mgr
          return mgr && mgr.driver(this)
        }
      },
      didChange () {
        this.constructor.eyo.forEachOwned(k => {
          
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
      ui_driver_mgr () {
        return this.hasUI && this.app && this.app.ui_driver_mgr
      },          
    }
  }
})

/**
 * Update the cached `ui_driver`.
 * 
 */
eYo.Owned.UI.prototype.appDidChange = function () {
  eYo.Owned.UI.superClass_.appDidChange.call(this)
  this.ui_driverUpdate()
}

eYo.Constructor.UI = Object.create(null)

/**
 * Constructor maker.
 * The delegate of the constructor has convenient methods
 * named `makeInitUI` and `makeDisposeUI` to
 * make the `initUI` and `disposeUI` methods of the prototype.
 * They are used for 
 */
eYo.Constructor.UI.make = (params) => {
  var ctor = eYo.Constructor.make(params)
  ctor.eyo__.makeDisposeUI = (f) => {
    ctor.prototype.disposeUI = function () {
      try {
        this.disposeUI = eYo.Do.nothing
        f && f.apply(this, arguments)
        var super_ = ctor.superClass_
        !!super_ && !!super_.disposeUI && !!super_.disposeUI.apply(this, arguments)
      } finally {
        delete this.disposeUI
      }
    }
  }
  ctor.eyo__.makeInitUI = (f) => {
    ctor.prototype.initUI = function () {
      try {
        this.initUI = eYo.Do.nothing
        var super_ = ctor.superClass_
        !!super_ && !!super_.initUI && !!super_.initUI.apply(this, arguments)
        f && f.apply(this, arguments)
      } finally {
        delete this.initUI
      }
    }
  }
  var ui = params.ui
  ctor.eyo__.makeInitUI(ui && ui.init
    ? function () {
      this.ui_driver.init(this)
      ui.init.call(this)
    }
    : function () {
      this.ui_driver.init(this)
    }
  )
  ctor.eyo__.makeDisposeUI(ui && ui.dispose
    ? function () {
      ui.dispose.call(this)
      this.ui_driver.init(this)
    }
    : function () {
      this.ui_driver.dispose(this)
    }
  )
}
