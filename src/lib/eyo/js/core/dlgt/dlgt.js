/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
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
eYo.newNS('dlgt')

eYo.mixinRO(eYo, {
  //<<< mochai: symbols
  $: Symbol('$'),
  $_p: Symbol('$_p'),
  $SuperC9r: Symbol('SuperC9r'),
  $SuperC9r_p: Symbol('SuperC9r_p'),
  //... chai.expect(!eYo.$).false
  //... chai.expect(!eYo.$_p).false
  //... chai.expect(!eYo.$SuperC9r).false
  //... chai.expect(!eYo.$SuperC9r_p).false
  //>>>
})

eYo.mixinFR(eYo._p, {
  /**
   * Contrary to goog.inherits, does not erase the childC9r.prototype.
   * IE<11
   * No delegation managed yet.
   * @param {Function} ChildC9r
   * @param {Function} SuperC9r
   */
  inherits (ChildC9r, SuperC9r) {
    ChildC9r[eYo.$SuperC9r] = SuperC9r
    let Super_p = SuperC9r.prototype
    let Child_p = ChildC9r.prototype
    ChildC9r[eYo.$SuperC9r_p] = Child_p[eYo.$SuperC9r_p] = Super_p
    Object.setPrototypeOf(Child_p, Super_p)
    Object.defineProperty(Child_p, 'constructor', {
      value: ChildC9r
    })
    //<<< mochai: eYo.isSubclass | eYo.inherits
    //... chai.assert(eYo.isSubclass)
    //... chai.expect(eYo.isSubclass()).false
    //... chai.expect(eYo.isSubclass(123)).false
    //... chai.expect(eYo.isSubclass(123, 421)).false
    //... let SuperC9r = function () {}
    //... chai.expect(eYo.isSubclass(SuperC9r, SuperC9r)).true
    //... let ChildC9r = function () {}
    //... chai.expect(eYo).property('inherits')
    //... eYo.inherits(ChildC9r, SuperC9r)
    //... chai.expect(eYo.isSubclass(ChildC9r, SuperC9r)).true
    //... chai.expect(ChildC9r[eYo.$SuperC9r_p]).equal(ChildC9r.prototype[eYo.$SuperC9r_p]).equal(SuperC9r.prototype)
    //>>>
  },
  /**
   * Whether the argument is a constructor, in edython paradigm.
   * Such a constructor is a function with an `[eYo.$]` property pointing to
   * a delegate. It is not advisable to change this property on the fly.
   * @param {*} What
   * @return {!Boolean}
   */
  isC9r (What) {
    return !!What && !!What[eYo.$] && eYo.isF(What)
  },
})

/**
 * Declare javascript computed properties pointing to the receiver's delegate.
 * Each namespace also have a delegate.
 * @name {eYo.dlgt.declareDlgt}
 * @param {Object} _p - A prototype
 */
eYo.dlgt.declareDlgt = function (_p) {
  eYo.mixinRO(_p, {
    [eYo.$] () {
      return this.constructor[eYo.$]
    },
    eyo () {
      return this.constructor[eYo.$]
    },
  })
}

//<<< mochai: ../
//... var C9r
//... let preparator = f => {
//...   return model => {
//...     C9r = function (...$) {
//...       this.init && this.init(...$)
//...     }
//...     let eyo = eYo.dlgt.new('foo', C9r, model || {})
//...     eYo.dlgt.declareDlgt(C9r.prototype)
//...     chai.expect(C9r[eYo.$]).equal(eyo)
//...     chai.expect(C9r.prototype.eyo).equal(eyo)
//...     let _p = C9r.prototype
//...     _p.flag = function (...$) {
//...       flag.push(1, ...$)
//...     }
//...     _p.doPrepare = function (...$) {
//...       this.flag(2, ...$) 
//...     }
//...     _p.doInit = function (...$) {
//...       this.flag(3, ...$) 
//...     }
//...     f && f(_p)
//...     eyo.finalizeC9r()
//...   }
//... }
//>>>

//... var NS = eYo.newNS()
//... var key = 'foo'
//... var $id = Symbol('foo')
//... var C9r = function () {}
//... model = {}
//... var dlgt = new eYo.dlgt.BaseC9r(NS, key, C9r, model)

