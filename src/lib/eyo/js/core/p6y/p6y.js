/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.P6y is a class for a property controller.
 * It extends the JS property design by providing some hooks before, during and after changes, allowing observers to specify actions.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('do')
eYo.require('observe')
eYo.require('xre')

eYo.require('many') // for eYo.$previous

eYo.forward('o4t')

eYo.mixinRO(eYo, {
  //<<< mochai: eYo.$p6y
  $p6y: Symbol('p6y')
  //... chai.expect(eYo).property('$p6y')
  //>>>
})

//<<< mochai: POC: function arguments'
//... chai.expect((() => {}).length).equal(0)
//... chai.expect(((...$) => {}).length).equal(0)
//... chai.expect((x => {}).length).equal(1)
//... chai.expect({foo () {}}.foo.length).equal(0)
//... chai.expect({foo (...$) {}}.foo.length).equal(0)
//... chai.expect({foo (x) {}}.foo.length).equal(1)
//... chai.expect((function (...$) {}).length).equal(0)
//... chai.expect((function () {}).length).equal(0)
//... chai.expect((function (x) {}).length).equal(1)
//>>>

// ANCHOR eYo.p6y
/**
 * @name{eYo.p6y}
 * @namespace
 */
eYo.o3d.newNS(eYo, 'p6y')
//<<< mochai: P6y
//... chai.assert(eYo.p6y)
//>>> mochai: P6y

// ANCHOR eYo.P6y_p
/**
 * @name{eYo.P6y_p}
 * Base property constructor.
 * The bounds between the property and the arguments are immutable.
 * For edython.
 * @param {*} owner - The object owning the property.
 * @param {string} key - name of the property.
 * @param {Object} model - contains methods and properties.
 * It is shared by all property controllers belonging to the same kind
 * of owner. Great care should be taken when editing this model.
 * @constructor
 */
eYo.p6y.makeC9rBase(true, {
  //<<< mochai: eYo.P6y
  //<<< mochai: Basic
  //... chai.expect(eYo.p6y.C9rBase).equal(eYo.P6y)
  //>>>
  init () {
    this.stored__ = eYo.NA // this may be useless in some situations
    Object.defineProperties(this, {
      value: eYo.descriptorR({
        lazy () {
          return `....value = ... forbidden for ${this.eyo.name} instances.`
        },
      }, {$ () {
        return this.getValueRO()
      }}.$,
      ),
    })
    //<<< mochai: eYo.P6y_p, init
    //... ;[
    //...     new eYo.P6y('foo', onr),
    //...     eYo.p6y.new('foo', onr),
    //...     eYo.p6y.new({}, 'foo', onr),
    //... ].forEach(p6y => {
    //...   chai.expect(p6y.key).equal('foo')
    //...   chai.expect(p6y.owner).equal(onr)
    //...   chai.expect(p6y.stored__).undefined
    //...   chai.assert(eYo.isNA(p6y.value))
    //...   chai.expect(() => p6y.value = 0).throw()
    //...   p6y.value_ = 421
    //...   chai.expect(p6y.value).equal(421)
    //...   chai.expect(p6y.value_).equal(421)
    //...   chai.expect(p6y.value__).equal(421)
    //...   chai.expect(p6y.stored__).equal(421)
    //...   var p6y = eYo.p6y.new({}, 'foo', onr)
    //...   let value = eYo.c9r.new('bar')
    //...   p6y.value_ = value
    //...   chai.expect(p6y.value).equal(value)
    //...   chai.expect(value[eYo.$p6y]).equal(p6y)
    //... })
    //>>>
  },
  dispose (...$) {
    //<<< eYo.P6y_p, dispose
    //... var p6y = eYo.p6y.new({}, 'foo', onr)
    //... let value = eYo.o3d.new({
    //...   dispose () {
    //...     this.owner.flag(2)
    //...   }
    //... }, 'bar', onr)
    //... p6y.value_ = value
    //... p6y.dispose()
    this.removeObservers()
    this._disposeStored(...$)
    //... chai.assert(eYo.isNA(p6y.value))
    //... flag.expect(12)
    //>>>
  },
  methods: {
    /**
     * Object disposer.
     * Manage collections, and takes care of ownership.
     * @param {Object} what
     */
    __disposeStored (what, ...$) {
      //<<< mochai: eYo.P6y_p.__disposeStored(what, ...$)
      if (eYo.isaC9r(what)) {
        what[eYo.$p6y] === this && what.dispose(...$)
        //... var p6y = new eYo.P6y('p6y', onr)
        //... what = eYo.c9r.new({
        //...   dispose (...$) {
        //...     flag.push(1, ...$)
        //...   }
        //... })
        //... flag.reset()
        //... what[eYo.$p6y] = p6y
        //... p6y.__disposeStored(what, 2, 3)
        //... flag.expect(123)
      } else if (eYo.isRA(what)) {
        try {
          what.forEach(x => this.__disposeStored(x, ...$))
        } finally {
          what.length = 0
        }
        //... what = []
        //... p6y.__disposeStored(what, 2, 3)
        //... flag.expect()
        //... var value_1 = eYo.c9r.new({
        //...   dispose (...$) {
        //...     flag.push(1, ...$)
        //...   }
        //... })
        //... value_1[eYo.$p6y] = p6y
        //... what = [value_1]
        //... p6y.__disposeStored(what, 2, 3)
        //... flag.expect(123)
        //... var value_1 = eYo.c9r.new({
        //...   dispose (...$) {
        //...     flag.push(8, ...$)
        //...   }
        //... })
        //... value_1[eYo.$p6y] = p6y
        //... var value_2 = eYo.c9r.new({
        //...   dispose (...$) {
        //...     flag.push(9, ...$)
        //...   }
        //... })
        //... value_2[eYo.$p6y] = p6y
        //... what = [value_1, value_2]
        //... p6y.__disposeStored(what, 2, 3)
        //... flag.expect(823923)
      } else if (what) {
        if (what instanceof Map) {
          for (let v of what.values()) {
            this.__disposeStored(v, ...$)
          }
          what.clear()
          //... what = new Map([])
          //... p6y.__disposeStored(what, 1, 2, 3)
          //... flag.expect()
          //... var value_1 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(1, ...$)
          //...   }
          //... })
          //... value_1[eYo.$p6y] = p6y
          //... what = new Map([[1, value_1]])
          //... p6y.__disposeStored(what, 2, 3)
          //... flag.expect(123)
          //... var value_1 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(8, ...$)
          //...   }
          //... })
          //... value_1[eYo.$p6y] = p6y
          //... var value_2 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(9, ...$)
          //...   }
          //... })
          //... value_2[eYo.$p6y] = p6y
          //... what = new Map([[1, value_1], [2, value_2]])
          //... p6y.__disposeStored(what, 2, 3)
          //... flag.expect(823923)
        } else {
          Object.keys(what).forEach(k => {
            if (eYo.objectHasOwnProperty(what, k)) {
              this.__disposeStored(what[k], ...$)
            }
          })
          //... what = {}
          //... p6y.__disposeStored(what, 3, 4, 5)
          //... flag.expect()
          //... var value_1 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(1, ...$)
          //...   }
          //... })
          //... value_1[eYo.$p6y] = p6y
          //... what = {'1': value_1}
          //... p6y.__disposeStored(what, 2, 3)
          //... flag.expect(123)
          //... var value_1 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(8, ...$)
          //...   }
          //... })
          //... value_1[eYo.$p6y] = p6y
          //... var value_2 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(9, ...$)
          //...   }
          //... })
          //... value_2[eYo.$p6y] = p6y
          //... what = {'1': value_1, '2': value_2}
          //... p6y.__disposeStored(what, 2, 3)
          //... flag.expect(823923)
        }
      }
      //>>>
    },
    /**
     * Dispose of the stored object, if any.
     * Private method, overriden to `eYo.doNothing`
     * for objects that should not be disposed of.
     * 
     */
    _disposeStored (...$) {
      let v = this.stored__
      if (eYo.isaC9r(v) && v[eYo.$p6y] === this) {
        try {
          this.__disposeStored(v, ...$)
        } finally {
          this.stored__ = eYo.NA
        }
      }
    },
    /**
     * recycle of the value.
     * @private
     */
    recycle (...$) {
      //<<< mochai: eYo.P6y_p.recycle
      let before = this.stored__
      if (eYo.isDef(before)) {
        try {
          this.validate = eYo.doReturn2nd
          let dispose = before[eYo.$p6y] === this
          this.setValue(eYo.NA)
          if (dispose) {
            before[eYo.$p6y] = eYo.NA
            before.dispose(...$)
          }
        } finally {
          delete this.validate
        }
      }
      //... var p6y = new eYo.P6y('p6y', onr)
      //... what = eYo.c9r.new({
      //...   dispose (...$) {
      //...     flag.push(1, ...$)
      //...   }
      //... })
      //... flag.reset()
      //... p6y.value_ = what
      //... chai.expect(p6y.value).equal(what)
      //... p6y.recycle(2, 3)
      //... flag.expect(123)
      //... chai.expect(what.dispose).equal(eYo.doNothing)
      //... chai.expect(p6y.value).equal(eYo.NA)
      //>>>
    },
    /**
     * Reset the value of the receiver.
     * This can be overriden by the model's `reset` key.
     * @param {*} after - the new value after the change.
     */
    reset (after) {
      return this.setValue(eYo.isDef(after) ? after : this.getValueStart())
      //<<< mochai: eYo.P6y_p.reset
      //... let p6y = new eYo.P6y('foo', onr)
      //... chai.expect(p6y.value).undefined
      //... p6y.value_ = 421
      //... chai.expect(p6y.value).equal(421)
      //... chai.expect(p6y.reset().after).undefined
      //... chai.expect(p6y.value).undefined
      //... chai.expect(p6y.reset(421).after).equal(421)
      //>>>
    },
    /**
     * Reset the stored value of the receiver.
     * This can be overriden by the model's `reset_` key.
     * @param {*} after - the new value after the change.
     */
    reset_ (after) {
      return this.setStored(eYo.isDef(after) ? after : this.getValueStart())
      //<<< mochai: eYo.P6y_p.reset_
      //... let p6y = new eYo.P6y('foo', onr)
      //... chai.expect(p6y.value).undefined
      //... p6y.value_ = 421
      //... chai.expect(p6y.value).equal(421)
      //... chai.expect(p6y.reset_().after).undefined
      //... chai.expect(p6y.value).undefined
      //... chai.expect(p6y.reset_(421).after).equal(421)
      //>>>
    },
  },
  //>>>
})
//<<< mochai: methods
eYo.mixinFR(eYo._p, {
  /**
   * Whether the argument is a property instance.
   * @param {*} what 
   */
  isaP6y (what) {
    return !!what && what instanceof eYo.P6y
  }
  //<<< mochai: eYo.isaP6y
  //... chai.assert(eYo.isaP6y)
  //... chai.expect(eYo.isaP6y()).false
  //... chai.expect(eYo.isaP6y(eYo.NA)).false
  //... chai.expect(eYo.isaP6y(421)).false
  //... chai.expect(eYo.isaP6y(new eYo.P6y('foo', onr))).true
  //>>>
})

