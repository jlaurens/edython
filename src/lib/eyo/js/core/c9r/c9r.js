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
eYo.require('do')
eYo.require('dlgt')
eYo.require('decorate')

eYo.forward('t3')

/**
 * Management of constructors and models.
 * Models are trees with some inheritancy.
 * @name {eYo.c9r}
 * @namespace
 */
eYo.newNS('c9r')

eYo.mixinRO(eYo, {
  $C9r: Symbol('C9r'),
  $newSubC9r: Symbol('newSubC9r'),
  $new: Symbol('$new'),
})

//<<< mochai: C9r

// ANCHOR: Utilities

/**
 * Convenient way to append code to an already existing method.
 * This allows to define a method in different places.
 * @param {Object} object - Object
 * @param {String} key - Looking for or creating |Object[key]|
 * @param {Function} f - the function we will append
 */
eYo.c9r._p.appendToMethod = (object, key, f) => {
  //<<< mochai: eYo.c9r.appendToMethod
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
  //... eYo.c9r.appendToMethod(o, 'foo1', function (x) {
  //...   eYo.flag.push(x)
  //... })
  //... o.foo1(1)
  //... eYo.flag.expect(1)
  //... o = {
  //...   foo1: eYo.doNothing,
  //... }
  //... eYo.c9r.appendToMethod(o, 'foo1', function (x) {
  //...   eYo.flag.push(x)
  //... })
  //... o.foo1(1)
  //... eYo.flag.expect(1)
  //... o = {
  //...   foo1: 421,
  //... }
  //... chai.expect(() => {
  //...   eYo.c9r.appendToMethod(o, 'foo1', function (x) {})
  //... }).throw()
  //... o = {
  //...   foo1 (x) {
  //...     eYo.flag.push(x)
  //...   },
  //... }
  //... eYo.c9r.appendToMethod(o, 'foo1', function (x) {
  //...   eYo.flag.push(x+1)
  //... })
  //... o.foo1(1)
  //... eYo.flag.expect(12)
  //>>>
}

// ANCHOR Top level constructor utilities

