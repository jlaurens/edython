/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo')

/**
 * The model management.
 * Models are trees with some inheritancy.
 * @name {eYo.Model}
 * @namespace
 */
eYo.makeNS('Model')

/**
 * Whether the argument is a model object once created with `{...}` syntax.
 * @param {*} what
 */
eYo.isModel = (what) => {
  return what && (what.model__ || eYo.isO(what))
}
/*
Model template for most objects except bricks.
Indentation means one level depth in {
  init () {},
  dispose () {},
  ui: {
    init () {},
    dispose () {},
  },
  owned: IDENTIFIER || [IDENTIFIER] || {
    key: {
      value: VALUE,
      init () {},
      validate () {},
      willChange () {},
      didChange: () {},
    }
  },
  computed: {
    key: Function / getter || {
      get: ?Function,
      set: ?Function,
      get_: ?Function,
      set_: ?Function,
      get__: ?Function,
      set__: ?Function,
      validate () {},
      willChange () {},
      didChange () {},
    }
  },
  link: {
    key: {
      value: VALUE,
      init () {},
      get () {},
      set () {},
      get_ () {},
      set_ () {},
      validate () {},
      willChange () {},
      didChange () {},
    }
  }, 
  cached: {
    key: init Function || {
      lazy: Boolean,
      value: VALUE,
      init () {},
      validate () {},
      willChange () {},
      didChange () {},
    }
  },
  clonable: {
    key: init Function || {
      lazy: Boolean,
      value: VALUE,
      init () {},
      validate () {},
      willChange () {},
      didChange () {},
    }
  },
}
Template for Expressions, same thing plus
{
  link: BRICK_TYPE,
  init () {},
  deinit () {},
  xml: {
    types: TYPE || [TYPE], // last is expected
    attr: '@',
  },
  data: {
    key: {
      order: VALUE,
      all: TYPE || [TYPE], // last is expected
      main: BOOLEAN,
      init () {} || VALUE, !!! are function supported ?
      placeholder: STRING,
      validate () {} || false || true,
      consolidate () {},
      validateIncog () {},
      willChange () {},
      isChanging () {},
      didChange () {},
      willLoad () {},
      didLoad () {},
      fromType () {},
      fromField () {},
      toField () {},
      noUndo: true,
    }
  },
  slots: {
    key: {
      order: VALUE,
      fields: {
        start: '(',
        end: ')',
        label: String || {  // last is expected ?????
          reserved: ':'
        },
        bind: {
          validate: true,
          endEditing: true,
          reserved: '.',
          separator: true,
          variable: true,
          willRender () {},
        },
      },
      check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
      promise: eYo.T3.Expr.value_list,
      validateIncog () {},
      accept () {},
      didConnect () {},
      didDisconnect () {},
      wrap: TYPE,
      xml: true || {
        accept () {},
      },
      plugged: eYo.T3.Expr.primary,
    },
  },
  out: BRICK_TYPE || [BRICK_TYPE] || () => {} ||  { // last is expected
    check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
  },
}
For lists: {
  list: {
    consolidator: CONSOLIDATOR_TYPE,
    check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
    unique: BRICK_TYPE,
    mandatory: NUMBER,
    presep: STRING,
    can_comprehension: BOOLEAN,
    all: BRICK_TYPE || [BRICK_TYPE], // last is expected
    placeholder: STRING,
  }
}
For Statements: {
  head: BRICK_TYPE || [BRICK_TYPE] || () => {} || { // last is expected
    check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
  },
  left: eYo.NA,
  right: BRICK_TYPE || [BRICK_TYPE] || () => {} || { // last is expected
    check: BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
    fields: {
      label: { // don't call it 'operator'
        reserved: STRING,
        hidden: BOOLEAN,
      }
    }
  },
  suite: BRICK_TYPE || [BRICK_TYPE] || () => {} || { // last is expected
    check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
  },
  foot: BRICK_TYPE || [BRICK_TYPE] || () => {} || { // last is expected
    check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
    required: BOOLEAN,
  }
}
*/

/**
 * @param {Object} model - the tree in which we replace some node by objects
 * @param {Function} handler - a function with signature (path, before): boolean
 */
