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

eYo.O3d[eYo.$].modelFormat.allow({
  initMany: eYo.model.descriptorF(),
  //<<< mochai: allow initMany
  //... var mf = eYo.O3d[eYo.$].modelFormat
  //... var model = {
  //...   initMany: 421,
  //... }
  //... chai.expect(() => mf.validate(model)).xthrow()
  //... var model = {
  //...   initMany (...$) { eYo.flag.push(1, ...$) },
  //... }
  //... model = mf.validate(model)
  //... model.initMany(2, 3)
  //... eYo.flag.expect(123)
  //>>>
})

/**
 * @name {eYo.many}
 * @namespace
 */
eYo.provide('many')

//<<< mochai: ../
//... let flagor = (what) => (...$) => eYo.flag.push('/', what, ...$)
//... var C9r, foo$
//... let preparator = f => {
//...   return model => {
//...     C9r = eYo.c9r.newNS().makeC9rBase(true)
//...     C9r.prototype.flag = (...$) => eYo.flag.push('/', ...$)
//...     let eyo$ = C9r[eYo.$]
//...     eyo$._p.c9rPrepare = (object, ...$) => {
//...       object.flag('p', ...$)
//...     }
//...     eyo$._p.c9rInit = (object, ...$) => {
//...       object.flag('i', ...$)
//...     }
//...     f && f(_p)
//...     eyo$.finalizeC9r()
//...   }
//... }
//>>>

eYo.mixinRO(eYo, {
  $previous: Symbol('previous'),
  $next: Symbol('next'),
})

