/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Utility to make a constructor with some edython specific data storage and methods.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('xre')

eYo.forwardDeclare('t3')
eYo.forwardDeclare('p6y')

eYo.model.allowModelPaths({
  [eYo.model.ROOT]: [
    'dlgt', 'init', 'deinit', 'dispose',
  ],
})

/**
 * Management of constructors and models.
 * Models are trees with some inheritancy.
 * @name {eYo.c9r}
 * @namespace
 */
eYo.model.makeNS(eYo,'c9r')

// ANCHOR Top level constructor utilities
{
  eYo.c9r._p.declareDlgt = function (_p) {
    let d = eYo.descriptorR(function () {
      return this.constructor.eyo__
    })
    Object.defineProperties(_p, {
      eyo: d,
      eyo_: d,
      eyo__: d,
    })
  }
/**
 * @name{eYo._p.doMakeC9r}
 * Make a constructor with an 'eyo__' property.
 * Caveat, constructors must have the same arguments.
 * Use a key->value design if you do not want that.
 * The `model` object has template: `{init: function, dispose: function}`.
 * Each namespace has its own `makeC9r` method which creates classes in itself.
 * This is not used directly, only decorated.
 * 
 * If a namespace is given and key is `foo`,
 * `foo_p` is the protocol,
 * `foo_S` is the super class, 
 * `foo_s` is the protocol of the super class, 
 * All the given parameters have their normal meaning.
 * @param {Object} ns -  The namespace.
 * @param {String} key -  The key.
 * @param {Function} Super -  The super class.
 * @param {Object|Function} model -  The dictionary of parameters.
 * @return {Function} the created constructor.
 */
eYo._p.doMakeC9r = function (ns, key, Super, model) {
  !ns || ns === eYo.NULL_NS || eYo.isNS(ns) || eYo.throw(`doMakeC9r/Bad ns: ${ns}`)
  !key || eYo.isStr(key) || eYo.throw(`doMakeC9r/Bad key: ${key}`)
  !Super || eYo.isC9r(Super) || eYo.throw(`doMakeC9r/Bad Super: ${Super}`)
  eYo.isD(model) || eYo.throw(`doMakeC9r/Bad model: ${model}`)
  if (Super) {
    // create the constructor
    // TODO: due to the makeInit method, this constructor may be badly designed.
    var C9r = function () {
      // Class
      var old = this.init
      this.init = eYo.doNothing
      Super.apply(this, arguments)
      if (!this) {
        console.error('BREAK HERE!')
      }
      if (old !== eYo.doNothing) {
        delete this.dispose
        old.apply(this, arguments)
      }
    }
    eYo.inherits(C9r, Super)
    Super.eyo.addSubC9r(C9r)
    eYo.assert(eYo.isSubclass(C9r, Super), 'MISSED inheritance)')
    // syntactic sugar shortcuts
    if (ns && key.length) {
      if (key && key.startsWith('eyo:')) {
        key = key.substring(4)
      }
      (ns.hasOwnProperty(key) || ns._p.hasOwnProperty(key)) && eYo.throw(`${key} is already a property of ns: ${ns.name}`)
      Object.defineProperties(ns._p, {
        [key]: { value: C9r},
        [key + '_p']: { value: C9r.prototype },
        [key + '_s']: { value: Super.prototype },
        [key + '_S']: { value: Super },
      })
    }
  } else {
    // create the constructor
    var C9r = function (...args) {
      // Class
      if (!this) {
        console.error('BREAK HERE! C9r')
      }
      this.init.call(this, ...args)
    }
    // store the constructor
    var _p = C9r.prototype
    if (ns && key.length) {
      if (key && key.startsWith('eyo:')) {
        key = key.substring(4)
      }
      (ns.hasOwnProperty(key) || ns._p.hasOwnProperty(key)) && eYo.throw(`${key} is already a property of ns: ${ns.name}`)
      Object.defineProperties(ns._p, {
        [key]: { value: C9r},
        [key + '_p']: { value: _p },
      })
    }
    eYo.c9r.declareDlgt(_p)
    _p.doPrepare = _p.doInit = eYo.doNothing
  }
  let eyo = this.makeDlgt(ns, key, C9r, model)
  eyo === C9r.eyo || eYo.throw('MISSED')
  C9r.makeInheritedC9r = eyo.makeInheritedC9r.bind(eyo)
  return C9r
}

/**
 * This decorator turns `f` with signature
 * function (ns, key, Super, model) {...}
 * into
 * function ([ns], [key], [Super], [model]) {...}.
 * Both functions have `this` bound to a namespace.
 * If argument `ns` is not provided, just replace it with the receiver.
 * @param{Function} f
 * @this{undefined}
 */
eYo.c9r._p.makeC9rDecorate = (f) => {
  return function (ns, key, Super, register, model) {
    // makeC9rDecorate
    if (ns !== eYo.NULL_NS && !eYo.isNS(ns)) {
      if(model) {
        console.error('BREAK HERE!!!')
      }
      model && eYo.throw(`Unexpected model(1): ${model}`)
      ;[ns, key, Super, register, model] = [this, ns, key, Super, register]
    }
    if (!eYo.isStr(key)) {
      model && eYo.throw(`Unexpected model (2): ${model}`)
      ;[key, Super, register, model] = [eYo.NA, key, Super, register]
    }
    if (Super && !eYo.isC9r(Super)) {
      model && eYo.throw(`Unexpected model (3): ${model}`)
      ;[Super, register, model] = [eYo.asF(key && this[key]) || this.Base, Super, register]
    }
    if (!eYo.isBool(register)) {
      model && eYo.throw(`Unexpected model (4): ${model}`)
      ;[register, model] = [false, register]
    }
    model = eYo.called(model) || {}
    if (eYo.isStr(key)) {
      eYo.isNA(Super) && (Super = eYo.asF(key && this[key]) || this.Base)
    } else {
      key = Super && Super.eyo && Super.eyo.key || ''
    }
    if (eYo.isSubclass(this.Base, Super)) {
      Super = this.Base
    }
    !eYo.isNS(ns) || !eYo.isStr(key) && eYo.throw('Missing key in makeC9rDecorate')
    let C9r = f.call(this, ns, key, Super, model)
    register && eYo.c9r.register(C9r)
    return C9r
  }
}
/**
 * @name{eYo.c9r.makeC9r}
 * Make a constructor with an 'eyo__' property.
 * Caveat, constructors must have the same arguments.
 * Use a key->value design if you do not want that.
 * The `params` object has template: `{init: function, dispose: function}`.
 * Each namespace has its own `makeC9r` method which creates classes in itself.
 * @param {Object} [ns] -  The namespace, defaults to the Super's one or the caller.
 * @param {String} key -  The key.
 * @param {Function} [Super] -  The eventual super class. There is no default value. Must be a subclass of `eYo.c9r.Base`, but not necessarily with an `eyo`.
 * @param {Object|Function} [model] -  The dictionary of parameters. Or a function to create such a dictionary. This might be overcomplicated.
 * @return {Function} the created constructor.
 */
eYo.c9r._p.makeC9r = eYo.c9r.makeC9rDecorate(function (ns, key, Super, model) {
  return this.doMakeC9r(ns, key, Super, model)
})
}
// ANCHOR Constructor utilities
{
  /**
   * Convenient way to append code to an already existing method.
   * This allows to define a method in different places.
   * @param {Object} object - Object
   * @param {String} key - Looking for or crating |Object[key]|
   * @param {Function} f - the function we will append
   */
  eYo.c9r.appendToMethod = (object, key, f) => {
    let old = object[key]
    if (old && old !== eYo.doNothing) {
      eYo.ParameterAsert(eYo.isF(old), `Expecting a function ${old}`)
      object[key] = function () {
        old.apply(this, arguments)
        f.apply(this, arguments)
      }
    } else {
      object[key] = f
    }
  }

  /**
   * All the created constructors, by name. Private storage.
   * @package
   */
  eYo.c9r.byName__ = Object.create(null)

  /**
   * All the created constructors, by key. Private storage.
   * @package
   */
  eYo.c9r.byKey__ = Object.create(null)

  /**
   * All the created constructors, by type. Private storage.
   * @package
   */
  eYo.c9r.byType__ = Object.create(null)

  /**
   * All the created delegates. Public accessor by key.
   * @param{String} key - the key used to create the constructor.
   */
  eYo.c9r.forKey = (key) => {
    return eYo.c9r.byKey__[key]
  }

  /**
   * All the created delegates. Public accessor by name.
   * @param{String} name - the name used to create the constructor.
   */
  eYo.c9r.forName = (name) => {
    return eYo.c9r.byName__[name]
  }

  /**
   * All the created delegates. Public accessor by type.
   * @param{String} type - the type used to create the constructor.
   */
  eYo.c9r.forType = (type) => {
    return eYo.c9r.byType__[type]
  }

  /**
   * @type{Array<String>}
   * @property{types}
   */
  Object.defineProperty(eYo.c9r._p, 'types', eYo.descriptorR(function () {
    return Object.keys(eYo.c9r.byType__)
  }))


  /**
   * Delegate registrator.
   * The constructor has an eyo attached object for
   * some kind of introspection.
   * Computes and caches the model
   * only once from the creation of the delegate.
   *
   * The last delegate registered for a given prototype name wins.
   * @param {!String} [type] - the optional type
   * @param {Object} C9r
   * @private
   */
  eYo.c9r._p.register = function (key, C9r) {
    if (!eYo.isStr(key)) {
      C9r && eYo.throw(`UNEXPECTED ${C9r}`)
      C9r = key
      key = C9r.eyo.key
    }
    var type
    if ((type = eYo.t3.expr[key])) {
      eYo.t3.expr.available.push(type)
    } else if ((type = eYo.t3.stmt[key])) {
      eYo.t3.stmt.available.push(type)
    }
    var eyo = C9r.eyo
    var key = eyo.key
    key && (eYo.c9r.byKey__[key] = C9r)
    var name = eyo.name
    name && (eYo.c9r.byName__[name] = C9r)
    if (type) {
      eYo.c9r.byType__[type] = C9r
      // cache all the input, output and statement data at the prototype level
    }
  }
}
// ANCHOR eYo._p.makeDlgt
(() => {
  /**
   * register a delegate of a constructor
   * @param {Object} eyo - the delegate
   * @param {Function} C9r - the associate constructor
   */
  eYo.c9r._p.registerDlgt = function (eyo, C9r) {
  }

  /**
   * This is a root class, not to be subclassed except in singletons.
   * @param {Object} ns - Namespace
   * @param {String} key - a key...
   * @param {Function} C9r - the associate constructor
   * @param {Object} model - the model used for extension
   */
  /* AutoDlgt is an unexposed constructor
    The problem of constructor delegation is te possibility of an infinite loop :
    object->constructor->eyo__->contructor->eyo__->constructor->eyo__...
  */
  let AutoDlgt = function (ns, key, C9r, model) {
    Object.defineProperties(this, {
      ns: { value: eYo.isNS(ns) ? ns : eYo.NA },
      key__: {value: key},
      C9r__: { value: C9r },
      model__: { value: model },
      subC9rs__: { value: new Set() },
    })
    C9r.eyo__ = this
    if (!C9r.eyo) { // true for subclasses of eYo.c9r.Dlgt
      var d = eYo.descriptorR(function () {
        return this.eyo__
      })
      Object.defineProperties(C9r, {
        eyo: d,
        eyo_: d,
        eyo_p: eYo.descriptorR(function () {
          return this.eyo__._p
        }),
      })
    }
  }
  let Dlgt = eYo.c9r._p.Dlgt = function (ns, key, C9r, model) {
    AutoDlgt.call(this, ns, key, C9r, model)
    if (!this.init) {
      console.error('BREAK HERE!')
    }
    this.init()
    /**
     * Extend the receiver and its associate constructor with the given model. It is called when the delegate is instantiated.
     * @param {Object} model - The model contains informations to extend the receiver's associate constructor.
     */
    if (Object.keys(model).length) {
      (ns||eYo.c9r).modelExpand((ns||eYo.c9r).modelPath(key), model)
      this.modelMerge(model)
    }
    this.makeInit()
    this.makeDispose()
  } // AutoDlgt will never change and does not need to be suclassed
  eYo.inherits(Dlgt, AutoDlgt)
  eYo.c9r.Dlgt_p = eYo.c9r.Dlgt.prototype
  let _p = AutoDlgt.prototype

  eYo.c9r.declareDlgt(_p)
  // handling models is deferred to subclasses.

  /**
   * Initialize the delegate.
   */
  _p.init = eYo.doNothing

  /**
   * Declare the given model for the associate constructor.
   * The default implementation just calls `methodsMerge`.
   * 
   * @param {Object} model - Object, like for |makeC9r|.
   */
  _p.modelMerge = function (model) {
    model.methods && this.methodsMerge(model.methods)
  }
  /**
   * Make the init method of the associate contructor.
   */
  _p.makeInit = function () {
    let init_m = this.model__.init
    let C9r_s = this.C9r_s
    let init_s = C9r_s && C9r_s.init
    if (init_m) {
      if (XRegExp.exec(init_m.toString(), eYo.xre.function_builtin)) {
        if (init_s) {
          var f = function (...args) {
            try {
              this.init = eYo.doNothing
              init_m.call(this, () => {
                this.doPrepare(...args)
                init_s.call(this, ...args)              
                this.doInit(...args)
              }, ...args)
            } finally {
              delete this.dispose
            }
          }
        } else {
          f = function (...args) {
            try {
              this.init = eYo.doNothing
              this.doPrepare(...args)
              init_m.call(this, () => {
                this.doInit(...args)
              }, ...args)
            } finally {
              delete this.dispose
            }
          }
        }
      } else if (init_s) {
        f = function (...args) {
          try {
            this.init = eYo.doNothing
            if (!this.doPrepare) {
              console.error('BREAK HERE!!! !this.doPrepare')
            }
            this.doPrepare(...args)
            init_s.call(this, ...args)
            init_m.call(this, ...args)
            this.doInit(this, ...args)
          } finally {
            delete this.dispose
          }
        }
      } else {
        f = function (...args) {
          try {
            this.init = eYo.doNothing
            this.doPrepare(...args)
            init_m.call(this, ...args)
            this.doInit(this, ...args)
          } finally {
            delete this.dispose
          }
        }
      }
    } else if (init_s) {
      f = function (...args) {
        try {
          this.init = eYo.doNothing
          if (!this.eyo) {
            console.error('BREAK HERE! NO EYO')
          }
          this.doPrepare(...args)
          init_s.call(this, ...args)
          this.doInit(...args) 
        } finally {
          delete this.dispose
        }
      }
    } else {
      f = function (...args) {
        try {
          this.init = eYo.doNothing
          if (!this.eyo) {
            console.error('BREAK HERE!')
          }
          this.doPrepare(...args)
          this.doInit(...args) 
        } finally {
          delete this.dispose
        }
      }
    }
    this.C9r_p.init = f
  }
  /**
   * Make the dispose method.
   */
  _p.makeDispose = function () {
    let dispose_m = this.model__.dispose
    let C9r_s = this.C9r_s
    let dispose_s = C9r_s && C9r_s.dispose
    if (dispose_m) {
      if (XRegExp.exec(dispose_m.toString(), eYo.xre.function_builtin)) {
        if (dispose_s) {
          var f = function (...args) {
            try {
              this.dispose = eYo.doNothing
              dispose_m.call(this, () => {
                this.eyo.disposeInstance(this, ...args)
                dispose_s.call(this, ...args)              
              }, ...args)
            } finally {
              delete this.init
            }
          }
        } else {
          f = function (...args) {
            try {
              this.dispose = eYo.doNothing
              dispose_m.call(this, () => {
                this.eyo.disposeInstance(this, ...args)              
              }, ...args)
            } finally {
              delete this.init
            }
          }
        }
      } else if (dispose_s) {
        f = function (...args) {
          try {
            this.dispose = eYo.doNothing
            dispose_m.call(this, ...args)
            this.eyo.disposeInstance(this, ...args)
            dispose_s.call(this, ...args)
          } finally {
            delete this.init
          }
        }
      } else {
        f = function (...args) {
          try {
            this.dispose = eYo.doNothing
            dispose_m.call(this, ...args)
            this.eyo.disposeInstance(this, ...args)
          } finally {
            delete this.init
          }
        }
      }
    } else if (dispose_s) {
      f = function (...args) {
        try {
          this.dispose = eYo.doNothing
          this.eyo.disposeInstance(this, ...args)
          dispose_s.call(this, ...args)
        } finally {
          delete this.init
        }
      }
    } else {
      f = function (...args) {
        try {
          this.dispose = eYo.doNothing
          this.eyo.disposeInstance(this, ...args)
        } finally {
          delete this.init
        }
      }
    }
    this.C9r_p.dispose = f
  }
  /**
   * Prepare an instance.
   * Default implementation does nothing.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.prepareInstance = eYo.doNothing

  /**
   * Defined by subclassers.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.initInstance = eYo.doNothing

  /**
   * Defined by subclassers.
   */
  _p.disposeInstance = eYo.doNothing

  // convenient shortcut
  Object.defineProperties(_p, {
    _p: eYo.descriptorR(function () {
      return this.constructor.prototype
    }),
  })
  ;['ns', 'key', 'C9r', 'model'].forEach(k => {
    let d = eYo.descriptorR(function () {
      return this[k + '__']
    })
    Object.defineProperties(_p, {
      [k]: d,
      [k + '_']: d,
    })
  })
  ;['name', 'super', 'genealogy'].forEach(k => {
    let k_ = k + '_'
    let k__ = k + '__'
    Object.defineProperties(_p, {
      [k_]: eYo.descriptorNORW(k_),
      [k__]: eYo.descriptorNORW(k__),
    })
  })
  Object.defineProperties(_p, {
    C9r_p: eYo.descriptorR(function () {
      return this.C9r__.prototype
    }),
    C9r_S: eYo.descriptorR(function () {
      return this.C9r__.SuperC9r
    }),
    C9r_s: eYo.descriptorR(function () {
      return this.C9r__.SuperC9r_p
    }),
    name: eYo.descriptorR(function () {
      return this.ns && this.key__ && `${this.ns.name}.${this.key__}` || this.key
    }),
    super: eYo.descriptorR(function () {
      var S = this.C9r__.SuperC9r
      return S && S.eyo__
    }),
    super_p: eYo.descriptorR(function () {
      var s = this.super
      return s && s.constructor.prototype
    }),
    genealogy: eYo.descriptorR(function () {
      var s = this
      var ans = []
      do {
        ans.push(s.name)
      } while ((s = s.super))
      return ans
    }),
  })

  /**
   * Add a subclass
   * @param {Function} C9r - constructor
   */
  _p.addSubC9r = function (C9r) {
    eYo.isSubclass(C9r, this.C9r) || eYo.throw(`${C9r.eyo.name} is not a subclass of ${this.name}`)
    if (!this.subC9rs__) {
      console.error('BREAK!!! !this.subC9rs__')
    }
    this.subC9rs__.add(C9r)
  }
  
  /**
   * Iterator
   * @param {Function} helper
   * @param {Boolean} deep - Propagates when true.
   */
  _p.forEachSubC9r = function (f, deep) {
    if (eYo.isF(deep)) {
      [f, deep] = [deep, f]
    }
    this.subC9rs__.forEach(C9r => {
      f(C9r)
      deep && C9r.eyo.forEachSubC9r(f, deep)
    })
  }
  
  /**
   * Iterator
   * @param {Function} helper
   */
  _p.someSubC9r = function (f) {
    return this.subC9rs__.someEach(c9r => f(C9r))
  }
  
  // create the delegates
  Dlgt.eyo__ = new AutoDlgt(eYo.c9r, 'Dlgt', Dlgt, {})
  AutoDlgt.eyo__ = new AutoDlgt(eYo.c9r, 'Dlgt…', AutoDlgt, {})

  /**
   * This decorator turns f with signature
   * function (ns, key, Super, model) {}
   * into
   * function ([ns], [key], [model]) {}.
   * After decoration, a call to the resulting function is equivalent to a makeC9r,
   * the Super being the receiver's C9r.
   * Both functions belong to the namespace context,
   * id est `this` is a namespace.
   * This decorator and the decorated function have a namespace as `this` object.
   * @param{Function} f - the Dlgt constructor maker to decorate.
   */
  _p.makeInheritedC9rDecorate = (f) => {
    return function (ns, key, register, model) {
      var Super = this.C9r
      if (ns && !eYo.isNS(ns)) {
        model && eYo.throw(`Unexpected model (1): ${model}`)
        model = register
        register = key
        key = ns
        ns = this.ns
      }
      if (!eYo.isStr(key)) {
        model && eYo.throw(`Unexpected model (2): ${model}`)
        model = register
        register = key
        key = ns ? this.key : ''
      }
      var ff = (this.ns||eYo.c9r).makeC9rDecorate(f)
      return ff.call(this.ns||eYo.c9r, ns, key, Super, register, model)
    }
  }

  /**
   * Declare methods.
   * Allows to split the definition of methods into different files,
   * eventually.
   * If the method is a function with exactly one argument named 'overriden',
   * then we override the previously defined method.
   * The model object is a function decorator.
   * @param{Map<String, Function>} model - the model
   */
  _p.methodsMerge = function (model) {
    let _p = this.C9r_p
    Object.keys(model).forEach(k => {
      let m = model[k]
      eYo.isF(m) || eYo.throw(`Function expected: ${m}`)
      if (m.length === 1 && _p[k] && XRegExp.exec(m.toString(), eYo.xre.function_overriden)) {
        _p[k] = eYo.asF(m.call(this, eYo.toF(_p[k]).bind(this)))
      } else {
        _p[k] = m
      }
    })
  }

  /**
   * Convenient shortcut to create subclasses.
   * Forwards to the namespace which must exist!
   * @param {Object} [ns] -  The namespace, possibly `eYo.NA`.
   * @param {String} key -  to create `ns[key]`
   * @param {Object} [model] -  Model object
   * @return {?Function} the constructor created or `eYo.NA` when the receiver has no namespace.
   * @this {eYo.c9r.Dlgt}
   */
  _p.makeInheritedC9r = _p.makeInheritedC9rDecorate(function (ns, key, Super, model) {
    return this.doMakeC9r(ns, key, Super, model)
  })
}) ()

