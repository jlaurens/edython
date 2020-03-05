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
eYo.makeNS('model', {
  ROOT: '^$'
})

/**
 * Whether the argument is a model object once created with `{...}` syntax.
 * @param {*} what
 */
eYo.isModel = (what) => {
  return what && (what.model__ || eYo.isD(what))
}

/**
 * A model is an object representing a tree.
 * Each node is accessed by a path.
 * If `M` is the root node, the node `M.foo.bar` has path `foo.bar`.
 * Paths are given as regular expression to embrace many cases at a time.
 * Here is a map from paths to a list of allowed keys.
 * @name {eYo.model.allowed}
 */
eYo.model._p.allowed = Object.create(null)

/**
 * @name{eYo.model.isAllowed}
 * Allowed keys by path pattern
 * @param {String} path - Dot separated path components
 * @param {String} key - Dotless path components
 * @return {Boolean} Whether the key is authorized with the given path.
 */
eYo.model._p.isAllowed = function (path, key) {
  for (let k in this.allowed) {
    var re = XRegExp(`^${k}$`)
    if (re.test(path)) {
      return this.allowed[k].some(k => XRegExp(`^${k}$`).test(key))
    }
  }
  return false
}

/**
 * Allow a new set of keys.
 * @param {Map<String,String|Array<String>>} [model]
 */
eYo.model._p.allowModelPaths = function (model) {
  Object.keys(model).forEach(path => {
    let keys = model[path]
    var already = this.allowed[path]
    already || (already = this.allowed[path] = [])
    if (eYo.isStr(keys)) {
      already.push(keys)
    } else if (eYo.isRA(keys)) {
      already.splice(-1, 0, ...keys)
    }
  })
}

eYo.model.allowModelPaths({
  [eYo.model.ROOT]: [
    'xml',
  ],
  xml: [
    'attr', 'types', 'attribute',
  ],
})

eYo.model.allowModelPaths({
  [eYo.model.ROOT]: 'slots',
  'slots\\.\\w+': [
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
  'slots\\.\\w+\.fields\\.\\w+': [
    'value', // '(',
    'reserved', // : '.',
    'separator', // : true,
    'Variable', // : true,
    'validate', // : true,
    'endEditing', // : true,
    'willRender', //  () => {},
  ],
  'slots\\.\\w+\.xml': [
    'accept', //  () => {},
  ],
})

eYo.model.allowModelPaths({
  [eYo.model.ROOT]: 'list',
  list: [
    'check',
    'presep',
    'postsep',
    'ary',
    'mandatory',
    'unique',
    'all',
    'makeUnique'
  ]
})

/**
 * Some shortcuts are allowed.
 * @name {eYo.model.shortcut}
 */
eYo.model._p.shortcut = Object.create(null)

/**
 * Allow new shortcuts.
 * @param {Map<String, Function>} [model] - Functions.
 */
eYo.model._p.allowModelShortcuts = function (model) {
  Object.keys(model).forEach(path => {
    let shortcut = model[path]
    eYo.isF(shortcut) || eYo.throw(`Unexpected shortcut handler: ${shortcut}`)
    let already = this.shortcut[path]
    if (already) {
      already.push(shortcut)
    } else {
      this.shortcut[path] = [shortcut]
    }
  })
}

/**
 * The real model syntax may be somehow relaxed.
 * The method will turn the given model into something strong
 * by expanding shortcuts. After this call, the model is well formed.
 * @param {Object} model - the tree in which we replace some node by objects
 * @param {String} path - Defaults to a void string for the root path.
 */
eYo.model._p.modelExpand = function (model, path = '') {
  Object.keys(model).forEach(k => {
    let p = path && `${path}.${k}` || k
    var M = model[k]
    if (eYo.isNA(M)) {
      model[k] = {
        value: M
      }
    } else {
      Object.keys(this.shortcut).forEach(pattern => {
        if (XRegExp(`^${pattern}$`).test(p)) {
          if (this.shortcut[pattern].some(f => {
            if (!eYo.isF(f)) {
              console.error('BREAK HERE!!! !eYo.isF(f)')
            }
            eYo.isF(f) || eYo.throw(`Missing a function, got ${typeof f} instead: ${f}`)
            let ans = f(M, p)
            if (eYo.isINVALID(ans)) {
              delete model[k]
              return true
            } else if (ans) {
              model[k] = ans
            }
          })) {
            return
          }
        }
      })
      eYo.isD(M = model[k]) && this.modelExpand(M, p)
    }
  })
}

;(() => {
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
            check: eYo.toRAF(before)
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
        after = eYo.toRAF(model[key])
      }
    } else if (path === 'data') {
      eYo.model.dataHandler(model, key)
    } else if (path === 'slots') {
      eYo.model.magnetHandler(model)
    } else if (path === 'list') {
      if (['check', 'unique', 'all'].includes(key)) {
        // BRICK_TYPE || [BRICK_TYPE] || () => {}
        after = eYo.toRAF(model[key])
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
 * @param {Object} model - a tree of properties
 * @param {Object} base - a tree of properties
 */
eYo.model._p.extends = function (m, b, path = '') {
  if (eYo.isD(m) && eYo.isD(b)) {
    for (var k in b) {
      if (!this.isAllowed(path, k)) {
        console.warn(`Attempting to use ${path}.${k} in a model`)
        return
      }
      if (m[k] === eYo.NA) {
        m[k] = b[k]
      }
      this.extends(m[k], b[k], path && `${path}.${k}` || k)
    }
  }
}
