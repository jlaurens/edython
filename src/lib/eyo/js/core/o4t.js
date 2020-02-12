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
  dlgt () {
    this.properties__ = Object.create(null)
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
    let p = eYo.p6y.new(object, k, model)
    Object.defineProperties(object, {
      [k_p]: eYo.c9r.descriptorR(function () {
        return p
      }),
    })
    let _p = Object.getPrototypeOf(object)
    if (!_p.hasOwnProperty(k)) {
      Object.defineProperties(_p, {
        [k]: eYo.c9r.descriptorR(function () {
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

  ;['owned', 'copied', 'valued', 'cached', 'computed'].forEach(k => {
    var k_ = k + '_'
    var k__ = k + '__'
    Object.defineProperty(_p, k_, {
      get () {
        if (this[k__]) {
          return this[k__]
        }
        var s = this.super
        return (this[k__] = s ? new Set(s[k__]) : new Set())
      }
    })
    /**
     * Owned enumerating loop.
     * @param {Function} helper -  signature (name) => {...}
     */
    var name = k + 'ForEach'
    eYo.C9r.eyo_p[name] = function (f) {
      this[k__] && this[k__].forEach(f)
    }
    var name = k + 'Some'
    eYo.C9r.eyo_p[name] = function (f) {
      return this[k__] && (this[k__].some(f))
    }
  })
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
      this.modelDeclare(model)
    }
  }
  
  /**
   * Initialize an instance with valued, cached, owned and copied properties.
   * Default implementation forwards to super.
   * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.preInitInstance = function (object) {
    (this.ns||eYo.o4t).initProperties(object, this.properties__)
    let s = this.super
    s && s.preInitInstance(object)
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
    this.valuedForEach(f)
    this.ownedForEach(f)
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
  _p.modelDeclare = function (model) {
    model.properties && (this.properties__ = model.properties)
    model.aliases && this.aliasesDeclare(model.aliases)
    model.called && this.calledDeclare(model.called)
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
        this.valuedForEach(x => {
          let f = x[kC] ; f && f.call(this, ...args)
        })
      } : function (...args) {
        consolidate_m.call(this, ...args)
        this.ownedForEach(x => {
          let f = x[kC] ; f && f.call(this, ...args)
        })
        this.valuedForEach(x => {
          let f = x[kC] ; f && f.call(this, ...args)
        })
      }
    : consolidate_s || function () {
      this[k + '_'] = eYo.NA
    }
  }
  
  //// Properties
  
  /**
   * Add methods to the associate prototype.
   * @param {Map<String, Function>} models,  the key => Function mapping.
   */
  _p.calledDeclare = function (model) {
    let p = this.C9r_p
    Object.keys(model).forEach(k => {
      eYo.assert(!eYo.do.hasOwnProperty(p, k))
      let f = model[k]
      eYo.assert(eYo.isF(f), `Got ${f}instead of a function`)
      p[k] = f // maybe some post processing here
    })
  }
  
})()
