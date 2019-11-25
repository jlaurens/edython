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

goog.require('eYo.Owned')

goog.provide('eYo.Driver')

/**
 * @name {eYo.Driver}
 * @namespace
 */
eYo.Driver = Object.create(null)

/**
 * Contructor delegate.
 * @param {Function} constructor
 */
eYo.Constructor.makeClass(eYo.Driver, 'Dlgt', eYo.Constructor.Dlgt, {
  init (c9r) {
    this.c9r_ = c9r
  },
  props: {
    link: {
      c9r: {value: eYo.NA}
    }
  }
})

/**
 * Usage: `eYo.Driver.makeMgrClass(eYo.Dom)`.
 * Actual implementation with Driver, Dom and Svg drivers.
 * `eYo.Driver`
 * @param {Oject} owner,  a namespace
 * @param {Oject} super_,  the super class of the constructor created
 * @return {Object} a constructor
 */
eYo.Driver.makeMgrClass = (owner, mgrModel = {}) => {
  if (owner === eYo.Driver) {
    return
  }
  var superC9r = mgrModel.super
  !superC9r && (superC9r = eYo.Owned)
  var driverNames = new Set()
  var c9r = eYo.Constructor.makeClass(owner, 'Mgr', superC9r || eYo.Owned, eYo.Driver.Dlgt, {
    init () {
      driverNames.forEach(name => {
        var n = name[0].toLowerCase() + name.substr(1)
        var N = name[0].toUpperCase() + name.substr(1)
        this[n] = new eYo.Driver[N]()
      })
    },
    static: {
      link: {
        eyo: {
          validate (ignored) {
            throw 'Forbidden setter'
          }
        }
      }
    }
  })
  owner.iniUIMake = (f) => {
    var spr = owner.super
    var make = spr && spr.initUIMake
    f = make ? make(f) : f
    make = mgrModel.initUIMake
    return make ? make(f) : f
  }
  owner.disposeUIMake = (f) => {
    var make = mgrModel.disposeUIMake
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
   * @param {?Function} superC9r, the super class of the driver constructor,
   * defaults to the owner's super_'s key property or the owner's `Dflt`.
   * @param {Object} driverModel
   * An object with various keys:
   * - owner: An object owning the class, basically a namespace object.
   * If the owner is `Foo` and the key is 'Bar', the created constructor
   * is `Foo.Bar`. Actually used with `eYo` as owner, 'Dom' or 'Svg' as key.
   * - initUI: an optional function with signature (object, ...)->eYo.NA
   * - disposeUI: an optional function with signature (object)->eYo.NA
   */
  owner.makeDriverClass = (owner_, key, superC9r, driverModel) => {
    if (goog.isString(owner_)) {
      driverModel = superC9r || {}
      superC9r = key
      key = owner_
      owner_ = owner
    }
    if (eYo.isF(superC9r)) {
      driverModel || (driverModel = {})
    } else {
      driverModel = superC9r || {}
      var super_ = owner_.super
      superC9r = super_ && super_[key] || owner_.Dflt
    }
    driverNames.add(key)
    var c9r = owner_[key] = driverModel.init
    ? function () {
      superC9r.apply(this, arguments)
      driverModel.init.apply(this, arguments)
    }
    : function () {
      superC9r.apply(this, arguments)
    }
    eYo.Do.inherits(c9r, superC9r)
    var proto = c9r.prototype
    proto.initUI = function (object, ...rest) {
      var spr = c9r.superClass_
      var f = spr && spr.initUI
      f && f.apply(this, arguments)
      f = mgrModel.initUIMake
      var ff = driverModel.initUI
      f = (f && f(ff)) || ff
      return f && f.apply(object, rest)
    }
    proto.disposeUI = function (object, ...rest) {
      var f = mgrModel.initUIMake
      var ff = driverModel.initUI
      f = (f && f(ff)) || ff
      f && f.apply(object, rest)
      var spr = c9r.superClass_
      f = spr && spr.initUI
      f && f.apply(this, arguments)
    }
  }
  // make the default driver
  owner.Dflt = eYo.Driver.Dflt
  // postflight allows to override many things NYU
  owner.makeMgrClass = (owner_, model) => {
    var mgr = eYo.Driver.makeMgrClass(owner_, model)
    owner_.super = owner
    return mgr
  }
  return c9r
}

/**
 * Default convenient driver, to be subclassed.
 */
eYo.Driver.Dflt = function () {}
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

