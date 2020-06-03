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
eYo.newNS('dlgt')

eYo.mixinRO(eYo, {
  $: Symbol('$'),
  $_p: Symbol('$_p'),
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

//<<< mochai: ...
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
//... var id = 'foo'
//... var C9r = function () {}
//... model = {}
//... var dlgt = new eYo.dlgt.BaseC9r(NS, id, C9r, model)

/**
 * This is a root class, not to be subclassed except in singletons.
 * Any constructor's delegate is an instance of this subclass.
 * @param {Object} NS - Namespace, can be eYo.NULL_NS
 * @param {String|Symbol} id - a unique key or symbol within the namespace...
 * @param {Function} C9r - the associate constructor
 * @param {Object} model - the model used for extension
 */
/* The problem of constructor delegation is the possibility of an infinite loop :
  object->constructor->eyo->contructor->eyo->constructor->[eYo.$]...
  The Base is its own delegate's constructor
*/
eYo.dlgt.BaseC9r = function (NS, id, C9r, model) {
  //<<< mochai: eYo.dlgt.BaseC9r
  //... chai.expect(eYo.dlgt).property('BaseC9r')
  Object.defineProperties(this, {
    ns__: { value: eYo.isNS(NS) ? NS : eYo.NA },
    id__: {value: id},
    C9r__: { value: C9r },
    model__: { value: model },
    subC9rs__: { value: new Set() }, // change it to map ?
  })
  //... chai.expect(dlgt.ns).equal(NS)
  //... chai.expect(dlgt.id__).equal(id)
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

;(() => {
  //<<< mochai: utils
  let _p = eYo.Dlgt_p = eYo.dlgt.BaseC9r_p = eYo.dlgt.BaseC9r.prototype

  _p.init = eYo.doNothing

  eYo.dlgt.declareDlgt(_p)
  //<<< mochai: delegate
  //... chai.expect(eYo.dlgt.eyo).equal(eYo.dlgt.constructor[eYo.$])
  // convenient shortcut
  Object.defineProperties(_p, {
    _p: eYo.descriptorR(function () {
      return this.constructor.prototype
    }),
    //... chai.expect(dlgt._p).equal(eYo.Dlgt_p).equal(eYo.dlgt.BaseC9r_p).equal(eYo.dlgt.BaseC9r.prototype)
  })
  ;['ns', 'id', 'C9r', 'model'].forEach(k => {
    let d = eYo.descriptorR(function () {
      return this[k + '__']
    })
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
      if (this.ns) {
        if (eYo.isStr(this.id__)) {
          return `${this.ns.name}.${this.id__}`
        } else if (this.id__) {
          return `${this.ns.name}.${this.id__.toString()}`          
        } else {
          return `${this.ns.name}(...)}`
        }        
      } else if (eYo.isStr(this.id__)) {
        return `(...).${this.id__}`
      } else if (this.id__) {
        return `(...).${this.id__.toString()}`
      } else {
        return `(...)`
      }
      //... chai.expect(dlgt.name).equal(`No man's land.foo`)
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
    /**
     * Make the init method of the associate contructor.
     * Any constructor must have an init method.
     * @this {eYo.dlgt.BaseC9r}
     * @param {Object} model
     */
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
    doPrepare: eYo.doNothing,
    doInit: eYo.doNothing,
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
     * @this {eYo.dlgt.BaseC9r}
     */
    forEachSubC9r (f, deep) {
      if (eYo.isF(deep)) {
        ;[f, deep] = [deep, f]
      }
      this.subC9rs__.forEach(C9r => {
        f(C9r)
        deep && C9r[eYo.$].forEachSubC9r(f, deep)
      })
    },  
    /**
     * Iterator
     * @param {Function} helper
     * @this {eYo.dlgt.BaseC9r}
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
})()

eYo.newSym('dlgt')

//<<< mochai: eYo.Sym$.dlgt
//... chai.expect(eYo.Sym$).property('dlgt')
//>>>

/**
 * Adds a delegate to the given constructor.
 * The added delegate is a singleton.
 * This is the recommended way to create a new delegate.
 * @param {Object} [ns] - The namespace owning the constructor
 * @param {String} key - The key associate to the constructor.
 * @param {Function} C9r - the constructor associate to the delegate
 * @param {Object} model - the model object associate to the delegate, used for extension.
 */
eYo.dlgt.new = function (ns, id, C9r, model) {
  // prepare
  if (eYo.isId(ns)) {
    model && eYo.throw(`Unexpected model (1): ${model}`)
    ;[ns, id, C9r, model] = [eYo.NA, ns, id, C9r]
  } else {
    ns === eYo.NULL_NS || eYo.isNS(ns) || eYo.throw('Bad namespace')
  }
  !id || eYo.isId(id) || eYo.throw(`Missing id string/symbol: ${id.toString()} in eYo.dlgt.new`)
  eYo.isF(C9r) || eYo.throw(`Unexpected C9r: ${C9r} in eYo.dlgt.new`)
  eYo.isC9r(C9r) && eYo.throw(`Already a C9r: ${C9r} in eYo.dlgt.new`)
  // process
  let SuperC9r = C9r[eYo.$SuperC9r]
  let SuperDlgt = (SuperC9r && SuperC9r[eYo.$] && SuperC9r[eYo.$].constructor) || eYo.dlgt.BaseC9r
  let Dlgt = function (ns, id, C9r, model) {
    SuperDlgt.call(this, ns, id, C9r, model)
  }
  eYo.inherits(Dlgt, SuperDlgt)
  ns === eYo.NULL_NS || eYo.isNS(ns) || (ns = SuperC9r[eYo.$].ns)
  // initialization of the dlgt
  // when defined, init must be a self contained function,
  // ie with no inherited reference...
  let dlgt_m = model[eYo.Sym$.dlgt]
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
  /*Dlgt[eYo.$] = */new eYo.dlgt.BaseC9r(ns, 'BaseC9r', Dlgt, {})
  return new Dlgt(ns, id, C9r, model)
}

// make a shared Dlgt for the namespaces too
eYo.dlgt.new(eYo, 'NS', eYo.constructor, {})
eYo.dlgt.declareDlgt(eYo._p)

// ANCHOR modelling
{

  let _p = eYo.dlgt.BaseC9r_p
  
  Object.defineProperties(_p, {
    modelFormat: eYo.descriptorR(function () {
      if (!this.modelFormat_) {
        let $super = this.super
        this.modelFormat_ = new eYo.model.Format($super && $super.modelFormat)
        Object.defineProperties(this, {
          modelFormat: eYo.descriptorR(function () {
            return this.modelFormat_
          }, true)
        })
      }
      return this.modelFormat_
    }),
    hasFinalizedC9r: eYo.descriptorR(function () {
      let $super = this.super
      return (!$super || $super.hasFinalizedC9r) && this.hasOwnProperty('finalizeC9r')
    }),
  })
  /**
   * Finalize the associate constructor and allow some model format.
   * This must be called once for any delegate, raises otherwise.
   * Calls `modelPrepare`, `makeC9rInit` and `makeC9rDispose`.
   * Raises if the `super` is not already finalized.
   * This must be done by hand because we do not know
   * what is the ancestor's model format.
   * @name {eYo.dlgt.BaseC9r.modelAllow}
   */
  _p.finalizeC9r = function (...$) {
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
      finalizeC9r: eYo.oneShot('finalizeC9r cannot be called twice on the same delegate.')
    })
    return ans
  }
  
  /**
   * Forwards all the arguments to the `modelFormat` of the receiver.
   * @name {eYo.dlgt.BaseC9r.modelValidate}
   * @return {Object} a validated model object
   */
  _p.modelValidate = function (...$) {
    return this.modelFormat.validate(...$)
  }

  /**
   * @name{eYo.dlgt.BaseC9r.modelIsAllowed}
   * @return {Boolean} Whether the key is authorized with the given path.
   */
  _p.modelIsAllowed = function (...$) {
    return this.modelFormat.isAllowed(...$)
  }

  /**
   * Declare CONSTs.
   * Allows to split the definition of CONST into different files,
   * eventually.
   * @param{Object} model - the model
   */
  _p.CONSTsMerge = function (model) {
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
      if (eYo.isF(m)) {
        if (m.length === 1 && _p[k] && XRegExp.exec(m.toString(), eYo.xre.function_overriden)) {
          _p[k] = eYo.asF(m.call(this, eYo.toF(_p[k]).bind(this)))
        } else {
          _p[k] = m
        }
      } 
    })
  }
}

// ANCHOR: Model
{
  let _p = eYo.dlgt.BaseC9r_p // Base.prototype

  /**
   * For subclassers.
   * @param {String} [key] - 
   * @param {Object} model - model object
   */
  _p.modelHandle = eYo.doNothing

  /**
   * Declare the given model for the associate constructor.
   * The default implementation just calls `methodsMerge` and `CONSTsMerge`.
   * 
   * @param {Object} model - Object, like for |newC9r|.
   */
  _p.modelMerge = function (model) {
    model.methods && this.methodsMerge(model.methods)
    model.CONSTs && this.CONSTsMerge(model.CONSTs)
  }

  /**
   * Prepare the model fo the receiver.
   * The default implementation just calls `modelMerge` after `modelValidate`.
   * Called by `finalizeC9r`.
   * 
   * @param {Object} model - Object, like for |newC9r|.
   */
  _p.modelPrepare = function () {
    let model = this.model
    if (Object.keys(model).length) {
      model = this.modelValidate(model)
      this.modelMerge(model)
    }
  }
}

// The delegate of `eYo.dlgt.BaseC9r` is an instance of itself.
new eYo.dlgt.BaseC9r(eYo.dlgt, 'Base…', eYo.dlgt.BaseC9r, {})

eYo.dlgt.BaseC9r[eYo.$].finalizeC9r()

eYo.mixinFR(eYo, {
  Dlgt: eYo.dlgt.BaseC9r,
  //<<< mochai: eYo.Dlgt
  //... chai.expect(eYo).property('Dlgt')
  //... chai.expect(eYo.Dlgt).equal(eYo.dlgt.BaseC9r)
  //>>>
  /**
   * 
   * @param {*} what 
   * @return {Boolean}
   */
  isaDlgt (what) {
    //<<< mochai: isaDlgt
    //... C9r = function () {}
    //... let eyo = eYo.dlgt.new('foo', C9r,{})
    //... chai.expect(eyo).eyo_Dlgt
    //... chai.expect(C9r).not.eyo_Dlgt
    return !!what && what instanceof eYo.Dlgt
    //>>>
  }
})