/**
 * Id is used when observing
 * @name {eYo.P6y_p.Id}
 */
eYo.mixinRO(eYo.P6y_p, {
  Id: 'P6y',
  //<<< mochai: Id
  //... chai.expect((new eYo.P6y('foo', onr)).Id).equal('P6y')
  //>>>
})

//<<< mochai: modelFormat
//... var model = {
//...   foo: {
//...     get () {},
//...   },
//... }
//... let mf = eYo.P6y[eYo.$].modelFormat
//... model = mf.validate(model)
//... chai.assert(eYo.isF(model.foo.get))
eYo.P6y$.finalizeC9r([
  'source',
  'change',
], (() => {
  let m = eYo.model.descriptorD(before => {
    return {value: eYo.isF(before) ? before: () => before}
    //... var model = eYo.doNothing
    //... model = mf.validate(model)
    //... chai.expect(model.value).equal(eYo.doNothing)
    //... var model = 421
    //... model = mf.validate(model)
    //... chai.expect(model.value()).equal(421)
  }, {
    after: {
      [eYo.model.VALIDATE]: before => {
        if (!eYo.isStr(before) && !eYo.isRA(before)) {
          return eYo.INVALID
        }
      },
      //... var model = {
      //...   after: 421
      //... }
      //... chai.expect(() => mf.validate(model)).throw()
    },
    validate: {
      [eYo.model.VALIDATE]: before => {
        if (before === false) return eYo.doReturn2nd
        if (!eYo.isF(before)) return eYo.INVALID
      },
      //... var model = {
      //...   validate: eYo.NA
      //... }
      //... mf.validate(model)
      //... var model = {
      //...   validate: 421,
      //... }
      //... chai.expect(() => mf.validate(model)).throw()
      //... var model = {
      //...   validate: false
      //... }
      //... chai.expect(mf.validate(model).validate).equal(eYo.doReturn2nd)
    },
    copy: eYo.model.descriptorBool(),
    //... var model = {
    //...   copy: eYo.NA,
    //... }
    //... mf.validate(model)
    //... var model = {
    //...   copy: true,
    //... }
    //... chai.expect(mf.validate(model).copy).true
    //... var model = {
    //...   copy: false,
    //... }
    //... chai.expect(mf.validate(model).copy).false
    //... var model = {
    //...   copy: 421,
    //... }
    //... chai.expect(() => mf.validate(model)).throw()
    reset: eYo.model.descriptorF(),
    //... ;['reset'].forEach(K => {
    //...   var model = {
    //...     [K]: eYo.NA,
    //...   }
    //...   mf.validate(model)
    //...   var model = {
    //...     [K]: 421,
    //...   }
    //...   chai.expect(() => mf.validate(model)).throw()
    //...   var model = {
    //...     [K]: () => {},
    //...   }
    //...   mf.validate(model)
    //... })
    value: eYo.model.descriptorF(before => () => before),
    lazy:  eYo.model.descriptorF(before => () => before),
    //... ;['value', 'lazy'].forEach(K => {
    //...   var model = {
    //...     [K]: eYo.NA,
    //...   }
    //...   mf.validate(model)
    //...   var model = {
    //...     [K]: 421,
    //...   }
    //...   chai.expect(mf.validate(model)[K]()).equal(421)
    //...   var model = {
    //...     [K]: eYo.doNothing,
    //...   }
    //...   chai.expect(mf.validate(model)[K]).equal(eYo.doNothing)
    //... })
  })
  ;[
    'dispose',
    'get',
    'set',
    'get_',
    'set_',
    eYo.observe.BEFORE,
    eYo.observe.DURING,
    eYo.observe.AFTER
  ].forEach(k => m[k] = eYo.model.descriptorForFalse())
  return m
  //... ;[
  //...   'dispose',
  //...   'get',
  //...   'set',
  //...   'get_',
  //...   'set_',
  //...   eYo.observe.BEFORE,
  //...   eYo.observe.DURING,
  //...   eYo.observe.AFTER
  //... ].forEach(K => {
  //...   var model = {
  //...     [K]: eYo.NA,
  //...   }
  //...   mf.validate(model)
  //...   var model = {
  //...     [K]: 421,
  //...   }
  //...   chai.expect(() => mf.validate(model)).throw()
  //...   var model = {
  //...     [K]: eYo.doNothing,
  //...   }
  //...   chai.expect(mf.validate(model)[K]).equal(eYo.doNothing)
  //...   var model = {
  //...     [K]: false,
  //...   }
  //...   chai.expect(mf.validate(model)[K]).equal(eYo.doNothing)
  //... })
})())
//>>>

eYo.more.enhanceO3dValidate(eYo.P6y[eYo.$], 'p6y', true)

//<<< mochai: validate
//... var p6y = new eYo.P6y('foo', onr)
//... chai.expect(p6y.validate(1, 2)).equal(2)
//... onr.p6yValidate = function (key, before, after) {
//...   this.flag(2, key, before, after)
//...   return after
//... }
//... chai.expect(p6y.validate(3, 4)).equal(4)
//... flag.expect('12foo34')
//... delete onr.p6yValidate
//... onr.fooP6yValidate = function (before, after) {
//...   this.flag(2, before, after)
//...   return after
//... }
//... chai.expect(p6y.validate(3, 4)).equal(4)
//... flag.expect(1234)
//... delete onr.fooP6yValidate
//... onr.p6yValidate = function (key, before, after) {
//...   this.flag(2, before, after)
//...   return after
//... }
//... onr.fooP6yValidate = function (before, after) {
//...   this.flag(6, before+4, after+4)
//...   return after
//... }
//... chai.expect(p6y.validate(3, 4)).equal(4)
//... flag.expect('12341678')
//... p6y.value__ = 3
//... flag.expect()
//... p6y.value_ = 4
//... flag.expect(12341678)
//... onr.p6yValidate = function (key, before, after) {
//...   this.flag(2, before, after)
//...   return eYo.INVALID
//... }
//... chai.expect(p6y.validate(3, 4)).equal(eYo.INVALID)
//... flag.expect(1234)
//... p6y.value__ = 3
//... flag.expect()
//... p6y.value_ = 4
//... flag.expect(1234)
//... chai.expect(p6y.value).equal(3)
//>>>

// ANCHOR eYo.p6y.new

/**
 * For subclassers.
 * Model handlding 
 * @param {String} key
 * @param {Object} [model]
 */
eYo.p6y.Dlgt_p.modelHandle = function (key, model) {
  key || (key = this.key)
  model || (model = this.model)
  let io = this.modelHandleCheck(key, model) // first
  this.modelHandleStart(key, model, io)
  this.modelHandleGetSet(key, model, io)
  this.modelHandleDispose(key, model, io)
  this.modelHandleValidate(key, model, io)
  this.modelHandleChange(key, model, io)
  this.modelHandleStored(key, model, io)
}

/**
 * Process the model to detect inconsistancies.
 * @param {String} key
 * @param {Object} model
 * @return {Object} io - pass information between model handlers
 */
