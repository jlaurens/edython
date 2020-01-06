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

eYo.require('C9r')

/**
 * @name {eYo.Driver}
 * @namespace
 */
eYo.makeNS('Driver')

/**
 * Contructor delegate.
 * @name {eYo.Driver.Dlgt}
 * @param {Function} constructor
 */
eYo.C9r.Dlgt.makeSubclass(eYo.Driver)

/**
 * Contructor delegate for the driver manager.
 * The driver manager is responsible of a familly of drivers
 * adapted to a certain context.
 * Each context is represented by a namespace.
 * 
 * @name {eYo.Driver.DlgtMngr}
 * @param {Function} constructor
 */
eYo.Driver.Dlgt.makeSubclass('DlgtMngr', {
  init () {
//    console.warn('INIT DlgtMngr')
  },
  valued: {
    driverC9rByName () {
      return Object.create(null)
    }
  }
})

/**
 * Convenient driver constructor maker.
 * The prototype will have eventually an `doInitUI` or `doDisposeUI`
 * wrapping the model's eponym methods, if any.
 * The owner will have a dafault driver named `Dflt`,
 * which is expected to be the ancestor of all drivers.
 * @param {String} key - a (titlecased) word, the name of the subclass (last component)
 * @param {Function} [Super] - the super class of the driver constructor,
 * defaults to the owner's super_'s key property or the owner's `Dflt`.
 * @param {Object} driverModel
 * An object with various keys:
 * - owner: An object owning the class, basically a namespace object.
 * If the owner is `Foo` and the key is 'Bar', the created constructor
 * is `Foo.Bar`. Actually used with `eYo` as owner, 'Dom' or 'Svg' as key.
 * - doInitUI: an optional function with signature (object, ...)->eYo.NA
 * - doDisposeUI: an optional function with signature (object)->eYo.NA
 */
eYo.Driver.DlgtMngr_p.makeDriverClass = function (key, Super, driverModel) {
  var ns = this.ns
  if (!eYo.isSubclass(Super, eYo.Driver.Dflt)) {
    eYo.parameterAssert(!driverModel, 'Unexpected model')
    driverModel = Super
    Super = ns.super[key] || ns.Dflt
  }
  if (!eYo.isSubclass(Super, ns.Dflt)) {
    Super = ns.Dflt
  }
  var Driver = eYo.makeClass(ns, key, Super, ns.Dlgt, driverModel)
  this.driverC9rByName[Driver.eyo.name] = Driver
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
 * Usage: `eYo.Driver.makeMngr(model)`.
 * Actual implementation with Fcls, Dom and Svg drivers.
 * {Code: ns.Mngr} is instantiated by the main application object.
 ** @param {Object} [mngrModel] -  model used for creation
 * @return {Function} a constructor equals to ns.Mngr
 */
eYo.Driver._p.makeMngr = function (mngrModel) {
  if (this === eYo.Driver) {
    return
  }
  let Super = this.super.Mngr
  var Mngr = this.makeClass(Super, this.DlgtMngr, mngrModel)
  Mngr.prototype.initDrivers = function () {
    if (!this.drivers) {
      console.error('BREAK HERE!')
    }
    for (let [name, Driver] in Object.entries(Mngr.eyo.driverC9rByName)) {
      // do not override
      this.drivers[name] || (this.drivers[name] = new Driver(this))
    }
    Super.prototype.initDrivers.call(this)
  }
  return Mngr
}

/**
 * Usage: `eYo.Driver.makeDriverClass(model)`.
 * Actual implementation with Fcls, Fcfl, Dom and Svg drivers.
 * {Code: ns.Mngr} is instantiated by the main application object.
 * @param {String} key -  The key of the driver
 * @param {Object} [Super] -  The ancestor of the driver
 * @param {Object} [mngrModel] -  model used for creation
 * @return {Function} a constructor equals to this.Mngr[key]
 */
eYo.Driver._p.makeDriverClass = function (key, Super, driverModel) {
  return this.Mngr.eyo.makeDriverClass(key, Super, driverModel)
}

/**
 * @name {eYo.Driver.Mngr}
 * Default driver manager, abstract class to be subclassed.
 * Owns instances of `eYo.Driver.Dflt`'s descendants.
 * @param {Object} owner
 */
eYo.Driver.makeClass('Mngr', eYo.C9r.Owned, eYo.Driver.DlgtMngr,  {
  owned: {
    allPurposeDriver () {
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
      return new Proxy(new this.eyo.ns.Dflt (this), handler)
    }
  },
  valued: {
    drivers: {
      init () {
        return Object.create(null)
      },
      didChange (after) {
        after && this.initDrivers()
      },
    }
  },
})

/**
 * @name{driver}
 * Returns a driver, based on the given object's constructor name.
 * If the receiver is `eYo.Fcfl.Mngr` and the object's constructor name is `Foo.Bar` then the returned driver is an instance of `eYo.Fcfl.Foo.Bar`, `eYo.Fcfl.Foo` as soon as it is a driver constructor, otherwise it is the all purpose driver.
 * @param {*} object - the object for which a driver is required.
 * @return {eYo.Driver.Dflt}
 */
eYo.Driver.Mngr_p.driver = function (object) {
  var components = object.eyo.name.split('.')
  while (true) {
    var driver = this.drivers[name]
    if (driver) {
      return driver
    }
    components.pop()
    if (components.length) {
      name = components.join('.')
      continue
    }
    return this.allPurposeDriver
  }
}

/**
 * Initialize all the drivers.
 */
eYo.Driver.Mngr_p.initDrivers = function () {
  for (let [name, Driver] in Object.entries(eYo.Driver.Mngr.eyo.driverC9rByName)) {
    // do not override
    this.drivers[name] || (this.drivers[name] = new Driver(this))
  }
}

/**
 * @name {eYo.Driver.Dflt}
 * Default convenient driver, to be subclassed.
 * @param {Object} owner
 * @property {eYo.Driver.Mgt} mngr,  the owning driver manager
 */
eYo.C9r.Owned.makeSubclass(eYo.Driver, 'Dflt', {
  computed: {
    mngr () {
      return this.owner
    }
  }
})

/**
 * Init the UI.
 * @param {*} object
 * @return {Boolean}
 */
eYo.Driver.Dflt.prototype.doInitUI = function (unused) {
  return true
}

/**
 * Dispose of the UI.
 * @param {*} object
 */
eYo.Driver.Dflt.prototype.doDisposeUI = function (unused) {
  return true
}

/**
 * Convenient method to make simple driver forwarders.
 */
eYo.Driver.makeForwarder = (pttp, key) => {
  pttp[key] = function (...args) {
    return this.driver[key](this, ...args)
  }
}
