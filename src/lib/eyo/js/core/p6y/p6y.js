/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.p6y.BaseC9r is a class for a property controller.
 * It extends the JS property design by providing some hooks before, during and after changes, allowing observers to specify actions.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('do')
eYo.require('observe')

eYo.forward('xre')

// ANCHOR eYo.p6y
/**
 * @name{eYo.p6y}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'p6y')

// ANCHOR eYo.p6y.BaseC9r_p
/**
 * @name{eYo.p6y.BaseC9r_p}
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
//<<< mochai: P6y
eYo.p6y.makeBaseC9r(true, {
  init () {
    this.stored__ = eYo.NA // this may be useless in some situations
    Object.defineProperties(this, {
      value: eYo.descriptorR({
          lazy () {
            return `....value = ... forbidden for ${this.eyo.name} instances.`
          },
        },
        eYo.p6y.BaseC9r_p._valueGetter
      ),
    })
    //<<< eYo.p6y.BaseC9r_p, init
    //... let p6y = new eYo.p6y.BaseC9r('foo', onr)
    //... chai.expect(p6y.key).equal('foo')
    //... chai.expect(p6y.owner).equal(onr)
    //... chai.expect(p6y.stored__).undefined
    //... chai.expect(() => p6y.value = 0).throw()
    //>>>
  },
  dispose (...$) {
    this.removeObservers()
    this._disposeStored(...$)
  },
  methods: {
    /**
     * Fallback to validate the value of the property;
     * Default implementation forwards to an eventual `fooValidate` method
     * of the owner, where `foo` should be replaced by the key of the receiver.
     * @param {Object} before
     * @param {Object} after
     */
    validate (before, after) {
      //<<< mochai: eYo.p6y.BaseC9r_p.validate (before, after)
      let f_o = this.key && this.owner && this.owner[this.key + 'Validate']
      return eYo.isF(f_o) ? f_o.call(this.owner, before, after) : after
      //... let p6y = new eYo.p6y.BaseC9r('p6y', onr)
      //... chai.expect(p6y.validate(1, 2)).equal(2)
      //... onr.p6yValidate = function (before, after) {
      //...   this.flag(before, after)
      //...   return after
      //... }
      //... onr.flag = function (before, after) {
      //...   flag.push(before, after)
      //... }
      //... chai.expect(p6y.validate(1, 2)).equal(2)
      //... flag.expect(12)
      //>>>
    },
    /**
     * Object disposer.
     * Manage collections, and takes care of ownership.
     * @param {Object} what
     */
    __disposeStored (what, ...$) {
      //<<< mochai: eYo.p6y.BaseC9r_p.__disposeStored(what, ...$)
      if (eYo.isaC9r(what)) {
        what.eyo_p6y === this && what.dispose(...$)
        //... var p6y = new eYo.p6y.BaseC9r('p6y', onr)
        //... what = eYo.c9r.new({
        //...   dispose (...$) {
        //...     flag.push(...$)
        //...   }
        //... })
        //... flag.reset()
        //... what.eyo_p6y = p6y
        //... p6y.__disposeStored(what, 1, 2, 3)
        //... flag.expect(123)
      } else if (eYo.isRA(what)) {
        try {
          what.forEach(x => this.__disposeStored(x, ...$))
        } finally {
          what.length = 0
        }
        //... what = []
        //... p6y.__disposeStored(what, 1, 2, 3)
        //... flag.expect(0)
        //... var value_1 = eYo.c9r.new({
        //...   dispose (...$) {
        //...     flag.push(1, ...$)
        //...   }
        //... })
        //... value_1.eyo_p6y = p6y
        //... what = [value_1]
        //... p6y.__disposeStored(what, 1, 2, 3)
        //... flag.expect(1123)
        //... var value_1 = eYo.c9r.new({
        //...   dispose (...$) {
        //...     flag.push(1, ...$)
        //...   }
        //... })
        //... value_1.eyo_p6y = p6y
        //... var value_2 = eYo.c9r.new({
        //...   dispose (...$) {
        //...     flag.push(2, ...$)
        //...   }
        //... })
        //... value_2.eyo_p6y = p6y
        //... what = [value_1, value_2]
        //... p6y.__disposeStored(what, 1, 2, 3)
        //... flag.expect(11232123)
      } else if (what) {
        if (what instanceof Map) {
          for (let v of what.values()) {
            this.__disposeStored(v, ...$)
          }
          what.clear()
          //... what = new Map([])
          //... p6y.__disposeStored(what, 1, 2, 3)
          //... flag.expect(0)
          //... var value_1 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(1, ...$)
          //...   }
          //... })
          //... value_1.eyo_p6y = p6y
          //... what = new Map([[1, value_1]])
          //... p6y.__disposeStored(what, 1, 2, 3)
          //... flag.expect(1123)
          //... var value_1 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(1, ...$)
          //...   }
          //... })
          //... value_1.eyo_p6y = p6y
          //... var value_2 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(2, ...$)
          //...   }
          //... })
          //... value_2.eyo_p6y = p6y
          //... what = new Map([[1, value_1], [2, value_2]])
          //... p6y.__disposeStored(what, 1, 2, 3)
          //... flag.expect(11232123)
        } else {
          Object.keys(what).forEach(k => {
            if (what.hasOwnProperty(k)) {
              this.__disposeStored(what[k], ...$)
            }
          })
          //... what = {}
          //... p6y.__disposeStored(what, 1, 2, 3)
          //... flag.expect(0)
          //... var value_1 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(1, ...$)
          //...   }
          //... })
          //... value_1.eyo_p6y = p6y
          //... what = {'1': value_1}
          //... p6y.__disposeStored(what, 1, 2, 3)
          //... flag.expect(1123)
          //... var value_1 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(1, ...$)
          //...   }
          //... })
          //... value_1.eyo_p6y = p6y
          //... var value_2 = eYo.c9r.new({
          //...   dispose (...$) {
          //...     flag.push(2, ...$)
          //...   }
          //... })
          //... value_2.eyo_p6y = p6y
          //... what = {'1': value_1, '2': value_2}
          //... p6y.__disposeStored(what, 1, 2, 3)
          //... flag.expect(11232123)
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
    _disposeStored (...args) {
      let v = this.stored__
      if (eYo.isaC9r(v) && v.eyo_p6y === this) {
        try {
          this.__disposeStored(v, ...args)
        } finally {
          this.stored__ = eYo.NA
        }
      }
    },
    /**
     * recycle of the value.
     * @private
     */
    recycle (...args) {
      //<<< mochai: eYo.p6y.BaseC9r_p.recycle
      let before = this.stored__
      if (eYo.isDef(before)) {
        try {
          this.validate = eYo.doReturn2nd
          let dispose = before.eyo_p6y === this
          this.setValue(eYo.NA)
          if (dispose) {
            before.eyo_p6y = eYo.NA
            before.dispose(...args)
          }
        } finally {
          delete this.validate
        }
      }
      //... var p6y = new eYo.p6y.BaseC9r('p6y', onr)
      //... what = eYo.c9r.new({
      //...   dispose (...$) {
      //...     flag.push(1, ...$)
      //...   }
      //... })
      //... flag.reset()
      //... p6y.value_ = what
      //... chai.expect(p6y.value).equal(what)
      //... p6y.recycle()
      //... flag.expect(1)
      //... chai.expect(what.dispose).equal(eYo.doNothing)
      //... chai.expect(p6y.value).equal(eYo.NA)
      //>>>
    },
    /**
     * Set the value of the receiver.
     * This can be overriden by the model's `reset` key.
     * @param {*} after - the new value after the change.
     */
    reset () {
      var ans = this.getStartValue()
      this.setValue(ans)
      return ans
      //<<< mochai: eYo.p6y.BaseC9r_p.reset
      //... let p6y = new eYo.p6y.BaseC9r('foo', onr)
      //... chai.expect(p6y.value).undefined
      //... p6y.value_ = 421
      //... chai.expect(p6y.value).equal(421)
      //... chai.expect(p6y.reset()).undefined
      //... chai.expect(p6y.value).undefined
      //>>>
    },
  },
})