eYo.p6y.Dlgt_p.modelHandleCheck = function (key, model) {
  let io = {}
  //<<< mochai: eYo.p6y.Dlgt_p.modelHandleCheck
  //... ;[{
  // Pure computed value 
  let get_m = model.get
  let set_m = model.set
  io.get = eYo.isDoIt(get_m)
  io.set = eYo.isDoIt(set_m)
  io.pure_get = io.get && get_m.length === 0
  io.pure_set = io.set && set_m.length === 1
  let get__m = model.get_
  let set__m = model.set_
  io.get_ = eYo.isDoIt(get__m)
  io.set_ = eYo.isDoIt(set__m)
  io.pure_get_ = io.get_ && get__m.length === 0
  io.pure_set_ = io.set_ && set__m.length === 1
  // Pure computed value getter
  if (io.pure_get) {
    ( io.set && !io.pure_set
      || io.get_
      || io.set_
      || eYo.isDef(model.value)
      || eYo.isDef(model.lazy)
      || model.copy
    ) && eYo.throw(`Bad model (${this.name}/${key}): pure computed value inconsistancy (get)`)
    //...   get () {},
    //...   set (builtin, after) {},
    //... }, {
    //...   get () {},
    //...   get_ () {},
    //... },{
    //...   get () {},
    //...   set_ () {},
    //... },{
    //...   get () {},
    //...   value: 421,
    //... },{
    //...   get () {},
    //...   lazy: 421,
    //... },{
    //...   get () {},
    //...   copy: true,
    //... },{
  }
  // Pure computed value setter
  let value_m = model.value
  let lazy_m = model.lazy
  if (io.pure_set) {
    ( io.get && !io.pure_get
      || io.get_
      || io.set_
      || eYo.isDef(value_m)
      || eYo.isDef(lazy_m)
      || model.copy
    ) && eYo.throw(`Bad model (${this.name}/${key}): pure computed value inconsistancy (set)`)
    //...   set (after) {},
    //...   get (builtin) {},
    //... }, {
    //...   set (after) {},
    //...   get_ () {},
    //... },{
    //...   set (after) {},
    //...   set_ () {},
    //... },{
    //...   set (after) {},
    //...   value: 421,
    //... },{
    //...   set (after) {},
    //...   lazy: 421,
    //... },{
    //...   set (after) {},
    //...   copy: true,
    //... },{
  }
  // Pure computed store getter
  if (io.pure_get_) {
    ( io.set_ && !io.pure_set_) && eYo.throw(`Bad model (${this.name}/${key}): pure computed store inconsistancy`)
    //...   get_ () {},
    //...   set_ (builtin, after) {},
    //... },{
  }
  // Pure computed store getter
  if (io.pure_set_) {
    ( io.get_ && !io.pure_get_) && eYo.throw(`Bad model (${this.name}/${key}): pure computed store inconsistancy (2)`)
  }
  if (get_m === eYo.doNothing) {
    ( eYo.isDef(model.value)
      || eYo.isDef(model.lazy)
      || model.copy
    ) && eYo.throw(`Bad model (${this.name}/${key}): no value getter inconsistancy`)
    //...   get: false,
    //...   value: 421,
    //... },{
    //...   get: false,
    //...   lazy: 421,
    //... },{
    //...   get: false,
    //...   copy: true,
    //... },{
    //...   get: eYo.doNothing,
    //...   value: 421,
    //... },{
    //...   get: eYo.doNothing,
    //...   lazy: 421,
    //... },{
    //...   get: eYo.doNothing,
    //...   copy: true,
    //... },{
  }
  let reset_m = model.reset
  io.reset = eYo.isF(reset_m)
  io.pure_reset = io.reset && !reset_m.length
  let reset__m = model.reset_
  io.reset_ = eYo.isF(reset__m)
  io.pure_reset_ = io.reset_ && !reset__m.length
  // if reset_m is purely computed, no lazy nor value is allowed.
  !io.reset || !io.reset_ || eYo.throw(`Bad model (${this.name}/${key}): unexpected both reset and reset_`)
  //...   reset () {},
  //...   reset_ () {},
  //... },{
  if (io.pure_reset || io.pure_reset_) {
    eYo.isNA(value_m) && eYo.isNA(lazy_m) || eYo.throw(`Bad model (${this.name}/${key}): unexpected value|lazy due to pure reset|reset_`)
    //...   reset () {},
    //...   value: 123,
    //... },{
    //...   reset () {},
    //...   lazy: 123,
    //... },{
    //...   reset_ () {},
    //...   value: 123,
    //... },{
    //...   reset_ () {},
    //...   lazy: 123,
    //... },{
  } else if (eYo.isDef(lazy_m)) {
    eYo.isNA(value_m) || eYo.throw(`Bad model (${this.name}/${key}): unexpected value`)
    model.value = model.lazy
    //...   lazy: 421,
    //...   value: 123,
    //... },{
  }
  //... },].forEach(m => {
  //...   if (Object.keys(m).length) {
  //...     chai.expect(() => eYo.p6y.new(m, 'foo', onr)).throw()
  //...   }
  //... })
  eYo.observe.HOOKS.forEach(when => {
    let when_m = model[when]
    !when_m || eYo.isF(when_m) || eYo.throw(`Bad model (${this.name}/${key}): bad model ${when}`)
  })
  //... eYo.observe.HOOKS.forEach(when => {
  //...   var model = {
  //...     [when]: 421,
  //...   }
  //...   chai.expect(() => eYo.p6y.new(m, 'foo', onr)).throw()
  //... })
  //... var p6y = eYo.p6y.new('foo', onr)
  //... var model = {
  //...   lazy: 421,
  //... }
  //... p6y[eYo.$].modelHandleCheck('foo', model)
  //... chai.expect(model.lazy).equal(model.value)
  //>>>
  return io
}

/**
 * Make the prototype's `reset` method, based on the model's object for value key reset, either a function or an object.
 * If model's object is a function, it is executed to return an object which will be the new value.
 * If we want to reset with a function, the model's object must be a function that in turn returns the expected function.
 * And more...
 * @param {String} key
 * @param {Object} model
 * @param {Object} io
 */
