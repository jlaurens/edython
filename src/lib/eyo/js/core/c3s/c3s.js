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

eYo.require('xre')
eYo.require('kv')
eYo.require('do')
eYo.require('dlgt')
eYo.require('decorate')

eYo.require('t3')

/**
 * Management of constructors and models.
 * Models are trees with some inheritancy.
 * @name {eYo.c3s}
 * @namespace
 */
eYo.newNS('c3s')

eYo.mixinRO(eYo, {
  $C3s: Symbol('C3s'),
  $newSubC3s: Symbol('newSubC3s'),
  $new: Symbol('$new'),
})

//<<< mochai: C3s

// ANCHOR: Utilities

/**
 * Convenient way to append code to an already existing method.
 * This allows to define a method in different places.
 * @param {Object} object - Object
 * @param {String} key - Looking for or creating |Object[key]|
 * @param {Function} f - the function we will append
 */
eYo.c3s._p.appendToMethod = (object, key, f) => {
  //<<< mochai: eYo.c3s.appendToMethod
  let old = object[key]
  if (old && old !== eYo.doNothing) {
    eYo.isF(old) || eYo.throw(`Expecting a function ${old}`)
    object[key] = function () {
      old.apply(this, arguments)
      f.apply(this, arguments)
    }
  } else {
    object[key] = f
  }
  //... var o = {}
  //... eYo.c3s.appendToMethod(o, 'foo1', function (x) {
  //...   eYo.flag.push(x)
  //... })
  //... o.foo1(1)
  //... eYo.flag.expect(1)
  //... o = {
  //...   foo1: eYo.doNothing,
  //... }
  //... eYo.c3s.appendToMethod(o, 'foo1', function (x) {
  //...   eYo.flag.push(x)
  //... })
  //... o.foo1(1)
  //... eYo.flag.expect(1)
  //... o = {
  //...   foo1: 421,
  //... }
  //... chai.expect(() => {
  //...   eYo.c3s.appendToMethod(o, 'foo1', function (x) {})
  //... }).xthrow()
  //... o = {
  //...   foo1 (x) {
  //...     eYo.flag.push(x)
  //...   },
  //... }
  //... eYo.c3s.appendToMethod(o, 'foo1', function (x) {
  //...   eYo.flag.push(x+1)
  //... })
  //... o.foo1(1)
  //... eYo.flag.expect(12)
  //>>>
}

// ANCHOR Top level constructor utilities

eYo.mixinFR(eYo.c3s._p, {
  /**
   * @name{eYo.c3s._p.doNewC3s}
   * Make a constructor with an `eYo.$` property.
   * Caveat, constructors must have the same arguments.
   * Use a key->value design if you do not want that.
   * The `model` object has template: `{prepare: function, init: function, dispose: function}`.
   * Each namespace has its own `newC3s` method which creates classes in itself.
   * This is not used directly, only decorated.
   * 
   * If a namespace is given and key is `foo`,
   * `foo_p` is the protocol,
   * `foo_S` is the super class, 
   * `foo_s` is the protocol of the super class, 
   * All the given parameters have their normal meaning.
   * @param {eYo._.$C3s} $ - NS:  The namespace, id:  The id, SuperC3s:  The super class, model:  The dictionary of parameters.
   * @return {Function} the created constructor.
   */
  doNewC3s ($) {
    !$.NS || $.NS === eYo.NULL_NS || eYo.isNS($.NS) || eYo.throw(`${this.name}/doNewC3s: Bad ns: ${$.NS}`)
    !$.id || eYo.isId($.id) || eYo.throw(`${this.name}/doNewC3s: Bad id: ${$.id.toString()}`)

    !$.SuperC3s || eYo.isC3s($.SuperC3s) || eYo.throw(`${this.name}/doNewC3s: Bad SuperC3s: ${$.SuperC3s}`)
    if (!eYo.isD($.model)) {
      console.error($.model)
    }
    eYo.isD($.model) || eYo.throw(`${this.name}/doNewC3s: Bad model: ${$.model}`)

    // process
    let SuperDlgt = $.SuperC3s && $.SuperC3s[eYo.$] && $.SuperC3s[eYo.$].constructor || $.NS.Dlgt
    let eyo$ = eYo.dlgt.new($.NS, $.id, SuperDlgt, $.model)
    let C3s = eyo$.newC3s($.SuperC3s)
    eYo.mixinFR(C3s, {
      [eYo.$newSubC3s]: eYo.c3s.makeSubC3s.bind(eyo$),
    })
    return C3s
  },
})

