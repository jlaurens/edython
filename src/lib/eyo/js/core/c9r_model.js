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
 * @name {eYo.C9r.model}
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

eYo.C9r.model.Allowed = {
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
    'promise', // : eYo.t3.Expr.value_list,
    'validateIncog', //  () {},
    'accept', //  () {},
    'willConnect', //  () {},
    'willDisconnect', //  () {},
    'didConnect', //  () {},
    'didDisconnect', //  () {},
    'consolidate', // () {},
    'wrap', // : TYPE,
    'xml', // : (() => {} || true) || false||  first expected,
    'plugged', // : eYo.t3.Expr.primary,
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
/**
 * @name{eYo.C9r.model.isAllowed}
 * Allowed keys by path pattern
 * @param {String} path - Dot separated path components
 * @param {String} key - Dotless path components
 * @return {Boolean} Whether the key is authorized with the given path.
 */
eYo.C9r.model.isAllowed = (path, key) => {
  for (var k in eYo.C9r.model.Allowed) {
    var re = XRegExp(k)
    if (re.test(path)) {
      var expected = eYo.C9r.model.Allowed[k]
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
 * @param {Object} model - the tree in which we replace some node by objects
 * @param {Function} handler - a function with signature (path, before): boolean
 */
eYo.c9r.model.Consolidate = (model, handler) => {
  handler || (handler = eYo.C9r.model.ShortcutsBaseHandler)
  var do_it = (model, path) => {
    eYo.isO(model) && Object.keys(model).forEach(k => {
      handler(model, path, k) || do_it(model[k], path && `${path}.${k}` || k)
    })
  }
  do_it(model, '')
}

eYo.Dlgt_p.modelConsolidate = function (...args) {
  eYo.c9r.model.Consolidate(...args)
}

/**
 * Expands a data model.
 * @param {Object} model
 * @param {String} key
 * @return {Object}
 */
eYo.C9r.model.dataHandler = eYo.do.nothing

/**
 * Expands a magnet model.
 * @param {Object} model
 * @param {String} key
 * @return {Object}
 */
eYo.C9r.model.MagnetHandler = eYo.do.nothing

/**
 * Expands a property model.
 * @param {Object} model
 * @return {Object}
 */
eYo.C9r.model.PropertyHandler = eYo.do.nothing

;(() => {
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
  eYo.C9r.model.ShortcutsBaseHandler = (model, path, key) => {
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
          eYo.C9r.model.MagnetHandler(before)
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
        eYo.C9r.model.PropertyHandler(model)
      }
    } else if (['out', 'head', 'left', 'right', 'suite', 'foot'].includes(path)) {
      if (key === 'check') {
        // BRICK_TYPE || [BRICK_TYPE] || () => {}
        after = ensureRAF(model[key])
      }
    } else if (path === 'data') {
      eYo.C9r.model.dataHandler(model, key)
    } else if (path === 'slots') {
      eYo.C9r.model.MagnetHandler(model)
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
}) ()

/**
 * Make `model` inherit from model `base`.
 * @param {Object} model_  a tree of properties
 * @param {Object} base  a tree of properties
 */
eYo.C9r.model.inherits = (model, base) => {
  var do_it = (model_, base_) => {
    if (eYo.isO(model_) && eYo.C9r.isModel(base_)) {
      eYo.ParameterAssert(!model_.model__, `Already inheritance: ${model}`)
      Object.keys(model_).forEach(k => {do_it(model_[k], base_[k])})
      Object.setPrototypeOf(model_, base_)
      eYo.Assert(Object.getPrototypeOf(model_) === base_, `Unexpected ${Object.getPrototypeOf(model_)} !== ${base_}`)
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
eYo.C9r.model.extends = (model, base) => {
  var do_it = (m, b, path) => {
    if (eYo.isO(m) && eYo.isO(b)) {
      for (var k in b) {
        if (!eYo.C9r.model.isAllowed(path, k)) {
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
 * The created model, by key.
 * @param{String} key - the key used to create the constructor.
 */
eYo.C9r.model.forKey = (key) => {
  var C9r = eYo.C9r.ByKey(key)
  return C9r && C9r.eyo.model
}

/**
 * The created model, by name.
 * @param{String} name - the key used to create the constructor.
 */
eYo.C9r.model.forName = (name) => {
  var C9r = eYo.C9r.ByName(name)
  return C9r && C9r.eyo.model
}

/**
 * The created models given its type.
 * @param{String} type - the key used to create the constructor.
 */
eYo.C9r.model.forType = (type) => {
  var C9r = eYo.C9r.ByType(type)
  return C9r && C9r.eyo.model
}
