/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Utility to make a constructor with some edython specific data storage and methods.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Do')

goog.provide('eYo.Constructor')

/**
 * Make a constructor with an 'eyo__' property.
 * Caveat, constructors must have the same arguments.
 * Use a key->value design if you do not want that.
 * The `params` object has template: `{key: String, f: function, owner: Object, super: superClass}`
 * @param {!Object} model,  The dictionary of parameters.
 * 
 */
eYo.Constructor.make = (model) => {
  model.owner || (model.owner = model.super) || eYo.throw('Missing `super` property.')
  var ctor
  if (model.super === null) {
    ctor = model.owner[model.key] = function () {
      ctor.eyo__.init(this)
      model.f && model.f.call(this, arguments)
    }
  } else {
    ctor = model.owner[model.key] = function () {
      ctor.superClass_.constructor.call(this, arguments)
      ctor.eyo__.init(this)
      model.f && model.f.call(this, arguments)
    }
    eYo.Do.inherits(ctor, model.super || model.owner)
  }
  ctor.eyo__ = new eYo.Constructor.Dlgt(ctor, model)
  ctor.eyo__.makeDispose = (f) => {
    ctor.prototype.dispose = function () {
      f && f.apply(this, arguments)
      ctor.eyo__.dispose(this)
      var super_ = ctor.superClass_
      super_ && super_.dispose.apply(this, arguments)
    }
  }
  ctor.eyo__.makeDispose()
  Object.defineProperty(ctor.prototype, 'eyo', {
    get () {
      return ctor.eyo__
    },
    set () {
      throw 'Forbidden setter'
    }
  })
  Object.defineProperty(ctor, 'eyo', {
    get () {
      return this.eyo__
    },
    set () {
      throw 'Forbidden setter'
    }
  })
}

/**
 * Object adding data to a constructor in a safe way.
 * @param {!Object} ctor,  the object to which this instance is attached.
 * @param {!String} name,  the key used when the constructor was created.
 * @constructor
 * @readonly
 * @property {Set<String>} link_ - Set of link identifiers. Lazy initializer.
 * @readonly
 * @property {Set<String>} owned_ - Set of link identifiers. Lazy initializer.
 * @readonly
 * @property {Set<String>} clonable_ - Set of link identifiers. Lazy initializer.
 * @readonly
 * @property {Set<String>} cached_ - Set of cached identifiers. Lazy initializer.
 */
eYo.Constructor.Dlgt = function (ctor, model) {
  this.ctor_ = ctor
  this.name_ = model.key
  var props = model.props
  if (props) {
    props.link && this.declareLink(props.link)
    props.owned && this.declareOwned(props.owned)
    props.cached && this.declareCached(props.cached)
    props.clonable && this.declareClonable(props.clonable)
  }
}

Object.defineProperties(eYo.Constructor.Dlgt.prototype, {
  ctor: {
    get () {
      return this.ctor_
    },
    set () {
      throw 'Forbidden setter'
    }
  },
  name: {
    get () {
      return this.name_
    },
    set () {
      throw 'Forbidden setter'
    }
  },
  super: {
    get () {
      var ctor = this.ctor_.superClass_
      return ctor && ctor.constructor.eyo
    }
  },
})

;['owned', 'clonable', 'link', 'cached'].forEach(k => {
  var k_ = k + '_'
  var k__ = k + '__'
  Object.defineProperty(eYo.Constructor.Dlgt.prototype, k_, {
    get () {
      return this[k__] || (this[k__] = new Set())
    }
  })
  /**
   * Owned enumerating loop.
   * @param {Function} helper,  signature (name) => {...}
   */
  var name = 'forEach' + k[0].toUpperCase() + k.substring(1)
  eYo.Constructor.Dlgt.prototype[name] = function (f) {
    this[k__] && this[k__].forEach(f)
  }
})

/**
 * Initialize an instance with link, cached, owned and clonable properties.
 * Default implementation forwards to super.
 * @param {Object} instance,  instance is an instance of a subclass of the `ctor_` of the receiver
 */
eYo.Constructor.Dlgt.prototype.init = function (object) {
  var suffix = '__'
  var f = k => {
    Object.defineProperty(object, k, {
      get () {
        return this[k + suffix]
      },
      set() {
        throw "Forbidden setter"
      },
    })
  }
  this.forEachLink(f)
  this.forEachOwned(f)
  this.forEachClonable(f)
  suffix = '_'
  this.forEachCached(f)
  this.forEachClonable(k => {
    var k__ = k + '__'
    object[k__] = this.initClonable_[k].call(this)
  })
}

/**
 * Dispose of the resources declared at that level.
 * @param {Object} instance,  instance is an instance of a subclass of the `ctor_` of the receiver
 */
eYo.Constructor.Dlgt.prototype.dispose = function (object) {
  this.clearLink_(object)
  this.forgetCached_(object)
  this.disposeOwned_(object)
  this.disposeClonable_(object)
}

/**
 * Add a link property.
 * The receiver is not the owner.
 * @param {String} k name of the link to add
 * @param {Object} model Object with `willChange` and `didChange` keys,
 * f any.
 */
