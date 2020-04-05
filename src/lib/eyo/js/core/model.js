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
 * No subclassing.
 * @param {eYo.model.Controller} [parent] - the parent if any
 * @param {String} [key] - the relative location of the created controller within the parent, only when there is a parent
 * @param {Object} tree - a standard object
 */
eYo.model.Controller = function (parent, key) {
  this.parent = parent
  this.key = parent ? key || '' : ''
  this.map = new Map()
  this.expand = eYo.doNothing
  this.validators = []
}

/**
 * Smart getter method.
 * Navigate the controllers along the path, creating controllers when needed.
 * Takes care of wildcard controllers.
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
            return // ... nothing
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
eYo.model.Controller.prototype.modelIsAllowed = function (...$) {
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
 * arguments is a list of strings, arrays or strings, objects or eYo.model.Controller instances.
 */
eYo.model.Controller.prototype.allow = function (...$) {
  var c = this
  var pending
  $.forEach(arg => {
    let mc = arg.modelController || arg
    if (mc && mc instanceof eYo.model.Controller) {
      pending || eYo.throw(`Cannot allow a model controller with no preceding key`)
      c.map.set(pending, mc)
      c = mc
      pending = eYo.NA
      return
    }
    if (pending) {
      c = c.get(pending, true)
    }
    if (eYo.isStr(arg)) {
      pending = arg
      return
    }
    pending = eYo.NA
    if (eYo.isRA(arg)) {
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
  pending && c.get(pending, true)
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
 * The global model controller.
 * Each namespace can have its own model controller.
 * Subclass `modelController` for that purpose.
 * @name {eYo.model.makeModelController}
 */
eYo.model._p.makeModelController = function () {
  let c = new eYo.model.Controller()
  Object.defineProperty(
    this._p,
    'modelController',
    eYo.descriptorR(true, function () {
      return c
    })
  )
}

/**
 * Make the model controller of that name space.
 * Each namespace can have its own model controller.
 * No inheritance between model controllers.
 * @name {eYo.model.modelController}
 */
eYo.model.makeModelController()

/**
 * @name {eYo.model.allow}
 */
eYo.model._p.modelAllow = function (...$) {
  return this.modelController.allow(...$)
}

/**
 * @name {eYo.model.modelConsolidate}
 */
eYo.model._p.modelConsolidate = function (...$) {
  return this.modelController.consolidate(...$)
}

/**
 * @name{eYo.model.modelIsAllowed}
 * @return {Boolean} Whether the key is authorized with the given path.
 */
eYo.model._p.modelIsAllowed = function (...$) {
  return this.modelController.modelIsAllowed(...$)
}

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
