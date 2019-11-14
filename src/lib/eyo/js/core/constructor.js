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
 * @param {!Object} params,  The dictionary of parameters.
 * 
 */
eYo.Constructor.make = (params) => {
  params.owner || (params.owner = params.super) || eYo.throw('Missing `super` property.')
  var ctor
  if (params.super === null) {
    ctor = params.owner[params.key] = function () {
      ctor.eyo__.init(this)
      params.f && params.f.call(this, arguments)
    }
  } else {
    ctor = params.owner[params.key] = function () {
      ctor.superClass_.constructor.call(this, arguments)
      ctor.eyo__.init(this)
      params.f && params.f.call(this, arguments)
    }
    eYo.Do.inherits(ctor, params.super || params.owner)
  }
  ctor.eyo__ = new eYo.Constructor.Dlgt(ctor, params)
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
  var f = k => {
    Object.defineProperty(object, k, {
      get () {
        return this[k + '__']
      },
      set() {
        throw "Forbidden setter"
      },
    })
  }
  this.forEachLink(f)
  this.forEachCached(f)
  this.forEachOwned(f)
  this.forEachClonable(f)
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
 * Override the init method
 * @param {Object} ctor,  a subclass of eYo.Constructor.Dlgt
 */
eYo.Constructor.overloadInit = (f) => {
  var old = eYo.Constructor.Dlgt.prototype.init
  eYo.Constructor.Dlgt.prototype.init = function () {
    old.apply(this, arguments)
    f.apply(this, arguments)
  }
}


/**
 * Add a link property.
 * The receiver is not the owner.
 * @param {String} k name of the link to add
 */
eYo.Constructor.Dlgt.prototype.declareLink_ = function (k) {
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
        set(after) {
          var before = this[k__]
          if (before !== after) {
            this[k__] = after
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
eYo.Constructor.Dlgt.prototype.declareLink = function (names) {
  names.forEach(k => {
    this.declareLink_(k)
  })  
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
eYo.Constructor.Dlgt.prototype.declareOwned_ = function (k, data) {
  this.owned_.add(k)
  const proto = this.ctor_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  Object.defineProperties(proto, {
    [k__]: {value: data.value || eYo.NA, writable: true},
    [k_]: {
      get: data.get || function () {
        return this[k__]
      },
      set: data.set
      ? function (after) {
        var before = this[k__]
        if(before !== after) {
          var f = data.willChange
          if (!f || (f = f(before, after))) {
            data.set(after)
            f && f(before, after)
          }
        }
      }
      : function (after) {
        var before = this[k__]
        if(before !== after) {
          var f = data.willChange
          if (!f || (f = f(before, after))) {
            if (before && before.hasUI && before.deleteUI) {
              before.deleteUI()
            }
            !!before && typeof before === "object" && (before.owner_ = null)
            this[k__] = after
            !!after && typeof after === "object" && (after.owner_ = this)
            f && f(before, after)
            f = data.didChange
            f && f(before, after)
            if (after && this.hasUI && after.initUI) {
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
  Object.keys(many).forEach(k => {
    this.declareOwned_(k, many[k])
  })  
}

/**
 * Add a 2 levels cached property to the receiver's constructor's prototype.
 * @param {String} key,  the key
 * @param {Object} data,  the data object, must have a `get` key and
 * may have a `forget` key.
 */
eYo.Constructor.Dlgt.prototype.declareCached_ = function (k, data) {
  this.cached_.add(k)
  var proto = this.ctor_.prototype
  var k_ = k + '_'
  var k__ = k + '__'
  Object.defineProperties(proto, {
    [k__]: {value: eYo.NA, writable: true},
    [k_]: {
      get () {
        var v = this[k__]
        return v !== eYo.NA ? v : (this[k__] = data.get.call(this))
      },
      set () {
        throw 'Forbidden setter'
      }
    }
  })
  this.forget_ || (this.forget_ = Object.create(null))
  proto[k+'Uncache'] = this.forget_[k] = data.forget
  ? function () {
    this[k__] = eYo.NA
    data.forget.call(this)
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
 * @param {Array<String>} many,  the K => V mapping to which we apply `declareClonable_(K, V)`.
 */
eYo.Constructor.Dlgt.prototype.declareClonable = function (many) {
  var proto = this.ctor_.prototype
  many.forEach(k => {
    this.clonable_.add(k)
    var k_ = k + '_'
    var k__ = k + '__'
    Object.defineProperties(proto, {
      [k__]: {value: eYo.NA, writable: true},
      [k_]: {
        get() {
          return this[k__].clone
        },
        set (after) {
          var before = this[k__]
          var f = () => {
            this[k__].set(after)
          }
          if (!before.equals(after)) {
            this.wrapUpdate && this.wrapUpdate(f) || f()
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
  this.forEachOwned(k__ => {
    var k__ = name + '__'
    var x = object[k__]
    if (x) {
      object[k__] = null
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
  this.forEachClonable(k__ => {
    var k__ = name + '__'
    var x = object[k__]
    if (x) {
      object[k__] = null
      x.dispose()
    }
  })
}
