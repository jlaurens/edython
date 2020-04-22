/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.p6y is a class for a property controller.
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
eYo.p6y.makeBaseC9r(true, {
  init (owner, key) {
    this.stored__ = eYo.NA // this may be useless in some situations
    Object.defineProperties(this, {
      value: eYo.descriptorR({
          lazy () {
            return `Unexpected setter ${key} in ${owner.eyo.key}'s instance property`
          },
        },
        eYo.p6y.BaseC9r_p.valueGetter
      ),
    })
  },
  dispose (...args) {
    this.removeObservers()
    this.disposeStored_(...args)
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
      let f_o = this.key && this.owner_ && this.owner_[this.key + 'Validate']
      return eYo.isF(f_o) ? f_o.call(this.owner_, before, after) : after
    },
    /**
     * Object disposer.
     * Manage collections, takes care of ownership.
     * @param {Object} what
     */
    disposeStored__ (what, ...args) {
      if (what) {
        if (what.eyo) {
          what.eyo_p6y === this && eYo.isF(what.dispose) && what.dispose(...args)
        } else if (eYo.isRA(what)) {
          try {
            what.forEach(x => this.disposeStored__(x, ...args))
          } finally {
            what.length = 0
          }
        } else {
          Object.keys(what).forEach(k => {
            if (what.hasOwnProperty(k)) {
              this.disposeStored__(what[k], ...args)
            }
          })
        }
      }
    },
    /**
     * Dispose of the stored object, if any.
     * Private method, overriden to `eYo.doNothing`
     * for objects that should not be disposed of.
     * 
     */
    disposeStored_ (...args) {
      let v = this.stored__
      if (eYo.isDef(v) && v.eyo && v.eyo_p6y === this) {
        try {
          this.disposeStored__(v, ...args)
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
      let before = this.stored__
      if (!eYo.isNA(before)) {
        try {
          this.validate = eYo.doNothing
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
    },
    /**
     * Set the value of the receiver.
     * This can be overriden by the model's `set` key.
     * @param {*} after - the new value after the change.
     */
    reset () {
      this.setValue(this.start())
    },
  },
})

Object.defineProperties(eYo.p6y.BaseC9r_p, {
  Id: {
    value: 'P6y',
  },
})

eYo.p6y.BaseC9r.eyo.finalizeC9r([
  'source', 'value', 'lazy', 'reset', 'copy',
  'validate', 'get', 'set', 'get_', 'set_',
  eYo.observe.BEFORE, eYo.observe.DURING, eYo.observe.AFTER,
], {
  [eYo.model.VALIDATE]: before => {
    if (!eYo.isD(before)) {
      return {
        value: before
      }
    }
  },
  after: {
    [eYo.model.VALIDATE]: before => {
      if (!eYo.isStr(before) && !eYo.isRA(before)) {
        return eYo.INVALID
      }
    },  
  },
})

eYo.more.enhanceO3dValidate(eYo.p6y.BaseC9r.eyo, 'p6y', true)

// ANCHOR eYo.p6y.new

/**
 * For subclassers.
 * @param {String} key
 * @param {Object} [model]
 */
eYo.p6y.Dlgt_p.modelHandle = function (key, model) {
  model || (model = this.model)
  this.modelHandleValue(key, model)
  this.modelHandleReset(key, model)
  this.modelHandleDispose(key, model)
  this.modelHandleValidate(key, model)
  this.modelHandleGetSet(key, model)
  this.modelHandleChange(key, model)
  this.modelHandleStored(key, model)
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
  if (!eYo.isNA(value_m)) {
    eYo.isNA(model.lazy) || eYo.throw(`Bad model (${_p.eyo.name}/${key}): unexpected lazy`)
    _p.start = eYo.isF(value_m) ? function() {
      return value_m.call(this.owner_)
    } : function () {
      return value_m
    }
    model._starters.push(object => {
      object.setStored(object.start())
    })
  }
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
        f_m.call(this.owner_, () => {
          f_p.call(this)
        })
      })
    } else {
      if (!model.value) {
        model.value = model.lazy || model.reset
        this.modelHandleValue(key, model)
      }
      _p[K] = eYo.decorate.reentrant(K, function () {
        this.resetValue(f_m.call(this.owner_))
      }, f_p)
    }
  } else {
    if (!model.value && !model.lazy) {
      model.value = f_m
      this.modelHandleValue(key, model)
    }
    _p[K] = eYo.decorate.reentrant(K, function () {
      this.resetValue(f_m)
    })
  }
}

