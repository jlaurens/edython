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
 * Usage: `eYo.Driver.makeMngrClass(eYo.Dom)`.
 * Actual implementation with Fcls, Dom and Svg drivers.
 * {Code: ns.Mngr} is instantiated by the main application object.
 * @param {Object} ns,  a namespace
 * @param {?Function} Super,  the super class of the constructor created
 * @param {?Object} mngrModel,  model used for creation
 * @return {Function} a constructor equals to ns.Mngr
 */
eYo.Driver.constructor.prototype.makeMngrClass = (ns, mngrModel) => {
  if (ns === eYo.Driver) {
    return
  }
  var driverNames = new Set()
  var Mngr = ns.super.Mngr.makeSublass(ns, 'Mngr', {
    init () {
      driverNames.forEach(name => {
        var n = name[0].toLowerCase() + name.substr(1)
        var N = name[0].toUpperCase() + name.substr(1)
        this[n] = new eYo.Driver[N]()
      })
    },
    static: { // Bad smell
      link: {
        eyo: {
          validate: eYo.Do.noSetter,
        }
      }
    }
  })
  const pttp = ns.constructor.prototype
  pttp.iniUIMake = (f) => {
    var spr = ns.super
    var make = spr && spr.initUIMake
    f = make ? make(f) : f
    make = mngrModel.initUIMake
    return make ? make(f) : f
  }
  pttp.disposeUIMake = (f) => {
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
  pttp.makeDriverClass = (owner_, key, Super, driverModel) => {
    if (eYo.isStr(owner_)) {
      driverModel = Super || {}
      Super = key
      key = owner_
      owner_ = ns
    }
    if (eYo.isF(Super)) {
      driverModel || (driverModel = {})
    } else {
      driverModel = Super || {}
      var super_ = owner_.super
      Super = super_ && super_[key] || owner_.Dflt
    }
    driverNames.add(key)
    var c9r = owner_[key] = driverModel.init
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
  // make the default driver
  pttp.Dflt = eYo.Driver.Dflt
  // postflight allows to override many things NYU
  pttp.makeMngrClass = (ns_, mngrModel_) => {
    var mngr = eYo.Driver.makeMngrClass(ns_, mngrModel_)
    return mngr
  }
  return Mngr
}

/**
 * @name {eYo.Driver.Mngr}
 * Default driver manager, to be subclassed.
 * Owns instances of `eYo.Driver.Dflt`'s descendants.
 * @param {Object} owner
 */
eYo.Owned.makeSubclass(eYo.Driver, 'Mngr')

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