eYo.mixinFR(eYo.c9r._p, {
  /**
   * @name{eYo.c9r._p.doNewC9r}
   * Make a constructor with an `eYo.$` property.
   * Caveat, constructors must have the same arguments.
   * Use a key->value design if you do not want that.
   * The `model` object has template: `{prepare: function, init: function, dispose: function}`.
   * Each namespace has its own `newC9r` method which creates classes in itself.
   * This is not used directly, only decorated.
   * 
   * If a namespace is given and key is `foo`,
   * `foo_p` is the protocol,
   * `foo_S` is the super class, 
   * `foo_s` is the protocol of the super class, 
   * All the given parameters have their normal meaning.
   * @param {Object} ns -  The namespace.
   * @param {String|Symbol} id -  The id.
   * @param {Function} SuperC9r -  The super class.
   * @param {Object|Function} model -  The dictionary of parameters.
   * @return {Function} the created constructor.
   */
  doNewC9r (ns, id, SuperC9r, model) {
    !ns || ns === eYo.NULL_NS || eYo.isNS(ns) || eYo.throw(`${this.name}/doNewC9r: Bad ns: ${ns}`)
    !id || eYo.isId(id) || eYo.throw(`${this.name}/doNewC9r: Bad id: ${id.toString()}`)

    !SuperC9r || eYo.isC9r(SuperC9r) || eYo.throw(`${this.name}/doNewC9r: Bad SuperC9r: ${SuperC9r}`)
    if (!eYo.isD(model)) {
      console.error(model)
    }
    eYo.isD(model) || eYo.throw(`${this.name}/doNewC9r: Bad model: ${model}`)

    // process
    let SuperDlgt = SuperC9r && SuperC9r[eYo.$] && SuperC9r[eYo.$].constructor || ns.Dlgt
    let eyo$ = eYo.dlgt.new(ns, id, SuperDlgt, model)
    let C9r = eyo$.newC9r(SuperC9r)
    eYo.mixinFR(C9r, {
      [eYo.$newSubC9r]: eYo.c9r.makeSubC9r.bind(eyo$),
    })
    return C9r
  },
  /**
   * This decorator turns `f` with signature
   * function (NS, id, SuperC9r, model) {...}
   * into
   * function ([NS], [id], [SuperC9r], [register], [model]) {...}.
   * Both functions have `this` bound to a namespace.
   * If argument `NS` is not provided, just replace it with the receiver.
   * `SuperC9r` will be given a default value when there are arguments.
   * @param{Function} f
   * @this{undefined}
   */
  makeC9rDecorate (f) {
  //<<< mochai: makeC9rDecorate
    return function (NS, id, SuperC9r, register, model) {
    // makeC9rDecorate
    //... var NS = eYo.c9r.newNS()
      if (!eYo.isNS(NS)) {
        if(model) {
          console.error('BREAK HERE!!!')
        }
        model && eYo.throw(`${this.name}/makeC9rDecorate: Unexpected model(1/${model})`)
        //... console.error('IGNORE next BREAK HERE')
        //... chai.expect(() => eYo.c9r.makeC9rDecorate(eYo.doNothing)(1, 2, 3, 4, 5)).throw()
        ;[NS, id, SuperC9r, register, model] = [this, NS, id, SuperC9r, register]
      //... var f = function (NS, id, SuperC9r, register, model) {
      //...   chai.expect(NS).equal(this)
      //... }
      //... ;[eYo.NA, 'Foo'].forEach(id => {
      //...   ;[eYo.NA, NS.C9rBase].forEach(SuperC9r => {
      //...     ;[eYo.NA, {}].forEach(model => {
      //...       var $ = []
      //...       id && $.push(id)
      //...       SuperC9r && $.push(SuperC9r)
      //...       model && $.push(model)
      //...       eYo.c9r.makeC9rDecorate(f).call(NS, 'Foo', NS.C9rBase, {})
      //...     })
      //...   })
      //... })
      }
      if (!eYo.isId(id)) {
        model && eYo.throw(`${this.name}/makeC9rDecorate: Unexpected model(2/${model})`)
        ;[id, SuperC9r, register, model] = [eYo.NA, id, SuperC9r, register]
      }
      // Default value for SuperC9r, when there are arguments
      if (SuperC9r && !eYo.isC9r(SuperC9r)) {
        model && eYo.throw(`${this.name}/makeC9rDecorate: Unexpected model(3/${model})`)
        ;[SuperC9r, register, model] = [eYo.NA, SuperC9r, register]
      }
      if (!eYo.isBool(register)) {
        model && eYo.throw(`${this.name}/makeC9rDecorate: Unexpected model (4/${model})`)
        ;[register, model] = [false, register]
      }
      model = eYo.called(model) || {}
      if (id) {
        SuperC9r || (SuperC9r = model[eYo.$SuperC9r] || eYo.asF(this[id]) || this.C9rBase)
      } else if (SuperC9r || (SuperC9r = model[eYo.$SuperC9r])) {
        id = SuperC9r[eYo.$] && SuperC9r[eYo.$].id
        // possible id conflict here if NS is SuperC9r's namespace
      } else {
        id = Symbol(`${this.name}.?`)
        //... var NS = eYo.c9r.newNS()
        //... chai.expect(NS.C9rBase).equal(eYo.c9r.C9rBase)
        //... chai.expect(NS.C9rBase_p).equal(eYo.C9r_p)
        //... NS.makeC9rBase()
        //... chai.expect(NS.C9rBase).not.equal(eYo.c9r.C9rBase)
        //... chai.expect(NS.C9rBase_p).not.equal(eYo.C9r_p)
        //... chai.expect(NS.newC9r({
        //...   [eYo.$SuperC9r]: eYo.NA,
        //... })[eYo.$SuperC9r]).undefined
        if (!eYo.objectHasOwnProperty(model, eYo.$SuperC9r)) {
          SuperC9r = this.C9rBase
        //... chai.expect(NS.newC9r()[eYo.$SuperC9r]).equal(NS.C9rBase)
        }
      }
      if (eYo.isSubclass(this.C9rBase, SuperC9r)) {
        SuperC9r = this.C9rBase
      }
      let C9r = f.call(this, NS, id, SuperC9r, model)
      register && eYo.c9r.register(C9r)
      return C9r
    }
  //>>>
  },
})

