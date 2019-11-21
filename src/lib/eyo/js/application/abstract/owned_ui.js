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

goog.require('eYo.UI.Constructor.Dlgt')
goog.require('eYo.Owned')

goog.provide('eYo.UI.Owned')


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
  key: 'Owned',
  owner: eYo.UI,
  super: eYo.Owned,
  dlgt: eYo.UI.Constructor.Dlgt,
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
 * Update the cached `ui_driver`.
 * 
 */
eYo.UI.Owned.prototype.appDidChange = function () {
  var super_ = eYo.UI.Owned.superClass_.appDidChange
  super_ && super_.call(this)
  this.ui_driverUpdate()
}
