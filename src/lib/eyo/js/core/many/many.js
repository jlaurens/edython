/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview To add functionalities.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('o3d')

eYo.O3d.eyo.modelFormat.allow({
  initMany: eYo.model.descriptorF(),
  //<<< mochai: allow initMany
  //... var mf = eYo.O3d.eyo.modelFormat
  //... var model = {
  //...   initMany: 421,
  //... }
  //... chai.expect(() => mf.validate(model)).throw()
  //... var model = {
  //...   initMany (...$) { flag.push(1, ...$) },
  //... }
  //... model = mf.validate(model)
  //... model.initMany(2, 3)
  //... flag.expect(123)
  //>>>
})

/**
 * @name {eYo.many}
 * @namespace
 */
eYo.makeNS('many')

//<<< mochai: ...
//... let flagor = (what, simple) => simple ? () => flag.push(what) : (...$) => flag.push(what, ...$)
//... var C9r
//... let preparator = f => {
//...   return model => {
//...     C9r = eYo.c9r.makeNS().makeBaseC9r(true)
//...     let eyo = C9r.eyo
//...     let _p = C9r.prototype
//...     _p.flag = flagor(1)
//...     _p.doPrepare = flagor(2)
//...     _p.doInit = flagor(3)
//...     f && f(_p)
//...     eyo.finalizeC9r()
//...   }
//... }
//>>>

eYo.mixinR(false, eYo.many, {
  /**
   * Realize `p.next === n` and `n.previous === p`.
   * @param {*} p 
   * @param {*} n 
   */
  link (p, n) {
    if (eYo.isDef(p) && p.next !== n) {
      // remove old link
      if (p.hasOwnProperty('next') && eYo.isDef(p.next)) {
        Object.defineProperties(p.next, {
          previous: {
            value: eYo.NA,
            configurable: true,
          }
        })
      }
      Object.defineProperties(p, {
        next: {
          value: n,
          configurable: true,
        }
      })
    }
    if (eYo.isDef(n) && n.previous !== p) {
      // remove old link
      if (n.hasOwnProperty('previous') && eYo.isDef(n.previous)) {
        Object.defineProperties(n.previous, {
          next: {
            value: eYo.NA,
            configurable: true,
          }
        })
      }
      Object.defineProperties(n, {
        previous: {
          value: p,
          configurable: true,
        }
      })
    }
  },
})

/**
 * This delegate method populates the namespace's base delegate
 * with some methods to manage a data model with many possible attributes.
 * 
 * @param{String} type - type is one of 'p6y', 'data', 'field', 'slots'
 * @param{String} path - Path, the separator is '/'
 * @param{Object} [manyModel] - Object, read only.
 * Known keys are
 * `allow`
 * `model`
 * `make`
 * `shortcuts`
 * `suffix`
 * `prepare`
 * `init`
 * `dispose`
 * Both are optional.
 */
