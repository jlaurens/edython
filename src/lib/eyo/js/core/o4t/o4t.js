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
//<<< mochai: Basic
//... chai.assert(eYo.o4t)
//... chai.expect(eYo.O4t).equal(eYo.o4t.BaseC9r)
//>>>
/**
 * @name {eYo.o4t.BaseC9r}
 * @constructor
 */
eYo.o4t.makeBaseC9r(true)

eYo.mixinR(false, eYo._p, {
  isaO4t (what) {
    return !!what && what instanceof eYo.o4t.BaseC9r
    //<<< mochai: eYo.isaO4t
    //... chai.expect(eYo.isaO4t()).false
    //... chai.expect(eYo.isaO4t(eYo.NA)).false
    //... chai.expect(eYo.isaO4t(421)).false
    //... chai.expect(eYo.isaO4t(eYo.o4t.new('foo', onr))).true
    //>>>
  }
})

/**
 * Enhance the constructor with property facilities.
 * @param {*} manyModel - The model
 */
eYo.dlgt.BaseC9r_p.p6yEnhanced = function (manyModel = {}) {
  eYo.isF(manyModel.make) || (manyModel.make = eYo.dlgt.BaseC9r_p.p6yMakeInstance)
  eYo.isF(manyModel.makeShortcut) || (manyModel.makeShortcut = eYo.dlgt.BaseC9r_p.p6yMakeShortcuts)
  //<<< mochai: p6yEnhanced
  this.enhanceMany('p6y', 'properties', manyModel)
  //<<< mochai: p6yMerge
  //... let ns = eYo.c9r.makeNS()
  //... let C9r = ns.makeBaseC9r(true)
  //... C9r.eyo.p6yEnhanced()
  //... C9r.eyo.finalizeC9r()
  //... C9r.eyo.p6yMerge({
  //...   foo: 421,
  //... })
  //... var o = ns.new('bar')
  //... chai.expect(o.foo_p).not.undefined
  //>>>
  /**
   * Declare the given aliases.
   * Used to declare synonyms.
   * @param {Map<String, String|Array<String>>} model - Object, map source -> alias.
   */
  this._p.p6yAliasesMerge = function (aliases) {
    //<<< mochai: p6yAliasesMerge:
    //... let ns = eYo.c9r.makeNS()
    //... let C9r = ns.makeBaseC9r(true)
    //... C9r.eyo.p6yEnhanced()
    //... C9r.eyo.finalizeC9r()
    //... chai.assert(C9r.eyo.p6yAliasesMerge)
    //... chai.assert(C9r.eyo.p6yMerge)
    let d = Object.create(null)
    for(let [source, alias] of Object.entries(aliases)) {
      let components = source.split('.')
      let d8r = {
        source: components,
        after: components[0],
      }
      try {
        alias.forEach(v => {
          d[v] = d8r
        })
      } catch {
        d[alias] = d8r
      }
    }
    this.p6yMerge(d)
    //>>>
  }
  this.modelFormat.allow({
    //<<< mochai: modelFormat
    properties: {
      [eYo.model.ANY]: eYo.P6y.eyo.modelFormat,
      [eYo.model.VALIDATE]: eYo.model.validateD,
    },
    aliases: {
      [eYo.model.VALIDATE]: eYo.model.validateD,
    },
    //>>>
  })
  //>>>
}

eYo.o4t.BaseC9r.eyo.p6yEnhanced()

eYo.o4t.BaseC9r.eyo.finalizeC9r()

/**
 * Declare the given model for the associate constructor.
 * The default implementation calls `methodsMerge`.
 * @param {Object} model - Object, like for |makeC9r|.
 */
eYo.o4t.Dlgt_p.modelMerge = function (model) {
  //<<< mochai: modelMerge
  model.aliases && this.p6yAliasesMerge(model.aliases)
  model.properties && this.p6yMerge(model.properties)
  model.methods && this.methodsMerge(model.methods)
  model.CONSTs && this.CONSTsMerge(model.methods)
  //... chai.assert(eYo.o4t.Dlgt_p.modelMerge)
  //>>>
}