/**
 * Make the prototype's dispose method according to the model's object for key dispose.
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y.Dlgt_p.modelHandleDispose = function (key, model) {
  if (model.dispose === false) {
    this.C9r_p.disposeStored_ = eYo.doNothing
  }
}

/**
 * make the prototype's getValue method based on the model.
 * make the prototype' setValue method based on the model.
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y.Dlgt_p.modelHandleGetSet = function (key, model) {
  let _p = this.C9r_p
  var can_lazy = true
  var computed = false // true iff get and set are given with no builtin dependency
  let get_m = model.get // from model => suffix = '_m' and `@this` === property owner
  if (model.copy) {
    model.get && eYo.throw(`Bad model (${_p.eyo.name}/${key}): Unexpected get`)
    _p.getValue = eYo.p6y.BaseC9r_p.__getCopyValue
  } else {
    if (get_m === eYo.doNothing || get_m === false) {
      can_lazy = false
      _p.getValue = eYo.noGetter(function () {
        return `Write only (${this.owner_.eyo.name}/${key})`
      })
    } else if (eYo.isF(get_m)) {
      if (get_m.length) {
        _p.getValue = function () {
          try {
            this.getValue = eYo.doNothing
            return get_m.call(this.owner_, () => {
              return _p.eyo.C9r_s.getValue.call(this)
            })
          } finally {
            delete this.getValue
          }
        }
      } else {
        _p.getStored = _p.getValue = function () {
          try {
            this.getValue = eYo.doNothing
            return get_m.call(this.owner_)
          } finally {
            delete this.getValue
          }
        }
        // p6y with pure computed getter cannot be lazy
        computed = true
        can_lazy = false
      }
    } else {
      eYo.isNA(get_m) || eYo.throw(`Bad model (${_p.eyo.name}/${key}): unexpected get -> ${get_m}`)
    }
  }
  let set_m = model.set // from model => suffix = '_m' and `@this` === property owner
  if (set_m === eYo.doNothing || set_m === false) {
    _p.setValue = eYo.noSetter(function () {
      return `Read only ${this.owner_.eyo.name}/${key}`
    })
  } else if (eYo.isF(set_m)) {
    if (set_m.length > 1) {
      computed && eYo.throw(`Bad model (${_p.eyo.name}/${key}): Unexpected 'stored|builtin|property' in set`)
      _p.setValue = _p.resetValue = eYo.decorate.reentrant('setValue', XRegExp.exec(set_m.toString(), eYo.xre.function_stored_after)
      ? function (after) {
        return set_m.call(this.owner_, this.stored__, after)
      } : function (after) {
        return set_m.call(this.owner_, after => {
          _p.eyo.C9r_s.setValue.call(this, after)
        }, after)
      })
    } else {
      if (!computed && !eYo.isDoIt(_p.start) && !_p.reset) {
        get_m && eYo.throw(`Bad model (${_p.eyo.name}/${key}): Missing 'stored|builtin|property' in set (2)`)
        _p.getStored = _p.getValue = eYo.noGetter(function () {
          return `Write only ${this.owner_.eyo.name}/${key}`
        })
      }
      _p.setValue = _p.resetValue = function (after) {
        try {
          this.setValue = eYo.doNothing
          return set_m.call(this.owner_, after)
        } finally {
          delete this.setValue
        }
      }
      if (!eYo.isDoIt(_p.start)) {
        _p.setStored = _p.setValue
      }
    }
  } else {
    set_m && eYo.throw(`Bad model (${_p.eyo.name}/${key}): unexpected set -> ${set_m}`)
    if (computed) {
      eYo.isNA(model.reset) || eYo.throw(`Bad model (${_p.eyo.name}/${key}): unexpected reset`)
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
    if (!eYo.isNA(lazy_m)) {
      model._starters.push(object => {
        object.getStored = Object.getPrototypeOf(object).__getLazyStored
      })
      _p.start = eYo.isF(lazy_m) ? function () {
        return lazy_m.call(this.owner_)
      } : function () {
        return lazy_m
      }
    }
  } else {
    eYo.isNA(model.lazy) && eYo.isNA(model.value) || eYo.throw(`Bad model (${_p.eyo.name}/${key}): unexpected value or lazy`)
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
 * make the prototype's getStored method based on the model `get_` function.
 * make the prototype's setStored method based on the model's `set_` function.
 * @param {String} key
 * @param {Object} model
 */
