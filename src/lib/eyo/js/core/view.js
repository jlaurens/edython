/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview namspace for all the view objects.
 * View object are displayed unless for a faceless application.
 * This is a view that contains other views.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('geom')

/**
 * @name {eYo.view}
 * @namespace
 */
eYo.o4t.makeNS(eYo, 'view')

/**
 * Widgets with UI capabilities.
 * This is a pure abstract class that must be subclassed.
 * @name{eYo.view.BaseC9r}
 * @constructor
 */
eYo.view.makeBaseC9r(true, {
  /**
   * Initializer.
   */
  init(builtin, ...$) {
    this.disposeUI = eYo.doNothing // will be used by subclassers
    builtin(...$)
  },
  properties: {
    views: {
      value () {
        return new eYo.view.List(this, 'views', {})
      }
    },
    /**
     * Whether the receiver's UI has been intialized.
     * 
     * @type {Boolean}
     */
    hasUI: {
      get () {
        return !this.initUI || this.initUI === eYo.doNothing
      },
    },
    /**
     * Each view has a view rect.
     * @type {eYo.view.Desk}
     * @readonly
     */
    viewRect () {
      return new eYo.geom.Rect()
    },
  },
})

eYo.view.BaseC9r.eyo.finalizeC9r({
  views: {
    [eYo.model.ANY]: {
      [eYo.model.DOT]: ['C9r', 'shared'],
      [eYo.model.VALIDATE]: function (before, p) {
        if (eYo.isStr(before)) {
          var v = eYo.valueForKeyPath(before)
          if (eYo.isSubclass(v, eYo.view.BaseC9r)) {
            return {
              C9r: v,
              shared: true,
            }
          } else if (!v) {
            v = eYo.view.valueForKeyPath(before)
            if (eYo.isC9r(v)) {
              return {
                C9r: v,
                shared: true,
              }
            }
          }
        } else if (eYo.isSubclass(before, eYo.view.BaseC9r)) {
          return {
            C9r: before,
            shared: true,
          }
        }
        return eYo.isD(before) ? before : eYo.INVALID
      },
    }
  },
  ui: ['init', 'dispose', 'doInit', 'doDispose', 'initMake', 'disposeMake'],
})

{
  // recursive definition of views inside views
  let mf = eYo.view.BaseC9r.eyo.modelFormat
  mf.get('views').get(eYo.model.ANY).fallback = mf
}

/**
 * Recommanded way to create view instances.
 * View instances are unique when the model's `shared` attribute is not `false`.
 * If the model has an attribute `shared` which is a view instance,
 * then it is returned as is.
 * If it is a C9r, an instance is created, cached and returned.
 * @param{Object} owner - and eYo object
 * @param{String} [key] - The key of the created instance.
 * @param{Object} model - An object suitable to create such a view instance.
 */
eYo.view._p.new = function (owner, key, model) {
  if (!eYo.isStr(key)) {
    [key, model] = ['', key]
  }
  if (model.shared instanceof eYo.view.BaseC9r) {
    return model.shared
  }
  if (eYo.isC9r(model.shared)) {
    var ans = new model.shared(owner, model)
  } else if (eYo.isStr(model.shared) && eYo.isC9r(eYo.view[model.shared])) {
    ans = new eYo.view[model.shared](owner, model)
  } else if (eYo.isC9r(eYo.view[key])) {
    ans = new eYo.view[key](owner, model)
  } else {
    eYo.throw(`No view available for ${key} and ${model}.`)
  }
  return model.shared !== false ? (model.shared = ans) : ans
}

/**
 * Recommanded way to create view instances.
 * @param{Function} enhancer - A function with signature (owner, model) => eYo.view.BaseC9r.
 * The actual `eYo.view._p.new` is overriden to call the enhancer first.
 * If the result is not undefined, then it is returned as is.
 * Otherwise, the original method is called.
 * @throws{Error} when the enhancer does not return
 * an acceptable value.
 */
eYo.view._p.enhanceNew = (enhancer) => {
  let original = eYo.view._p.new
  eYo.view._p.new = function (owner, key, model) {
    let ans = enhancer(owner, key, model)
    if (ans instanceof eYo.view.BaseC9r) {
      return ans
    } else if (ans) {
      eYo.throw(`Unexpected enhancer return value: ${ans}`)
    }
    return original(owner, key, model)
  }
}

/**
 * Declare the given model.
 * Declare the given model for the associate constructor.
 * The default implementation calls the inheritedd method
 * then calls  `uiMerge` and `viewsMerge`.
 * @param {Object} model - Object, like for |makeC9r|.
 */
eYo.view.BaseC9r_p.modelMerge = function (model) {
  eYo.view.BaseC9r_p.SuperC9r_p.modelMerge.call(this, model)
  model.ui && this.uiMerge(model.ui)
  model.views && this.viewsMerge(model.views)
}

/**
 * Make the `doInitUI` and `doDisposeUI` methods.
 * @param {Object} ui - model with `init` and `dispose` keys.
 */
