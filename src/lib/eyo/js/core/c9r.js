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

eYo.require('t3')
eYo.require('xre')

eYo.forwardDeclare('o4t')
eYo.forwardDeclare('o3d')
eYo.forwardDeclare('Widget')
eYo.forwardDeclare('p6y')
eYo.forwardDeclare('c9r.model')

/**
 * Management of constructors and models.
 * Models are trees with some inheritancy.
 * @name {eYo.c9r}
 * @namespace
 */
eYo.makeNS('c9r')

// ANCHOR Top level constructor utilities
{
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
  !ns || ns === eYo.NULL_NS || eYo.isNS(ns) || eYo.throw(`Bad ns: ${ns}`)
  eYo.isStr(key) || eYo.throw(`Bad key: ${key}`)
  !Super || eYo.isF(Super) || eYo.throw(`Bad Super: ${Super}`)
  eYo.isO(model) || eYo.throw(`Bad model: ${model}`)
  if (Super) {
    // create the constructor
    // TODO: due to the makeInit method, this constructor may be badly designed.
    var C9r = function () {
      // Class
      var old = this.init
      this.init = eYo.do.nothing
      Super.apply(this, arguments)
      if (!this) {
        console.error('BREAK HERE!')
      }
      if (old !== eYo.do.nothing) {
        delete this.init
        old.apply(this, arguments)
      }
    }
    eYo.inherits(C9r, Super)
    eYo.assert(eYo.isSubclass(C9r, Super), 'MISSED inheritance)')
    // syntactic sugar shortcuts
    ns && ns !== eYo.NULL_NS && key.length && Object.defineProperties(ns._p, {
      [key]: { value: C9r},
      [key + '_p']: { value: C9r.prototype },
      [key + '_s']: { value: Super.prototype },
      [key + '_S']: { value: Super },
    })
  } else {
    // create the constructor
    var C9r = function () {
      // Class
      if (!this) {
        console.error('BREAK HERE!')
      }
      this.init.apply(this, arguments)
    }
    // store the constructor
    ns && ns !== eYo.NULL_NS && key.length && Object.defineProperties(ns._p, {
      [key]: { value: C9r},
      [key + '_p']: { value: C9r.prototype },
    })
  }
  let eyo = this.makeDlgt(ns, key, C9r, model)
  eYo.assert(eyo === C9r.eyo, 'MISSED')
  C9r.makeInheritedC9r = eyo.makeInheritedC9r.bind(eyo)
  var d = eYo.c9r.descriptorR(function () {
    return eyo
  })
  Object.defineProperties(C9r.prototype, {
    eyo: d,
    eyo_: d,
    eyo__: d,
  })
  return C9r
}

/**
 * This decorator turns `f` with signature
 * function (ns, key, Super, model) {...}
 * into
 * function ([ns], [key], [Super], [model]) {...}.
 * Both functions have `this` bound to a namespace.
 * @param{Function} f
 * @this{undefined}
 */
eYo.c9r._p.makeC9rDecorate = (f) => {
  return function (ns, key, Super, model) {
    // makeC9rDecorate
    if (ns && ns !== eYo.NULL_NS && !eYo.isNS(ns)) {
      model && eYo.throw(`Unexpected model: ${model}`)
      model = Super
      Super = key
      key = ns
      ns = eYo.NA
    }
    if (!eYo.isStr(key)) {
      model && eYo.throw(`Unexpected model: ${model}`)
      model = Super
      Super = key
      key = eYo.NA
    }
    eYo.isStr(key) || (key = Super && Super.eyo && Super.eyo.key)
    if (eYo.isSubclass(Super, eYo.C9r)) {
      // Super is OK
      key || (key = Super.eyo.key)
      model = eYo.called(model) || {}
    } else if (eYo.isF(Super)) {
      if (Super.eyo) {
        key || (key = Super.eyo.key)
        model = eYo.called(model) || {}
      } else {
        model && eYo.throw(`Unexpected model (4): ${model}`)
        model = eYo.called(Super) || {}
        Super = eYo.asF(key && this[key]) || this.Dflt
      }
    } else if (model) {
      model = eYo.called(model) || {}
    } else {
      model = Super || {}
      Super = eYo.asF(key && this[key]) || this.Dflt
    }
    ns || ns === eYo.NULL_NS || (ns = this)
    if (key || (key = Super && Super.eyo && Super.eyo.key)) {
      !eYo.isStr(key) && eYo.throw('`key` is not a string')
      if (key.startsWith('eyo:')) {
        key = key.substring(4)
      }
      eYo.isNS(ns)
      && (ns.hasOwnProperty(key) || ns._p.hasOwnProperty(key)) && eYo.throw(`${key} is already a property of ns: ${ns.name}`)
    }
    !model && eYo.throw('Unexpected void model')
    if (eYo.isNS(ns) && eYo.isSubclass(ns.Dflt, Super)) {
      Super = ns.Dflt
    }
    if (eYo.isSubclass(this.Dflt, Super)) {
      Super = this.Dflt
    }
    !eYo.isNS(ns) || !key && eYo.throw('Missing key')
    return f.call(this, ns, key, Super, model)
  }
}
/**
 * @name{eYo.makeC9r}
 * Make a constructor with an 'eyo__' property.
 * Caveat, constructors must have the same arguments.
 * Use a key->value design if you do not want that.
 * The `params` object has template: `{init: function, dispose: function}`.
 * Each namespace has its own `makeC9r` method which creates classes in itself.
 * @param {Object} [ns] -  The namespace, defaults to the Super's one or the caller.
 * @param {String} key -  The key.
 * @param {Function} [Super] -  The eventual super class. There is no default value. Must be a subclass of `eYo.C9r`, but not necessarily with an `eyo`.
 * @param {Object|Function} [model] -  The dictionary of parameters. Or a function to create such a dictionary. This might be overcomplicated.
 * @return {Function} the created constructor.
 */