/**
 * Adds a delegate to the given constructor.
 * The delegate is a singleton.
 * @param {Object} [ns] - The namespace owning the constructor
 * @param {String} key - The key associate to the constructor.
 * @param {Function} C9r - the constructor associate to the delegate
 * @param {Object} model - the model object associate to the delegate, used for extension.
 */
eYo.c9r._p.makeDlgt = function (ns, key, C9r, model) {
  if (eYo.isStr(ns)) {
    model && eYo.throw(`Unexpected model (1): ${model}`)
    ;[ns, key, C9r, model] = [eYo.NA, ns, key, C9r]
  } else {
    ns === eYo.NULL_NS || eYo.isNS(ns) || eYo.throw('Bad namespace')
  }
  !key || eYo.isStr(key) || eYo.throw(`Missing key string: ${key} in makeDlgt`)
  !eYo.isF(C9r) && eYo.throw(`Unexpected C9r: ${C9r} in makeDlgt`)
  eYo.isC9r(C9r) && eYo.throw(`Already a C9r: ${C9r} in makeDlgt`)
  let SuperC9r = C9r.SuperC9r
  let SuperDlgt = SuperC9r && SuperC9r.eyo && SuperC9r.eyo.constructor
  var better = this.Dlgt
  if ((better || (better = this.Dlgt_p && this.Dlgt_p.constructor)) && eYo.isSubclass(better, SuperDlgt)) {
    SuperDlgt = better
  }
  let Dlgt = SuperDlgt ? function (ns, key, C9r, model) {
    SuperDlgt.call(this, ns, key, C9r, model)
  } : eYo.c9r.Dlgt
  if (SuperDlgt) {
    eYo.inherits(Dlgt, SuperDlgt)
    ns === eYo.NULL_NS || eYo.isNS(ns) || (ns = SuperC9r.eyo.ns)
  }
  // initialization of the dlgt
  // when defined, init must be a self contained function.
  let dlgt_m = model.dlgt
  if (eYo.isF(dlgt_m)) {
    Dlgt.prototype.init = SuperDlgt
    ? function (...args) {
      this.init = eYo.doNothing
      SuperDlgt.prototype.init.call(this, ...args)
      dlgt_m.call(this, ...args)
    } : function (...args) {
      this.init = eYo.doNothing
      dlgt_m.call(this, ...args)
    }
  }
  // in next function call, all the parameters are required
  // but some may be eYo.NA
  Dlgt.eyo__ = new eYo.c9r.Dlgt.eyo__.constructor(ns, 'Dlgt', Dlgt, {})
  return new Dlgt(ns, key, C9r, model)
}

