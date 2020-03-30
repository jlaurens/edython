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
  }
  it ('Dlgt infinite loop', function () {
    let AutoDlgt = function (ns, key, C9r, model) {
      Object.defineProperties(this, {
        ns: { value: eYo.isNS(ns) ? ns : eYo.NA },
        key__: {value: key},
        C9r__: { value: C9r },
        model__: { value: model },
      })
      C9r.eyo__ = this
      let d = eYo.descriptorR(function () {
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
    let d = eYo.descriptorR(function () {
      return this.constructor.eyo__
    })
    Object.defineProperties(AutoDlgt.prototype, {
      eyo: d,
      eyo_: d,
      eyo__: d,
    })
    let Dlgt = function (ns, key, C9r, model) {
      AutoDlgt.call(this, ns, key, C9r, model)
    } // DlgtDlgt will never change and does not need to be suclassed
    eYo.inherits(Dlgt, AutoDlgt)
    var dlgt = new AutoDlgt(eYo.c9r, 'Dlgt', Dlgt, {})
    let auto = new AutoDlgt(eYo.c9r, 'Dlgt…', AutoDlgt, {})
    chai.expect(dlgt).equal(Dlgt.eyo)
    chai.expect(dlgt).equal(Dlgt.eyo_)
    chai.expect(dlgt).equal(Dlgt.eyo__)
    chai.expect(auto).equal(AutoDlgt.eyo)
    chai.expect(auto).equal(AutoDlgt.eyo_)
    chai.expect(auto).equal(AutoDlgt.eyo__)
    chai.expect(auto).equal(AutoDlgt.eyo.eyo)
    chai.expect(auto).equal(AutoDlgt.eyo_.eyo_)
    chai.expect(auto).equal(AutoDlgt.eyo__.eyo__)
    chai.expect(auto).equal(AutoDlgt.eyo.eyo.eyo)
    chai.expect(auto).equal(AutoDlgt.eyo_.eyo_.eyo_)
    chai.expect(auto).equal(AutoDlgt.eyo__.eyo__.eyo__)
  })
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
    var flag = 0
    eYo.c9r.makeC9r(ns, 'A', {
      dlgt () {
        flag += 100
      },
      init() {
        flag += 1
      }
    })
    chai.assert(flag === 100, `Unexpected flag: ${flag}`)
    chai.assert(ns.A.makeInheritedC9r)
    ns.A.makeInheritedC9r('AB', {})
    chai.expect(flag).equal(200)
  })
  it ('C9r: subC9rs...', function () {
    var ns = eYo.c9r.makeNS()
    ns.makeBase()
    var flag = 0
    ns.Base.eyo_p.do_it = (x) => {
      flag += 1
    }
    eYo.c9r.Base.eyo.forEachSubC9r(C9r => {
      C9r.eyo.do_it && C9r.eyo.do_it()
    })
    chai.expect(flag).equal(1)
    flag = 0
    ns.makeC9r('A')
    ns.makeC9r('B')
    ns.Base.eyo.forEachSubC9r(C9r => {
      C9r.eyo.do_it && C9r.eyo.do_it()
    })
    chai.expect(flag).equal(2)
    ns.A.makeInheritedC9r('AA')
    ns.A.makeInheritedC9r('AB')
    ns.B.makeInheritedC9r('BA')
    ns.B.makeInheritedC9r('BB')
    flag = 0
    ns.Base.eyo.forEachSubC9r(C9r => {
      C9r.eyo.do_it && C9r.eyo.do_it()
    })
    chai.expect(flag).equal(2)
    flag = 0
    ns.Base.eyo.forEachSubC9r(C9r => {
      C9r.eyo.do_it && C9r.eyo.do_it()
    }, true)
    chai.expect(flag).equal(6)
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
  it ('enhancedO3dValidate: Basic', function () {
    let ns = eYo.c9r.makeNS()
    chai.expect(() => {
      ns.enhancedO3dValidate('foo')
    }).throw
    ns.makeBase()
    ns.enhanceO3dValidate('foo')
    chai.assert(ns.Base_p.validate)
    chai.assert(ns.modelHandleValidate)
  })
  it ('enhancedO3dValidate, default', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBase()
    ns.enhanceO3dValidate('foo')
    var x = new ns.Base()
    chai.expect(x.validate(123, 421)).equal(421)
    x = ns.new()
    let test = (onr, validated, expected) => {
      x.owner = onr
      flag.v = 0
      chai.expect(x.validate(123, 421)).equal(validated)
      chai.expect(flag.v).equal(expected)
    }
    test(eYo.NA, 421, 0)
    test({}, 421, 0)
    test({
      fooValidate (before, after) {
        flag.push(1)
        return before + after * 1000
      },
    }, 421123, 1)
    x.key = 'my'
    test({
      myFooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      },
    }, 421123, 2)
    test({
      fooValidate (before, after) {
        flag.push(1)
        return before + after * 1000
      },
      myFooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      },
    }, 421123123, 12)
    test({
      fooValidate (before, after) {
        flag.push(1)
        return before + after * 1000
      },
      myFooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      },
    }, 421123123, 12)
    test({
      fooValidate (before, after) {
        flag.push(1)
        return eYo.INVALID
      },
      myFooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      },
    }, eYo.INVALID, 1)
    test({
      fooValidate (before, after) {
        flag.push(1)
        return before + after * 1000
      },
      myFooValidate (before, after) {
        flag.push(2)
        return eYo.INVALID
      },
    }, eYo.INVALID, 12)
  })
  it ('enhancedO3dValidate, (after)', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBase()
    var C9r = ns.makeC9r('Foo')
    chai.expect(C9r.eyo.C9r_S).equal(ns.Base)
    ns.enhanceO3dValidate('foo')
    ns.modelHandleValidate(C9r.prototype, '', {
      validate(after) {
        flag.push(1)
        return after + this.flag
      }
    })
    x = new C9r()
    x.flag = 1
    let test = (onr, validated, expected) => {
      x.owner = onr
      flag.v = 0
      chai.expect(x.validate(123, 421)).equal(validated)
      chai.expect(flag.v).equal(expected)
    }
    test(eYo.NA, 422, 1)
    test({}, 422, 1)
    test({
      fooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      }
    }, 422, 1)
    ns.modelHandleValidate(C9r.prototype, '', {
      validate(after) {
        flag.push(1)
        return this.validate(after + this.flag)
      }
    })
    test({
      fooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      }
    }, 422123, 12)

  })
  it ('enhancedO3dValidate, (before, after)', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBase()
    var C9r = ns.makeC9r('Foo')
    chai.expect(C9r.eyo.C9r_S).equal(ns.Base)
    ns.enhanceO3dValidate('foo')
    ns.modelHandleValidate(C9r.prototype, '', {
      validate(before, after) {
        flag.push(1)
        return before + this.flag + 1000 * after
      }
    })
    x = new C9r()
    x.flag = 1
    let test = (onr, validated, expected) => {
      x.owner = onr
      flag.v = 0
      chai.expect(x.validate(123, 421)).equal(validated)
      chai.expect(flag.v).equal(expected)
    }
    test(eYo.NA, 421124, 1)
    test({}, 421124, 1)
    test({
      fooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      }
    }, 421124, 1)
    ns.modelHandleValidate(C9r.prototype, '', {
      validate(before, after) {
        flag.push(1)
        return this.validate(before, before + this.flag + 1000 * after)
      }
    })
    test({
      fooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      }
    }, 421124123, 12)
  })
  it ('enhancedO3dValidate (builtin, before, after)', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBase()
    ns.enhanceO3dValidate('foo')
    var C9r = ns.makeC9r('Bar')
    ns.modelHandleValidate(C9r.prototype, '', {
      validate(builtin, before, after) {
        flag.push(1)
        return builtin(before, after)
      }
    })
    x = new C9r()
    let test = (onr, validated, expected) => {
      x.owner = onr
      flag.v = 0
      chai.expect(x.validate(123, 421)).equal(validated)
      chai.expect(flag.v).equal(expected)
    }
    test(eYo.NA, 421, 1)
    test({}, 421, 1)
    test({}, 421, 1)
    test({
      fooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      },
    }, 421123, 12)
    x.key = 'my'
    test({
      fooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      },
    }, 421123, 12)
    test({
      fooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      },
      myFooValidate (before, after) {
        flag.push(3)
        return before + after * 1000
      }
    }, 421123123, 123)
  })
  it ('enhancedO3dValidate (builtin, after)', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBase()
    ns.enhanceO3dValidate('foo')
    var C9r = ns.makeC9r('Bar')
    ns.modelHandleValidate(C9r.prototype, '', {
      validate(builtin, after) {
        flag.push(1)
        return builtin(after)
      }
    })
    x = new C9r()
    let test = (onr, validated, expected) => {
      x.owner = onr
      flag.v = 0
      chai.expect(x.validate(123, 421)).equal(validated)
      chai.expect(flag.v).equal(expected)
    }
    test(eYo.NA, 421, 1)
    test({}, 421, 1)
    test({}, 421, 1)
    test({
      fooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      },
    }, 421123, 12)
    x.key = 'my'
    test({
      fooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      },
    }, 421123, 12)
    test({
      fooValidate (before, after) {
        flag.push(2)
        return before + after * 1000
      },
      myFooValidate (before, after) {
        flag.push(3)
        return before + after * 1000
      }
    }, 421123123, 123)
  })
  it ('enhancedO3dValidate (owner)', function () {
    let ns = eYo.c9r.makeNS()
    chai.expect(() => {
      ns.enhancedO3dValidate('foo')
    }).throw
    ns.makeBase()
    ns.enhanceO3dValidate('foo', true)
    var C9r = ns.makeC9r('Bar')
    ns.modelHandleValidate(C9r.prototype, '', {
      validate(after) {
        return after + this.flag // this is the owner
      }
    })
    x = new C9r()
    x.owner = {flag: 111}
    chai.expect(x.validate(123, 421)).equal(532)
  })
  describe ('C9r enhanceMany:', function () {
    it ('Basic', function () {
      let foo = eYo.c9r.makeNS()
      foo.makeBase()
      foo.enhancedMany('foo', 'fooChiMi', {})
      let _p = foo.Dlgt_p
      chai.expect(_p.hasOwnProperty('fooModelMap')).true
      chai.expect(_p.hasOwnProperty('fooMerge')).true
      chai.expect(_p.hasOwnProperty('fooPrepare')).true
      chai.expect(_p.hasOwnProperty('fooInit')).true
      chai.expect(_p.hasOwnProperty('fooDispose')).true
      chai.expect(_p.hasOwnProperty('fooModelByKey__')).true
      let f = foo.new()
      chai.expect(!!f).true
    })
    it ('Model: basics', function () {
      let id = eYo.genUID(eYo.IDENT, 10)
      let kFooChiMi = `fooChiMi${id}`
      let foo = eYo.c9r.makeNS()
      foo.allowModelPaths({
        [eYo.model.ROOT]: kFooChiMi,
      })
      foo.makeBase({
        fooChiMi: {
          a: {
            value: 1,
          },
          b: {
            value: 2,
          },
        },
      })
      // create a namespace that hopefully will
      // not conflict with any other namespace
      let fooChiMi = eYo.c9r.makeNS(eYo, kFooChiMi)
      flag.reset()
      fooChiMi.makeBase({
        init (owner, key, model) {
          flag.push(5)
          this.value = model.value
        }
      })
      foo.enhancedMany(kFooChiMi, 'fooChiMi', {})
      foo.Base.eyo[kFooChiMi + 'ModelMap']
      foo.new()
      chai.expect(foo.Base.eyo.model.fooChiMi.a.value).equal(1)
      chai.expect(flag.v).equal(0)
      let _p = foo.Dlgt_p
      _p.prepareInstance = function (object) {
        this[kFooChiMi + 'Prepare'](object)
        this.super.prepareInstance(object)
      }      
      let f = foo.new()
      chai.expect(flag.v).equal(55)
      chai.expect(f.a_f.value).equal(1)
      chai.expect(f.b_f.value).equal(2)
    })
    it ('Model: after', function () {
      let id = eYo.genUID(eYo.IDENT, 10)
      let kFooChiMi = `fooChiMi${id}`
      let foo_ab = eYo.c9r.makeNS()
      let foo_ba = eYo.c9r.makeNS()
      foo_ab.allowModelPaths({
        [eYo.model.ROOT]: kFooChiMi,
      })
      foo_ab.makeBase({
        fooChiMi: {
          a: {
            value: 1,
          },
          b: {
            after: 'a',
            value: 2,
          },
        },
      })
      foo_ba.makeBase({
        fooChiMi: {
          a: {
            after: 'b',
            value: 1,
          },
          b: {
            value: 2,
          },
        },
      })
      // create a namespace that hopefully will
      // not conflict with any other namespace
      let fooChiMi = eYo.c9r.makeNS(eYo, kFooChiMi)
      fooChiMi.makeBase({
        init (owner, key, model) {
          flag.push(model.value)
          this.id = eYo.genUID()
        }
      })
      foo_ab.enhancedMany(kFooChiMi, 'fooChiMi', {})
      foo_ba.enhancedMany(kFooChiMi, 'fooChiMi', {})
      foo_ab.Dlgt_p.prepareInstance = foo_ba.Dlgt_p.prepareInstance = function (object) {
        this[kFooChiMi + 'Prepare'](object)
        this.super.prepareInstance(object)
      }
      let map_ab = foo_ab.Base.eyo[kFooChiMi + 'ModelMap']
      let map_ba = foo_ba.Base.eyo[kFooChiMi + 'ModelMap']
      chai.expect([...map_ab.keys()]).eql(['a', 'b'])
      chai.expect([...map_ba.keys()]).eql(['b', 'a'])
      flag.reset()
      let f_ab = foo_ab.new()
      chai.expect(flag.v).equal(12)
      flag.reset()
      let f_ba = foo_ba.new()
      chai.expect(flag.v).equal(21)
      chai.expect(f_ab[kFooChiMi+'Head']).eql(f_ab.a_f)
      chai.expect(f_ab[kFooChiMi+'Tail']).eql(f_ab.b_f)
      chai.expect(f_ba[kFooChiMi+'Head']).eql(f_ba.b_f)
      chai.expect(f_ba[kFooChiMi+'Tail']).eql(f_ba.a_f)
      chai.expect(f_ab.a_f.next.id).equal(f_ab.b_f.id)
      chai.expect(eYo.isNA(f_ab.a_f.next.next)).true
      chai.expect(f_ab.b_f.previous.id).equal(f_ab.a_f.id)
      chai.expect(eYo.isNA(f_ab.b_f.previous.previous)).true
      chai.expect(f_ba.b_f.next.id).equal(f_ba.a_f.id)
      chai.expect(eYo.isNA(f_ba.b_f.next.next)).true
      chai.expect(f_ba.a_f.previous.id).equal(f_ba.b_f.id)
      chai.expect(eYo.isNA(f_ba.a_f.previous.previous)).true
    })
    it ('Model: maker', function () {
      let id = eYo.genUID(eYo.IDENT, 10)
      let kFooChiMi = `fooChiMi${id}`
      let foo = eYo.c9r.makeNS()
      foo.allowModelPaths({
        [eYo.model.ROOT]: kFooChiMi,
      })
      foo.makeBase({
        fooChiMi: {
          a: {
            value: 1,
          },
          b: {
            value: 2,
          },
        },
      })
      foo.enhancedMany(kFooChiMi, 'fooChiMi', {
        maker (object, k, model) {
          flag.push(5)
          return {
            value: model.value,
          }
        }
      })
      foo.Dlgt_p.prepareInstance = function (object) {
        this[kFooChiMi + 'Prepare'](object)
        this.super.prepareInstance(object)
      }
      flag.reset()
      let f = foo.new()
      chai.expect(flag.v).equal(55)
      chai.expect(f.a_f.value).equal(1)
      chai.expect(f.b_f.value).equal(2)
    })
    it ('Model: makeShortcuts', function () {
      let id = eYo.genUID(eYo.IDENT, 10)
      let kFooChiMi = `fooChiMi${id}`
      let foo = eYo.c9r.makeNS()
      foo.allowModelPaths({
        [eYo.model.ROOT]: kFooChiMi,
      })
      foo.makeBase({
        fooChiMi: {
          a: {
            value: 1,
          },
          b: {
            value: 2,
          },
        },
      })
      foo.enhancedMany(kFooChiMi, 'fooChiMi', {
        maker (object, k, model) {
          flag.push(5)
          return {
            value: model.value,
          }
        },
        makeShortcuts (object, k, p) {
          flag.push(p.value)
        },
      })
      foo.Dlgt_p.prepareInstance = function (object) {
        this[kFooChiMi + 'Prepare'](object)
        this.super.prepareInstance(object)
      }
      flag.reset()
      foo.new()
      chai.expect([5152, 5251]).contains(flag.v)
    })
    it ('Model: inherits', function () {
      let id = eYo.genUID(eYo.IDENT, 10)
      let kFoo = `foo${id}`
      let foo = eYo.c9r.makeNS()
      foo.allowModelPaths({
        [eYo.model.ROOT]: kFoo,
      })
      foo.makeBase({
        foo: {
          a: {
            value: 1,
          },
          b: {
            after: 'a',
            value: 2,
          },
        },
      })
      foo.enhancedMany(kFoo, 'foo', {
        maker (object, k, model) {
          flag.push(model.value)
          return {
            value: model.value,
          }
        },
      })
      let map_foo = foo.Base.eyo[kFoo + 'ModelMap']
      chai.expect([...map_foo.keys()]).eql(['a', 'b'])
      foo.Dlgt_p.prepareInstance = function (object) {
        this[kFoo + 'Prepare'](object)
        let eyo = this.super
        if (eyo) {
          try {
            eyo[kFoo + 'Prepare'] = eYo.doNothing // prevent to recreate the same properties
            eyo.prepareInstance(object)
          } finally {
            delete eyo[kFoo + 'Prepare']
          }
        }
      }
      flag.reset()
      foo.new()
      chai.expect(flag.v).equal(12)
      let bar = foo.makeNS()
      bar.makeBase({
        foo: {
          c: {
            after: 'b',
            value: 3,
          },
          d: {
            after: 'c',
            value: 4,
          },
        },
      })
      let map_bar = bar.Base.eyo[kFoo + 'ModelMap']
      chai.expect([...map_bar.keys()]).eql(['a', 'b', 'c', 'd'])
      flag.reset()
      bar.new()
      chai.expect(flag.v).equal(1234)
    })
    it ('Model: override', function () {
      let id = eYo.genUID(eYo.IDENT, 10)
      let kFoo = `foo${id}`
      let foo = eYo.c9r.makeNS()
      foo.allowModelPaths({
        [eYo.model.ROOT]: kFoo,
      })
      foo.makeBase({
        foo: {
          a: {
            value: 1,
          },
          b: {
            after: 'a',
            value: 2,
          },
        },
      })
      foo.enhancedMany(kFoo, 'foo', {
        maker (object, k, model) {
          flag.push(model.value)
          return {
            value: model.value,
          }
        },
      })
      let map_foo = foo.Base.eyo[kFoo + 'ModelMap']
      chai.expect([...map_foo.keys()]).eql(['a', 'b'])
      foo.Dlgt_p.prepareInstance = function (object) {
        this[kFoo + 'Prepare'](object)
        let eyo = this.super
        if (eyo) {
          try {
            eyo[kFoo + 'Prepare'] = eYo.doNothing // prevent to recreate the same properties
            eyo.prepareInstance(object)
          } finally {
            delete eyo[kFoo + 'Prepare']
          }
        }
      }
      flag.reset()
      foo.new()
      chai.expect(flag.v).equal(12)
      let bar = foo.makeNS()
      bar.makeBase({
        foo: {
          c: {
            after: 'a',
            value: 3,
          },
          d: {
            after: 'c',
            value: 4,
          },
          b: {
            after: 'd',
            value: 5,
          },
        },
      })
      let map_bar = bar.Base.eyo[kFoo + 'ModelMap']
      chai.expect([...map_bar.keys()]).eql(['a', 'c', 'd', 'b'])
      flag.reset()
      bar.new()
      chai.expect(flag.v).equal(1345)
    })
  })
})
