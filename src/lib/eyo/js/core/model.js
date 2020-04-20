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
  validateStr: (what) => {
    return !eYo.isStr(what) && eYo.INVALID
  },
  validateF: (what) => {
    return !eYo.isF(what) && eYo.INVALID
  },
  validateBool: (what) => {
    return !eYo.isBool(what) && eYo.INVALID
  },
  validateForFalse: (what) => {
    return what !== false && !eYo.isF(what) && eYo.INVALID
  },
  asRA: (what) => {
    return !eYo.isRA(what) && [what]
  },
  getD: (what) => {
    return !eYo.isD(what) && eYo.INVALID
  },
})

eYo.model._p.descriptorF = function(model) {
  model || (model = {})
  model[eYo.model.VALIDATE] = eYo.model.validateF
  return model
}

eYo.model._p.descriptorBool = function(model) {
  model || (model = {})
  model[eYo.model.VALIDATE] = eYo.model.validateBool
  return model
}

eYo.model._p.descriptorStr = function(model) {
  model || (model = {})
  model[eYo.model.VALIDATE] = eYo.model.validateStr
  return model
}

eYo.model._p.descriptorForFalse = function(model) {
  model || (model = {})
  model[eYo.model.VALIDATE] = eYo.model.validateForFalse
  return model
}

eYo.model._p.descriptorRA = function(model) {
  model || (model = {})
  model[eYo.model.VALIDATE] = eYo.model.asRA
  return model
}

eYo.model._p.descriptorD = function(model) {
  model || (model = {})
  model[eYo.model.VALIDATE] = eYo.model.getD
  return model
}

/**
 * Convenient method 
 */
eYo.model._p.manyDescriptorF = function (...$) {
  let ans = {}
  $.forEach(k => {
    ans[k] = this.descriptorF()
  })
  return ans
}

/**
 * Convenient method 
 */
eYo.model._p.manyDescriptorBool = function (...$) {
  let ans = {}
  $.forEach(k => {
    ans[k] = this.descriptorBool()
  })
  return ans
}

/**
 * Convenient method 
 */
eYo.model._p.manyDescriptorStr = function (...$) {
  let ans = {}
  $.forEach(k => {
    ans[k] = this.descriptorStr()
  })
  return ans
}

/**
 * Convenient method 
 */
eYo.model._p.manyDescriptorForFalse = function (...$) {
  let ans = {}
  $.forEach(k => {
    ans[k] = this.descriptorForFalse()
  })
  return ans
}

/**
 * Convenient method 
 */
eYo.model._p.manyDescriptorRA = function (...$) {
  let ans = {}
  $.forEach(k => {
    ans[k] = this.descriptorRA()
  })
  return ans
}

/**
 * Convenient method 
 */
eYo.model._p.manyDescriptorD = function (...$) {
  let ans = {}
  $.forEach(k => {
    ans[k] = this.descriptorD()
  })
  return ans
}

/**
 * A model is a tree.
 * The shape of this tree is controlled by an instance of a 
 * eYo.model.Format.
 * No subclassing.
 * @param {eYo.model.Format} [parent] - the parent if any, required whe a key is given
 * @param {String} [key] - the relative location of the created controller within the parent, required when there is a parent and no fallback
 * @param {eYo.model.Format} [fallback] - map of fallback 
 */
eYo.model.Format = function (parent, key, fallback) {
  // accepted combination of arguments:
  // 1) parent, key, fallback
  // 2) parent, key
  // 3) parent, fallback
  // 4) key, fallback
  // 5) fallback
  if (eYo.isStr(parent)) { // cases 4: shift arguments
    fallback && eYo.throw(`eYo.model.Format: unexpected argument ${fallback}`)
    key || eYo.throw(`eYo.model.Format: missing fallback`)
    ;[parent, key, fallback] = [eYo.NA, parent, key] // case 1
  } else if (eYo.isStr(key)) { // cases 1 and 2
    parent || eYo.throw(`eYo.model.Format: missing parent`)
  } else { // cases 3 and 5
    fallback && eYo.throw(`eYo.model.Format: unexpected argument ${fallback} (2)`)
    if (key) { // case 3
      ;[key, fallback] = [eYo.NA, key]
    } else { // case 6
      ;[parent, fallback] = [eYo.NA, parent]
    }
  }
  this.parent = parent
  this.key = parent ? key || fallback && fallback.key || '' : ''
  this.map = new Map()
  this.fallback = fallback
}

/**
 * Smart getter method.
 * Navigate the formats along the path, creating controllers when needed.
 * Takes care of wildcard formats.
 * Callbacks are used during format creation.
 * @param {String} path - the required path, relative to the receiver
 * @param {Boolean} [create] - whether controllers are created.
 */
eYo.model.Format.prototype.get = function (path, create) {
  var c = this
  for (let k of path.split('/')) {
    if (k && k !== eYo.model.DOT) {
      var cc = c.map.get(k)
      if (!cc) {
        cc = c.map.get(eYo.model.ANY)
        if (!cc) {
          let fb = c.fallback
          if (fb) {
            if ((cc = fb.get(k))) {
              cc = new eYo.model.Format(c, cc.key, cc)
              c.map.set(k, cc)
            }
          }
          if (!cc) {
            if (create) {
              cc = new eYo.model.Format(this, k)
              c.map.set(k, cc)
            } else {
              return // ... nothing
            }
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
eYo.model.Format.prototype.isAllowed = function (...$) {
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
 * arguments is a list of strings, arrays or strings, objects or eYo.model.Format instances.
 */
eYo.model.Format.prototype.allow = function (...$) {
  var c = this
  var pending
  $.forEach(arg => {
    if (arg) {
      let mf = arg.eyo && arg.eyo.modelFormat || arg
      if (mf && mf instanceof eYo.model.Format) {
        pending || eYo.throw(`Cannot allow a model controller with no preceding key`)
        mf = new eYo.model.Format(c, pending, mf)
        c.map.set(pending, (c = mf))
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
        if (eYo.isRA(v = arg[eYo.model.DOT])) {
          v.forEach(k => {
            c.get(k, true)
          })
        }
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
    }
  })
  pending && c.get(pending, true)
}

/**
 * @name {eYo.model.Format.all}
 * @name {eYo.model.Format.path}
 * Private computed property
 */
Object.defineProperties(eYo.model.Format.prototype, {
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
eYo.model.Format.prototype.validate = function (path, model) {
  var c = this
  if (eYo.isDef(model)) {
    path.split('/').forEach(k => {
      if (k) { // avoid ''
        let cc = c.get(k)
        if (!cc) {
          eYo.throw(`validate: unreachable path ${c.path}/${k}`)
        }
        cc || eYo.throw(`validate: unreachable path: ${c.path}/${k}`)
        c = cc
      }
    })
  } else {
    [path, model] = [eYo.NA, path]
  }
  if (eYo.isDef(model)/* && !(model instanceof eYo.c9r.BaseC9r)*/) {
    // validate the model
    let v = c.validate_
    ? c.validate_(model)
    : c.fallback && c.fallback.validate(model)
    if (eYo.isINVALID(v)) {
      if (eYo.TESTING) {
        console.error(model)
      }
      eYo.throw(`validate: bad model at ${c.path} (set eYo.TESTING to true and see console)`)
    } else if (v) {
      model = v
    }
    Object.keys(model).forEach(k => {
      let cc = c.get(k)
      if (cc) {
        let m = cc.validate(model[k])
        if (m && (model[k] !== m)) {
          model[k] = m
        }
      }
    })
    return model
  }
}