eYo.mixinFR(eYo.many, {
  /**
   * Realize `p[eYo.$next] === n` and `n[eYo.$previous] === p`.
   * @param {*} p 
   * @param {*} n 
   */
  link (p, n) {
    if (eYo.isDef(p) && p[eYo.$next] !== n) {
      // remove old link
      if (eYo.objectHasOwnProperty(p, eYo.$next) && eYo.isDef(p[eYo.$next])) {
        Object.defineProperties(p[eYo.$next], {
          [eYo.$previous]: {
            value: eYo.NA,
            configurable: true,
          }
        })
      }
      Object.defineProperties(p, {
        [eYo.$next]: {
          value: n,
          configurable: true,
        }
      })
    }
    if (eYo.isDef(n) && n[eYo.$previous] !== p) {
      // remove old link
      if (eYo.objectHasOwnProperty(n, 'eYo.$previous') && eYo.isDef(n[eYo.$previous])) {
        Object.defineProperties(n[eYo.$previous], {
          [eYo.$next]: {
            value: eYo.NA,
            configurable: true,
          }
        })
      }
      Object.defineProperties(n, {
        [eYo.$previous]: {
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
 * @param{String} [id] - Unique identifier within the scope of the receiver, defaults to `type`.
 * @param{String} type - One of 'data', 'p6y', 'slots', 'views'...
 * @param{String} path - Path, the separator is '.'
 * @param{Object} [manyModel] - Object, read only.
 * @return {Object} - With symbols
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
eYo.Dlgt_p.manyEnhanced = function (id, type, path, manyModel) {
  //<<< mochai: manyEnhanced
  //<<< mochai: Basics
  if (!eYo.isStr(path)) {
    eYo.isNA(manyModel) || eYo.throw(`${this.eyo$.name}/manyEnhanced: Unexpected last argument`)
    //... chai.expect(() => eYo.C9r[eYo.$].manyEnhanced(1, 2, 3, 4)).xthrow()
    ;[type, path, manyModel] = [id, type, path || {}]
  } else if (!manyModel) {
    manyModel = {}
  }
  var _p = this._p
  let id$ = id + '$'
  eYo.objectHasOwnProperty(_p, id$) && eYo.throw(`${this.eyo$.name}/manyEnhanced: Already used (${id$})`)
  //... preparator()()
  //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo')
  //... chai.expect(() => C9r[eYo.$].manyEnhanced('foo', 'foo')).xthrow()
  //... C9r = eYo.c9r.newNS().makeC9rBase(true)
  //... let dlgt = C9r[eYo.$]
  //... var foo$ = dlgt.manyEnhanced('foo', 'bar', {})
  //... ;[
  //...   // 'modelMap_',
  //...   'modelByKey',
  //...   //'modelMap',
  //...   // 'map',
  //...   'prepare',
  //...   'merge',
  //...   'init',
  //...   'dispose',
  //...   // 'forEach',
  //...   // 'some',
  //...   // 'head',
  //...   // 'tail',
  //... ].forEach(k => {
  //...   var sym = foo$[k]
  //...   chai.assert(sym)
  //...   chai.assert(dlgt._p[sym])
  //... })
  //... ;[
  //...   'forEach',
  //...   'some',
  //... ].forEach(k => {
  //...   var sym = foo$[k]
  //...   chai.assert(sym)
  //...   chai.assert(dlgt.C9r_p[sym])
  //... })
  //... chai.assert(dlgt[foo$.modelMap])
  //... let o = new C9r()
  //... eYo.dlgt.declareDlgt(C9r.prototype)
  //... dlgt[foo$.prepare](o)
  //... chai.assert(o[foo$.map])
  //... chai.expect(o[foo$.head]).undefined
  //... chai.expect(o[foo$.tail]).undefined
  //>>>
  // allow at least path in the model
  this.modelFormat.allow(path, manyModel.allow)
  let type$ = {
    modelByKey: Symbol('modelByKey'),
    merge: Symbol('merge'),
    modelMap: Symbol('modelMap'),
    modelMap_: Symbol('modelMap_'),
    prepare: Symbol('prepare'),
    init: Symbol('init'),
    dispose: Symbol('dispose'),
    map: Symbol('map'),
    links: Symbol('links'),
    head: Symbol('head'),
    tail: Symbol('tail'),
    shortcuts: Symbol('shortcuts'),
    forEach: Symbol('forEach'),
    some: Symbol('some'),
  }
  eYo.mixinRO(_p, {
    [id$]: type$,
    //<<< mochai: id$ (dlgt)
    //... preparator()()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo')
    //... chai.expect(foo$).equal(C9r[eYo.$].foo$)
    //>>>
  })
  /* foo$.modelByKey is a key -> model object with no prototype.
   * Void at startup.
   * Populated with the `...$.merge` method.
   * Local to the delegate instance.
   */
  /*
   * Lazy model getter:
   * 
   */
  Object.defineProperty(_p, type$.modelByKey, {
    get () {
      let model = this.model || Object.create(null)
      if (path) {
        for (let k of path.split('.')) {
          if ((model = model[k])) {
            continue
          } else {
            model = Object.create(null)
            break
          }
        }

      }
      Object.defineProperty(this, type$.modelByKey, {
        get () {
          return model
        }
      })
      return model
    },
    configurable: true,
    //<<< mochai: modelByKey
    //... preparator()()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo')
    //... chai.expect(C9r[eYo.$]).property(foo$.modelByKey)
    //>>>
  })

  /**
   * Expands the property, data, fields, slots section into the receiver's corresponding model. Only works for objects.
   * Usage: For the model `{foo: bar}`, run `C9r[eYo.$][foo$.merge](bar)`
   * @param{Object} model - A model object.
   */
  /* `?[foo$.modelMap_]` is a key -> model map.
   * It is computed from the foo$.modelByKey of the delegates and its super's.
   * Cached.
   */
  /* `?[foo$.modelMap]` is a key -> model map.
   * Computed property that uses the cache above.
   * If the cache does not exist, reads super's `foo$.modelMap`
   * and adds the local foo$.modelByKey.
   * Then caches the result in `foo$.modelMap_`.
   */
  // keys defined on delegate instances
  // Ordering is defined to take attributes dependency into account
  
  _p[type$.merge] = function (model) {
    model = this.modelValidate(path, model)
    eYo.provideFR(this[type$.modelByKey], model)
    delete this[type$.modelMap] // delete the shortcut
    this.forEachSubC9r(C9r => C9r[eYo.$][type$.merge]({})) // delete the cache of descendants
    //<<< mochai: merge
    //... preparator()()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo')
    //... chai.expect(C9r[eYo.$][foo$.modelByKey].chi).undefined
    //... C9r[eYo.$][foo$.merge]({
    //...   chi: 421
    //... })
    //... chai.expect(C9r[eYo.$][foo$.modelByKey].chi).equal(421)
    //... chai.expect(C9r[eYo.$][foo$.modelByKey].mi).undefined
    //... C9r[eYo.$][foo$.merge]({
    //...   mi: '421'
    //... })
    //... chai.expect(C9r[eYo.$][foo$.modelByKey].mi).equal('421')
    //... preparator()()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
    //...   [eYo.model.VALIDATE]: eYo.model.validateF,
    //... })
    //... chai.expect(C9r[eYo.$][foo$.modelByKey].chi).undefined
    //... C9r[eYo.$][foo$.merge]({
    //...   chi: flagor(1),
    //... })
    //... C9r[eYo.$][foo$.modelByKey].chi(2)
    //... eYo.flag.expect('/12')
    //... C9r[eYo.$][foo$.merge]({
    //...   mi: flagor(12),
    //... })
    //... C9r[eYo.$][foo$.modelByKey].mi(34)
    //... eYo.flag.expect('/1234')
    //>>>
  }
  Object.defineProperties(_p, {
    [type$.modelMap]: eYo.descriptorR({$ () {
      let modelMap = this[type$.modelMap_] = new Map()
      let superMap = this.$super && this.$super[type$.modelMap]
      let map = superMap ? new Map(superMap) : new Map()
      let byKey = this[type$.modelByKey]
      if (byKey) {
        for (let [k, v] of Object.entries(byKey)) {
          map.set(k, v)
        }
        for (let k of Object.getOwnPropertySymbols(byKey)) {
          map.set(k, byKey[k])
        }
      }
      let todo = [...map.keys()]
      let done = []
      let again = []
      var more = false
      var k
      while (true) { // eslint-disable-line
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
          again.length && eYo.throw(`Cycling/Missing properties in ${this.eyo$.name}: ${again}`)
          break
        }
      }
      Object.defineProperties(this, {
        [type$.modelMap]: eYo.descriptorR({$ () {
          return this[type$.modelMap_]
        }}.$, true)
      })
      return this[type$.modelMap_]
    }}.$),
    //<<< mochai: modelMap
    //... preparator()()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo')
    //... chai.expect(C9r[eYo.$]).property(foo$.modelMap)
    //... preparator()()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo')
    //... C9r[eYo.$][foo$.merge]({
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
    //... for (let [k, model] of C9r[eYo.$][foo$.modelMap]) {
    //...   model.flag(4)
    //... }
    //... eYo.flag.expect('/34/24/14')
    //>>>
  })

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
  _p[type$.prepare] = manyModel.prepare
    ? function (object, ...$) {
      //<<< mochai: prepare
      if (!eYo.objectHasOwnProperty(this, type$.merge)) {
        this[type$.merge] = function () {
          eYo.throw(`Do not change the model of ${this.name} once an instance has been created`)
        }
        var $super = this
        while (($super = $super.$super)) {
          if (eYo.objectHasOwnProperty($super, type$.merge)) {
            break
          }
          $super[type$.merge] = this[type$.merge]
        }
      }
      manyModel.prepare.call(this, object, ...$)
    //... preparator()()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
    //...   prepare (object) {
    //...     eYo.flag.push(12)  
    //...   }      
    //... })
    //... var o = {}
    //... C9r[eYo.$][foo$.prepare](o)
    //... eYo.flag.expect(12)
    } : function (instance, ...$) {
      if (!eYo.objectHasOwnProperty(this, type$.merge)) {
        this[type$.merge] = eYo.neverShot(`Do not change the model of ${this.name} once an instance has been created`)
        var $super = this
        while (($super = $super.$super)) {
          if (eYo.objectHasOwnProperty($super, type$.merge)) {
            break
          }
          $super[type$.merge] = this[type$.merge]
        }
      //... preparator()()
      //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo')
      //... var o = {}
      //... C9r[eYo.$][foo$.prepare](o)
      //... chai.expect(() => C9r[eYo.$][foo$.merge]()).xthrow()
      //... // Not tested for $super
      }
      //... preparator()()
      //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
      //...   make: flagor('m'),
      //...   suffix: '_x',
      //...   model: {
      //...     foo: 421,
      //...   },
      //... })
      //... var o = {}
      //... C9r[eYo.$][foo$.prepare](o)
      //... eYo.flag.expect('/m421foo')
      let attributes = []
      var map = instance[type$.map]
      if (map) {
      //... preparator()()
      //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo')
      //... var o = {
      //...   [foo$.map]: new Map([['bar', eYo.c9r.new({
      //...     dispose () {
      //...       eYo.flag.push('d')
      //...     }
      //...   }, 'bar')]]),
      //... }
      //... C9r[eYo.$][foo$.prepare](o)
      //... eYo.flag.expect('d')
        for (let k of [...map.keys()].reverse()) {
          let attr = map.get(k)
          eYo.isaC9r(attr) && attr.dispose()
        }
      }
      //... preparator()()
      //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
      //...   make: flagor('m'),
      //...   model: {
      //...     foo: 421,
      //...   },
      //... })
      //... o = {}
      //... C9r[eYo.$][foo$.prepare](o)
      //... eYo.flag.expect('/m421foo')
      map = instance[type$.map] = new Map()
      /**
     * The maker is responsible of making new `key` objects from a model.
     */
      let make = manyModel.make || function (...$) {
        return eYo[type].new(...$)
      }
      for (let [k, model] of this[type$.modelMap]) {
        let attr = make(model, k, instance, ...$)
        if (attr) {
          map.set(k, attr)
          attributes.push(attr)
        }
      }
    //... preparator()()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     return eYo.o3d.new(model, k, object)
    //...   },
    //...   model: {
    //...     foo: {
    //...       after: 'chi',
    //...     },
    //...     chi: {
    //...       after: 'mee'
    //...     },
    //...     mee: {},
    //...   },
    //...   suffix: '_x',
    //... })
    //... o = eYo.c9r.new('onr')
    //... C9r[eYo.$][foo$.prepare](o)
    //... C9r[eYo.$][foo$.shortcuts](o)
    //... chai.expect(o.foo_x.key).equal('foo')
    //... chai.expect(o.chi_x.key).equal('chi')
    //... chai.expect(o.mee_x.key).equal('mee')
    //>>>
    }

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
  _p[type$.links] = manyModel.links
    ? function (object) {
      manyModel.links.call(this, object)
    //<<< mochai: links (1)
    //... preparator()()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
    //...   links (object) {
    //...     eYo.flag.push(12)  
    //...   }      
    //... })
    //... var o = {}
    //... C9r[eYo.$][foo$.links](o)
    //... eYo.flag.expect(12)
    //>>>
    } : function (object) {
    //<<< mochai: links (2)
      let attributes = [...object[type$.map].values()]
      //... preparator()()
      //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
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
      //... C9r[eYo.$][foo$.prepare](o)
      //... C9r[eYo.$][foo$.links](o)
      //... C9r[eYo.$][foo$.shortcuts](o)
      //... chai.expect(o[foo$.head]).equal(o.mi_x)
      //... chai.expect(o[foo$.tail]).equal(o.foo_x)
      //... chai.expect(o.foo_x[eYo.$next]).undefined
      //... chai.expect(o.foo_x[eYo.$previous]).equal(o.chi_x)
      //... chai.expect(o.chi_x[eYo.$next]).equal(o.foo_x)
      //... chai.expect(o.chi_x[eYo.$previous]).equal(o.mi_x)
      //... chai.expect(o.mi_x[eYo.$next]).equal(o.chi_x)
      //... chai.expect(o.mi_x[eYo.$previous]).undefined
      var attr = object[type$.head] = attributes.shift()
      eYo.many.link(eYo.NA, attr)
      attributes.forEach(a => {
        eYo.many.link(attr, a)
        attr = a
      })
      eYo.many.link(attr, eYo.NA)
      object[type$.tail] = attributes.pop() || object[type$.head]
    //>>>
    }

  _p[type$.shortcuts] = manyModel.shortcuts || function (object) {
    //<<< mochai: shortcuts
    let suffix = (manyModel.suffix || `_${type[0]}`)
    for (let k of object[type$.map].keys()) {
      if (eYo.isSym(k)) {
        eYo.objectHasOwnProperty(object, k) && eYo.throw(`${this.eyo$.name}/${id}$.shortcuts: Already property ${object.eyo$.name}/${k.toString()}`)
        eYo.mixinRO(object, {
          [k] () {
            return this[type$.map].get(k).value
          },
        })  
        continue
      }
      let k_p = k + suffix
      if (eYo.objectHasOwnProperty(object, k_p)) {
        eYo.test && eYo.test.IN_THROW || console.error(`BREAK HERE!!! ALREADY object ${object.eyo$ ? object.eyo$.name : '?'}/${k_p}`)
      }
      eYo.objectHasOwnProperty(object, k_p) && eYo.throw(`${this.eyo$.name}/${id}$.shortcuts: Already property ${object.eyo$.name}/${k_p}`)
      eYo.mixinRO(object, {
        [k_p] () {
          return this[type$.map].get(k)
        },
      })
    }
    //... preparator()()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     eYo.flag.push(1, k)
    //...     return eYo.o3d.new(model, k, object)
    //...   },
    //...   model: {
    //...     foo: {
    //...       bar (...$) {
    //...         eYo.flag.push(2, ...$)
    //...       }
    //...     },
    //...   },
    //...   suffix: '_x',
    //... })
    //... o = eYo.c9r.new('foo')
    //... C9r[eYo.$][foo$.prepare](o)
    //... C9r[eYo.$][foo$.shortcuts](o)
    //... o.foo_x.eyo$.model.bar(3)
    //... eYo.flag.expect('1foo23')
    //>>>
  }
  
  let TInit = eYo.do.toTitleCase(type) + 'Init'
  // object properties
  /**
   * 
   */
  _p[type$.init] = manyModel.init || function (object, ...$) {
    //<<< mochai: init
    for (let v of object[type$.map].values()) {
      v.preInit && v.preInit()
      if (eYo.isStr(v.key)) {
        let init = object[v.key + TInit]
        init && init.call(object, v, ...$)
      }
      v.init && v.init(...$)
    }
    //... preparator()()
    //... var ns = eYo.o3d.newNS()
    //... ns.makeC9rBase({
    //...   init (model, k, object) {
    //...     eYo.flag.push('/i')
    //...   },
    //...   methods: {
    //...     preInit () {
    //...       eYo.flag.push('/p')
    //...     }
    //...   }
    //... })
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     return ns.new(model, k, object)
    //...   },
    //...   model: {
    //...     foo: {},
    //...   },
    //...   suffix: '_x',
    //... })
    //... o = eYo.c9r.new('onr')
    //... C9r[eYo.$][foo$.prepare](o)
    //... eYo.flag.expect('/i')
    //... o.fooFooInit = function (v, ...$) {
    //...   eYo.flag.push('f', ...$)
    //... }
    //... C9r[eYo.$][foo$.init](o, 3)
    //... eYo.flag.expect('/pf3/i')
    //>>>
  }
  let TDispose = eYo.do.toTitleCase(type) + 'Dispose'
  _p[type$.dispose] = manyModel.dispose || function(object, ...$) {
    //<<< mochai: dispose
    for (let v of object[type$.map].values()) {
      if (v.owner === object) {
        if (eYo.isStr(v.key)) {
          let dispose = object[v.key + TDispose]
          dispose && dispose.call(object, v, ...$)
        }
        v.dispose && v.dispose(...$)
      }
    }
    object[type$.head] = object[type$.tail] = object[type$.modelByKey] = eYo.NA
    object.boundField = eYo.NA // not here
    //... preparator()()
    //... var ns = eYo.o3d.newNS()
    //... ns.makeC9rBase({
    //...   dispose (...$) {
    //...     eYo.flag.push(1, ...$)
    //...   },
    //... })
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     return ns.new(model, k, object)
    //...   },
    //...   model: {
    //...     bar: {},
    //...   },
    //...   suffix: '_x',
    //... })
    //... o = eYo.c9r.new('onr')
    //... C9r[eYo.$][foo$.prepare](o)
    //... eYo.flag.expect(0)
    //... o.barFooDispose = function (v, ...$) {
    //...   v.dispose(...$)
    //...   v.dispose = function (...$$) {
    //...     eYo.flag.push(3, ...$$)
    //...   }
    //...   eYo.flag.push(2, ...$)
    //... }
    //... C9r[eYo.$][foo$.dispose](o, 9)
    //... eYo.flag.expect(192939)
    //>>>
  }
  // methods defined on the object
  _p = this.C9r_p
  eYo.mixinRO(_p, {
    [id$]: type$,
    //<<< mochai: id$ (instance)
    //... preparator()()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo')
    //... var o = new C9r()
    //... chai.expect(foo$).equal(o.foo$)
    //>>>
  })
  _p[type$.forEach] = function ($this, f) {
    //<<< mochai: forEach
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    for (let v of this[type$.map].values()) {
      f.call($this, v)
    }
    //... preparator()()
    //... var ns = eYo.o3d.newNS()
    //... ns.makeC9rBase()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     return ns.new(model, k, object)
    //...   },
    //...   model: {
    //...     chi: {
    //...       methods: { flag: flagor('chi') }
    //...     },
    //...     mee: {after: 'chi',
    //...       methods: { flag: flagor('mee') }
    //...     },
    //...   },
    //... })
    //... o = C9r[eYo.$].ns.new('o')
    //... eYo.flag.expect('/po')
    //... C9r[eYo.$][foo$.prepare](o)
    //... o[foo$.forEach](v => v.flag(9))
    //... eYo.flag.expect('/chi9/mee9')
    //... let $this = {
    //...   flag (v, ...$) {
    //...     v.flag('.', ...$)
    //...     eYo.flag.push('x', ...$)
    //...   }
    //... }
    //... o[foo$.forEach]($this, function (v) {this.flag(v, 9)})
    //... eYo.flag.expect('/chi.9x9/mee.9x9')
    //>>>
  }
  /**
   * Parameters are not ordered.
   * @param {Object} [$this]
   * @param {Function} f
   */
  _p[type$.some] = function ($this, f) {
    //<<< mochai: some
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    for (let v of this[type$.map].values()) {
      if (f.call($this, v)) {
        return true
      }
    }
    return false
    //... preparator()()
    //... var ns = eYo.o3d.newNS()
    //... ns.makeC9rBase()
    //... var foo$ = C9r[eYo.$].manyEnhanced('foo', 'foo', {
    //...   make (model, k, object) {
    //...     return ns.new(model, k, object)
    //...   },
    //...   model: {
    //...     chi: {
    //...       methods: { flag: flagor('chi') }
    //...     },
    //...     mee: {after: 'chi',
    //...       methods: { flag: flagor('mee') }
    //...     },
    //...   },
    //... })
    //... o = C9r[eYo.$].ns.new('o')
    //... eYo.flag.expect('/po')
    //... C9r[eYo.$][foo$.prepare](o)
    //... chai.expect(o[foo$.some](v => (v.flag(9), v.key === 'chi'))).true
    //... eYo.flag.expect('/chi9')
    //... chai.expect(o[foo$.some](v => (v.flag(9), v.key === 'mee'))).true
    //... eYo.flag.expect('/chi9/mee9')
    //... chai.expect(o[foo$.some](v => (v.flag(9), v.key === 'bar'))).false
    //... eYo.flag.expect('/chi9/mee9')
    //... let $this = {
    //...   flag (v, ...$) {
    //...     v.flag('.', ...$)
    //...     eYo.flag.push('x', ...$)
    //...   }
    //... }
    //... chai.expect(o[foo$.some]($this, function (v) {
    //...   this.flag(v, 9)
    //...   return v.key === 'chi'
    //... })).true
    //... eYo.flag.expect('/chi.9x9')
    //... chai.expect(o[foo$.some]($this, function (v) {
    //...   this.flag(v, 9)
    //...   return v.key === 'mee'
    //... })).true
    //... eYo.flag.expect('/chi.9x9/mee.9x9')
    //... chai.expect(o[foo$.some]($this, function (v) {
    //...   this.flag(v, 9)
    //...   return v.key === 'bar'
    //... })).false
    //... eYo.flag.expect('/chi.9x9/mee.9x9')
    //>>>
  }

  manyModel.model && this[type$.merge](manyModel.model)

  //>>>
  return type$
}
