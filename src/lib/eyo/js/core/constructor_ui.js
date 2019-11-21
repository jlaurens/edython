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
 * named `initUIMake` and `disposeUIMake` to
 * make the `initUI` and `disposeUI` methods of the prototype.
 * They are used for 
 */
eYo.UI.Constructor.make = (model) => {
  model.super || (model.super = eYo.UI.Owned)
  model.dlgt || (model.dlgt = eYo.UI.Constructor.Dlgt)
  var ctor = eYo.Constructor.make(model)
  var eyo = ctor.eyo__
  eyo.constructorMake = eYo.UI.Constructor.make
  var ui = model.ui
  eyo.initUIMake(ui && ui.init
    ? function () {
      this.ui_driver.init(this)
      ui.init.call(this)
    }
    : function () {
      this.ui_driver.init(this)
    }
  )
  eyo.disposeUIMake(ui && ui.dispose
    ? function () {
      ui.dispose.call(this)
      this.ui_driver.init(this)
    }
    : function () {
      this.ui_driver.dispose(this)
    }
  )
}

/**
 * Constructor delegate subclass
 */
eYo.Constructor.make({
  key: 'Dlgt',
  owner: eYo.UI.Constructor,
  super: eYo.Constructor.Dlgt,
})

/**
 * Make the dispose function.
 * @override
 */
eYo.UI.Constructor.Dlgt.prototype.disposeMake = function (f) {
  var eyo = this
  this.ctor.prototype.dispose = function () {
    try {
      this.dispose = eYo.Do.nothing
      this.disposeUI()
      f && f.apply(this, arguments)
      eyo.disposeInstance(this)
      var super_ = ctor.superClass_
      !!super_ && !!super_.dispose && !!super_.dispose.apply(this, arguments)
    } finally {
      delete this.dispose
    }
  }
}

/**
 * Make the `initUI` method based on the given function.
 * @param {?Function} f  a function with at least one argument.
 */
eYo.UI.Constructor.Dlgt.prototype.initUIMake = function (f) {
  this.ctor.prototype.initUI = function () {
    try {
      this.initUI = eYo.Do.nothing
      var super_ = ctor.superClass_
      !!super_ && !!super_.initUI && !!super_.initUI.apply(this, arguments)
      var d = this.ui_driver
      d && d.init(this)
      f && f.apply(this, arguments)
    } finally {
      delete this.initUI
    }
  }
}

/**
 * Make the `disposeUI` method based on the given function.
 * @param {?Function} f  a function with at least one argument.
 */
eYo.UI.Constructor.Dlgt.prototype.disposeUIMake = function (f) {
  this.ctor.prototype.disposeUI = function () {
    try {
      this.disposeUI = eYo.Do.nothing
      f && f.apply(this, arguments)
      var d = this.ui_driver
      d && d.dispose(this)
      var super_ = ctor.superClass_
      !!super_ && !!super_.disposeUI && !!super_.disposeUI.apply(this, arguments)
    } finally {
      delete this.disposeUI
    }
  }
}
