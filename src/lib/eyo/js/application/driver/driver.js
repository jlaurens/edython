/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate. Do nothing driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name {eYo.driver}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'driver')

/**
 * @name {eYo.driver.Mngr}
 * Default driver manager, abstract class to be subclassed.
 * Owns instances of `eYo.Driver`'s descendants.
 * @param {Object} owner
 */
eYo.driver.makeC9r('Mngr', {
  dlgt () {
    this.driverC9rByName = Object.create(null)
  },
  properties: {
    allPurposeDriver: {
      value () {
        let handler = {
          get (obj, prop) {
            if (prop in obj) {
              return obj[prop]
            }
            throw new Error(`Missing driver property named ${prop} in object ${obj}`)
          },
          set (obj, prop, value) {
            if (prop in obj) {
              obj[prop] = value
            }
            throw new Error(`Missing driver property named ${prop} in object ${obj}`)
          }
        }
        return new Proxy(new this.eyo.ns.Base (this), handler)
      },
    },
    drivers: {
      value () {
        return Object.create(null)
      },
      didChange (after) {
        after && this.initDrivers()
      },
    }
  },
})

/**
 * Convenient driver constructor maker.
 * The prototype will have eventually an `doInitUI` or `doDisposeUI`
 * wrapping the model's eponym methods, if any.
 * The owner will have a dafault driver named `Base`,
 * which is expected to be the ancestor of all drivers.
 * @param {String} key - a (titlecased) word, the name of the subclass (last component)
 * @param {Function} [Super] - the super class of the driver constructor,
 * defaults to the owner's super_'s key property or the owner's `Base`.
 * @param {Object} driverModel
 * An object with various keys:
 * - owner: An object owning the class, basically a namespace object.
 * If the owner is `Foo` and the key is 'Bar', the created constructor
 * is `Foo.Bar`. Actually used with `eYo` as owner, 'dom' or 'svg' as key.
 * - doInitUI: an optional function with signature (object, ...)->eYo.NA
 * - doDisposeUI: an optional function with signature (object)->eYo.NA
 */
eYo.driver.Mngr.eyo_p.makeDriverC9r = function (key, Super, driverModel) {
  var ns = this.ns
  if (!eYo.isSubclass(Super, eYo.Driver)) {
    driverModel && eYo.throw(`Unexpected model ${driverModel}`)
    driverModel = eYo.called(Super) || {}
    Super = ns.super[key] || ns.Base
  }
  if (!eYo.isSubclass(Super, ns.Base)) {
    Super = ns.Base
  }
  var Driver = eYo.c9r.makeC9r(ns, key, Super, driverModel)
  var x = Driver.eyo.name.split('.') // x = ['eYo', 'Dom', 'Brick']
  x.shift()
  x = x.join('.') // 'Dom.Brick'
  this.driverC9rByName[x] = Driver
  var _p = Driver.prototype
  var m_ui = this.model.ui
  var d_ui = Driver.eyo.model.ui
  _p.doInitUI = function () {
    Super.prototype.doInitUI && Super.prototype.doInitUI.apply(this, arguments)
    var f = m_ui && m_ui.initMake
    var ff = d_ui && d_ui.doInit
    f = (f && f(ff)) || ff
    return f && f.apply(this, arguments)
  }
  _p.doDisposeUI = function () {
    var f = m_ui && m_ui.disposeMake
    var ff = d_ui && d_ui.doDispose
    f = (f && f(ff)) || ff
    f && f.apply(this, arguments)
    Super.prototype.doDisposeUI && Super.prototype.doDisposeUI.apply(this, arguments)
  }
}

/**
 * Usage: `eYo.driver.makeMngr(model)`.
 * Actual implementation with Fcls, Fcfl, Dom and Svg drivers.
 * {Code: ns.Mngr} is instantiated by the main application object.
 * The `Base` class is also created.
 ** @param {Object} [mngrModel] -  model used for creation, see `makeC9r`.
 * @return {Function} a constructor equals to ns.Mngr
 */
