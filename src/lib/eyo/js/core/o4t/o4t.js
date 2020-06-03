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
eYo.require('many')

//<<< mochai: POC
//... let ns = eYo.c9r.newNS()
//... let C9r = ns.makeBaseC9r()
//... Object.defineProperties(C9r[eYo.$].C9r_p, {
//...   foo: {
//...     get () {
//...       return this.bar
//...     },
//...     set (after) {
//...       this.bar = after
//...     },
//...   },
//...   fooRO: eYo.descriptorR(function () {
//...     return this.foo
//...   }),
//... })
//... let chi = ns.new('chi')
//... let mi = ns.new('mi')
//... chi.foo = 421
//... chai.expect(chi.bar).equal(421)
//... chai.expect(mi.bar).undefined
//... chai.expect(chi.fooRO).equal(421)
//... chai.expect(() => chi.fooRO = 666).throw()
//>>>
/**
 * @name {eYo.o4t}
 * @namespace
 */
eYo.o3d.newNS(eYo, 'o4t')
//<<< mochai: Basic
//... chai.assert(eYo.o4t)
//... chai.expect(eYo.O4t).equal(eYo.o4t.BaseC9r)
//>>>
/**
 * @name {eYo.o4t.BaseC9r}
 * @constructor
 */
eYo.o4t.makeBaseC9r(true)