eYo.mixinFR(eYo.c3s._p, {
  /**
   * This decorator turns f with signature
   * function (ns, id, SuperC3s, model) {}
   * into
   * function ([ns], [id], [model]) {}.
   * After decoration, a call to the resulting function is equivalent to a newC3s,
   * the SuperC3s being the receiver's C3s.
   * Both functions belong to the namespace context,
   * id est `this` is a namespace.
   * This decorator and the decorated function have a namespace as `this` object.
   * @param{Function} f - the Dlgt constructor maker to decorate.
   */
  makeSubC3sDecorate (f) {
    return function (ns, id, register, model) {
      var SuperC3s = this.C3s
      if (!eYo.isNS(ns)) {
        model && eYo.throw(`Unexpected model (1): ${model}`)
        ;[ns, id, register, model] = [this.ns, ns, id, register]
      }
      if (!eYo.isId(id)) {
        model && eYo.throw(`Unexpected model (2): ${model}`)
        ;[id, register, model] = [ns ? this.key : '?', id, register]
      }
      //ANCHOR: makeC3sDecorate
      var ff = (this.ns||eYo.c3s).makeC3sDecorate(f)
      return ff.call(this.ns||eYo.c3s, ns, id, SuperC3s, register, model)
    }
  },
})

eYo.mixinFR(eYo._, {
  /**
   * Turns the arguments into a `eYo._.$C3s` instance.
   * When there is a unique argument which is already an instance of
   * `eYo._.$C3s`, the argument is returned as is.
   * 
   * @param {Object} [NS] - Namespace
   * @param {String | Symbol} [id] - Identifier
   * @param {eYo.C3s} [SuperC3s] - Super constructor
   * @param {*} register - Whther to register in the appropriate database
   * @param {*} [model] - Model
   */
  $newC3s (NS, id, SuperC3s, register, model) {
    //<<< mochai: eYo._.$newC3s
    if (eYo.isa$(NS)) {
      return NS
    }
    //... var NS = eYo.c3s.newNS()
    if (!eYo.isNS(NS)) {
      if(model) {
        eYo.test && eYo.test.IN_THROW || console.error('BREAK HERE!!!')
      }
      model && eYo.throw(`eYo._.$newC3s: Unexpected model(1/${model})`)
      //... chai.expect(() => eYo._.$newC3s(1, 2, 3, 4)).xthrow()
      ;[NS, id, SuperC3s, register, model] = [this, NS, id, SuperC3s, register]
      //... ;[eYo.NA, NS].forEach(ns => {
      //...   ;[eYo.NA, 'Foo'].forEach(id => {
      //...     ;[eYo.NA, NS.C3sBase].forEach(SuperC3s => {
      //...       ;[eYo.NA, {}].forEach(model => {
      //...         var $ = []
      //...         ns && $.push(ns)
      //...         id && $.push(id)
      //...         SuperC3s && $.push(SuperC3s)
      //...         model && $.push(model)
      //...         $ = eYo._.$newC3s(...$)
      //...         ns && chai.expect($.NS).equal(ns)
      //...         console.error($.id)
      //...         console.error(id)
      //...         $.id === 'C3sBase' || id && chai.expect($.id).equal(id) || chai.expect($.id).eyo_Sym
      //...         chai.expect($.SuperC3s).equal(SuperC3s)
      //...         chai.expect($.model).eql(model || {})
      //...       })
      //...     })
      //...   })
      //... })
    }
    if (!eYo.isId(id)) {
      model && eYo.throw(`eYo._.$newC3s: Unexpected model(2/${model})`)
      ;[id, SuperC3s, register, model] = [eYo.NA, id, SuperC3s, register]
    }
    // Default value for SuperC3s, when there are arguments
    if (SuperC3s && !eYo.isC3s(SuperC3s)) {
      model && eYo.throw(`eYo._.$newC3s: Unexpected model(3/${model})`)
      ;[SuperC3s, register, model] = [eYo.NA, SuperC3s, register]
    }
    if (!eYo.isBool(register)) {
      model && eYo.throw(`eYo._.$newC3s: Unexpected model (4/${model})`)
      ;[register, model] = [false, register]
    }
    model = eYo.called(model) || {}
    if (id) {
      SuperC3s || (SuperC3s = model[eYo.$SuperC3s] || eYo.asF(this[id]) || this.C3sBase)
    } else if (SuperC3s || (SuperC3s = model[eYo.$SuperC3s])) {
      id = SuperC3s[eYo.$] && SuperC3s[eYo.$].id
      // possible id conflict here if NS is SuperC3s's namespace
    } else {
      id = Symbol(`${this.name}.?`)
      //... var NS = eYo.c3s.newNS()
      //... chai.expect(NS.C3sBase).equal(eYo.c3s.C3sBase)
      //... chai.expect(NS.C3sBase_p).equal(eYo.C3s_p)
      //... NS.makeC3sBase()
      //... chai.expect(NS.C3sBase).not.equal(eYo.c3s.C3sBase)
      //... chai.expect(NS.C3sBase_p).not.equal(eYo.C3s_p)
      //... chai.expect(NS.newC3s({
      //...   [eYo.$SuperC3s]: eYo.NA,
      //... })[eYo.$SuperC3s]).undefined
      if (!eYo.objectHasOwnProperty(model, eYo.$SuperC3s)) {
        SuperC3s = this.C3sBase
      //... chai.expect(NS.newC3s()[eYo.$SuperC3s]).equal(NS.C3sBase)
      }
    }
    if (eYo.isSubclass(this.C3sBase, SuperC3s)) {
      SuperC3s = this.C3sBase
    }
    return eYo._.new$({NS, id, SuperC3s, register, model})
    //>>>
  }
})