// make the Dlgt for the namespaces too
eYo._p.eyo = eYo.c9r.makeDlgt('NS', eYo.constructor, {})

// ANCHOR Base
{
  /**
   * Convenient method to create the Base class.
   * @param {Object} [Super] - the ancestor class
   * @param {Object} [model] - the model
   */
  eYo.c9r._p.makeBase = function (Super, model) {
    this.hasOwnProperty('Base') && eYo.throw(`${this.name}: Already Base`)
    if (!eYo.isF(Super) || !Super.eyo) {
      model && eYo.throw(`Unexpected model: ${model}`)
      model = eYo.called(Super) || {}
      Super = this.super && this.super.Base || eYo.NA
    }
    let C9r = this.makeC9r(this, 'Base', Super, model || {})
    let s = this.parent
    if (s && this.key) {
      s[eYo.do.toTitleCase(this.key)] = C9r
    }
    this.Dlgt_p = C9r.eyo_p
    return C9r
  }
  
  /**
   * Basic object constructor.
   * Each constructor has an eyo property, a delegate, which points to a singleton instance. If a class inherits from an ancestor, then the delegate class also inherits from the class of the ancestor's delegate.
   * The default class.
   * @name {eYo.C9r}
   * @constructor
   */
  /**
   * The default class.
   * @name {eYo.c9r.Base}
   * @constructor
   */
  eYo.c9r.makeBase()

  /**
   * Prepare an instance.
   * Default implementation forwards to the delegate.
   * One shot method: any subsequent call is useless.
   */
  eYo.c9r.Base_p.doPrepare = function (...args) {
    this.doPrepare = eYo.doNothing
    this.eyo.prepareInstance(this, ...args)
  }
  
  /**
   * Prepare an instance.
   * Default implementation does nothing.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  eYo.c9r.Base_p.doInit = function (...args) {
    this.doInit = eYo.doNothing
    this.eyo.initInstance(this, ...args)
  }
  /**
   * Convenience shortcut to the model
   */
  Object.defineProperties(eYo.c9r.Base_p, {
    model: eYo.descriptorR(function () {
      return this.eyo.model
    }),
    ns: eYo.descriptorR(function () {
      return this.eyo.ns
    })
  })
}