eYo.p6y.Dlgt_p.modelHandleStart = function (key, model, io) {
  io || (io = this.modelHandleCheck(key, model))
  //<<< mochai: eYo.p6y.Dlgt_p.modelHandleStart
  let _p = this.C9r_p
  let f = K => {
    //... let f = K => {
    let f_m = model[K]
    if (io[`pure_${K}`]) {
      // should go with pure getters and pure setters
      _p.getValueStart = eYo.noGetter({$ () {
        return `No getValueStart for pure computed reset (${this.name}.${key})`
      }}.$)
      //... chai.expect(() => eYo.p6y.new({
      //...   [K] () {},
      //... }, 'foo', onr).getValueStart()).throw()
      _p[K] = eYo.decorate.reentrant(K, {$ (...$) {
        return f_m.call(this.owner, ...$)
      }}.$)
      //... var x = 421
      //... var p6y = eYo.p6y.new({
      //...   [K] (...$) {
      //...     this.flag(2, ...$)
      //...     return {after: x}
      //...   }
      //... }, 'foo', onr)
      //... chai.expect(p6y.value).undefined
      //... p6y.value_ = 123
      //... chai.expect(p6y.value).equal(123)
      //... chai.expect(p6y[K](3, 4, 5).after).equal(x)
      //... flag.expect(12345)
      //... x = 666
      //... chai.expect(p6y[K]().after).equal(x)
      //... flag.expect(12)
      //... chai.expect(p6y.value).equal(123)
      //... p6y[eYo.$].C9r_p[K]= function (...$) {
      //...   this.owner.flag(2, ...$)
      //... }
      //... p6y[eYo.$].modelHandleStart('foo', p6y.model)
      //... p6y[K](3, 4, 5)
      //... flag.expect(12345)
    } else if (io[K]) {
      //... chai.assert(eYo.P6y_p.reset)
      _p[K] = (f_p => eYo.decorate.reentrant(K, {$ (...$) {
        return f_m.call(this.owner, f_p.bind(this), ...$)
      }}.$))(_p[K]) // create a closure to store the old _p[K]
      //... var p6y = eYo.p6y.new({
      //...   reset (builtin, ...$) {
      //...     this.flag(2, ...$)
      //...     return builtin(...$)
      //...   }
      //... }, 'foo', onr)
      //... chai.expect(p6y.reset(3, 4, 5).after).equal(3)
      //... flag.expect(12345)
      //... p6y[eYo.$].C9r_p.reset = function (...$) {
      //...   this.owner.flag(9, ...$)
      //... }
      //... p6y[eYo.$].modelHandleStart('foo', p6y.model)
      //... p6y.reset(3, 4, 5)
      //... flag.expect(1234519345)
    }
    //... }
  }
  f('reset')
  //... f('reset')
  f('reset_')
  //... f('reset_')
  if (io.pure_reset) {
    _p.reset_ = eYo.neverShot('Bad reset_')
    //... var p6y = eYo.p6y.new({
    //...   reset () {}
    //... }, 'foo', onr)
    //... chai.expect(() => p6y.reset_()).throw()
  }
  if (io.pure_reset_) {
    _p.reset = eYo.neverShot('Bad reset')
    //... var p6y = eYo.p6y.new({
    //...   reset_ () {}
    //... }, 'foo', onr)
    //... chai.expect(() => p6y.reset()).throw()
  }
  let value_m = model.value
  if (eYo.isDef(value_m)) {
    _p.getValueStart = {$ () {
      return value_m.call(this.owner)
    }}.$
    //... ;['value', 'lazy'].forEach(K => {
    //...   var p6y = eYo.p6y.new({
    //...    [K]: 421
    //...   }, 'foo', onr)
    //...   chai.expect(p6y.getValueStart()).equal(421)
    //... })
  }
  let lazy_m = model.lazy
  if (eYo.isDef(lazy_m)) {
    model[eYo.$$.starters].push(object => {
      object.getStored = function () {
        delete this.getStored
        var ans = this.getStored()
        if (eYo.isNA(ans)) {
          this.setStored(ans = this.getValueStart())
        }
        return ans
      }
    })
    //... var p6y = eYo.p6y.new({
    //...  lazy: 421
    //... }, 'foo', onr)
    //... chai.expect(p6y.stored__).undefined
    //... chai.expect(p6y.value__).equal(421)
    //... p6y.value_ = 666
    //... chai.expect(p6y.value).equal(666)
    //... chai.expect(p6y.reset().after).equal(421)
    //... p6y = eYo.p6y.new({
    //...   lazy: 3,
    //...   willChange (before, after) {
    //...     this.flag(2, before, after)
    //...   }
    //... }, 'foo', onr)
    //... chai.expect(p6y.getValueStart()).equal(3)
    //... chai.expect(p6y.stored__).undefined
    //... chai.expect(p6y.value__).equal(3)
    //... flag.expect() // change events not fired
    //... p6y.value_ = 4
    //... flag.expect(1234) // change events fired
    //... p6y.value_ = 4
    //... chai.expect(p6y.value).equal(4)
    //... chai.expect(p6y.reset().after).equal(3)
    //... flag.expect(1243) // change events fired
  } else if (eYo.isDef(value_m)) {
    model[eYo.$$.starters].push(object => {
      object.setStored(object.getValueStart())
    })
    //... var p6y = eYo.p6y.new({
    //...  value: 421
    //... }, 'foo', onr)
    //... chai.expect(p6y.value).equal(421)
    //... p6y.value_ = 666
    //... chai.expect(p6y.value).equal(666)
    //... chai.expect(p6y.reset().after).equal(421)
  }
  //>>>
}
/**
 * Make the prototype's dispose method according to the model's object for key dispose.
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y.Dlgt_p.modelHandleDispose = function (key, model) {
  //<<< mochai: modelHandleDispose
  let _p = this.C9r_p
  let K = '_disposeStored'
  //... chai.assert(eYo.P6y_p._disposeStored)
  //... let ns = eYo.p6y.newNS()
  //... ns.makeC9rBase()
  //... ns.C9rBase_p._disposeStored = function(...$) {
  //...   this.owner.flag(2, ...$)
  //... }
  //... var p6y = ns.new('foo', onr)
  //... p6y.dispose(3)
  //... flag.expect(123)
  if (model.dispose === eYo.doNothing) {
    _p[K] = eYo.doNothing
    //... var p6y = ns.new({
    //...   dispose: false
    //... }, 'foo', onr)
    //... p6y.dispose(2)
    //... flag.expect()
  }
  //>>>
}
/**
 * make the prototype's change methods based on the model.
 * If a method is inherited, then the super method is called.
 * It may not be a good idea to change the inherited method afterwards.
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y.Dlgt_p.modelHandleChange = function (key, model) {
  //<<< mochai: eYo.p6y.Dlgt_p.modelHandleChange
  let _p = this.C9r_p
  ;[
    eYo.observe.BEFORE,
    eYo.observe.DURING,
    eYo.observe.AFTER,
  ].forEach(when => {
    //... ;[
    //...   eYo.observe.BEFORE,
    //...   eYo.observe.DURING,
    //...   eYo.observe.AFTER,
    //... ].forEach(when => {
    let when_m = model[when]
    if (eYo.isF(when_m)) {
      let when_p = _p[when]
      if (when_m.length > 1) {
        if (when_p) {
          _p[when] = eYo.decorate.reentrant(when, {$ (before, after) {
            when_m.call(this.owner, before, after)
            when_p.call(this, before, after)
          }}.$)
          //... var ns = eYo.p6y.newNS()
          //... ns.makeC9rBase()
          //... ns.C9rBase_p[when] = function (before, after) {
          //...   this.owner.flag(5, before, after)
          //... }
          //... let f_before_after = function (before, after) {
          //...   this.flag(2, before, after)
          //... }
          //... let f_after = function (after) {
          //...   this.flag(2, after)
          //... }
          //... var p6y = ns.new({
          //...   [when]: f_before_after,
          //... }, 'foo', onr)
          //... p6y.value__ = 3
          //... p6y.value_ = 4
          //... flag.expect(12341534)
          //... var p6y = ns.new({
          //...   [when]: f_after,
          //... }, 'foo', onr)
          //... p6y.value__ = 2
          //... p6y.value_ = 3
          //... flag.expect(1231523)
        } else {
          _p[when] = eYo.decorate.reentrant(when, {$ (before, after) {
            when_m.call(this.owner, before, after)
          }}.$)
          //... var ns = eYo.p6y.newNS()
          //... ns.makeC9rBase()
          //... var p6y = ns.new({
          //...   [when]: f_before_after,
          //... }, 'foo', onr)
          //... p6y.value__ = 3
          //... p6y.value_ = 4
          //... flag.expect(1234)
          //... var p6y = ns.new({
          //...   [when]: f_after,
          //... }, 'foo', onr)
          //... p6y.value__ = 2
          //... p6y.value_ = 3
          //... flag.expect(123)
        }
      } else {
        if (when_p) {
          _p[when] = eYo.decorate.reentrant(when, {$ (before, after) {
            when_m.call(this.owner, after)  
            when_p.call(this, before, after)
          }}.$)
          //... var ns = eYo.p6y.newNS()
          //... ns.makeC9rBase()
          //... ns.C9rBase_p[when] = function (before, after) {
          //...   this.owner.flag(5, before, after)
          //... }
          //... var p6y = ns.new({
          //...   [when]: f_after,
          //... }, 'foo', onr)
          //... p6y.value__ = 4
          //... p6y.value_ = 3
          //... flag.expect(1231543)
        } else {
          _p[when] = eYo.decorate.reentrant(when, {$ (before, after) { // eslint-disable-line
            when_m.call(this.owner, after)
          }}.$)
          //... var ns = eYo.p6y.newNS()
          //... ns.makeC9rBase()
          //... var p6y = ns.new({
          //...   [when]: f_after,
          //... }, 'foo', onr)
          //... p6y.value__ = 4
          //... p6y.value_ = 3
          //... flag.expect(123)
        }
      }
    }
    //... })
  })
  //>>>
}
/**
 * Make the prototype's dispose method according to the model's object for key dispose.
 * @param {String} key
 * @param {Object} model
 */
/**
 * make the prototype's getValue method based on the model.
 * make the prototype' setValue method based on the model.
 * @param {String} key
 * @param {Object} model
 * @param {Object} io
 */