eYo.dlgt.BaseC9r_p.enhancedO4t = function () {
  //<<< mochai: enhancedO4t
  let _p = this

  eYo.isF(_p.p6yInit) || _p.p6yEnhanced()
  
  _p.hasOwnProperty('p6yInit') || eYo.throw('Missing p6yInit')
  _p.hasOwnProperty('p6yDispose') || eYo.throw('Missing p6yDispose')
  //... let ns = eYo.c9r.makeNS()
  //... let C9r = ns.makeBaseC9r()
  //... ns.enhancedO4t()
  //... var o = ns.new('foo')
  eYo.mixinR(false, this, {

  })
  /**
   * Prepare an instance with properties.
   * @param {Object} instance -  object is an instance of a subclass of the `C9r` of the receiver
   */
  this.prepareInstance = function (instance) {
    //<<< mochai: prepareInstance
    //... chai.assert(C9r.eyo.prepareInstance)
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
    //>>>
  }

  /**
   * Initialize an instance with valued, cached, owned and copied properties.
   * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
   */
  this.initInstance = function (object, ...$) {
    //<<< mochai: initInstance
    //... chai.assert(C9r.eyo.initInstance)
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
    //>>>
  }
  
  /**
   * Dispose of the resources declared at that level.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  this.disposeInstance = function (object, ...$) {
    //<<< mochai: disposeInstance
    //... chai.expect(C9r.eyo.disposeInstance).eyo_F
    this.p6yDispose(object, ...$)
    //>>>
  }
  
  /**
   * Add a `consolidate` method to the receiver's .
   * The receiver is not the owner.
   * @param {String} k
   * @param {Object} model
   */
  this.consolidatorMake = function (k, model) {
    //<<< mochai: consolidatorMake
    //... chai.expect(C9r.eyo.consolidatorMake).eyo_F
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
    //>>>
  }
  
  //// Properties and methods
    
  /**
   * Iterator over the properties.
   * @param {Object} object
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param {Function} f
   * @param {Boolean} owned
   */
  this.p6yForEach = function (object, $this, f, owned) {
    //<<< mochai: p6yForEach
    //... chai.expect(C9r.eyo.p6yForEach).eyo_F
    if (eYo.isF($this)) {
      [f, owned, $this] = [$this, f, owned]
    }
    if (owned) {
      for (let p6y of object.p6yMap.values()) {
        if (p6y.owner === object) {
          let v = p6y.stored__
          if (v) {
            f.call($this, v)
          }
        }
      }
    } else {
      for (let p6y of object.p6yMap.values()) {
        let v = p6y.stored__
        if (v) {
          f.call($this, v)
        }
      }
    }
    //>>>
  }
  
  /**
   * Iterator over the properties.
   * @param {Object} object
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param {Function} f
   * @param {Boolean} owned
   */
  this.p6ySome = function (object, $this, f, owned) {
    //<<< mochai: p6ySome
    //... chai.expect(C9r.eyo.p6ySome).eyo_F
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
    //>>>
  }
  /**
   * Executes the helper for each owned property.
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param{Function} f -  an helper with one argument which is the owned value.
   */
  this.C9r_p.ownedForEach = function ($this, f) {
    //<<< mochai: ownedForEach
    //... chai.expect(o.ownedForEach).eyo_F
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    return this.eyo.p6yForEach(this, $this, f, true)
    //>>>
  }

  /**
   * Executes the helper for each owned property stopping at the first truthy answer.
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param{Function} f -  an helper with one argument which is the owned value.
   */
  this.C9r_p.ownedSome = function ($this, f) {
    //<<< mochai: ownedSome
    //... chai.expect(o.ownedSome).eyo_F
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    return this.eyo.p6ySome(this, $this, f, true)
    //>>>
  }
  //>>>
}

