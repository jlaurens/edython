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

/**
 * @name {eYo.o4t}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'o4t')
//<<< mochai: eYo.o4t
//... chai.assert(eYo.o4t)

/**
 * @name {eYo.o4t.BaseC9r}
 * @constructor
 */
eYo.o4t.makeBaseC9r(true)

//... chai.expect(eYo.O4t).equal(eYo.o4t.BaseC9r)

eYo.o4t.BaseC9r.eyo.p6yEnhanced()

eYo.o4t.BaseC9r.eyo.finalizeC9r(['aliases'], {
  properties: {
    [eYo.model.ANY]: eYo.P6y.eyo.modelFormat,
    [eYo.model.VALIDATE]: eYo.model.validateD,
  },
})

/**
 * Declare the given model for the associate constructor.
 * The default implementation calls `methodsMerge`.
 * @param {Object} model - Object, like for |makeC9r|.
 */
eYo.o4t.Dlgt_p.modelMerge = function (model) {
  model.aliases && this.p6yAliasesMerge(model.aliases)
  model.properties && this.p6yMerge(model.properties)
  model.methods && this.methodsMerge(model.methods)
  model.CONSTs && this.CONSTsMerge(model.methods)
}

eYo.c9r._p.enhancedO4t = function () {
  let _p = this.Dlgt_p

  eYo.isF(_p.p6yInit) || _p.p6yEnhanced()
  
  _p.hasOwnProperty('p6yInit') || eYo.throw('Missing p6yInit')
  _p.hasOwnProperty('p6yDispose') || eYo.throw('Missing p6yDispose')

  /**
   * Prepare an instance with properties.
   * @param {Object} instance -  object is an instance of a subclass of the `C9r` of the receiver
   */
  _p.prepareInstance = function (instance) {
    this.p6yPrepare(instance)
    let $super = this.super
    if ($super) {
      try {
        $super.p6yPrepare = eYo.doNothing // prevent to recreate the same properties
        $super.prepareInstance(instance)
      } finally {
        delete $super.p6yPrepare
      }
    }
  }

  /**
   * Initialize an instance with valued, cached, owned and copied properties.
   * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.initInstance = function (object, ...$) {
    this.p6yInit(object, ...$)
    let $super = this.super
    if ($super) {
      try {
        $super.p6yInit = eYo.doNothing // prevent to recreate the same properties
        $super.initInstance(object, ...$)
      } finally {
        delete $super.p6yInit
      }
    }
  }
  
  /**
   * Dispose of the resources declared at that level.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.disposeInstance = function (object, ...$) {
    this.p6yDispose(object, ...$)
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
  _p.p6yForEach = function (object, $this, f, owned) {
    if (eYo.isF($this)) {
      [f, owned, $this] = [$this, f, owned]
    }
    if (owned) {
      for (let p of object.p6yMap.values()) {
        if (p.owner === object) {
          let v = p.stored__
          if (v) {
            f.call($this, v)
          }
        }
      }
    } else {
      for (let p of object.p6yMap.values()) {
        let v = p.stored__
        if (v) {
          f.call($this, v)
        }
      }
    }
  }
  
  /**
   * Iterator over the properties.
   * @param {Object} object
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param {Function} f
   * @param {Boolean} owned
   */
  _p.p6ySome = function (object, $this, f, owned) {
    if (owned) {
      for (let p of object.p6yMap.values()) {
        if (p.owner === object) {
          let v = p.stored__
          if (v && /* v.eyo && p === v.eyo_p6y &&*/ f.call($this, v)) {
            return true
          }
        }
      }
    } else {
      for (let p of object.p6yMap.values()) {
        let v = p.getValue()
        if (v && f.call($this, v)) {
          return true
        }
      }
    }
  }
  /**
   * Executes the helper for each owned property.
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param{Function} f -  an helper with one argument which is the owned value.
   */
  this.BaseC9r_p.ownedForEach = function ($this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    return this.eyo.p6yForEach(this, $this, f, true)
  }

  /**
   * Executes the helper for each owned property stopping at the first truthy answer.
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param{Function} f -  an helper with one argument which is the owned value.
   */
  this.BaseC9r_p.ownedSome = function ($this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    return this.eyo.p6ySome(this, $this, f, true)
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
 * Replace a property shortcut
 * 
 * @param {*} object 
 * @param {String} k 
 * @param {eYo.p6y.BaseC9r} p 
 */
eYo.c9r.Dlgt_p.p6yReplace = function (object, k, source) {
  let map = object.p6yMap
  let old_p = map.get(k)
  if (!eYo.isDef(old_p)) {
    console.error('BREAK HERE!!!')
  }
  eYo.isDef(old_p) || eYo.throw(`${this.name}/p6yReplace: no replacement for ${k}`)
  var p = eYo.p6y.aliasNew(k, object, source)
  this.p6yMakeShortcut(object, k, p, true)
  eYo.linkPreviousNext(old_p.previous, p)
  eYo.linkPreviousNext(p, old_p.next)
  if(p.previous) {
    p = [...map.values()][0]
  }
  map.clear()
  do {
    map.set(p.key, p)
  } while ((p = p.next))
  //<<< mochai:P6Y ||| p6yReplace
  //... let ns = eYo.o4t.makeNS()
  //... ns.makeBaseC9r({
  //...   properties: {
  //...     foo: 1,
  //...     chi: {
  //...       after: 'foo',
  //...       value: 2,
  //...     },
  //...     mi: {
  //...       after: 'chi',
  //...       value: 3,
  //...     },
  //...   },
  //... })
  //... var o = ns.new('o', onr)
  //... o.eyo.p6yForEach(o, v => flag.push(v))
  //... flag.expect(123)
  //... let foo_p = eYo.p6y.new({
  //...   value: 4,
  //... }, 'foo', onr)
  //... let chi_p = eYo.p6y.new({
  //...   value: 5,
  //... }, 'chi', onr)
  //... let mi_p = eYo.p6y.new({
  //...   value: 6,
  //... }, 'mi', onr)
  //... chai.expect(o.foo).equal(1)
  //... o.eyo.p6yReplace(o, 'foo', foo_p)
  //... o.eyo.p6yForEach(o, v => flag.push(v))
  //... flag.expect(423)
  //... chai.expect(o.foo_p.__target).equal(foo_p)
  //... chai.expect(o.foo).equal(4)
  //... o.foo_ -= 3
  //... chai.expect(foo_p.value).equal(1)
  //... o.eyo.p6yForEach(o, v => flag.push(v))
  //... flag.expect(123)
  //... foo_p.value_ += 3
  //... chai.expect(o.foo).equal(4)
  //... o = ns.new('o', onr)
  //... chai.expect(o.chi).equal(2)
  //... o.eyo.p6yReplace(o, 'chi', chi_p)
  //... o.eyo.p6yForEach(o, v => flag.push(v))
  //... flag.expect(153)
  //... chai.expect(o.chi_p.__target).equal(chi_p)
  //... chai.expect(o.chi).equal(5)
  //... o.chi_ -= 3
  //... chai.expect(chi_p.value).equal(2)
  //... o.eyo.p6yForEach(o, v => flag.push(v))
  //... flag.expect(123)
  //... chi_p.value_ += 3
  //... chai.expect(o.chi).equal(5)
  //... o = ns.new('o', onr)
  //... chai.expect(o.mi).equal(3)
  //... o.eyo.p6yReplace(o, 'mi', mi_p)
  //... o.eyo.p6yForEach(o, v => flag.push(v))
  //... flag.expect(126)
  //... chai.expect(o.mi_p.__target).equal(mi_p)
  //... chai.expect(o.mi).equal(6)
  //... o.mi_ -= 3
  //... chai.expect(mi_p.value).equal(3)
  //... o.eyo.p6yForEach(o, v => flag.push(v))
  //... flag.expect(123)
  //... mi_p.value_ += 3
  //... chai.expect(o.mi).equal(6)
  //>>>
}
//>>>