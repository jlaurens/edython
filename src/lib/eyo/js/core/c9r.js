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

eYo.require('Do')
eYo.require('T3')

/**
 * Management of constructors and models.
 * Models are trees with some inheritancy.
 * @name {eYo.C9r}
 * @namespace
 */
eYo.makeNS('C9r')

/**
 * The model management.
 * Models are trees with some inheritancy.
 * @name {eYo.C9r.Model}
 * @namespace
 */
eYo.C9r.makeNS('Model')

/**
 * Whether the argument is a model object once created with `{...}` syntax.
 * @param {*} what
 */
eYo.C9r.isModel = (what) => {
  return what && (what.model__ || eYo.isO(what))
}

/**
 * Allowed keys by path pattern
 * @param {String} path - Dot separated path components
 * @param {String} key - Dotless path components
 * @return {Boolean} Whether the key is authorized with the given path.
 */
eYo.C9r.Model.isAllowed = (path, key) => {
  var allowed = {
    ['']: [
      'init', 'deinit', 'dispose', 'ui',
      'owned', 'computed', 'linked', 'cached', 'clonable', 'link',
      'xml', 'data', 'slots',
      'out', 'head', 'left', 'right', 'suite', 'foot'
    ],
    [/ui/]: [
      'init', 'dispose'
    ],
    [/owned\.\w+/]: [
      'value', 'init',
      'validate', 'willChange', 'didChange'
    ],
    [/computed\.\w+/]: [
      'get', 'set', 'get_', 'set_', 'get__', 'set__',
      'validate', 'willChange', 'didChange'
    ],
    [/linked\.\w+/]: [
      'value', 'init', 'get', 'set', 'get_', 'set_',
      'validate', 'willChange', 'didChange'
    ],
    [/cached\.\w+/]: [
      'lazy', 'value', 'init',
      'validate', 'willChange', 'didChange'
    ],
    [/clonable\.\w+/]: [
      'lazy', 'value', 'init',
      'validate', 'willChange', 'didChange'
    ],
    [/xml/]: [
      'types', 'attribute'
    ],
    [/data\.\w+/]: [
      'order', // INTEGER
      'all', // TYPE || [TYPE], // last is expected
      'main', // BOOLEAN
      'init', // () => {} || VALUE, !!! are function supported ?
      'placeholder', // STRING
      'validate', // () => {} || false || true,
      'consolidate', // () => {}
      'validateIncog', // () => {}
      'willChange', // () => {}
      'isChanging', // () => {}
      'didChange', // () => {}
      'willLoad', // () => {}
      'didLoad', // () => {}
      'fromType', // () => {}
      'fromField', // () => {}
      'toField', // () => {}
      'noUndo', // true
    ],
    [/slots\.\w+/]: [
      'order', // INTEGER,
      'fields', // {},
      'check', // :  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
      'promise', // : eYo.T3.Expr.value_list,
      'validateIncog', //  () {},
      'accept', //  () {},
      'didConnect', //  () {},
      'didDisconnect', //  () {},
      'wrap', // : TYPE,
      'xml', // : (() => {} || true) || false||  first expected,
      'plugged', // : eYo.T3.Expr.primary,
    ],
    [/slots\.\w+\.fields\.\w+/]: [
      'value', // '(',
      'reserved', // : '.',
      'separator', // : true,
      'variable', // : true,
      'validate', // : true,
      'endEditing', // : true,
      'willRender', //  () => {},
    ],
    [/slots\.\w+\.xml/]: [
      'accept', //  () => {},
    ],
  }
  for (var k in allowed) {
    if (XRegExp.match(path, k)) {
      return key in allowed[k]
    }
  }
  return false
}

/**
 * @param {Object} model - the tree in which we replace some node by objects
 * @param {Function} handler - a function with signature (path, before): boolean
 */
eYo.C9r.Model.expandShortcuts = (model, handler) => {
  var do_it = (model, path) => {
    eYo.isO(model) && Object.keys(model).forEach(k => {
      handler(model, path, k) || do_it(model[k], path && `${path}.${k}` || k)
    })
  }
  do_it(model, '')
}
/**
 * @param {Object} model
 * @param {String} path
 * @param {String} key
 */