eYo.c9r._p.enhancedO4t = function () {
  //<<< mochai: enhancedO4t
  let _p = this.Dlgt_p

  eYo.isF(_p.p6yInit) || _p.p6yEnhanced()
  
  _p.hasOwnProperty('p6yInit') || eYo.throw('Missing p6yInit')
  _p.hasOwnProperty('p6yDispose') || eYo.throw('Missing p6yDispose')
  //... let ns = eYo.c9r.makeNS()
  //... let C9r = ns.makeBaseC9r()
  //... ns.enhancedO4t()
  //... var o = ns.new('foo')
  /**
   * Prepare an instance with properties.
   * @param {Object} instance -  object is an instance of a subclass of the `C9r` of the receiver
   */
  _p.prepareInstance = function (instance) {
    //<<< mochai: prepareInstance
    //... chai.assert(C9r.eyo.prepareInstance)
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
    //>>>
  }

  /**
   * Initialize an instance with valued, cached, owned and copied properties.
   * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.initInstance = function (object, ...$) {
    //<<< mochai: initInstance
    //... chai.assert(C9r.eyo.initInstance)
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
    //>>>
  }
  
  /**
   * Dispose of the resources declared at that level.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.disposeInstance = function (object, ...$) {
    //<<< mochai: disposeInstance
    //... chai.expect(C9r.eyo.disposeInstance).eyo_F
    this.p6yDispose(object, ...$)
    //>>>
  }
  
  /**
   * Add a `consolidate` method to the receiver's .
   * The receiver is not the owner.
   * @param {String} k
   * @param {Object} model
   */
  _p.consolidatorMake = function (k, model) {
    //<<< mochai: consolidatorMake
    //... chai.expect(C9r.eyo.consolidatorMake).eyo_F
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
    //>>>
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
    //<<< mochai: p6yForEach
    //... chai.expect(C9r.eyo.p6yForEach).eyo_F
    if (eYo.isF($this)) {
      [f, owned, $this] = [$this, f, owned]
    }
    if (owned) {
      for (let p6y of object.p6yMap.values()) {
        if (p6y.owner === object) {
          let v = p6y.stored__
          if (v) {
            f.call($this, v)
          }
        }
      }
    } else {
      for (let p6y of object.p6yMap.values()) {
        let v = p6y.stored__
        if (v) {
          f.call($this, v)
        }
      }
    }
    //>>>
  }
  
  /**
   * Iterator over the properties.
   * @param {Object} object
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param {Function} f
   * @param {Boolean} owned
   */
  _p.p6ySome = function (object, $this, f, owned) {
    //<<< mochai: p6ySome
    //... chai.expect(C9r.eyo.p6ySome).eyo_F
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
    //>>>
  }
  /**
   * Executes the helper for each owned property.
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param{Function} f -  an helper with one argument which is the owned value.
   */
  this.BaseC9r_p.ownedForEach = function ($this, f) {
    //<<< mochai: ownedForEach
    //... chai.expect(o.ownedForEach).eyo_F
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    return this.eyo.p6yForEach(this, $this, f, true)
    //>>>
  }

  /**
   * Executes the helper for each owned property stopping at the first truthy answer.
   * @param {Object} [$this] - Optional this, cannot be a function
   * @param{Function} f -  an helper with one argument which is the owned value.
   */
  this.BaseC9r_p.ownedSome = function ($this, f) {
    //<<< mochai: ownedSome
    //... chai.expect(o.ownedSome).eyo_F
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    return this.eyo.p6ySome(this, $this, f, true)
    //>>>
  }
  //>>>
}

eYo.o4t.enhancedO4t()

/**
 * Make a property shortcut.
 * Change both the given object **and** its prototype!
 * 
 * @param {*} object - The object receiveing the new shortcuts,
 * @param {String} key 
 * @param {eYo.p6y.BaseC9r} p6y 
 * @param {Boolean} [override] - defaults to false. True when overriding an already existing property is allowed.
 */
