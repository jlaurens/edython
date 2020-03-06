describe ('Tests: register', function () {
  it ('Register: basic', function () {
    chai.assert(eYo.register)
  })
  it ('Register: object', function () {
    let o = {}
    eYo.register.add(o, 'foo')
    chai.assert(o.fooRegister)
    chai.assert(o.fooUnregister)
    chai.assert(o.fooForEach)
    chai.assert(o.fooSome)
    o.fooRegister(123)
    var flag = 0
    o.fooForEach(foo => flag += foo)
    chai.expect(flag).equal(123)
    o.fooRegister(123)
    flag = 0
    o.fooForEach(foo => flag += foo)
    chai.expect(flag).equal(123)
    o.fooRegister(421)
    flag = 0
    o.fooForEach(foo => flag += foo)
    chai.expect(flag).equal(544)
    chai.assert(o.fooSome(foo => {
      if (foo === 421) {
        return (flag = foo)
      }
    }))
    chai.expect(flag).equal(421)
    chai.assert(o.fooUnregister(123))
    chai.assert(!o.fooUnregister(123))
    flag = 0
    o.fooForEach(foo => flag += foo)
    chai.expect(flag).equal(421)
  })
  it ('Register: C9r(1)', function () {
    let ns = eYo.c9r.makeNS()
    ns.makeBase()
    chai.expect(() => eYo.register.add(ns.Base, 'foo')).throw()
  })
  it ('Register: C9r(2)', function () {
    let ns = eYo.o3d.makeNS()
    ns.makeBase()
    eYo.register.add(ns.Base, 'foo')
    let onr = {}
    let o = new ns.Base(onr)
    chai.assert(o.fooRegister)
    chai.assert(o.fooUnregister)
    chai.assert(o.fooForEach)
    chai.assert(o.fooSome)
    o.fooRegister(123)
    var flag = 0
    o.fooForEach(foo => flag += foo)
    chai.expect(flag).equal(123)
    o.fooRegister(123)
    flag = 0
    o.fooForEach(foo => flag += foo)
    chai.expect(flag).equal(123)
    o.fooRegister(421)
    flag = 0
    o.fooForEach(foo => flag += foo)
    chai.expect(flag).equal(544)
    chai.assert(o.fooSome(foo => {
      if (foo === 421) {
        return (flag = foo)
      }
    }))
    chai.expect(flag).equal(421)
    chai.assert(o.fooUnregister(123))
    chai.assert(!o.fooUnregister(123))
    flag = 0
    o.fooForEach(foo => flag += foo)
    chai.expect(flag).equal(421)
  })
})
