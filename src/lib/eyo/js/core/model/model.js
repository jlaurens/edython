/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Models are used to extend existing classes by subclassing with a simple syntax.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

//<<< mochai: eYo.model

/**
 * Whether the argument is a model object once created with `{...}` syntax.
 * @param {*} what
 */
eYo.isModel = what => {
  return !!what && (!!what.model__ || eYo.isD(what))
  //<<< mochai: eYo.isModel
  //... chai.assert(eYo.isModel)
  //... chai.expect(eYo.isModel({})).true
  //... chai.expect(eYo.isModel()).false
  //... chai.expect(eYo.isModel(421)).false
  //... let o = new function() {}
  //... chai.expect(eYo.isModel(o)).false
  //... o.model__ = 421
  //... chai.expect(eYo.isModel(o)).true
  //>>>
}

/**
 * The model management.
 * Models are trees with some inheritancy.
 * @name {eYo.model}
 * @namespace
 */
eYo.makeNS('model', {
  //<<< mochai: eYo.model
  //... chai.assert(eYo.model)
  //... chai.assert(eYo.model.Format)
  //>>>
  ROOT: '^$',
  DOT: '.',
  DOTDOT: '..',
  ANY: '*',
  OPTION: '?', // private use
  VALIDATE: '!',
  /**
   * Return `eYo.INVALID` if the argument is defined and not 'true' nor 'false'.
   * @param{*} what
   * @return {Boolean}
   */
  validateBool: (what) => {
    if (eYo.isDef(what) && !eYo.isBool(what)) return eYo.INVALID
    //<<< mochai: eYo.model.validateBool
    //... chai.assert(!eYo.model.validateBool(true))
    //... chai.assert(!eYo.model.validateBool(false))
    //... chai.expect(!eYo.model.validateBool())
    //... chai.expect(eYo.model.validateBool(1)).equal(eYo.INVALID)
    //>>>
  },
  validateStr: (what) => {
    if (eYo.isDef(what) && !eYo.isStr(what)) return eYo.INVALID
    //<<< mochai: eYo.model.validateStr
    //... chai.assert(!eYo.model.validateStr('ABC'))
    //... chai.assert(!eYo.model.validateStr())
    //... chai.expect(eYo.model.validateStr(1)).equal(eYo.INVALID)
    //>>>
  },
  validateF: (what) => {
    if (eYo.isDef(what) && !eYo.isF(what)) return eYo.INVALID
    //<<< mochai: eYo.model.validateF
    //... chai.assert(!eYo.model.validateF(() => {}))
    //... chai.assert(!eYo.model.validateF())
    //... chai.expect(eYo.model.validateF(1)).equal(eYo.INVALID)
    //>>>
  },
  validateForFalse: (what) => {
    //<<< mochai: eYo.model.validateForFalse
    if (what === false) return eYo.doNothing
    //... chai.expect(eYo.model.validateForFalse(false)).equal(eYo.doNothing)
    if (eYo.isDef(what) && !eYo.isF(what))return eYo.INVALID
    //... chai.assert(!eYo.model.validateForFalse(() => {}))
    //... chai.assert(!eYo.model.validateForFalse())
    //... chai.expect(eYo.model.validateForFalse(1)).equal(eYo.INVALID)
    //... chai.expect(eYo.model.validateForFalse(true)).equal(eYo.INVALID)
    //>>>
  },
  validateRA: (what) => {
    if (eYo.isDef(what) && !eYo.isRA(what)) return eYo.INVALID
    //<<< mochai: eYo.model.validateRA
    //... chai.assert(!eYo.model.validateRA([]))
    //... chai.assert(!eYo.model.validateRA())
    //... chai.expect(eYo.model.validateRA(1)).equal(eYo.INVALID)
    //... chai.expect(eYo.model.validateRA(true)).equal(eYo.INVALID)
    //>>>
  },
  validateD: (what) => {
    if (eYo.isDef(what) && !eYo.isD(what)) return eYo.INVALID
    //<<< mochai: eYo.model.validateD
    //... chai.assert(!eYo.model.validateD({}))
    //... chai.assert(!eYo.model.validateD())
    //... chai.expect(eYo.model.validateD(1)).equal(eYo.INVALID)
    //... chai.expect(eYo.model.validateD(true)).equal(eYo.INVALID)
    //>>>
  },
})

/**
 * Descriptor.
 * @param {*} model
 * @name {eYo.model.descriptorBool}
 */
/**
 * Descriptor.
 * @param {*} model
 * @name {eYo.model.descriptorStr}
 */
/**
 * Descriptor.
 * @param {*} model
 * @name {eYo.model.descriptorF}
 */
/**
 * Descriptor.
 * @param {*} model
 * @name {eYo.model.descriptorForFalse}
 */