eYo.p6y.Dlgt_p.modelHandleGetSet = function (key, model, io) {
  io || (io = this.modelHandleCheck(key, model))
  //<<< mochai: eYo.p6y.Dlgt_p.modelHandleGetSet
  let _p = this.C9r_p
  let gVRO = 'getValueRO'
  if (model.copy) {
    _p[gVRO] = eYo.decorate.reentrant(gVRO, {$ () {
      let ans = this.getValue()
      return eYo.isDef(ans) && ans.copy
    }}.$)
    //... var p6y = eYo.p6y.new({
    //...   copy: true,
    //... }, 'foo', onr)
    //... var v = eYo.o3d.new('v', onr)
    //... p6y.value__ = v
    //... Object.defineProperty(v, 'copy', {
    //...     get () {
    //...     this.owner.flag(3)
    //...     return this
    //...   }
    //... })
    //... chai.expect(p6y.value).equal(v)
    //... flag.expect(13)
    //... chai.expect(p6y.value_).equal(v)
    //... flag.expect()
    //... chai.expect(p6y.value__).equal(v)
    //... flag.expect()
    //... var p6y = eYo.p6y.new({
    //...   copy: true,
    //...   get (builtin) {
    //...     this.flag(2)
    //...     return builtin()
    //...   },
    //... }, 'foo', onr)
    //... var v = eYo.o3d.new('v', onr)
    //... p6y.value__ = v
    //... Object.defineProperty(v, 'copy', {
    //...     get () {
    //...     this.owner.flag(3)
    //...     return this
    //...   }
    //... })
    //... chai.expect(p6y.value).equal(v)
    //... flag.expect(1213)
    //... chai.expect(p6y.value_).equal(v)
    //... flag.expect(12)
    //... chai.expect(p6y.value__).equal(v)
    //... flag.expect()
    //... chai.expect(() => eYo.p6y.new({
    //...   copy: true,
    //...   get () {}  
    //... }, 'foo', onr)).throw()
  }
  let getK = 'getValue'
  let get_p = _p[getK]
  //... chai.assert(eYo.P6y_p.getValue)
  let get_m = model.get // from model => suffix = '_m' and `@this` === property owner
  // get_m is computed means that it is meant to replace the standard getter
  if (get_m === eYo.doNothing) {
    _p[getK] = _p[gVRO] = eYo.noGetter(function () {
      return `Write only (${this.owner.eyo.name}/${key})`
    })
    //... ;[eYo.doNothing, false].forEach(what => {
    //...   var p6y = eYo.p6y.new({
    //...     get: what 
    //...   }, 'foo', onr)
    //...   chai.expect(() => p6y.getValue()).throw()
    //...   chai.expect(() => p6y.value).throw()
    //...   chai.expect(() => p6y.value_).throw()
    //...   chai.expect(() => p6y.value__).not.throw()
    //... })
  } else if (io.pure_get) {
    _p.getStored = _p[getK] = eYo.decorate.reentrant(getK, {$ () {
      return get_m.call(this.owner)
    }}.$)
    //... var x = 3
    //... var p6y = eYo.p6y.new({
    //...   get () {
    //...     this.flag(2, x)
    //...     return x
    //...   },
    //... }, 'foo', onr)
    //... flag.reset()
    //... chai.expect(p6y.getValue()).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.getStored()).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value_).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value__).equal(3)
    //... flag.expect(123)
  } else if (io.get) {
    _p[getK] = eYo.decorate.reentrant(getK, {$ () {
      return get_m.call(this.owner, get_p.bind(this))
    }}.$)
    //... var p6y = eYo.p6y.new({
    //...   get (builtin) {
    //...     let ans = builtin()
    //...     this.flag(2, ans)
    //...     return ans
    //...   },
    //... }, 'foo', onr)
    //... p6y.value_ = 3
    //... chai.expect(p6y.getValue()).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.getStored()).equal(3)
    //... flag.expect()
    //... chai.expect(p6y.value).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value_).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value__).equal(3)
    //... flag.expect()
  }
  let setK = 'setValue'
  let set_m = model.set
  if (set_m === eYo.doNothing) {
    _p[setK] = eYo.noSetter(function () {
      return `Read only ${this.owner.eyo.name}/${key}`
    })
    //... ;[eYo.doNothing, false].forEach(what => {
    //...   var p6y = eYo.p6y.new({
    //...     set: what, 
    //...   }, 'foo', onr)
    //...   chai.expect(() => p6y.setValue(421)).throw()
    //...   chai.expect(() => p6y.value = 421).throw()
    //...   chai.expect(() => p6y.value_ = 421).throw()
    //...   chai.expect(() => p6y.value__ = 421).not.throw()    
    //... })
  } else if (io.pure_set) {
    _p[setK] = _p.setStored = eYo.decorate.reentrant(setK, {$ (after) {
      return set_m.call(this.owner, after)
    }}.$)
    //... var x = 3
    //... var p6y = eYo.p6y.new({
    //...   set (after) {
    //...     this.flag(3, x = after)
    //...   },
    //... }, 'foo', onr)
    //... p6y.value_ = 57
    //... flag.expect(1357)
    //... var p6y = eYo.p6y.new({
    //...   set (after) {
    //...     this.flag(3, x = after)
    //...     return 10 * x + 1
    //...   }
    //... }, 'foo', onr)
    //... chai.expect(p6y.setValue(579)).equal(5791)
    //... flag.expect(13579)
  } else if (io.set) {
    let set_p = _p[setK]
    if (set_m.length > 1) {
      if (XRegExp.exec(set_m.toString(), eYo.xre.function_stored_after)) {
        _p[setK] = eYo.decorate.reentrant(setK, {$ (after) {
          let before = this.stored__
          let ans = set_m.call(this.owner, this.stored__, after)
          return eYo.isDef(ans) ? ans : before
        }}.$)
        //... var p6y = eYo.p6y.new({
        //...   set (stored, after) {
        //...     this.flag(2, after)
        //...     return stored
        //...   }
        //... }, 'foo', onr)
        //... p6y.stored__ = 421
        //... chai.expect(p6y.setValue(3)).equal(421)
        //... flag.expect(123)
      } else {
        _p[setK] = eYo.decorate.reentrant(setK, {$ (after) {
          let before = this.stored__
          let ans = set_m.call(this.owner, after => {
            return set_p.call(this, after)
          }, after)
          return eYo.isDef(ans) ? ans : before
        }}.$)
        //... var p6y = eYo.p6y.new({
        //...   set (builtin, after) {
        //...     this.flag(3, builtin(after).before, after)
        //...   },
        //... }, 'foo', onr)
        //... p6y.value_ = 5
        //... flag.expect(135)
        //... var test = (what) => {
        //...   chai.expect(p6y.value).equal(what)
        //...   chai.expect(p6y.value_).equal(what)
        //...   chai.expect(p6y.value__).equal(what)
        //...   chai.expect(p6y.stored__).equal(what)
        //... }
        //... test(5)
        //... p6y.value_ = 7
        //... flag.expect(1357)
        //... test(7)
        //... p6y.value__ = 5
        //... flag.expect()
        //... test(5)
        //... chai.expect(p6y.setValue(7)).equal(5)
        //... flag.expect(1357)
        //... test(7)
        //... var p6y = eYo.p6y.new({
        //...   get (builtin) {
        //...     var ans = builtin()
        //...     this.flag(2, ans)
        //...     return ans
        //...   },
        //...   set (builtin, after) {
        //...     this.flag(3, builtin(after).before, after)
        //...   },
        //... }, 'foo', onr)
        //... p6y.value__ = 5
        //... p6y.value_ = 7
        //... flag.expect(1357)
        //... var test = (what) => {
        //...   chai.expect(p6y.value).equal(what)
        //...   flag.expect(`12${what}`)
        //...   chai.expect(p6y.value_).equal(what)
        //...   flag.expect(`12${what}`)
        //...   chai.expect(p6y.value__).equal(what)
        //...   flag.expect()
        //...   chai.expect(p6y.stored__).equal(what)
        //...   flag.expect()
        //... }
        //... test(7)
        //... p6y.value__ = 5
        //... flag.expect()
        //... test(5)
        //... chai.expect(p6y.setValue(7)).equal(5)
        //... flag.expect(1357)
        //... test(7)
      }
    } else {
      _p[setK] = eYo.decorate.reentrant(setK, {$ (after) {
        let before = this.stored__
        let ans = set_m.call(this.owner, after => {
          return set_p.call(this, after)
        }, after)
        return eYo.isDef(ans) ? ans : before
      }}.$)
      //... var p6y = eYo.p6y.new({
      //...   set (after) {
      //...     this.flag(2, after)
      //...     return after
      //...   }
      //... }, 'foo', onr)
      //... p6y.stored__ = 421
      //... chai.expect(p6y.setValue(3)).equal(3)
      //... flag.expect(123)
    }
  } else if (io.pure_get) {
    _p[setK] = eYo.noSetter(function () {
      return `Read only ${this.owner.eyo.name}/${key}`
    })
    //... var x = 421
    //... let p = eYo.p6y.new({
    //...   get () {
    //...     return x
    //...   }
    //... }, 'foo', onr)
    //... chai.expect(p.value === 421)
    //... chai.expect(p.value_ === 421)
    //... chai.expect(p.value__ === 421)
    //... chai.expect(() => {
    //...   p.value_ = 123
    //... }).to.throw()
  }
  //>>>
}


/**
 * Make the prototype's getStored method based on the model `get_` function.
 * Make the prototype's setStored method based on the model's `set_` function.
 * @param {String} key
 * @param {Object} model
 * @param {Object} io
 */
