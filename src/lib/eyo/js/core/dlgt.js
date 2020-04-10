/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Class delegates manage class metadata without conflicting with other extensions.
 * This namespace may not be subclasses.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('model')
eYo.require('xre')
eYo.require('do')

/**
 * Management of class delegates.
 * @name {eYo.dlgt}
 * @namespace
 */
eYo.makeNS('dlgt')

/**
 * Declare javascript computed properties pointing to the receiver's delegate.
 * Each namespace also have a delegate.
 * @name {eYo.c9r._p.declareDlgt}
 * @param {Object} _p - A prototype
 */
eYo.dlgt.declareDlgt = function (_p) {
  let d = eYo.descriptorR(function () {
    return this.constructor.eyo__
  })
  Object.defineProperties(_p, {
    eyo: d,
    eyo_: d,
    eyo__: d,
  })
}

/**
 * This is a root class, not to be subclassed except in singletons.
 * Any constructor's delegate is an instance of this subclass.
 * @param {Object} ns - Namespace
 * @param {String} key - a key...
 * @param {Function} C9r - the associate constructor
 * @param {Object} model - the model used for extension
 */
/* The problem of constructor delegation is the possibility of an infinite loop :
  object->constructor->eyo__->contructor->eyo__->constructor->eyo__...
  The Base is its own delegate's constructor
*/
eYo.dlgt.Base = function (ns, key, C9r, model) {
  Object.defineProperties(this, {
    ns: { value: eYo.isNS(ns) ? ns : eYo.NA },
    key__: {value: key},
    C9r__: { value: C9r },
    model__: { value: model },
    subC9rs__: { value: new Set() },
  })
  C9r.eyo__ = this
  if (!C9r.eyo) { // true for subclasses of eYo.c9r.Dlgt
    var d = eYo.descriptorR(function () {
      return this.eyo__
    })
    Object.defineProperties(C9r, {
      eyo: d,
      eyo_: d,
      eyo_p: eYo.descriptorR(function () {
        return this.eyo__._p
      }),
    })
  }
  this.init()
}

