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
//<<< chai: P6y
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
  },
  //<<< chai: P6y: readonly value
  //... let p6y = new eYo.p6y.BaseC9r('p', onr)
  //... chai.expect(() => p6y.value = 0).throw()
  //>>>
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
      //<<< chai: eYo.p6y.BaseC9r_p.validate (before, after)
      let f_o = this.key && this.owner_ && this.owner_[this.key + 'Validate']
      return eYo.isF(f_o) ? f_o.call(this.owner_, before, after) : after
      //... let onr = new eYo.c9r.BaseC9r({}, 'onr')
      //... let p6y = new eYo.p6y.BaseC9r('p6y', onr)
      //... chai.expect(p6y.validate(1, 2)).equal(2)
      //... onr.p6yValidate = function (before, after) {
      //...   this.do_it(before, after)
      //...   return after
      //... }
      //... onr.do_it = function (before, after) {
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
      //<<< chai: eYo.p6y.BaseC9r_p.__disposeStored(what, ...$)
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
      //<<< chai: eYo.p6y.BaseC9r_p.recycle
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
     * This can be overriden by the model's `set` key.
     * @param {*} after - the new value after the change.
     */
    reset () {
      this.setValue(this.getStartValue())
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
}, false)

/**
 * Id is used when observing
 * @name {eYo.p6y.BaseC9r_p.Id}
 */
eYo.mixinR(eYo.p6y.BaseC9r_p, {
  Id: 'P6y',
})

