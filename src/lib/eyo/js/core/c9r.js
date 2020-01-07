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

eYo.forwardDeclare('C9r.Prop')
eYo.forwardDeclare('C9r.Model')
eYo.forwardDeclare('C9r.Dlgt')

/**
 * Management of constructors and models.
 * Models are trees with some inheritancy.
 * @name {eYo.C9r}
 * @namespace
 */
eYo.makeNS('C9r')

/**
 * Convenient way to append code to an already existing method.
 * This allows to define a method in different places.
 * @param {Object} object - Object
 * @param {String} key - Looking for or crating |Object[key]|
 * @param {Function} f - the function we will append
 */
eYo.C9r.appendToMethod = (object, key, f) => {
  let old = object[key]
  if (old && old !== eYo.Do.nothing) {
    eYo.parameterAsert(eYo.isF(old), `Expecting a function ${old}`)
    object[key] = function () {
      old.apply(this, arguments)
      f.apply(this, arguments)
    }
  } else {
    object[key] = f
  }
}

{
  /**
   * Function frequently used.
   */
  let noGetter = function (msg) {
    return msg 
      ? function () {
        throw new Error(`Forbidden getter: ${msg}`)
      } : function () {
        throw new Error('Forbidden getter...')
      }
  }

  /**
   * function frequently used.
   */
  let noSetter = function (msg) {
    return msg
    ? function () {
      throw new Error(`Forbidden setter: ${msg}`)
    } : function () {
      throw new Error('Forbidden setter')
    }
  }

  /**
   * function frequently used.
   */
  eYo.C9r.descriptorR = (msg, getter) => {
    if (!eYo.isStr(msg)) {
      eYo.parameterAssert(!getter, `Unexpected getter: ${getter}`)
      getter = msg
      msg = eYo.NA
    }
    return {
      get: getter,
      set: noSetter(msg),
    }
  }

  /**
   * function frequently used.
   */
  eYo.C9r.descriptorW = (msg, setter) => {
    if (!eYo.isStr(msg)) {
      eYo.parameterAssert(!setter, `Unexpected setter: ${setter}`)
      setter = msg
      msg = eYo.NA
    }
    return {
      get: noGetter(msg),
      set: setter,
    }
  }

  /**
   * function frequently used.
   */
  eYo.C9r.descriptorNORW = (msg) => {
    return {
      get: noGetter(msg),
      set: noSetter(msg),
    }
  }
}


/**
 * All the created delegates.
 * @package
 */
eYo.C9r.byName__ = Object.create(null)

/**
 * All the created delegates.
 * @package
 */
eYo.C9r.byKey__ = Object.create(null)

/**
 * All the created delegates.
 * @package
 */
eYo.C9r.byType__ = Object.create(null)

/**
 * All the created delegates.
 * @param{String} key - the key used to create the constructor.
 */
eYo.C9r.forKey = (key) => {
  return eYo.C9r.byKey__[key]
}

/**
 * All the created delegates.
 * @param{String} name - the name used to create the constructor.
 */
eYo.C9r.forName = (name) => {
  return eYo.C9r.byName__[name]
}

/**
 * All the created delegates.
 * @param{String} type - the type used to create the constructor.
 */
eYo.C9r.forType = (type) => {
  return eYo.C9r.byType__[type]
}

