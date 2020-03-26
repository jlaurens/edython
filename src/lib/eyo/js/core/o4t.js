/**
 * edython
 *
 * Copyright 2019-2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview An object owns properties.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('p6y')

eYo.model.allowModelPaths({
  [eYo.model.ROOT]: ['CONST', 'aliases'],
  CONST: '[A-Z_]+'
})

/**
 * @name {eYo.o4t}
 * @namespace
 */
eYo.c9r.makeNS(eYo, 'o4t')

/**
 * @name {eYo.o4t.Base}
 * @constructor
 */
eYo.o4t.makeBase()

eYo.o4t.enhancedMany('p6y', 'properties', {
  maker (object, k, model) {
    let k_p = k + '_p'
    if (object.hasOwnProperty(k_p)) {
      console.error(`BREAK HERE!!! ALREADY object ${object.eyo.name}/${k_p}`)
    }
    let p = model.source
    ? object.eyo.aliasNew(object, k, ...model.source)
    : eYo.p6y.new(object, k, model)
    Object.defineProperties(object, {
      [k_p]: eYo.descriptorR(function () {
        return p
      }),
    })
    object[k_p] || eYo.throw('Missing property')
    let _p = object.eyo.C9r_p
    _p.hasOwnProperty(k) || Object.defineProperties(_p, {
      [k]: eYo.descriptorR(function () {
        if (!this[k_p]) {
          console.error('TOO EARLY OR INAPPROPRIATE! BREAK HERE!')
        }
        return this[k_p].getValue()
      }),
      [k + '_']: {
        get: function () {
          return this[k_p].getStored()
        },
        set (after) {
          this[k_p].setValue(after)
        },
      },
    })
    return p
  },
})

eYo.o4t.enhancedIterate('p6y')

/**
 * Initialize an instance with given property models.
 * @param {Object} instance -  namespace or an instance of a subclass of the `C9r` of the receiver
 * @param {*} properties - a properties model
 * @param {Array<String>} keys_p - A list of keys
 */
eYo.c9r._p.p6yPrepareX = function (object, properties, keys) {
  if (!properties) {
    return
  }
  this.modelExpand(properties, 'properties')
  var _p = object._p || object.eyo.C9r_p // either a namespace or an instance
  let todo = eYo.copyRA(Object.keys(properties))
  let done = []
  let again = []
  var more = false
  while(true) {
    var k
    if ((k = todo.pop())) {
      let model = properties[k]
      if (model.after) {
        if (eYo.isStr(model.after)) {
          if (!done.includes(model.after) && todo.includes(model.after)) {
            again.push(k)
            continue
          }
        } else if (model.after.some(k => (!done.includes(k) && todo.includes(k)))) {
          again.push(k)
          continue
        }
      }
      p6yModel && (p6yModel[k] = model)
      let k_p = k + '_p'
      _p.hasOwnProperty(k) || Object.defineProperties(_p, {
        [k]: eYo.descriptorR(function () {
          if (!this[k_p]) {
            console.error('TOO EARLY OR INAPPROPRIATE! BREAK HERE!')
          }
          return this[k_p].getValue()
        }),
        [k + '_']: {
          get: function () {
            return this[k_p].getStored()
          },
          set (after) {
            if (!this[k_p]) {
              console.error('BREAK HERE: NO K_P !!!')
            }
            this[k_p].setValue(after)
          },
        },
      }) 
      done.push(k)
      more = true
    } else if (more) {
      [more, todo] = [false, again]
      again.length = 0
    } else {
      again.length && eYo.throw(`Cycling/Missing properties in ${object.eyo.name}: ${again}`)
      break
    }
  }
}

/**
 * Declare the given model for the associate constructor.
 * The default implementation calls `methodsMerge`.
 * @param {Object} model - Object, like for |makeC9r|.
 */
eYo.o4t.Dlgt_p.modelMerge = function (model) {
  model.methods && this.methodsMerge(model.methods)
  model.aliases && this.aliasesMerge(model.aliases)
  model.properties && this.p6yMerge(model.properties)
}

