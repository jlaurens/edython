describe ('POC', function () {
  this.timeout(10000)
  flag = {
    v: 0,
    reset () {
      this.v = 0
    },
    push (what) {
      this.v *= 10
      this.v += what
    },
    expect (what) {
      chai.expect(this.v).equal(what)
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
    var flag = 123
    var model = {
      foo (builtin) {
        builtin()
      },
      bar (builtinX) {
        builtiniX || (flag = 321)
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
})
describe ('Tests: C9r', function () {
  this.timeout(10000)
  flag = {
    v: 0,
    reset () {
      this.v = 0
    },
    push (what) {
      this.v *= 10
      this.v += what
    },
    expect (what) {
      chai.expect(this.v).equal(what)
      this.reset()
    },
  }
  it ('C9r: Basic', function () {
    chai.assert(eYo.makeNS)
    chai.assert(eYo.c9r)
    chai.assert(eYo.c9r.makeC9r)
    var C9r = eYo.c9r.makeC9r()
    chai.assert(C9r)
    chai.assert(C9r.eyo)
    chai.expect(C9r.eyo).not.equal(eYo.c9r.Base.eyo)
    chai.assert(eYo.isSubclass(C9r.eyo.constructor, eYo.c9r.Dlgt))
    chai.expect(C9r.eyo.key).equal('')
    chai.assert(eYo.c9r.Dlgt)
    chai.assert(eYo.c9r.Base)
    chai.assert(eYo.c9r.Dlgt_p)
    chai.assert(eYo.c9r.Base_p)
    chai.assert(eYo.c9r.Dlgt.eyo)
    chai.assert(eYo.c9r.Dlgt.eyo.eyo)
    chai.expect(eYo.c9r.Dlgt.eyo.eyo.eyo).equal(eYo.c9r.Dlgt.eyo.eyo)
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
      foo (x) {
        flag.push(x)
      },
    }
    eYo.c9r.appendToMethod(o, 'foo1', function (x) {
      flag.push(x+1)
    })
    o.foo1(1)
    flag.expect(12)
  })
  it ('C9r: ns inherit', function () {
    let ns = eYo.c9r.makeNS()
    chai.expect(ns.Base).equal(eYo.c9r.Base)
    chai.expect(ns.Dlgt).equal(eYo.c9r.Dlgt)
    chai.expect(ns.Base_p).equal(eYo.c9r.Base_p)
  })
  it ('C9r modelMerge', function () {
    var ns = eYo.c9r.makeNS()
    ns.makeBase()
    var d = new ns.Base()
    chai.assert(!d.foo)
    var flag = 0
    ns.Base.eyo.modelMerge({
      methods: {
        foo () {
          flag = 421 - flag
        },
      },
    })
    chai.assert(d.foo)
    d.foo()
    chai.expect(flag).equal(421)
    d = new ns.Base()
    d.foo()
    chai.expect(flag).equal(0)
  })
  it ('C9r modelMerge - overriden', function () {
    var ns = eYo.c9r.makeNS()
    ns.makeBase()
    var d = new ns.Base()
    chai.assert(!d.foo)
    var flag = 0
    ns.Base.eyo.methodsMerge({
      foo () {
        flag = 421 - flag
      },
    })
    var galf = 0
    ns.Base.eyo.methodsMerge({
      foo (overriden) {
        return function () {
          overriden()
          galf = 421 - galf
        }
      },
    })
    new ns.Base().foo()
    chai.expect(flag).equal(421)
    chai.expect(galf).equal(421)
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
      var flag = 0
      eYo.c9r.makeC9r(ns, 'A', null, {
        init() {
          flag += 1
        }
      })
      chai.assert(ns.A.makeInheritedC9r)
      ns.A.makeInheritedC9r('AB', {
        init() {
          flag += 10
        },
      })
      chai.expect(ns.AB.SuperC9r_p).equal(ns.A.prototype)
      flag = 0
      new ns.AB()
      chai.expect(flag).equal(11)
    })
  })
  describe ('C9r: makeC9r', function () {
    it (`ns.makeC9r('Base')`, function () {
      var ns = eYo.c9r.makeNS()
      chai.expect(ns.Base).equal(eYo.c9r.Base)
      ns.makeC9r('Base')
      chai.assert(ns.Base)
      chai.assert(ns.Base !== eYo.c9r.Base)
      chai.assert(eYo.isSubclass(ns.Base, eYo.c9r.Base))
      chai.expect(ns.Base.eyo.ns).equal(ns)
    })
    it (`eYo.c9r.makeC9r(ns, 'Base')`, function () {
      var ns = eYo.c9r.makeNS()
      chai.expect(ns.Base).equal(eYo.c9r.Base)
      chai.assert(!ns.Base.SuperC9r_p)
      eYo.c9r.makeC9r(ns, 'Base')
      chai.assert(ns.Base !== eYo.c9r.Base)
      chai.expect(ns.Base.SuperC9r_p).equal(eYo.c9r.Base_p)
    })
    it (`ns.makeBase()`, function () {
      chai.assert(eYo.c9r.Base)
      var ns = eYo.c9r.makeNS()
      chai.expect(ns.Base).equal(eYo.c9r.Base)
      ns.makeBase()
      chai.assert(ns.Base && ns.Base !== eYo.c9r.Base)
      chai.expect(ns.Base.eyo.ns).equal(ns)
      var ns = eYo.c9r.makeNS()
      Object.defineProperty(ns, 'Base', {
        value: 421
      })
      chai.expect(() => { ns.makeBase() }).to.throw()
      chai.expect(eYo.c9r.makeC9r(ns).eyo.key).equal('')
      chai.expect(() => { eYo.c9r.makeC9r(ns, 'Base') }).to.throw()
      chai.expect(() => { ns.makeC9r('Base') }).to.throw()
    })
    it(`ns.makeBase({...})`, function () {
      var ns = eYo.c9r.makeNS()
      chai.expect(ns.Base).equal(eYo.c9r.Base)
      let model = {}
      ns.makeBase(model)
      chai.expect(ns.Base.eyo.model).equal(model)
      let f = ns.new()
      chai.expect(f.eyo.model).equal(model)
    })
    it(`eYo.c9r.makeC9r('A', eYo.c9r.Base)`, function () {
      let ns = eYo.c9r.makeNS()
      let C9r = ns.makeC9r('A', eYo.c9r.Base)
      chai.assert(eYo.isSubclass(ns.A, eYo.c9r.Base))
      chai.expect(C9r).equal(C9r.eyo.C9r)
      chai.expect(C9r.prototype).equal(C9r.eyo.C9r_p)
      chai.expect(eYo.c9r.Base).equal(C9r.eyo.C9r_S)
      chai.expect(eYo.c9r.Base_p).equal(C9r.eyo.C9r_s)
    })
    it (`eYo.c9r.makeC9r(ns, 'A')`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      eYo.c9r.makeC9r(ns, 'A')
      chai.expect(ns.A_s).equal(eYo.c9r.Base_p)
      chai.expect(()=>{ eYo.c9r.makeC9r(ns, 'A') }).to.throw() // missing model
    })
    it (`eYo.c9r.makeC9r(ns, 'A', Super, model)`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      var Super = ns.Base
      eYo.c9r.makeC9r(ns, 'A', Super, {
        init (x) {
          flag += x
        }
      })
      chai.assert(ns.A)
      chai.assert(eYo.isSubclass(ns.A, ns.Base))
      chai.expect(ns.A_s).equal(ns.Base_p)
      var flag = 0
      new ns.A(123)
      chai.expect(flag).equal(123)
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
      chai.expect(ns.A_s).equal(ns.Base_p)
    })
    it ('makeC9r: constructor call', function () {
      var ns = eYo.c9r.makeNS()
      var flag = 0
      eYo.c9r.makeC9r(ns, 'A', null, {
        init (x) {
          flag += x
        }
      })
      chai.assert(!ns.A_s)
      var a = new ns.A(1)
      chai.expect(flag).equal(1)
      a = new ns.A(2)
      chai.expect(flag).equal(3)
    })
    it ('makeC9r: super !== null', function () {
      var ns = eYo.c9r.makeNS()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', {
        init (x) {
          flag_A += x
        },
      })
      chai.assert(ns.A.eyo instanceof eYo.c9r.Base.eyo.constructor)
      new ns.A(1)
      chai.expect(flag_A).equal(1)
      var flag_AB = flag_A = 0
      ns.makeC9r('AB', ns.A, {
        init (x) {
          flag_AB += x
        },
      })
      chai.assert(ns.AB)
      chai.assert(ns.AB.eyo instanceof eYo.c9r.Base.eyo.constructor)
      new ns.AB(1)
      chai.expect(flag_A).equal(1)
      chai.expect(flag_AB).equal(1)
    })  
    it ('makeC9r: multi super !== null', function () {
      var ns = eYo.c9r.makeNS()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', {
        init (x) {
          flag_A += x
        },
      })
      var flag_B = 0
      eYo.c9r.makeC9r(ns, 'B', {
        init (x) {
          flag_B += 10 * x
        },
      })
      var flag_AA = 0
      eYo.c9r.makeC9r(ns, 'AA', ns.A, {
        init (x) {
          flag_AA += 100 * x
        },
      })
      var flag_AB = 0
      eYo.c9r.makeC9r(ns, 'AB', ns.A, {
        init (x) {
          flag_AB += 1000 * x
        },
      })
      var flag_BA = 0
      eYo.c9r.makeC9r(ns, 'BA', ns.B, {
        init (x) {
          flag_BA += 10000 * x
        },
      })
      var flag_BB = 0
      eYo.c9r.makeC9r(ns, 'BB', ns.B, {
        init (x) {
          flag_BB += 100000 * x
        },
      })
      flag_A = flag_B = flag_AA = flag_AB = flag_BA = flag_BB = 0
      var aa = new ns.AA(3)
      chai.expect(flag_A).equal(3)
      chai.expect(flag_AA).equal(300)
      flag_A = flag_B = flag_AA = flag_AB = flag_BA = flag_BB = 0
      var ab = new ns.AB(4)
      chai.expect(flag_A).equal(4)
      chai.expect(flag_AB).equal(4000)
      flag_A = flag_B = flag_AA = flag_AB = flag_BA = flag_BB = 0
      var ba = new ns.BA(5)
      chai.expect(flag_B).equal(50)
      chai.expect(flag_BA).equal(50000)
      flag_A = flag_B = flag_AB = flag_BA = flag_BB = 0
      var bb = new ns.BB(6)
      chai.expect(flag_B).equal(60)
      chai.expect(flag_BB).equal(600000)
    })
    it ('makeC9r: undefined owner xor super', function () {
      var ns = eYo.c9r.makeNS()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', null, {
        init (x) {
          flag_A += x
        }
      })
      var flag_B = 0
      eYo.c9r.makeC9r(ns, 'B', ns.A, {
        init (x) {
          flag_B += 10 * x
        },
      })
      chai.expect(ns.B_s.constructor).equal(ns.A)
      var ab = new ns.B(1)
      chai.expect(flag_A).equal(1)
      chai.expect(flag_B).equal(10)
    })
    it ('makeC9r: init shortcuts 1', function () {
      var ns = eYo.c9r.makeNS()
      var flag = 0
      var make = (init) => {
        ns = eYo.c9r.makeNS()
        eYo.c9r.makeC9r(ns, 'A', null, {
          init: init
        })
        return new ns.A()
      }
      make(function () {
        flag = 421
      })
      chai.expect(flag).equal(421)
      make(function (builtin) {
        flag = 123
        builtin ()
        flag += 421
      })
      chai.expect(flag).equal(544)
    })
    it ('makeC9r: init shortcuts 2', function () {
      var ns = eYo.c9r.makeNS()
      var flag = 0
      eYo.c9r.makeC9r(ns, 'A', null, {
        init () {
          flag += 123
        }
      })
      new ns.A()
      chai.expect(flag).equal(123)
      ns.A.makeInheritedC9r('AB', {
        init (builtin) {
          flag *= 1000
          builtin ()
          flag += 421
        }
      })
      new ns.AB()
      chai.expect(flag).equal(123544)
    })
    it ('makeC9r: dispose', function () {
      var ns = eYo.c9r.makeNS()
      var flag = 0
      eYo.c9r.makeC9r(ns, 'A', null, {
        dispose(x) {
          flag += x
        }
      })
      eYo.c9r.makeC9r(ns, 'AB', ns.A, {
        dispose(x) {
          flag += x * 10
        }
      })
      flag = 0
      new ns.A().dispose(1)
      chai.expect(flag).equal(1)
      flag = 0
      new ns.AB().dispose(1)
      chai.expect(flag).equal(11)
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
      ns.makeBase()
      eYo.c9r.makeC9r(ns, 'A')
      testX(ns.A, eYo.c9r.Base, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r('...', {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, eYo.c9r.Base, eYo.c9r.Dlgt_p)
      chai.expect(flag_A).equal(1)
    })
    it (`eYo.c9r.makeC9r(NS, '...')`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      eYo.c9r.makeC9r(ns, 'A')
      testX(ns.A, eYo.c9r.Base, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r(ns, '...', {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, eYo.c9r.Base, eYo.c9r.Dlgt_p)
      chai.expect(flag_A).equal(1)
    })
    it (`eYo.c9r.makeC9r('...', Super = eYo.c9r.Base)`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      eYo.c9r.makeC9r(ns, 'A', ns.Base)
      testX(ns.A, ns.Base, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r('...', Super = eYo.c9r.Base, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      var flag_A = 0
      ns.makeC9r('A', {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, ns.Base, ns.Dlgt_p)
      chai.expect(flag_A).equal(1)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.Base, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', eYo.c9r.Base, {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, eYo.c9r.Base, eYo.c9r.Dlgt_p)
      chai.expect(flag_A).equal(1)
    })
    it (`eYo.c9r.makeC9r('...', eYo.c9r.Base, {...}?)`, function () {
      var Super = eYo.c9r.Base
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      eYo.c9r.makeC9r(ns, 'A', Super)
      chai.expect(ns.A.eyo.super).equal(Super.eyo)
      testX(ns.A, eYo.c9r.Base, eYo.c9r.Dlgt_p)
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      chai.expect(ns.Dlgt_p).equal(ns.Dlgt_p)
      testX(ns.Base, eYo.c9r.Base, ns.Dlgt_p)
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', ns.Base, {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, ns.Base, eYo.c9r.Dlgt_p)
      chai.expect(flag_A).equal(1)
    })
    it (`eYo.c9r.makeC9r('...', Super = eYo.c9r.Base, {...})`, function () {
      var flag_A = 0
      var A = eYo.c9r.makeC9r('___A', eYo.c9r.Base, {
        init () {
          flag_A += 1
        }
      })
      chai.assert(A)
      chai.assert(A.eyo)
      chai.expect(A.eyo.super).equal(eYo.c9r.Base.eyo)
      chai.expect(A.SuperC9r_p).equal(eYo.c9r.Base_p)
      chai.expect(A.SuperC9r_p.constructor).equal(eYo.c9r.Base)
      chai.expect(() => {
        new A()
      }).not.to.throw()
      chai.expect(flag_A).equal(1)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.Base)`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      eYo.c9r.makeC9r(ns, 'A', eYo.c9r.Base)
      testX(ns.A, eYo.c9r.Base, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.Base, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', eYo.c9r.Base, {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, eYo.c9r.Base)
      chai.expect(flag_A).equal(1)
    })
    it (`?eYo.c9r.makeC9r(NS, '...', Super, Dlgt, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeBase()
      var flag_A = 0
      var flag_AB = 0
      eYo.c9r.makeC9r(ns, 'A', {
        init () {
          flag_A += 1
        }
      })
      eYo.c9r.makeC9r(ns, 'AB', ns.A, {
        init () {
          flag_AB += 1
        }
      })
      chai.expect(ns.AB.eyo.super).equal(ns.A.eyo)
      chai.expect(ns.A.eyo.super).equal(eYo.c9r.Base.eyo)
      new ns.AB()
      chai.expect(flag_A).equal(1)
      chai.expect(flag_AB).equal(1)
    })
  })
  it ('C9r: eyo setter', function () {
    var ns = eYo.c9r.makeNS()
    eYo.c9r.makeC9r(ns, 'A', null, {})
    chai.assert(eYo.isSubclass(ns.A.eyo.constructor, eYo.c9r.Dlgt))
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
    flag.expect(11)
  })
  it ('C9r: inheritedMethod', function () {
    var ns = eYo.c9r.makeNS()
    ns.makeBase()
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
    ns.makeBase()
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
  it ('makeBase({...})', function () {
    var ns = eYo.c9r.makeNS()
    ns.makeBase()
    chai.expect(ns.Base.eyo.model).eql({})
    let model = {
      foo: 421,
    }
    ns = eYo.c9r.makeNS()
    ns.makeBase(model)
    chai.expect(ns.Base.eyo.model).equal(model)
    flag.reset()
    model.init = function () {
      flag.push(1)
      chai.expect(this.model).equal(model)
    }
    ns = eYo.c9r.makeNS()
    ns.makeBase(model)
    new ns.Base()
    flag.expect(1)
  })
})