eYo.Constructor.Dlgt.prototype.declareLink_ = function (k, model) {
  this.link_.add(k)
  const proto = this.ctor_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  Object.defineProperties(
    proto, 
    {
      [k__]: {value: eYo.NA, writable: true},
      [k_]: {
        get () {
          return this[k__]
        },
        set (after) {
          var before = this[k__]
          if (before !== after) {
            var f = model && model.willChange
            if (!f || (f = f(before, after))) {
              var ff = this[k + 'WillChange']
              ff && ff.call(this, before, after)
              this[k__] = after
              f && f(before, after)
              f = model && model.didChange
              f && f(before, after)
              ff && ff.call(this, before, after)
              ff = this[k + 'DidChange']
              ff && ff.call(this, before, after)
            }
          }
        },
      },
    }
  )
}

/**
 * Add a link properties.
 * The receiver is not the owner.
 * @param {Object} constructor,  Its prototype object gains a storage named `foo__` and both getters and setters for `foo_`.
 * The initial value is `eYo.NA`.
 * @param {Array<String>} names names of the link to add
 */
eYo.Constructor.Dlgt.prototype.declareLink = function (model) {
  if (model.forEach) {
    model.forEach(k => {
      this.declareLink_(k)
    })
  } else {
    Object.keys(model).forEach(k => {
      this.declareLink_(k, model[k])
    })
  }
}

/**
 * Dispose in the given object, the link given by the constructor.
 * @param {Object} object,  an instance of the receiver's constructor,
 * or one of its subclasses.
 */
eYo.Constructor.Dlgt.prototype.clearLink_ = function (object) {
  this.forEachLink(k => {
    var k_ = k + '_'
    var x = object[k_]
    if (x) {
      object[k_] = eYo.NA
    }
  })
}

//// Properties

/**
 * Add a 3 levels property to a prototype.
 * `key__` is the basic private recorder.
 * `key_` is the basic private setter/getter.
 * Changing this property is encapsulated between `willChange` and `didChange` methods.
 * `k` is the public getter.
 * In the setter, we arrange things such that the new value
 * and the receiver have the same status with respoct to UI. 
 * The `get` and `set` keys allow to provide a getter and a setter.
 * In that case, the setter should manage ownership if required.
 * Add an owned object.
 * The receiver is not the owner.
 * @param {String} k name of the owned to add
 * @param {Object} data,  the object used to define the property: key `value` for the initial value, key `willChange` to be called when the property is about to change (signature (before, after) => function, truthy when the change should take place). The returned value is a function called after the change has been made in memory.
 */
eYo.Constructor.Dlgt.prototype.declareOwned_ = function (k, model = {}) {
  this.owned_.add(k)
  const proto = this.ctor_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  Object.defineProperties(proto, {
    [k__]: {value: model.value || eYo.NA, writable: true},
    [k_]: {
      get: model.get || function () {
        return this[k__]
      },
      set: model.set
      ? function (after) {
        var before = this[k__]
        if(before !== after) {
          var f = model.willChange
          if (!f || (f = f(before, after))) {
            model.set.call(this, after)
            f && f(before, after)
          }
        }
      }
      : function (after) {
        var before = this[k__]
        if(before !== after) {
          var f = model.willChange
          if (!f || (f = f(before, after))) {
            var ff = this[k + 'WillChange']
            ff && ff.call(this, before, after)
            if (!!before && before.hasUI && before.deleteUI) {
              before.deleteUI()
            }
            if (!!before && before.owner_) {
              if (before.ownerKey_ && before.ownerKey_ !== k_) {
                before.owner_[before.ownerKey_] = eYo.NA
              } else {
                before.owner_ = before.ownerKey_ = eYo.NA
              }
            }
            this[k__] = after
            if (after) {
              if (after.owner_) {
                after.owner_[after.ownerKey_] = eYo.NA
              }
              after.ownerKey_ = k_
              after.owner_ = this
            } else if (typeof after === "object") {
              after.ownerKey_ = k_
              after.owner_ = this
            }
            f && f(before, after)
            f = model.didChange
            f && f(before, after)
            ff && ff.call(this, before, after)
            ff = this[k + 'DidChange']
            ff && ff.call(this, before, after)
            if (!!after && this.hasUI && after.initUI) {
              after.initUI()
            }
          }
        }
      },
    }
  })
}

/**
 * Add an owned property.
 * The receiver is the owner.
 * @param {Object} many  key -> data map.
 */
eYo.Constructor.Dlgt.prototype.declareOwned = function (many) {
  if (many.forEach) {
    many.forEach(k => {
      this.declareOwned_(k)
    })
  } else {
    Object.keys(many).forEach(k => {
      this.declareOwned_(k, many[k])
    })  
  }
}

/**
 * Add a 2 levels cached property to the receiver's constructor's prototype.
 * @param {String} key,  the key
 * @param {Object} model,  the model object, must have a `get` key and
 * may have a `forget` key.
 */