{
  let _p = eYo.dlgt.Base_p = eYo.dlgt.Base.prototype

  _p.init = eYo.doNothing

  eYo.dlgt.declareDlgt(_p)

  // convenient shortcut
  Object.defineProperties(_p, {
    _p: eYo.descriptorR(function () {
      return this.constructor.prototype
    }),
  })
  ;['ns', 'key', 'C9r', 'model'].forEach(k => {
    let d = eYo.descriptorR(function () {
      return this[k + '__']
    })
    Object.defineProperties(_p, {
      [k]: d,
      [k + '_']: d,
    })
  })
  ;['name', 'super', 'genealogy'].forEach(k => {
    let k_ = k + '_'
    let k__ = k + '__'
    Object.defineProperties(_p, {
      [k_]: eYo.descriptorNORW(k_),
      [k__]: eYo.descriptorNORW(k__),
    })
  })
  Object.defineProperties(_p, {
    C9r_p: eYo.descriptorR(function () {
      return this.C9r__.prototype
    }),
    C9r_S: eYo.descriptorR(function () {
      return this.C9r__.SuperC9r
    }),
    C9r_s: eYo.descriptorR(function () {
      return this.C9r__.SuperC9r_p
    }),
    name: eYo.descriptorR(function () {
      return this.ns && this.key__ && `${this.ns.name}.${this.key__}` || this.key
    }),
    super: eYo.descriptorR(function () {
      var S = this.C9r__.SuperC9r
      return S && S.eyo__
    }),
    super_p: eYo.descriptorR(function () {
      var s = this.super
      return s && s.constructor.prototype
    }),
    genealogy: eYo.descriptorR(function () {
      var s = this
      var ans = []
      do {
        ans.push(s.name)
      } while ((s = s.super))
      return ans
    }),
  })  

  /**
   * Make the init method of the associate contructor.
   * Any constructor must have an init method.
   * @this {eYo.c9r.Dlgt}
   */
  _p.makeC9rInit = function () {
    console.error('MAKE INIT')
    let init_m = this.model__.init
    let C9r_s = this.C9r_s
    let init_s = C9r_s && C9r_s.init
    if (init_m) {
      console.error(this.model__)
      if (!eYo.isF(init_m)) {
        console.error('BREAK HERE!')
      } else {
        console.error('OKAY')
      }
      if (XRegExp.exec(init_m.toString(), eYo.xre.function_builtin)) {
        if (init_s) {
          var f = function (...args) {
            try {
              this.init = eYo.doNothing
              init_m.call(this, () => {
                this.doPrepare(...args)
                init_s.call(this, ...args)              
                this.doInit(...args)
              }, ...args)
            } finally {
              delete this.dispose
            }
          }
        } else {
          f = function (...args) {
            try {
              this.init = eYo.doNothing
              this.doPrepare(...args)
              init_m.call(this, () => {
                this.doInit(...args)
              }, ...args)
            } finally {
              delete this.dispose
            }
          }
        }
      } else if (init_s) {
        f = function (...args) {
          try {
            this.init = eYo.doNothing
            if (!this.doPrepare) {
              console.error('BREAK HERE!!! !this.doPrepare')
            }
            this.doPrepare(...args)
            init_s.call(this, ...args)
            if (!eYo.isF(init_m)) {
              console.error(init_m)
              console.error('BREAK HERE!')
            }
            init_m.call(this, ...args)
            this.doInit(this, ...args)
          } finally {
            delete this.dispose
          }
        }
      } else {
        f = function (...args) {
          try {
            this.init = eYo.doNothing
            this.doPrepare(...args)
            init_m.call(this, ...args)
            this.doInit(this, ...args)
          } finally {
            delete this.dispose
          }
        }
      }
    } else if (init_s) {
      f = function (...args) {
        try {
          this.init = eYo.doNothing
          if (!this.eyo) {
            console.error('BREAK HERE! NO EYO')
          }
          this.doPrepare(...args)
          init_s.call(this, ...args)
          this.doInit(...args) 
        } finally {
          delete this.dispose
        }
      }
    } else {
      f = function (...args) {
        try {
          this.init = eYo.doNothing
          if (!this.eyo) {
            console.error('BREAK HERE!')
          }
          this.doPrepare(...args)
          this.doInit(...args) 
        } finally {
          delete this.dispose
        }
      }
    }
    this.C9r_p.init = f
  }
  
  _p.doPrepare = eYo.doNothing
  _p.doInit = eYo.doNothing
  
  /**
   * Make the dispose method.
   */
  _p.makeC9rDispose = function () {
    let dispose_m = this.model__.dispose
    let C9r_s = this.C9r_s
    let dispose_s = C9r_s && C9r_s.dispose
    if (dispose_m) {
      if (XRegExp.exec(dispose_m.toString(), eYo.xre.function_builtin)) {
        if (dispose_s) {
          var f = function (...args) {
            try {
              this.dispose = eYo.doNothing
              dispose_m.call(this, () => {
                this.eyo.disposeInstance(this, ...args)
                dispose_s.call(this, ...args)              
              }, ...args)
            } finally {
              delete this.init
            }
          }
        } else {
          f = function (...args) {
            try {
              this.dispose = eYo.doNothing
              dispose_m.call(this, () => {
                this.eyo.disposeInstance(this, ...args)              
              }, ...args)
            } finally {
              delete this.init
            }
          }
        }
      } else if (dispose_s) {
        f = function (...args) {
          try {
            this.dispose = eYo.doNothing
            dispose_m.call(this, ...args)
            this.eyo.disposeInstance(this, ...args)
            dispose_s.call(this, ...args)
          } finally {
            delete this.init
          }
        }
      } else {
        f = function (...args) {
          try {
            this.dispose = eYo.doNothing
            dispose_m.call(this, ...args)
            this.eyo.disposeInstance(this, ...args)
          } finally {
            delete this.init
          }
        }
      }
    } else if (dispose_s) {
      f = function (...args) {
        try {
          this.dispose = eYo.doNothing
          this.eyo.disposeInstance(this, ...args)
          dispose_s.call(this, ...args)
        } finally {
          delete this.init
        }
      }
    } else {
      f = function (...args) {
        try {
          this.dispose = eYo.doNothing
          this.eyo.disposeInstance(this, ...args)
        } finally {
          delete this.init
        }
      }
    }
    this.C9r_p.dispose = f
  }

  /**
   * Prepare the constructor associated to the receiver.
   * 
   * @this {eYo.c9r.Dlgt}
   */
  _p.prepareC9r = function () {
    this.modelPrepare()
    this.makeC9rInit()
    this.makeC9rDispose()
  }
  /**
   * Prepare an instance.
   * Default implementation does nothing.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.prepareInstance = eYo.doNothing

  /**
   * Defined by subclassers.
   * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
   */
  _p.initInstance = eYo.doNothing

  /**
   * Defined by subclassers.
   */
  _p.disposeInstance = eYo.doNothing


  /**
   * Add a subclass
   * @param {Function} C9r - constructor
   */
  _p.addSubC9r = function (C9r) {
    eYo.isSubclass(C9r, this.C9r) || eYo.throw(`${C9r.eyo.name} is not a subclass of ${this.name}`)
    if (!this.subC9rs__) {
      console.error('BREAK!!! !this.subC9rs__')
    }
    this.subC9rs__.add(C9r)
  }
  
  /**
   * Iterator
   * @param {Function} helper
   * @param {Boolean} deep - Propagates when true.
   * @this {eYo.c9r.Dlgt}
   */
  _p.forEachSubC9r = function (f, deep) {
    if (eYo.isF(deep)) {
      [f, deep] = [deep, f]
    }
    this.subC9rs__.forEach(C9r => {
      f(C9r)
      deep && C9r.eyo.forEachSubC9r(f, deep)
    })
  }
  
  /**
   * Iterator
   * @param {Function} helper
   * @this {eYo.c9r.Dlgt}
   */
  _p.someSubC9r = function (f) {
    for (let C9r of this.subC9rs__) {
      let ans = f(C9r)
      if (ans) {
        return ans
      }
    }
  }
}