eYo.mixinFR(eYo.c3s._p, {
  /**
   * @name{eYo.c3s.newC3s}
   * Make a constructor with an `[eYo.$]` property.
   * Caveat, constructors must have the same arguments.
   * Use a key->value design if you do not want that.
   * The `params` object has template: `{init: function, dispose: function}`.
   * Each namespace has its own `newC3s` method which creates classes in itself.
   * @param {Object} [ns] -  The namespace, defaults to the SuperC3s's one or the caller.
   * @param {String} id -  The id.
   * @param {Function} [SuperC3s] -  The eventual super class. There is no default value. Must be a subclass of `eYo.c3s.C3sBase`, but not necessarily with an `eyo`.
   * @param {Boolean} [register] -  Whether to register the created constructor.
   * @param {Object|Function} [model] -  The dictionary of parameters. Or a function to create such a dictionary. This might be overcomplicated.
   * @return {Function} the created constructor.
   */
  newC3s (ns, id, SuperC3s, register, model) {
    //<<< mochai: newC3s
    let $ = eYo._.$newC3s(ns, id, SuperC3s, register, model)
    let C3s = this.doNewC3s($)
    register && this.register($.model.register, C3s)
    //... let NS = eYo.c3s.newNS()
    //... chai.expect(NS.newC3s)
    //... let C3s = NS.newC3s()
    //... C3s[eYo.$].finalizeC3s()
    //... chai.expect(C3s).eyo_C3s
    //... let o = new C3s()
    //... chai.expect(o).instanceOf(C3s)
    //>>>
  },
})
//
eYo.mixinFR(eYo, {
  makeNewC3s () {

  }
})
// ANCHOR Constructor utilities
{
  eYo.mixinRO(eYo.c3s, {
    /**
     * All the created constructors, by name. Private storage.
     * @package
     */
    byName__: new Map(),
    /**
     * All the created constructors, by id. Private storage.
     * @package
     */
    byId__: new Map(),
    /**
     * All the created constructors, by type. Private storage.
     * @package
     */
    byType__: new Map(),
  })

  eYo.mixinFR(eYo.c3s, {
    /**
     * All the created delegates. Public accessor by key.
     * @param{String} id - the key used to create the constructor.
     */
    forId (id) {
      return eYo.c3s.byId__.get(id)
    },
    /**
     * All the created delegates. Public accessor by name.
     * @param{String} name - the name used to create the constructor.
     */
    forName (name) {
      return eYo.c3s.byName__.get(name)
    },
    /**
     * All the created delegates. Public accessor by type.
     * @param{String} type - the type used to create the constructor.
     */
    forType (type) {
      return eYo.c3s.byType__.get(type)
    },
  })

  /**
   * @type{Array<String>}
   * @property{types}
   */
  eYo.mixinRO(eYo.c3s._p, {
    types () {
      return eYo.c3s.byType__.keys()
    },
  })

  eYo.mixinFR(eYo.c3s._p, {
    /**
     * Delegate registrator.
     * The constructor has an eyo attached object for
     * some kind of introspection.
     * Computes and caches the model
     * only once from the creation of the delegate.
     *
     * The last delegate registered for a given prototype name wins.
     * @param {!String} [id] - the optional id
     * @param {Object} C3s
     * @private
     */
    register (id, C3s) {
      if (id && !eYo.isStr(id)) {
        C3s && eYo.throw(`UNEXPECTED ${C3s}`)
        ;[id, C3s] = [id[eYo.$].id, id]
      }
      var type
      if ((type = eYo.t3.expr[id])) {
        eYo.t3.expr.available.push(type)
      } else if ((type = eYo.t3.stmt[id])) {
        eYo.t3.stmt.available.push(type)
      }
      var eyo = C3s[eYo.$]
      id = eyo.id
      id && eYo.c3s.byId__.set(id, C3s)
      var name = eyo.name
      name && eYo.c3s.byName__.set(name, C3s)
      if (type) {
        eYo.c3s.byType__.set(type, C3s)
        // cache all the input, output and statement data at the prototype level
      }
    },
  })
}

