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
eYo.newNS('more')

//<<< mochai: Basic
//... chai.assert(eYo.more)
//>>>

/**
 * Add iterators to the given object.
 * When type is 'foo', iterators are 'fooForEach' and 'fooSome'.
 * They are base on an already existing 'fooMap' property pointing
 * to a Map object. We iterate over the map values.
 * @param{Object} _p - The object to be enhanced, in general a prototype.
 * @param{String} type - Key identifying a type
 */
eYo.more.iterators = function (_p, type) {
  //<<< eYo.more.iterators
  //... chai.assert(eYo.more.iterators)
  let tForEach = type + 'ForEach'
  let tSome = type + 'Some'
  let tMap = type + 'Map'
  _p[tForEach] = function ($this, f) {
    if (!eYo.isF(f)) {
      [$this, f] = [f, $this]
    }
    let map = this[tMap]
    map && map.forEach(v => f.call($this, v))
    //... var o = {}
    //... o.fooMap = new Map([[1, 4], [2, 2], [3, 1]])
    //... eYo.more.iterators(o, 'foo')
    //... chai.assert(o.fooForEach)
    //... o.fooForEach(v => eYo.flag.push(v))
    //... eYo.flag.expect(421)
  }
  _p[tSome] = function ($this, f) {
    if (!eYo.isF(f)) {
      [$this, f] = [f, $this]
    }
    let map = this[tMap]
    if (map) {
      for (let v of map.values()) {
        let ans = f.call($this, v)
        if (ans) {
          return ans
        }
      }
    }
    //... chai.assert(o.fooSome)
    //... chai.expect(o.fooSome(v => v === 2)).true
    //... chai.expect(!!o.fooSome(v => v === 3)).false
  }
  //... o = {}
  //... eYo.more.iterators(o, 'foo')
  //... o.fooForEach(y => {
  //...   eYo.flag.push(y)
  //... })
  //... eYo.flag.expect()
  //... chai.expect(!!o.fooSome(y => {
  //...   eYo.flag.push(y)
  //...   return y === 2
  //... })).false
  //... eYo.flag.expect()
  //... let m = o.fooMap = new Map()
  //... m.set(1,4)
  //... m.set(2,2)
  //... m.set(3,1)
  //... o.fooForEach(y => {
  //...   eYo.flag.push(y)
  //... })
  //... eYo.flag.expect(421)
  //... chai.expect(o.fooSome(y => {
  //...   eYo.flag.push(y)
  //...   return y === 2
  //... })).true
  //... eYo.flag.expect(42)
  //>>>
}

/**
 * @param{Object} eyo - A constructor delegate.
 * @param{String} type - One of 'p6y', 'data',...
 * @param{Boolean} thisIsOwner - whether `this` in the model, is the owner or the local object
 */
eYo.more.enhanceO3dValidate = function (eyo, type, thisIsOwner) {
  //<<< mochai: eYo.more.enhanceO3dValidate
  //... chai.assert(eYo.more.enhanceO3dValidate)

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
      if (eYo.isF(f_o) && !eYo.isVALID(ans = f_o.call(this.owner, this.key, before, ans))) {
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
        f_m && eYo.throw(`Unexpected model (${_p[eYo.$].name}/${key}) value validate -> ${f_m}`)
      }
    } : function(key, model) {
      let K = 'validate'
      let _p = this.C9r_p
      let f_p = _p[K] || function (before, after) {
        return after
      }
      let f_m = model[K]
      if (eYo.isF(f_m)) {
        if (f_m.length > 2) {
        // builtin/before/after
          _p[K] = eYo.decorate.reentrant(K, function (before, after) {
            return f_m.call(this, (before, after) => {
              return f_p.call(this, before, after)
            }, before, after)
          })
        } else if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
          _p[K] = eYo.decorate.reentrant(K, function (before, after) {
            return f_m.call(this, (after) => {
              return f_p.call(this, before, after)
            }, after)
          })
        } else {
          _p[K] = f_m.length > 1
            ? function (before, after) {
              try {
                this[K] = f_p
                return f_m.call(this, before, after)
              } finally {
                delete this[K]
              }
            } : function (before, after) {
              try {
                this[K] = f_p
                return f_m.call(this, after)
              } finally {
                delete this[K]
              }
            }
        }
      } else {
        f_m && eYo.throw(`Unexpected model (${_p[eYo.$].name}/${key}) value validate -> ${f_m}`)
      }
    }
  //>>>
}

/**
 * @param{Object} _p - In general a prototype.
 * @param{String} type - One of 'p6y', 'data',...
 * @param{Boolean} thisIsOwner - whether `this` in the model, is the owner or the local object
 */
eYo.more.override = function (_p, K, f) {
  //<<< mochai: eYo.more.override
  //... var o = {
  //...   flag (...$) {
  //...     eYo.flag.push(...$)
  //...   }
  //... }
  //... var f = function (overriden, ...$) {
  //...   overriden(...$)
  //...   this.flag(3)
  //... }
  let f_p = _p[K]
  eYo.isF(f_p) || eYo.throw(`eYo.more.override: Nothing to override`)
  //... chai.expect(() => {
  //...   eYo.more.override(o, 'foo', f)
  //... }).throw()
  //... o.foo = function (...$) {
  //...   eYo.flag.push(1)
  //...   this.flag(...$)
  //... }
  eYo.isF(f) && (f === eYo.doNothing || f.length && XRegExp.exec(f.toString(), eYo.xre.function_overriden)) || eYo.throw(`eYo.more.override: Bad overrider`)
  //... chai.expect(() => {
  //...   eYo.more.override(o, 'foo', 421)
  //... }).throw()
  //... chai.expect(() => {
  //...   eYo.more.override(o, 'foo', () => {})
  //... }).throw()
  //... chai.expect(() => {
  //...   eYo.more.override(o, 'foo', eYo.doReturn2nd)
  //... }).throw()
  _p[K] = function (...$) {
    f.call(this, f_p.bind(this), ...$)
  }
  //... o.foo(2)
  //... eYo.flag.expect(12)
  //... eYo.more.override(o, 'foo', f)
  //... o.foo(2)
  //... eYo.flag.expect(123)
  //... eYo.more.override(o, 'foo', f)
  //... o.foo(2)
  //... eYo.flag.expect(1233)
  //>>>
}