eYo.p6y.BaseC9r.eyo.finalizeC9r([
  'source', 'value', 'lazy', 'reset',
], (() => {
  let m = eYo.model.descriptorD({
    after: {
      [eYo.model.VALIDATE]: before => {
        if (!eYo.isStr(before) && !eYo.isRA(before)) {
          return eYo.INVALID
        }
      },
    },
    validate: {
      [eYo.model.VALIDATE]: before => {
        if (before === false) return eYo.doReturn2nd
        if (!eYo.isF(before)) return eYo.INVALID
      },
    },
    copy: eYo.model.descriptorBool(),
    copy: eYo.model.descriptorBool(),
    get_: eYo.model.descriptorF(),
    set_: eYo.model.descriptorF(),
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
})())

eYo.more.enhanceO3dValidate(eYo.p6y.BaseC9r.eyo, 'p6y', true)

// ANCHOR eYo.p6y.new

/**
 * For subclassers.
 * @param {String} key
 * @param {Object} [model]
 */
eYo.p6y.Dlgt_p.modelHandle = function (key, model) {
  model || (model = this.model)
  let io = {}
  this.modelHandleStart(key, model, io) // first
  this.modelHandleGetSet(key, model, io)
  this.modelHandleReset(key, model)
  this.modelHandleValue(key, model) // after modelHandleReset
  this.modelHandleDispose(key, model, io)
  this.modelHandleValidate(key, model)
  this.modelHandleChange(key, model, io)
  this.modelHandleStored(key, model, io) // after handleReset
}

/**
 * Process the model to detect inconsistancies.
 * @param {String} key
 * @param {Object} model
 * @param {Object} io - pass information between model handlers
 */
eYo.p6y.Dlgt_p.modelHandleStart = function (key, model, io) {
  //<<< chai: eYo.p6y.Dlgt_p.modelHandleStart
  let get_m = model.get
  let set_m = model.set
  io.computed_getter = get_m && get_m.length === 0
  io.computed_setter = set_m && set_m.length === 1
  let get__m = model.get_
  let set__m = model.set_
  //>>>
}

/**
 * make the prototype's getValue method based on the model.
 * make the prototype' setValue method based on the model.
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y.Dlgt_p.modelHandleGetSet = function (key, model) {
  //<<< chai: eYo.p6y.Dlgt_p.modelHandleGetSet
  //... var onr = eYo.c9r.new({})
  let _p = this.C9r_p
  var can_lazy = true
  var computed = false // true iff get and set are given with no builtin dependency
  let get_m = model.get // from model => suffix = '_m' and `@this` === property owner
  // get_m is computed means that it is meant to replace the standard getter
  model._computed_getter = eYo.isF(get_m) && get_m.length === 0
  var computed = false
  if (model.copy) {
    (get_m === eYo.doNothing || get_m === false) && eYo.throw(`Inconsistent model (${this.name}/${key}): both copy and forbidden getter are not allowed`)
    model._computed_getter && eYo.throw(`Inconsistent model (${this.name}/${key}): both copy and computed getter are not allowed`)
    _p.getValue = eYo.p6y.BaseC9r_p.__getCopyValue
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
  } else if (get_m === eYo.doNothing || get_m === false) {
    can_lazy = false
    _p.getValue = eYo.noGetter(function () {
      return `Write only (${this.owner_.eyo.name}/${key})`
    })
    //... var p6y = eYo.p6y.new({
    //...   get: eYo.doNothing 
    //... }, 'foo', onr)
    //... chai.expect(() => p6y.value).throw()
    //... chai.expect(() => p6y.value_).throw()
    //... chai.expect(() => p6y.value__).not.throw()
    //... var p6y = eYo.p6y.new({
    //...   get: false 
    //... }, 'foo', onr)
    //... chai.expect(() => p6y.value).throw()
    //... chai.expect(() => p6y.value_).throw()
    //... chai.expect(() => p6y.value__).not.throw()
  } else if (model._computed_getter) {
    // p6y with pure computed getter cannot be lazy
    can_lazy = false
    _p.getStored = _p.getValue = function () {
      try {
        this.getValue = eYo.doNothing
        return get_m.call(this.owner_)
      } finally {
        delete this.getValue
      }
    }
    //... var p6y = eYo.p6y.new({
    //...   get () {
    //...     flag.push(1)
    //...     return 421
    //...   },
    //... }, 'foo', onr)
    //... chai.expect(p6y.value).equal(421)
    //... flag.expect(1)
    //... chai.expect(p6y.value_).equal(421)
    //... flag.expect(1)
    //... chai.expect(p6y.value__).equal(421)
    //... flag.expect(1)
    //... chai.expect(p6y.getValue()).equal(421)
    //... flag.expect(1)
    //... chai.expect(p6y.getStored()).equal(421)
    //... flag.expect(1)
  } else if (eYo.isF(get_m)) {
    _p.getValue = function () {
      try {
        this.getValue = eYo.doNothing
        return get_m.call(this.owner_, this.getStored.bind(this))
      } finally {
        delete this.getValue
      }
    }
    //... var onr = eYo.c9r.new({
    //...   methods: {
    //...     do_it (what) {
    //...       flag.push(2, what)
    //...       return what
    //...     },
    //...   },
    //... })
    //... var p6y = eYo.p6y.new({
    //...   get (builtin) {
    //...     flag.push(1)
    //...     return this.do_it(builtin())
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
  } else {
    eYo.isNA(get_m) || eYo.throw(`Bad model (${this.name}/${key}): unexpected get -> ${get_m}`)
    //... chai.expect(() => eYo.p6y.new({
    //...   get: 421  
    //... }, 'foo', onr)).throw()
  }
  let set_m = model.set // from model => suffix = '_m' and `@this` === property owner
  model._computed_setter = eYo.isF(set_m) && set_m.length === 1
  if (set_m === eYo.doNothing || set_m === false) {
    _p.setValue = eYo.noSetter(function () {
      return `Read only ${this.owner_.eyo.name}/${key}`
    })
    //... var p6y = eYo.p6y.new({
    //...   set: eYo.doNothing 
    //... }, 'foo', onr)
    //... chai.expect(() => p6y.value = 421).throw()
    //... chai.expect(() => p6y.value_ = 421).throw()
    //... chai.expect(() => p6y.value__ = 421).not.throw()    
    //... var p6y = eYo.p6y.new({
    //...   set: false 
    //... }, 'foo', onr)
    //... chai.expect(() => p6y.value = 421).throw()
    //... chai.expect(() => p6y.value_ = 421).throw()
    //... chai.expect(() => p6y.value__ = 421).not.throw()    
  } else if (model._computed_setter) {
    if (!model._computed_getter && !eYo.isDoIt(_p.getStartValue) && !_p.reset) {
      get_m && eYo.throw(`Bad model (${this.name}/${key}): Missing 'stored|builtin|property' in set (2)`)
      _p.getStored = _p.getValue = eYo.noGetter(function () {
        return `Write only ${this.owner_.eyo.name}/${key}`
      })
    }
    _p.setValue = _p.doResetValue = function (after) {
      try {
        this.setValue = eYo.doNothing
        return set_m.call(this.owner_, after)
      } finally {
        delete this.setValue
      }
    }
    if (!eYo.isDoIt(_p.getStartValue)) {
      _p.setStored = _p.setValue
    }
  } else if (eYo.isF(set_m)) {
    if (set_m.length > 1) {
      model._computed_getter && eYo.throw(`Bad model (${this.name}/${key}): Unexpected 'stored|builtin|property' in set`)
      _p.setValue = _p.doResetValue = eYo.decorate.reentrant('setValue', XRegExp.exec(set_m.toString(), eYo.xre.function_stored_after)
      ? function (after) {
        return set_m.call(this.owner_, this.stored__, after)
      } : function (after) {
        return set_m.call(this.owner_, after => {
          _p.eyo.C9r_s.setValue.call(this, after)
        }, after)
      })
    }
  } else {
    set_m && eYo.throw(`Bad model (${this.name}/${key}): unexpected set -> ${set_m}`)
    if (computed) {
      eYo.isNA(model.reset) || eYo.throw(`Bad model (${this.name}/${key}): unexpected reset`)
      _p.setStored = _p.setValue = eYo.noSetter(function () {
        return `Read only ${this.owner_.eyo.name}/${key}`
      })
      _p.reset = eYo.doNothing
    }
  }
  if (computed) {
    _p.dispose = eYo.doNothing
  }
  if (can_lazy) {
    let lazy_m = model.lazy
    if (eYo.isDef(lazy_m)) {
      eYo.isNA(model.value) || eYo.throw(`Bad model (${this.name}/${key}): unexpected value`)
      model._starters.push(object => {
        object.getStored = Object.getPrototypeOf(object).__getLazyStored
      })
      _p.getStartValue = eYo.isF(lazy_m) ? function () {
        return lazy_m.call(this.owner_)
      } : function () {
        return lazy_m
      }
    }
  } else {
    eYo.isNA(model.lazy) && eYo.isNA(model.value) || eYo.throw(`Bad model (${this.name}/${key}): unexpected value or lazy`)
  }
  //>>>
}

/**
 * Make the prototype's `reset` method, based on the model's object for value key reset, either a function or an object.
 * If model's object is a function, it is executed to return an object which will be the new value.
 * If we want to reset with a function, the model's object must be a function that in turn returns the expected function.
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y.Dlgt_p.modelHandleReset = function (key, model) {
  let K = 'reset'
  let f_m = model[K]
  if (eYo.isNA(f_m)) {
    return
  }
  let _p = this.C9r_p
  let f_p = _p[K]
  if (eYo.isF(f_m)) {
    if (f_m.length) {
      _p[K] = eYo.decorate.reentrant(K, function () {
        f_m.call(this.owner_, f_p.bind(this))
      })
    } else {
      if (eYo.isNA(model.value)) {
        model.value = model.lazy || f_m
        this.modelHandleValue(key, model)
      }
      _p[K] = eYo.decorate.reentrant(K, function () {
        this.doResetValue(f_m.call(this.owner_))
      }, f_p)
    }
  } else {
    if (eYo.isNA(model.value) && eYo.isNA(model.lazy)) {
      model.value = f_m
      this.modelHandleValue(key, model)
    }
    _p[K] = eYo.decorate.reentrant(K, function () {
      this.doResetValue(f_m)
    })
  }
}

/**
 * Make a starter to set the start value, based on the model's object for value key value, either a function or an object.
 * If model's value object is a function, it is executed to return an object which will be the initial value.
 * If we want to initialize with a function, the model's value object must be a function that returns the expected function.
 * No change hook is reached.
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y.Dlgt_p.modelHandleValue = function (key, model) {
  let _p = this.C9r_p
  let value_m = model.value
  if (eYo.isDef(value_m)) {
    eYo.isNA(model.lazy) || eYo.throw(`Bad model (${_p.eyo.name}/${key}): unexpected lazy`)
    _p.getStartValue = eYo.isF(value_m) ? function() {
      return value_m.call(this.owner_)
    } : function () {
      return value_m
    }
    model._starters.push(object => {
      object.setStored(object.getStartValue())
    })
  }
}

/**
 * Make the prototype's dispose method according to the model's object for key dispose.
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y.Dlgt_p.modelHandleDispose = function (key, model) {
  if (model.dispose === eYo.doNothing) {
    this.C9r_p._disposeStored = eYo.doNothing
  }
}

/**
 * make the prototype's change methods based on the model.
 * If a method is inherited, then the super method is called.
 * It may not be a good idea to change the inherited method afterwards.
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y.Dlgt_p.modelHandleChange = function (key, model) {
  let _p = this.C9r_p
  eYo.observe.HOOKS.forEach(when => {
    let when_m = model[when]
    let when_p = _p[when]
    if (eYo.isF(when_m)) {
      _p[when] = eYo.decorate.reentrant(when, when_m.length > 1
      ? when_p
        ? function (before, after) {
          when_m.call(this.owner_, before, after)
          when_p.call(this, before, after)
        } : function (before, after) {
          when_m.call(this.owner_, before, after)
        }
      : when_p
        ? function (before, after) {
          when_m.call(this.owner_, after)  
          when_p.call(this, before, after)
        }: function (before, after) {
          when_m.call(this.owner_, after)
        }
      )
    } else {
      when_m && eYo.throw(`Unexpected model value ${when} -> ${when_m}`)
    }
  })
}

/**
 * Make the prototype's getStored method based on the model `get_` function.
 * Make the prototype's setStored method based on the model's `set_` function.
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y.Dlgt_p.modelHandleStored = function (key, model) {
  //<<< chai: eYo.p6y.Dlgt_p.modelHandleStored
  let _p = this.C9r_p
  let get__m = model.get_
  if (get__m === eYo.doNothing || get__m === false) {
    _p.getStored = eYo.noGetter(function () {
      return `Write only ${this.owner_.eyo.name}/${key}`
    })
    //... var p6y = eYo.p6y.new({
    //...   get_: eYo.doNothing,
    //... }, 'p6y', onr)
    //... chai.expect(() => p6y.getStore()).throw()
    //... var p6y = eYo.p6y.new({
    //...   get_: false,
    //... }, 'p6y', onr)
    //... chai.expect(() => p6y.getStore()).throw()
  } else if (eYo.isF(get__m)) {
    _p.getStored = get__m.length > 0 ? function () {
      try {
        this.getStored = eYo.doNothing
        return get__m.call(this.owner_, () => { return this.__getStored()})
      } finally {
        delete this.getStored
      }
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
    } : function () {
      try {
        this.getStored = eYo.doNothing
        return get__m.call(this.owner_)
      } finally {
        delete this.getStored
      }
      //... var p6y = eYo.p6y.new({
      //...   get_ () {
      //...     flag.push(123)
      //...     return 421
      //...   },
      //... }, 'p6y', onr)
      //... chai.expect(p6y.getStored()).equal(421)
      //... flag.expect(123)
    }
  } else {
    eYo.isNA(get__m) || eYo.throw(`Bad model (${_p.eyo.name}/${key}): unexpected get_ object`)
    //... chai.expect(() => eYo.p6y.new({
    //...   get_: 421,
    //... }, 'p6y', onr)).throw()
  }
  let set__m = model.set_
  if (set__m === eYo.doNothing || set__m === false) {
    _p.setStored = eYo.noSetter(function () {
      return `Read only ${this.owner_.eyo.name}/${key}`
    })
    //... var p6y = eYo.p6y.new({
    //...   set_: eYo.doNothing,
    //... }, 'p6y', onr)
    //... chai.expect(() => p6y.setStore()).throw()
    //... var p6y = eYo.p6y.new({
    //...   set_: false,
    //... }, 'p6y', onr)
    //... chai.expect(() => p6y.setStore()).throw()
  } else {
    if (eYo.isF(set__m)) {
      _p.setStored = set__m.length > 1 ? function (after) {
        try {
          this.setStored = eYo.doNothing
          return set__m.call(this.owner_, after => {this.__setStored(after)}, after)
        } finally {
          delete this.setStored
        }
        //... var p6y = eYo.p6y.new({
        //...   set_ (builtin, after) {
        //...     builtin(after)
        //...     flag.push(after + 1)
        //...   },
        //... }, 'p6y', onr)
        //... p6y.setStored(1)
        //... flag.expect(2)
        //... chai.expect(p6y.getStored()).equal(1)
      } : function (after) {
        try {
          this.setStored = eYo.doNothing
          return set__m.call(this.owner_, after)
        } finally {
          delete this.setStored
        }
        //... var p6y = eYo.p6y.new({
        //...   set_ (after) {
        //...     flag.push(after + 1)
        //...   },
        //... }, 'p6y', onr)
        //... p6y.setStored(1)
        //... flag.expect(2)
      }
    } else {
      eYo.isNA(set__m) || eYo.throw(`Bad model (${_p.eyo.name}/${key}): unexpected set_ object.`)
      //... chai.expect(() => eYo.p6y.new({
      //...   set_: 421,
      //... }, 'p6y', onr)).throw()
    }
    _p.doResetValue || (_p.doResetValue = _p.setStored)
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
  init (key, owner, ...$) {
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
 * Declare the given alias.
 * It was declared in a model like
 * `{aliases: { 'source.key': 'alias' } }`
 * Implementation details : uses proxies.
 * @param {String} dest_key
 * @param {Object} object
 * @param {String|eYo.p6y.BaseC9r} source
 * @param {String} key
 */
eYo.c9r.Dlgt_p.p6yAliasNew = function (dest_key, object, source, source_key) {
  //<<< chai: eYo.c9r.Dlgt_p.p6yAliasNew, Proxy alias
  var target
  var handler
  let keys_RO = [
    '__target', // expose the proxy target
    'owner', 'key', 'hasOwnProperty'
  ]
  let keys_owned = [
    'previous', 'next', 'owner__', 'key_',
  ]
  let keys_RW = [
    eYo.observe.BEFORE, eYo.observe.DURING, eYo.observe.AFTER,
    'fireObservers', 'reset', 'setValue', 'getValue', 
    'getStored', 'setStored', 'validate',
  ]
  let get = f => function (target, prop) {
    if (prop === 'owner') {
      return this.owner__
    } else if (prop === 'key') {
      return this.key_
    } else if (prop === '__target') {
      return this.__target
    } else if (keys_owned.includes(prop) || this.hasOwnProperty(prop) || prop === 'hasOwnProperty') {
      return this[prop]
    } else {
      return f(target, prop)
    }
  }
  let set = f => function (target, prop, value) {
    if (keys_RO.includes(prop)) {
      eYo.throw(`...${prop} = ... is forbidden for ${this.eyo.name} instances.`)
      return false
    } else if (prop === 'stored__') {
      return f(target, prop, value)
    } else if (keys_owned.includes(prop)) {
      this[prop] = value
      return true
    } else {
      return f(target, prop, value)
    }
  }
  let deleteProperty = f => function (target, prop) {
    if (keys_owned.includes(prop) || keys_RW.includes(prop)) {
      delete this[prop]
      return true
    } else {
      f(target, prop)
    }
  }
  if (source_key) {
    let source_ = source + '_'
    let key_p = source_key + '_p'
    target = object
    handler = eYo.c9r.new({
      methods: {
        get: get(function (target, prop) {
          let s = target[source_]
          if (eYo.isDef(s)) {
            var x = s[key_p]
            if (eYo.isDef(x)) {
              return x[prop]
            }
            x = s[source_key]
            if (eYo.isDef(x)) {
              return x[prop]
            }
          }
          return eYo.NA
        }),
        set: set(function (target, prop, value) {
          let s = target[source_]
          if (eYo.isDef(s)) {
            let p6y = s[key_p]
            if (eYo.isDef(p6y)) {
              p6y[prop] = value
              return true
            }
          }
        }),
        deleteProperty: deleteProperty(function (target, prop) {
          let s = target[source_]
          if (eYo.isDef(s)) {
            let p6y = s[key_p]
            if (eYo.isDef(p6y)) {
              delete p6y[prop]
              return true
            }
          }
        }),
      },
    })
  } else if (eYo.isStr(source)) {
    let source_p = source + '_p'
    target = object
    handler = eYo.c9r.new({
      methods: {
        get: get(function (target, prop) {
          let p6y = target[source_p]
          return eYo.isDef(p6y) ? p6y[prop] : eYo.NA
        }),
        set: set(function (target, prop, value) {
        let p6y = target[source_p]
          if (eYo.isDef(p6y)) {
            p6y[prop] = value
            return true
          }
        }),
        deleteProperty: deleteProperty(function (target, prop) {
          let p6y = target[source_p]
          if (eYo.isDef(p6y)) {
            delete p6y[prop]
            return true
          }
        }),
      },
    })
  } else {
    eYo.isaP6y(source) || eYo.throw(`${this.name}/p6yAliasNew: bad source ${source}`)
    target = source
    handler = eYo.c9r.new({
      methods: {
        get: get(function (target, prop) {
          return target[prop]
        }),
        set: set(function (target, prop, value) {
          target[prop] = value
          return true
        }),
        deleteProperty: deleteProperty(function (target, prop) {
          if (keys_owned.includes(prop)) {
            delete this[prop]
          }
          delete target[prop]
          return true
        }),
      },
    })
  }
  handler.defineProperty = function (target, key, descriptor) {
    if (keys_owned.includes(key) || key === '__target') {
      Object.defineProperty(this, key, descriptor)
      return true
    }
    eYo.throw(`${this.eyo.name} instance: can't define property ${key}`)
    return false
  }
  handler.getOwnPropertyDescriptor = function (target, name) {
    return Object.getOwnPropertyDescriptor(
      keys_owned.includes(name) ? this: target,
      name
    )
  }
  let p = new Proxy(target, handler)
  Object.defineProperty(p, '__target', {
    value: target,
    writable: false,
    configurable: true,
  })
  p.owner__ = object
  p.key_ = dest_key
  return p
  //... var p6y = eYo.p6y.new('p', onr)
  //... var alias = onr.eyo.p6yAliasNew('p', onr, p6y)
  //... // key
  //... chai.expect(alias.hasOwnProperty('key')).true
  //... chai.expect(alias.key).equal('p')
  //... chai.expect(() => alias.key = 0).throw()
  //... alias.key_ = 'foo'
  //... chai.expect(alias.key).equal('foo')
  //... chai.expect(p6y.key).equal('p')
  //... p6y.key_ = 'bar'
  //... chai.expect(alias.key).equal('foo')
  //... // owner
  //... chai.expect(alias.owner).equal(onr)
  //... chai.expect(() => alias.owner = 0).throw()
  //... alias.owner__ = 0
  //... chai.expect(alias.owner).equal(0)
  //... chai.expect(p6y.owner).equal(onr)
  //... p6y.owner__ = eYo.c9r.new('onr')
  //... chai.expect(alias.owner).equal(0)
  //... alias = onr.eyo.p6yAliasNew('p', onr, p6y)
  //... chai.expect(alias.hasOwnProperty('next')).false
  //... Object.defineProperties(alias, {
  //...   next: {
  //...     value: 1,
  //...     configurable: true,
  //...   }
  //... })
  //... chai.expect(alias.hasOwnProperty('next')).true
  //... chai.expect(alias.next).equal(1)
  //... chai.expect(p6y.next).not.equal(1)
  //... chai.expect(() => alias.next = 2).throw()
  //... Object.defineProperties(alias, {
  //...   next: {
  //...     value: 2,
  //...     configurable: true,
  //...   }
  //... })
  //... chai.expect(alias.next).equal(2)
  //... alias = onr.eyo.p6yAliasNew('p', onr, p6y)
  //... Object.defineProperties(p6y, {
  //...   next: {
  //...     value: 1,
  //...     configurable: true,
  //...   }
  //... })
  //... chai.expect(p6y.hasOwnProperty('next')).true
  //... chai.expect(p6y.next).equal(1)
  //... chai.expect(alias.hasOwnProperty('next')).false
  //... chai.expect(alias.next).not.equal(1)
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
  //<<< chai: eYo.dlgt.BaseC9r_p.p6yMakeShortcut
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
  //... p6y.do_it = function (...$) {
  //...   flag.push(...$)
  //... }
  //... p6y.getValue = function (...$) {
  //...   this.do_it(1, ...$)
  //... }
  //... p6y.setValue = function (...$) {
  //...   this.do_it(2, ...$)
  //... }
  //... p6y.getStored = function (...$) {
  //...   this.do_it(3, ...$)
  //... }
  //... p6y.setStored = function (...$) {
  //...   this.do_it(4, ...$)
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
      return this.owner_
    })
  })  

  /**
   * Returns the starting value.
   */
  _p.getStartValue = eYo.doNothing

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
  }

  /**
   * Get the stored value, lazily.
   * @private
   */
  _p.__getLazyStored = function () {
    delete this.getStored
    var ans = this.getStored()
    if (eYo.isNA(ans)) {
      this.setStored(ans = this.getStartValue())
    }
    return ans
  }

  /**
   * Convenient function used multiple times.
   * @private
   */
  _p._valueGetter = function () {
    return this.getValue()
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
  //<<< chai: eYo.p6y.BaseC9r_p properties
  //... let p6y = eYo.p6y.new('p6y', onr)
  //... chai.expect(p6y.value).equal(p6y.value_).equal(p6y.value__).equal(eYo.NA)
  //... chai.expect(() => p6y.value = 421).throw()
  //... p6y.value_ = 421
  //... chai.expect(p6y.value).equal(p6y.value_).equal(p6y.value__).equal(421)
  //... p6y.value__ = 666
  //... chai.expect(p6y.value).equal(p6y.value_).equal(p6y.value__).equal(666)
  //>>>

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
   * Set the value of the receiver.
   * This can be overriden by the model's `set` key.
   * @param {*} after - the new value after the change.
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
    }
  }
  /**
   * Iterator.
   */
  _p.ownedForEach = eYo.doNothing

})()
//>>>