// ANCHOR eYo.c3s._p.makeSubC3s
eYo.mixinFR(eYo.c3s._p, {
  /**
   * Convenient shortcut to create subclasses.
   * Forwards to the namespace which must exist!
   * @param {Object} [ns] -  The namespace, possibly `eYo.NA`.
   * @param {String|Symbol|eYo._.$C3s} id -  to create `ns[id]`.
   * When an instance of `eYo._.$C3s` it must be the unique argument.
   * @param {Object} [model] -  Model object
   * @return {?Function} the constructor created or `eYo.NA` when the receiver has no namespace.
   * @this {eYo.Dlgt}
   */
  makeSubC3s (ns, id, SuperC3s, model) {
    let $ = eYo._.$newC3s(ns, id, SuperC3s, model)
    return this.doNewC3s($)
  },
})

// ANCHOR Base
{
  eYo.mixinFR(eYo.c3s._p, {
    /**
     * Convenient method to create the Base class.
     * @param {Boolean} [unfinalize] - whether not to finalize the constructor or not.
     * @param {Function} [SuperC3s] - the ancestor class
     * @param {Object} [model] - the model
     */
    makeC3sBase (unfinalize, SuperC3s, model) {
      //<<< mochai: eYo.c3s.makeC3sBase
      //... chai.assert(eYo.c3s.makeC3sBase)
      eYo.objectHasOwnProperty(this, 'C3sBase') && eYo.throw(`${this.name}: Already Base`)
      //... var NS = eYo.c3s.newNS()
      //... NS.makeC3sBase()
      //... chai.expect(() => NS.makeC3sBase()).xthrow()
      if (!eYo.isBool(unfinalize)) {
        eYo.isNA(model) || eYo.throw(`${this.name}/makeC3sBase Unexpected last argument: ${model}`)
        //... chai.expect(() => NS.makeC3sBase(eYo.doNothing, {}, 1)).xthrow()
        ;[unfinalize, SuperC3s, model] = [false, unfinalize, SuperC3s]
      }
      if (eYo.isC3s(SuperC3s)) {
        model = eYo.called(model) || {}
        //... var model = { foo: 421}
        //... var C3s = eYo.c3s.newNS().makeC3sBase(() => model)
        //... chai.expect(C3s[eYo.$].model.foo).equal(421)
      } else {
        eYo.isNA(model) || eYo.throw(`${this.name}/makeC3sBase: Unexpected argument (${model})`)
        //... chai.expect(() => NS.makeC3sBase({}, 1)).xthrow()
        model = eYo.called(SuperC3s) || {}
        SuperC3s = model && model[eYo.$$[eYo.$SuperC3s]] || this.$super && this.$super.C3sBase || eYo.NA
      }
      let C3s = this.newC3s(this, 'C3sBase', SuperC3s, model)
      //... var ns = eYo.c3s.newNS()
      //... var C3s = ns.makeC3sBase()
      //... chai.expect(C3s).eyo_C3sBase
      if (!this.anonymous) {
        let parentNS = this.parentNS
        if (parentNS && (eYo.objectHasOwnProperty(this._p, 'key') || eYo.objectHasOwnProperty(this, 'key'))) {
          // Convenient shortcut
          var K = eYo.do.toTitleCase(this.key)
          eYo.mixinRO(parentNS, {
            [K] () {
              return C3s
            },
            [K+'_p'] () {
              return C3s.prototype
            },
            [K+'$'] () {
              return C3s[eYo.$]
            },
          })
          eYo.mixinRO(C3s[eYo.$], {
            name () {
              return `${parentNS.name}.${K}`
            },
          })
          //... var seed = eYo.genUID(eYo.ALNUM)
          //... var key = 'x' + seed
          //... var Key = 'X' + seed
          //... var ns = eYo.c3s.newNS(eYo, key)
          //... chai.expect(ns).equal(eYo[key])
          //... chai.expect(ns.key).equal(key)
          //... chai.expect(ns.parentNS).equal(eYo)
          //... ns.makeC3sBase()
          //... chai.expect(ns.C3sBase).equal(eYo[Key])
        }
      }
      eYo.mixinRO(this, {
        Dlgt_p () {
          return C3s[eYo.$]._p
          //... var ns = eYo.c3s.newNS()
          //... ns.makeC3sBase()
          //... chai.expect(ns.Dlgt_p).equal(ns.C3sBase[eYo.$_p])
        },
        Dlgt () {
          return C3s[eYo.$]._p.constructor
          //... var ns = eYo.c3s.newNS()
          //... ns.makeC3sBase()
          //... chai.expect(ns.Dlgt).equal(ns.C3sBase[eYo.$].constructor)
        },
      })
      !unfinalize && C3s[eYo.$].finalizeC3s()
      return C3s
      //>>>
    },
  })
  
  eYo.mixinFR(eYo.c3s, {
    /**
     * The default implementation does nothing yet.
     * @param{eYo.O3d} _$this - the instance to initialize
     */
    c9rPrepare (_$this) {},
    /**
     * The default implementation does nothing yet.
     * @param{eYo.O3d} _$this - the instance to initialize
     * @param{String | Symbol} key - The key in the owner
     * @param{eYo.C3s | namespace} [owner] - Defaults to the name space
     * @param{Boolean} [configurable] - Whether descriptors should be configurable, necessary for proxy.
     */
    c9rInit (_$this) {},
    /**
     * The default implementation does nothing  yet.
     * @param{eYo.O3d} $this - the instance to initialize
     * @param{String | Symbol} key - The key in the owner
     * @param{eYo.C3s | namespace} [owner] - Defaults to the name space
     * @param{Boolean} [configurable] - Whether descriptors should be configurable, necessary for proxy.
     */
    c9rDispose ($this) {},
  })
    
  /**
   * Basic object constructor.
   * Each constructor has an eyo property, a delegate, which points to a singleton instance. If a class inherits from an ancestor, then the delegate class also inherits from the class of the ancestor's delegate.
   * The default class.
   * @name {eYo.C3s}
   * @constructor
   */

  eYo.c3s.makeC3sBase(true, {
    /** 
     * @param {String} key - an identifier for the owner.
     * @param {eYo.c3s.C3sBase} owner - the immediate owner of this object.
     */
    prepare () {
      eYo.c3s.c9rInit(this)
    },
    /** 
     * @param {String} key - an identifier for the owner.
     * @param {eYo.c3s.C3sBase} owner - the immediate owner of this object.
     */
    init () {
      eYo.c3s.c9rInit(this)
    },
    dispose () {
      eYo.c3s.c9rDispose(this)
    },  
  })

  eYo.mixinFR(eYo._p, {
    /**
     * Whether the argument is a property instance.
     * @param {*} what 
     */
    isaC3s (what) {
      return !!what && what instanceof eYo.C3s
      //<<< mochai: isaC3s (what)
      //... chai.expect(eYo.isaC3s(true)).false
      //... chai.expect(eYo.isaC3s(new eYo.c3s.C3sBase())).true
      //>>>
    }
  })
  
  eYo.mixinRO(eYo.C3s_p, {
    /**
     * Convenience shortcut to the model
     */
    model () {
      return this.eyo$.model
    },
    /**
     * Convenience shortcut to the name space
     */
    ns () {
      return this.eyo$.ns
    },
  })
}

