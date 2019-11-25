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

goog.require('eYo.Constructor')
goog.require('eYo.UI')
goog.require('eYo.Constructor.Dlgt')

goog.provide('eYo.UI.Constructor')
goog.provide('eYo.UI.Constructor.Dlgt')

eYo.UI.Constructor = Object.create(null)

/**
 * Constructor maker.
 * The delegate of the constructor has convenient methods
 * named `initUIDecorate` and `disposeUIDecorate` to
 * make the `initUI` and `disposeUI` methods of the prototype.
 * They are used for 
 */
eYo.UI.Constructor.make = (owner, key, superC9r, dlgtC9r, model) => {
  // same beginning as `eYo.Constructor.makeClass`
  if (goog.isString(owner)) {
    model = dlgtC9r
    dlgtC9r = superC9r
    superC9r = key
    key = owner
    owner = eYo
  }
  if (eYo.isF(superC9r)) {
    if (eYo.isF(dlgtC9r)) {
      model || (model = {})
    } else {
      model = dlgtC9r || {}
      dlgtC9r = (superC9r.eyo && superC9r.eyo.constructor) || eYo.UI.Constructor.Dlgt
    }
  } else {
    if (eYo.isF(dlgtC9r)) {
      model || (model = {})
    } else {
      model = superC9r || {}
      dlgtC9r = eYo.UI.Constructor.Dlgt
    }
    superC9r = eYo.UI.Owned
  }
  var c9r = eYo.Constructor.makeClass(owner, key, superC9r, dlgtC9r, model)
  var eyo = c9r.eyo__
  eyo.constructorMake = eYo.UI.Constructor.make
  var ui = model.ui
  if (!eYo.isF(eyo.initUIDecorate)) {
    console.error('BREAK HERE')
    c9r = eYo.Constructor.makeClass(owner, key, superC9r, dlgtC9r, model)
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
eYo.Constructor.makeClass(eYo.UI.Constructor, 'Dlgt', eYo.Constructor.Dlgt)

/**
 * Make the dispose function.
 * @override
 */
eYo.UI.Constructor.Dlgt.prototype.disposeDecorate = function (f) {
  return eYo.UI.Constructor.Dlgt.superClass_.disposeDecorate.call(this, function () {
    this.disposeUI()
    f && f.apply(this, arguments)
  })
}

/**
 * Helper to make the `initUI` method based on the given function.
 * @param {?Function} f  a function with at least one argument.
 */
eYo.UI.Constructor.Dlgt.prototype.initUIDecorate = function (f) {
  return f
}

/**
 * Helps to make the `disposeUI` method based on the given function.
 * @param {?Function} f  a function with at least one argument.
 */
eYo.UI.Constructor.Dlgt.prototype.disposeUIDecorate = function (f) {
  return f
}
