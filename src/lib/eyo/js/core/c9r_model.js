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
      'value', 'lazy', 'init',
      'validate', 'willChange', 'atChange', 'didChange'
    ],
    ['^computed\\.\\w+$']: [
      'get', 'set', 'get_', 'set_',
      'validate', 'willChange', 'atChange', 'didChange',
      'dispose',
    ],
    ['^valued\\.\\w+$']: [
      'value', 'lazy', 'init', 'get', 'set', 'get_', 'set_',
      'validate', 'willChange', 'atChange', 'didChange',
    ],
    ['^cached\\.\\w+$']: [
      'value', 'lazy', 'init',
      'validate', 'willChange', 'atChange', 'didChange',
      'forget',
    ],
    ['^cloned\\.\\w+$']: [
      'value', 'lazy', 'init',
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
      'willConnect', //  () {},
      'willDisconnect', //  () {},
      'didConnect', //  () {},
      'didDisconnect', //  () {},
      'consolidate', // () {},
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

/**
 * Expands a magnet model.
 * @param {Object} model
 * @param {String} key
 * @return {Object}
 */
eYo.C9r.Model.magnetHandler = eYo.Do.nothing

/**
 * Expands a property model.
 * @param {Object} model
 * @return {Object}
 */
eYo.C9r.Model.propertyHandler = eYo.Do.nothing

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
        if (eYo.isO(before)) {
          eYo.C9r.Model.magnetHandler(before)
        } else {
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
        eYo.C9r.Model.propertyHandler(model)
      }
    } else if (['out', 'head', 'left', 'right', 'suite', 'foot'].includes(path)) {
      if (key === 'check') {
        // BRICK_TYPE || [BRICK_TYPE] || () => {}
        after = ensureRAF(model[key])
      }
    } else if (path === 'data') {
      eYo.C9r.Model.dataHandler(model, key)
    } else if (path === 'slots') {
      eYo.C9r.Model.magnetHandler(model)
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
 * The created model, by key.
 * @param{String} key - the key used to create the constructor.
 */
eYo.C9r.Model.forKey = (key) => {
  var C9r = eYo.C9r.byKey(key)
  return C9r && C9r.eyo.model
}

/**
 * The created model, by name.
 * @param{String} name - the key used to create the constructor.
 */
eYo.C9r.Model.forName = (name) => {
  var C9r = eYo.C9r.byName(name)
  return C9r && C9r.eyo.model
}

/**
 * The created models given its type.
 * @param{String} type - the key used to create the constructor.
 */
eYo.C9r.Model.forType = (type) => {
  var C9r = eYo.C9r.byType(type)
  return C9r && C9r.eyo.model
}
