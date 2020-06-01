describe ('POC', function () {
  it ('Dlgt infinite loop', function () {
    let AutoDlgt = function (ns, key, Dlgt, model) {
      Object.defineProperties(this, {
        ns: { value: eYo.isNS(ns) ? ns : eYo.NA },
        key__: {value: key},
        C9r__: { value: Dlgt },
        model__: { value: model },
      })
      let $this = this
      Object.defineProperties(Dlgt, {
        [eYo.$]: eYo.descriptorR(function () {
          return $this
        }),
        [eYo.$_p]: eYo.descriptorR(function () {
          return $this._p
        }),
      })  
    }
    let d = eYo.descriptorR(function () {
      return this.constructor[eYo.$]
    })
    Object.defineProperties(AutoDlgt.prototype, {
      [eYo.$]: d,
    })
    let Dlgt = function (ns, key, Dlgt, model) {
      AutoDlgt.call(this, ns, key, Dlgt, model)
    } // DlgtDlgt will never change and does not need to be suclassed
    eYo.inherits(Dlgt, AutoDlgt)
    var dlgt = new AutoDlgt(eYo.c9r, 'Dlgt', Dlgt, {})
    let auto = new AutoDlgt(eYo.c9r, 'Dlgt…', AutoDlgt, {})
    chai.expect(dlgt).equal(Dlgt[eYo.$])
    chai.expect(dlgt).equal(Dlgt[eYo.$])
    chai.expect(dlgt).equal(Dlgt[eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$][eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$][eYo.$])
    chai.expect(auto).equal(AutoDlgt[eYo.$][eYo.$][eYo.$])
  })
})
describe ('Tests: Dlgt', function () {
  this.timeout(20000)
  var flag
  beforeEach (function() {
    flag = new eYo.test.Flag()
  })
  it ('Dlgt: Basic', function () {
    chai.assert(eYo.dlgt)
  })
  it ('Dlgt: Base', function () {
    chai.expect(eYo.dlgt.BaseC9r).property(eYo.$)
    var set = new Set([
      eYo.dlgt.BaseC9r[eYo.$],
      eYo.dlgt.BaseC9r[eYo.$][eYo.$],
      eYo.dlgt.BaseC9r[eYo.$][eYo.$][eYo.$],
    ])
    chai.expect(set.size).equal(1)
    chai.expect(eYo.dlgt.BaseC9r[eYo.$] instanceof eYo.dlgt.BaseC9r).true
  })
  it ('Dlgt: new', function () {
    chai.assert(eYo.dlgt.new)
    let C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', C9r, {})
    chai.expect(dlgt).not.undefined
    chai.expect(dlgt.constructor).not.equal(eYo.dlgt.BaseC9r)
    chai.expect(C9r[eYo.$]).equal(dlgt)
    chai.expect(C9r).equal(dlgt.C9r)
    chai.expect(C9r.prototype).equal(dlgt.C9r_p)
    chai.expect(() => {
      eYo.dlgt.new('Foo', C9r, {})
    }).throw()
  })
  it ('Dlgt: new C9r()', function () {
    chai.assert(eYo.dlgt.new)
    let C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', C9r, {})
    let o = new C9r()
    eYo.dlgt.declareDlgt(C9r.prototype)
    chai.expect(o.eyo).equal(dlgt)
  })
  it ('Dlgt subclass', function () {
    chai.assert(eYo.dlgt.new)
    let SuperC9r = function () {}
    let superDlgt = eYo.dlgt.new('Foo', SuperC9r, {})
    let C9r = function () {}
    eYo.inherits(C9r, SuperC9r)
    let dlgt = eYo.dlgt.new('Foo', C9r, {})
    chai.expect(dlgt).not.undefined
    chai.expect(dlgt.constructor).not.equal(eYo.dlgt.BaseC9r)
    chai.expect(dlgt.constructor).not.equal(superDlgt)
    chai.expect(dlgt instanceof superDlgt.constructor)
    chai.expect(dlgt.super).equal(superDlgt)
    chai.expect(SuperC9r).equal(dlgt.C9r_S)
    chai.expect(SuperC9r.prototype).equal(dlgt.C9r_s)
    chai.expect(superDlgt).equal(dlgt.super)
    superDlgt
  })
  it ('Dlgt methodsMerge', function () {
    let C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', C9r, {})
    chai.expect(dlgt.model.bar).undefined
    flag.reset()
    dlgt.methodsMerge({
      bar () {
        flag.push(1)
      },
    })
    chai.expect(dlgt.C9r_p).property('bar')
    dlgt.C9r_p.bar()
    flag.expect(1)
  })
  it ('Dlgt modelMerge', function () {
    let C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', C9r, {})
    chai.expect(dlgt.model.bar).undefined
    flag.reset()
    dlgt.modelMerge({
      methods: {
        bar () {
          flag.push(1)
        },
      },
    })
    chai.expect(dlgt.C9r_p).property('bar')
    dlgt.C9r_p.bar()
    flag.expect(1)
  })
  it ('Dlgt finalizeC9r', function () {
    let C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', C9r, {})
    chai.expect(!!dlgt.hasFinalizedC9r).false
    dlgt.finalizeC9r()
    chai.expect(dlgt.hasFinalizedC9r).true
    chai.assert(C9r.prototype.init)
    chai.assert(C9r.prototype.dispose)
    chai.expect(() => {
      dlgt.finalizeC9r()
    }).throw()
  })
  it ('Dlgt finalizeC9r inherited', function () {
    let SuperC9r = function () {}
    let superDlgt = eYo.dlgt.new('Foo', SuperC9r, {})
    var C9r = function () {}
    eYo.inherits(C9r, SuperC9r)
    let dlgt = eYo.dlgt.new('Bar', C9r, {})
    chai.expect(!!superDlgt.hasFinalizedC9r).false
    chai.expect(!!dlgt.hasFinalizedC9r).false
    chai.expect(() => {
      dlgt.finalizeC9r()
    }).throw()
    superDlgt.finalizeC9r()
    chai.expect(superDlgt.hasFinalizedC9r).true
    dlgt.finalizeC9r()
    chai.expect(dlgt.hasFinalizedC9r).true
  })
  it ('Dlgt methodsMerge - overriden', function () {
    let C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', C9r, {})
    chai.expect(dlgt.model.bar).undefined
    flag.reset()
    dlgt.methodsMerge({
      foo () {
        flag.push(1)
      },
    })
    dlgt.methodsMerge({
      foo (overriden) {
        return function () {
          overriden()
          flag.push(2)
        }
      },
    })
    dlgt.C9r_p.foo()
    flag.expect(12)
  })
  it ('Dlgt: subC9rs...', function () {
    let SuperC9r = function () {}
    let superDlgt = eYo.dlgt.new('Foo', SuperC9r, {})
    var C9r = function () {}
    eYo.inherits(C9r, SuperC9r)
    let dlgt = eYo.dlgt.new('Bar', C9r, {})
    flag.reset()
    superDlgt._p.do_it = (x) => {
      flag.push(x+1)
    }
    superDlgt.forEachSubC9r(C9r => {
      C9r[eYo.$].do_it && C9r[eYo.$].do_it(1)
    })
    flag.expect(2)
    var C9r = function () {}
    eYo.inherits(C9r, SuperC9r)
    eYo.dlgt.new('Bar', C9r, {})
    superDlgt.forEachSubC9r(C9r => {
      C9r[eYo.$].do_it && C9r[eYo.$].do_it(2)
    })
    flag.expect(33)
    dlgt._p.do_it = (x) => {
      flag.push(x+2)
      return x+3
    }
    superDlgt.forEachSubC9r(C9r => {
      C9r[eYo.$].do_it && C9r[eYo.$].do_it(3)
    })
    flag.expect([45,54])
    flag.reset()
    chai.expect(superDlgt.someSubC9r(C9r => {
      return C9r[eYo.$].do_it && C9r[eYo.$].do_it(3)
    })).equal(6)
    flag.expect([5,45])
  })
  it (`C9r_(s|p)_(up|down)`, function () {
    let SuperC9r = function () {}
    let superDlgt = eYo.dlgt.new('Foo', SuperC9r, {})
    let C9r = function () {}
    eYo.inherits(C9r, SuperC9r)
    let dlgt = eYo.dlgt.new('Chi', C9r, {})
    let ChildC9r = function () {}
    eYo.inherits(ChildC9r, C9r)
    let childDlgt = eYo.dlgt.new('Mi', ChildC9r, {})
    chai.expect(superDlgt.C9r_s_up).eql([])
    chai.expect(superDlgt.C9r_s_down).eql([])
    chai.expect(superDlgt.C9r_p_up).eql([SuperC9r.prototype])
    chai.expect(superDlgt.C9r_p_down).eql([SuperC9r.prototype])
    chai.expect(dlgt.C9r_s_up).eql([SuperC9r.prototype])
    chai.expect(dlgt.C9r_s_down).eql([SuperC9r.prototype])
    chai.expect(dlgt.C9r_p_up).eql([C9r.prototype, SuperC9r.prototype])
    chai.expect(dlgt.C9r_p_down).eql([SuperC9r.prototype, C9r.prototype])
    chai.expect(childDlgt.C9r_s_up).eql([C9r.prototype, SuperC9r.prototype])
    chai.expect(childDlgt.C9r_s_down).eql([SuperC9r.prototype, C9r.prototype])
    chai.expect(childDlgt.C9r_p_up).eql([ChildC9r.prototype, C9r.prototype, SuperC9r.prototype])
    chai.expect(childDlgt.C9r_p_down).eql([SuperC9r.prototype, C9r.prototype, ChildC9r.prototype])
  })
})