// ANCHOR model
{
  /**
   * The created model, by key.
   * @param{String} key - the key used to create the constructor.
   */
  eYo.model.forKey = (key) => {
    var C9r = eYo.c9r.byKey__[key]
    return C9r && C9r.eyo.model
  }

  /**
   * The created model, by name.
   * @param{String} name - the key used to create the constructor.
   */
  eYo.model.forName = (name) => {
    var C9r = eYo.c9r.byName(name)
    return C9r && C9r.eyo.model
  }

  /**
   * The created models given its type.
   * @param{String} type - the key used to create the constructor.
   */
  eYo.model.forType = (type) => {
    var C9r = eYo.c9r.byType__[type]
    return C9r && C9r.eyo.model
  }
}

/**
 * Convenient method
 */
eYo.c9r.Base_p.pureAbstract = () => {
  eYo.throw(`Missing implementation of a pure abstract method`)
}

/**
 * The model path.
 * @see The `new` method.
 * @param {String} key
 */
eYo.c9r._p.modelPath = function (key) {
  return ''
}

/**
 * The model Base used to derive a new class.
 * @see The `new` method.
 * @param {Object} model
 */
eYo.c9r._p.modelBase = function (model) {
  return this.Base
}

/**
 * Create a new Base instance based on the model
 * No need to subclass. Override `Base`, `modelPath` and `modelHandle`.
 * @param {Object} owner
 * @param {String} key
 * @param {Object} model
 */