eYo.driver._p.makeMngr = function (mngrModel) {
  if (this === eYo.driver) {
    return
  }
  this._p.hasOwnProperty('Base') || this.hasOwnProperty('Base') || this.makeBase()
  let Super = this.super.Mngr
  var Mngr = this.makeC9r(Super, mngrModel)
  Mngr.prototype.initDrivers = function () {
    if (!this.drivers) {
      console.error('BREAK HERE!')
    }
    for (let [name, Driver] of Object.entries(Mngr.eyo.driverC9rByName)) {
      // do not override
      this.drivers[name] || (this.drivers[name] = new Driver(this))
    }
    Super.prototype.initDrivers.call(this)
  }
  return Mngr
}

/**
 * Usage: `eYo.driver.makeDriverC9r(model)`.
 * Actual implementation with Fcls, Fcfl, Dom and Svg drivers.
 * {Code: ns.Mngr} is instantiated by the main application object.
 * @param {String} key -  The key of the driver
 * @param {Object} [Super] -  The ancestor of the driver
 * @param {Object} [mngrModel] -  model used for creation
 * @return {Function} a constructor equals to this.Mngr[key]
 */
eYo.driver._p.makeDriverC9r = function (key, Super, driverModel) {
  return this.Mngr.eyo.makeDriverC9r(key, Super, driverModel)
}

/**
 * @name{getDriver}
 * Returns a driver, based on the given object's constructor name.
 * If the receiver is `eYo.fcfl.Mngr` and the object's constructor name is `Foo.Bar` then the returned driver is an instance of `eYo.fcfl.Foo.Bar`, `eYo.fcfl.Foo` as soon as it is a driver constructor, otherwise it is the all purpose driver.
 * @param {*} object - the object for which a driver is required.
 * @return {eYo.driver.Base}
 */
eYo.driver.Mngr_p.getDriver = function (object) {
  var components = object.eyo.name.split('.')
  components.shift()
  while (components.length) {
    name = components.join('.')
    var driver = this.drivers[name]
    if (driver) {
      return driver
    }
    components.pop()
  }
  return this.allPurposeDriver
}

/**
 * Initialize all the drivers.
 */
eYo.driver.Mngr_p.initDrivers = function () {
  for (let [name, Driver] of Object.entries(this.eyo.ns.Mngr.eyo.driverC9rByName)) {
    // do not override
    this.drivers[name] || (this.drivers[name] = new Driver(this))
  }
}

/**
 * @name {eYo.driver.Base}
 * Default convenient driver, to be subclassed.
 * @param {Object} owner
 * @property {eYo.driver.Mgt} mngr,  the owning driver manager
 */
eYo.driver.makeBase({
  properties: {
    mngr: {
      get () {
        return this.owner
      },
    },
  },
})

/**
 * Init the UI.
 * @param {*} object
 * @return {Boolean}
 */
eYo.driver.Base_p.doInitUI = function (unused) {
  return true
}

/**
 * Dispose of the UI.
 * @param {*} object
 */
eYo.driver.Base_p.doDisposeUI = function (unused) {
  return true
}

/**
 * Convenient method to make simple driver forwarders.
 */
eYo.driver._p.makeForwarder = (pttp, key) => {
  pttp[key] = function (...args) {
    return this.driver[key](this, ...args)
  }
}

eYo.view.Base.eyo.p6yMerge({
  /**
   * The driver manager shared by all the instances in the app.
   * @type {eYo.driver.Mngr}
   */
  ui_driver_mngr: {
    get () {
      let a = this.app
      return a && a.ui_driver_mngr
    },
  },
  /**
   * The driver.
   * @type {eYo.driver.Base}
   */
  ui_driver: {
    lazy () {
      var mngr = this.ui_driver_mngr
      return mngr && mngr.driver(this)
    },
    reset (builtin) {
      this.ownedForEach(x => {
        let p = x.ui_driver_p
        p && p.reset()
      })
      builtin()
    }
  },
})

/**
 * Make the ui.
 * Default implementation forwards to the driver.
 */
eYo.view.Base_p.doInitUI = function (...args) {
  this.ui_driver.doInitUI(this, ...args)
}

/**
 * Dispose of the ui.
 * Default implementation forwards to the driver.
 */
eYo.view.Base_p.doDisposeUI = function (...args) {
  this.ui_driver.doDisposeUI(this, ...args)
}
