/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Utility to add methors or attributes to objects.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.forward('o3d')
eYo.forward('do')
eYo.forward('xre')
eYo.forward('decorate')

/**
 * @name{eYo.more}
 * @namespace
 */
eYo.makeNS('more')

/**
 * Add iterators to the given object.
 * When key is 'foo', iterators are 'fooForEach' and 'fooSome'.
 * They are base on an already existing 'fooMap__' property pointing
 * to a Map object.
 * @param{Object} what - The object to be enhanced.
 * @param{String} k - Key
 */
eYo.more.iterators = function (what, key) {
  let kForEach = key + 'ForEach'
  let kSome = key + 'Some'
  let kMap = key + 'Map'
  what[kForEach] = function ($this, f) {
    if (!eYo.isF(f)) {
      [$this, f] = [f, $this]
    }
    let map = this[kMap]
    map && map.forEach((_, v) => f.call($this, v))
  }
  what[kSome] = function ($this, f) {
    if (!eYo.isF(f)) {
      [$this, f] = [f, $this]
    }
    let map = this[kMap]
    if (map) {
      for (let [_, v] of map) {
        if (f.call($this, v)) {
          return true
        }
      }
    }
  }
}

/**
 * @param{Object} eyo - A constructor delegate.
 * @param{String} type - One of 'p6y', 'data',...
 * @param{Boolean} thisIsOwner - whether `this` in the model, is the owner or the local object
 */
eYo.more.enhanceO3dValidate = function (eyo, type, thisIsOwner) {

  eyo instanceof eYo.o3d.Dlgt || eYo.throw(`Bar parameter ${this.name}/enhanceO3dValidate needs an instance of eYo.o3d.Dlgt instead fo ${eyo}`)

  /**
   * Fallback to validate the value of the attribute;
   * Default implementation forwards to an eventual `fooValidate` method
   * of the owner, where `foo` should be replaced by the key of the receiver.
   * Validation chain of the attribute 'foo' of type 'bar': normal flow
   * 1) the model's validate method if any
   * 2) the owner's `barValidate` if any
   * 3) the owner's `fooBarValidate` if any
   * Notice that the `barValidate` is shared by all attributes of the same type.
   * When in builtin flow, only the model's validate method is called.
   * The `barValidate` and `fooBarValidate` are passed to the model's validate as formal parameter named `builtin`.
   * @param {Object} before
   * @param {Object} after
   */
  eyo.C9r_p.validate = function (before, after) {
    var ans = after
    if (this.owner && eYo.isVALID(ans)) {
      var f_o = this.owner[type + 'Validate']
      if (eYo.isF(f_o) && !eYo.isVALID(ans = f_o.call(this.owner, before, ans))) {
        return ans
      }
      if (this.key) {
        f_o = this.owner[this.key + eYo.do.toTitleCase(type) + 'Validate']
        if (eYo.isF(f_o) && !eYo.isVALID(ans = f_o.call(this.owner, before, ans))) {
          return ans
        }
      }
    }
    return ans
  }
  /**
   * Turns the `validate` entry of the model into a validate method
   * @param{Object} _p - In general a prototype
   * @param{String} key - The key used in object constructors.
   * @param{Object} model - Models used in constructors.
   */
  eyo._p.modelHandleValidate = thisIsOwner
  ? function(key, model) {
    let K = 'validate'
    let _p = this.C9r_p
    let f_m = model[K]
    let f_p = _p[K] || eYo.doReturn2nd
    if (eYo.isF(f_m)) {
      if (f_m.length > 2) {
        // builtin/before/after
        _p[K] = function (before, after) {
          return f_m.call(this.owner, f_p.bind(this), before, after)
        }
      } else if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
        _p[K] = function (before, after) {
          return f_m.call(this.owner, ($after) => {
            return f_p.call(this, before, $after)
          }, after)
        }
      } else {
        _p[K] = f_m.length > 1
        ? function (before, after) {
          return f_m.call(this.owner, before, after)
        } : function (before, after) {
          return f_m.call(this.owner, after)
        }
      }
    } else {
      f_m && eYo.throw(`Unexpected model (${_p.eyo.name}/${key}) value validate -> ${f_m}`)
    }
  } : function(key, model) {
    let _p = this.C9r_p
    let validate_m = model[K]
    let validate_p = _p[K] || function (before, after) {
      return after
    }
    if (eYo.isF(validate_m)) {
      if (validate_m.length > 2) {
        // builtin/before/after
        _p[K] = eYo.decorate.reentrant('validate', function (before, after) {
          return validate_m.call(this, (before, after) => {
            return validate_p.call(this, before, after)
          }, before, after)
        })
      } else if (XRegExp.exec(validate_m.toString(), eYo.xre.function_builtin)) {
        _p[K] = eYo.decorate.reentrant('validate', function (before, after) {
          return validate_m.call(this, (after) => {
            return validate_p.call(this, before, after)
          }, after)
        })
      } else {
        _p[K] = validate_m.length > 1
        ? function (before, after) {
          try {
            this[K] = validate_p
            return validate_m.call(this, before, after)
          } finally {
            delete this[K]
          }
        } : function (before, after) {
          try {
            this[K] = validate_p
            return validate_m.call(this, after)
          } finally {
            delete this[K]
          }
        }
      }
    } else {
      validate_m && eYo.throw(`Unexpected model (${_p.eyo.name}/${key}) value validate -> ${validate_m}`)
    }
  }
}