eYo.p6y.Dlgt_p.modelHandleStored = function (key, model) {
  let _p = this.C9r_p
  let get__m = model.get_
  if (get__m === eYo.doNothing || get__m === false) {
    _p.getStored = eYo.noGetter(function () {
      return `Write only ${this.owner_.eyo.name}/${key}`
    })
  } else if (eYo.isF(get__m)) {
    _p.getStored = get__m.length > 0 ? function () {
      try {
        this.getStored = eYo.doNothing
        return get__m.call(this.owner_, () => { return this.__getStored()})
      } finally {
        delete this.getStored
      }
    } : function () {
      try {
        this.getStored = eYo.doNothing
        return get__m.call(this.owner_)
      } finally {
        delete this.getStored
      }
    }
  } else {
    eYo.isNA(get__m) || eYo.throw(`Bad model (${_p.eyo.name}/${key}): unexpected get_ object`)
  }
  let set__m = model.set_
  if (set__m === eYo.doNothing || set__m === false) {
    _p.setStored = eYo.noSetter(function () {
      return `Read only ${this.owner_.eyo.name}/${key}`
    })
  } else if (eYo.isF(set__m)) {
    _p.setStored = set__m.length > 1 ? function (after) {
      try {
        this.setStored = eYo.doNothing
        return set__m.call(this.owner_, after => {this.__setStored(after)}, after)
      } finally {
        delete this.setStored
      }
    } : function (after) {
      try {
        this.setStored = eYo.doNothing
        return set__m.call(this.owner_, after)
      } finally {
        delete this.setStored
      }
    }
    _p.resetValue || (_p.resetValue = _p.setStored)
  } else {
    eYo.isNA(set__m) || eYo.throw(`Bad model (${_p.eyo.name}/${key}): unexpected set_ object.`)
    _p.resetValue || (_p.resetValue = _p.setStored)
  }
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

{
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

}

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
  var target
  var handler
  let keys_RO = [
    'owner', 'key',
  ]
  let write_keys = [
    'previous', 'next', 'owner__', 'key_',
    eYo.observe.BEFORE, eYo.observe.DURING, eYo.observe.AFTER,
    'fireObservers', 'reset', 'setValue', 'getValue', 
    'getStored', 'setStored', 'validate',
  ]
  let get = f => function (target, prop) {
    if (prop === 'owner') {
      return this.owner__
    } else if (prop === 'key') {
      return this.key_
    } else if (this.hasOwnProperty(prop)) {
      return this[prop]
    } else {
      return f(target, prop)
    }
  }
  let set = f => function (target, prop, value) {
    if (keys_RO.includes(prop)) {
      return false
    } else if (prop === 'stored__') {
      return f(target, prop, value)
    } else if (write_keys.includes(prop)) {
      this[prop] = value
      return true  
    } else {
      return f(target, prop, value)
    }
  }
  let deleteProperty = f => function (target, prop) {
    if (write_keys.includes(prop)) {
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
    handler = {
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
    }
  } else if (eYo.isStr(source)) {
    let source_p = source + '_p'
    target = object
    handler = {
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
    }
  } else {
    source instanceof eYo.p6y.BaseC9r || eYo.throw(`${this.name}/p6yAliasNew: bad source ${source}`)
    target = source
    handler = {
      get: get(function (target, prop) {
        return target[prop]
      }),
      set: set(function (target, prop, value) {
        target[prop] = value
        return true
      }),
      deleteProperty: deleteProperty(function (target, prop) {
        delete target[prop]
        return true
      }),
    }
  }
  handler.defineProperty = function (target, key, descriptor) {
    return keys.includes(key)
  }
  let p = new Proxy(target, handler)
  p.owner__ = object
  p.key_ = dest_key
  return p
}

/**
 * Make a property
 */
eYo.dlgt.BaseC9r_p.p6yMakeInstance = function (model, k, object) {
  return model && model.source
  ? object.eyo.p6yAliasNew(k, object, ...model.source)
  : eYo.p6y.prepare(model || {}, k, object)
}
/**
 * Make a property
 */
eYo.dlgt.BaseC9r_p.p6yMakeShortcut = function (k, object, p) {
  p || eYo.throw(`${this.name}/p6yMakeShortcut: Missing property ${k}`)
  let k_p = k + '_p'
  let k_ = k + '_'
  if (object.hasOwnProperty(k_p)) {
    console.error(`BREAK HERE!!! ALREADY object ${object.eyo.name}/${k_p}`)
  }
  Object.defineProperties(object, {
    [k_p]: eYo.descriptorR(function () {
      return p
    }),
  })
  object[k_p] || eYo.throw('Missing property')
  let _p = object.eyo.C9r_p
  _p.hasOwnProperty(k) || Object.defineProperties(_p, {
    [k]: eYo.descriptorR(function () {
      let p = this[k_p]
      if (!p) {
        console.error('TOO EARLY OR INAPPROPRIATE! BREAK HERE!')
      }
      if (!p.getValue) {
        console.error('BREAK HERE!')
        p.getValue
      }
      return p.getValue && p.getValue() || p.value
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
    [k + '__']: {
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
  return p
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

{
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
  _p.start = eYo.doNothing

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
    if (after && after.eyo && !after.eyo_p6y) {
      // gain ownership
      after.eyo_p6y = this
    }
  }
  /**
   * Used multiple times.
   * @private
   */
  _p.valueGetter = function () {
    return this.getValue()
  }

  /**
   * @property {*} value - computed
   */
  Object.defineProperties(_p, {
    value_: {
      get: _p.valueGetter,
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

  /**
   * Get the value, may be overriden by the model's `get` key.
   * @private
   */
  _p.getValue = function () {
    return this.getStored()
  }

  /**
   * Get the stored value, lazily.
   * @private
   */
  _p.__getLazyStored = function () {
    delete this.getStored
    var ans = this.getStored()
    if (eYo.isNA(ans)) {
      this.setStored(ans = this.start())
    }
    return ans
  }

  /**
   * Get the value, as copy.
   * Do not overwrite.
   * @private
   */
  _p.__getCopyValue = function () {
    try {
      this.getValue = eYo.doNothing
      var ans = eYo.p6y.BaseC9r_p.getValue.call(this)
      return ans && ans.copy
    } finally {
      delete this.getValue
    }
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

}