eYo.mixinR(eYo._p, {
  /**
   * Whether the argument is a property instance.
   * @param {*} what 
   */
  isaP6y (what) {
    return !!what && what instanceof eYo.p6y.BaseC9r
  }
  //<<< mochai: eYo.isaP6y
  //... chai.assert(eYo.isaP6y)
  //... chai.expect(eYo.isaP6y()).false
  //... chai.expect(eYo.isaP6y(eYo.NA)).false
  //... chai.expect(eYo.isaP6y(421)).false
  //... chai.expect(eYo.isaP6y(new eYo.p6y.BaseC9r('foo', onr))).true
  //>>>
}, false)

/**
 * Id is used when observing
 * @name {eYo.p6y.BaseC9r_p.Id}
 */
eYo.mixinR(eYo.p6y.BaseC9r_p, {
  Id: 'P6y',
  //<<< mochai: Id
  //... chai.expect((new eYo.p6y.BaseC9r('foo', onr)).Id).equal('P6y')
  //>>>
})

//<<< mochai: modelFormat
//... var model = {
//...   foo: {
//...     get () {},
//...   },
//... }
//... let mf = eYo.p6y.BaseC9r.eyo.modelFormat
//... model = mf.validate(model)
//... chai.assert(eYo.isF(model.foo.get))
eYo.p6y.BaseC9r.eyo.finalizeC9r([
  'source',
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
    get_: eYo.model.descriptorF(),
    set_: eYo.model.descriptorF(),
    reset: eYo.model.descriptorF(),
    //... ;['get_', 'set_', 'reset'].forEach(K => {
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
    eYo.observe.BEFORE,
    eYo.observe.DURING,
    eYo.observe.AFTER
  ].forEach(k => m[k] = eYo.model.descriptorForFalse())
  return m
  //... ;[
  //...   'dispose',
  //...   'get',
  //...   'set',
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

eYo.more.enhanceO3dValidate(eYo.p6y.BaseC9r.eyo, 'p6y', true)

// ANCHOR eYo.p6y.new

/**
 * For subclassers.
 * Model handlding 
 * @param {String} key
 * @param {Object} [model]
 */
eYo.p6y.Dlgt_p.modelHandle = function (key, model) {
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
  // if reset_m is purely computed, no lazy nor value is allowed.
  if (io.pure_reset) {
    eYo.isNA(value_m) && eYo.isNA(lazy_m) || eYo.throw(`Bad model (${this.name}/${key}): unexpected value|lazy due to pure reet`)
    //...   reset () {},
    //...   value: 123,
    //... },{
    //...   reset () {},
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
  //... p6y.eyo.modelHandleCheck('foo', model)
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
  let K = 'reset'
  let f_m = model[K]
  if (io.pure_reset) {
    _p.getStartValue = eYo.noGetter(function () {
      return `No getStartValue for pure computed reset (${this.name}.${key})`
    })
    //... chai.expect(() => eYo.p6y.new({
    //...   reset () {},
    //... }, 'foo', onr).getStartValue()).throw()
    _p[K] = eYo.decorate.reentrant(K, function () {
      return f_m.call(this.owner)
    })
    //... var p6y = eYo.p6y.new({
    //...   reset () {
    //...     this.flag(2)
    //...     return 421
    //...   }
    //... }, 'foo', onr)
    //... onr.eyo.C9r_p.flag = function (...$) {
    //...   flag.push(1, ...$)
    //... }
    //... chai.expect(p6y.reset()).equal(421)
    //... flag.expect(12)
    //... p6y.eyo.C9r_p.reset = function () {
    //...   flag.push(3)
    //... }
    //... p6y.eyo.modelHandleStart('foo', p6y.model)
    //... p6y.reset()
    //... flag.expect(12)
  } else if (io.reset) {
    let f_p = _p[K]
    //... chai.assert(eYo.p6y.BaseC9r_p.reset)
    _p[K] = eYo.decorate.reentrant(K, function () {
      return f_m.call(this.owner, f_p.bind(this))
    })
    //... var p6y = eYo.p6y.new({
    //...   reset (builtin) {
    //...     this.flag(2)
    //...     return builtin()
    //...   }
    //... }, 'foo', onr)
    //... onr.eyo.C9r_p.flag = function (...$) {
    //...   flag.push(1, ...$)
    //... }
    //... chai.expect(p6y.reset()).undefined
    //... flag.expect(12)
    //... p6y.eyo.C9r_p.reset = function () {
    //...   flag.push(3)
    //... }
    //... p6y.eyo.modelHandleStart('foo', p6y.model)
    //... p6y.reset()
    //... flag.expect(123)
  }
  let value_m = model.value
  if (eYo.isDef(value_m)) {
    _p.getStartValue = function () {
      return value_m.call(this.owner)
    }
    //... ;['value', 'lazy'].forEach(K => {
    //...   var p6y = eYo.p6y.new({
    //...    [K]: 421
    //...   }, 'foo', onr)
    //...   chai.expect(p6y.getStartValue()).equal(421)
    //... })
  }
  let lazy_m = model.lazy
  if (eYo.isDef(lazy_m)) {
    model._starters.push(object => {
      object.getStored = function () {
        delete this.getStored
        var ans = this.getStored()
        if (eYo.isNA(ans)) {
          this.setStored(ans = this.getStartValue())
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
    //... chai.expect(p6y.reset()).equal(421)
    //... p6y = eYo.p6y.new({
    //...   lazy: 421,
    //...   willChange (before, after) {
    //...     flag.push(before, after)
    //...   }
    //... }, 'foo', onr)
    //... chai.expect(p6y.getStartValue()).equal(421)
    //... chai.expect(p6y.stored__).undefined
    //... chai.expect(p6y.value__).equal(421)
    //... flag.expect(0) // change events not fired
    //... p6y.value_ = 666
    //... flag.expect(421666) // change events fired
    //... p6y.value_ = 666
    //... chai.expect(p6y.value).equal(666)
    //... chai.expect(p6y.reset()).equal(421)
  } else if (eYo.isDef(value_m)) {
    model._starters.push(object => {
      object.setStored(object.getStartValue())
    })
    //... var p6y = eYo.p6y.new({
    //...  value: 421
    //... }, 'foo', onr)
    //... chai.expect(p6y.value).equal(421)
    //... p6y.value_ = 666
    //... chai.expect(p6y.value).equal(666)
    //... chai.expect(p6y.reset()).equal(421)
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
  //... chai.assert(eYo.p6y.BaseC9r_p._disposeStored)
  //... let ns = eYo.p6y.makeNS()
  //... ns.makeBaseC9r()
  //... ns.BaseC9r_p._disposeStored = function(...$) {
  //...   this.owner.flag(1, ...$)
  //... }
  //... var p6y = ns.new('foo', onr)
  //... p6y.dispose(3)
  //... flag.expect(213)
  if (model.dispose === eYo.doNothing) {
    _p[K] = eYo.doNothing
    //... var p6y = ns.new({
    //...   dispose: false
    //... }, 'foo', onr)
    //... p6y.dispose(2)
    //... flag.expect(0)
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
          _p[when] = eYo.decorate.reentrant(when,function (before, after) {
            when_m.call(this.owner, before, after)
            when_p.call(this, before, after)
          })
          //... var ns = eYo.p6y.makeNS()
          //... ns.makeBaseC9r()
          //... ns.BaseC9r_p[when] = function (before, after) {
          //...   this.owner.flag(5, before, after)
          //... }
          //... var p6y = ns.new({
          //...   [when]: function (before, after) {
          //...     this.flag(1, before, after)
          //...   },
          //... }, 'foo', onr)
          //... p6y.value__ = 3
          //... p6y.value_ = 4
          //... flag.expect(21342534)
        } else {
          _p[when] = eYo.decorate.reentrant(when,function (before, after) {
            when_m.call(this.owner, before, after)
          })
          //... var ns = eYo.p6y.makeNS()
          //... ns.makeBaseC9r()
          //... var p6y = ns.new({
          //...   [when]: function (before, after) {
          //...     this.flag(1, before, after)
          //...   },
          //... }, 'foo', onr)
          //... p6y.value__ = 3
          //... p6y.value_ = 4
          //... flag.expect(2134)
        }
      } else {
        if (when_p) {
          _p[when] = eYo.decorate.reentrant(when,function (before, after) {
            when_m.call(this.owner, after)  
            when_p.call(this, before, after)
          })
          //... var ns = eYo.p6y.makeNS()
          //... ns.makeBaseC9r()
          //... ns.BaseC9r_p[when] = function (before, after) {
          //...   this.owner.flag(5, before, after)
          //... }
          //... var p6y = ns.new({
          //...   [when]: function (after) {
          //...     this.flag(1, after)
          //...   },
          //... }, 'foo', onr)
          //... p6y.value__ = 3
          //... p6y.value_ = 4
          //... flag.expect(2142534)
        } else {
          _p[when] = eYo.decorate.reentrant(when,function (before, after) {
            when_m.call(this.owner, after)
          })
          //... var ns = eYo.p6y.makeNS()
          //... ns.makeBaseC9r()
          //... var p6y = ns.new({
          //...   [when]: function (after) {
          //...     this.flag(1, after)
          //...   },
          //... }, 'foo', onr)
          //... p6y.value__ = 3
          //... p6y.value_ = 4
          //... flag.expect(214)
        }
      }
    }
    //... })
  })
  //>>>
}
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
  let getK = 'getValue'
  let _p = this.C9r_p
  let get_p = _p[getK]
  //... chai.assert(eYo.p6y.BaseC9r_p.getValue)
  let get_m = model.get // from model => suffix = '_m' and `@this` === property owner
  // get_m is computed means that it is meant to replace the standard getter
  if (get_m === eYo.doNothing) {
    _p[getK] = eYo.noGetter(function () {
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
    _p.getStored = _p[getK] = eYo.decorate.reentrant(getK, function () {
      return get_m.call(this.owner)
    })
    //... var p6y = eYo.p6y.new({
    //...   get () {
    //...     flag.push(1)
    //...     return 421
    //...   },
    //... }, 'foo', onr)
    //... flag.reset()
    //... chai.expect(p6y.getValue()).equal(421)
    //... flag.expect(1)
    //... chai.expect(p6y.getStored()).equal(421)
    //... flag.expect(1)
    //... chai.expect(p6y.value).equal(421)
    //... flag.expect(1)
    //... chai.expect(p6y.value_).equal(421)
    //... flag.expect(1)
    //... chai.expect(p6y.value__).equal(421)
    //... flag.expect(1)
  } else if (io.get) {
    _p[getK] = eYo.decorate.reentrant(getK, function () {
      return get_m.call(this.owner, get_p.bind(this))
    })
    //... var p6y = eYo.p6y.new({
    //...   get (builtin) {
    //...     flag.push(1)
    //...     return this.flag(builtin())
    //...   },
    //... }, 'foo', onr)
    //... p6y.value_ = 3
    //... chai.expect(p6y.value).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value_).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.value__).equal(3)
    //... flag.expect(0)
    //... chai.expect(p6y.getValue()).equal(3)
    //... flag.expect(123)
    //... chai.expect(p6y.getStored()).equal(3)
    //... flag.expect(0)
  } else if (model.copy) {
    _p[getK] = eYo.p6y.BaseC9r_p.__getCopyValue
    //... eYo.p6y.new({
    //...   copy: true,
    //...   get (builtin) {
    //...     return builtin()
    //...   }  
    //... }, 'foo', onr)
    //... chai.expect(() => eYo.p6y.new({
    //...   copy: true,
    //...   get () {
    //...     return 421
    //...   }  
    //... }, 'foo', onr)).throw()
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
    _p[setK] = _p.setStored = eYo.decorate.reentrant(setK, function (after) {
      return set_m.call(this.owner, after)
    })
    //... var p6y = eYo.p6y.new({
    //...   set (after) {
    //...     this.flag(after)
    //...     return 421
    //...   }
    //... }, 'foo', onr)
    //... chai.expect(p6y.setValue(666)).equal(421)
    //... flag.expect(2666)
    //... p6y.value_ = 345
    //... flag.expect(2345)
    //... p6y.value_ = 421
    //... flag.expect(2421)
  } else if (io.set) {
    let set_p = _p[setK]
    if (set_m.length > 1) {
      if (XRegExp.exec(set_m.toString(), eYo.xre.function_stored_after)) {
          _p[setK] = eYo.decorate.reentrant(setK, function (after) {
            let before = this.stored__
            let ans = set_m.call(this.owner, this.stored__, after)
            return eYo.isDef(ans) ? ans : before
        })
        //... var p6y = eYo.p6y.new({
        //...   set (stored, after) {
        //...     this.flag(after)
        //...     return stored
        //...   }
        //... }, 'foo', onr)
        //... p6y.stored__ = 421
        //... chai.expect(p6y.setValue(666)).equal(421)
        //... flag.expect(2666)
      } else {
        _p[setK] = eYo.decorate.reentrant(setK, function (after) {
          let before = this.stored__
          let ans = set_m.call(this.owner, after => {
            return set_p.call(this, after)
          }, after)
          return eYo.isDef(ans) ? ans : before
        })
        //... var p6y = eYo.p6y.new({
        //...   set (after) {
        //...     this.flag(after)
        //...     return after
        //...   }
        //... }, 'foo', onr)
        //... p6y.stored__ = 421
        //... chai.expect(p6y.setValue(666)).equal(666)
        //... flag.expect(2666)
      }
    }
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
  if (io.pure_get_) {
    _p[getK] = eYo.decorate.reentrant(getK, function () {
      return get__m.call(this.owner)
    })
    //... var p6y = eYo.p6y.new({
    //...   get_ () {
    //...     flag.push(123)
    //...     return 421
    //...   },
    //... }, 'p6y', onr)
    //... chai.expect(p6y.getStored()).equal(421)
    //... flag.expect(123)
  } else if (io.get_) {
    _p[getK] = eYo.decorate.reentrant(getK, function () {
      return get__m.call(this.owner, () => this.__getStored())
    })
    //... var p6y = eYo.p6y.new({
    //...   get_ (builtin) {
    //...     let stored = builtin()
    //...     flag.push(stored)
    //...     return stored
    //...   },
    //... }, 'p6y', onr)
    //... p6y.stored__ = 421
    //... chai.expect(p6y.getStored()).equal(421)
    //... flag.expect(421)
  }
  let setK = 'setStored'
  let set__m = model.set_
  if (io.pure_set_) {
    _p[setK] = eYo.decorate.reentrant(setK, function (after) {
      return set__m.call(this.owner, after)
    })
    //... var p6y = eYo.p6y.new({
    //...   set_ (after) {
    //...     flag.push(after + 1)
    //...   },
    //... }, 'p6y', onr)
    //... p6y.setStored(1)
    //... flag.expect(2)
  } else if (io.set_) {
    _p[setK] = eYo.decorate.reentrant(setK, function (after) {
      return set__m.call(this.owner, $after => {this.__setStored($after)}, after)
    })
    //... var p6y = eYo.p6y.new({
    //...   set_ (builtin, after) {
    //...     builtin(after)
    //...     flag.push(after + 1)
    //...   },
    //... }, 'p6y', onr)
    //... p6y.setStored(1)
    //... flag.expect(2)
    //... chai.expect(p6y.getStored()).equal(1)
  }
  //>>>
}

// ANCHOR eYo.p6y.List

/**
 * Maintains a list of properties.
 * `eYo.o4t.BaseC9r` instances maintains properties by keys.
 * Here properties are maintained by index.
 * @name{eYo.p6y.List}
 * @constructor
 */
eYo.o3d.makeC9r(eYo.p6y, 'List', {
  init () {
    this.list__ = []
    this.values = new Proxy(this.list__, {
      get(target, prop) {
        if (!isNaN(prop)) {
          prop = parseInt(prop, 10)
          if (prop < 0) {
            prop += target.length
          }
          let p = target[prop]
          return p && p.value
        }
        throw new Error('`values` attribute only accepts indexed accessors')
      }
    })
    this.p6yByKey = new Proxy(this.list__, {
      get(target, prop) {
        if (eYo.isStr(prop)) {
          return target[prop]
        }
        throw new Error('`properties` attribute only accepts indexed accessors')
      }
    })
    this.propertyByIndex = new Proxy(this.list__, {
      get(target, prop) {
        if (!isNaN(prop)) {
          prop = parseInt(prop, 10)
          if (prop < 0) {
            prop += target.length
          }
          return target[prop]
        }
        throw new Error('`properties` attribute only accepts indexed accessors')
      }
    })
    this.splice(0, 0, ...$)
  },
  dispose(...args) {
    for (const p of this.list__) {
      p.dispose(...args)
    }
    this.list__.length = 0
  }
})

eYo.p6y.List.eyo.finalizeC9r()

;(() => {
  let _p = eYo.p6y.List_p

  Object.defineProperties(_p, {
    length: {
      get () {
        return this.list__.length
      },
      set (after) {
        this.list__.length = after
      }
    },
  })
 
  /**
   * Insert something at index i.
   * @param {Integer} start - The index at which to start changing the list.
   * @param {...} item - items to be inserted.
   */
  _p.splice = function (start, deleteCount,  ...items) {
    if (start < 0) {
      start = this.list__.length - start
    }
    let ans = this.list__.splice(start, deleteCount).map(p => p.value)
    items = items.map(item => eYo.p6y.new({
      value: item
    }, '', this))
    this.list__.splice(start, 0, ...items)
    return ans
  }

})()

/**
 * The @@iterator method
 */
eYo.p6y.List.eyo_p.initInstance = function (instance) {
  eYo.p6y.List.eyo.super.initInstance(instance)
  instance[Symbol.iterator] = function* () {
    for (var p of this.list__) {
      yield p.value
    }
  }
}

/**
 * Handler namespace for property proxies.
 * @name {eYo.p6y.handler}
 * @namespace
 */
eYo.o3d.makeNS(eYo.p6y, 'handler')

/**
 * Abstract constructor for proxy handlers.
 * A property proxy aims to be transparent.
 * @name {eYo.p6y.handler.BaseC9r}
 * @constructor
 */
eYo.p6y.handler.makeBaseC9r({
  //<<< mochai: eYo.p6y.handler.BaseC9r
  //... var target, handler, p
  //... let restart = () => {
  //...   target = eYo.o3d.new('bar', onr)
  //...   handler = eYo.p6y.handler.new('foo', onr, target)
  //...   p = new Proxy(target, handler)
  //... }
  init (key, owner, target) {
    if (target && !eYo.isaO3d(target)) {
      console.error('BREAK HERE!!!')
    }
    !target || eYo.isaO3d(target) || eYo.throw(`${this.eyo.name}.init: target is not owned ${target}`)
    this.target__ = target
    //... restart()
    //... chai.expect(handler.target__).equal(target)
  },
  dispose () {
    this.target__ = eYo.NA
  },
  methods: {
    get (target, prop) {
      if (['owner', '__target', 'hasOwnProperty'].includes(prop)) {
        return this[prop]
        //... restart()
        //... ;['owner', '__target', 'hasOwnProperty'].forEach(K => {
        //...   chai.expect(p[K]).equal(handler[K])
        //... })
      } else if (prop === 'key') {
        return this.key_
        //... restart()
        //... chai.expect(p.key).equal(handler.key_)
      } else if (prop === 'dispose') {
        return eYo.doNothing
        //... restart()
        //... chai.expect(p.dispose).equal(eYo.doNothing)
      } else if (this.isOwnedKey(prop) || this.hasOwnProperty(prop)) {
        return this[prop]
        //... restart()
        //... handler.keys_owned.forEach(K => {
        //...   chai.expect(p[K]).equal(handler[K])
        //... })
        //... handler.foo = 421
        //... chai.expect(p.foo).equal(handler.foo).equal(421)
      } else {
        return this.doGet(target, prop)
        //... restart()
        //... handler.doGet = function (target, prop) {
        //...   flag.push(prop)
        //... }
        //... chai.expect(p.foo).undefined
        //... flag.expect('foo')
      }
    },
    set (target, prop, value) {
      if (this.isOwnedROKey(prop)) {
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
        //...   flag.push(prop, value)
        //... }
        //... p.stored__ = 421
        //... flag.expect('stored__421')
      } else if (this.isOwnedKey(prop)) {
        this[prop] = value
        return true
        //... restart()
        //... handler.keys_owned.forEach(K => {
        //...   p[K] = 421
        //... })
      } else {
        return this.doSet(target, prop, value)
        //... restart()
        //... handler.doSet = function (target, prop, value) {
        //...   flag.push(prop, value)
        //... }
        //... p.foo = 421
        //... flag.expect('foo421')
      }
    },
    getOwnPropertyDescriptor (target, name) {
      return Object.getOwnPropertyDescriptor(
        this.isOwnedKey(name) || name === '__target'
        ? this
        : target,
        name
      )
      //... restart()
      //... handler.keys_owned.forEach(K => {
      //...   chai.expect(Object.getOwnPropertyDescriptor(p, K)).eql(Object.getOwnPropertyDescriptor(handler, K))
      //... })
      //... chai.expect(Object.getOwnPropertyDescriptor(p, '__target')).eql(Object.getOwnPropertyDescriptor(handler, '__target'))
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
    },
    defineProperty (target, key, descriptor) {
      if (this.isOwnedKey(key) || key === '__target') {
        Object.defineProperty(this, key, descriptor)
        return true
        //... restart()
        //... handler.keys_owned.forEach(K => {
        //...   p[K] = 421
        //... })

      }
      eYo.throw(`${this.eyo.name} instance: can't define property ${key}`)
      // return false
      //... restart()
      //... ;['foo', 'bar'].forEach(K => {
      //...   chai.expect(() => {
      //...     Object.defineProperty(p, K, {value: 421})
      //...   }).throw()
      //... })
    },
    deleteProperty (target, prop) {
      if (this.isOwnedKey(prop) || this.isOwnedRWKey(prop)) {
        delete this[prop]
        return true
        //... handler.keys_owned.forEach(K => {
        //...   restart()
        //...   delete p[K]
        //...   chai.expect(p[K]).undefined
        //... })
        //... handler.keys_RW.forEach(K => {
        //...   restart()
        //...   delete p[K]
        //...   chai.expect(p[K]).undefined
        //... })
      } else {
        doDelete(target, prop)
        //... chai.expect(() => {
        //...   delete p.foo
        //... }).throw()
      }
    },
    isOwnedROKey (key) {
      return this.keys_RO.includes(key)
    },
    isOwnedRWKey (key) {
      return this.keys_RW.includes(key)
    },
    isOwnedKey (key) {
      return this.keys_owned.includes(key)
    },
    doGet (target, prop) {
      return eYo.NA
    },
    doSet (target, prop, value) {
      return false
    },
    doDelete (target, prop) {
      return false
    },
  }
  //>>>
})

eYo.mixinR(eYo.p6y.handler.BaseC9r_p, {
  keys_RO: [
    '__target', // expose the proxy target
    'owner', 'key', 'hasOwnProperty'
  ],
  keys_owned: [
    'previous', 'next', 'owner__', 'key_',
  ],
  keys_RW: [
    eYo.observe.BEFORE, eYo.observe.DURING, eYo.observe.AFTER,
    'fireObservers', 'reset', 'setValue', 'getValue', 
    'getStored', 'setStored', 'validate',
  ],
})

/**
 * Declare the given alias.
 * It was declared in a model like
 * `{aliases: { 'source.key': 'alias' } }`
 * Implementation details : uses proxies.
 * @param {String} dest_key
 * @param {Object} object
 * @param {String|eYo.p6y.BaseC9r} source
 * @param {String} key
 */
eYo.p6y._p.aliasNew = function (key, owner, target, target_key) {
  //<<< mochai: eYo.p6y.aliasNew, Proxy alias
  var handler
  if (target_key) {
    let source_ = target + '_'
    let key_p = target_key + '_p'
    target = owner
    handler = eYo.p6y.handler.new({
      methods: {
        doGet (target, prop) {
          let s = target[source_]
          if (eYo.isDef(s)) {
            var x = s[key_p]
            if (eYo.isDef(x)) {
              return x[prop]
            }
            x = s[target_key]
            if (eYo.isDef(x)) {
              return x[prop]
            }
          }
          return eYo.NA
        },
        doSet (target, prop, value) {
          let s = target[source_]
          if (eYo.isDef(s)) {
            let p6y = s[key_p]
            if (eYo.isDef(p6y)) {
              p6y[prop] = value
              return true
            }
          }
        },
        doDelete (target, prop) {
          let s = target[source_]
          if (eYo.isDef(s)) {
            let p6y = s[key_p]
            if (eYo.isDef(p6y)) {
              delete p6y[prop]
              return true
            }
          }
        },    
      },
    }, key, owner)
    //... var bar_p = eYo.p6y.new({
    //...   value: 421,
    //... }, 'bar', onr)
    //... var foo_ = eYo.c9r.new()
    //... foo_.bar_p = bar_p
    //... var target = eYo.o3d.new('target', onr)
    //... target.foo_ = foo_
    //... var bar_alias = eYo.p6y.aliasNew('foo', target, 'foo', 'bar')
    //... chai.expect(bar_alias.value).equal(421)
    //... bar_alias.value_ = 666
    //... chai.expect(bar_p.value).equal(666)
  } else if (eYo.isStr(target)) {
    let source_p = target + '_p'
    target = owner
    handler = eYo.p6y.handler.new({
      methods: {
        doGet (target, prop) {
          let p6y = target[source_p]
          return eYo.isDef(p6y) ? p6y[prop] : eYo.NA
        },
        doSet (target, prop, value) {
          let p6y = target[source_p]
            if (eYo.isDef(p6y)) {
              p6y[prop] = value
              return true
            }
          },
        doDelete (target, prop) {
          let p6y = target[source_p]
          if (eYo.isDef(p6y)) {
            delete p6y[prop]
            return true
          }
        },    
      },
    }, key, owner, target)
    //... var bar_p = eYo.p6y.new({
    //...   value: 421,
    //... }, 'bar', onr)
    //... var target = eYo.o3d.new('target', onr)
    //... target.bar_p = bar_p
    //... var bar_alias = eYo.p6y.aliasNew('foo', target, 'bar')
    //... chai.expect(bar_alias.value).equal(421)
    //... bar_alias.value_ = 666
    //... chai.expect(bar_p.value).equal(666)
  } else if (eYo.isaP6y(target) || eYo.Def(target = target.__target)) {
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
          if (keys_owned.includes(prop)) {
            delete this[prop]
          }
          delete target[prop]
          return true
        },    
      },
    }, key, owner)
    //... var alias = eYo.p6y.aliasNew('p', onr, bar_p)
    //... // key
    //... chai.expect(alias.hasOwnProperty('key')).true
    //... chai.expect(alias.key).equal('p')
    //... chai.expect(() => alias.key = 0).throw()
    //... alias.key_ = 'foo'
    //... chai.expect(alias.key).equal('foo')
    //... chai.expect(bar_p.key).equal('bar')
    //... bar_p.key_ = 'barZ'
    //... chai.expect(alias.key).equal('foo')
    //... // owner
    //... chai.expect(alias.owner).equal(onr)
    //... chai.expect(() => alias.owner = 0).throw()
    //... alias.owner__ = 0
    //... chai.expect(alias.owner).equal(0)
    //... chai.expect(bar_p.owner).equal(onr)
    //... bar_p.owner__ = eYo.c9r.new('onr')
    //... chai.expect(alias.owner).equal(0)
    //... alias = eYo.p6y.aliasNew('p', onr, bar_p)
    //... chai.expect(alias.hasOwnProperty('next')).false
    //... Object.defineProperties(alias, {
    //...   next: {
    //...     value: 1,
    //...     configurable: true,
    //...   }
    //... })
    //... chai.expect(alias.hasOwnProperty('next')).true
    //... chai.expect(alias.next).equal(1)
    //... chai.expect(bar_p.next).not.equal(1)
    //... chai.expect(() => alias.next = 2).throw()
    //... Object.defineProperties(alias, {
    //...   next: {
    //...     value: 2,
    //...     configurable: true,
    //...   }
    //... })
    //... chai.expect(alias.next).equal(2)
    //... alias = eYo.p6y.aliasNew('p', onr, bar_p)
    //... Object.defineProperties(bar_p, {
    //...   next: {
    //...     value: 1,
    //...     configurable: true,
    //...   }
    //... })
    //... chai.expect(bar_p.hasOwnProperty('next')).true
    //... chai.expect(bar_p.next).equal(1)
    //... chai.expect(alias.hasOwnProperty('next')).false
    //... chai.expect(alias.next).not.equal(1)
  } else {
    eYo.throw(`eYo.p6y.aliasNew: bad target ${target}`)
    //... chai.expect(() => eYo.p6y.aliasNew('foo', onr, 421)).throw()
    //... chai.expect(() => eYo.p6y.aliasNew('foo', onr)).throw()
  }
  var p = new Proxy(target, handler)
  Object.defineProperty(p, '__target', {
    value: target,
    writable: false,
    configurable: true,
  })
  return p
  //>>>
}

/**
 * Make a property
 * @param {Object} model 
 * @param {String} key 
 * @param {Object} object - the owner of the instance
 */
eYo.dlgt.BaseC9r_p.p6yMakeInstance = function (model, key, object) {
  return model && model.source
  ? object.eyo.p6yAliasNew(key, object, ...model.source)
  : eYo.p6y.prepare(model || {}, key, object)
}

/**
 * Make a property shortcut.
 * Change both the given object **and** its prototype!
 * 
 * @param {*} object - The object receiveing the new shortcuts,
 * @param {String} key 
 * @param {eYo.p6y.BaseC9r} p6y 
 * @param {Boolean} [override] - defaults to false
 */
eYo.dlgt.BaseC9r_p.p6yMakeShortcut = function (object, key, p6y, override) {
  //<<< mochai: eYo.dlgt.BaseC9r_p.p6yMakeShortcut
  //... let object = eYo.c9r.new({}) // Notice the explicit model !
  eYo.isaC9r(object) || eYo.throw(`${this.name}.p6yMakeShortcut: Bad owner ${object}`)
  if (!eYo.isStr(key)) {
    eYo.isDef(override) && eYo.throw(`${this.name}.p6yMakeShortcut: Unexpected last argument ${override}`)
    ;[key, p6y, override] = [key.key, key, p6y]
  }
  //... chai.expect(() => object.eyo.p6yMakeShortcut(421)).throws()
  eYo.isaP6y(p6y) || eYo.throw(`${this.name}.p6yMakeShortcut: Missing property ${p6y}`)
  //... chai.expect(() => object.eyo.p6yMakeShortcut(object, '', 421)).throws()
  //... let p6y = eYo.p6y.new('foo', object)
  //... p6y.value_ = 421
  //... chai.expect(p6y.value).equal(421)
  let k_p = key + '_p'
  let k_ = key + '_'
  if (!override && object.hasOwnProperty(k_p)) {
    console.error(`BREAK HERE!!! ALREADY object ${object.eyo.name}/${k_p}`)
  }
  Object.defineProperties(object, {
    [k_p]: eYo.descriptorR(function () {
      return p6y
    }, true),
  })
  object[k_p] === p6y || eYo.throw('Missing property')
  //... chai.expect(object.hasOwnProperty('bar_p')).false
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('bar')).false
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('bar_')).false
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('bar__')).false
  //... object.eyo.p6yMakeShortcut(object, 'bar', p6y)
  //... chai.expect(object.bar_p).equal(p6y)
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('foo')).false
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('foo_')).false
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('foo__')).false
  //... chai.expect(object.hasOwnProperty('foo_p')).false
  //... object.eyo.p6yMakeShortcut(object, p6y)
  //... chai.expect(object.foo_p).equal(p6y)
  let _p = object.eyo.C9r_p
  _p.hasOwnProperty(key) || Object.defineProperties(_p, {
    [key]: eYo.descriptorR(function () {
      let p = this[k_p]
      if (!p) {
        console.error('TOO EARLY OR INAPPROPRIATE! BREAK HERE!')
      }
      if (!p.getValue) {
        console.error('BREAK HERE!')
        p.getValue
      }
      return p.getValue()
    }),
    [k_]: {
      get: function () {
        if (!this[k_p].getStored) {
          console.error('BREAK HERE!')
          this[k_p].getStored
        }
        return this[k_p].getStored()
      },
      set (after) {
        this[k_p].setValue(after)
      },
    },
    [key + '__']: {
      get: function () {
        if (!this[k_p].getStored) {
          console.error('BREAK HERE!')
          this[k_p].getStored
        }
        return this[k_p].getStored()
      },
      set (after) {
        this[k_p].setStored(after)
      },
    },
  })
  //... chai.expect(object.bar).equal(object.bar_).equal(object.bar__).equal(p6y.value)
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('bar')).true
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('bar_')).true
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('bar__')).true
  //... chai.expect(object.foo).equal(object.foo_).equal(object.foo__).equal(p6y.value)
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('foo')).true
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('foo_')).true
  //... chai.expect(object.eyo.C9r_p.hasOwnProperty('foo__')).true
  //... p6y.flag = function (...$) {
  //...   flag.push(...$)
  //... }
  //... p6y.getValue = function (...$) {
  //...   this.flag(1, ...$)
  //... }
  //... p6y.setValue = function (...$) {
  //...   this.flag(2, ...$)
  //... }
  //... p6y.getStored = function (...$) {
  //...   this.flag(3, ...$)
  //... }
  //... p6y.setStored = function (...$) {
  //...   this.flag(4, ...$)
  //... }
  //... object.foo
  //... flag.expect(1)
  //... object.foo_
  //... flag.expect(3)
  //... object.foo__
  //... flag.expect(3)
  //... object.foo_ = 666
  //... flag.expect(2666)
  //... object.foo__ = 666
  //... flag.expect(4666)
  //... object.bar
  //... flag.expect(1)
  //... object.bar_
  //... flag.expect(3)
  //... object.bar__
  //... flag.expect(3)
  //... object.bar_ = 666
  //... flag.expect(2666)
  //... object.bar__ = 666
  //... flag.expect(4666)
  return p6y
  //>>>
}

