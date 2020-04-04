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
 * Whether the argument is a model object once created with `{...}` syntax.
 * @param {*} what
 */
eYo.isModel = (what) => {
  return what && (what.model__ || eYo.isD(what))
}

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
 * @param {String} path - the required path, relative to the receiver
 * @param {Boolean} [create] - whether controllers are created.
 */
eYo.model.Controller.prototype.get = function (path, create) {
  var c = this
  for (let k of path.split('/')) {
    if (k && k !== eYo.model.DOT) {
      var cc = c.map.get(k)
      if (!cc) {
        cc = c.map.get(eYo.model.ANY)
        if (!cc) {
          if (create) {
            cc = new eYo.model.Controller(this, k)
            c.map.set(k, cc)
          } else {
            return
          }
        }
      }
      c = cc       
    }
  }
  return c
}

/**
 * Private tree method.
 * arguments is a list of strings, arrays or strings and objects.
 */
eYo.model.Controller.prototype.isAllowed = function (...$) {
  var c = this
  $.forEach(key => {
    c = c.get(key)
    if (!c) {
      return
    }
  })
  return !!c
}

/**
 * Private tree method.
 * arguments is a list of strings, arrays or strings and objects.
 */
eYo.model.Controller.prototype.allow = function (...$) {
  var c = this
  $.forEach(arg => {
    if (eYo.isStr(arg)) {
      c = c.get(arg, true)
    } else if (eYo.isRA(arg)) {
      arg.forEach(k => {
        c.get(k, true)
      })
    } else {
      var v
      let keys = new Set(Object.keys(arg))
      if (eYo.isF((v = arg[eYo.model.EXPAND]))) {
        eYo.isF(v) || eYo.throw(`Forbidden ${eYo.model.EXPAND} -> ${v}`)
        c.expand = v
        keys.delete(eYo.model.EXPAND)
      }
      if (eYo.isF((v = arg[eYo.model.VALIDATE]))) {
        eYo.isF(v) || eYo.throw(`Forbidden ${eYo.model.VALIDATE} -> ${v}`)
        c.validators.append(v)
        keys.delete(eYo.model.VALIDATE)
      }
      keys.forEach(k => {
        c.allow(k, arg[k]) // avoid recursivity ?
      })
    }
  })
}

/**
 * @name {eYo.model.Controller.prototype.path}
 * Private computed property
 */
Object.defineProperties(eYo.model.Controller.prototype, {
  all: eYo.descriptorR(function () {
    var p = this
    let ans = [p]
    while ((p = p.parent)) {
      ans.unshift(p)
    }
    return ans
  }),
  path: eYo.descriptorR(function () {
    return this.all.map(x => x.key).join('/') || '/'
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
    path.split('/').forEach(k => {
      if (k) { // avoid ''
        let cc = c.map.get(k)
        cc || eYo.throw(`Unreachable path: ${c.path}/${k}`)
        c = cc
      }
    })
  } else {
    [path, model] = ['/', path]
  }
  if (model) {
    // validate the model
    c.validators.forEach(f => {
      f (model)
    })
    Object.keys(model).forEach(k => {
      var v = model[k]
      if (!eYo.isD(v)) {
        let cc = c.get(k)
        if (cc) {
          v = cc.expand(v, k, model)
          if (eYo.isINVALID(v)) {
            eYo.throw(`Bad model : unexpected ${k} -> ${v}, at ${cc.path}`)
          } else if (v) {
            model[k] = v
          }  
        }
      }
    })
    Object.keys(model).forEach(k => {
      var v = model[k]
      if (eYo.isD(v)) {
        let cc = c.get(k)
        if (cc) {
          cc.consolidate(v)
        }
      }
    })
  }
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
eYo.model._p.modelAllow = eYo.model.controller__.allow.bind(eYo.model.controller__)

/**
 * @name {eYo.model.modelConsolidate}
 */
eYo.model._p.modelConsolidate = eYo.model.controller__.consolidate.bind(eYo.model.controller__)

/**
 * @name{eYo.model.isAllowed}
 * @return {Boolean} Whether the key is authorized with the given path.
 */
eYo.model._p.isAllowed = eYo.model.controller__.isAllowed.bind(eYo.model.controller__)

/**
 * Allow a new set of keys.
 * @param {Map<String,String|Array<String>>} [model]
 */
eYo.model._p.allowModelPaths = function (model) {
  return
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
  return
}

eYo.model.extends = eYo.doNothing
