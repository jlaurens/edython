describe ('POC', function () {
  it ('Dlgt infinite loop', function () {
    let AutoDlgt = function (ns, key, Dlgt, model) {
      Object.defineProperties(this, {
        ns: { value: eYo.isNS(ns) ? ns : eYo.NA },
        key__: {value: key},
        C9r__: { value: Dlgt },
        model__: { value: model },
      })
      Dlgt.eyo__ = this
      let d = eYo.descriptorR(function () {
        return this.eyo__
      })
      Object.defineProperties(Dlgt, {
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
    let Dlgt = function (ns, key, Dlgt, model) {
      AutoDlgt.call(this, ns, key, Dlgt, model)
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
})
describe ('Tests: Dlgt', function () {
  this.timeout(10000)
  let flag = {
    v: '',
    reset (what) {
      this.v = what && what.toString() || ''
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v += what.toString())
      })
      return this.v
    },
    expect (what) {
      if (eYo.isRA(what)) {
        what = what.map(x => x.toString())
        var ans = chai.expect(what).include(this.v || '0')
      } else {
        ans = chai.expect(what.toString()).equal(this.v || '0')
      }
      this.reset()
      return ans
    },
  }
  it ('Dlgt: Basic', function () {
    chai.assert(eYo.dlgt)
  })
  it ('Dlgt: Base', function () {
    chai.expect(eYo.dlgt.BaseC9r).not.undefined
    chai.expect(eYo.dlgt.BaseC9r.eyo).not.undefined
    var set = new Set([
      eYo.dlgt.BaseC9r.eyo,
      eYo.dlgt.BaseC9r.eyo.eyo,
      eYo.dlgt.BaseC9r.eyo.eyo.eyo,
    ])
    chai.expect(set.size).equal(1)
    chai.expect(eYo.dlgt.BaseC9r.eyo instanceof eYo.dlgt.BaseC9r).true
  })
  it ('Dlgt: new', function () {
    chai.assert(eYo.dlgt.new)
    let C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', C9r, {})
    chai.expect(dlgt).not.undefined
    chai.expect(dlgt.constructor).not.equal(eYo.dlgt.BaseC9r)
    chai.expect(C9r.eyo).equal(dlgt)
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
    chai.expect(dlgt.C9r_p.bar).not.undefined
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
    chai.expect(dlgt.C9r_p.bar).not.undefined
    dlgt.C9r_p.bar()
    flag.expect(1)
  })
  it ('Dlgt finalizeC9r', function () {
    let C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', C9r, {})
    chai.expect(dlgt.shouldFinalizeC9r).true
    dlgt.finalizeC9r()
    chai.expect(dlgt.shouldFinalizeC9r).false
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
    chai.expect(superDlgt.shouldFinalizeC9r).true
    chai.expect(dlgt.shouldFinalizeC9r).true
    chai.expect(() => {
      dlgt.finalizeC9r()
    }).throw()
    superDlgt.finalizeC9r()
    chai.expect(superDlgt.shouldFinalizeC9r).false
    dlgt.finalizeC9r()
    chai.expect(dlgt.shouldFinalizeC9r).false
  })
  it ('Dlgt unfinalizeC9r', function () {
    let SuperC9r = function () {}
    let superDlgt = eYo.dlgt.new('Foo', SuperC9r, {})
    var C9r = function () {}
    eYo.inherits(C9r, SuperC9r)
    let dlgt = eYo.dlgt.new('Bar', C9r, {})
    superDlgt.finalizeC9r()
    dlgt.finalizeC9r()
    chai.expect(superDlgt.shouldFinalizeC9r).false
    chai.expect(dlgt.shouldFinalizeC9r).false
    superDlgt.unfinalizeC9r()
    chai.expect(superDlgt.shouldFinalizeC9r).true
    chai.expect(dlgt.shouldFinalizeC9r).true
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
      C9r.eyo.do_it && C9r.eyo.do_it(1)
    })
    flag.expect(2)
    var C9r = function () {}
    eYo.inherits(C9r, SuperC9r)
    eYo.dlgt.new('Bar', C9r, {})
    superDlgt.forEachSubC9r(C9r => {
      C9r.eyo.do_it && C9r.eyo.do_it(2)
    })
    flag.expect(33)
    dlgt._p.do_it = (x) => {
      flag.push(x+2)
      return x+3
    }
    superDlgt.forEachSubC9r(C9r => {
      C9r.eyo.do_it && C9r.eyo.do_it(3)
    })
    flag.expect([45,54])
    flag.reset()
    chai.expect(superDlgt.someSubC9r(C9r => {
      return C9r.eyo.do_it && C9r.eyo.do_it(3)
    })).equal(6)
    flag.expect([5,45])
  })
  it ('enhanceMany: Basics', function () {
    var C9r = function () {}
    let dlgt = eYo.dlgt.new('Foo', C9r, {})
    flag.reset()
    dlgt.enhanceMany('foo', 'bar', {})
    ;[
      // 'ModelMap_',
      'ModelByKey__',
      //'ModelMap',
      // 'Map',
      'Prepare',
      'Merge',
      'Init',
      'Dispose',
      'ForEach',
      'Some',
      // 'Head',
      // 'Tail',
    ].forEach(k => {
      chai.assert(dlgt._p['foo'+k])
    })
    chai.assert(dlgt.fooModelMap)
    let o = new C9r()
    eYo.dlgt.declareDlgt(C9r.prototype)
    dlgt.fooPrepare(o)
    chai.assert(o.fooMap)
    chai.expect(o.fooHead).undefined
    chai.expect(o.fooTail).undefined
  })
  it ('enhanceMany, one', function () {
    var C9r = function () {}
    let o = new C9r()
    let dlgt = eYo.dlgt.new('Foo', C9r, {
      bar: {
        a: 1,
      }
    })
    flag.reset()
    dlgt.enhanceMany('foo1', 'bar', {})
    chai.expect(() => {
      dlgt.foo1Prepare(o)
    }).throw()
    chai.expect(() => {
      dlgt.enhanceMany('foo1', 'bar', {})
    }).throw()
    dlgt.enhanceMany('foo2', 'bar', {
      make (model, k, object) {
        flag.push(model)
        return model+1
      }
    })
    dlgt.foo2Prepare(o)
    flag.expect(1)
    chai.expect(o.a_f).equal(2)
    chai.expect(o.foo2Head).equal(2)
    chai.expect(o.foo2Tail).equal(2)
    dlgt.enhanceMany('foo3', 'bar', {
      make (model, k, object) {
        flag.push(model)
        return model+1
      },
      suffix: '_ff',
    })
    dlgt.foo3Prepare(o)
    flag.expect(1)
    chai.expect(o.a_ff).equal(2)
    dlgt.enhanceMany('foo4', 'bar', {
      make (model, k, object) {
        flag.push(model)
        return model+1
      },
      makeShortcut (k, object, p) {
        let k_p = k + '__ff'
        Object.defineProperties(object, {
          [k_p]: eYo.descriptorR(function () {
            return p
          }),
        })
      },
    })
    dlgt.foo4Prepare(o)
    flag.expect(1)
    chai.expect(o.a__ff).equal(2)
    dlgt.enhanceMany('foo5', 'bar', {
      make (model, k, object) {
        flag.push(model)
        return model+1
      },
      suffix: '_f5',
    })
    o.a_f5 = 421
    chai.expect(() => {
      dlgt.foo5Prepare(o)
    }).throw()
  })
  it ('enhanceMany, many', function () {
    var C9r = function () {}
    let o = new C9r()
    let dlgt = eYo.dlgt.new('Foo', C9r, {
      bar: {
        a: 1,
        b: 2,
        c: 3,
      }
    })
    flag.reset()
    dlgt.enhanceMany('foo', 'bar', {
      make (model, k, object) {
        return {
          value: model
        }
      }
    })
    dlgt.fooPrepare(o)
    flag.push(o.a_f.value)
    flag.push(o.b_f.value)
    flag.push(o.c_f.value)
    flag.expect(123)
    chai.expect([1, 2, 3]).includes(o.fooHead.value)
    chai.expect([1, 2, 3]).includes(o.fooTail.value)
    chai.expect(!!o.fooHead.previous).false
    chai.expect(!!o.fooTail.next).false
    chai.expect(o.fooHead.next).equal(o.fooTail.previous)
    chai.expect(o.a_f).equal(o.fooMap.get('a'))
    chai.expect(o.b_f).equal(o.fooMap.get('b'))
    chai.expect(o.c_f).equal(o.fooMap.get('c'))
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
