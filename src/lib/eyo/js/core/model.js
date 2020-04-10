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
  VALIDATE: '!',
})

/**
 * A model is a tree.
 * The shape of this tree is controlled by an instance of a 
 * eYo.model.Validator.
 * No subclassing.
 * @param {eYo.model.Validator} [parent] - the parent if any
 * @param {String} [key] - the relative location of the created controller within the parent, only when there is a parent
 * @param {Object} tree - a standard object
 */
eYo.model.Validator = function (parent, key) {
  this.parent = parent
  this.key = parent ? key || '' : ''
  this.map = new Map()
}

/**
 * Smart getter method.
 * Navigate the controllers along the path, creating controllers when needed.
 * Takes care of wildcard controllers.
 * @param {String} path - the required path, relative to the receiver
 * @param {Boolean} [create] - whether controllers are created.
 */
eYo.model.Validator.prototype.get = function (path, create) {
  var c = this
  for (let k of path.split('/')) {
    if (k && k !== eYo.model.DOT) {
      var cc = c.map.get(k)
      if (!cc) {
        cc = c.map.get(eYo.model.ANY)
        if (!cc) {
          if (create) {
            cc = new eYo.model.Validator(this, k)
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
eYo.model.Validator.prototype.isAllowed = function (...$) {
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
 * arguments is a list of strings, arrays or strings, objects or eYo.model.Validator instances.
 */
eYo.model.Validator.prototype.allow = function (...$) {
  var c = this
  var pending
  $.forEach(arg => {
    let mc = arg.modelController || arg
    if (mc && mc instanceof eYo.model.Validator) {
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
      if (eYo.isF((v = arg[eYo.model.VALIDATE]))) {
        eYo.isF(v) || eYo.throw(`Forbidden ${eYo.model.VALIDATE} -> ${v}`)
        c.validate_ = v
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
 * @name {eYo.model.Validator.all}
 * @name {eYo.model.Validator.path}
 * Private computed property
 */
Object.defineProperties(eYo.model.Validator.prototype, {
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
 * Validates the given model
 * @param {String} [path] - The path of the model object
 * @param {Object} model - A model object to validate
 * @return {Object} the possibly validated model.
 */
eYo.model.Validator.prototype.validate = function (path, model) {
  var c = this
  if (eYo.isDef(model)) {
    path.split('/').forEach(k => {
      if (k) { // avoid ''
        let cc = c.get(k)
        if (!cc) {
          eYo.throw(`Unreachable path: ${c.path}/${k}`)
        }
        cc || eYo.throw(`Unreachable path: ${c.path}/${k}`)
        c = cc
      }
    })
  } else {
    [path, model] = [eYo.NA, path]
  }
  if (eYo.isDef(model)) {
    // validate the model
    if (c.validate_) {
      let v = c.validate_(model)
      if (eYo.isINVALID(v)) {
        console.error(model)
        eYo.throw(`Bad model at ${c.path} (see console)`)
      } else if (v) {
        model = v
      }
    }
    Object.keys(model).forEach(k => {
      let cc = c.get(k)
      if (cc) {
        let m = cc.validate(model[k])
        if (m) {
          model[k] = m
        }
      }
    })
    return model
  }
}