eYo.c9r._p.modelMakeC9r = function (key, model) {
  this.modelExpand(this.modelPath(key), model)
  model._starters = []
  let C9r = model.C9r = this.makeC9r('', this.modelBase(model), model)
  this.modelHandle(C9r.prototype, key, model)
  Object.defineProperty(C9r.eyo, 'name', eYo.descriptorR(function () {
    return `${C9r.eyo.super.name}(${key})`
  }))
  return C9r
}

/**
 * Create a new Base instance based on the model
 * No need to subclass. Override `Base`, `modelPath` and `modelHandle`.
 * @param {Object} owner
 * @param {String} key
 * @param {Object} model
 */
eYo.c9r._p.new = function (owner, key, model) {
  if (!model) {
    return new this.Base(owner, key)
  }
  let C9r = model.C9r || this.modelMakeC9r(key, model)
  let ans = new C9r(owner, key)
  model._starters.forEach(f => f(ans))
  return ans
}

/**
 * For subclassers.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.c9r._p.modelHandle = function (_p, key, model) {
}

/**
 * Get the inherited method with the given name.
 * @param {String} methodName
 * @param {Boolean} up - starts with the prototype or the inherited prototype
 * @return {Function} It never returns `this[methodName]`.
 */
eYo.c9r.Base_p.inheritedMethod = eYo.c9r.Dlgt_p.inheritedMethod = function (methodName, up) {
  let method = this[methodName]
  var _p = up ? this.eyo.C9r_s : this.eyo.C9r_p
  while (_p) {
    if (_p.hasOwnProperty(methodName)) {
      var ans = _p[methodName]
      if (eYo.isF(ans)) {
        if (ans !== method) {
          return ans
        }
      } else {
        break
      }
    }
    _p = _p.eyo.C9r_s
  }
  return eYo.doNothing
}