eYo.dlgt.BaseC9r_p.manyEnhanced = function (type, path, manyModel = {}) {
  // allow at least path in the model
  this.modelFormat.allow(path, manyModel.allow) // at least
  //<<< mochai: manyEnhanced
  var _p = this._p
  /* fooModelByKey__ is a key -> model object with no prototype.
   * Void at startup.
   * Populated with the `...Merge` method.
   * Local to the delegate instance.
   */
  let tModelByKey__ = type + 'ModelByKey__' // local to the instance
  /*
   * Lazy model getter:
   * 
   */
  Object.defineProperty(_p, tModelByKey__, {
    get () {
      let model = this.model || Object.create(null)
      for (let k of path.split('.')) {
        if (model = model[k]) {
          continue
        } else {
          model = Object.create(null)
          break
        }
      }
      Object.defineProperty(this, tModelByKey__, {
        get () {
          return model
        }
      })
      return model
    },
    configurable: true,
    //<<< mochai: fooModelByKey__
    //... preparator()()
    //... C9r.eyo.manyEnhanced('foo', 'foo')
    //... chai.expect(C9r.eyo.fooModelByKey__).not.undefined
    //>>>
  })

  let tMerge = type + 'Merge'
  /**
   * Expands the property, data, fields, slots section into the receiver's corresponding model. Only works for objects.
   * Usage: For the model `{foo: bar}`, run `C9r.eyo.fooMerge(bar)`
   * @param{Object} model - A model object.
   */
  /* fooModelMap_ is a key -> model map.
   * It is computed from the fooModelByKey__ of the delegates and its super's.
   * Cached.
   */
  let tModelMap_ = type + 'ModelMap_'
  /* fooModelMap is a key -> model map.
   * Computed property that uses the cache above.
   * If the cache does not exist, reads super's fooModelMap
   * and adds the local fooModelByKey__.
   * Then caches the result in fooModelMap_.
   */
  // keys defined on delegate instances
  // Ordering is defined to take attributes dependency into account
  let tModelMap = type + 'ModelMap' // computed property
  _p[tMerge] = function (model) {
    model = this.modelValidate(path, model)
    eYo.provideR(false, this[tModelByKey__], model)
    delete this[tModelMap] // delete the shortcut
    this.forEachSubC9r(C9r => C9r.eyo[tMerge]({})) // delete the cache of descendants
    //<<< mochai: fooMerge
    //... preparator()()
    //... C9r.eyo.manyEnhanced('foo', 'foo')
    //... chai.expect(C9r.eyo.fooModelByKey__.chi).undefined
    //... C9r.eyo.fooMerge({
    //...   chi: 421
    //... })
    //... chai.expect(C9r.eyo.fooModelByKey__.chi).equal(421)
    //... chai.expect(C9r.eyo.fooModelByKey__.mi).undefined
    //... C9r.eyo.fooMerge({
    //...   mi: '421'
    //... })
    //... chai.expect(C9r.eyo.fooModelByKey__.mi).equal('421')
    //... preparator()()
    //... C9r.eyo.manyEnhanced('foo', 'foo', {
    //...   [eYo.model.VALIDATE]: eYo.model.validateF,
    //... })
    //... chai.expect(C9r.eyo.fooModelByKey__.chi).undefined
    //... C9r.eyo.fooMerge({
    //...   chi: flagor(1),
    //... })
    //... C9r.eyo.fooModelByKey__.chi(2)
    //... flag.expect(12)
    //... C9r.eyo.fooMerge({
    //...   mi: flagor(12),
    //... })
    //... C9r.eyo.fooModelByKey__.mi(34)
    //... flag.expect(1234)
    //>>>
  }
  Object.defineProperties(_p, {
    [tModelMap]: eYo.descriptorR(function () {
      let modelMap = this[tModelMap_] = new Map()
      let superMap = this.super && this.super[tModelMap]
      let map = superMap ? new Map(superMap) : new Map()
      if (this[tModelByKey__]) {
        for (let [k, v] of Object.entries(this[tModelByKey__])) {
          map.set(k, v)
        }
      }
      let todo = [...map.keys()]
      let done = []
      let again = []
      var more = false
      var k
      while (true) {
        if ((k = todo.pop())) {
          let model = map.get(k)
          if (model && model.after) {
            if (eYo.isStr(model.after)) {
              if (!done.includes(model.after) && (todo.includes(model.after) || again.includes(model.after))) {
                again.push(k)
                continue
              }
            } else if (model.after.some(k => (!done.includes(k) && (todo.includes(model.after) || again.includes(model.after))))) {
              again.push(k)
              continue
            }
          }
          modelMap.set(k, model)
          done.push(k)
          more = true
        } else if (more) {
          [more, todo, again] = [false, again, todo]
        } else {
          again.length && eYo.throw(`Cycling/Missing properties in ${object.eyo.name}: ${again}`)
          break
        }
      }
      Object.defineProperties(this, {
        [tModelMap]: eYo.descriptorR(function () {
          return this[tModelMap_]
        }, true)
      })
      return this[tModelMap_]
    }),
    //<<< mochai: fooModelMap
    //... preparator()()
    //... C9r.eyo.manyEnhanced('foo', 'foo')
    //... chai.expect(C9r.eyo.fooModelMap).not.undefined
    //... preparator()()
    //... C9r.eyo.manyEnhanced('foo', 'foo')
    //... C9r.eyo.fooMerge({
    //...   foo: {
    //...     after: 'chi',
    //...     flag: flagor(1),
    //...   },
    //...   chi: {
    //...     after: 'mi',
    //...     flag: flagor(2),
    //...   },
    //...   mi: {
    //...     flag: flagor(3),
    //...   },
    //... })
    //... for (let [k, model] of C9r.eyo.fooModelMap) {
    //...   model.flag(4)
    //... }
    //... flag.expect(342414)
    //>>>
  })

  let tPrepare = type + 'Prepare'
  let tMap     = type + 'Map' // property defined on instances
  let tHead    = type + 'Head'
  let tTail    = type + 'Tail'
  /**
   * Prepares the *key* properties of the given object.
   * This message is sent by a delegate to prepare the object,
   * which is an instance of the receiver's associate constructor.
   * If we create an instance, the model is not expected to change afterwards.
   * The delegate is now complete and the merge methods
   * should not be called afterwards.
   * 
   * If the super also has a `*key*Prepare` method,
   * it must not be called because there can be a conflict,
   * two attributes may be asigned to the same key.
   * Once an instance has been created, `*key*Merge` is no longer available.
   * @param{*} object - An instance being created.
   */
  _p[tPrepare] = manyModel.prepare
  ? function (object) {
      //<<< mochai: fooPrepare
      if (!this.hasOwnProperty(tMerge)) {
      this[tMerge] = function () {
        eYo.throw(`Do not change the model of ${this.name} once an instance has been created`)
      }
      var $super = this
      while (($super = $super.super)) {
        if ($super.hasOwnProperty(tMerge)) {
          break
        }
        $super[tMerge] = this[tMerge]
      }
    }
    manyModel.prepare.call(this, object)
    //... preparator()()
    //... C9r.eyo.manyEnhanced('foo', 'foo', {
    //...   prepare (object) {
    //...     flag.push(12)  
    //...   }      
    //... })
    //... var o = {}
    //... C9r.eyo.fooPrepare(o)
    //... flag.expect(12)
  } : function (object) {
    if (!this.hasOwnProperty(tMerge)) {
      this[tMerge] = function () {
        eYo.throw(`Do not change the model of ${this.name} once an instance has been created`)
      }
      var $super = this
      while (($super = $super.super)) {
        if ($super.hasOwnProperty(tMerge)) {
          break
        }
        $super[tMerge] = this[tMerge]
      }
      //... preparator()()
      //... C9r.eyo.manyEnhanced('foo', 'foo')
      //... var o = {}
      //... C9r.eyo.fooPrepare(o)
      //... chai.expect(() => C9r.eyo.fooMerge()).throw()
      //... // Not tested for $super
    }
    //... preparator()()
    //... C9r.eyo.manyEnhanced('foo', 'foo', {
    //...   make: flagor(1, true),
    //...   suffix: '_x',
    //...   model: {
    //...     foo: 421,
    //...   },
    //... })
    //... var o = {}
    //... C9r.eyo.fooPrepare(o)
    //... flag.expect(1)
    let attributes = []
    var map = object[tMap]
    if (map) {
      //... preparator()()
      //... C9r.eyo.manyEnhanced('foo', 'foo')
      //... var o = {
      //...   fooMap: new Map([['bar', eYo.c9r.new({
      //...     dispose () {
      //...       flag.push(987)
      //...     }
      //...   }, 'bar')]]),
      //... }
      //... C9r.eyo.fooPrepare(o)
      //... flag.expect(987)
      for (let k of [...map.keys()].reverse()) {
        let attr = map.get(k)
        eYo.isaC9r(attr) && attr.dispose()
      }
    }
    //... preparator()()
    //... C9r.eyo.manyEnhanced('foo', 'foo', {
    //...   make: flagor(1, true),
    //...   model: {
    //...     foo: 421,
    //...   },
    //... })
    //... o = {}
    //... C9r.eyo.fooPrepare(o)
    //... flag.expect(1)
    map = object[tMap] = new Map()
    /**
     * The maker is responsible of making new `key` objects from a model.
     */
    let make = manyModel.make || function (model, k, object) {
      return eYo[type].new(model, k, object)
    }
    for (let [k, model] of this[tModelMap]) {
      let attr = make(model, k, object)
      if (attr) {
        map.set(k, attr)
        attributes.push(attr)
      }
    }
    //... preparator()()
    //... C9r.eyo.manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     return eYo.o3d.new(model, k, object)
    //...   },
    //...   model: {
    //...     foo: {
    //...       after: 'chi'
    //...     },
    //...     chi: {
    //...       after: 'mi'
    //...     },
    //...     mi: {},
    //...   },
    //...   suffix: '_x',
    //... })
    //... o = eYo.c9r.new('onr')
    //... C9r.eyo.fooPrepare(o)
    //... C9r.eyo.fooShortcuts(o)
    //... chai.expect(o.fooHead).equal(o.mi_x)
    //... chai.expect(o.fooTail).equal(o.foo_x)
    //... chai.expect(o.foo_x.next).undefined
    //... chai.expect(o.foo_x.previous).equal(o.chi_x)
    //... chai.expect(o.chi_x.next).equal(o.foo_x)
    //... chai.expect(o.chi_x.previous).equal(o.mi_x)
    //... chai.expect(o.mi_x.next).equal(o.chi_x)
    //... chai.expect(o.mi_x.previous).undefined
    var attr = object[tHead] = attributes.shift()
    eYo.many.link(eYo.NA, attr)
    attributes.forEach(a => {
      eYo.many.link(attr, a)
      attr = a
    })
    eYo.many.link(attr, eYo.NA)
    object[tTail] = attributes.pop() || object[tHead]
    attr = object[tHead]
    //>>>
  }

  let tShortcuts = type + 'Shortcuts'
  _p.hasOwnProperty(tShortcuts) || (_p[tShortcuts] = manyModel.shortcuts || function (object) {
    //<<< mochai: fooShortcuts
    for (let k of object[tMap].keys()) {
      let k_p = k + (manyModel.suffix || `_${type[0]}`)
      if (object.hasOwnProperty(k_p)) {
        console.error(`BREAK HERE!!! ALREADY object ${object.eyo.name}/${k_p}`)
      }
      Object.defineProperties(object, {
        [k_p]: eYo.descriptorR(function () {
          return this[tMap].get(k)
        }),
      })
    }
    //... preparator()()
    //... C9r.eyo.manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     flag.push(1, k)
    //...     return eYo.o3d.new(model, k, object)
    //...   },
    //...   model: {
    //...     foo: {
    //...       bar (...$) {
    //...         flag.push(2, ...$)
    //...       }
    //...     },
    //...   },
    //...   suffix: '_x',
    //... })
    //... o = eYo.c9r.new('foo')
    //... C9r.eyo.fooPrepare(o)
    //... C9r.eyo.fooShortcuts(o)
    //... o.foo_x.eyo.model.bar(3)
    //... flag.expect('1foo23')
    //>>>
  })
  
  let tInit    = type + 'Init'
  let TInit    = eYo.do.toTitleCase(type) + 'Init'
  // object properties
  /**
   * 
   */
  _p[tInit] = manyModel.init || function (object, ...$) {
    //<<< mochai: fooInit
    for (let v of object[tMap].values()) {
      v.preInit && v.preInit()
      let init = object[v.key + TInit]
      init && init.call(object, v, ...$)
      v.init && v.init(...$)
    }
    //... preparator()()
    //... var ns = eYo.o3d.makeNS()
    //... ns.makeBaseC9r({
    //...   init (model, k, object) {
    //...     flag.push(123)
    //...   },
    //...   methods: {
    //...     preInit () {
    //...       flag.push(1)
    //...     }
    //...   }
    //... })
    //... C9r.eyo.manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     return ns.new(model, k, object)
    //...   },
    //...   model: {
    //...     foo: {},
    //...   },
    //...   suffix: '_x',
    //... })
    //... o = eYo.c9r.new('onr')
    //... C9r.eyo.fooPrepare(o)
    //... flag.expect(123)
    //... o.fooFooInit = function (v, ...$) {
    //...   flag.push(2, ...$)
    //... }
    //... C9r.eyo.fooInit(o, 3)
    //... flag.expect(123)
    //>>>
  }
  let tDispose = type + 'Dispose'
  let TDispose = eYo.do.toTitleCase(type) + 'Dispose'
  _p[tDispose] = manyModel.dispose || function(object, ...$) {
    //<<< mochai: fooDispose
    for (let v of object[tMap].values()) {
      if (v.owner === object) {
        let dispose = object[v.key + TDispose]
        dispose && dispose.call(object, v, ...$)
        v.dispose && v.dispose(...$)
      }
    }
    object[tHead] = object[tTail] = object[tModelByKey__] = eYo.NA
    object.boundField = eYo.NA // not here
    //... preparator()()
    //... var ns = eYo.o3d.makeNS()
    //... ns.makeBaseC9r({
    //...   dispose (...$) {
    //...     flag.push(1, ...$)
    //...   },
    //... })
    //... C9r.eyo.manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     return ns.new(model, k, object)
    //...   },
    //...   model: {
    //...     bar: {},
    //...   },
    //...   suffix: '_x',
    //... })
    //... o = eYo.c9r.new('onr')
    //... C9r.eyo.fooPrepare(o)
    //... flag.expect(0)
    //... o.barFooDispose = function (v, ...$) {
    //...   v.dispose(...$)
    //...   v.dispose = function (...$$) {
    //...     flag.push(3, ...$$)
    //...   }
    //...   flag.push(2, ...$)
    //... }
    //... C9r.eyo.fooDispose(o, 9)
    //... flag.expect(192939)
    //>>>
  }
  // methods defined on the object
  var _p = this.C9r_p
  let tForEach = type + 'ForEach'
  _p[tForEach] = function ($this, f) {
    //<<< mochai: fooForEach
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    for (let v of this[tMap].values()) {
      f.call($this, v)
    }
    //... preparator()()
    //... var ns = eYo.o3d.makeNS()
    //... ns.makeBaseC9r()
    //... C9r.eyo.manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     return ns.new(model, k, object)
    //...   },
    //...   model: {
    //...     chi: {
    //...       methods: { flag: flagor(4) }
    //...     },
    //...     mi: {after: 'chi',
    //...       methods: { flag: flagor(5) }
    //...     },
    //...   },
    //... })
    //... o = C9r.eyo.ns.new('o')
    //... C9r.eyo.fooPrepare(o)
    //... flag.expect('2o2o3o3o')
    //... o.fooForEach(v => v.flag(9))
    //... flag.expect(4959)
    //... let $this = {
    //...   flag (v, ...$) {
    //...     v.flag(...$)
    //...     flag.push(8, ...$)
    //...   }
    //... }
    //... o.fooForEach($this, function (v) {this.flag(v, 9)})
    //... flag.expect(49895989)
    //>>>
  }
  let tSome    = type + 'Some'
  /**
   * `fooSome`.
   * Parameters are not ordered.
   * @param {Object} [$this]
   * @param {Function} f
   */
  _p[tSome] = function ($this, f) {
    //<<< mochai: fooSome
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    for (let v of this[tMap].values()) {
      if (f.call($this, v)) {
        return true
      }
    }
    return false
    //... preparator()()
    //... var ns = eYo.o3d.makeNS()
    //... ns.makeBaseC9r()
    //... C9r.eyo.manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     return ns.new(model, k, object)
    //...   },
    //...   model: {
    //...     chi: {
    //...       methods: { flag: flagor(4) }
    //...     },
    //...     mi: {after: 'chi',
    //...       methods: { flag: flagor(5) }
    //...     },
    //...   },
    //... })
    //... o = C9r.eyo.ns.new('o')
    //... C9r.eyo.fooPrepare(o)
    //... flag.expect('2o2o3o3o')
    //... chai.expect(o.fooSome(v => (v.flag(9), v.key === 'chi'))).true
    //... flag.expect(49)
    //... chai.expect(o.fooSome(v => (v.flag(9), v.key === 'mi'))).true
    //... flag.expect(4959)
    //... chai.expect(o.fooSome(v => (v.flag(9), v.key === 'bar'))).false
    //... flag.expect(4959)
    //... let $this = {
    //...   flag (v, ...$) {
    //...     v.flag(...$)
    //...     flag.push(8, ...$)
    //...   }
    //... }
    //... chai.expect(o.fooSome($this, function (v) {
    //...   this.flag(v, 9)
    //...   return v.key === 'chi'
    //... })).true
    //... flag.expect(4989)
    //... chai.expect(o.fooSome($this, function (v) {
    //...   this.flag(v, 9)
    //...   return v.key === 'mi'
    //... })).true
    //... flag.expect(49895989)
    //... chai.expect(o.fooSome($this, function (v) {
    //...   this.flag(v, 9)
    //...   return v.key === 'bar'
    //... })).false
    //... flag.expect(49895989)
    //>>>
  }

  manyModel.model && this[tMerge](manyModel.model)

  //>>>
}
