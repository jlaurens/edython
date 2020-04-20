describe ('POC', function () {
  this.timeout(10000)
  flag = {
    v: 0,
    reset (what) {
      this.v = what || 0
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v = parseInt(this.v.toString() + what.toString()))
      })
      return this.v
    },
    expect (what) {
      let ans = eYo.isRA(what) ? chai.expect(what).include(this.v) : chai.expect(what).equal(this.v)
      this.reset()
      return ans
    },
  }
  it ('Change constructor', function () {
    let OYE = function () {}
    OYE.prototype.version = 421
    let oYe = new OYE()
    chai.expect(oYe.version).equal(421)
    let C9r = function () {}
    let c9r = new C9r()
    chai.expect(c9r.version).equal(oYe.NA)
    Object.setPrototypeOf(c9r, OYE.prototype)
    chai.expect(c9r.version).equal(421)
    Object.setPrototypeOf(c9r, C9r.prototype)
    chai.expect(c9r.version).equal(oYe.NA)
    let setConstructorOf = (object, C9r) => {
      object.constructor = C9r
      Object.setPrototypeOf(object, C9r.prototype)
    }
    setConstructorOf(oYe, C9r)
    chai.expect(oYe.version).equal(oYe.NA)
    setConstructorOf(oYe, OYE)
    chai.expect(oYe.version).equal(421)
    C9r.prototype.test = 123
    chai.expect(c9r.test).equal(123)    
    chai.expect(c9r.version).equal(oYe.NA)
    eYo.inherits(C9r, OYE)
    chai.expect(c9r.test).equal(123)
    chai.expect(c9r.version).equal(421)
    setConstructorOf(oYe, C9r)
    setConstructorOf(c9r, OYE)
    chai.expect(c9r.test).equal(eYo.NA)
    chai.expect(c9r.version).equal(421)
    chai.expect(oYe.test).equal(123)
    chai.expect(oYe.version).equal(421)
  })
  it ('init', function () {
    var model = {
      foo (builtin) {
        builtin()
      },
      bar (builtinX) {
        builtiniX()
      }
    }
    var str = model.foo.toString()
    chai.assert(XRegExp.match(str, /^[^(]*\([^,]*builtin\b/))
    var str = model.bar.toString()
    chai.assert(!XRegExp.match(str, /^[^(]*\([^,]*builtin\b/))
  })
  it ('delete', function () {
    var ns = eYo.c9r.makeNS()
    chai.assert(!ns.foo)
    ns.foo = 123
    chai.assert(ns.foo)
    delete ns.foo
    chai.assert(!ns.foo)
  })
  it ('Object.defineProperty(…, …, {value: []})', function () {
    let F = function () {}
    Object.defineProperty(F.prototype, 'foo', {value: []})
    let a = new F()
    let b = new F()
    a.foo.push(421)
    chai.expect(b.foo.pop()).equal(421)
  })
  it ('Function signature [B][F][O]', function() {
    let model_d = {}
    let Super_d = function () {}
    let unfinalize_d = 123
    // Possible arguments BFO, BF, BO, B, FO, F, O, ...
    // Possible arguments FOB, OB, FB, FO, F, O, B, ...
    let f = (unfinalize, Super, model) => {
      if (!eYo.isBool(unfinalize)) {
        eYo.isDef(model) && eYo.throw(`Unexpected last argument: ${model}`)
        ;[unfinalize, Super, model] = [unfinalize_d, unfinalize, Super]
      }
      if (!eYo.isF(Super)) {
        eYo.isDef(model) && eYo.throw(`Unexpected argument: ${model}`)
        ;[Super, model] = [
          Super_d,
          Super,
        ]
      }
      if (eYo.isNA(model)) {
        model = model_d
      }
      return [unfinalize, Super, model]
    }
    let Super = function () {}
    let model = {}
    let unfinalize = true
    let test = (before, after) => {
      chai.expect(f(...before)).eql(after)
    }
    test([unfinalize, Super, model], [unfinalize, Super, model])
    test([Super, model], [unfinalize_d, Super, model])
    test([unfinalize, Super], [unfinalize, Super, model_d])
    test([unfinalize, model], [unfinalize, Super_d, model])
    test([Super], [unfinalize_d, Super, model_d])
    test([unfinalize], [unfinalize, Super_d, model_d])
    test([model], [unfinalize_d, Super_d, model])
    test([], [unfinalize_d, Super_d, model_d])
  })
})
describe ('Tests: C9r', function () {
  this.timeout(10000)
  flag = {
    v: 0,
    reset (what) {
      this.v = what || 0
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v = parseInt(this.v.toString() + what.toString()))
      })
      return this.v
    },
    expect (what) {
      let ans = eYo.isRA(what) ? chai.expect(what).include(this.v) : chai.expect(what).equal(this.v)
      this.reset()
      return ans
    },
  }
  it ('C9r: Basic', function () {
    chai.assert(eYo.makeNS)
    chai.assert(eYo.c9r)
    chai.assert(eYo.c9r.BaseC9r)
    chai.assert(eYo.c9r.BaseC9r_p)
    var set = new Set([
      eYo.c9r.BaseC9r.eyo,
      eYo.c9r.BaseC9r.eyo.eyo,
      eYo.c9r.BaseC9r.eyo.eyo.eyo,
      eYo.c9r.BaseC9r.eyo.eyo.eyo.eyo,
    ])
    chai.expect(set.size).equal(3)
    chai.assert(eYo.c9r.makeC9r)
    var C9r = eYo.c9r.makeC9r()
    chai.assert(C9r)
    set = new Set([
      C9r.eyo,
      C9r.eyo.eyo,
      C9r.eyo.eyo.eyo,
      C9r.eyo.eyo.eyo.eyo,
    ])
    chai.expect(set.size).equal(3)
    chai.expect(C9r.eyo).not.equal(eYo.c9r.BaseC9r.eyo)
    chai.assert(eYo.isSubclass(C9r.eyo.constructor, eYo.dlgt.BaseC9r))
    chai.expect(C9r.eyo.id).equal('')
  })
  it ('C9r: appendToMethod', function () {
    flag.reset()
    var o = {}
    eYo.c9r.appendToMethod(o, 'foo1', function (x) {
      flag.push(x)
    })
    o.foo1(1)
    flag.expect(1)
    o = {
      foo1: eYo.doNothing,
    }
    eYo.c9r.appendToMethod(o, 'foo1', function (x) {
      flag.push(x)
    })
    o.foo1(1)
    flag.expect(1)
    o = {
      foo1: 421,
    }
    chai.expect(() => {
      eYo.c9r.appendToMethod(o, 'foo1', function (x) {})
    }).throw()
    o = {
      foo1 (x) {
        flag.push(x)
      },
    }
    eYo.c9r.appendToMethod(o, 'foo1', function (x) {
      flag.push(x+1)
    })
    o.foo1(1)
    flag.expect(12)
  })
  it ('C9r: finalizeC9r', function () {
    let ns = eYo.c9r.makeNS()
    let C9r = ns.makeC9r()
    C9r.eyo.finalizeC9r()
    new C9r()
  })
  it ('C9r: ns inherit', function () {
    let ns = eYo.c9r.makeNS()
    chai.expect(ns.BaseC9r).equal(eYo.c9r.BaseC9r)
    chai.expect(ns.BaseC9r_p).equal(eYo.c9r.BaseC9r_p)
    ns.makeBaseC9r()
    chai.expect(ns.BaseC9r).not.equal(eYo.c9r.BaseC9r)
    chai.expect(ns.BaseC9r_p).not.equal(eYo.c9r.BaseC9r_p)
    chai.expect(ns.makeC9r().SuperC9r).undefined
    let C9r = ns.makeC9r('Foo')
    chai.expect(ns.makeC9r().SuperC9r).undefined
  })
  it ('C9r modelMerge (adding methods)', function () {
    var ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    var d = ns.new()
    chai.assert(!d.foo)
    flag.reset()
    ns.BaseC9r.eyo.modelMerge({
      methods: {
        foo (x) {
          flag.push(x)
        },
      },
    })
    chai.assert(d.foo)
    d.foo(1)
    flag.expect(1)
    d = ns.new()
    d.foo(2)
    flag.expect(2)
  })
  it ('C9r modelMerge - overriden', function () {
    flag.reset()
    var ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    var d = ns.new()
    chai.assert(!d.foo)
    ns.BaseC9r.eyo.methodsMerge({
      foo () {
        flag.push(1)
      },
    })
    ns.BaseC9r.eyo.methodsMerge({
      foo (overriden) {
        return function () {
          overriden()
          flag.push(2)
        }
      },
    })
    new ns.BaseC9r().foo()
    flag.expect(12)
  })
  it('C9r: makeBaseC9r({methods:...})', function () {
    var ns = eYo.c9r.makeNS()
    ns.makeBaseC9r({
      methods: {
        foo (x) {
          flag.push(x)
        },
      },
    })
    var d = ns.new()
    flag.reset()
    chai.assert(d.foo)
    d.foo(1)
    flag.expect(1)
  })
  it('C9r: eYo.c9r.new({methods:...})', function () {
    var d = eYo.c9r.new({
      methods: {
        foo (x) {
          flag.push(x)
        },
      },
    })
    flag.reset()
    chai.assert(d.foo)
    d.foo(1)
    flag.expect(1)
  })
  describe('C9r: makeNS', function () {
    it ('makeNS(...)', function () {
      var foo = eYo.makeNS('___Foo')
      chai.assert(foo && foo === eYo.___Foo)
      chai.assert(foo.makeNS)
      chai.assert(!foo.makeC9r)
      chai.expect(foo.super).equal(eYo)
      chai.expect(foo.name).equal('eYo.___Foo')
      var ns = eYo.c9r.makeNS()
      chai.assert(ns.makeNS)
      chai.assert(ns.makeC9r)
      chai.expect(ns.super).equal(eYo.c9r)
      eYo.makeNS(ns, 'foo')
      chai.assert(ns.foo)
      chai.assert(ns.foo.makeNS)
      chai.assert(!ns.foo.makeC9r)
      chai.expect(ns.foo.super).equal(eYo)
      chai.assert(ns.foo.name.endsWith('.foo'))
    })
    it ('ns.makeNS(...)', function () {
      var ns = eYo.c9r.makeNS()
      chai.expect(() => { ns.makeNS() }).not.to.throw()
      ns.makeNS('foo')
      chai.assert(ns.foo)
      chai.assert(ns.foo.makeNS)
      chai.assert(ns.foo.makeC9r)
      chai.expect(ns.foo.super).equal(ns)
      chai.assert(ns.foo.name.endsWith('.foo'))
      chai.assert(!ns.bar)
      ns.bar = 123
      chai.assert(ns.bar)
      chai.expect(() => { ns.makeNS('bar') }).to.throw()
      chai.expect(() => { eYo.makeNS(ns, 'bar') }).to.throw()
      delete ns.bar
      chai.expect(() => { eYo.makeNS(ns, 'bar') }).not.to.throw()
      var nsbis = eYo.makeNS()
      nsbis.bar = 123
      chai.expect(() => { nsbis.makeNS('bar') }).to.throw()
      chai.expect(() => { eYo.makeNS(nsbis, 'bar') }).to.throw()
      delete nsbis.bar
      chai.expect(() => { nsbis.makeNS('bar') }).not.to.throw()
    })
  })
  describe ('C9r: makeInheritedC9r', function () {
    it (`eYo...makeInheritedC9r('AB')`, function () {
      var ns = eYo.c9r.makeNS()
      var A = ns.makeC9r('A')
      var AB = A.makeInheritedC9r('AB')
      chai.assert(AB)
      chai.expect(AB.prototype.constructor).equal(AB)
    })
    it (`ns.A.makeInheritedC9r('AB')`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeC9r('A')
      ns.A.makeInheritedC9r('AB')
      chai.assert(eYo.isF(ns.AB))
      chai.assert(ns.AB.eyo.name.endsWith('.AB'))
      chai.expect(ns.AB.eyo.ns).equal(ns)
      chai.expect(ns.AB_p).equal(ns.AB.prototype)
      chai.expect(ns.AB_s).equal(ns.A.prototype)
      chai.assert(eYo.isSubclass(ns.AB, ns.A))
      chai.assert(eYo.isSubclass(ns.AB.eyo.constructor, ns.A.eyo.constructor))
    })
    it ('ns.A.makeInheritedC9r', function () {
      var ns = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', null, {
        init(x) {
          flag.push(x)
        }
      })
      chai.assert(ns.A.makeInheritedC9r)
      ns.A.makeInheritedC9r('AB', {
        init(x) {
          flag.push(x+1)
        },
      })
      chai.expect(ns.AB.SuperC9r_p).equal(ns.A.prototype)
      ns.A.eyo.finalizeC9r()
      ns.AB.eyo.finalizeC9r()
      new ns.AB(1)
      flag.expect(12)
    })
  })
  describe ('C9r: makeC9r', function () {
    it (`ns.makeC9r('BaseC9r')`, function () {
      var ns = eYo.c9r.makeNS()
      chai.expect(ns.BaseC9r).equal(eYo.c9r.BaseC9r)
      ns.makeC9r('BaseC9r')
      chai.assert(ns.BaseC9r)
      chai.assert(ns.BaseC9r !== eYo.c9r.BaseC9r)
      chai.assert(eYo.isSubclass(ns.BaseC9r, eYo.c9r.BaseC9r))
      chai.expect(ns.BaseC9r.eyo.ns).equal(ns)
    })
    it (`eYo.c9r.makeC9r(ns, 'BaseC9r')`, function () {
      var ns = eYo.c9r.makeNS()
      chai.expect(ns.BaseC9r).equal(eYo.c9r.BaseC9r)
      chai.assert(!ns.BaseC9r.SuperC9r_p)
      eYo.c9r.makeC9r(ns, 'BaseC9r')
      chai.assert(ns.BaseC9r !== eYo.c9r.BaseC9r)
      chai.expect(ns.BaseC9r.SuperC9r_p).equal(eYo.c9r.BaseC9r_p)
    })
    it (`ns.makeBaseC9r()`, function () {
      chai.assert(eYo.c9r.BaseC9r)
      var ns = eYo.c9r.makeNS()
      chai.expect(ns.BaseC9r).equal(eYo.c9r.BaseC9r)
      ns.makeBaseC9r()
      chai.assert(ns.BaseC9r && ns.BaseC9r !== eYo.c9r.BaseC9r)
      chai.expect(ns.BaseC9r.eyo.ns).equal(ns)
      var ns = eYo.c9r.makeNS()
      Object.defineProperty(ns, 'BaseC9r', {
        value: 421
      })
      chai.expect(() => { ns.makeBaseC9r() }).to.throw()
      chai.expect(eYo.c9r.makeC9r(ns).eyo.id).equal('')
      chai.expect(() => { eYo.c9r.makeC9r(ns, 'BaseC9r') }).to.throw()
      chai.expect(() => { ns.makeC9r('BaseC9r') }).to.throw()
    })
    it(`ns.makeBaseC9r({...})`, function () {
      var ns = eYo.c9r.makeNS()
      chai.expect(ns.BaseC9r).equal(eYo.c9r.BaseC9r)
      let model = {}
      ns.makeBaseC9r(model)
      chai.expect(ns.BaseC9r.eyo.model).equal(model)
    })
    it(`eYo.c9r.makeC9r('A', eYo.c9r.BaseC9r)`, function () {
      let ns = eYo.c9r.makeNS()
      let C9r = ns.makeC9r('A', eYo.c9r.BaseC9r)
      chai.assert(eYo.isSubclass(ns.A, eYo.c9r.BaseC9r))
      chai.expect(C9r).equal(C9r.eyo.C9r)
      chai.expect(C9r.prototype).equal(C9r.eyo.C9r_p)
      chai.expect(eYo.c9r.BaseC9r).equal(C9r.eyo.C9r_S)
      chai.expect(eYo.c9r.BaseC9r_p).equal(C9r.eyo.C9r_s)
    })
    it (`eYo.c9r.makeC9r(ns, 'A', ...)`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      let C9r = eYo.c9r.makeC9r(ns, 'A')
      chai.expect(ns.A_s).equal(eYo.c9r.BaseC9r_p)
      chai.expect(()=>{ eYo.c9r.makeC9r(ns, 'A') }).to.throw() // Already existing attribute
      chai.expect(eYo.isSubclass(C9r, eYo.c9r.BaseC9r)).true
      chai.expect(eYo.isSubclass(C9r, ns.BaseC9r)).false
    })
    it (`eYo.c9r.makeC9r(ns, 'A', Super, model)`, function () {
      flag.reset()
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      var Super = ns.BaseC9r
      eYo.c9r.makeC9r(ns, 'A', Super, {
        init (x) {
          flag.push(x)
        }
      })
      chai.assert(ns.A)
      chai.assert(eYo.isSubclass(ns.A, ns.BaseC9r))
      chai.expect(ns.A_s).equal(ns.BaseC9r_p)
      ns.A.eyo.finalizeC9r()
      new ns.A(1)
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r('_A')`, function () {
      if (!eYo._A) {
        var A = eYo.c9r.makeC9r('_A')
        chai.assert(A)
        chai.assert(!A.constructor.SuperC9r_p)
        chai.assert(eYo.isF(A.makeInheritedC9r))
      }
    })
    it (`NO eYo.c9r.makeC9r('_A')`, function () {
      if (eYo._A) {
        chai.expect(() => {eYo.c9r.makeC9r('_A')}).to.throw()
      }
    })
    it (`ns.makeC9r('A')`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeC9r('A')
      chai.assert(eYo.isF(ns.A))
      chai.assert(ns.A.eyo.name.endsWith('.A'))
      chai.expect(ns.A.eyo.ns).equal(ns)
      chai.expect(ns.A_p).equal(ns.A.prototype)
      chai.expect(ns.A_s).equal(ns.BaseC9r_p)
    })
    it ('makeC9r: constructor call', function () {
      flag.reset()
      var ns = eYo.c9r.makeNS()
      eYo.c9r.makeC9r(ns, 'A', null, {
        init (x) {
          flag.push(x)
        }
      })
      chai.assert(!ns.A_s)
      ns.A.eyo.finalizeC9r()
      var a = new ns.A(1)
      flag.expect(1)
      a = new ns.A(2)
      flag.expect(2)
    })
    it ('makeC9r: super !== null', function () {
      var ns = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', {
        init (x) {
          flag.push(x)
        },
      })
      chai.assert(ns.A.eyo instanceof eYo.c9r.BaseC9r.eyo.constructor)
      ns.A.eyo.finalizeC9r()
      new ns.A(1)
      flag.expect(1)
      ns.makeC9r('AB', ns.A, {
        init (x) {
          flag.push(x+1)
        },
      })
      chai.assert(ns.AB)
      chai.assert(ns.AB.eyo instanceof eYo.c9r.BaseC9r.eyo.constructor)
      ns.AB.eyo.finalizeC9r()
      new ns.AB(2)
      flag.expect(23)
    })  
    it ('makeC9r: multi super !== null', function () {
      var ns = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', {
        init (x) {
          flag.push(x)
        },
      })
      eYo.c9r.makeC9r(ns, 'B', {
        init (x) {
          flag.push(x+1)
        },
      })
      eYo.c9r.makeC9r(ns, 'AA', ns.A, {
        init (x) {
          flag.push(x+2)
        },
      })
      eYo.c9r.makeC9r(ns, 'AB', ns.A, {
        init (x) {
          flag.push(x+3)
        },
      })
      eYo.c9r.makeC9r(ns, 'BA', ns.B, {
        init (x) {
          flag.push(x+4)
        },
      })
      eYo.c9r.makeC9r(ns, 'BB', ns.B, {
        init (x) {
          flag.push(x+5)
        },
      })
      ns.A.eyo.finalizeC9r()
      ns.B.eyo.finalizeC9r()
      ns.AA.eyo.finalizeC9r()
      ns.AB.eyo.finalizeC9r()
      ns.BA.eyo.finalizeC9r()
      ns.BB.eyo.finalizeC9r()
      new ns.AA(1)
      flag.expect(13)
      new ns.AB(2)
      flag.expect(25)
      new ns.BA(2)
      flag.expect(36)
      new ns.BB(3)
      flag.expect(48)
    })
    it ('makeC9r: undefined owner or super', function () {
      var ns = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', null, {
        init (x) {
          flag.push(x)
        }
      })
      eYo.c9r.makeC9r(ns, 'AB', ns.A, {
        init (x) {
          flag.push(x+1)
        },
      })
      chai.expect(ns.AB_s.constructor).equal(ns.A)
      ns.A.eyo.finalizeC9r()
      ns.AB.eyo.finalizeC9r()
      new ns.AB(1)
      flag.expect(12)
    })
    it ('makeC9r: init shortcuts 1', function () {
      var ns = eYo.c9r.makeNS()
      flag.reset()
      var make = (init) => {
        ns = eYo.c9r.makeNS()
        eYo.c9r.makeC9r(ns, 'A', null, {
          init: init
        })
        ns.A.eyo.finalizeC9r()
        return new ns.A()
      }
      make(function () {
        flag.push(2)
      })
      flag.expect(2)
      make(function (builtin) {
        flag.push(1)
        builtin ()
        flag.push(3)
      })
      flag.expect(13)
    })
    it ('makeC9r: init shortcuts 2', function () {
      var ns = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', null, {
        init (x) {
          flag.push(x)
        }
      })
      ns.A.eyo.finalizeC9r()
      new ns.A(2)
      flag.expect(2)
      ns.A.makeInheritedC9r('AB', {
        init (builtin, x) {
          flag.push(x)
          builtin () // no argument at all
          flag.push(x+2)
        }
      })
      ns.AB.eyo.finalizeC9r()
      new ns.AB(1)
      flag.expect(113)
    })
    it ('makeC9r: dispose', function () {
      var ns = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', null, {
        dispose(x) {
          flag.push(x)
        }
      })
      eYo.c9r.makeC9r(ns, 'AB', ns.A, {
        dispose(x) {
          flag.push(x+1)
        }
      })
      ns.A.eyo.finalizeC9r()
      new ns.A().dispose(1)
      flag.expect(1)
      ns.AB.eyo.finalizeC9r()
      new ns.AB().dispose(2)
      flag.expect(32)
    })
    var testX = (X, Super, Dlgt_p) => {
      chai.assert(X)
      chai.assert(eYo.isSubclass(X, Super))
      chai.assert(X.eyo)
      chai.assert(!Super || X.eyo.super === Super.eyo)
      chai.assert(!Super || X.SuperC9r_p === Super.prototype)
      chai.assert(!Super || X.SuperC9r_p.constructor === Super)
      chai.assert(!Dlgt_p || eYo.isSubclass(X.eyo.constructor, Dlgt_p.constructor))
      chai.expect(() => {
        new X()
      }).not.to.throw()
    }
    it (`eYo.c9r.makeC9r('...')`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      eYo.c9r.makeC9r(ns, 'A')
      testX(ns.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r('...', {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', {
        init () {
          flag.push(1)
        }
      })
      ns.A.eyo.finalizeC9r()
      testX(ns.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r(NS, '...')`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      eYo.c9r.makeC9r(ns, 'A')
      ns.A.eyo.finalizeC9r()
      testX(ns.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r(ns, '...', {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', {
        init () {
          flag.push(1)
        }
      })
      ns.A.eyo.finalizeC9r()
      testX(ns.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r('...', Super = eYo.c9r.BaseC9r)`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      eYo.c9r.makeC9r(ns, 'A', ns.BaseC9r)
      ns.A.eyo.finalizeC9r()
      testX(ns.A, ns.BaseC9r, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r('...', Super = eYo.c9r.BaseC9r, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      flag.reset()
      ns.makeC9r('A', {
        init () {
          flag.push(1)
        }
      })
      ns.A.eyo.finalizeC9r()
      testX(ns.A, ns.BaseC9r, ns.Dlgt_p)
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.BaseC9r, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', eYo.c9r.BaseC9r, {
        init () {
          flag.push(1)
        }
      })
      ns.A.eyo.finalizeC9r()
      testX(ns.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r('...', eYo.c9r.BaseC9r, {...}?)`, function () {
      var Super = eYo.c9r.BaseC9r
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      eYo.c9r.makeC9r(ns, 'A', Super)
      ns.A.eyo.finalizeC9r()
      chai.expect(ns.A.eyo.super).equal(Super.eyo)
      testX(ns.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      chai.expect(ns.Dlgt_p).equal(ns.Dlgt_p)
      testX(ns.BaseC9r, eYo.c9r.BaseC9r, ns.Dlgt_p)
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', ns.BaseC9r, {
        init () {
          flag.push(1)
        }
      })
      ns.A.eyo.finalizeC9r()
      testX(ns.A, ns.BaseC9r, eYo.c9r.Dlgt_p)
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r('...', Super = eYo.c9r.BaseC9r, {...})`, function () {
      flag.reset()
      var A = eYo.c9r.makeC9r('___A', eYo.c9r.BaseC9r, {
        init () {
          flag.push(1)
        }
      })
      chai.assert(A)
      chai.assert(A.eyo)
      chai.expect(A.eyo.super).equal(eYo.c9r.BaseC9r.eyo)
      chai.expect(A.SuperC9r_p).equal(eYo.c9r.BaseC9r_p)
      chai.expect(A.SuperC9r_p.constructor).equal(eYo.c9r.BaseC9r)
      A.eyo.finalizeC9r()
      new A()
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.BaseC9r)`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      eYo.c9r.makeC9r(ns, 'A', eYo.c9r.BaseC9r)
      ns.A.eyo.finalizeC9r()
      testX(ns.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.BaseC9r, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', eYo.c9r.BaseC9r, {
        init () {
          flag.push(1)
        }
      })
      ns.A.eyo.finalizeC9r()
      testX(ns.A, eYo.c9r.BaseC9r)
      flag.expect(1)
    })
    it (`?eYo.c9r.makeC9r(NS, '...', Super, Dlgt, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBaseC9r()
      flag.reset()
      eYo.c9r.makeC9r(ns, 'A', {
        init () {
          flag.push(1)
        }
      })
      eYo.c9r.makeC9r(ns, 'AB', ns.A, {
        init () {
          flag.push(2)
        }
      })
      chai.expect(ns.AB.eyo.super).equal(ns.A.eyo)
      chai.expect(ns.A.eyo.super).equal(eYo.c9r.BaseC9r.eyo)
      ns.A.eyo.finalizeC9r()
      ns.AB.eyo.finalizeC9r()
      new ns.AB()
      flag.expect(12)
    })
  })
  it ('C9r: eyo setter', function () {
    var ns = eYo.c9r.makeNS()
    eYo.c9r.makeC9r(ns, 'A', null, {})
    chai.assert(eYo.isSubclass(ns.A.eyo.constructor, eYo.dlgt.BaseC9r))
    chai.expect(() => {
      ns.A.eyo = null
    }).to.throw()
    chai.expect(() => {
      ns.A.eyo_ = null
    }).to.throw()
  })
  it ('C9r: dlgt key', function () {
    var ns = eYo.c9r.makeNS()
    flag.reset()
    eYo.c9r.makeC9r(ns, 'A', {
      dlgt () {
        flag.push(1)
      },
      init() {
        flag.push(2)
      }
    })
    flag.expect(1)
    chai.assert(ns.A.makeInheritedC9r)
    ns.A.makeInheritedC9r('AB', {})
    flag.expect(1)
  })
  it ('C9r: inheritedMethod', function () {
    var ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    ns.makeC9r('A')
    ns.A.makeInheritedC9r('AA')
    ns.AA.makeInheritedC9r('AAA')
    let A_foo = ns.A_p.foo = function () {}
    let AA_foo = ns.AA_p.foo = function () {}
    let AAA_foo = ns.AAA_p.foo = function () {}
    
    let a = new ns.A()
    let aa = new ns.AA()
    let aaa = new ns.AAA()

    chai.expect(a.inheritedMethod('foo')).equal(eYo.doNothing)
    chai.expect(aa.inheritedMethod('foo')).equal(A_foo)
    chai.expect(aaa.inheritedMethod('foo')).equal(AA_foo)

    chai.expect(a.inheritedMethod('foo', true)).equal(eYo.doNothing)
    chai.expect(aa.inheritedMethod('foo', true)).equal(A_foo)
    chai.expect(aaa.inheritedMethod('foo', true)).equal(AA_foo)

    a.foo = function () {}
    chai.expect(a.inheritedMethod('foo')).equal(A_foo)
    chai.expect(a.inheritedMethod('foo', true)).equal(eYo.doNothing)

    aa.foo = function () {}
    chai.expect(aa.inheritedMethod('foo')).equal(AA_foo)
    chai.expect(aa.inheritedMethod('foo', true)).equal(A_foo)

    aaa.foo = function () {}
    chai.expect(aaa.inheritedMethod('foo')).equal(AAA_foo)
    chai.expect(aaa.inheritedMethod('foo', true)).equal(AA_foo)
  })
  it ('C9r: inheritedMethod (broken chain)', function () {
    var ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    ns.makeC9r('A')
    ns.A.makeInheritedC9r('AA')
    ns.AA.makeInheritedC9r('AAA')
    let A_foo = ns.A_p.foo = 1
    let AA_foo = ns.AA_p.foo = function () {}
    let AAA_foo = ns.AAA_p.foo = function () {}
    
    let a = new ns.A()
    let aa = new ns.AA()
    let aaa = new ns.AAA()

    chai.expect(a.inheritedMethod('foo')).equal(eYo.doNothing)
    chai.expect(aa.inheritedMethod('foo')).equal(eYo.doNothing)
    chai.expect(aaa.inheritedMethod('foo')).equal(AA_foo)

    chai.expect(a.inheritedMethod('foo', true)).equal(eYo.doNothing)
    chai.expect(aa.inheritedMethod('foo', true)).equal(eYo.doNothing)
    chai.expect(aaa.inheritedMethod('foo', true)).equal(AA_foo)

    a.foo = function () {}
    chai.expect(a.inheritedMethod('foo')).equal(eYo.doNothing)
    chai.expect(a.inheritedMethod('foo', true)).equal(eYo.doNothing)

    aa.foo = function () {}
    chai.expect(aa.inheritedMethod('foo')).equal(AA_foo)
    chai.expect(aa.inheritedMethod('foo', true)).equal(eYo.doNothing)

    aaa.foo = function () {}
    chai.expect(aaa.inheritedMethod('foo')).equal(AAA_foo)
    chai.expect(aaa.inheritedMethod('foo', true)).equal(AA_foo)
  })
  it ('makeBaseC9r({...})', function () {
    var ns = eYo.c9r.makeNS()
    ns.makeBaseC9r()
    chai.expect(ns.BaseC9r.eyo.model).eql({})
    let model = {
      foo: 421,
    }
    ns = eYo.c9r.makeNS()
    ns.makeBaseC9r(model)
    chai.expect(ns.BaseC9r.eyo.model).equal(model)
    flag.reset()
    model.init = function () {
      flag.push(1)
      chai.expect(this.model).equal(model)
    }
    ns = eYo.c9r.makeNS()
    ns.makeBaseC9r(model)
    new ns.BaseC9r()
    flag.expect(1)
  })
})