// ANCHOR Initers, Disposers
/**
 * This namespace method populates the namespace's base delegate
 * with some methods to manage a data model with many possible attributes.
 * 
 * @param{String} key - Key is one of 'p6y', 'data', 'field', 'slots'
 * @param{String} path - Path, the separator is '.'
 * @param{String} manyModel - Object
 */
eYo.c9r._p.enhancedMany = function (key, path, manyModel) {
  this._p.hasOwnProperty('Base') || eYo.throw(`Missing Base for ${this.name}`)
  let _p = this.Dlgt_p
  /* fooModelByKey__ is a key -> model object with no prototype.
   * Void at startup.
   * Populated with the `...Merge` method.
   * Local to the delegate instance.
   */
  let kModelByKey__ = key + 'ModelByKey__' // local to the instance
  /* fooModelMap_ is a key -> model map.
   * It is computed from the fooModelByKey__ of the delegates and its super's.
   * Cached.
   */
  let kModelMap_  = key + 'ModelMap_' // cached with inherited
  /* fooModelMap is a key -> model map.
   * Computed property that uses the cache above.
   * If the cache does not exist, reads super's fooModelMap
   * and adds the local fooModelByKey__.
   * Then caches the result in fooModelMap_.
   */
  let kModelMap   = key + 'ModelMap' // computed property
  let kMap        = key + 'Map' // property defined on instances
  let kPrepare    = key + 'Prepare'
  let kMerge      = key + 'Merge'
  let kInit       = key + 'Init'
  let kDispose    = key + 'Dispose'
  // let kForEach    = key + 'ForEach'
  // let kSome       = key + 'Some'
  let kHead       = key + 'Head'
  let kTail       = key + 'Tail'

  this[kPrepare] || eYo.throw(`Missing ${kPrepare} method to ${this.name}`)

  /**
   * Expands the property, data, fields, slots section into the receiver's corresponding model.
   * Usage: For the model `{foo: bar}`, run `C9r.eyo.fooMerge(bar)`
   * @param{Object} source - A model object.
   */
  _p[kMerge] = function (source) {
    delete this[kModelMap_] // delete the cache
    this.forEachSubC9r(C9r => C9r.eyo[kMerge]({})) // delete the cache of descendants
    ;(this.ns || eYo.c9r).modelExpand(source, path)
    let map = this[kModelByKey__] || (this[kModelByKey__] = new Map())
    for (let k in source) {
      map.set(k, source[k])
    }
  }
  Object.defineProperties(_p, {
    [kModelMap]: eYo.descriptorR(function () {
      let modelMap = this[kModelMap_] = new Map()
      let superMap = this.super && this.super[kModelMap]
      let map = superMap ? new Map(superMap) : new Map()
      for (let [k, v] of this[kModelByKey__].entries()) {
        map.set(k, v)
      }
      let todo = map.keys()
      let done = []
      let again = []
      var more = false
      var k
      while (true) {
        if ((k = todo.pop())) {
          let model = map.get(k)
          if (model.after) {
            if (eYo.isStr(model.after)) {
              if (!done.includes(model.after) && todo.includes(model.after)) {
                again.push(k)
                continue
              }
            } else if (model.after.some(k => (!done.includes(k) && todo.includes(k)))) {
              again.push(k)
              continue
            }
          }
          modelMap.set(k, model)
          done.push(k)
          more = true
        } else if (more) {
          [more, todo] = [false, again]
          again.length = 0
        } else {
          again.length && eYo.throw(`Cycling/Missing properties in ${object.eyo.name}: ${again}`)
          break
        }
      }
      Object.defineProperties(this, {
        [kModelMap]: eYo.descriptorR(function () {
          return this[kModelMap_]
        }, true)
      })
      return this[kModelMap_]
    }),
  })
  /**
   * The maker is responsible of making new `key` objects from a model.
   */
  let maker = manyModel.maker || function (object, k, model) {
    return eYo[key].new(object, k, model)
  }
  /**
   * Prepares the *key* properties of the given object.
   * This message is sent to prepare the object,
   * which is an instance of the receiver's associate constructor.
   * If we create an instance, the model is not expected to change afterwards.
   * The delegate is now complete and the merge methods
   * should not be called afterwards.
   * 
   * If the super also has a `*key*Prepare` method,
   * it must not be called because there can be a conflict,
   * two attributes may be asigned to the same key.
   * 
   * @param{*} object - An instance being created.
   * @param{*} model - Must be falsy once an instance has already been created.
   */
  _p[kPrepare] = manyModel.prepare || function (object, model) {
    if (model) {
      // merge the given model with the existing one
      this[kMerge](model)
      this[kMerge] = function () {
        eYo.throw(`Do not change the model of ${this.name} once an instance has been created`)
      }
      var super_dlgt = this
      while ((super_dlgt = super_dlgt.super)) {
        super_dlgt.hasOwnProperty(kMerge) || (super_dlgt[kMerge] = this[kMerge])
      }
    }
    let attributes = []
    let map = object[kMap] = new Map()
    for (let [k, model] of this[kModelMap]) {
      let attr = maker(object, k, model)
      if (attr) {
        map.set(k, attr)
        attributes.push(attr)
      }
    }
    var attr = object[kHead] = attributes.shift()
    attributes.forEach(a => {
      try {
        attr.next = a
        a.previous = attr
        attr = a
      } catch(e) {
        console.error(e)
        console.error('BREAK HERE, it is no a property')
        attr.next = a
      }
    })
    object[kTail] = attributes.pop() || object[kHead]
  }
  /**
   * 
   */
  _p[kInit] = manyModel.init || function (object, ...$) {
    this[key + 'ForEach'](object, x => {
      let init = x && object[x.key + eYo.do.toTitleCase(key) + 'Init']
      init && init.call(object, x, ...$)
    })
  }
  _p[kDispose] = manyModel.dispose || function(object, ...$) {
    this[key + 'ForEach'](object, x => {
      if (x) {
        let dispose = object[x.key + eYo.do.toTitleCase(key) + 'Dispose']
        dispose && dispose.call(object, x, ...$)
        x.dispose(...$)
      }
    })
    object.bindField = object[key+'Head'] = object[key+'Tail'] = object[key+'ByKey'] = eYo.NA
  }
}