eYo.view.Dlgt_p.uiMerge = function (ui) {
  let init_m = ui && ui.init
  let C9r_p = this.C9r_p
  let init_p = C9r_p && C9r_p.doInitUI // always exists
  if (init_m) {
    this.C9r_p.doInitUI = XRegExp.exec(init_m.toString(), eYo.xre.function_builtin)
    ? function (...args) {
      init_m.call(this, () => {
        init_p.call(this, ...args)
      }, ...args)
    } : function (...args) {
      init_p.call(this, ...args)
      init_m.call(this, ...args)  
    }
  }
  // now the dispose ui
  let dispose_m = ui.dispose
  let dispose_p = C9r_p && C9r_p.disposeUI
  if (dispose_m) {
    this.C9r_p.doDisposeUI = XRegExp.exec(dispose_m.toString(), eYo.xre.function_builtin)
    ? function (...args) {
      dispose_m.call(this, () => {
        dispose_p.call(this, ...args)              
      }, ...args)
    } : function (...args) {
      dispose_m.call(this, ...args)
      dispose_p.call(this, ...args)
    }
  }
}

// ANCHOR UI
/**
 * Iterator.
 * @param {Function} handler - Only one parameter: the view.
 */
eYo.view.BaseC9r_p.viewForEach = function (handler) {
  for (let v of this.views) {
    handler(v)
  }
}

/**
 * Prepare the ui.
 * Default implementation calls the inherited method
 * and forwards to the views.
 */
eYo.view.BaseC9r_p.prepareUI = function (...args) {
  this.ui_driver.prepareUI(this, ...args)
  this.viewForEach(v => v.prepareUI(...args))
}
/**
 * Make the ui.
 * Default implementation calls the inherited method
 * and forwards to the views.
 */
eYo.view.BaseC9r_p.doInitUI = function (...args) {
  this.ui_driver.doInitUI(this, ...args)
  this.viewForEach(v => v.doInitUI(...args))
}

/**
 * Dispose of the ui.
 * Default implementation forwards to the views
 * and calls the inherited method.
 */
eYo.view.BaseC9r_p.doDisposeUI = function (...args) {
  this.viewForEach(v => v.doDisposeUI(...args))
  eYo.view.Dlgt_p.SuperC9r_p.doDisposeUI.call(this, ...args)
}

/**
 * Layout the receiver.
 * The default implementation does nothing.
 */
eYo.view.BaseC9r_p.layout = eYo.doNothing

/**
 * Update the metrics of the receiver.
 */
eYo.view.BaseC9r_p.updateMetrics = eYo.doNothing

/**
 * Place the receiver.
 */
eYo.view.BaseC9r_p.place = eYo.doNothing

/**
 * Add a valued consolidation method.
 * The receiver is not the owner.
 * @param {String} k -  Create `fooConsolidate` if `k` is 'foo'.
 * @param {Object} model - The model used to make the consolidator.
 */
eYo.view.Dlgt_p.consolidatorMake = function (k, model) {
  let C9r = this.C9r_
  let C9r_p = C9r.prototype
  let consolidators = this.consolidators__ || (this.consolidators__ = Object.create(null))
  let kC = k+'Consolidate'
  C9r_p[kC] = consolidators[k] = model.modelExpand
  ? function () {
    let Super = C9r.SuperC9r_p[kC]
    !!Super && Super.apply(this, arguments)
    model.modelExpand.call(this, arguments)
    this.ownedForEach(x => {
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
eYo.view.BaseC9r_p.doInitUI = eYo.doNothing

/**
 * Make the ui.
 * Default implementation forwards to the driver.
 * One shot function until the next disposeUI.
 * Calls `prepareUI` then `doInitUI`.
 * Override the latter when necessary.
 */
eYo.view.BaseC9r_p.initUI = function (...args) {
  try {
    this.initUI = eYo.doNothing
    this.prepareUI(...args)
    this.doInitUI(...args)
  } finally {
    delete this.disposeUI
  }
}

/**
 * Dispose of the ui.
 * Default implementation forwards to the driver.
 */
eYo.view.BaseC9r_p.doDisposeUI = eYo.doNothing

/**
 * Dispose of the ui.
 * Default implementation forwards to `doDisposeUI`.
 * Override the latter.
 */
eYo.view.BaseC9r_p.disposeUI = function (...args) {
  try {
    this.disposeUI = eYo.doNothing
    this.doDisposeUI(...args)
  } finally {
    delete this.initUI
  }
}

/**
 * Hook when the owner has changed.
 * @param{*} before - the owner before the change
 * @param{*} after - the owner after the change
 */
eYo.view.BaseC9r_p.ownerDidChange = function (before, after) {
  eYo.view.BaseC9r.SuperC9r_p.call(this, before, after)
  if (after) {
    if (after.hasUI) {
      this.initUI()
    } else {
      this.disposeUI()
    }
  }
}

/**
 * List of views.
 * @name{eYo.view.List}
 * @constructor
 */
eYo.view.makeC9r(eYo.p6y.List)

/**
 * initialize from the model.
 * @param {Object} views - A views models
 */
eYo.view.List_p.modelMerge = function (views) {
  this.ns.modelExpand(views, 'views')
  this.views__.forEach(v => v.eyo.modelMerge({}))
}

/**
 * Initialize the instance.
 * Calls the inherited method, then adds methods defined by the model.
 * The methods are managed by the |dataHandler| method of the |eYo.model|.
 * @param {Object} object - The object to initialize.
 */
eYo.view.List.eyo_p.initInstance = function (instance) {
  eYo.view.List.eyo.super.initInstance.call(this, instance)
  let model = this.model
  Object.keys(model).forEach(k => {
    this.views__.push(eYo.view.new(this, k, model[k]))
    instance.newView(model[k])
  })
}
