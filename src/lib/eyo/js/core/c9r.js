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

eYo.forwardDeclare('c9r.Prop')
eYo.forwardDeclare('c9r.model')
eYo.forwardDeclare('c9r.dlgtImpl')

/**
 * Management of constructors and models.
 * Models are trees with some inheritancy.
 * @name {eYo.c9r}
 * @namespace
 */
eYo.makeNS('c9r')

// ANCHOR Utilities
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
 * Function frequently used.
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
 * function frequently used.
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
 * function frequently used.
 */
eYo.c9r.descriptorR = (msg, getter) => {
  if (!eYo.isStr(msg)) {
    eYo.ParameterAssert(!getter, `Unexpected getter: ${getter}`)
    getter = msg
    msg = eYo.NA
  }
  return {
    get: getter,
    set: eYo.c9r.noSetter(msg),
  }
}

/**
 * function frequently used.
 */
eYo.c9r.descriptorW = (msg, setter) => {
  if (!eYo.isStr(msg)) {
    eYo.ParameterAssert(!setter, `Unexpected setter: ${setter}`)
    setter = msg
    msg = eYo.NA
  }
  return {
    get: eYo.c9r.noGetter(msg),
    set: setter,
  }
}

/**
 * function frequently used.
 */
eYo.c9r.descriptorNORW = (msg) => {
  return {
    get: eYo.c9r.noGetter(msg),
    set: eYo.c9r.noSetter(msg),
  }
}

/**
 * All the created delegates.
 * @package
 */
eYo.c9r.byName__ = Object.create(null)

/**
 * All the created delegates.
 * @package
 */
eYo.c9r.byKey__ = Object.create(null)

/**
 * All the created delegates.
 * @package
 */
eYo.c9r.byType__ = Object.create(null)

/**
 * All the created delegates.
 * @param{String} key - the key used to create the constructor.
 */
eYo.c9r.forKey = (key) => {
  return eYo.c9r.byKey__[key]
}

/**
 * All the created delegates.
 * @param{String} name - the name used to create the constructor.
 */
eYo.c9r.forName = (name) => {
  return eYo.c9r.byName__[name]
}

/**
 * All the created delegates.
 * @param{String} type - the type used to create the constructor.
 */
