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
eYo.require('do')
eYo.require('dlgt')
eYo.require('decorate')

eYo.forward('t3')

/**
 * Management of constructors and models.
 * Models are trees with some inheritancy.
 * @name {eYo.c9r}
 * @namespace
 */
eYo.makeNS('c9r')

// ANCHOR: Utilities

/**
 * Convenient way to append code to an already existing method.
 * This allows to define a method in different places.
 * @param {Object} object - Object
 * @param {String} key - Looking for or crating |Object[key]|
 * @param {Function} f - the function we will append
 */
eYo.c9r._p.appendToMethod = (object, key, f) => {
  let old = object[key]
  if (old && old !== eYo.doNothing) {
    eYo.isF(old) || eYo.throw(`Expecting a function ${old}`)
    object[key] = function () {
      old.apply(this, arguments)
      f.apply(this, arguments)
    }
  } else {
    object[key] = f
  }
}

// ANCHOR Top level constructor utilities
{
/**
 * @name{eYo.c9r._p.doMakeC9r}
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
eYo.c9r._p.doMakeC9r = function (ns, key, Super, model) {
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
      old || eYo.throw(`Unfinalized contructor: ${this.eyo.name}`)
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
    eYo.dlgt.declareDlgt(_p) // computed properties `eyo`
    _p.doPrepare = _p.doInit = eYo.doNothing
  }
  let eyo = eYo.dlgt.new(ns, key, C9r, model)
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
{
  let _p = eYo.dlgt.Base_p
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
   * Convenient shortcut to create subclasses.
   * Forwards to the namespace which must exist!
   * @param {Object} [ns] -  The namespace, possibly `eYo.NA`.
   * @param {String} key -  to create `ns[key]`
   * @param {Object} [model] -  Model object
   * @return {?Function} the constructor created or `eYo.NA` when the receiver has no namespace.
   * @this {eYo.dlgt.Base}
   */
  _p.makeInheritedC9r = _p.makeInheritedC9rDecorate(function (ns, key, Super, model) {
    return this.doMakeC9r(ns, key, Super, model)
  })
}

