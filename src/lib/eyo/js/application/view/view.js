/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview namespace for all the view objects.
 * View object are displayed unless in a faceless application.
 * This is a view that contains other views.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('geom')
eYo.require('drvr')

/**
 * @name {eYo.view}
 * @namespace
 */
eYo.o4t.newNS(eYo, 'view')

//<<< mochai: Basics
//... chai.assert(eYo.view)
//... chai.assert(eYo.View)
//>>>

/**
 * Enhance the constructor with view facilities.
 * @param {*} manyModel - The model
 */
eYo.dlgt.C9rBase_p.viewEnhanced = function () {
  //<<< mochai: viewEnhanced

  this.p6y$ || eYo.throw(`${this.eyo$.name}/viewEnhanced: Not a p6y aware delegate.`)

  //<<< mochai: Basic
  //... let Foo = eYo.view.newNS().newC9r('Foo')
  //... chai.expect(Foo[eYo.$].viewPrepare).eyo_F
  //... chai.expect(Foo[eYo.$].viewInit).eyo_F
  //>>>

  /**
   * Make a view shortcut.
   * Change both the given object **and** its prototype!
   * 
   * @param {*} object - The object receiving the new shortcuts,
   */
  eYo.mixinFR(this._p, {
    //<<< mochai: eYo.dlgt.C9rBase_p.viewShortcuts
    viewShortcuts () {
      //<<< mochai: viewShortcuts (foo_v)
      let _p = this.C9r_p
      for (let k of this.viewModelMap.keys()) {
        let k_v = k + '_v'
        eYo.objectHasOwnProperty(_p, k_v) || Object.defineProperties(_p, {
          [k_v]: eYo.descriptorR({$ () {
            return this.viewMap.get(k)
            //... let NS = eYo.o4t.newNS()
            //... let C9r = NS.makeC9rBase(true)
            //... C9r[eYo.$].viewEnhanced()
            //... C9r[eYo.$].finalizeC9r()
            //... C9r[eYo.$].viewMerge({
            //...   foo: {
            //...     chi: 421,
            //...   },
            //... })
            //... let _p = C9r[eYo.$].C9r_p
            //... eYo.objectHasOwnProperty(chai.expect(_p, 'foo_v')).true
            //... let o = NS.new('o', onr)
            //... chai.expect(o.foo_v).instanceOf(eYo.View)
          }}.$),
        })
      }
      //>>>
    },
    //>>>
  })
  let manyModel = {
    /**
     * Make a view
     * @param {Object} model 
     * @param {String} key 
     * @param {Object} owner - the owner of the instance
     * @private
     */
    make (model, key, owner) {
      return model && eYo.view.prepare(model || {}, key, owner)
    },
    allow: {
      //<<< mochai: viewEnhanced/allow
      [eYo.model.ANY]: eYo.View[eYo.$].modelFormat,
      [eYo.model.VALIDATE]: eYo.model.validateD,
      //... let ns = eYo.o4t.newNS()
      //... let C9r = ns.makeC9rBase(true)
      //... C9r[eYo.$].viewEnhanced()
      //... C9r[eYo.$].finalizeC9r()
      //... chai.assert(C9r[eYo.$].modelFormat.get('views'))
      //>>>
    }
  }
  this.manyEnhanced('view', 'views', manyModel)
  eYo.c9r.appendToMethod(this._p, 'viewMerge', function () {
    this.viewShortcuts()
    //<<< mochai: viewMerge+viewShortcuts
    //... let ns = eYo.o4t.newNS()
    //... let C9r = ns.makeC9rBase(true)
    //... C9r[eYo.$].viewEnhanced()
    //... C9r[eYo.$].finalizeC9r()
    //... C9r[eYo.$].viewMerge({
    //...   foo: {
    //...     chi: 421,
    //...   },
    //... })
    //... C9r[eYo.$].viewMerge({
    //...   bar: {
    //...     chi: 666,
    //...   },
    //... })
    //... var o = ns.new('bar', onr)
    //... o.eyo$.viewPrepare(o)
    //... chai.expect(o.viewMap.get('foo')).not.undefined
    //... chai.expect(o.viewMap.get('bar')).not.undefined
    //... chai.expect(o.foo_v).instanceOf(eYo.View)
    //... chai.expect(o.bar_v).instanceOf(eYo.View)
    //>>>
  })
  this.viewShortcuts()

  //... let ns = eYo.o4t.newNS()
  //... let C9r = ns.makeC9rBase()
  //... C9r[eYo.$].viewEnhanced()
  //... var o = ns.new('o', onr)
  
  eYo.mixinFR(this._p, {
    /**
     * Make the `do_initUI` and `do_disposeUI` methods.
     * @param {Object} ui - model with `init` and `dispose` keys.
     */
    uiMerge (ui) {
      //<<< mochai: uiMerge
      let init_m = ui && ui.init
      let C9r_p = this.C9r_p
      let init_p = C9r_p && C9r_p.do_initUI // always exists
      if (init_m) {
        //<<< mochai: ui.init
        this.C9r_p.do_initUI = XRegExp.exec(init_m.toString(), eYo.xre.function_builtin)
          ? function (...$) {
            init_m.call(this, () => {
              init_p.call(this, ...$)
            }, ...$)
          } : function (...$) {
            init_p.call(this, ...$)
            init_m.call(this, ...$)  
          }
        //... var seed = eYo.genUID(eYo.IDENT)
        //... var key = 'x' + seed
        //... var Key = 'X' + seed
        //... var NS = eYo.view.newNS()
        //... NS.makeC9rBase({
        //...   ui: {
        //...     init (...$) {
        //...       eYo.test.push(1, ...$)
        //...     },
        //...   },
        //... })
        //... var V = NS.new({}, 'foo', onr)
        //... // V.do_initUI(5, 6)
        //... eYo.test.expect(156)
        //... var V = NS.new({
        //...   ui: {
        //...     init (...$) {
        //...       eYo.test.push(2, ...$)
        //...     },
        //...   },
        //... }, 'foo', onr)
        //... // V.do_initUI(5, 6)
        //... eYo.test.expect(156256)
        //>>>
      }
      // now the dispose ui
      let dispose_m = ui.dispose
      let dispose_p = C9r_p && C9r_p.disposeUI
      if (dispose_m) {
        //<<< mochai: ui.dispose
        this.C9r_p.do_disposeUI = XRegExp.exec(dispose_m.toString(), eYo.xre.function_builtin)
          ? function (...$) {
            dispose_m.call(this, () => {
              dispose_p.call(this, ...$)              
            }, ...$)
          } : function (...$) {
            dispose_m.call(this, ...$)
            dispose_p.call(this, ...$)
          }
        //... var seed = eYo.genUID(eYo.IDENT)
        //... var key = 'x' + seed
        //... var Key = 'X' + seed
        //... var NS = eYo.view.newNS()
        //... NS.makeC9rBase({
        //...   ui: {
        //...     dispose (...$) {
        //...       eYo.test.push(3, ...$)
        //...     },
        //...   },
        //... })
        //... var V = NS.new({}, 'foo', onr)
        //... // V.do_disposeUI(5, 6)
        //... eYo.test.expect(356)
        //... var V = NS.new({
        //...   ui: {
        //...     init (...$) {
        //...       eYo.test.push(4, ...$)
        //...     },
        //...   },
        //... }, 'foo', onr)
        //... // V.do_disposeUI(5, 6)
        //... eYo.test.expect(356456)
        //>>>
      }
      //>>>
    },
    /**
     * Declare the given model for the associate constructor.
     * The default implementation calls `methodsMerge`.
     * @param {Object} model - Object, like for |newC9r|.
     */
    modelMerge (model) {
      //<<< mochai: modelMerge
      eYo.view.Dlgt[eYo.$SuperC9r][eYo.$].modelMerge.call(this, model)
      model.views && this.viewMerge(model.views)
      model.ui && this.uiMerge(model.ui)
      //... chai.assert(eYo.view.Dlgt_p.modelMerge)
      //>>>
    },
    /**
     * Prepare an instance with properties.
     * @param {Object} instance -  object is an instance of a subclass of the `C9r` of the receiver
     */
    prepareInstance (instance) {
      //<<< mochai: prepareInstance
      //... chai.assert(C9r[eYo.$].prepareInstance)
      let $prepare = this.p6y$.prepare
      this[$prepare](instance)
      this.viewPrepare(instance)
      let $super = this.$super
      if ($super) {
        try {
          $super[$prepare] = $super.viewPrepare = eYo.doNothing // prevent to eventually recreate the same properties and views
          $super.prepareInstance(instance)
        } finally {
          delete [$prepare]
          delete $super.viewPrepare
        }
      }
      //>>>
    },
    /**
     * Initialize an instance with valued, cached, owned and copied properties.
     * @param {Object} instance -  object is an instance of a subclass of the `C9r_` of the receiver
     */
    initInstance (instance, ...$) {
      //<<< mochai: initInstance
      //... chai.assert(C9r[eYo.$].initInstance)
      let $init = this.p6y$.init
      let $links = this.p6y$.links
      this[$init](instance)
      this[$links](instance)
      let $super = this.$super
      if ($super) {
        try {
          $super[$init] = $super[$links] = $super.viewInit = $super.viewLinks = eYo.doNothing // prevent to recreate the same properties
          $super.initInstance(instance, ...$)
        } finally {
          delete $super[$init]
          delete $super[$links]
          delete $super.viewInit
          delete $super.viewLinks
        }
        this.viewInit(instance, ...$)
        this.viewLinks(instance)
      }
      //... var V = eYo.view.new({
      //...   CONSTs: {
      //...     CONST_421: 421,
      //...   },
      //...   methods: {
      //...     flag (...$) {
      //...       eYo.test.push(1, ...$)
      //...     },
      //...   },
      //... }, 'foo', onr)
      //... chai.expect(V.CONST_421).equal(421)
      //... V.flag(2, 3)
      //... eYo.test.expect(123)
      //>>>
    },
    /**
     * Dispose of the resources declared at that level.
     * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
     */
    c9rDispose (instance, ...$) {
      //<<< mochai: c9rDispose
      //... chai.expect(C9r[eYo.$].c9rDispose).eyo_F
      this.viewDispose(instance, ...$)
      this[this.p6y$.dispose](instance, ...$)
      //>>>
    },
  })
  //>>>
}

