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

eYo.require('eYo.Owned')

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
eYo.Dlgt.makeSubclass(eYo.Driver)

/**
 * Contructor delegate.
 * @name {eYo.Driver.Dlgt}
 * @param {Function} constructor
 */
eYo.Driver.Dlgt.makeSubclass(eYo.Driver, 'DlgtMngr', {
  props: {
    link: {
      driverNames () {
        return new Set()
      }
    }
  }
})

/**
 * Usage: `eYo.Driver.makeMngrClass(model)`.
 * Actual implementation with Fcls, Dom and Svg drivers.
 * {Code: ns.Mngr} is instantiated by the main application object.
 * @param {Object} ns,  a namespace
 * @param {?Function} Super,  the super class of the constructor created
 * @param {?Object} mngrModel,  model used for creation
 * @return {Function} a constructor equals to ns.Mngr
 */
eYo.Driver.constructor.prototype.makeMngrClass = function (mngrModel) {
  if (this === eYo.Driver) {
    return
  }
  var Mngr = this.super.Mngr.makeSubclass(this, 'Mngr', this.DlgtMngr, {
    static: { // Bad smell
      link: {
        eyo: {
          validate: eYo.Do.noSetter,
        }
      }
    }
  })
  const pttp = ns.constructor.prototype
  pttp.initDrivers = function () {
    Mngr.eyo.driverNames.forEach(name => {
      var n = name[0].toLowerCase() + name.substr(1)
      var N = name[0].toUpperCase() + name.substr(1)
      this[n] = new eYo.Driver[N]()
    })
  }
  pttp.initUIMake = function (f) {
    var spr = ns.super
    var make = spr && spr.initUIMake
    f = make ? make(f) : f
    make = mngrModel.initUIMake
    return make ? make(f) : f
  }
  pttp.disposeUIMake = function (f) {
    var make = mngrModel.disposeUIMake
    f = make ? make(f) : f
    make = spr && spr.disposeUIMake
    return make ? make(f) : f
  }
  /**
   * Convenient driver constructor maker.
   * The prototype will have eventually an `initUI` or `disposeUI`
   * wrapping the model's eponym methods, if any.
   * The owner will have a dafault driver named `Dflt`,
   * which is expected to be the ancestor of all drivers.
   * @param {?Object} owner, a namespace
   * @param {!String} key, a (capitalized) word, the name of the subclass (last component)
   * @param {?Function} Super, the super class of the driver constructor,
   * defaults to the owner's super_'s key property or the owner's `Dflt`.
   * @param {Object} driverModel
   * An object with various keys:
   * - owner: An object owning the class, basically a namespace object.
   * If the owner is `Foo` and the key is 'Bar', the created constructor
   * is `Foo.Bar`. Actually used with `eYo` as owner, 'Dom' or 'Svg' as key.
   * - initUI: an optional function with signature (object, ...)->eYo.NA
   * - disposeUI: an optional function with signature (object)->eYo.NA
   */
  pttp.makeDriverClass = function (ns_, key, Super, driverModel) {
    if (eYo.isStr(ns_)) {
      driverModel = Super || {}
      Super = key
      key = ns_
      ns_ = ns
    }
    if (eYo.isF(Super)) {
      driverModel || (driverModel = {})
    } else {
      driverModel = Super || {}
      var super_ = ns_.super
      Super = super_ && super_[key] || ns_.Dflt
    }
    Mngr.eyo.driverNames.add(key)
    var c9r = ns_[key] = driverModel.init
    ? function () {
      Super.apply(this, arguments)
      driverModel.init.apply(this, arguments)
    }
    : function () {
      Super.apply(this, arguments)
    }
    eYo.inherits(c9r, Super)
    var proto = c9r.prototype
    proto.initUI = function (object, ...rest) {
      var spr = c9r.superClass_
      var f = spr && spr.initUI
      f && f.apply(this, arguments)
      f = mngrModel.initUIMake
      var ff = driverModel.initUI
      f = (f && f(ff)) || ff
      return f && f.apply(object, rest)
    }
    proto.disposeUI = function (object, ...rest) {
      var f = mngrModel.initUIMake
      var ff = driverModel.initUI
      f = (f && f(ff)) || ff
      f && f.apply(object, rest)
      var spr = c9r.superClass_
      f = spr && spr.initUI
      f && f.apply(this, arguments)
    }
  }
  return Mngr
}

/**
 * @name {eYo.Driver.Mngr}
 * Default driver manager, abstract class to be subclassed.
 * Owns instances of `eYo.Driver.Dflt`'s descendants.
 * @param {Object} owner
 */
eYo.Owned.makeSubclass(eYo.Driver, 'Mngr', {
  init () {
    this.initDrivers()
  }
})

/**
 * @name {eYo.Driver.Dflt}
 * Default convenient driver, to be subclassed.
 * @param {Object} owner
 * @property {eYo.Driver.Mgt} mngr,  the owning driver manager
 */
eYo.Owned.makeSubclass(eYo.Driver, 'Dflt', {
  props: {
    computed: {
      mngr () {
        return this.owner
      }
    }
  }
})

/**
 * Init the UI.
 * @param {*} object
 * @return {Boolean}
 */
eYo.Driver.Dflt.prototype.initUI = function () {
  return true
}

/**
 * Dispose of the UI.
 * @param {*} object
 */
eYo.Driver.Dflt.prototype.disposeUI = function () {
  return true
}

