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

goog.require('eYo.Dlgt')
goog.require('eYo.UI')

goog.provide('eYo.UI.Dlgt')

/**
 * Constructor maker.
 * The delegate of the constructor has convenient methods
 * named `initUIDecorate` and `disposeUIDecorate` to
 * make the `initUI` and `disposeUI` methods of the prototype.
 * @param {?Object} ns,  A namespace. Defaults to `eYo`.
 * @param {!String} key,  The key.
 * @param {?Function} Super,  The eventual super class. There is no default value. If given, it must be a subclass of `eYo.UI.Dflt`.
 * @param {?Function} Dlgt,  The constructor's delegate class. Defaults to the constructor of `Super`'s delegate if any. Must be a subclass of `eYo.UI.Dlgt`.
 * @param {!Object} model,  The dictionary of parameters.
 * @return {Function} the created constructor.
 */
eYo.UI.makeClass = (ns, key, Super, Dlgt, model) => {
  // same beginning as `eYo.makeClass`
  if (goog.isString(ns)) {
    model = Dlgt
    Dlgt = Super
    Super = key
    key = ns
    ns = eYo.UI
  }
  if (Super) {
    var pttp = Super.prototype
    if (eYo.isSubclass(Super, eYo.UI.Dflt)) {
      // Super is OK
      if (Dlgt) {
        pttp = Dlgt.prototype
        if (pttp) {
          if (eYo.isSubclass(Dlgt, eYo.UI.Dlgt)) {
            // Dlgt is also OK
            model || (model = {})
          } else {
            model = pttp()
            Dlgt = Super.eyo.constructor
          }
        } else {
          model = Dlgt
          Dlgt = Super.eyo.constructor
        }
      } else {
        // Dlgt not OK
        model = {}
        Dlgt = Super.eyo.constructor
      }
    } else {
      // Super not OK
      if (eYo.isSubclass(Super, eYo.UI.Dlgt)) {
        model = eYo.isF(Dlgt) ? Dlgt() : Dlgt || {}
        Dlgt = Super
      } else {
        model = pttp ? Super() : Super
        Dlgt = ns.Dlgt || eYo.UI.Dlgt
      }
      Super = ns.Dflt || eYo.UI.Dflt
    }
  } else {
    model = {}
    Dlgt = ns.Dlgt || eYo.UI.Dlgt
    Super = ns.Dflt || eYo.UI.Dflt
  }
  var c9r = eYo.makeClass(ns, key, Super, Dlgt, model)
  var eyo = c9r.eyo__
  eyo.makeClass = eYo.UI.makeClass
  var ui = model.ui
  if (!eYo.isF(eyo.initUIDecorate)) {
    console.error('BREAK HERE')
    c9r = eYo.makeClass(ns, key, Super, Dlgt, model)
  }
  var f = eyo.initUIDecorate(ui && ui.dispose)
  c9r.prototype.initUI = function (...args) {
    try {
      this.initUI = eYo.Do.nothing
      var super_ = c9r.superClass_
      !!super_ && !!super_.initUI && !!super_.initUI.call(this, ...args)
      this.ui_driver.init(this, ...args)
      f && f.apply(this, ...args)
    } finally {
      delete this.initUI
    }
  }
  var f = c9r.eyo.disposeUIDecorate (ui && ui.init)
  c9r.prototype.disposeUI = function (...args) {
    try {
      this.disposeUI = eYo.Do.nothing
      f && f.apply(this, arguments)
      this.ui_driver.disposeInstance(this)
      var super_ = c9r.superClass_
      !!super_ && !!super_.disposeUI && !!super_.disposeUI.apply(this, arguments)
    } finally {
      delete this.disposeUI
    }
  }
}

/**
 * Constructor delegate subclass
 */
eYo.Dlgt.makeSublass(eYo.UI, 'Dlgt')

/**
 * Default ancestor
 */
eYo.Dflt.makeSublass(eYo.UI, 'Dflt', eYo.UI.Dlgt)

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
 * @param {?Function} f  a function with at least one argument.
 */
eYo.UI.Dlgt.prototype.initUIDecorate = function (f) {
  return f
}

/**
 * Helps to make the `disposeUI` method based on the given function.
 * @param {?Function} f  a function with at least one argument.
 */
eYo.UI.Dlgt.prototype.disposeUIDecorate = function (f) {
  return f
}