eYo.mixinFR(eYo.c9r._p, {
  /**
   * This decorator turns f with signature
   * function (ns, id, SuperC9r, model) {}
   * into
   * function ([ns], [id], [model]) {}.
   * After decoration, a call to the resulting function is equivalent to a newC9r,
   * the SuperC9r being the receiver's C9r.
   * Both functions belong to the namespace context,
   * id est `this` is a namespace.
   * This decorator and the decorated function have a namespace as `this` object.
   * @param{Function} f - the Dlgt constructor maker to decorate.
   */
  makeSubC9rDecorate (f) {
    return function (ns, id, register, model) {
      var SuperC9r = this.C9r
      if (!eYo.isNS(ns)) {
        model && eYo.throw(`Unexpected model (1): ${model}`)
        ;[ns, id, register, model] = [this.ns, ns, id, register]
      }
      if (!eYo.isId(id)) {
        model && eYo.throw(`Unexpected model (2): ${model}`)
        ;[id, register, model] = [ns ? this.key : '?', id, register]
      }
      //ANCHOR: makeC9rDecorate
      var ff = (this.ns||eYo.c9r).makeC9rDecorate(f)
      return ff.call(this.ns||eYo.c9r, ns, id, SuperC9r, register, model)
    }
  },
})

eYo.mixinFR(eYo.c9r._p, {
  /**
   * @name{eYo.c9r.newC9r}
   * Make a constructor with an `[eYo.$]` property.
   * Caveat, constructors must have the same arguments.
   * Use a key->value design if you do not want that.
   * The `params` object has template: `{init: function, dispose: function}`.
   * Each namespace has its own `newC9r` method which creates classes in itself.
   * @param {Object} [ns] -  The namespace, defaults to the SuperC9r's one or the caller.
   * @param {String} id -  The id.
   * @param {Function} [SuperC9r] -  The eventual super class. There is no default value. Must be a subclass of `eYo.c9r.C9rBase`, but not necessarily with an `eyo`.
   * @param {Object|Function} [model] -  The dictionary of parameters. Or a function to create such a dictionary. This might be overcomplicated.
   * @return {Function} the created constructor.
   */
  newC9r: eYo.c9r.makeC9rDecorate({$ (ns, id, SuperC9r, model) {
  //<<< mochai: newC9r
    return this.doNewC9r(ns, id, SuperC9r, model)
  //... let NS = eYo.c9r.newNS()
  //... chai.expect(NS.newC9r)
  //... let C9r = NS.newC9r()
  //... C9r[eYo.$].finalizeC9r()
  //... chai.expect(C9r).eyo_C9r
  //... let o = new C9r()
  //... chai.expect(o).instanceOf(C9r)
  //>>>
  }}.$)
})
//
eYo.mixinFR(eYo, {
  makeNewC9r () {

  }
})
// ANCHOR Constructor utilities
{
  eYo.mixinRO(eYo.c9r, {
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

  eYo.mixinFR(eYo.c9r, {
    /**
     * All the created delegates. Public accessor by key.
     * @param{String} id - the key used to create the constructor.
     */
    forId (id) {
      return eYo.c9r.byId__.get(id)
    },
    /**
     * All the created delegates. Public accessor by name.
     * @param{String} name - the name used to create the constructor.
     */
    forName (name) {
      return eYo.c9r.byName__.get(name)
    },
    /**
     * All the created delegates. Public accessor by type.
     * @param{String} type - the type used to create the constructor.
     */
    forType (type) {
      return eYo.c9r.byType__.get(type)
    },
  })
  /**
   * @type{Array<String>}
   * @property{types}
   */
  eYo.mixinRO(eYo.c9r._p, {
    types () {
      return eYo.c9r.byType__.keys()
    },
  })

  eYo.mixinFR(eYo.c9r._p, {
    /**
     * Delegate registrator.
     * The constructor has an eyo attached object for
     * some kind of introspection.
     * Computes and caches the model
     * only once from the creation of the delegate.
     *
     * The last delegate registered for a given prototype name wins.
     * @param {!String} [id] - the optional id
     * @param {Object} C9r
     * @private
     */
    register (id, C9r) {
      if (!eYo.isStr(id)) {
        C9r && eYo.throw(`UNEXPECTED ${C9r}`)
        ;[id, C9r] = [id[eYo.$].id, id]
      }
      var type
      if ((type = eYo.t3.expr[id])) {
        eYo.t3.expr.available.push(type)
      } else if ((type = eYo.t3.stmt[id])) {
        eYo.t3.stmt.available.push(type)
      }
      var eyo = C9r[eYo.$]
      id = eyo.id
      id && eYo.c9r.byId__.set(id, C9r)
      var name = eyo.name
      name && eYo.c9r.byName__.set(name, C9r)
      if (type) {
        eYo.c9r.byType__.set(type, C9r)
        // cache all the input, output and statement data at the prototype level
      }
    },
  })
}

// ANCHOR eYo.c9r._p.makeSubC9r
eYo.mixinFR(eYo.c9r._p, {
  /**
   * Convenient shortcut to create subclasses.
   * Forwards to the namespace which must exist!
   * @param {Object} [ns] -  The namespace, possibly `eYo.NA`.
   * @param {String|Symbol} id -  to create `ns[id]`.
   * @param {Object} [model] -  Model object
   * @return {?Function} the constructor created or `eYo.NA` when the receiver has no namespace.
   * @this {eYo.Dlgt}
   */
  makeSubC9r: eYo.c9r.makeSubC9rDecorate({makeSubC9r (ns, id, SuperC9r, model) {
    return this.doNewC9r(ns, id, SuperC9r, model)
  }}.makeSubC9r)
})

// ANCHOR Base
{
  eYo.mixinFR(eYo.c9r._p, {
    /**
     * Convenient method to create the Base class.
     * @param {Boolean} [unfinalize] - whether not to finalize the constructor or not.
     * @param {Function} [SuperC9r] - the ancestor class
     * @param {Object} [model] - the model
     */
    makeC9rBase (unfinalize, SuperC9r, model) {
      //<<< mochai: eYo.c9r.makeC9rBase
      //... chai.assert(eYo.c9r.makeC9rBase)
      eYo.objectHasOwnProperty(this, 'C9rBase') && eYo.throw(`${this.name}: Already Base`)
      //... var NS = eYo.c9r.newNS()
      //... NS.makeC9rBase()
      //... chai.expect(() => NS.makeC9rBase()).throw()
      if (!eYo.isBool(unfinalize)) {
        eYo.isNA(model) || eYo.throw(`${this.name}/makeC9rBase Unexpected last argument: ${model}`)
        //... chai.expect(() => NS.makeC9rBase(eYo.doNothing, {}, 1)).throw()
        ;[unfinalize, SuperC9r, model] = [false, unfinalize, SuperC9r]
      }
      if (eYo.isC9r(SuperC9r)) {
        model = eYo.called(model) || {}
        //... var model = { foo: 421}
        //... var C9r = eYo.c9r.newNS().makeC9rBase(() => model)
        //... chai.expect(C9r[eYo.$].model.foo).equal(421)
      } else {
        eYo.isNA(model) || eYo.throw(`${this.name}/makeC9rBase: Unexpected argument (${model})`)
        //... chai.expect(() => NS.makeC9rBase({}, 1)).throw()
        model = eYo.called(SuperC9r) || {}
        SuperC9r = model && model[eYo.$$[eYo.$SuperC9r]] || this.$super && this.$super.C9rBase || eYo.NA
      }
      let C9r = this.newC9r(this, 'C9rBase', SuperC9r, model)
      //... var ns = eYo.c9r.newNS()
      //... var C9r = ns.makeC9rBase()
      //... chai.expect(C9r).eyo_C9rBase
      if (!this.anonymous) {
        let parentNS = this.parentNS
        if (parentNS && (eYo.objectHasOwnProperty(this._p, 'key') || eYo.objectHasOwnProperty(this, 'key'))) {
          // Convenient shortcut
          var K = eYo.do.toTitleCase(this.key)
          eYo.mixinRO(parentNS, {
            [K] () {
              return C9r
            },
            [K+'_p'] () {
              return C9r.prototype
            },
            [K+'$'] () {
              return C9r[eYo.$]
            },
          })
          eYo.mixinRO(C9r[eYo.$], {
            name () {
              return `${parentNS.name}.${K}`
            },
          })
          //... var seed = eYo.genUID(eYo.ALNUM)
          //... var key = 'x' + seed
          //... var Key = 'X' + seed
          //... var ns = eYo.c9r.newNS(eYo, key)
          //... chai.expect(ns).equal(eYo[key])
          //... chai.expect(ns.key).equal(key)
          //... chai.expect(ns.parentNS).equal(eYo)
          //... ns.makeC9rBase()
          //... chai.expect(ns.C9rBase).equal(eYo[Key])
        }
      }
      eYo.mixinRO(this, {
        Dlgt_p () {
          return C9r[eYo.$]._p
          //... var ns = eYo.c9r.newNS()
          //... ns.makeC9rBase()
          //... chai.expect(ns.Dlgt_p).equal(ns.C9rBase[eYo.$_p])
        },
        Dlgt () {
          return C9r[eYo.$]._p.constructor
          //... var ns = eYo.c9r.newNS()
          //... ns.makeC9rBase()
          //... chai.expect(ns.Dlgt).equal(ns.C9rBase[eYo.$].constructor)
        },
      })
      !unfinalize && C9r[eYo.$].finalizeC9r()
      return C9r
      //>>>
    },
  })
  
  /**
   * Basic object constructor.
   * Each constructor has an eyo property, a delegate, which points to a singleton instance. If a class inherits from an ancestor, then the delegate class also inherits from the class of the ancestor's delegate.
   * The default class.
   * @name {eYo.C9r}
   * @constructor
   */

  eYo.c9r.makeC9rBase(true)

  eYo.mixinFR(eYo._p, {
    /**
     * Whether the argument is a property instance.
     * @param {*} what 
     */
    isaC9r (what) {
      return !!what && what instanceof eYo.c9r.C9rBase
      //<<< mochai: isaC9r (what)
      //... chai.expect(eYo.isaC9r(true)).false
      //... chai.expect(eYo.isaC9r(new eYo.c9r.C9rBase())).true
      //>>>
    }
  })
  
  eYo.mixinRO(eYo.C9r_p, {
    /**
     * Convenience shortcut to the model
     */
    model () {
      return this.eyo$.model
    },
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
    var C9r = eYo.c9r.byId__[id]
    return C9r && C9r[eYo.$].model
  },
  /**
   * The created model, by name.
   * @param{String} name - the key used to create the constructor.
   */
  forName (name) {
    var C9r = eYo.c9r.byName(name)
    return C9r && C9r[eYo.$].model
  },
  /**
   * The created models given its type.
   * @param{String} type - the key used to create the constructor.
   */
  forType (type) {
    var C9r = eYo.c9r.byType__[type]
    return C9r && C9r[eYo.$].model
  },
})

/**
 * For subclassers.
 * Create methods in the managed prototype according to the given model.
 * @param {String} [key] - 
 * @param {Object} model - model object
 */
eYo.c9r.Dlgt_p.modelHandle = {
  modelHandle (key, model) { // eslint-disable-line
  }
}.modelHandle

// ANCHOR Initers, Disposers

eYo.make$$('starters')

eYo.mixinFR(eYo.c9r._p, {
  /**
   * The model Base used to derive a new class. Used by `modelMakeC9r`.
   * @see The `new` method.
   * @param {Object} model
   * @param {String} key
   */
  modelC9rBase (model, key) { // eslint-disable-line
    return this.C9rBase
  },
  /**
   * Create a new constructor based on the model.
   * No need to subclass.
   * Instead, override `modelC9rBase` and `modelHandle`.
   * @param {Object} model
   * @param {*} ...$ - other arguments
   */
  modelMakeC9r (model, id) {
    //<<< mochai: modelMakeC9r
    let C9r = this.newC9r(Symbol(''), this.modelC9rBase(model, id), model)
    C9r[eYo.$].finalizeC9r()
    model = C9r[eYo.$].model
    model[eYo.$C9r] = C9r
    //... var model = {}
    //... var C9r = eYo.c9r.modelMakeC9r(model)
    //... chai.expect(model[eYo.$C9r]).equal(C9r)
    //... chai.expect(C9r[eYo.$].model).equal(model)
    //... model[eYo.$SuperC9r] = eYo.c9r.newNS().makeC9rBase()
    //... var C9r = eYo.c9r.modelMakeC9r(model)
    //... chai.expect(eYo.isSubclass(C9r, model[eYo.$SuperC9r]))
    model[eYo.$$.starters] = []
    let eyo$ = C9r[eYo.$]
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
    model.register && this.register(model.register, C9r)
    return C9r
    //>>>
  },
  /**
   * Create a new Base instance based on the model
   * @param {Object} [model] - Optional model, 
   * @param {...} [...] - Other arguments are passed to the constructor.
   */
  prepare (model, ...$) {
    //<<< mochai: prepare
    //... let NS = eYo.c9r.newNS()
    //... var model = {
    //...   prepare (...$) {
    //...     eYo.flag.push('p', ...$)
    //...   }
    //... }
    //... NS.makeC9rBase(model)
    //... var SuperC9r = eYo.c9r.newC9r(eYo.genUID(eYo.IDENT), model)
    //... SuperC9r[eYo.$].finalizeC9r()
    if (!eYo.isD(model)) {
      var C9r = this.C9rBase
      return new C9r(...arguments)
      //... var o = NS.prepare(1, 2)
      //... chai.expect(o).instanceOf(NS.C9rBase)
      //... eYo.flag.expect('p12')
    }
    C9r = model[eYo.$C9r]
    if (!C9r) {
      C9r = this.modelMakeC9r(model, ...$)
      //... var o = NS.prepare({}, 1, 2)
      //... chai.expect(o).instanceOf(eYo.c9r.C9rBase)
      //... eYo.flag.expect('p12')
    }
    //... var o = eYo.c9r.prepare({
    //...   [eYo.$C9r]: NS.C9rBase
    //... }, 1, 2)
    //... chai.expect(o).instanceOf(NS.C9rBase)
    //... eYo.flag.expect('p12')
    var ans = new C9r(...$)
    ans.preInit = function () {
      delete this.preInit
      model[eYo.$$.starters].forEach(f => f(this))
    }
    return ans
    //... var o = eYo.c9r.prepare({
    //...   dispose (...$) {
    //...     eYo.flag.push('x', ...$)
    //...   }
    //... })
    //... o.dispose(1, 2)
    //... eYo.flag.expect('x12')
    //... var o = eYo.c9r.prepare({
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
    ans.init()
    return ans
    //... let foo = eYo.c9r.new('foo')
    //... chai.expect(foo).instanceOf(eYo.C9r)
    //>>>
  },
  /**
   * Create a new instance based on the model.
   * @param {Object} model
   */
  singleton (model) {
    //<<< mochai: singleton
    let C9r = this.newC9r('', model)
    C9r[eYo.$].finalizeC9r()
    return new C9r()
    //... var foo = eYo.c9r.singleton()
    //... chai.expect(foo).instanceof(eYo.C9r)
    //... var foo = eYo.c9r.singleton({
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
    //... let NS = eYo.c9r.newNS()
    if (!eYo.isNS(NS)) {
      eYo.isNA(model) || eYo.throw(`${this.name}/newSingleton: Unexpected model (${model})`)
      //... chai.expect(() => {
      //...   eYo.c9r.newSingleton('foo', {}, 1)
      //... }).throw()
      ;[NS, id, model] = [this, NS, id]
      //... var ident = eYo.genUID(eYo.IDENT)
      //... var ans = NS.newSingleton(ident, {})
      //... chai.expect(ans).instanceof(eYo.C9r)
      //... chai.expect(ans).equal(NS[ident])
    }
    eYo.isId(id) || eYo.throw(`${this.name}/newSingleton: Unexpected parameter ${eYo.isSym(id) ? id.toString(): id}`)
    //... chai.expect(() => {
    //...   eYo.c9r.newSingleton(1, {})
    //... }).throw()
    let C9r = this.newC9r(Symbol(eYo.do.toTitleCase(id)), model)
    C9r[eYo.$].finalizeC9r()
    let ans = new C9r()
    Object.defineProperty(NS, id, eYo.descriptorR({$ () {
      return ans
    }}.$))
    return ans
    //... var ans = eYo.c9r.newSingleton(NS, 'id', {})
    //... chai.expect(ans).instanceof(eYo.C9r)
    //... chai.expect(ans).equal(NS.id)
    //... var foo = eYo.c9r.newSingleton(NS, 'id1', {
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
    //... var SuperC9r = eYo.c9r.newC9r('')
    //... SuperC9r[eYo.$].finalizeC9r()
    //... ans = NS.newSingleton('id2', {
    //...   [eYo.$SuperC9r]: SuperC9r
    //... })
    //... chai.expect(ans).instanceof(SuperC9r)
    //... ans = NS.newSingleton('id3', {
    //...   [eYo.$SuperC9r]: eYo.NA
    //... })
    //... chai.expect(ans.eyo$.SuperC9r).undefined
    //>>>
  },
})

// ANCHOR: Model

// Prepares the constructors.

Object.assign(eYo.C9r_p, {
  /**
   * Initialize the receiver, it should not be overriden but it is still exposed for debugging purposes mainly.
   * Called by `newFoo` creator.
   * @param  {...any} $ 
   */
  init (...$) {
    //<<< mochai: eYo.C9r_p.init
    try {
      this.init = eYo.doNothing
      this.eyo$.c9rInit(this, ...$)
    } finally {
      delete this.init
    }
    //... chai.expect(eYo.C9r_p.init).eyo_F
    //>>>
  },
  /**
   * Initialize the receiver, it should not be overriden but it is still exposed for debugging purposes mainly.
   * Must be called.
   * @param  {...any} $ 
   */
  dispose (...$) {
    //<<< mochai: eYo.C9r_p.dispose
    try {
      this.dispose = eYo.doNothing
      this.eyo$.c9rDispose(this, ...$)
    } finally {
      delete this.dispose
    }
    //... chai.expect(eYo.C9r_p.dispose).eyo_F
    //>>>
  },
})

eYo.C9r$.finalizeC9r(
  //<<< mochai: eYo.C9r$.finalizeC9r
  //... chai.expect(eYo.C9r[eYo.$].hasFinalizedC9r).true
  eYo.model.manyDescriptorF('dlgt', 'init'),
  //... ;['init', eYo.$,].forEach(K => {
  //...   eYo.c9r.new({
  //...     [K]: eYo.doNothing
  //...   })
  //...   eYo.c9r.new({
  //...     [K]: eYo.NA
  //...   })
  //...   chai.expect(() => {
  //...     eYo.c9r.new({
  //...       [K]: 421
  //...     })
  //...   }).throw()
  //... })
  eYo.model.manyDescriptorForFalse('dispose'),
  {
    methods: {
      [eYo.model.VALIDATE]: eYo.model.validateD,
      //... eYo.c9r.new({
      //...   methods: eYo.NA
      //... })
      //... chai.expect(() => {
      //...   eYo.c9r.new({
      //...     methods: 421,
      //...   })
      //... }).throw()
      [eYo.model.ANY]: eYo.model.descriptorF(),
      //... eYo.c9r.new({
      //...   methods: {
      //...     foo: eYo.NA,
      //...     chi () {},
      //...   }
      //... })
      //... chai.expect(() => {
      //...   eYo.c9r.new({
      //...     methods: {
      //...       mi: 421,
      //...     },
      //...   })
      //... }).throw()
    },
    CONSTs: {
      [eYo.model.VALIDATE]: eYo.model.validateD,
      //... eYo.c9r.new({
      //...   CONSTs: eYo.NA
      //... })
      //... chai.expect(() => {
      //...   eYo.c9r.new({
      //...     CONSTs: 421,
      //...   })
      //... }).throw()
      [eYo.model.ANY]: {
        [eYo.model.VALIDATE]: function (before, key) {
          if (key) {
            if (!XRegExp.exec(key, eYo.xre.CONST)) {
              return eYo.INVALID
            }
          }
          //... eYo.c9r.new({
          //...   CONSTs: {
          //...     CONST_421: 421,
          //...   }
          //... })
          //... chai.expect(() => {
          //...   eYo.c9r.new({
          //...     CONSTs: {
          //...       cCONST_421: 421,
          //...     },
          //...   })
          //... }).throw()
        }
      },
    },
  }
  //>>>
)

//>>>