eYo.dlgt.BaseC9r_p.p6yEnhanced = function (manyModel = {}) {
  eYo.isF(manyModel.make) || (manyModel.make = eYo.dlgt.BaseC9r_p.p6yMakeInstance)
  eYo.isF(manyModel.makeShortcut) || (manyModel.makeShortcut = eYo.dlgt.BaseC9r_p.p6yMakeShortcut)

  /**
   * Declare the given aliases.
   * Used to declare synonyms.
   * @param {Map<String, String|Array<String>>} model - Object, map source -> alias.
   */
  this._p.p6yAliasesMerge = function (aliases) {
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
  }
  this.enhanceMany('p6y', 'properties', manyModel)
} 

eYo.observe.enhance(eYo.p6y.BaseC9r.eyo)

;(() => {
  let _p = eYo.p6y.BaseC9r_p

  /**
   * The parent of the property is the object who declares the property,
   * as part of its `properties:` section of its model.
   * The owner is the object who creates the property with `new`.
   * In general both are equal.
   * @type {Object} parent
   */
  Object.defineProperties(_p, {
    parent: eYo.descriptorR(function () {
      return this.owner
    })
  })  

  /**
   * Get the stored value. May be overriden by the model's `get_` key.
   * @private
   */
  _p.getStored = _p.__getStored = function () {
    return this.stored__
  }

  /**
   * Set the value of the receiver.
   * This can be overriden by the model's `set_` key.
   * The computed properties do not store values on their own.
   * @param {*} after - the new value after the change.
   * @return {*} the previously stored value
   */
  _p.setStored = _p.__setStored = function (after) {
    let before = this.stored__
    if (before && before.eyo_p6y === this) {
      // resign ownership
      before.eyo_p6y = eYo.NA
    }
    this.stored__ = after
    if (eYo.isaC9r(after) && !eYo.isDef(after.eyo_p6y)) {
      // gain ownership
      after.eyo_p6y = this
    }
    return before
  }

  /**
   * Get the value, may be overriden by the model's `get` key.
   * @private
   */
  _p.getValue = function () {
    return this.getStored()
  }

  /**
   * Get the stored value, as copy.
   * Do not overwrite.
   * @private
   */
  _p.__getCopyValue = function () {
    let ans = this.getStored()
    return eYo.isDef(ans) && ans.copy
  }

  /**
   * Returns the starting value.
   */
  _p.getStartValue = eYo.doNothing

  /**
   * Convenient function used multiple times.
   * @private
   */
  _p._valueGetter = function () {
    return this.getValue()
  }

  /**
   * Set the value of the receiver.
   * This can be overriden by the model's `set` key.
   * @param {*} after - the new value after the change.
   * @return {*} the previousy stored value
   */
  _p.setValue = function (after) {
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
      return before
    }
  }

  /**
   * @property {*} value - computed
   */
  Object.defineProperties(_p, {
    value_: {
      get: _p._valueGetter,
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
  })
  //<<< mochai: eYo.p6y.BaseC9r_p properties
  //... let p6y = eYo.p6y.new('p6y', onr)
  //... chai.expect(p6y.value).equal(p6y.value_).equal(p6y.value__).equal(eYo.NA)
  //... chai.expect(() => p6y.value = 421).throw()
  //... p6y.value_ = 421
  //... chai.expect(p6y.value).equal(p6y.value_).equal(p6y.value__).equal(421)
  //... p6y.value__ = 666
  //... chai.expect(p6y.value).equal(p6y.value_).equal(p6y.value__).equal(666)
  //>>>

  /**
   * Iterator.
   */
  _p.ownedForEach = eYo.doNothing

})()
//>>>