eYo.Constructor.Dlgt.prototype.declareCached_ = function (k, model) {
  this.cached_.add(k)
  var proto = this.ctor_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  Object.defineProperties(proto, {
    [k__]: {value: eYo.NA, writable: true},
    [k_]: {
      get () {
        var v = this[k__]
        return v === eYo.NA ? (this[k__] = model.get.call(this)) : v
      },
      set () {
        throw 'Forbidden setter'
      }
    }
  })
  this.forget_ || (this.forget_ = Object.create(null))
  proto[k+'Forget'] = this.forget_[k] = model.forget
  ? function () {
    this[k__] = eYo.NA
    model.forget.call(this)
  } : function () {
    this[k__] = eYo.NA
  }
}

/**
 * Add 3 levels cached properties to a prototype.
 * @param {Object} many,  the K => V mapping to which we apply `declareCached_(K, V)`.
 */
eYo.Constructor.Dlgt.prototype.declareCached = function (many) {
  Object.keys(many).forEach(n => {
    this.declareCached_(n, many[n])
  })
}

/**
 * Forget all the cached values.
 */
eYo.Constructor.Dlgt.prototype.forgetCached_ = function () {
  this.forEachCached(n => {
    this.forget_[n].call(this)
  })
}

/**
 * Add the cached `app` property to the given prototype.
 * @param {Object} proto
 */
eYo.Constructor.Dlgt.prototype.addApp = function () {
  this.declareCached_('app', {
    get () {
      return this.owner__.app
    },
    forget () {
      var f = this.eyo.forget_['ui_driver']
      f && f.call(this)
    }
  })
}

/**
 * Add a 3 levels clonable property to a prototype.
 * `foo` is a clonable object means that `foo.clone` is a clone of `foo`
 * and `foo.set(bar)` will set `foo` properties according to `bar`.
 * @param {Map<String, Function>} model,  the key => Function mapping.
 */
eYo.Constructor.Dlgt.prototype.declareClonable = function (model) {
  this.initClonable_ || (this.initClonable_ = Object.create(null))
  var proto = this.ctor_.prototype
  Object.keys(model).forEach(k => {
    this.clonable_.add(k)
    this.initClonable_[k] = model[k]
    var k_ = k + '_'
    var k__ = k + '__'
    Object.defineProperties(proto, {
      [k__]: {value: eYo.KeyHandler, writable: true},
      [k_]: {
        get() {
          return this[k__].clone
        },
        set (after) {
          var before = this[k__]
          if (!before) {
            if (!after) {
              return
            }
            var setter = () => {
              this[k__] = after.clone
            }
            var f = model.willChange
            if (!f || (f = f(before, after))) {
              var ff = this[k + 'WillChange']
              ff && ff.call(this, before, after)
              this.wrapUpdate && this.wrapUpdate(setter) || setter()
              if (after.owner_) {
                after.owner_[after.ownerKey_] = eYo.NA
              }
              after.ownerKey_ = k_
              after.owner_ = this
              f && f(before, after)
              f = model.didChange
              f && f(before, after)
              ff && ff.call(this, before, after)
              ff = this[k + 'DidChange']
              ff && ff.call(this, before, after)
              if (!!after && this.hasUI && after.initUI) {
                after.initUI()
              }
            }
          } else if (before.equals(after)) {
            return
          }
          var f = model.willChange
          if (!f || (f = f(before, after))) {
            var ff = this[k + 'WillChange']
            ff && ff.call(this, before, after)
            if (!after && before.hasUI && before.deleteUI) {
              before.deleteUI()
            }
            if (!after) {
              before.owner_ = before.ownerKey_ = eYo.NA
            }
            var setter = () => {
              this[k__].set(after)
            }
            if (!!after && !!after.ownerKey_) {
              after.owner_[after.ownerKey_] = eYo.NA
            }
            this.wrapUpdate && this.wrapUpdate(setter) || setter()
            if (typeof after === "object") {
              after.ownerKey_ = k_
              after.owner_ = this
            }
            f && f(before, after)
            f = model.didChange
            f && f(before, after)
            ff && ff.call(this, before, after)
            ff = this[k + 'DidChange']
            ff && ff.call(this, before, after)
            if (!!after && this.hasUI && after.initUI) {
              after.initUI()
            }
          }
        },
      },
    })
  })
}

/**
 * Dispose in the given object, the properties given by their main name.
 * @param {Object} object, the object that owns the property
 * @param {Array<string>} names,  a list of names
 */
eYo.Constructor.Dlgt.prototype.disposeOwned_ = function (object) {
  this.forEachOwned(k => {
    var k_ = k + '_'
    var k__ = k + '__'
    var x = object[k__]
    if (x) {
      object[k_] = eYo.NA
      x.dispose()
    }
  })
}

/**
 * Dispose in the given object, the properties given by their main name.
 * @param {Object} object, the object that owns the property
 * @param {Array<string>} names,  a list of names
 */
eYo.Constructor.Dlgt.prototype.disposeClonable_ = function (object) {
  this.forEachClonable(k => {
    var k__ = k + '__'
    var x = object[k__]
    if (x) {
      object[k__] = eYo.NA
      x.dispose()
    }
  })
}