eYo.p6y.Dlgt_p.modelHandleStored = function (key, model, io) {
  io || (io = this.modelHandleCheck(key, model))
  //<<< mochai: eYo.p6y.Dlgt_p.modelHandleStored
  let _p = this.C9r_p
  let getK = 'getStored'
  let get__m = model.get_
  if (io.pure_get) {
    _p.getStored = _p.getValue
    //... var p6y = eYo.p6y.new({
    //...   get () {},
    //... }, 'foo', onr)
    //... chai.expect(p6y.getStored).equal(p6y.getValue)
  } else if (io.pure_get_) {
    _p[getK] = eYo.decorate.reentrant(getK, {$ () {
      return get__m.call(this.owner)
    }}.$)
    //... var x = 3
    //... var p6y = eYo.p6y.new({
    //...   get_ () {
    //...     this.flag(2, x)
    //...     return x
    //...   },
    //... }, 'p6y', onr)
    //... chai.expect(p6y.getValue()).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.getStored()).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value_).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value__).equal(3)
    //... flag.expect(123)
  } else if (get__m === eYo.doNothing) {
    _p[getK] = eYo.noGetter(function () {
      return `Write only (${this.owner.eyo.name}/${key})`
    })
  } else if (io.get_) {
    _p[getK] = eYo.decorate.reentrant(getK, {$ () {
      return get__m.call(this.owner, () => this.__getStored())
    }}.$)
    //... var p6y = eYo.p6y.new({
    //...   get_ (builtin) {
    //...     let stored = builtin()
    //...     this.flag(2, stored)
    //...     return stored
    //...   },
    //... }, 'p6y', onr)
    //... p6y.stored__ = 3
    //... chai.expect(p6y.getStored()).equal(3)
    //... flag.expect(123)
  }
  let setK = 'setStored'
  let set__m = model.set_
  if (io.pure_set_) {
    _p[setK] = eYo.decorate.reentrant(setK, {$ (after) {
      return set__m.call(this.owner, after)
    }}.$)
    //... var p6y = eYo.p6y.new({
    //...   set_ (after) {
    //...     this.flag(3, x = after)
    //...   },
    //... }, 'foo', onr)
    //... p6y.value_ = 57
    //... flag.expect(1357)
    //... p6y.value__ = 579
    //... flag.expect(13579)
    //... var p6y = eYo.p6y.new({
    //...   set_ (after) {
    //...     this.flag(3, x = after)
    //...     return 10*x+1
    //...   },
    //... }, 'p6y', onr)
    //... chai.expect(p6y.setStored(579)).equal(5791)
    //... flag.expect(13579)
    //... var x = 0
    //... var p6y = eYo.p6y.new({
    //...   get_ () {
    //...     this.flag(2, x)
    //...     return x
    //...   },
    //...   set_ (after) {
    //...     this.flag(3, after)
    //...     return x = after
    //...   },
    //... }, 'foo', onr)
    //... p6y.value_ = 5
    //... flag.expect(12135)
    //... chai.expect(p6y.value).equal(x).equal(5)
    //... flag.expect(125)
    //... p6y.value__ = 57
    //... flag.expect(1357)
    //... chai.expect(p6y.value).equal(x).equal(57)
    //... flag.expect(1257)
  } else if (io.set_) {
    _p[setK] = eYo.decorate.reentrant(setK, {$ (after) {
      return set__m.call(this.owner, $after => this.__setStored($after), after)
    }}.$)
    //... var p6y = eYo.p6y.new({
    //...   set_ (builtin, after) {
    //...     after = builtin(after).after
    //...     this.flag(3, after)
    //...   },
    //... }, 'p6y', onr)
    //... p6y.setStored(5)
    //... flag.expect(135)
    //... chai.expect(p6y.getStored()).equal(5)
    //... p6y.value_ = 57
    //... flag.expect(1357)
    //... chai.expect(p6y.getStored()).equal(57)
    //... p6y.value__ = 579
    //... flag.expect(13579)
    //... chai.expect(p6y.getStored()).equal(579)
  } else if (io.pure_get) {
    _p[setK] = _p.setValue
    //... var p6y = eYo.p6y.new({
    //...   get () {}
    //... }, 'foo', onr)
    //... chai.expect(p6y.setValue).equal(p6y.setStored)
    //... chai.expect(() => {
    //...   p6y.value__ = 123
    //... }).to.throw()
    //... var x = 3
    //... var p6y = eYo.p6y.new({
    //...   get () {
    //...     this.flag(2, x)
    //...     return x
    //...   },
    //...   set (after) {
    //...     this.flag(3, x = after)
    //...   },
    //... }, 'foo', onr)
    //... chai.expect(p6y.setValue).equal(p6y.setStored)  
    //... p6y.value__ = 57
    //... flag.expect(1357)
    //... chai.expect(p6y.value).equal(57)
    //... flag.expect(1257)
    //... chai.expect(p6y.value_).equal(57)
    //... flag.expect(1257)
    //... chai.expect(p6y.value__).equal(57)
    //... flag.expect(1257)
    //... chai.expect(p6y.stored__).equal(eYo.NA)
    //... flag.expect()
    //... p6y.value__ = 3
    //... flag.expect(133)
    //... chai.expect(p6y.value).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value_).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value__).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.stored__).equal(eYo.NA)
    //... p6y.stored__ = 123
    //... flag.expect()
    //... chai.expect(p6y.value).equal(3)
    //... chai.expect(p6y.value_).equal(3)
    //... chai.expect(p6y.value__).equal(3)
    //... chai.expect(p6y.stored__).equal(123)
  } else if (set__m === eYo.doNothing) {
    _p[setK] = eYo.noSetter(function () {
      return `Read only (${this.owner.eyo.name}/${key})`
    })
  }
  //>>>
}

//>>>

/**
 * Handler namespace for property proxies.
 * @name {eYo.p6y.handler}
 * @namespace
 */
eYo.o3d.newNS(eYo.p6y, 'handler')
//<<< mochai: Alias
/**
 * Abstract constructor for proxy handlers.
 * A property proxy aims to be transparent.
 * 
 * The target is either a property or a proxy to a property.
 * Beware of loops.
 * 
 * The handlers covers the target either with its own keys or its internal `cover__` object.
 * @name {eYo.p6y.handler.C9rBase}
 * @constructor
 */
eYo.p6y.handler.makeC9rBase({
  //<<< mochai: eYo.p6y.handler.C9rBase
  /**
   * Initialize a proxy's handler.
   * Debug note: if `foo.eyo.name` is `eYo.p6y.handler.Changer` then `foo` is an alias to a property named `changer` (more precisely the handler of the proxy).
   * @param {String|Symbol} key 
   * @param {eYo.C9r} owner 
   * @param {eYo.P6y|Proxy} target 
   */
  init (key, owner) { // eslint-disable-line
    this.cover__ = {
      dispose: eYo.doNothing
    }
  },
  dispose () {
    this.cover__ = eYo.NA
  },
  methods: {
    //<<< mochai: methods
    //... var target, handler, p
    //... let restart = () => {
    //...   target = eYo.p6y.new('bar', onr)
    //...   handler = eYo.p6y.handler.new('foo', onr)
    //...   handler.flag = (...$) => flag.push(1, ...$)
    //...   p = new Proxy(target, handler)
    //... }
    getProxy(target) {
      //<<< mochai: getProxy
      if (eYo.objectHasOwnProperty(target, eYo.$$.target)) {
        target = target[eYo.$$.target]
      }
      return new Proxy(target, this)
      //>>>
    },
    get (target, prop, receiver) { // eslint-disable-line
      //<<< mochai: get
      if (eYo.objectHasOwnProperty(this.cover__, prop)) {
        return this.cover__[prop]
        //... restart()
        //... for (let [k, v] of Object.entries(handler.cover__)) {
        //...   chai.expect(p[k]).equal(v)
        //... }
      } else if (prop === eYo.$$.target && !eYo.objectHasOwnProperty(target, prop)) {
        return target
        //... restart()
        //... chai.expect(p[eYo.$$.target]).equal(target)
      } else if (prop === eYo.$$.handler) {
        return this
        //... restart()
        //... chai.expect(p[eYo.$$.handler]).equal(handler)
      } else if (prop === 'owner') {
        return this[prop]
        //... restart()
        //... chai.expect(p.owner).equal(handler.owner)
      } else if (prop === 'key') {
        return this.key_
        //... restart()
        //... chai.expect(p.key).equal(handler.key_)
      } else if (this.isOwnedKey(prop)) {
        return this[prop]
        //... restart()
        //... handler.keys_owned.forEach(K => {
        //...   chai.expect(p[K]).equal(handler[K])
        //... })
        //... handler.cover__.foo = 421
        //... chai.expect(p.foo).equal(handler.cover__.foo).equal(421)
      } else {
        return this.doGet(target, prop)
        //... restart()
        //... handler.doGet = function (target, prop) {
        //...   this.flag(2, prop)
        //... }
        //... chai.expect(p.foo).undefined
        //... flag.expect('12foo')
      }
      //>>>
    },
    set (target, prop, value) {
      //<<< mochai: set
      if (this.isOwnedKeyRO(prop)) {
        eYo.throw(`...${prop} = ... is forbidden for ${this.eyo.name} instances.`)
        return false
        //... restart()
        //... handler.keys_RO.forEach(K => {
        //...   chai.expect(() => (p[K] = 421)).throw()
        //... })
      } else if (prop === 'stored__') {
        return this.doSet(target, prop, value)
        //... restart()
        //... handler.doSet = function (target, prop, value) {
        //...   this.flag(2, prop, value)
        //... }
        //... p.stored__ = 421
        //... flag.expect('12stored__421')
      } else if (this.isOwnedKey(prop)) {
        this[prop] = value
        return true
        //... restart()
        //... handler.keys_owned.forEach(K => {
        //...   p[K] = 421
        //... })
      } else if (this.isOwnedKeyRW(prop)) {
        this.cover__[prop] = value
        return true
        //... restart()
        //... handler.keys_owned.forEach(K => {
        //...   p[K] = 421
        //... })
      } else {
        return this.doSet(target, prop, value)
        //... restart()
        //... let K = Symbol()
        //... p[K] = 421
        //... chai.expect(p[K]).undefined
        //... restart()
        //... handler.doSet = function (target, prop, value) {
        //...   this.flag(2, prop, value)
        //... }
        //... p.foo = 421
        //... flag.expect('12foo421')
      }
      //>>>
    },
    getOwnPropertyDescriptor (target, name) {
      //<<< mochai: getOwnPropertyDescriptor
      return Object.getOwnPropertyDescriptor(
        this.isOwnedKey(name) || name === eYo.$$.target
          ? this
          : target,
        name
      )
      //... restart()
      //... handler.keys_owned.forEach(K => {
      //...   chai.expect(Object.getOwnPropertyDescriptor(p, K)).eql(Object.getOwnPropertyDescriptor(handler, K))
      //... })
      //... chai.expect(Object.getOwnPropertyDescriptor(p, eYo.$$.target)).eql(Object.getOwnPropertyDescriptor(handler, eYo.$$.target))
      //... ;['foo', 'bar'].forEach(K => {
      //...   chai.expect(Object.getOwnPropertyDescriptor(p, K)).eql(Object.getOwnPropertyDescriptor(target, K))
      //... })
      //... Object.defineProperties(target, {
      //...   foo: {value: 421},
      //...   bar: {value: 666},
      //... })
      //... ;['foo', 'bar'].forEach(K => {
      //...   chai.expect(Object.getOwnPropertyDescriptor(p, K)).eql(Object.getOwnPropertyDescriptor(target, K))
      //... })
      //>>>
    },
    defineProperty (target, key, descriptor) {
      //<<< mochai: defineProperty
      if (this.isOwnedKey(key) || key === eYo.$$.target) {
        Object.defineProperty(this, key, descriptor)
        return true
        //... restart()
        //... handler.keys_owned.forEach(K => {
        //...   p[K] = 421
        //... })
      }
      if (this.isOwnedKeyRW(key)) {
        Object.defineProperty(this.cover__, key, descriptor)
        return true
        //... restart()
        //... handler.keys_RW.forEach(K => {
        //...   p[K] = 421
        //... })
      }
      eYo.throw(`${this.eyo.name} instance: can't define property ${key.toString ? key.toString() : key}`)
      // return false
      //... restart()
      //... ;['foo', 'bar'].forEach(K => {
      //...   chai.expect(() => {
      //...     Object.defineProperty(p, K, {value: 421})
      //...   }).throw()
      //... })
      //>>>
    },
    deleteProperty (target, prop) {
      //<<< mochai: deleteProperty
      let x = this.isOwnedKey(prop) ? this : this.cover__
      let ans = eYo.objectHasOwnProperty(x, prop)
      if (ans) {
        delete x[prop]
      }
      return ans
      //... handler.keys_RW.forEach(K => {
      //...   restart()
      //...   delete p[K]
      //...   chai.expect(p[K]).undefined
      //... })
      //... handler.keys_owned.forEach(K => {
      //...   restart()
      //...   delete p[K]
      //...   chai.expect(p[K]).undefined
      //... })
      //>>>
    },
    isOwnedKeyRO (key) {
      return this.keys_RO.includes(key)
    },
    isOwnedKeyRW (key) {
      return this.keys_RW.includes(key)
    },
    isOwnedKey (key) {
      return this.keys_owned.includes(key)
    },
    doGet (target, prop) { // eslint-disable-line
      return eYo.NA
    },
    doSet (target, prop, value) { // eslint-disable-line
      return false
    },
    doDelete (target, prop) { // eslint-disable-line
      return false
    },
    //<<< mochai: do...
    //... restart()
    //... let s = Symbol()
    //... chai.expect(p[s]).undefined
    //... p[s] = 421
    //... chai.expect(p[s]).undefined
    //... delete p[s]
    //... chai.expect(p[s]).undefined
    //>>>
    //>>>
  }
  //>>>
})