/**
 * This is a root class, not to be subclassed except in singletons.
 * Any constructor's delegate is an instance of this subclass.
 * @param {Object} NS - Namespace, can be eYo.NULL_NS
 * @param {String|Symbol} [id] - a unique key or symbol within the namespace...
 * @param {Function} C9r - the associate constructor
 * @param {Object} model - the model used for extension
 */
/* The problem of constructor delegation is the possibility of an infinite loop :
  object->constructor->eyo->contructor->eyo->constructor->[eYo.$]...
  The Base is its own delegate's constructor
*/
eYo.dlgt.BaseC9r = function (ns, id, C9r, model) {
  //<<< mochai: eYo.dlgt.BaseC9r
  //... chai.expect(eYo.dlgt).property('BaseC9r')
  if (ns && !eYo.isNS(ns)) {
    model && eYo.throw(`eYo.dlgt.BaseC9r: unexpected model (${model})`)
    //... chai.expect(() => {new eYo.delegate.BaseC9r(1, 2, 3, 4)}).throw()
    ;[ns, id, C9r, model] = [eYo.NA, ns, id, C9r]
  }
  var $id, key
  if (ns) {
    if (eYo.isSym(id)) {
      [$id, key] = [id, id.description]
    } else {
      if (eYo.isStr(id)) {
        key = id
      } else {
        [id, C9r, model] = [eYo.NA, id, C9r]
        key = '?'
        this.anonymous = true
      }
      $id = Symbol(`${ns.name}.${key}`)
    }
  } else if (eYo.isSym(id)) {
    [$id, key] = [id, id.description]
  } else {
    if (eYo.isStr(id)) {
      key = id
    } else {
      key = '?'
      this.anonymous = true
    }
    $id = Symbol(`(...).${key}`)
  }

  Object.defineProperties(this, {
    ns__: { value: eYo.isNS(ns) ? ns : eYo.NA },
    $id__: {value: $id},
    key__: {value: key},
    C9r__: { value: C9r },
    model__: { value: model },
    subC9rs__: { value: new Set() }, // change it to map ?
  })
  //... chai.expect(dlgt.ns).equal(NS)
  //... chai.expect(dlgt.key__).equal(key)
  //... chai.expect(dlgt.$id__.description).equal(`(eYo).${key}`)
  //... chai.expect(dlgt.C9r__).equal(C9r)
  //... chai.expect(dlgt.model__).equal(model)
  var $this = this
  eYo.mixinRO(C9r, {
    [eYo.$] () {
      return $this
    },
    [eYo.$_p] () {
      return $this._p
    },
  })
  //... chai.expect(C9r[eYo.$]).equal(dlgt)
  //... chai.expect(C9r[eYo.$_p]).equal(dlgt._p)
  this.init()
  //>>>
}

Object.defineProperties(eYo, {
  Dlgt: {
    value: eYo.dlgt.BaseC9r,
  },
})

eYo.mixinFR(eYo, {
  //<<< mochai: isaDlgt
  isaDlgt (object) {
    return object && object instanceof eYo.Dlgt
  }
  //... chai.expect(eYo.isaDlgt(dlgt)).true
  //>>>
})