// ANCHOR model

eYo.mixinFR(eYo.model, {
  /**
   * The created model, by key.
   * @param{String} key - the key used to create the constructor.
   */
  forId (id) {
    var C3s = eYo.c3s.byId__[id]
    return C3s && C3s[eYo.$].model
  },
  /**
   * The created model, by name.
   * @param{String} name - the key used to create the constructor.
   */
  forName (name) {
    var C3s = eYo.c3s.byName(name)
    return C3s && C3s[eYo.$].model
  },
  /**
   * The created models given its type.
   * @param{String} type - the key used to create the constructor.
   */
  forType (type) {
    var C3s = eYo.c3s.byType__[type]
    return C3s && C3s[eYo.$].model
  },
})

/**
 * For subclassers.
 * Create methods in the managed prototype according to the given model.
 * @param {String} [key] - 
 * @param {Object} model - model object
 */
eYo.c3s.Dlgt_p.modelHandle = {
  modelHandle (_key, _model) {
  }
}.modelHandle

// ANCHOR Initers, Disposers

eYo.make$$('starters')

eYo.mixinFR(eYo.c3s._p, {
  /**
   * The model Base used to derive a new class. Used by `modelMakeC3s`.
   * @see The `new` method.
   * @param {Object} model
   * @param {String} key
   */
  modelC3sBase (model, key) { // eslint-disable-line
    return this.C3sBase
  },
  /**
   * Create a new constructor based on the model.
   * No need to subclass.
   * Instead, override `modelC3sBase` and `modelHandle`.
   * @param {Object} model
   * @param {*} ...$ - other arguments
   */
  modelMakeC3s (model, id) {
    //<<< mochai: modelMakeC3s
    let C3s = this.newC3s(Symbol(''), this.modelC3sBase(model, id), model)
    C3s[eYo.$].finalizeC3s()
    model = C3s[eYo.$].model
    model[eYo.$C3s] = C3s
    //... var model = {}
    //... var C3s = eYo.c3s.modelMakeC3s(model)
    //... chai.expect(model[eYo.$C3s]).equal(C3s)
    //... chai.expect(C3s[eYo.$].model).equal(model)
    //... model[eYo.$SuperC3s] = eYo.c3s.newNS().makeC3sBase()
    //... var C3s = eYo.c3s.modelMakeC3s(model)
    //... chai.expect(eYo.isSubclass(C3s, model[eYo.$SuperC3s]))
    model[eYo.$$.starters] = []
    let eyo$ = C3s[eYo.$]
    eyo$.modelHandle()
    Object.defineProperty(eyo$, 'name',
      eYo.descriptorR((()=> {
        return id
          ? {$ () {
            return `${eyo$.ns.name}.${eYo.do.toTitleCase(id.description || id)}`
          }}.$ : {$ () {
            return `${eyo$.$super.name}(${model.register || '...'})`
          }}.$
      })())
    )
    model.register && this.register(model.register, C3s)
    return C3s
    //>>>
  },
  /**
   * Create a new Base instance based on the model
   * @param {Object} [model] - Optional model, 
   * @param {...} [...] - Other arguments are passed to the constructor.
   */
  prepare (model, ...$) {
    //<<< mochai: prepare
    //... let NS = eYo.c3s.newNS()
    //... var model = {
    //...   prepare (...$) {
    //...     eYo.flag.push('p', ...$)
    //...   }
    //... }
    //... NS.makeC3sBase(model)
    //... var SuperC3s = eYo.c3s.newC3s(eYo.genUID(eYo.IDENT), model)
    //... SuperC3s[eYo.$].finalizeC3s()
    if (!eYo.isD(model)) {
      var C3s = this.C3sBase
      return new C3s(...arguments)
      //... var o = NS.prepare(1, 2)
      //... chai.expect(o).instanceOf(NS.C3sBase)
      //... eYo.flag.expect('p12')
    }
    C3s = model[eYo.$C3s]
    if (!C3s) {
      C3s = this.modelMakeC3s(model, ...$)
      //... var o = NS.prepare({}, 1, 2)
      //... chai.expect(o).instanceOf(eYo.c3s.C3sBase)
      //... eYo.flag.expect('p12')
    }
    //... var o = eYo.c3s.prepare({
    //...   [eYo.$C3s]: NS.C3sBase
    //... }, 1, 2)
    //... chai.expect(o).instanceOf(NS.C3sBase)
    //... eYo.flag.expect('p12')
    var ans = new C3s(...$)
    ans.preInit = function () {
      delete this.preInit
      model[eYo.$$.starters].forEach(f => f(this))
    }
    return ans
    //... var o = eYo.c3s.prepare({
    //...   dispose (...$) {
    //...     eYo.flag.push('x', ...$)
    //...   }
    //... })
    //... o.dispose(1, 2)
    //... eYo.flag.expect('x12')
    //... var o = eYo.c3s.prepare({
    //...   methods: {
    //...     flag (...$) {
    //...       eYo.flag.push('/', ...$)
    //...     },
    //...   },
    //... })
    //... o.flag(1, 2)
    //... eYo.flag.expect('/12')
    //>>>
  },
  /**
   * Create a new Base instance based on the model
   */
  new (...$) {
    //<<< mochai: new
    let ans = this.prepare(...$)
    ans.preInit && ans.preInit()
    ans.init(...$)
    return ans
    //... let foo = eYo.c3s.new('foo')
    //... chai.expect(foo).instanceOf(eYo.C3s)
    //>>>
  },
  /**
   * Create a new instance based on the model.
   * @param {Object} model
   */
  singleton (model) {
    //<<< mochai: singleton
    let C3s = this.newC3s('', model)
    C3s[eYo.$].finalizeC3s()
    return new C3s()
    //... var foo = eYo.c3s.singleton()
    //... chai.expect(foo).instanceof(eYo.C3s)
    //... var foo = eYo.c3s.singleton({
    //...   CONSTs: {
    //...     FOO: 421,
    //...   },
    //...   methods: {
    //...     flag(...$) {
    //...       eYo.flag.push('/', ...$)
    //...     }
    //...   }
    //... })
    //... foo.flag(1, 2)
    //... eYo.flag.expect('/12')
    //... chai.expect(foo.FOO).equal(421)
    //>>>
  },
  /**
   * Create a new instance based on the model.
   * @param {Object} [NS] - Optional namespace, defaults to the receiver.
   * @param {Object} id - the result will be `NS[id]`
   * @param {Object} model
   */
  newSingleton (NS, id, model) {
    //<<< mochai: newSingleton
    //... let NS = eYo.c3s.newNS()
    if (!eYo.isNS(NS)) {
      eYo.isNA(model) || eYo.throw(`${this.name}/newSingleton: Unexpected model (${model})`)
      //... chai.expect(() => {
      //...   eYo.c3s.newSingleton('foo', {}, 1)
      //... }).xthrow()
      ;[NS, id, model] = [this, NS, id]
      //... var ident = eYo.genUID(eYo.IDENT)
      //... var ans = NS.newSingleton(ident, {})
      //... chai.expect(ans).instanceof(eYo.C3s)
      //... chai.expect(ans).equal(NS[ident])
    }
    eYo.isId(id) || eYo.throw(`${this.name}/newSingleton: Unexpected parameter ${eYo.isSym(id) ? id.toString(): id}`)
    //... chai.expect(() => {
    //...   eYo.c3s.newSingleton(1, {})
    //... }).xthrow()
    let C3s = this.newC3s(Symbol(eYo.do.toTitleCase(id)), model)
    C3s[eYo.$].finalizeC3s()
    let ans = new C3s()
    Object.defineProperty(NS, id, eYo.descriptorR({$ () {
      return ans
    }}.$))
    return ans
    //... var ans = eYo.c3s.newSingleton(NS, 'id', {})
    //... chai.expect(ans).instanceof(eYo.C3s)
    //... chai.expect(ans).equal(NS.id)
    //... var foo = eYo.c3s.newSingleton(NS, 'id1', {
    //...   CONSTs: {
    //...     FOO: 421,
    //...   },
    //...   methods: {
    //...     flag(...$) {
    //...       eYo.flag.push('/', ...$)
    //...     }
    //...   }
    //... })
    //... NS.id1.flag(1, 2)
    //... eYo.flag.expect('/12')
    //... chai.expect(NS.id1.FOO).equal(421)
    //... var SuperC3s = eYo.c3s.newC3s('')
    //... SuperC3s[eYo.$].finalizeC3s()
    //... ans = NS.newSingleton('id2', {
    //...   [eYo.$SuperC3s]: SuperC3s
    //... })
    //... chai.expect(ans).instanceof(SuperC3s)
    //... ans = NS.newSingleton('id3', {
    //...   [eYo.$SuperC3s]: eYo.NA
    //... })
    //... chai.expect(ans.eyo$.SuperC3s).undefined
    //>>>
  },
})

