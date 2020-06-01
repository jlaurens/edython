describe ('POC', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c9r && eYo.c9r.new({
      methods: {
        flag (what, ...$) {
          flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
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
    var NS = eYo.c9r.makeNS()
    chai.assert(!NS.foo)
    NS.foo = 123
    chai.assert(NS.foo)
    delete NS.foo
    chai.assert(!NS.foo)
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
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c9r && eYo.c9r.new({
      methods: {
        flag (what, ...$) {
          flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  it ('C9r: Basic', function () {
    chai.assert(eYo.makeNS)
    chai.assert(eYo.c9r)
    chai.assert(eYo.c9r.BaseC9r)
    chai.assert(eYo.c9r.BaseC9r_p)
    var set = new Set([
      eYo.c9r.BaseC9r[eYo.$],
      eYo.c9r.BaseC9r[eYo.$][eYo.$],
      eYo.c9r.BaseC9r[eYo.$][eYo.$][eYo.$],
      eYo.c9r.BaseC9r[eYo.$][eYo.$][eYo.$][eYo.$],
    ])
    chai.expect(set.size).equal(3)
    chai.assert(eYo.c9r.makeC9r)
    var C9r = eYo.c9r.makeC9r()
    chai.assert(C9r)
    set = new Set([
      C9r[eYo.$],
      C9r[eYo.$][eYo.$],
      C9r[eYo.$][eYo.$][eYo.$],
      C9r[eYo.$][eYo.$][eYo.$][eYo.$],
    ])
    chai.expect(set.size).equal(3)
    chai.expect(C9r[eYo.$]).not.equal(eYo.c9r.BaseC9r[eYo.$])
    chai.assert(eYo.isSubclass(C9r[eYo.$].constructor, eYo.dlgt.BaseC9r))
    chai.expect(C9r[eYo.$].id).equal('')
  })
  it ('C9r: finalizeC9r', function () {
    let NS = eYo.c9r.makeNS()
    let C9r = NS.makeC9r()
    C9r[eYo.$].finalizeC9r()
    new C9r()
  })
  it ('C9r: NS inherit', function () {
    let NS = eYo.c9r.makeNS()
    chai.expect(NS.BaseC9r).equal(eYo.c9r.BaseC9r)
    chai.expect(NS.BaseC9r_p).equal(eYo.c9r.BaseC9r_p)
    NS.makeBaseC9r()
    chai.expect(NS.BaseC9r).not.equal(eYo.c9r.BaseC9r)
    chai.expect(NS.BaseC9r_p).not.equal(eYo.c9r.BaseC9r_p)
    chai.expect(NS.makeC9r()[eYo.$SuperC9r]).undefined
    let C9r = NS.makeC9r('Foo')
    chai.expect(NS.makeC9r()[eYo.$SuperC9r]).undefined
  })
  it ('C9r modelMerge (adding methods)', function () {
    var NS = eYo.c9r.makeNS()
    NS.makeBaseC9r()
    var d = NS.new()
    chai.assert(!d.foo)
    flag.reset()
    NS.BaseC9r[eYo.$].modelMerge({
      methods: {
        foo (x) {
          flag.push(x)
        },
      },
    })
    chai.assert(d.foo)
    d.foo(1)
    flag.expect(1)
    d = NS.new()
    d.foo(2)
    flag.expect(2)
  })
  it ('C9r modelMerge - overriden', function () {
    flag.reset()
    var NS = eYo.c9r.makeNS()
    NS.makeBaseC9r()
    var d = NS.new()
    chai.assert(!d.foo)
    NS.BaseC9r[eYo.$].methodsMerge({
      foo () {
        flag.push(1)
      },
    })
    NS.BaseC9r[eYo.$].methodsMerge({
      foo (overriden) {
        return function () {
          overriden()
          flag.push(2)
        }
      },
    })
    new NS.BaseC9r().foo()
    flag.expect(12)
  })
  it('C9r: makeBaseC9r({methods:...})', function () {
    var NS = eYo.c9r.makeNS()
    NS.makeBaseC9r({
      methods: {
        foo (x) {
          flag.push(x)
        },
      },
    })
    var d = NS.new()
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
    chai.expect(eYo.isaC9r(d)).true
    chai.expect(eYo.isaC9r(eYo.NA)).false
    chai.expect(eYo.isaC9r(421)).false
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
      var NS = eYo.c9r.makeNS()
      chai.assert(NS.makeNS)
      chai.assert(NS.makeC9r)
      chai.expect(NS.super).equal(eYo.c9r)
      eYo.makeNS(NS, 'foo')
      chai.assert(NS.foo)
      chai.assert(NS.foo.makeNS)
      chai.assert(!NS.foo.makeC9r)
      chai.expect(NS.foo.super).equal(eYo)
      chai.assert(NS.foo.name.endsWith('.foo'))
    })
    it ('NS.makeNS(...)', function () {
      var NS = eYo.c9r.makeNS()
      chai.expect(() => { NS.makeNS() }).not.to.throw()
      NS.makeNS('foo')
      chai.assert(NS.foo)
      chai.assert(NS.foo.makeNS)
      chai.assert(NS.foo.makeC9r)
      chai.expect(NS.foo.super).equal(NS)
      chai.assert(NS.foo.name.endsWith('.foo'))
      chai.assert(!NS.bar)
      NS.bar = 123
      chai.assert(NS.bar)
      chai.expect(() => { NS.makeNS('bar') }).to.throw()
      chai.expect(() => { eYo.makeNS(NS, 'bar') }).to.throw()
      delete NS.bar
      chai.expect(() => { eYo.makeNS(NS, 'bar') }).not.to.throw()
      var nsbis = eYo.makeNS()
      nsbis.bar = 123
      chai.expect(() => { nsbis.makeNS('bar') }).to.throw()
      chai.expect(() => { eYo.makeNS(nsbis, 'bar') }).to.throw()
      delete nsbis.bar
      chai.expect(() => { nsbis.makeNS('bar') }).not.to.throw()
    })
  })
  describe ('C9r: makeSubC9r', function () {
    it (`eYo[eYo.$makeSubC9r]('AB')`, function () {
      var NS = eYo.c9r.makeNS()
      var A = NS.makeC9r('A')
      var AB = A[eYo.$makeSubC9r]('AB')
      chai.assert(AB)
      chai.expect(AB.prototype.constructor).equal(AB)
    })
    it (`NS.A[eYo.$makeSubC9r]('AB')`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeC9r('A')
      NS.A[eYo.$makeSubC9r]('AB')
      chai.assert(eYo.isF(NS.AB))
      chai.assert(NS.AB[eYo.$].name.endsWith('.AB'))
      chai.expect(NS.AB[eYo.$].ns).equal(NS)
      chai.expect(NS.AB_p).equal(NS.AB.prototype)
      chai.expect(NS.AB_s).equal(NS.A.prototype)
      chai.assert(eYo.isSubclass(NS.AB, NS.A))
      chai.assert(eYo.isSubclass(NS.AB[eYo.$].constructor, NS.A[eYo.$].constructor))
    })
    it ('NS.A[eYo.$makeSubC9r]', function () {
      var NS = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', null, {
        init(x) {
          flag.push(x)
        }
      })
      chai.assert(NS.A[eYo.$makeSubC9r])
      NS.A[eYo.$makeSubC9r]('AB', {
        init(x) {
          flag.push(x+1)
        },
      })
      chai.expect(NS.AB[eYo.$SuperC9r_p]).equal(NS.A.prototype)
      NS.A[eYo.$].finalizeC9r()
      NS.AB[eYo.$].finalizeC9r()
      new NS.AB(1)
      flag.expect(12)
    })
  })
  describe ('C9r: makeC9r', function () {
    it (`NS.makeC9r('BaseC9r')`, function () {
      var NS = eYo.c9r.makeNS()
      chai.expect(NS.BaseC9r).equal(eYo.c9r.BaseC9r)
      NS.makeC9r('BaseC9r')
      chai.assert(NS.BaseC9r)
      chai.assert(NS.BaseC9r !== eYo.c9r.BaseC9r)
      chai.assert(eYo.isSubclass(NS.BaseC9r, eYo.c9r.BaseC9r))
      chai.expect(NS.BaseC9r[eYo.$].ns).equal(NS)
    })
    it (`eYo.c9r.makeC9r(NS, 'BaseC9r')`, function () {
      var NS = eYo.c9r.makeNS()
      chai.expect(NS.BaseC9r).equal(eYo.c9r.BaseC9r)
      chai.assert(!NS.BaseC9r[eYo.$SuperC9r_p])
      eYo.c9r.makeC9r(NS, 'BaseC9r')
      chai.assert(NS.BaseC9r !== eYo.c9r.BaseC9r)
      chai.expect(NS.BaseC9r[eYo.$SuperC9r_p]).equal(eYo.c9r.BaseC9r_p)
    })
    it (`NS.makeBaseC9r()`, function () {
      chai.assert(eYo.c9r.BaseC9r)
      var NS = eYo.c9r.makeNS()
      chai.expect(NS.BaseC9r).equal(eYo.c9r.BaseC9r)
      NS.makeBaseC9r()
      chai.assert(NS.BaseC9r && NS.BaseC9r !== eYo.c9r.BaseC9r)
      chai.expect(NS.BaseC9r[eYo.$].ns).equal(NS)
      var NS = eYo.c9r.makeNS()
      Object.defineProperty(NS, 'BaseC9r', {
        value: 421
      })
      chai.expect(() => { NS.makeBaseC9r() }).to.throw()
      chai.expect(eYo.c9r.makeC9r(NS)[eYo.$].id).equal('')
      chai.expect(() => { eYo.c9r.makeC9r(NS, 'BaseC9r') }).to.throw()
      chai.expect(() => { NS.makeC9r('BaseC9r') }).to.throw()
    })
    it(`NS.makeBaseC9r({...})`, function () {
      var NS = eYo.c9r.makeNS()
      chai.expect(NS.BaseC9r).equal(eYo.c9r.BaseC9r)
      let model = {}
      NS.makeBaseC9r(model)
      chai.expect(NS.BaseC9r[eYo.$].model).equal(model)
    })
    it(`eYo.c9r.makeC9r('A', eYo.c9r.BaseC9r)`, function () {
      let NS = eYo.c9r.makeNS()
      let C9r = NS.makeC9r('A', eYo.c9r.BaseC9r)
      chai.assert(eYo.isSubclass(NS.A, eYo.c9r.BaseC9r))
      chai.expect(C9r).equal(C9r[eYo.$].C9r)
      chai.expect(C9r.prototype).equal(C9r[eYo.$].C9r_p)
      chai.expect(eYo.c9r.BaseC9r).equal(C9r[eYo.$].C9r_S)
      chai.expect(eYo.c9r.BaseC9r_p).equal(C9r[eYo.$].C9r_s)
    })
    it (`eYo.c9r.makeC9r(NS, 'A', ...)`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      let C9r = eYo.c9r.makeC9r(NS, 'A')
      chai.expect(NS.A_s).equal(eYo.c9r.BaseC9r_p)
      chai.expect(()=>{ eYo.c9r.makeC9r(NS, 'A') }).to.throw() // Already existing attribute
      chai.expect(eYo.isSubclass(C9r, eYo.c9r.BaseC9r)).true
      chai.expect(eYo.isSubclass(C9r, NS.BaseC9r)).false
    })
    it (`eYo.c9r.makeC9r(NS, 'A', Super, model)`, function () {
      flag.reset()
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      var Super = NS.BaseC9r
      eYo.c9r.makeC9r(NS, 'A', Super, {
        init (x) {
          flag.push(x)
        }
      })
      chai.assert(NS.A)
      chai.assert(eYo.isSubclass(NS.A, NS.BaseC9r))
      chai.expect(NS.A_s).equal(NS.BaseC9r_p)
      NS.A[eYo.$].finalizeC9r()
      new NS.A(1)
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r('_A')`, function () {
      if (!eYo._A) {
        var A = eYo.c9r.makeC9r('_A')
        chai.assert(A)
        chai.assert(!A.constructor[eYo.$SuperC9r_p])
        chai.assert(eYo.isF(A[eYo.$makeSubC9r]))
      }
    })
    it (`NO eYo.c9r.makeC9r('_A')`, function () {
      if (eYo._A) {
        chai.expect(() => {eYo.c9r.makeC9r('_A')}).to.throw()
      }
    })
    it (`NS.makeC9r('A')`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeC9r('A')
      chai.assert(eYo.isF(NS.A))
      chai.assert(NS.A[eYo.$].name.endsWith('.A'))
      chai.expect(NS.A[eYo.$].ns).equal(NS)
      chai.expect(NS.A_p).equal(NS.A.prototype)
      chai.expect(NS.A_s).equal(NS.BaseC9r_p)
    })
    it ('makeC9r: constructor call', function () {
      flag.reset()
      var NS = eYo.c9r.makeNS()
      eYo.c9r.makeC9r(NS, 'A', null, {
        init (x) {
          flag.push(x)
        }
      })
      chai.assert(!NS.A_s)
      NS.A[eYo.$].finalizeC9r()
      var a = new NS.A(1)
      flag.expect(1)
      a = new NS.A(2)
      flag.expect(2)
    })
    it ('makeC9r: super !== null', function () {
      var NS = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', {
        init (x) {
          flag.push(x)
        },
      })
      chai.assert(NS.A[eYo.$] instanceof eYo.c9r.BaseC9r[eYo.$].constructor)
      NS.A[eYo.$].finalizeC9r()
      new NS.A(1)
      flag.expect(1)
      NS.makeC9r('AB', NS.A, {
        init (x) {
          flag.push(x+1)
        },
      })
      chai.assert(NS.AB)
      chai.assert(NS.AB[eYo.$] instanceof eYo.c9r.BaseC9r[eYo.$].constructor)
      NS.AB[eYo.$].finalizeC9r()
      new NS.AB(2)
      flag.expect(23)
    })  
    it ('makeC9r: multi super !== null', function () {
      var NS = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', {
        init (x) {
          flag.push(x)
        },
      })
      eYo.c9r.makeC9r(NS, 'B', {
        init (x) {
          flag.push(x+1)
        },
      })
      eYo.c9r.makeC9r(NS, 'AA', NS.A, {
        init (x) {
          flag.push(x+2)
        },
      })
      eYo.c9r.makeC9r(NS, 'AB', NS.A, {
        init (x) {
          flag.push(x+3)
        },
      })
      eYo.c9r.makeC9r(NS, 'BA', NS.B, {
        init (x) {
          flag.push(x+4)
        },
      })
      eYo.c9r.makeC9r(NS, 'BB', NS.B, {
        init (x) {
          flag.push(x+5)
        },
      })
      NS.A[eYo.$].finalizeC9r()
      NS.B[eYo.$].finalizeC9r()
      NS.AA[eYo.$].finalizeC9r()
      NS.AB[eYo.$].finalizeC9r()
      NS.BA[eYo.$].finalizeC9r()
      NS.BB[eYo.$].finalizeC9r()
      new NS.AA(1)
      flag.expect(13)
      new NS.AB(2)
      flag.expect(25)
      new NS.BA(2)
      flag.expect(36)
      new NS.BB(3)
      flag.expect(48)
    })
    it ('makeC9r: undefined owner or super', function () {
      var NS = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', null, {
        init (x) {
          flag.push(x)
        }
      })
      eYo.c9r.makeC9r(NS, 'AB', NS.A, {
        init (x) {
          flag.push(x+1)
        },
      })
      chai.expect(NS.AB_s.constructor).equal(NS.A)
      NS.A[eYo.$].finalizeC9r()
      NS.AB[eYo.$].finalizeC9r()
      new NS.AB(1)
      flag.expect(12)
    })
    it ('makeC9r: init shortcuts 1', function () {
      var NS = eYo.c9r.makeNS()
      flag.reset()
      var make = (init) => {
        NS = eYo.c9r.makeNS()
        eYo.c9r.makeC9r(NS, 'A', null, {
          init: init
        })
        NS.A[eYo.$].finalizeC9r()
        return new NS.A()
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
      var NS = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', null, {
        init (x) {
          flag.push(x)
        }
      })
      NS.A[eYo.$].finalizeC9r()
      new NS.A(2)
      flag.expect(2)
      NS.A[eYo.$makeSubC9r]('AB', {
        init (builtin, x) {
          flag.push(x)
          builtin () // no argument at all
          flag.push(x+2)
        }
      })
      NS.AB[eYo.$].finalizeC9r()
      new NS.AB(1)
      flag.expect(113)
    })
    it ('makeC9r: dispose', function () {
      var NS = eYo.c9r.makeNS()
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', null, {
        dispose(x) {
          flag.push(x)
        }
      })
      eYo.c9r.makeC9r(NS, 'AB', NS.A, {
        dispose(x) {
          flag.push(x+1)
        }
      })
      NS.A[eYo.$].finalizeC9r()
      new NS.A().dispose(1)
      flag.expect(1)
      NS.AB[eYo.$].finalizeC9r()
      new NS.AB().dispose(2)
      flag.expect(32)
    })
    var testX = (X, Super, Dlgt_p) => {
      chai.assert(X)
      chai.assert(eYo.isSubclass(X, Super))
      chai.assert(X[eYo.$])
      chai.assert(!Super || X[eYo.$].super === Super[eYo.$])
      chai.assert(!Super || X[eYo.$SuperC9r_p] === Super.prototype)
      chai.assert(!Super || X[eYo.$SuperC9r_p].constructor === Super)
      chai.assert(!Dlgt_p || eYo.isSubclass(X[eYo.$].constructor, Dlgt_p.constructor))
      chai.expect(() => {
        new X()
      }).not.to.throw()
    }
    it (`eYo.c9r.makeC9r('...')`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      eYo.c9r.makeC9r(NS, 'A')
      testX(NS.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r('...', {...})`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', {
        init () {
          flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC9r()
      testX(NS.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r(NS, '...')`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      eYo.c9r.makeC9r(NS, 'A')
      NS.A[eYo.$].finalizeC9r()
      testX(NS.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r(NS, '...', {...})`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', {
        init () {
          flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC9r()
      testX(NS.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r('...', Super = eYo.c9r.BaseC9r)`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      eYo.c9r.makeC9r(NS, 'A', NS.BaseC9r)
      NS.A[eYo.$].finalizeC9r()
      testX(NS.A, NS.BaseC9r, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r('...', Super = eYo.c9r.BaseC9r, {...})`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      flag.reset()
      NS.makeC9r('A', {
        init () {
          flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC9r()
      testX(NS.A, NS.BaseC9r, NS.Dlgt_p)
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.BaseC9r, {...})`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', eYo.c9r.BaseC9r, {
        init () {
          flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC9r()
      testX(NS.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r('...', eYo.c9r.BaseC9r, {...}?)`, function () {
      var Super = eYo.c9r.BaseC9r
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      eYo.c9r.makeC9r(NS, 'A', Super)
      NS.A[eYo.$].finalizeC9r()
      chai.expect(NS.A[eYo.$].super).equal(Super[eYo.$])
      testX(NS.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      chai.expect(NS.Dlgt_p).equal(NS.Dlgt_p)
      testX(NS.BaseC9r, eYo.c9r.BaseC9r, NS.Dlgt_p)
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', NS.BaseC9r, {
        init () {
          flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC9r()
      testX(NS.A, NS.BaseC9r, eYo.c9r.Dlgt_p)
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
      chai.assert(A[eYo.$])
      chai.expect(A[eYo.$].super).equal(eYo.c9r.BaseC9r[eYo.$])
      chai.expect(A[eYo.$SuperC9r_p]).equal(eYo.c9r.BaseC9r_p)
      chai.expect(A[eYo.$SuperC9r_p].constructor).equal(eYo.c9r.BaseC9r)
      A[eYo.$].finalizeC9r()
      new A()
      flag.expect(1)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.BaseC9r)`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      eYo.c9r.makeC9r(NS, 'A', eYo.c9r.BaseC9r)
      NS.A[eYo.$].finalizeC9r()
      testX(NS.A, eYo.c9r.BaseC9r, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.BaseC9r, {...})`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', eYo.c9r.BaseC9r, {
        init () {
          flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC9r()
      testX(NS.A, eYo.c9r.BaseC9r)
      flag.expect(1)
    })
    it (`?eYo.c9r.makeC9r(NS, '...', Super, Dlgt, {...})`, function () {
      var NS = eYo.c9r.makeNS()
      NS.makeBaseC9r()
      flag.reset()
      eYo.c9r.makeC9r(NS, 'A', {
        init () {
          flag.push(1)
        }
      })
      eYo.c9r.makeC9r(NS, 'AB', NS.A, {
        init () {
          flag.push(2)
        }
      })
      chai.expect(NS.AB[eYo.$].super).equal(NS.A[eYo.$])
      chai.expect(NS.A[eYo.$].super).equal(eYo.c9r.BaseC9r[eYo.$])
      NS.A[eYo.$].finalizeC9r()
      NS.AB[eYo.$].finalizeC9r()
      new NS.AB()
      flag.expect(12)
    })
  })
  it ('C9r: eyo setter', function () {
    var NS = eYo.c9r.makeNS()
    eYo.c9r.makeC9r(NS, 'A', null, {})
    chai.assert(eYo.isSubclass(NS.A[eYo.$].constructor, eYo.dlgt.BaseC9r))
    chai.expect(() => {
      NS.A[eYo.$] = null
    }).to.throw()
    chai.expect(() => {
      NS.A[eYo.$] = null
    }).to.throw()
  })
  it ('C9r: dlgt key', function () {
    var NS = eYo.c9r.makeNS()
    flag.reset()
    eYo.c9r.makeC9r(NS, 'A', {
      [eYo.Sym.dlgt] () {
        flag.push(1)
      },
      init() {
        flag.push(2)
      }
    })
    flag.expect(1)
    chai.assert(NS.A[eYo.$makeSubC9r])
    NS.A[eYo.$makeSubC9r]('AB', {})
    flag.expect(1)
  })
  it ('C9r: inheritedMethod', function () {
    var NS = eYo.c9r.makeNS()
    NS.makeBaseC9r()
    NS.makeC9r('A')
    NS.A[eYo.$makeSubC9r]('AA')
    NS.AA[eYo.$makeSubC9r]('AAA')
    let A_foo = NS.A_p.foo = function () {}
    let AA_foo = NS.AA_p.foo = function () {}
    let AAA_foo = NS.AAA_p.foo = function () {}
    
    let a = new NS.A()
    let aa = new NS.AA()
    let aaa = new NS.AAA()

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
    var NS = eYo.c9r.makeNS()
    NS.makeBaseC9r()
    NS.makeC9r('A')
    NS.A[eYo.$makeSubC9r]('AA')
    NS.AA[eYo.$makeSubC9r]('AAA')
    let A_foo = NS.A_p.foo = 1
    let AA_foo = NS.AA_p.foo = function () {}
    let AAA_foo = NS.AAA_p.foo = function () {}
    
    let a = new NS.A()
    let aa = new NS.AA()
    let aaa = new NS.AAA()

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
    var NS = eYo.c9r.makeNS()
    NS.makeBaseC9r()
    chai.expect(NS.BaseC9r[eYo.$].model).eql({})
    let model = {
      foo: 421,
    }
    NS = eYo.c9r.makeNS()
    NS.makeBaseC9r(model)
    chai.expect(NS.BaseC9r[eYo.$].model).equal(model)
    flag.reset()
    model.init = function () {
      flag.push(1)
      chai.expect(this.model).equal(model)
    }
    NS = eYo.c9r.makeNS()
    NS.makeBaseC9r(model)
    new NS.BaseC9r()
    flag.expect(1)
  })
  it ('naming', function () {
    var seed = eYo.genUID(eYo.IDENT)
    var k = 'x' + seed
    var K = 'X' + seed
    let NS = eYo.c9r.makeNS(eYo, k)
    chai.expect(NS.name).equal(`eYo.${k}`)
    NS.makeBaseC9r({})
    chai.expect(NS.BaseC9r[eYo.$].name.endsWith(`.${K}`)).true
  })
})
