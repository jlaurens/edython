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

goog.require('eYo.UI')

goog.require('eYo.UI.Dlgt')

goog.require('eYo.Owned')

goog.provide('eYo.UI.Dflt')

/**
 * @name {eYo.UI.Dlgt}
 * @param {!Function} c9r,  the constructor
 * @constructor
 * Basic constructor delegate.
 */
eYo.Dlgt.makeSublass(eYo.UI, 'Dlgt')

/**
 * Class for a basic object with a UI driver.
 * 
 * @name {eYo.UI.Dflt}
 * @constructor
 * @param {!eYo.Application|eYo.Desk|eYo.Flyout|eYo.Board|eYo.Brick|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is directly owned by a brick.
 * @constructor
 * @readonly
 * @property {Boolean} hasUI, Whether the receiver is faceless.
 * @readonly
 * @property {eYo.Options} options, The owner's overall options.
 * @readonly
 * @property {eYo.Driver.Mgr}ui_driver_mgr,  The ui driver manager used for rendering.
 */
eYo.Owned.makeSublass(eYo.UI, 'Dflt', {
  init: {
    begin () {
      this.disposeUI = eYo.Do.nothing
    }
  },
  props: {
    cached: {
      ui_driver: {
        init () {
          var mgr = this.ui_driver_mgr
          return mgr && mgr.driver(this)
        }
      },
      didChange () {
        this.forEachOwned(x => {
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
      ui_driver_mgr () {
        return this.hasUI && this.app && this.app.ui_driver_mgr
      },          
    }
  }
})

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