/**
 * Descriptor.
 * @param {*} model
 * @name {eYo.model.descriptorRA}
 */
/**
 * Descriptor.
 * @param {*} [model] - A JS object but a function.
 * @param {Function} [fallback] - Signature: (model) -> model. Argument order does not matter.
 * @name {eYo.model.descriptorD}
 */
;['Bool', 'Str', 'F', 'ForFalse', 'RA', 'D'].forEach(K => {
  eYo.model._p['descriptor' + K] = function(model, fallback) {
    var alt = eYo.isF(model)
    if (alt) {
      [model, fallback] = [fallback, model]
    } else {
      alt = eYo.isF(fallback)
    }
    model || (model = {})
    model[eYo.model.VALIDATE] = alt
    ? function (before) {
      let ans = eYo.model['validate' + K](before)
      if (eYo.isINVALID(ans)) {
        ans = fallback(before)
      }
      return ans
    } : eYo.model['validate' + K]
    return model
  }
})

/**
 * Convenient method 
 * @param {Object} [model]
 */
eYo.model._p.manyDescriptorF = function (model, ...$) {
  if (!eYo.isStr(model)) {
    var ans = model
  } else {
    ans = {}
    ans[model] = this.descriptorF()
  }
  $.forEach(k => {
    ans[k] = this.descriptorF()
  })
  return ans
}

/**
 * Convenient method 
 * @param {Object} [model]
 */
eYo.model._p.manyDescriptorBool = function (model, ...$) {
  if (!eYo.isStr(model)) {
    var ans = model
  } else {
    ans = {}
    ans[model] = this.descriptorBool()
  }
  $.forEach(k => {
    ans[k] = this.descriptorBool()
  })
  return ans
}

/**
 * Convenient method 
 * @param {Object} [model]
 */
eYo.model._p.manyDescriptorStr = function (model, ...$) {
  if (!eYo.isStr(model)) {
    var ans = model
  } else {
    ans = {}
    ans[model] = this.descriptorStr()
  }
  $.forEach(k => {
    ans[k] = this.descriptorStr()
  })
  return ans
}

/**
 * Convenient method 
 * @param {Object} [model]
 */
eYo.model._p.manyDescriptorForFalse = function (model, ...$) {
  if (!eYo.isStr(model)) {
    var ans = model
  } else {
    ans = {}
    ans[model] = this.descriptorForFalse()
  }
  $.forEach(k => {
    ans[k] = this.descriptorForFalse()
  })
  return ans
}

/**
 * Convenient method 
 * @param {Object} [model]
 */
eYo.model._p.manyDescriptorRA = function (model, ...$) {
  if (!eYo.isStr(model)) {
    var ans = model
  } else {
    ans = {}
    ans[model] = this.descriptorRA()
  }
  $.forEach(k => {
    ans[k] = this.descriptorRA()
  })
  return ans
}

/**
 * Convenient method 
 * @param {Object} [model]
 */
