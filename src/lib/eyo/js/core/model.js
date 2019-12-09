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

eYo.require('eYo.ns')

/**
 * The model management.
 * Models are trees with some inheritancy.
 * @name {eYo.ns.ModelNS}
 * @namespace
 */
eYo.ns.make('Model')

/**
 * Whether the argument is a model object once created with `{...}` syntax.
 * @param {*} what
 */
eYo.isModel = (what) => {
  return what && (what.model__ || eYo.isO(what))
}

/**
 * Allowed keys by path pattern
 * @param {String} path - Dot separated path components
 * @param {String} key - Dotless path components
 * @return {Boolean} Whether the key is authorized with the given path.
 */
eYo.ns.Model.isAllowed = (path, key) => {
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
eYo.ns.Model.expandShortcuts = (model, handler) => {
  var do_it = (model, path) => {
    eYo.isO(model) && Object.keys(model).forEach(k => {
      handler(model, path, k) || do_it(model[k], path + '.' + k)
    })
  }
  do_it(model, '')
}
/**
 * @param {Object} model
 * @param {String} path
 * @param {String} key
 */
eYo.ns.Model.shortcutsBaseHandler = (model, path, key) => {
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
  } else if (eYo.XRegExp.match(path, /Slots\.\\w+\.fields/)) {
    var before = model[key]
    if (eYo.isStr(before)) {
      after = {
        value: before
      }
    }
  } else if (eYo.XRegExp.match(path, /Slots\.\\w+\.fields\.\w+/)) {
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
eYo.ns.Model.Handler = (model, C9r, linkC9r) => {

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
eYo.ns.Model.inherits = (model, base) => {
  var do_it = (model_, base_) => {
    if (eYo.isO(model_) && eYo.isModel(base_)) {
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
eYo.ns.Model.extends = (model, base) => {
  var do_it = (model_, base_, path) => {
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
        if (!eYo.ns.Model.isAllowed(path, k)) {
          console.warn(`Attempting to use ${path}.${k} in a model`)
          return
        }
        if (model[k] === eYo.NA) {
          var after = base[k]
          model[k] = eYo.isO(after) ? {} : after
        }
        do_it(model_[k], base_[k], path + '.' + k)
      }
    }
  }
  do_it(model, base, '')
  return
}