eYo.mixinRO(eYo.p6y.handler.C9rBase_p, {
  keys_RO: [
    eYo.$$.target, // expose the proxy target
    eYo.$$.handler, // expose the proxy handler
    'owner', 'key', 'hasOwnProperty'
  ],
  keys_owned: [
    eYo.$previous, eYo.$next, 'owner__', 'key_',
  ],
  keys_RW: [
    eYo.observe.BEFORE, eYo.observe.DURING, eYo.observe.AFTER,
    'fireObservers', 'reset', 'reset_',
    'getValueRO', 'getValue', 'setValue', 
    'getStored', 'setStored', 'validate',
  ],
})

eYo.mixinFR(eYo.p6y._p, {
  /**
   * Declare the given alias to a property.
   * It was declared in a model like
   * `{aliases: { 'source.key': 'alias' } }`.
   * An alias is a property like object implemented using proxies.
   * We have different argument sets.
   * - `ans = ....aliasNew(key, owner, p6y: eYo.P6y)`: 
   * `ans.getValue()` <=> `p6y.getValue()`
   * `ans.setValue(x)` <=> `p6y.setValue(x)`
   * - `ans = ....aliasNew(key, owner, target_key: String)`: If `owner[target_key + '_p'])` is a property named `p6y`, 
   * `ans.getValue()` <=> `p6y.getValue()`
   * `ans.setValue(x)` <=> `p6y.setValue(x)`
   * otherwise
   * `ans.getValue()` <=> `p6y[target_key]`
   * `ans.setValue(x)` <=> `p6y[target_key] = x`
   * - `ans = ....aliasNew(key, owner, item_1: String, ... , item_n: String, target_key: String)`: If `owner[item_...][target_key + '_p'])` is a property names `p6y`, 
   * otherwise
   * `ans.getValue()` <=> `p6y[target_key]`
   * `ans.setValue(x)` <=> `p6y[target_key] = x`
   * otherwise
   * `ans.getValue()` <=> `p6y[item_...][target_key]`
   * `ans.setValue(x)` <=> `p6y[item_...][target_key] = x`
   * 
   * @param {String} key - The result will be `owner[key + '_p']`
   * @param {Object} owner - It may not be the same owner as the target property.
   * @param {String|eYo.P6y|Proxy} source - If it is a string, `target.value_[source + '_']` is used.
   * @param {String} [target_key] - When given, `target` is also a string
   */
  aliasNew (key, owner, ...$) {
    //<<< mochai: eYo.p6y.aliasNew, Proxy alias
    let target_key = $.pop()
    var handler, target$
    if ($.length) {
      //<<< mochai: $.length
      target$ = owner
      handler = eYo.p6y.handler.new({
        methods: {
          /**
           * The deep target: foo.chi for foo.chi.mee
           * @param {*} target 
           */
          nextTarget (t, item) {
            let p6y = t[item + '_p']
            return p6y
              ? p6y.getValue()
              : t[item + '_'] || t[item]
          },
          /**
           * The deep target: foo.chi for foo.chi.mee
           * @param {*} target 
           */
          deepTarget (t) {
            for (let item of $) {
              if (!(t = this.nextTarget(t, item))) {
                break
              }
            }
            return t
          },
          /**
           * Specific getter.
           * @param {eYo.P6y} target
           * @param {String|Symbol} prop - A property identifier.
           */
          doGet (target, prop) {
            //<<< mochai: doGet ()
            let t = this.deepTarget(target)
            if (t) {
              let p6y = t[target_key + '_p']
              if (p6y) {
                return p6y[prop]
              }
              return ((t = t[target_key + '_'] || t[target_key]))
                ? t[prop]
                : eYo.NA 
            }
            //... var alias = eYo.p6y.aliasNew('alias', onr, 'foo') // create the alias
            //... chai.expect(()=>alias.getValue()).throw()
            //... let foo_p = eYo.p6y.new('foo_p', onr) // create a p6y for the onr
            //... onr.foo_p = foo_p
            //... chai.expect(alias.getValue()).equal(foo_p.getValue())
            //... foo_p.setValue(421)
            //... chai.expect(alias.getValue()).equal(foo_p.getValue())
            //... let foo = eYo.o3d.new('foo', onr)
            //... foo_p.setValue(foo)
            //... chai.expect(alias.getValue()).equal(foo_p.getValue())
            //... var alias = eYo.p6y.aliasNew('alias', onr, 'foo', 'chi') // create the alias
            //... chai.expect(() => alias.getValue()).throw()
            //... let chi_p = eYo.p6y.new('chi_p', foo) // create a p6y for the onr
            //... foo.chi_p = chi_p
            //... chai.expect(alias.getValue()).equal(chi_p.getValue())
            //... chi_p.setValue(421)
            //... chai.expect(alias.getValue()).equal(chi_p.getValue())
            //... let chi = eYo.o3d.new('chi', foo)
            //... chi_p.setValue(chi)
            //... chai.expect(alias.getValue()).equal(chi_p.getValue())
            //... var alias = eYo.p6y.aliasNew('alias', onr, 'foo', 'chi', 'mee') // create the alias
            //... chai.expect(() => alias.getValue()).throw()
            //... let mee_p = eYo.p6y.new('mee_p', chi) // create a p6y for the chi
            //... chi.mee_p = mee_p
            //... chai.expect(alias.getValue()).equal(mee_p.getValue())
            //... mee_p.setValue(421)
            //... chai.expect(alias.getValue()).equal(mee_p.getValue())
            //>>>
          },
          /**
           * Specific setter.
           * @param {eYo.P6y} target 
           * @param {String|Symbol} prop 
           * @param {*} value 
           */
          doSet (target, prop, value) {
            //<<< mochai: doSet
            let t = this.deepTarget(target)
            if (t) {
              let p6y = t[target_key + '_p']
              if (p6y) {
                p6y[prop] = value
              } else {
                t[target_key + '_'] = value
              }
              return true 
            }
            return false
            //... var alias = eYo.p6y.aliasNew('alias', onr, 'foo') // create the alias
            //... chai.expect(()=>alias.setValue(421)).throw()
            //... let foo_p = eYo.p6y.new('foo_p', onr) // create a p6y for the onr
            //... onr.foo_p = foo_p
            //... alias.setValue(421)
            //... chai.expect(foo_p.getValue()).equal(421)
            //... let foo = eYo.o3d.new('foo', onr)
            //... alias.setValue(foo)
            //... chai.expect(foo_p.getValue()).equal(foo)
            //... var alias = eYo.p6y.aliasNew('alias', onr, 'foo', 'chi') // create the alias
            //... chai.expect(() => alias.setValue(421)).throw()
            //... let chi_p = eYo.p6y.new('chi_p', foo) // create a p6y for the onr
            //... foo.chi_p = chi_p
            //... alias.setValue(421)
            //... chai.expect(chi_p.getValue()).equal(421)
            //... let chi = eYo.o3d.new('chi', foo)
            //... alias.setValue(chi)
            //... chai.expect(chi_p.getValue()).equal(chi)
            //... var alias = eYo.p6y.aliasNew('alias', onr, 'foo', 'chi', 'mee') // create the alias
            //... chai.expect(() => alias.setValue(421)).throw()
            //... let mee_p = eYo.p6y.new('mee_p', chi) // create a p6y for the chi
            //... chi.mee_p = mee_p
            //... alias.setValue(421)
            //... chai.expect(mee_p.getValue()).equal(421)
            //>>>
          },
          /**
           * Specific deleter
           * @param {eYo.P6y} target 
           * @param {String|Symbol} prop 
           */
          // eslint-disable-next-line no-unused-vars
          doDelete (target, prop) {
            return false
          },
        },
      }, key, owner)
      //>>>
    } else {
      if (eYo.isStr(target_key)) {
        //<<< mochai: eYo.isStr(target_key)
        //... var bar_p = eYo.p6y.new({
        //...   value: 421,
        //... }, 'bar', onr)
        //... var target = eYo.o3d.new('target', onr)
        //... target.bar_p = bar_p
        //... var bar_alias = eYo.p6y.aliasNew('foo', target, 'bar')
        //... chai.expect(bar_alias.value).equal(421)
        //... bar_alias.value_ = 666
        //... chai.expect(bar_p.value).equal(666)
        let target_key_p = target_key + '_p'
        target$ = owner
        handler = eYo.p6y.handler.new({
          methods: {
            /**
             * Specific getter.
             * @param {eYo.P6y} target 
             * @param {String|Symbol} prop 
             */
            doGet (target, prop) {
              let p6y = target[target_key_p]
              return p6y ? p6y[prop] : eYo.NA
            },
            /**
             * Specific setter.
             * @param {eYo.P6y} target 
             * @param {String|Symbol} prop 
             * @param {*} value 
             */
            doSet (target, prop, value) {
              let p6y = target[target_key_p]
              if (eYo.isDef(p6y)) {
                p6y[prop] = value
                return true
              }
              return !!value
            },
            /**
             * Specific deleter
             * @param {eYo.P6y} target 
             * @param {String|Symbol} prop 
             */
            doDelete (target, prop) {
              let p6y = target[target_key_p]
              if (p6y) {
                delete p6y[prop]
                return true
              }
              return false
            },    
          },
        }, key, owner)
        //>>>
      } else if (eYo.isaP6y(target_key) || eYo.isDef(target_key = target_key[eYo.$$.target])) {
        //<<< mochai: eYo.isaP6y(target_key)...
        //... var source = eYo.p6y.new({
        //...   value: 421,
        //... }, 'bar', onr)
        //... var alias = eYo.p6y.aliasNew('p', onr, source)
        //... // key
        //... eYo.objectHasOwnProperty(chai.expect(alias, 'key')).true
        //... chai.expect(alias.key).equal('p')
        //... chai.expect(() => alias.key = 0).throw()
        //... alias.key_ = 'foo'
        //... chai.expect(alias.key).equal('foo')
        //... chai.expect(source.key).equal('bar')
        //... source.key_ = 'barZ'
        //... chai.expect(alias.key).equal('foo')
        //... // owner
        //... chai.expect(alias.owner).equal(onr)
        //... chai.expect(() => alias.owner = 0).throw()
        //... alias.owner__ = 0
        //... chai.expect(alias.owner).equal(0)
        //... chai.expect(source.owner).equal(onr)
        //... source.owner__ = eYo.c9r.new('onr')
        //... chai.expect(alias.owner).equal(0)
        //... alias = eYo.p6y.aliasNew('p', onr, source)
        //... eYo.objectHasOwnProperty(chai.expect(alias, eYo.$next)).false
        //... Object.defineProperties(alias, {
        //...   [eYo.$next]: {
        //...     value: 1,
        //...     configurable: true,
        //...   }
        //... })
        //... eYo.objectHasOwnProperty(chai.expect(alias, eYo.$next)).true
        //... chai.expect(alias[eYo.$next]).equal(1)
        //... chai.expect(source[eYo.$next]).not.equal(1)
        //... chai.expect(() => alias[eYo.$next] = 2).throw()
        //... Object.defineProperties(alias, {
        //...   [eYo.$next]: {
        //...     value: 2,
        //...     configurable: true,
        //...   }
        //... })
        //... chai.expect(alias[eYo.$next]).equal(2)
        //... alias = eYo.p6y.aliasNew('p', onr, source)
        //... Object.defineProperties(source, {
        //...   [eYo.$next]: {
        //...     value: 1,
        //...     configurable: true,
        //...   }
        //... })
        //... eYo.objectHasOwnProperty(chai.expect(source, eYo.$next)).true
        //... chai.expect(source[eYo.$next]).equal(1)
        //... eYo.objectHasOwnProperty(chai.expect(alias, eYo.$next)).false
        //... chai.expect(alias[eYo.$next]).not.equal(1)
        handler = eYo.p6y.handler.new({
          methods: {
            doGet (target, prop) {
              return target[prop]
            },
            doSet (target, prop, value) {
              target[prop] = value
              return true
            },
            doDelete (target, prop) {
              if (this.keys_owned.includes(prop)) {
                delete this[prop]
              } else {
                this.cover__.delete(prop)
              }
              return true
            },    
          },
        }, key, owner)
        target$ = target_key
        //>>>
      } else {
        eYo.throw(`eYo.p6y.aliasNew: bad target ${target_key}`)
        //<<< mochai: throw
        //... chai.expect(() => eYo.p6y.aliasNew('foo', onr, 421)).throw()
        //... chai.expect(() => eYo.p6y.aliasNew('foo', onr)).throw()
        //>>>
      }
    }
    return handler.getProxy(target$)
    //>>>
  },
})
//>>>