{
  //<<< mochai: utils
  let _p = eYo.Dlgt_p = eYo.dlgt.BaseC9r_p = eYo.dlgt.BaseC9r.prototype
  _p.init = eYo.doNothing
  new eYo.Dlgt(eYo.dlgt, 'BaseC9r', eYo.Dlgt, {})
  eYo.dlgt.declareDlgt(_p)
  //<<< mochai: delegate
  //... chai.expect(eYo.dlgt.eyo).equal(eYo.dlgt.constructor[eYo.$])
  // convenient shortcut
  Object.defineProperties(_p, {
    _p: eYo.descriptorR({$ () {
      return this.constructor.prototype
    }}.$),
    //... chai.expect(dlgt._p).equal(eYo.Dlgt_p).equal(eYo.dlgt.BaseC9r_p).equal(eYo.dlgt.BaseC9r.prototype)
  })
  ;['ns', 'key', '$id', 'C9r', 'model'].forEach(k => {
    let d = eYo.descriptorR({$ () {
      return this[k + '__']
    }}.$)
    Object.defineProperties(_p, {
      [k]: d,
      [k + '_']: d,
    })
  })
  //... ;['ns', 'id', 'C9r', 'model'].forEach(k => {
  //...   chai.expect(dlgt[k]).equal(dlgt[k+'_']).equal(dlgt[k+'__'])
  //... })
  ;['name', 'super', 'genealogy'].forEach(k => {
    let k_ = k + '_'
    let k__ = k + '__'
    Object.defineProperties(_p, {
      [k_]: eYo.descriptorNORW(k_),
      [k__]: eYo.descriptorNORW(k__),
    })
  })
  //... ;['name', 'super', 'genealogy'].forEach(k => {
  //...   chai.expect(() => dlgt[k+'_']).throw()
  //...   chai.expect(() => dlgt[k+'__']).throw()
  //... })
  eYo.mixinRO(_p, {
    C9r_p () {
      return this.C9r__.prototype
      //... chai.expect(dlgt.C9r_p).equal(dlgt.C9r__.prototype)
    },
    C9r_S () {
      return this.C9r__[eYo.$SuperC9r]
      //... chai.expect(dlgt.C9r_S).equal(dlgt.C9r__[eYo.$SuperC9r])
    },
    C9r_s () {
      return this.C9r__[eYo.$SuperC9r_p]
      //... chai.expect(dlgt.C9r_s).equal(dlgt.C9r__[eYo.$SuperC9r_p])
    },
    name () {
      return this.$id__.description
      //... chai.expect(dlgt.name).equal('(eYo).foo')
    },
    super () {
      var S = this.C9r__[eYo.$SuperC9r]
      return S && S[eYo.$]
      //... chai.expect(dlgt.super).undefined
    },
    super_p () {
      var S = this.C9r__[eYo.$SuperC9r]
      return S && S.prototype
      //... chai.expect(dlgt.super_p).undefined
    },
    genealogy () {
      var s = this
      var ans = []
      do {
        ans.push(s.name)
      } while ((s = s.super))
      return ans
    },
    C9r_s_up () {
      if (this.C9r_s_up__) {
        return this.C9r_s_up__
      }
      var s = this
      var ans = []
      while ((s = s.super)) {
        ans.push(s.C9r_p)
      }
      return (this.C9r_s_up__ = ans)
    },
    C9r_s_down () {
      return this.C9r_s_down__ || (this.C9r_s_down__ = this.C9r_s_up.reverse())
    },
    C9r_p_up () {
      if (this.C9r_p_up__) {
        return this.C9r_p_up__
      }
      var s = this
      var ans = []
      do {
        ans.push(s.C9r_p)
      } while ((s = s.super))
      return (this.C9r_p_up__ = ans)
    } ,
    C9r_p_down () {
      return this.C9r_p_down__ || (this.C9r_p_down__ = this.C9r_p_up.reverse())
    },
  //>>>
  })
  eYo.mixinFR(_p, {
    doPrepare: eYo.doNothing,
    doInit: eYo.doNothing,
    /**
     * Make the init method of the associate contructor.
     * Any constructor must have an init method.
     * @this {eYo.Dlgt}
     * @param {Object} model
     */
    makeDoInit (model) {
      //<<< mochai: eYo.dlgt.BaseC9r_p.makeDoInit
      //... var prepare = (model, f) => {
      //...   return preparator(_p => {
      //...     f && (_p.init = f)
      //...   })(model)
      //... }
      eYo.mixinFR(this, {
        makeDoInit: eYo.oneShot('makeDoInit only once'),
      })
      model || (model = this.model)
      let K = 'init'
      let f_m = model[K]
      let f_p = _p[K]
      if (f_m) {
        if (!eYo.isF(f_m)) {
          console.error('BREAK HERE! BUG')
        }
        if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
          if (f_p) {
            var f = function ($this, ...$) {
              try {
                this[K] = eYo.doNothing
                f_m.call(this, () => {
                  this.doPrepare(...$)
                  f_p.call(this, ...$)              
                  this.doInit(...$)
                }, ...$)
              } finally {
                delete this.dispose
              }
            }
            //... prepare({
            //...   init (builtin, ...$) {
            //...     flag.push('<')
            //...     builtin(...$)
            //...     flag.push('>')
            //...   }
            //... }, function (...$) {
            //...   this.flag(4, ...$) 
            //... })
            //... new C9r(5, 6)
            //... flag.expect('<125614561356>')
          } else {
            f = function (...$) {
              try {
                this[K] = eYo.doNothing
                f_m.call(this, () => {
                  this.doPrepare(...$)
                  this.doInit(...$)
                }, ...$)
              } finally {
                delete this.dispose
              }
            }
            //... // no inherited `init`.
            //... prepare({
            //...   init (builtin, ...$) {
            //...     flag.push('<')
            //...     builtin(...$)
            //...     flag.push('>')
            //...   }
            //... })
            //... new C9r(5, 6)
            //... flag.expect('<12561356>')
          }
        } else if (f_p) {
          f = function (...$) {
            try {
              this[K] = eYo.doNothing
              if (!this.doPrepare) {
                console.error('BREAK HERE!!! !this.doPrepare')
              }
              this.doPrepare(...$)
              f_p.call(this, ...$)
              if (!eYo.isF(f_m)) {
                console.error(f_m)
                console.error('BREAK HERE!')
              }
              f_m.call(this, ...$)
              this.doInit(...$)
            } finally {
              delete this.dispose
            }
          }
          //... prepare({
          //...   init (...$) {
          //...     flag.push('<', ...$, '>')
          //...   }
          //... }, function (...$) {
          //...   this.flag(4, ...$) 
          //... })
          //... new C9r(5, 6)
          //... flag.expect('12561456<56>1356')
        } else {
          f = function (...$) {
            try {
              this[K] = eYo.doNothing
              this.doPrepare(...$)
              f_m.call(this, ...$)
              this.doInit(...$)
            } finally {
              delete this.dispose
            }
          }
          //... prepare({
          //...   init (...$) {
          //...     flag.push('<', ...$, '>')
          //...   }
          //... })
          //... new C9r(5, 6)
          //... flag.expect('1256<56>1356')
        }
      } else if (f_p) {
        f = function (...$) {
          try {
            this[K] = eYo.doNothing
            if (!this.eyo) {
              console.error('BREAK HERE! NO EYO')
            }
            this.doPrepare(...$)
            f_p.call(this, ...$)
            this.doInit(...$) 
          } finally {
            delete this.dispose
          }
        }
        //... prepare({}, function (...$) {
        //...   this.flag(4, ...$) 
        //... })
        //... new C9r(5, 6)
        //... flag.expect(125614561356)
      } else {
        f = function (...$) {
          try {
            this[K] = eYo.doNothing
            if (!this.eyo) {
              console.error('BREAK HERE!')
            }
            this.doPrepare(...$)
            this.doInit(...$) 
          } finally {
            delete this.dispose
          }
        }
        //... prepare()
        //... new C9r(5, 6)
        //... flag.expect(12561356)
      }
      C9r_p[K] = f
      //>>>
    },
    makeC9rInit (model) {
      //<<< mochai: eYo.dlgt.BaseC9r_p.makeC9rInit
      //... var prepare = (model, f) => {
      //...   return preparator(_p => {
      //...     f && (_p.init = f)
      //...   })(model)
      //... }
      eYo.mixinFR(this, {
        makeC9rInit: eYo.oneShot('makeC9rInit only once'),
      })
      model || (model = this.model)
      let K = 'init'
      let f_m = model[K]
      let C9r_p = this.C9r_p
      let f_p = C9r_p && C9r_p[K]
      if (f_m) {
        if (!eYo.isF(f_m)) {
          console.error('BREAK HERE! BUG')
        }
        if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
          if (f_p) {
            var f = function (...$) {
              try {
                this[K] = eYo.doNothing
                f_m.call(this, () => {
                  this.doPrepare(...$)
                  f_p.call(this, ...$)              
                  this.doInit(...$)
                }, ...$)
              } finally {
                delete this.dispose
              }
            }
            //... prepare({
            //...   init (builtin, ...$) {
            //...     flag.push('<')
            //...     builtin(...$)
            //...     flag.push('>')
            //...   }
            //... }, function (...$) {
            //...   this.flag(4, ...$) 
            //... })
            //... new C9r(5, 6)
            //... flag.expect('<125614561356>')
          } else {
            f = function (...$) {
              try {
                this[K] = eYo.doNothing
                f_m.call(this, () => {
                  this.doPrepare(...$)
                  this.doInit(...$)
                }, ...$)
              } finally {
                delete this.dispose
              }
            }
            //... // no inherited `init`.
            //... prepare({
            //...   init (builtin, ...$) {
            //...     flag.push('<')
            //...     builtin(...$)
            //...     flag.push('>')
            //...   }
            //... })
            //... new C9r(5, 6)
            //... flag.expect('<12561356>')
          }
        } else if (f_p) {
          f = function (...$) {
            try {
              this[K] = eYo.doNothing
              if (!this.doPrepare) {
                console.error('BREAK HERE!!! !this.doPrepare')
              }
              this.doPrepare(...$)
              f_p.call(this, ...$)
              if (!eYo.isF(f_m)) {
                console.error(f_m)
                console.error('BREAK HERE!')
              }
              f_m.call(this, ...$)
              this.doInit(...$)
            } finally {
              delete this.dispose
            }
          }
          //... prepare({
          //...   init (...$) {
          //...     flag.push('<', ...$, '>')
          //...   }
          //... }, function (...$) {
          //...   this.flag(4, ...$) 
          //... })
          //... new C9r(5, 6)
          //... flag.expect('12561456<56>1356')
        } else {
          f = function (...$) {
            try {
              this[K] = eYo.doNothing
              this.doPrepare(...$)
              f_m.call(this, ...$)
              this.doInit(...$)
            } finally {
              delete this.dispose
            }
          }
          //... prepare({
          //...   init (...$) {
          //...     flag.push('<', ...$, '>')
          //...   }
          //... })
          //... new C9r(5, 6)
          //... flag.expect('1256<56>1356')
        }
      } else if (f_p) {
        f = function (...$) {
          try {
            this[K] = eYo.doNothing
            if (!this.eyo) {
              console.error('BREAK HERE! NO EYO')
            }
            this.doPrepare(...$)
            f_p.call(this, ...$)
            this.doInit(...$) 
          } finally {
            delete this.dispose
          }
        }
        //... prepare({}, function (...$) {
        //...   this.flag(4, ...$) 
        //... })
        //... new C9r(5, 6)
        //... flag.expect(125614561356)
      } else {
        f = function (...$) {
          try {
            this[K] = eYo.doNothing
            if (!this.eyo) {
              console.error('BREAK HERE!')
            }
            this.doPrepare(...$)
            this.doInit(...$) 
          } finally {
            delete this.dispose
          }
        }
        //... prepare()
        //... new C9r(5, 6)
        //... flag.expect(12561356)
      }
      C9r_p[K] = f
      //>>>
    },
    /**
     * Make the dispose method.
     * @param {Object} model
     */
    makeC9rDispose (model) {
      eYo.mixinFR(this, {
        makeC9rDispose: eYo.oneShot('makeC9rDispose only once'),
      })
      model || (model = this.model)
      let K = 'dispose'
      let f_m = model[K]
      let C9r_p = this.C9r_p
      let f_p = C9r_p && C9r_p[K]
      //<<< mochai: eYo.dlgt.BaseC9r_p.makeC9rDispose
      //... let prepare = (model, f) => {
      //...   return preparator(_p => {
      //...     _p.doPrepare = _p.doInit = eYo.doNothing
      //...     eYo.mixinFR(_p.eyo, {
      //...       disposeInstance (object, ...$) {
      //...         flag.push('x', ...$)
      //...       },
      //...     })
      //...     f && (_p.dispose = f)
      //...   })(model)
      //... }
      if (f_m) {
        if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
          if (f_p) {
            var f = function (...$) {
              try {
                this[K] = eYo.doNothing
                f_m.call(this, () => {
                  this.eyo.disposeInstance(this, ...$)
                  f_p.call(this, ...$)              
                }, ...$)
              } finally {
                delete this.init
              }
            }
            //... prepare({
            //...   dispose (builtin, ...$) {
            //...     flag.push('<1')
            //...     builtin(...$)
            //...     flag.push('>')
            //...   }
            //... }, function (...$) {
            //...   this.flag(2, ...$) 
            //... })
            //... new C9r().dispose(3, 4)
            //... flag.expect('<1x341234>')
          } else {
            f = function (...$) {
              try {
                this[K] = eYo.doNothing
                f_m.call(this, () => {
                  this.eyo.disposeInstance(this, ...$)              
                }, ...$)
              } finally {
                delete this.init
              }
            }
            //... prepare({
            //...   dispose (builtin, ...$) {
            //...     flag.push('<1')
            //...     builtin(...$)
            //...     flag.push('>')
            //...   }
            //... })
            //... new C9r().dispose(3, 4)
            //... flag.expect('<1x34>')
          }
        } else if (f_p) {
          f = function (...$) {
            try {
              this[K] = eYo.doNothing
              f_m.call(this, ...$)
              this.eyo.disposeInstance(this, ...$)
              f_p.call(this, ...$)
            } finally {
              delete this.init
            }
          }
          //... prepare({
          //...   dispose (...$) {
          //...     flag.push('<12', ...$, '>')
          //...   }
          //... }, function (...$) {
          //...   this.flag(2, ...$) 
          //... })
          //... new C9r().dispose(3, 4)
          //... flag.expect('<1234>x341234')
        } else {
          f = function (...$) {
            try {
              this[K] = eYo.doNothing
              f_m.call(this, ...$)
              this.eyo.disposeInstance(this, ...$)
            } finally {
              delete this.init
            }
          }
          //... prepare({
          //...   dispose (...$) {
          //...     flag.push('<12', ...$, '>')
          //...   }
          //... })
          //... new C9r().dispose(3, 4)
          //... flag.expect('<1234>x34')
        }
      } else if (f_p) {
        f = function (...$) {
          try {
            this[K] = eYo.doNothing
            this.eyo.disposeInstance(this, ...$)
            f_p.call(this, ...$)
          } finally {
            delete this.init
          }
        }
        //... prepare({}, function (...$) {
        //...   this.flag(2, ...$) 
        //... })
        //... new C9r().dispose(3, 4)
        //... flag.expect('x341234')
      } else {
        f = function (...$) {
          try {
            this[K] = eYo.doNothing
            this.eyo.disposeInstance(this, ...$)
          } finally {
            delete this.init
          }
        }
        //... prepare()
        //... new C9r().dispose(3, 4)
        //... flag.expect('x34')
      }
      C9r_p[K] = f
      //>>>
    },
    /**
     * Prepare an instance.
     * Default implementation does nothing.
     * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
     */
    prepareInstance: eYo.doNothing,
    /**
     * Defined by subclassers.
     * @param {Object} instance -  instance is an instance of a subclass of the `C9r_` of the receiver
     */
    initInstance: eYo.doNothing,
    /**
     * Defined by subclassers.
     */
    disposeInstance: eYo.doNothing,
    /**
     * Add a subclass
     * @param {Function} C9r - constructor
     */
    addSubC9r (C9r) {
      eYo.isSubclass(C9r, this.C9r) || eYo.throw(`${C9r[eYo.$].name} is not a subclass of ${this.name}`)
      if (!this.subC9rs__) {
        console.error('BREAK!!! !this.subC9rs__')
      }
      this.subC9rs__.add(C9r)
    },
    /**
     * Iterator
     * @param {Function} helper
     * @param {Boolean} deep - Propagates when true.
     * @this {eYo.Dlgt}
     */
    forEachSubC9r (f, deep) {
      if (eYo.isF(deep)) {
        [f, deep] = [deep, f]
      }
      this.subC9rs__.forEach(C9r => {
        f(C9r)
        deep && C9r[eYo.$].forEachSubC9r(f, deep)
      })
    },  
    /**
     * Iterator
     * @param {Function} helper
     * @this {eYo.Dlgt}
     */
    someSubC9r (f) {
      for (let C9r of this.subC9rs__) {
        let ans = f(C9r)
        if (ans) {
          return ans
        }
      }
    },
  })
  //>>>
}

