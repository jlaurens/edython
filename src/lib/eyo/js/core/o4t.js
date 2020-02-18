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

/**
 * @name {eYo.o4t}
 * @namespace
 */
eYo.c9r.makeNS(eYo, 'o4t')

/**
 * @name {eYo.o4t.Dflt}
 * @constructor
 */
eYo.o4t.makeDflt({
/**
 * Prepare the delegate prototype.
 */
  dlgt (ns, key, C9r, model) {
    this.properties__ = Object.create(null)
    if (C9r && (C9r = C9r.SuperC9r)) {
      this.keys_p__ = new Set(C9r.eyo.keys_p__)
    } else {
      this.keys_p__ = new Set()
    }
  }
})

/**
 * Initialize an instance with given property models.
 * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
 * @param {*} properties - a properties model
 */
eYo.o4t._p.initProperties = function (object, properties) {
  Object.keys(properties).forEach(k => {
    let model = properties[k]
    if (!eYo.isO(model)) {
      model = properties[k] = {
        value: model,
      }
    }
    let k_p = k + '_p'
    if (!object.hasOwnProperty(k_p)) {
      let p = eYo.p6y.new(object, k, model)
      Object.defineProperties(object, {
        [k_p]: eYo.c9r.descriptorR(function () {
          return p
        }),
      })
    }
    let _p = Object.getPrototypeOf(object)
    if (object.eyo && !_p.hasOwnProperty(k)) {
      object.eyo.keys_p__ && object.eyo.keys_p__.add(k_p)
      Object.defineProperties(_p, {
        [k]: eYo.c9r.descriptorR(function () {
          if (!this[k_p]) {
            console.error('BREAK HERE!')
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
    }
  })
}

;(() => {
  let _p = eYo.o4t.Dlgt_p

  /**
   * Iterators
   */
  _p.propertyForEach = function (f, owned = true) {
    this.eyo.propertyForEach(this, f, owned)
  }
  _p.propertySome = function (f, owned = true) {
    this.eyo.propertySome(this, f, true)
  }

  /**
   * Consolidate the given model.
   * @param {Object} model - The model contains informations to extend the receiver's associate constructor.
   */
  _p.modelConsolidate = function (model) {
    eYo.c9r.model.consolidate(model)
  }
  
  /**
   * Extend the receiver and its associate constructor with the given model.
   * @param {Object} model - The model contains informations to extend the receiver's associate constructor.
   */
  _p.handleModel = function (model) {
    if (model) {
      this.modelConsolidate(model)
      this.initWithModel(model)
    }
  }
  
  /**
   * Extends the properties of the associate constructor.
   * @param {Object} properties -  A properties model
   */
  _p.extendsProperties = function (properties) {
    let _p = this.C9r_p
    Object.keys(properties).forEach(k => {
      this.properties__[k] = properties[k]
      _p[k] && delete _p[k]
    })
  }

  /**
   * Initialize an instance with valued, cached, owned and copied properties.
   * Default implementation forwards to super.
   * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.prepareInstance = function (object) {
    var ns = this.ns
    if (!ns || !ns.initProperties) {
      ns = eYo.o4t
    }
    ns.initProperties(object, this.properties__)
    let eyo = this.super
    eyo && eyo.prepareInstance(object)
  }

  /**
   * Initialize an instance with valued, cached, owned and copied properties.
   * Default implementation forwards to super.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.initInstance = function (object) {
    if (!object) {
      console.error('BREAK HERE!')
    }
    var f = k => {
      var init = this.init_ && this.init_[k] || object[k+'Init']
      if (init) {
        object[k + '_'] = init.call(object)
      }
    }
    this.propertyForEach(f)
  }
  
  /**
   * Dispose of the resources declared at that level.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.disposeInstance = function (object, ...params) {
    Object.keys(this.properties__).forEach(k => {
      let x = object[k + '_p']
      x.dispose(...params)
    })
  }
  
  /**
   * Declare the given alias.
   * @param {String} original
   * @param {String} alias
   */
  _p.deepAliasDeclare = function (key, original, alias) {
    let key_p = key + '_p'
    let original_p = original + '_p'
    let get = function () {
      return this[key_p].value__[original_p].value
    }
    Object.defineProperties(this.C9r_p, {
      [alias + '_p']: eYo.c9r.descriptorR(function () {
        return this[key_p].value__[original_p]
      }),
      [alias]: eYo.c9r.descriptorR(get),
      [alias + '_']: {
        get: get,
        set (after) {
          this[key_p].value__[original_p].value_ = after
        },
      },
    })
  }
  
  /**
   * Declare the given alias.
   * @param {String} original
   * @param {String} alias
   */
  _p.aliasDeclare = function (original, alias) {
    let components = original.split('.')
    if (components.length === 2) {
      this.deepAliasDeclare(components[0], components[1], alias)
      return
    }
    let original_p = original + '_p'
    let get = function () {
      return this[original_p].value
    }
    Object.defineProperties(this.C9r_p, {
      [alias + '_p']: eYo.c9r.descriptorR(function () {
        return this[original_p]
      }),
      [alias]: eYo.c9r.descriptorR(get),
      [alias + '_']: {
        get: get,
        set (after) {
          this[original_p].value_ = after
        },
      },  
    })
  }
  
  /**
   * Declare the given aliases.
   * Used to declare synonyms.
   * @param {Map<String, String>} model - Object, map alias -> source.
   */
  _p.aliasesDeclare = function (model) {
    Object.keys(model).forEach(k => {
      let components = k.split('.')
      let alias = model[k]
      let declare = components.length === 2
      ? alias => this.deepAliasDeclare(components[0], components[1], alias)
      : alias => this.aliasDeclare(k, alias)
      if (eYo.isRA(alias)) {
        alias.forEach(alias => declare(alias))
      } else {
        declare(alias)
      }
    })
  }
  
  /**
   * Declare the given model.
   * @param {Object} model - Object, like for |makeC9r|.
   */
  _p.initWithModel = function (model) {
    model.properties && (this.properties__ = model.properties)
    model.aliases && this.aliasesDeclare(model.aliases)
    model.methods && this.methodsDeclare(model.methods)
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
    let consolidate_m = model.consolidate
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
   * Add methods to the associate prototype.
   * @param {Map<String, Function>} models,  the key => Function mapping.
   */
  _p.methodsDeclare = function (model) {
    let p = this.C9r_p
    Object.keys(model).forEach(k => {
      eYo.assert(!eYo.do.hasOwnProperty(p, k))
      let f = model[k]
      eYo.assert(eYo.isF(f), `Got ${f}instead of a function`)
      p[k] = f // maybe some post processing here
    })
  }
  
  /**
   * Iterator over the properties.
   * @param {Object} object
   * @param {Function} f
   * @param {Boolean} owned
   */
  _p.propertyForEach = function (object, f, owned) {
    if (owned) {
      this.keys_p__.forEach(k_p => {
        let p = object[k_p]
        if (p) {
          let v = p.stored__
          if (v && v.eyo && p === v.eyo_p6y) {
            f(v)
          }
        }
      })
    } else {
      this.keys_p__.forEach(k_p => {
        let p = object[k_p]
        if (p) {
          let v = p.getValue()
          if (v) {
            f(v)
          }
        }
      })
    }
  }
  
  /**
   * Iterator over the properties.
   * @param {Object} object
   * @param {Function} f
   * @param {Boolean} owned
   */
  _p.propertySome = function (object, f, owned) {
    if (owned) {
      this.keys_p__.some(k_p => {
        let p = object[k_p]
        if (p) {
          let v = p.stored__
          if (v && v.eyo && p === v.eyo_p6y) {
            f(v)
          }
        }
      })
    } else {
      this.keys_p__.some(k_p => {
        let p = object[k_p]
        if (p) {
          let v = p.getValue()
          if (v) {
            f(v)
          }
        }
      })
    }
  }
  
})()

/**
 * Executes the helper for each owned property.
 * @param{Function} f -  an helper
 */
eYo.o4t.Dflt_p.ownedForEach = function (f) {
  this.eyo.propertyForEach(this, f, true)
}

/**
 * Executes the helper for each owned property stopping at the first truthy answer.
 * @param{Function} f -  an helper
 */
eYo.o4t.Dflt_p.ownedSome = function (f) {
  return this.eyo.propertySome(this, f, true)
}
