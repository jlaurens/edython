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
 * @name {eYo.model}
 * @namespace
 */
eYo.makeNS('model')

/**
 * Whether the argument is a model object once created with `{...}` syntax.
 * @param {*} what
 */
eYo.isModel = (what) => {
  return what && (what.model__ || eYo.isD(what))
}

eYo.model.allowed = {
  ['^$']: [
    'dlgt', 'init', 'deinit', 'dispose', 'ui',
    'xml',
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
  ['^xml$']: [
    'attr', 'types', 'attribute',
  ],
  ['^ui$']: [
    'init', 'dispose', 'doInit', 'doDispose', 'initMake', 'disposeMake',
  ],
}

/**
 * Allow a new set ok keys.
 * @param {String} key - A model's top level key
 * @param {String|Array<String>} [pattern] - Optional pattern for top values, with a model given, defaults to word's pattern when not an array of strings.
 * @param {Map<String, Object>} [model]
 */
eYo.model._p.allow = function (key, pattern, model) {
  if (eYo.isRA(pattern)) {
    model && eYo.throw(`Unexpected model: ${model}`)
    eYo.model.allowed['^$'].push(key)
    eYo.mixinR(eYo.model.allowed, {[key]: pattern})
    return
  }
  if (!pattern) {
    eYo.model.allowed['^$'].push(key)
    return
  }
  if (!eYo.isStr(pattern)) {
    model && eYo.throw(`Unexpected model: ${model}`)
    model = pattern
    pattern = '^\\w+$'
  }
  eYo.model.allowed['^$'].push(key)
  eYo.mixinR(eYo.model.allowed, {[key]: pattern})
  model && eYo.mixinR(eYo.model.allowed, model)
}

eYo.model._p.allow('data', {
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
})

eYo.model._p.allow('slots', {
  ['^slots\\.\\w+$']: [
    'order', // INTEGER,
    'fields', // {},
    'check', // :  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
    'promise', // : eYo.t3.expr.value_list,
    'validateIncog', //  () {},
    'accept', //  () {},
    'willConnect', //  () {},
    'willDisconnect', //  () {},
    'didConnect', //  () {},
    'didDisconnect', //  () {},
    'consolidate', // () {},
    'wrap', // : TYPE,
    'xml', // : (() => {} || true) || false||  first expected,
    'plugged', // : eYo.t3.expr.primary,
  ],
  ['^slots\\.\\w+\.fields$']: '^\\w+$',
  ['^slots\\.\\w+\.fields\\.\\w+$']: [
    'value', // '(',
    'reserved', // : '.',
    'separator', // : true,
    'Variable', // : true,
    'validate', // : true,
    'endEditing', // : true,
    'willRender', //  () => {},
  ],
  ['^slots\\.\\w+\.xml$']: [
    'accept', //  () => {},
  ],
})

eYo.model._p.allow('aliases')

eYo.model._p.allow('list', [
  'check',
  'presep',
  'postsep',
  'ary',
  'mandatory',
  'unique',
  'all',
  'makeUnique'
])

/**
 * @name{eYo.model.isAllowed}
 * Allowed keys by path pattern
 * @param {String} path - Dot separated path components
 * @param {String} key - Dotless path components
 * @return {Boolean} Whether the key is authorized with the given path.
 */
eYo.model.isAllowed = (path, key) => {
  for (var k in eYo.model.allowed) {
    var re = XRegExp(k)
    if (re.test(path)) {
      var expected = eYo.model.allowed[k]
      if (eYo.isStr(expected)) {
        re = XRegExp(expected)
        return  re.test(key)  
      }
      return expected.includes(key)
    }
  }
  return false
}  

/**
 * The real model syntax may be somehow relaxed.
 * The method will turn the model into something strong.
 * @param {Object} model - the tree in which we replace some node by objects
 * @param {Function} handler - a function with signature (path, before): boolean
 */
eYo.model.consolidate = (model, handler) => {
  handler || (handler = eYo.model.shortcutsBaseHandler)
  var do_it = (model, path) => {
    eYo.isD(model) && Object.keys(model).forEach(k => {
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
eYo.model.dataHandler = eYo.doNothing

/**
 * Expands a magnet model.
 * @param {Object} model
 * @param {String} key
 * @return {Object}
 */
eYo.model.magnetHandler = eYo.doNothing

/**
 * Expands a property model.
 * @param {Object} model
 * @return {Object}
 */
eYo.model.propertyHandler = eYo.doNothing

;(() => {
  /*
   * When a function returning an array is expected.
   * @param {*} x 
   */
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
  eYo.model.shortcutsBaseHandler = (model, path, key) => {
    var before, after
    if (path === '') {
      if (['out', 'head', 'left', 'right', 'suite', 'foot'].includes(key)) {
        // BRICK_TYPE || [BRICK_TYPE] || () => {}
        if (eYo.isD(before = model[key])) {
          eYo.model.magnetHandler(before)
        } else {
          after = {
            check: ensureRAF(before)
          }
        }
      }
    } else if (['CONST'].includes(path)) {
      if (eYo.isF(before = model[key])) {
        after = { init: before }
      } else if (!eYo.isD(before)) {
        after = { value: before }
      } else if (before) {
        eYo.model.propertyHandler(model)
      }
    } else if (['out', 'head', 'left', 'right', 'suite', 'foot'].includes(path)) {
      if (key === 'check') {
        // BRICK_TYPE || [BRICK_TYPE] || () => {}
        after = ensureRAF(model[key])
      }
    } else if (path === 'data') {
      eYo.model.dataHandler(model, key)
    } else if (path === 'slots') {
      eYo.model.magnetHandler(model)
    } else if (path === 'list') {
      if (['check', 'unique', 'all'].includes(key)) {
        // BRICK_TYPE || [BRICK_TYPE] || () => {}
        after = ensureRAF(model[key])
      }
    } else if (key === 'all') {
      var before = model[key]
      if (!eYo.isRA(before)) {
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
}) ()

/**
 * Make `model` inherit from model `base`.
 * @param {Object} model_  a tree of properties
 * @param {Object} base  a tree of properties
 */
eYo.model.inherits = (model, base) => {
  var do_it = (M, B) => {
    if (eYo.isD(M) && eYo.isModel(B)) {
      M.model__ && eYo.throw(`Already inheritance: ${model}`)
      Object.keys(M).forEach(k => {do_it(M[k], B[k])})
      Object.setPrototypeOf(M, B)
      eYo.assert(Object.getPrototypeOf(M) === B, `Unexpected ${Object.getPrototypeOf(M)} !== ${B}`)
      M.model__ = model
    }
  }
  do_it(model, base)
}
/**
 * Make `model` extend model `base`.
 * @param {Object} model_  a tree of properties
 * @param {Object} from_  a tree of properties
 */
eYo.model.extends = (model, base) => {
  var do_it = (m, b, path) => {
    if (eYo.isD(m) && eYo.isD(b)) {
      for (var k in b) {
        if (!eYo.model.isAllowed(path, k)) {
          console.warn(`Attempting to use ${path}.${k} in a model`)
          return
        }
        if (m[k] === eYo.NA) {
          var after = b[k]
          m[k] = eYo.isD(after) ? {} : after
        }
        do_it(m[k], b[k], path && `${path}.${k}` || k)
      }
    }
  }
  do_it(model, base, '')
  return
}
