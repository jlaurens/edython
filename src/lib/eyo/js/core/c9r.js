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

eYo.forwardDeclare('Brick')
eYo.forwardDeclare('Slot')
eYo.forwardDeclare('Magnet')

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
 * Whether the argument is a model object once created with `{...}` syntax.
 * @param {*} what
 */
eYo.C9r.isModel = (what) => {
  return what && (what.model__ || eYo.isO(what))
}

/**
 * @name{eYo.C9r.Model.isAllowed}
 * Allowed keys by path pattern
 * @param {String} path - Dot separated path components
 * @param {String} key - Dotless path components
 * @return {Boolean} Whether the key is authorized with the given path.
 */
{
  var allowed = {
    ['^$']: [
      'init', 'deinit', 'dispose', 'ui',
      'owned', 'computed', 'valued', 'cached', 'cloned', 'link',
      'xml', 'data', 'slots',
      'out', 'head', 'left', 'right', 'suite', 'foot'
    ],
    ['^init$']: [
      'begin',
      'end',
    ],
    ['^dispose$']: [
      'begin',
      'end',
    ],
    data: '^\\w+$',
    owned: '^\\w+$',
    computed: '^\\w+$',
    valued: '^\\w+$',
    cached: '^\\w+$',
    cloned: '^\\w+$',
    ['^xml$']: [
      'attr', 'types', 'attribute',
    ],
    ['^ui$']: [
      'init', 'dispose', 'doInit', 'doDispose', 'initMake', 'disposeMake',
    ],
    ['^owned\\.\\w+$']: [
      'value', 'init',
      'validate', 'willChange', 'didChange'
    ],
    ['^computed\\.\\w+$']: [
      'get', 'set', 'get_', 'set_', 'get__', 'set__',
      'validate', 'willChange', 'didChange'
    ],
    ['^valued\\.\\w+$']: [
      'value', 'init', 'get', 'set', 'get_', 'set_',
      'validate', 'willChange', 'didChange', 'consolidate',
    ],
    ['^cached\\.\\w+$']: [
      'lazy', 'value', 'init',
      'validate', 'willChange', 'didChange', 'forget',
    ],
    ['^cloned\\.\\w+$']: [
      'lazy', 'value', 'init',
      'validate', 'willChange', 'didChange',
    ],
    ['^data\\.\\w+$']: [
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
      'xml', {}
    ],
    ['^data\\.\\w+\.xml$']: [
      'save', 'load',
    ],
    ['^slots\\.\\w+$']: [
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
    ['^slots\\.\\w+\.fields\\.\\w+$']: [
      'value', // '(',
      'reserved', // : '.',
      'separator', // : true,
      'variable', // : true,
      'validate', // : true,
      'endEditing', // : true,
      'willRender', //  () => {},
    ],
    ['^slots\\.\\w+\.xml$']: [
      'accept', //  () => {},
    ],
    ['^list$']: [
      'check',
      'presep',
      'postsep',
      'ary',
      'mandatory',
      'unique',
      'all',
      'makeUnique'
    ],
  }
  eYo.C9r.Model.isAllowed = (path, key) => {
    for (var k in allowed) {
      var re = XRegExp(k)
      if (re.test(path)) {
        var expected = allowed[k]
        if (eYo.isStr(expected)) {
          re = XRegExp(expected)
          return  re.test(key)  
        }
        return expected.includes(key)
      }
    }
    return false
  }  
}

/**
 * @param {Object} model - the tree in which we replace some node by objects
 * @param {Function} handler - a function with signature (path, before): boolean
 */
eYo.C9r.Model.consolidate = (model, handler) => {
  handler || (handler = eYo.C9r.Model.shortcutsBaseHandler)
  var do_it = (model, path) => {
    eYo.isO(model) && Object.keys(model).forEach(k => {
      handler(model, path, k) || do_it(model[k], path && `${path}.${k}` || k)
    })
  }
  do_it(model, '')
}

/**
 * Expands a data model.
 * @param {Object} model
 * @param {String} key
 * @return {Object}
 */
eYo.C9r.Model.dataHandler = eYo.Do.nothing

{
  let re = XRegExp(/^function\s*\S*\s*\(\s*(?<before>\s*,\s*before\b)/)

  /**
   * Expands a data model.
   * @param {Object} model
   * @param {String} key
   * @return {Object}
   */
  eYo.C9r.Model.propertyHandler = (model, key) => {
    model = model[key]
    ;['willChange', 'isChanging', 'didChange', 'validate'].forEach(k => {
      var f = model[k]
      if (eYo.isF(f)) {
        var m = XRegExp.match(f.toString(), re)
        if (m) {
          if (m.before) {
            ff = (object) => {
              object[k] = f
            }
          } else {
            ff = (object) => {
              object[k] = function (before, after) {
                f.call(this, after)
              }
            }
          }
          model[k] = ff
        }
      }
    })
  }
}

{
  var ensureRAF = (x) => {
    if (eYo.isRA(x)) {
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
  /**
   * @param {Object} model
   * @param {String} path
   * @param {String} key
   */
  eYo.C9r.Model.shortcutsBaseHandler = (model, path, key) => {
    var after
    if (path === '') {
      if (['owned', 'valued'].includes(key)) {
        var before = model[key]
        if (eYo.isStr(before)) {
          after = {[before]: {}}
        } else if (goog.isArray(before)) {
          after = {}
          before.forEach(k => {
            after[k] = {}
          })
        }
      } else if (['out', 'head', 'left', 'right', 'suite', 'foot'].includes(key)) {
        // BRICK_TYPE || [BRICK_TYPE] || () => {}
        var before = model[key]
        if (!eYo.isO(before)) {
          after = {
            check: ensureRAF(before)
          }
        }
      }
    } else if (path === 'computed') {
      var before = model[key]
      if (eYo.isF(before)) {
        after = {
          get: before
        }
      }
    } else if (['owned', 'CONST', 'valued', 'cached', 'cloned'].includes(path)) {
      var before = model[key]
      if (eYo.isF(before)) {
        after = { init: before }
      } else if (!eYo.isO(before)) {
        after = { value: before }
      } else if (before) {
        eYo.C9r.Model.propertyHandler(model, key)
      }
    } else if (['out', 'head', 'left', 'right', 'suite', 'foot'].includes(path)) {
      if (key === 'check') {
        // BRICK_TYPE || [BRICK_TYPE] || () => {}
        after = ensureRAF(model[key])
      }
    } else if (path === 'data') {
      eYo.C9r.Model.dataHandler(model, key)
    } else if (path === 'list') {
      if (['check', 'unique', 'all'].includes(key)) {
        // BRICK_TYPE || [BRICK_TYPE] || () => {}
        after = ensureRAF(model[key])
      }
    } else if (key === 'all') {
      var before = model[key]
      if (!goog.isArray(before)) {
        after = [before]
      }
    } else if (key === 'list') {
      var before = model[key]
      before.ary || (before.ary = Infinity)
    } else if (XRegExp.match(path, /slots\.\w+\.fields/)) {
      var before = model[key]
      if (eYo.isStr(before)) {
        after = {
          value: before
        }
      }
    } else if (XRegExp.match(path, /slots\.\w+\.fields\.\w+/)) {
      var before = model[key]
      if (['reserved', 'variable', 'separator'].includes(key)) {
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
      // console.warn(path, key)
      return true
    }
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
  var do_it = (m, b, path) => {
    if (eYo.isO(m) && eYo.isO(b)) {
      for (var k in b) {
        if (!eYo.C9r.Model.isAllowed(path, k)) {
          console.warn(`Attempting to use ${path}.${k} in a model`)
          return
        }
        if (m[k] === eYo.NA) {
          var after = b[k]
          m[k] = eYo.isO(after) ? {} : after
        }
        do_it(m[k], b[k], path && `${path}.${k}` || k)
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

Object.defineProperty(eYo.C9r._p, 'types', {
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
  // name = 'some' + K
  // pttp[name] = function (f) {
  //   return this[k__] && this[k__].some(f)
  // }
})

/**
 * Initialize an instance with valued, cached, owned and cloned properties.
 * Default implementation forwards to super.
 * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
 */
eYo.Dlgt_p.preInitInstance = function (object) {
  for (var k in this.descriptors__) {
    object.hasOwnProperty(k) || Object.defineProperty(object, k, this.descriptors__[k])
  }
}

/**
 * Initialize an instance with valued, cached, owned and cloned properties.
 * Default implementation forwards to super.
 * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
 */
eYo.Dlgt_p.initInstance = function (object) {
  if (!object) {
    console.error('BREAK HERE!')
  }
  var f = k => {
    var init = this.init_ && this.init_[k] || object[k+'Init']
    if (init) {
      object[k + '__'] = init.call(object)
    }
  }
  this.valuedForEach(f)
  this.ownedForEach(f)
  this.clonedForEach(f) 
}

/**
 * Dispose of the resources declared at that level.
 * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
 */
eYo.Dlgt_p.disposeInstance = function (object) {
  this.valuedClear_(object)
  this.cachedForget_(object)
  this.ownedDispose_(object)
  this.clonedDispose_(object)
}

/**
 * Register the `init` method  in the model, to be used when necessary.
 * @param {String} k - name of the key to add
 * @param {Object} model - Object with `init` key, eventually.
 */
eYo.Dlgt_p.registerInit = function (k, model) {
  if (!model) {
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
 * @param {Object} model Object with `dispose` key, eventually.
 */
eYo.Dlgt_p.registerDispose = function (k, model) {
  var dispose = eYo.isF(model.dispose) && model.dispose
  if (dispose) {
    !this.disposer_ && (this.disposer_ = Object.create(null))
    this.disposer_[k] = dispose
  } 
}

/**
 * Declare the given model.
 * @param {Object} model - Object, like for |makeClass|.
 */
eYo.Dlgt_p.modelDeclare = function (model) {
  model.CONST && this.CONSTDeclare(model.CONST)
  model.valued && this.valuedDeclare(model.valued)
  model.owned && this.ownedDeclare(model.owned)
  model.cached && this.cachedDeclare(model.cached)
  model.cloned && this.clonedDeclare(model.cloned)
  model.computed && this.computedDeclare(model.computed)
}

/**
 * Add a CONST property.
 * The receiver is not the owner.
 * @param {String} k name of the CONST to add
 * @param {Object} model Object with `value` keys,
 * f any.
 */
eYo.Dlgt_p.CONSTDeclare = function (k, model = {}) {
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
  Object.keys(model).forEach(k => {
    Object.defineProperty(this.C9r_, k, f(model[k]))
  })
}

/**
 * Add a valued property.
 * The receiver is not the owner.
 * @param {String} k name of the valued property to add
 * @param {Object} model Object with `willChange` and `didChange` keys,
 * f any.
 */
eYo.Dlgt_p.valuedDeclare_ = function (k, model) {
  eYo.parameterAssert(!this.props__.has(k))
  this.valued_.add(k)
  let C9r = this.C9r_
  let C9r_p = C9r.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  this.registerInit(k, model)
  try {
    Object.defineProperty(C9r_p, k__, {
      value: eYo.isO(model) ? model.value : model,
      writable: true
    })
  } catch(e) {
    console.error(`FAILURE: value property ${k__}`)
  }
  try {
    Object.defineProperty(C9r_p, k_, {
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
    })
  } catch(e) {
    console.error(`FAILURE: value property ${k_}`)
  }
  this.descriptors__[k] = eYo.C9r.descriptorR(model.get || function () {
    return this[k_]
  })
  this.consolidatorMake(k, model)
}

/**
 * Add a valued properties.
 * The receiver is not the owner.
 * @param {Object} constructor -  Its prototype object gains a storage named `foo__` and both getters and setters for `foo_`.
 * The initial value is `eYo.NA`.
 * @param {Array<String>} names names of the link to add
 */
eYo.Dlgt_p.consolidatorMake = function (k, model) {
  let C9r = this.C9r_
  let C9r_p = C9r.prototype
  let consolidators = this.consolidators__ || (this.consolidators__ = Object.create(null))
  let kC = k+'Consolidate'
  C9r_p[kC] = consolidators[k] = model.consolidate
  ? function () {
    let Super = C9r.superProto_[kC]
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
 * @param {Object} constructor -  Its prototype object gains a storage named `foo__` and both getters and setters for `foo_`.
 * The initial value is `eYo.NA`.
 * @param {Array<String>} names names of the link to add
 */
eYo.Dlgt_p.valuedDeclare = function (model) {
  if (model.forEach) {
    model.forEach(k => {
      this.valuedDeclare_(k, {})
    })
  } else {
    Object.keys(model).forEach(k => {
      this.valuedDeclare_(k, model[k])
    })
  }
}

/**
 * Dispose in the given object, the value given by the constructor.
 * @param {Object} object -  an instance of the receiver's constructor,
 * or one of its subclasses.
 */
eYo.Dlgt_p.valuedClear_ = function (object) {
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
 * @param {Object} data -  the object used to define the property: key `value` for the initial value, key `willChange` to be called when the property is about to change (signature (before, after) => function, truthy when the change should take place). The returned value is a function called after the change has been made in memory.
 */
eYo.Dlgt_p.ownedDeclare_ = function (k, model = {}) {
  eYo.parameterAssert(!this.props__.has(k))
  this.owned_.add(k)
  const proto = this.C9r_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  this.registerInit(k, model)
  this.registerDispose(k, model)
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
    }
  })
  this.descriptors__[k] = eYo.C9r.descriptorR(model.get || function () {
    return this[k_]
  })
  this.consolidatorMake(k, model)
}

/**
 * Add an owned property.
 * The receiver is the owner.
 * @param {Object} many  key -> data map.
 */
eYo.Dlgt_p.ownedDeclare = function (many) {
  if (many.forEach) {
    many.forEach(k => {
      this.ownedDeclare_(k)
    })
  } else {
    Object.keys(many).forEach(k => {
      this.ownedDeclare_(k, many[k])
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
 * @param {Object} model -  the model object, must have a `init` key and
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
eYo.Dlgt_p.cachedDeclare_ = function (k, model) {
  eYo.parameterAssert(!this.props__.has(k))
  this.cached_.add(k)
  var proto = this.C9r_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  var init = this.registerInit(k, model)
  Object.defineProperties(proto, {
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
      }
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
  this.descriptors__[k] = eYo.C9r.descriptorR(model.get || function () {
    return this[k_]
  })
}

/**
 * Add 3 levels cached properties to a prototype.
 * @param {Object} many -  the K => V mapping to which we apply `cachedDeclare_(K, V)`.
 */
eYo.Dlgt_p.cachedDeclare = function (many) {
  Object.keys(many).forEach(n => {
    this.cachedDeclare_(n, many[n])
  })
}

/**
 * Forget all the cached valued.
 */
eYo.Dlgt_p.cachedForget_ = function () {
  this.cachedForEach(n => {
    this.cachedForgetters__[n].call(this)
  })
}

/**
 * Forget all the cached valued.
 */
eYo.Dlgt_p.cachedUpdate_ = function () {
  this.cachedForEach(n => {
    this.cachedUpdaters__[n].call(this)
  })
}

/**
 * Add computed properties to a prototype.
 * @param {Map<String, Function>} models,  the key => Function mapping.
 */
eYo.Dlgt_p.computedDeclare = function (models) {
//  console.warn('computedDeclare:', this.name, Object.keys(models))
  Object.keys(models).forEach(k => {
//    console.warn('computedDeclare -> ', k)
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
      this.descriptors__[k] = set
      ? eYo.C9r.descriptorR(get) : {
        get: get,
        set: set,
      }
      k = k_
      get = eYo.asF(model.get_) || function () {
        return this[k__]
      }
      set = model.set_
      Object.defineProperty(proto, k, get ? set ? {
          get: get,
          set: set,
        } : eYo.C9r.descriptorR(get)
        : set
        ? eYo.C9r.descriptorW(set) : eYo.C9r.descriptorNORW(k),
      )
      k = k__
      get = model.get__
      set = model.set__
      Object.defineProperty(proto, k, get
        ? set ? {
          get: get,
          set: set,
        } : eYo.C9r.descriptorR(get)
        : set ? eYo.C9r.descriptorW(set) : eYo.C9r.descriptorNORW(k),
      )
    } catch (e) {
      console.warn(`Computed property problem, ${k}, ${this.name_}, ${e}`)
      console.error(`Computed property problem, ${k}, ${this.name_}, ${e}`)
    }
  })
//  console.warn('computedDeclare: SUCCESS')
}

/**
 * Add a 3 levels cloned property to a prototype.
 * `foo` is a cloned object means that `foo.clone` is a clone of `foo`
 * and `foo.set(bar)` will set `foo` properties according to `bar`.
 * @param {Map<String, Function|Object>} models,  the key => Function mapping.
 */
eYo.Dlgt_p.clonedDeclare = function (models) {
  this.init_ || (this.init_ = Object.create(null))
  var proto = this.C9r_.prototype
  Object.keys(models).forEach(k => { // No `for (var k in models) {...}`, models may change during the loop
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
    this.descriptors__[k] = eYo.C9r.descriptorR(model.get || function () {
      return this[k_]
    })
  })
}

/**
 * Dispose in the given object, the properties given by their main name.
 * @param {Object} object - the object that owns the property
 * @param {Array<string>} names -  a list of names
 */
eYo.Dlgt_p.clonedDispose_ = function (object) {
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
 * Helper to add a dispose function to the prototype of the receiver.
 * @param {Function} f a model value for key `dispose`, or a function given by another constructor delegate.
 */
eYo.Dlgt_p.disposeDecorate = function (f) {
  var me = this
  return function () {
    f && f.apply(this, arguments)
    this.disposeUI()
    me.disposeInstance(this)
  }
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
eYo._p.makeClassDecorate = (f) => {
  return function (ns, key, Super, Dlgt, model) {
    // makeClassDecorate
    if (ns && !eYo.isNS(ns)) {
      eYo.parameterAssert(!model, `Unexpected model: ${model}`)
      model = Dlgt
      Dlgt = Super
      Super = key
      key = ns
      ns = eYo.NA
    }
    if (!eYo.isStr(key)) {
      eYo.parameterAssert(!model, `Unexpected model: ${model}`)
      model = Dlgt
      Dlgt = Super
      Super = key
      key = eYo.NA
    }
    key || (key = Super && Super.eyo && Super.eyo.key)
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
        model = eYo.called(model || Dlgt) || {}
        Dlgt = this.Dlgt
      }
    } else if (eYo.isSubclass(Super, eYo.Dlgt)) {
      if (eYo.isSubclass(Dlgt, eYo.Dlgt)) {
        // we subclass eYo.Dlgt
        model = eYo.called(model) || {}
      } else if (key && key.startsWith('Dlgt')) {
        // we subclass Dlgt
        eYo.parameterAssert(!model, 'Unexpected model (1)')
        model = eYo.called(Dlgt) || {}
        Dlgt = eYo.Dlgt
      } else {
        // we subclass nothing
        eYo.parameterAssert(!model, 'Unexpected model (2)')
        model = eYo.called(Dlgt) || {}
        Dlgt = Super
        Super = eYo.NA
      }
    } else if (eYo.isF(Super)) {
      if (eYo.isSubclass(Dlgt, eYo.Dlgt)) {
        // Dlgt and Super OK, Super is not a subclass of eYo.Dflt
        model = eYo.called(model) || {}
      } else if (Dlgt) {
        eYo.parameterAssert(!model, 'Unexpected model (3)')
        model = eYo.called(Dlgt) || {}
        Dlgt = this.Dlgt
      } else if (Super.eyo) {
        eYo.parameterAssert(!model, 'Unexpected model (4)')
        model = {}
        Dlgt = this.Dlgt
    } else if (model) {
        model = eYo.called(model)
        Dlgt = this.Dlgt
      } else {
        model = eYo.called(Super) || {}
        Dlgt = this.Dlgt
        Super = eYo.asF(key && this[key]) || this.Dflt
      }
    } else if (Super) {
      eYo.parameterAssert(!model, 'Unexpected model (5)')
      eYo.parameterAssert(!Dlgt, 'Unexpected Dlgt (5)')
      model = Super
      Dlgt = this.Dlgt
      Super = eYo.asF(key && this[key]) || this.Dflt
    } else if (eYo.isSubclass(Dlgt, eYo.Dlgt)) {
      // Dlgt OK, no Super
      model = eYo.called(model) || {}
    } else if (Dlgt) {
      eYo.parameterAssert(!model, 'Unexpected model (6)')
      // default Dlgt, no super
      model = eYo.called(Dlgt)
      Dlgt = this.Dlgt
    } else {
      eYo.parameterAssert(!Dlgt, 'Unexpected Dlgt (7)')
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
      eYo.parameterAssert(eYo.isStr(key), '`key` is not a string')
      if (key.startsWith('eyo:')) {
        key = key.substring(4)
      }
      eYo.parameterAssert(!ns.hasOwnProperty(key), `${key} is already a property of ns: ${ns.name}`)
      eYo.parameterAssert(!ns._p.hasOwnProperty(key), `${key} is already a property of ns: ${ns.name}`)
    }
    eYo.parameterAssert(model, 'Unexpected void model')
    if (eYo.isSubclass(ns.Dflt, Super)) {
      Super = ns.Dflt
    }
    if (eYo.isSubclass(this.Dflt, Super)) {
      Super = this.Dflt
    }
    eYo.parameterAssert(key, 'Missing key')
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

  let re = {
    init: XRegExp(/^function \S*\([^,]*\binit\b/),
    dispose: XRegExp(/^function \S*\([^,]*\bdispose\b/)
  }

  /**
   * Make the init method.
   */
  eYo.Dlgt_p.makeInit = function () {
    let init = this.model.init
    let C9r_s = this.C9r_s
    let init_s = C9r_s && C9r_s.init
    let preInitInstance = this.preInitInstance.bind(this)
    let initInstance = this.initInstance.bind(this)
    if (init) {
      if (XRegExp.match(init.toString(), re.init)) {
        if (init_s) {
          var f = function (...args) {
            try {
              this.init = eYo.Do.nothing
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
              this.init = eYo.Do.nothing
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
            this.init = eYo.Do.nothing
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
            this.init = eYo.Do.nothing
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
          this.init = eYo.Do.nothing
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
          this.init = eYo.Do.nothing
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
  eYo.Dlgt_p.makeDispose = function () {
    let dispose = this.model.dispose
    let C9r_s = this.C9r_s
    let dispose_s = C9r_s && C9r_s.dispose
    let disposeInstance = this.disposeInstance.bind(this)
    if (dispose) {
      if (XRegExp.match(dispose.toString(), re.dispose)) {
        if (dispose_s) {
          var f = function (...args) {
            try {
              this.dispose = eYo.Do.nothing
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
              this.dispose = eYo.Do.nothing
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
            this.dispose = eYo.Do.nothing
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
            this.dispose = eYo.Do.nothing
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
          this.dispose = eYo.Do.nothing
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
          this.dispose = eYo.Do.nothing
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
  eYo.Dlgt_p.makeInitUI = function () {
    var ui = this.model.ui
    let initUI = ui && ui.init
    let C9r_s = this.C9r_s
    let initUI_s = C9r_s && C9r_s.initUI
    if (initUI) {
      if (XRegExp.match(initUI.toString(), re.init)) {
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
      if (XRegExp.match(disposeUI.toString(), re.dispose)) {
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
    if (!eyo.disposeDecorate) {
      console.error('BREAK HERE!')
    }
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
 * @param {Object} [Dlgt] - the class of the delegate
 * @param {Object} [model] - the model
 */
eYo._p.makeDflt = function (Dlgt, model) {
  if (!this.hasOwnProperty('Dlgt')) {
    this.makeDlgt()
  }
  if (!eYo.isSubclass(Dlgt, eYo.Dlgt)) {
    eYo.parameterAssert(!model, `Unexpected model: ${model}`)
    model = Dlgt
    Dlgt = this.Dlgt
  }
  return this.makeClass('Dflt', this.super.Dflt, Dlgt, model)
}

/**
 * The default class.
 * @name {eYo.Dflt}
 * @constructor
 */
eYo.makeClass('Dflt', {
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
      forget (forgetter) {
        this.ownedForEach(x => {
          x.ui_driverForget && x.ui_driverForget()
        })
        forgetter()
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

eYo.Dflt_p.initUI = eYo.Do.nothing
eYo.Dflt_p.disposeUI = eYo.Do.nothing

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
