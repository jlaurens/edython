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
 * @name{eYo.Widget}
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
  cached: {
    ui_driver: {
      init () {
        var mngr = this.ui_driver_mngr
        return mngr && mngr.driver(this)
      },
      forget (builtin) {
        this.ownedForEach(x => {
          let p = x.ui_driver_p
          p && p.forget()
        })
        builtin()
      }
    },
  },
  computed: {
    /**
     * Whether the receiver's UI has been intialized.
     * 
     * @type {Boolean}
     */
    hasUI () {
      return !this.initUI || this.initUI === eYo.do.nothing
    },
    /**
     * The driver manager shared by all the instances in the app.
     * @type {eYo.driver.Mngr}
     */
    ui_driver_mngr () {
      let a = this.app
      return a && a.ui_driver_mngr
    },
  },
})

/**
 * Consolidate the given model.
 * @param {Widget} model - The model contains informations to extend the receiver's associate constructor.
 */
eYo.Widget.eyo_p.modelConsolidate = function (...args) {
  eYo.c9r.model.consolidate(...args)
}

/**
 * Extend the receiver and its associate constructor with the given model.
 * @param {Widget} model - The model contains informations to extend the receiver's associate constructor.
 */
eYo.Widget.eyo_p.handleModel = function (model) {
  if (model) {
    this.super_p.handleModel.call(this, model)
    var type = eYo.t3.expr[key]
    type && !model.out || (model.out = Object.create(null))
  }
}

/**
 * Initialize an instance with valued, cached, owned and cloned properties.
 * Default implementation forwards to super.
 * @param {Widget} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
 */
eYo.Widget.eyo_p.initInstance = function (widget) {
  this.super.initInstance(widget)
}

/**
 * Dispose of the resources declared at that level.
 * @param {Widget} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
 */
eYo.Widget.eyo_p.disposeInstance = function (object) {
  this.valuedClear_(object)
  this.cachedForget_(object)
  this.o3dDispose_(object)
  this.clonedDispose_(object)
}

/**
 * Register the `init` method  in the model, to be used when necessary.
 * @param {String} k - name of the key to add
 * @param {Widget} model - Widget with `init` key, eventually.
 */
eYo.Widget.eyo_p.registerInit = function (k, model) {
  if (eYo.isNA(model)) {
    console.error('BREAK HERE!')
  }
  var init = (eYo.isF(model) && model) || (eYo.isF(model.init) && model.init)
  if (init) {
    !this.init_ && (this.init_ = Object.create(null))
    return this.init_[k] = init
  } 
}

/**
 * Register the `dispose` method  in the model, to be used when necessary.
 * See the `ownedDispose` method for more informations.
 * @param {String} k name of the ley to add
 * @param {Widget} model Widget with `dispose` key, eventually.
 */
eYo.Widget.eyo_p.registerDispose = function (k, model) {
  var dispose = eYo.isF(model.dispose) && model.dispose
  if (dispose) {
    !this.disposer_ && (this.disposer_ = Object.create(null))
    this.disposer_[k] = dispose
  } 
}

/**
 * Declare the given model.
 * @param {Widget} model - Widget, like for |makeC9r|.
 */
eYo.Widget.eyo_p.modelDeclare = function (model) {
  model.CONST && this.CONSTDeclare(model.CONST)
  model.valued && this.valuedDeclare(model.valued)
  model.o3d && this.o3dDeclare(model.o3d)
  model.cached && this.cachedDeclare(model.cached)
  model.cloned && this.clonedDeclare(model.cloned)
  model.computed && this.computedDeclare(model.computed)
  model.called && this.calledDeclare(model.called)
}

/**
 * Add a CONST property.
 * The receiver is not the owner.
 * @param {String} k name of the CONST to add
 * @param {Widget} model Widget with `value` keys,
 * f any.
 */
eYo.Widget.eyo_p.CONSTDeclare = function (k, model = {}) {
  k !== k.toUpperCase() && eYo.throw(`Bad CONST identifier: ${k}`)
  var f = (m) => {
    if (m.unique) {
      return {
        value: new function () {},
        // writable: false,
      }
    }
    if (m.hasOwnProperty('value')) {
      return m
    }
    return {
      value: m
      // writable: false,
    }
  }
  Widget.keys(model).forEach(k => {
    Widget.defineProperty(this.C9r_, k, f(model[k]))
  })
}