eYo.make$$('unknown')

//<<< mochai: eYo.$$.unknown
//... chai.expect(eYo.$$).property('unknown')
//>>>

/**
 * Adds a delegate to the given constructor.
 * The added delegate is a singleton.
 * This is the recommended way to create a new delegate.
 * @param {Object} [ns] - The namespace owning the constructor
 * @param {String|Symbol} id - The id associate to the constructor.
 * @param {Function} C9r - the constructor associate to the delegate
 * @param {Object} model - the model object associate to the delegate, used for extension.
 */
eYo.dlgt.new = function (ns, id, C9r, model) {
  // prepare
  if (ns && !eYo.isNS(ns)) {
    model && eYo.throw(`eYo.dlgt.new: Unexpected model (1) ${model}`)
    ;[ns, id, C9r, model] = [eYo.NA, ns, id, C9r]
  } else {
    ns === eYo.NULL_NS || eYo.isNS(ns) || eYo.throw('Bad namespace')
  }
  if (!eYo.isId(id)) {
    if (id) {
      model && eYo.throw(`eYo.dlgt.new: Unexpected model (2) ${model}`)
      ;[id, C9r, model] = [eYo.$$.unknown, id, C9r]
    } else {
      id = eYo.$$.unknown
    }
  }
  eYo.isF(C9r) || eYo.throw(`Unexpected C9r: ${C9r} in eYo.dlgt.new`)
  eYo.isC9r(C9r) && eYo.throw(`Already a C9r: ${C9r} in eYo.dlgt.new`)
  // process
  let SuperC9r = C9r[eYo.$SuperC9r]
  let SuperDlgt = (SuperC9r && SuperC9r[eYo.$] && SuperC9r[eYo.$].constructor) || eYo.Dlgt
  let Dlgt = function (ns, id, C9r, model) {
    SuperDlgt.call(this, ns, id, C9r, model)
  }
  eYo.inherits(Dlgt, SuperDlgt)
  ns === eYo.NULL_NS || eYo.isNS(ns) || (ns = SuperC9r[eYo.$].ns)
  // initialization of the dlgt
  // when defined, init must be a self contained function,
  // ie with no inherited reference...
  let dlgt_m = model[eYo.$]
  if (eYo.isF(dlgt_m)) {
    Dlgt.prototype.init = SuperDlgt
      ? function (...$) {
        this.init = eYo.doNothing
        SuperDlgt.prototype.init.call(this, ...$)
        dlgt_m.call(this, ...$)
      } : function (...$) {
        this.init = eYo.doNothing
        dlgt_m.call(this, ...$)
      }
  }
  if (SuperC9r) {
    SuperC9r[eYo.$].addSubC9r(C9r)
  }
  // in next function call, all the parameters are required
  // but some may be eYo.NA
  /* Dlgt[eYo.$] = */new eYo.Dlgt(ns, 'BaseC9r', Dlgt, {})
  return new Dlgt(ns, id, C9r, model)
}