eYo.model._p.manyDescriptorD = function (model, ...$) {
  if (!eYo.isStr(model)) {
    var ans = model
  } else {
    ans = {}
    ans[model] = this.descriptorD()
  }
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
  // 6) None
  if (eYo.isStr(parent)) { // cases 4: shift arguments
    fallback && eYo.throw(`eYo.model.Format: unexpected argument ${fallback}`)
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
  //<<< mochai: eYo.model.Format
  //... let parent = new eYo.model.Format()
  //... let key = 'foo'
  //... let fallback = new eYo.model.Format()
  //... var mf = new eYo.model.Format(parent, key, fallback)
  //... chai.expect(mf.parent).equal(parent)
  //... chai.expect(mf.key).equal(key)
  //... chai.expect(mf.fallback).equal(fallback)
  //... var mf = new eYo.model.Format(parent, key)
  //... chai.expect(mf.parent).equal(parent)
  //... chai.expect(mf.key).equal(key)
  //... chai.expect(mf.fallback).undefined
  //... var mf = new eYo.model.Format(parent, fallback)
  //... chai.expect(mf.parent).equal(parent)
  //... chai.expect(mf.key).equal('')
  //... chai.expect(mf.fallback).equal(fallback)
  //... var mf = new eYo.model.Format(key, fallback)
  //... chai.expect(mf.parent).undefined
  //... chai.expect(mf.key).equal('') // no parent
  //... chai.expect(mf.fallback).equal(fallback)
  //... var mf = new eYo.model.Format(fallback)
  //... chai.expect(mf.parent).undefined
  //... chai.expect(mf.key).equal('')
  //... chai.expect(mf.fallback).equal(fallback)
  //... var mf = new eYo.model.Format()
  //... chai.expect(mf.parent).undefined
  //... chai.expect(mf.key).equal('')
  //... chai.expect(mf.fallback).undefined
  //>>>
}

eYo.model.Format_p = eYo.model.Format.prototype

/**
 * Smart getter method.
 * Navigate the formats along the path, creating controllers when needed.
 * Takes care of wildcard formats.
 * Callbacks are used during format creation.
 * @param {String} path - the required path, relative to the receiver
 * @param {Boolean} [create] - whether controllers are created.
 */
eYo.model.Format_p.get = function (path, create) {
  var c = this
  for (let k of path.split('/')) {
    if (k) {
      if (k === eYo.model.DOTDOT) {
        c = c.parent
      } else if (k !== eYo.model.DOT) {
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
                cc = new eYo.model.Format(c, k)
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
  }
  return c
  //<<< mochai: Yo.model.Format_p.get
  //... var mf = new eYo.model.Format()
  //... mf.allow('a')
  //... var mf_a = mf.get('a')
  //... chai.assert(mf_a)
  //... chai.expect(mf_a.key).equal('a')
  //... chai.expect(mf_a.parent).equal(mf)
  //... mf.allow('a/b')
  //... var mf_ab = mf.get('a/b')
  //... chai.expect(mf_a.get('b')).equal(mf_ab)
  //... chai.expect(mf_ab.key).equal('b')
  //... chai.expect(mf_ab.parent).equal(mf_a)
  //... chai.assert(mf.get('a/b'))
  //... mf.allow('a/b/c')
  //... chai.assert(mf.get('a/b/c'))
  //... chai.expect(mf.get('a/b/c')).equal(mf.get('a').get('b').get('c'))
  //... ;['/a', '//a', './a', 'a/.', '/a/.', '//a/.', './a/.', ].forEach(k => chai.expect(mf.get(k)).equal(mf.get('a')))
  //... ;['/a//b//c', '/a/./b/./c', './a/b/./c/.', ].forEach(k => chai.expect(mf.get(k)).equal(mf.get('a/b/c')))
  //... chai.expect(mf.get('a/b/c/../../..')).equal(mf)
  //... chai.expect(() => mf.get('a/../../..')).throw()
  //>>>

}

/**
 * Private tree method.
 * arguments is a list of strings, arrays or strings, objects or eYo.model.Format instances.
 */
eYo.model.Format_p.allow = function (...$) {
  //<<< mochai: eYo.model.Format_p.allow
  var c = this
  $.forEach(arg => {
    if (arg) {
      var mf = arg.eyo && arg.eyo.modelFormat || arg
      if (mf && mf instanceof eYo.model.Format) {
        c.fallback = mf
        //... var mf = new eYo.model.Format()
        //... var fallback = new eYo.model.Format()
        //... mf.allow(fallback)
        //... chai.expect(mf.fallback).equal(fallback)
        return
      }
      if (eYo.isStr(arg)) {
        c = c.get(arg, true)
        return
        //... var mf = new eYo.model.Format()
        //... mf.allow('a')
        //... chai.assert(mf.get('a'))
        //... mf.allow('a', 'b')
        //... chai.assert(mf.get('a').get('b'))
        //... chai.expect(mf.get('a').get('b')).equal(mf.get('a/b'))
        //... mf.allow('a/b/c')
        //... chai.assert(mf.get('a').get('b').get('c'))
        //... chai.expect(mf.get('a').get('b/c')).equal(mf.get('a/b/c'))
      }
      if (eYo.isRA(arg)) {
        arg.forEach(k => {
          c.get(k, true)
        })
        //... var mf = new eYo.model.Format()
        //... var RA = ['a', 'b', 'c']
        //... mf.allow(RA)
        //... RA.forEach(k => chai.assert(mf.get(k)))
      } else {
        var v
        let keys = new Set(Object.keys(arg))
        if (eYo.isRA(v = arg[eYo.model.DOT])) {
          v.forEach(k => {
            c.get(k, true)
          })
          keys.delete(eYo.model.DOT)
          //... var mf = new eYo.model.Format()
          //... var RA = ['a', 'b', 'c']
          //... mf.allow({[eYo.model.DOT]: RA})
          //... RA.forEach(k => chai.assert(mf.get(k)))
        }
        if (eYo.isDef(v = arg[eYo.model.VALIDATE])) {
          eYo.isF(v) || eYo.throw(`Forbidden ${eYo.model.VALIDATE} -> ${v}`)
          //... var mf = new eYo.model.Format()
          //... chai.expect(() => mf.allow({[eYo.model.VALIDATE]: 421})).throw()
          c.validate_ = v
          keys.delete(eYo.model.VALIDATE)
          //... var mf = new eYo.model.Format()
          //... var f = () => {
          //...   flag.push(421)
          //... }
          //... mf.allow({[eYo.model.VALIDATE]: f})
          //... mf.validate_()
          //... flag.expect(421)
          //... mf.validate(0)
          //... flag.expect(421)
          //... var mf = new eYo.model.Format()
          //... var f = (path, model) => {
          //...   flag.push(421)
          //... }
          //... mf.allow({[eYo.model.VALIDATE]: f})
          //... chai.expect(mf.validate_).equal(f)
          //... mf.validate_()
          //... flag.expect(421)
          //... mf.validate(0)
          //... flag.expect(421)
        }
        keys.forEach(k => {
          c.allow(k, arg[k]) // avoid recursivity ?
          //... var mf = new eYo.model.Format()
          //... var model = {}
          //... RA.forEach(k => model[k] = k)
          //... mf.allow(model)
          //... RA.forEach(k => chai.assert(mf.get(k)))
        })
      }
    }
  })
  //>>>
}

/**
 * Private tree method.
 * arguments is a list of strings, arrays or strings and objects. Exactly what was used to allow some model path.
 */
eYo.model.Format_p.isAllowed = function (...$) {
  var c = this
  $.forEach(key => {
    if (!c) {
      return
    }
    c = c.get(key)
  })
  return !!c
}

/**
 * @name {eYo.model.Format.all}
 * @name {eYo.model.Format.path}
 * Private computed property
 */
Object.defineProperties(eYo.model.Format_p, {
  /**
   * @property {eYo.model.Format_p.all}
   */
  all: eYo.descriptorR(function () {
    var p = this
    let ans = [p]
    while ((p = p.parent)) {
      ans.unshift(p)
    }
    return ans
  }),
  /**
   * @property {eYo.model.Format_p.path}
   */
  path: eYo.descriptorR(function () {
    return this.all.map(x => x.key).join('/') || '/'
  }),
  //<<< mochai: eYo.model.Format_p.(all|path)
  //... var mf = new eYo.model.Format()
  //... chai.expect(mf.path).equal('/')
  //... mf.allow('a')
  //... chai.expect(mf.path).equal('/')
  //... chai.expect(mf.get('a').path).equal('/a')
  //... mf.allow('a', 'b')
  //... chai.expect(mf.path).equal('/')
  //... chai.expect(mf.get('a').path).equal('/a')
  //... chai.expect(mf.get('a').get('b').path).equal('/a/b')
  //... mf.allow('a', 'b', 'c')
  //... chai.expect(mf.path).equal('/')
  //... chai.expect(mf.get('a').path).equal('/a')
  //... chai.expect(mf.get('a').get('b').path).equal('/a/b')
  //... chai.expect(mf.get('a').get('b').get('c').path).equal('/a/b/c')
  //>>>
})

/**
 * Validates the given model
 * @param {String} [path] - The path of the model object. Required when model is a string.
 * @param {Object} model - A model object to validate
 * @param {String} [key] - The key used
 * @return {Object} the possibly validated model.
 */
eYo.model.Format_p.validate = function (path, model, key) {
  //<<< mochai: eYo.model.Format_p.validate
  var c = this
  if (eYo.isStr(path)) {
    path.split('/').forEach(k => {
      if (k) { // avoid ''
        let cc = c.get(k)
        if (!cc) {
          eYo.throw(`validate: unreachable path ${c.path}/${k}`)
        }
        cc || eYo.throw(`validate: unreachable path: ${c.path}/${k}`)
        c = cc
        //... var mf = new eYo.model.Format()
        //... chai.expect(() => mf.validate('a', 1)).throw()
        //... mf.allow('a')
        //... mf.validate('a', 1)
        //... chai.expect(() => mf.validate('a/b', 1)).throw()
        //... mf.allow('a', 'b')
        //... mf.validate('a/b', 1)
        //... mf.validate('/a/b', 1)
      }
    })
  } else if (eYo.isDef(path)) {
    key && eYo.throw(`eYo.model.Format_p.validate: unexpected last argument ${key}`)
    ;[path, model, key] = [eYo.NA, path, model]
  }
  if (eYo.isDef(model)/* && !(model instanceof eYo.c9r.BaseC9r)*/) {
    // validate the model
    let v = c.validate_
    ? c.validate_(model, key)
    : c.fallback && c.fallback.validate(path, model, key)
    if (eYo.isINVALID(v)) {
      if (eYo.TESTING) {
        console.error(model, c.path)
      }
      eYo.throw(`validate: bad model at ${c.path} (set eYo.TESTING to true and see console)`)
    } else if (eYo.isDef(v)) {
      model = v
    }
    Object.keys(model).forEach(k => {
      let cc = c.get(k)
      if (cc) {
        let m = cc.validate(eYo.NA, model[k], k)
        if (m && (model[k] !== m)) {
          model[k] = m
        }
      }
    })
    return model
  }
  //>>>
}

//>>>