/**
 * Add a valued property.
 * The receiver is not the owner.
 * @param {String} k name of the valued property to add
 * @param {Widget} model Widget with `willChange` and `didChange` keys,
 * f any.
 */
eYo.Widget.eyo_p.valuedDeclare_ = function (k, model) {
  eYo.parameterAssert(!this.props__.has(k))
  this.valued_.add(k)
  let C9r = this.C9r_
  let C9r_p = C9r.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  this.registerInit(k, model)
  try {
    Widget.defineProperty(C9r_p, k__, {
      value: eYo.isO(model) ? model.value : model,
      writable: true,
    })
  } catch(e) {
    console.error(`FAILURE: value property ${k__} in ${this.name}`)
  }
  try {
    Widget.defineProperty(C9r_p, k_, {
      get: model.get_ || function () {
        return this[k__]
      },
      set: model.set_ || function (after) {
        var before = this[k__]
        var f = model.validate
        if (f && (after = f.call(this, before, after)) === eYo.INVALID) {
          return
        }
        f = this[k + 'Validate']
        if (f && (after = f.call(this, before, after)) === eYo.INVALID) {
          return
        }
        if (before !== after) {
          f = model.willChange
          if (!f || (f = f.call(this, before, after))) {
            var ff = this[k + 'WillChange']
            ff && ff.call(this, before, after)
            this[k__] = after
            f && f.call(this, before, after)
            f = model.didChange
            f && f.call(this, before, after)
            ff && ff.call(this, before, after)
            ff = this[k + 'DidChange']
            ff && ff.call(this, before, after)
          }
        }
      },
      configurable: !!model.configurable,
    })
  } catch(e) {
    console.error(`FAILURE: value property ${k_} in ${this.name}`)
  }
  this.descriptors__[k] = eYo.c9r.descriptorR(model.get || function () {
    return this[k_]
  })
  this.consolidatorMake(k, model)
}

/**
 * Add a valued consolidation method.
 * The receiver is not the owner.
 * @param {Widget} constructor -  Its prototype object gains a storage named `foo__` and both getters and setters for `foo_`.
 * The initial value is `eYo.NA`.
 * @param {Array<String>} names names of the link to add
 */
