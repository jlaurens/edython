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

//<<< mochai: ...
//... var C9r
//... let preparator = f => {
//...   return model => {
//...     C9r = function (...$) {
//...       this.init && this.init(...$)
//...     }
//...     let eyo = eYo.dlgt.new('foo', C9r, model || {})
//...     eYo.dlgt.declareDlgt(C9r.prototype)
//...     chai.expect(C9r.eyo).equal(eyo)
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

/**
 * This is a root class, not to be subclassed except in singletons.
 * Any constructor's delegate is an instance of this subclass.
 * @param {Object} ns - Namespace
 * @param {String} id - a unique key within the namespace...
 * @param {Function} C9r - the associate constructor
 * @param {Object} model - the model used for extension
 */
/* The problem of constructor delegation is the possibility of an infinite loop :
  object->constructor->eyo__->contructor->eyo__->constructor->eyo__...
  The Base is its own delegate's constructor
*/
eYo.dlgt.BaseC9r = function (ns, id, C9r, model) {
  Object.defineProperties(this, {
    ns: { value: eYo.isNS(ns) ? ns : eYo.NA },
    id__: {value: id},
    C9r__: { value: C9r },
    model__: { value: model },
    subC9rs__: { value: new Set() },
  })
  C9r.eyo__ = this
  if (!C9r.eyo) { // true for subclasses of eYo.dlgt.BaseC9r
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
  let _p = eYo.dlgt.BaseC9r_p = eYo.dlgt.BaseC9r.prototype

  _p.init = eYo.doNothing

  eYo.dlgt.declareDlgt(_p)

  // convenient shortcut
  Object.defineProperties(_p, {
    _p: eYo.descriptorR(function () {
      return this.constructor.prototype
    }),
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
      return this.ns && this.id__ && `${this.ns.name}.${this.id__}` || this.id
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
    C9r_s_up: eYo.descriptorR(function () {
      if (this.C9r_s_up__) {
        return this.C9r_s_up__
      }
      var s = this
      var ans = []
      while ((s = s.super)) {
        ans.push(s.C9r_p)
      }
      return (this.C9r_s_up__ = ans)
    }),
    C9r_s_down: eYo.descriptorR(function () {
      return this.C9r_s_down__ || (this.C9r_s_down__ = this.C9r_s_up.reverse())
    }),
    C9r_p_up: eYo.descriptorR(function () {
      if (this.C9r_p_up__) {
        return this.C9r_p_up__
      }
      var s = this
      var ans = []
      do {
        ans.push(s.C9r_p)
      } while ((s = s.super))
      return (this.C9r_p_up__ = ans)
    }),
    C9r_p_down: eYo.descriptorR(function () {
      return this.C9r_p_down__ || (this.C9r_p_down__ = this.C9r_p_up.reverse())
    }),
  })  

  /**
   * Make the init method of the associate contructor.
   * Any constructor must have an init method.
   * @this {eYo.dlgt.BaseC9r}
   * @param {Object} model
   */
  _p.makeC9rInit = function (model) {
    this.makeC9rInit = eYo.oneShot('makeC9rInit only once')
    model || (model = this.model)
    let K = 'init'
    let f_m = model[K]
    let C9r_p = this.C9r_p
    let f_p = C9r_p && C9r_p[K]
    //<<< mochai: eYo.dlgt.BaseC9r_p.makeC9rInit
    //... let prepare = (model, f) => {
    //...   return preparator(_p => {
    //...     f && (_p.init = f)
    //...   })(model)
    //... }
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
  }
  
  _p.doPrepare = eYo.doNothing
  _p.doInit = eYo.doNothing
  
  /**
   * Make the dispose method.
   * @param {Object} model
   */
  _p.makeC9rDispose = function (model) {
    this.makeC9rDispose = eYo.oneShot('makeC9rDispose only once')
    model || (model = this.model)
    let K = 'dispose'
    let f_m = model[K]
    let C9r_p = this.C9r_p
    let f_p = C9r_p && C9r_p[K]
    //<<< mochai: eYo.dlgt.BaseC9r_p.makeC9rDispose
    //... let prepare = (model, f) => {
    //...   return preparator(_p => {
    //...     _p.doPrepare = _p.doInit = eYo.doNothing
    //...     _p.eyo.disposeInstance = function (object, ...$) {
    //...       flag.push('x', ...$)
    //...     }
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
   * @this {eYo.dlgt.BaseC9r}
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
   * @this {eYo.dlgt.BaseC9r}
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
eYo.dlgt.new = function (ns, id, C9r, model) {
  // prepare
  if (eYo.isStr(ns)) {
    model && eYo.throw(`Unexpected model (1): ${model}`)
    ;[ns, id, C9r, model] = [eYo.NA, ns, id, C9r]
  } else {
    ns === eYo.NULL_NS || eYo.isNS(ns) || eYo.throw('Bad namespace')
  }
  !id || eYo.isStr(id) || eYo.throw(`Missing id string: ${id} in eYo.dlgt.new`)
  !eYo.isF(C9r) && eYo.throw(`Unexpected C9r: ${C9r} in eYo.dlgt.new`)
  eYo.isC9r(C9r) && eYo.throw(`Already a C9r: ${C9r} in eYo.dlgt.new`)
  // process
  let SuperC9r = C9r.SuperC9r
  let SuperDlgt = (SuperC9r && SuperC9r.eyo && SuperC9r.eyo.constructor) || eYo.dlgt.BaseC9r
  let Dlgt = function (ns, id, C9r, model) {
    SuperDlgt.call(this, ns, id, C9r, model)
  }
  eYo.inherits(Dlgt, SuperDlgt)
  ns === eYo.NULL_NS || eYo.isNS(ns) || (ns = SuperC9r.eyo.ns)
  // initialization of the dlgt
  // when defined, init must be a self contained function,
  // ie with no inherited reference...
  let dlgt_m = model.dlgt
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
    SuperC9r.eyo.addSubC9r(C9r)
  }
  // in next function call, all the parameters are required
  // but some may be eYo.NA
  Dlgt.eyo__ = new eYo.dlgt.BaseC9r(ns, 'BaseC9r', Dlgt, {})
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
    this.finalizeC9r = eYo.oneShot('finalizeC9r cannot be called twice on the same delegate.')
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
    eYo.mixinR(_p, model)
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
    //... C9r.eyo.CONSTsMerge({
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
   * @param {Object} model - Object, like for |makeC9r|.
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
   * @param {Object} model - Object, like for |makeC9r|.
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

eYo.dlgt.BaseC9r.eyo.finalizeC9r()

eYo.mixinR(false, eYo, {
  /**
   * Realize `p.next === n` and `n.previous === p`.
   * @param {*} p 
   * @param {*} n 
   */
  linkPreviousNext (p, n) {
    if (eYo.isDef(p) && p.next !== n) {
      // remove old link
      if (p.hasOwnProperty('next') && eYo.isDef(p.next)) {
        Object.defineProperties(p.next, {
          previous: {
            value: eYo.NA,
            configurable: true,
          }
        })
      }
      Object.defineProperties(p, {
        next: {
          value: n,
          configurable: true,
        }
      })
    }
    if (eYo.isDef(n) && n.previous !== p) {
      // remove old link
      if (n.hasOwnProperty('previous') && eYo.isDef(n.previous)) {
        Object.defineProperties(n.previous, {
          next: {
            value: eYo.NA,
            configurable: true,
          }
        })
      }
      Object.defineProperties(n, {
        previous: {
          value: p,
          configurable: true,
        }
      })
    }
  },
})

/**
 * This delegate method populates the namespace's base delegate
 * with some methods to manage a data model with many possible attributes.
 * 
 * @param{String} type - type is one of 'p6y', 'data', 'field', 'slots'
 * @param{String} path - Path, the separator is '/'
 * @param{Object} [manyModel] - Object, read only.
 */
eYo.dlgt.BaseC9r_p.enhanceMany = function (type, path, manyModel = {}) {
  //<<< mochai: enhanceMany
  let _p = this._p
  /* fooModelByKey__ is a key -> model object with no prototype.
   * Void at startup.
   * Populated with the `...Merge` method.
   * Local to the delegate instance.
   */
  let tModelByKey__ = type + 'ModelByKey__' // local to the instance
  /*
   * Lazy model getter:
   * 
   */
  Object.defineProperty(_p, tModelByKey__, {
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
      Object.defineProperty(this, tModelByKey__, {
        get () {
          return model
        }
      })
      return model
    },
    configurable: true,
    //<<< mochai: tModelByKey__
    //... preparator()()
    //... C9r.eyo.enhanceMany('foo')
    //... var o = new C9r()
    //... chai.expect(o.tModelByKey__)
    //>>>
  })

  /* fooModelMap_ is a key -> model map.
   * It is computed from the fooModelByKey__ of the delegates and its super's.
   * Cached.
   */
  let tModelMap_  = type + 'ModelMap_'
  /* fooModelMap is a key -> model map.
   * Computed property that uses the cache above.
   * If the cache does not exist, reads super's fooModelMap
   * and adds the local fooModelByKey__.
   * Then caches the result in fooModelMap_.
   */
  // keys defined on delegate instances
  let tModelMap   = type + 'ModelMap' // computed property

  let tPrepare    = type + 'Prepare'
  let tMerge      = type + 'Merge'
  let tInit       = type + 'Init'
  let TInit       = eYo.do.toTitleCase(type) + 'Init'
  let tDispose    = type + 'Dispose'
  let TDispose    = eYo.do.toTitleCase(type) + 'Dispose'
  let tForEach    = type + 'ForEach'
  let tSome       = type + 'Some'
  // object properties
  let tMap        = type + 'Map' // property defined on instances
  let tHead       = type + 'Head'
  let tTail       = type + 'Tail'
  /**
   * Expands the property, data, fields, slots section into the receiver's corresponding model. Only works for objects.
   * Usage: For the model `{foo: bar}`, run `C9r.eyo.fooMerge(bar)`
   * @param{Object} source - A model object.
   */
  _p[tMerge] = function (source) {
    delete this[tModelMap] // delete the shortcut
    this.forEachSubC9r(C9r => C9r.eyo[tMerge]({})) // delete the cache of descendants
    source = this.modelValidate(path, source)
    let byKey = this[tModelByKey__]
    eYo.provideR(byKey, source)
  }
  Object.defineProperties(_p, {
    [tModelMap]: eYo.descriptorR(function () {
      let modelMap = this[tModelMap_] = new Map()
      let superMap = this.super && this.super[tModelMap]
      let map = superMap ? new Map(superMap) : new Map()
      if (this[tModelByKey__]) {
        for (let [k, v] of Object.entries(this[tModelByKey__])) {
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
          if (model && model.after) {
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
        [tModelMap]: eYo.descriptorR(function () {
          return this[tModelMap_]
        }, true)
      })
      return this[tModelMap_]
    }),
  })
  /**
   * The maker is responsible of making new `key` objects from a model.
   */
  let make = manyModel.make || function (model, k, object) {
    return eYo[type].new(model, k, object)
  }
  let makeShortcut = manyModel.makeShortcut || function (object, k, p) {
    let k_p = k + (manyModel.suffix || `_${type[0]}`)
    if (object.hasOwnProperty(k_p)) {
      console.error(`BREAK HERE!!! ALREADY object ${object.eyo.name}/${k_p}`)
    }
    Object.defineProperties(object, {
      [k_p]: eYo.descriptorR(function () {
        return this[tMap].get(k)
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
  _p[tPrepare] = manyModel.prepare || function (object, model) {
    if (model) {
      // merge the given model with the existing one
      this[tMerge](model)
      this[tMerge] = function () {
        eYo.throw(`Do not change the model of ${this.name} once an instance has been created`)
      }
      var super_dlgt = this
      while ((super_dlgt = super_dlgt.super)) {
        super_dlgt.hasOwnProperty(tMerge) || (super_dlgt[tMerge] = this[tMerge])
      }
    }
    let attributes = []
    var map = object[tMap]
    if (map) {
      for (let k of [...map.keys()].reverse()) {
        let attr = map.get(k)
        eYo.isaC9r(attr) && attr.dispose()
      }
    }
    map = object[tMap] = new Map()
    for (let [k, model] of this[tModelMap]) {
      let attr = make(model, k, object)
      if (attr) {
        makeShortcut.call(this, object, k, attr)
        map.set(k, attr)
        attributes.push(attr)
      }
    }
    var attr = object[tHead] = attributes.shift()
    eYo.linkPreviousNext(eYo.NA, attr)
    attributes.forEach(a => {
      eYo.linkPreviousNext(attr, a)
      attr = a
    })
    eYo.linkPreviousNext(attr, eYo.NA)
    object[tTail] = attributes.pop() || object[tHead]
    attr = object[tHead]
  }
  /**
   * 
   */
  _p[tInit] = manyModel.init || function (object, ...$) {
    for (let v of object[tMap].values()) {
      v.preInit && v.preInit()
      let init = v && object[v.id + TInit]
      init && init.call(object, v, ...$)
      v.init && v.init(...$)
    }
  }
  _p[tDispose] = manyModel.dispose || function(object, ...$) {
    for (let v of object[tMap].values()) {
      if (v.owner === object) {
        let dispose = object[v.id + TDispose]
        dispose && dispose.call(object, v, ...$)
        v.dispose && v.dispose(...$)
      }
    }
    object.bindField = object[tHead] = object[tTail] = object[tModelByKey__] = eYo.NA
  }
  _p[tForEach] = function (object, $this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    for (let v of object[tMap].values()) {
      f.call($this, v)
    }
  }
  _p[tSome] = function (object, $this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    for (let v of object[tMap].values()) {
      if (f.call($this, v)) {
        return true
      }
    }
  }
  //>>>
}
