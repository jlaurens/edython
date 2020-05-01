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

//<<< mochai: C9r

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
 * @param {String} id -  The id.
 * @param {Function} Super -  The super class.
 * @param {Object|Function} model -  The dictionary of parameters.
 * @return {Function} the created constructor.
 */
eYo.c9r._p.doMakeC9r = function (ns, id, Super, model) {
  !ns || ns === eYo.NULL_NS || eYo.isNS(ns) || eYo.throw(`doMakeC9r/Bad ns: ${ns}`)
  !id || eYo.isStr(id) || eYo.throw(`doMakeC9r/Bad id: ${id}`)
  !Super || eYo.isC9r(Super) || eYo.throw(`doMakeC9r/Bad Super: ${Super}`)
  if (!eYo.isD(model)) {
    console.error(model)
  }
  eYo.isD(model) || eYo.throw(`doMakeC9r/Bad model: ${model}`)
  if (Super) {
    // create the constructor
    // TODO: due to the makeInit method, this constructor may be badly designed.
    var C9r = function (...$) {
      // Class
      if (!this) {
        console.error('BREAK HERE!!!')
      }
      var old = this.init
      old || eYo.throw(`Unfinalized contructor: ${this.eyo.name}`)
      this.init = eYo.doNothing
      Super.call(this, ...$)
      if (!this) {
        console.error('BREAK HERE!')
      }
      if (old !== eYo.doNothing) {
        delete this.dispose
        old.call(this, ...$)
      }
    }
    eYo.inherits(C9r, Super)
    Super.eyo.addSubC9r(C9r)
    eYo.assert(eYo.isSubclass(C9r, Super), 'MISSED inheritance)')
    // syntactic sugar shortcuts
    if (ns && id.length) {
      if (id && id.startsWith('eyo:')) {
        id = id.substring(4)
      }
      (ns.hasOwnProperty(id) || ns._p.hasOwnProperty(id)) && eYo.throw(`${id} is already a property of ns: ${ns.name}`)
      Object.defineProperties(ns._p, {
        [id]: { value: C9r},
        [id + '_p']: { value: C9r.prototype },
        [id + '_s']: { value: Super.prototype },
        [id + '_S']: { value: Super },
      })
    }
  } else {
    // create the constructor
    var C9r = function (...$) {
      // Class
      if (!this) {
        console.error('BREAK HERE! C9r')
      }
      this.init.call(this, ...$)
    }
    // store the constructor
    var _p = C9r.prototype
    if (ns && id.length) {
      if (id && id.startsWith('eyo:')) {
        id = id.substring(4)
      }
      (ns.hasOwnProperty(id) || ns._p.hasOwnProperty(id)) && eYo.throw(`${id} is already a property of ns: ${ns.name}`)
      Object.defineProperties(ns._p, {
        [id]: { value: C9r},
        [id + '_p']: { value: _p },
      })
    }
    eYo.dlgt.declareDlgt(_p) // computed properties `eyo`
    _p.doPrepare = _p.doInit = eYo.doNothing
  }
  let eyo = eYo.dlgt.new(ns, id, C9r, model)
  eyo === C9r.eyo || eYo.throw('MISSED')
  C9r.makeSubC9r = eyo.makeSubC9r.bind(eyo)
  return C9r
}

/**
 * This decorator turns `f` with signature
 * function (ns, id, Super, model) {...}
 * into
 * function ([ns], [id], [Super], [register], [model]) {...}.
 * Both functions have `this` bound to a namespace.
 * If argument `ns` is not provided, just replace it with the receiver.
 * `Super` will be given a default value when there are arguments.
 * @param{Function} f
 * @this{undefined}
 */