eYo.Widget.eyo_p.consolidatorMake = function (k, model) {
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
 * Add a valued properties.
 * The receiver is not the owner.
 * @param {Widget} constructor -  Its prototype object gains a storage named `foo__` and both getters and setters for `foo_`.
 * The initial value is `eYo.NA`.
 * @param {Array<String>} names names of the link to add
 */
eYo.Widget.eyo_p.valuedDeclare = function (model) {
  if (model.forEach) {
    model.forEach(k => {
      this.valuedDeclare_(k, {})
    })
  } else {
    Widget.keys(model).forEach(k => {
      this.valuedDeclare_(k, model[k])
    })
  }
}

/**
 * Dispose in the given object, the value given by the constructor.
 * @param {Widget} object -  an instance of the receiver's constructor,
 * or one of its subclasses.
 */
eYo.Widget.eyo_p.valuedClear_ = function (object) {
  this.valuedForEach(k => {
    var k_ = k + '_'
    var x = object[k_]
    if (x) {
      object[k_] = eYo.NA
    }
  })
}

//// Properties

/**
 * Add a 3 levels property to a prototype.
 * `key__` is the basic private recorder.
 * `key_` is the basic private setter/getter.
 * Changing this property is encapsulated between `willChange` and `didChange` methods.
 * `k` is the public getter.
 * In the setter, we arrange things such that the new value
 * and the receiver have the same status with respect to UI. 
 * The `get` and `set` keys allow to provide a getter and a setter.
 * In that case, the setter should manage ownership if required.
 * Add an owned object.
 * The receiver is not the owner.
 * @param {String} k name of the owned to add
 * @param {Widget} data -  the object used to define the property: key `value` for the initial value, key `willChange` to be called when the property is about to change (signature (before, after) => function, truthy when the change should take place). The returned value is a function called after the change has been made in memory.
 */
eYo.Widget.eyo_p.o3dDeclare_ = function (k, model = {}) {
  eYo.parameterAssert(!this.props__.has(k))
  this.o3d_.add(k)
  const proto = this.C9r_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  this.registerInit(k, model)
  this.registerDispose(k, model)
  Widget.defineProperties(proto, {
    [k__]: {value: model.value || eYo.NA, writable: true},
    [k_]: {
      get: model.get || function () {
        return this[k__]
      },
      set: model.set
      ? function (after) {
        var before = this[k__]
        if(before !== after) {
          var f = model.willChange
          if (!f || (f = f.call(this, before, after))) {
            model.set.call(this, after)
            f && f(before, after)
          }
        }
      }
      : function (after) {
        var before = this[k__]
        var f = model && model.validate
        if (f && (after = f.call(this, before, after)) === eYo.INVALID) {
          return
        }
        f = this[k + 'Validate']
        if (f && (after = f.call(this, before, after)) === eYo.INVALID) {
          return
        }
        if(before !== after) {
          var f = model.willChange
          if (!f || (f = f.call(this, before, after))) {
            var ff = this[k + 'WillChange']
            ff && ff.call(this, before, after)
            if (!!before && before.owner_) {
              before.owner_ = before.ownerKey_ = eYo.NA
            }
            this[k__] = after
            if (after) {
              if (after.owner_) {
                after.owner_[after.ownerKey_] = eYo.NA
              }
              after.ownerKey_ = k_
              after.owner_ = this
            } else if (typeof after === "object") {
              after.ownerKey_ = k_
              after.owner_ = this
            }
            f && f.call(this, before, after)
            f = model.didChange
            f && f.call(this, before, after)
            ff && ff.call(this, before, after)
            ff = this[k + 'DidChange']
            ff && ff.call(this, before, after)
            // init the UI if necessary, we intentionnaly did not delete the UI
            if (!!after && this.hasUI && after.initUI) {
              after.initUI()
            }
          }
        }
      },
      configurable: !!model.configurable,
    }
  })
  this.descriptors__[k] = eYo.c9r.descriptorR(model.get || function () {
    return this[k_]
  })
  this.consolidatorMake(k, model)
}

/**
 * Add an owned property.
 * The receiver is the owner.
 * @param {Widget} many  key -> data map.
 */
eYo.Widget.eyo_p.o3dDeclare = function (many) {
  if (many.forEach) {
    many.forEach(k => {
      this.o3dDeclare_(k)
    })
  } else {
    Widget.keys(many).forEach(k => {
      this.o3dDeclare_(k, many[k])
    })  
  }
}

/**
 * Dispose in the given object, the properties given by their main name.
 * @param {Widget} object - the object that owns the property. The other parameters are forwarded to the dispose method.
 */
eYo.Widget.eyo_p.o3dDispose_ = function (object, ...params) {
  this.ownedForEach(k => {
    var k_ = k + '_'
    var k__ = k + '__'
    var x = object[k__]
    if (x) {
      object[k_] = eYo.NA
      if (x.forEach) {
        x.forEach(xx => xx.dispose(...params))
        x.length = 0
      } else {
        x.dispose(...params)
      }
    }
  })
}

/**
 * Add a 2 levels cached property to the receiver's constructor's prototype.
 * @param {String} key -  the key
 * @param {Widget} model -  the model object, must have a `init` key and
 * may have a `forget` or an `update` key.
 * Both are functions called in the contect of the owner
 * (`this` is the owner). `init` takes no arguments.
 * `forget` takes only one argument: the concrete forgetter.
 * `update` arguments are the value before, the value after
 * (computed from the `init`) and the updater which is the function
 * that effectively set the new value.
 * It may take one argument to override the proposed after value.
 * If key is `foo`, then a `fooForget` and a `fooUpdate` method are created automatically.
 */
eYo.Widget.eyo_p.cachedDeclare_ = function (k, model) {
  eYo.parameterAssert(!this.props__.has(k))
  this.cached_.add(k)
  var proto = this.C9r_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  var init = this.registerInit(k, model)
  Widget.defineProperties(proto, {
    [k__]: {value: eYo.NA, writable: true},
    [k_]: {
      get: init
      ? function () {
        var before = this[k__]
        if (eYo.isDef(before)) {
          return before
        }
        var after = init.call(this)
        return (this[k_] = after)
      } : function () {
        return this[k__]
      },
      set (after) {
        var before = this[k__]
        var f = model && model.validate
        if (f && (after = f.call(this, before, after)) === eYo.INVALID) {
          return
        }
        var ff = this[k + 'Validate']
        if (ff && (after = ff.call(this, before, after)) === eYo.INVALID) {
          return
        }
        if (before !== after) {
          f = model && model.willChange
          if (!f || (f = f.call(this, before, after))) {
            ff = this[k + 'WillChange']
            ff && ff.call(this, before, after)
            this[k__] = after
            f && f.call(this, before, after)
            f = model && model.didChange
            f && f.call(this, before, after)
            ff && ff.call(this, before, after)
            ff = this[k + 'DidChange']
            ff && ff.call(this, before, after)
          }
        }
      },
      configurable: !!model.configurable,
    }
  })
  this.cachedForgetters__ || (this.cachedForgetters__ = Object.create(null))
  proto[k+'Forget'] = this.cachedForgetters__[k] = model.forget
  ? function () {
    model.forget.call(this, () => {
      this[k_] = eYo.NA
    })
  } : function () {
    this[k_] = eYo.NA
  }
  this.cachedUpdaters__ || (this.cachedUpdaters__ = Object.create(null))
  proto[k+'Update'] = this.cachedUpdaters__[k] = model.update
  ? function (after) {
    var before = this[k__]
    eYo.isDef(after) || (after = init.call(this))
    if (before !== after) {
      model.update.call(this, before, after, (x) => {
        this[k_] = eYo.isDef(x)? x : after
      })
    }
  } : function (after) {
    var before = this[k__]
    eYo.isDef(after) || (after = init.call(this))
    if (before !== after) {
      this[k_] = after
    }
  }
  this.descriptors__[k] = eYo.c9r.descriptorR(model.get || function () {
    return this[k_]
  })
}

/**
 * Add 3 levels cached properties to a prototype.
 * @param {Widget} many -  the K => V mapping to which we apply `cachedDeclare_(K, V)`.
 */
eYo.Widget.eyo_p.cachedDeclare = function (many) {
  Widget.keys(many).forEach(n => {
    this.cachedDeclare_(n, many[n])
  })
}

/**
 * Forget all the cached valued.
 */
eYo.Widget.eyo_p.cachedForget_ = function () {
  this.cachedForEach(n => {
    this.cachedForgetters__[n].call(this)
  })
}

/**
 * Forget all the cached valued.
 */
eYo.Widget.eyo_p.cachedUpdate_ = function () {
  this.cachedForEach(n => {
    this.cachedUpdaters__[n].call(this)
  })
}

/**
 * Add computed properties to a prototype.
 * @param {Map<String, Function>} models,  the key => Function mapping.
 */
eYo.Widget.eyo_p.computedDeclare = function (models) {
//  console.warn('computedDeclare:', this.name, Widget.keys(models))
  Widget.keys(models).forEach(k => {
//    console.warn('computedDeclare -> ', k)
    !k && this.props__.has(k) && eYo.throw(`ERROR: ${k} is already a property of ${this.name}`)
    let k_ = k + '_'
    let k__ = k + '__'
    this.props__.has(k_) && eYo.throw(`ERROR: ${k_} is already a property of ${this.name}`)
    this.props__.has(k__) && eYo.throw(`ERROR: ${k__} is already a property of ${this.name}`)
    const _p = this.C9r_p
    try {
      var model = models[k]
      var get = model.get || eYo.asF(model)
      var set = model.set
      if (set) {
        Widget.defineProperty(_p, k, get ? {
            get: get,
            set: set,
          } : eYo.c9r.descriptorW(k, set),
        )
      } else {
        this.descriptors__[k] = get
        ? eYo.c9r.descriptorR(k, get)
        : eYo.c9r.descriptorNORW(k)
      }
      k = k_
      get = eYo.asF(model.get_) || function () {
        return this[k__]
      }
      set = model.set_
      Widget.defineProperty(_p, k, get ? set ? {
          get: get,
          set: set,
        } : eYo.c9r.descriptorR(get)
        : set
        ? eYo.c9r.descriptorW(set) : eYo.c9r.descriptorNORW(k),
      )
      k = k__
      get = model.get__
      set = model.set__
      Widget.defineProperty(_p, k, get
        ? set ? {
          get: get,
          set: set,
        } : eYo.c9r.descriptorR(get)
        : set ? eYo.c9r.descriptorW(set) : eYo.c9r.descriptorNORW(k),
      )
    } catch (e) {
      console.warn(`Computed property problem, ${k}, ${this.name_}, ${e}`)
      console.error(`Computed property problem, ${k}, ${this.name_}, ${e}`)
    }
  })
//  console.warn('computedDeclare: SUCCESS')
}

/**
 * Add methods to the associate prototype.
 * @param {Map<String, Function>} models,  the key => Function mapping.
 */
eYo.Widget.eyo_p.calledDeclare = function (model) {
  let p = this.C9r_p
  Widget.keys(model).forEach(k => {
    eYo.assert(!eYo.do.hasOwnProperty(p, k))
    let f = model[k]
    eYo.assert(eYo.isF(f), `Got ${f}instead of a function`)
    p[k] = f // maybe some post processing here
  })
}

/**
 * Add a 3 levels cloned property to a prototype.
 * `foo` is a cloned object means that `foo.clone` is a clone of `foo`
 * and `foo.set(bar)` will set `foo` properties according to `bar`.
 * @param {Map<String, Function|Widget>} models,  the key => Function mapping.
 */
eYo.Widget.eyo_p.clonedDeclare = function (models) {
  this.init_ || (this.init_ = Object.create(null))
  var proto = this.C9r_.prototype
  Widget.keys(models).forEach(k => { // No `for (var k in models) {...}`, models may change during the loop
    eYo.parameterAssert(!this.props__.has(k))
    this.cloned_.add(k)
    var model = models[k]
    if (eYo.isF(model)) {
      var init = model
      model = {}
    } else {
      init = model.init
    }
    this.init_[k] = init
    var k_ = k + '_'
    var k__ = k + '__'
    Widget.defineProperties(proto, {
      [k__]: {value: eYo.keyHandler, writable: true},
      [k_]: {
        get() {
          return this[k__].clone
        },
        set (after) {
          var before = this[k__]
          if (!before) {
            if (!after) {
              return
            }
            var setter = () => {
              this[k__] = after.clone
            }
            var f = model.validate
            if (f && (after = f.validate(before, after)) === eYo.INVALID) {
              return
            }
            f = this[k + 'Validate']
            if (f && (after = f.validate(before, after)) === eYo.INVALID) {
              return
            }
            f = model.willChange
            if (!f || (f = f.call(this, before, after))) {
              var ff = this[k + 'WillChange']
              ff && ff.call(this, before, after)
              this.wrapUpdate && this.wrapUpdate(setter) || setter()
              if (after.owner_) {
                after.owner_[after.ownerKey_] = eYo.NA
              }
              after.ownerKey_ = k_
              after.owner_ = this
              f && f.call(this, before, after)
              f = model.didChange
              f && f.call(this, before, after)
              ff && ff.call(this, before, after)
              ff = this[k + 'DidChange']
              ff && ff.call(this, before, after)
              if (!!after && this.hasUI && after.initUI) {
                after.initUI()
              }
            }
          } else if (before.equals(after)) {
            return
          }
          var f = model.validate
          if (f && (after = f.validate(before, after)) === eYo.INVALID) {
            return
          }
          f = this[k + 'Validate']
          if (f && (after = f.validate(before, after)) === eYo.INVALID) {
            return
          }
          f = model.willChange
          if (!f || (f = f(before, after))) {
            var ff = this[k + 'WillChange']
            ff && ff.call(this, before, after)
            if (!after) {
              before.owner_ = before.ownerKey_ = eYo.NA
            }
            var setter = () => {
              this[k__].set(after)
            }
            if (!!after && !!after.ownerKey_) {
              after.owner_[after.ownerKey_] = eYo.NA
            }
            this.wrapUpdate && this.wrapUpdate(setter) || setter()
            if (typeof after === "object") {
              after.ownerKey_ = k_
              after.owner_ = this
            }
            f && f(before, after)
            f = model.didChange
            f && f(before, after)
            ff && ff.call(this, before, after)
            ff = this[k + 'DidChange']
            ff && ff.call(this, before, after)
            if (!!after && this.hasUI && after.initUI) {
              after.initUI()
            }
          }
        },
      },
    })
    this.descriptors__[k] = eYo.c9r.descriptorR(model.get || function () {
      return this[k_]
    })
  })
}

/**
 * Dispose in the given object, the properties given by their main name.
 * @param {Widget} object - the object that owns the property
 * @param {Array<string>} names -  a list of names
 */
eYo.Widget.eyo_p.clonedDispose_ = function (object) {
  this.clonedForEach(k => {
    var k__ = k + '__'
    var x = object[k__]
    if (x) {
      object[k__] = eYo.NA
      x.dispose()
    }
  })
}

/**
 * Make the dispose method.
 */
eYo.Widget.eyo_p.makeDispose = function () {
  this.super.makeDispose()
  let s = eYo.Widget.eyo_p.dispose
  eYo.Widget.eyo_p.dispose = function (...args) {
    this.disposeUI(...args)
    s.call(this, ...args)
  }
}


/**
 * Prepare the constructor and its prototype.
 */
eYo.Widget.eyo_p.prepareC9r = function () {
  this.makeInitUI()
  this.makeDisposeUI()
}

/**
 * Make the initUI method.
 */
eYo.Widget.eyo_p.makeInitUI = function () {
  var ui = this.model.ui
  let initUI = ui && ui.init
  let C9r_s = this.C9r_s
  let initUI_s = C9r_s && C9r_s.initUI
  if (initUI) {
    if (XRegExp.exec(initUI.toString(), eYo.xre.function_builtin)) {
      if (initUI_s) {
        var f = function (...args) {
          initUI.call(this, () => {
            initUI_s.call(this, ...args)
            this.ui_driver.doInitUI(this, ...args)
          }, ...args)
        }
      } else {
        f = function (...args) {
          initUI.call(this, () => {
            this.ui_driver.doInitUI(this, ...args)
          }, ...args)
        }
      }
    } else if (initUI_s) {
      f = function (...args) {
        initUI_s.call(this, ...args)
        this.ui_driver.doInitUI(this, ...args)
        initUI.apply(this, arguments)  
      }
    } else {
      f = function (...args) {
        this.ui_driver.doInitUI(this, ...args)
        initUI.apply(this, arguments)  
      }
    }
  } else if (initUI_s) {
    f = function (...args) {
      initUI_s.call(this, ...args)
      this.ui_driver.doInitUI(this, ...args)
    }
  } else {
    f = function (...args) {
      this.ui_driver.doInitUI(this, ...args)
    }
  }
  this.C9r_p.initUI = f
}

/**
 * Make the disposeUI method.
 */
eYo.Widget.eyo_p.makeDisposeUI = function () {
  var ui = this.model.ui
  let disposeUI = ui && ui.dispose
  let C9r_s = this.C9r_s
  let disposeUI_s = C9r_s && C9r_s.disposeUI
  if (disposeUI) {
    if (XRegExp.exec(disposeUI.toString(), eYo.xre.function_builtin)) {
      if (disposeUI_s) {
        var f = function (...args) {
          disposeUI.call(this, () => {
            disposeUI_s.call(this, ...args)              
            this.ui_driver.doDisposeUI(this, ...args)
          }, ...args)
        }
      } else {
        f = function (...args) {
          disposeUI.call(this, () => {
            this.ui_driver.doDisposeUI(this, ...args)
          }, ...args)
        }
      }
    } else if (disposeUI_s) {
      f = function (...args) {
        disposeUI_s.call(this, ...args)
        disposeUI.apply(this, arguments)
        this.ui_driver.doDisposeUI(this, ...args)
      }
    } else {
      f = function (...args) {
        disposeUI.apply(this, arguments)  
        this.ui_driver.doDisposeUI(this, ...args)
      }
    }
  } else if (disposeUI_s) {
    f = function (...args) {
      disposeUI_s.call(this, ...args)
      this.ui_driver.doDisposeUI(this, ...args)
    }
  } else {
    f = function (...args) {
      this.ui_driver.doDisposeUI(this, ...args)
    }
  }
  this.C9r_p.disposeUI = f
}