//... var V

/**
 * Widgets with UI capabilities.
 * This is a pure abstract class that must be subclassed.
 * @name{eYo.view.C9rBase}
 * @constructor
 */
eYo.view.makeC9rBase(true, {
  /**
   * Initializer.
   */
  init(builtin, ...$) {
    //<<< mochai: init
    this.disposeUI = eYo.doNothing // will be used by subclassers
    builtin(...$)
    //... V = new eYo.View('foo', onr, 1, 2, 3)
    //... chai.expect(V.key).equal('foo')
    //... chai.expect(V.owner).equal(onr)
    //... chai.expect(V.disposeUI).equal(eYo.doNothing)
    //>>>
  },
  properties: {
    //<<< mochai: properties
    /**
     * Whether the receiver's UI has been intialized.
     * 
     * @type {Boolean}
     */
    hasUI: {
      //<<< mochai: hasUI
      get () {
        return !this.initUI || this.initUI === eYo.doNothing
      },
      //... V = new eYo.View('foo', onr, 1, 2, 3)
      //... chai.expect(V.hasUI).false
      //... V.initUI = eYo.doNothing
      //... chai.expect(V.hasUI).true
      //... V.initUI = eYo.NA
      //... chai.expect(V.hasUI).true // Arbitrary
      //>>>
    },
    /**
     * Each view has a view rect.
     * @type {eYo.geom.Rect}
     * @readonly
     */
    viewRect: {
      //<<< mochai: viewRect
      get () {
        return new eYo.geom.Rect()
      },
      //... V = new eYo.View('foo', onr, 1, 2, 3)
      //... chai.expect(V.viewRect).instanceOf(eYo.geom.Rect)
      //>>>
    },
    /**
     * The driver manager shared by all the instances in the app.
     * @type {eYo.drvr.Mngr}
     */
    driver_mngr: {
      get () {
        let a = this.app
        return a && a.driver_mngr
      },
    },
    /**
     * The driver.
     * @type {eYo.drvr.C9rBase}
     */
    driver: {
      lazy () {
        var mngr = this.driver_mngr
        return mngr && mngr.drvr(this)
      },
      reset (builtin) {
        this.ownedForEach(x => {
          let p = x.driver_p
          p && p.reset()
        })
        builtin()
      }
    },
    //>>>
  },
})