// ANCHOR: Model

// Prepares the constructors.

Object.assign(eYo.C3s_p, {
  /**
   * Initialize the receiver, it should not be overriden but it is still exposed for debugging purposes mainly.
   * Called by `newFoo` creator.
   * @param  {...any} $ 
   */
  init (...$) {
    //<<< mochai: eYo.C3s_p.init
    try {
      this.init = eYo.doNothing
      this.eyo$.c9rInit(this, ...$)
    } finally {
      delete this.init
    }
    //... chai.expect(eYo.C3s_p.init).eyo_F
    //>>>
  },
  /**
   * Initialize the receiver, it should not be overriden but it is still exposed for debugging purposes mainly.
   * Must be called.
   * @param  {...any} $ 
   */
  dispose (...$) {
    //<<< mochai: eYo.C3s_p.dispose
    try {
      this.dispose = eYo.doNothing
      this.eyo$.c9rDispose(this, ...$)
    } finally {
      delete this.dispose
    }
    //... chai.expect(eYo.C3s_p.dispose).eyo_F
    //>>>
  },
})

eYo.C3s$.finalizeC3s(
  //<<< mochai: eYo.C3s$.finalizeC3s
  //... chai.expect(eYo.C3s[eYo.$].hasFinalizedC3s).true
  eYo.model.manyDescriptorF('dlgt', 'prepare', 'init'),
  //... ;['init', eYo.$,].forEach(K => {
  //...   eYo.c3s.new({
  //...     [K]: eYo.doNothing
  //...   })
  //...   eYo.c3s.new({
  //...     [K]: eYo.NA
  //...   })
  //...   chai.expect(() => {
  //...     eYo.c3s.new({
  //...       [K]: 421
  //...     })
  //...   }).xthrow()
  //... })
  eYo.model.manyDescriptorForFalse('dispose'),
  {
    methods: {
      [eYo.model.VALIDATE]: eYo.model.validateD,
      //... eYo.c3s.new({
      //...   methods: eYo.NA
      //... })
      //... chai.expect(() => {
      //...   eYo.c3s.new({
      //...     methods: 421,
      //...   })
      //... }).xthrow()
      [eYo.model.ANY]: eYo.model.descriptorF(),
      //... eYo.c3s.new({
      //...   methods: {
      //...     foo: eYo.NA,
      //...     chi () {},
      //...   }
      //... })
      //... chai.expect(() => {
      //...   eYo.c3s.new({
      //...     methods: {
      //...       mi: 421,
      //...     },
      //...   })
      //... }).xthrow()
    },
    CONSTs: {
      [eYo.model.VALIDATE]: eYo.model.validateD,
      //... eYo.c3s.new({
      //...   CONSTs: eYo.NA
      //... })
      //... chai.expect(() => {
      //...   eYo.c3s.new({
      //...     CONSTs: 421,
      //...   })
      //... }).xthrow()
      [eYo.model.ANY]: {
        [eYo.model.VALIDATE]: function (before, key) {
          if (key) {
            if (!XRegExp.exec(key, eYo.xre.CONST)) {
              return eYo.INVALID
            }
          }
          //... eYo.c3s.new({
          //...   CONSTs: {
          //...     CONST_421: 421,
          //...   }
          //... })
          //... chai.expect(() => {
          //...   eYo.c3s.new({
          //...     CONSTs: {
          //...       cCONST_421: 421,
          //...     },
          //...   })
          //... }).xthrow()
        }
      },
    },
  }
  //>>>
)

//>>>