eYo.dlgt.BaseC9r_p.p6yMakeShortcuts = function (object, key, p6y, override) {
  //<<< mochai: eYo.dlgt.BaseC9r_p.p6yMakeShortcuts
  //... var object = onr = makeOnr()
  eYo.isaC9r(object) || eYo.throw(`${this.name}.p6yMakeShortcuts: Bad owner ${object}`)
  if (!eYo.isStr(key)) {
    eYo.isDef(override) && eYo.throw(`${this.name}.p6yMakeShortcuts: Unexpected last argument ${override}`)
    ;[key, p6y, override] = [key.key, key, p6y]
  }
  //<<< mochai: basics
  //... chai.expect(() => object.eyo.p6yMakeShortcuts(421)).throws()
  !eYo.isaP6y(p6y) && !p6y.__target && eYo.throw(`${this.name}.p6yMakeShortcuts: Missing property [proxy] ${p6y}`)
  //... chai.expect(() => object.eyo.p6yMakeShortcuts(object, '', 421)).throws()
  //... let p6y = eYo.p6y.new('foo', object)
  //... p6y.value_ = 3
  //... chai.expect(p6y.value).equal(3)
  //>>>
  let k_p = key + '_p'
  let k_t = key + '_t'
  let k_ = key + '_'
  if (!override && object.hasOwnProperty(k_p)) {
    console.error(`BREAK HERE!!! ALREADY object ${object.eyo.name}/${k_p}`)
  }
  Object.defineProperties(object, {
    [k_p]: eYo.descriptorR(function () {
      return p6y
    }, true),
    //<<< mochai: foo_p
    //... var foo_p = eYo.p6y.new('foo', onr)
    //... var o = eYo.c9r.new('foo')
    //... chai.expect(o.hasOwnProperty('bar_p')).false
    //... o.eyo.p6yMakeShortcuts(o, 'bar', foo_p)
    //... chai.expect(o.hasOwnProperty('bar_p')).true
    //... chai.expect(o.bar_p).equal(foo_p)
    //>>>
  })
  Object.defineProperties(object, {
    [k_t]: {
      get () {
        return p6y.__target
      },
      set (after) {
        if (after !== p6y.__target) {
          this.eyo.p6yReplace(object, key, after)
        }
      },
      configurable: true,
    }
    //<<< mochai: foo_t
    //... var r = eYo.c9r.new({}, 'foo', onr)
    //... var origin_p = eYo.p6y.new('origin', r)
    //... r.eyo.p6yMakeShortcuts(r, 'origin', origin_p)
    //... chai.expect(r.origin_t).undefined
    //... chai.expect(origin_p.value).not.equal(421)
    //... var foo_p = eYo.p6y.new('foo', onr)
    //... r.origin_t = foo_p
    //... chai.expect(r.origin_p).not.equal(origin_p)
    //... chai.expect(r.origin_p.__target).equal(foo_p)
    //... chai.expect(r.origin_t).equal(foo_p)
    //... foo_p.value_ = 421
    //... chai.expect(origin_p.value).equal(421)
    //>>>
  })
  object[k_p] === p6y || eYo.throw('Missing property')
  let _p = object.eyo.C9r_p
  _p.hasOwnProperty(key) || Object.defineProperties(_p, {
    //<<< mochai: foo, foo_, foo__
    //... var foo_p = eYo.p6y.new('foo', onr)
    //... foo_p.flag = function (...$) {
    //...   this.owner.flag(...$)
    //... }
    //... foo_p.getValueRO = function (...$) {
    //...   this.flag(2, ...$)
    //... }
    //... foo_p.getValue = function (...$) {
    //...   this.flag(3, ...$)
    //... }
    //... foo_p.setValue = function (...$) {
    //...   this.flag(4, ...$)
    //... }
    //... foo_p.getStored = function (...$) {
    //...   this.flag(5, ...$)
    //... }
    //... foo_p.setStored = function (...$) {
    //...   this.flag(6, ...$)
    //... }
    //... onr.eyo.p6yMakeShortcuts(onr, 'foo', foo_p)
    [key]: eYo.descriptorR(function () {
      //... chai.expect(onr.eyo.C9r_p.hasOwnProperty('foo')).true
      let p = this[k_p]
      if (!p) {
        console.error('TOO EARLY OR INAPPROPRIATE! BREAK HERE!')
      }
      if (!p.getValueRO) {
        console.error('BREAK HERE!')
        p.getValueRO
      }
      return p.getValueRO()
      //... onr.foo
      //... flag.expect(12)
    }),
    [k_]: {
      //... chai.expect(onr.eyo.C9r_p.hasOwnProperty('foo_')).true
      get: function () {
        if (!this[k_p].getValue) {
          console.error('BREAK HERE!')
          this[k_p].getValue
        }
        return this[k_p].getValue()
        //... onr.foo_
        //... flag.expect(13)
      },
      set (after) {
        //... onr.foo_ = 7
        this[k_p].setValue(after)
        //... flag.expect(147)
      },
    },
    [key + '__']: {
      //... chai.expect(onr.eyo.C9r_p.hasOwnProperty('foo__')).true
      get: function () {
        if (!this[k_p].getStored) {
          console.error('BREAK HERE!')
          this[k_p].getStored
        }
        return this[k_p].getStored()
        //... onr.foo__
        //... flag.expect(15)
      },
      set (after) {
        this[k_p].setStored(after)
        //... onr.foo__ = 11
        //... flag.expect(1611)
      },
    },
    //>>>
  })
  return p6y
  //>>>
}

/**
 * Replace a property shortcut
 * 
 * @param {*} object 
 * @param {String} k 
 * @param {eYo.p6y.BaseC9r} p 
 */
eYo.c9r.Dlgt_p.p6yReplace = function (object, k, source) {
  //<<< mochai: p6yReplace
  let map = object.p6yMap
  let old_p = map ? map.get(k) : object[k + '_p']
  if (!eYo.isDef(old_p)) {
    console.error('BREAK HERE!!!')
  }
  eYo.isDef(old_p) || eYo.throw(`${this.name}/p6yReplace: no replacement for ${k}`)
  var p = eYo.p6y.aliasNew(k, object, source)
  this.p6yMakeShortcuts(object, k, p, true)
  if (map) {
    eYo.linkPreviousNext(old_p.previous, p)
    eYo.linkPreviousNext(p, old_p.next)
    if(p.previous) {
      p = [...map.values()][0]
    }
    map.clear()
    do {
      map.set(p.key, p)
    } while ((p = p.next))
  }
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
