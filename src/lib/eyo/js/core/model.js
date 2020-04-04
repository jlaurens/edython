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
  ROOT: '^$',
  DOT: '.',
  ANY: '*',
  EXPAND: '...',
  VALIDATE: '!',
})

/**
 * A model is a tree.
 * The shape of this tree is controlled by an instance of a 
 * eYo.model.Controller.
 * @param {eYo.model.Controller} [parent] - the parent if any
 * @param {String} [key] - the relative location of the created controller within the parent, only when there is a parent
 * @param {Object} tree - a standard object
 */
eYo.model.Controller = function (parent, key) {
  this.parent = parent
  if (parent) {
    this.key = key || ''
    this.pattern = key === eYo.model.ANY
    ? '^\\w+$'
    : key.startsWith('^')
      ? key
      : `^${key}$`
  } else {
    this.key = ''
    this.pattern = '^$'
  }
  this.map = new Map()
  this.expand = eYo.doNothing
  this.validators = []
}

/**
 * Private tree method.
 * arguments is a list of strings and objects.
 */
eYo.model.Controller.prototype.allow = function (...$) {
  var c = this
  for (let arg in $) {
    if (eYo.isStr(arg)) {
      for (let k in arg.split('/')) {
        let cc = c.map.get(k)
        if (!cc) {
          cc = new eYo.model.Controller(this, k)
          c.map.set(k, cc)
        }
        c = cc
      }
    } else {
      var v
      if (eYo.isF((v = arg[eYo.model.EXPAND]))) {
        eYo.isF(v) || eYo.throw(`Forbidden ${eYo.model.EXPAND} -> ${v}`)
        c.expand = v
        delete arg[eYo.model.EXPAND]
      }
      if (eYo.isF((v = arg[eYo.model.VALIDATE]))) {
        eYo.isF(v) || eYo.throw(`Forbidden ${eYo.model.VALIDATE} -> ${v}`)
        c.validators.append(v)
        delete arg[eYo.model.VALIDATE]
      }
      for (let [k, v] of Object.entries(arg)) {
        c.allow(k, v) // avoid recursivity ?
      }
    }
  }
}

/**
 * @name {eYo.model.Controller.prototype.path}
 * Private computed property
 */
Object.defineProperties(eYo.model.Controller.prototype, {
  all: eYo.desciptorR(function () {
    var p = this
    let ans = [p]
    while ((p = p.parent)) {
      ans.unshift(p)
    }
    return ans
  }),
  path: eYo.desciptorR(function () {
    return this.all.map(x => x.key).join('/')
  }),
})

/**
 * expand and validates the given model
 * @param {String} [path] - The path of the model object
 * @param {Object} model - A model object to validate
 */
eYo.model.Controller.prototype.consolidate = function (path, model) {
  var c = this
  if (eYo.isStr(path)) {
    for (let k in arg.split('/')) {
      if (k) { // avoid ''
        let cc = c.map.get(k)
        cc || eYo.throw(`Unreachable path: ${c.path}/${k}`)
        c = cc
      }
    }
  }
  c.validators.forEach(f => {
    f (model)
  })
  Object.keys(model).forEach(k => {
    var v = model[k]
    if (!eYo.isO(v)) {
      let cc = c.map.get(k)
      if (cc) {
        cc.consolidate(k, v)
      }
    }
  })
  Object.keys(model).forEach(k => {
    var v = model[k]
    if (!eYo.isO(v)) {
      let cc = c.map.get(k)
      if (cc) {
        v = cc.expand(k, v, model)
        if (eYo.isINVALID(v)) {
          delete model[k]
          eYo.throw(`Bad model : unexpected ${k} -> ${v}, at ${cc.path}`)
        } else if (v) {
          model[k] = v
        }  
      }
    }
  })
}

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
eYo.model._p.controller__ = new eYo.model.Controller()

/**
 * @name {eYo.model.allow}
 */
eYo.model._p.allow = eYo.model._p.controller__.allow.bind(eYo.model.controller__)

/**
 * @name {eYo.model.conslidate}
 */
eYo.model.consolidate = eYo.model._p.controller__.consolidate.bind(eYo.model.controller__)



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
 * @param {String} [path] - Defaults to a void string for the root path.
 * @param {Object} model - the tree in which we replace some node by objects
 */
eYo.model._p.modelExpand = function (path, model) {
  if (!eYo.isStr(path)) {
    [path, model] = [model, path]
  }
  if (path) {
    Object.keys(this.shortcut).forEach(pattern => {
      if (XRegExp(`^${pattern}$`).test(path)) {
        this.shortcut[pattern].forEach(f => {
          eYo.isF(f) || eYo.throw(`Missing a function, got ${typeof f} instead: ${f}`)
          if (eYo.isINVALID(f(model, path))) {
            eYo.throw(`Bad model ${model} at ${path}`)
          }
        })
      }
    })
  }
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
      eYo.isD(M = model[k]) && this.modelExpand(p, M)
    }
  })
  return model
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