/**
 * Adds a delegate to the given constructor.
 * The added delegate is a singleton.
 * This is the recommended way to create a new delegate.
 * @param {Object} [ns] - The namespace owning the constructor
 * @param {String} key - The key associate to the constructor.
 * @param {Function} C9r - the constructor associate to the delegate
 * @param {Object} model - the model object associate to the delegate, used for extension.
 */
eYo.dlgt.new = function (ns, key, C9r, model) {
  // prepare
  if (eYo.isStr(ns)) {
    model && eYo.throw(`Unexpected model (1): ${model}`)
    ;[ns, key, C9r, model] = [eYo.NA, ns, key, C9r]
  } else {
    ns === eYo.NULL_NS || eYo.isNS(ns) || eYo.throw('Bad namespace')
  }
  !key || eYo.isStr(key) || eYo.throw(`Missing key string: ${key} in eYo.dlgt.new`)
  !eYo.isF(C9r) && eYo.throw(`Unexpected C9r: ${C9r} in eYo.dlgt.new`)
  eYo.isC9r(C9r) && eYo.throw(`Already a C9r: ${C9r} in eYo.dlgt.new`)
  // process
  let SuperC9r = C9r.SuperC9r
  let SuperDlgt = (SuperC9r && SuperC9r.eyo && SuperC9r.eyo.constructor) || eYo.dlgt.Base
  let Dlgt = function (ns, key, C9r, model) {
    SuperDlgt.call(this, ns, key, C9r, model)
  }
  eYo.inherits(Dlgt, SuperDlgt)
  ns === eYo.NULL_NS || eYo.isNS(ns) || (ns = SuperC9r.eyo.ns)
  // initialization of the dlgt
  // when defined, init must be a self contained function,
  // ie with no inherited reference...
  let dlgt_m = model.dlgt
  if (eYo.isF(dlgt_m)) {
    Dlgt.prototype.init = SuperDlgt
    ? function (...args) {
      this.init = eYo.doNothing
      SuperDlgt.prototype.init.call(this, ...args)
      dlgt_m.call(this, ...args)
    } : function (...args) {
      this.init = eYo.doNothing
      dlgt_m.call(this, ...args)
    }
  }
  if (SuperC9r) {
    SuperC9r.eyo.addSubC9r(C9r)
  }
  // in next function call, all the parameters are required
  // but some may be eYo.NA
  Dlgt.eyo__ = new eYo.dlgt.Base(ns, 'Base', Dlgt, {})
  return new Dlgt(ns, key, C9r, model)
}

// make a shared Dlgt for the namespaces too
eYo.dlgt.new(eYo, 'NS', eYo.constructor, {})
eYo.dlgt.declareDlgt(eYo._p)