/**
 * Initialize an instance with properties.
 * The first time an object is initialized, some actions are taken to
 * facilitate the next creation.
 * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
 */
eYo.o4t.Dlgt_p.prepareInstance = function (object) {
  this.p6yPrepare(object)
  let eyo = this.super
  if (eyo) {
    try {
      eyo.p6yPrepare = eYo.doNothing // prevent to recreate the same properties
      eyo.prepareInstance(object)
    } finally {
      delete eyo.p6yPrepare
    }
  }
}

eYo.c9r._p.enhancedO4t = function () {
  let _p = this.Dlgt_p

  /**
   * Initialize an instance with valued, cached, owned and copied properties.
   * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.initInstance = function (object, ...$) {
    if (!object) {
      console.error('BREAK HERE!')
    }
    this.p6yInit(object, ...$)
  }
  
  /**
   * Dispose of the resources declared at that level.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.disposeInstance = function (object, ...$) {
    this.p6yDispose(object, ...$)
  }
  
  /**
   * Declare the given alias.
   * It was declared in a model like
   * `{aliases: { 'source.key': 'alias' } }`
   * Implementation details : uses proxies.
   * @param {String} alias
   * @param {String} source
   * @param {String} key
   */
  _p.aliasNew = function (object, k, source, key) {
    var p
    if (key) {
      let source_ = source + '_'
      let key_p = key + '_p'
      p = new Proxy(object, {
        get(target, prop) {
          if (['previous', 'next'].includes(prop)) {
            return this[prop]
          } else {
            let s = target[source_]
            if (eYo.isDef(s)) {
              let p6y = s[key_p]
              return eYo.isDef(p6y) ? p6y[prop] : eYo.NA
            } else {
              return eYo.NA
            }
          }
        },
        set: function (target, prop, value) {
          if (['previous', 'next'].includes(prop)) {
            this[prop] = value
            return true
          } else {
            let s = target[source_]
            if (eYo.isDef(s)) {
              let p6y = s[key_p]
              if (eYo.isDef(p6y)) {
                p6y[prop] = value
                return true
              }
            }
          }
        },
        deleteProperty: function (target, prop) {
          if (['previous', 'next'].includes(prop)) {
            delete this[prop]
            return true
          } else {
            let s = target[source_]
            if (eYo.isDef(s)) {
              let p6y = s[key_p]
              if (eYo.isDef(p6y)) {
                delete p6y[prop]
                return true
              }
            }
          }
        },
      })
    } else {
      let source_p = source + '_p'
      p = new Proxy(object, {
        get(target, prop) {
          if (['previous', 'next'].includes(prop)) {
            return this[prop]
          } else {
            let p6y = target[source_p]
            return eYo.isDef(p6y) ? p6y[prop] : eYo.NA
          }
        },
        set: function (target, prop, value) {
          if (['previous', 'next'].includes(prop)) {
            this[prop] = value
            return true
          } else {
            let p6y = target[source_p]
            if (eYo.isDef(p6y)) {
              p6y[prop] = value
              return true
            }
          }
        },
        deleteProperty: function (target, prop) {
          if (['previous', 'next'].includes(prop)) {
            delete this[prop]
            return true
          } else {
            let p6y = target[source_p]
            if (eYo.isDef(p6y)) {
              delete p6y[prop]
              return true
            }
          }
        },
      })
    }
    return p
  }
  
  /**
   * Declare the given aliases.
   * Used to declare synonyms.
   * @param {Map<String, String|Array<String>>} model - Object, map source -> alias.
   */
  _p.aliasesMerge = function (aliases) {
    let d = Object.create(null)
    Object.keys(aliases).forEach(source => {
      let components = source.split('.')
      let d8r = {
        source: components,
        after: components[0],
      }
      let a = aliases[source]
      if (eYo.isRA(a)) {
        a.forEach(v => {
          d[v] = d8r
        })
      } else {
        d[a] = d8r
      }
    })
    this.p6yMerge(d)
  }
  /**
   * Add a `consolidate` method to the receiver's .
   * The receiver is not the owner.
   * @param {String} k
   * @param {Object} model
   */
  _p.consolidatorMake = function (k, model) {
    let C9r_p = this.C9r_p
    let C9r_s = this.C9r_s
    C9r_s || eYo.throw('Only subclasses may have a consolidator !')
    let consolidators = this.consolidators__ || (this.consolidators__ = Object.create(null))
    let kC = k+'Consolidate'
    let consolidate_m = this.modelExpand(model)
    let consolidate_s = C9r_s[kC]
    C9r_p[kC] = consolidators[k] = consolidate_m
    ? consolidate_s
      ? function (...args) {
        consolidate_s.call(this, ...args)
        consolidate_m.call(this, ...args)
        this.ownedForEach(x => {
          let f = x[kC] ; f && f.call(this, ...args)
        })
      } : function (...args) {
        consolidate_m.call(this, ...args)
        this.ownedForEach(x => {
          let f = x[kC] ; f && f.call(this, ...args)
        })
      }
    : consolidate_s || function () {
      this[k + '_'] = eYo.NA
    }
  }
  
  //// Properties and methods
    
  /**
   * Iterator over the properties.
   * @param {Object} object
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param {Function} f
   * @param {Boolean} owned
   */
  _p.propertyForEach = function (object, $this, f, owned) {
    if (eYo.isF($this)) {
      [f, owned, $this] = [$this, f, owned]
    }
    if (owned) {
      this.keys_p__.forEach(k_p => {
        let p = object[k_p]
        if (p) {
          let v = p.stored__
          if (v && v.eyo && p === v.eyo_p6y) {
            f.call($this, v)
          }
        }
      })
    } else {
      this.keys_p__.forEach(k_p => {
        let p = object[k_p]
        if (p) {
          let v = p.getValue()
          if (v) {
            f.call($this, v)
          }
        }
      })
    }
  }
  
  /**
   * Iterator over the properties.
   * @param {Object} object
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param {Function} f
   * @param {Boolean} owned
   */
  _p.propertySome = function (object, $this, f, owned) {
    if (owned) {
      return this.keys_p__.some(k_p => {
        let p = object[k_p]
        if (p) {
          let v = p.stored__
          if (v && v.eyo && p === v.eyo_p6y) {
            f.call($this, v)
          }
        }
      })
    } else {
      return this.keys_p__.some(k_p => {
        let p = object[k_p]
        if (p) {
          let v = p.getValue()
          if (v) {
            f.call($this, v)
          }
        }
      })
    }
  }
  /**
   * Executes the helper for each owned property.
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param{Function} f -  an helper with one argument which is the owned value.
   */
  this.Base_p.ownedForEach = function ($this, f) {
    this.eyo.propertyForEach(this, $this, f, true)
  }

  /**
   * Executes the helper for each owned property stopping at the first truthy answer.
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param{Function} f -  an helper with one argument which is the owned value.
   */
  this.Base_p.ownedSome = function ($this, f) {
    return this.eyo.propertySome(this, $this, f, true)
  }
}

eYo.o4t.enhancedO4t()

/**
 * Declares a model to be used by others. 
 * It creates in the receiver's namespace a `merge` function or a `fooMerge` function,
 * which purpose is to enlarge the prototype of the given constructor.
 * @param{String} [key] - the key for that model
 * @param{Object} model - the model
 */
eYo.o4t._p.modelDeclare = function (key, model) {
  if (eYo.isStr(key)) {
    key = key + 'Merge'
  } else if (eYo.isStr(model)) {
    [key, model] = [model + 'Merge', key]
  } else {
    [model, key] = [key, 'merge']
  }
  let _p = this._p
  _p.hasOwnProperty(key) && eYo.throw(`Already done`)
  _p[key] = function (C9r) {
    C9r.eyo.modelMerge(model)
  }
}

/**
 * Create a new property based on the model
 * No need to subclass. Override `Main` and `modelHandle`.
 * @param {Object} model
 */
eYo.o4t._p.singleton = function (model) {
  this.modelExpand('properties.foo', model)
  return new (this.makeC9r('', model))()
}