// make a shared Dlgt for the namespaces too
eYo.dlgt.new(eYo, 'NS', eYo.constructor, {})
eYo.dlgt.declareDlgt(eYo._p)

// ANCHOR modelling properties
Object.defineProperties(eYo.dlgt.BaseC9r_p, {
  modelFormat: eYo.descriptorR({$ () {
    if (!this.modelFormat_) {
      let $super = this.super
      this.modelFormat_ = new eYo.model.Format($super && $super.modelFormat)
      Object.defineProperties(this, {
        modelFormat: eYo.descriptorR({$ () {
          return this.modelFormat_
        }}.$, true)
      })
    }
    return this.modelFormat_
  }}.$),
  hasFinalizedC9r: eYo.descriptorR({$ () {
    let $super = this.super
    return (!$super || $super.hasFinalizedC9r) && eYo.objectHasOwnProperty(this, 'finalizeC9r')
  }}.$),
})
// ANCHOR modelling functions
eYo.mixinFR(eYo.dlgt.BaseC9r_p, {
  //<<< mochai: model
  /**
   * Finalize the associate constructor and allow some model format.
   * This must be called once for any delegate, raises otherwise.
   * Calls `modelPrepare`, `makeC9rInit` and `makeC9rDispose`.
   * Raises if the `super` is not already finalized.
   * This must be done by hand because we do not know
   * what is the ancestor's model format.
   * @name {eYo.dlgt.BaseC9r.modelAllow}
   */
  finalizeC9r (...$) {
    let $super = this.super
    if ($super && !$super.hasFinalizedC9r) {
      console.error('BREAK HERE!')
    }
    $super && !$super.hasFinalizedC9r && eYo.throw(`Parent is not finalized: ${$super.name}`)
    let ans = this.modelFormat.allow(...$)
    this.modelPrepare()
    this.makeC9rInit()
    this.makeC9rDispose()
    eYo.mixinFR(this, {
      finalizeC9r: eYo.oneShot('finalizeC9r cannot be sent twice to the same delegate.')
    })
    return ans
  }, 
  /**
   * Forwards all the arguments to the `modelFormat` of the receiver.
   * @name {eYo.dlgt.BaseC9r.modelValidate}
   * @return {Object} a validated model object
   */
  modelValidate (...$) {
    return this.modelFormat.validate(...$)
  },
  /**
   * @name{eYo.dlgt.BaseC9r.modelIsAllowed}
   * @return {Boolean} Whether the key is authorized with the given path.
   */
  modelIsAllowed (...$) {
    return this.modelFormat.isAllowed(...$)
  },
  /**
   * Declare CONSTs.
   * Allows to split the definition of CONST into different files,
   * eventually.
   * @param{Object} model - the model
   */
  CONSTsMerge (model) {
    let _p = this.C9r_p
    eYo.mixinRO(_p, model)
    //<<< mochai: eYo.dlgt.BaseC9r_p.CONSTsMerge
    //... let prepare = preparator(_p => {
    //...   _p.doPrepare = function (...$) {
    //...     flag.push(1, ...$) 
    //...   }
    //...   _p.doInit = function (...$) {
    //...     flag.push(2, ...$) 
    //...   }
    //... })
    //... prepare()
    //... C9r[eYo.$].CONSTsMerge({
    //...   FOO: 'bar',
    //... })
    //... chai.expect((new C9r()).FOO).equal('bar')
    //... prepare({
    //...   CONSTs: {
    //...     FOO: 'bar',
    //...   },
    //... })
    //... chai.expect((new C9r()).FOO).equal('bar')
    //>>>
  },
  /**
   * Declare methods.
   * Allows to split the definition of methods into different files,
   * eventually.
   * If the method is a function with exactly one argument named 'overriden',
   * then we override the previously defined method.
   * The model object is a function decorator.
   * @param{Object} model - the model
   */
  methodsMerge (model) {
    let _p = this.C9r_p
    for (let [k, m] of Object.entries(model)) {
      if (eYo.isF(m)) {
        if (m.length === 1 && _p[k] && XRegExp.exec(m.toString(), eYo.xre.function_overriden)) {
          _p[k] = eYo.asF(m.call(this, eYo.toF(_p[k]).bind(this)))
        } else {
          _p[k] = m
        }
      } 
    }
  },
  /**
   * For subclassers.
   * @param {String} [key] - 
   * @param {Object} model - model object
   */
  // modelHandle: eYo.doNothing,
  /**
   * Declare the given model for the associate constructor.
   * The default implementation just calls `methodsMerge` and `CONSTsMerge`.
   * 
   * @param {Object} model - Object, like for |newC9r|.
   */
  modelMerge (model) {
    model.methods && this.methodsMerge(model.methods)
    model.CONSTs && this.CONSTsMerge(model.CONSTs)
  },
  /**
   * Prepare the model fo the receiver.
   * The default implementation just calls `modelMerge` after `modelValidate`.
   * Called by `finalizeC9r`.
   */
  modelPrepare () {
    let model = this.model
    if (Object.keys(model).length) {
      model = this.modelValidate(model)
      this.modelMerge(model)
    }
  },
  /**
   * Get the model method with the given id
   * @param {String| Symbol} id 
   */
  getModelMethod (id) {
    //<<< mochai: getModelMethod
    var methods = this.model.methods
    return methods && methods[id]
    //... var dlgt = eYo.dlgt.new(function () {}, {
    //...   methods: {
    //...     foo (...$) {
    //...       flag.push(1, ...$)
    //...     },
    //...   },
    //... })
    //... var f = dlgt.getModelMethod('foo')
    //... chai.expect(f).eyo_F
    //... f.call(dlgt, 2, 3)
    //... flag.expect(123)
    //>>>
  },
  //>>>
})


// eYo.dlgt.BaseC9r[eYo.$].finalizeC9r()