//<<< mochai: Utilities

eYo.P6y[eYo.$].observeEnhanced()

eYo.mixinFR(eYo.P6y_p, {
  /**
   * Get the stored value. May be overriden by the model's `get_` key.
   * @private
   */
  __getStored () {
    return this.stored__
  },
  /**
   * Set the value of the receiver.
   * This can be overriden by the model's `set_` key.
   * The computed properties do not store values on their own.
   * @param {*} after - the new value after the change.
   * @return {*} An object with keys before and after...
   */
  __setStored (after) {
    let before = this.stored__
    if (before && before[eYo.$p6y] === this) {
      // resign ownership
      before[eYo.$p6y] = eYo.NA
    }
    this.stored__ = after
    if (eYo.isaC9r(after) && !eYo.isDef(after[eYo.$p6y])) {
      // gain ownership
      after[eYo.$p6y] = this
    }
    return {before, after}
  },
  /**
   * Iterator.
   */
  ownedForEach: eYo.doNothing,
})

Object.assign(eYo.P6y_p, {
  /**
   * Get the stored value. May be overriden by the model's `get_` key.
   * @private
   */
  getStored: eYo.P6y_p.__getStored,
  /**
   * Set the value of the receiver.
   * This can be overriden by the model's `set_` key.
   * The computed properties do not store values on their own.
   * @param {*} after - the new value after the change.
   * @return {*} An object with keys before and after...
   */
  setStored: eYo.P6y_p.__setStored,
  /**
   * Returns the starting value.
   * Default implementation returns undefined
   * and might be overriden at runtime.
   */
  getValueStart: eYo.doNothing,
  /**
   * Get the value, may be overriden by the model's `get` key.
   * Default implementation forwards to `getStored`
   * and might be overriden at runtime. 
   * @private
   */
  getValue () {
    return this.getStored()
  },
  /**
   * Readonly getter. Used to manage copy.
   * Default implementation forwards to `getValue`
   * and might be overriden at runtime.
   */
  getValueRO () {
    return this.getValue()
  },
  /**
   * Set the value of the receiver.
   * This can be overriden by the model's `set` key.
   * @param {*} after - the new value after the change.
   * @return {*} An object with keys before and after...
   */
  setValue (after) {
    var before = this.getStored()
    after = this.validate(before, after)
    if (eYo.isVALID(after)) {
      if (before !== after) {
        var f = this.willChange
        if (!eYo.isF(f)) {
          console.error('BREAK HERE!!!')
          f = this.willChange
        }
        this.willChange(before, after)
        try {
          this.setStored(after)
          this.atChange(before, after)
        } finally {
          this.didChange(before, after)
        }
      }
      return {before, after}
    }
  },
})

/**
 * The parent of the property is the object who declares the property,
 * as part of its `properties:` section of its model.
 * The owner is the object who creates the property with `new`.
 * In general both are equal.
 * @type {Object} parent
 */
Object.defineProperties(eYo.P6y_p, {
  parent: eYo.descriptorR({$ () {
    return this.owner
  }}.$),
  //<<< mochai: parent
  //... var foo_p = eYo.p6y.new('foo', onr)
  //... chai.expect(foo_p.parent).equal(onr)
  //>>>
  /**
   * @property {*} value - computed
   */
  value_: {
    get () {
      return this.getValue()
    },
    set (after) {
      this.setValue(after)
    }
  },
  value__: {
    get () {
      return this.getStored()
    },
    set (after) {
      this.setStored(after)
    }
  },
  //<<< mochai: eYo.P6y_p properties
  //... let p6y = eYo.p6y.new('p6y', onr)
  //... chai.expect(p6y.value).equal(p6y.value_).equal(p6y.value__).equal(eYo.NA)
  //... chai.expect(() => p6y.value = 421).throw()
  //... p6y.value_ = 421
  //... chai.expect(p6y.value).equal(p6y.value_).equal(p6y.value__).equal(421)
  //... p6y.value__ = 666
  //... chai.expect(p6y.value).equal(p6y.value_).equal(p6y.value__).equal(666)
  //>>>
})
//>>>