eYo.C9r.Model.shortcutsBaseHandler = (model, path, key) => {
  var ensureCheck = (x) => {
    if (eYo.isArray(x)) {
      return function () {
        return x
      }
    } else if (eYo.isF(x)) {
      return x
    } else {
      return function () {
        return [x]
      }
    }
  }
  var after
  if (path === '') {
    if (key === 'owned') {
      var before = model[key]
      if (eYo.isStr(before)) {
        after = {[key]: {}}
      } else if (goog.isArray(before)) {
        var d = after = {}
        before.forEach(k => {
          d[k] = {}
        })
      }
    } else if (key in ['out', 'head', 'left', 'right', 'suite', 'foot']) {
      // BRICK_TYPE || [BRICK_TYPE] || () => {}
      var before = model[key]
      if (!eYo.isO(before)) {
        after = {
          check: ensureCheck(before)
        }
      }
    }
  } else if (path === 'owned') {
    var before = model[key]
    if (eYo.isF(before)) {
      after = { init: before }
    } else if (!eYo.isO(before)) {
      after = { value: before }
    }
  } else if (path === 'computed') {
    var before = model[key]
    if (eYo.isF(before)) {
      after = {
        get: before
      }
    }
  } else if (path in ['linked', 'cached', 'clonable']) {
    var before = model[key]
    if (eYo.isF(before)) {
      after = {
        init: before
      }
    } else if (!eYo.isO(before)) {
      after = {
        value: before
      }
    }
  } else if (path in ['out', 'list', 'head', 'left', 'right', 'suite', 'foot']) {
    if (key === 'check') {
      // BRICK_TYPE || [BRICK_TYPE] || () => {}
      after = ensureCheck(model[key])
    }
  } else if (key === 'all') {
    var before = model[key]
    if (!goog.isArray(before)) {
      after = [before]
    }
  } else if (XRegExp.match(path, /Slots\.\\w+\.fields/)) {
    var before = model[key]
    if (eYo.isStr(before)) {
      after = {
        value: before
      }
    }
  } else if (XRegExp.match(path, /Slots\.\\w+\.fields\.\w+/)) {
    var before = model[key]
    if (key in ['reserved', 'variable', 'separator']) {
      if (eYo.isStr(before)) {
        after = true
        model.value = before
      }
    }
  } else if (key === 'xml') {
    var before = model[key]
    if (eYo.isF(before)) {
      after = {
        accept: before
      }
    }
  }
  if (after !== eYo.NA) {
    model[key] = after
    return true
  }
}
/**
 * A model proxy handler, mainly necessary to mimic multiple inheritance on brick model objects.
 * 
 * @param {Function} C9r - the constructor
 * @param {Object} model - and its model
 * @param {Object} [linkC9r] - and its linked constructor
 */
/*
eYo.C9r.Model.Handler = (model, C9r, linkC9r) => {

  this.model__ = model
  return {
  //   getPrototypeOf(target) {
  //     return monsterPrototype;
  //   },
  //   setPrototypeOf(monster1, monsterProto) {
  //     monster1.geneticallyModified = true;
  //     return false;
  //   },
  //   isExtensible(target) {
  //     return Reflect.isExtensible(target);
  //   },
  //   preventExtensions(target) {
  //     target.canEvolve = false;
  //     return Reflect.preventExtensions(target);
  //   },
  //   getOwnPropertyDescriptor(target, prop) {
  //     console.log(`called: ${prop}`);
  //     // expected output: "called: eyeCount"
  
  //     return { configurable: true, enumerable: true, value: 5 };
  //   },
  //   defineProperty(target, key, descriptor) {
  //     invariant(key, 'define');
  //     return true;
  //   },
  // /*
  // function invariant(key, action) {
  //   if (key[0] === '_') {
  //     throw new Error(`Invalid attempt to ${action} private "${key}" property`);
  //   }
  // }
  // *//*  }
}
*/

/**
 * Make `model` inherit from model `base`.
 * @param {Object} model_  a tree of properties
 * @param {Object} base  a tree of properties
 */
eYo.C9r.Model.inherits = (model, base) => {
  var do_it = (model_, base_) => {
    if (eYo.isO(model_) && eYo.C9r.isModel(base_)) {
      eYo.parameterAssert(!model_.model__, `Already inheritance: ${model}`)
      Object.keys(model_).forEach(k => {do_it(model_[k], base_[k])})
      Object.setPrototypeOf(model_, base_)
      eYo.assert(Object.getPrototypeOf(model_) === base_, `Unexpected ${Object.getPrototypeOf(model_)} !== ${base_}`)
      model_.model__ = model
    }
  }
  do_it(model, base)
}
/**
 * Make `model` extend model `base`.
 * @param {Object} model_  a tree of properties
 * @param {Object} from_  a tree of properties
 */
