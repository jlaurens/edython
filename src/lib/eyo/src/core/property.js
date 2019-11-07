/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Protocol utilities.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Property')

goog.require('eYo')

/**
 * Add a 3 levels property to a prototype.
 * `key__` is the basic private recorder.
 * `key_` is the basic private setter/getter.
 * Changing this property is encapsulated between `willChange` and `didChange` methods.
 * `key` is the public getter.
 * @param {Object} proto,  the object to add a property to
 * @param {Object} data,  the object used to define the property: key `value` for the initial value, key `willChange` to be called when the property is about to change (signature (before, after) => function, truthy when the change should take place). The returned value is a function called after the change has been made in memory.
 * The `get` and `set` keys allow to provide a getter and a setter.
 * In that case, the setter should manage ownership if required.
 */
eYo.Property.add = (proto, key, data) => {
  var getter = (key) => {
    return data.get || function () {
      return this[key]
    }
  }
  var setter = (key) => {
    return data.set ?
    function (after) {
      var before = this[key]
      if(before !== after) {
        var f = data.willChange
        if (!f || (f = f(before, after))) {
          data.set(after)
          f && f(before, after)
        }
      }
    }:
    function (after) {
      var before = this[key]
      if(before !== after) {
        var f = data.willChange
        if (!f || (f = f(before, after))) {
          !!before && typeof before === "object" && (before.owner_ = null)
          this[key] = after
          !!after && typeof after === "object" && (after.owner_ = this)
          f && f(before, after)
        }
      }
    }
  }
  Object.defineProperty(
    proto,
    key+'__',
    {value: data.value || eYo.VOID, writable: true}
  )
  Object.defineProperty(
    proto,
    key+'_',
    {
      get: getter(key+'_'),
      set: setter(key+'_'),
    }
  )
  Object.defineProperty(
    proto,
    key,
    {
      get: getter(key),
    }
  )
}

/**
 * Add 3 levels properties to a prototype.
 * @param {Object} proto,  the object to add a property to
 * @param {Object} many,  the K => V mapping to which we apply `eYo.Property.add(proto, K, V)`.
 */
eYo.Property.addMany = (proto, many) => {
  Object.keys(many).forEach(n => {
    eYo.Property.add(proto, n, many[n])
  })
}

/**
 * Add a 3 levels clonable property to a prototype.
 * @param {Object} proto,  the object to add a property to
 * @param {Object} many,  the K => V mapping to which we apply `eYo.Property.addClonables(proto, K)`.
 */
eYo.Property.addClonables = (proto, ...many) => {
  var getter = (key) => {
    return function () {
      return this[key].clone
    }
  }
  var setter = (key) => {
    return function (after) {
      var k = key + '_'
      var before = this[k]
      var f = () => {
        this[k].set(after)
      }
      if (!before.equals(after)) {
        this.wrapUpdate && this.wrapUpdate(f) || f()
      }
    }
  }
  many.forEach(key => {
    Object.defineProperty(
      proto,
      key+'__',
      {value: eYo.VOID, writable: true}
    )
    Object.defineProperty(
      proto,
      key+'_',
      {
        get: getter(key+'_'),
        set: setter(key+'_'),
      }
    )
    Object.defineProperty(
      proto,
      key,
      {
        get: getter(key),
      }
    )
  })
}

/**
 * Add a link properties.
 * The receiver is not the owner.
 * @param {Object} object, the object that owns the property
 * @param {String} ...names names of the links to add
 */
eYo.Property.addLinks = (proto, ...many) => {
  var getter = (key) => {
    return function () {
      return this[key]
    }
  }
  var setter = (key) => {
    return function (after) {
      var before = this[key]
      if (before !== after) {
        this[key] = after
      }
    }
  }
  many.forEach(key => {
    Object.defineProperty(
      proto,
      key+'_',
      {value: eYo.VOID, writable: true}
    )
    Object.defineProperty(
      proto,
      key,
      {
        get: getter(key+'_'),
        set: setter(key+'_'),
      }
    )
  })
}

/**
 * Dispose in the given object, the properties given by their main name.
 * @param {Object} object, the object that owns the property
 * @param {Array<string>} names,  a list of names
 */
eYo.Property.dispose = function (object, ...names) {
  names.forEach(name => {
    var k = name + '__'
    var x = object[k]
    if (x) {
      object[k] = null
      x.dispose()
    }
  })
}

/**
 * Dispose in the given object, the properties given by their main name.
 * @param {Object} object, the object that owns the property
 * @param {Object} names,  a list of names
 */
eYo.Property.removeLinks = function (object, ...names) {
  names.forEach(name => {
    var k = name + '_'
    var x = object[k]
    if (x) {
      object[k] = null
    }
  })
}

/**
 * Dispose in the given clonable object, the properties given by their main name.
 * @param {Object} object, the object that owns the property
 * @param {...names} names,  a list of names
 */
eYo.Property.disposeClonables = eYo.Property.dispose