// ANCHOR Iterators
/**
 * @param{String} k - Key
 */
eYo.c9r._p.enhancedIterate = function (key) {
  let _p = this.Dlgt_p
  _p[key + 'ForEach'] = function (object, $this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    let byKey = object[key+'ByKey']
    byKey && Object.values(byKey).forEach(v => f.call($this, v))
  }
  _p[key + 'Some'] = function (object, $this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    let byKey = object[key+'ByKey']
    return byKey && Object.values(byKey).some(v => f.call($this, v))
  }
}

/**
 * @param{String} type - One of 'property', 'data'
 * @param{Boolean} thisIsOwner - whether `this` in the model, is the owner or the local object
 */
eYo.c9r._p.enhanceO3dValidate = function (_p, type, thisIsOwner) {
  if (eYo.isStr(_p)) {
    eYo.isDef(thisIsOwner) && eYo.throw(`Unexpected owner: ${thisIsOwner}`)
    ;[_p, type, thisIsOwner] = [this.Base_p, _p, type]
    this._p.hasOwnProperty('Base') || eYo.throw(`Missing own Base to ${this.name}`)
  }
  /**
   * Fallback to validate the value of the attribute;
   * Default implementation forwards to an eventual `fooValidate` method
   * of the owner, where `foo` should be replaced by the key of the receiver.
   * Validation chain of the attribute 'foo' of type 'bar': normal flow
   * 1) the model's validate method if any
   * 2) the owner's `barValidate` if any
   * 3) the owner's `fooBarValidate` if any
   * Notice that the `barValidate` is shared by all attributes of the same type.
   * When in builtin flow, only the the model's validate method is called.
   * The `barValidate` and `fooBarValidate` are passed to the model's validate as formal parameter named `builtin`.
   * @param {Object} before
   * @param {Object} after
   */
  _p.validate = function (before, after) {
    var ans = after
    if (this.owner && eYo.isVALID(ans)) {
      var f_o = this.owner[type + 'Validate']
      if (eYo.isF(f_o) && !eYo.isVALID(ans = f_o.call(this.owner, before, ans))) {
        return ans
      }
      if (this.key) {
        f_o = this.owner[this.key + eYo.do.toTitleCase(type) + 'Validate']
        if (eYo.isF(f_o) && !eYo.isVALID(ans = f_o.call(this.owner, before, ans))) {
          return ans
        }
      }
    }
    return ans
  }
  /**
   * @param{*} before
   * @param{*} after
   */
  this._p.modelHandleValidate = thisIsOwner
  ? function(_p, key, model) {
    let validate_m = model.validate
    let validate_s = _p.eyo.C9r_s.validate
    if (eYo.isF(validate_m)) {
      if (validate_m.length > 2) {
        // builtin/before/after
        _p.validate = function (before, after) {
          return validate_m.call(this.owner, (before, after) => {
            return validate_s.call(this, before, after)
          }, before, after)
        }
      } else if (XRegExp.exec(validate_m.toString(), eYo.xre.function_builtin)) {
        _p.validate = function (before, after) {
          return validate_m.call(this.owner, (after) => {
            return validate_s.call(this, before, after)
          }, after)
        }
      } else {
        _p.validate = validate_m.length > 1
        ? function (before, after) {
          return validate_m.call(this.owner, before, after)
        } : function (before, after) {
          return validate_m.call(this.owner, after)
        }
      }
    } else {
      validate_m && eYo.throw(`Unexpected model (${_p.eyo.name}/${key}) value validate -> ${validate_m}`)
    }
  } : function(_p, key, model) {
    let validate_m = model.validate
    let validate_s = _p.eyo.C9r_s.validate
    if (eYo.isF(validate_m)) {
      if (validate_m.length > 2) {
        // builtin/before/after
        _p.validate = eYo.decorate.reentrant('validate', function (before, after) {
          return validate_m.call(this, (before, after) => {
            return validate_s.call(this, before, after)
          }, before, after)
        })
      } else if (XRegExp.exec(validate_m.toString(), eYo.xre.function_builtin)) {
        _p.validate = eYo.decorate.reentrant('validate', function (before, after) {
          return validate_m.call(this, (after) => {
            return validate_s.call(this, before, after)
          }, after)
        })
      } else {
        _p.validate = validate_m.length > 1
        ? function (before, after) {
          try {
            this.validate = validate_s
            return validate_m.call(this, before, after)
          } finally {
            delete this.validate
          }
        } : function (before, after) {
          try {
            this.validate = function (after) {
              return validate_s.call(this, before, after)
            }
            return validate_m.call(this, after)
          } finally {
            delete this.validate
          }
        }
      }
    } else {
      validate_m && eYo.throw(`Unexpected model (${_p.eyo.name}/${key}) value validate -> ${validate_m}`)
    }
  }
}

