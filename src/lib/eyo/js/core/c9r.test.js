'use strict';

const NS = Object.create(null)

NS.test_properties = (x, foo, bar) => {
  let foo_ = foo + '_'
  let bar_ = bar + '_'
  let foo_p = foo + '_p'
  let bar_p = bar + '_p'
  chai.assert(x[foo_p])
  chai.assert(x[bar_p])
  chai.assert(x[foo_] === eYo.NA && x[foo] === eYo.NA)
  chai.assert(x[foo_] === eYo.NA && x[foo] === eYo.NA)
  chai.assert(x[bar_] === eYo.NA && x[bar] === eYo.NA)
  x[foo_] = 421
  chai.assert(x[foo_] === 421 && x[foo] === 421)
  chai.assert(x[bar_] === eYo.NA && x[bar] === eYo.NA)
  x[bar_] = 123
  chai.assert(x[foo_] === 421 && x[foo] === 421)
  chai.assert(x[bar_] === 123 && x[bar] === 123)
  chai.expect(() => {x[bar] = 421}).to.throw()
  x[foo_] = x[bar_] = eYo.NA
  chai.assert(x[foo_] === eYo.NA && x[foo] === eYo.NA)
  chai.assert(x[bar_] === eYo.NA && x[bar] === eYo.NA)
}
describe ('POC', function () {
  this.timeout(10000)
  it ('Dlgt infinite loop', function () {
    let AutoDlgt = function (ns, key, C9r, model) {
      Object.defineProperties(this, {
        ns__: { value: eYo.isNS(ns) ? ns : eYo.NA },
        key__: {value: key},
        C9r__: { value: C9r },
        model__: { value: model },
      })
      C9r.eyo__ = this
      let d = eYo.c9r.descriptorR(function () {
        return this.eyo__
      })
      Object.defineProperties(C9r, {
        eyo: d,
        eyo_: d,
        eyo_p: eYo.c9r.descriptorR(function () {
          return this.eyo__._p
        }),
      })  
    }
    let d = eYo.c9r.descriptorR(function () {
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
    chai.assert(dlgt === Dlgt.eyo)
    chai.assert(dlgt === Dlgt.eyo_)
    chai.assert(dlgt === Dlgt.eyo__)
    chai.assert(auto === AutoDlgt.eyo)
    chai.assert(auto === AutoDlgt.eyo_)
    chai.assert(auto === AutoDlgt.eyo__)
    chai.assert(auto === AutoDlgt.eyo.eyo)
    chai.assert(auto === AutoDlgt.eyo_.eyo_)
    chai.assert(auto === AutoDlgt.eyo__.eyo__)
    chai.assert(auto === AutoDlgt.eyo.eyo.eyo)
    chai.assert(auto === AutoDlgt.eyo_.eyo_.eyo_)
    chai.assert(auto === AutoDlgt.eyo__.eyo__.eyo__)
  })
  it ('Change constructor', function () {
    let OYE = function () {}
    OYE.prototype.version = 421
    let oYe = new OYE()
    chai.assert(oYe.version === 421)
    let C9r = function () {}
    let c9r = new C9r()
    chai.assert(c9r.version === oYe.NA)
    Object.setPrototypeOf(c9r, OYE.prototype)
    chai.assert(c9r.version === 421)
    Object.setPrototypeOf(c9r, C9r.prototype)
    chai.assert(c9r.version === oYe.NA)
    let setConstructorOf = (object, C9r) => {
      object.constructor = C9r
      Object.setPrototypeOf(object, C9r.prototype)
    }
    setConstructorOf(oYe, C9r)
    chai.assert(oYe.version === oYe.NA)
    setConstructorOf(oYe, OYE)
    chai.assert(oYe.version === 421)
    C9r.prototype.test = 123
    chai.assert(c9r.test === 123)    
    chai.assert(c9r.version === oYe.NA)
    eYo.inherits(C9r, OYE)
    chai.assert(c9r.test === 123)
    chai.assert(c9r.version === 421)
    setConstructorOf(oYe, C9r)
    setConstructorOf(c9r, OYE)
    chai.assert(c9r.test === eYo.NA)
    chai.assert(c9r.version === 421)
    chai.assert(oYe.test === 123)
    chai.assert(oYe.version === 421)
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
    console.error(model.foo.toString())
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
    chai.assert(b.foo.pop() === 421)
  })
})
describe ('Tests: C9r', function () {
  this.timeout(10000)
  it ('C9r: basic', function () {
    chai.assert(eYo.makeNS)
    chai.assert(eYo.c9r.makeC9r)
    chai.assert(eYo.c9r.Dlgt)
    chai.assert(eYo.c9r.Dflt)
    chai.assert(eYo.c9r.Dlgt_p)
    chai.assert(eYo.c9r.Dflt_p)
    chai.assert(eYo.c9r.Dlgt.eyo)
    chai.assert(eYo.c9r.Dlgt.eyo.eyo)
    chai.assert(eYo.c9r.Dlgt.eyo.eyo.eyo === eYo.c9r.Dlgt.eyo.eyo)
  })
  describe('C9r: Model', function () {
    it('eYo.c9r.model.consolidate(…)', function () {
      var model = {
        properties: {
          drag: {
            get () {},
          },
        },
      }
      eYo.c9r.model.consolidate(model)
      chai.assert(eYo.isF(model.properties.drag.get))
      var model = {
        properties: {
          drag () {},
        },
      }
      eYo.c9r.model.consolidate(model)
      chai.assert(eYo.isF(model.properties.drag))
    })
  })
  describe('C9r: makeNS', function () {
    if ('makeNS: Basics', function () {
      var ns = eYo.c9r.makeNS()
      chai.assert(eYo.isNS(ns))
      chai.assert(eYo.isF(ns.Dlgt))
      chai.assert(eYo.isF(ns.Dflt))
      chai.assert(eYo.isSubclass(ns.Dflt, eYo.c9r.Dflt))
      chai.assert(eYo.isSubclass(ns.Dlgt, eYo.c9r.Dlgt))
      chai.assert(ns.Dlft.eyo.constructor === ns.Dlgt)
      chai.assert(ns.Dlgt.eyo.constructor === ns.Dlgt)  
    })
    it ('makeNS(...)', function () {
      var Foo = eYo.makeNS('___Foo')
      chai.assert(Foo && Foo === eYo.___Foo)
      chai.assert(Foo.makeNS)
      chai.assert(Foo.makeC9r)
      chai.assert(Foo.super === eYo)
      chai.assert(Foo.name === 'eYo.___Foo')
      var ns = eYo.c9r.makeNS()
      chai.assert(ns.makeNS)
      chai.assert(ns.makeC9r)
      chai.assert(ns.super === eYo.c9r)
      eYo.makeNS(ns, 'foo')
      chai.assert(ns.foo)
      chai.assert(ns.foo.makeNS)
      chai.assert(ns.foo.makeC9r)
      chai.assert(ns.foo.super === eYo)
      chai.assert(ns.foo.name.endsWith('.foo'))
    })
    it ('ns.makeNS(...)', function () {
      var ns = eYo.c9r.makeNS()
      chai.expect(() => { ns.makeNS() }).not.to.throw()
      ns.makeNS('foo')
      chai.assert(ns.foo)
      chai.assert(ns.foo.makeNS)
      chai.assert(ns.foo.makeC9r)
      chai.assert(ns.foo.super === ns)
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
  describe('C9r: makeC9r', function () {
    it ("ns.makeC9r('Dflt')", function () {
      var ns = eYo.c9r.makeNS()
      chai.assert(ns.Dflt === eYo.c9r.Dflt)
      ns.makeC9r('Dflt')
      chai.assert(ns.Dflt !== eYo.c9r.Dflt)
      chai.assert(eYo.isSubclass(ns.Dflt, eYo.c9r.Dflt))
      chai.assert(ns.Dflt.eyo.ns === ns)
    })
    it ("eYo.c9r.makeC9r(ns, 'Dflt')", function () {
      var ns = eYo.c9r.makeNS()
      chai.assert(ns.Dflt === eYo.c9r.Dflt)
      chai.assert(!ns.Dflt.SuperC9r_p)
      eYo.c9r.makeC9r(ns, 'Dflt')
      chai.assert(ns.Dflt !== eYo.c9r.Dflt)
      chai.assert(ns.Dflt.SuperC9r_p === eYo.c9r.Dflt_p)
    })
    it ("ns.makeDflt()", function () {
      chai.assert(eYo.c9r.Dflt)
      var ns = eYo.c9r.makeNS()
      chai.assert(ns.Dflt === eYo.c9r.Dflt)
      ns.makeDflt()
      chai.assert(ns.Dflt && ns.Dflt !== eYo.c9r.Dflt)
      chai.assert(ns.Dflt.eyo.ns === ns)
      var ns = eYo.c9r.makeNS()
      Object.defineProperty(ns, 'Dflt', {
        value: 421
      })
      chai.expect(() => { ns.makeDflt() }).to.throw()
      chai.expect(() => { eYo.c9r.makeC9r(ns) }).to.throw()
      chai.expect(() => { eYo.c9r.makeC9r(ns, 'Dflt') }).to.throw()
      chai.expect(() => { ns.makeC9r('Dflt') }).to.throw()
    })
    it('eYo.makeC9rDecorate', function () {
      return
      var ns0 = eYo.makeNS()
      ns0.makeDflt()
      ns0.makeC9r('A')
      ns0.makeDlgt('DlgtA')
      ns0.makeC9r('DfltA', ns0.DlgtA)
      var ns1 = ns0.makeNS()
      var nsX // the expected namespace
      var keyX // the expected namespace
      var SuperX // the expected Super
      var DlgtX // the expected Dlgt
      var modelX // the expected Dlgt
      var f = eYo.makeC9rDecorate(function (ns, key, Super, Dlgt, model) {
        var msg = `{ns: ${ns.name}, key: ${key}, Super: ${Super.eyo.name}, Dlgt: ${Dlgt.eyo.name}, model: ${model.foo_}}`
        chai.assert(ns === nsX, msg)
        chai.assert(key === keyX, msg)
        chai.assert(Super === SuperX, msg)
        chai.assert(Dlgt === DlgtX, msg)
        chai.assert(model === modelX, msg)
      })
      ;[eYo.NA, ns1].forEach(ns => {
        nsX = ns || eYo
        ;[eYo.NA, 'A', 'B'].forEach(key => {
          ;[eYo.NA, null, eYo.c9r.Dflt, ns0.Dflt, ns0.A, ns0.DfltA].forEach(Super => {
            keyX = key || Super && Super.eyo.key
            ;[eYo.NA, eYo.c9r.Dlgt, ns0.Dlgt, ns0.DlgtA].forEach(Dlgt => {
              DlgtX = eYo.c9r.DlgtX
              eYo.isSubclass(nsX.Dlgt, DlgtX) && (DlgtX = nsX.Dlgt)
              Super && eYo.isSubclass(Super.eyo.constructor, DlgtX) && (DlgtX = Super.eyo.constructor)
              ;[eYo.NA, {foo: 'bar'}].forEach(model => {
                modelX = model || {}
                var args = [ns, key, Super, Dlgt, model].filter(x => !eYo.isNA(x))
                if (['Dflt', 'Dlgt'].includes(keyX)) {
                  chai.expect(() => {
                    f.apply(eYo, args)
                  }).to.throw()
                } else if (!keyX || eYo.hasOwnProperty(nsX, keyX)) {
                  chai.expect(() => {
                    f.apply(eYo, args)
                  }).to.throw()
                } else {
                  chai.expect(() => {
                    f.apply(eYo, args)
                  }).not.to.throw()
                }
              })              
            })              
          })
        })
      })
    })
    it ("eYo.c9r.makeC9r(ns, 'A')", function () {
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      chai.expect(()=>{ eYo.c9r.makeC9r() }).to.throw()
      eYo.c9r.makeC9r(ns, 'A')
      chai.assert(ns.A_s === eYo.c9r.Dflt_p)
      chai.expect(()=>{ eYo.c9r.makeC9r(ns, 'A') }).to.throw() // missing model
    })
    it ("eYo.c9r.makeC9r(ns, 'A', Super, model)", function () {
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      var Super = ns.Dflt
      eYo.c9r.makeC9r(ns, 'A', Super, {
        init (x) {
          flag += x
        }
      })
      chai.assert(ns.A)
      chai.assert(eYo.isSubclass(ns.A, ns.Dflt))
      chai.assert(ns.A_s === ns.Dflt_p)
      var flag = 0
      new ns.A(123)
      chai.assert(flag === 123)
    })
    it ("eYo.c9r.makeC9r('_A')", function () {
      if (!eYo._A) {
        var A = eYo.c9r.makeC9r('_A')
        chai.assert(A)
        chai.assert(!A.constructor.SuperC9r_p)
        chai.assert(eYo.isF(A.makeInheritedC9r))
      }
    })
    it ("NO eYo.c9r.makeC9r('_A')", function () {
      if (eYo._A) {
        chai.expect(() => {eYo.c9r.makeC9r('_A')}).to.throw()
      }
    })
    it ("ns.makeC9r('A')", function () {
      var ns = eYo.c9r.makeNS()
      ns.makeC9r('A')
      chai.assert(eYo.isF(ns.A))
      chai.assert(ns.A.eyo.name.endsWith('.A'))
      chai.assert(ns.A.eyo.ns === ns)
      chai.assert(ns.A_p === ns.A.prototype)
      chai.assert(ns.A_s === ns.Dflt_p)
    })
    it ('makeC9rDecorate', function () {
      return
      var n = 0
      var getKey = () => {
        ++n
        return `A_${n}`
      }
      var getArgs = (ns, Super, Dlgt, withModel) => {
        // console.warn('makeC9r:', [ns && ns.k__ || 'NA', "'A'", Super && Super.k__ || 'NA', Dlgt && Dlgt.k__ || 'NA', withModel ? 'model' : 'NA'])
        var args = []
        ns && args.push(ns)
        args.push(getKey())
        Super && args.push(Super)
        Dlgt && args.push(Dlgt)
        withModel && args.push(model(421))
        return args
      }
      var ns0 = eYo.makeNS()
      ns0.makeDflt()
      ns0.Dlgt.makeInheritedC9r('Dlgt0')
      ns0.makeC9r('Super0', ns0.Dlgt0)
      var ns1 = ns0.makeNS()
      ns1.makeDflt()
      ns1.Dlgt.makeInheritedC9r('Dlgt1')
      ns1.makeC9r('Super1', ns1.Dlgt1)
      var A_X, SuperX, DlgtX, modelX
      ;[eYo.NA, ns0, ns1].forEach(ns => {
        ;[eYo.NA, 'A'].forEach(key => {
          ;[eYo.NA, ns0.Dflt, ns0.Super0, ns1.Dflt, ns1.Super1].forEach(Super => {
            ;[eYo.NA, ns0.Dlgt, ns0.Dlgt0, ns1.Dlgt, ns1.Dlgt1].forEach(Dlgt => {
              DlgtX = getDlgtX(SuperX, Dlgt)
              ;[false, true].forEach(withModel => {
                var args = getArgs(ns, Super, Dlgt, withModel)
                eYo.makeC9rDecorate((nsX, keyX, SuperX, DlgtX, modelX) => {
                  console.warn(`ns: ${ns && ns.name}, key: ${key}, Super: ${Super && Super.eyo.name}, Dlgt: ${Dlgt && Dlgt.eyo.name}, model: ${model}`)
                  console.warn(`nsX: ${nsX.name}, keyX: ${keyX}, SuperX: ${SuperX && SuperX.eyo.name}, DlgtX: ${DlgtX.eyo.name}, modelX: ${modelX}`)
                }).apply(null, args)
              })
            })
          })
        })
      })
    })
    it ("eYo...makeInheritedC9r('AB')", function () {
      var ns = eYo.c9r.makeNS()
      var A = ns.makeC9r('A')
      var AB = A.makeInheritedC9r('AB')
      chai.assert(AB)
      chai.assert(AB.prototype.constructor === AB)
    })
    it ("ns.A.makeInheritedC9r('AB')", function () {
      var ns = eYo.c9r.makeNS()
      ns.makeC9r('A')
      ns.A.makeInheritedC9r('AB')
      chai.assert(eYo.isF(ns.AB))
      chai.assert(ns.AB.eyo.name.endsWith('.AB'))
      chai.assert(ns.AB.eyo.ns === ns)
      chai.assert(ns.AB_p === ns.AB.prototype)
      chai.assert(ns.AB_s === ns.A.prototype)
      chai.assert(eYo.isSubclass(ns.AB, ns.A))
      chai.assert(eYo.isSubclass(ns.AB.eyo.constructor, ns.A.eyo.constructor))
    })
  })
})
describe('c9r.model', function () {
  this.timeout(10000); 
  it ('C9r.Model: POC', function () {
    chai.assert(XRegExp.match('abc', /abc/))
    var x = {
      ['abc']: ''
    }
    for (var k in x) {
      chai.assert(XRegExp.match('abc', XRegExp(k)))
      chai.assert(XRegExp(k).test('abc'))
    }
  })
  it ('eYo.c9r.model.isAllowed(path, k)', function () {
    chai.assert(eYo.c9r.model.isAllowed('', 'init'))
    chai.assert(eYo.c9r.model.isAllowed('properties', 'abc'))
    chai.assert(eYo.c9r.model.isAllowed('properties.abc', 'validate'))
  })
  it ('Inheritance 1', function () {
    var base = {init: 421}
    var model = {}
    eYo.c9r.model.extends(model, base)
    chai.assert(model.init === 421)
  })
  it ('Inheritance 2', function () {
    var base = {xml: {attr: 421}}
    var model = {}
    eYo.c9r.model.extends(model, base)
    chai.assert(model.xml.attr === 421)
  })
  it ('Inheritance 3', function () {
    var base = {
      xml: {
        attr: 421
      }
    }
    var model = {
      xml: {
        types: 123
      }
    }
    eYo.c9r.model.extends(model, base)
    chai.assert(model.xml.attr === 421)
    chai.assert(model.xml.types === 123)
  })
  it ('Inheritance 4', function () {
    var base = {
      data: {
        aa: 421
      }
    }
    var model = {
      data: {
        aa: {
          xml: 421
        },
        ab: 123
      },
      properties: 421,
    }
    var submodel = {
      data: {
        ab: 421
      }
    }
    eYo.c9r.model.extends(model, base)
    eYo.c9r.model.extends(submodel, model)
    chai.assert(submodel.data.aa.xml === 421)
    chai.assert(submodel.data.ab === 421)
    chai.assert(submodel.properties === 421)
  })
})
describe ('Dlgt', function () {
  this.timeout(10000)
  describe ('make', function () {
    it ('Make: Missing', function () {
      chai.assert(eYo.c9r.Dlgt)
      chai.assert(eYo.c9r.makeC9r)
    })
    it ('Make: constructor call', function () {
      var ns = eYo.c9r.makeNS()
      var flag = 0
      eYo.c9r.makeC9r(ns, 'A', null, {
        init (x) {
          flag += x
        }
      })
      chai.assert(!ns.A_s)
      var a = new ns.A(1)
      chai.assert(flag === 1)
      a = new ns.A(2)
      chai.assert(flag === 3)
    })
    it ('Make: super !== null', function () {
      var ns = eYo.c9r.makeNS()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', {
        init (x) {
          flag_A += x
        },
      })
      chai.assert(ns.A.eyo instanceof eYo.c9r.Dflt.eyo.constructor)
      new ns.A(1)
      chai.assert(flag_A === 1)
      var flag_AB = flag_A = 0
      ns.makeC9r('AB', ns.A, {
        init (x) {
          flag_AB += x
        },
      })
      chai.assert(ns.AB.eyo instanceof eYo.c9r.Dflt.eyo.constructor)
      new ns.AB(1)
      chai.assert(flag_A === 1)
      chai.assert(flag_AB === 1)
    })  
    it ('Make: multi super !== null', function () {
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
      chai.assert(flag_A === 3)
      chai.assert(flag_AA === 300)
      flag_A = flag_B = flag_AA = flag_AB = flag_BA = flag_BB = 0
      var ab = new ns.AB(4)
      chai.assert(flag_A === 4)
      chai.assert(flag_AB === 4000)
      flag_A = flag_B = flag_AA = flag_AB = flag_BA = flag_BB = 0
      var ba = new ns.BA(5)
      chai.assert(flag_B === 50)
      chai.assert(flag_BA === 50000)
      flag_A = flag_B = flag_AB = flag_BA = flag_BB = 0
      var bb = new ns.BB(6)
      chai.assert(flag_B === 60)
      chai.assert(flag_BB === 600000)
    })
    it ('Make: undefined owner xor super', function () {
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
      chai.assert(ns.B_s.constructor === ns.A)
      var ab = new ns.B(1)
      chai.assert(flag_A === 1)
      chai.assert(flag_B === 10)
    })
    it ('Make: init shortcuts 1', function () {
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
      chai.assert(flag === 421)
      make(function (builtin) {
        flag = 123
        builtin ()
        flag += 421
      })
      chai.assert(flag === 544)
    })
    it ('Make: init shortcuts 2', function () {
      var ns = eYo.c9r.makeNS()
      var flag = 0
      eYo.c9r.makeC9r(ns, 'A', null, {
        init () {
          flag += 123
        }
      })
      new ns.A()
      chai.assert(flag === 123)
      ns.A.makeInheritedC9r('AB', {
        init (builtin) {
          flag *= 1000
          builtin ()
          flag += 421
        }
      })
      new ns.AB()
      chai.assert(flag === 123544)
    })
    it ('Make: dispose', function () {
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
      chai.assert(flag === 1)
      flag = 0
      new ns.AB().dispose(1)
      chai.assert(flag === 11)
    })
  })
  describe ('makeC9r', function () {
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
      ns.makeDflt()
      eYo.c9r.makeC9r(ns, 'A')
      testX(ns.A, eYo.c9r.Dflt, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r('...', {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, eYo.c9r.Dflt, eYo.c9r.Dlgt_p)
      chai.assert(flag_A === 1)
    })
    it (`eYo.c9r.makeC9r(NS, '...')`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      eYo.c9r.makeC9r(ns, 'A')
      testX(ns.A, eYo.c9r.Dflt, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r(ns, '...', {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, eYo.c9r.Dflt, eYo.c9r.Dlgt_p)
      chai.assert(flag_A===1)
    })
    it (`eYo.c9r.makeC9r('...', Super = eYo.c9r.Dflt)`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      eYo.c9r.makeC9r(ns, 'A', ns.Dflt)
      testX(ns.A, ns.Dflt, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r('...', Super = eYo.c9r.Dflt, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      var flag_A = 0
      ns.makeC9r('A', {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, ns.Dflt, ns.Dlgt_p)
      chai.assert(flag_A===1)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.Dflt, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', eYo.c9r.Dflt, {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, eYo.c9r.Dflt, eYo.c9r.Dlgt_p)
      chai.assert(flag_A===1)
    })
    it (`eYo.c9r.makeC9r('...', eYo.c9r.Dflt, {...}?)`, function () {
      var Super = eYo.c9r.Dflt
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      eYo.c9r.makeC9r(ns, 'A', Super)
      chai.assert(ns.A.eyo.super === Super.eyo)
      testX(ns.A, eYo.c9r.Dflt, eYo.c9r.Dlgt_p)
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      chai.assert(ns.Dflt.eyo_p === ns.Dlgt_p)
      testX(ns.Dflt, eYo.c9r.Dflt, ns.Dlgt_p)
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', ns.Dflt, {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, ns.Dflt, eYo.c9r.Dlgt_p)
      chai.assert(flag_A===1)
    })
    it (`eYo.c9r.makeC9r('...', Super = eYo.c9r.Dflt, {...})`, function () {
      var flag_A = 0
      var A = eYo.c9r.makeC9r('___A', eYo.c9r.Dflt, {
        init () {
          flag_A += 1
        }
      })
      chai.assert(A)
      chai.assert(A.eyo)
      chai.assert(A.eyo.super === eYo.c9r.Dflt.eyo)
      chai.assert(A.SuperC9r_p === eYo.c9r.Dflt_p)
      chai.assert(A.SuperC9r_p.constructor === eYo.c9r.Dflt)
      chai.expect(() => {
        new A()
      }).not.to.throw()
      chai.assert(flag_A===1)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.Dflt)`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      eYo.c9r.makeC9r(ns, 'A', eYo.c9r.Dflt)
      testX(ns.A, eYo.c9r.Dflt, eYo.c9r.Dlgt_p)
    })
    it (`eYo.c9r.makeC9r(NS, '...', Super = eYo.c9r.Dflt, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
      var flag_A = 0
      eYo.c9r.makeC9r(ns, 'A', eYo.c9r.Dflt, {
        init () {
          flag_A += 1
        }
      })
      testX(ns.A, eYo.c9r.Dflt)
      chai.assert(flag_A===1)
    })
    it (`?eYo.c9r.makeC9r(NS, '...', Super, Dlgt, {...})`, function () {
      var ns = eYo.c9r.makeNS()
      ns.makeDflt()
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
      chai.assert(ns.AB.eyo.super === ns.A.eyo)
      chai.assert(ns.A.eyo.super === eYo.c9r.Dflt.eyo)
      new ns.AB()
      chai.assert(flag_A === 1)
      chai.assert(flag_AB === 1)
    })
  })
  it ('Constructor: makeInheritedC9r', function () {
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
    chai.assert(ns.AB.SuperC9r_p === ns.A.prototype)
    flag = 0
    new ns.AB()
    chai.assert(flag === 11)
  })
  it ('Constructor: eyo setter', function () {
    var ns = eYo.c9r.makeNS()
    eYo.c9r.makeC9r(ns, 'A', null, {})
    chai.assert(ns.A.eyo.constructor === eYo.c9r.Dlgt)
    chai.expect(() => {
      ns.A.eyo = null
    }).to.throw()
    chai.expect(() => {
      ns.A.eyo_ = null
    }).to.throw()
  })
  it ('Constructor: dlgt key', function () {
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
    chai.assert(flag === 200)
  })
})