eYo.c9r.forType = (type) => {
  return eYo.c9r.byType__[type]
}

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
  eYo.ParameterAssert(!C9r, `UNEXPECTED ${C9r}`)
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
    eyo.types.push(type)
  }
}
}
// ANCHOR eYo.c9r.Dlgt
{
/**
 * @name {eYo.c9r.Dlgt}
 * @constructor
 * Object adding data to a constructor in a safe way.
 * All the `*.Dlgt` constructors are subclassing `eYo.c9r.Dlgt`.
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
Object.defineProperties(eYo.c9r._p, {
  Dlgt: {
    value: function (ns, key, C9r, model) {
      // eYo.Dlgt
      if (eYo.isStr(ns)) {
        model = C9r
        C9r = key
        key = ns
        ns = eYo.NA
      } else if (ns) {
        eYo.ParameterAssert(eYo.isNS(ns), 'Bad namespace')
      }
      if (!eYo.isStr(key)) {
        eYo.ParameterAssert(!model, `Unexpected model: ${model}`)
        model = C9r
        C9r = key
        key = eYo.NA
      }
      eYo.ParameterAssert(
        C9r,
        'Missing constructor',
      )
      // compatibility
      // this.constructor should be a subclass of the constructor of the delegate of the super class of C9r, if any
      // 
      var pttp = C9r.SuperC9r_p
      if (pttp) {
        let dlgt = pttp.constructor.eyo__
        dlgt && eYo.ParameterAssert(
          eYo.isSubclass(this.constructor, dlgt.constructor),
          `Wrong subclass delegate: ${dlgt.name}, ${this.constructor.eyo.name} not a subclass of ${dlgt.constructor.eyo.name}`,
        )
      }
      Object.defineProperties(this, {
        ns__: { value: ns },
        key__: {value: key || 'Dlgt'},
        C9r__: { value: C9r },
        model__: { value: model },
      })  
      C9r.eyo__ = this
      Object.defineProperties(C9r, {
        eyo: eYo.c9r.descriptorR(function () {
          return this.eyo__
        }),
        eyo_: eYo.c9r.descriptorR(function () {
            return this.eyo__
        }),
      })
      Object.defineProperty(C9r.prototype, 'eyo', eYo.c9r.descriptorR(function () {
        return this.constructor.eyo__
      }))
      if (model) {
        var type = eYo.t3.expr[key]
        type && !model.out || (model.out = Object.create(null))
        this.props__ = new Set()
        var s = this.super
        this.descriptors__ = Object.create(null)
        s && goog.mixin(this.descriptors__, s.descriptors__)
        this.modelConsolidate(model)
        this.modelDeclare(model)
        // eYo.c9r.model.inherits(model, this.super && this.super.model)
      }
    }
  },
})
Object.defineProperties(eYo._p, {
  Dlgt_p: {
    get () {
      return this.Dlgt.prototype
    }
  },
})
eYo.Assert(eYo.c9r.Dlgt, 'MISSING eYo.Dlgt')
eYo.Assert(eYo.c9r.Dlgt.prototype, 'MISSING eYo.c9r.Dlgt.prototype')
eYo.Assert(eYo.c9r.Dlgt_p, 'MISSING eYo.c9r.Dlgt_p')

// convenient variable
Object.defineProperties(eYo.c9r.Dlgt_p, {
  C9r: eYo.c9r.descriptorR(function () {
    return this.C9r_
  }),
  C9r_p: eYo.c9r.descriptorR(function () {
    return this.C9r__.prototype
  }),
  C9r_s: eYo.c9r.descriptorR(function () {
    return this.C9r__.SuperC9r_p
  }),
  C9r_S: eYo.c9r.descriptorR(function () {
    return this.C9r__.SuperC9r
  }),
  C9r_: {
    get () {
      return this.C9r__
    },
    set (after) {
      this.C9r__ = after
    }
  },
  key: eYo.c9r.descriptorR(function () {
    return this.key__
  }),
  key_: eYo.c9r.descriptorR(function () {
    return this.key__
  }),
  ns: eYo.c9r.descriptorR(function () {
    return this.ns__
  }),
  ns_: eYo.c9r.descriptorR(function () {
    return this.ns__
  }),
  model: eYo.c9r.descriptorR(function () {
    return this.model__
  }),
  model_: eYo.c9r.descriptorR(function () {
    return this.model__
  }),
  name: eYo.c9r.descriptorR(function () {
    return this.ns__ && this.key && `${this.ns__.name}.${this.key}` || this.key
  }),
  name_: eYo.c9r.descriptorNORW('name_'),
  name__: eYo.c9r.descriptorNORW('name__'),
  super: eYo.c9r.descriptorR(function () {
    var s = this.C9r_S
    return s && s.eyo__
  }),
})

;['owned', 'cloned', 'valued', 'cached', 'computed'].forEach(k => {
  var k_ = k + '_'
  var k__ = k + '__'
  Object.defineProperty(eYo.c9r.Dlgt_p, k_, {
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
  eYo.c9r.Dlgt_p[name] = function (f) {
    this[k__] && this[k__].forEach(f)
  }
  var name = k + 'Some'
  eYo.c9r.Dlgt_p[name] = function (f) {
    return this[k__] && (this[k__].some(f))
  }
})

/**
 * Make the init method.
 */
eYo.c9r.Dlgt_p.makeInit = function () {
  let init = this.model.init
  let C9r_s = this.C9r_s
  let init_s = C9r_s && C9r_s.init
  let preInitInstance = this.preInitInstance.bind(this)
  let initInstance = this.initInstance.bind(this)
  if (init) {
    if (XRegExp.exec(init.toString(), eYo.xre.function_builtin)) {
      if (init_s) {
        var f = function (...args) {
          try {
            this.init = eYo.do.nothing
            init.call(this, () => {
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
            init.call(this, () => {
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
          init.call(this, ...args)
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
          init.call(this, ...args)
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
eYo.c9r.Dlgt_p.makeDispose = function () {
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
            this.disposeUI(...args)
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
            this.disposeUI(...args)
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
          this.disposeUI(...args)
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
          this.disposeUI(...args)
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
        this.disposeUI(...args)
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
        this.disposeUI(...args)
        disposeInstance(this)
      } finally {
        delete this.init
      }
    }
  }
  this.C9r_p.dispose = f
}

/**
 * Make the initUI method.
 */
eYo.c9r.Dlgt_p.makeInitUI = eYo.do.nothing

/**
 * Make the disposeUI method.
 */
eYo.c9r.Dlgt_p.makeDisposeUI = eYo.do.nothing

/**
 * Initialize an instance with valued, cached, owned and cloned properties.
 * Default implementation forwards to super.
 * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
 */
eYo.c9r.Dlgt_p.preInitInstance = function (object) {
  for (var k in this.descriptors__) {
    object.hasOwnProperty(k) || Object.defineProperty(object, k, this.descriptors__[k])
  }
}

/**
 * Defined later
 */
eYo.c9r.Dlgt_p.initInstance = eYo.do.nothing

/**
 * Defined later
 */
eYo.c9r.Dlgt_p.disposeInstance = eYo.do.nothing

/*
* This will be defined later.
*/
eYo.c9r.Dlgt_p.modelConsolidate = eYo.do.nothing

/*
* This will be defined later.
*/
eYo.c9r.Dlgt_p.modelDeclare = eYo.do.nothing
}

// the Dlgt is its own Dlgt
new eYo.c9r.Dlgt(eYo.c9r, 'Dlgt', eYo.c9r.Dlgt, {})

// ANCHOR Class utility
{
/**
 * @name{eYo.doMakeC9r}
 * Make a constructor with an 'eyo__' property.
 * Caveat, constructors must have the same arguments.
 * Use a key->value design if you do not want that.
 * The `params` object has template: `{init: function, dispose: function}`.
 * Each namespace has its own `makeC9r` method which creates classes in itself.
 * This is not used directly, only decorated.
 * All the given parameters have their normal meaning.
 * @param {Object} ns -  The namespace.
 * @param {String} key -  The key.
 * @param {Function} Super -  The super class.
 * @param {Function} Dlgt -  The constructor's delegate class. Must be a subclass of `eYo.Dlgt`.
 * @param {Object|Function} model -  The dictionary of parameters.
 * @return {Function} the created constructor.
 */
eYo._p.doMakeC9r = function (ns, key, Super, Dlgt, model) {
  if (Super) {
    var Super_p = Super.prototype
    // create the constructor
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
    var C9r_p = C9r.prototype
    eYo.Assert(eYo.isSubclass(C9r, Super), 'MISSED inheritance)')
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
  var eyo = new Dlgt(ns, key, C9r, model)
  model = eyo.model // arguments may have changed
  try {
    Object.defineProperty(ns._p, key, {value: C9r})
  } catch(e) {
    console.error(`FAILED to define a property: ${ns.name}[${key}], ${e.message}`)
  }
  C9r.makeInheritedC9r = eyo.makeInheritedC9r.bind(eyo)
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

/**
 * This decorator turns `f` with signature
 * function (ns, key, Super, Dlgt, model) {...}
 * into
 * function ([ns], [key], [Super], [Dlgt], [model]) {...}.
 * Both functions have `this` bound to a namespace.
 * @param{Function} f
 * @this{undefined}
 */
eYo._p.makeC9rDecorate = (f) => {
  return function (ns, key, Super, Dlgt, model) {
    // makeC9rDecorate
    if (ns && !eYo.isNS(ns)) {
      eYo.ParameterAssert(!model, `Unexpected model: ${model}`)
      model = Dlgt
      Dlgt = Super
      Super = key
      key = ns
      ns = eYo.NA
    }
    if (!eYo.isStr(key)) {
      eYo.ParameterAssert(!model, `Unexpected model: ${model}`)
      model = Dlgt
      Dlgt = Super
      Super = key
      key = eYo.NA
    }
    key || (key = Super && Super.eyo && Super.eyo.key)
    if (eYo.isSubclass(Super, eYo.c9r.Dflt)) {
      // Super is OK
      if (eYo.isSubclass(Dlgt, eYo.c9r.Dlgt)) {
        // Dlgt is also OK
        eYo.ParameterAssert(
          !Super.eyo || eYo.isSubclass(Dlgt, Super.eyo.constructor),
          'Bad constructor delegate'
        )
        model = eYo.Called(model) || {}
      } else {
        model = eYo.Called(model || Dlgt) || {}
        Dlgt = this.Dlgt
      }
    } else if (eYo.isSubclass(Super, eYo.c9r.Dlgt)) {
      if (eYo.isSubclass(Dlgt, eYo.c9r.Dlgt)) {
        // we subclass eYo.Dlgt
        model = eYo.Called(model) || {}
      } else if (key && key.startsWith('Dlgt')) {
        // we subclass Dlgt
        eYo.ParameterAssert(!model, 'Unexpected model (1)')
        model = eYo.Called(Dlgt) || {}
        Dlgt = eYo.c9r.Dlgt
      } else {
        eYo.ParameterAssert(!model, 'Unexpected model (2)')
        model = eYo.Called(Dlgt) || {}
        Dlgt = Super
        Super = this.Dflt
      }
    } else if (eYo.isF(Super)) {
      if (eYo.isSubclass(Dlgt, eYo.c9r.Dlgt)) {
        // Dlgt and Super OK, Super is not a subclass of eYo.Dflt
        model = eYo.Called(model) || {}
      } else if (Dlgt) {
        eYo.ParameterAssert(!model, 'Unexpected model (3)')
        model = eYo.Called(Dlgt) || {}
        Dlgt = this.Dlgt
      } else if (Super.eyo) {
        eYo.ParameterAssert(!model, 'Unexpected model (4)')
        model = {}
        Dlgt = this.Dlgt
    } else if (model) {
        model = eYo.Called(model)
        Dlgt = this.Dlgt
      } else {
        model = eYo.Called(Super) || {}
        Dlgt = this.Dlgt
        Super = eYo.AsF(key && this[key]) || this.Dflt
      }
    } else if (Super) {
      eYo.ParameterAssert(!model, 'Unexpected model (5)')
      eYo.ParameterAssert(!Dlgt, 'Unexpected Dlgt (5)')
      model = Super
      Dlgt = this.Dlgt
      Super = eYo.AsF(key && this[key]) || this.Dflt
    } else if (eYo.isSubclass(Dlgt, eYo.c9r.Dlgt)) {
      // Dlgt OK, no Super
      model = eYo.Called(model) || {}
    } else if (Dlgt) {
      eYo.ParameterAssert(!model, 'Unexpected model (6)')
      // default Dlgt, no super
      model = eYo.Called(Dlgt)
      Dlgt = this.Dlgt
    } else {
      eYo.ParameterAssert(!Dlgt, 'Unexpected Dlgt (7)')
      model = {}
      if (key) {
        Dlgt = (key.startsWith('Dlgt') ? eYo : this).Dlgt
        Super = this[key] || this.Dflt
      } else {
        Dlgt = this.Dlgt
        Super = this.Dflt
      }
    }
    ns || (ns = this)
    if (key || (key = Super && Super.eyo && Super.eyo.key)) {
      eYo.ParameterAssert(eYo.isStr(key), '`key` is not a string')
      if (key.startsWith('eyo:')) {
        key = key.substring(4)
      }
      eYo.ParameterAssert(!ns.hasOwnProperty(key), `${key} is already a property of ns: ${ns.name}`)
      eYo.ParameterAssert(!ns._p.hasOwnProperty(key), `${key} is already a property of ns: ${ns.name}`)
    }
    eYo.ParameterAssert(model, 'Unexpected void model')
    if (eYo.isSubclass(ns.Dflt, Super)) {
      Super = ns.Dflt
    }
    if (eYo.isSubclass(this.Dflt, Super)) {
      Super = this.Dflt
    }
    eYo.ParameterAssert(key, 'Missing key')
    if (!key.startsWith('Dlgt')) {
      if (Super && Super.eyo && eYo.isSubclass(Super.eyo.constructor, Dlgt)) {
        Dlgt = Super.eyo.constructor
      }
      if (eYo.isSubclass(ns.Dlgt, Dlgt)) {
        Dlgt = ns.Dlgt
      } else if (Dlgt && Dlgt.eyo && Dlgt.eyo.key.endsWith('Mngr')) {
        // pass
      } else if (ns.Dlgt && !eYo.isSubclass(Dlgt, ns.Dlgt)) {
        Dlgt = ns.Dlgt
      }
    }
    return f.call(this, ns, key, Super, Dlgt, model)
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
 * @param {Function} [Super] -  The eventual super class. There is no default value. Must be a subclass of `eYo.Dflt`, when no `Dlgt_`is given but not necessarily with an `eyo`.
 * @param {Function} [Dlgt_] -  The constructor's delegate class. Defaults to the `Super`'s delegate. Must be a subclass of `eYo.Dlgt`.
 * @param {Object|Function} [model] -  The dictionary of parameters. Or a function to create such a dictionary. This might be overcomplicated.
 * @return {Function} the created constructor.
 */
eYo._p.makeC9r = eYo.makeC9rDecorate(eYo.doMakeC9r)

/**
 * This decorator turns f with signature
 * function (ns, key, Super, Dlgt, model) {}
 * into
 * function ([ns], [key], [Dlgt], [model]) {}.
 * After decoration, a call to the resulting function is equivalent to a makeC9r,
 * the Super being the receiver's C9r.
 * Both functions belong to the namespace context,
 * id est `this` is a namespace.
 * @param{Function} f - the function to decorate.
 */
eYo.c9r.Dlgt_p.makeInheritedC9rDecorate = (f) => {
  return function (ns, key, Dlgt, model) {
    var Super = this.C9r
    if (ns && !eYo.isNS(ns)) {
      eYo.ParameterAssert(!model, `Unexpected model (1): ${model}`)
      model = Dlgt
      Dlgt = key
      key = ns
      ns = this.ns
    }
    if (!eYo.isStr(key)) {
      eYo.ParameterAssert(!model, `Unexpected model (2): ${model}`)
      model = Dlgt
      Dlgt = key
      key = this.key
    }
    var ff = (this.ns||eYo).makeC9rDecorate(f)
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
eYo.c9r.Dlgt_p.makeInheritedC9r = eYo.c9r.Dlgt_p.makeInheritedC9rDecorate(eYo.doMakeC9r)

/**
 * Convenient shortcut to create subclasses.
 * Forwards to the namespace which must exist!
 * @param {Object} [ns] -  The namespace, possibly `eYo.NA`.
 * @param {String} key -  to create `ns[key]`
 * @param {Function} [Dlgt] -  Delegate class.
 * @param {Object} [model] -  Model object
 * @return {?Function} the constructor created or `eYo.NA` when the receiver has no namespace.
 */
eYo.c9r.Dlgt.makeInheritedC9r = eYo.c9r.Dlgt_p.makeInheritedC9r.bind(eYo.c9r.Dlgt.eyo)

/**
 * Convenient method to create the Dflt class.
 * @param {String} [key] - the main name of the class
 * @param {Object} [Super] - the class of the delegate
 * @param {Object} [model] - the model
 */
eYo._p.makeDlgt = function (key, Super, model) {
  if (!eYo.isStr(key)) {
    eYo.ParameterAssert(!model, `Unexpected model: ${model}`)
    model = Super
    Super = key
    key = 'Dlgt'
  }
  if (!eYo.isSubclass(Super, eYo.c9r.Dlgt)) {
    eYo.ParameterAssert(!model, `Unexpected model: ${model}`)
    model = Super
    Super = this.Dlgt
  }
  return this.makeC9r(key, Super, eYo.c9r.Dlgt, model)
}
}
// ANCHOR Dflt
{
/**
 * Convenient method to create the Dflt class.
 * @param {Object} [Super] - the ancestor class
 * @param {Object} [Dlgt] - the class of the delegate
 * @param {Object} [model] - the model
 */
eYo._p.makeDflt = function (Super, Dlgt, model) {
  eYo.ParameterAssert(!this.hasOwnProperty('Dflt'))
  if (this !== eYo.c9r && !this.hasOwnProperty('Dlgt')) {
    this.makeDlgt()
  }
  if (eYo.isF(Super)) {
    if (eYo.isSubclass(Super, eYo.c9r.Dlgt)) {
      eYo.ParameterAssert(!model, `Unexpected model: ${model}`)
      model = Dlgt
      Dlgt = Super
      Super = eYo.NA
    } else if (!eYo.isSubclass(Dlgt, eYo.c9r.Dlgt)) {
      eYo.ParameterAssert(!model, `Unexpected model: ${model}`)
      model = Dlgt
      Dlgt = this.Dlgt
    }
  } else {
    eYo.ParameterAssert(!Dlgt, `Unexpected Dlgt: ${Dlgt}`)
    eYo.ParameterAssert(!model, `Unexpected model: ${model}`)
    model = Super
    Dlgt = this.Dlgt
    Super = this.super && this.super.Dflt
  }
  return this.makeC9r(this, 'Dflt', Super, Dlgt, model || {})
}

/**
 * The default class.
 * @name {eYo.c9r.Dflt}
 * @constructor
 */
eYo.c9r.makeDflt()

eYo.c9r.Dflt_p.initUI = eYo.do.nothing
eYo.c9r.Dflt_p.disposeUI = eYo.do.nothing

/**
 * The to delegate class.
 * @name {eYo.Dlgt}
 * @constructor
 */
eYo.makeDlgt(eYo.c9r.Dlgt)

/**
 * The default class.
 * @name {eYo.Dflt}
 * @constructor
 */
eYo.makeDflt(eYo.c9r.Dflt, {
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
          let p = x.Ui_driver_p
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
 * Make the initUI method.
 */
eYo.Dlgt_p.makeInitUI = function () {
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
eYo.Dlgt_p.makeDisposeUI = function () {
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

}