eYo.mixinFR(eYo._p, {
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
 * @param {String} [id] - defaults to 'p6y'
 * @return {Object} - The symbols
 */
eYo.dlgt.BaseC9r_p.p6yEnhanced = function (id = 'p6y') {
  //<<< mochai: p6yEnhanced

  //<<< mochai: Basics
  //... let Foo = eYo.o4t.newNS().newC9r('Foo')
  //... let eyo = Foo[eYo.$]
  //... chai.expect(eyo[eyo.p6y$.prepare]).eyo_F
  //... chai.expect(eyo[eyo.p6y$.init]).eyo_F
  //>>>

  let manyModel = {
    /**
     * Make a property
     * @param {Object} model 
     * @param {String} key 
     * @param {Object} owner - the owner of the instance
     * @private
     */
    make (model, key, owner) {
      return model && model.source
      ? eYo.p6y.aliasNew(key, owner, ...model.source)
      : eYo.p6y.prepare(model || {}, key, owner)
    },
    allow: {
      //<<< mochai: p6yEnhanced/allow
      [eYo.model.ANY]: eYo.P6y[eYo.$].modelFormat,
      [eYo.model.VALIDATE]: eYo.model.validateD,
      //... let ns = eYo.c9r.newNS()
      //... let C9r = ns.makeBaseC9r(true)
      //... let eyo = C9r[eYo.$]
      //... eyo.p6yEnhanced()
      //... eyo.finalizeC9r()
      //... chai.assert(eyo.modelFormat.get('properties'))
      //>>>
    }
  }
  var p6y$ = this.manyEnhanced(id, 'p6y', 'properties', manyModel)
  /**
   * Make a property shortcut.
   * Change both the given object **and** its prototype!
   * 
   * @param {*} object - The object receiving the new shortcuts,
   */
  //<<< mochai: p6y$.shortcuts
  this._p[p6y$.shortcuts] = function () {
    let _p = this.C9r_p
    for (let k of this[this.p6y$.modelMap].keys()) {
      _p.hasOwnProperty(k) || Object.defineProperties(_p, {
        [k + '_p']: eYo.descriptorR(function () {
          return this[this.p6y$.map].get(k)
          //<<< mochai: foo_p
          //... let ns = eYo.c9r.newNS()
          //... let C9r = ns.makeBaseC9r(true)
          //... let eyo = C9r[eYo.$]
          //... eyo.p6yEnhanced()
          //... eyo.finalizeC9r()
          //... eyo[eyo.p6y$.merge]({
          //...   foo: 421,
          //... })
          //... let _p = eyo.C9r_p
          //... chai.expect(_p.hasOwnProperty('foo_p')).true
          //... let o = ns.new('bar')
          //... eyo[eyo.p6y$.prepare](o)
          //... chai.expect(o.foo_p.value).undefined
          //... eyo[eyo.p6y$.init](o)
          //... chai.expect(o.foo_p.value).equal(421)
          //>>>
        }),
        [k + '_t']: {
          get () {
            let p6y = this[this.eyo.p6y$.map].get(k)
            return p6y && p6y[eYo.Sym$.target]
          },
          set (after) {
            let p6y = this[this.eyo.p6y$.map].get(k)
            if (p6y && after !== p6y[eYo.Sym$.target]) {
              this[this.eyo.p6y$.replace](k, after)
            }
          },
          //<<< mochai: foo_t
          //... let ns = eYo.c9r.newNS()
          //... let C9r = ns.makeBaseC9r(true)
          //... let eyo = C9r[eYo.$]
          //... eyo.p6yEnhanced()
          //... eyo.finalizeC9r()
          //... eyo[eyo.p6y$.merge]({
          //...   foo: 421,
          //... })
          //... let _p = eyo.C9r_p
          //... chai.expect(_p.hasOwnProperty('foo_t')).true
          //... let o = ns.new('bar')
          //... eyo[eyo.p6y$.prepare](o)
          //... eyo[eyo.p6y$.init](o)
          //... var foo_p = eYo.p6y.new('foo', o)
          //... chai.expect(o.foo_t).undefined
          //... chai.expect(foo_p.value).not.equal(421)
          //... o.foo_t = foo_p
          //... chai.expect(o.foo_p).not.equal(foo_p)
          //... chai.expect(o.foo_p[eYo.Sym$.target]).equal(foo_p)
          //... chai.expect(o.foo_t).equal(foo_p)
          //... foo_p.value_ = 421
          //... chai.expect(foo_p.value).equal(o.foo_p.value).equal(421)
          //>>>
        },
        //<<< mochai: foo, foo_, foo__
        //... let ns = eYo.c9r.newNS()
        //... let C9r = ns.makeBaseC9r(true)
        //... let eyo = C9r[eYo.$]
        //... eyo.p6yEnhanced()
        //... eyo.finalizeC9r()
        //... eyo[eyo.p6y$.merge]({
        //...   foo: 421,
        //... })
        //... eyo[eyo.p6y$.shortcuts]()
        //... let _p = C9r.prototype
        //... let o = ns.new({
        //...   methods: {
        //...     flag (...$) {
        //...       flag.push(1, ...$)
        //...     }
        //...   }
        //... }, 'o')
        //... o.eyo[eyo.p6y$.prepare](o)
        //... o.eyo[eyo.p6y$.init](o)
        //... let foo_p = o[eyo.p6y$.map].get('foo')
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
        [k]: eYo.descriptorR(function () {
          //... chai.expect(_p.hasOwnProperty('foo')).true
          let p6y = this[this.p6y$.map].get(k)
          if (!p6y) {
            console.error('TOO EARLY OR INAPPROPRIATE! BREAK HERE!')
          }
          if (!p6y.getValueRO) {
            console.error('BREAK HERE!')
            p6y.getValueRO
          }
          return p6y.getValueRO()
          //... o.foo
          //... flag.expect(12)
        }),
        [k + '_']: {
          //... chai.expect(_p.hasOwnProperty('foo_')).true
          get: function () {
            let p6y = this[this.p6y$.map].get(k)
            if (!p6y.getValue) {
              console.error('BREAK HERE!')
              p6y.getValue
            }
            return p6y.getValue()
            //... o.foo_
            //... flag.expect(13)
          },
          set (after) {
            //... o.foo_ = 7
            this[this.p6y$.map].get(k).setValue(after)
            //... flag.expect(147)
          },
        },
        [k + '__']: {
          //... chai.expect(_p.hasOwnProperty('foo__')).true
          get: function () {
            let p6y = this[this.p6y$.map].get(k)
            if (!p6y.getStored) {
              console.error('BREAK HERE!')
              p6y.getStored
            }
            return p6y.getStored()
            //... o.foo__
            //... flag.expect(15)
          },
          set (after) {
            this[this.p6y$.map].get(k).setStored(after)
            //... o.foo__ = 11
            //... flag.expect(1611)
          },
        },
        //>>>
      })
    }
  }
  //>>>
  //<<< mochai: p6y$.merge
  //... let ns = eYo.c9r.newNS()
  //... let C9r = ns.makeBaseC9r(true)
  //... let eyo = C9r[eYo.$]
  //... eyo.p6yEnhanced()
  //... eyo.finalizeC9r()
  //... eyo[eyo.p6y$.merge]({
  //...   foo: 421,
  //... })
  //... var o = ns.new('bar')
  //... eyo[eyo.p6y$.prepare](o)
  //... chai.expect(o[eyo.p6y$.map].get('foo')).not.undefined
  //... eyo[eyo.p6y$.init](o)
  //... chai.expect(o[eyo.p6y$.map].get('foo').value).equal(421)
  //>>>
  eYo.c9r.appendToMethod(this._p, p6y$.merge, function () {
    this[this.p6y$.shortcuts]()
    //<<< mochai: p6y$.merge+shortcuts
    //... let ns = eYo.c9r.newNS()
    //... let C9r = ns.makeBaseC9r(true)
    //... let eyo = C9r[eYo.$]
    //... eyo.p6yEnhanced()
    //... eyo.finalizeC9r()
    //... eyo[eyo.p6y$.merge]({
    //...   foo: 421,
    //... })
    //... eyo[eyo.p6y$.merge]({
    //...   bar: 666,
    //... })
    //... var o = ns.new('bar')
    //... eyo[eyo.p6y$.prepare](o)
    //... chai.expect(o[eyo.p6y$.map].get('foo')).not.undefined
    //... chai.expect(o[eyo.p6y$.map].get('bar')).not.undefined
    //>>>
  })
  p6y$.replace = Symbol('replace')
  /**
   * Replace a property shortcut
   * 
   * @param {String} k 
   * @param {eYo.p6y.BaseC9r} p 
   */
  this.C9r_p[p6y$.replace] = function (k, source) {
    //<<< mochai: p6y$.replace
    let map = this[this.p6y$.map]
    let old_p = map.get(k)
    if (!eYo.isDef(old_p)) {
      console.error('BREAK HERE!!!')
    }
    eYo.isDef(old_p) || eYo.throw(`${this.eyo.name}/p6y$.replace: no replacement for ${k}`)
    var p6y = eYo.p6y.aliasNew(k, this, source)
    eYo.many.link(old_p[eYo.$previous], p6y)
    eYo.many.link(p6y, old_p[eYo.$next])
    if(p6y[eYo.$previous]) {
      p6y = [...map.values()][0]
    }
    map.clear()
    do {
      map.set(p6y.key, p6y)
    } while ((p6y = p6y[eYo.$next]))
    //... var ns = eYo.o4t.newNS()
    //... let C9r = ns.makeBaseC9r({
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
    //... let eyo = C9r[eYo.$]
    //... var o = ns.new('o', onr)
    //... eyo[eyo.p6y$.shortcuts]()
    //... eyo[eyo.p6y$.prepare](o)
    //... eyo[eyo.p6y$.links](o)
    //... eyo[eyo.p6y$.init](o)
    //... o[eyo.p6y$.forEach](v => flag.push(v.value))
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
    //... chai.expect(o.foo_p[eYo.Sym$.target]).undefined
    //... chai.expect(o.foo_p.value).equal(1)
    //... o[eyo.p6y$.replace]('foo', foo_p)
    //... chai.expect(o.foo_p[eYo.Sym$.target]).equal(o.foo_t).equal(foo_p)
    //... chai.expect(o.foo_p.value).equal(4)
    //... o[eyo.p6y$.forEach](v => flag.push(v.value))
    //... flag.expect(423)
    //... o.foo_ -= 3
    //... chai.expect(foo_p.value).equal(1)
    //... o[eyo.p6y$.forEach](v => flag.push(v.value))
    //... flag.expect(123)
    //... foo_p.value_ += 3
    //... chai.expect(o.foo_p.value).equal(4)
    //... o = ns.new('o', onr)
    //... eyo[eyo.p6y$.prepare](o)
    //... eyo[eyo.p6y$.links](o)
    //... eyo[eyo.p6y$.init](o)
    //... chai.expect(o.chi_p.value).equal(2)
    //... o[eyo.p6y$.replace]('chi', chi_p)
    //... o[eyo.p6y$.forEach](v => flag.push(v.value))
    //... flag.expect(153)
    //... chai.expect(o.chi_p[eYo.Sym$.target]).equal(chi_p)
    //... chai.expect(o.chi_p.value).equal(5)
    //... o.chi_ -= 3
    //... chai.expect(chi_p.value).equal(2)
    //... o[eyo.p6y$.forEach](v => flag.push(v.value))
    //... flag.expect(123)
    //... chi_p.value_ += 3
    //... chai.expect(o.chi_p.value).equal(5)
    //... o = ns.new('o', onr)
    //... eyo[eyo.p6y$.prepare](o)
    //... eyo[eyo.p6y$.links](o)
    //... eyo[eyo.p6y$.init](o)
    //... chai.expect(o.mi_p.value).equal(3)
    //... o[eyo.p6y$.replace]('mi', mi_p)
    //... o[eyo.p6y$.forEach](v => flag.push(v.value))
    //... flag.expect(126)
    //... chai.expect(o.mi_p[eYo.Sym$.target]).equal(mi_p)
    //... chai.expect(o.mi_p.value).equal(6)
    //... o.mi_ -= 3
    //... chai.expect(mi_p.value).equal(3)
    //... o[eyo.p6y$.forEach](v => flag.push(v.value))
    //... flag.expect(123)
    //... mi_p.value_ += 3
    //... chai.expect(o.mi_p.value).equal(6)
    //>>>
  }
  this[p6y$.shortcuts]()
  //>>>
  return p6y$
}
eYo.mixinFR(eYo.O4t[eYo.$]._p, {
  /**
   * Finalize the associate constructor and allow some model format.
   * This must be called once for any delegate, raises otherwise.
   * Calls `modelPrepare`, `makeC9rInit` and `makeC9rDispose`.
   * Raises if the `super` is not already finalized.
   * This must be done by hand because we do not know
   * what is the ancestor's model format.
   * @name {eYo.dlgt.BaseC9r.modelAllow}
   */
  finalizeC9r (...$) {
    let ans = eYo.O4t[eYo.$].constructor[eYo.$SuperC9r_p].finalizeC9r.call(this,...$)
    this[this.p6y$.shortcuts]()
    return ans
  },
})

/**
 * Enhance the constructor with object facilities,
 * id est property and aliases facilities.
 * @param {*} manyModel - The model
 * @return {Object} - p6y$
 */
eYo.dlgt.BaseC9r_p.o4tEnhanced = function () {
  //<<< mochai: o4tEnhanced
  //... let ns = eYo.c9r.newNS()
  //... let C9r = ns.makeBaseC9r()
  //... let eyo = C9r[eYo.$]
  //... let p6y$ = eyo.o4tEnhanced()
  //... var o = ns.new('o')
  this.p6yEnhanced() // just before finalizing
  this.modelFormat.allow({
    //<<< mochai: modelFormat
    aliases: {
      [eYo.model.VALIDATE]: eYo.model.validateD,
    },
    //>>>
  })
  let _p = this._p
  let p6y$ = _p.p6y$
  p6y$.aliasesMerge = Symbol('aliasesMerge')
  p6y$.valueForEach = Symbol('valueForEach')
  p6y$.valueSome = Symbol('valueSome')
  //<<< mochai: Symbols
  //... chai.expect(typeof p6y$.aliasesMerge).equal('symbol')
  //... chai.expect(typeof p6y$.valueForEach).equal('symbol')
  //... chai.expect(typeof p6y$.valueSome).equal('symbol')
  //>>>
  eYo.mixinFR(_p, {
    p6yMerge (...$) {
      return this[this.p6y$.merge](...$)
    },
    p6yAliasesMerge (...$) {
      return this[this.p6y$.aliasesMerge](...$)
    },
    /**
     * Declare the given aliases.
     * Used to declare synonyms.
     * @param {Map<String, String|Array<String>>} model - Object, map source -> alias.
     */
    [p6y$.aliasesMerge] (aliases) {
      //<<< mochai: p6y$.aliasesMerge
      //... let ns = eYo.c9r.newNS()
      //... let C9r = ns.makeBaseC9r(true)
      //... let eyo = C9r[eYo.$]
      //... eyo.finalizeC9r()
      //... let p6y$ = eyo.o4tEnhanced()
      //... chai.expect(eyo[p6y$.aliasesMerge]).eyo_F
      //... chai.expect(eyo[p6y$.merge]).eyo_F
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
      this[this.p6y$.merge](d)
      //>>>
    },
    /**
     * Declare the given model for the associate constructor.
     * The default implementation calls `methodsMerge`.
     * @param {Object} model - Object, like for |newC9r|.
     */
    modelMerge (model) {
      //<<< mochai: modelMerge
      model.aliases && this.p6yAliasesMerge(model.aliases)
      model.properties && this.p6yMerge(model.properties)
      model.methods && this.methodsMerge(model.methods)
      model.CONSTs && this.CONSTsMerge(model.methods)
      //... chai.expect(eYo.o4t.Dlgt_p.modelMerge).eyo_F
      //>>>
    },
    /**
     * Prepare an instance with properties.
     * @param {Object} instance -  object is an instance of a subclass of the `C9r` of the receiver
     */
    prepareInstance (instance) {
      //<<< mochai: prepareInstance
      //... chai.expect(eYo.o4t.Dlgt_p.prepareInstance).eyo_F
      var $prepare = this.p6y$.prepare
      this[$prepare](instance)
      let $super = this.super
      if ($super) {
        try {
          $super[$prepare] = eYo.doNothing // prevent to recreate the same properties
          $super.prepareInstance(instance)
        } finally {
          delete $super[$prepare]
        }
      }
      //>>>
    },
    /**
     * Initialize an instance with valued, cached, owned and copied properties.
     * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
     */
    initInstance (object, ...$) {
      //<<< mochai: initInstance
      //... chai.expect(eYo.o4t.Dlgt_p.initInstance).eyo_F
      let $init = this.p6y$.init
      this[$init](object, ...$)
      this[this.p6y$.links](object)
      let $super = this.super
      if ($super) {
        try {
          $super[$init] = eYo.doNothing // prevent to recreate the same properties
          $super.initInstance(object, ...$)
        } finally {
          delete $super[$init]
        }
      }
      //>>>
    },
    /**
     * Dispose of the resources declared at that level.
     * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
     */
    disposeInstance (object, ...$) {
      //<<< mochai: disposeInstance
      //... chai.expect(eYo.o4t.Dlgt_p.disposeInstance).eyo_F
      this[this.p6y$.dispose](object, ...$)
      //... eYo.c9r.new({
      //...   dispose (...$) {
      //...     flag.push(1, ...$, 4)
      //...   }
      //... }).dispose(2, 3)
      //... flag.expect(1234)
      //... let model = {
      //...   properties: {
      //...     foo: {
      //...       value () {
      //...         return  eYo.c9r.new({
      //...           dispose (...$) {
      //...             flag.push(1, ...$, 4)
      //...           }
      //...         })
      //...       },
      //...     },
      //...   }
      //... }
      //... var o = eYo.o4t.new(model, 'foo', onr)
      //... chai.expect(() => o.constructor[eYo.$].finalizeC9r()).throw()
      //... o.foo.dispose(2, 3)
      //... flag.expect(1234)
      //... var o = eYo.o4t.new(model, 'foo', onr)
      //... chai.expect(o.foo.dispose).not.equal(eYo.doNothing)
      //... o.foo_p.dispose(2, 3)
      //... flag.expect(1234)
      //... var o = eYo.o4t.new(model, 'foo', onr)
      //... o = o.eyo.disposeInstance(o, 2, 3)
      //... flag.expect(1234)
      //>>>
    },
    /**
     * Add a `consolidate` method to the receiver's .
     * The receiver is not the owner.
     * @param {String} k
     * @param {Object} model
     */
    consolidatorMake (k, model) {
      //<<< mochai: consolidatorMake
      //... chai.expect(eYo.o4t.Dlgt_p.consolidatorMake).eyo_F
      let C9r_s = this.C9r_s
      C9r_s || eYo.throw('Only subclasses may have a consolidator !')
      let C9r_p = this.C9r_p
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
    },
    //// Properties and methods
    /**
     * Iterator over the properties.
     * @param {Object} object
     * @param {Object} [$this] - Optional this, cannot be a function
     * @param {Function} f
     * @param {Boolean} [owned] - defaults to false
     */
    [p6y$.valueForEach] (object, $this, f, owned) {
      //<<< mochai: p6y$.valueForEach
      //... chai.expect(eyo[p6y$.valueForEach]).eyo_F
      if (eYo.isF($this)) {
        ;[f, owned, $this] = [$this, f, owned]
      }
      if (owned) {
        for (let p6y of object[this.p6y$.map].values()) {
          if (p6y.owner === object) {
            let v = p6y.stored__
            if (v) {
              f.call($this, v)
            }
          }
        }
      } else {
        for (let p6y of object[this.p6y$.map].values()) {
          let v = p6y.stored__
          if (v) {
            f.call($this, v)
          }
        }
      }
      //>>>
    },
    /**
     * Iterator over the properties.
     * @param {Object} object
     * @param {Object} [$this] - Optional this, cannot be a function
     * @param {Function} f
     * @param {Boolean} [owned] - defaults to false
     */
    [p6y$.valueSome] (object, $this, f, owned) {
      //<<< mochai: p6y$.valueSome
      //... chai.expect(eyo[p6y$.valueSome]).eyo_F
      if (owned) {
        for (let p of object[this.p6y$.map].values()) {
          if (p.owner === object) {
            let v = p.stored__
            if (v && /* v.eyo && p === v[eYo.$p6y] &&*/ f.call($this, v)) {
              return true
            }
          }
        }
      } else {
        for (let p of object[this.p6y$.map].values()) {
          let v = p.getValue()
          if (v && f.call($this, v)) {
            return true
          }
        }
      }
      //>>>
    }
  })
  eYo.mixinFR(this.C9r_p, {
    //<<< mochai: iterators
    //... let ns = eYo.c9r.newNS()
    //... let C9r = ns.makeBaseC9r()
    //... let eyo = C9r[eYo.$]
    //... let p6y$ = eyo.o4tEnhanced()
    //... var o = ns.new('o')
    /**
     * Executes the helper for each owned property.
     * @param {Object} [$this] - Optional this, cannot be a function
     * @param{Function} f -  an helper with one argument which is the owned value.
     */
    [p6y$.ownedValueForEach] ($this, f) {
      //<<< mochai: p6y$.ownedValueForEach
      //... chai.expect(o[eyo.p6y$.ownedValueForEach]).eyo_F
      if (eYo.isF($this)) {
        ;[$this, f] = [f, $this]
      }
      return this.eyo[this.p6y$.valueForEach](this, $this, f, true)
      //>>>
    },
    /**
     * Executes the helper for each owned property stopping at the first truthy answer.
     * @param {Object} [$this] - Optional this, cannot be a function
     * @param{Function} f -  an helper with one argument which is the owned value.
     */
    [p6y$.ownedValueSome] ($this, f) {
      //<<< mochai: p6y$.ownedValueSome
      //... chai.expect(o[eyo.p6y$.ownedValueSome]).eyo_F
      if (eYo.isF($this)) {
        ;[$this, f] = [f, $this]
      }
      return this.eyo[this.p6y$.valueSome](this, $this, f, true)
      //>>>
    }
    //>>>
  })
  return p6y$
  //>>>
}


eYo.O4t[eYo.$].o4tEnhanced()
eYo.O4t[eYo.$].finalizeC9r()

eYo.mixinFR(eYo.o4t._p, {
  //<<< mochai: eYo.o4t extension
  /**
   * Declares a model to be used by others. 
   * It creates in the receiver's namespace a `merge` function or a `fooMerge` function,
   * which purpose is to enlarge the prototype of the given constructor.
   * @param{String} [key] - the key for that model
   * @param{Object} model - the model
   */
  modelDeclare (key, model) {
    //<<< mochai: modelDeclare
    if (eYo.isStr(key)) {
      key = key + 'Merge'
    } else if (eYo.isStr(model)) {
      ;[key, model] = [model + 'Merge', key]
    } else {
      ;[model, key] = [key, 'merge']
    }
    let _p = this._p
    _p.hasOwnProperty(key) && eYo.throw(`Already done`)
    _p[key] = function (C9r) {
      C9r[eYo.$].modelMerge(model)
    }
    //... let NS_super = eYo.o4t.newNS()
    //... let NS = NS_super.newNS('foo')
    //... NS_super.makeBaseC9r()
    //... let o = new NS_super.BaseC9r('o', onr)
    //... chai.expect(() =>{
    //...   o.bar()
    //... }).to.throw()
    //... chai.assert(!o.foo)
    //... chai.assert(!NS_super.chiMerge)
    //... NS_super.modelDeclare('chi', {
    //...   properties: {
    //...     foo: 421,
    //...   },
    //...   aliases: {
    //...     foo: 'mi',
    //...   },
    //...   methods: {
    //...     bar (...$) {
    //...       flag.push(1, ...$)
    //...     }
    //...   }
    //... })
    //... chai.assert(NS_super.chiMerge)
    //... chai.expect(() => NS_super.chiMerge(NS_super.BaseC9r_p)).throw()
    //... NS.makeBaseC9r(true)
    //... NS.chiMerge(NS.BaseC9r_p)
    //... NS.BaseC9r[eYo.$].finalizeC9r()
    //... o = new NS.BaseC9r('o', onr)
    //... o.bar(2, 3)
    //... flag.expect(123)
    //... chai.expect(o.mi).equal(o.foo).equal(421)
    //>>>
  },
  //>>>
})
