describe('eYo Tests', function () {
  this.timeout(10000)
  describe('eYo: POC', function () {
    it(`Catch the key? No need to...`, function () {
      var f = (object, k) => {
        var k_ = k + '_'
        Object.defineProperty(object, k_, {
          get () {
            return object[k]
          }
        })
      }
      var a = {
        a: 421,
        b: 123,
      }
      f(a, 'a')
      chai.assert(a.a_ = 421)
      f(a, 'b')
      chai.assert(a.a_ = 421)
      chai.assert(a.b_ = 123)
    })
  })
  it('eYo: Basics', function () {
    chai.assert(eYo)
    chai.assert(eYo._p)
  })
  it('eYo: NA', function () {
    var x
    chai.expect(eYo.NA).equal(x)
    chai.assert(eYo.isNA(x))
    chai.expect(() => {
      eYo.NA = 1
    }).to.throw()
  })
  it ('eYo.mixinR', function () {
    let o = {}
    eYo.mixinR(o, {
      foo: 421
    })
    chai.expect(o.foo).equal(421)
    chai.expect(() => {
      o.foo = 421
    }).to.throw()
    chai.expect(() => {
      eYo.mixinR(o, {
        foo: 123
      })
    }).to.throw()
    eYo.mixinR(o, {
      bar: 123
    })
    chai.expect(o.foo).equal(421)
    chai.expect(o.bar).equal(123)
    let a = {}
    let b = {}
    chai.expect(() => eYo.mixinR(eYo.NS, eYo.NA)).to.throw()
    chai.expect(() => eYo.mixinR(a, eYo.NA)).to.throw()
    eYo.mixinR(a, b)
    chai.expect(a).to.deep.equal(b)
    b.foo = 421
    chai.expect(() => eYo.mixinR(eYo.NS, b)).to.throw()
    chai.expect(a).not.to.deep.equal(b)
    eYo.mixinR(a, b)
    chai.expect(a.foo).equal(b.foo).equal(421)
    chai.expect(() => eYo.mixinR(a, b)).to.throw()
  })
  it ('eYo: provideR', function () {
    let a = {}
    let b = {}
    chai.expect(() => eYo.provideR(eYo.NS, eYo.NA)).to.throw()
    chai.expect(() => eYo.provideR(a, eYo.NA)).to.throw()
    eYo.provideR(a, b)
    chai.expect(a).to.deep.equal(b)
    b.foo = 421
    chai.expect(() => eYo.provideR(eYo.NS, b)).to.throw()
    chai.expect(a).not.to.deep.equal(b)
    eYo.provideR(a, b)
    chai.expect(a.foo).equal(b.foo).equal(421)
    b.foo = 123
    chai.expect(() => eYo.provideR(a, b)).not.to.throw()
    chai.expect(a.foo).not.equal(b.foo)
  })
  it('eYo: hasOwnProperty', function () {
    chai.assert(eYo.hasOwnProperty({eyo: true}, 'eyo'))
    chai.assert(!eYo.hasOwnProperty({}, 'eyo'))
    chai.assert(!eYo.hasOwnProperty({}, ''))
    chai.assert(!eYo.hasOwnProperty(eYo.NA, 'eyo'))
  })
  it ('eYo.makeNS', function () {
    chai.assert(eYo.isNS)
    chai.assert(eYo.isNS(eYo))
    chai.assert(eYo.makeNS)
    var ns = eYo.makeNS()
    chai.assert(ns)
    chai.assert(ns !== eYo)
    ns = eYo.makeNS('foo')
    chai.assert(ns)
    chai.expect(ns).equal(eYo.foo)
    chai.assert(eYo.isNS(ns))
    chai.assert(eYo.foo)
    eYo.foo.makeNS('bar')
    chai.assert(eYo.foo.bar)
    eYo.makeNS(eYo.NULL_NS, 'bar')
    chai.assert(ns)
    chai.assert(!eYo.bar)
    eYo.provide('foo.bar')
    chai.assert(eYo.foo)
    chai.assert(eYo.foo.bar)
    ns.makeNS('chi')
    chai.assert(ns.chi)
    chai.assert(eYo.foo.chi)
    ns = eYo.makeNS(eYo.NULL_NS, 'fu', {
      shi: 421
    })
    chai.expect(ns.shi).equal(421)
  })
  it ('F', function () {
    chai.assert(eYo.isF)
    chai.assert(eYo.isF(eYo.doNothing))
    chai.assert(eYo.isF(() => {}))
    let f = function () {return 421}
    chai.assert(eYo.isF(f))
    chai.assert(!eYo.isF())
    chai.assert(!eYo.isF({}))
    chai.expect(eYo.asF(eYo.doNothing)).equal(eYo.doNothing)
    chai.expect(eYo.asF(f)).equal(f)
    chai.assert(eYo.isNA(eYo.asF()))
    chai.assert(eYo.isNA(eYo.asF(421)))
    chai.expect(eYo.toF(eYo.doNothing)).equal(eYo.doNothing)
    chai.expect(eYo.toF(f)).equal(f)
    chai.assert(eYo.isF(eYo.toF()))
    chai.assert(eYo.isF(eYo.toF(421)))
    chai.expect(eYo.toF(421)()).equal(421)
    chai.assert(eYo.isNA(eYo.called()))
    chai.expect(eYo.called(421)).equal(421)
    chai.expect(eYo.called(f)).equal(421)
    chai.assert(eYo.called(() => {
      return 421
    }) === 421)
    let C9r = function () {}
    chai.assert(!eYo.isC9r(C9r))
    C9r.eyo__ = true
    chai.assert(eYo.isC9r(C9r))
    chai.assert(!eYo.isC9r())
    chai.assert(!eYo.isC9r(''))
  })
  it ('Inherits', function () {
    chai.assert(eYo.isSubclass)
    chai.assert(!eYo.isSubclass())
    chai.assert(!eYo.isSubclass(123))
    chai.assert(!eYo.isSubclass(123, 421))
    let SuperC9r = function () {}
    chai.assert(eYo.isSubclass(SuperC9r, SuperC9r))
    let ChildC9r = function () {}
    chai.assert(eYo.inherits)
    eYo.inherits(ChildC9r, SuperC9r)
    chai.assert(eYo.isSubclass(ChildC9r, SuperC9r))
  })
  it ('Str, D, O, RA', function () {
    chai.assert(eYo.isStr)
    chai.assert(eYo.isStr(''))
    chai.assert(!eYo.isStr())
    chai.assert(!eYo.isStr({}))
    chai.assert(eYo.isD)
    chai.assert(eYo.isD({}))
    chai.assert(!eYo.isD())
    chai.assert(!eYo.isD(''))
    chai.assert(eYo.isRA)
    chai.assert(eYo.isRA([]))
    chai.assert(!eYo.isRA())
    chai.assert(!eYo.isRA(''))

  })
  it ('Def', function () {
    chai.assert(eYo.isDef({}))
    chai.assert(!eYo.isDef())
    chai.assert(!eYo.isDef(null))
    chai.assert(eYo.asDef({}))
    chai.assert(!eYo.asDef())
    chai.assert(eYo.asDef(eYo.NA, {}))
    chai.assert(eYo.asDef(null, {}))
  })
  it ('VALID', function () {
    chai.assert(eYo.INVALID)
    chai.assert(eYo.isVALID)
    chai.assert(!eYo.isVALID(eYo.INVALID))
    chai.assert(eYo.isVALID())
    chai.assert(eYo.isVALID({}))
    var flag = 0
    eYo.whenVALID({}, () => {
      flag = 421
    })
    chai.expect(flag).equal(421)
    eYo.whenVALID(eYo.INVALID, () => {
      flag = 0
    })
    chai.expect(flag).equal(421)
  })
  it ('eYo.copyRA', function () {
    let original = []
    var copy = eYo.copyRA(original)
    chai.expect(copy).to.deep.equal(original)
    original.push(1)
    chai.expect(copy).not.to.deep.equal(original)
    copy = eYo.copyRA(original)
    chai.expect(copy).to.deep.equal(original)
    copy.push(2)
    chai.expect(copy).not.to.deep.equal(original)
    original.push(2)
    chai.expect(copy).to.deep.equal(original)
  })
})