Object.defineProperty(eYo.C9r._p, 'types', eYo.descriptorR(function () {
  return Object.keys(eYo.C9r.byType__)
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
eYo.C9r.register = function (key, C9r) {
  if (!eYo.isStr(key)) {
  eYo.parameterAssert(!C9r, `UNEXPECTED ${C9r}`)
    C9r = key
    key = C9r.eyo.key
  }
  var type
  if ((type = eYo.T3.Expr[key])) {
    eYo.T3.Expr.Available.push(type)
  } else if ((type = eYo.T3.Stmt[key])) {
    eYo.T3.Stmt.Available.push(type)
  }
  var eyo = C9r.eyo
  var key = eyo.key
  key && (eYo.C9r.byKey__[key] = C9r)
  var name = eyo.name
  name && (eYo.C9r.byName__[name] = C9r)
  if (type) {
    eYo.C9r.byType__[type] = C9r
    // cache all the input, output and statement data at the prototype level
    eyo.types.push(type)
  }
}


/**
 * @name {eYo.Dlgt}
 * @constructor
 * Object adding data to a constructor in a safe way.
 * @param {Object} [ns] -  namespace of the constructor. Subclass of `eYo`'s constructor.
 * @param {String} [key] -  the key used when the constructor was created.
 * @param {Object} C9r -  the object to which this instance is attached.
 * @param {Object} [model] -  the model used to create the constructor.
 * @readonly
 * @property {!Function} C9r - The associate constructor.
 * @property {?Object} ns - The namespace of the associate constructor, if any.
 * @property {!String} name - The name of the associate constructor.
 * @property {Set<String>} valued__ - Set of value identifiers. Lazy initializer.
 * @readonly
 * @property {Set<String>} owned__ - Set of owned identifiers. Lazy initializer.
 * @readonly
 * @property {Set<String>} cloned__ - Set of cloned identifiers. Lazy initializer.
 * @readonly
 * @property {Set<String>} cached__ - Set of cached identifiers. Lazy initializer.
 * @readonly
 * @property {Set<String>} computed__ - Set of computed identifiers. Lazy initializer.
 * @readonly
 * @property {Object} descriptors__ - Property descriptors.
 */
Object.defineProperties(eYo._p, {
  Dlgt: {
    value: function (ns, key, C9r, model) {
      // eYo.Dlgt
      if (eYo.isStr(ns)) {
        model = C9r
        C9r = key
        key = ns
        ns = eYo.NA
      } else if (ns) {
        eYo.parameterAssert(eYo.isNS(ns), 'Bad namespace')
      }
      if (!eYo.isStr(key)) {
        eYo.parameterAssert(!model, `Unexpected model: ${model}`)
        model = C9r
        C9r = key
        key = eYo.NA
      }
      eYo.parameterAssert(
        C9r,
        'Missing constructor',
      )
      // compatibility
      var pttp = C9r.superProto_
      if (pttp) {
        var dlgt = pttp.constructor.eyo__
        dlgt && eYo.parameterAssert(
          eYo.isSubclass(this.constructor, dlgt.constructor),
          `Wrong subclass delegate: ${dlgt.name}, $ {this.constructor.eyo.name} not a subclass $ {dlgt.constructor.eyo.name}`,
        )
      }
      Object.defineProperties(this, {
        C9r__: { value: C9r },
        ns__: { value: ns },
        model__: { value: model },
        key__: {value: key || 'Dlgt'},
      })  
      C9r.eyo__ = this
      if (model) {
        var type = eYo.T3.Expr[key]
        type && !model.out || (model.out = Object.create(null))
        eYo.C9r.Model.consolidate(model)
        model.eyo__ = this
        this.props__ = new Set()
        var s = this.super
        this.descriptors__ = Object.create(null)
        s && goog.mixin(this.descriptors__, s.descriptors__)
        this.modelDeclare(model)
        // eYo.C9r.Model.inherits(model, this.super && this.super.model)
      }
    }
  },
  Dlgt_p: {
    get () {
      return this.Dlgt.prototype
    }
  }
})
eYo.assert(eYo.Dlgt, 'MISSING eYo.Dlgt')
eYo.assert(eYo.Dlgt.prototype, 'MISSING eYo.Dlgt.prototype')
eYo.assert(eYo.Dlgt_p, 'MISSING eYo.Dlgt_p')

// convenient variable
Object.defineProperties(eYo.Dlgt_p, {
  C9r: eYo.C9r.descriptorR(function () {
    return this.C9r_
  }),
  C9r_p: eYo.C9r.descriptorR(function () {
    return this.C9r__.prototype
  }),
  C9r_s: eYo.C9r.descriptorR(function () {
    return this.C9r__.superProto_
  }),
  C9r_S: eYo.C9r.descriptorR(function () {
    return this.C9r__.superC9r_
  }),
  C9r_: {
    get () {
      return this.C9r__
    },
    set (after) {
      this.C9r__ = after
    }
  },
  key: eYo.C9r.descriptorR(function () {
    return this.key__
  }),
  key_: eYo.C9r.descriptorR(function () {
    return this.key__
  }),
  ns: eYo.C9r.descriptorR(function () {
    return this.ns__
  }),
  ns_: eYo.C9r.descriptorR(function () {
    return this.ns__
  }),
  model: eYo.C9r.descriptorR(function () {
    return this.model__
  }),
  model_: eYo.C9r.descriptorR(function () {
    return this.model__
  }),
  name: eYo.C9r.descriptorR(function () {
    return this.ns__ && this.key && `${this.ns__.name}.${this.key}` || this.key
  }),
  name_: eYo.C9r.descriptorNORW('name_'),
  name__: eYo.C9r.descriptorNORW('name__'),
  super: eYo.C9r.descriptorR(function () {
    var s = this.C9r_S
    return s && s.eyo__
  }),
})

;['owned', 'cloned', 'valued', 'cached', 'computed'].forEach(k => {
  var k_ = k + '_'
  var k__ = k + '__'
  Object.defineProperty(eYo.Dlgt_p, k_, {
    get () {
      if (this[k__]) {
        return this[k__]
      }
      var s = this.super
      return (this[k__] = s ? new Set(s[k__]) : new Set())
    }
  })
  /**
   * Owned enumerating loop.
   * @param {Function} helper -  signature (name) => {...}
   */
  var name = k + 'ForEach'
  eYo.Dlgt_p[name] = function (f) {
    this[k__] && this[k__].forEach(f)
  }
  var name = k + 'Some'
  eYo.Dlgt_p[name] = function (f) {
    return this[k__] && this[k__].some(f)
  }
})

{
  let createDlgt = (ns, key, C9r, Dlgt, model) => {
    Object.defineProperties(C9r, {
      eyo: eYo.C9r.descriptorR(function () {
        return this.eyo__
      }),
      eyo_: eYo.C9r.descriptorR(function () {
          return this.eyo__
      }),
    })
    Object.defineProperty(C9r.prototype, 'eyo', eYo.C9r.descriptorR(function () {
      return this.constructor.eyo__
    }))
    return (C9r.eyo__ = new Dlgt(ns, key, C9r, model))
  }
  // the Dlgt is its own Dlgt
  createDlgt(eYo, 'Dlgt', eYo.Dlgt, eYo.Dlgt, {})

  /**
   * @name{eYo.doMakeClass}
   * Make a constructor with an 'eyo__' property.
   * Caveat, constructors must have the same arguments.
   * Use a key->value design if you do not want that.
   * The `params` object has template: `{init: function, dispose: function}`.
   * Each namespace has its own `makeClass` method which creates classes in itself.
   * This is not used directly, only decorated.
   * @param {Object} ns -  The namespace.
   * @param {String} key -  The key.
   * @param {Function} Super -  The super class.
   * @param {Function} Dlgt -  The constructor's delegate class. Must be a subclass of `eYo.Dlgt`.
   * @param {Object|Function} model -  The dictionary of parameters.
   * @return {Function} the created constructor.
   */
  eYo._p.doMakeClass = function (ns, key, Super, Dlgt, model) {
    if (Super) {
      var Super_p = Super.prototype
      // create the constructor
      var C9r = function () {
        // Class
        var old = this.init
        this.init = eYo.Do.nothing
        Super.apply(this, arguments)
        if (!this) {
          console.error('BREAK HERE!')
        }
        if (old !== eYo.Do.nothing) {
          delete this.init
          old.apply(this, arguments)
        }
      }
      eYo.inherits(C9r, Super)
      var C9r_p = C9r.prototype
      eYo.assert(eYo.isSubclass(C9r, Super), 'MISSED inheritance)')
      // store the constructor
      ns && Object.defineProperties(ns, {
        [key]: { value: C9r},
        [key + '_p']: { value: C9r_p },
        [key + '_s']: { value: Super_p },
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
      C9r_p = C9r.prototype
      // store the constructor
      ns && Object.defineProperties(ns, {
        [key]: { value: C9r},
        [key + '_p']: { value: C9r_p },
      })
    }
    var eyo = createDlgt(ns, key, C9r, Dlgt, model)
    model = eyo.model // arguments may have changed
    try {
      Object.defineProperty(ns._p, key, {value: C9r})
    } catch(e) {
      console.error(`FAILED to define a property: ${ns.name}[${key}], ${e.message}`)
    }
    C9r.makeSubclass = function (ns, key, Dlgt, model) {
      return C9r.eyo.makeSubclass(ns, key, Dlgt, model)
    }
    // prepare init/dispose methods
    eyo.makeInit()
    eyo.makeDispose()
    if (!key.startsWith('Dlgt')) {
      eyo.makeInitUI()
      eyo.makeDisposeUI()
      // create the iterators for Dflt subclasses
      ;['owned', 'cloned', 'valued', 'cached', 'computed'].forEach(k => {
        var name = k + 'ForEach'
        C9r_p[name] = function (f) {
          C9r.eyo[name].call(C9r.eyo, (k) => {
            var x = this[k]
            return eYo.isNA(x) || f(x)
          })
        }
      })
    }
    return C9r
  }
}

/**
 * @name{eYo.makeClass}
 * Make a constructor with an 'eyo__' property.
 * Caveat, constructors must have the same arguments.
 * Use a key->value design if you do not want that.
 * The `params` object has template: `{init: function, dispose: function}`.
 * Each namespace has its own `makeClass` method which creates classes in itself.
 * @param {Object} [ns] -  The namespace, defaults to the Super's one or the caller.
 * @param {String} key -  The key.
 * @param {Function} [Super] -  The eventual super class. There is no default value. Must be a subclass of `eYo.Dflt`, when no `Dlgt_`is given but not necessarily with an `eyo`.
 * @param {Function} [Dlgt_] -  The constructor's delegate class. Defaults to the `Super`'s delegate. Must be a subclass of `eYo.Dlgt`.
 * @param {Object|Function} [model] -  The dictionary of parameters. Or a function to create such a dictionary. This might be overcomplicated.
 * @return {Function} the created constructor.
 */
eYo._p.makeClass = eYo.makeClassDecorate(eYo.doMakeClass)

/**
 * This decorator turns f with signature
 * function (ns, key, Super, Dlgt, model) {}
 * into
 * function ([ns], [key], [Dlgt], [model]) {}.
 * After decoration, a call to the resulting function is equivalent to a makeClass,
 * the Super being the receiver's C9r.
 * Both functions belong to the namespace context,
 * id est `this` is a namespace.
 * @param{Function} f - the function to decorate.
 */
eYo.Dlgt_p.makeSubclassDecorate = (f) => {
  return function (ns, key, Dlgt, model) {
    var Super = this.C9r
    if (ns && !eYo.isNS(ns)) {
      eYo.parameterAssert(!model, `Unexpected model (1): ${model}`)
      model = Dlgt
      Dlgt = key
      key = ns
      ns = this.ns
    }
    if (!eYo.isStr(key)) {
      eYo.parameterAssert(!model, `Unexpected model (2): ${model}`)
      model = Dlgt
      Dlgt = key
      key = this.key
    }
    var ff = (this.ns||eYo).makeClassDecorate(f)
    return ff.call(this.ns||eYo, ns, key, Super, Dlgt, model)
  }
}

/**
 * Convenient shortcut to create subclasses.
 * Forwards to the namespace which must exist!
 * @param {Object} [ns] -  The namespace, possibly `eYo.NA`.
 * @param {String} key -  to create `ns[key]`
 * @param {Function} [Dlgt] -  Delegate class.
 * @param {Object} [model] -  Model object
 * @return {?Function} the constructor created or `eYo.NA` when the receiver has no namespace.
 */
eYo.Dlgt_p.makeSubclass = eYo.Dlgt_p.makeSubclassDecorate(eYo.doMakeClass)

/**
 * Convenient shortcut to create subclasses.
 * Forwards to the namespace which must exist!
 * @param {Object} [ns] -  The namespace, possibly `eYo.NA`.
 * @param {String} key -  to create `ns[key]`
 * @param {Function} [Dlgt] -  Delegate class.
 * @param {Object} [model] -  Model object
 * @return {?Function} the constructor created or `eYo.NA` when the receiver has no namespace.
 */
eYo.Dlgt.makeSubclass = eYo.Dlgt_p.makeSubclass.bind(eYo.Dlgt.eyo)

/**
 * Convenient method to create the Dflt class.
 * @param {String} [key] - the main name of the class
 * @param {Object} [Super] - the class of the delegate
 * @param {Object} [model] - the model
 */
eYo._p.makeDlgt = function (key, Super, model) {
  if (!eYo.isStr(key)) {
    eYo.parameterAssert(!model, `Unexpected model: ${model}`)
    model = Super
    Super = key
    key = 'Dlgt'
  }
  if (!eYo.isSubclass(Super, eYo.Dlgt)) {
    eYo.parameterAssert(!model, `Unexpected model: ${model}`)
    model = Super
    Super = this.Dlgt
  }
  return this.makeClass(key, Super, eYo.Dlgt, model)
}

/**
 * Convenient method to create the Dflt class.
 * @param {Object} [Super] - the ancestor class
 * @param {Object} [Dlgt] - the class of the delegate
 * @param {Object} [model] - the model
 */
eYo._p.makeDflt = function (Super, Dlgt, model) {
  eYo.parameterAssert(!this.hasOwnProperty('Dflt'))
  if (!this.hasOwnProperty('Dlgt')) {
    this.makeDlgt()
  }
  let superDflt = this.super && this.super.Dflt
  if (superDflt && !eYo.isSubclass(Super, superDflt)) {
    eYo.parameterAssert(!model, `Unexpected model: ${model}`)
    model = Dlgt
    Dlgt = Super
    Super = superDflt
  }
  if (!eYo.isSubclass(Dlgt, eYo.Dlgt)) {
    eYo.parameterAssert(!model, `Unexpected model: ${model}`)
    model = Dlgt
    Dlgt = this.Dlgt
  }
  return this.makeClass('Dflt', Super, Dlgt, model)
}

/**
 * The default class.
 * @name {eYo.Dflt}
 * @constructor
 */
eYo.makeDflt({
  /**
   * Initializer.
   */
  init() {
    this.disposeUI = eYo.Do.nothing // will be used by subclassers
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
      return !this.initUI || this.initUI === eYo.Do.nothing
    },
    /**
     * The driver manager shared by all the instances in the app.
     * @type {eYo.Driver.Mngr}
     */
    ui_driver_mngr () {
      let a = this.app
      return a && a.ui_driver_mngr
    },
  },
})