// ANCHOR modelling
{

  let _p = eYo.dlgt.Base_p
  
  /**
   * Allow some model backbone.
   * This must be called once for any delegate, raises otherwise.
   * @name {eYo.c9r.Dlgt.modelAllow}
   */
  _p.modelAllow = function (...$) {
    if (this._p.hasOwnProperty('modelValidator_')) {
      eYo.throw('modelAllow cannot be called twice on the same delegate.')
    }
    let mv = this._p.modelValidator_ = new eYo.model.Validator()
    let ans = mv.allow(...$)
    this.prepareC9r()
    return ans
  }

  /**
   * @name {eYo.c9r.Dlgt.modelValidate}
   */
  _p.modelValidate = function (...$) {
    return this.modelValidator.validate(...$)
  }

  /**
   * @name{eYo.c9r.Dlgt.modelIsAllowed}
   * @return {Boolean} Whether the key is authorized with the given path.
   */
  _p.modelIsAllowed = function (...$) {
    return this.modelValidator.isAllowed(...$)
  }

  /**
   * Declare methods.
   * Allows to split the definition of methods into different files,
   * eventually.
   * If the method is a function with exactly one argument named 'overriden',
   * then we override the previously defined method.
   * The model object is a function decorator.
   * @param{Object} model - the model
   */
  _p.methodsMerge = function (model) {
    let _p = this.C9r_p
    Object.keys(model).forEach(k => {
      let m = model[k]
      eYo.isF(m) || eYo.throw(`Function expected: ${k}->${m}`)
      if (m.length === 1 && _p[k] && XRegExp.exec(m.toString(), eYo.xre.function_overriden)) {
        _p[k] = eYo.asF(m.call(this, eYo.toF(_p[k]).bind(this)))
      } else {
        _p[k] = m
      }
    })
  }
}

// ANCHOR: Model
{
  let _p = eYo.dlgt.Base_p // Base.prototype

  /**
   * Declare the given model for the associate constructor.
   * The default implementation just calls `methodsMerge`.
   * 
   * @param {Object} model - Object, like for |makeC9r|.
   */
  _p.modelMerge = function (model) {
    model.methods && this.methodsMerge(model.methods)
  }

  /**
   * Declare the given model for the associate constructor.
   * The default implementation just calls `modelMerge` after `modelValidate`.
   * Called by `prepareC9r`.
   * 
   * @param {Object} model - Object, like for |makeC9r|.
   */
  _p.modelPrepare = function () {
    let model = this.model
    if (Object.keys(model).length) {
      model = this.modelValidate(key, model)
      this.modelMerge(model)
    }
  }
}

// The delegate of `eYo.dlgt.Base` is an instance of itself.
new eYo.dlgt.Base(eYo.dlgt, 'Base…', eYo.dlgt.Base, {})
eYo.dlgt.Base.eyo.makeC9rInit()
eYo.dlgt.Base.eyo.makeC9rDispose()

eYo.dlgt.Base.eyo.modelAllow()

/**
 * This namespace method populates the namespace's base delegate
 * with some methods to manage a data model with many possible attributes.
 * 
 * @param{String} key - Key is one of 'p6y', 'data', 'field', 'slots'
 * @param{String} path - Path, the separator is '/'
 * @param{Object} [manyModel] - Object, read only.
 */