eYo.Model.expandShortcuts = (model, handler) => {
  var expand = (model, path, handler) => {
    if (eYo.isO(model)) {
      Object.keys(model).forEach(k => {
        handler(model, path, k) || expand(model[k], path + '.' + k, handler)
      })
    }
  }
  expand(model, '', handler)
}
/**
 * @param {Object} model
 * @param {String} path
 * @param {String} key
 */
eYo.Model.shortcutsBaseHandler = (model, path, key) => {
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
  }
  if (after) {
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
eYo.Model.Handler = (model, C9r, linkC9r) => {

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
  // */
  // has (target, key) {
  //   if (key[0] === '_') {
  //     return false;
  //   }
  //   return key in target;
  // },
  // get: function(target, prop, receiver) {
  //   if (prop === 'secret') {
  //     return `${target.secret.substr(0, 4)} ... shhhh!`;
  //   } else {
  //     return Reflect.get(...arguments);
  //   }
  // },
  // set(obj, prop, value) {
  //   if ((prop === 'eyeCount') && ((value % 2) !== 0)) {
  //     console.log('Monsters must have an even number of eyes');
  //   } else {
  //     return Reflect.set(...arguments);
  //   }
  // },
  // deleteProperty(target, prop) {
  //   if (prop in target) {
  //     delete target[prop];
  //     console.log(`property removed: ${prop}`);
  //     // expected output: "property removed: texture"
  //   }
  // },
  // ownKeys (target) {
  //   return Reflect.ownKeys(target)
  // },
  // apply: function(target, thisArg, argumentsList) {
  //   console.log(`Calculate sum: ${argumentsList}`);
  //   // expected output: "Calculate sum: 1,2"

  //   return target(argumentsList[0], argumentsList[1]) * 10;
  // },
  // construct(target, args) {
  //   console.log('monster1 constructor called');
  //   // expected output: "monster1 constructor called"

  //   return new target(...args);
  // },
// handler.getPrototypeOf()
// Une trappe pour Object.getPrototypeOf.
// handler.setPrototypeOf()
// Une trappe pour Object.setPrototypeOf.
// handler.isExtensible()
// Une trappe pour Object.isExtensible.
// handler.preventExtensions()
// Une trappe pour Object.preventExtensions.
// handler.getOwnPropertyDescriptor()
// Une trappe pour Object.getOwnPropertyDescriptor.
// handler.defineProperty()
// Une trappe pour Object.defineProperty.
// handler.has()
// Une trappe pour l'opérateur in.
// handler.get()
// Une trappe pour l'accès aux valeurs des propriétés.
// handler.set()
// Une trappe pour la définition des valeurs des propriétés.
// handler.deleteProperty()
// Une trappe pour l'opérateur delete.
// handler.ownKeys()
// Une trappe pour Object.getOwnPropertyNames et Object.getOwnPropertySymbols.
// handler.apply()
// Une trappe pour l'appel d'une fonction.
// handler.construct()
  }
}
/**
 * Make `model` inherit from model `from`.
 * @param {Object} model_  a tree of properties
 * @param {Object} from_  a tree of properties
 */
eYo.Model.extends = (model, base, ignore) => {
  var do_it = (model_, base_, ignore) => {
    // if (eYo.isO(model_) && eYo.isModel(from_)) {
    //   for (var k in model_) {
    //     ignore && ignore(k) || do_it(model_[k], from_[k], ignore)
    //   }
    //   Object.setPrototypeOf(model_, from_)
    //   eYo.assert(Object.getPrototypeOf(model_) === from_, `Unexpected ${Object.getPrototypeOf(model_)} !== ${from_}`)
    //   model_.model__ = model
    // }
    if (eYo.isO(model_) && eYo.isO(base_)) {
      for (var k in base_) {
        if (ignore && ignore(k)) {
          continue
        }
        var model_d = model_[k]
        var base_d = base_[k]
        if (eYo.isO(base_d)) {
          if (model_d) {
            if (!eYo.isO(model_d)) {
              // already defined
              continue
            }
          } else {
            model_d = model_[k] = {}
          }
          // we have an object dictionary, do a mixin
          do_it(model_d, base_d, ignore)
        } else if (!model_d) {
          // it is not a dictionary, do a simple copy when not already set
          model_[k] = base_d
        }
      }
    }
  }
  do_it(model, base, ignore)
  return
}