eYo.C9r.Model.extends = (model, base) => {
  var do_it = (model_, base_, path) => {
    // if (eYo.isO(model_) && eYo.C9r.isModel(from_)) {
    //   for (var k in model_) {
    //     ignore && ignore(k) || do_it(model_[k], from_[k], ignore)
    //   }
    //   Object.setPrototypeOf(model_, from_)
    //   eYo.assert(Object.getPrototypeOf(model_) === from_, `Unexpected ${Object.getPrototypeOf(model_)} !== ${from_}`)
    //   model_.model__ = model
    // }
    if (eYo.isO(model_) && eYo.isO(base_)) {
      for (var k in base_) {
        if (!eYo.C9r.Model.isAllowed(path, k)) {
          console.warn(`Attempting to use ${path}.${k} in a model`)
          return
        }
        if (model[k] === eYo.NA) {
          var after = base[k]
          model[k] = eYo.isO(after) ? {} : after
        }
        do_it(model_[k], base_[k], 'path && `${path}.${k}` || k')
      }
    }
  }
  do_it(model, base, '')
  return
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

Object.defineProperty(eYo.C9r_p, 'types', {
  get () { return Object.keys(eYo.C9r.byType__) }
})

/**
 * All the created delegates.
 * @param{String} key - the key used to create the constructor.
 */
eYo.C9r.Model.forKey = (key) => {
  var C9r = eYo.C9r.byKey(key)
  return C9r && C9r.eyo.model
}

/**
 * All the created delegates.
 * @param{String} name - the key used to create the constructor.
 */
eYo.C9r.Model.forName = (name) => {
  var C9r = eYo.C9r.byName(name)
  return C9r && C9r.eyo.model
}

/**
 * All the created delegates.
 * @param{String} type - the key used to create the constructor.
 */
eYo.C9r.Model.forType = (type) => {
  var C9r = eYo.C9r.byType(type)
  return C9r && C9r.eyo.model
}

/**
 * Delegate registrator.
 * The constructor has an eyo attached object for
 * some kind of introspection.
 * Computes and caches the model
 * only once from the creation of the delegate.
 *
 * The last delegate registered for a given prototype name wins.
 * @param {!String} type - the optional type
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
 * @property {Set<String>} linked_ - Set of link identifiers. Lazy initializer.
 * @readonly
 * @property {Set<String>} owned_ - Set of link identifiers. Lazy initializer.
 * @readonly
 * @property {Set<String>} clonable_ - Set of link identifiers. Lazy initializer.
 * @readonly
 * @property {Set<String>} cached_ - Set of cached identifiers. Lazy initializer.
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
        eYo.parameterAssert(
          eYo.isSubclass(ns.constructor, eYo.constructor),
          'Bad namespace',
        )
      }
      if (!eYo.isStr(key)) {
        model = C9r
        C9r = key
        key = eYo.NA
      }
      eYo.parameterAssert(
        C9r,
        'Missing constructor',
      )
    // compatibility
      var pttp = C9r.superClass_
      if (pttp) {
        var dlgt = pttp.constructor.eyo__
        dlgt && eYo.parameterAssert(
          eYo.isSubclass(this.constructor, dlgt.constructor),
          `Wrong subclass delegate: ${dlgt.name}, ${this.constructor.eyo.name} not a subclass ${dlgt.constructor.eyo.name}`,
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
        eYo.C9r.Model.expandShortcuts(model, eYo.C9r.Model.shortcutsBaseHandler)
        model.eyo__ = this
        this.props__ = new Set()
        model.CONST && this.CONSTDeclare(model.CONST)
        model.linked && this.linkedDeclare(model.linked)
        model.owned && this.ownedDeclare(model.owned)
        model.cached && this.cachedDeclare(model.cached)
        model.clonable && this.clonableDeclare(model.clonable)
        model.computed && this.computedDeclare(model.computed)
        // eYo.C9r.Model.inherits(model, this.super && this.super.model)
      }
    }
  },
  Dlgt_p: {
    get () {
      return this.Dlgt_p
    }
  }
})

// convenient variable
Object.defineProperties(eYo.Dlgt_p, {
  C9r: eYo.Do.propertyR(function () {
    return this.C9r_
  }),
  C9r_: {
    get () {
      return this.C9r__
    },
    set (after) {
      this.C9r__ = after
    }
  },
  key: eYo.Do.propertyR(function () {
    return this.key__
  }),
  key_: eYo.Do.propertyR(function () {
    return this.key__
  }),
  ns: eYo.Do.propertyR(function () {
    return this.ns__
  }),
  ns_: eYo.Do.propertyR(function () {
    return this.ns__
  }),
  model: eYo.Do.propertyR(function () {
    return this.model__
  }),
  model_: eYo.Do.propertyR(function () {
    return this.model__
  }),
  name: eYo.Do.propertyR(function () {
    return this.ns__ && this.key && `${this.ns__.name}.${this.key}` || this.key
  }),
  name_: {
    get: eYo.Do.noGetter('name_'),
    set: eYo.Do.noSetter('name_'),
  },
  name__: {
    get: eYo.Do.noGetter('name__'),
    set: eYo.Do.noSetter('name__'),
  },
  super: eYo.Do.propertyR(function () {
    var C9r = this.C9r.superClass_
    return C9r && C9r.constructor.eyo__
  }),
})

;['owned', 'clonable', 'linked', 'cached'].forEach(k => {
  var k_ = k + '_'
  var k__ = k + '__'
  Object.defineProperty(eYo.Dlgt_p, k_, {
    get () {
      return this[k__] || (this[k__] = new Set())
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
  // name = 'some' + K
  // pttp[name] = function (f) {
  //   return this[k__] && this[k__].some(f)
  // }
})

/**
 * Initialize an instance with link, cached, owned and clonable properties.
 * Default implementation forwards to super.
 * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
 */
eYo.Dlgt_p.initInstance = function (object) {
  var suffix = '__'
  var f = k => {
    Object.defineProperty(object, k, eYo.Do.propertyR(function () {
      return this[k + suffix]
    }))
  }
  this.linkedForEach(f)
  this.ownedForEach(f)
  this.clonableForEach(f)
  suffix = '_'
  this.cachedForEach(f)
  var f = k => {
    var init = this.init_ && this.init_[k] || object[k+'Init']
    if (init) {
      var k__ = k + '__'
      object[k__] = init.call(this)
    }
  }
  this.ownedForEach(f)
  this.clonableForEach(f)
  this.linkedForEach(f)
}

/**
 * Dispose of the resources declared at that level.
 * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
 */
eYo.Dlgt_p.disposeInstance = function (object) {
  this.linkedClear_(object)
  this.cachedForget_(object)
  this.ownedDispose_(object)
  this.clonableDispose_(object)
}

/**
 * Register the `init` method  in the model, to be used when necessary.
 * @param {String} k name of the link to add
 * @param {Object} model Object with `init` key, eventually.
 */
eYo.Dlgt_p.registerInit = function (k, model) {
  var init = (eYo.isF(model) && model) || (eYo.isF(model.init) && model.init)
  if (init) {
    !this.init_ && (this.init_ = Object.create(null))
    this.init_[k] = init
  } 
}

/**
 * Register the `disposer` method  in the model, to be used when necessary.
 * See the `ownedDispose` method for more informations.
 * @param {String} k name of the link to add
 * @param {Object} model Object with `disposer` key, eventually.
 */
eYo.Dlgt_p.registerDisposer = function (k, model) {
  var disposer = eYo.isF(model.disposer) && model.disposer
  if (disposer) {
    !this.disposer_ && (this.disposer_ = Object.create(null))
    this.disposer_[k] = disposer
  } 
}

/**
 * Add a link property.
 * The receiver is not the owner.
 * @param {String} k name of the link to add
 * @param {Object} model Object with `willChange` and `didChange` keys,
 * f any.
 */
eYo.Dlgt_p.CONSTDeclare = function (k, model = {}) {
  Object.keys(model).forEach(k => {
    var m = model[k]
    Object.defineProperty(this.C9r_, k, eYo.isO(m) ? m : {
      value: m,
      writable: false,
    })
  })
}

/**
 * Add a link property.
 * The receiver is not the owner.
 * @param {String} k name of the link to add
 * @param {Object} model Object with `willChange` and `didChange` keys,
 * f any.
 */
eYo.Dlgt_p.linkedDeclare_ = function (k, model = {}) {
  eYo.parameterAssert(!this.props__.has(k))
  this.linked_.add(k)
  const proto = this.C9r_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  this.registerInit(k, model)
  try {
    Object.defineProperty(proto, k__, {
      value: model.value || eYo.NA,
      writable: true
    })
  } catch(e) {
    console.error(`FAILURE: linked property ${k__}`)
  }
  try {
    Object.defineProperty(proto, k_, {
      get: model.get_ || function () {
        return this[k__]
      },
      set: model.set_ || function (after) {
        var before = this[k__]
        var f = model.validate
        f && (after = f.call(this, before, after))
        f = this[k + 'Validate']
        f && (after = f.call(this, before, after))
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
    })
  } catch(e) {
    console.error(`FAILURE: linked property ${k_}`)
  }
  try {
    Object.defineProperty(proto, k, {
      get: model.get || function () {
        return this[k_]
      },
      set: model.set || eYo.Do.noSetter(k_),
    })
  } catch(e) {
    console.error(`FAILURE: linked property ${k}`)
  }
}

/**
 * Add a link properties.
 * The receiver is not the owner.
 * @param {Object} constructor -  Its prototype object gains a storage named `foo__` and both getters and setters for `foo_`.
 * The initial value is `eYo.NA`.
 * @param {Array<String>} names names of the link to add
 */
eYo.Dlgt_p.linkedDeclare = function (model) {
  if (model.forEach) {
    model.forEach(k => {
      this.linkedDeclare_(k)
    })
  } else {
    Object.keys(model).forEach(k => {
      this.linkedDeclare_(k, model[k])
    })
  }
}

/**
 * Dispose in the given object, the link given by the constructor.
 * @param {Object} object -  an instance of the receiver's constructor,
 * or one of its subclasses.
 */
eYo.Dlgt_p.linkedClear_ = function (object) {
  this.linkedForEach(k => {
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
 * @param {Object} data -  the object used to define the property: key `value` for the initial value, key `willChange` to be called when the property is about to change (signature (before, after) => function, truthy when the change should take place). The returned value is a function called after the change has been made in memory.
 */
eYo.Dlgt_p.declareOwned_ = function (k, model = {}) {
  eYo.parameterAssert(!this.props__.has(k))
  this.owned_.add(k)
  const proto = this.C9r_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  this.registerInit(k, model)
  this.registerDisposer(k, model)
  Object.defineProperties(proto, {
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
        f && (after = f.call(this, before, after))
        var ff = this[k + 'Validate']
        ff && (after = ff.call(this, before, after))
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
    }
  })
}

/**
 * Add an owned property.
 * The receiver is the owner.
 * @param {Object} many  key -> data map.
 */
eYo.Dlgt_p.ownedDeclare = function (many) {
  if (many.forEach) {
    many.forEach(k => {
      this.declareOwned_(k)
    })
  } else {
    Object.keys(many).forEach(k => {
      this.declareOwned_(k, many[k])
    })  
  }
}

/**
 * Dispose in the given object, the properties given by their main name.
 * @param {Object} object - the object that owns the property. The other parameters are forwarded to the dispose method.
 */
eYo.Dlgt_p.ownedDispose_ = function (object, ...params) {
  this.ownedForEach(k => {
    var k_ = k + '_'
    var k__ = k + '__'
    var x = object[k__]
    if (x) {
      object[k_] = eYo.NA
      x.dispose(...params)
    }
  })
}

/**
 * Add a 2 levels cached property to the receiver's constructor's prototype.
 * @param {String} key -  the key
 * @param {Object} model -  the model object, must have a `init` key and
 * may have a `forget` or an `update` key.
 * Both are functions called in the contect of the owner
 * (`this` is the owner). `init` takes no arguments.
 * `forget` takes only one argument: the concrete forgetter.
 * `update` arguments are the value before, the value after
 * (computed from the `init`) and the updater which is the function
 * that effectively set the new value.
 * It may take one argument to override the proposed after value.
 */
eYo.Dlgt_p.declareCached_ = function (k, model) {
  eYo.parameterAssert(!this.props__.has(k))
  this.cached_.add(k)
  var proto = this.C9r_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  model.lazy || this.registerInit(k, model)
  Object.defineProperties(proto, {
    [k__]: {value: eYo.NA, writable: true},
    [k_]: {
      get: model.lazy
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
        f && (after = f.call(this, before, after))
        var ff = this[k + 'Validate']
        ff && (after = ff.call(this, before, after))
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
      }
    }
  })
  this.forget_ || (this.forget_ = Object.create(null))
  proto[k+'Forget'] = this.forget_[k] = model.forget
  ? function () {
    model.forget.call(this, () => {
      this[k_] = eYo.NA
    })
  } : function () {
    this[k_] = eYo.NA
  }
  this.updateCached_ || (this.updateCached_ = Object.create(null))
  proto[k+'Update'] = this.updateCached_[k] = model.update
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
}

/**
 * Add 3 levels cached properties to a prototype.
 * @param {Object} many -  the K => V mapping to which we apply `declareCached_(K, V)`.
 */
eYo.Dlgt_p.cachedDeclare = function (many) {
  Object.keys(many).forEach(n => {
    this.declareCached_(n, many[n])
  })
}

/**
 * Forget all the cached values.
 */
eYo.Dlgt_p.cachedForget_ = function () {
  this.cachedForEach(n => {
    this.forget_[n].call(this)
  })
}

/**
 * Add computed properties to a prototype.
 * @param {Map<String, Function>} models,  the key => Function mapping.
 */
eYo.Dlgt_p.computedDeclare = function (models) {
  console.warn('computedDeclare:', this.name, Object.keys(models))
  Object.keys(models).forEach(k => {
    console.warn('computedDeclare -> ', k)
    const proto = this.C9r_.prototype
    var k_ = k + '_'
    var k__ = k + '__'
    eYo.parameterAssert(k && !this.props__.has(k), `ERROR: ${k} is already a property of ${this.name}`)
    eYo.parameterAssert(!this.props__.has(k_), `ERROR: ${k_} is already a property of ${this.name}`)
    eYo.parameterAssert(!this.props__.has(k__), `ERROR: ${k__} is already a property of ${this.name}`)
    try {
      var model = models[k]
      var get = model.get || eYo.asF(model)
      var set = model.set
      Object.defineProperty(proto, k, set ?
        {
          get: get,
          set: eYo.Do.noSetter(k),
        } : {
          get: get,
          set: set,
        }
      )
      k = k_
      get = eYo.asF(model.get_) || function () {
        return this[k__]
      }
      set = model.set_
      Object.defineProperty(proto, k, get ? set ? {
          get: get,
          set: set,
        } : {
          get: get,
          set: eYo.Do.noSetter(k),
        } : set ? {
          get: eYo.Do.noGetter(k),
          set: set,
        } : {
          get: eYo.Do.noGetter(k),
          set: eYo.Do.noSetter(k),
        }
      )
      k = k__
      get = model.get__
      set = model.set__
      Object.defineProperty(proto, k, get ? set ? {
          get: get,
          set: set,
        } : {
          get: get,
          set: eYo.Do.noSetter(k),
        }
        : set ? {
          get: eYo.Do.noGetter(k),
          set: set,
        } : {
          get: eYo.Do.noGetter(k),
          set: eYo.Do.noSetter(k),
        }
      )
    } catch (e) {
      console.warn(`Computed property problem, ${k}, ${this.name_}, ${e}`)
      console.error(`Computed property problem, ${k}, ${this.name_}, ${e}`)
    }
  })
  console.warn('computedDeclare: SUCCESS')
}

/**
 * Add a 3 levels clonable property to a prototype.
 * `foo` is a clonable object means that `foo.clone` is a clone of `foo`
 * and `foo.set(bar)` will set `foo` properties according to `bar`.
 * @param {Map<String, Function|Object>} models,  the key => Function mapping.
 */
eYo.Dlgt_p.clonableDeclare = function (models) {
  this.init_ || (this.init_ = Object.create(null))
  var proto = this.C9r_.prototype
  Object.keys(models).forEach(k => { // No `for (var k in models) {...}`, models may change during the loop
    eYo.parameterAssert(!this.props__.has(k))
    this.clonable_.add(k)
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
    Object.defineProperties(proto, {
      [k__]: {value: eYo.KeyHandler, writable: true},
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
            f && (after = f.validate(before, after))
            f = this[k + 'Validate']
            f && (after = f.validate(before, after))
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
          f && (after = f.validate(before, after))
          f = this[k + 'Validate']
          f && (after = f.validate(before, after))
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
  })
}

/**
 * Dispose in the given object, the properties given by their main name.
 * @param {Object} object - the object that owns the property
 * @param {Array<string>} names -  a list of names
 */
eYo.Dlgt_p.clonableDispose_ = function (object) {
  this.clonableForEach(k => {
    var k__ = k + '__'
    var x = object[k__]
    if (x) {
      object[k__] = eYo.NA
      x.dispose()
    }
  })
}

/**
 * Helper to add a dispose function to the prototype of the receiver.
 * @param {Function} f a model value for key `dispose`, or a function given by another constructor delegate.
 */
eYo.Dlgt_p.disposeDecorate = function (f) {
  var me = this
  return function () {
    f && f.apply(this, arguments)
    me.disposeInstance(this)
  }
}

/**
 * This decorator turns `f` with signature
 * function (ns, key, Super, Dlgt, model) {...}
 * into
 * function (ns, key, Super, Dlgt, model) {...}
 * @param{Function} f
 * @this{undefined}
 */
eYo._p.makeClassDecorate = (f) => {
  return function (ns, key, Super, Dlgt, model) {
    // makeClassDecorate
    if (eYo.isStr(ns)) {
      model = Dlgt
      Dlgt = Super
      Super = key
      key = ns
      ns = Super && Super.eyo && Super.eyo.ns || this
    } else {
      eYo.parameterAssert(eYo.isStr(key), '`key` is not a string')
    }
    if (key.startsWith('eyo:')) {
      key = key.substring(4)
    }
    eYo.parameterAssert(!eYo.Do.hasOwnProperty(ns, key), `${key} is already a property of ns: ${ns.name}`)
    eYo.parameterAssert(!eYo.Do.hasOwnProperty(ns_p, key), `${key} is already a property of ns: ${ns.name}`)
    if (eYo.isSubclass(Super, eYo.Dflt)) {
      // Super is OK
      if (eYo.isSubclass(Dlgt, eYo.Dlgt)) {
        // Dlgt is also OK
        eYo.parameterAssert(
          !Super.eyo || eYo.isSubclass(Dlgt, Super.eyo.constructor),
          'Bad constructor delegate'
        )
        model = eYo.called(model) || {}
      } else {
        eYo.parameterAssert(!model, 'Unexpected model (1)')
        model = eYo.called(Dlgt) || {}
        Dlgt = this.Dlgt
      }
    } else if (eYo.isSubclass(Super, eYo.Dlgt)) {
      if (eYo.isSubclass(Dlgt, eYo.Dlgt)) {
        // we subclass eYo.Dlgt
        model = eYo.called(model) || {}
      } else {
        // we subclass nothing
        eYo.parameterAssert(!model, 'Unexpected model (2)')
        model = eYo.called(Dlgt) || {}
        Dlgt = Super
        Super = eYo.NA
      }
    } else if (eYo.isF(Super)) {
      if (eYo.isSubclass(Dlgt, eYo.Dlgt)) {
        // Dlgt and Super OK
        model = eYo.called(model) || {}
      } else if (Dlgt) {
        eYo.parameterAssert(!model, 'Unexpected model (3)')
        model = eYo.called(Dlgt) || {}
        Dlgt = this.Dlgt
      } else {
        eYo.parameterAssert(!model, 'Unexpected model (4)')
        model = eYo.called(Super) || {}
        Dlgt = this.Dlgt
        Super = eYo.asF(this[key]) || this.Dflt
      }
    } else if (eYo.isSubclass(Dlgt, eYo.Dlgt)) {
      // Dlgt OK, no Super
      model = eYo.called(model) || {}
    } else {
      eYo.parameterAssert(!model, 'Unexpected model (5)')
      eYo.parameterAssert(!Dlgt, 'Unexpected model (5)')
      model = eYo.called(Super) || {}
      Dlgt = this.Dlgt
      Super = this[key]
    }
    if (!model) {
      throw new Error('Unexpected void model')
    }
    if (ns && eYo.isSubclass(ns.Dflt, Super)) {
      Super = ns.Dflt
    }
    if (eYo.isSubclass(this.Dflt, Super)) {
      Super = this.Dflt
    }
    if (Super && Super.eyo && eYo.isSubclass(Super.eyo.constructor, Dlgt)) {
      Dlgt = Super.eyo.constructor
    }
    if (ns && eYo.isSubclass(ns.Dlgt, Dlgt)) {
      Dlgt = ns.Dlgt
    }
    return f.call(this, ns, key, Super, Dlgt, model)
  }
}

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
eYo._p.doMakeClass = (() => {
  var makeDlgt = (ns, key, C9r, Dlgt, model) => {
    Object.defineProperties(C9r, {
      eyo: eYo.Do.propertyR(function () {
        return this.eyo__
      }),
      eyo_: eYo.Do.propertyR(function () {
          return this.eyo__
      }),
    })
    C9r.eyo__ = new Dlgt(ns, key, C9r, model)
    Object.defineProperty(C9r.prototype, 'eyo', eYo.Do.propertyR(function () {
      return this.constructor.eyo__
    }))
  }
  // the Dlgt is its own Dlgt
  makeDlgt(eYo, 'Dlgt', eYo.Dlgt, eYo.Dlgt, {})

  return function (ns, key, Super, Dlgt, model) {
  // prepare init methods
    if (eYo.isF(model.init)) {
      var endInit = model.init
    } else if (model.init) {
      var beginInit = model.init.begin
      endInit = model.init.end
    }
    delete model.init
    // create the constructor
    if (Super) {
      var C9r = function () {
        // Class
        Super.apply(this, arguments)
        beginInit && beginInit.apply(this, arguments)
        C9r.eyo__.initInstance(this)
        endInit && endInit.apply(this, arguments)
      }
      try {
        eYo.inherits(C9r, Super)
      } catch(e) {
        console.error('BREAK HERE')
      }
    } else {
      C9r = function () {
        // Class
        beginInit && beginInit.apply(this, arguments)
        C9r.eyo__.initInstance(this)
        endInit && endInit.apply(this, arguments)
      }
    }
    makeDlgt(ns, key, C9r, Dlgt, model)
    // store the constructor
    ns && Object.defineProperties(ns, {
      [key]: { value: C9r},
      [key + '_p']: { value: C9r.prototype }
    })
    // create the iterators
    ;['owned', 'clonable', 'linked', 'cached'].forEach(k => {
      var name = k + 'ForEach'
      C9r.prototype[name] = function (f) {
        var Super = C9r.superClass_
        if (Super) {
          var g = Super[name]
          g && g.call(this, f)
        }
        C9r.eyo[name].call(C9r.eyo, (k) => {
          var x = this[k]
          return x && f(x)
        })
      }
      // name = 'some' + K
      // c9r.prototype[name] = function (f) {
      //   var super_ = c9r.superClass_
      //   if (super_) {
      //     var g = super_[name]
      //   }
      //   return g && get.call(this, f) || c9r.eyo[name].call(c9r.eyo, (k) => {
      //     var x = this[k]
      //     return x && f(x)
      //   })
      // }
    })
    if (!C9r.eyo.disposeDecorate) {
      console.error('BREAK HERE WTF')
    }
    var f = C9r.eyo.disposeDecorate (model.dispose)
    delete model.dispose
    C9r.prototype.dispose = function () {
      try {
        this.dispose = eYo.Do.nothing
        f && f.apply(this, arguments)
        C9r.eyo.disposeInstance(this)
        var Super = C9r.superClass_
        !!Super && !!Super.dispose && !!Super.dispose.apply(this, arguments)
      } finally {
        delete this.dispose
      }
    }
    try {
      Object.defineProperty(ns_p, key, {value: C9r})
    } catch(e) {
      console.error(`FAILED to define a property: ${ns.name}[${key}], ${e.message}`)
    }
    C9r.makeSubclass = function (ns, key, Dlgt, model) {
      return C9r.eyo.makeSubclass(ns, key, Dlgt, model)
    }
    return C9r
  }
})()

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
 * function (ns, key, Dlgt, model) {}.
 * After decoration, a call to the resulting function is equivalent to a makeClass,
 * the Super being the receiver's C9r.
 * @param{Function} f - the function to decorate.
 */
eYo.Dlgt_p.makeSubclassDecorate = function (f) {
  return function (ns, key, Dlgt, model) {
    var Super = this.C9r
    if (eYo.isStr(ns)) {
      model = Dlgt
      Dlgt = key
      key = ns
      ns = this.ns
    } else if (!eYo.isStr(key)) {
      model = Dlgt
      Dlgt = key
      key = this.key
    }
    return this.ns.makeClassDecorate(f).call(this, ns, key, Super, Dlgt, model)
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
eYo.Dlgt.makeSubclass = eYo.Dlgt_p.makeSubclassDecorate(function (ns, key, Super, Dlgt, model) {
  if (!Super) {
    Super = Dlgt
    Dlgt = ns && ns.super.Dlgt || eYo.Dlgt
  }
  return ns && ns.makeClass(ns, key, Super, Dlgt, model) || eYo.makeClass(ns, key, Super, Dlgt, model)
})

/**
 * The default class.
 * @name {eYo.Dflt}
 * @constructor
 */
eYo.makeClass('Dflt', {
  init() {
    this.disposeUI = eYo.Do.nothing
  }
})