eYo._p.makeC9r = eYo.c9r.makeC9rDecorate(eYo._p.doMakeC9r)
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
    if (old && old !== eYo.do.nothing) {
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
   * Function used when defining a JS property.
   */
  eYo.c9r.noGetter = function (msg) {
    return msg 
      ? function () {
        throw new Error(`Forbidden getter: ${msg}`)
      } : function () {
        throw new Error('Forbidden getter...')
      }
  }

  /**
   * Function used when defining a JS property.
   */
  eYo.c9r.noSetter = function (msg) {
    return msg
    ? function () {
      throw new Error(`Forbidden setter: ${msg}`)
    } : function () {
      throw new Error('Forbidden setter')
    }
  }

  /**
   * Function used when defining a JS property.
   */
  eYo.c9r.descriptorR = (msg, getter) => {
    if (!eYo.isStr(msg)) {
      getter && eYo.throw(`Unexpected getter: ${getter}`)
      getter = msg
      msg = eYo.NA
    }
    return {
      get: getter,
      set: eYo.c9r.noSetter(msg),
    }
  }

  /**
   * Function used when defining a JS property.
   */
  eYo.c9r.descriptorW = (msg, setter) => {
    if (!eYo.isStr(msg)) {
      setter && eYo.throw(`Unexpected setter: ${setter}`)
      setter = msg
      msg = eYo.NA
    }
    return {
      get: eYo.c9r.noGetter(msg),
      set: setter,
    }
  }

  /**
   * Function used when defining a JS property.
   */
  eYo.c9r.descriptorNORW = (msg) => {
    return {
      get: eYo.c9r.noGetter(msg),
      set: eYo.c9r.noSetter(msg),
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
  Object.defineProperty(eYo.c9r._p, 'types', eYo.c9r.descriptorR(function () {
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
  eYo.c9r.register = function (key, C9r) {
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
   * This is a root class, not to be subclassed except in singletons.
   * @param {Object} ns - Namespace
   * @param {String} key - a key...
   * @param {Function} C9r - the associate constructor
   * @param {Object} model - the model used for extension
   */
  let Dlgt = eYo.c9r.Dlgt = function (ns, key, C9r, model) {
    Object.defineProperties(this, {
      ns__: { value: eYo.isNS(ns) ? ns : eYo.NA },
      key__: {value: key},
      C9r__: { value: C9r },
      model__: { value: model },
    })  
    C9r.eyo__ = this
    let d = eYo.c9r.descriptorR(function () {
      return this.eyo__
    })
    Object.defineProperties(C9r, {
      eyo: d,
      eyo_: d,
      eyo_p: eYo.c9r.descriptorR(function () {
        return this.eyo__._p
      }),
    })
    this.init()
    this.handleModel(model)
    this.prepareC9r(C9r)
  }
  let _p = eYo.c9r.Dlgt_p = Dlgt.prototype
  // handling models is deferred to subclasses.
  /**
   * Initialize the delegate.
   */
  _p.init = eYo.do.nothing
  /**
   * @param {Object} model - a model used for extensions.
   */
  _p.handleModel = eYo.do.nothing
  /**
   * Prepare the constructor.
   */
  _p.prepareC9r = function () {
    this.makeInit()
    this.makeDispose()
  }
  /**
   * Make the init method of the associate contructor.
   */
  _p.makeInit = function () {
    let init_m = this.model.init
    let C9r_s = this.C9r_s
    let init_s = C9r_s && C9r_s.init
    let preInitInstance = this.preInitInstance.bind(this)
    let initInstance = this.initInstance.bind(this)
    if (init_m) {
      if (XRegExp.exec(init_m.toString(), eYo.xre.function_builtin)) {
        if (init_s) {
          var f = function (...args) {
            try {
              this.init = eYo.do.nothing
              init_m.call(this, () => {
                preInitInstance(this)
                init_s.call(this, ...args)              
                initInstance(this)
              }, ...args)
            } finally {
              delete this.dispose
            }
          }
        } else {
          f = function (...args) {
            try {
              this.init = eYo.do.nothing
              preInitInstance(this)
              init_m.call(this, () => {
                initInstance(this)
              }, ...args)
            } finally {
              delete this.dispose
            }
          }
        }
      } else if (init_s) {
        f = function (...args) {
          try {
            this.init = eYo.do.nothing
            preInitInstance(this)
            init_s.call(this, ...args)
            init_m.call(this, ...args)
            initInstance(this)
          } finally {
            delete this.dispose
          }
        }
      } else {
        f = function (...args) {
          try {
            this.init = eYo.do.nothing
            preInitInstance(this)
            init_m.call(this, ...args)
            initInstance(this)
          } finally {
            delete this.dispose
          }
        }
      }
    } else if (init_s) {
      f = function (...args) {
        try {
          this.init = eYo.do.nothing
          preInitInstance(this)
          init_s.call(this, ...args)
          initInstance(this) 
        } finally {
          delete this.dispose
        }
      }
    } else {
      f = function () {
        try {
          this.init = eYo.do.nothing
          preInitInstance(this)
          initInstance(this) 
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
    let dispose = this.model.dispose
    let C9r_s = this.C9r_s
    let dispose_s = C9r_s && C9r_s.dispose
    let disposeInstance = this.disposeInstance.bind(this)
    if (dispose) {
      if (XRegExp.exec(dispose.toString(), eYo.xre.function_builtin)) {
        if (dispose_s) {
          var f = function (...args) {
            try {
              this.dispose = eYo.do.nothing
              dispose.call(this, () => {
                disposeInstance(this)
                dispose_s.call(this, ...args)              
              }, ...args)
            } finally {
              delete this.init
            }
          }
        } else {
          f = function (...args) {
            try {
              this.dispose = eYo.do.nothing
              dispose.call(this, () => {
                disposeInstance(this)              
              }, ...args)
            } finally {
              delete this.init
            }
          }
        }
      } else if (dispose_s) {
        f = function (...args) {
          try {
            this.dispose = eYo.do.nothing
            dispose.call(this, ...args)
            disposeInstance(this)
            dispose_s.call(this, ...args)
          } finally {
            delete this.init
          }
        }
      } else {
        f = function (...args) {
          try {
            this.dispose = eYo.do.nothing
            dispose.call(this, ...args)
            disposeInstance(this)
          } finally {
            delete this.init
          }
        }
      }
    } else if (dispose_s) {
      f = function (...args) {
        try {
          this.dispose = eYo.do.nothing
          disposeInstance(this)
          dispose_s.call(this, ...args)
        } finally {
          delete this.init
        }
      }
    } else {
      f = function (...args) {
        try {
          this.dispose = eYo.do.nothing
          disposeInstance(this)
        } finally {
          delete this.init
        }
      }
    }
    this.C9r_p.dispose = f
  }
  /**
   * Initialize an instance with valued, cached, owned and copied properties.
   * Default implementation forwards to super.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.preInitInstance = eYo.do.nothing

  /**
   * Defined by subclassers.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.initInstance = eYo.do.nothing

  /**
   * Defined by subclassers.
   */
  _p.disposeInstance = eYo.do.nothing
  // convenient shortcut
  Object.defineProperties(_p, {
    _p: eYo.c9r.descriptorR(function () {
      return this.constructor.prototype
    }),
  })
  ;['ns', 'key', 'C9r', 'model'].forEach(k => {
    let d = eYo.c9r.descriptorR(function () {
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
      [k_]: eYo.c9r.descriptorNORW(k_),
      [k__]: eYo.c9r.descriptorNORW(k__),
    })
  })
  Object.defineProperties(_p, {
    C9r_p: eYo.c9r.descriptorR(function () {
      return this.C9r__.prototype
    }),
    C9r_S: eYo.c9r.descriptorR(function () {
      return this.C9r__.SuperC9r
    }),
    C9r_s: eYo.c9r.descriptorR(function () {
      return this.C9r__.SuperC9r_p
    }),
    name: eYo.c9r.descriptorR(function () {
      return this.ns__ && this.key && `${this.ns__.name}.${this.key}` || this.key
    }),
    super: eYo.c9r.descriptorR(function () {
      var S = this.C9r_S
      return S && S.eyo__
    }),
    super_p: eYo.c9r.descriptorR(function () {
      var s = this.super
      return s && s.constructor.prototype
    }),
    genealogy: eYo.c9r.descriptorR(function () {
      var s = this
      var ans = []
      do {
        ans.push(s.name)
      } while ((s = s.super))
      return ans
    }),
  })
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
   * @param{Function} f - the function to decorate.
   */
  _p.makeInheritedC9rDecorate = (f) => {
    return function (ns, key, model) {
      var Super = this.C9r
      if (ns && ns !== eYo.NULL_NS && !eYo.isNS(ns)) {
        model && eYo.throw(`Unexpected model (1): ${model}`)
        model = key
        key = ns
        ns = this.ns
      }
      if (!eYo.isStr(key)) {
        model && eYo.throw(`Unexpected model (2): ${model}`)
        model = key
        key = ns === eYo.NULL_NS ? '' : this.key
      }
      try {
        var ff = (this.ns||eYo.c9r).makeC9rDecorate(f)
        return ff.call(this.ns||eYo.c9r, ns, key, Super, model)
      } catch(e) {
        console.log(this.ns)
      }
    }
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
  let DlgtDlgt = function (ns, key, C9r, model) {
    Dlgt.call(this, ns, key, C9r, model)
  } // DlgtDlgt will never change and does not need to be suclassed
  eYo.inherits(DlgtDlgt, Dlgt)
  new DlgtDlgt(eYo.c9r, 'Dlgt', Dlgt, {})
  new DlgtDlgt(eYo.c9r, 'Dlgt…', DlgtDlgt, {})
}) ()

/**
 * Adds a delegate to the given constructor.
 * The delegate is a singleton.
 * @param {Object} [ns] - The namespace owning the constructor
 * @param {String} key - The key associate to the constructor.
 * @param {Function} C9r - the constructor associate to the delegate
 * @param {Object} model - the model object associate to the delegate, used for extension.
 */
eYo._p.makeDlgt = (ns, key, C9r, model) => {
  if (eYo.isStr(ns)) {
    model && eYo.throw(`Unexpected model (1): ${model}`)
    model = C9r
    C9r = key
    key = ns
    ns = eYo.NA
  } else {
    ns === eYo.NULL_NS || eYo.isNS(ns) || eYo.throw('Bad namespace')
  }
  !eYo.isStr(key) && eYo.throw(`Missing key string: ${key}`)
  !eYo.isF(C9r) && eYo.throw(`Unexpected C9r: ${C9r}`)
  eYo.isC9r(C9r) && eYo.throw(`Already a C9r: ${C9r}`)
  let SuperC9r = C9r.SuperC9r
  let SuperDlgt = SuperC9r && SuperC9r.eyo.constructor
  let Dlgt = SuperDlgt ? function (ns, key, C9r, model) {
    SuperDlgt.call(this, ns, key, C9r, model)
  } : eYo.c9r.Dlgt
  if (SuperDlgt) {
    eYo.inherits(Dlgt, SuperDlgt)
    ns === eYo.NULL_NS || eYo.isNS(ns) || (ns = SuperC9r.eyo.ns)
  }
  // initialization of the dlgt
  // when defined, init must be a self contained function.
  let init = model.dlgt
  if (eYo.isF(init)) {
    Dlgt.prototype.init = SuperDlgt ? function (...args) {
      this.init = eYo.do.nothing
      SuperDlgt.prototype.init.call(this, ...args)
      init.call(this, ...args)
    } : function () {
      this.init = eYo.do.nothing
      init.call(this, ...args)
    }
  }
  // in next function call, all the parameters are required
  // but some may be eYo.NA
  return new Dlgt(ns, key, C9r, model)
}

// ANCHOR Dflt
{
  /**
   * Convenient method to create the Dflt class.
   * @param {Object} [Super] - the ancestor class
   * @param {Object} [model] - the model
   */
  eYo.c9r._p.makeDflt = function (Super, model) {
    eYo.parameterAssert(!this.hasOwnProperty('Dflt'))
    if (!eYo.isF(Super) || !Super.eyo) {
      model && eYo.throw(`Unexpected model: ${model}`)
      model = eYo.called(Super) || {}
      Super = this.super && this.super.Dflt || eYo.NA
    }
    let ans = this.makeC9r(this, 'Dflt', Super, model || {})
    let s = this.parent
    if (s) {
      s[eYo.do.toTitleCase(this.key)] = ans
    }
    return ans
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
   * @name {eYo.c9r.Dflt}
   * @constructor
   */
  eYo.c9r.makeDflt()
}