// ANCHOR Base
{
  /**
   * Convenient method to create the Base class.
   * @param {Function} [Super] - the ancestor class
   * @param {Object} [model] - the model
   * @param {Boolean} [unfinalize] - whether not to finalize the constructor
   */
  eYo.c9r._p.makeBase = function (Super, model, unfinalize) {
    this.hasOwnProperty('Base') && eYo.throw(`${this.name}: Already Base`)
    if (eYo.isF(Super) && Super.eyo) {
      if (eYo.isBool(model)) {
        eYo.isDef(unfinalize) && eYo.throw(`Unexpected argument: ${unfinalize}`)
        ;[unfinalize, model] = [model, {}]
      }
    } else {
      eYo.isDef(unfinalize) && eYo.throw(`Unexpected argument: ${unfinalize}`)
      ;[Super, model, unfinalize] = [
        this.super && this.super.Base || eYo.NA,
        Super,
        model,
      ]
      if (eYo.isBool(model)) {
        eYo.isDef(unfinalize) && eYo.throw(`Unexpected argument: ${unfinalize}`)
        ;[unfinalize, model] = [model, eYo.called(Super) || {}]
      }
    }
    let C9r = this.makeC9r(this, 'Base', Super, model || {})
    let s = this.parent
    if (s && this.key) {
      s[eYo.do.toTitleCase(this.key)] = C9r
    }
    this.Dlgt_p = C9r.eyo_p
    !unfinalize && C9r.eyo.finalizeC9r()
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
 * The model Base used to derive a new class.
 * @see The `new` method.
 * @param {Object} model
 */
eYo.c9r._p.modelBase = function (model) {
  return this.Base
}

/**
 * Create a new constructor based on the model.
 * No need to subclass.
 * Instead, override `Base`, `modelPath` and `modelHandle`.
 * @param {Object} owner
 * @param {String} key
 * @param {Object} model
 */
eYo.c9r._p.modelMakeC9r = function (key, model) {
  model = this.modelValidate(key, model)
  let C9r = this.makeC9r('', this.modelBase(model), model)
  model = C9r.eyo.model
  model._C9r = C9r
  model._starters = []
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
    var C9r = this.Base
    if (C9r.eyo.shouldFinalizeC9r) {
      C9r.eyo.finalizeC9r()
    }
    return new C9r(owner, key)
  }
  var C9r = model._C9r
  if (!C9r) {
    C9r = this.modelMakeC9r(key, model)
    C9r.eyo.finalizeC9r()
  }
  let ans = new C9r(owner, key, model)
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
 * @param{Object} [manyModel] - Object, read only.
 */
eYo.c9r._p.enhancedMany = function (key, path, manyModel = {}) {
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
  let KInit       = eYo.do.toTitleCase(key) + 'Init'
  let kDispose    = key + 'Dispose'
  let KDispose    = eYo.do.toTitleCase(key) + 'Dispose'
  let kForEach    = key + 'ForEach'
  let kSome       = key + 'Some'
  let kHead       = key + 'Head'
  let kTail       = key + 'Tail'
  /*
   * Lazy model getter:
   * 
   */
  Object.defineProperty(_p, kModelByKey__, {
    get () {
      let model = this.model || Object.create(null)
      for (let k of path.split('.')) {
        if (model = model[k]) {
          continue
        } else {
          model = Object.create(null)
          break
        }
      }
      Object.defineProperty(this, kModelByKey__, {
        get () {
          return model
        }
      })
      return model
    },
  })

  /**
   * Expands the property, data, fields, slots section into the receiver's corresponding model.
   * Usage: For the model `{foo: bar}`, run `C9r.eyo.fooMerge(bar)`
   * @param{Object} source - A model object.
   */
  _p[kMerge] = function (source) {
    delete this[kModelMap] // delete the shortcut
    this.forEachSubC9r(C9r => C9r.eyo[kMerge]({})) // delete the cache of descendants
    ;(this.ns || eYo.c9r).modelExpand(source, path)
    let byKey = this[kModelByKey__]
    eYo.provideR(byKey, source)
  }
  Object.defineProperties(_p, {
    [kModelMap]: eYo.descriptorR(function () {
      let modelMap = this[kModelMap_] = new Map()
      let superMap = this.super && this.super[kModelMap]
      let map = superMap ? new Map(superMap) : new Map()
      if (this[kModelByKey__]) {
        for (let [k, v] of Object.entries(this[kModelByKey__])) {
          map.set(k, v)
        }
      }
      let todo = [...map.keys()]
      let done = []
      let again = []
      var more = false
      var k
      while (true) {
        if ((k = todo.pop())) {
          let model = map.get(k)
          if (model.after) {
            if (eYo.isStr(model.after)) {
              if (!done.includes(model.after) && (todo.includes(model.after) || again.includes(model.after))) {
                again.push(k)
                continue
              }
            } else if (model.after.some(k => (!done.includes(k) && (todo.includes(model.after) || again.includes(model.after))))) {
              again.push(k)
              continue
            }
          }
          modelMap.set(k, model)
          done.push(k)
          more = true
        } else if (more) {
          [more, todo, again] = [false, again, todo]
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
  let makeShortcut = manyModel.makeShortcut || function (object, k, p) {
    let k_p = k + (manyModel.suffix || `_${key[0]}`)
    if (object.hasOwnProperty(k_p)) {
      console.error(`BREAK HERE!!! ALREADY object ${object.eyo.name}/${k_p}`)
    }
    Object.defineProperties(object, {
      [k_p]: eYo.descriptorR(function () {
        return p
      }),
    })
    object[k_p] || eYo.throw('Missing property')
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
        makeShortcut(object, k, attr)
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
    for (let v of object[kMap].values()) {
      let init = v && object[v.key + KInit]
      init && init.call(object, v, ...$)
      v.init && v.init(...$)
    }
  }
  _p[kDispose] = manyModel.dispose || function(object, ...$) {
    for (let v of object[kMap].values()) {
      if (v.owner === object) {
        let dispose = object[v.key + KDispose]
        dispose && dispose.call(object, v, ...$)
        v.dispose && v.dispose(...$)
      }
    }
    object.bindField = object[kHead] = object[kTail] = object[kModelByKey__] = eYo.NA
  }
  _p[kForEach] = function (object, $this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    for (let v of object[kMap].values()) {
      f.call($this, v)
    }
  }
  _p[kSome] = function (object, $this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    for (let v of object[kMap].values()) {
      if (f.call($this, v)) {
        return true
      }
    }
  }
}

/**
 * Create a new instance based on the model.
 * @param {Object} model
 */
eYo.c9r._p.singleton = function (model) {
  return new (this.makeC9r('', model))()
}

/**
 * Create a new instance based on the model.
 * @param {Object} [NS] - Optional namespace, defaults to the receiver.
 * @param {Object} key - the result will be `NS[key]`
 * @param {Object} model
 */
eYo.c9r._p.makeSingleton = function(NS, key, model) {
  if (!eYo.isNS(NS)) {
    !model || eYo.throw(`Unexpected model: ${model}`)
    ;[NS, key, model] = [this, NS, key]
  }
  eYo.isStr(key) || eYo.throw(`Unexpected parameter ${key}`)
  let ans = new (this.makeC9r('', model))()
  Object.defineProperty(NS, key, eYo.descriptorR(function() {
    return ans
  }))
}

// ANCHOR: Model

// Prepares the constructors.

eYo.c9r.Base.eyo.finalizeC9r([
  'dlgt', 'init', 'deinit', 'dispose', 'methods',
])
