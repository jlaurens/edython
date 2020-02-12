/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview An object owns properties.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('t3')

/**
 * @name {eYo.widget}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'widget')

/**
 * @name{eYo.widget.Dflt}
 * @constructor
 * Widgets with UI capabilities.
 */
eYo.widget.makeDflt({
  /**
   * Initializer.
   */
  init() {
    this.disposeUI = eYo.do.nothing // will be used by subclassers
  },
  properties: {
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
    ui_driver: {
      init () {
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
    /**
     * Whether the receiver's UI has been intialized.
     * 
     * @type {Boolean}
     */
    hasUI: {
      get () {
        return !this.initUI || this.initUI === eYo.do.nothing
      },
    },
  },
})

/**
 * Consolidate the given model.
 * @param {Widget} model - The model contains informations to extend the receiver's associate constructor.
 */
eYo.widget.Dlgt_p.modelConsolidate = function (...args) {
  eYo.c9r.model.consolidate(...args)
}

/**
 * Add a valued consolidation method.
 * The receiver is not the owner.
 * @param {Widget} constructor -  Its prototype object gains a storage named `foo__` and both getters and setters for `foo_`.
 * The initial value is `eYo.NA`.
 * @param {Array<String>} names names of the link to add
 */
eYo.widget.Dlgt_p.consolidatorMake = function (k, model) {
  let C9r = this.C9r_
  let C9r_p = C9r.prototype
  let consolidators = this.consolidators__ || (this.consolidators__ = Object.create(null))
  let kC = k+'Consolidate'
  C9r_p[kC] = consolidators[k] = model.consolidate
  ? function () {
    let Super = C9r.SuperC9r_p[kC]
    !!Super && Super.apply(this, arguments)
    model.consolidate.call(this, arguments)
    this.ownedForEach(x => {
      let f = x[kC] ; f && f.apply(this, arguments)
    })
    this.valuedForEach(x => {
      let f = x[kC] ; f && f.apply(this, arguments)
    })
  } : function () {
    this[k_] = eYo.NA
  }
}

/**
 * Make the ui.
 * Default implementation forwards to the driver.
 */
eYo.widget.Dflt_p.doInitUI = function (...args) {
  this.ui_driver.doInitUI(this, ...args)
}

/**
 * Make the ui.
 * Default implementation forwards to the driver.
 */
eYo.widget.Dflt_p.initUI = function (...args) {
  try {
    this.initUI = eYo.do.nothing
    this.doInitUI(...args)

  } finally {
    delete this.initUI
  }
}

/**
 * Dispose of the ui.
 * Default implementation forwards to the driver.
 */
eYo.widget.Dflt_p.doDisposeUI = function (...args) {
  this.ui_driver.doDisposeUI(this, ...args)
}

/**
 * Dispose of the ui.
 * Default implementation forwards to the driver.
 */
eYo.widget.Dflt_p.disposeUI = function (...args) {
  try {
    this.disposeUI = eYo.do.nothing
    this.doDisposeUI(...args)

  } finally {
    delete this.disposeUI
  }
}

/**
 * Make the `doInitUI` and `doDisposeUI` methods.
 * @param {Object} ui - model with `init` and `dispose` keys.
 */
eYo.widget.Dlgt_p.uiDeclare = function (ui) {
  let C9r_s = this.C9r_s
  let init_m = ui && ui.init
  let init_s = C9r_s && C9r_s.doInitUI
  if (init_m) {
    this.C9r_p.doInitUI = XRegExp.exec(init_m.toString(), eYo.xre.function_builtin)
    ? function (...args) {
      init_m.call(this, () => {
        init_s.call(this, ...args)
      }, ...args)
    } : function (...args) {
      init_s.call(this, ...args)
      init_m.call(this, ...args)  
    }
  }
  // now the dispose ui
  let dispose_m = ui.dispose
  let dispose_s = C9r_s && C9r_s.disposeUI
  if (dispose_m) {
    this.C9r_p.doDisposeUI = XRegExp.exec(dispose_m.toString(), eYo.xre.function_builtin)
    ? function (...args) {
      dispose_m.call(this, () => {
        dispose_s.call(this, ...args)              
      }, ...args)
    } : function (...args) {
      dispose_m.call(this, ...args)
      dispose_s.call(this, ...args)
    }
  }
}