eYo.dlgt.Base_p.enhanceMany = function (key, path, manyModel = {}) {
  let _p = this._p
  /* fooModelByKey__ is a key -> model object with no prototype.
   * Void at startup.
   * Populated with the `...Merge` method.
   * Local to the delegate instance.
   */
  let kModelByKey__ = key + 'ModelByKey__' // local to the instance
  /* fooModelMap_ is a key -> model map.
   * It is computed from the fooModelByKey__ of the delegates and its super's.
   * Cached.
   */
  let kModelMap_  = key + 'ModelMap_'
  /* fooModelMap is a key -> model map.
   * Computed property that uses the cache above.
   * If the cache does not exist, reads super's fooModelMap
   * and adds the local fooModelByKey__.
   * Then caches the result in fooModelMap_.
   */
  let kModelMap   = key + 'ModelMap' // computed property
  let kPrepare    = key + 'Prepare'
  let kMerge      = key + 'Merge'
  let kInit       = key + 'Init'
  let KInit       = eYo.do.toTitleCase(key) + 'Init'
  let kDispose    = key + 'Dispose'
  let KDispose    = eYo.do.toTitleCase(key) + 'Dispose'
  let kForEach    = key + 'ForEach'
  let kSome       = key + 'Some'
  // object properties
  let kMap        = key + 'Map' // property defined on instances
  let kHead       = key + 'Head'
  let kTail       = key + 'Tail'
  /*
   * Lazy model getter:
   * 
   */
  Object.defineProperty(_p, kModelByKey__, {
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
      Object.defineProperty(this, kModelByKey__, {
        get () {
          return model
        }
      })
      return model
    },
    configurable: true,
  })

  /**
   * Expands the property, data, fields, slots section into the receiver's corresponding model.
   * Usage: For the model `{foo: bar}`, run `C9r.eyo.fooMerge(bar)`
   * @param{Object} source - A model object.
   */
  _p[kMerge] = function (source) {
    delete this[kModelMap] // delete the shortcut
    this.forEachSubC9r(C9r => C9r.eyo[kMerge]({})) // delete the cache of descendants
    ;(this.ns || eYo.c9r).modelExpand(source, path)
    let byKey = this[kModelByKey__]
    eYo.provideR(byKey, source)
  }
  Object.defineProperties(_p, {
    [kModelMap]: eYo.descriptorR(function () {
      let modelMap = this[kModelMap_] = new Map()
      let superMap = this.super && this.super[kModelMap]
      let map = superMap ? new Map(superMap) : new Map()
      if (this[kModelByKey__]) {
        for (let [k, v] of Object.entries(this[kModelByKey__])) {
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
          if (model.after) {
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
        [kModelMap]: eYo.descriptorR(function () {
          return this[kModelMap_]
        }, true)
      })
      return this[kModelMap_]
    }),
  })
  /**
   * The maker is responsible of making new `key` objects from a model.
   */
  let maker = manyModel.maker || function (object, k, model) {
    return eYo[key].new(object, k, model)
  }
  let makeShortcut = manyModel.makeShortcut || function (object, k, p) {
    let k_p = k + (manyModel.suffix || `_${key[0]}`)
    if (object.hasOwnProperty(k_p)) {
      console.error(`BREAK HERE!!! ALREADY object ${object.eyo.name}/${k_p}`)
    }
    Object.defineProperties(object, {
      [k_p]: eYo.descriptorR(function () {
        return this[kMap].get(k)
      }),
    })
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
   * 
   * @param{*} object - An instance being created.
   * @param{*} [model] - Must be falsy once an instance has already been created.
   */
  _p[kPrepare] = manyModel.prepare || function (object, model) {
    if (model) {
      // merge the given model with the existing one
      this[kMerge](model)
      this[kMerge] = function () {
        eYo.throw(`Do not change the model of ${this.name} once an instance has been created`)
      }
      var super_dlgt = this
      while ((super_dlgt = super_dlgt.super)) {
        super_dlgt.hasOwnProperty(kMerge) || (super_dlgt[kMerge] = this[kMerge])
      }
    }
    let attributes = []
    let map = object[kMap] = new Map()
    for (let [k, model] of this[kModelMap]) {
      let attr = maker(object, k, model)
      if (attr) {
        makeShortcut(object, k, attr)
        map.set(k, attr)
        attributes.push(attr)
      }
    }
    var attr = object[kHead] = attributes.shift()
    attributes.forEach(a => {
      try {
        attr.next = a
        a.previous = attr
        attr = a
      } catch(e) {
        console.error(e)
        console.error('BREAK HERE, it is no a property')
        attr.next = a
      }
    })
    object[kTail] = attributes.pop() || object[kHead]
  }
  /**
   * 
   */
  _p[kInit] = manyModel.init || function (object, ...$) {
    for (let v of object[kMap].values()) {
      let init = v && object[v.key + KInit]
      init && init.call(object, v, ...$)
      v.init && v.init(...$)
    }
  }
  _p[kDispose] = manyModel.dispose || function(object, ...$) {
    for (let v of object[kMap].values()) {
      if (v.owner === object) {
        let dispose = object[v.key + KDispose]
        dispose && dispose.call(object, v, ...$)
        v.dispose && v.dispose(...$)
      }
    }
    object.bindField = object[kHead] = object[kTail] = object[kModelByKey__] = eYo.NA
  }
  _p[kForEach] = function (object, $this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    for (let v of object[kMap].values()) {
      f.call($this, v)
    }
  }
  _p[kSome] = function (object, $this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    for (let v of object[kMap].values()) {
      if (f.call($this, v)) {
        return true
      }
    }
  }
}
