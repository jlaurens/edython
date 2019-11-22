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
eYo.Constructor.make({
  key: 'Dlgt',
  owner: eYo.Driver,
  super: eYo.Constructor.Dlgt,
  init (ctor) {
    this.ctor_ = ctor
  },
  props: {
    link: {
      ctor: {value: eYo.NA}
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
eYo.Driver.makeMgrClass = (owner, super_) => {
  if (owner === eYo.Driver) {
    return
  }
  !super_ && (super_ = eYo.Owned)
  var driverNames = new Set()
  var ctor = eYo.Constructor.make({
    key: 'Mgr',
    owner: owner,
    super: super_ || eYo.Owned,
    dlgt: eYo.Driver.Dlgt,
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
  /**
   * Convenient driver constructor maker.
   * The prototype will have eventually an `initUI` or `disposeUI`
   * wrapping the model's eponym methods, if any.
   * The owner will have a `Default` driver,
   * which is expected to be the ancestor of all drivers.
   * @param {Object} model
   * An object with various keys:
   * - key: a (capitalized) word, the name of the subclass
   * - owner: An object owning the class, basically a namespace object.
   * If the owner is `Foo` and the key is 'Bar', the created constructor
   * is `Foo.Bar`. Actually used with `eYo` as owner, 'Dom' or 'Svg' as key.
   * - super: the super class of the driver constructor,
   * defaults to the owner's super_'s key property or the owner's `Default`.
   * - initUI: an optional function with signature (object, ...)->eYo.NA
   * - disposeUI: an optional function with signature (object)->eYo.NA
   */
  owner.makeDriverClass = (model) => {
    var name = model.key
    if (!name) {
      name = model
      model = {
        owner: owner
      }
    }
    driverNames.add(name)
    var onr = model.owner || owner
    var super_ = model.super
      || (onr.super && onr.super[name])
      || onr.Default
    var ctor = onr[name] = model.init
    ? function () {
      super_.call(this)
      model.init.call(this)
    }
    : function () {
      super_.call(this)
    }
    goog.inherits(ctor, super_)
    var proto = ctor.prototype
    model.initUI && (proto.initUI = function () {
      return ctor.superClass_.initUI.apply(this, arguments) && model.initUI.apply(this, arguments)
    })
    model.disposeUI && (proto.disposeUI = function () {
      model.disposeUI.apply(this, arguments)
      ctor.superClass_.disposeUI.apply(this, arguments)
    })
  }
  // make the default driver
  owner.Default = eYo.Driver.Default
  owner.makeMgrClass = (onr) => {
    return eYo.Driver.makeMgrClass(onr, ctor)
  }
  return ctor
}

/**
 * Default convenient driver, to be subclassed.
 */
eYo.Driver.Default = function () {}
/**
 * Init the UI.
 * @param {*} object
 * @return {Boolean}
 */
eYo.Driver.Default.prototype.initUI = function () {
  return true
}
/**
 * Dispose of the UI.
 * @param {*} object
 */
eYo.Driver.Default.prototype.disposeUI = function () {
  return true
}