eYo.c9r._p.makeC9rDecorate = (f) => {
  return function (ns, id, Super, register, model) {
    // makeC9rDecorate
    if (ns !== eYo.NULL_NS && !eYo.isNS(ns)) {
      if(model) {
        console.error('BREAK HERE!!!')
      }
      model && eYo.throw(`Unexpected model(1): ${model}`)
      ;[ns, id, Super, register, model] = [this, ns, id, Super, register]
    }
    if (!eYo.isStr(id)) {
      model && eYo.throw(`Unexpected model (2): ${model}`)
      ;[id, Super, register, model] = [eYo.NA, id, Super, register]
    }
    // Default value for Super, when there are arguments
    if (Super && !eYo.isC9r(Super)) {
      model && eYo.throw(`Unexpected model (3): ${model}`)
      ;[Super, register, model] = [eYo.asF(id && this[id]) || this.BaseC9r, Super, register]
    }
    if (!eYo.isBool(register)) {
      model && eYo.throw(`Unexpected model (4): ${model}`)
      ;[register, model] = [false, register]
    }
    model = eYo.called(model) || {}
    if (eYo.isStr(id)) {
      eYo.isNA(Super) && (Super = eYo.asF(id && this[id]) || this.BaseC9r)
    } else {
      id = Super && Super.eyo && Super.eyo.id || ''
    }
    if (eYo.isSubclass(this.BaseC9r, Super)) {
      Super = this.BaseC9r
    }
    !eYo.isNS(ns) || !eYo.isStr(id) && eYo.throw('Missing id in makeC9rDecorate')
    let C9r = f.call(this, ns, id, Super, model)
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
 * @param {String} id -  The id.
 * @param {Function} [Super] -  The eventual super class. There is no default value. Must be a subclass of `eYo.c9r.BaseC9r`, but not necessarily with an `eyo`.
 * @param {Object|Function} [model] -  The dictionary of parameters. Or a function to create such a dictionary. This might be overcomplicated.
 * @return {Function} the created constructor.
 */
eYo.c9r._p.makeC9r = eYo.c9r.makeC9rDecorate(function (ns, id, Super, model) {
  return this.doMakeC9r(ns, id, Super, model)
})
}
// ANCHOR Constructor utilities
{
  /**
   * All the created constructors, by name. Private storage.
   * @package
   */
  eYo.c9r.byName__ = new Map()

  /**
   * All the created constructors, by id. Private storage.
   * @package
   */
  eYo.c9r.byId__ = new Map()

  /**
   * All the created constructors, by type. Private storage.
   * @package
   */
  eYo.c9r.byType__ = new Map()

  /**
   * All the created delegates. Public accessor by key.
   * @param{String} id - the key used to create the constructor.
   */
  eYo.c9r.forId = (id) => {
    return eYo.c9r.byId__.get(id)
  }

  /**
   * All the created delegates. Public accessor by name.
   * @param{String} name - the name used to create the constructor.
   */
  eYo.c9r.forName = (name) => {
    return eYo.c9r.byName__.get(name)
  }

  /**
   * All the created delegates. Public accessor by type.
   * @param{String} type - the type used to create the constructor.
   */
  eYo.c9r.forType = (type) => {
    return eYo.c9r.byType__.get(type)
  }

  /**
   * @type{Array<String>}
   * @property{types}
   */
  Object.defineProperty(eYo.c9r._p, 'types', eYo.descriptorR(function () {
    return eYo.c9r.byType__.keys()
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
  eYo.c9r._p.register = function (id, C9r) {
    if (!eYo.isStr(id)) {
      C9r && eYo.throw(`UNEXPECTED ${C9r}`)
      ;[id, C9r] = [C9r.eyo.id, id]
    }
    var type
    if ((type = eYo.t3.expr[id])) {
      eYo.t3.expr.available.push(type)
    } else if ((type = eYo.t3.stmt[id])) {
      eYo.t3.stmt.available.push(type)
    }
    var eyo = C9r.eyo
    var id = eyo.id
    id && eYo.c9r.byId__.set(id, C9r)
    var name = eyo.name
    name && eYo.c9r.byName__.set(name, C9r)
    if (type) {
      eYo.c9r.byType__.set(type, C9r)
      // cache all the input, output and statement data at the prototype level
    }
  }
}
// ANCHOR eYo._p.makeDlgt
{
  let _p = eYo.dlgt.BaseC9r_p
  /**
   * This decorator turns f with signature
   * function (ns, id, Super, model) {}
   * into
   * function ([ns], [id], [model]) {}.
   * After decoration, a call to the resulting function is equivalent to a makeC9r,
   * the Super being the receiver's C9r.
   * Both functions belong to the namespace context,
   * id est `this` is a namespace.
   * This decorator and the decorated function have a namespace as `this` object.
   * @param{Function} f - the Dlgt constructor maker to decorate.
   */
  _p.makeSubC9rDecorate = (f) => {
    return function (ns, id, register, model) {
      var Super = this.C9r
      if (ns && !eYo.isNS(ns)) {
        model && eYo.throw(`Unexpected model (1): ${model}`)
        model = register
        register = id
        id = ns
        ns = this.ns
      }
      if (!eYo.isStr(id)) {
        model && eYo.throw(`Unexpected model (2): ${model}`)
        model = register
        register = id
        id = ns ? this.key : ''
      }
      var ff = (this.ns||eYo.c9r).makeC9rDecorate(f)
      return ff.call(this.ns||eYo.c9r, ns, id, Super, register, model)
    }
  }

  /**
   * Convenient shortcut to create subclasses.
   * Forwards to the namespace which must exist!
   * @param {Object} [ns] -  The namespace, possibly `eYo.NA`.
   * @param {String} id -  to create `ns[id]`
   * @param {Object} [model] -  Model object
   * @return {?Function} the constructor created or `eYo.NA` when the receiver has no namespace.
   * @this {eYo.dlgt.BaseC9r}
   */
  _p.makeSubC9r = _p.makeSubC9rDecorate(function (ns, id, Super, model) {
    return this.doMakeC9r(ns, id, Super, model)
  })
}

// ANCHOR Base
{
  /**
   * Convenient method to create the Base class.
   * @param {Boolean} [unfinalize] - whether not to finalize the constructor or not
   * @param {Function} [Super] - the ancestor class
   * @param {Object} [model] - the model
   */
  eYo.c9r._p.makeBaseC9r = function (unfinalize, Super, model) {
    this.hasOwnProperty('BaseC9r') && eYo.throw(`${this.name}: Already Base`)
    if (!eYo.isBool(unfinalize)) {
      eYo.isDef(model) && eYo.throw(`${this.name}/makeBaseC9r Unexpected last argument: ${model}`)
      ;[unfinalize, Super, model] = [false, unfinalize, Super]
    }
    if (eYo.isC9r(Super)) {
      model = eYo.called(model) || {}
    } else {
      eYo.isDef(model) && eYo.throw(`${this.name}/makeBaseC9r Unexpected argument: ${model}`)
      ;[Super, model] = [
        this.super && this.super.BaseC9r || eYo.NA,
        eYo.called(Super) || {},
      ]
    }
    let C9r = this.makeC9r(this, 'BaseC9r', Super, model || {})
    let s = this.parent
    if (s && this.key) {
      s[eYo.do.toTitleCase(this.key)] = C9r
    }
    Object.defineProperties(this, {
      'Dlgt_p': eYo.descriptorR(function () {
        return C9r.eyo_p
      }),
      'Dlgt': eYo.descriptorR(function () {
        return C9r.eyo_p.constructor
      }),
    })
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
   * @name {eYo.c9r.BaseC9r}
   * @constructor
   */
  eYo.c9r.makeBaseC9r(true)

  eYo.mixinR(eYo._p, {
    /**
     * Whether the argument is a property instance.
     * @param {*} what 
     */
    isaC9r (what) {
      return !!what && what instanceof eYo.c9r.BaseC9r
      //<<< mochai: isaC9r (what)
      //... chai.expect(eYo.isaC9r(true)).false
      //... chai.expect(eYo.isaC9r(new eYo.c9r.BaseC9r())).true
      //>>>
    }
  }, false)
  
  
  /**
   * Prepare an instance.
   * Default implementation forwards to the delegate.
   * One shot method: any subsequent call is useless.
   */
  eYo.c9r.BaseC9r_p.doPrepare = function (...args) {
    this.doPrepare = eYo.doNothing
    this.eyo.prepareInstance(this, ...args)
  }
  
  /**
   * Prepare an instance.
   * Default implementation does nothing.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  eYo.c9r.BaseC9r_p.doInit = function (...args) {
    this.doInit = eYo.doNothing
    this.eyo.initInstance(this, ...args)
  }
  /**
   * Convenience shortcut to the model
   */
  Object.defineProperties(eYo.c9r.BaseC9r_p, {
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
  eYo.model.forId = (id) => {
    var C9r = eYo.c9r.byId__[id]
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
 * For subclassers.
 * @param {String} [key] - 
 * @param {Object} model - model object
 */
eYo.c9r.Dlgt_p.modelHandle = function (key, model) {
}

/**
 * Get the inherited method with the given name.
 * @param {String} methodName
 * @param {Boolean} up - starts with the prototype or the inherited prototype
 * @return {Function} It never returns `this[methodName]`.
 */
eYo.c9r.BaseC9r_p.inheritedMethod = eYo.c9r.Dlgt_p.inheritedMethod = function (methodName, up) {
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
 * The model Base used to derive a new class.
 * @see The `new` method.
 * @param {Object} model
 * @param {String} key
 */
eYo.c9r._p.modelBaseC9r = function (model, key) {
  return this.BaseC9r
}

/**
 * Create a new constructor based on the model.
 * No need to subclass.
 * Instead, override `Base` and `modelHandle`.
 * @param {Object} model
 * @param {Function} [SuperC9r]
 * @param {Boolean} [register]
 * @param {String} key
 */
eYo.c9r._p.modelMakeC9r = function (model, SuperC9r, register, key) {
  if (!eYo.isC9r(SuperC9r)) {
    eYo.isDef(key) && eYo.throw(`eYo.o3d._p.modelMakeC9r: Unexpected parameter ${key}`)
    ;[SuperC9r, register, key] = [eYo.NA, SuperC9r, register]
  }
  if (!eYo.isBool(register)) {
    eYo.isDef(key) && eYo.throw(`eYo.o3d._p.modelMakeC9r: Unexpected parameter ${key}`)
    ;[register, key] = [false, register]
  }
  let C9r = this.makeC9r(
    '',
    SuperC9r || this.modelBaseC9r(model, key),
    model
  )
  C9r.eyo.shouldFinalizeC9r && C9r.eyo.finalizeC9r()
  model = C9r.eyo.model
  model._C9r = C9r
  model._starters = []
  C9r.eyo.modelHandle(key)
  Object.defineProperty(C9r.eyo, 'name', eYo.descriptorR(function () {
    return `${C9r.eyo.super.name}(${key || '...'})`
  }))
  register && this.register(C9r)
  return C9r
}

/**
 * Create a new Base instance based on the model
 * @param {Object} [model] - Optional model, 
 * @param {Object} [SuperC9r] - Optional super constructor, only when there is a mode given 
 */
eYo.c9r._p.prepare = function (model, SuperC9r, ...$) {
  if (!eYo.isD(model)) {
    var C9r = this.BaseC9r
    if (C9r.eyo.shouldFinalizeC9r) {
      C9r.eyo.finalizeC9r()
    }
    return new C9r(model, SuperC9r, ...$)
  }
  C9r = model._C9r
  if (eYo.isC9r(SuperC9r)) {
    if (!C9r) {
      C9r = this.modelMakeC9r(model, SuperC9r)
    }
    var ans = new C9r(...$)
  } else {
    if (!C9r) {
      C9r = this.modelMakeC9r(model, ...$)
    }
    ans = new C9r(SuperC9r, ...$)
  }
  ans.preInit = function () {
    delete this.preInit
    model._starters.forEach(f => f(this))
  }
  return ans
}

/**
 * Create a new Base instance based on the model
 */
eYo.c9r._p.new = function (...$) {
  let ans = this.prepare(...$)
  ans.preInit && ans.preInit()
  return ans
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
 * @param {Object} id - the result will be `NS[id]`
 * @param {Object} model
 */
eYo.c9r._p.makeSingleton = function(NS, id, model) {
  if (!eYo.isNS(NS)) {
    id && eYo.throw(`Unexpected model: ${model}`)
    ;[NS, model, id] = [this, NS, model]
  }
  eYo.isStr(id) || eYo.throw(`Unexpected parameter ${id}`)
  let ans = new (this.makeC9r('', model))()
  Object.defineProperty(NS, id, eYo.descriptorR(function() {
    return ans
  }))
}

// ANCHOR: Model

// Prepares the constructors.

eYo.c9r.BaseC9r.eyo.finalizeC9r(
  //<<< mochai: eYo.c9r.BaseC9r.eyo.finalizeC9r
  eYo.model.manyDescriptorF('dlgt', 'init'),
  //... ;['dlgt', 'init'].forEach(K => {
  //...   eYo.c9r.new({
  //...     [K]: eYo.doNothing
  //...   })
  //...   eYo.c9r.new({
  //...     [K]: eYo.NA
  //...   })
  //...   chai.expect(() => {
  //...     eYo.c9r.new({
  //...       [K]: 421
  //...     })
  //...   }).throw()
  //... })
  eYo.model.manyDescriptorForFalse('dispose'),
  {
    methods: {
      [eYo.model.VALIDATE]: eYo.model.validateD,
      //... eYo.c9r.new({
      //...   methods: eYo.NA
      //... })
      //... chai.expect(() => {
      //...   eYo.c9r.new({
      //...     methods: 421,
      //...   })
      //... }).throw()
      [eYo.model.ANY]: eYo.model.descriptorF(),
      //... eYo.c9r.new({
      //...   methods: {
      //...     foo: eYo.NA,
      //...     chi () {},
      //...   }
      //... })
      //... chai.expect(() => {
      //...   eYo.c9r.new({
      //...     methods: {
      //...       mi: 421,
      //...     },
      //...   })
      //... }).throw()
    },
    CONSTs: {
      [eYo.model.VALIDATE]: eYo.model.validateD,
      //... eYo.c9r.new({
      //...   CONSTs: eYo.NA
      //... })
      //... chai.expect(() => {
      //...   eYo.c9r.new({
      //...     CONSTs: 421,
      //...   })
      //... }).throw()
      [eYo.model.ANY]: {
        [eYo.model.VALIDATE]: function (before, key) {
          if (key) {
            if (!XRegExp.exec(key, eYo.xre.CONST)) {
              return eYo.INVALID
            }
          }
          //... eYo.c9r.new({
          //...   CONSTs: {
          //...     CONST_421: 421,
          //...   }
          //... })
          //... chai.expect(() => {
          //...   eYo.c9r.new({
          //...     CONSTs: {
          //...       cCONST_421: 421,
          //...     },
          //...   })
          //... }).throw()
        }
      },
    },
  }
  //>>>
)

//>>>