eYo.View[eYo.$].finalizeC9r({
  //<<< mochai: model
  views: {
    [eYo.model.ANY]: {
      [eYo.model.DOT]: ['C9r', 'shared'],
      [eYo.model.VALIDATE] (before, p) {  // eslint-disable-line
        if (eYo.isStr(before)) {
          var v = eYo.valueForKeyPath(before)
          if (eYo.isSubclass(v, eYo.view.C9rBase)) {
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
        } else if (eYo.isSubclass(before, eYo.view.C9rBase)) {
          return {
            C9r: before,
            shared: true,
          }
        }
        return eYo.isD(before) ? before : eYo.INVALID
      },
    }
  },
  ui: ['init', 'dispose', 'doInit', 'doDispose', 'initMaker', 'disposeMaker'],
  //>>>
})

{
  // recursive definition of views inside views
  let mf = eYo.view.C9rBase[eYo.$].modelFormat
  mf.get('views').get(eYo.model.ANY).fallback = mf
}

eYo.View[eYo.$].viewEnhanced()

eYo.mixinFR(eYo.view._p, {
  /**
   * The model Base used to derive a new class.
   * @see The `new` method.
   * @param {Object} model
   * @param {String} key
   */
  modelC9rBase (model, key) {
    if (eYo.isC9r(model.shared)) {
      return model.shared
    } else if (eYo.isStr(model.shared) && eYo.isC9r(eYo.view[model.shared])) {
      return eYo.view[model.shared]
    } else if (eYo.isC9r(model.C9r)) {
      return model.C9r
    } else if (eYo.isStr(model.C9r) && eYo.isC9r(eYo.view[model.C9r])) {
      return eYo.view[model.C9r]
    } else if (eYo.isC9r(eYo.view[key])) {
      eYo.view[key]
    } else {
      return eYo.View
    }
  },
  /**
   * Recommanded way to create view instances.
   * View instances are unique when the model's `shared` attribute is not `false`.
   * If the model has an attribute `shared` which is a view instance,
   * then it is returned as is.
   * If it is a C9r, an instance is created, cached and returned.
   * @param{Object} model - An object suitable to create such a view instance.
   * @param{String} [key] - The key of the created instance.
   * @param{Object} owner - and eYo object
   */
  new (model, key, owner) {
    if (!eYo.isStr(key)) {
      eYo.isNA(owner) || eYo.throw(`${this.name}/new: Unexpected last argument (${owner})`)
      ;[key, owner] = ['', key]
    }
    if (model.shared instanceof eYo.View) {
      return model.shared
    }
    let ans = this.prepare(model, key, owner)
    ans.preInit && ans.preInit()
    return model.shared !== false ? (model.shared = ans) : ans
  },
  /**
   * Recommanded way to create view instances.
   * @param{Function} enhancer - A function that returns a `eYo.View` instance. Arguments are taken as is from the caller.
   * The actual `eYo.view._p.new` is overriden to call the enhancer first.
   * If the result is not undefined, then it is returned as is.
   * Otherwise, the original method is called.
   * @throws{Error} when the enhancer does not return
   * an acceptable value.
   */
  enhanceNew (enhancer) {
    let original = this.new
    eYo.mixinFR(this._p, {
      new (...$) {
        let ans = enhancer(...$)
        if (ans instanceof eYo.View) { // -> eYo.c9r._p.enhanceNew = (enhancer, C9r) => {...}
          return ans
        } else if (ans) {
          eYo.throw(`Unexpected enhancer return value: ${ans}`)
        }
        return original(...$)
      },
    })
  },
})

// ANCHOR UI

eYo.View[eYo.$].methodsMerge({
  //<<< mochai: UI methods
  //... let model = {
  //...   bar: 4,
  //...   views: {
  //...     foo: {
  //...       after: 'chi',
  //...       bar: 6,
  //...     },
  //...     chi: {
  //...       bar: 5,
  //...     },
  //...     mee: {
  //...       after: 'foo',
  //...       bar: 7,
  //...     },
  //...   },
  //... }
  //... let driver = {
  //...   prepareUI (instance, ...$) {
  //...     eYo.test.push(1, instance.eyo$.model.bar, ...$)
  //...   },
  //...   do_initUI (instance, ...$) {
  //...     eYo.test.push(2, instance.eyo$.model.bar, ...$)
  //...   },
  //...   do_disposeUI (instance, ...$) {
  //...     eYo.test.push(3, instance.eyo$.model.bar, ...$)
  //...   },
  //... }
  /**
   * Prepare the ui.
   * Default implementation calls the inherited method
   * and forwards to the views.
   * One shot function.
   */
  prepareUI (...$) {
    //<<< mochai: prepareUI
    this.drvr.prepareUI(this, ...$)
    this.prepareUI = eYo.doNothing
    this.viewForEach(V => {
      delete V.prepareUI
      V.prepareUI(...$)
    })
    //... let V = eYo.view.new(model, 'V', onr)
    //... chai.expect(V.chi_v).instanceOf(eYo.View)
    //... chai.expect(V.foo_v).instanceOf(eYo.View)
    //... chai.expect(V.mee_v).instanceOf(eYo.View)
    //... V.viewForEach(V => eYo.test.push(V[eYo.$].model.bar))
    //... eYo.test.expect(567)
    //... V.drvr = driver
    //... V.viewForEach(V => {
    //...   V.drvr = driver
    //... })
    //... V.prepareUI(8, 9)
    //... eYo.test.expect(1489158916891789)
    //>>>
  },
  /**
   * Make the ui.
   * Default implementation calls the inherited method
   * and forwards to the views.
   */
  do_initUI (...$) {
    //<<< mochai: do_initUI
    this.initUI = eYo.doNothing
    this.drvr.do_initUI(this, ...$)
    this.viewForEach(v => v.do_initUI(...$))
    //... let V = eYo.view.new(model, 'V', onr)
    //... V.drvr = driver
    //... V.viewForEach(V => {
    //...   V.drvr = driver
    //... })
    //... V.do_initUI(8, 9)
    //... eYo.test.expect(2489258926892789)
    //>>>
  },
  /**
   * Make the ui.
   * Default implementation forwards to the driver.
   * One shot function until the next disposeUI.
   * Calls `prepareUI` then `do_initUI`.
   * Override the latter when necessary.
   */
  initUI (...$) {
    try {
      this.prepareUI(...$)
      this.do_initUI(...$)
    } finally {
      delete this.disposeUI
    }
  },
  /**
   * Dispose of the ui.
   * Default implementation forwards to the driver.
   */
  do_disposeUI (...$) {
    //<<< mochai: do_initUI
    this.drvr.do_disposeUI(this, ...$)
    this.viewForEach(v => v.disposeUI(...$))
    //... let V = eYo.view.new(model, 'V', onr)
    //... V.drvr = driver
    //... V.viewForEach(V => {
    //...   V.drvr = driver
    //... })
    //... V.do_disposeUI(8, 9)
    //... eYo.test.expect(3489358936893789)
    //>>>
  },
  /**
   * Dispose of the ui.
   * Default implementation forwards to `do_disposeUI`.
   * Override the latter.
   */
  disposeUI (...$) {
    //<<< mochai: initUI/disposeUI
    try {
      this.disposeUI = eYo.doNothing
      this.do_disposeUI(...$)
    } finally {
      delete this.initUI
    }
    //>>>
  },
  /**
   * Layout the receiver.
   * The default implementation does nothing.
   */
  layout: eYo.doNothing,
  /**
   * Update the metrics of the receiver.
   */
  updateMetrics: eYo.doNothing,
  /**
   * Place the receiver.
   */
  place: eYo.doNothing,
  /**
   * Hook when the owner has changed.
   * @param{*} before - the owner before the change
   * @param{*} after - the owner after the change
   */
  ownerDidChange (before, after) {
    eYo.View[eYo.$SuperC9r_p].ownerDidChange.call(this, before, after)
    if (after) {
      if (after.hasUI) {
        this.initUI()
      } else {
        this.disposeUI()
      }
    }
  },
  //>>>
})
