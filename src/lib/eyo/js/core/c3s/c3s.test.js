describe ('POC', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c3s && eYo.c3s.new({
      methods: {
        flag (what, ...$) {
          eYo.flag.push(1, what, ...$)
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
    let C3s = function () {}
    let c3s = new C3s()
    chai.expect(c3s.version).equal(oYe.NA)
    Object.setPrototypeOf(c3s, OYE.prototype)
    chai.expect(c3s.version).equal(421)
    Object.setPrototypeOf(c3s, C3s.prototype)
    chai.expect(c3s.version).equal(oYe.NA)
    let setConstructorOf = (object, C3s) => {
      object.constructor = C3s
      Object.setPrototypeOf(object, C3s.prototype)
    }
    setConstructorOf(oYe, C3s)
    chai.expect(oYe.version).equal(oYe.NA)
    setConstructorOf(oYe, OYE)
    chai.expect(oYe.version).equal(421)
    C3s.prototype.test = 123
    chai.expect(c3s.test).equal(123)    
    chai.expect(c3s.version).equal(oYe.NA)
    eYo.inherits(C3s, OYE)
    chai.expect(c3s.test).equal(123)
    chai.expect(c3s.version).equal(421)
    setConstructorOf(oYe, C3s)
    setConstructorOf(c3s, OYE)
    chai.expect(c3s.test).equal(eYo.NA)
    chai.expect(c3s.version).equal(421)
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
    var NS = eYo.c3s.newNS()
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
describe ('Tests: C3s', function () {
  this.timeout(20000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c3s && eYo.c3s.new({
      methods: {
        flag (what, ...$) {
          eYo.flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
  it ('C3s: Basic', function () {
    chai.assert(eYo.newNS)
    chai.assert(eYo.c3s)
    chai.assert(eYo.c3s.BaseC3s)
    chai.assert(eYo.c3s.BaseC3s_p)
    var set = new Set([
      eYo.c3s.BaseC3s[eYo.$],
      eYo.c3s.BaseC3s[eYo.$][eYo.$],
      eYo.c3s.BaseC3s[eYo.$][eYo.$][eYo.$],
      eYo.c3s.BaseC3s[eYo.$][eYo.$][eYo.$][eYo.$],
    ])
    chai.expect(set.size).equal(3)
    chai.assert(eYo.c3s.newC3s)
    var C3s = eYo.c3s.newC3s()
    chai.assert(C3s)
    set = new Set([
      C3s[eYo.$],
      C3s[eYo.$][eYo.$],
      C3s[eYo.$][eYo.$][eYo.$],
      C3s[eYo.$][eYo.$][eYo.$][eYo.$],
    ])
    chai.expect(set.size).equal(3)
    chai.expect(C3s[eYo.$]).not.equal(eYo.c3s.BaseC3s[eYo.$])
    chai.assert(eYo.isSubclass(C3s[eYo.$].constructor, eYo.dlgt.BaseC3s))
    chai.expect(C3s[eYo.$].id__).equal('eYo.c3s.?')
  })
  it ('C3s: finalizeC3s', function () {
    let NS = eYo.c3s.newNS()
    let C3s = NS.newC3s()
    C3s[eYo.$].finalizeC3s()
    new C3s()
  })
  it ('C3s: NS inherit', function () {
    let NS = eYo.c3s.newNS()
    chai.expect(NS.BaseC3s).equal(eYo.c3s.BaseC3s)
    chai.expect(NS.BaseC3s_p).equal(eYo.c3s.BaseC3s_p)
    NS.makeBaseC3s()
    chai.expect(NS.BaseC3s).not.equal(eYo.c3s.BaseC3s)
    chai.expect(NS.BaseC3s_p).not.equal(eYo.c3s.BaseC3s_p)
    chai.expect(NS.newC3s()[eYo.$SuperC3s]).equal(NS.BaseC3s)
    chai.expect(NS.newC3s({
      [eYo.$SuperC3s]: eYo.NA,
    })[eYo.$SuperC3s]).undefined
  })
  it ('C3s modelMerge (adding methods)', function () {
    var NS = eYo.c3s.newNS()
    NS.makeBaseC3s()
    var d = NS.new()
    chai.assert(!d.foo)
    flag.reset()
    NS.BaseC3s[eYo.$].modelMerge({
      methods: {
        foo (x) {
          eYo.flag.push(x)
        },
      },
    })
    chai.assert(d.foo)
    d.foo(1)
    eYo.flag.expect(1)
    d = NS.new()
    d.foo(2)
    eYo.flag.expect(2)
  })
  it ('C3s modelMerge - overriden', function () {
    flag.reset()
    var NS = eYo.c3s.newNS()
    NS.makeBaseC3s()
    var d = NS.new()
    chai.assert(!d.foo)
    NS.BaseC3s[eYo.$].methodsMerge({
      foo () {
        eYo.flag.push(1)
      },
    })
    NS.BaseC3s[eYo.$].methodsMerge({
      foo (overriden) {
        return function () {
          overriden()
          eYo.flag.push(2)
        }
      },
    })
    new NS.BaseC3s().foo()
    eYo.flag.expect(12)
  })
  it('C3s: makeBaseC3s({methods:...})', function () {
    var NS = eYo.c3s.newNS()
    NS.makeBaseC3s({
      methods: {
        foo (x) {
          eYo.flag.push(x)
        },
      },
    })
    var d = NS.new()
    flag.reset()
    chai.assert(d.foo)
    d.foo(1)
    eYo.flag.expect(1)
  })
  it('C3s: eYo.c3s.new({methods:...})', function () {
    var d = eYo.c3s.new({
      methods: {
        foo (x) {
          eYo.flag.push(x)
        },
      },
    })
    chai.expect(eYo.isaC3s(d)).true
    chai.expect(eYo.isaC3s(eYo.NA)).false
    chai.expect(eYo.isaC3s(421)).false
    flag.reset()
    chai.assert(d.foo)
    d.foo(1)
    eYo.flag.expect(1)
  })
  describe('C3s: newNS', function () {
    it ('newNS(...)', function () {
      var foo = eYo.newNS('___Foo')
      chai.assert(foo && foo === eYo.___Foo)
      chai.assert(foo.newNS)
      chai.assert(!foo.newC3s)
      chai.expect(foo.$super).equal(eYo)
      chai.expect(foo.name).equal('eYo.___Foo')
      var NS = eYo.c3s.newNS()
      chai.assert(NS.newNS)
      chai.assert(NS.newC3s)
      chai.expect(NS.$super).equal(eYo.c3s)
      eYo.newNS(NS, 'foo')
      chai.assert(NS.foo)
      chai.assert(NS.foo.newNS)
      chai.assert(!NS.foo.newC3s)
      chai.expect(NS.foo.$super).equal(eYo)
      chai.assert(NS.foo.name.endsWith('.foo'))
    })
    it ('NS.newNS(...)', function () {
      var NS = eYo.c3s.newNS()
      chai.expect(() => { NS.newNS() }).not.to.xthrow()
      NS.newNS('foo')
      chai.assert(NS.foo)
      chai.assert(NS.foo.newNS)
      chai.assert(NS.foo.newC3s)
      chai.expect(NS.foo.$super).equal(NS)
      chai.assert(NS.foo.name.endsWith('.foo'))
      chai.assert(!NS.bar)
      NS.bar = 123
      chai.assert(NS.bar)
      chai.expect(() => { NS.newNS('bar') }).to.xthrow()
      chai.expect(() => { eYo.newNS(NS, 'bar') }).to.xthrow()
      delete NS.bar
      chai.expect(() => { eYo.newNS(NS, 'bar') }).not.to.xthrow()
      var nsbis = eYo.newNS()
      nsbis.bar = 123
      chai.expect(() => { nsbis.newNS('bar') }).to.xthrow()
      chai.expect(() => { eYo.newNS(nsbis, 'bar') }).to.xthrow()
      delete nsbis.bar
      chai.expect(() => { nsbis.newNS('bar') }).not.to.xthrow()
    })
  })
  describe ('C3s: makeSubC3s', function () {
    it (`eYo[eYo.$newSubC3s]('AB')`, function () {
      var NS = eYo.c3s.newNS()
      var A = NS.newC3s('A')
      var AB = A[eYo.$newSubC3s]('AB')
      chai.assert(AB)
      chai.expect(AB.prototype.constructor).equal(AB)
    })
    it (`NS.A[eYo.$newSubC3s]('AB')`, function () {
      var NS = eYo.c3s.newNS()
      NS.newC3s('A')
      NS.A[eYo.$newSubC3s]('AB')
      chai.assert(eYo.isF(NS.AB))
      chai.assert(NS.AB[eYo.$].name.endsWith('.AB'))
      chai.expect(NS.AB[eYo.$].ns).equal(NS)
      chai.expect(NS.AB_p).equal(NS.AB.prototype)
      chai.expect(NS.AB_s).equal(NS.A.prototype)
      chai.assert(eYo.isSubclass(NS.AB, NS.A))
      chai.assert(eYo.isSubclass(NS.AB[eYo.$].constructor, NS.A[eYo.$].constructor))
    })
    it ('NS.A[eYo.$newSubC3s]', function () {
      var NS = eYo.c3s.newNS()
      eYo.c3s.newC3s(NS, 'A', null, {
        prepare (x) {
          eYo.flag.push(x)
        }
      })
      chai.assert(NS.A[eYo.$newSubC3s])
      NS.A[eYo.$newSubC3s]('AB', {
        prepare (x) {
          eYo.flag.push(x+1)
        },
      })
      chai.expect(NS.AB[eYo.$SuperC3s_p]).equal(NS.A.prototype)
      NS.A[eYo.$].finalizeC3s()
      NS.AB[eYo.$].finalizeC3s()
      new NS.AB(1)
      eYo.flag.expect(12)
    })
  })
  describe ('C3s: newC3s', function () {
    it (`NS.newC3s('BaseC3s')`, function () {
      var NS = eYo.c3s.newNS()
      chai.expect(NS.BaseC3s).equal(eYo.c3s.BaseC3s)
      NS.newC3s('BaseC3s')
      chai.assert(NS.BaseC3s)
      chai.assert(NS.BaseC3s !== eYo.c3s.BaseC3s)
      chai.assert(eYo.isSubclass(NS.BaseC3s, eYo.c3s.BaseC3s))
      chai.expect(NS.BaseC3s[eYo.$].ns).equal(NS)
    })
    it (`eYo.c3s.newC3s(NS, 'BaseC3s')`, function () {
      var NS = eYo.c3s.newNS()
      chai.expect(NS.BaseC3s).equal(eYo.c3s.BaseC3s)
      chai.assert(!NS.BaseC3s[eYo.$SuperC3s_p])
      eYo.c3s.newC3s(NS, 'BaseC3s')
      chai.assert(NS.BaseC3s !== eYo.c3s.BaseC3s)
      chai.expect(NS.BaseC3s[eYo.$SuperC3s_p]).equal(eYo.c3s.BaseC3s_p)
    })
    it (`NS.makeBaseC3s()`, function () {
      chai.expect(eYo.c3s).property('BaseC3s')
      var NS = eYo.c3s.newNS()
      chai.expect(NS.BaseC3s).equal(eYo.c3s.BaseC3s)
      NS.makeBaseC3s()
      chai.expect(NS.BaseC3s).not.equal(eYo.c3s.BaseC3s)
      chai.expect(NS.BaseC3s[eYo.$].ns).equal(NS)
      var NS = eYo.c3s.newNS()
      Object.defineProperty(NS, 'BaseC3s', {
        value: 421
      })
      chai.expect(() => NS.makeBaseC3s()).to.xthrow()
      chai.expect(eYo.c3s.newC3s(NS)[eYo.$].id).equal('eYo.c3s.?')
      chai.expect(NS).property('BaseC3s')
      chai.expect(() => eYo.c3s.newC3s(NS, 'BaseC3s')).to.xthrow()
      chai.expect(() => NS.newC3s('BaseC3s')).to.xthrow()
    })
    it(`NS.makeBaseC3s({...})`, function () {
      var NS = eYo.c3s.newNS()
      chai.expect(NS.BaseC3s).equal(eYo.c3s.BaseC3s)
      let model = {}
      NS.makeBaseC3s(model)
      chai.expect(NS.BaseC3s[eYo.$].model).equal(model)
    })
    it(`eYo.c3s.newC3s('A', eYo.c3s.BaseC3s)`, function () {
      let NS = eYo.c3s.newNS()
      let C3s = NS.newC3s('A', eYo.c3s.BaseC3s)
      chai.assert(eYo.isSubclass(NS.A, eYo.c3s.BaseC3s))
      chai.expect(C3s).equal(C3s[eYo.$].C3s)
      chai.expect(C3s.prototype).equal(C3s[eYo.$].C3s_p)
      chai.expect(eYo.c3s.BaseC3s).equal(C3s[eYo.$].C3s_S)
      chai.expect(eYo.c3s.BaseC3s_p).equal(C3s[eYo.$].C3s_s)
    })
    it (`eYo.c3s.newC3s(NS, 'A', ...)`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      let C3s = eYo.c3s.newC3s(NS, 'A')
      chai.expect(NS.A_s).equal(eYo.c3s.BaseC3s_p)
      chai.expect(()=>{ eYo.c3s.newC3s(NS, 'A') }).to.xthrow() // Already existing attribute
      chai.expect(eYo.isSubclass(C3s, eYo.c3s.BaseC3s)).true
      chai.expect(eYo.isSubclass(C3s, NS.BaseC3s)).false
    })
    it (`eYo.c3s.newC3s(NS, 'A', Super, model)`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      var Super = NS.BaseC3s
      eYo.c3s.newC3s(NS, 'A', Super, {
        prepare (x) {
          eYo.flag.push(x)
        }
      })
      chai.assert(NS.A)
      chai.assert(eYo.isSubclass(NS.A, NS.BaseC3s))
      chai.expect(NS.A_s).equal(NS.BaseC3s_p)
      NS.A[eYo.$].finalizeC3s()
      new NS.A(1)
      eYo.flag.expect(1)
    })
    it (`eYo.c3s.newC3s('_A')`, function () {
      if (!eYo._A) {
        var A = eYo.c3s.newC3s('_A')
        chai.assert(A)
        chai.assert(!A.constructor[eYo.$SuperC3s_p])
        chai.assert(eYo.isF(A[eYo.$newSubC3s]))
      }
    })
    it (`NO eYo.c3s.newC3s('_A')`, function () {
      if (eYo._A) {
        chai.expect(() => {eYo.c3s.newC3s('_A')}).to.xthrow()
      }
    })
    it (`NS.newC3s('A')`, function () {
      var NS = eYo.c3s.newNS()
      NS.newC3s('A')
      chai.assert(eYo.isF(NS.A))
      chai.assert(NS.A[eYo.$].name.endsWith('.A'))
      chai.expect(NS.A[eYo.$].ns).equal(NS)
      chai.expect(NS.A_p).equal(NS.A.prototype)
      chai.expect(NS.A_s).equal(NS.BaseC3s_p)
    })
    it ('newC3s: constructor call', function () {
      var NS = eYo.c3s.newNS()
      eYo.c3s.newC3s(NS, 'A', null, {
        prepare (x) {
          eYo.flag.push(x)
        }
      })
      NS.A[eYo.$].finalizeC3s()
      var a = new NS.A(1)
      eYo.flag.expect(1)
      a = new NS.A(2)
      eYo.flag.expect(2)
    })
    it ('newC3s: super !== null', function () {
      var NS = eYo.c3s.newNS()
      eYo.c3s.newC3s(NS, 'A', {
        prepare (x) {
          eYo.flag.push(x)
        },
      })
      chai.assert(NS.A[eYo.$] instanceof eYo.c3s.BaseC3s[eYo.$].constructor)
      NS.A[eYo.$].finalizeC3s()
      new NS.A(1)
      eYo.flag.expect(1)
      NS.newC3s('AB', NS.A, {
        prepare (x) {
          eYo.flag.push(x+1)
        },
      })
      chai.assert(NS.AB)
      chai.assert(NS.AB[eYo.$] instanceof eYo.c3s.BaseC3s[eYo.$].constructor)
      NS.AB[eYo.$].finalizeC3s()
      new NS.AB(2)
      eYo.flag.expect(23)
    })  
    it ('newC3s: multi super !== null', function () {
      var NS = eYo.c3s.newNS()
      flag.reset()
      eYo.c3s.newC3s(NS, 'A', {
        prepare (x) {
          eYo.flag.push(x)
        },
      })
      eYo.c3s.newC3s(NS, 'B', {
        prepare (x) {
          eYo.flag.push(x+1)
        },
      })
      eYo.c3s.newC3s(NS, 'AA', NS.A, {
        prepare (x) {
          eYo.flag.push(x+2)
        },
      })
      eYo.c3s.newC3s(NS, 'AB', NS.A, {
        prepare (x) {
          eYo.flag.push(x+3)
        },
      })
      eYo.c3s.newC3s(NS, 'BA', NS.B, {
        prepare (x) {
          eYo.flag.push(x+4)
        },
      })
      eYo.c3s.newC3s(NS, 'BB', NS.B, {
        prepare (x) {
          eYo.flag.push(x+5)
        },
      })
      NS.A[eYo.$].finalizeC3s()
      NS.B[eYo.$].finalizeC3s()
      NS.AA[eYo.$].finalizeC3s()
      NS.AB[eYo.$].finalizeC3s()
      NS.BA[eYo.$].finalizeC3s()
      NS.BB[eYo.$].finalizeC3s()
      new NS.AA(1)
      eYo.flag.expect(13)
      new NS.AB(2)
      eYo.flag.expect(25)
      new NS.BA(2)
      eYo.flag.expect(36)
      new NS.BB(3)
      eYo.flag.expect(48)
    })
    it ('newC3s: undefined owner or super', function () {
      var NS = eYo.c3s.newNS()
      flag.reset()
      eYo.c3s.newC3s(NS, 'A', null, {
        prepare (x) {
          eYo.flag.push(x)
        }
      })
      eYo.c3s.newC3s(NS, 'AB', NS.A, {
        prepare (x) {
          eYo.flag.push(x+1)
        },
      })
      chai.expect(NS.AB_s.constructor).equal(NS.A)
      NS.A[eYo.$].finalizeC3s()
      NS.AB[eYo.$].finalizeC3s()
      new NS.AB(1)
      eYo.flag.expect(12)
    })
    it ('newC3s: dispose', function () {
      var NS = eYo.c3s.newNS()
      flag.reset()
      eYo.c3s.newC3s(NS, 'A', null, {
        dispose(...$) {
          eYo.flag.push('A', ...$)
        }
      })
      NS.A[eYo.$].finalizeC3s()
      new NS.A().dispose(1, 2)
      eYo.flag.expect('A12')
      eYo.c3s.newC3s(NS, 'AB', NS.A, {
        dispose(...$) {
          eYo.flag.push('AB', ...$)
        }
      })
      NS.AB[eYo.$].finalizeC3s()
      new NS.AB().dispose(1, 2)
      eYo.flag.expect('AB12A12')
    })
    var testX = (X, Super, Dlgt_p) => {
      chai.assert(X)
      chai.assert(eYo.isSubclass(X, Super))
      chai.assert(X[eYo.$])
      chai.assert(!Super || X[eYo.$].$super === Super[eYo.$])
      chai.assert(!Super || X[eYo.$SuperC3s_p] === Super.prototype)
      chai.assert(!Super || X[eYo.$SuperC3s_p].constructor === Super)
      chai.assert(!Dlgt_p || eYo.isSubclass(X[eYo.$].constructor, Dlgt_p.constructor))
      chai.expect(() => {
        new X()
      }).not.to.xthrow()
    }
    it (`eYo.c3s.newC3s('...')`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      eYo.c3s.newC3s(NS, 'A')
      testX(NS.A, eYo.c3s.BaseC3s, eYo.c3s.Dlgt_p)
    })
    it (`eYo.c3s.newC3s('...', {...})`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      eYo.c3s.newC3s(NS, 'A', {
        prepare () {
          eYo.flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC3s()
      testX(NS.A, eYo.c3s.BaseC3s, eYo.c3s.Dlgt_p)
      eYo.flag.expect(1)
    })
    it (`eYo.c3s.newC3s(NS, '...')`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      eYo.c3s.newC3s(NS, 'A')
      NS.A[eYo.$].finalizeC3s()
      testX(NS.A, eYo.c3s.BaseC3s, eYo.c3s.Dlgt_p)
    })
    it (`eYo.c3s.newC3s(NS, '...', {...})`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      eYo.c3s.newC3s(NS, 'A', {
        prepare () {
          eYo.flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC3s()
      testX(NS.A, eYo.c3s.BaseC3s, eYo.c3s.Dlgt_p)
      eYo.flag.expect(1)
    })
    it (`eYo.c3s.newC3s('...', Super = eYo.c3s.BaseC3s)`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      eYo.c3s.newC3s(NS, 'A', NS.BaseC3s)
      NS.A[eYo.$].finalizeC3s()
      testX(NS.A, NS.BaseC3s, eYo.c3s.Dlgt_p)
    })
    it (`eYo.c3s.newC3s('...', Super = eYo.c3s.BaseC3s, {...})`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      NS.newC3s('A', {
        prepare () {
          eYo.flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC3s()
      testX(NS.A, NS.BaseC3s, NS.Dlgt_p)
      eYo.flag.expect(1)
    })
    it (`eYo.c3s.newC3s(NS, '...', Super = eYo.c3s.BaseC3s, {...})`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      eYo.c3s.newC3s(NS, 'A', eYo.c3s.BaseC3s, {
        prepare () {
          eYo.flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC3s()
      testX(NS.A, eYo.c3s.BaseC3s, eYo.c3s.Dlgt_p)
      eYo.flag.expect(1)
    })
    it (`eYo.c3s.newC3s('...', eYo.c3s.BaseC3s, {...}?)`, function () {
      var Super = eYo.c3s.BaseC3s
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      eYo.c3s.newC3s(NS, 'A', Super)
      NS.A[eYo.$].finalizeC3s()
      chai.expect(NS.A[eYo.$].$super).equal(Super[eYo.$])
      testX(NS.A, eYo.c3s.BaseC3s, eYo.c3s.Dlgt_p)
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      chai.expect(NS.Dlgt_p).equal(NS.Dlgt_p)
      testX(NS.BaseC3s, eYo.c3s.BaseC3s, NS.Dlgt_p)
      flag.reset()
      eYo.c3s.newC3s(NS, 'A', NS.BaseC3s, {
        prepare () {
          eYo.flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC3s()
      testX(NS.A, NS.BaseC3s, eYo.c3s.Dlgt_p)
      eYo.flag.expect(1)
    })
    it (`eYo.c3s.newC3s('...', Super = eYo.c3s.BaseC3s, {...})`, function () {
      var A = eYo.c3s.newC3s('___A', eYo.c3s.BaseC3s, {
        prepare () {
          eYo.flag.push(1)
        }
      })
      chai.assert(A)
      chai.assert(A[eYo.$])
      chai.expect(A[eYo.$].$super).equal(eYo.c3s.BaseC3s[eYo.$])
      chai.expect(A[eYo.$SuperC3s_p]).equal(eYo.c3s.BaseC3s_p)
      chai.expect(A[eYo.$SuperC3s_p].constructor).equal(eYo.c3s.BaseC3s)
      A[eYo.$].finalizeC3s()
      new A()
      eYo.flag.expect(1)
    })
    it (`eYo.c3s.newC3s(NS, '...', Super = eYo.c3s.BaseC3s)`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      eYo.c3s.newC3s(NS, 'A', eYo.c3s.BaseC3s)
      NS.A[eYo.$].finalizeC3s()
      testX(NS.A, eYo.c3s.BaseC3s, eYo.c3s.Dlgt_p)
    })
    it (`eYo.c3s.newC3s(NS, '...', Super = eYo.c3s.BaseC3s, {...})`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      eYo.c3s.newC3s(NS, 'A', eYo.c3s.BaseC3s, {
        prepare () {
          eYo.flag.push(1)
        }
      })
      NS.A[eYo.$].finalizeC3s()
      testX(NS.A, eYo.c3s.BaseC3s)
      eYo.flag.expect(1)
    })
    it (`?eYo.c3s.newC3s(NS, '...', Super, Dlgt, {...})`, function () {
      var NS = eYo.c3s.newNS()
      NS.makeBaseC3s()
      eYo.c3s.newC3s(NS, 'A', {
        prepare () {
          eYo.flag.push(1)
        }
      })
      eYo.c3s.newC3s(NS, 'AB', NS.A, {
        prepare () {
          eYo.flag.push(2)
        }
      })
      chai.expect(NS.AB[eYo.$].$super).equal(NS.A[eYo.$])
      chai.expect(NS.A[eYo.$].$super).equal(eYo.c3s.BaseC3s[eYo.$])
      NS.A[eYo.$].finalizeC3s()
      NS.AB[eYo.$].finalizeC3s()
      new NS.AB()
      eYo.flag.expect(12)
    })
  })
  it ('C3s: eyo setter', function () {
    var NS = eYo.c3s.newNS()
    eYo.c3s.newC3s(NS, 'A', null, {})
    chai.assert(eYo.isSubclass(NS.A[eYo.$].constructor, eYo.dlgt.BaseC3s))
    chai.expect(() => {
      NS.A[eYo.$] = null
    }).to.xthrow()
    chai.expect(() => {
      NS.A[eYo.$] = null
    }).to.xthrow()
  })
  it ('C3s: dlgt key', function () {
    var NS = eYo.c3s.newNS()
    eYo.c3s.newC3s(NS, 'A', {
      [eYo.$] () {
        eYo.flag.push(1)
      },
      prepare() {
        eYo.flag.push(2)
      }
    })
    eYo.flag.expect(1)
    chai.assert(NS.A[eYo.$newSubC3s])
    NS.A[eYo.$newSubC3s]('AB', {})
    eYo.flag.expect(1)
  })
  it ('makeBaseC3s({...})', function () {
    var NS = eYo.c3s.newNS()
    NS.makeBaseC3s()
    chai.expect(NS.BaseC3s[eYo.$].model).eql({})
    let model = {
      foo: 421,
    }
    NS = eYo.c3s.newNS()
    NS.makeBaseC3s(model)
    chai.expect(NS.BaseC3s[eYo.$].model).equal(model)
    flag.reset()
    model.prepare = function () {
      eYo.flag.push(1)
      chai.expect(this.model).equal(model)
    }
    NS = eYo.c3s.newNS()
    NS.makeBaseC3s(model)
    new NS.BaseC3s()
    eYo.flag.expect(1)
  })
  it ('naming', function () {
    var seed = eYo.genUID(eYo.IDENT)
    var k = 'x' + seed
    var K = 'X' + seed
    let NS = eYo.c3s.newNS(eYo, k)
    chai.expect(NS.name).equal(`eYo.${k}`)
    NS.makeBaseC3s({})
    chai.expect(NS.BaseC3s[eYo.$].name.endsWith(`.${K}`)).true
  })
})
